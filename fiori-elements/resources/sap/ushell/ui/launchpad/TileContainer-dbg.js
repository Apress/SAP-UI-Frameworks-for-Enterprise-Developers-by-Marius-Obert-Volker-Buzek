// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.TileContainer.
sap.ui.define([
    "sap/base/Log",
    "sap/m/Input",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/base/ManagedObject",
    "sap/ui/core/Control",
    "sap/ui/core/Core",
    "sap/ui/core/Icon",
    "sap/ushell/override",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/PlusTile",
    "sap/ushell/utils",
    "sap/ushell/ui/launchpad/TileContainerRenderer"
], function (
    Log,
    Input,
    MobileLibrary,
    Text,
    ManagedObject,
    Control,
    Core,
    Icon,
    override,
    ushellLibrary,
    resources,
    PlusTile,
    utils,
    TileContainerRenderer
) {
    "use strict";

    var HeaderLevel = MobileLibrary.HeaderLevel;

    /**
     * Constructor for a new ui/launchpad/TileContainer.
     *
     * @param {string} [sId] The ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] The initial settings for the new control
     * @class A container that arranges Tile controls.
     * @extends sap.ui.core.Control
     * @constructor
     * @name sap.ushell.ui.launchpad.TileContainer
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var TileContainer = Control.extend("sap.ushell.ui.launchpad.TileContainer", /** @lends sap.ushell.ui.launchpad.TileContainer.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                scrollType:
                    { type: "string", group: "Misc", defaultValue: "item" },
                // Animation Speed in milliseconds (ms)
                animationSpeed:
                    { type: "int", group: "Misc", defaultValue: 500 },
                groupId:
                    { type: "string", group: "Misc", defaultValue: null },
                showHeader:
                    { type: "boolean", group: "Misc", defaultValue: true },
                showPlaceholder:
                    { type: "boolean", group: "Misc", defaultValue: true },
                defaultGroup:
                    { type: "boolean", group: "Misc", defaultValue: false },
                isLastGroup:
                    { type: "boolean", group: "Misc", defaultValue: false },
                headerText:
                    { type: "string", group: "Misc", defaultValue: null },
                headerLevel:
                    { type: "sap.m.HeaderLevel", group: "Misc", defaultValue: HeaderLevel.H2 },
                // Header level (H1-H6) used for headers of tile groups.
                groupHeaderLevel:
                    { type: "sap.m.HeaderLevel", group: "Misc", defaultValue: HeaderLevel.H4 },
                showGroupHeader:
                    { type: "boolean", group: "Misc", defaultValue: true },
                homePageGroupDisplay:
                    { type: "string", defaultValue: null },
                visible:
                    { type: "boolean", group: "Misc", defaultValue: true },
                sortable:
                    { type: "boolean", group: "Misc", defaultValue: true },
                showNoData:
                    { type: "boolean", group: "Misc", defaultValue: false },
                noDataText:
                    { type: "string", group: "Misc", defaultValue: resources.i18n.getText("noFilteredItems") },
                isGroupLocked:
                    { type: "boolean", group: "Misc", defaultValue: null },
                isGroupSelected:
                    { type: "boolean", group: "Misc", defaultValue: false },
                editMode:
                    { type: "boolean", group: "Misc", defaultValue: false },
                showBackground:
                    { type: "boolean", group: "Misc", defaultValue: false },
                icon:
                    { type: "string", group: "Misc", defaultValue: "sap-icon://locked" },
                showIcon:
                    { type: "boolean", group: "Misc", defaultValue: false },
                deluminate:
                    { type: "boolean", group: "Misc", defaultValue: false },
                showMobileActions:
                    { type: "boolean", group: "Misc", defaultValue: false },
                enableHelp:
                    { type: "boolean", group: "Misc", defaultValue: false },
                tileActionModeActive:
                    { type: "boolean", group: "Misc", defaultValue: false },
                ieHtml5DnD:
                    { type: "boolean", group: "Misc", defaultValue: false },
                showEmptyLinksArea:
                    { type: "boolean", group: "Misc", defaultValue: false },
                showEmptyLinksAreaPlaceHolder:
                    { type: "boolean", group: "Misc", defaultValue: false },
                hidden:
                    { type: "boolean", group: "Misc", defaultValue: false },
                transformationError:
                    { type: "boolean", group: "Misc", defaultValue: false },
                // Set to true if the LaunchPageAdapter supports link personalization.
                supportLinkPersonalization: { type: "boolean", group: "Misc", defaultValue: false }
            },
            aggregations: {
                tiles:
                    { type: "sap.ui.core.Control", multiple: true, singularName: "tile" },
                links:
                    { type: "sap.ui.core.Control", multiple: true, singularName: "link" },
                beforeContent:
                    { type: "sap.ui.core.Control", multiple: true, singularName: "beforeContent" },
                afterContent:
                    { type: "sap.ui.core.Control", multiple: true, singularName: "afterContent" },
                headerActions:
                    { type: "sap.ui.core.Control", multiple: true, singularName: "headerAction" }
            },
            events: {
                afterRendering: {},
                // This Event triggered when the tile/card placeholder is pressed.
                add: {},
                // This Event is triggered when the group title is modified.
                titleChange: {}
            }
        },
        renderer: TileContainerRenderer
    });

    /**
     * @name sap.ushell.ui.launchpad.TileContainer
     * @private
     */
    TileContainer.prototype.init = function () {
        this.bIsFirstTitleChange = true;

        this._sDefaultValue = resources.i18n.getText("new_group_name");

        this.oNoLinksText = new Text({
            text: resources.i18n.getText("emptyLinkContainerInEditMode")
        }).addStyleClass("sapUshellNoLinksAreaPresentTextInner");

        this.oTransformationErrorText = new Text({
            text: resources.i18n.getText("transformationErrorText")
        }).addStyleClass("sapUshellTransformationErrorText");

        this.oTransformationErrorIcon = new Icon({
            src: "sap-icon://message-error"
        }).addStyleClass("sapUshellTransformationErrorIcon");

        this.oIcon = new Icon({
            src: this.getIcon()
        }).addStyleClass("sapUshellContainerIcon");

        this.oPlusTile = new PlusTile({
            groupId: this.getGroupId(),
            enableHelp: this.getEnableHelp(),
            press: [this.fireAdd, this]
        }).setParent(this);

        var fnFocusOut = function () {
            this.getDomRef("groupheader").focus();
            this._stopEdit();
            var oEditInputFieldDomRef = this.oEditInputField.getDomRef();
            if (oEditInputFieldDomRef) {
                oEditInputFieldDomRef.removeEventListener("focusout", fnFocusOut);
            }
        }.bind(this);

        this.oEditInputField = new Input({
            placeholder: this._sDefaultValue,
            value: this.getHeaderText()
        }).addEventDelegate({
            onBeforeRendering: function () {
                var oEditInputFieldDomRef = this.oEditInputField.getDomRef();
                if (oEditInputFieldDomRef) {
                    oEditInputFieldDomRef.removeEventListener("focusout", fnFocusOut);
                }
            }.bind(this),
            onAfterRendering: function () {
                var $Ref = this.oEditInputField.$("inner");
                $Ref.focus();
                $Ref.selectText(0, $Ref.val().length);

                var oEditInputFieldDomRef = this.oEditInputField.getDomRef();
                if (oEditInputFieldDomRef) {
                    oEditInputFieldDomRef.addEventListener("focusout", fnFocusOut);
                }
            }.bind(this)
        }).addStyleClass("sapUshellTileContainerTitleInput");

        if (sap.ushell.Container) {
            sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                if (oLaunchPageService.isLinkPersonalizationSupported()) {
                    TileContainer.prototype.isLinkPersonalizationOveride();
                }
            });
        }

        this.fnTitleTextClickHandler = this._titleTextClickHandler.bind(this);
    };

    TileContainer.prototype.onBeforeRendering = function () {
        var oTitleText = this.getDomRef("titleText");
        if (oTitleText) {
            oTitleText.removeEventListener("click", this.fnTitleTextClickHandler);
        }

        var aTiles = this.getTiles();
        var aLinks = this.getLinks();
        var aTilesAndLinks = aTiles.concat(aLinks);

        aTilesAndLinks.forEach(function (oTile) {
            var oDomRef = oTile.getDomRef();
            if (oDomRef) {
                var sOldValue = oDomRef.getAttribute("data-oldTabindex");
                if (sOldValue) {
                    oDomRef.setAttribute("tabindex", sOldValue);
                    oDomRef.removeAttribute("data-oldTabindex");
                } else {
                    oDomRef.removeAttribute("tabindex");
                }
            }
        });
    };

    TileContainer.prototype.onAfterRendering = function () {
        var oTitleText = this.getDomRef("titleText");
        if (oTitleText) {
            oTitleText.addEventListener("click", this.fnTitleTextClickHandler);
        }
        var aTiles = this.getTiles();
        var aLinks = this.getLinks();
        var aTilesAndLinks = aTiles.concat(aLinks);

        aTilesAndLinks.forEach(function (oTile) {
            var oDomRef = oTile.getDomRef();
            if (oDomRef) {
                var sOldValue = oDomRef.getAttribute("tabindex");
                if (sOldValue) {
                    oDomRef.setAttribute("data-oldTabindex", sOldValue);
                }
                oDomRef.setAttribute("tabindex", "-1");
            }
        });

        var aCards = aTiles.filter(function (tile) {
            return tile.isA("sap.ui.integration.widgets.Card");
        });

        this._resizeCards(aCards);

        Core.getEventBus().publish("launchpad", "GroupHeaderVisibility");

        this.fireAfterRendering();
    };

    TileContainer.prototype._titleTextClickHandler = function () {
        var bEnableRenameLockedGroup = this.getModel() && this.getModel().getProperty("/enableRenameLockedGroup"),
        bEditMode = (bEnableRenameLockedGroup || !this.getIsGroupLocked())
            && !this.getDefaultGroup()
            && this.getTileActionModeActive();
        this.setEditMode(bEditMode);
    };

    // Improve handling of aggregation updates
    TileContainer.prototype.updateAggregation = override.updateAggregation;

    // Override setters

    TileContainer.prototype.setGroupId = function (sValue, bSuppressRendering) {
        this.setProperty("groupId", sValue, bSuppressRendering);
        this.oPlusTile.setGroupId(sValue, bSuppressRendering);
        return this;
    };

    TileContainer.prototype.setShowIcon = function (bShowIcon, bSuppressRendering) {
        this.setProperty("showIcon", bShowIcon, bSuppressRendering);
        this.oIcon.toggleStyleClass("sapUshellContainerIconHidden", !bShowIcon);
        return this;
    };

    TileContainer.prototype.groupHasTiles = function () {
        var sPath = "",
            tiles = this.getTiles(),
            links = [];
        if (this.getBindingContext()) {
            sPath = this.getBindingContext().sPath;
            tiles = this.getModel().getProperty(sPath).tiles;
        }
        return utils.groupHasVisibleTiles(tiles, links);
    };

    TileContainer.prototype.getInnerContainersDomRefs = function () {
        var oDomRef = this.getDomRef();

        if (!oDomRef) {
            return null;
        }

        return [
            oDomRef.querySelector(".sapUshellTilesContainer-sortable"),
            oDomRef.querySelector(".sapUshellLineModeContainer")
        ];
    };

    /**
     * This updateLinks override is handling for Personalization Links  only and not for sap.m.link.
     *
     * When convert tile is called - we need to update the tiles and links aggregation.
     * There is a problem with updating links aggregation since its entities are not bound to any properties in the model and aggregation is populated by factory function.
     * When override.updateAggregation is called, the GenericTile properties are not updated with new binding context simply because it does not have any bindings,
     * but the number of links in the model is reflected in the control. That causes only the last link to be removed in the UI while links are not updated with their new context.
     */
    TileContainer.prototype.isLinkPersonalizationOveride = function () {
        TileContainer.prototype.updateLinks = function (sReason) {
            var oGroupsBox = this.getParent(),
                bTabsMode = oGroupsBox && oGroupsBox.getDisplayMode && oGroupsBox.getDisplayMode() === "tabs";

            if (bTabsMode && !this.getTileActionModeActive()) {
                // updateAggregation causes all aggregations of the tile containers to be destroyed by calling "destroy" of each
                // entry and not by "destroyAll" method of the control. Since links are not controlled by GLP, we cannot allow to destroy them.
                // In order to prevent destruction of all links, we remove all links from all tile containers except for the selected one.
                oGroupsBox.removeLinksFromUnselectedGroups();
            }
            if (this.getLinks().length > 0) {
                this.removeAllLinks();
            }
            ManagedObject.prototype.updateAggregation.call(this, "links");
        };

        TileContainer.prototype.destroyLinks = function (sReason) {
            Log.debug("link is destroyed because: " + sReason, null, "sap.ushell.ui.launchpad.TileContainer");
        };
    };

    TileContainer.prototype._resizeCards = function (cards) {
        var oCard,
            oManifest,
            fSingleCellSize = 5.5,
            fTileMargin = 0.4375,
            iCardRows,
            iCardCols,
            sCardWidth,
            sCardHeight;

        for (var i = 0; i < cards.length; i++) {
            oCard = cards[i];
            oManifest = oCard.getManifest();

            iCardRows = oManifest["sap.flp"].rows;
            iCardCols = oManifest["sap.flp"].columns;
            sCardWidth = iCardCols * fSingleCellSize + (iCardCols - 3) * fTileMargin + "rem";
            sCardHeight = iCardRows * fSingleCellSize + (iCardRows - 1) * fTileMargin + "rem";

            oCard.setHeight(sCardHeight);
            oCard.setWidth(sCardWidth);
        }
    };

    TileContainer.prototype.setEditMode = function (bValue, bSuppressRendering) {
        this.setProperty("editMode", bValue, bSuppressRendering);
        if (bValue) {
            this.oEditInputField.setValue(this.getHeaderText());
        }

        var oModel = this.getModel();
        if (oModel) {
            oModel.setProperty("/editTitle", bValue);
        }
    };

    TileContainer.prototype._stopEdit = function () {
        var sCurrentTitle = this.getHeaderText();
        var sNewTitle = this.oEditInputField.getValue(),
            bHasChanged;

        sNewTitle = sNewTitle.substring(0, 256).trim() || this._sDefaultValue;
        bHasChanged = sNewTitle !== sCurrentTitle;

        if (this.bIsFirstTitleChange && sNewTitle === this.oEditInputField.getPlaceholder()) {
            bHasChanged = true;
        }
        this.bIsFirstTitleChange = false;
        if (this.getModel() && this.getModel().getProperty("/editTitle")) {
            this.getModel().setProperty("/editTitle", false, false);
        }

        if (bHasChanged) {
            this.fireTitleChange({
                newTitle: sNewTitle
            });
            this.setHeaderText(sNewTitle);
        }
        this.setEditMode(false);
    };

    TileContainer.prototype.exit = function () {
        if (this.oNoLinksText) {
            this.oNoLinksText.destroy();
        }

        if (this.oTransformationErrorText) {
            this.oTransformationErrorText.destroy();
        }

        if (this.oTransformationErrorIcon) {
            this.oTransformationErrorIcon.destroy();
        }

        if (this.oIcon) {
            this.oIcon.destroy();
        }

        if (this.oPlusTile) {
            this.oPlusTile.destroy();
        }

        if (this.oEditInputField) {
            this.oEditInputField.destroy();
        }

        var oTitleText = this.getDomRef("titleText");
        if (oTitleText) {
            oTitleText.removeEventListener("click", this.fnTitleTextClickHandler);
        }

        if (Control.prototype.exit) {
            Control.prototype.exit.apply(this, arguments);
        }
    };

    return TileContainer;
});
