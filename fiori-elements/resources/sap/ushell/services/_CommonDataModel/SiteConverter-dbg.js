// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Because the personalization processor only works with a CDM 3.0 site, this converter is used to transform a dedicated
 * CDM 3.1 site object into a CDM 3.0 site and backwards.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log"
], function (
    Log
) {
    "use strict";

    var SiteConverter = function () { };

    /**
     * Forwarding of the convert requests to the corresponding function.
     *
     * @param {string} version Indicates to which version it should be converted
     * @param {object} convertibleObject Dedicated page/site object which should be converted
     * @returns {object} Either an empty object or the converted page/site object
     * @since 1.75.0
     */
    SiteConverter.prototype.convertTo = function (version, convertibleObject) {
        // only when it is a CDM 3.0 site object or an CDM 3.1 page it should be converted
        if (convertibleObject._version === "3.0.0" || (convertibleObject.identification && convertibleObject.payload)) {
            switch (version) {
                case "3.0.0":
                    return this._convertPageToSite(convertibleObject);
                case "3.1.0":
                    return this._convertSiteToPage(convertibleObject);
                default:
                    Log.error("The received version for the site/page conversion is not supported");
                    return {};
            }
        } else {
            Log.error("The site converter did not receive a correct page/site object.");
            return {};
        }
    };

    /**
     * Takes a CDM 3.1 page object and transforms it into a CDM 3.0 site object.
     *
     * @param {object} page The requested CDM 3.1 page object
     * @returns {object} Converted CDM 3.0 site object
     * @since 1.75.0
     * @private
     */
    SiteConverter.prototype._convertPageToSite = function (page) {
        var oConvertedSite = {
            groups: {},
            _version: "3.0.0",
            site: {
                identification: page.identification,
                payload: {
                    groupsOrder: page.payload.layout.sectionOrder
                }
            }
        };

        var oSections = page.payload.sections;
        for (var i = 0; i < Object.keys(oSections).length; i++) {
            var sSectionId = Object.keys(oSections)[i];
            var oSection = page.payload.sections[sSectionId];
            oConvertedSite.groups[sSectionId] = {
                identification: {
                    id: oSection.id,
                    title: oSection.title
                },
                payload: {
                    tiles: this._convertVizPayloadObjectToArray(oSection)
                }
            };
            if ("visible" in oSection) {
                oConvertedSite.groups[sSectionId].identification.isVisible = oSection.visible;
            }

            if ("preset" in oSection) {
                oConvertedSite.groups[sSectionId].payload.isPreset = oSection.preset;
            }

            if ("locked" in oSection) {
                oConvertedSite.groups[sSectionId].payload.locked = oSection.locked;
            }

            if ("default" in oSection) {
                oConvertedSite.groups[sSectionId].payload.isDefaultGroup = oSection.default;
            }
        }

        return oConvertedSite;
    };

    /**
     * Takes a CDM 3.0 site object and transforms it into a 3.1 page object
     *
     * @param {object} site The requested CDM 3.0 site object
     * @returns {object} A converted CDM 3.1 page object
     * @since 1.75.0
     * @private
     */
    SiteConverter.prototype._convertSiteToPage = function (site) {
        var oConvertedPage = {
            identification: site.site.identification,
            payload: {
                layout: {
                    sectionOrder: site.site.payload.groupsOrder
                },
                sections: {}
            }
        };

        var oGroups = site.groups;
        var sGroupId;
        var oGroup;
        var oVizPayload;

        for (var i = 0; i < Object.keys(oGroups).length; i++) {
            sGroupId = Object.keys(oGroups)[i];
            oGroup = site.groups[sGroupId];
            oVizPayload = this._createVizPayloadObject(oGroup.payload.tiles);

            oConvertedPage.payload.sections[sGroupId] = {
                id: oGroup.identification.id,
                title: oGroup.identification.title,
                layout: oVizPayload.layout,
                viz: oVizPayload.viz
            };

            var oSection = oConvertedPage.payload.sections[sGroupId];
            if ("isVisible" in oGroup.identification) {
                oSection.visible = oGroup.identification.isVisible;
            }

            if ("isPreset" in oGroup.payload) {
                oSection.preset = oGroup.payload.isPreset;
            }

            if ("locked" in oGroup.payload) {
                oSection.locked = oGroup.payload.locked;
            }

            if ("isDefaultGroup" in oGroup.payload) {
                oSection.default = oGroup.payload.isDefaultGroup;
            }
        }
        return oConvertedPage;
    };

    /**
     * Creates from all the tiles in a group object into a sections object which is needed in the CDM 3.1 page
     *
     * @param {array} aTiles All tiles in a site object of one page
     * @returns {object} An object for the CDM 3.1 page of sections
     * @since 1.75
     * @private
     */
    SiteConverter.prototype._createVizPayloadObject = function (aTiles) {
        var aVizOrder = [];
        var oPayload = {};

        var oViz = aTiles.reduce(function (oReturn, oTile) {
            aVizOrder.push(oTile.id);
            oReturn[oTile.id] = oTile;
            return oReturn;
        }, {});

        oPayload.layout = {
            vizOrder: aVizOrder
        };
        oPayload.viz = oViz;
        return oPayload;
    };

    /**
     * Creates from all the visualizations in a section in the CDM 3.1 an array with tiles
     *
     * @param {object} oSection A section
     * @returns {object[]} All tiles in an array
     * @since 1.75
     * @private
     */
    SiteConverter.prototype._convertVizPayloadObjectToArray = function (oSection) {
        return oSection.layout.vizOrder.reduce(function (aTiles, sVizId) {
            aTiles.push(oSection.viz[sVizId]);
            return aTiles;
        }, []);
    };

    return SiteConverter;
});
