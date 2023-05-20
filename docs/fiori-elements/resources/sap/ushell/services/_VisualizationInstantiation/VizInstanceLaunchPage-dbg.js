// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/_VisualizationInstantiation/VizInstance",
    "sap/ushell/library",
    "sap/ushell/services/_VisualizationInstantiation/VizInstanceRenderer"
], function (VizInstance, ushellLibrary, VizInstanceRenderer) {
    "use strict";

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    /**
     * The only use case for this thing so far is to be able to instantiate visualizations that were
     * retrieved from the SearchableContent service for the classic homepage.
     * Only functionality that is needed by the search UI is implemented.
     *
     * @constructor for a VizInstance for Classic Homepage tiles
     *
     * @extends sap.ushell.ui.launchpad.VizInstance
     * @param {object} vizData The visualization entity
     *
     * @name sap.ushell.ui.launchpad.VizInstanceLaunchPage
     *
     * @since 1.81
     */
    var VizInstanceLaunchPage = VizInstance.extend("sap.ushell.ui.launchpad.VizInstanceLaunchPage", {
        metadata: {
            library: "sap.ushell"
        },
        renderer: VizInstanceRenderer
    });

    /**
     * A function which sets the content of the VizInstance to a UI5 view
     *
     * @returns {Promise<undefined>} Resolves when the chip instance is loaded
     * @since 1.81
     */
    VizInstanceLaunchPage.prototype.load = function () {
        var oTile = this.getInstantiationData().launchPageTile;
        return sap.ushell.Container.getServiceAsync("LaunchPage")
            .then(function (oLaunchPageService) {
                return new Promise(function (resolve, reject) {
                    // on a classic homepage there can be different tiles where the data comes from different sources
                    // many of them will be catalog tiles but e.g. bookmarks are group tiles
                    // for catalog tiles
                    oLaunchPageService.getCatalogTileViewControl(oTile)
                        .done(resolve)
                        .fail(function () {
                            // for group tiles
                            oLaunchPageService.getTileView(oTile)
                                .done(resolve)
                                .fail(reject);
                        });
                }).then(function (oTileView) {
                    this._setDisplayFormatFromTileSize(oTile, oLaunchPageService);
                    this.setContent(oTileView);
                }.bind(this));
            }.bind(this));
    };

    /**
     * Gets the tile's size and translates it into a display format
     *
     * @param {object} oTile The tile
     * @param {object} oLaunchPageService The LaunchPage service
     * @since 1.90
     */
    VizInstanceLaunchPage.prototype._setDisplayFormatFromTileSize = function (oTile, oLaunchPageService) {
        // the tile size has to be retrieved via the LaunchPage service as it is
        // not available during the vizInstance instantiation.
        // the call of setDisplayFormat implicitly leads to a _setSize() call
        // due to the formatter in the vizInstance's placeholder.
        // tiles of the classic homepage only support the following display formats
        var sTileSize = oLaunchPageService.getTileSize(oTile);
        if (sTileSize === "1x2") {
            this.setDisplayFormat(DisplayFormat.StandardWide);
        } else {
            this.setDisplayFormat(DisplayFormat.Standard);
        }
    };

    // visibility and refresh handling should not be needed by the search UI

    return VizInstanceLaunchPage;
});
