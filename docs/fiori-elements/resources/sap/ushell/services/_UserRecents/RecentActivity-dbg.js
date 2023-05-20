// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "./UserRecentsBase",
    "sap/base/Log",
    "sap/base/util/extend",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/EventHub",
    "sap/ushell/library"
], function (
    UserRecentsBase,
    Log,
    extend,
    Device,
    jQuery,
    EventHub,
    ushellLibrary
) {
    "use strict";

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    /**
     * @constructor
     * @private
     */
    var RecentActivity = UserRecentsBase.extend("sap.ushell.services.RecentActivity", {
        constructor: function (maxItems) {
            UserRecentsBase.call(this, "RecentActivity", maxItems, RecentActivity._compareItems);
        }
    });

    RecentActivity.MAX_DAYS = 30; // Number of days to be considered "recent"
    RecentActivity.ITEM_COUNT = 30; // Number of items to use for the item feed

    /**
     * @typedef UserRecentsItem
     * @property {sap.ushell.AppType} appType
     * @property {string} url
     * @property {string} appId
     */

    /**
     * Compares items a and b for equality.
     * This does not depend on the identical references or content, but on the properties "appType", "url" and "appId".
     *
     * @param {UserRecentsItem} a The first item to be checked.
     * @param {UserRecentsItem} b The second item to be checked.
     * @returns {boolean} True if both items are considered equal, otherwise false.
     * @private
     */
    RecentActivity._compareItems = function (a, b) {
        if (a.appType === b.appType) {
            if (a.appType !== AppType.APP) {
                return a.url === b.url;
            }
            return a.appId === b.appId;
        } else if (a.appType === AppType.APP || b.appType === AppType.APP) {
            return (a.appId === b.appId) && (a.url === b.url);
        }
        return false;
    };

    RecentActivity.prototype._updateIfAlreadyIn = function (oItem, iTimestampNow) {
        return this.oRecentActivities.recentUsageArray.some(function (oRecentEntry) {
            var bFound;
            if (RecentActivity._compareItems(oRecentEntry.oItem, oItem)) {
                /*
                in case both items considered as equal (by _compareItems function),
                we will override the saved item only in case its type is not type 'Application'.

                As the shell always adds user recent entry after every app closed, it might be that a different
                App as 'OVP' for example will also use API to add its app as user-recent entry, and the information
                they provide regarding the item to save is with higher value then the information the shell constructs (icon title etc)
                */
                if ((oItem.appType === oRecentEntry.oItem.appType) ||
                    (oItem.appType !== AppType.APP)) {
                    // override the item
                    extend(oRecentEntry.oItem, oItem);
                    oRecentEntry.iTimestamp = iTimestampNow;
                    oRecentEntry.oItem.timestamp = iTimestampNow;
                    oRecentEntry.mobile = undefined;
                    oRecentEntry.tablet = undefined;
                    oRecentEntry.desktop = undefined;

                    // we update the counter if -
                    // - existing item and new item are of the same type OR
                    // - existing item and new item is not of same type BUT both are not Application
                    if ((oItem.appType === oRecentEntry.oItem.appType) ||
                        (oItem.appType !== AppType.APP && oRecentEntry.oItem.appType !== AppType.APP)) {
                        // update both the usage array's last day and the global entry counter
                        oRecentEntry.aUsageArray[oRecentEntry.aUsageArray.length - 1] += 1;
                        oRecentEntry.iCount += 1;
                    }

                    this.oRecentActivities.recentUsageArray.sort(UserRecentsBase._itemSorter);
                }

                bFound = true;
            } else {
                bFound = false;
            }
            return bFound;
        }.bind(this));
    };

    RecentActivity.prototype._insertNew = function (oItem, iTimestampNow, sIcon) {
        oItem.timestamp = iTimestampNow;
        if (sIcon) {
            oItem.icon = sIcon;
        }
        var oNewEntry = {
            oItem: oItem,
            iTimestamp: iTimestampNow,
            aUsageArray: [1],
            iCount: 1,
            mobile: undefined,
            tablet: undefined,
            desktop: undefined
        };
        if (this.oRecentActivities.recentUsageArray.length === this.iMaxItems) {
            this.oRecentActivities.recentUsageArray.pop();
        }
        this.oRecentActivities.recentUsageArray.unshift(oNewEntry);
    };

    RecentActivity.prototype.newItem = function (oItem) {
        var oDeferred = new jQuery.Deferred();
        var iTimestampNow = Date.now();
        var sIcon = this.getActivityIcon(oItem.appType, oItem.icon);
        var bAlreadyIn;
        var currentDay = this.getDayFromDateObj(new Date());

        this._load()
            .done(function (aLoadedRecents) {
                this.oRecentActivities = this.getRecentActivitiesFromLoadedData(aLoadedRecents);
                // If the current day is different than the recent one -
                // add a new entry (for the current day's usage) to each usage array
                if (currentDay !== this.oRecentActivities.recentDay) {
                    this.addNewDay();
                    this.oRecentActivities.recentDay = currentDay;
                }

                bAlreadyIn = this._updateIfAlreadyIn(oItem, iTimestampNow);
                if (!bAlreadyIn) {
                    this._insertNew(oItem, iTimestampNow, sIcon);
                }

                this._save(this.oRecentActivities)
                    .done(function () {
                        EventHub.emit("newUserRecentsItem", this.oRecentActivities);
                        oDeferred.resolve();
                    }.bind(this))
                    .fail(function () {
                        oDeferred.reject();
                    });
            }.bind(this));

        return oDeferred.promise();
    };

    RecentActivity.prototype.getActivityIcon = function (sAppType, sIcon) {
        switch (sAppType) {
            case AppType.SEARCH:
                return sIcon || "sap-icon://search";
            case AppType.COPILOT:
                return sIcon || "sap-icon://co";
            case AppType.URL:
                return sIcon || "sap-icon://internet-browser";
            default:
                return sIcon || "sap-icon://product";
        }
    };

    RecentActivity.prototype.clearAllActivities = function () {
        var oDeferred = new jQuery.Deferred();

        this._save([])
            .done(function () {
                EventHub.emit("userRecentsCleared", Date.now());
                oDeferred.resolve();
            })
            .fail(function () {
                oDeferred.reject();
            });

        return oDeferred.promise();
    };

    /*
     * getRecentItems return last RecentActivity.ITEM_COUNT activities for current device.
     *   - Check if for the current device we have unresolved entries.
     *   - resolve the unresolved entries and set the attribute according to the current device.
     *   - persist data.
     *   - return the last <maxNumOfActivities> entries or all entries supported by current device (if maxNumOfActivities was not provided).
     */
    RecentActivity.prototype.getRecentItemsHelper = function (maxNumOfActivities) {
        var oDeferred = new jQuery.Deferred();
        var activityIndex;
        var oActivity;
        var sCurrentDevice;
        var bIsResolved = false;
        var aIntentsToResolve = [];
        var aURL = [];
        var currentDay = this.getDayFromDateObj(new Date());

        if (Device.system.desktop) {
            sCurrentDevice = "desktop";
        } else if (Device.system.tablet) {
            sCurrentDevice = "tablet";
        } else {
            sCurrentDevice = "mobile";
        }

        this._load()
            .done(function (aLoadedRecents) {
                this.oRecentActivities = this.getRecentActivitiesFromLoadedData(aLoadedRecents);
                // If the current day is different than the recent one -
                // add a new entry (for the current day's usage) to each usage array
                var bNewDayAdded = false;
                var sMandatoryParams;
                if (currentDay !== this.oRecentActivities.recentDay) {
                    this.addNewDay();
                    this.oRecentActivities.recentDay = currentDay;
                    bNewDayAdded = true;
                }

                //collect all unresolved activities for current device.
                for (activityIndex = 0; activityIndex < this.oRecentActivities.recentUsageArray.length && !bIsResolved; activityIndex++) {
                    oActivity = this.oRecentActivities.recentUsageArray[activityIndex];
                    if (oActivity[sCurrentDevice] === undefined) {
                        // collect URLs without intent
                        if (!(oActivity.oItem.url[0] === "#")) {
                            aURL.push(oActivity.oItem.url);
                            // check if url contains the mandatory parameters then add it to intents
                        } else if (oActivity.oItem.url.indexOf("?") > -1) {
                            sMandatoryParams = oActivity.oItem.url.substring(oActivity.oItem.url.indexOf("?"));
                            // remove search app parameters
                            if (sMandatoryParams.indexOf("&/") > -1) {
                                sMandatoryParams = sMandatoryParams.substring(0, sMandatoryParams.indexOf("&/"));
                            }
                            aIntentsToResolve.push(oActivity.oItem.appId + sMandatoryParams);
                        } else {
                            aIntentsToResolve.push(oActivity.oItem.appId);
                        }
                    } else {
                        //we have resolved the activities from here, no need to continue.
                        bIsResolved = true;
                    }
                }

                // update current device for URLs without intent
                if (aURL.length > 0) {
                    var urlItem;
                    for (activityIndex = 0; activityIndex < this.oRecentActivities.recentUsageArray.length; activityIndex++) {
                        if (!(this.oRecentActivities.recentUsageArray[activityIndex].oItem.url[0] === "#")) {
                            urlItem = this.oRecentActivities.recentUsageArray[activityIndex];
                            urlItem[sCurrentDevice] = true;
                        }
                    }
                    if (aIntentsToResolve.length <= 0) {
                        // persist it.
                        this._save(this.oRecentActivities)
                            .done(function () {
                                var aItems = this._getRecentItemsForDevice(sCurrentDevice, this.oRecentActivities, maxNumOfActivities);

                                oDeferred.resolve(aItems);
                            }.bind(this))
                            .fail(function () {
                                oDeferred.reject();
                            });
                    }
                }

                if (aIntentsToResolve.length > 0) {
                    sap.ushell.Container.getServiceAsync("CrossApplicationNavigation")
                        .then(function (CrossApplicationNavigationService) {
                            //resolve intent support for current device.
                            CrossApplicationNavigationService.isIntentSupported(aIntentsToResolve)
                                .done(function (oResolved) {
                                    //save resolutions in aLoadedRecents
                                    bIsResolved = false;
                                    for (activityIndex = 0; activityIndex < this.oRecentActivities.recentUsageArray.length && !bIsResolved; activityIndex++) {
                                        oActivity = this.oRecentActivities.recentUsageArray[activityIndex];
                                        if (oActivity[sCurrentDevice] === undefined) {
                                            sMandatoryParams = "";
                                            if (oActivity.oItem.url.indexOf("?") > -1) {
                                                sMandatoryParams = oActivity.oItem.url.substring(oActivity.oItem.url.indexOf("?"));
                                                // remove search app parameters
                                                if (sMandatoryParams.indexOf("&/") > -1) {
                                                    sMandatoryParams = sMandatoryParams.substring(0, sMandatoryParams.indexOf("&/"));
                                                }
                                            }
                                            var oItem = oResolved[oActivity.oItem.appId + sMandatoryParams];
                                            oActivity[sCurrentDevice] = !!(oItem && oItem.supported);
                                        } else if (oActivity.oItem.url[0] === "#") {
                                            bIsResolved = true;
                                        }
                                    }

                                    // persist it.
                                    this._save(this.oRecentActivities)
                                        .done(function () {
                                            var aItems = this._getRecentItemsForDevice(sCurrentDevice, this.oRecentActivities, maxNumOfActivities);

                                            oDeferred.resolve(aItems);
                                        }.bind(this))
                                        .fail(function () {
                                            oDeferred.reject();
                                        });
                                }.bind(this))
                                .fail(function (sMsg) {
                                    oDeferred.reject(sMsg);
                                });
                        }.bind(this));
                } else if ((aIntentsToResolve.length <= 0) && (aURL.length <= 0)) {
                    if (bNewDayAdded) {
                        // If a new day was added, persist it.
                        this._save(this.oRecentActivities)
                            .done(function () {
                                var aItems = this._getRecentItemsForDevice(sCurrentDevice, this.oRecentActivities, maxNumOfActivities);

                                oDeferred.resolve(aItems);
                            }.bind(this))
                            .fail(function () {
                                oDeferred.reject();
                            });
                    } else {
                        var aItems = this._getRecentItemsForDevice(sCurrentDevice, this.oRecentActivities, maxNumOfActivities);

                        oDeferred.resolve(aItems);
                    }
                }
            }.bind(this))
            .fail(function () {
                oDeferred.reject();
            });

        return oDeferred.promise();
    };

    RecentActivity.prototype._getRecentItemsForDevice = function (device, recents, maxNumOfActivities) {
        var aRecentItemsForDevice = [];
        var iDeviceDependentActivities = 0;
        var oActivity;

        for (var iRecentActivities = 0;
            iRecentActivities < recents.recentUsageArray.length && (!maxNumOfActivities || iDeviceDependentActivities < maxNumOfActivities);
            iRecentActivities++) {
            oActivity = recents.recentUsageArray[iRecentActivities];

            if (oActivity[device]) {
                aRecentItemsForDevice.push(oActivity);
                iDeviceDependentActivities++;
            }
        }

        return aRecentItemsForDevice;
    };

    RecentActivity.prototype.getRecentItems = function () {
        var oDeferred = new jQuery.Deferred();

        this.getRecentItemsHelper(RecentActivity.ITEM_COUNT)
            .done(function (recentItems) {
                oDeferred.resolve(jQuery.map(recentItems, function (oRecentEntry) {
                    return oRecentEntry.oItem;
                }));
            })
            .fail(function () {
                oDeferred.reject();
            });

        return oDeferred.promise();
    };

    RecentActivity.prototype.getFrequentItems = function () {
        var oDeferred = new jQuery.Deferred();

        this.getRecentItemsHelper()
            .done(function (recentItems) {
                var activityIndex;
                var iWorkingDaysCounter = 0;
                var aFrequentActivity = [];
                var oActivity;
                var previousActivityDate = recentItems[0] ? new Date(recentItems[0].iTimestamp) : undefined;
                var currentActivityDate;
                // Go through the recent activities list and leave only activities from the last MAX_DAYS working days
                for (activityIndex = 0; activityIndex < recentItems.length && iWorkingDaysCounter < RecentActivity.MAX_DAYS; activityIndex++) {
                    oActivity = recentItems[activityIndex];
                    // Add only activities that happened more than once
                    if (oActivity.iCount > 1) {
                        aFrequentActivity.push(oActivity);
                    }
                    currentActivityDate = new Date(oActivity.iTimestamp);
                    if (previousActivityDate.toDateString() !== currentActivityDate.toDateString()) {
                        // If found an activity with a different date than the previous one, increase the days counter
                        iWorkingDaysCounter++;
                        previousActivityDate = currentActivityDate;
                    }
                }
                // Sort in descending order according to the count
                aFrequentActivity.sort(function (a, b) {
                    return b.iCount - a.iCount;
                });
                // Take only first items (ITEM_COUNT most frequent items)
                aFrequentActivity = aFrequentActivity.slice(0, RecentActivity.ITEM_COUNT);
                oDeferred.resolve(jQuery.map(aFrequentActivity, function (oRecentEntry) {
                    return oRecentEntry.oItem;
                }));
            })
            .fail(function () {
                oDeferred.reject();
            });

        return oDeferred.promise();
    };

    RecentActivity.prototype.addNewDay = function () {
        var aCurrentActivityArray;
        for (var activityIndex = 0; activityIndex < this.oRecentActivities.recentUsageArray.length; activityIndex++) {
            // Get the array of app usage
            if (this.oRecentActivities.recentUsageArray[activityIndex].aUsageArray) {
                aCurrentActivityArray = this.oRecentActivities.recentUsageArray[activityIndex].aUsageArray;
            } else {
                // If no array exists, add an empty array and also set iCount to 0
                aCurrentActivityArray = [];
                this.oRecentActivities.recentUsageArray[activityIndex].aUsageArray = aCurrentActivityArray;
                this.oRecentActivities.recentUsageArray[activityIndex].iCount = 0;
            }

            // Add an item in the Array for the new day
            aCurrentActivityArray[aCurrentActivityArray.length] = 0;

            // If the array size is > iMaximumDays, remove the first (oldest) entry and update the count accordingly
            if (aCurrentActivityArray.length > RecentActivity.MAX_DAYS) {
                this.oRecentActivities.recentUsageArray[activityIndex].iCount -= aCurrentActivityArray[0];
                aCurrentActivityArray.shift();
            }
        }
    };

    RecentActivity.prototype.getDayFromDateObj = function (dateObj) {
        return (dateObj.getUTCFullYear() + "/" + (dateObj.getUTCMonth() + 1) + "/" + dateObj.getUTCDate());
    };

    RecentActivity.prototype.getRecentActivitiesFromLoadedData = function (loadedRecents) {
        var recentActivities;
        if (Array.isArray(loadedRecents)) {
            recentActivities = {
                recentDay: null,
                recentUsageArray: loadedRecents
            };
        } else {
            recentActivities = loadedRecents || {
                recentDay: null,
                recentUsageArray: []
            };
        }

        // Validate entries
        recentActivities.recentUsageArray = (recentActivities.recentUsageArray || []).filter(function (oActivity) {
            var bIsValid = oActivity && oActivity.oItem && oActivity.oItem.url;
            if (!bIsValid) {
                Log.error("FLP Recent Activity", oActivity, "is not valid. The activity is removed from the list.");
            }
            return bIsValid;
        });

        return recentActivities;
    };

    return RecentActivity;
});
