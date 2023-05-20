// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/Device",
    "sap/m/library",
    "sap/m/Popover",
    "sap/ui/core/IconPool",
    "sap/ui/core/InvisibleText",
    "sap/ui/core/UIComponent",
    "sap/ushell/EventHub",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/ui/shell/ShellHeadItem"
], function (
    Log,
    Device,
    mobileLibrary,
    Popover,
    IconPool,
    InvisibleText,
    UIComponent,
    EventHub,
    ushellLibrary,
    resources,
    utils,
    ShellHeadItem
) {
    "use strict";

    // shortcut for sap.m.PlacementType
    var PlacementType = mobileLibrary.PlacementType;

    // shortcut for sap.ushell.FloatingNumberType
    var FloatingNumberType = ushellLibrary.FloatingNumberType;


    function getNotificationButton () {
        return sap.ui.getCore().byId("NotificationsCountButton");
    }

    return UIComponent.extend("sap.ushell.components.shell.Notifications.Component", {
        metadata: {
            version: "1.113.0",
            library: "sap.ushell.components.shell.Notifications",
            dependencies: {
                libs: ["sap.m"]
            }
        },

        createContent: function () {
            this._aTimeouts = [];
            this.oRenderer = sap.ushell.Container.getRenderer("fiori2");
            this.oShellModel = this.oRenderer.shellCtrl.getModel();
            sap.ushell.Container.getServiceAsync("Notifications").then(function (oNotificationsService) {

                this.oNotificationsService = oNotificationsService;

                if (this.oNotificationsService.isEnabled() === true) {
                    sap.ui.getCore().getEventBus().subscribe("sap.ushell.services.Notifications", "onNewNotifications", this._handleAlerts, this);
                    this.oShellModel.setProperty("/enableNotifications", true);
                    this.oNotificationsService.init();
                    if (this.oRenderer.getShellConfig().enableNotificationsUI === true) {
                        this.oShellModel.setProperty("/enableNotificationsUI", true);
                        this.oNotificationsService.registerDependencyNotificationsUpdateCallback(this._updateCount.bind(this), true);
                    }
                    this._createNotificationButton(this.oShellModel);
                    //ElementsModel, not shell model. Need only 3 state, for this reason call directly
                    this.oRenderer.oShellModel.addHeaderEndItem(["NotificationsCountButton"], false, ["home", "app", "minimal"], true);

                    EventHub.on("showNotifications").do(this._toggleNotifications.bind(this));
                }
            }.bind(this));
        },

        _createNotificationButton: function (oShellModel) {
            // The press handler is added in the Notification Component
            var sId = "NotificationsCountButton";
            var oNotificationToggleButton = new ShellHeadItem({
                id: sId,
                tooltip: resources.i18n.getText("notificationsBtn_title"),
                icon: IconPool.getIconURI("bell"),
                text: resources.i18n.getText("notificationsBtn_title"),
                ariaLabel: resources.i18n.getText("notificationsBtn_title"),
                ariaHaspopup: "dialog",
                enabled: true,
                selected: false,
                visible: "{/enableNotifications}",
                floatingNumber: "{/notificationsCount}",
                floatingNumberMaxValue: Device.system.phone ? 99 : 999, // according to the UX specification
                floatingNumberType: FloatingNumberType.Notifications,
                press: function () {
                    EventHub.emit("showNotifications", Date.now());
                }
            });
            oNotificationToggleButton.setModel(oShellModel);
            oNotificationToggleButton.setModel(resources.i18nModel, "i18n");
        },

        _handleAlerts: function (sChannelId, sEventId, aNewNotifications) {
            (aNewNotifications || []).forEach(this.handleNotification.bind(this));
        },

        // Alert (badge in the UXC terminology)
        handleNotification: function (oNotification) {
            //create an element of RightFloatingContainer
            var oAlertEntry = this.oRenderer.addRightFloatingContainerItem({
                press: function () {
                    if (this.oPopover) { // High prio notification may be shown in the RightFloatingContainer
                        this.oPopover.close();
                    }
                    if (window.hasher.getHash() !== oNotification.NavigationTargetObject + "-" + oNotification.NavigationTargetAction) {
                        if (oNotification.NavigationTargetObject && oNotification.NavigationTargetAction) {
                            utils.toExternalWithParameters(
                                oNotification.NavigationTargetObject,
                                oNotification.NavigationTargetAction,
                                oNotification.NavigationTargetParams
                            );
                        }
                    }
                    this.oNotificationsService.markRead(oNotification.Id);
                }.bind(this),
                close: function () {
                    this.oRenderer.removeRightFloatingContainerItem(oAlertEntry.getId(), true);
                }.bind(this),
                datetime: resources.i18n.getText("notification_arrival_time_now"),
                title: oNotification.SensitiveText ? oNotification.SensitiveText : oNotification.Text,
                description: oNotification.SubTitle,
                unread: oNotification.IsRead,
                priority: "High",
                hideShowMoreButton: true
            }, true, true);
            this.oRenderer.showRightFloatingContainer(true);
            var timeout = setTimeout(function () {
                this.oRenderer.removeRightFloatingContainerItem(oAlertEntry.getId(), true);
            }.bind(this), 5200);
            this._aTimeouts.push(timeout);
        },

        // Update the notifications count in the UI
        // The new count is also displayed when the notifications popover is already opened
        _updateCount: function () {
            this.oNotificationsService.getUnseenNotificationsCount().done(function (iNumberOfNotifications) {
                this.oShellModel.setProperty("/notificationsCount", parseInt(iNumberOfNotifications, 10));
            }.bind(this)).fail(function (data) {
                Log.error("Notifications - call to notificationsService.getCount failed: ", data);
            });
        },

        _getPopover: function () {
            if (!this._oNotificationsPopoverPromise) {
                this._oNotificationsPopoverPromise = new Promise(function (resolve, reject) {
                    sap.ui.require(["sap/ui/core/mvc/XMLView"], function (XMLView) {
                        XMLView.create({
                            id: "notificationsView",
                            viewName: "sap.ushell.components.shell.Notifications.Notifications",
                            viewData: {notificationsService: this.oNotificationsService}
                        }).then(function (oNotificationView) {
                            var oNotificationIconTabBar = oNotificationView.byId("notificationIconTabBar");
                            oNotificationIconTabBar.setAriaTexts({
                                headerLabel: resources.i18n.getText("Notifications.Popover.IconTabBar.Header.AriaLabel")
                            });

                            var oNotificationsListDate = oNotificationView.byId("sapUshellNotificationsListDate");
                            oNotificationsListDate.enhanceAccessibilityState = function (oNLD, mAriaProps) {
                                mAriaProps.hidden = true;
                                return mAriaProps;
                            };
                            var oNotificationsListPriority = oNotificationView.byId("sapUshellNotificationsListPriority");
                            oNotificationsListPriority.enhanceAccessibilityState = function (oNLP, mAriaProps) {
                                mAriaProps.hidden = true;
                                return mAriaProps;
                            };
                            var oNotificationsListType = oNotificationView.byId("sapUshellNotificationsListType");
                            oNotificationsListType.enhanceAccessibilityState = function (oNLT, mAriaProps) {
                                mAriaProps.hidden = true;
                                return mAriaProps;
                            };

                            var oPopover = new Popover("shellNotificationsPopover", {
                                showHeader: false,
                                placement: PlacementType.Bottom,
                                showArrow: true,
                                content: oNotificationView,
                                beforeClose: function (oEvent) {
                                    oEvent.getSource().getContent()[0].invalidate(); // Workaround to fix 1980098133; for some reason, still needed
                                    this._resetCount();
                                }.bind(this)
                            });
                            oPopover._oAriaLabelledByText = new InvisibleText(oPopover.getId() + "-labelledBy", {
                                text: resources.i18n.getText("NotificationToggleButton.NoNewNotifications")
                            }).toStatic();
                            oPopover.addDependent(oPopover._oAriaLabelledByText);
                            oPopover.addAriaLabelledBy(oPopover._oAriaLabelledByText);
                            oPopover.addStyleClass("sapUshellNotificationsPopup");
                            oPopover.addStyleClass("sapContrastPlus");
                            resolve(oPopover);
                        }.bind(this)).catch(reject);
                    }.bind(this));
                }.bind(this));
            }
            return this._oNotificationsPopoverPromise;
        },

        _toggleNotifications: function (bShow) {
            this._getPopover().then(function (oPopover) {
                var oSource = getNotificationButton();

                // if the button is hidden in the overflow, use the overflow button itself
                if (!oSource.$().width()) {
                    oSource = sap.ui.getCore().byId("endItemsOverflowBtn");
                }

                if (oPopover.isOpen()) {
                    oPopover.close();
                } else if (bShow !== false) { // Special case: ComponentKeysHandler may emit showNotifications:false
                    this._resetCount();
                    oPopover.openBy(oSource);
                }
            }.bind(this));
        },

        _resetCount: function () {
            this.oShellModel.setProperty("/notificationsCount", 0);
            this.oNotificationsService.notificationsSeen();
        },

        exit: function () {
            sap.ui.getCore().getEventBus().unsubscribe("sap.ushell.services.Notifications", "onNewNotifications", this._handleAlerts, this);
            if (this.oNotificationsService && this.oNotificationsService.isEnabled() === true) {
                this.oNotificationsService.destroy();
            }
            this.oNotificationsService = null;

            var oNotificationBtn = getNotificationButton();
            if (oNotificationBtn) {
                this.oRenderer.hideHeaderEndItem(oNotificationBtn, false);
                oNotificationBtn.destroy();
            }
            this.oRenderer = null;
            var oNotificationsPopover = sap.ui.getCore().byId("notificationsView");
            if (oNotificationsPopover) {
                oNotificationsPopover.destroy();
                oNotificationsPopover = null;
            }
            this._aTimeouts.forEach(window.clearTimeout); // clear pending timeouts
        }
    });
});
