// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/bootstrap/common/common.load.model",
    "sap/ushell/Config",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ui/core/CustomData"
], function (
    resources,
    utils,
    oModelWrapper,
    Config,
    AccessibilityCustomData,
    CustomData
) {
    "use strict";

    /**
     * @name TileContainer renderer.
     * @static
     * @private
     */
    var TileContainerRenderer = {
        apiVersion: 2
    };

    TileContainerRenderer.oModel = oModelWrapper.getModel();

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} tileContainer an object representation of the control that should be rendered
     */
    TileContainerRenderer.render = function (oRm, tileContainer) {
        var aHeaderActions = tileContainer.getHeaderActions(),
            aBeforeContent = tileContainer.getBeforeContent(),
            aAfterContent = tileContainer.getAfterContent(),
            aLinks = tileContainer.getLinks(),
            iNrOfLinks = aLinks.length,
            that = this;

        // WRAPPER start
        oRm.openStart("div", tileContainer);
        oRm.class("sapUshellTileContainer");
        if (!tileContainer.getVisible()) {
            oRm.class("sapUshellHidden");
        }
        if (tileContainer.getDeluminate()) {
            oRm.class("sapUshellDisableLockedGroupDuringDrag");
        }
        if (tileContainer.getEditMode()) {
            oRm.class("sapUshellEditing");
        }
        if (tileContainer.getHidden()) {
            oRm.class("sapUshellTileContainerEditModeHidden");
        }
        if (!tileContainer.getShowEmptyLinksArea()) {
            oRm.class("sapUshellLinksAreaHidden");
        }
        if (tileContainer.getShowEmptyLinksAreaPlaceHolder()) {
            oRm.class("sapUshellTileContainerEditMode");
            oRm.class("sapUshellTileContainerTabsModeEmptyLinksArea");
        } else {
            oRm.class("sapUshellEmptyLinksAreaPlaceHolder");
        }
        oRm.openEnd(); // div - tag

        // BEFORE CONTENT start
        if (aBeforeContent.length && tileContainer.getTileActionModeActive()) {
            oRm.openStart("div");
            oRm.class("sapUshellTileContainerBeforeContent");
            oRm.class("sapContrastPlus");
            oRm.openEnd(); // div - tag
            aBeforeContent.forEach(function (oBeforeContent) {
                oRm.renderControl(oBeforeContent);
            });
            oRm.close("div");
        }
        // BEFORE CONTENT end

        // CONTENT start
        oRm.openStart("div");
        oRm.class("sapUshellTileContainerContent");
        if (tileContainer.getIsGroupLocked()) {
            oRm.class("sapUshellTileContainerLocked");
        }
        if (tileContainer.getDefaultGroup()) {
            oRm.class("sapUshellTileContainerDefault");
        }
        if (tileContainer.getShowBackground()) {
            oRm.class("sapUshellTileContainerEditMode");
        }
        oRm.openEnd(); // div - tag
        if (tileContainer.getShowBackground()) {
            oRm.openStart("div");
            oRm.class("sapUshellGroupBackgroundContainer");
            oRm.class("sapContrastPlus");
            oRm.openEnd(); // div - tag
            oRm.close("div");
        }
        if (tileContainer.getShowHeader()) {
            // Title
            oRm.openStart("div", tileContainer.getId() + "-groupheader");
            oRm.class("sapUshellTileContainerHeader");
            oRm.class("sapContrastPlus");

            if (!tileContainer.getShowGroupHeader()) {
                oRm.class("sapUshellFirstGroupHeaderHidden");
                oRm.class("sapUiPseudoInvisibleText");
            }
            if (tileContainer.getTileActionModeActive()) {
                oRm.attr("tabindex", "0");
            }

            var sAccMsg;
            // group is default case (Home group)
            if (tileContainer.getDefaultGroup()) {
                sAccMsg = resources.i18n.getText("ariaLabelEditModeGroupDefault", tileContainer.getHeaderText());
                // locked group case
            } else if (tileContainer.getIsGroupLocked()) {
                sAccMsg = resources.i18n.getText("ariaLabelEditModeGroupLocked", tileContainer.getHeaderText());
            } else {
                // general group case
                sAccMsg = resources.i18n.getText("ariaLabelEditModeGroup", tileContainer.getHeaderText());
            }
            oRm.attr("aria-label", sAccMsg);
            oRm.openEnd(); // div - tag

            oRm.openStart("div", tileContainer.getId() + "-title");
            oRm.class("sapUshellContainerTitleFlex");
            oRm.openEnd(); // div - tag

            if (tileContainer.getEditMode()) {
                oRm.renderControl(tileContainer.oEditInputField);
            } else {
                var sTagName = tileContainer.getHeaderLevel().toLowerCase();
                oRm.openStart(sTagName, tileContainer.getId() + "-titleText");
                oRm.class("sapUshellContainerTitle");
                oRm.attr("title", tileContainer.getHeaderText());
                oRm.attr("data-role", "group");
                if (tileContainer.getTileActionModeActive() && !tileContainer.getIsGroupLocked() && !tileContainer.getDefaultGroup()) {
                    oRm.attr("tabindex", "0");
                }
                oRm.openEnd(); // div - tag
                oRm.text(tileContainer.getHeaderText());
                oRm.close(sTagName);
            }
            if (tileContainer.getIsGroupLocked()) {
                oRm.renderControl(tileContainer.oIcon);
            } else if (tileContainer.getTileActionModeActive()) {
                // Header Actions
                oRm.openStart("div");
                oRm.class("sapUshellContainerHeaderActions");
                oRm.openEnd(); // div - tag
                aHeaderActions.forEach(function (oHeaderAction) {
                    oRm.renderControl(oHeaderAction);
                });
                oRm.close("div");
            }
            oRm.close("div");

            // Title END
            oRm.close("div");
        }

        // SORTABLE start
        oRm.openStart("ul");
        oRm.class("sapUshellTilesContainer-sortable");
        oRm.class("sapUshellInner");
        oRm.openEnd(); // div - tag

        var bHasVisibleContent = false;
        tileContainer.getTiles().forEach(function (oTile) {
            if (oTile.getVisible()) {
                bHasVisibleContent = true;
            }

            if (that._isUserActivityCard(oTile)) {
                that._updateUserActivityCardVisibility(oTile);
            }

            oRm.renderControl(oTile);
        });

        if (tileContainer.getShowPlaceholder()) {
            oRm.renderControl(tileContainer.oPlusTile);
        }

        // hook method to render no data
        if (tileContainer.getShowNoData()) {
            this.renderNoData(oRm, tileContainer, !bHasVisibleContent);
        }

        // SORTABLE end
        oRm.close("ul");

        // Links rendering
        var bLineModeContainer = tileContainer.getSupportLinkPersonalization();
        if (iNrOfLinks > 0 || bLineModeContainer) {
            oRm.openStart("div");
            oRm.class("sapUshellLineModeContainer");
            if (!iNrOfLinks && bLineModeContainer) {
                oRm.class("sapUshellNoLinksAreaPresent");
                if (tileContainer.getTransformationError()) {
                    oRm.class("sapUshellNoLinksAreaPresentError");
                }
                oRm.openEnd(); // div - tag

                oRm.openStart("div");
                oRm.class("sapUshellNoLinksAreaPresentText");
                oRm.openEnd(); // div - tag
                oRm.renderControl(tileContainer.oNoLinksText);
                oRm.close("div");
            } else {
                oRm.openEnd(); // div - tag
            }

            if (bLineModeContainer) {
                if (tileContainer.getTransformationError()) {
                    // Transformation Error
                    oRm.openStart("div");
                    oRm.class("sapUshellTransformationError");
                    if (!tileContainer.transformationError) {
                        oRm.style("display", "none");
                    }
                    oRm.openEnd(); // div - tag

                    oRm.openStart("div");
                    oRm.class("sapUshellTransformationErrorInnerWrapper");
                    oRm.openEnd(); // div - tag
                    oRm.renderControl(tileContainer.oTransformationErrorIcon);
                    oRm.renderControl(tileContainer.oTransformationErrorText);
                    oRm.close("div");

                    oRm.close("div");
                }

                oRm.openStart("div");
                oRm.class("sapUshellLinksInnerContainer");
                oRm.openEnd(); // div - tag

                var aLinkCustomData,
                    bLinkPosInsetFound,
                    bLinkSetSizeFound,
                    bLinkDataHelpIdFound;

                aLinks.forEach(function (link, index) {
                    aLinkCustomData = link.getCustomData();
                    bLinkPosInsetFound = false;
                    bLinkSetSizeFound = false;
                    bLinkDataHelpIdFound = false;
                    aLinkCustomData.forEach(function (oCustomData) {
                        if (oCustomData.getKey() === "aria-posinset") {
                            oCustomData.setValue((index + 1).toString());
                            oCustomData.setWriteToDom(true);
                            bLinkPosInsetFound = true;
                        } else if (oCustomData.getKey() === "aria-setsize") {
                            oCustomData.setValue(iNrOfLinks.toString());
                            oCustomData.setWriteToDom(true);
                            bLinkSetSizeFound = true;
                        } else if (oCustomData.getKey() === "help-id") {
                            oCustomData.setValue(link.getBindingContext() && link.getBindingContext().getProperty("tileCatalogId"));
                            oCustomData.setWriteToDom(true);
                            bLinkDataHelpIdFound = true;
                        } else if (oCustomData.getKey() === "help-id2") {
                            oCustomData.setValue(link.getBindingContext() && link.getBindingContext().getProperty("tileCatalogIdStable"));
                            oCustomData.setWriteToDom(true);
                            bLinkDataHelpIdFound = true;
                        }
                    });
                    if (!bLinkPosInsetFound) {
                        link.addCustomData(new AccessibilityCustomData({
                            key: "aria-posinset",
                            value: (index + 1).toString(),
                            writeToDom: true
                        }));
                    }
                    if (!bLinkSetSizeFound) {
                        link.addCustomData(new AccessibilityCustomData({
                            key: "aria-setsize",
                            value: iNrOfLinks.toString(),
                            writeToDom: true
                        }));
                    }
                    if (link.getModel() && link.getModel().getProperty("/enableHelp") && !bLinkDataHelpIdFound) {
                        link.addCustomData(new CustomData({
                            key: "help-id",
                            value: link.getBindingContext() && link.getBindingContext().getProperty("tileCatalogId"),
                            writeToDom: true
                        }));
                        link.addCustomData(new CustomData({
                            key: "help-id2",
                            value: link.getBindingContext() && link.getBindingContext().getProperty("tileCatalogIdStable"),
                            writeToDom: true
                        }));
                    }
                    link.addStyleClass("sapUshellLinkTile");
                    if (tileContainer.getIsGroupLocked()) {
                        link.addStyleClass("sapUshellLockedTile");
                    }
                    oRm.renderControl(link);
                });
                oRm.close("div");
            } else {
                aLinks.forEach(function (oLink) {
                    oRm.renderControl(oLink);
                });
            }

            oRm.close("div");
        }

        // CONTENT end
        oRm.close("div");

        // AFTER CONTENT start
        if (aAfterContent.length && tileContainer.getTileActionModeActive()) {
            oRm.openStart("div");
            oRm.class("sapUshellTileContainerAfterContent");
            oRm.class("sapContrastPlus");
            oRm.openEnd(); // div - tag
            aAfterContent.forEach(function (oAfterContent) {
                oRm.renderControl(oAfterContent);
            });
            oRm.close("div");
        }
        // AFTER CONTENT end

        // WRAPPER end
        oRm.close("div");
        utils.setPerformanceMark("FLP -- tile container renderer");
    };

    // Rendering a message in case no Tiles are visible after applying the user filter
    TileContainerRenderer.renderNoData = function (oRm, oTileContainer, displayData) {
        oRm.openStart("div", oTileContainer.getId() + "-listNoData");
        oRm.class("sapUshellNoFilteredItems");
        oRm.class("sapUiStrongBackgroundTextColor");
        oRm.openEnd(); // div - tag
        oRm.text(displayData ? oTileContainer.getNoDataText() : "");
        oRm.close("div");
    };

    TileContainerRenderer._isUserActivityCard = function (oCard) {
        if (typeof oCard.getManifest !== "function") {
            return false;
        }

        var oManifest = oCard.getManifest();
        var sCardTitle = oManifest && oManifest["sap.card"] && oManifest["sap.card"].header && oManifest["sap.card"].header.title;
        return sCardTitle === resources.i18n.getText("recentActivities") || sCardTitle === resources.i18n.getText("frequentActivities");
    };

    TileContainerRenderer._updateUserActivityCardVisibility = function (oCard) {
        oCard.setVisible(Config.last("/core/shell/model/enableTrackingActivity"));
        Config.on("/core/shell/model/enableTrackingActivity").do(function (bEnableTrackingActivity) {
            oCard.setVisible(bEnableTrackingActivity);
        });
    };

    return TileContainerRenderer;
}, /* bExport= */ true);
