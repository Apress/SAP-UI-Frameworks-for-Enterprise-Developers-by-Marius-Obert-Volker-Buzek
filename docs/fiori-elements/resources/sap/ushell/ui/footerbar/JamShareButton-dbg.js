// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.JamShareButton.
sap.ui.define([
    "sap/base/Log",
    "sap/collaboration/components/fiori/sharing/dialog/Component",
    "sap/m/Button",
    "sap/m/ButtonRenderer", // will load the renderer async
    "sap/ui/core/Core",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources"
], function (
    Log,
    Component,
    Button,
    ButtonRenderer,
    Core,
    ushellLibrary,
    resources
) {
    "use strict";

    /**
     * Constructor for a new ui/footerbar/JamShareButton.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * Add your documentation for the new ui/footerbar/JamShareButton
     * @extends sap.m.Button
     *
     * @constructor
     * @public
     * @name sap.ushell.ui.footerbar.JamShareButton
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var JamShareButton = Button.extend("sap.ushell.ui.footerbar.JamShareButton", /** @lends sap.ushell.ui.footerbar.JamShareButton.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                beforePressHandler: { type: "any", group: "Misc", defaultValue: null },
                afterPressHandler: { type: "any", group: "Misc", defaultValue: null },
                jamData: { type: "object", group: "Misc", defaultValue: null }
            }
        },
        renderer: ButtonRenderer
    });

    /**
     * JamShareButton
     *
     * @name sap.ushell.ui.footerbar.JamShareButton
     * @private
     * @since 1.15.0
     */
    JamShareButton.prototype.init = function () {
        // call the parent sap.m.Button init method
        if (Button.prototype.init) {
            Button.prototype.init.apply(this, arguments);
        }

        this.setEnabled(); // disables button if shell not initialized or Jam not active
        this.setIcon("sap-icon://share-2");
        this.setText(resources.i18n.getText("shareBtn"));

        this.attachPress(function () {
            if (this.getBeforePressHandler()) {
                this.getBeforePressHandler()();
            }
            this.showShareDialog(this.getAfterPressHandler());
        }.bind(this));
    };

    JamShareButton.prototype.showShareDialog = function (cb) {
        function openDialog () {
            this.shareComponent.setSettings(this.getJamData());
            this.shareComponent.open();

            // TODO: call callback after dialog vanishes
            if (cb) {
                cb();
            }
        }

        if (!this.shareComponent) {
            this.shareComponent = Core.createComponent({
                name: "sap.collaboration.components.fiori.sharing.dialog"
            });
        }

        if (sap.ushell.Container && sap.ushell.Container.inAppRuntime()) {
            this.adjustFLPUrl(this.getJamData())
                .then(function () {
                    openDialog.call(this);
                }.bind(this), function (sError) {
                    Log.error("Could not retrieve FLP URL", sError,
                        "sap.ushell.ui.footerbar.JamShareButton");
                });
        } else {
            openDialog.call(this);
        }
    };

    JamShareButton.prototype.exit = function () {
        if (this.shareComponent) {
            this.shareComponent.destroy();
        }
        // call the parent sap.m.Button exit method
        if (Button.prototype.exit) {
            Button.prototype.exit.apply(this, arguments);
        }
    };

    JamShareButton.prototype.setEnabled = function (bEnabled) {
        if (sap.ushell.Container) {
            var oUser = sap.ushell.Container.getUser();
            if (!(oUser && oUser.isJamActive())) {
                if (!bEnabled) {
                    Log.info("Disabling JamShareButton: user not logged in or Jam not active", null,
                        "sap.ushell.ui.footerbar.JamShareButton");
                }
                bEnabled = false;
                this.setVisible(false);
            }
        } else {
            if (!bEnabled) {
                Log.warning("Disabling JamShareButton: unified shell container not initialized", null,
                    "sap.ushell.ui.footerbar.JamShareButton");
            }
            bEnabled = false;
        }
        Button.prototype.setEnabled.call(this, bEnabled);
    };

    /**
     *
     * in cFLP, the URL of FLP needs to be taken from the outer shell and not from
     * the iframe, so the proper URL will be shared in JAM
     *
     * @name sap.ushell.ui.footerbar.JamShareButton
     * @param {object} jamData data that contains a URL
     * @returns {Promise<undefined>}
     *  resolves if jamData is incomplete, wrong or was changed.
     *  rejects if call to getFLPUrl failed.
     * @private
     * @since 1.74.0
     */
    JamShareButton.prototype.adjustFLPUrl = function (jamData) {
        if (jamData && jamData.object && jamData.object.id && typeof jamData.object.id === "string" && jamData.object.id === document.URL) {
            return sap.ushell.Container.getFLPUrl(true).then(function (sURL) {
                jamData.object.id = sURL;
            });
        }

        return Promise.resolve();
    };

    return JamShareButton;
}, true /* bExport */);
