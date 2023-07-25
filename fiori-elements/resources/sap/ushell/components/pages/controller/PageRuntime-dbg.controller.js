//Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file PageRuntime controller for PageRuntime view
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/events/KeyCodes",
    "sap/m/GenericTile",
    "sap/ushell/resources",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/ushell/components/pages/StateManager",
    "sap/ushell/EventHub",
    "sap/ushell/utils",
    "sap/m/Button",
    "sap/base/strings/capitalize",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ushell/components/pages/controller/PagesAndSpaceId",
    "sap/ushell/components/pages/MyHomeImport",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log", // S/4 my home
    "sap/ui/core/theming/Parameters"
], function (
    ushellLibrary,
    Controller,
    KeyCodes,
    GenericTile,
    resources,
    JSONModel,
    Config,
    mLibrary,
    MessageToast,
    StateManager,
    EventHub,
    utils,
    Button,
    capitalize,
    Filter,
    FilterOperator,
    PagesAndSpaceId,
    MyHomeImport,
    hasher,
    jQuery,
    Log, // S/4 my home
    Parameters
) {
    "use strict";

    // shortcut for sap.m.LoadState
    var LoadState = mLibrary.LoadState;

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    /**
     * Controller of the PagesRuntime view.
     * It is responsible for navigating between different pages and combines the
     * Pages service (@see sap.ushell.services.Pages) with the
     * VisualizationInstantiation service (@see sap.ushell.services.VisualizationInstantiation) to create
     * the content area of the Fiori Launchpad.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameters
     * @class
     * @extends sap.ui.core.mvc.Controller
     * @private
     * @since 1.72.0
     * @alias sap.ushell.components.pages.controller.Pages
     */
    return Controller.extend("sap.ushell.components.pages.controller.Pages", /** @lends sap.ushell.components.pages.controller.Pages.prototype */ {
        /**
         * UI5 lifecycle method which is called upon controller initialization.
         * It gets all the required UShell services and sets the Pages service
         * model to the view. It also sets a separate model to the view which includes
         * some settings which change the view behavior.
         *
         * @returns {Promise<undefined>} Resolves when done with initial actions
         * @private
         * @since 1.72.0
         */
        onInit: function () {
            this._setPerformanceMark("FLP-PagesRuntime-onInit");

            this._oVisualizationInstantiationServicePromise = sap.ushell.Container.getServiceAsync("VisualizationInstantiation");
            this._oURLParsingService = sap.ushell.Container.getServiceAsync("URLParsing");

            this._oViewSettingsModel = new JSONModel({
                sizeBehavior: Config.last("/core/home/sizeBehavior"),
                actionModeActive: false,
                actionModeEditActive: false, // There are two action modes: normal Edit and Add Tiles to My Home
                showHideButton: Config.last("/core/catalog/enableHideGroups"),
                showAddButton: Config.last("/core/catalog/enabled"),
                personalizationEnabled: Config.last("/core/shell/enablePersonalization"),
                addToMyHomeOnly: false,
                showPageTitle: false,
                gridContainerGap: [],
                gridContainerRowSize: []
            });
            this.getView().setModel(this._oViewSettingsModel, "viewSettings");

            this._sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");

            this._aConfigListeners = Config.on("/core/home/sizeBehavior").do(function (sSizeBehavior) {
                this._oViewSettingsModel.setProperty("/sizeBehavior", sSizeBehavior);
            }.bind(this));

            this._oErrorPageModel = new JSONModel({
                icon: "sap-icon://documents",
                text: "",
                description: "",
                details: ""
            });
            this.getView().setModel(this._oErrorPageModel, "errorPage");

            this.oInitFinishedPromise = Promise.all([
                this._oVisualizationInstantiationServicePromise,
                this.getOwnerComponent().getPagesService()
            ]).then(function (aServices) {
                // bind the model only when the vizInstance service is loaded so that it
                // can be used in the factory function synchronously
                this._oVisualizationInstantiationService = aServices[0];
                this.getView().setModel(aServices[1].getModel());
            }.bind(this));

            // S/4 my home
            EventHub.emit("S4MyHomePlugin", this.byId("pagesNavContainer").getId());

            var oRenderer = sap.ushell.Container.getRenderer();
            this.bIsHomeIntentRootIntent = utils.isFlpHomeIntent(oRenderer.getShellConfig().rootIntent);
            this.oErrorPage = this.byId("errorPage");
            this.oEmptyPage = this.byId("emptyPage");
            this.oPagesNavContainer = this.byId("pagesNavContainer");
            this.oPagesRuntimeNavContainer = this.byId("pagesRuntimeNavContainer");
            // Navigate initially to empty page to avoid implicit page rendering
            // BCP: 2270064359
            this.oPagesRuntimeNavContainer.to(this.oEmptyPage);
            // Handles the states(visible/invisible, active/inactive) of the visualizations
            StateManager.init(this.oPagesRuntimeNavContainer, this.oPagesNavContainer);

            this.oEventHubListener = EventHub.once("PagesRuntimeRendered").do(this._onFirstPageRendering.bind(this));

            this._oEventBus = sap.ui.getCore().getEventBus();
            this._oEventBus.subscribe("launchpad", "shellFloatingContainerIsDocked", this._handleUshellContainerDocked, this);
            this._oEventBus.subscribe("launchpad", "shellFloatingContainerIsUnDocked", this._handleUshellContainerDocked, this);

            this.oVisualizationInstantiationListener = EventHub.on("VizInstanceLoaded").do(function () {
                this._setPerformanceMark("FLP-TTI-Homepage");
                //Should be adjusted after next iteration of the VisualizationInstantiation
                if (!this.oVisualizationInstantiationListenerTimeout) {
                    //Currently there is no good place to mark TTI time, because all visualizations
                    //are loaded async and update visualizations views directly through setAggregation.
                    //For this reason, we listen to the loading of the all static and dynamic tiles
                    //and mark the last time. Timeout in 5 sec in order to avoid the cases when
                    //personalization or other interaction  replace the TTI time
                    this.oVisualizationInstantiationListenerTimeout = setTimeout(function () {
                        this.oVisualizationInstantiationListener.off();
                    }.bind(this), 5000);
                }
            }.bind(this));

            this.fnBoundSetGridContainerSizes = this._setGridContainerSizes.bind(this);
            Config.on("/core/home/sizeBehavior").do(this.fnBoundSetGridContainerSizes);
            EventHub.on("themeChanged").do(this.fnBoundSetGridContainerSizes);

            this.sCurrentTargetPageId = "";
            return this._openFLPPage().then(function () {
                // The NavContainer handles initial focus which lands on the emptyPage instead of the loaded page after first render
                // Therefore we are focusing the first item on first render in case there is no item focused yet
                if (!document.activeElement || document.activeElement === document.body) {
                    var oFocusableDomRef = jQuery(this.oPagesNavContainer.getDomRef()).firstFocusableDomRef();
                    if (oFocusableDomRef) {
                        oFocusableDomRef.focus();
                    }
                }

                if (!this.getOwnerComponent().getNavigationDisabled()) {
                    // add listener to the router after the rendering the page in order to avoid page re-rendering
                    this.oContainerRouter = oRenderer.getRouter();
                    this.oContainerRouter.getRoute("home").attachMatched(this.onRouteMatched.bind(this, true /* bIsHomeRoute*/));
                    this.oContainerRouter.getRoute("openFLPPage").attachMatched(this.onRouteMatched.bind(this, false));
                }
            }.bind(this));
        },

        /**
         * Set the section grid container gap and row size for different screen sizes
         */
        _setGridContainerSizes: function () {
            var sSizeBehavior = Config.last("/core/home/sizeBehavior");
            var oViewSettingsModel = this.getView().getModel("viewSettings");

            var sTileGapParam = (sSizeBehavior === "Small")
                ? "_sap_ushell_Tile_SpacingXS"
                : "_sap_ushell_Tile_Spacing";

            var sTileGapParamS = (sSizeBehavior === "Small")
                ? "_sap_ushell_Tile_SpacingXS"
                : "_sap_ushell_Tile_SpacingS";

            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGap", this._getNumericThemeParam(sTileGapParam));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapXS", this._getNumericThemeParam("_sap_ushell_Tile_SpacingXS"));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapS", this._getNumericThemeParam(sTileGapParamS));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapM", this._getNumericThemeParam(sTileGapParam));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapL", this._getNumericThemeParam(sTileGapParam));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapXL", this._getNumericThemeParam(sTileGapParam));

            var sTileWidthParam = (sSizeBehavior === "Small")
                ? "_sap_ushell_Tile_WidthXS"
                : "_sap_ushell_Tile_Width";

            var sTileWidthParamS = (sSizeBehavior === "Small")
                ? "_sap_ushell_Tile_WidthXS"
                : "_sap_ushell_Tile_WidthS";

            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSize", this._getNumericThemeParam(sTileWidthParam));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeXS", this._getNumericThemeParam("_sap_ushell_Tile_WidthXS"));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeS", this._getNumericThemeParam(sTileWidthParamS));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeM", this._getNumericThemeParam(sTileWidthParam));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeL", this._getNumericThemeParam(sTileWidthParam));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeXL", this._getNumericThemeParam(sTileWidthParam));
        },

        /**
         * Returns a .rem value based on the tile gap or width parameter
         *
         * @param {string} sParam Tile spacing parameter
         * @returns {string} Value in .rem
         */
        _getNumericThemeParam: function (sParam) {
            var sValue = Parameters.get(sParam);
            if (sValue && sValue.indexOf(".") === 0) {
                sValue = "0" + sValue;
            }
            return sValue;
        },

        _isMyHomeEnabled: function () {
            return Config.last("/core/spaces/myHome/userEnabled") && Config.last("/core/spaces/myHome/enabled");
        },

        _getMyHomeTitle: function () {
            return sap.ushell.Container.getServiceAsync("Menu")
                .then(function (oMenuService) {
                    return oMenuService.getMyHomeSpace();
                })
                .then(function (oHomeSpace) {
                    if (!oHomeSpace || !oHomeSpace.children.length) {
                        return "";
                    }
                    return oHomeSpace.children[0].label;
                });
        },

        /**
         * It is called on the first page rendering, even in the error case.
         * Creates the action mode button.
         */
        _onFirstPageRendering: function () {
            var bPersonalizationEnabled = Config.last("/core/shell/enablePersonalization");
            var bMyHomeEnabled = this._isMyHomeEnabled();
            if (bPersonalizationEnabled) {
                this._createActionModeButton();
            } else if (bMyHomeEnabled) {
                this._getMyHomeTitle().then(this._createActionModeButton.bind(this));
            }

            EventHub.emit("firstSegmentCompleteLoaded", true);
        },

        /**
         * Handles the route matching for the "home" and "openFLPPage" route
         *
         * @param {boolean} bIsHomeRoute Whether the home route matched
         * @private
         */
        onRouteMatched: function (bIsHomeRoute) {
            var bIsHomeAppEnabled = Config.last("/core/homeApp/enabled");
            var bNavigationToHomeApp = bIsHomeAppEnabled && bIsHomeRoute;

            Log.debug("cep/editMode: on Route matched", "Page runtime");
            // Remove home page and display target page
            // We do not display the target page in case we are navigating to the homeApp
            this._removeMyHomePage();
            if (!bNavigationToHomeApp) {
                this._openFLPPage();
            } else {
                // Navigate to empty page to avoid flickering of old page
                // BCP: 2270064359
                this.oPagesRuntimeNavContainer.to(this.oEmptyPage);
                // Reset spacePage for hierarchy and home button
                // BCP: 2270105250
                Config.emit("/core/shell/model/currentSpaceAndPage", undefined);
            }

            // Hide "[Edit Current Page]" button of page`s runtime
            // if custom home app is displayed
            var oActionModeButton = sap.ui.getCore().byId("ActionModeBtn");
            if (!oActionModeButton) {
                return;
            }

            var oRenderer = sap.ushell.Container.getRenderer("fiori2");
            var oStateInfo = this._getStateInfoActionModeButton();

            if (bNavigationToHomeApp) {
                if (this._moveEditActionToHeader()) {
                    oRenderer.hideHeaderEndItem(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                } else {
                    oRenderer.hideActionButton(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                }
                return;
            }

            // Display it again if other page is displayed when custom home app is configured
            if (!bIsHomeRoute && bIsHomeAppEnabled) {
                if (this._moveEditActionToHeader()) {
                    oRenderer.showHeaderEndItem(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                } else {
                    oRenderer.showActionButton(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                }
                return;
            }

            // Display "[Edit Current Page]" button
            // if a custom root intent was defined, e.g. WorkZone
            if (!this.bIsHomeIntentRootIntent) {
                if (this._moveEditActionToHeader()) {
                    oRenderer.showHeaderEndItem(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                } else {
                    oRenderer.showActionButton(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                }
            }
        },

        /**
         * Used to set performance mark related to the loading of the page runtime
         *
         * @param {string} sMark - the name of the performance mark.
         * @private
         */
        _setPerformanceMark: function (sMark) {
            utils.setPerformanceMark(sMark, {
                bUseUniqueMark: true,
                bUseLastMark: true
            });
        },

        // Set either "Edit My Home" or "Add Tiles to My Home" text of the Action Mode button.
        _setActionButtonText: function (sTextId) {
            sTextId = sTextId || this._sActionModeTextId;
            if (!sTextId) {
                return; // Personalization is enabled, there is no need to change the text.
            }
            this._sActionModeTextId = sTextId; // For the case when the Action Mode button was not created yet.

            this._getMyHomeTitle().then(function (sTitle) {
                var oActionModeButton = sap.ui.getCore().byId("ActionModeBtn");
                if (oActionModeButton) {
                    var sActionModeText = resources.i18n.getText(sTextId, sTitle);
                    oActionModeButton.setText(sActionModeText);
                    oActionModeButton.setTooltip(sActionModeText);
                }
            });
        },

        // Check if the personalization is disabled and set the corresponding Action Mode logic.
        // Special logic for "Add Tiles to My Home" when personalization is disabled.
        // bMyHomeActive means that the My Home page is the currently visible one.
        _setActionModeLogic: function (bMyHomeActive) {
            var bEnableEditing = false;
            var bAddToMyHomeOnly = false;

            if (Config.last("/core/shell/enablePersonalization")) {
                bEnableEditing = true; // Most usual case, the Action Mode button has the text "Edit Current Page"
            } else if (bMyHomeActive) {
                bEnableEditing = true; // MyHome can always be personalized
                this._setActionButtonText("PageRuntime.EditModeForPage.Activate"); // "Edit My Home"
            } else if (this._isMyHomeEnabled()) { // personalization is disabled but My Home is enabled - special mode
                bAddToMyHomeOnly = true; // Add Tiles to My Home only
                this._setActionButtonText("PageRuntime.EditModeForPage.AddTilesToMyHome"); // "Add Tiles to My Home"
            }
            this._oViewSettingsModel.setProperty("/personalizationEnabled", bEnableEditing);
            this._oViewSettingsModel.setProperty("/addToMyHomeOnly", bAddToMyHomeOnly);
        },

        /**
         * Triggers the navigation to a specific Page after the pageId is returned
         * and the Pages service could successfully load the requested Page.
         * Triggers the navigation to an error page when an error occurs.
         *
         * @returns {Promise<string>} Resolves to the Page model path after the Page is successfully loaded.
         * @private
         * @since 1.72.0
         */
        _openFLPPage: function () {
            return PagesAndSpaceId._getPageAndSpaceId()
                .then(function (ids) {
                    var sPageId = ids.pageId;
                    var sSpaceId = ids.spaceId;

                    // this property may be updated by consecutive calls to _openFLPPage and prevents race conditions when opening pages
                    this.sCurrentTargetPageId = sPageId;
                    this.sCurrentTargetSpaceId = sSpaceId;

                    return Promise.all([
                        this.oInitFinishedPromise,
                        sap.ushell.Container.getServiceAsync("Menu")
                    ])
                        .then(function (aResults) {
                            var oMenuService = aResults[1];
                            return oMenuService.isSpacePageAssigned(sSpaceId, sPageId);
                        })
                        .then(function (bAssigned) {
                            if (!bAssigned) {
                                return Promise.reject("The combination of space and page is not assigned to the user.");
                            }
                            return this.getOwnerComponent().getPagesService();
                        }.bind(this))
                        .then(function (pagesService) {
                            Log.debug("cep/editMode: load Page: " + sPageId, "Page runtime");
                            return pagesService.loadPage(sPageId);
                        })
                        .then(function () {
                            Log.debug("cep/editMode: load Page: show action mode button " + sPageId, "Page runtime");
                            this._showActionModeButton();
                            if (this.sCurrentTargetPageId === sPageId) {
                                var bMyHomeActive = this._isMyHomeRouteActive();

                                // Special logic for "Add Tiles to My Home" when personalization is disabled.
                                this._setActionModeLogic(bMyHomeActive);

                                // Placeholder page for empty My Home
                                if (bMyHomeActive && this._isMyHomePageEmpty()) { // If the home page is empty, show the splash screen
                                    return this._navigateToInitialMyHome();
                                }
                                return this._navigate(sPageId, sSpaceId);
                            }
                            return Promise.resolve();
                        }.bind(this))
                        .then(this._notifyOnPageRuntimeRendered.bind(this)) // S/4 my home - binding introduced to allow the use of this in the function
                        .catch(function (error) {
                            Log.debug("cep/editMode: open FLP Page: Handle errors", "Page runtime");
                            if (error instanceof Error) {
                                // E.g. UI5 modules cannot be loaded
                                this._oErrorPageModel.setProperty("/text", resources.i18n.getText("PageRuntime.GeneralError.Text"));
                            } else {
                                var sDescription = resources.i18n.getText("PageRuntime.CannotLoadPage.Description") + JSON.stringify(error);

                                this._oErrorPageModel.setProperty("/icon", "sap-icon://documents");
                                this._oErrorPageModel.setProperty("/text", resources.i18n.getText("PageRuntime.CannotLoadPage.Text", [sPageId, sSpaceId]));
                                this._oErrorPageModel.setProperty("/description", "");
                                this._oErrorPageModel.setProperty("/details", sDescription);
                            }

                            this.oPagesRuntimeNavContainer.to(this.oErrorPage);

                            this._hideActionModeButton();
                            this._cancelActionMode();

                            this._notifyOnPageRuntimeRendered();
                        }.bind(this));
                }.bind(this))
                .catch(this._onError.bind(this));
        },

        /**
         * Displays an error message on a MessagePage.
         *
         * @param {string} error The error message.
         * @private
         */
        _onError: function (error) {
            this._oErrorPageModel.setProperty("/icon", "sap-icon://documents");
            this._oErrorPageModel.setProperty("/text", error || "");
            this._oErrorPageModel.setProperty("/description", "");
            this._oErrorPageModel.setProperty("/details", "");

            this.oPagesRuntimeNavContainer.to(this.oErrorPage);

            this._hideActionModeButton();
            this._cancelActionMode();

            this._notifyOnPageRuntimeRendered();
        },

        /**
         * Loops through every page in the inner NavContainer and displays
         * the one which was specified. Also determines if the page title should be shown.
         *
         * @param {string} targetPageId The ID of the page which should be displayed
         * @param {string} spaceId The ID of the space to which the page is assigned to
         * @param {boolean} [keepActionMode] Boolean indicating if the target page should also be in action mode.
         * @returns {Promise<undefined>} Promise which is resolved after the navigation occurred
         * @private
         * @since 1.72.0
         */
        _navigate: function (targetPageId, spaceId, keepActionMode) {
            var oPageControl = this.oPagesNavContainer.getPages().find(function (oControl) {
                return targetPageId === oControl.data("pageId");
            });

            if (!oPageControl) {
                return Promise.reject();
            }

            var oMenuService;
            return sap.ushell.Container.getServiceAsync("Menu")
                .then(function (oService) {
                    oMenuService = oService;
                    return oMenuService.hasMultiplePages(spaceId);
                })
                .then(function (bHasMultiplePages) {
                    var bSamePage = this.oPagesNavContainer.getCurrentPage() === oPageControl;

                    this._oViewSettingsModel.setProperty("/showPageTitle", bHasMultiplePages);
                    this.oPagesNavContainer.to(oPageControl);
                    this.oPagesRuntimeNavContainer.to(this.oPagesNavContainer);

                    // Only cancel edit mode in case of navigation to a different page
                    if (!bSamePage && !keepActionMode) {
                        this._cancelActionMode();
                    }

                    // no need to wait for this to finish the navigation
                    oMenuService.getSpaceAndPageTitles(spaceId, targetPageId)
                        .then(function (oTitles) {
                            // Needed for Hierarchy Menu in Spaces mode - see sap/ushell/components/applicationIntegration/AppMeta
                            // Needed for navigation target of the header Logo in Spaces mode - see sap/ushell/components/HeaderManager
                            var oSpacePageData = {
                                pageTitle: oTitles.pageTitle,
                                spaceTitle: oTitles.spaceTitle,
                                hash: hasher.getHash()
                            };
                            Config.emit("/core/shell/model/currentSpaceAndPage", oSpacePageData);
                        });
                }.bind(this));
        },

        /**
         * Navigates to the initial MyHome page.
         * Loads the view if it does not exist yet.
         *
         * @returns {Promise<undefined>} A promise resolving when the navigation is done.
         * @private
         * @since 1.89.0
         */
        _navigateToInitialMyHome: function () {
            if (!this._pLoadMyHomeView) {
                this._pLoadMyHomeView = new Promise(function (resolve, reject) {
                    sap.ui.require(["sap/ui/core/mvc/XMLView"], function (XMLView) {
                        XMLView.create({
                            id: "sapUshellMyHomePage",
                            viewName: "sap.ushell.components.pages.view.MyHomeStart"
                        }).then(function (page) {
                            page.getController().connect({
                                onEdit: this.pressActionModeButton.bind(this),
                                onOpenDialog: this.openMyHomeImportDialog.bind(this)
                            });
                            resolve(page);
                        }.bind(this)).catch(reject);
                    }.bind(this), reject);
                }.bind(this));
            }

            return this._pLoadMyHomeView.then(function (page) {
                this._cancelActionMode();
                this.oPagesRuntimeNavContainer.insertPage(page, 0);
                this.oPagesRuntimeNavContainer.to(page);
            }.bind(this));
        },

        /**
         * Emit events when page is rendered
         *
         * @since 1.79.0
         * @private
         */
        _notifyOnPageRuntimeRendered: function () {
            // S/4 my home
            try {
                var sPageId;
                var oCurrentPage = this.oPagesNavContainer.getCurrentPage();
                sPageId = oCurrentPage && oCurrentPage.getId();
                EventHub.emit("S4Plugin_PagesRuntimeRendered", sPageId);
            } catch (oError) {
                Log.error("Error while trying to trigger the PagesRuntimeRendered event for the S/4 My Home plugin");
            }
            EventHub.emit("PagesRuntimeRendered");
            // "reset" the appRendered event in case the user wants to navigate back to the same app.
            if (EventHub.last("AppRendered") !== undefined) {
                EventHub.emit("AppRendered", undefined);
            }
        },

        /**
         * Displays the description of the current error and hide the button after it is pressed.
         *
         * @since 1.73.0
         * @private
         */
        _pressViewDetailsButton: function () {
            var sErrorDetails = this._oErrorPageModel.getProperty("/details") || "";
            this._oErrorPageModel.setProperty("/description", sErrorDetails);
        },

        /**
         * Copies the content of the text provided to the clipboard and shows a MessageToast with a success or error message
         *
         * @since 1.73.0
         * @private
         */
        _copyToClipboard: function () {
            var bResult = utils.copyToClipboard(this._oErrorPageModel.getProperty("/description"));
            if (bResult) {
                MessageToast.show(resources.i18n.getText("PageRuntime.CannotLoadPage.CopySuccess"), {
                    closeOnBrowserNavigation: false
                });
            } else {
                MessageToast.show(resources.i18n.getText("PageRuntime.CannotLoadPage.CopyFail"), {
                    closeOnBrowserNavigation: false
                });
            }
        },

        /**
         * UI5 factory function which is used by the sections control inside the runtime view to fill the visualizations aggregation
         * @see sap.ushell.ui.launchpad.Section
         *
         * @param {string} id Control ID
         * @param {sap.ui.model.Context} context UI5 context
         * @returns {sap.ui.core.Control} The UI5 control
         * @private
         * @since 1.72.0
         */
        _visualizationFactory: function (id, context) {
            if (this._oVisualizationInstantiationService) {
                var oData = context.getObject();
                var sPath = context.getPath();
                var sSectionPath = sPath.replace(/\/visualizations\/\d*\/?$/, "");
                var sPagePath = sSectionPath.replace(/\/sections\/\d*\/?$/, "");
                var oPageData = context.getModel().getProperty(sPagePath);

                var oVisualization = this._oVisualizationInstantiationService.instantiateVisualization(oData);
                oVisualization.attachPress(this.onVisualizationPress, this);
                oVisualization.bindEditable("viewSettings>/actionModeActive");
                if (oVisualization.bindRemovable) {
                    oVisualization.bindRemovable("viewSettings>/actionModeEditActive");
                }

                // add regular TileActions
                this._addTileActions(oVisualization, (oPageData ? oPageData.id : ""));

                // dynamic decision on displaying the move Tile action
                oVisualization.attachBeforeActionSheetOpen(function () {
                    var oButton = this._createMoveTileActionButton(oVisualization, oPageData);
                    if (oButton) {
                        oVisualization.attachEventOnce("afterActionSheetClose", function () {
                            oVisualization.removeTileAction(oButton);
                        });
                    }
                }.bind(this));

                // the path looks like "/pages/0/sections/0/visualizations/0"
                var sPagePathIndex = context.getPath().split("/")[2];
                var bActive = !!StateManager.getPageVisibility("/pages/" + sPagePathIndex);
                oVisualization.setActive(bActive);

                return oVisualization;
            }
            return new GenericTile({
                state: LoadState.Failed
            });
        },

        /**
         * Adds tile actions to the VizInstance for change of display format
         *
         * @param {sap.ushell.ui.launchpad.VizInstance} oVizInstance The VizInstance which the tile actions are added to.
         * @param {string} sPageId The pageId of the given vizInstance.
         * @private
         * @since 1.85
         */
        _addTileActions: function (oVizInstance, sPageId) {
            var aAvailableDisplayFormats = oVizInstance.getAvailableDisplayFormats();
            var bPersonalizationEnabled = Config.last("/core/shell/enablePersonalization");
            var bMyHomeEnabled = this._isMyHomeEnabled();
            var bIsMyHome = sPageId === this._sMyHomePageId;

            if (bPersonalizationEnabled || bIsMyHome) {
                for (var i = 0; i < aAvailableDisplayFormats.length; i++) {
                    oVizInstance.addTileAction(new Button({
                        text: "{i18n>VisualizationInstance.ConvertTo" + capitalize(aAvailableDisplayFormats[i]) + "Action}",
                        press: [aAvailableDisplayFormats[i], this._updateVisualizationDisplayFormat, this]
                    }));
                }
            }

            if (bMyHomeEnabled && !bIsMyHome) {
                oVizInstance.addTileAction(new Button({
                    text: "{i18n>addToMyHome_action}",
                    press: [oVizInstance, this._addToMyHome, this]
                }));
            }
        },

        /**
         * Creates a move Tile action button and adds it to the given oVizInstance when necessary.
         *
         * @param {sap.ushell.ui.launchpad.VizInstance} oVizInstance The VizInstance that should own the Tile actions.
         * @param {object} oPageData The Page data of the given vizInstance.
         * @returns {sap.m.Button|undefined} The created "Move" Tile action button or "undefined" when there should be no move Tile action
         * @private
         * @since 1.107.0
         */
        _createMoveTileActionButton: function (oVizInstance, oPageData) {
            var sPageId = (oPageData ? oPageData.id : "");
            var bIsMyHome = (sPageId === this._sMyHomePageId);
            var bPersonalizationEnabled = Config.last("/core/shell/enablePersonalization");
            var aPersonalizableSections = oPageData.sections.filter(function (oSection) { return !oSection.default; });
            var bTileIsInDefaultSection = oVizInstance.getParent().getBindingContext().getProperty("default");
            if ((bPersonalizationEnabled || bIsMyHome) && (aPersonalizableSections.length >= (bTileIsInDefaultSection ? 1 : 2))) {
                var oButton = new Button({
                    text: resources.i18n.getText("moveTile_action"),
                    press: [oVizInstance, this._openMoveVisualizationDialog, this]
                });
                oVizInstance.addTileAction(oButton);
                return oButton;
            }
        },

        /**
         * Opens a dialog which allows the user to move a visualization to a different section.
         *
         * @param {sap.ui.base.Event} oEvent SAP UI5 event object
         * @param {sap.ushell.ui.launchpad.VizInstance} oVizInstance The VizInstance to be moved.
         * @returns {Promise<undefined>} Resolves when the Move Visualization Dialog is opened.
         */
        _openMoveVisualizationDialog: function (oEvent, oVizInstance) {
            this._oVizInstanceToBeMoved = oVizInstance;
            var oVizInstanceToBeMovedContextPath = oVizInstance.getBindingContext().getPath();
            var aVizInstancePathParts = oVizInstanceToBeMovedContextPath.split("/");
            var sSectionID = oVizInstance.getParent().getBindingContext().getProperty("id");
            var sBindingPath = "/pages/" + aVizInstancePathParts[2] + "/sections";

            if (!this._oMoveVisualizationDialogPromise) {
                this._oMoveVisualizationDialogPromise = new Promise(function (resolve) {
                    sap.ui.require(["sap/ui/core/Fragment"], function (Fragment) {
                        Fragment.load({
                            name: "sap.ushell.components.pages.MoveVisualization",
                            controller: this
                        }).then(function (oDialog) {
                            this.getView().addDependent(oDialog);
                            resolve(oDialog);
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }

            return this._oMoveVisualizationDialogPromise.then(function (oDialog) {
                oDialog.bindObject({ path: sBindingPath });
                oDialog.getBinding("items").filter([
                    new Filter("default", FilterOperator.EQ, false),
                    new Filter("id", FilterOperator.NE, sSectionID)
                ]);
                oDialog.open();
            });
        },

        /**
         * Adds the given vizInstance to the My Home page.
         *
         * @param {sap.ui.base.Event} oEvent The click event.
         * @param {sap.ushell.ui.launchpad.VizInstance} oVizInstance The vizInstance that should be added to the My Home page.
         * @return {Promise<undefined>} A promise resolving when the vizInstance was added to the My Home page
         * @private
         */
        _addToMyHome: function (oEvent, oVizInstance) {
            var oVizData = oVizInstance.getBindingContext().getObject();

            return this.getOwnerComponent().getPagesService().then(function (oPagesService) {
                return oPagesService.copyVisualization(this._sMyHomePageId, null, oVizData);
            }.bind(this)).then(function () {
                MessageToast.show(resources.i18n.getText("PageRuntime.Message.VisualizationAddedToMyHome"));
            });
        },

        /**
         * The event handler which is called after a Section is selected in the MoveVisualization dialog.
         * The Visualization move happens directly after selecting a Section from the dialog list.
         * A message is announced to the user confirming the success of the move.
         *
         * @param {sap.ui.base.Event} oEvent SAP UI5 event object.
         * @return {Promise<undefined>} Resolves after the Visualization is moved.
         */
        _confirmSelect: function (oEvent) {
            var oVizInstanceToBeMovedContextPath = this._oVizInstanceToBeMoved.getBindingContext().getPath();
            var aVizInstancePathParts = oVizInstanceToBeMovedContextPath.split("/");

            var iPageIndex = aVizInstancePathParts[2];
            var iCurrentSectionIndex = aVizInstancePathParts[4];
            var iCurrentVizIndex = aVizInstancePathParts[6];

            var sTargetPath = oEvent.getParameter("selectedItem").getBindingContext().getPath();
            var aTargetPathParts = sTargetPath.split("/");

            var iTargetSectionIndex = aTargetPathParts[4];
            var oSourceSection = this._getAncestorControl(this._oVizInstanceToBeMoved, "sap.ushell.ui.launchpad.Section");
            var oPage = this._getAncestorControl(this._oVizInstanceToBeMoved, "sap.ushell.ui.launchpad.Page");
            var aSections = oPage.getSections();
            var oTargetSection = aSections[iTargetSectionIndex];
            var sArea = oSourceSection.getItemPosition(this._oVizInstanceToBeMoved).area;

            this._oVizInstanceToBeMoved = null;
            var oComponent = this.getOwnerComponent();
            return oComponent.getPagesService()
                .then(function (oPagesService) {
                    return oPagesService.moveVisualization(iPageIndex, iCurrentSectionIndex, iCurrentVizIndex, iTargetSectionIndex, -1);
                })
                .then(function (oResult) {
                    var oViz = oTargetSection.getVisualizations()[oResult.visualizationIndex];
                    if (oViz) {
                        oTargetSection.focusVisualization(oViz);
                    }
                    var sMessage = this._getVizMoveMessage(iCurrentSectionIndex, iTargetSectionIndex, sArea, sArea);
                    MessageToast.show(sMessage);
                }.bind(this));
        },

        /**
         * The event handler which is called when the user searches in the MoveVisualization dialog.
         * @param {sap.ui.base.Event} oEvent SAP UI5 event object.
         */
        _onMoveTileSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("title", FilterOperator.Contains, sValue);
            var oDefaultGroupFilter = new Filter("default", FilterOperator.EQ, false);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter, oDefaultGroupFilter]);
        },

        /**
         * The event handler which is called when the user presses cancel in the MoveVisualization dialog.
         * @param {sap.ui.base.Event} oEvent SAP UI5 event object.
         */
        _onMoveTileDialogClose: function (oEvent) {
            this._oVizInstanceToBeMoved = null;
        },

        /**
         * Searches for the Tile control
         * @param {string} sPageId The id of the page
         * @param {string} sSectionId The id of the section
         * @param {string} sVizRefId The id of the vizRef
         *
         * @returns {sap.ui.core.Control} The requested tile control
         * @private
         * @since 1.111
         */
        _getVizInstanceById: function (sPageId, sSectionId, sVizRefId) {
            var oNavContainer = this.byId("pagesNavContainer");

            var oMatchingPage = oNavContainer.getPages().find(function (oPage) {
                return oPage.getBindingContext().getObject().id === sPageId;
            });

            if (!oMatchingPage) {
                return null;
            }

            var oLaunchpadPage = oMatchingPage.getContent()[0];
            var oMatchingSection = oLaunchpadPage.getSections().find(function (oSection) {
                return oSection.getBindingContext().getObject().id === sSectionId;
            });

            if (!oMatchingSection) {
                return null;
            }

            var oMatchingVisualization = oMatchingSection.getVisualizations().find(function (oVisualization) {
                return oVisualization.getBindingContext().getObject().id === sVizRefId;
            });

            return oMatchingVisualization || null;
        },

        /**
         * Updates the displayFormatHint property of the visualization
         *
         * @param {sap.ui.base.Event} oEvent
         *  SAPUI5 event object. The source is used to identify the visualization which should be updated.
         * @param {sap.ushell.DisplayFormat} sNewDisplayFormatHint
         *  The new displayFormatHint which is used to update the current displayFormatHint property.
         *
         * @returns {Promise<undefined>} A promise which is resolved as soon as the visualization was updated.
         * @private
         * @since 1.84
         */
        _updateVisualizationDisplayFormat: function (oEvent, sNewDisplayFormatHint) {
            var oContext = oEvent.getSource().getBindingContext();
            var sPath = oContext.getPath();
            var aPathParts = sPath.split("/");
            var sOldDisplayFormatHint;
            var iCurrentSectionIndex = aPathParts[4];
            var iTargetSectionIndex = aPathParts[4];

            var oComponent = this.getOwnerComponent();
            return oComponent.getPagesService()
                .then(function (oPagesService) {
                    sOldDisplayFormatHint = oPagesService.getModel().getProperty(sPath).displayFormatHint;
                    var oVizData = {
                        displayFormatHint: sNewDisplayFormatHint
                    };
                    // pageIndex, sectionIndex, visualizationIndex
                    return oPagesService.updateVisualization(aPathParts[2], aPathParts[4], aPathParts[6], oVizData);
                })
                .then(function (oData) {
                    var oVizInstance = this._getVizInstanceById(oData.pageId, oData.sectionId, oData.vizRefId);
                    var oSection = this._getAncestorControl(oVizInstance, "sap.ushell.ui.launchpad.Section");
                    if (oSection) {
                        oSection.focusVisualization(oVizInstance);
                    }
                    var sMessage = this._getVizMoveMessage(iCurrentSectionIndex, iTargetSectionIndex, sOldDisplayFormatHint, sNewDisplayFormatHint);
                    MessageToast.show(sMessage);
                }.bind(this));
        },

        /**
         * Press handler which is called upon visualization press.
         * Used only in Display Mode and when clicking on the Visualization's "x" in Edit Mode.
         *
         * @param {sap.ui.base.Event} oEvent SAPUI5 event object
         * @returns {Promise<undefined>} Resolves with an empty value
         * @since 1.75
         * @private
         */
        onVisualizationPress: function (oEvent) {
            var sScope = oEvent.getParameter("scope");
            var sAction = oEvent.getParameter("action");
            var oVisualization = oEvent.getSource();
            var oContext = oVisualization.getBindingContext();
            var sPath = oContext.getPath();
            var aPathParts = sPath.split("/");
            var oSection = this._getAncestorControl(oVisualization, "sap.ushell.ui.launchpad.Section");

            if (sScope === "Display" && sAction === "Press") {
                // This scope & action will probably lead to an application to be loaded
                // With this the StateManager will refresh the visualization once navigating back to the launchpad
                StateManager.addVisualizationForRefresh(oVisualization);
            } else if (sScope === "Actions" && sAction === "Remove") {
                return this.getOwnerComponent().getPagesService().then(function (oPagesService) {
                    var oOldPosition = oSection.getItemPosition(oVisualization);
                    // pageIndex, sectionIndex, visualizationIndex
                    oPagesService.deleteVisualization(aPathParts[2], aPathParts[4], aPathParts[6]);
                    MessageToast.show(resources.i18n.getText("PageRuntime.Message.VisualizationRemoved"));
                    oSection._focusItem(oOldPosition);
                });
            }

            return Promise.resolve();
        },

        /**
         * UI5 lifecycle method which is called upon controller destruction.
         * It detaches the router events and config listeners.
         *
         * @private
         * @since 1.72.0
         */
        onExit: function () {
            this.oContainerRouter.getRoute("home").detachMatched(this.onRouteMatched, this);
            this.oContainerRouter.getRoute("openFLPPage").detachMatched(this.onRouteMatched, this);
            this._aConfigListeners.off();
            this.oEventHubListener.off();
            this._oEventBus.unsubscribe("launchpad", "shellFloatingContainerIsDocked", this._handleUshellContainerDocked, this);
            this._oEventBus.unsubscribe("launchpad", "shellFloatingContainerIsUnDocked", this._handleUshellContainerDocked, this);
            StateManager.exit();

            var oActionModeButton = sap.ui.getCore().byId("ActionModeBtn");
            if (oActionModeButton) {
                oActionModeButton.destroy();
            }
        },

        /**
         * Hides the action mode button
         *
         * @private
         * @since 1.84.0
         */
        _hideActionModeButton: function () {
            var oActionModeButton = sap.ui.getCore().byId("ActionModeBtn");
            Log.debug("cep/editMode: hide Action Mode Button", "Page runtime");
            if (oActionModeButton) {
                oActionModeButton.setVisible(false);
            }
        },

        /**
         * Shows the action mode button
         *
         * @private
         * @since 1.84.0
         */
        _showActionModeButton: function () {
            var oActionModeButton = sap.ui.getCore().byId("ActionModeBtn");
            if (oActionModeButton) {
                oActionModeButton.setVisible(true);
            }
        },

        /**
         * Check if the Edit Page action should be rendered as a header button
         *
         * @returns {boolean} True if the action is rendered as the shell header button instead of the user menu entry
         * @since 1.98
         * @private
         */
        _moveEditActionToHeader: function () {
            var oRenderer = sap.ushell.Container.getRenderer("fiori2");
            var bMoveEditButtonToHeader = oRenderer.getShellConfig().moveEditHomePageActionToShellHeader;
            // Move the action to the header only if personalization is enabled.
            // Otherwise, the action "Add Tiles To My Home" is always rendered in user menu and never as a shell button.
            // See _setActionModeLogic() and _setActionButtonText().
            return bMoveEditButtonToHeader && Config.last("/core/shell/enablePersonalization");
        },

        /**
         * Creates the action mode button to edit pages.
         * Based on the config, the button will be created in the header or the user menu
         *
         * @param {string} sPageTitle The title of the page
         *
         * @private
         * @since 1.86.0
         */
        _createActionModeButton: function (sPageTitle) {
            var sButtonText = sPageTitle ? resources.i18n.getText("PageRuntime.EditModeForPage.Activate", sPageTitle)
                : resources.i18n.getText("PageRuntime.EditMode.Activate");
            var oActionButtonObjectData = {
                id: "ActionModeBtn",
                text: sButtonText,
                icon: "sap-icon://edit",
                press: [this.pressActionModeButton, this]
            };
            Log.debug("cep/editMode: create Action Mode Button", "Page runtime");
            if (this._moveEditActionToHeader()) {
                oActionButtonObjectData.tooltip = sButtonText;
                this._createHeaderActionModeButton(oActionButtonObjectData);
            } else {
                this._createUserActionModeButton(oActionButtonObjectData);
            }
        },

        /**
         * Creates the action mode button in the shell header.
         *
         * @param {object} oActionButtonObjectData the button property
         *
         * @private
         * @since 1.86.0
         */
        _createHeaderActionModeButton: function (oActionButtonObjectData) {
            sap.ui.require(["sap/ushell/ui/shell/ShellHeadItem"], function (ShellHeadItem) {
                var oActionsButton = new ShellHeadItem(oActionButtonObjectData);
                if (Config.last("/core/extension/enableHelp")) {
                    oActionsButton.addStyleClass("help-id-ActionModeBtn"); // xRay help ID
                }
                var oRenderer = sap.ushell.Container.getRenderer("fiori2");
                var oStateInfo = this._getStateInfoActionModeButton();
                oRenderer.showHeaderEndItem(oActionsButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
            }.bind(this));
        },

        /**
         * Tells for which states the [Edit Current Page] button is relevant
         *
         * This information is needed when calling the renderer API.
         * @returns {{bCurrentState:boolean, aStates:string[]}}}
         *    <code>bCurrentState</code> indicates if the ActionModeButton is relevant for the ushell current state only.
         *    <code>aStates</code> indicates if the button is relevant for a list of states.
         *
         * @private
         * @since 1.101.0
         */
        _getStateInfoActionModeButton: function () {
            // Relevant for current state only if home and root intent differ
            // ... This is the work zone's use case.
            if (!this.bIsHomeIntentRootIntent) {
                return {
                    bCurrentState: true,
                    aStates: null
                };
            }

            // Relevant for the ushell home state otherwise
            return {
                bCurrentState: false,
                aStates: ["home"]
            };
        },

        /**
         * Creates the user action menu entry for the action mode.
         *
         * @param {object} oActionModeButtonObjectData the button property
         *
         * @private
         * @since 1.74.0
         */
        _createUserActionModeButton: function (oActionModeButtonObjectData) {
            var oStateInfo = this._getStateInfoActionModeButton();
            var oAddActionButtonParameters = {
                controlType: "sap.ushell.ui.launchpad.ActionItem",
                oControlProperties: oActionModeButtonObjectData,
                bIsVisible: true,
                bCurrentState: oStateInfo.bCurrentState,
                aStates: oStateInfo.aStates
            };
            var oRenderer = sap.ushell.Container.getRenderer("fiori2");
            oRenderer.addUserAction(oAddActionButtonParameters).done(function (oActionButton) {
                // if xRay is enabled
                if (Config.last("/core/extension/enableHelp")) {
                    oActionButton.addStyleClass("help-id-ActionModeBtn");// xRay help ID
                }
                this._setActionButtonText();
            }.bind(this));
        },

        /**
         * Handles the button press on the user action menu entry.
         *
         * @private
         * @since 1.74.0
         */
        pressActionModeButton: function () {
            var oViewSettingsModel = this.getView().getModel("viewSettings");
            var bActionModeActive = oViewSettingsModel.getProperty("/actionModeActive");
            var bPersonalizationEnabled = oViewSettingsModel.getProperty("/personalizationEnabled");
            var bAddToMyHomeOnly = oViewSettingsModel.getProperty("/addToMyHomeOnly");

            sap.ui.require([
                "sap/ushell/components/pages/ActionMode"
            ], function (ActionMode) {
                if (bActionModeActive) {
                    ActionMode.cancel();
                    return;
                } else if (bPersonalizationEnabled || bAddToMyHomeOnly || this._isMyHomeRouteActive()) {
                    ActionMode.start(this, bAddToMyHomeOnly ? resources.i18n.getText("PageRuntime.EditMode.ExitAddTilesMode") : null);
                }
            }.bind(this));
        },

        /**
         * Cancels the action mode in case it is active
         *
         * @private
         * @since 1.84.0
         */
        _cancelActionMode: function () {
            var bActionModeActive = this.getView().getModel("viewSettings").getProperty("/actionModeActive");
            if (bActionModeActive) {
                sap.ui.require([
                    "sap/ushell/components/pages/ActionMode"
                ], function (ActionMode) {
                    ActionMode.cancel();
                });
            }
        },

        /**
         * Generic handler for action mode actions
         *
         * @param {string} sHandler Name of the handler within the action mode module
         * @param {sap.ui.base.Event} oEvent Event object
         * @param {sap.ui.core.Control} oSource Source control
         * @param {object} oParameters Event parameters
         * @private
         * @since 1.74.0
         */
        handleEditModeAction: function (sHandler, oEvent, oSource, oParameters) {
            sap.ui.require([
                "sap/ushell/components/pages/ActionMode"
            ], function (ActionMode) {
                Log.debug("cep/editMode: handle Edit Mode Action", "Page runtime");
                ActionMode[sHandler](oEvent, oSource, oParameters);
            });
        },

        /**
         * Finds the ancestor control with a certain control type.
         *
         * @param {sap.ui.core.Control} control The control to start the search from.
         * @param {string} controlType The control type that matches the control that should be found and returned.
         * @returns {sap.ui.core.Control} A parent control that matches the given control type or null.
         * @private
         * @since 1.84.0
         */
        _getAncestorControl: function (control, controlType) {
            if (control && control.isA && control.isA(controlType)) {
                return control;
            } else if (control && control.getParent) {
                return this._getAncestorControl(control.getParent(), controlType);
            }
            return null;
        },

        /**
         * Handler for visualization drag and drop.
         *
         * @param {sap.ui.base.Event} oEvent Event object.
         * @returns {Promise<undefined>} Resolves when the Pages service is retrieved.
         * @private
         * @since 1.75.0
         */
        moveVisualization: function (oEvent) {
            var oDragged = oEvent.getParameter("draggedControl");
            var oDropped = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");
            var oBrowserEvent = oEvent.getParameter("browserEvent");
            var sKeyCode = oBrowserEvent && oBrowserEvent.keyCode;
            var oPage = this._getAncestorControl(oDragged, "sap.ushell.ui.launchpad.Page");
            var iPageIndex = parseInt(oDragged.getBindingContext().getPath().split("/")[2], 10);
            var oCurrentSection = this._getAncestorControl(oDragged, "sap.ushell.ui.launchpad.Section");
            var iCurrentSectionIndex = oPage.indexOfSection(oCurrentSection);
            var iCurrentVizIndex = oCurrentSection.indexOfVisualization(oDragged);
            var oCurrentViz = oCurrentSection.getVisualizations()[iCurrentVizIndex];
            var oCurrentPos = oCurrentSection.getItemPosition(oCurrentViz);
            var oTargetSection;
            var iTargetSectionIndex;
            var iTargetVizIndex;
            var oTargetViz;
            var oTargetPos;

            if (!oDropped) { // Target is an empty area of the section or an inner compactArea dnd (only happens during keyboard dnd)
                var bUp = oEvent.mParameters.browserEvent.keyCode === KeyCodes.ARROW_UP;
                var aSection = oPage.getSections();
                iTargetSectionIndex = iCurrentSectionIndex;

                while (true) {
                    iTargetSectionIndex = bUp ? --iTargetSectionIndex : ++iTargetSectionIndex;
                    oTargetSection = aSection[iTargetSectionIndex];

                    if (!oTargetSection || oTargetSection.getDefault()) {
                        oCurrentViz.invalidate();
                        return Promise.resolve();
                    }

                    if (oTargetSection.getShowSection() || oTargetSection.getEditable()) {
                        iTargetVizIndex = oTargetSection.getClosestCompactItemIndex(oDragged.getDomRef(), bUp);
                        oTargetViz = oTargetSection.getVisualizations()[iTargetVizIndex];
                        oTargetPos = oTargetSection.getItemPosition(oTargetViz);
                        if (oTargetPos.area !== oCurrentPos.area) {
                            oTargetPos = oCurrentPos;
                        }
                        break;
                    }
                }
            } else {
                // when dropping on the CompactArea, pretend it was dropped after its last item
                if (oDropped.isA("sap.ushell.ui.launchpad.section.CompactArea")) {
                    var aItems = oDropped.getItems();
                    if (aItems.length) {
                        oDropped = aItems[aItems.length - 1];
                        sDropPosition = "After";
                    }
                }

                oTargetSection = this._getAncestorControl(oDropped, "sap.ushell.ui.launchpad.Section");
                iTargetSectionIndex = oPage.indexOfSection(oTargetSection);

                if (oTargetSection.getDefault() && !oCurrentSection.getDefault()) {
                    oCurrentViz.invalidate();
                    return Promise.resolve();
                }

                iTargetVizIndex = oTargetSection.indexOfVisualization(oDropped);
                oTargetViz = oTargetSection.getVisualizations()[iTargetVizIndex];
                oTargetPos = oTargetSection.getItemPosition(oTargetViz);

                if (oTargetPos.index === -1) {
                    oTargetPos.area = oCurrentPos.area;
                }

                if (iCurrentSectionIndex === iTargetSectionIndex) {
                    if (sDropPosition === "Before" && iCurrentVizIndex < iTargetVizIndex) {
                        iTargetVizIndex--;
                    } else if (sDropPosition === "After" && iCurrentVizIndex > iTargetVizIndex) {
                        iTargetVizIndex++;
                    }

                    if (iCurrentVizIndex === iTargetVizIndex && oTargetPos.area === oCurrentPos.area) {
                        oCurrentViz.invalidate();
                        return Promise.resolve();
                    }
                } else if (sDropPosition === "After") {
                    iTargetVizIndex++;
                }
            }

            if ((iCurrentSectionIndex !== iTargetSectionIndex)
                && (sKeyCode === KeyCodes.ARROW_UP || sKeyCode === KeyCodes.ARROW_DOWN) // only adjust if keyboard dnd
                && (oCurrentPos.index > oTargetPos.index)) {
                iTargetVizIndex++;
            }

            var oPagesService;
            var oComponent = this.getOwnerComponent();
            return oComponent.getPagesService()
                .then(function (oService) {
                    oPagesService = oService;
                    oPagesService.enableImplicitSave(false);
                    return oPagesService.moveVisualization(
                        iPageIndex,
                        iCurrentSectionIndex,
                        iCurrentVizIndex,
                        iTargetSectionIndex,
                        iTargetVizIndex
                    );
                })
                .then(function (oResult) {
                    iTargetVizIndex = oResult.visualizationIndex;
                    if (oCurrentPos.area !== oTargetPos.area) {
                        var oVizData = {
                            displayFormatHint: oTargetPos.area
                        };
                        return oPagesService.updateVisualization(iPageIndex, iTargetSectionIndex, iTargetVizIndex, oVizData);
                    }
                    return Promise.resolve();
                })
                .then(function () {
                    return oPagesService.savePersonalization();
                })
                .then(function () {
                    var oViz = oTargetSection.getVisualizations()[iTargetVizIndex];
                    if (oViz) {
                        oTargetSection.focusVisualization(oViz);
                        oViz.invalidate();
                    }
                    var sMessage = this._getVizMoveMessage(iCurrentSectionIndex, iTargetSectionIndex, oCurrentPos.area, oTargetPos.area);
                    MessageToast.show(sMessage);
                }.bind(this))
                .finally(function () {
                    oPagesService.enableImplicitSave(true);
                });
        },

        /**
         * Returns the text message that should be announced after moving a Tile.
         * The message depends on the source and destination content areas.
         *
         * @param {sap.ushell.DisplayFormat} sFromAreaType The source content area
         * @param {sap.ushell.DisplayFormat} sToAreaType The target content area
         * @returns {string} The text message that should be announced
         * @private
         * @since 1.85.0
         */

        _getVizMoveMessage: function (iCurrentSectionIndex, iTargetSectionIndex, sFromAreaType, sToAreaType) {
            if (iCurrentSectionIndex === iTargetSectionIndex) {
                if (sFromAreaType !== sToAreaType) {
                    return resources.i18n.getText("PageRuntime.Message.VisualizationConverted");
                }
            }
            if (sFromAreaType === sToAreaType) {
                return resources.i18n.getText("PageRuntime.Message.VisualizationMoved");
            }
            return resources.i18n.getText("PageRuntime.Message.VisualizationMovedAndConverted");
        },

        /**
         * Handler for visualization drag and drop, when a dragged item enters a section.
         * Disables drop into a default section.
         * However, it is still possible to rearrange tiles inside of the default section.
         *
         * @param {sap.ui.base.Event} oEvent Event object
         * @private
         * @since 1.75.0
         */
        onDragEnter: function (oEvent) {
            var oTargetSection = oEvent.getParameter("dragSession").getDropControl();

            if (oTargetSection.getDefault()) {
                oEvent.preventDefault();
            }
        },

        /**
         * Handler for visualization drag and drop, when a dragged item enters an area inside a section.
         * Checks if the vizInstance supports the display format of the target area.
         *
         * @param {sap.ui.base.Event} oEvent Event object
         * @private
         * @since 1.84.0
         */
        onAreaDragEnter: function (oEvent) {
            var sSourceArea = oEvent.getParameter("sourceArea");
            var sTargetArea = oEvent.getParameter("targetArea");

            // same area means no change of the display format
            if (sSourceArea === sTargetArea) {
                return;
            }

            var oVizInstance = oEvent.getParameter("dragControl");
            var aAvailableDisplayFormats = oVizInstance.getAvailableDisplayFormats();

            if (aAvailableDisplayFormats.indexOf(sTargetArea) === -1) {
                // VizInstance only supports standardWide
                if (sTargetArea === DisplayFormat.Standard && aAvailableDisplayFormats.indexOf(DisplayFormat.StandardWide) > -1) {
                    return;
                }
                // VizInstance only supports flatWide
                if (sTargetArea === DisplayFormat.Flat && aAvailableDisplayFormats.indexOf(DisplayFormat.FlatWide) > -1) {
                    return;
                }
                oEvent.getParameter("originalEvent").preventDefault();
            }
        },

        /**
         * Handles the resize event triggered by copilot docking, the grid container containerQuery must be enabled in this case.
         *
         * @param {string} channel The channel name of the event
         * @param {string} event The name of the event
         * @since 1.77.0
         * @private
         */
        _handleUshellContainerDocked: function (channel, event) {
            this._oViewSettingsModel.setProperty("/ushellContainerDocked", event === "shellFloatingContainerIsDocked");
        },

        /**
         * Returns true if the MyHome feature is enabled and the current spaceId matches the MyHome space id.
         *
         * @returns {boolean} The boolean result.
         * @private
         * @since 1.89.0
         */
        _isMyHomeRouteActive: function () {
            return Config.last("/core/spaces/myHome/enabled") && Config.last("/core/spaces/myHome/userEnabled") &&
                Config.last("/core/spaces/myHome/myHomeSpaceId") === this.sCurrentTargetSpaceId;
        },

        /** Returns the home page data as stored in the model or null if the home page is not present
         * @returns {object} Home page data
         * @private
         */
        _getMyHomePageData: function () {
            var aPages = this.getView().getModel().getProperty("/pages") || [];
            for (var i = 0; i < aPages.length; i++) {
                if (aPages[i] && aPages[i].id === "SAP_BASIS_PG_UI_MYHOME") {
                    return aPages[i];
                }
            }
            return null;
        },

        /** Returns true if the page is empty
         * @returns {boolean} The boolean result
         * @private
         */
        _isMyHomePageEmpty: function () {
            var oPage = this._getMyHomePageData();
            if (oPage && oPage.sections) {
                return oPage.sections.every(function (oSection) {
                    var aViz = oSection.visualizations;
                    return !(aViz && aViz.length); // all sections must be empty
                });
            }
            return false;
        },

        /**
         * If editMode is entered:
         * - checks if the editMode is entered from the initial MyHome page and navigates to the 'real' MyHome page.
         * If editMode is left:
         * - checks if the editMode is left from the 'real' MyHome page and navigates to the initial MyHome page.
         *
         * @private
         * @param {boolean} editMode Boolean indicating if editMode is entered or left.
         * @returns {Promise<undefined>} A promise resolving when navigation is finished.
         * @since 1.89.0
         */
        handleMyHomeActionMode: function (editMode) {
            if (this._isMyHomeRouteActive()) {
                if (editMode) {
                    return this._enterMyHomeActionMode(); // Add message strip in edit mode
                } else if (this._isMyHomePageEmpty()) {
                    return this._navigateToInitialMyHome(); // Navigate to illustrated page
                }
            }
            return Promise.resolve(); // Do nothing - normal navigation
        },

        /**
         * Navigates to the 'real' MyHome page and adds a MessageStrip.
         *
         * @returns {Promise<undefined>} A promise resolving when the navigation is completed.
         * @private
         * @since 1.89.0
         */
        _enterMyHomeActionMode: function () {
            return Promise.all([
                this._navigate(this.sCurrentTargetPageId, this.sCurrentTargetSpaceId, true),
                MyHomeImport.isImportEnabled()
            ]).then(function (aResult) {
                if (!aResult[1]) {
                    if (this._pMessageStrip) { // do not show the message strip after user dismissed it
                        this._pMessageStrip.then(function (messageStrip) {
                            messageStrip.setVisible(false);
                        });
                    }
                    return Promise.resolve(); // Import is disabled. Don't show the message strip
                }
                if (!this._pMessageStrip) {
                    this._pMessageStrip = new Promise(function (resolve, reject) {
                        sap.ui.require(["sap/ui/core/Fragment"], function (Fragment) {
                            Fragment.load({
                                name: "sap.ushell.components.pages.view.MessageStrip",
                                controller: this
                            }).then(function (messageStrip) {
                                // In case the message strip visibility is managed in another place
                                EventHub.on("importBookmarksFlag").do(function (value) {
                                    messageStrip.setVisible(!!value);
                                });
                                messageStrip.addStyleClass("sapUiSmallMarginBottom");
                                resolve(messageStrip);
                            }).catch(reject);
                        }.bind(this), reject);
                    }.bind(this));
                }

                return this._pMessageStrip.then(function (messageStrip) {
                    this.oPagesNavContainer.getCurrentPage().getContent()[0].setMessageStrip(messageStrip);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Loads and opens the import dialog for the MyHome page.
         *
         * @returns {Promise<sap.m.Dialog>} A promise resolving to the dialog, when opened.
         * @private
         * @since 1.89.0
         */
        openMyHomeImportDialog: function () {
            if (!this._pLoadImportDialog) {
                this._pLoadImportDialog = new Promise(function (resolve, reject) {
                    sap.ui.require(["sap/ushell/components/pages/controller/ImportDialog.controller"], function (ImportDialogController) {
                        resolve(new ImportDialogController());
                    }, reject);
                });
            }
            return this._pLoadImportDialog.then(function (oImportDialogController) {
                return oImportDialogController.open();
            });
        },

        /**
         * Opens the MyHome import dialog.
         * @private
         * @since 1.89.0
         */
        onImportDialogPress: function () {
            this.openMyHomeImportDialog();
        },

        /**
         * The user has pressed "x" button on the import MessageStrip. Save the decision
         * @private
         */
        onMessageStripClose: function () {
            MyHomeImport.setImportEnabled(false);
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                MessageBox.information(resources.i18n.getText("MyHome.InitialPage.MessageStrip.Popup"));
            });
        },

        /**
         * Removes the MyHome page from the PagesNavContainer.
         *
         * @private
         */
        _removeMyHomePage: function () {
            this.oPagesNavContainer.removePage("sapUshellMyHomePage");
        },

        /**
         * Formatter to show/hide the 'Reset' button for a section.
         *
         * @param {string} sectionId The section id.
         * @param {boolean} preset The preset property.
         * @returns {boolean} The result.
         * @private
         */
        _sectionEnableReset: function (sectionId, preset) {
            // Determine the preset 'My Apps' section on the My Home page.
            if (sectionId === Config.last("/core/spaces/myHome/presetSectionId")) {
                return false;
            }
            return preset;
        },

        /**
         * Formatter to show/hide the 'Delete' button for a section.
         *
         * @param {string} sectionId The section id.
         * @param {boolean} preset The preset property.
         * @returns {boolean} The result.
         * @private
         */
        _sectionEnableDelete: function (sectionId, preset) {
            // Determine the preset 'My Apps' section on the My Home page.
            if (sectionId === Config.last("/core/spaces/myHome/presetSectionId")) {
                return false;
            }
            return !preset;
        },

        /**
         * Hides the Pages Runtime.
         * Navigates the Pages Runtime NavContainer to the empty page.
         * @private
         */
        hideRuntime: function () {
            Log.debug("cep/editMode: navigate to empty page", "Page runtime");
            this._hideActionModeButton();
            this.oPagesRuntimeNavContainer.to(this.oEmptyPage);
        }
    });
});
