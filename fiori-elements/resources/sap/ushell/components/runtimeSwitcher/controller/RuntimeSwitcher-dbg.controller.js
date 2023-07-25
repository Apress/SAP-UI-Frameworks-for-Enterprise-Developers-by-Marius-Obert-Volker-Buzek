//Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file RuntimeSwitcher's controller for RuntimeSwitcher's view
 * @version 1.113.0
 */
 sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/pages/controller/PagesAndSpaceId"
 ], function (
    Controller,
    PagesAndSpaceId
) {
    "use strict";

    /**
     * Controller of the RuntimeSwitcher view
     *
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.106.0
     * @alias sap.ushell.components.runtimeSwitcher.controller.RuntimeSwitcher
     */
    return Controller.extend("sap.ushell.components.runtimeSwitcher.controller.RuntimeSwitcher", /** @lends sap.ushell.components.runtimeSwitcher.controller.RuntimeSwitcher.prototype */ {
        /**
         * UI5 lifecycle method which is called upon controller initialization.
         * @return {Promise} Resolves when the routing has been handled.
         * @since 1.106.0
         * @private
         */
        onInit: function () {
            this.oNavContainer = this.byId("switcherNavContainer");
            this.oPagesRuntime = this.byId("pagesRuntime");
            this.oWorkpageRuntime = this.byId("workpagesRuntime");

            return this._handleRouter()
                .then(function () {
                    var oRenderer = sap.ushell.Container.getRenderer();
                    this.oContainerRouter = oRenderer.getRouter();
                    this.oContainerRouter.getRoute("home").attachMatched(this._handleRouter, this);
                    this.oContainerRouter.getRoute("openFLPPage").attachMatched(this._handleRouter, this);
                }.bind(this));
        },


        /**
         * Decides which component should be loaded/navigated to
         * @return {Promise} A promise that resolves when the component is loaded
         * @private
         */
        _handleRouter: function () {
            var sPageId;
            return Promise.all([
                PagesAndSpaceId._getPageAndSpaceId(),
                sap.ushell.Container.getServiceAsync("Menu")
            ])
                .then(function (aResults) {
                    var oMenuService;
                    sPageId = aResults[0] && aResults[0].pageId;
                    if (!sPageId) {
                        return Promise.reject("No pageId found");
                    }
                    oMenuService = aResults[1];
                    return oMenuService.isWorkPage(sPageId);
                })
                .then(function (bIsWorkPage) {
                    if (bIsWorkPage) {
                        this._toggleToWorkPagesRuntime();
                    } else {
                        this._toggleToPagesRuntime();
                    }
                }.bind(this))
                .catch(function () {
                    // Load pages runtime in error case to show proper error
                    this._toggleToPagesRuntime();
                }.bind(this));
        },

        /**
         * Call onRouteMatched on pages runtime, hide workpages runtime.
         * @since 1.107.0
         * @private
         */
        _toggleToPagesRuntime: function () {
            this.oNavContainer.to(this.oPagesRuntime);

            if (this.oWorkPageRuntimeComponent) {
                this.oWorkPageRuntimeComponent.hideRuntime();
            }

            if (this.oPageRuntimeComponent) {
                this.oPageRuntimeComponent.onRouteMatched();
            }
        },

        /**
         * Call onRouteMatched on workpages runtime, hide pages runtime.
         * @since 1.107.0
         * @private
         */
        _toggleToWorkPagesRuntime: function () {
            this.oNavContainer.to(this.oWorkpageRuntime);

            if (this.oPageRuntimeComponent) {
                this.oPageRuntimeComponent.hideRuntime();
            }

            if (this.oWorkPageRuntimeComponent) {
                this.oWorkPageRuntimeComponent.onRouteMatched();
            }
        },

        /**
         * Called if the component is destroyed.
         * Detaches route events.
         * @private
         */
        onExit: function () {
            this.oContainerRouter.getRoute("home").detachRouteMatched(this._handleRouter, this);
            this.oContainerRouter.getRoute("openFLPPage").detachRouteMatched(this._handleRouter, this);
        },

        /**
         * Called when the PageRuntime component was created.
         * Saves the PageRuntime controller instance and disables navigation for the component.
         *
         * @param {sap.ui.base.Event} oEvent The componentCreated event.
         * @private
         */
        pageComponentCreated: function (oEvent) {
            this.oPageRuntimeComponent = oEvent.getParameter("component");
        },

        /**
         * Called when the WorkPageRuntime component was created.
         * Saves the WorkPageRuntime controller instance and disables navigation for the component.
         *
         * @param {sap.ui.base.Event} oEvent The componentCreated event.
         * @private
         */
        workPageComponentCreated: function (oEvent) {
            this.oWorkPageRuntimeComponent = oEvent.getParameter("component");
        }
    });
});
