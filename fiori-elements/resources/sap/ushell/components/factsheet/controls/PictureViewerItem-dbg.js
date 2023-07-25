// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.components.factsheet.controls.PictureViewerItem.
sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Image"
], function (Control, Image) {
    "use strict";

    /**
     * Constructor for a new components/factsheet/controls/PictureViewerItem.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Picture viewer control relying on the TileContainer control
     * @extends sap.ui.core.Control
     * @constructor
     * @public
     * @deprecated since 1.22. Please use {@link sap.m.Carousel} instead.
     *   PictureViewerItem is used in PictureViewer control and is not meant to be consumed outside of PictureViewer usage.
     *   PictureViewer was replacing the Carousel as it wasn't supporting some versions of MS Internet Explorer.
     *   Now, the sap.m.Carousel is fully functional, please use sap.m.Carousel instead. This control will not be supported anymore.
     * @name sap.ushell.components.factsheet.controls.PictureViewerItem
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var PictureViewerItem = Control.extend("sap.ushell.components.factsheet.controls.PictureViewerItem", /** @lends sap.ushell.components.factsheet.controls.PictureViewerItem.prototype */ {
        metadata: {
            deprecated: true,
            library: "sap.ushell",
            properties: {
                // Image source url.
                src: { type: "string", group: "Misc", defaultValue: null }
            },
            aggregations: {
                // Pass in an existing Image control to be used inside the PictureViewer
                image: { type: "sap.m.Image", multiple: false }
            }
        }
    });

    /**
     * Setter for property <code>src</code>.
     *
     * Default value is empty/<code>undefined</code>
     *
     * @param {string} sSrc  new value for property <code>src</code>
     * @return {sap.ushell.components.factsheet.controls.PictureViewerItem} <code>this</code> to allow method chaining
     * @public
     * @name sap.ushell.components.factsheet.controls.PictureViewerItem#setSrc
     * @function
     */
    PictureViewerItem.prototype.setSrc = function (sSrc) {
        this.setProperty("src", sSrc);
        // Also create or update the internal image
        var oImage = this.getImage();
        if (oImage == null) {
            oImage = new Image();
        }
        oImage.setSrc(sSrc);
        this.setImage(oImage);
        return this;
    };

    /**
     * Called when the control is destroyed
     */
    PictureViewerItem.prototype.exit = function () {
        var oImage = this.getImage();
        if (oImage) {
            oImage.destroy();
        }
    };

    return PictureViewerItem;
});
