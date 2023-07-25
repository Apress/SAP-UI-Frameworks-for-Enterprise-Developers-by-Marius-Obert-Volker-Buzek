// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/StandardListItem",
    "sap/m/SelectDialog",
    "sap/ui/core/Component"
], function (
    Controller,
    Log,
    jQuery,
    FilterOperator,
    Filter,
    StandardListItem,
    SelectDialog,
    Component
) {
    "use strict";

    return Controller.extend("sap.ushell.components.appfinder.HierarchyFolders", {
        onInit: function () {
            this.oDialog = null;
            this.getView().setModel(this.getView().getViewData().easyAccessSystemsModel, "easyAccessSystems");
            this.getView().setModel(this.getView().getViewData().subHeaderModel, "subHeaderModel");
            this.getSelectedSystem().then(function (oSystem) {
                if (oSystem) {
                    this.setSystemSelected(oSystem);
                } else {
                    this.setSystemSelected(undefined);
                    // if no system selected -> 'select system' dialog will automatically appear
                    this.onSystemSelectionPress();
                }
            }.bind(this), function () {
                this.setSystemSelected(undefined);
                this.onSystemSelectionPress();
            });
        },

        onExit: function () {
            if (this.oDialog) {
                this.destroyDialog();
            }
        },

        onAfterRendering: function () {
            /*
             * making sure that on every click anywhere on the left panel which is basically
             * the hierarchy-folders view (this view), we invoke exit search mode (if necessary)
             */
            var jqThis = jQuery("#" + this.getView().getId());
            jqThis.on("click", function (/*event*/) {
                this.exitSearchMode();
            }.bind(this));
        },

        getPersonalizer: function () {
            if (!this.oPersonalizerPromise) {
                this.oPersonalizerPromise = sap.ushell.Container.getServiceAsync("Personalization")
                    .then(function (oPersonalizationService) {
                        var oComponent = Component.getOwnerComponentFor(this),
                        oScope = {
                            keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
                            writeFrequency: oPersonalizationService.constants.writeFrequency.LOW,
                            clientStorageAllowed: true
                        },
                        oPersId = {
                            container: "appfinder.HierarchyFolders",
                            item: "lastSelectedSystem"
                        };

                        return oPersonalizationService.getPersonalizer(oPersId, oScope, oComponent);
                    }.bind(this));
            }

            return this.oPersonalizerPromise;
        },

        /**
         * get the selected system
         * if only one system available - it be automatically selected
         * if user has defined a system, and it in the list of available systems it will be selected
         * Note: this function does not set anything in the persistence layer.
         * @See {this.setSystemSelected}
         * @return {Promise} with the selected system object
         */
        getSelectedSystem: function () {
            var oDeferred = new jQuery.Deferred(),
                aSystemsList = this.getView().getModel("easyAccessSystems").getProperty("/systemsList");

            //if there is only one system -> this system is selected
            if (aSystemsList && aSystemsList.length && aSystemsList.length === 1) {
                var oEasyAccessSystemSelected = aSystemsList[0];
                this.setSystemSelectedInPersonalization(oEasyAccessSystemSelected);
                oDeferred.resolve(oEasyAccessSystemSelected);
            } else {
                this.getSelectedSystemInPersonalization().then(function (persSystemSelected) {
                    if (persSystemSelected) {
                        //if there is a system in the personalization-> need to check if the system exists in the system list
                        var bSystemInList = false;
                        for (var i = 0; i < aSystemsList.length; i++) {
                            if ((aSystemsList[i].systemName && aSystemsList[i].systemName === persSystemSelected.systemName) ||
                                (aSystemsList[i].systemId === persSystemSelected.systemId)) {
                                bSystemInList = true;
                                oDeferred.resolve(persSystemSelected);
                            }
                        }
                        // if personalized system not part of the system list
                        if (!bSystemInList) {
                            oDeferred.resolve();
                            // remove this system from the personalization
                            this.setSystemSelectedInPersonalization();
                        }
                    } else {
                        oDeferred.resolve();
                    }
                }.bind(this));
            }
            return oDeferred.promise();
        },

        setSystemSelected: function (oSystem) {
            this.getView().getModel("easyAccessSystems").setProperty("/systemSelected", oSystem);
            this.setSystemSelectedInPersonalization(oSystem);
        },

        getSelectedSystemInPersonalization: function () {
            var oDeferred = new jQuery.Deferred();

            this.getPersonalizer().then(function (oPersonalizer) {
                oPersonalizer.getPersData().then(function (persSystemSelected) {
                    if (persSystemSelected) {
                        oDeferred.resolve(persSystemSelected);
                    } else {
                        oDeferred.resolve();
                    }
                }, function (error) {
                    Log.error(
                        "Failed to get selected system from the personalization",
                        error,
                        "sap.ushell.components.appfinder.HierarchyFolders"
                    );
                    oDeferred.reject();
                });

            });
            return oDeferred.promise();
        },

        setSystemSelectedInPersonalization: function (oSystem) {
            this.getPersonalizer().then(function (oPersonalizer) {
                oPersonalizer.setPersData(oSystem).fail(function (error) {
                    Log.error(
                        "Failed to save selected system in the personalization",
                        error,
                        "sap.ushell.components.appfinder.HierarchyFolders"
                    );
                });
            });
        },

        onSystemSelectionPress: function () {
            var systemsList = this.getView().getModel("easyAccessSystems").getProperty("/systemsList");
            if (systemsList && systemsList.length && systemsList.length <= 1) {
                return;
            }

            var oDialog = this.createDialog();
            oDialog.open();
        },

        createDialog: function () {
            var that = this;

            if (!this.oDialog) {
                this.oDialog = new SelectDialog({
                    id: "systemSelectionDialog",
                    title: that.getView().translationBundle.getText("easyAccessSelectSystemDialogTitle"),
                    multiSelect: false,
                    contentHeight: "20rem",
                    items: {
                        path: "/systemsList",
                        template: new StandardListItem({
                            adaptTitleSize: false,
                            title: {
                                parts: ["systemName", "systemId"],
                                formatter: that.titleFormatter
                            },
                            description: {
                                parts: ["systemName", "systemId"],
                                formatter: that.descriptionFormatter
                            },
                            selected: {
                                parts: ["systemName", "systemId"],
                                formatter: that.selectedFormatter.bind(this)
                            }
                        })
                    },
                    confirm: that.systemConfirmHandler.bind(that),
                    search: that.systemSearchHandler.bind(that),
                    cancel: that.destroyDialog.bind(that)
                });
                this.oDialog.setModel(this.getView().getModel("easyAccessSystems"));
            }

            return this.oDialog;
        },

        destroyDialog: function () {
            this.oDialog.destroyItems();
            this.oDialog.destroy();
            this.oDialog = null;
        },

        systemConfirmHandler: function (oEvent) {
            var oItem = oEvent.getParameters().selectedItem,
                oSystem = oItem.getBindingContext().getObject();
            this.setSystemSelected(oSystem);
            this.destroyDialog();
        },

        //implement the search functionality in the system selector dialog
        systemSearchHandler: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
                oFilterName = new Filter("systemName", FilterOperator.Contains, sValue),
                oFilterId = new Filter("systemId", FilterOperator.Contains, sValue),
                oSystemSelectorDialogFilter = new Filter({
                    filters: [oFilterId, oFilterName],
                    and: false
                }),
                oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oSystemSelectorDialogFilter);
        },

        titleFormatter: function (systemName, systemId) {
            return systemName || systemId;
        },

        descriptionFormatter: function (systemName, systemId) {
            if (systemName) {
                return systemId;
            }
            return null;
        },

        selectedFormatter: function (systemName, systemId) {
            var userSystemSelected = this.getView().getModel("easyAccessSystems").getProperty("/systemSelected");
            if (!userSystemSelected) {
                return false;
            }
            if (systemName) {
                return (userSystemSelected.systemName === systemName && userSystemSelected.systemId === systemId);
            }
            return (userSystemSelected.systemId === systemId);
        },

        systemSelectorTextFormatter: function (systemSelected) {
            if (systemSelected) {
                if (systemSelected.systemName) {
                    return systemSelected.systemName;
                }
                return systemSelected.systemId;

            }
            return this.getView().translationBundle.getText("easyAccessSelectSystemTextWithoutSystem");
        },

        exitSearchMode: function () {
            var oSubHeaderModel = this.getView().getModel("subHeaderModel");
            oSubHeaderModel.setProperty("/search/searchMode", false);
            oSubHeaderModel.refresh(true);
        }
    });
}, /* bExport= */ true);
