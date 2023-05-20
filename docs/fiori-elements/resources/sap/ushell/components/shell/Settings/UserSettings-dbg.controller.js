// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Core",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/components/shell/Settings/ErrorMessageHelper",
    "sap/ui/core/message/Message",
    "sap/ui/base/Object",
    "sap/ui/core/library",
    "sap/base/util/deepClone"
], function (
    Log,
    Core,
    Controller,
    Fragment,
    JSONModel,
    Device,
    Config,
    EventHub,
    resources,
    windowUtils,
    ErrorMessageHelper,
    Message,
    BaseObject,
    coreLibrary,
    deepClone
) {
    "use strict";

    /* global Map */

    // shortcut for sap.ui.core.MessageType
    var MessageType = coreLibrary.MessageType;

    return Controller.extend("sap.ushell.components.shell.Settings.UserSettings", {
        /**
         * Initializes the user settings dialog.
         *
         * @private
         */
        onInit: function () {
            // Contains the id of the last selected entry.
            // If it was a grouped entry, it contains all the ids of the entry inside of the group.
            this._aPreviouslySelectedItems = [];

            if (!Device.system.phone) {
                this.getView().byId("userSettingEntryList").addEventDelegate({
                    onAfterRendering: this._listAfterRendering.bind(this)
                });
            }

            // stores all promises, containing just the content of an entry
            this._mLoadedEntryContent = new Map();

            // stores all promises, containing just the wrapper of an entry
            // or a wrapper for the combination of grouped entries
            this._mLoadedWrappers = new Map();

            // Model which stores valueResult and contentResult
            // this helps avoiding infinite processing of entries due to async updates
            this.getView().setModel(new JSONModel({ entries: {} }), "results");

            Device.orientation.attachHandler(this._fnOrientationChange, this);

            this._oConfigDoable = Config
                .on("/core/userPreferences/entries")
                .do(this._processNewEntries.bind(this));
        },

        _fnOrientationChange: function () {
            var oSplitApp = this.getView().byId("settingsApp");
            this._updateHeaderButtonVisibility(oSplitApp.isMasterShown());
        },

        /**
         * Formatter for the description of the StandardList Item
         * @param {string} sEntryId The id of the entry
         * @param {object[]} aEntryTabs The calculated tabs for the entry
         * @param {object} oEntryResults The current results of all entries
         * @returns {string} The formatted description
         *
         * @private
         * @since 1.111
         */
        _formatDescription: function (sEntryId, aEntryTabs, oEntryResults) {
            if (aEntryTabs.length > 1) {
                return "";
            }

            return oEntryResults[sEntryId].valueResult || "";
        },

        /**
         * Initializes the results model, fetches the value results,
         * calculates the grouping and stores the selected item
         * @param {object[]} aEntries The settings entries
         *
         * @private
         * @since 1.111
         */
        _processNewEntries: function (aEntries) {
            var oView = this.getView();
            var oResultsModel = oView.getModel("results");
            aEntries.forEach(function (oEntry) {
                var oResult = oResultsModel.getProperty("/entries/" + oEntry.id);
                if (!oResult) {
                    oResultsModel.setProperty("/entries/" + oEntry.id, {
                        valueResult: null,
                        contentResult: null
                    });
                }

                this._setEntryValueResult(oEntry.id);
            }.bind(this));

            var oModel = oView.getModel();
            var oMasterEntryList = oView.byId("userSettingEntryList");
            var oSelectedItem = oMasterEntryList.getSelectedItem();

            if (!Device.system.phone && !oSelectedItem) {
                oSelectedItem = oMasterEntryList.getItems()[0];
            }

            if (oSelectedItem) {
                var sPath = oSelectedItem.getBindingContextPath();
                var oEntry = oModel.getProperty(sPath);
                this._aPreviouslySelectedItems = oEntry.tabs.map(function (oTabEntry) {
                    return oTabEntry.id;
                });
            }

            oModel.setProperty("/entries", this._calculateEntryGroups(aEntries));
            oView.byId("userSettingEntryList").invalidate();
        },

        /**
         * Restructures the entries and groups them in to entry groups,
         * if the same groupingId property exists on several entries.
         *
         * @param {object[]} aEntries The entries from the ushell configuration.
         * @returns {object[]} The given entries grouped together by groupingId.
         * @private
         */
        _calculateEntryGroups: function (aEntries) {
            var aNewEntries = [];
            var mGroups = new Map();
            var oResultsModel = this.getView().getModel("results");

            aEntries.forEach(function (oEntry) {
                // Ignore invisible entries
                if (oEntry.visible === false) {
                    // Cleanup in case entry was rendered before
                    var sDetailPageId = oResultsModel.getProperty("/entries/" + oEntry.id + "/contentResult");
                    if (sDetailPageId) {
                        this.getView().byId("settingsApp").removeDetailPage(sDetailPageId);
                        oResultsModel.setProperty("/entries/" + oEntry.id + "/contentResult", null);
                    }

                    // prevent save / cancel being called on an invisible entry
                    var oUserSettingsEntriesToSave = EventHub.last("UserSettingsOpened") || {};
                    delete oUserSettingsEntriesToSave[oEntry.id];
                    EventHub.emit("UserSettingsOpened", oUserSettingsEntriesToSave);

                    return;
                }

                if (oEntry.groupingEnablement) {
                    // always reset contentResult because the grouping might have changed
                    oResultsModel.setProperty("/entries/" + oEntry.id + "/contentResult", null);

                    var iGroupIndex = mGroups.get(oEntry.groupingId);
                    if (iGroupIndex || iGroupIndex === 0) {
                        aNewEntries[iGroupIndex].tabs.push(oEntry);
                        return;
                    }
                    mGroups.set(oEntry.groupingId, aNewEntries.length);
                }
                oEntry.tabs = [oEntry];
                aNewEntries.push(oEntry);
            }.bind(this));

            return aNewEntries;
        },

        /**
         * Handle focus after closing the dialog.
         * If the dialog was opened
         *  - from UserActionsMenu, should set focus to me area button, because me area popover is closed
         *  - from header button, the focus will automatically be set on the header button
         *
         * @private
         */
        _afterClose: function () {
            if (window.document.activeElement && window.document.activeElement.tagName === "BODY") {
                window.document.getElementById("userActionsMenuHeaderButton").focus();
            }
        },

        /**
         * Handles after rendering code of the list.
         *
         * @private
         */
        _listAfterRendering: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oMasterEntryList = oView.byId("userSettingEntryList");

            var aItems = oMasterEntryList.getItems();

            // Update descriptions eg: when theme updates
            aItems.forEach(function (oItem) {
                var sEntryId = oModel.getProperty(oItem.getBindingContextPath() + "/id");
                this._setEntryValueResult(sEntryId);
            }.bind(this));

            // If an entry was selected before the list was rerendered,
            // this code will try to find either the main entry or any of its tabs,
            // so that the user stays on the same entry, even if a tab was removed.
            if (this._aPreviouslySelectedItems) {
                for (var i = 0; i < this._aPreviouslySelectedItems.length; i++) {
                    for (var j = 0; j < aItems.length; j++) {
                        var oItem = aItems[j];
                        if (oModel.getProperty(oItem.getBindingContextPath() + "/id") === this._aPreviouslySelectedItems[i]) {
                            oMasterEntryList.setSelectedItem(oItem);
                            this._toDetail(oItem);
                            oItem.focus();
                            return;
                        }
                    }
                }
            }

            var oFirstItem = aItems[0];
            if (oFirstItem) {
                oMasterEntryList.setSelectedItem(oFirstItem);
                this._toDetail(oFirstItem);
                // keep focus on the first item when reopen the dialog
                oFirstItem.focus();
            }
        },

        /**
         * Tries to load the information for the list item of an entry async.
         *
         * @param {string} sEntryId the id on an entry
         * @returns {Promise<void>} Resolves the entry value was fetched and set
         *
         * @private
         */
        _setEntryValueResult: function (sEntryId) {
            var oEntryResults;
            var oResultsModel = this.getView().getModel("results");
            var aEntries = Config.last("/core/userPreferences/entries");
            var iEntryIndex = aEntries.findIndex(function (oEntry) {
                return oEntry.id === sEntryId;
            });

            if (iEntryIndex === -1) {
                return Promise.resolve();
            }

            return Promise.resolve()
                .then(function () {
                    var sEntryTitle = aEntries[iEntryIndex].title;
                    var vValueArgument = aEntries[iEntryIndex].valueArgument;

                    if (typeof vValueArgument !== "function") {
                        var sOldValueResult = oResultsModel.getProperty("/entries/" + sEntryId + "/valueResult");
                        if (sOldValueResult !== null && sOldValueResult !== undefined) {
                            return sOldValueResult;
                        }
                        return vValueArgument;
                    }

                    // Display "Loading..."
                    oEntryResults = deepClone(oResultsModel.getProperty("/entries"));
                    oEntryResults[sEntryId].valueResult = resources.i18n.getText("genericLoading");
                    oResultsModel.setProperty("/entries", oEntryResults);

                    return Promise.resolve()
                        .then(vValueArgument)
                        .then(function (valueResult) {
                            if (typeof (valueResult) !== "object") {
                                return valueResult;
                            }

                            // update visibility
                            if (valueResult && valueResult.value !== undefined) {
                                aEntries = Config.last("/core/userPreferences/entries");
                                iEntryIndex = aEntries.findIndex(function (oEntry) {
                                    return oEntry.id === sEntryId;
                                });
                                if (iEntryIndex > -1) {
                                    aEntries[iEntryIndex].visible = !!valueResult.value;
                                    Config.emit("/core/userPreferences/entries", aEntries);
                                }
                            }

                            return valueResult.displayText;
                        })
                        .catch(function (error) {
                            Log.error("Can not load value for " + sEntryTitle + " entry", error);
                            return resources.i18n.getText("loadingErrorMessage");
                        });
                })
                .then(function (sDisplayText) {
                    // update entry description
                    oEntryResults = deepClone(oResultsModel.getProperty("/entries"));
                    oEntryResults[sEntryId].valueResult = sDisplayText || "";
                    oResultsModel.setProperty("/entries", oEntryResults);
                });
        },

        /**
         * Handles the Back button press
         *
         * @private
         */
        _navBackButtonPressHandler: function () {
            var oSplitApp = this.getView().byId("settingsApp");

            oSplitApp.backDetail();
            this._updateHeaderButtonVisibility(true);
        },

        /**
         * Handles the toggle button press in the header
         *
         * @private
         */
        _navToggleButtonPressHandler: function () {
            var oSplitApp = this.getView().byId("settingsApp"),
                bIsMasterShown = oSplitApp.isMasterShown();

            if (bIsMasterShown) {
                oSplitApp.hideMaster();
            } else {
                oSplitApp.showMaster();
            }
            this._updateHeaderButtonVisibility(!bIsMasterShown);
        },

        /**
         * Update header button
         *
         * @param {boolean} bIsMasterShown If master page is shown
         *
         * @private
         */
        _updateHeaderButtonVisibility: function (bIsMasterShown) {
            if (Device.system.phone) {
                var oBackButton = this.getView().byId("userSettingsNavBackButton");
                oBackButton.setVisible(!bIsMasterShown);
            } else {
                var oMenuButton = this.getView().byId("userSettingsMenuButton");
                if (Device.orientation.portrait) {
                    oMenuButton.setVisible(true);
                    oMenuButton.setPressed(bIsMasterShown);
                    oMenuButton.setTooltip(resources.i18n.getText(bIsMasterShown ? "ToggleButtonHide" : "ToggleButtonShow"));
                } else {
                    oMenuButton.setVisible(false);
                }
            }
        },

        /**
         * Handles the entry item press
         *
         * @param {object} oEvent the event that was fired
         * @private
         */
        _itemPress: function (oEvent) {
            this._toDetail(oEvent.getSource().getSelectedItem());
        },

        /**
         * Navigates to the detail page that belongs to the given selected item.
         *
         * @param {sap.m.StandardListItem} oSelectedItem the StandardListItem that should be handled.
         * @returns {Promise<void>} A promise which resolves when the navigation was done.
         * @private
         */
        _toDetail: function (oSelectedItem) {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oResultsModel = oView.getModel("results");

            var sEntryPath = oSelectedItem.getBindingContextPath();
            var oEntry = oModel.getProperty(sEntryPath);
            var sEntryId = oEntry.id;
            var sDetailPageId = oResultsModel.getProperty("/entries/" + sEntryId + "/contentResult");

            if (oEntry.tabs) {
                this._aPreviouslySelectedItems = oEntry.tabs.map(function (oTabEntry) {
                    return oTabEntry.id;
                });
            } else {
                this._aPreviouslySelectedItems = [sEntryId];
            }

            // Clear selection from list.
            if (Device.system.phone) {
                oSelectedItem.setSelected(false);
            }

            if (sDetailPageId) {
                this._navToDetail(sDetailPageId, oView);
                var sWrapperId = oEntry.tabs.map(function (oTabEntry) {
                    return oTabEntry.id;
                }).join("-");
                var oWrapperPromise = this._mLoadedWrappers.get(sWrapperId);
                if (oWrapperPromise) {
                    oWrapperPromise.then(function (oWrapper) {
                        var oIconTabBar = oWrapper.getContent()[1];
                        var sSelectedKey = oIconTabBar.getSelectedKey();
                        var aItems = oIconTabBar.getItems();
                        var iTabIndex = aItems.findIndex(function (oItem) {
                            return oItem.getId() === sSelectedKey;
                        });

                        if (iTabIndex === -1) {
                            // if no tab was previously selected, register the first one.
                            // if the entry does not have multiple tabs, the first and only tab is registered.
                            iTabIndex = 0;
                        }

                        this._emitEntryOpened(oEntry.tabs[iTabIndex].id);
                    }.bind(this));
                    return Promise.resolve();
                }
            }

            return Promise.all([
                this._createContentWrapper(oEntry),
                this._createEntryContent(oEntry)
            ]).then(function (aResults) {
                var aEntries = Config.last("/core/userPreferences/entries");
                var bEntryAvailable = aEntries.some(function (oEntry) {
                    return oEntry.id === sEntryId && oEntry.visible !== false;
                });
                if (!bEntryAvailable) {
                    // don't add entries which are not visible anymore
                    return;
                }

                var oWrapper = aResults[0];
                var oEntryContent = aResults[1];

                this.getView().byId("settingsApp").addDetailPage(oWrapper);

                if (oEntry.tabs.length > 1) {
                    oWrapper.getContent()[1].getItems()[0].addContent(oEntryContent);
                } else {
                    oWrapper.addContent(oEntryContent);
                }

                var sNewDetailPageId = oWrapper.getId();
                oResultsModel.setProperty("/entries/" + sEntryId + "/contentResult", sNewDetailPageId);

                this._navToDetail(sNewDetailPageId, oView);
                this._emitEntryOpened(sEntryId);

                return oWrapper.getId();
            }.bind(this));
        },

        /**
         * Returns a promise, containing the content of the given entry.
         * If an error occurs, an error content for this entry will be created.
         *
         * @param {object} oEntry The entry, the content should be loaded from.
         * @returns {Promise<sap.ui.core.Control>} a Promise, that resolves with the created entry content.
         * @private
         */
        _createEntryContent: function (oEntry) {
            if (!this._mLoadedEntryContent.get(oEntry.id)) {
                if (typeof oEntry.contentFunc === "function") {
                    this._mLoadedEntryContent.set(oEntry.id, new Promise(function (resolve) {
                        oEntry.contentFunc()
                            .then(function (oContentResult) {
                                if (BaseObject.isA(oContentResult, "sap.ui.core.Control")) {
                                    resolve(oContentResult);
                                } else {
                                    this._createErrorContent(resources.i18n.getText("loadingErrorMessage")).then(resolve);
                                }
                            }.bind(this))
                            .catch(function () {
                                this._createErrorContent(resources.i18n.getText("loadingErrorMessage")).then(resolve);
                            }.bind(this));
                    }.bind(this)));
                } else {
                    this._mLoadedEntryContent.set(oEntry.id, this._createErrorContent(resources.i18n.getText("userSettings.noContent")));
                }
            }

            return this._mLoadedEntryContent.get(oEntry.id);
        },

        /**
         * Returns a promise, containing the wrapper for the given entry.
         *
         * @param {object} oEntry The entry, the wrapper should be created for.
         * @returns {Promise<sap.ushell.components.shell.Settings.ContentWrapper>} a Promise, that resolves with the created wrapper.
         * @private
         */
        _createContentWrapper: function (oEntry) {
            var aEntryIds = oEntry.tabs.map(function (oTabEntry) {
                return oTabEntry.id;
            });
            var sWrapperId = aEntryIds.join("-");

            if (!this._mLoadedWrappers.get(sWrapperId)) {
                this._mLoadedWrappers.set(sWrapperId, Fragment.load({
                    name: "sap.ushell.components.shell.Settings.ContentWrapper",
                    controller: {
                        onTabSelected: function (oEvent) {
                            var oIconTabBar = Core.byId(oEvent.getParameter("id"));
                            var oIconTabFilter = oEvent.getParameter("item");
                            var iTabIndex = oIconTabBar.indexOfItem(oIconTabFilter);
                            var oTabEntryContext = oEntry.tabs[iTabIndex];

                            this._emitEntryOpened(oTabEntryContext.id);
                            this._createEntryContent(oTabEntryContext).then(function (oEntryContent) {
                                oIconTabFilter.addContent(oEntryContent);
                            });
                        }.bind(this)
                    }
                }).then(function (oContentWrapper) {
                    oContentWrapper.setModel(new JSONModel({
                        title: oEntry.title,
                        showHeader: !oEntry.provideEmptyWrapper,
                        tabs: oEntry.tabs
                    }), "entryInfo");
                    return oContentWrapper;
                }));
            }

            return this._mLoadedWrappers.get(sWrapperId).then(function (oWrapper) {
                var oIconTabBar = oWrapper.getContent()[1];
                var sSelectedKey = oIconTabBar.getSelectedKey();

                var iTabIndex = oIconTabBar.getItems().findIndex(function (oItem) {
                    return oItem.getId() === sSelectedKey;
                });

                if (iTabIndex > -1) {
                    var oTabEntryContext = oEntry.tabs[iTabIndex];
                    this._emitEntryOpened(oTabEntryContext.id);
                }

                return oWrapper;
            }.bind(this));
        },

        /**
         * Creates and returns an error content with a given error message.
         *
         * @param {string} sMessage The error message to be displayed.
         * @returns {Promise<sap.ui.core.Control>} the error content.
         */
        _createErrorContent: function (sMessage) {
            return Fragment.load({
                name: "sap.ushell.components.shell.Settings.ErrorContent"
            }).then(function (oErrorContent) {
                oErrorContent.setModel(new JSONModel({
                    errorMessage: sMessage
                }));
                return oErrorContent;
            });
        },

        /**
         * Navigates to the corresponding detail Page.
         *
         * @param {string} sId the id of the detail Page the AppSplit-Container should navigate to.
         * @param {string} oView The user settings view.
         * @private
         */
        _navToDetail: function (sId, oView) {
            var oSplitApp = oView.byId("settingsApp");

            oSplitApp.toDetail(sId);
            if (oSplitApp.getMode() === "ShowHideMode") {
                oSplitApp.hideMaster();
                this._updateHeaderButtonVisibility(false);
            }
        },

        /**
         * Emits an event to notify that the entry with the given entry id, needs to be saved.
         *
         * @param {string} sEntryId The id of an entry.
         * @private
         */
        _emitEntryOpened: function (sEntryId) {
            var oUserSettingsEntriesToSave = EventHub.last("UserSettingsOpened") || {};
            oUserSettingsEntriesToSave[sEntryId] = true;
            EventHub.emit("UserSettingsOpened", oUserSettingsEntriesToSave);
        },

        /**
         * Update user preferences using the UserInfo service
         *
         * @returns {Promise} A promise that resolves when
         * sendRequest method is executed centrally,
         * so the update is executed only once when preparation phase is over.
         * It bundles the requests concerning the user preferences into a batch.
         * It rejects when one update fails. That means subscribers have to check error message if they are concerned.
         * However currently it is "saved with errors" is implemented.
         * @since 1.107.0
         */
        updateUserPreferences: function () {
            Log.debug("[000] updateUserPreferences: ", "UserSettings.controller");

            if (this._updateUserPreferencesPromise) { // use one batch for several calls (theme, cozy/compact and dark mode)
                return this._updateUserPreferencesPromise;
            }

            var _resolve, _reject;

            this._updateUserPreferencesPromise = new Promise(function (resolve, reject) {
                _resolve = resolve;
                _reject = reject;
            });

            // the request is not sent immediately but when .sendRequest is called onSave
            this._updateUserPreferencesPromise.sendRequest = function () {
                sap.ushell.Container.getServiceAsync("UserInfo").then(function (oUserInfo) {
                    Log.debug("[000] updateUserPreferences: sendRequest", "UserSettings.controller");
                    oUserInfo.updateUserPreferences()
                        .done(_resolve)
                        .fail(_reject)
                        .always(function () {
                            // prepare for the next call; tests have to make sure that the previous call is always finished
                            Log.debug("[000] updateUserPreferences: sendRequest: _updateUserPreferencesPromise", "UserSettings.controller");
                            this._updateUserPreferencesPromise = null;
                        }.bind(this));
                }.bind(this));
            }.bind(this);

            return this._updateUserPreferencesPromise;
        },

        /**
         * Reloads FLP if instructions for it are found in results parameter.
         * @param {Array} aResults Array that contains the results.
         * @returns {boolean} bReloaded true if FLP was reloaded
         */
        _maybeReload: function (aResults) {
            var bRefresh = false;
            var bNoHash = false;
            var aUrlParams = [];
            var aObsoleteUrlParams = [];
            aResults.forEach(function (oResult) {
                if (oResult && oResult.refresh) {
                    bRefresh = true;
                }
                if (oResult && oResult.noHash) {
                    bNoHash = true;
                }
                if (oResult && oResult.urlParams && oResult.urlParams.length > 0) {
                    aUrlParams = aUrlParams.concat(oResult.urlParams);
                }
                if (oResult && oResult.obsoleteUrlParams && oResult.obsoleteUrlParams.length > 0) {
                    aObsoleteUrlParams = aObsoleteUrlParams.concat(oResult.obsoleteUrlParams);
                }
            });

            if (bRefresh) {
                Log.debug("[000]refresh browser with Parameters:", JSON.stringify(aUrlParams), "UserSettings.controller");
                if (bNoHash) {
                    // Remove hash, otherwise we navigate to "content" we do not want.
                    window.location = window.location.href.replace(window.location.hash, "");
                } else {
                    windowUtils.refreshBrowser(aUrlParams, aObsoleteUrlParams);
                }
                return true;
            }
        },

        /**
         * Saves and closes the User Settings Dialog.
         * May show an error message.
         * May show a success toast.
         * May reload.
         * @returns {Promise} Resolves with undefined once the function is completed except from the case that it reloads.
         * @private
         */
        _handleSaveButtonPress: function () {
            ErrorMessageHelper.removeErrorMessages();

            var oDialog = this.getView().byId("userSettingsDialog");
            var aEntries = Config.last("/core/userPreferences/entries");
            var oOpenedEntries = EventHub.last("UserSettingsOpened") || {};

            if (Object.keys(oOpenedEntries).length === 0) {
                this._handleSettingsDialogClose();
                this._showSuccessMessageToast();
                return Promise.resolve();
            }
            oDialog.setBusy(true);

            var aSavePromises = aEntries.reduce(function (aResult, oEntry) {
                if (oOpenedEntries[oEntry.id]) {
                    // onSave can be native Promise or jQuery promise.
                    Log.debug("[000] _handleSaveButtonPress: oEntry.id: ", oEntry.id, "UserSettings.controller");
                    aResult.push(this._executeEntrySave(oEntry));
                }
                return aResult;
            }.bind(this), []);
            Log.debug("[000] _handleSaveButtonPress:_updateUserPreferencesPromise", this._updateUserPreferencesPromise, "UserSettings.controller");
            if (this._updateUserPreferencesPromise) {
                this._updateUserPreferencesPromise.sendRequest(); // Send the combined batch request.
            }
            return Promise.all(aSavePromises).then(function (aResults) {
                Log.debug("[000] _handleSaveButtonPress: then save aResults", JSON.stringify(aResults), "UserSettings.controller");
                var aFailedExecutions = ErrorMessageHelper.filterMessagesToDisplay();
                var oFirstError = {};
                var sFirstErrorMessageDescription = "";
                var sErrMessageLog = "";

                oDialog.setBusy(false);
                this._handleSettingsDialogClose();
                // Error case
                if (aFailedExecutions.length > 0) {
                    oFirstError = aFailedExecutions[0];
                    sFirstErrorMessageDescription = oFirstError.getDescription();
                    EventHub.emit("UserSettingsOpened", null);
                    aFailedExecutions.forEach(function (oError) {
                        sErrMessageLog += "Entry: " + oError.getAdditionalText() + " - Error message: " + oError.getDescription() + "\n";
                    });
                    Log.error("Failed to save the following entries", sErrMessageLog);
                    if (this._maybeReload(aResults)) {
                        // no message
                        return;
                    }
                    return sap.ushell.Container.getServiceAsync("Message")
                        .then(function (oMessage) {
                            oMessage.init();
                            oMessage.show(
                                oMessage.Type.ERROR,
                                resources.i18n.getText("userSettings.SavingError.SomeChanges"),
                                {
                                    details: sFirstErrorMessageDescription
                                }
                            );
                        });
                }
                this._showSuccessMessageToast();
                EventHub.emit("UserSettingsOpened", null);
                this._maybeReload(aResults);
            }.bind(this));
        },

        _executeEntrySave: function (oEntry) {
            var onSavePromise,
                oResultPromise;

            function onSuccess (params) {
                return params || {};
            }

            function onError (errorInformation) {
                Log.debug("[000] _onError: errorInformation", JSON.stringify(errorInformation), "UserSettings.controller");
                var sMessage;
                var sEntryId = oEntry.id;
                var sEntryTitle = oEntry.title;

                if (!errorInformation) {
                    sMessage = resources.i18n.getText("userSettings.SavingError.Undefined");
                } else if (typeof (errorInformation) === "string") {
                    sMessage = errorInformation;
                } else if (Array.isArray(errorInformation)) {
                    errorInformation.forEach(function (message) {
                        message.setAdditionalText(sEntryTitle);
                        message.setTechnicalDetails({ pluginId: sEntryId });
                        ErrorMessageHelper.addMessage(message);
                    });
                    return;
                } else if (BaseObject.isA(errorInformation, "sap.ui.core.message.Message")) {
                    errorInformation.setAdditionalText(sEntryTitle);
                    errorInformation.setTechnicalDetails({ pluginId: sEntryId });
                    ErrorMessageHelper.addMessage(errorInformation);
                    return;
                } else {
                    sMessage = resources.i18n.getText("userSettings.SavingError.WithMessage", errorInformation.message);
                }

                ErrorMessageHelper.addMessage(new Message({
                    type: MessageType.Error,
                    additionalText: sEntryTitle,
                    technicalDetails: {
                        pluginId: sEntryId
                    },
                    description: sMessage,
                    message: sMessage
                }));
            }

            try {
                Log.debug("[000] onSave: oEntry.id: " + oEntry.id, "UserSettings.controller");
                this._isExecuteEntrySavedInUserSettingsController = true;
                onSavePromise = oEntry.onSave(this.updateUserPreferences.bind(this));
            } catch (error) {
                return onError(error);
            }

            // jQuery promise
            if (onSavePromise) {
                if (onSavePromise.promise) {
                    Log.warning("jQuery.promise is used to save " + oEntry.title + " settings entry.\n"
                        + "The using of jQuery.promise for onSave is deprecated. Please use the native promise instead.");
                    oResultPromise = new Promise(function (resolve) {
                        onSavePromise
                            .done(function (params) {
                                resolve(onSuccess(params));
                            })
                            .fail(function (sErrorMessage) {
                                resolve(onError(sErrorMessage));
                            });
                    });
                } else {
                    oResultPromise = onSavePromise
                        .then(onSuccess)
                        .catch(onError);
                }
            } else {
                oResultPromise = Promise.resolve();
                // onSave needs to return a jQuery.promise or better a native Promise.
                Log.warning(oEntry.title + " settings might not be saved correctly, it seems like the API contract is not correctly fullfilled.\n"
                    + "Please contact the owner of the setting.");
            }

            return oResultPromise;
        },

        _showSuccessMessageToast: function () {
            sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                var sMessage = resources.i18n.getText("savedChanges");

                MessageToast.show(sMessage, {
                    offset: "0 -50"
                });
            });
        },

        /**
         * Close User Settings Dialog without saving.
         *
         * @private
         */
        _handleCancel: function () {
            var aEntries = Config.last("/core/userPreferences/entries");
            // Invoke onCancel function for opened entity
            var oInvokedEntities = EventHub.last("UserSettingsOpened") || {};
            if (oInvokedEntities) {
                aEntries.forEach(function (oEntry) {
                    if (oInvokedEntities[oEntry.id] && oEntry.onCancel) {
                        try {
                            oEntry.onCancel();
                        } catch (error) {
                            Log.error("Failed to cancel the following entries", error);
                        }
                    }
                });
            }
            EventHub.emit("UserSettingsOpened", null);
            this._handleSettingsDialogClose();
        },

        /**
         * Close User Settings Dialog.
         *
         * @private
         */
        _handleSettingsDialogClose: function () {
            //to be sure that all user changes reset
            sap.ushell.Container.getUser().resetChangedProperties();
            // Clear selection from list.
            if (Device.system.phone) {
                this.getView().byId("settingsApp").toMaster("settingsView--userSettingMaster");
            }
            this.getView().byId("userSettingsMessagePopoverBtn").setVisible(false);
            this.getView().byId("userSettingsDialog").close();
        },

        onExit: function () {
            this._oConfigDoable.off();

            Device.orientation.detachHandler(this._fnOrientationChange, this);
        }
    });
});
