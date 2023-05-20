// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.components.factsheet.controls.PictureViewer.
sap.ui.define([
    "sap/m/TileContainer",
    "sap/ui/Device",
    "sap/ushell/components/factsheet/controls/PictureTile",
    "sap/ushell/library", // css style dependency
    "./PictureViewerRenderer"
], function (
    TileContainer,
    Device,
    PictureTile
    // ushellLibrary
    // PictureViewerRenderer
) {
    "use strict";

    /**
     * Constructor for a new components/factsheet/controls/PictureViewer.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Picture viewer control relying on the TileContainer control
     * @extends sap.m.TileContainer
     * @constructor
     * @public
     * @deprecated since 1.22. Please use {@link sap.m.Carousel} instead.
     *   PictureViewer was replacing the Carousel as it wasn't supporting some versions of MS Internet Explorer.
     *   Now, the sap.m.Carousel is fully functional, please use sap.m.Carousel instead.
     *   This control will not be supported anymore.
     * @name sap.ushell.components.factsheet.controls.PictureViewer
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var PictureViewer = TileContainer.extend("sap.ushell.components.factsheet.controls.PictureViewer", /** @lends sap.ushell.components.factsheet.controls.PictureViewer.prototype */ {
        metadata: {
            deprecated: true,
            library: "sap.ushell",
            properties: {
                /**
                 * Percentage of the space occupied by the image in the picture viewer control.
                 * Please note that if the factor is too close to 1, the navigation arrows usually displayed in desktop mode will not be available
                 */
                tileScaling: { type: "float", group: "Misc", defaultValue: 0.95 },
                // Defines whether or not you can remove a picture
                removable: { type: "boolean", group: "Misc", defaultValue: false }
            },
            defaultAggregation: "items",
            aggregations: {
                // Aggregation of PictureViewerItem that contains either a picture URI or the actual Image control.
                items: { type: "sap.ushell.components.factsheet.controls.PictureViewerItem", multiple: true, singularName: "item" }
            },
            events: {
                // Thrown when user delete an image
                pictureDeleted: {}
            }
        }
    });

    PictureViewer.prototype.init = function () {
        TileContainer.prototype.init.apply(this);
        this.setEditable(false);

        if (sap.ui.getCore().isMobile()) {
            jQuery(window).bind("tap", this._reset.bind(this));
            var oStaticArea = sap.ui.getCore().getStaticAreaRef();
            this.$blocker = jQuery("<div class='sapCaPVBly sapUiBLy'></div>").css("visibility", "hidden");
            jQuery(oStaticArea).append(this.$blocker);
        }
        if (!sap.ui.getCore().isMobile()) {
            jQuery(window).bind("resize", this._resize.bind(this));
        }

        this.addStyleClass("sapCaPW");

        // onBeforeRendering() is not called the first time
        this.addStyleClass("sapCaPWRendering");
    };

    /**
     * Handles the resize event for the tile container.
     * This is called whenever the orientation of browser size changes.
     * @private
     */
    PictureViewer.prototype._resize = function () {
        if (this._oDragSession) {
            return;
        }

        setTimeout(function () {
            this._applyDimension();
            this._update(false);
            delete this._iInitialResizeTimeout;
        }.bind(this), this._iInitialResizeTimeout);

        this._iInitialResizeTimeout = 0; //now we do not need to wait
    };

    PictureViewer.prototype.exit = function () {
        this.$blocker.remove();

        if (!sap.ui.getCore().isMobile()) {
            jQuery(window).unbind("resize", this._resize.bind(this));
        }

        TileContainer.prototype.exit.apply(this);

        if (!Device.system.desktop) {
            jQuery(window).unbind("tap", this._reset.bind(this));
        }
    };

    /**
     * Set the percentage of the space occupied by the image in the picture viewer control.
     * Please note that if the factor is too close to 1, the navigation arrows usually displayed in desktop mode will not be available
     * @override
     * @public
     * @param fTileScale
     */
    PictureViewer.prototype.setTileScaling = function (fTileScale) {
        if (fTileScale < 0 || fTileScale > 1) {
            fTileScale = 0.75;
            jQuery.sap.log.error("Tile Scaling should be a float value between 0 and 1 and not " + fTileScale
                + ". Setting it to 0.75 by default.");
        }
        this.setProperty("tileScaling", fTileScale);
    };

    /**
     * Adds some item <code>oItem</code> to the aggregation named <code>items</code>.
     * Deprecated, use aggregation "tiles".
     *
     * @override
     * @param {sap.ushell.components.factsheet.controls.PictureViewerItem} oItem the item to add; if empty, nothing is inserted
     * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
     * @public
     * @name sap.ushell.components.factsheet.controls.PictureViewer#addItem
     * @function
     * @deprecated since 1.18
     */
    PictureViewer.prototype.addItem = function (oItem) {
        this.insertItem(oItem, this.getItems().length);
    };

    /**
     * Inserts a item into the aggregation named <code>items</code>.
     * When adding a new item to the aggregation, a sap.ca.ui.PictureTile is actually created
     * with its own ID and added to the internal TileContainer.
     * Deprecated, use aggregation "tiles".
     *
     * @override
     * @param {sap.ushell.components.factsheet.controls.PictureViewerItem} oItem the item to insert; if empty, nothing is inserted
     * @param {int} iIndex the <code>0</code>-based index the item should be inserted at;
     *   for a negative value of <code>iIndex</code>, the item is inserted at position 0;
     *   for a value greater than the current size of the aggregation, the item is inserted at the last position
     * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
     * @public
     * @name sap.ushell.components.factsheet.controls.PictureViewer#insertItem
     * @function
     * @deprecated since 1.18
     */
    PictureViewer.prototype.insertItem = function (oItem, iIndex) {
        var tileToAdd = new PictureTile({
            tileContent: oItem
        });
        tileToAdd.attachPictureDelete(this._deletePictureRequestHandler.bind(this));

        this.insertTile(tileToAdd, iIndex);
        this.insertAggregation("items", oItem, iIndex);

        return this;
    };

    PictureViewer.prototype.insertTile = function (oTile/*, iIndex*/) {
        oTile.attachPictureDelete(jQuery.proxy(this._deletePictureRequestHandler, this));
        TileContainer.prototype.insertTile.apply(this, arguments);
    };

    PictureViewer.prototype.deleteTile = function (oTile) {
        TileContainer.prototype.deleteTile.apply(this, arguments);

        oTile.destroy();
    };

    /**
     * Removes the picture at index <code>iIndex</code> from the <code>items</code> aggregation.
     *
     * @override
     * @param {int} iIndex the <code>0</code>-based index of the picture collection to delete;
     *   if <code>iIndex</code> is out of range or empty, the current image will be deleted.
     * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
     * @public
     * @name sap.ushell.components.factsheet.controls.PictureViewer#deletePicture
     * @function
     */
    PictureViewer.prototype.deletePicture = function (iIndex) {
        var pictureTileIndexToDelete, pictureTileToDelete, numberOfPictures;
        numberOfPictures = this.getTiles().length;

        if (typeof iIndex !== "number" || iIndex < 0 || iIndex >= numberOfPictures) {
            pictureTileIndexToDelete = this.getPageFirstTileIndex();
        } else {
            pictureTileIndexToDelete = iIndex;
        }

        if (pictureTileIndexToDelete > -1) {
            pictureTileToDelete = this.getTiles()[pictureTileIndexToDelete];
            pictureTileToDelete.detachPictureDelete(jQuery.proxy(this._deletePictureRequestHandler, this));
            this.deleteTile(pictureTileToDelete);
            this.removeAggregation("items", pictureTileIndexToDelete, true);
        } else {
            jQuery.sap.log.warning("Cannot find and delete a picture at index : " + iIndex);
        }

        return this;
    };

    /**
     * Select the picture at index <code>iIndex</code> from the <code>items</code> aggregation.
     *
     * @override
     * @param {int} iIndex the <code>0</code>-based index of the aggregation to select;
     *   for a negative value of <code>iIndex</code>, the picture at position 0 is selected;
     *   for a value greater than the current size of the aggregation, the selected picture at the last position is selected
     * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
     * @public
     * @name sap.ushell.components.factsheet.controls.PictureViewer#selectPicture
     * @function
     */
    PictureViewer.prototype.selectPicture = function (iIndex) {
        var numberOfPictures = this.getTiles().length;

        if (typeof iIndex !== "number") {
            iIndex = 0;
        } else if (iIndex < 0) {
            iIndex = 0;
        } else if (iIndex >= numberOfPictures) {
            iIndex = numberOfPictures - 1;
        }

        if (this._bRendered) {
            this.addStyleClass("sapCaPWRendering");
        }
        this._selectedIndex = iIndex;

        return this;
    };

    PictureViewer.prototype.setSelectedIndex = function (iIndex) {
        this.selectPicture(iIndex);
    };

    /**
     * Gets the current picture index.
     *
     * @override
     * @return {sap.ushell.components.factsheet.controls.PictureViewer} the current picture index
     * @public
     * @name sap.ushell.components.factsheet.controls.PictureViewer#getCurrentPictureIndex
     * @function
     */
    PictureViewer.prototype.getCurrentPictureIndex = function () {
        return this.getPageFirstTileIndex();
    };

    /**
     * Gets the image index from the TileContainer and fires an event
     */
    PictureViewer.prototype._deletePictureRequestHandler = function (oEvent) {
        var pictureTileIndexToDelete = this.indexOfTile(oEvent.getSource());

        this.deleteTile(oEvent.getSource());

        this.firePictureDeleted({
            index: pictureTileIndexToDelete
        });
    };

    /**
     * Get rid of potential visible "delete" button
     *
     * Only used on mobile devices
     */
    PictureViewer.prototype._reset = function (oEvent) {
        var i = this.getCurrentPictureIndex();

        var aTiles = this.getTiles();
        if (i > -1 && aTiles && aTiles.length > i) {
            var oTile = aTiles[i];
            if (oTile) {
                var $target = jQuery(oEvent.target);
                var $this = this.$();
                if ($this.length > 0 && $target.length > 0) {
                    var $parent = $target.closest(this.$());

                    if ($parent.length === 0) { // the "tap" was outside the PictureViewer
                        oTile.switchVisibility(false);
                    }
                }
            }
        }
    };

    /**
     * Specify whether or not you can delete a picture.
     * If FALSE the delete button will never be visible. Default value is TRUE
     * @override
     * @public
     */
    PictureViewer.prototype.setRemovable = function (bValue) {
        this.setProperty("removable", bValue, true);
        this.toggleStyleClass("sapCaPWEditable", bValue);
    };

    PictureViewer.prototype.setEditable = function (/*bValue*/) {
        // set Editable to false no matter what
        TileContainer.prototype.setEditable.call(this, false);
    };

    /**
     * Returns the dimension (width and height) of a tile
     * @returns {object} width and height of a tile
     * @private
     */
    PictureViewer.prototype._getTileDimension = function () {
        if (!this._bRendered) {
            return;
        }

        var $scroller = jQuery.sap.byId(this.getId() + "-scrl");
        var oTileDim = {
            width: $scroller.width(),
            height: $scroller.height()
        };
        return oTileDim;
    };

    PictureViewer.prototype.onBeforeRendering = function () {
        this.addStyleClass("sapCaPWRendering");
    };

    /**
     * Handles the internal event onAfterRendering
     * @private
     */
    PictureViewer.prototype.onAfterRendering = function () {
        var that = this;
        this._bRendered = true;
        //init resizing
        //init the dimensions to the container scoll area
        this._applyDimension();
        this.$().toggleClass("sapCaPWEditable", this.getRemovable() === true);
        this._sInitialResizeTimeoutId = setTimeout(function () {
            that.addStyleClass("sapCaPWRendering");
            that._applyPageStartIndex(that._selectedIndex);

            that._update(false);
        }, this._iInitialResizeTimeout);

        // Set initial focus
        if (Device.system.desktop) {
            var oFocusTile = this.getTiles()[0],
                iTimeout = this._iInitialResizeTimeout;
            if (oFocusTile) {
                setTimeout(function () {
                    this._findTile(oFocusTile.$()).focus();
                }.bind(this), iTimeout);
            }
        }
    };

    /**
     * @override
     */
    PictureViewer.prototype._update = function (/*bAnimated*/) {
        TileContainer.prototype._update.apply(this, arguments);

        this.removeStyleClass("sapCaPWRendering");
        if (sap.ui.getCore().isMobile()) {
            var that = this;
            var thatBlocker = this.$blocker;
            setTimeout(function () {
                thatBlocker.fadeOut(200, function () { that.css("visibility", "hidden").css("z-index", 0); });
            }, 250);
        }
    };

    /**
     * Applies the containers dimensions
     * @private
     */
    PictureViewer.prototype._applyDimension = function () {
        var oDim = this._getContainerDimension(),
            sId = this.getId(),
            $this = this.$(),
            oThisPos,
            iOffset = 10,
            iTopOffset = 60,
            $Content = jQuery.sap.byId(sId + "-cnt"),
            contentPos,
            contentOuterHeight,
            pagerHeight = jQuery.sap.byId(sId + "-pager").outerHeight();

        jQuery.sap.byId(sId + "-scrl").css({
            width: oDim.outerwidth + "px",
            height: (oDim.outerheight - pagerHeight) + "px"
        });

        $Content.css({
            height: (oDim.outerheight - pagerHeight) + "px",
            visibility: "visible"
        });

        $this.css("visibility", "visible");
        oThisPos = $this.position();

        contentPos = $Content.position();
        contentOuterHeight = $Content.outerHeight();

        if (jQuery.device.is.phone) {
            iOffset = 2;
        } else if (Device.system.desktop) {
            iOffset = 0;
        }

        jQuery.sap.byId(sId + "-blind").css({
            top: (contentPos.top + iOffset) + "px",
            left: (contentPos.left + iOffset) + "px",
            width: ($Content.outerWidth() - iOffset) + "px",
            height: (contentOuterHeight - iOffset) + "px"
        });

        jQuery.sap.byId(sId + "-rightedge").css({
            top: (oThisPos.top + iOffset + iTopOffset) + "px",
            right: iOffset + "px",
            height: (contentOuterHeight - iOffset - iTopOffset) + "px"
        });

        jQuery.sap.byId(sId + "-leftedge").css({
            top: (oThisPos.top + iOffset + iTopOffset) + "px",
            left: (oThisPos.left + iOffset) + "px",
            height: (contentOuterHeight - iOffset - iTopOffset) + "px"
        });
    };

    /**
     * Adding overlay to hide blinking while switching orientation
     *
     * @private
     */
    PictureViewer.prototype.showBlockerLayer = function (callback) {
        // get higher z-index
        if (sap.ui.getCore().isMobile()) {
            var zindex = 20;
            jQuery(sap.ui.getCore().getStaticAreaRef()).children().each(function (index, value) {
                var z = parseInt(jQuery(value).css("z-index"), 10);
                if (!isNaN(z)) {
                    zindex = Math.max(zindex, z);
                }
            });
            jQuery.sap.log.debug("blocker layer z-index calculated : " + zindex + 1);
            this.$blocker.css("z-index", zindex + 1).css("visibility", "visible").fadeIn(200, function () {
                if (callback) {
                    callback.call();
                }
            });
        } else if (callback) {
            callback.call();
        }
    };

    return PictureViewer;
});
