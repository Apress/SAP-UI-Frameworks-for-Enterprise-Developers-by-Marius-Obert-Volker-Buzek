// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Core",
    "sap/ui/Device",
    "sap/ushell/utils",
    "sap/ushell/resources",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/m/CustomListItem",
    "sap/ui/thirdparty/jquery",
    "sap/ui/events/KeyCodes",
    "sap/base/Log",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/library",
    "sap/ui/core/library",
    "sap/ui/core/mvc/Controller"
], function (
    Core,
    Device,
    utils,
    resources,
    Text,
    VBox,
    CustomListItem,
    jQuery,
    KeyCodes,
    Log,
    JSONModel,
    MessageToast,
    mobileLibrary,
    coreLibrary,
    Controller
) {
    "use strict";

    // shortcut for sap.ui.core.Priority
    var Priority = coreLibrary.Priority;

    // shortcut for sap.m.ListType
    var ListType = mobileLibrary.ListType;

    // shortcut for sap.m.FlexAlignItems
    var FlexAlignItems = mobileLibrary.FlexAlignItems;

    function _errorMessage (sText) {
        sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
            oMessageService.error(sText);
        });
    }

    Controller.extend("sap.ushell.components.shell.Notifications.Notifications", {
        oPagingConfiguration: {
            MAX_NOTIFICATION_ITEMS_DESKTOP: 400,
            MAX_NOTIFICATION_ITEMS_MOBILE: 100,
            MIN_NOTIFICATION_ITEMS_PER_BUFFER: 15,
            // Approximate height of notification item according to the device
            NOTIFICATION_ITEM_HEIGHT: (Device.system.phone || Device.system.tablet) ? 130 : 100,
            // Approximate height of the area above the notifications list
            TAB_BAR_HEIGHT: 100
        },

        /**
         * Initializing Notifications view/controller with ByDate/descending tab in front
         *
         * Main steps:
         *   1. The model is filled with an entry (all properties are initially empty) for each sorting type
         *   2. Gets first buffer of notification items ByDate/descending
         *   3. Sets the first data buffer to the model
         */
        onInit: function () {
            var oInitialModelStructure = {};

            if (Device.system.desktop) {
                this.iMaxNotificationItemsForDevice = this.oPagingConfiguration.MAX_NOTIFICATION_ITEMS_DESKTOP;
            } else {
                this.iMaxNotificationItemsForDevice = this.oPagingConfiguration.MAX_NOTIFICATION_ITEMS_MOBILE;
            }

            // Container.getService use is allowed here. The service is already loaded by the notification component.
            this.oNotificationsService = this.getView().getViewData().notificationsService;
            this.oSortingType = this.oNotificationsService.getOperationEnum();

            oInitialModelStructure[this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING] = this.getInitialSortingModelStructure();
            oInitialModelStructure[this.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING] = this.getInitialSortingModelStructure();
            oInitialModelStructure[this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING] = this.getInitialSortingModelStructure();
            oInitialModelStructure[this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING] = {};

            this.sCurrentSorting = this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING;
            this.oPreviousTabKey = "sapUshellNotificationIconTabByDate";

            // For byType sorting: keeps the currently expended group/Notification type
            this.sCurrentExpandedType = undefined;

            var oModel = new JSONModel(oInitialModelStructure);
            oModel.setSizeLimit(1500);
            // Initializing the model with a branch for each sorting type
            this.getView().setModel(oModel);

            this.getView().setModel(resources.i18nModel, "i18n");

            // Get the first buffer of notification items, byDate (descending)
            this.getNextBuffer();

            this._oTopNotificationData = undefined;
        },

        onAfterRendering: function () {
            this.removeTabIndexFromList(this.sCurrentSorting);

            var oTabBarHeader = this.getView().byId("notificationIconTabBar--header");
            if (oTabBarHeader) {
                // TODO: remove this workaround when BCP 1970336135 is resolved
                oTabBarHeader.getDomRef().classList.remove("sapContrastPlus"); // "sapContrastPlus" class is not removed with "removeStyleClass()" or "toggleStyleClass()"
            }

            if (this.sCurrentSorting !== this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING) {
                if (this._oTopNotificationData) {
                    this.scrollToItem(this._oTopNotificationData);
                }
            }

            this.getView().$("-sapUshellNotificationIconTabByDate-text")
                .attr("aria-label", resources.i18n.getText("Notifications.ByDateDescending.AriaLabel"));
            this.getView().$("-sapUshellNotificationIconTabByType-text")
                .attr("aria-label", resources.i18n.getText("Notifications.ByType.AriaLabel"));
            this.getView().$("-sapUshellNotificationIconTabByPrio-text")
                .attr("aria-label", resources.i18n.getText("Notifications.ByPriority.AriaLabel"));
        },

        // check if the get next buffer should fetch more notifications
        shouldFetchMoreNotifications: function () {
            var bHasMoreItemsInBackend = this.getView().getModel().getProperty("/" + this.sCurrentSorting + "/hasMoreItemsInBackend"),
                bListMaxReached = this.getView().getModel().getProperty("/" + this.sCurrentSorting + "/listMaxReached");
            return bHasMoreItemsInBackend && !bListMaxReached;
        },

        /**
         * Gets a buffer of notification items from notification service, according to the current sorting type
         */
        getNextBuffer: function () {
            var sCurrentSorting = this.sCurrentSorting,
                aCurrentItems = this.getItemsFromModel(sCurrentSorting),
                iNumberOfItemsInModel,
                oPromise,
                iNumberOfItemsToFetch;

            if (!this.shouldFetchMoreNotifications()) {
                return;
            }

            iNumberOfItemsToFetch = this.getNumberOfItemsToFetchOnScroll(sCurrentSorting);
            if (iNumberOfItemsToFetch === 0) {
                this.getView().getModel().setProperty("/" + sCurrentSorting + "/hasMoreItems", false);
                return;
            }

            if (aCurrentItems !== undefined) {
                iNumberOfItemsInModel = aCurrentItems.length;
            }

            if (iNumberOfItemsInModel === 0) {
                this.addBusyIndicatorToTabFilter(sCurrentSorting);
            }

            this.getView().getModel().setProperty("/" + sCurrentSorting + "/inUpdate", true);

            // Fetch a buffer of notification items from notification service
            oPromise = this.oNotificationsService.getNotificationsBufferBySortingType(sCurrentSorting, iNumberOfItemsInModel, iNumberOfItemsToFetch);

            oPromise.done(function (oResult) {
                var dNotificationsUserSettingsAvailability = this.oNotificationsService._getNotificationSettingsAvailability();
                if (dNotificationsUserSettingsAvailability.state() === "pending") {
                    this.oNotificationsService._userSettingInitialization();
                }
                this.addBufferToModel(sCurrentSorting, oResult);
            }.bind(this));

            oPromise.fail(function (/*oResult*/) {
                if (iNumberOfItemsInModel === 0) {
                    this.removeBusyIndicatorToTabFilter(sCurrentSorting);
                    this.handleError();
                }
            }.bind(this));
        },

        /**
         * Gets a buffer of notification items of specific type from notification service
         */
        getNextBufferForType: function () {
            var selectedTypeId = this.sCurrentExpandedType,
                sSortingType = this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING,
                oGroup = this.getGroupFromModel(selectedTypeId),
                aCurrentItems = oGroup ? oGroup.aNotifications : undefined,
                iNumberOfItemsInModel = 0,
                oPromise,
                bHasMoreItems = oGroup ? oGroup.hasMoreItems : true;

            // If there are no more notification items (in the backend) for this sorting type - then return
            if (!bHasMoreItems) {
                return;
            }
            if (aCurrentItems !== undefined) {
                iNumberOfItemsInModel = aCurrentItems.length;
            }

            this.getView().getModel().setProperty("/" + sSortingType + "/inUpdate", true);

            // Fetch a buffer of notification items from notification service
            oPromise = this.oNotificationsService.getNotificationsBufferInGroup(selectedTypeId, iNumberOfItemsInModel, this.iMaxNotificationItemsForDevice);

            oPromise.done(function (oResult) {
                this.addTypeBufferToModel(selectedTypeId, oResult, false);
            }.bind(this));

            oPromise.fail(function (/*oResult*/) {
                this.getNextBufferFailHandler(sSortingType);
            }.bind(this));
        },

        /**
         * Adds a new buffer of notification items to the model in the correct model path according to the specific sorting type.
         * The hasMoreItems flag indicates whether the number of returned items is smaller than the size of the requested buffer,
         * if so (i.e. oResultObj.value.length < getNumberOfItemsToFetchOnScroll) then there are no more items in the backend for this sorting type.
         *
         * @param {string} sSortingType The sorting type of the notification list to be affected.
         *   See "oOperationEnum" from "sap/ushell/services/Notifications.js".
         * @param {object} oResult The data (notification items) to insert to the model
         */
        addBufferToModel: function (sSortingType, oResult) {
            var aCurrentItems = this.getItemsFromModel(sSortingType),
                iCurrentNumberOfItems = aCurrentItems.length,
                mergedArrays,
                hasMoreItems = oResult.length >= this.getNumberOfItemsToFetchOnScroll(sSortingType);

            this._oTopNotificationData = undefined;

            if (!oResult) {
                this.getView().getModel().setProperty("/" + sSortingType + "/hasMoreItemsInBackend", false);
                return;
            }

            // If the number of returned items is smaller than the number that was requested -
            // it means that there is no more data (i.e. notification items) in the backend that needs to be fetched for this sorting type

            this.getView().getModel().setProperty("/" + sSortingType + "/hasMoreItemsInBackend", hasMoreItems);

            mergedArrays = aCurrentItems.concat(oResult);
            this.getView().getModel().setProperty("/" + sSortingType + "/aNotifications", mergedArrays);
            this.getView().getModel().setProperty("/" + sSortingType + "/inUpdate", false);
            if (mergedArrays.length >= this.iMaxNotificationItemsForDevice) {
                this.handleMaxReached(sSortingType);
            }

            // If this is the first time that items are fetched for this tab\sorting type (no old items) -
            // then the busy indicator was rendered and now needs to be removed
            if (iCurrentNumberOfItems === 0) {
                this.removeBusyIndicatorToTabFilter(sSortingType);
            }
        },

        /**
         * Adds a new buffer of notification items to the model in the correct type and path according to the type.
         * The hasMoreItems flag indicates whether the number of returned items is smaller than the size of the requested buffer,
         * if so (i.e. oResultObj.value.length < getBasicBufferSize()) then there are no more items in the backend for this sorting type.
         *
         * @param {string} sTypeId A string representing both the type Id
         * @param {object} oResult The data (notification items) to insert to the type model
         * @param {boolean} bOverwrite Overwrite the current buffer
         */
        addTypeBufferToModel: function (sTypeId, oResult, bOverwrite) {
            var oGroup = this.getGroupFromModel(sTypeId),
                oGroupIndexInModel = this.getGroupIndexFromModel(sTypeId),
                aGroupHeaders = this.getView().getModel().getProperty("/" + this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING),
                mergedArrays;

            if (!oResult) {
                return;
            }
            // If the number of returned items is smaller than the number that was requested -
            // it means that there is no more data (i.e. notification items) in the backend that needs to be fetched for this sorting type
            // if (oResultObj.value.length < this.getBasicBufferSize()) {
            if (oResult.length < this.getBasicBufferSize()) {
                oGroup.hasMoreItems = false;
            }
            if (!oGroup.aNotifications || bOverwrite) {
                oGroup.aNotifications = [];
            }
            mergedArrays = oGroup.aNotifications.concat(oResult);
            aGroupHeaders[oGroupIndexInModel].aNotifications = mergedArrays;
            aGroupHeaders[oGroupIndexInModel].Busy = false;

            this.getView().getModel().setProperty("/" + this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING, aGroupHeaders);
            this.getView().getModel().setProperty("/" + this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING + "/inUpdate", false);
        },

        keydownHandler: function (keyup) {
            var jqElement,
                nextElem,
                closeBtn;

            if (keyup.keyCode === KeyCodes.DELETE) {
                jqElement = jQuery(document.activeElement);
                if (jqElement.hasClass("sapUshellNotificationsListItem")) {
                    nextElem = jqElement.next();
                    closeBtn = jqElement.find(".sapMNLB-CloseButton")[0];
                    Core.byId(closeBtn.id).firePress();

                    // set focus on the next list item.
                    if (nextElem) {
                        nextElem.focus();
                    }
                }
            }
        },

        /**
         * Called by notification service for handling notifications update
         *
         * - Registered as callback using a call to this.oNotificationsService.registerNotificationsUpdateCallback
         * - Called by Notifications service when updated notifications data is obtained
         * - Gets the updated notifications array and sets the model accordingly
         * @param {object} oDependenciesDeferred Dependencies promise
         */
        notificationsUpdateCallback: function (oDependenciesDeferred) {
            var that = this,
                sCurrentSorting = this.sCurrentSorting,
                aCurrentItems,
                iNumberOfItemsInModel,
                iNumberOfItemsToFetch;

            if (sCurrentSorting === this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING) {
                this.notificationsUpdateCallbackForType();

                // If there is any flow in any module that depends on this flow - release it
                // see notification service private API registerDependencyNotificationsUpdateCallback
                oDependenciesDeferred.resolve();
                return;
            }

            aCurrentItems = this.getItemsFromModel(sCurrentSorting);
            if (aCurrentItems !== undefined) {
                iNumberOfItemsInModel = aCurrentItems.length;
            }

            // On update, only the current tab/sorting should maintain its previous data,
            // while other tabs (i.e. the model branch) should be emptied
            this.cleanModel();

            iNumberOfItemsToFetch = this.getNumberOfItemsToFetchOnUpdate(iNumberOfItemsInModel);

            this.oNotificationsService.getNotificationsBufferBySortingType(sCurrentSorting, 0, iNumberOfItemsToFetch).done(function (aNotifications) {
                if (!aNotifications) {
                    return;
                }

                // If there is any flow in any module that depends on this flow - release it
                // see notification service private API registerDependencyNotificationsUpdateCallback
                oDependenciesDeferred.resolve();

                // Updating the model with the updated array of notification objects
                that.replaceItemsInModel(sCurrentSorting, aNotifications, iNumberOfItemsToFetch);
            }).fail(function (data) {
                Log.error("Notifications control - call to notificationsService.getNotificationsBufferBySortingType failed: ",
                    data,
                    "sap.ushell.components.shell.Notifications.Notifications");
            });
        },

        isMoreCircleExist: function (sSortingType) {
            var oSelectedList = this.getNotificationList(sSortingType),
                iItemsLength = oSelectedList.getItems().length,
                oLastItem = oSelectedList.getItems()[iItemsLength - 1];
            return !!iItemsLength && oLastItem.getMetadata().getName() === "sap.m.CustomListItem";
        },

        handleMaxReached: function (sSortingType) {
            var oSelectedList = this.getNotificationList(sSortingType),
                iNotificationCount = Math.floor(this.oNotificationsService.getNotificationsCount()),
                iMoreNotificationsNumber = iNotificationCount - this.iMaxNotificationItemsForDevice,
                bIsMoreCircleExist = this.isMoreCircleExist(sSortingType);

            this.getView().getModel().setProperty("/" + this.sCurrentSorting + "/moreNotificationCount", iMoreNotificationsNumber);
            this.getView().getModel().setProperty("/" + this.sCurrentSorting + "/listMaxReached", iMoreNotificationsNumber >= 0);
            if (iMoreNotificationsNumber > 0 && !bIsMoreCircleExist) {
                oSelectedList.addItem(this.getMoreCircle(this.sCurrentSorting));
            } else if (iMoreNotificationsNumber <= 0 && bIsMoreCircleExist) {
                oSelectedList.removeItem(this.oMoreListItem);
            }
        },

        reAddFailedGroup: function (oGroupToAdd) {
            var oModel = this.getView().getModel(),
                aGroups = oModel.getProperty("/notificationsByTypeDescending");

            aGroups.splice(oGroupToAdd.removedGroupIndex, 0, oGroupToAdd.oGroup);
            oModel.setProperty("/notificationsByTypeDescending", aGroups);
        },

        removeGroupFromModel: function (oGroupToDelete) {
            var oModel = this.getView().getModel(),
                aGroups = oModel.getProperty("/notificationsByTypeDescending"),
                oRemovedGroup = {
                    oGroup: oGroupToDelete,
                    removedGroupIndex: undefined
                };

            aGroups.some(function (oGroup, iIndex) {
                if (oGroup.Id === oGroupToDelete.Id) {
                    oRemovedGroup.removedGroupIndex = iIndex;
                    aGroups.splice(iIndex, 1);
                    oModel.setProperty("/notificationsByTypeDescending", aGroups);
                    return true;
                }
                return false;
            });
            this.sCurrentExpandedType = undefined;
            return oRemovedGroup;
        },

        updateGroupHeaders: function () {
            var oPromise = this.oNotificationsService.getNotificationsGroupHeaders(),
                that = this,
                aGroups = that.getView().getModel().getProperty("/" + that.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);
            oPromise.fail(function (data) {
                Log.error("Notifications control - call to notificationsService.updateGroupHeaders failed: ", data, "sap.ushell.components.shell.Notifications.Notifications");
            });
            oPromise.done(function (notificationsByType) {
                var oJson = JSON.parse(notificationsByType),
                    arr = oJson.value;

                arr.forEach(function (item) {
                    var bFound = false;
                    aGroups.forEach(function (group, iIndex) {
                        if (group.Id === item.Id) {
                            aGroups[iIndex].GroupHeaderText = item.GroupHeaderText;
                            aGroups[iIndex].CreatedAt = item.CreatedAt;
                            bFound = true;
                        }
                    });
                    if (!bFound) {
                        aGroups.unshift(item);
                    }
                });
                that.getView().getModel().setProperty("/" + that.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING, aGroups);
            });
        },

        updateNotificationsByDate: function () {
            var iTop = this.getNumberOfItemsToFetchOnScroll(this.sCurrentSorting);
            var aCurrentNotifications = this.getView().getModel().getProperty("/" + this.sCurrentSorting);

            this.oNotificationsService.getNotificationsBufferBySortingType(this.sCurrentSorting, 0, iTop)
                .done(function (aNotifications) {
                    aNotifications.forEach(function (item) {
                        for (var i = 0; i < aCurrentNotifications.length; i++) {
                            if (aCurrentNotifications[i].Id === item.Id) {
                                // Add item at the beginning of the current list of notifications if it did not yet exist.
                                aCurrentNotifications.unshift(item);
                                break;
                            }
                        }
                    });

                    this.getView().getModel().setProperty("/" + this.sCurrentSorting, aCurrentNotifications);
                    this.removeBusyIndicatorToTabFilter(this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING);
                }.bind(this))
                .fail(function (error) {
                    Log.error("Notifications control - call to notificationsService.getNotificationsBufferBySortingType failed: ", error, "sap.ushell.components.shell.Notifications.Notifications");
                    this.removeBusyIndicatorToTabFilter(this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING);
                }.bind(this));
        },

        reloadGroupHeaders: function () {
            var oPromise = this.oNotificationsService.getNotificationsGroupHeaders(),
                that = this;
            oPromise.fail(function (data) {
                Log.error("Notifications control - call to notificationsService.getNotificationsGroupHeaders failed: ", data, "sap.ushell.components.shell.Notifications.Notifications");
                that.removeBusyIndicatorToTabFilter(that.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);
            });
            oPromise.done(function (notificationsByType) {
                var oJson = JSON.parse(notificationsByType),
                    arr = oJson.value,
                    result = [];
                arr.forEach(function (item) {
                    if (item.IsGroupHeader) {
                        item.Collapsed = true;
                        result.push(item);
                    }
                });
                that.getView().getModel().setProperty("/" + that.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING, result);
                that.removeBusyIndicatorToTabFilter(that.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);
            });
        },

        markRead: function (sNotificationId) {
            var oPromise = this.oNotificationsService.markRead(sNotificationId),
                that = this;
            oPromise.fail(function () {
                _errorMessage(resources.i18n.getText("notificationsFailedMarkRead"));
                that.setMarkReadOnModel(sNotificationId, false);
            });
            this.setMarkReadOnModel(sNotificationId, true);
        },

        onExit: function () { },

        onBeforeRendering: function () {
            if (!this._bDependencyCallbackRegistered) { // register once: the service registration is primitive and does not remove duplicates
                this._bDependencyCallbackRegistered = true;
                this.oNotificationsService.registerDependencyNotificationsUpdateCallback(this.notificationsUpdateCallback.bind(this), false);
            }
        },

        //*********************************************************************************************************
        //************************************** Notification actions *********************************************

        executeAction: function (sNotificationId, sActionName) {
            return this.oNotificationsService.executeAction(sNotificationId, sActionName);
        },

        executeBulkAction: function (sActionName, sActionText, oGroup, sPathToNotification) {
            var oThatGroup = oGroup,
                oPromise = this.oNotificationsService.executeBulkAction(oGroup.Id, sActionName),
                sMessage,
                sGroupActionText = sActionText,
                sNotificationTypeDesc = this.getView().getModel().getProperty(sPathToNotification + "/NotificationTypeDesc"),
                that = this;

            if (sNotificationTypeDesc === "") {
                sNotificationTypeDesc = this.getView().getModel().getProperty(sPathToNotification + "/NotificationTypeKey");
            }
            oPromise.fail(function (oResult) {
                this.getView().getModel().setProperty(sPathToNotification + "/Busy", false);

                if (oResult && oResult.succededNotifications && oResult.succededNotifications.length) {
                    oResult.succededNotifications.forEach(function (sNotificationId) {
                        this.removeNotificationFromModel(sNotificationId);
                    }.bind(this));
                    // There is need to load again the other 2 tabs, therefore we need to "clean" other models.
                    that.cleanModel();
                }

                if (oResult.succededNotifications.length === 1) {
                    sMessage = resources.i18n.getText("notificationsPartialSuccessExecuteBulkAction", [
                        sGroupActionText,
                        oResult.succededNotifications.length,
                        oResult.failedNotifications.length + oResult.succededNotifications.length,
                        sNotificationTypeDesc,
                        oResult.failedNotifications.length
                    ]);
                    MessageToast.show(sMessage, { duration: 4000 });
                } else if (oResult.succededNotifications.length > 1) {
                    sMessage = resources.i18n.getText("notificationsSingleSuccessExecuteBulkAction", [
                        sGroupActionText,
                        oResult.succededNotifications.length,
                        oResult.failedNotifications.length + oResult.succededNotifications.length,
                        sNotificationTypeDesc,
                        oResult.failedNotifications.length
                    ]);
                    MessageToast.show(sMessage, { duration: 4000 });
                } else {
                    sMessage = resources.i18n.getText("notificationsFailedExecuteBulkAction");
                    _errorMessage(sMessage);
                }
            }.bind(this));

            oPromise.done(function () {
                sMessage = resources.i18n.getText("notificationsSuccessExecuteBulkAction", [
                    sGroupActionText, sNotificationTypeDesc
                ]);
                MessageToast.show(sMessage, { duration: 4000 });
                this.removeGroupFromModel(oThatGroup);
                // There is need to load again the other 2 tabs, therefore we need to "clean"  other models.
                this.cleanModel();
            }.bind(this));
        },

        dismissNotification: function (notificationId) {
            // if the service call is successful, we will get the updated model from the service via the standard update.
            // if the operation fails, the model won't be changed, so we just need to call "updateItems" on the list,
            // since the model contains the dismissed notification.
            var that = this,
                oRemovedNotification = this.removeNotificationFromModel(notificationId),
                oPromise = this.oNotificationsService.dismissNotification(notificationId);
            // There is need to load again the other 2 tabs, therefore we need to "clean"  other models.
            this.cleanModel();
            oPromise.fail(function () {
                _errorMessage(resources.i18n.getText("notificationsFailedDismiss"));
                that.addNotificationToModel(oRemovedNotification.obj, oRemovedNotification.index);
            });
        },

        dismissBulkNotifications: function (oGroup) {
            var oRemovedGroup = this.removeGroupFromModel(oGroup),
                oPromise = this.oNotificationsService.dismissBulkNotifications(oGroup.Id);
            // There is need to load again the other 2 tabs, therefore we need to "clean"  other models.
            this.cleanModel();
            oPromise.fail(function () {
                _errorMessage(resources.i18n.getText("notificationsFailedExecuteBulkAction"));
                this.reAddFailedGroup(oRemovedGroup);
            }.bind(this));
        },

        onListItemPress: function (sNotificationId, sSemanticObject, sAction, aParameters) {
            if (sSemanticObject && sAction) {
                var viewPortContainer = Core.byId("viewPortContainer");
                if (viewPortContainer) { // qUnits do not create the viewport container
                    viewPortContainer.switchState("Center");
                }
                utils.toExternalWithParameters(sSemanticObject, sAction, aParameters);
            }
            this.markRead(sNotificationId);
        },

        //*********************************************************************************************************
        //******************************************* Scrolling ***************************************************

        scrollToItem: function (oTopNotificationData) {
            var jqNotificationItems = this._getJqNotificationObjects(),
                jqNotificationContainerContent = jqNotificationItems[0],
                jqNotificationsContent = jqNotificationItems[1],
                jqNotificationsList = jqNotificationItems[2],
                jqNotificationItem = jqNotificationItems[3],
                itemHeight,
                notificationIndex,
                indexOffSet,
                containerPadding,
                notificationContainerOffSet;

            if (jqNotificationContainerContent.length > 0
                && jqNotificationsContent.length > 0
                && jqNotificationsList.length > 0
                && jqNotificationItem.length > 0) {
                itemHeight = jqNotificationItem.outerHeight(true) - window.parseInt(jqNotificationItem.css("margin-top").replace("px", ""));
                notificationIndex = this.getIndexInModelByItemId(oTopNotificationData.topItemId);
                notificationIndex = notificationIndex || 0;
                indexOffSet = notificationIndex * itemHeight + window.parseInt(jqNotificationItem.css("margin-top").replace("px", ""));

                containerPadding = window.parseInt(jqNotificationsContent.css("padding-top").replace("px", ""))
                    + window.parseInt(jqNotificationsList.css("padding-top").replace("px", ""));
                notificationContainerOffSet = jqNotificationContainerContent.offset().top;

                jqNotificationContainerContent.scrollTop(indexOffSet + containerPadding + notificationContainerOffSet - oTopNotificationData.offSetTop);
            }
            this._oTopNotificationData = undefined;
        },

        _getJqNotificationObjects: function () {
            var jqNotificationContainerContent = jQuery("#notificationIconTabBar-containerContent"),
                jqNotificationsContent = jqNotificationContainerContent.children(),
                jqNotificationsList = jqNotificationsContent.children(),
                jqNotificationItem = jqNotificationContainerContent.find("li").eq(0);

            return [jqNotificationContainerContent, jqNotificationsContent, jqNotificationsList, jqNotificationItem];
        },

        getTopOffSet: function () {
            var topOffSet = 0,
                jqContainerContent = this._getJqNotificationObjects()[0];
            if (jqContainerContent.children().length > 0 && jqContainerContent.children().children().length > 0) {
                // Get the outer space/margin
                topOffSet += jqContainerContent.children().outerHeight() - jqContainerContent.children().height();
                // Get the inner space/margin
                topOffSet += jqContainerContent.children().children().outerHeight() - jqContainerContent.children().children().height();
            }
            return topOffSet;
        },

        /**
         * Get top visible notification item
         * @returns {object} the notification ID of the top notification item in the screen, and the actual offset of the element from the top
         */
        getTopItemOnTheScreen: function () {
            // The notifications list control including top offset (until the tabs bar)
            var jqContainerContent = this._getJqNotificationObjects()[0],
                topOffSet = 0,
                sItemId,
                itemOffsetTop = 0,
                that = this;

            topOffSet = this.getTopOffSet();

            jqContainerContent.find("li").each(function () {
                // The distance between the top of an item from the top of the screen
                itemOffsetTop = jQuery(this).offset().top;
                // Check if this element is in the interested viewport, the first element whose itemOffsetTop is bigger then topOffSet -
                // is the highest visible element in the list
                if (itemOffsetTop >= topOffSet) {
                    sItemId = that.getItemNotificationId(this);
                    return false;
                }
            });
            return { topItemId: sItemId, offSetTop: itemOffsetTop };
        },

        //*********************************************************************************************************
        //***************************************** Error Handling ************************************************

        handleError: function () {
            _errorMessage(resources.i18n.getText("errorOccurredMsg"));
        },

        //*********************************************************************************************************
        //****************************************** Busy Indicator ***********************************************

        addBusyIndicatorToTabFilter: function (sSortingType) {
            var oList = this.getNotificationList(sSortingType);
            oList.setBusy(true);
            // during the loading we don't need to show noData text, because the data is not still loaded
            oList.setShowNoData(false);
        },

        removeBusyIndicatorToTabFilter: function (sSortingType) {
            var oList = this.getNotificationList(sSortingType);
            oList.setBusy(false);
            oList.setShowNoData(true);
        },

        //*********************************************************************************************************
        //***************************************** Model functions ***********************************************

        addNotificationToModel: function (oNotification, index) {
            var oModel = this.getView().getModel(),
                notifications = oModel.getProperty("/" + this.sCurrentSorting + "/aNotifications");
            notifications.splice(index, 0, oNotification);
            oModel.setProperty("/" + this.sCurrentSorting + "/aNotifications", notifications);
        },

        removeNotificationFromModel: function (notificationId) {
            var oModel = this.getView().getModel(),
                aGroups,
                notifications,
                sNotificationsModelPath,
                oRemovedNotification = {};

            if (this.sCurrentSorting === this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING ||
                this.sCurrentSorting === this.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING ||
                this.sCurrentSorting === this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING) {
                sNotificationsModelPath = "/" + this.sCurrentSorting + "/aNotifications";
                notifications = oModel.getProperty(sNotificationsModelPath);
                notifications.some(function (notification, index, array) {
                    if (notification.Id && notification.Id === notificationId) {
                        oRemovedNotification.obj = array.splice(index, 1)[0];
                        oRemovedNotification.index = index;
                        return true;
                    }
                    return false;
                });
                oModel.setProperty(sNotificationsModelPath, notifications);
                return oRemovedNotification;
            }

            aGroups = oModel.getProperty("/notificationsByTypeDescending");
            for (var index = 0; index < aGroups.length; index++) {
                notifications = aGroups[index].aNotifications;
                if (notifications) {
                    if (notifications.length === 1 && notifications[0].Id === notificationId) {
                        aGroups.splice(index, 1);
                    } else {
                        notifications.some(function (notification, index, array) {
                            if (notification.Id && notification.Id === notificationId) {
                                oRemovedNotification.obj = array.splice(index, 1)[0];
                                oRemovedNotification.index = index;
                                return true;
                            }
                            return false;
                        });
                        aGroups[index].aNotifications = notifications;
                    }
                }
            }
            // update the header
            this.updateGroupHeaders();
            oModel.setProperty("/notificationsByTypeDescending", aGroups);
            return oRemovedNotification;
        },

        /**
         * Gets notification index
         * @param {string} sNotificationId notification Id
         * @returns {number} the index of the notification item in the model
         */
        getIndexInModelByItemId: function (sNotificationId) {
            var aNotifications,
                index;

            if (this.notificationsByTypeDescending === this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING) {
                aNotifications = this.getView().getModel().getProperty("/" + this.sCurrentExpandedType + "/aNotifications");
            } else {
                aNotifications = this.getView().getModel().getProperty("/" + this.sCurrentSorting + "/aNotifications");
            }
            if (aNotifications === undefined || aNotifications.length === 0) {
                return 0;
            }
            for (index = 0; index < aNotifications.length; index++) {
                if (aNotifications[index].Id === sNotificationId) {
                    return index;
                }
            }
        },

        /**
         * Initializes (i.e. empties) the branched in the model of the tabs/sorting which are not the current one
         */
        cleanModel: function () {
            var that = this,
                oSortingTypesArray = this.getView().getModel().getProperty("/");

            Object.keys(oSortingTypesArray).forEach(function (sSortKey) {
                if (sSortKey !== that.sCurrentSorting && sSortKey !== that.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING) {
                    oSortingTypesArray[sSortKey] = that.getInitialSortingModelStructure();
                }
            });

            this.getView().getModel().setProperty("/", oSortingTypesArray);
        },

        replaceItemsInModel: function (sSortingType, oResult, iNumberOfItemsToFetch) {
            var aCurrentItems = this.getItemsFromModel(sSortingType),
                iCurrentNumberOfItems = aCurrentItems.length,
                hasMoreItemsToFetch = oResult.length >= iNumberOfItemsToFetch;
            if (iCurrentNumberOfItems) {
                this._oTopNotificationData = this.getTopItemOnTheScreen();
            }

            this.getView().getModel().setProperty("/" + sSortingType + "/hasMoreItemsInBackend", hasMoreItemsToFetch);

            this.getView().getModel().setProperty("/" + sSortingType + "/aNotifications", oResult);

            this.getView().getModel().setProperty("/" + sSortingType + "/inUpdate", false);
            this.handleMaxReached(sSortingType);
        },

        setMarkReadOnModel: function (notificationId, bIsRead) {
            var oModel = this.getView().getModel(),
                sPath = "/" + this.sCurrentSorting,
                aNotifications,
                oData,
                bGroupFound,
                i;

            oData = oModel.getProperty(sPath);
            if (this.sCurrentSorting === "notificationsByTypeDescending") {
                for (i = 0; i < oData.length; i++) {
                    if (oData[i].Id === this.sCurrentExpandedType) {
                        sPath = sPath + "/" + i;
                        bGroupFound = true;
                        break;
                    }
                }
                if (!bGroupFound) {
                    return;
                }
            }
            sPath = sPath + "/aNotifications";

            aNotifications = oModel.getProperty(sPath);
            aNotifications.some(function (notification) {
                if (notification.Id === notificationId) {
                    notification.IsRead = bIsRead;
                    return true;
                }
                return false;
            });
            oModel.setProperty(sPath, aNotifications);
        },

        //*********************************************************************************************************
        //**************************************** Handler functions ***********************************************

        onTabSelected: function (evt) {
            var key = evt.getParameter("key");

            if (key === "sapUshellNotificationIconTabByDate") { // Specification: By Date is sorted always by date descending
                this.sCurrentSorting = this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING;
                this.updateNotificationsByDate();
            } else if (key === "sapUshellNotificationIconTabByType" && this.oPreviousTabKey !== "sapUshellNotificationIconTabByType") {
                this.sCurrentSorting = this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING;
                this.addBusyIndicatorToTabFilter(this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);
                this.reloadGroupHeaders();
                this.getView().byId("notificationIconTabBar").addStyleClass("sapUshellNotificationIconTabByTypeWithBusyIndicator");
            } else { // by Priority
                this.sCurrentSorting = this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING;
                if (this.getItemsFromModel(this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING).length === 0) {
                    this.getNextBuffer(this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING);
                }
            }
            this.oPreviousTabKey = key;
        },

        _changeDateListBinding: function (sSortingType, oTab) {
            var oLoadListItem = new Promise(function (resolve, reject) {
                sap.ui.require(["sap/ui/core/Fragment"], function (Fragment) {
                    Fragment.load({
                        name: "sap.ushell.components.shell.Notifications.NotificationsListItem",
                        type: "XML",
                        controller: this
                    }).then(resolve).catch(reject);
                }.bind(this), reject);
            }.bind(this));

            if (sSortingType === this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING) {
                oTab.$("text").attr("aria-label", resources.i18n.getText("Notifications.ByDateDescending.AriaLabel"));

                oLoadListItem.then(function (fragment) {
                    this.getView().byId("sapUshellNotificationsListDate").bindItems(
                        "/notificationsByDateDescending/aNotifications",
                        fragment
                    );
                }.bind(this));
            } else {
                oTab.$("text").attr("aria-label", resources.i18n.getText("Notifications.ByDateAscending.AriaLabel"));

                oLoadListItem.then(function (fragment) {
                    this.getView().byId("sapUshellNotificationsListDate").bindItems(
                        "/notificationsByDateAscending/aNotifications",
                        fragment
                    );
                }.bind(this));
            }
        },

        onNotificationItemPress: function (oEvent) {
            var oModelPath = oEvent.getSource().getBindingContextPath(),
                oModelPart = this.getView().getModel().getProperty(oModelPath),
                sSemanticObject = oModelPart.NavigationTargetObject,
                sAction = oModelPart.NavigationTargetAction,
                aParameters = oModelPart.NavigationTargetParams,
                sNotificationId = oModelPart.Id;
            this.onListItemPress(sNotificationId, sSemanticObject, sAction, aParameters);
        },

        onNotificationItemClose: function (oEvent) {
            this._retainFocus();

            var sNotificationPathInModel = oEvent.getSource().getBindingContextPath(),
                oNotificationModelEntry = this.getView().getModel().getProperty(sNotificationPathInModel),
                sNotificationId = oNotificationModelEntry.Id;
            this.dismissNotification(sNotificationId);
        },

        onNotificationItemButtonPress: function (oEvent) {
            this._retainFocus();

            var sNotificationPathInModel = oEvent.getSource().getBindingContext().getPath(),
                oModel = this.getView().getModel(),
                oNotificationModelPart = oModel.getProperty(sNotificationPathInModel),
                aPathParts = sNotificationPathInModel.split("/"),
                bTypeTabSelected = this.sCurrentSorting === this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING,
                sPathToNotification = bTypeTabSelected
                    ? "/" + aPathParts[1] + "/" + aPathParts[2] + "/" + aPathParts[3] + "/" + aPathParts[4]
                    : "/" + aPathParts[1] + "/" + aPathParts[2] + "/" + aPathParts[3],
                oNotificationModelEntry = oModel.getProperty(sPathToNotification),
                sNotificationId = oNotificationModelEntry.Id;

            oModel.setProperty(sPathToNotification + "/Busy", true);

            this.executeAction(sNotificationId, oNotificationModelPart.ActionId).done(function (responseAck) {
                if (responseAck && responseAck.isSucessfull) {
                    sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                        if (responseAck.message && responseAck.message.length) {
                            MessageToast.show(responseAck.message, { duration: 4000 });
                        } else {
                            var sActionText = oNotificationModelPart.ActionText;
                            MessageToast.show(resources.i18n.getText("ActionAppliedToNotification", sActionText), { duration: 4000 });
                        }
                    });

                    // Notification should remain in the UI (after action executed) only if DeleteOnReturn flag exists, and equals false
                    if (responseAck.DeleteOnReturn !== false) {
                        this.removeNotificationFromModel(sNotificationId);
                        this.oNotificationsService._addDismissNotifications(sNotificationId);

                        // There is need to load again the other 2 tabs, therefore we need to "clean" other models.
                        this.cleanModel();
                    }
                } else if (responseAck) {
                    _errorMessage(responseAck.message);
                } else {
                    _errorMessage(resources.i18n.getText("notificationsFailedExecuteAction"));
                }
                oModel.setProperty(sPathToNotification + "/Busy", false);
            }.bind(this)).fail(function () {
                oModel.setProperty(sPathToNotification + "/Busy", false);
                _errorMessage(resources.i18n.getText("notificationsFailedExecuteAction"));
            });
        },

        onNotificationGroupItemClose: function (oEvent) {
            var sNotificationPathInModel = oEvent.getSource().getBindingContext().getPath(),
                aPathParts = sNotificationPathInModel.split("/"),
                sPathToNotification = "/" + aPathParts[1] + "/" + aPathParts[2],
                oNotificationModelEntry = this.getView().getModel().getProperty(sPathToNotification);

            this.dismissBulkNotifications(oNotificationModelEntry);
        },

        onNotificationGroupItemCollapse: function (oEvent) {
            var group = oEvent.getSource(),
                path = group.getBindingContext().getPath();
            if (!group.getCollapsed()) {
                this.getView().getModel().setProperty(path + "/Busy", true);
                this.expandedGroupIndex = path.substring(path.lastIndexOf("/") + 1);
                this.onExpandGroup(group);
            }
        },

        onNotificationGroupItemButtonPress: function (oEvent) {
            var oModel = this.getView().getModel(),
                sNotificationPathInModel = oEvent.getSource().getBindingContext().getPath(),
                oNotificationModelPart = oModel.getProperty(sNotificationPathInModel),
                aPathParts = sNotificationPathInModel.split("/"),
                sPathToNotification = "/" + aPathParts[1] + "/" + aPathParts[2],
                oNotificationModelEntry = oModel.getProperty(sPathToNotification);

            this._retainFocus();

            // mark the notification group as busy
            oModel.setProperty(sPathToNotification + "/Busy", true);

            this.executeBulkAction(oNotificationModelPart.ActionId, oEvent.getSource().getProperty("text"), oNotificationModelEntry, sPathToNotification);
        },

        onListUpdateStarted: function (oEvent) {
            if (oEvent.getParameter("reason") === "Growing") {
                if (!this.getView().getModel().getProperty("/" + this.sCurrentSorting + "/inUpdate")) {
                    this.getNextBuffer();
                }
            }
        },

        //*********************************************************************************************************
        //**************************************** Helper functions ***********************************************

        getNumberOfItemsInScreen: function () {
            var iItemsInScreen,
                iHeight = this.getWindowSize();

            iItemsInScreen = (iHeight - this.oPagingConfiguration.TAB_BAR_HEIGHT) / this.oPagingConfiguration.NOTIFICATION_ITEM_HEIGHT;
            return Math.ceil(iItemsInScreen);
        },

        getBasicBufferSize: function () {
            return Math.max(this.getNumberOfItemsInScreen() * 3, this.oPagingConfiguration.MIN_NOTIFICATION_ITEMS_PER_BUFFER);
        },

        getWindowSize: function () {
            return jQuery(window).height();
        },

        /**
         * Calculates and returns the number of items that should be requested from notification service, as part of the paging policy.
         * The function performs the following:
         *   - Calculated the number of required buffer according to the device / screen size
         *   - If the model already holds the  maximum number of item (per this device) - return 0
         *   - If the number of items in the model plus buffer size is bigger that the maximum - return the biggest possible number of items to fetch
         *   - Regular use case - return buffer size
         *
         * @param {string} sSortingType The sorting type of the notification list to be affected.
         *   See "oOperationEnum" from "sap/ushell/services/Notifications.js".
         * @returns {int} Basic buffer size
         */
        getNumberOfItemsToFetchOnScroll: function (sSortingType) {
            var iCurrentNumberOfItems = this.getItemsFromModel(sSortingType).length,
                iBasicBufferSize = this.getBasicBufferSize();

            if (iCurrentNumberOfItems >= this.iMaxNotificationItemsForDevice) {
                return 0;
            }
            if (iCurrentNumberOfItems + iBasicBufferSize > this.iMaxNotificationItemsForDevice) {
                return this.iMaxNotificationItemsForDevice - iCurrentNumberOfItems;
            }
            return iBasicBufferSize;
        },

        /**
         * Calculated the number of items that should be required from the backend, according to:
         *   - (parameter) The number of items that are already in the model for the relevant sorting type
         *   - Basic buffer size
         * The number is rounded up to a product of basic buffer size
         * For example: if a basic buffer size is 50 and there are currently 24 items in the model - then 50 items (size of one basic buffer) are required.
         * @param {number} iNumberOfItemsInModel number of items
         * @returns {boolean} The smaller of the two following values:
         *   1. required number of items, which is the number of buffers * buffer size
         *   2. iMaxNotificationItemsForDevice
         */
        getNumberOfItemsToFetchOnUpdate: function (iNumberOfItemsInModel) {
            var iBasicBufferSize = this.getBasicBufferSize(),
                iNumberOfRequiredBasicBuffers = Math.ceil(iNumberOfItemsInModel / iBasicBufferSize),
                iReturnedValue;

            // If the number is less then one basic buffer - then one basic buffer is required
            iReturnedValue = iNumberOfRequiredBasicBuffers > 0 ? iNumberOfRequiredBasicBuffers * iBasicBufferSize : iBasicBufferSize;

            // Return no more then the maximum number of items for this device
            return iReturnedValue > this.iMaxNotificationItemsForDevice ? this.iMaxNotificationItemsForDevice : iReturnedValue;
        },

        getItemsFromModel: function (sortingType) {
            if (sortingType === undefined) {
                sortingType = this.sCurrentSorting;
            }
            return this.getView().getModel().getProperty("/" + sortingType + "/aNotifications");
        },

        getItemsOfTypeFromModel: function (sTypeHeader) {
            var oGroup = this.getGroupFromModel(sTypeHeader);
            if (oGroup) {
                return oGroup.aNotifications ? oGroup.aNotifications : [];
            }
            return [];
        },

        getGroupFromModel: function (sTypeHeader) {
            var aGroupHeaders = this.getView().getModel().getProperty("/" + this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);
            return aGroupHeaders.find(function (group) {
                return group.Id === sTypeHeader;
            });
        },

        getGroupIndexFromModel: function (sTypeHeader) {
            var aGroupHeaders = this.getView().getModel().getProperty("/" + this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING),
                iIndex;
            aGroupHeaders.forEach(function (group, index) {
                if (group.Id === sTypeHeader) {
                    iIndex = index;
                    return true;
                }
            });
            return iIndex;
        },

        // Return the Notification Id of the given notification item
        getItemNotificationId: function (elNotificationItem) {
            var sItemModelPath,
                sItemNotificationId;
            sItemModelPath = Core.byId(elNotificationItem.getAttribute("Id")).getBindingContext().sPath;

            sItemNotificationId = this.getView().getModel().getProperty(sItemModelPath + "/Id");
            return sItemNotificationId;
        },

        getInitialSortingModelStructure: function () {
            return {
                hasMoreItemsInBackend: true,
                listMaxReached: false,
                aNotifications: [],
                inUpdate: false,
                moreNotificationCount: ""
            };
        },

        onExpandGroup: function (groupElement) {
            var listItems = this.getView().byId("sapUshellNotificationsListType").getItems(),
                groupElementId = groupElement.getId(),
                oGroup = this.getView().getModel().getProperty(groupElement.getBindingContextPath()),
                that = this;
            that.sCurrentExpandedType = oGroup.Id;
            that.getView().getModel().setProperty(groupElement.getBindingContextPath() + "/aNotifications", []);
            that.getView().getModel().setProperty(groupElement.getBindingContextPath() + "/hasMoreItems", true);
            listItems.forEach(function (item, index) {
                if (item.getId() === groupElementId) {
                    that.getNextBufferForType();
                } else if (item.getId() !== groupElementId && !item.getCollapsed()) {
                    item.setCollapsed(true);
                    that.getView().getModel().setProperty(item.getBindingContextPath() + "/hasMoreItems", true);
                }
            });
        },

        notificationsUpdateCallbackForType: function () {
            var selectedTypeId = this.sCurrentExpandedType,
                sSortingType = this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING,
                oGroup = this.getGroupFromModel(selectedTypeId),
                aCurrentItems = oGroup ? oGroup.aNotifications : undefined,
                iNumberOfItemsInModel = 0,
                oPromise;


            if (aCurrentItems !== undefined) {
                iNumberOfItemsInModel = aCurrentItems.length;
            }

            this.getView().getModel().setProperty("/" + sSortingType + "/inUpdate", true);

            // First Fetch the Groups Headers
            this.updateGroupHeaders();

            // Fetch a buffer of notification items from notification service
            if (selectedTypeId) {
                oPromise = this.oNotificationsService.getNotificationsBufferInGroup(selectedTypeId, 0, this.getNumberOfItemsToFetchOnUpdate(iNumberOfItemsInModel));

                oPromise.done(function (oResult) {
                    this.addTypeBufferToModel(selectedTypeId, oResult, true);
                }.bind(this));

                oPromise.fail(function (oResult) {
                    this.getNextBufferFailHandler(oResult);
                }.bind(this));
            }
        },

        getNotificationList: function (sSortingType) {
            var oList;

            if (sSortingType === this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING ||
                sSortingType === this.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING) {
                oList = this.getView().byId("sapUshellNotificationsListDate");
            } else if (sSortingType === this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING) {
                oList = this.getView().byId("sapUshellNotificationsListPriority");
            } else {
                oList = this.getView().byId("sapUshellNotificationsListType");
            }

            return oList;
        },

        /**
         * Helper method that removes the tabindex from the second child of the given object.
         *
         * @param {string} sSortingType The sorting type of the notification list to be affected.
         *   See "oOperationEnum" from "sap/ushell/services/Notifications.js".
         */
        removeTabIndexFromList: function (sSortingType) {
            var oListControl = this.getNotificationList(sSortingType);
            var oListTag = oListControl.$().children().get(1);
            if (oListTag) {
                oListTag.removeAttribute("tabindex");
            }
        },

        getMoreCircle: function (sType) {
            var oMoreText = new Text({ text: resources.i18n.getText("moreNotifications") }),
                oNotificationCountText = new Text({ text: "" }).addStyleClass("sapUshellNotificationsMoreCircleCount"),
                oMoreCircle = new VBox({
                    items: [oNotificationCountText, oMoreText],
                    alignItems: FlexAlignItems.Center
                }).addStyleClass("sapUshellNotificationsMoreCircle"),
                oBelowCircleTextPart1 = new Text({
                    text: resources.i18n.getText("moreNotificationsAvailable_message"),
                    textAlign: "Center"
                }).addStyleClass("sapUshellNotificationsMoreHelpingText"),
                oBelowCircleTextPart2 = new Text({
                    text: resources.i18n.getText("processNotifications_message"),
                    textAlign: "Center"
                }).addStyleClass("sapUshellNotificationsMoreHelpingText"),
                oVBox = new VBox({
                    items: [oMoreCircle, oBelowCircleTextPart1, oBelowCircleTextPart2]
                }).addStyleClass("sapUshellNotificationsMoreVBox"),
                oListItem = new CustomListItem({
                    type: ListType.Inactive,
                    content: oVBox
                }).addStyleClass("sapUshellNotificationsMoreListItem");

            oNotificationCountText.setModel(this.getView().getModel());
            oNotificationCountText.bindText("/" + sType + "/moreNotificationCount");
            this.oMoreListItem = oListItem;

            return oListItem;
        },

        // When the notifications view is opened in a popup, keep focus on an active tab to avoid the popup close due to focus loss
        _retainFocus: function () {
            var oIconTabBar = this.getView().byId("notificationIconTabBar"),
                sKey = oIconTabBar.getSelectedKey(),
                aItems = oIconTabBar.getItems(),
                iSelected = 0;

            aItems.forEach(function (oItem, index) {
                if (oItem.getKey() === sKey) {
                    iSelected = index;
                }
            });
            aItems[iSelected].focus();
        },

        //*********************************************************************************************************
        //**************************************** Formatter functions ********************************************

        priorityFormatter: function (priority) {
            if (priority) {
                priority = priority.charAt(0) + priority.substr(1).toLowerCase();
                return Priority[priority];
            }
        }
    });
});
