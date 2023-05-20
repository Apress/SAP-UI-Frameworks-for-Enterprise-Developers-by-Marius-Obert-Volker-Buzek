// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";

    /**
     * Destroy tile model
     * @param {Object} oTileModel Tile model to destroy
     */
    function destroyTileModel (oTileModel) {
        var i;
        if (oTileModel && oTileModel.content) {
            for (i = 0; i < oTileModel.content.length; i++) {
                if (oTileModel.content[i].destroy) {
                    oTileModel.content[i].destroy();
                }
            }
        }
    }

    /**
     * Destroy tile models
     * @param {Array} aTiles List of tiles to destroy
     */
    function destroyTileModels (aTiles) {
        var i;
        if (aTiles) {
            for (i = 0; i < aTiles.length; i++) {
                destroyTileModel(aTiles[i]);
            }
        }
    }

    /**
     * Destroy group or catalog model
     * @param {Object} oAggregationModel Group or catalog model to destroy
     */
    function destroyFLPAggregationModel (oAggregationModel) {
        if (oAggregationModel) {
            destroyTileModels(oAggregationModel.tiles);
        }
    }

    /**
     * Destroy groups or catalogs model
     * @param {Array} aAggregationModel List of group or catalog models to destroy
     */
    function destroyFLPAggregationModels (aAggregationModel) {
        var i;
        if (aAggregationModel) {
            for (i = 0; i < aAggregationModel.length; i++) {
                destroyFLPAggregationModel(aAggregationModel[i]);
            }
        }
    }

    return {
        destroyFLPAggregationModel: destroyFLPAggregationModel,
        destroyFLPAggregationModels: destroyFLPAggregationModels,
        destroyTileModel: destroyTileModel,
        destroyTileModels: destroyTileModels
    };
});
