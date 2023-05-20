// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/CustomData",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/base/util/ObjectPath",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils",
    "sap/m/IconTabFilter",
    "sap/ushell/utils",
    "sap/ushell/Config"
], function (
    CustomData,
    Controller,
    JSONModel,
    ObjectPath,
    EventHub,
    resources,
    WindowUtils,
    IconTabFilter,
    ShellUtils,
    Config
) {
    "use strict";

    /**
     * Controller of the MenuBar view.
     * It is responsible for changing the hash after selecting a Menu entry.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameter
     *
     * @class
     * @extends sap.ui.core.mvc.Controller
     *
     * @private
     * @since 1.72.0
     * @alias sap.ushell.components.shell.MenuBar.controller.MenuBar
     */

    return Controller.extend("sap.ushell.components.shell.MenuBar.controller.MenuBar" /** @lends sap.ushell.components.shell.MenuBar.controller.MenuBar.prototype */, {

        /**
         * UI5 lifecycle method which is called upon controller initialization.
         * It gets all the required UShell services and
         * initializes the view.
         *
         * @private
         * @since 1.72.0
         */
        onInit: function () {
            this.oContainerRouter = sap.ushell.Container.getRenderer().getRouter();

            this.oContainerRouter.getRoute("home").attachMatched(this._selectIndexAfterRouteChange, this);
            this.oContainerRouter.getRoute("openFLPPage").attachMatched(this._selectIndexAfterRouteChange, this);
            this.oContainerRouter.getRoute("openWorkPage").attachMatched(this._selectIndexAfterRouteChange, this);

            this.oEventHubListener = EventHub.on("enableMenuBarNavigation").do(function (bEnableMenuBarNavigation) {
                this.getView().getModel("viewConfiguration").setProperty("/enableMenuBarNavigation", bEnableMenuBarNavigation);
            }.bind(this));

            var oViewConfiguration = new JSONModel({
                //We need to initialize with a non-empty key to avoid flickering of the selection.
                selectedKey: "None Existing Key",
                enableMenuBarNavigation: true,
                ariaTexts: {
                    headerLabel: resources.i18n.getText("SpacePageNavgiationRegion")
                }
            });

            this.getView().setModel(oViewConfiguration, "viewConfiguration");

            this.oURLParsingService = sap.ushell.Container.getServiceAsync("URLParsing");
            this.oGetDefaultSpacePromise = sap.ushell.Container.getServiceAsync("Menu")
                .then(function (oMenuService) {
                    return oMenuService.getDefaultSpace();
                });

            this._selectIndexAfterRouteChange();
        },

        /**
         * Determines the selected menu entry with the required navigation action
         * according to the navigation type.
         *
         * @param {sap.ui.base.Event} event The event containing the selected menu intent
         *
         * @private
         * @since 1.72.0
         */
        onMenuItemSelection: function (event) {
            var sSelectedMenuEntryKey = event.getParameter("key");
            var oMenuModel = this.getView().getModel("menu");

            var aMenuEntries = oMenuModel.getProperty("/");
            var oDestinationIntent = this._getNestedMenuEntryByUid(aMenuEntries, sSelectedMenuEntryKey);

            if (oDestinationIntent.type === "IBN") {
                this._performCrossApplicationNavigation(oDestinationIntent.target);
            }

            if (oDestinationIntent.type === "URL") {
                this._openURL(oDestinationIntent.target);
            }
        },

        /**
         * Searches for a menu entry recursively by a function check
         * @param {object[]} aMenuEntries The array of nested menu entries
         * @param {function(object) : boolean} fnCheck A function which gets the
         *      menuEntry as an parameter and should return an boolean
         * @returns {object} Returns the menu entry or undefined if not present
         */
        _getNestedMenuEntry: function (aMenuEntries, fnCheck) {
            return aMenuEntries.reduce(function (oSelectedMenuEntry, oMenuEntry) {
                if (oSelectedMenuEntry) {
                    return oSelectedMenuEntry;
                }

                if (fnCheck(oMenuEntry)) {
                    return oMenuEntry;
                }

                if (oMenuEntry.menuEntries) {

                    return this._getNestedMenuEntry(oMenuEntry.menuEntries, fnCheck);
                }
            }.bind(this), undefined);
        },

        /**
         * Searches for a menu entry by its uid
         * @param {object[]} aMenuEntries The array of nested menu entries
         * @param {string} sUid The key of the menu entry
         * @returns {object} Returns the menu entry or undefined if not present
         *
         * @private
         * @since 1.77.0
         */
        _getNestedMenuEntryByUid: function (aMenuEntries, sUid) {
            function fnCheck (oMenuEntry) {
                return oMenuEntry.uid === sUid;
            }
            return this._getNestedMenuEntry(aMenuEntries, fnCheck);
        },

        /**
         * Performs a Cross Application Navigation to the provided intent using the
         * CrossApplicationNavigation service.
         *
         * @param {object} destinationTarget
         *  The destination target which is used for the Cross Application Navigation
         *
         * @returns {Promise<void>}
         *  A promise which is resolved after the CrossAppNavigation is performed
         *
         * @private
         * @since 1.74.0
         */
        _performCrossApplicationNavigation: function (destinationTarget) {
            return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCANService) {
                var oParams = {};
                destinationTarget.parameters.forEach(function (oParameter) {
                    if (oParameter.name && oParameter.value) {
                        oParams[oParameter.name] = [oParameter.value];
                    }
                });

                oCANService.toExternal({
                    target: {
                        semanticObject: destinationTarget.semanticObject,
                        action: destinationTarget.action
                    },
                    params: oParams
                });
            });
        },

        /**
         * Opens the provided URL in a new browser tab.
         *
         * @param {object} destinationTarget
         *  The destination target which is used to determine the URL which should be
         *  opened in a new browser tab
         *
         * @private
         * @since 1.74.0
         */
        _openURL: function (destinationTarget) {
            WindowUtils.openURL(destinationTarget.url, "_blank");
        },

        /**
         * Selects the right key according to the current hash.
         *
         * Gets the space and page id out of the current hash and selects key according to them.
         * For the intent '#Shell-home' the default page of the user is taken into account.
         *
         * @returns {Promise<void>} a promise to wait for.
         *
         * @private
         * @since 1.72.0
         */
        _selectIndexAfterRouteChange: function () {
            var oViewConfigModel = this.getView().getModel("viewConfiguration");

            return Promise.all([
                this.oURLParsingService,
                this.oGetDefaultSpacePromise,
                this.getOwnerComponent().oInitPromise
            ]).then(function (aResults) {
                var oUrlParsingService = aResults[0];
                var oDefaultSpace = aResults[1];

                var sSelectedMenuKey;
                var sHash = window.hasher.getHash();
                var oHashParts = oUrlParsingService.parseShellHash(sHash);
                var aMenuEntries = this.getView().getModel("menu").getProperty("/");

                if (oHashParts.semanticObject === "Shell" && oHashParts.action === "home") {
                    if (Config.last("/core/homeApp/enabled")) {
                        sSelectedMenuKey = this._getHomeAppUID(aMenuEntries) || "";
                    } else {
                        // Determine the user's default page and initiate loading
                        var oDefaultSpacePage = oDefaultSpace && oDefaultSpace.children && oDefaultSpace.children[0];
                        sSelectedMenuKey = (oDefaultSpacePage) ? this._getMenuUID(aMenuEntries, oDefaultSpace.id, oDefaultSpacePage.id) || "" : "";
                    }

                    oViewConfigModel.setProperty("/selectedKey", sSelectedMenuKey);
                } else {
                    var sSpaceId = ObjectPath.get("params.spaceId.0", oHashParts);
                    var sPageId = ObjectPath.get("params.pageId.0", oHashParts);

                    // First evaluate the last clicked key and search for the top level entry if it matches the parameters
                    var sSelectedKey = oViewConfigModel.getProperty("/selectedKey");
                    var oMenuEntry = this._getNestedMenuEntryByUid(aMenuEntries, sSelectedKey);
                    if (this._hasSpaceIdAndPageId(oMenuEntry, sSpaceId, sPageId)) {
                        sSelectedMenuKey = oMenuEntry.uid;
                    } else {
                        sSelectedMenuKey = this._getMenuUID(aMenuEntries, sSpaceId, sPageId);
                    }

                    if (sSelectedMenuKey) {
                        oViewConfigModel.setProperty("/selectedKey", sSelectedMenuKey);
                    } else {
                        oViewConfigModel.setProperty("/selectedKey", "None Existing Key");
                    }
                }
            }.bind(this));
        },

        /**
         * Searches the menu model to find the matching menu entry according
         * to the provided space and page id.
         * @param {object[]} aMenuEntries The array of nested menuEntries
         * @param {string} spaceId The space id
         * @param {string} pageId The page id
         *
         * @returns {(string|undefined)}
         *  The uid of the menu entry which matches the space & page id
         *
         * @private
         * @since 1.74.0
         */
        _getMenuUID: function (aMenuEntries, spaceId, pageId) {
            function fnCheck (oMenuEntry) {
                return this._hasSpaceIdAndPageId(oMenuEntry, spaceId, pageId);
            }
            var oMatchedMenuEntry = this._getNestedMenuEntry(aMenuEntries, fnCheck.bind(this));
            return oMatchedMenuEntry && oMatchedMenuEntry.uid;
        },

        /**
         * Searches the menu model to find the matching menu entry for the home app.
         * @param {object[]} aMenuEntries The array of nested menuEntries
         *
         * @returns {(string|undefined)}
         *  The uid of the menu entry which matches the home app
         *
         * @private
         * @since 1.100.0
         */
         _getHomeAppUID: function (aMenuEntries) {
            function fnCheck (oMenuEntry) {
                return oMenuEntry.target.semanticObject === "Shell" && oMenuEntry.target.action === "home";
            }
            var oMatchedMenuEntry = this._getNestedMenuEntry(aMenuEntries, fnCheck.bind(this));
            return oMatchedMenuEntry && oMatchedMenuEntry.uid;
        },

        /**
         * Checks if the menu entry contains a space id and page id
         * @param {object} oMenuEntry A menu entry
         * @param {string} sSpaceId The space id
         * @param {string} sPageId The page id
         * @returns {boolean} Whether the menu entry contains the requuired id
         *
         * @private
         * @since 1.77.0
         */
        _hasSpaceIdAndPageId: function (oMenuEntry, sSpaceId, sPageId) {
            var aParameters = ObjectPath.get("target.parameters", oMenuEntry) || [];
            var oSpaceIdParam = aParameters.find(function (oParameter) {
                return oParameter.name === "spaceId" && oParameter.value === sSpaceId;
            });
            var oPageIdParam = aParameters.find(function (oParameter) {
                return oParameter.name === "pageId" && oParameter.value === sPageId;
            });
            return oSpaceIdParam !== undefined && oPageIdParam !== undefined;
        },

        /**
         * Factory function which is used by the IconTabHeader control
         * inside the menubar view to fill the items aggregation
         *
         * @param {string} sId Control ID
         * @param {sap.ui.model.Context} oContext UI5 context
         * @returns {sap.m.IconTabFilter} The IconTabFilter control
         *
         * @private
         * @since 1.77.0
         */
        _menuFactory: function (sId, oContext) {
            return new IconTabFilter(sId, {
                key: "{menu>uid}",
                text: "{menu>title}",
                enabled: "{viewConfiguration>/enableMenuBarNavigation}",
                items: {
                    path: "menu>menuEntries",
                    factory: this._menuFactory.bind(this)
                }
            }).addCustomData(new CustomData({
                key: "help-id",
                value: "{= 'MenuEntry-' + ${menu>help-id}}",
                writeToDom: "{= !!${menu>help-id}}"
            }));
        },

        /**
         * UI5 lifecycle method which is called upon controller destruction.
         * It detaches the router events and config listeners.
         *
         * @private
         * @since 1.74.0
         */
        onExit: function () {
            this.oEventHubListener.off();
        }
    });
});
