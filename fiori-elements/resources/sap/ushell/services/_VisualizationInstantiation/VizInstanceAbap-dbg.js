// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/_VisualizationInstantiation/VizInstance",
    "sap/m/library",
    "sap/base/Log",
    "sap/ushell/library",
    "sap/ushell/utils/chipsUtils",
    "sap/ushell/services/_VisualizationInstantiation/VizInstanceRenderer"
], function (VizInstance, mobileLibrary, Log, ushellLibrary, chipsUtils, VizInstanceRenderer) {
    "use strict";

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    /**
     * @constructor for a VizInstance for ABAP data
     *
     * @extends sap.ushell.ui.launchpad.VizInstance
     * @name sap.ushell.ui.launchpad.VizInstanceAbap
     *
     * @since 1.77
     */
    var VizInstanceAbap = VizInstance.extend("sap.ushell.ui.launchpad.VizInstanceAbap", {
        metadata: {
            library: "sap.ushell"
        },
        renderer: VizInstanceRenderer
    });

    VizInstanceAbap.prototype.init = function () {
        VizInstance.prototype.init.apply(this, arguments);

        this._oChipInstancePromise = sap.ushell.Container.getServiceAsync("PageBuilding")
            .then(function (oPageBuildingService) {
                var oFactory = oPageBuildingService.getFactory();

                var oInstantiationData = this.getInstantiationData();
                var oRawChipInstanceData;
                var oBags;

                if (!oInstantiationData.simplifiedChipFormat) {
                    oRawChipInstanceData = {
                        chipId: oInstantiationData.chip.id,
                        chip: oInstantiationData.chip
                    };
                } else {
                    var oSimplifiedChip = oInstantiationData.chip || {};
                    oBags = oSimplifiedChip.bags;
                    oRawChipInstanceData = {
                        chipId: oSimplifiedChip.chipId,
                        // string is expected
                        configuration: oSimplifiedChip.configuration ? JSON.stringify(oSimplifiedChip.configuration) : "{}"
                    };
                }

                var oChipInstance = oFactory.createChipInstance(oRawChipInstanceData);

                chipsUtils.addBagDataToChipInstance(oChipInstance, oBags);
                return oChipInstance;
            }.bind(this));
    };

    /**
     * A function which sets the content of the VizInstance to a UI5 view.
     * @param {boolean} [isCustom] Whether this VizInstance is a standard tile or custom.
     * @returns {Promise<undefined>} Resolves when the chip instance is loaded.
     * @override
     * @since 1.77
     */
    VizInstanceAbap.prototype.load = function (isCustom) {
        return this._oChipInstancePromise
            .then(function (oResolvedChipInstance) {
                this._oChipInstance = oResolvedChipInstance;

                return new Promise(this._oChipInstance.load);
            }.bind(this))
            .then(function () {
                if (this.getPreview()) {
                    var oPreviewContract = this._oChipInstance.getContract("preview");
                    // the preview contract doesn't have to be implemented as it might just not be needed
                    // e.g. for tiles that don't display any dynamic data anyway
                    if (oPreviewContract) {
                        oPreviewContract.setEnabled(true);
                    }
                }

                return this._oChipInstance.getImplementationAsSapui5Async();
            }.bind(this))
            .then(function (oView) {
                this._setChipInstanceType();
                this.setContent(oView);
                // Fix parent relation for the component instance to make GridContainer DnD work
                // BCP: 2170186464
                if (oView.getComponentInstance && oView.getComponentInstance()) {
                    oView.getComponentInstance().setParent(this);
                }
                return Promise.resolve();
            }.bind(this))
            .catch(function (oError) {
                this.setState(LoadState.Failed);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Sets the display format of the CHIP instance via the instance's types contract
     *
     * @since 1.88
     */
    VizInstanceAbap.prototype._setChipInstanceType = function () {
        var oTypesContract = this._oChipInstance.getContract("types");
        if (oTypesContract) {
            oTypesContract.setType(this._mapDisplayFormatToChip(this.getDisplayFormat()));
        }
    };

    /**
     * Maps the display format to the CHIP type
     *
     * @param {DisplayFormat} sDisplayFormat The display format to be mapped
     * @returns {string} The appropriate type
     * @since 1.88
     */
    VizInstanceAbap.prototype._mapDisplayFormatToChip = function (sDisplayFormat) {
        var oDisplayFormatMapping = {};

        oDisplayFormatMapping[DisplayFormat.Standard] = "tile";
        oDisplayFormatMapping[DisplayFormat.StandardWide] = "tile";
        oDisplayFormatMapping[DisplayFormat.Compact] = "link";
        oDisplayFormatMapping[DisplayFormat.Flat] = "flat";
        oDisplayFormatMapping[DisplayFormat.FlatWide] = "flatwide";

        return oDisplayFormatMapping[sDisplayFormat];
    };

    /**
     * Updates the chip instance's visibility if the contract is active.
     *
     * @param {boolean} visible The visibility state to be set
     * @since 1.78
     */
    VizInstanceAbap.prototype._setVisible = function (visible) {
        var oVisibleContract = this._oChipInstance && !this._oChipInstance.isStub() && this._oChipInstance.getContract("visible");

        if (oVisibleContract) {
            oVisibleContract.setVisible(visible);
        }
    };

    /**
     * Refreshes the chip instance's data
     *
     * @since 1.78
     */
    VizInstanceAbap.prototype.refresh = function () {
        // The CHIP instance is only available after the VizInstance was loaded
        if (this._oChipInstance) {
            // The refresh handler is provided directly on the CHIP instance and not as contract
            this._oChipInstance.refresh();
        }
    };

    /**
     * Updates the visualization's active state.
     * E.g. inactive dynamic tiles do not send requests
     *
     * @param {boolean} active The visualization's active state
     * @param {boolean} refresh Refresh the visualization immediately
     * @returns {object} The VizInstance
     * @since 1.78
     */
    VizInstanceAbap.prototype.setActive = function (active, refresh) {
        this._setVisible(active);

        if (refresh) {
            this.refresh();
        }

        return this.setProperty("active", active, false);
    };

    return VizInstanceAbap;
});
