// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file This module is responsible to create reference pages,
 * which are shareable JSON representations of layout and navigation targets in the specific format.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ui/thirdparty/jquery"
], function (
    deepExtend,
    jQuery
) {
    "use strict";

    var PageReferencer = {};

    function getPermanentKeys (aPageLayout, NavTargetResolution) {
        var oResult = {};
        aPageLayout.forEach(function (oSection) {
            oSection.viz.forEach(function (oTile) {
                var sTarget = oTile.target;
                if (sTarget && !oResult[sTarget]) {
                    oResult[sTarget] = NavTargetResolution.resolveHashFragment(sTarget);
                }
            });
        });

        return new Promise(function (fnResolve, fnReject) {
            var aPromises = [];
            Object.keys(oResult).forEach(function (sHash) {
                aPromises.push(oResult[sHash]);
            });
            jQuery.when.apply(null, aPromises).then(function () {
                var aResolutionResult = arguments;
                Object.keys(oResult).forEach(function (sHash, index) {
                    oResult[sHash] = aResolutionResult[index].inboundPermanentKey;
                });
                fnResolve(oResult);
            }, fnReject);
        });
    }

    function _createVisualization (oPermanentKeys, oTile) {
        return {
            inboundPermanentKey: oPermanentKeys[oTile.target],
            vizId: oTile.tileCatalogId
        };
    }

    function _createSection (oPermanentKeys, oSection) {
        return {
            id: oSection.id,
            title: oSection.title,
            visualizations: oSection.viz.map(_createVisualization.bind(null, oPermanentKeys))
        };
    }

    PageReferencer.createReferencePage = function (oPageInfo, aPageGroups) {
        aPageGroups = aPageGroups || []; // TODO: remove "aPageGroups" argument and cleanup the code
        return sap.ushell.Container.getServiceAsync("NavTargetResolution")
            .then(getPermanentKeys.bind(null, aPageGroups))
            .then(function (oPermanentKeys) {
                var oResult = deepExtend({}, oPageInfo);
                oResult.sections = aPageGroups.map(_createSection.bind(null, oPermanentKeys));
                return Promise.resolve(oResult);
            });
    };

    return PageReferencer;
});
