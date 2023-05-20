//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview ActionMode for the PageRuntime view
 *
 * @version 1.113.0
 */

sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/Device",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ushell/resources",
    "sap/ushell/EventHub",
    "sap/base/Log"
], function (coreLibrary, Device, MessageBox, MessageToast, resources, EventHub, Log) {
    "use strict";

    var ActionMode = {};

    /**
     * Initialization of the action mode for the pages runtime
     *
     * @param {sap.ui.core.mvc.Controller} oController Controller of the pages runtime
     * @param {string} sActionModeButtonText Optional text for exit edit mode
     *
     * @private
     * @since 1.74.0
     */
    ActionMode.start = function (oController, sActionModeButtonText) {
        this.oController = oController;
        var oViewSettingsModel = oController.getView().getModel("viewSettings");
        var bAddToMyHomeOnly = oViewSettingsModel.getProperty("/addToMyHomeOnly");
        if (!bAddToMyHomeOnly) {
            oController.getView().getModel("viewSettings").setProperty("/actionModeEditActive", true);
        }
        oController.getView().getModel("viewSettings").setProperty("/actionModeActive", true);
        oController.handleMyHomeActionMode(true).catch(oController._onError.bind(oController));

        EventHub.emit("enableMenuBarNavigation", false);

        var oActionModeButton = sap.ui.getCore().byId("ActionModeBtn");
        this.sActionButtonActivateText = oActionModeButton.getText();

        sActionModeButtonText = sActionModeButtonText || resources.i18n.getText("PageRuntime.EditMode.Exit");
        oActionModeButton.setTooltip(sActionModeButtonText);
        oActionModeButton.setText(sActionModeButtonText);

        if (Device.system.desktop) {
            sap.ui.require(["sap/ushell/renderers/fiori2/AccessKeysHandler"], function (AccessKeysHandler) {
                AccessKeysHandler.attachEvent("editModeDone", this.save, this);
            }.bind(this));
        }
    };

    /**
     * Handler for action mode cancel
     *
     * @private
     * @since 1.74.0
     */
    ActionMode.cancel = function () {
        this._cleanup();
    };

    /**
     * Handler for action mode save
     *
     * @private
     * @since 1.74.0
     */
    ActionMode.save = function () {
        Log.info("store actions in pages service");
        this._cleanup();
    };

    /**
     * Disables the action mode and enables the navigation
     *
     * @private
     * @since 1.74.0
     */
    ActionMode._cleanup = function () {
        this.oController.getView().getModel("viewSettings").setProperty("/actionModeActive", false);
        this.oController.getView().getModel("viewSettings").setProperty("/actionModeEditActive", false);
        this.oController.handleMyHomeActionMode(false).catch(this.oController._onError.bind(this.oController));
        EventHub.emit("enableMenuBarNavigation", true);

        var oActionModeButton = sap.ui.getCore().byId("ActionModeBtn");
        oActionModeButton.setTooltip(this.sActionButtonActivateText);
        oActionModeButton.setText(this.sActionButtonActivateText);

        if (Device.system.desktop) {
            sap.ui.require(["sap/ushell/renderers/fiori2/AccessKeysHandler"], function (AccessKeysHandler) {
                AccessKeysHandler.detachEvent("editModeDone", this.save, this);
            }.bind(this));
        }
    };

    /**
     * Handler for add visualization
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.addVisualization = function (oEvent, oSource) {
        var oModel = oSource.getBindingContext().getModel();
        var sPath = oSource.getBindingContext().getPath();
        var aPathParts = sPath.split("/");
        var iPageIndex = parseInt(aPathParts[2], 10);

        var sPageId = oModel.getProperty("/pages/" + iPageIndex + "/id");
        var sSectionId = oModel.getProperty(sPath + "/id");

        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavigator) {
            var sShellHash = "Shell-appfinder?&/catalog/" + JSON.stringify({
                pageID: encodeURIComponent(sPageId),
                sectionID: encodeURIComponent(sSectionId)
            });
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: sShellHash
                }
            });
        });

    };

    /**
     * Handler for add section
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     * @param {object} oParameters Event parameters
     *
     * @returns {Promise<void>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.addSection = function (oEvent, oSource, oParameters) {
        var iSectionIndex = oParameters.index;

        var sPath = oSource.getBindingContext().getPath();
        // ["","pages","2"]
        var aPathParts = sPath.split("/");
        var iPageIndex = parseInt(aPathParts[2], 10);

        return this.oController.getOwnerComponent().getPagesService().then(function (oPagesService) {
            oPagesService.addSection(iPageIndex, iSectionIndex);

            var oDelegate = {
                onAfterRendering: function () {
                    setTimeout(function () {
                        oSource.getSections()[iSectionIndex].byId("title-edit").focus();
                    }, 0);
                    oSource.removeEventDelegate(oDelegate);
                }
            };
            oSource.addEventDelegate(oDelegate);
        });
    };

    /**
     * Handler for delete section
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     *
     * @returns {Promise<void>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.deleteSection = function (oEvent, oSource) {
        return sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
            var sTitle = oSource.getTitle();
            var sMsg = sTitle
                ? resources.i18n.getText("PageRuntime.Message.Section.Delete", sTitle)
                : resources.i18n.getText("PageRuntime.Message.Section.DeleteNoTitle");
            var sMsgTitle = resources.i18n.getText("PageRuntime.Dialog.Title.Delete");

            function fnCallBack (oAction) {
                if (oAction === MessageBox.Action.DELETE) {
                    this.oController.getOwnerComponent().getPagesService().then(function (oPagesService) {
                        var sPath = oSource.getBindingContext().getPath(),
                            oPage = oSource.getParent(),
                            // ["","pages","0","sections","1"]
                            aPathParts = sPath.split("/"),
                            iPageIndex = parseInt(aPathParts[2], 10),
                            iSectionIndex = parseInt(aPathParts[4], 10);

                        oPagesService.deleteSection(iPageIndex, iSectionIndex);

                        MessageToast.show(resources.i18n.getText("PageRuntime.Message.SectionDeleted"));

                        var aPageSections = oPage.getSections();

                        if (aPageSections.length) {
                            var oSection = aPageSections[iSectionIndex !== 0 ? iSectionIndex - 1 : iSectionIndex];
                            oSection.focus();

                            var oSectionDelegate = {
                                onAfterRendering: function () {
                                    oSection.focus();
                                    oSection.removeEventDelegate(oSectionDelegate);
                                }
                            };
                            oSection.addEventDelegate(oSectionDelegate);
                        } else {
                            var oPageDelegate = {
                                onAfterRendering: function () {
                                    oPage.focus();
                                    oPage.removeEventDelegate(oPageDelegate);
                                }
                            };
                            oPage.addEventDelegate(oPageDelegate);
                        }
                    });
                }
            }

            oMessageService.confirm(sMsg, fnCallBack.bind(this), sMsgTitle, [MessageBox.Action.DELETE, MessageBox.Action.CANCEL]);
        }.bind(this));
    };

    /**
     * Handler for reset section
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSection Source control
     *
     * @returns {Promise<void>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.resetSection = function (oEvent, oSection) {
        var sPath = oSection.getBindingContext().getPath();

        // ["","pages","0","sections","1"]
        var aPathParts = sPath.split("/");
        var iPageIndex = parseInt(aPathParts[2], 10);
        var iSectionIndex = parseInt(aPathParts[4], 10);

        return this.oController.getOwnerComponent().getPagesService().then(function (oPagesService) {
            oPagesService.resetSection(iPageIndex, iSectionIndex);
            MessageToast.show(resources.i18n.getText("PageRuntime.Message.SectionReset"));
        });
    };

    /**
     * Handler for change section title
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     * @param {object} oParameters Event parameters
     *
     * @returns {Promise<void>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.changeSectionTitle = function (oEvent, oSource, oParameters) {
        var sPath = oSource.getBindingContext().getPath();
        var sNewTitle = oSource.getProperty("title");

        // ["","pages","0","sections","1"]
        var aPathParts = sPath.split("/");
        var iPageIndex = parseInt(aPathParts[2], 10);
        var iSectionIndex = parseInt(aPathParts[4], 10);

        return this.oController.getOwnerComponent().getPagesService().then(function (oPagesService) {
            oPagesService.renameSection(iPageIndex, iSectionIndex, sNewTitle);
        });
    };

    /**
     * Handler for section drag and drop
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     * @param {object} oParameters Event parameters
     *
     * @returns {Promise<void>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.moveSection = function (oEvent, oSource, oParameters) {
        var sSourcePath = oParameters.draggedControl.getBindingContext().getPath();
        var sTargetPath = oParameters.droppedControl.getBindingContext().getPath();
        var sDropPosition = oParameters.dropPosition;

        var aTargetPathParts = sTargetPath.split("/");
        var aSourcePathParts = sSourcePath.split("/");

        var iPageIndex = parseInt(aSourcePathParts[2], 10);
        var iSourceSectionIndex = parseInt(aSourcePathParts[4], 10);
        var iTargetSectionIndex = parseInt(aTargetPathParts[4], 10);


        if ((iSourceSectionIndex === iTargetSectionIndex - 1) && (sDropPosition === "Before") ||
            (iSourceSectionIndex === iTargetSectionIndex + 1) && (sDropPosition === "After")) {
            return Promise.resolve();
        }

        // Needed, to not pass the drop position to the service.
        if (sDropPosition === "After") {
            iTargetSectionIndex = iTargetSectionIndex + 1;
        }

        var oComponent = this.oController.getOwnerComponent();
        return oComponent.getPagesService()
            .then(function (oPagesService) {
                return oPagesService.moveSection(iPageIndex, iSourceSectionIndex, iTargetSectionIndex);
            })
            .then(function () {
                oSource.announceMove();
            });
    };

    /**
     * Handler for hide and reveal section
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     * @param {object} oParameters Event parameters
     *
     * @returns {Promise<void>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.changeSectionVisibility = function (oEvent, oSource, oParameters) {
        if (this.oController === undefined || oParameters.visible === undefined) {
            return Promise.resolve();
        }

        var sPath = oSource.getBindingContext().getPath();
        var bVisibility = oParameters.visible;

        // ["","pages","0","sections","1"]
        var aPathParts = sPath.split("/");
        var iPageIndex = parseInt(aPathParts[2], 10);
        var iSectionIndex = parseInt(aPathParts[4], 10);

        return this.oController.getOwnerComponent().getPagesService().then(function (oPagesService) {
            oPagesService.setSectionVisibility(iPageIndex, iSectionIndex, bVisibility);
        });
    };

    return ActionMode;
});
