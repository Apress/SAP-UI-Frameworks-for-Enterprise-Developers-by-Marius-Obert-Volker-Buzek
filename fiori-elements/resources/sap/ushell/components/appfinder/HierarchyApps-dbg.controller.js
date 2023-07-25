// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/CatalogsManager",
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/library",
    "sap/m/MessageToast",
    "sap/ushell/resources"
], function (
    View,
    Controller,
    CatalogsManager,
    jQuery,
    coreLibrary,
    MessageToast,
    resources
) {
    "use strict";

    /* global hasher */

    return Controller.extend("sap.ushell.components.appfinder.HierarchyApps", {

        onInit: function () {
            var easyAccessSystemsModel = this.getView().getViewData().easyAccessSystemsModel;
            if (easyAccessSystemsModel) {
                this.getView().setModel(easyAccessSystemsModel, "easyAccessSystems");
            }
        },

        getCrumbsData: function (path, mainModel) {
            var pathChunks = path.split("/");
            pathChunks.splice(pathChunks.length - 2, 2);
            var newCrumbs = [];
            while (pathChunks.length) {
                var sPath = pathChunks.join("/");
                var text = mainModel.getProperty(sPath + "/text");
                newCrumbs.unshift({ text: text, path: sPath });
                pathChunks.splice(pathChunks.length - 2, 2);
            }
            return newCrumbs;
        },

        _updateAppBoxedWithPinStatuses: function (path) {
            var oView = this.getView();
            if (!path) {
                path = oView.layout.getBinding("items").getPath();
            }
            var easyAccessModel = oView.getModel("easyAccess");
            var appsData = easyAccessModel.getProperty(path) ? easyAccessModel.getProperty(path) : [];

           this.getView().oVisualizationOrganizerHelper.updateBookmarkCount.call(this, appsData)
                .then(function (updatedAppsData) {
                    easyAccessModel.setProperty(path, updatedAppsData);
                });
        },

        updateBookmarkCount: function (appsData) {
            return sap.ushell.Container.getServiceAsync("Bookmark")
                .then(function (BookmarkService) {
                    var countPromiseList = appsData.map(function (appData) {
                        return BookmarkService.countBookmarks(appData.url).then(function (count) {
                            appData.bookmarkCount = count;
                            return appData;
                        });
                    });
                    return new Promise(function (fnResolve) {
                        jQuery.when.apply(jQuery, countPromiseList).then(function () {
                            var aUpdatedAppsData = Array.prototype.slice.call(arguments);
                            fnResolve(aUpdatedAppsData);
                        });
                    });
                });
        },

        updatePageBindings: function (path) {
            this.getView().layout.bindAggregation("items", "easyAccess>" + path + "/apps", this.getView().oItemTemplate);
            this._updateAppBoxedWithPinStatuses(path + "/apps");
            this.getView().breadcrumbs.bindProperty("currentLocationText", "easyAccess>" + path + "/text");
            var crumbsData = this.getCrumbsData(path, this.getView().getModel("easyAccess"));
            this.getView().crumbsModel.setProperty("/crumbs", crumbsData);

            // when navigation in hierarchy folders had occureed and model had been updated
            // in case no results found we hide the app-boxes layout and display a message page with relevant message
            var aNewItems = this.getView().getModel("easyAccess").getProperty(path + "/apps");

            // call to update message with length of the items, and false indicating this is not searcg results
            this.getView().updateResultSetMessage(aNewItems.length, false);
        },

        onAppBoxPressed: function (oEvent) {
            if (oEvent.mParameters.srcControl.$().closest(".sapUshellPinButton").length) {
                return;
            }
            var sUrl = oEvent.getSource().getProperty("url");
            if (sUrl && sUrl.indexOf("#") === 0) {
                hasher.setHash(sUrl);
            }
        },

        _handleSuccessMessage: function (app, popoverResponse) {
            var message;
            var numberOfExistingGroups = popoverResponse.addToGroups ? popoverResponse.addToGroups.length : 0;
            var numberOfNewGroups = popoverResponse.newGroups ? popoverResponse.newGroups.length : 0;
            var totalNumberOfGroups = numberOfExistingGroups + numberOfNewGroups;

            if (totalNumberOfGroups === 1) {
                // determine the group's title
                var groupName;
                if (numberOfExistingGroups === 1) {
                    // for an existing group we have an object in the array items
                    groupName = popoverResponse.addToGroups[0].title;
                } else {
                    // for a new group, we have the title in the array items
                    groupName = popoverResponse.newGroups[0];
                }
                message = resources.i18n.getText("appAddedToSingleGroup", [app.text, groupName]);
            } else {
                message = resources.i18n.getText("appAddedToSeveralGroups", [app.text, totalNumberOfGroups]);
            }

            if (totalNumberOfGroups > 0) {
                MessageToast.show(message, {
                    duration: 3000, // default
                    width: "15em",
                    my: "center bottom",
                    at: "center bottom",
                    of: window,
                    offset: "0 -50",
                    collision: "fit fit"
                });
            }
            return message;
        },

        _prepareErrorMessage: function (aErroneousActions, sAppTitle) {
            var group,
                sAction,
                sFirstErroneousAddGroup,
                iNumberOfFailAddActions = 0,
                bCreateNewGroupFailed = false,
                message;

            for (var index in aErroneousActions) {
                // Get the data of the error (i.e. action name and group object).
                // the group's value:
                //   in case the group is an existing group we will have an object
                //   in case the group is a new group we will have a title instead of an object
                group = aErroneousActions[index].group;
                sAction = aErroneousActions[index].action;

                if (sAction === "addBookmark_ToExistingGroup") {
                    // add bookmark to EXISTING group failed
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions === 1) {
                        sFirstErroneousAddGroup = group.title;
                    }
                } else if (sAction === "addBookmark_ToNewGroup") {
                    // add bookmark to a NEW group failed
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions === 1) {

                        //in case of a new group we have the title and not an object
                        sFirstErroneousAddGroup = group;
                    }
                } else {
                    // sAction is "addBookmark_NewGroupCreation"
                    // e.g. new group creation failed
                    bCreateNewGroupFailed = true;
                }
            }

            // First - Handle bCreateNewGroupFailed
            if (bCreateNewGroupFailed) {
                if (aErroneousActions.length === 1) {
                    message = resources.i18n.getText({ messageId: "fail_tile_operation_create_new_group" });
                } else {
                    message = resources.i18n.getText({ messageId: "fail_tile_operation_some_actions" });
                }
                // Single error - it can be either one add action or one remove action
            } else if (aErroneousActions.length === 1) {
                message = resources.i18n.getText({ messageId: "fail_app_operation_add_to_group", parameters: [sAppTitle, sFirstErroneousAddGroup] });
            } else {
                message = resources.i18n.getText({ messageId: "fail_app_operation_add_to_several_groups", parameters: [sAppTitle] });
            }
            return message;
        },

        _handleBookmarkAppPopoverResponse: function (app, popoverResponse) {
            var addBookmarksPromiseList = [];

            popoverResponse.newGroups.forEach(function (group) {
                addBookmarksPromiseList.push(this._createGroupAndAddBookmark(group, app));
            }.bind(this));

            popoverResponse.addToGroups.forEach(function (group) {
                addBookmarksPromiseList.push(this._addBookmark(group, app));
            }.bind(this));

            return jQuery.when.apply(jQuery, addBookmarksPromiseList).then(function () {
                var resultList = Array.prototype.slice.call(arguments);
                this._handlePopoverGroupsActionPromises(app, popoverResponse, resultList);
            }.bind(this));
        },

        _handlePopoverGroupsActionPromises: function (app, popoverResponse, resultList) {
            var errorList = resultList.filter(function (result, index, resultList) {
                return !result.status;
            });
            if (errorList.length) {
                var oErrorMessageObj = this._prepareErrorMessage(errorList, app.text);
                var catalogsMgr = CatalogsManager.prototype.getInstance();
                catalogsMgr.notifyOnActionFailure(oErrorMessageObj.messageId, oErrorMessageObj.parameters);
                return;
            }

            this._updateAppBoxedWithPinStatuses();

            this._handleSuccessMessage(app, popoverResponse);
        },

        _createGroupAndAddBookmark: function (newGroup, app) {
            var catalogsdMgr = CatalogsManager.prototype.getInstance();
            var deferred = jQuery.Deferred(), oResponseData = {};

            var newGroupPromise = catalogsdMgr.createGroup(newGroup);
            newGroupPromise.done(function (newGroupContext) {

                var addBookmarkPromise = this._addBookmark(newGroupContext.getObject(), app, true);
                addBookmarkPromise.done(function (data) {
                    deferred.resolve(data);
                }).fail(function () {
                    oResponseData = { group: newGroup, status: 0, action: "addBookmark_ToNewGroup" }; // 0 - failure
                    deferred.resolve(oResponseData);
                });

            }.bind(this)).fail(function () {
                oResponseData = { group: newGroup, status: 0, action: "addBookmark_NewGroupCreation" }; // 0 - failure
                deferred.resolve(oResponseData);
            });

            return deferred.promise();
        },

        _addBookmark: function (group, app, isNewGroup) {
            var deferred = jQuery.Deferred(),
                oResponseData = {};

            sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                var addBookmarkPromise = oBookmarkService.addBookmark({
                    url: app.url,
                    title: app.text,
                    subtitle: app.subtitle,
                    icon: app.icon
                }, group.object);

                var action = isNewGroup ? "addBookmark_ToNewGroup" : "addBookmark_ToExistingGroup";

                addBookmarkPromise.done(function () {
                    oResponseData = { group: group, status: 1, action: action }; // 1 - success
                    deferred.resolve(oResponseData);
                }).fail(function () {
                    oResponseData = { group: group, status: 0, action: action }; // 0 - failure
                    deferred.resolve(oResponseData);
                });
            });

            return deferred.promise();
        },

        showSaveAppPopover: function (oEvent) {
            this.getView().oVisualizationOrganizerHelper.onHierarchyAppsPinButtonClick.call(this, oEvent)
                .then(function (bUpdatePinStatus) {
                    if (bUpdatePinStatus) {
                        this._updateAppBoxedWithPinStatuses();
                    }
                }.bind(this));
        },

        showGroupListPopover: function (event) {
            var oModel = this.getView().getModel();
            var app = event.oSource.getParent().getBinding("title").getContext().getObject();
            var SourceControl = event.oSource;

            // if we in context of some dashboard group, no need to open popup
            if (oModel.getProperty("/groupContext").path) {
                var groupPath = oModel.getProperty("/groupContext").path;
                var oGroup = oModel.getProperty(groupPath);
                var customResponse = {
                    newGroups: [],
                    addToGroups: [oGroup]
                };
                this._handleBookmarkAppPopoverResponse(app, customResponse);
                return;
            }

            var groupData = oModel.getProperty("/groups").map(function (group) {
                return {
                    selected: false,
                    initiallySelected: false,
                    oGroup: group
                };
            });

            View.create({
                viewName: "module:sap/ushell/components/appfinder/GroupListPopoverView",
                viewData: {
                    enableHideGroups: oModel.getProperty("/enableHideGroups"),
                    enableHelp: oModel.getProperty("/enableHelp"),
                    singleGroupSelection: true
                }
            }).then(function (GroupListPopoverView) {
                GroupListPopoverView.getController().initializeData({
                    groupData: groupData
                });
                var popoverPromise = GroupListPopoverView.open(SourceControl);
                popoverPromise.then(this._handleBookmarkAppPopoverResponse.bind(this, app));
                this.getView().addDependent(GroupListPopoverView);
                return GroupListPopoverView;
            }.bind(this));
        },

        resultTextFormatter: function (oSystemSelected, iTotal) {
            var oResourceBundle = resources.i18n;
            if (oSystemSelected) {
                var sSystem = oSystemSelected.systemName ? oSystemSelected.systemName : oSystemSelected.systemId;
                var sResultText = "";
                if (iTotal) {
                    sResultText = oResourceBundle.getText("search_easy_access_results", [iTotal, sSystem]);
                }

                return sResultText;
            }
            return "";
        },

        showMoreResultsVisibilityFormatter: function (apps, total) {
            if (apps && apps.length < total) {
                return true;
            }
            return false;
        },

        showMoreResultsTextFormatter: function (apps, total) {
            if (!apps || !total) {
                return "";
            }
            var currentlyNumOfApps = apps.length;
            return resources.i18n.getText("EasyAccessSearchResults_ShowMoreResults", [currentlyNumOfApps, total]);
        }
    });
}, /* bExport= */ true);
