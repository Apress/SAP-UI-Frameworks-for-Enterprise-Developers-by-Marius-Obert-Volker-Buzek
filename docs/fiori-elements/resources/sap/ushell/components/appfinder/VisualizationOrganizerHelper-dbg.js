// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/library",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources"
], function (mobileLibrary, Config, EventHub, resources) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    var oInstance;

    /**
     * Helper function to get the "catalogView" of the AppFinder.
     *
     * @returns {sap.ui.core.mvc.View|undefined} The "catalogView" of the AppFinder or "undefined" if the view was not found.
     */
    function getCatalogView () {
        return sap.ui.getCore().byId("catalogView");
    }
    /**
     * Helper function to get the "appFinderView".
     *
     * @returns {sap.ui.core.mvc.View|undefined} The "appFinderView" or "undefined" if the view was not found.
     */
    function getAppFinderView () {
        return sap.ui.getCore().byId("appFinderView");
    }

    /**
     * VisualizationOrganizerHelper constructor.
     *
     * @constructor
     * @protected
     */
    function VisualizationOrganizerHelper () {
        var oVisualizationOrganizer,
            oVisualizationOrganizerPromise,
            oSectionContext = null;

        /**
         * Helper function to check whether "Spaces" setting is enabled or not.
         *
         * @returns {boolean} Whether "Spaces" setting is enabled (true) or not (false).
         */
        function isSpacesEnabled () {
            return Config.last("/core/spaces/enabled");
        }

        /**
         * Returns a promise that resolves to the VisualizationOrganizer.
         * If the VisualizationOrganizer was already loaded before, then it resolves to that same instance.
         *
         * @returns {Promise<sap.ushell.components.visualizationOrganizer.Component>} Resolves to the VisualizationOrganizer.
         * @see sap.ushell.components.visualizationOrganizer.Component
         */
        function loadVisualizationOrganizer () {
            if (oVisualizationOrganizer) {
                return Promise.resolve(oVisualizationOrganizer);
            }
            oVisualizationOrganizerPromise = oVisualizationOrganizerPromise || new Promise(function (resolve) {
                sap.ui.require(["sap/ushell/components/visualizationOrganizer/Component"], function (VisualizationOrganizer) {
                    oVisualizationOrganizer = new VisualizationOrganizer();
                    resolve(oVisualizationOrganizer);
                });
            });
            return oVisualizationOrganizerPromise;
        }

        function loadVisualizationOrganizerAndUpdateBindings () {
            var oCatalogView = getCatalogView();
            if (!oCatalogView) {
                return;
            }
            oCatalogView.setBusy(true);
            return loadVisualizationOrganizer()
                .then(function (visualizationOrganizer) {
                    return visualizationOrganizer.requestData();
                })
                .then(function () {
                    if (this.oModel) {
                        this.oModel.updateBindings(true);
                    }
                    var oAppFinderView = getAppFinderView();
                    if (oAppFinderView && oVisualizationOrganizer.getPersonalizablePages().length === 1) {
                        var sTitle = resources.i18n.getText("VisualizationOrganizer.PageContextTitle", oVisualizationOrganizer.getPersonalizablePages()[0].title);
                        oAppFinderView.getController()._updateShellHeader(sTitle);
                    }
                }.bind(this))
                .finally(function () {
                    oCatalogView.setBusy(false);
                });
        }

        if (isSpacesEnabled()) {
            this.oDoable = EventHub.on("trackHashChange").do(function (sHash) {
                if (isSpacesEnabled() && (sHash === "Shell-appFinder")) {
                    loadVisualizationOrganizerAndUpdateBindings.call(this);
                }
            }.bind(this));
        }

        /**
         * Sets the model to have its bindings refreshed after loading and processing the data.
         *
         * @param {sap.ui.model.json.JSONModel} model The model to have its bindings refreshed after loading and processing the data.
         */
        this.setModel = function (model) {
            this.oModel = model;
        };

        /**
         * Loads the VisualizationOrganizer and updates the bindings
         * @returns {Promise<undefined>} Resolves after the bindings are updated
         *
         * @private
         * @since 1.105.0
         */
        this.loadAndUpdate = function () {
            if (!isSpacesEnabled()) {
                return Promise.resolve();
            }
            return loadVisualizationOrganizerAndUpdateBindings.call(this);
        };

        /**
         * Determines the tooltip text of the "pin" button.
         * Checks if Spaces are enabled:
         * - Spaces disabled: forwards the call to the original handler with the array of Group IDs and the Group context.
         * - Spaces enabled: forwards the call to the VisualizationOrganizer.
         *
         * @param {string[]} aGroupsIDs Group IDs.
         * @param {object} oGroupContext The current Group context.
         * @param {string} vizId The vizId of the visualization to be checked.
         * @returns {string} The formatted string.
         * @since 1.75.0
         * @protected
         */
        this.formatPinButtonTooltip = function (aGroupsIDs, oGroupContext, vizId) {
            if (!isSpacesEnabled()) {
                return this.formatPinButtonTooltip(aGroupsIDs, oGroupContext);
            }
            return oVisualizationOrganizer.formatPinButtonTooltip(vizId, oSectionContext);
        };

        /**
         * Determines the "selected" state of the "pin" button.
         * Checks if Spaces are enabled:
         * - Spaces disabled: forwards the call to the original handler with original arguments.
         * - Spaces enabled: returns "false" ("pin" button should never be selected).
         *
         * @returns {boolean} The result.
         * @since 1.75.0
         * @protected
         */
        this.formatPinButtonSelectState = function () {
            if (!isSpacesEnabled()) {
                return this.formatPinButtonSelectState.apply(this, arguments);
            }
            return false;
        };

        /**
         * Forwarder function for the VisualizationOrganizer "formatPinButtonIcon" method.
         * Checks if Spaces are enabled:
         * - Spaces disabled: returns "sap-icon://pushpin-off".
         * - Spaces enabled: forwards the call to the VisualizationOrganizer.
         *
         * @param {string} vizId The vizId of the visualization to be checked.
         * @returns {sap.ui.core.URI} The icon that should be used for the "pin" button.
         */
        this.formatPinButtonIcon = function (vizId) {
            if (!isSpacesEnabled()) {
                return "sap-icon://pushpin-off";
            }
            return oVisualizationOrganizer.formatPinButtonIcon(vizId, !!oSectionContext);
        };

        /**
         * Forwarder function for the VisualizationOrganizer "formatPinButtonType" method.
         * Checks if Spaces are enabled:
         * - Spaces disabled: returns "ButtonType.Default".
         * - Spaces enabled: forwards the call to the VisualizationOrganizer.
         *
         * @param {string} vizId The vizId of the visualization to be checked.
         * @returns {sap.m.ButtonType} The type that should be used for the "pin" button.
         */
        this.formatPinButtonType = function (vizId) {
            if (!isSpacesEnabled()) {
                return ButtonType.Default;
            }
            return oVisualizationOrganizer.formatPinButtonType(vizId, !!oSectionContext);
        };

        /**
         * Forwarder function for the VisualizationOrganizer "onTilePinButtonClick" method.
         * Checks if Spaces are enabled:
         * - Spaces disabled: forwards the call to the original handler.
         * - Spaces enabled: forwards the call to the VisualizationOrganizer.
         *
         * @param {sap.ui.base.Event} oEvent The press event.
         * @since 1.75.0
         * @protected
         */
        this.onTilePinButtonClick = function (oEvent) {
            if (!isSpacesEnabled()) {
                this.getController().onTilePinButtonClick(oEvent);
                return;
            }
            oVisualizationOrganizer.onTilePinButtonClick(oEvent, oSectionContext);
        };

        /**
         * Return the navigation context if the AppFinder was opened scoped to a Group or Section.
         * Checks if Spaces are enabled:
         * - Spaces disabled: forwards the call to the original handler.
         * - Spaces enabled: returns an object containing pageID and sectionID.
         *
         * @returns {object} The navigation context or "null" when not scoped to a Group/Section.
         * @since 1.76.0
         * @protected
         */
        this.getNavigationContext = function () {
            if (!isSpacesEnabled()) {
                return this.getGroupContext.apply(this, arguments);
            }
            if (oSectionContext) {
                return {
                    pageID: encodeURIComponent(oSectionContext.pageID),
                    sectionID: encodeURIComponent(oSectionContext.sectionID)
                };
            }
            return null;
        };

        /**
         * Return the navigation context if the AppFinder was opened scoped to a Group or Section.
         * Checks if Spaces are enabled:
         * - Spaces disabled: forwards the call to the original handler.
         * - Spaces enabled: returns a string containing pageID and sectionID.
         *
         * @returns {string} The navigation context or "null" when not scoped to a Group/Section.
         * @since 1.76.0
         * @protected
         */
        this.getNavigationContextAsText = function () {
            if (!isSpacesEnabled()) {
                return this.getGroupNavigationContext.apply(this, arguments);
            }
            if (oSectionContext) {
                return JSON.stringify({
                    pageID: encodeURIComponent(oSectionContext.pageID),
                    sectionID: encodeURIComponent(oSectionContext.sectionID)
                });
            }
            return null;
        };

        /**
         * Update the navigation scope in the model based on the router parameter
         * Checks if Spaces are enabled:
         * - Spaces disabled: forwards the call to the original handler.
         * - Spaces enabled: forwards the call to the VisualizationOrganizer.
         *
         * @param {object} [oDataParam] The navigation parameter.
         * @returns {Promise<undefined>} Resolves when the popover is toggled.
         * @since 1.76.0
         * @protected
         */
        this.updateModelWithContext = function (oDataParam) {
            if (!isSpacesEnabled()) {
                this._updateModelWithGroupContext.apply(this, arguments);
                return Promise.resolve();
            }

            return loadVisualizationOrganizer().then(function () {
                return oVisualizationOrganizer.loadSectionContext(oDataParam);
            }).then(function (oContext) {
                oSectionContext = oContext;
                // should be before setting the title, otherwise the title will be incorrect
                this.oView.getModel().updateBindings(true);
                if (oSectionContext) {
                    var sTitle = oSectionContext.sectionTitle
                        ? resources.i18n.getText("VisualizationOrganizer.AppFinderSectionContextTitle", oSectionContext.sectionTitle)
                        : resources.i18n.getText("VisualizationOrganizer.AppFinderSectionContextTitle", oSectionContext.pageTitle);
                    this.oView.oPage.setTitle(sTitle);
                    if (this._updateShellHeader) {
                        return new Promise(function (resolve) {
                            setTimeout(function () {
                                this._updateShellHeader(sTitle);
                                resolve();
                            }.bind(this), 0);
                        }.bind(this));
                    }
                }
                return Promise.resolve();
            }.bind(this));
        };

        /**
         * Loads the VisualizationOrganizer component.
         *
         * @since 1.76.0
         * @private
         */
        this._loadVisualizationOrganizer = loadVisualizationOrganizer;

        /**
         * Updates the Section context.
         *
         * @param {object} oContext The new Section context.
         *
         * @since 1.76.0
         * @private
         */
        this._setSectionContext = function (oContext) {
            oSectionContext = oContext;
        };

        /**
         * This method should be called externally when exiting (destroying) the view where this helper is being used on.
         * Turns off the EventHub listener responsible for calling the data refresh handler.
         */
        this.exit = function () {
            if (this.oDoable) {
                this.oDoable.off();
                this.oDoable = null;
            }
        };

        /**
         * This handle is used for User Menu and SAP Menu of the AppFinder, because
         * they have different handling compare to the Catalog tab.
         *
         * Checks if Spaces are enabled:
         * - Spaces disabled: forwards the call to the showSaveAppPopover handler of HierarchyApp.
         * - Spaces enabled: forwards the call to the VisualizationOrganizer.
         *
         * @param {sap.ui.base.Event} oEvent The press event.
         * @returns {Promise<boolean>} Resolves to "true" if the pin button status should be updated.
         * @since 1.84.1
         * @protected
         */
        this.onHierarchyAppsPinButtonClick = function (oEvent) {
            if (!isSpacesEnabled()) {
                this.showGroupListPopover(oEvent);
                return Promise.resolve(false);
            }
            return oVisualizationOrganizer.onHierarchyAppsPinButtonClick(oEvent, oSectionContext);
        };

        /**
         * Determines the tooltip text of the "pin" button in HierarchyApps.
         * Checks if Spaces are enabled:
         * - Spaces disabled: forwards the call to the original handler with the array of Group IDs and the Group context.
         * - Spaces enabled: forwards the call to the VisualizationOrganizer.
         *
         * @param {string[]} aGroupsIDs The Group IDs.
         * @param {int} iBookmarkCount The number of existing bookmarks.
         * @param {string} sGroupContextModelPath The Group context model path.
         * @param {string} sGroupContextId The Group context ID.
         * @param {string} sGroupContextTitle The Group context title.
         * @returns {string} The formatted string.
         * @since 1.84.1
         * @protected
         */
        this.formatBookmarkPinButtonTooltip = function (
            aGroupsIDs, iBookmarkCount, sGroupContextModelPath, sGroupContextId, sGroupContextTitle
        ) {
            if (!isSpacesEnabled()) {
                return this.formatPinButtonTooltip(aGroupsIDs, iBookmarkCount, sGroupContextModelPath, sGroupContextId, sGroupContextTitle);
            }
            return oVisualizationOrganizer.formatBookmarkPinButtonTooltip(iBookmarkCount, oSectionContext);
        };

        /**
         * Determines the "selected" state of the "pin" button in HierarchyApps.
         * Checks if Spaces are enabled:
         * - Spaces disabled: calculate state based on the bookmarkCount.
         * - Spaces enabled: returns "false" ("pin" button should never be selected).
         *
         * @param {int} bookmarkCount The count of existing bookmarks.
         * @returns {boolean} The boolean result.
         * @since 1.84.1
         * @protected
         */
        this.formatBookmarkPinButtonSelectState = function (bookmarkCount) {
            if (!isSpacesEnabled()) {
                return !!bookmarkCount;
            }
            return false;
        };

        /**
         * Forwarder function for the VisualizationOrganizer "formatPinButtonIcon" method in HierarchyApps.
         * Checks if Spaces are enabled:
         * - Spaces disabled: returns "sap-icon://pushpin-off".
         * - Spaces enabled: calculate icon based on the bookmarkCount.
         *
         * @param {int} bookmarkCount The count of existing bookmarks.
         * @returns {sap.ui.core.URI} The icon that should be used for the "pin" button.
         * @since 1.84.1
         */
        this.formatBookmarkPinButtonIcon = function (bookmarkCount) {
            if (!isSpacesEnabled()) {
                return "sap-icon://pushpin-off";
            }
            return bookmarkCount > 0 ? "sap-icon://accept" : "sap-icon://add";
        };

        /**
         * Forwarder function for the VisualizationOrganizer "formatPinButtonType" method in HierarchyApps.
         * Checks if Spaces are enabled:
         * - Spaces disabled: returns "ButtonType.Default".
         * - Spaces enabled: calculate type based on bookmarkCount.
         *
         * @param {int} bookmarkCount The count of existing bookmarks.
         * @returns {sap.m.ButtonType} The type that should be used for the "pin" button.
         * @since 1.84.1
         */
        this.formatBookmarkPinButtonType = function (bookmarkCount) {
            if (!isSpacesEnabled()) {
                return ButtonType.Default;
            }
            return bookmarkCount > 0 ? ButtonType.Emphasized : ButtonType.Default;
        };

        /**
         * Calculate the bookmarkCount for the applications in User Menu and SAP Menu.
         * Checks if Spaces are enabled:
         * - Spaces disabled: forwards the call to the original handler.
         * - Spaces enabled: forwards the call to the VisualizationOrganizer.
         *
         * @param {object} aAppsData The information of the application, that should be added.
         * @returns {Promise<object>} Resolves to the updated aAppsData with bookmarkCount.
         * @since 1.84.1
         * @private
         */
        this.updateBookmarkCount = function (aAppsData) {
            if (!isSpacesEnabled()) {
                return this.updateBookmarkCount(aAppsData);
            }
            return oVisualizationOrganizer.updateBookmarkCount(aAppsData, oSectionContext);
        };

        /**
         * Checks if the user can personalize anything.
         * Checks for the system's personalization setting as well as the admin setting and the user setting regarding the My Home Space.
         *
         * @returns {Promise<boolean>} Resolves to true in case Tiles can be pinned anywhere.
         * @private
         */
        this.shouldPinButtonBeVisible = function () {
            return new Promise(function (resolve) {
                var bPersonalizationEnabled = Config.last("/core/shell/enablePersonalization");

                if (!isSpacesEnabled() || bPersonalizationEnabled) {
                    resolve(bPersonalizationEnabled);
                } else if (!Config.last("/core/spaces/myHome/enabled")) {
                    resolve(false);
                } else {
                    sap.ushell.Container.getServiceAsync("UserInfo").then(function (oUserInfoService) {
                        resolve(oUserInfoService.getUser().getShowMyHome());
                    });
                }
            });
        };
    }

    return {
        getInstance: function () {
            if (!oInstance) {
                oInstance = new VisualizationOrganizerHelper();
            }
            return oInstance;
        },
        _getConstructor: function () {
            return VisualizationOrganizerHelper;
        },
        destroy: function () {
            if (oInstance) {
                oInstance.exit();
            }
            oInstance = null;
        }
    };
});
