// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.GroupHeaderActions.
sap.ui.define([
    "sap/m/Button",
    "sap/m/library",
    "sap/ui/core/Control",
    "sap/ushell/library" // css style dependency
], function (
    Button,
    mobileLibrary,
    Control
    // ushellLibrary
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.PlacementType
    var PlacementType = mobileLibrary.PlacementType;

    /**
     * Constructor for a new ui/launchpad/GroupHeaderActions.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Add your documentation for the new ui/launchpad/GroupHeaderActions
     * @extends sap.ui.core.Control
     * @constructor
     * @public
     * @name sap.ushell.ui.launchpad.GroupHeaderActions
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var GroupHeaderActions = Control.extend("sap.ushell.ui.launchpad.GroupHeaderActions", /** @lends sap.ushell.ui.launchpad.GroupHeaderActions.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                isOverflow: { type: "boolean", group: "Misc", defaultValue: false },
                tileActionModeActive: { type: "boolean", group: "Misc", defaultValue: false }
            },
            aggregations: {
                content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
            }
        },
        renderer: {
            apiVersion: 2,

            /**
             * Renders the HTML for the given groupHeaderActions, using the provided {@link sap.ui.core.RenderManager}.
             *
             * @param {sap.ui.core.RenderManager} rm RenderManager that can be used for writing to the render output buffer.
             * @param {sap.ushell.ui.launchpad.GroupHeaderActions} groupHeaderActions groupHeaderActions to be rendered.
             */
            render: function (rm, groupHeaderActions) {
                rm.openStart("div", groupHeaderActions);
                rm.openEnd(); // div - tag

                var aContent = groupHeaderActions.getContent();

                if (groupHeaderActions.getTileActionModeActive()) {
                    if (groupHeaderActions.getIsOverflow()) {
                        var bHasVisibleContent = aContent.some(function (oContent) {
                            return oContent.getVisible();
                        });

                        if (bHasVisibleContent) {
                            rm.renderControl(groupHeaderActions._getOverflowButton());
                        }
                    } else {
                        aContent.forEach(function (oContent) {
                            rm.renderControl(oContent);
                        });
                    }
                }
                rm.close("div");
            }
        }
    });

    /**
     * @name sap.ushell.ui.launchpad.GroupHeaderActions
     * @private
     */
    GroupHeaderActions.prototype.exit = function () {
        if (this._oOverflowButton) {
            this._oOverflowButton.destroy();
        }

        if (this._oActionSheet) {
            this._oActionSheet.destroy();
        }
    };

    GroupHeaderActions.prototype._getOverflowButton = function () {
        if (!this._oOverflowButton) {
            this._oOverflowButton = new Button({
                icon: "sap-icon://overflow",
                type: ButtonType.Transparent,
                enabled: "{= !${/editTitle}}",
                press: function () {
                    sap.ui.require(["sap/m/ActionSheet"], function (ActionSheet) {
                        if (!this._oActionSheet) {
                            this._oActionSheet = new ActionSheet({
                                placement: PlacementType.Auto
                            });
                        }

                        this._oActionSheet.destroyButtons();

                        this.getContent().forEach(function (oButton) {
                            var cButton = oButton.clone();
                            cButton.setModel(oButton.getModel());
                            cButton.setBindingContext(oButton.getBindingContext());
                            this._oActionSheet.addButton(cButton);
                        }.bind(this));

                        this._oActionSheet.openBy(this._oOverflowButton);
                    }.bind(this));
                }.bind(this)
            }).addStyleClass("sapUshellHeaderActionButton");
            this._oOverflowButton.setParent(this);
        }
        return this._oOverflowButton;
    };

    return GroupHeaderActions;
});
