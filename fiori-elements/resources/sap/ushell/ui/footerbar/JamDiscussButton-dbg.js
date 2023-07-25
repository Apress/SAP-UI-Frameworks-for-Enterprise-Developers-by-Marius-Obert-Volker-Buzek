// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.JamDiscussButton.
sap.ui.define([
    "sap/base/Log",
    "sap/m/Button",
    "sap/m/ButtonRenderer", // will load the renderer async
    "sap/ui/core/Core",
    "sap/ushell/resources"
], function (
    Log,
    Button,
    ButtonRenderer,
    Core,
    resources
) {
    "use strict";

    /**
     * Constructor for a new ui/footerbar/JamDiscussButton.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Add your documentation for the new ui/footerbar/JamDiscussButton
     * @extends sap.m.Button
     * @constructor
     * @public
     * @name sap.ushell.ui.footerbar.JamDiscussButton
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var JamDiscussButton = Button.extend("sap.ushell.ui.footerbar.JamDiscussButton", /** @lends sap.ushell.ui.footerbar.JamDiscussButton.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                beforePressHandler:
                    { type: "any", group: "Misc", defaultValue: null },
                afterPressHandler:
                    { type: "any", group: "Misc", defaultValue: null },
                jamData:
                    { type: "object", group: "Misc", defaultValue: null }
            }
        },
        renderer: ButtonRenderer
    });

    /**
     * JamDiscussButton
     *
     * @name sap.ushell.ui.footerbar.JamDiscussButton
     * @private
     * @since 1.15.0
     */
    JamDiscussButton.prototype.init = function () {
        var that = this;

        // call the parent sap.m.Button init method
        if (Button.prototype.init) {
            Button.prototype.init.apply(this, arguments);
        }

        this.setEnabled(); // disables button if shell not initialized or Jam not active
        this.setIcon("sap-icon://discussion-2");
        this.setText(resources.i18n.getText("discussBtn"));

        this.attachPress(function () {
            if (that.getBeforePressHandler()) {
                that.getBeforePressHandler()();
            }
            this.showDiscussDialog(that.getAfterPressHandler());
        });
    };

    JamDiscussButton.prototype.showDiscussDialog = function (cb) {
        if (!this.discussComponent) {
            this.discussComponent = Core.createComponent({
                name: "sap.collaboration.components.fiori.feed.dialog"
            });
        }
        this.discussComponent.setSettings(this.getJamData());
        this.discussComponent.open();

        // TODO: call callback after dialog vanishes
        if (cb) {
            cb();
        }
    };

    JamDiscussButton.prototype.setEnabled = function (bEnabled) {
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                Log.warning(
                    "Disabling JamDiscussButton: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.JamDiscussButton"
                );
            }
            bEnabled = false;
        } else {
            var user = sap.ushell.Container.getUser();
            if (!(user && user.isJamActive())) {
                if (this.getEnabled()) {
                    Log.info(
                        "Disabling JamDiscussButton: user not logged in or Jam not active",
                        null,
                        "sap.ushell.ui.footerbar.JamDiscussButton"
                    );
                }
                bEnabled = false;
                this.setVisible(false);
            }
        }
        Button.prototype.setEnabled.call(this, bEnabled);
    };

    return JamDiscussButton;
});
