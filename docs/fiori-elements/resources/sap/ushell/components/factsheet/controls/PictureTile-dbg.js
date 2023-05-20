// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.components.factsheet.controls.PictureTile
sap.ui.define([
    "sap/m/CustomTile",
    "sap/m/Button",
    "sap/m/library",
    "sap/ui/Device",
    "sap/ushell/library", // css style dependency
    "./PictureTileRenderer"
], function (
    CustomTile,
    Button,
    mobileLibrary,
    Device
    // ushellLibrary
    // PictureTileRenderer
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    /**
     * Constructor for a new components/factsheet/controls/PictureTile.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Tile control embedding an image and allowing custom sizing
     * @extends sap.m.CustomTile
     * @constructor
     * @public
     * @deprecated since 1.22. Please use {@link sap.m.Carousel} instead.
     *
     * PictureTile is used in PictureViewer control and is not meant to be consumed outside of PictureViewer usage.
     * PictureViewer was replacing the sap.m.Carousel as it wasn't supporting some versions of MS Internet Explorer.
     * Now, the sap.m.Carousel is fully functional, please use sap.m.Carousel instead. This control will not be supported anymore.
     * @name sap.ushell.components.factsheet.controls.PictureTile
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var PictureTile = CustomTile.extend("sap.ushell.components.factsheet.controls.PictureTile", /** @lends sap.ushell.components.factsheet.controls.PictureTile.prototype */ {
        metadata: {
            deprecated: true,
            library: "sap.ushell",
            properties: {
                // height (in pixels) of the picture viewer control.
                height: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "32px" },
                // width (in pixels) of the picture viewer control.
                width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "32px" }
            },
            associations: {
                // Reference to one PictureViewerItem coming from the PictureViewer.
                tileContent: { type: "sap.ushell.components.factsheet.controls.PictureViewerItem", multiple: false }
            },
            events: {
                // Fired when the user deletes a picture
                pictureDelete: {}
            }
        }
    });

    PictureTile.prototype.init = function (/*oTileContent*/) {
        this._oDeletePictureButton = new Button({
            icon: "sap-icon://sys-cancel",
            press: this._deletePictureRequestHandler.bind(this),
            type: ButtonType.Transparent
        }).addStyleClass("sapCaUiPTDeleteButton");

        if (!Device.system.desktop) {
            this.attachPress(this._tilePressedHandler);
            this.attachBrowserEvent("swipe", this._tileSwipedHandler.bind(this));
            this._oDeletePictureButton.addStyleClass("hide");
        }
    };

    /**
     * Reference to one PictureViewerItem coming from the PictureViewer.
     *
     * @override
     * @param {string | sap.ushell.components.factsheet.controls.PictureViewerItem} vTileContent
     *   Id of an element which becomes the new target of this <code>tileContent</code> association.
     *   Alternatively, an element instance may be given.
     * @return {sap.ushell.components.factsheet.controls.PictureTile} <code>this</code> to allow method chaining
     * @public
     * @name sap.ushell.components.factsheet.controls.PictureTile#setTileContent
     * @function
     */
    PictureTile.prototype.setTileContent = function (oTileContent) {
        this.setContent(null);
        if (oTileContent) {
            var image = oTileContent.getImage();

            this.setContent(image);
        } else {
            this.setContent(null);
        }
        this.setAssociation("tileContent", oTileContent);
    };

    /**
     * Sets the pixel size of the tile
     * @param {int} iWidth width
     * @param {int} iHeight height
     * @private
     */
    PictureTile.prototype.setSize = function (iWidth, iHeight) {
        this._width = iWidth;
        this._height = iHeight;

        var $this = this.$();
        if ($this) {
            $this.css({ width: iWidth + "px", height: iHeight + "px" });

            // adding this class later because display: inline-block is causing issue for width/height calculation
            jQuery.sap.byId(this.getId() + "-wrapper").addClass("sapCaUiPTWrapper");
        }
    };

    PictureTile.prototype._tilePressedHandler = function (/*oEvent*/) {
        this.switchVisibility();
    };

    PictureTile.prototype.switchVisibility = function (bVisible) {
        var $delBtn = this._oDeletePictureButton.$();
        if (bVisible === undefined) {
            $delBtn.toggleClass("hide");
        } else {
            $delBtn.toggleClass("hide", !bVisible);
        }
    };

    PictureTile.prototype._tileSwipedHandler = function (/*oEvent*/) {
        var $deleteBtn = this._oDeletePictureButton.$();
        if ($deleteBtn && !$deleteBtn.hasClass("hide")) {
            $deleteBtn.addClass("hide");
        }
    };

    PictureTile.prototype._deletePictureRequestHandler = function () {
        this.firePictureDelete();
    };

    return PictureTile;
});
