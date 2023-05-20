// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.AboutButton.
sap.ui.define([
    "sap/m/ButtonRenderer", // will load the renderer async
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/ActionItem"
], function (
    ButtonRenderer,
    resources,
    ActionItem
) {
    "use strict";

    /**
     * Constructor for a new ui/footerbar/AboutButton.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Add your documentation for the new ui/footerbar/AboutButton
     * @extends sap.ushell.ui.launchpad.ActionItem
     * @constructor
     * @public
     * @name sap.ushell.ui.footerbar.AboutButton
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var AboutButton = ActionItem.extend("sap.ushell.ui.footerbar.AboutButton", /** @lends sap.ushell.ui.footerbar.AboutButton.prototype */ {
        metadata: { library: "sap.ushell" },
        renderer: ButtonRenderer
    });

    /**
     * AboutButton
     *
     * @name sap.ushell.ui.footerbar.AboutButton
     * @private
     * @since 1.16.0
     */
    AboutButton.prototype.init = function () {
        // call the parent sap.ushell.ui.launchpad.ActionItem init method
        if (ActionItem.prototype.init) {
            ActionItem.prototype.init.apply(this, arguments);
        }
        this.setIcon("sap-icon://hint");
        this.setText(resources.i18n.getText("about"));
        this.attachPress(this.showAboutDialog);
    };

    AboutButton.prototype.showAboutDialog = function () {
        return new Promise(function (resolve, reject) {
            sap.ui.require([
                "sap/ushell/ui/footerbar/AboutDialog.controller",
                "sap/ui/core/Fragment"
            ], function (
                AboutDialogController,
                Fragment
            ) {
                Fragment.load({
                    id: "aboutDialogFragment",
                    name: "sap.ushell.ui.footerbar.AboutDialog",
                    type: "XML",
                    controller: new AboutDialogController()
                }).then(function (dialog) {
                    dialog.setModel(resources.getTranslationModel(), "i18n");
                    dialog.open();
                    resolve();
                }).catch(reject);
            });
        });
    };

    return AboutButton;
});
