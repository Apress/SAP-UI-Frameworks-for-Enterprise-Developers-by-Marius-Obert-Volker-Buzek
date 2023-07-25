// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/base/EventProvider",
    "sap/ui/Device",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources"
], function (
    EventProvider,
    Device,
    hasher,
    Config,
    EventHub,
    resources
) {
    "use strict";

    var AccessKeysHandler = EventProvider.extend("sap.ushell.renderers.fiori2.AccessKeysHandler", {
        constructor: function () {
            EventProvider.apply(this, arguments);

            EventHub.on("AppRendered").do(this.appOpenedHandler.bind(this));

            this.bFocusOnShell = true;
            this.bFocusPassedToExternalHandlerFirstTime = true;
            this.isFocusHandledByAnotherHandler = false;
            this.fnExternalKeysHandler = null;
            this.sLastExternalKeysHandlerUrl = null;
            this.fnExternalShortcuts = null;
            this.bForwardNavigation = true;
            this.aShortcutsDescriptions = [];
        }
    });

    AccessKeysHandler.prototype.init = function (oModel) {
        this.oModel = oModel;
        // prevent browser event ctrl+up/down from scrolling page
        // created by user `keydown` native event needs to be cancelled so browser will not make default action, which is scroll.
        // Instead we clone same event and dispatch it programmatic, so all handlers expecting to this event will still work

        document.addEventListener("keydown", function (oEvent) {
            // if Shift key was pressed alone, don't perform any action
            if (oEvent.keyCode === 16) {
                return;
            }

            this.bForwardNavigation = !oEvent.shiftKey;

            // make sure that UI5 events (sapskipforward/saptabnext/etc.) will run before the document.addEventListener("keydown"...
            // code in the AccessKeysHandler as it was before when we used jQuery(document).on('keydown'..
            // Regarding F6: In order to make the ui5 f6 flow work we shouldn't add any additional handler for this!
            if (oEvent.key === "Tab" || oEvent.key === "F6") {
                setTimeout(function () {
                    this._handleEventUsingExternalKeysHandler(oEvent);
                }.bind(this), 0);
            } else {
                this._handleEventUsingExternalKeysHandler(oEvent);
            }

            var sCurrentState = Config.last("/core/shell/model/currentState/stateName");
            if (sCurrentState !== "headerless" && sCurrentState !== "headerless-home") {
                var bAdvancedShellActions = (sCurrentState === "home" || sCurrentState === "app" || sCurrentState === "minimal");
                this.handleShortcuts(oEvent, bAdvancedShellActions);
            }

            if (this.fnExternalShortcuts) {
                this.fnExternalShortcuts(oEvent);
            }
        }.bind(this), true); // End of event handler

        // save the bound function so that it can be deregistered later
        this._cancelHelpEvent = this._cancelHelpEvent.bind(this);
    };

    AccessKeysHandler.prototype.appOpenedHandler = function () {
        var sCurrentApplicationIntent = hasher.getHash();

        if (sCurrentApplicationIntent !== this.sLastExternalKeysHandlerUrl) {
            this.fnExternalKeysHandler = null;
        }
        this.sLastExternalKeysHandlerUrl = sCurrentApplicationIntent;
    };

    AccessKeysHandler.prototype._focusItemInOverflowPopover = function (sItemId, iCounter) {
        var oOverflowPopup = sap.ui.getCore().byId("headEndItemsOverflow");

        if (oOverflowPopup && oOverflowPopup.isOpen()) {
            if (oOverflowPopup.getContent().length) {
                this._focusItemInPopover(sItemId, oOverflowPopup.getContent()[0].getItems());
            }
        } else if (iCounter < 10) {
            var oOverflowButton = window.document.getElementById("endItemsOverflowBtn");

            if (oOverflowButton) {
                oOverflowButton.click();
                var that = this;
                window.setTimeout(function () {
                    that._focusItemInOverflowPopover(sItemId, ++iCounter);
                }, 300);
            }
        }
    };

    AccessKeysHandler.prototype._focusItemInUserMenu = function (sItemId, iCounter) {
        var oUserMenu = sap.ui.getCore().byId("sapUshellUserActionsMenuPopover");

        if (oUserMenu && oUserMenu.isOpen()) {
            if (oUserMenu.getContent().length) {
                this._focusItemInPopover(sItemId, oUserMenu.getContent()[0].getItems());
            }
        } else if (iCounter < 10) {
            var that = this;
            EventHub.emit("showUserActionsMenu", Date.now());
            window.setTimeout(function () {
                that._focusItemInUserMenu(sItemId, ++iCounter);
            }, 300);
        }
    };

    AccessKeysHandler.prototype._focusItemInPopover = function (sId, aItems) {
        for (var i = 0; i < aItems.length; i++) {
            var aIdParts = aItems[i].getId().split("-");
            if (aIdParts[aIdParts.length - 1] === sId) {
                aItems[i].getDomRef().focus();
                return;
            }
        }
    };

    AccessKeysHandler.prototype._handleAccessOverviewKey = function (bAdvancedShellActions) {
        var bSearchAvailable = this.oModel.getProperty("/searchAvailable"),
            bPersonalization = this.oModel.getProperty("/personalization"),
            bEnableAppFinder = Config.last("/core/catalog/enabled"),
            bEnableNotifications = Config.last("/core/shell/model/enableNotifications");

        if (Device.browser.msie) {
            // the Internet Explorer would display its F1 help also on CTRL + F1 if the help event wasn't cancelled
            document.addEventListener("help", this._cancelHelpEvent);
        }

        var aShortCuts = [];
        aShortCuts = aShortCuts.concat(this.aShortcutsDescriptions);

        var sAltOptionText;
        var sSearchKeyText;

        if (Device.os.macintosh) {
            sAltOptionText = resources.i18n.getText("OptionKey");
            sSearchKeyText = resources.i18n.getText("CommandKey");
        } else {
            sAltOptionText = resources.i18n.getText("AltKey");
            sSearchKeyText = resources.i18n.getText("ControlKey");
        }

        if (window.document.getElementById("shell-header")) {
            if (bEnableAppFinder && bAdvancedShellActions) {
                aShortCuts.push({
                    text: sAltOptionText + " + A",
                    description: resources.i18n.getText("hotkeyFocusOnAppFinderButton")
                });
            }

            if (bSearchAvailable) {
                aShortCuts.push({
                    text: sAltOptionText + " + F",
                    description: resources.i18n.getText("hotkeyFocusOnSearchButton")
                });
            }

            aShortCuts.push({
                text: sAltOptionText + " + H",
                description: resources.i18n.getText("hotkeyHomePage")
            });
            aShortCuts.push({
                text: sAltOptionText + " + M",
                description: resources.i18n.getText("hotkeyFocusOnUserActionMenu")
            });

            if (bEnableNotifications) {
                aShortCuts.push({
                    text: sAltOptionText + " + N",
                    description: resources.i18n.getText("hotkeyFocusOnNotifications")
                });
            }

            if (bAdvancedShellActions) {
                aShortCuts.push({
                    text: sAltOptionText + " + S",
                    description: resources.i18n.getText("hotkeyFocusOnSettingsButton")
                });
                aShortCuts.push({
                    text: resources.i18n.getText("ControlKey") + " + " + resources.i18n.getText("CommaKey"),
                    description: resources.i18n.getText("hotkeyOpenSettings")
                });
            }

            if (bPersonalization && bEnableAppFinder) {
                aShortCuts.push({
                    text: resources.i18n.getText("ControlKey") + " + " + resources.i18n.getText("EnterKey"),
                    description: resources.i18n.getText("hotkeyExitEditing")
                });
            }

            if (bSearchAvailable) {
                aShortCuts.push({
                    text: sSearchKeyText + " + " + resources.i18n.getText("ShiftKey") + " + F",
                    description: resources.i18n.getText("hotkeyFocusOnSearchField")
                });
            }
        }

        sap.ui.require([
            "sap/m/Label",
            "sap/m/MessageBox",
            "sap/m/Text",
            "sap/m/VBox"
        ], function (Label, MessageBox, Text, VBox) {
            var oVBox = new VBox();

            aShortCuts.forEach(function (oShortCut) {
                oVBox.addItem(new Label({ text: oShortCut.description }));
                oVBox.addItem(new Text({
                    text: oShortCut.text
                }).addStyleClass("sapUiSmallMarginBottom"));
            });

            MessageBox.show(oVBox, {
                id: "hotKeysGlossary",
                title: resources.i18n.getText("hotKeysGlossary"),
                styleClass: "sapContrastPlus"
            });
        });
    };

    AccessKeysHandler.prototype._focusAppFinderButton = function () {
        if (!Config.last("/core/catalog/enabled")) {
            return;
        }

        if (this._isFocusInDialog()) {
            return;
        }

        var oAppFinderBtn = window.document.getElementById("openCatalogBtn");

        if (oAppFinderBtn) {
            oAppFinderBtn.focus();
            return;
        }

        var oConfig = sap.ushell.Container.getRenderer("fiori2").getShellConfig();
        if (oConfig.moveAppFinderActionToShellHeader) {
            this._focusItemInOverflowPopover("openCatalogBtn", 0);
            return;
        }

        this._focusItemInUserMenu("openCatalogBtn", 0);
    };

    AccessKeysHandler.prototype._focusSettingsButton = function () {
        if (this._isFocusInDialog()) {
            return;
        }

        var oSettingsBtn = window.document.getElementById("userSettingsBtn");

        if (oSettingsBtn) {
            oSettingsBtn.focus();
            return;
        }

        var oConfig = sap.ushell.Container.getRenderer("fiori2").getShellConfig();
        if (oConfig.moveUserSettingsActionToShellHeader) {
            this._focusItemInOverflowPopover("userSettingsBtn", 0);
            return;
        }

        this._focusItemInUserMenu("userSettingsBtn", 0);
    };

    AccessKeysHandler.prototype._blockBrowserDefault = function (oEvent) {
        return new Promise(function (resolve) {
            if (Device.browser.name === "ie") {
                var oShellHeader = window.document.getElementById("shell-header");
                if (oShellHeader) {
                    // Set HTML accesskey attribute. This is important, inorder to overwrite IE default accesskeys
                    oShellHeader.setAttribute("accesskey", oEvent.key);

                    window.setTimeout(function () {
                        // Remove HTML accesskey attribute again after some time.
                        oShellHeader = window.document.getElementById("shell-header");
                        if (oShellHeader) {
                            oShellHeader.removeAttribute("accesskey");
                            resolve();
                        }
                    }, 0);
                }
            } else {
                resolve();
            }
            // Prevent default, inorder to overwrite Firefox default accesskeys
            oEvent.preventDefault();
        });
    };

    AccessKeysHandler.prototype._handleAltShortcutKeys = function (oEvent, bAdvancedShellActions) {
        var oShellHeader = sap.ui.getCore().byId("shell-header"),
            oUserMenu = sap.ui.getCore().byId("sapUshellUserActionsMenuPopover"),
            oNotificationsPopup = sap.ui.getCore().byId("shellNotificationsPopover");

        // Do nothing if an input is focused: alt+ keys may me used to enter special characters
        if (this._isFocusInInput()) {
            return;
        }

        if (oShellHeader) {
            if (bAdvancedShellActions) {
                if (oEvent.keyCode === 65) { // ALT + A
                    this._blockBrowserDefault(oEvent).then(this._focusAppFinderButton.bind(this));
                } else if (oEvent.keyCode === 83) {
                    this._blockBrowserDefault(oEvent).then(this._focusSettingsButton.bind(this));
                }
            }
            if (oEvent.keyCode === 70) { // ALT + F
                this._blockBrowserDefault(oEvent).then(function () {
                    if (this._isFocusInDialog()) {
                        return;
                    }

                    var oSearchBtn = window.document.getElementById("sf"),
                        oSerchFieldBtn = window.document.getElementById("searchFieldInShell-button");
                    if (oSearchBtn) {
                        oSearchBtn.focus();
                    } else if (oSerchFieldBtn) {
                        oSerchFieldBtn.focus();
                    } else {
                        this._focusItemInOverflowPopover("sf", 0);
                    }
                }.bind(this));
            } else if (oEvent.keyCode === 72) { // ALT + H
                this._blockBrowserDefault(oEvent).then(function () {
                    if (this._isFocusInDialog()) {
                        return;
                    }

                    var oLogo = document.getElementById("shell-header-logo");
                    if (oLogo) {
                        oLogo.focus();
                        return;
                    }
                }.bind(this));
            } else if (oEvent.keyCode === 77) { // ALT + M
                this._blockBrowserDefault(oEvent).then(function () {
                    if (this._isFocusInDialog()) {
                        return;
                    }

                    if (!(oUserMenu && oUserMenu.isOpen())) {
                        EventHub.emit("showUserActionsMenu", Date.now());
                    }
                }.bind(this));
            } else if (oEvent.keyCode === 78) { // ALT + N
                this._blockBrowserDefault(oEvent).then(function () {
                    if (this._isFocusInDialog()) {
                        return;
                    }

                    if (!(oNotificationsPopup && oNotificationsPopup.isOpen())) {
                        EventHub.emit("showNotifications", Date.now());
                    }
                }.bind(this));
            }
        }
    };

    AccessKeysHandler.prototype._handleCtrlShortcutKeys = function (oEvent, bAdvancedShellActions) {
        if (oEvent.shiftKey) {
            if (oEvent.keyCode === 70) { // CTRL + SHIFT + F
                if (this._isFocusInDialog()) {
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                    return;
                }

                var oSearchBtn = sap.ui.getCore().byId("sf");
                if (oSearchBtn) {
                    oSearchBtn.firePress();
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                }
            }
        } else if (oEvent.keyCode === 188 && bAdvancedShellActions) { // CTRL + COMMA
            if (this._isFocusInDialog()) {
                return;
            }

            var oSettingsBtn = sap.ui.getCore().byId("userSettingsBtn");
            if (oSettingsBtn && !this._isFocusInSmartTable()) {
                oSettingsBtn.firePress();
                oEvent.preventDefault();
                oEvent.stopPropagation();
            }
        } else if (oEvent.keyCode === 112) { // CTRL + F1
            if (this._isFocusInDialog()) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
                return;
            }

            this._handleAccessOverviewKey(bAdvancedShellActions);
        } else if (oEvent.keyCode === 83) { // CTRL + S
            if (this._isFocusInDialog()) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
                return;
            }

            var appFinderSearchBtn = window.document.getElementById("appFinderSearch-I");
            if (appFinderSearchBtn) {
                appFinderSearchBtn.focus();
                oEvent.preventDefault();
                oEvent.stopPropagation();
            }
        } else if (oEvent.keyCode === 13) { // CTRL + Enter
            if (this._isFocusInDialog()) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
                return;
            }

            // In Spaces mode, we do not have the possibility to access controls via a global ID.
            // This is why we have to use a light contract system.
            if (Config.last("/core/spaces/enabled")) {
                this.fireEvent("editModeDone");
            } else {
                var oDoneButton = sap.ui.getCore().byId("sapUshellDashboardFooterDoneBtn");

                if (oDoneButton && oDoneButton.getDomRef()) {
                    oDoneButton.firePress();
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                }
            }
        }
    };

    /**
     * Reacts on given keyboard events
     *
     * @param {object} oEvent the event that contains all the information about the keystroke
     * @param {boolean} bAdvancedShellActions true if advanced shell actions are available
     */
    AccessKeysHandler.prototype.handleShortcuts = function (oEvent, bAdvancedShellActions) {
        if (Device.os.macintosh && oEvent.metaKey && oEvent.shiftKey && oEvent.keyCode === 70) { // CMD + SHIFT + F
            var oSearchBtn = window.document.getElementById("sf");
            if (oSearchBtn) {
                oSearchBtn.firePress();
                oEvent.preventDefault();
                oEvent.stopPropagation();
            }
            oEvent.preventDefault();
        } else if (oEvent.altKey && !oEvent.shiftKey && !oEvent.ctrlKey) {
            this._handleAltShortcutKeys(oEvent, bAdvancedShellActions);
        } else if (oEvent.ctrlKey && !oEvent.altKey) {
            this._handleCtrlShortcutKeys(oEvent, bAdvancedShellActions);
        }
    };

    AccessKeysHandler.prototype.registerAppKeysHandler = function (fnHandler) {
        this.fnExternalKeysHandler = fnHandler;
        this.sLastExternalKeysHandlerUrl = hasher.getHash();
    };

    AccessKeysHandler.prototype.resetAppKeysHandler = function () {
        this.fnExternalKeysHandler = null;
    };

    AccessKeysHandler.prototype.getAppKeysHandler = function () {
        return this.fnExternalKeysHandler;
    };

    AccessKeysHandler.prototype.registerAppShortcuts = function (fnHandler, aShortcutsDescriptions) {
        this.fnExternalShortcuts = fnHandler;
        this.aShortcutsDescriptions = aShortcutsDescriptions;
    };

    /*
     * This method is responsible to restore focus in the shell (according to the event & internal logic)
     *
     * New parameter added : sIdForFocus
     * This parameter in case supplied overrides the event/internal logic handling and enforces the focus
     * on the element with the corresponding id.
     */
    AccessKeysHandler.prototype._handleFocusBackToMe = function (oEvent, sIdForFocus) {
        this.bFocusOnShell = true;
        var oFocusable;

        if (sIdForFocus) {
            oFocusable = window.document.getElementById(sIdForFocus);
        } else {
            this.fromOutside = true;

            if (oEvent) {
                oEvent.preventDefault();
                this.bForwardNavigation = !oEvent.shiftKey || oEvent.key === "F6";
            }

            var oShellHeader = sap.ui.getCore().byId("shell-header");
            if (oShellHeader) {
                oShellHeader.setFocusOnShellHeader(!this.bForwardNavigation);
                this.fromOutside = false;
            }
        }

        if (oFocusable) {
            oFocusable.focus();
            this.fromOutside = false;
        }

        //reset flag
        this.bFocusPassedToExternalHandlerFirstTime = true;
    };

    AccessKeysHandler.prototype.setIsFocusHandledByAnotherHandler = function (bHandled) {
        this.isFocusHandledByAnotherHandler = bHandled;
    };

    /*
     * This method is responsible to restore focus in the shell (according to the event & internal logic)
     *
     * Added support to pass either an Event (e.g. KBN) to determine which area to focus on the shell
     * OR
     * String which is actually ID for a specific control to focus on
     */
    AccessKeysHandler.prototype.sendFocusBackToShell = function (oParam) {
        var oEvent,
            sIdForFocus;

        if (typeof oParam === "string") {
            sIdForFocus = oParam;
        } else if (typeof oParam === "object") {
            oEvent = oParam;
        }

        this._handleFocusBackToMe(oEvent, sIdForFocus);
    };

    AccessKeysHandler.prototype._handleEventUsingExternalKeysHandler = function (oEvent) {
        if (!this.bFocusOnShell && !this.isFocusHandledByAnotherHandler) {
            if (typeof this.fnExternalKeysHandler === "function") {
                this.fnExternalKeysHandler(oEvent, this.bFocusPassedToExternalHandlerFirstTime);
                this.bFocusPassedToExternalHandlerFirstTime = false;
            }
        }
        // reset flag
        this.setIsFocusHandledByAnotherHandler(false);
    };

    AccessKeysHandler.prototype._cancelHelpEvent = function (oEvent) {
        oEvent.preventDefault();
        // deregister immediately so that F1 still works
        document.removeEventListener("help", this._cancelHelpEvent);
    };

    AccessKeysHandler.prototype._isFocusInInput = function () {
        var sTagName = (document.activeElement || {}).tagName;
        return sTagName === "INPUT" || sTagName === "TEXTAREA";
    };

    AccessKeysHandler.prototype._isFocusInDialog = function () {
        var oElement = document.activeElement;
        for (; oElement !== document.body; oElement = oElement.parentNode) {
            if (oElement.classList.contains("sapMDialog")) {
                return true;
            }
        }
        return false;
    };

    AccessKeysHandler.prototype._isFocusInSmartTable = function () {
        var oElement = document.activeElement;
        var oClassList;

        for (; oElement !== document.body; oElement = oElement.parentNode) {
            oClassList = oElement.classList;
            if (oClassList.contains("sapUiCompSmartTable")
                || oClassList.contains("sapUiMdcTable")
                || oClassList.contains("sapMListTbl")) {
                return true;
            }
        }

        return false;
    };

    return new AccessKeysHandler();
});
