//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview WorkPageBuilder Component
 * This UIComponent gets initialized by the FLP renderer upon visiting a work page if work pages are enabled (/core/workPages/enabled).
 *
 * @version 1.113.0
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/base/util/ObjectPath",
    "sap/base/Log",
    "sap/ushell/services/VisualizationInstantiation"
], function (UIComponent, ObjectPath, Log, VisualizationInstantiation) {
    "use strict";

    /**
     * Component of the WorkPagesRuntime view.
     *
     * @param {string} sId Component id
     * @param {object} oSParams Component parameter
     *
     * @class
     * @extends sap.ui.core.UIComponent
     *
     * @private
     * @since 1.99.0
     * @alias sap.ushell.components.workPageBuilder.Component
     */
    return UIComponent.extend("sap.ushell.components.workPageBuilder.Component", /** @lends sap.ushell.components.workPageBuilder.Component */{
        metadata: {
            manifest: "json",
            library: "sap.ushell",
            events: {
                workPageEdited: {},
                visualizationFilterApplied: {
                    parameters: {
                        /**
                         * An array with objects containing {filterKey: "<key>", filterValue: "<value>"}
                         */
                        filters: { type: "array" }
                    }
                },
                closeEditMode: {
                    parameters: {
                        /**
                         * Indicates if the changes have to be saved
                         */
                        saveChanges: { type: "boolean" }
                    }
                }
            }
        },

        init: function () {
            this.oSiteApplications = {};
            this.oSiteVizTypes = {};
            /**
             * The VisualizationInstantiation service has to be instantiated like this (not with sap.ushell.Container.getServiceAsync)
             * This is because the admin UI is running in an iFrame and has no sap.ushell.Container.
             * If parent.sap.ushell.Container is used, the instantiated control uses sources from the parent frame (ManageObject, etc.),
             * which causes issues (e.g. isA does not work).
             * Might be changed at a later point, when there is a sap.ushell.Container also running inside the iFrame.
             */
            this._oVizInstantiationPromise = Promise.resolve(new VisualizationInstantiation());
            UIComponent.prototype.init.apply(this, arguments);
        },

        /**
         * Resolves with the ushell VizInstantiation service.
         *
         * @return {Promise<sap.ushell.services.VisualizationInstantiation>} A promise resolving to the VizInstantiation service.
         * @since 1.112.0
         * @private
         */
        getVizInstantiationPromise: function () {
            return this._oVizInstantiationPromise;
        },

        /**
         * API to call the getEditMode function on the WorkPageBuilder controller.
         * @return {boolean} Returns the value of editMode
         * @since 1.109.0
         * @private
         * @ui5-restricted portal-cf-*
        */
        getEditMode: function () {
            return this.getRootControl().getController().getEditMode();
        },

        /**
         * API to call the setEditMode function on the WorkPageBuilder controller.
         * @param {boolean} bEditMode true or false
         *
         * @since 1.109.0
         * @private
         * @ui5-restricted portal-cf-*
        */
        setEditMode: function (bEditMode) {
            this.getRootControl().getController().setEditMode(bEditMode);
        },

        /**
         * API to call the getPageData function on the WorkPageBuilder controller.
         * @return {{WorkPage: {Contents: object }}} Returns the pageData which might have been modified by the user.

         * @since 1.109.0
         * @private
         * @ui5-restricted portal-cf-*
        */
        getPageData: function () {
            return this.getRootControl().getController().getPageData();
        },

        /**
         * API to call the setPageData function on the WorkPageBuilder controller.
         * @param {{WorkPage: {Contents: object, UsedVisualizations: {nodes: object}}}} oPageData WorkPage data object
         * @return {Promise} A promise resolving when the data was set.
         *
         * @since 1.109.0
         * @private
         * @ui5-restricted portal-cf-*
        */
        setPageData: function (oPageData) {
            return Promise.all([
                this._transformVizData(ObjectPath.get("WorkPage.UsedVisualizations.nodes", oPageData) || [])
            ]).then(function (aResults) {
                var aPreparedVizData = aResults[0];
                this.getRootControl().getController().setPageData({
                    WorkPage: {
                        Contents: ObjectPath.get("WorkPage.Contents", oPageData),
                        UsedVisualizations: {
                            nodes: aPreparedVizData
                        }
                    }
                });
            }.bind(this));
        },

        /**
         * API to call the setVisualizationData function on the WorkPageRuntime controller.
         * @param {{Visualizations: {nodes: object[]}}} oVizNodes Array of Visualizations
         * @return {Promise} A promise resolving when the data was set.
         *
         * @since 1.109.0
         * @private
         * @ui5-restricted portal-cf-*
        */
        setVisualizationData: function (oVizNodes) {
            return this._transformVizData(ObjectPath.get("Visualizations.nodes", oVizNodes) || []).then(function (aPreparedVizData) {
                this.getRootControl().getController().setVisualizationData({ Visualizations: { nodes: aPreparedVizData } });
            }.bind(this));

        },

        /**
         * API to check if navigation is disabled
         * @return {boolean} Returns navigationDisabled
         * @since 1.110.0
         * @private
         * @ui5-restricted portal-cf-*
        */
        getNavigationDisabled: function () {
            return this.getRootControl().getController().getNavigationDisabled();
        },

        /**
         * API for enabling/disabling navigation
         * @param {boolean} bNavigation true or false
         *
         * @since 1.110.0
         * @private
         * @ui5-restricted portal-cf-*
        */
        setNavigationDisabled: function (bNavigation) {
            this.getRootControl().getController().setNavigationDisabled(bNavigation);
        },

        /**
         * Helper method to retrieve the sap.ushell.Container from the current frame or the parent frame.
         *
         * @since 1.110.0
         * @private
         * @return {sap.ushell.Container} The ushell container
         */
        getUshellContainer: function () {
            return ObjectPath.get("sap.ushell.Container") || ObjectPath.get("parent.sap.ushell.Container");
        },

        /**
         * API for showing/hiding Footer bar
         * @param {boolean} bVisible true or false
         *
         * @since 1.110.0
         * @private
         * @ui5-restricted portal-cf-*
        */
        setShowFooter: function (bVisible) {
            this.getRootControl().getController().setShowFooter(bVisible);
        },

        /**
         * NOTE:
         * The following methods are helper functions to retrieve additional site data
         * to the visualizations.
         * They do the following:
         * - replace the indicator data source for dynamic tiles (system context is required)
         *
         * These functions should be removed once this information is available from the content API
         */

        /**
         * Applies preparatory transformation on the visualization data.
         *
         * @param {object[]} aVizData The visualization data
         * @return {Promise<object[]>} The modified visualization data.
         * @since 1.110.0
         * @private
         */
        _transformVizData: function (aVizData) {
            var oContainer = this.getUshellContainer();
            var oStandardAppLauncherVizData;

            if (!oContainer) {
                return Promise.resolve(aVizData);
            }

            // performance optimization: load CDM site only if page contains standard app launcher visualizations
            oStandardAppLauncherVizData = aVizData.find(function (oVizData) {
                return (oVizData.Type === "sap.ushell.StaticAppLauncher")
                    || (oVizData.Type === "sap.ushell.DynamicAppLauncher");
            });
            if (!oStandardAppLauncherVizData) {
                return Promise.resolve(aVizData);
            }

            return Promise.all([
                oContainer.getServiceAsync("ClientSideTargetResolution"),
                oContainer.getServiceAsync("CommonDataModel")
            ]).then(function (aResults) {
                var oCstrService = aResults[0];
                var oCdmService = aResults[1];
                return this._saveSiteData(oCdmService).then(function () {
                    return this._replaceIndicatorDatasource(aVizData, oCstrService);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Replaces the indicatorDataSource path with the one returned by the system context, if required.
         * The site data must be loaded and saved before calling this method.
         *
         * @param {object[]} aVizData The visualization data.
         * @param {object} oCstrService The ClientSideTargetResolution ushell service.
         * @return {Promise<object[]>} A promise resolving with the modified vizData.
         * @since 1.110.0
         * @private
         */
        _replaceIndicatorDatasource: function (aVizData, oCstrService) {
            return Promise.all(
                aVizData.map(function (oVizData) {
                    var sAppId = ObjectPath.get(["Descriptor", "sap.flp", "target", "appId"], oVizData);
                    var oApplication = this.getSiteApplication(sAppId);
                    var oIndicatorDataSource = ObjectPath.get(["Descriptor", "sap.flp", "indicatorDataSource"], oVizData);
                    var sContentProviderId;

                    if (oApplication) {
                        sContentProviderId = ObjectPath.get(["sap.app", "contentProviderId"], oApplication);

                        if (sContentProviderId && oIndicatorDataSource && oIndicatorDataSource.path) {
                            return oCstrService.getSystemContext(sContentProviderId).then(function (oSystemContext) {
                                if (oSystemContext) {
                                    var sDataSourceId = oIndicatorDataSource.dataSource;
                                    var oDataSource = ObjectPath.get(["Descriptor", "sap.app", "dataSources", sDataSourceId], oVizData);
                                    var sFullyQualifiedXhrUrl;

                                    if (oDataSource) {
                                        sFullyQualifiedXhrUrl = oSystemContext.getFullyQualifiedXhrUrl(oDataSource.uri);
                                        ObjectPath.set(["Descriptor", "sap.app", "dataSources", sDataSourceId, "uri"],
                                            sFullyQualifiedXhrUrl, oVizData);
                                    } else {
                                        sFullyQualifiedXhrUrl = oSystemContext.getFullyQualifiedXhrUrl(oIndicatorDataSource.path);
                                        ObjectPath.set(["Descriptor", "sap.flp", "indicatorDataSource", "path"], sFullyQualifiedXhrUrl, oVizData);
                                    }
                                }
                                return oVizData;
                            }).catch(function (vError) {
                                Log.error(vError);
                                return oVizData;
                            });
                        }
                    }

                    return Promise.resolve(oVizData);
                }.bind(this))
            );
        },

        /**
         * This is an intermediate helper function to save some required site data in the component instance.
         * Since the site request will be removed in the future, this function is only temporary.
         * To be removed once all of the required data from the site request can be retrieved via content API.
         *
         * Saves the following from the site request:
         * - All applications
         * - All vizTypes
         *
         * @param {object} oCdmService The &quot;CommonDataModel&quot; ushell service instance
         * @return {Promise} A promise resolving when the data has been saved.
         * @since 1.110.0
         * @private
         */
        _saveSiteData: function (oCdmService) {
            return Promise.all([
                oCdmService.getApplications(),
                oCdmService.getVizTypes()
            ]).then(function (aResults) {
                this.oSiteApplications = aResults[0] || {};
                this.oSiteVizTypes = aResults[1] || {};
            }.bind(this));
        },

        /**
         * Returns the application descriptor for the given sAppId.
         *
         * @param {string} sAppId The application id.
         * @return {object} The application descriptor.
         */
        getSiteApplication: function (sAppId) {
            return this.oSiteApplications[sAppId];
        },

        /**
         * Returns the vizType object for the given sVizType.
         *
         * @param {string} sType The vizType string.
         * @return {object} The vizType definition object.
         */
        getSiteVizType: function (sType) {
            return this.oSiteVizTypes[sType];
        }
    });
});
