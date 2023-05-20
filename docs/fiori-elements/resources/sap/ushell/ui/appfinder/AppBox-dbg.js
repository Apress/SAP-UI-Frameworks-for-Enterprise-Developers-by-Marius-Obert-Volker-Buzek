// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.appfinder.AppBox.
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/Icon",
    "sap/ui/core/IconPool",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/appfinder/AppBoxRenderer"
], function (Control, Icon, IconPool, ushellLibrary, resources, AppBoxRenderer) {
    "use strict";

    /**
     * Constructor for a new ui/appfinder/AppBox.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * Add your documentation for the new ui/appfinder/AppBox
     * @extends sap.ui.core.Control
     *
     * @constructor
     * @public
     * @name sap.ushell.ui.appfinder.AppBox
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var AppBox = Control.extend("sap.ushell.ui.appfinder.AppBox", /** @lends sap.ushell.ui.appfinder.AppBox.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 * Specifies the title of the appBox.
                 */
                title: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies the subTitle of the appBox.
                 */
                subtitle: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies the icon url of the appBox.
                 */
                icon: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies the url of the appBox.
                 */
                url: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies the navigationMode of the appBox.
                 */
                navigationMode: { type: "string", group: "Misc", defaultValue: null }
            },
            aggregations: {

                /**
                 * The pinButton aggregation that can contain the pin button.
                 */
                pinButton: { type: "sap.m.Button", multiple: false }
            },
            events: {

                /**
                 * Fires when the appBox is pressed.
                 */
                press: {},

                /**
                 * Fires after the appBox is rendered.
                 */
                afterRendering: {}
            }
        },
        renderer: AppBoxRenderer
    });

    /**
     * Provides control sap.ushell.ui.appfinder.AppBox
     * @private
     */
    AppBox.prototype.init = function () {
        this._oIcon = new Icon().addStyleClass("sapUshellAppBoxIcon");
    };

    AppBox.prototype.destroy = function () {
        Control.prototype.destroy.apply(this, arguments);
        this._oIcon.destroy();
    };

    AppBox.prototype.onAfterRendering = function () {
        var jqAppBoxTitle = this.$("title"),
            jqAppBoxSubTitle = this.$("subTitle");

        var iTitleLineHeight = parseInt(jqAppBoxTitle.css("lineHeight"), 10),
            iTitleHeight = jqAppBoxTitle.height();

        if ((iTitleHeight / iTitleLineHeight) > 1) {
            jqAppBoxTitle.addClass("sapUshellAppBoxHeaderElementTwoLines");
            jqAppBoxSubTitle.addClass("sapUshellAppBoxHeaderElementOneLine");
        } else {
            jqAppBoxTitle.addClass("sapUshellAppBoxHeaderElementOneLine");
            jqAppBoxSubTitle.addClass("sapUshellAppBoxHeaderElementTwoLines");
        }

        this.fireAfterRendering();
    };

    AppBox.prototype.setIcon = function (sIconUrl) {
        this.setProperty("icon", sIconUrl);
        this._oIcon.setSrc(IconPool.isIconURI(sIconUrl) ? sIconUrl : null);
    };

    AppBox.prototype._getAriaLabel = function () {
        var sAriaLabel = this.getTitle(),
            sSubTitle = this.getSubtitle(),
            sNavigationMode = this.getNavigationMode();

        if (sSubTitle) {
            sAriaLabel += " " + sSubTitle;
        }

        if (sNavigationMode) {
            sAriaLabel += " " + resources.i18n.getText(sNavigationMode + "NavigationMode");
        }

        return sAriaLabel;
    };

    // browser events
    AppBox.prototype.onclick = AppBox.prototype.firePress;

    AppBox.prototype.onsapspace = function (e) {
        e.preventDefault();
        this.firePress(e);
    };

    AppBox.prototype.onsapenter = AppBox.prototype.onsapspace;

    return AppBox;
});
