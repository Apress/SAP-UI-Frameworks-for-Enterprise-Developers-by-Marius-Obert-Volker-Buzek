// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview APIs for the S/4 MyHome
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/base/util/deepClone",
    "sap/ushell/library",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/utils/WindowUtils",
    "sap/base/Log"
], function (
    Config,
    deepClone,
    ushellLibrary,
    hasher,
    WindowUtils,
    Log
) {
    "use strict";

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    /**
     * This service provides APIs for the S/4 MyHome.
     * For FLP internal usage the internal APIs should be used directly.
     *
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("SpaceContent").then(function (SpaceContent) {});</code>.
     * Constructs a new instance of the searchable content service.
     *
     * @namespace sap.ushell.services.SpaceContent
     *
     * @constructor
     * @class
     * @see {@link sap.ushell.services.Container#getServiceAsync}
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    var SpaceContent = function () { };

    /**
     * Returns the personalization enabled flag
     *
     * @returns {boolean} Whether personalization enabled
     * @since 1.106.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.isPersonalizationEnabled = function () {
        return Config.last("/core/shell/enablePersonalization");
    };

    /**
     * Returns the data of a page
     *
     * @param {string} pageId ID of the page
     * @returns {Promise<object>} Promise that resolves with the page data
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.getPage = function (pageId) {
        var oPagesService;
        return sap.ushell.Container.getServiceAsync("Pages")
            .then(function (oService) {
                oPagesService = oService;
                return oPagesService.loadPage(pageId);
            })
            .then(function (sPagePath) {
                // clone the data to keep the caller from changing the original object
                return deepClone(oPagesService.getModel().getProperty(sPagePath), 20);
            });
    };

    /**
     * Returns the data of multiple pages
     *
     * @param {string[]} pageIds IDs of the pages
     * @returns {Promise<object>} Promise that resolves with the page data
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.getPages = function (pageIds) {
        var oPagesService;
        return sap.ushell.Container.getServiceAsync("Pages")
            .then(function (oService) {
                oPagesService = oService;
                return oPagesService.loadPages(pageIds);
            })
            .then(function (oPagePaths) {
                var oPages = {};
                Object.keys(oPagePaths).forEach(function (sPageId) {
                    // clone the data to keep the caller from changing the original object
                    oPages[sPageId] = deepClone(oPagesService.getModel().getProperty(oPagePaths[sPageId]), 20);
                });
                return oPages;
            });
    };

    /**
     * Adds a section to a page
     *
     * @param {string} pageId The ID of the page to which the section is added
     * @param {int} sectionIndex The index of the added section on the page
     * @param {object} [sectionProperties] Properties of the added section
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.addSection = function (pageId, sectionIndex, sectionProperties) {
        return sap.ushell.Container.getServiceAsync("Pages")
            .then(function (oPagesService) {
                var iPageIndex = oPagesService.getPageIndex(pageId);
                return oPagesService.addSection(iPageIndex, sectionIndex, sectionProperties);
            });
    };

    /**
     * Adds a new visualization to a page
     *
     * If no section ID is specified, the visualization is added to the 'Recently Added' section automatically.
     *
     * @param {string} pageId The ID of the page the visualization should be added to
     * @param {string} [sectionId] The ID of the section the visualization should be added to
     * @param {string} vizId The ID of the visualization to add
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.addVisualization = function (pageId, sectionId, vizId) {
        return sap.ushell.Container.getServiceAsync("Pages")
            .then(function (oPagesService) {
                return oPagesService.addVisualization(pageId, sectionId, vizId);
            });
    };

    /**
     * Moves a visualization on a page
     *
     * @param {string} pageId The ID of the page containing the moved visualization
     * @param {int} sourceSectionIndex The index of the section from where the visualization is moved
     * @param {int} sourceVisualizationIndex The index of the moved visualization
     * @param {int} targetSectionIndex The index of the section to which the visualization should be moved
     * @param {int} targetVisualizationIndex The new index of the moved visualization. If -1 is passed, the visualization is moved to the last position.
     *
     * @returns {Promise<object>} Promise which resolves with an object containing the visualizationIndex after the personalization was saved
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.moveVisualization = function (pageId, sourceSectionIndex, sourceVisualizationIndex, targetSectionIndex, targetVisualizationIndex) {
        return sap.ushell.Container.getServiceAsync("Pages")
            .then(function (oPagesService) {
                var iPageIndex = oPagesService.getPageIndex(pageId);
                return oPagesService.moveVisualization(iPageIndex, sourceSectionIndex, sourceVisualizationIndex, targetSectionIndex, targetVisualizationIndex);
            });
    };

    /**
     * Updates the properties of a visualization.
     * Properties that are not supplied are not updated.
     * Currently only the display format, title and subtitle are supported.
     *
     * @param {string} pageId The ID of the page containing the updated visualization
     * @param {int} sectionIndex The index of the section from where the visualization is updated
     * @param {int} visualizationIndex The index of the updated visualization
     * @param {object} visualizationData The updated visualization properties
     * @param {string} [visualizationData.displayFormatHint] The format in which the visualization is displayed
     * @param {string} [visualizationData.title] The title of the visualization
     * @param {string} [visualizationData.subtitle] The subtitle of the visualization
     * @param {string} [visualizationData.info] The information text of the visualization
     *
     * @returns {Promise<void>} The promise resolves when the visualization has been updated successfully
     *
     * @since 1.105
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.updateVisualization = function (pageId, sectionIndex, visualizationIndex, visualizationData) {
        // keep the API limited to the minimally required functionality
        var oVisualizationDataToUpdate = {
            displayFormatHint: visualizationData.displayFormatHint,
            title: visualizationData.title,
            subtitle: visualizationData.subtitle,
            info: visualizationData.info
        };

        return sap.ushell.Container.getServiceAsync("Pages")
            .then(function (oPagesService) {
                var iPageIndex = oPagesService.getPageIndex(pageId);
                return oPagesService.updateVisualization(iPageIndex, sectionIndex, visualizationIndex, oVisualizationDataToUpdate);
            });
    };

    /**
     * Deletes a visualization from a page
     *
     * @param {string} pageId The ID of the page containing the deleted visualization
     * @param {int} sectionIndex The index of the section from where the visualization is deleted
     * @param {int} visualizationIndex The index of the deleted visualization
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.103.0
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.deleteVisualization = function (pageId, sectionIndex, visualizationIndex) {
        return sap.ushell.Container.getServiceAsync("Pages")
            .then(function (oPagesService) {
                var iPageIndex = oPagesService.getPageIndex(pageId);
                return oPagesService.deleteVisualization(iPageIndex, sectionIndex, visualizationIndex);
            });
    };

    /**
     * Creates VizInstance controls from the visualization data returned by getPage and getPages.
     *
     * @param {object} vizData Data for a visualization
     *
     * @returns {sap.ushell.ui.launchpad.VizInstance} A VizInstance control
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.instantiateVisualization = function (vizData) {
        return sap.ushell.Container.getServiceAsync("VisualizationInstantiation")
            .then(function (oVisualizationInstantiationService) {
                return oVisualizationInstantiationService.instantiateVisualization(vizData);
            });
    };

    /**
     * Starts an app based on the provided URL.
     * If an intent is provided an intent based navigation is triggered.
     * If a fully qualified URL is provided the app is opened in a new tab.
     * This API must only be used to start tile targets.
     *
     * @param {string} url
     *      URL of the app
     * @param {string} [title]
     *      Title of the app. This is only used for non-intent based navigation in order to add
     *      an entry to the recently used apps. If no title is provided for such a target no
     *      recently used entry is added.
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.launchTileTarget = function (url, title) {
        if (typeof url !== "string") {
            Log.error("Invalid target URL", null, "sap.ushell.services.SpaceContent");
            return;
        }

        if (url.indexOf("#") === 0) {
            hasher.setHash(url);
        } else {
            if (title) {
                // add the URL to recent activity log
                var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                if (bLogRecentActivity) {
                    var oRecentEntry = {
                        title: title,
                        appType: AppType.URL,
                        url: url,
                        appId: url
                    };
                    sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
                }
            }

            WindowUtils.openURL(url, "_blank");
        }
    };

    /**
     * Attempt to determine a value for the parameter name.
     *
     * @param {string} parameterName The parameter name
     *
     * @returns {Promise<object>}
     *    A Promise that resolves to an object containing the parameter values.
     *    Returns single parameters in property value and range parameters in
     *    property extendedValue.
     *    Example:
     * <pre>
     *      {
     *          "value": "ZMAT1",
     *          "extendedValue": {
     *              "Ranges": [
     *                  {
     *                      "Sign": "I",
     *                      "Option": "BT",
     *                      "Low": "A*",
     *                      "High": "F*"
     *                  }
     *              ]
     *          }
     *      }
     * </pre>
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.getUserDefaultParameter = function (parameterName) {
        var oUserDefaultsService;
        var oCSTRService;

        return Promise.all([
            sap.ushell.Container.getServiceAsync("ClientSideTargetResolution"),
            sap.ushell.Container.getServiceAsync("UserDefaultParameters")
        ])
            .then(function (oResult) {
                oCSTRService = oResult[0];
                oUserDefaultsService = oResult[1];

                // The S/4 MyHome does not know the concept of content providers as it is
                // currently only targeted for the ABAP environment.
                return oCSTRService.getSystemContext("");
            })
            .then(function (oSystemContext) {
                return new Promise(function (resolve, reject) {
                    oUserDefaultsService.getValue(parameterName, oSystemContext)
                        .done(resolve)
                        .fail(reject);
                });
            })
            .then(function (oParameterValue) {
                if (!oParameterValue.value && !oParameterValue.extendedValue) {
                    return null;
                }

                // return only the properties defined by the API
                var oValue = {};
                if (oParameterValue.value) {
                    oValue.value = oParameterValue.value;
                }
                if (oParameterValue.extendedValue) {
                    oValue.extendedValue = oParameterValue.extendedValue;
                }
                return oValue;
            });
    };

    SpaceContent.hasNoAdapter = true;
    return SpaceContent;
});
