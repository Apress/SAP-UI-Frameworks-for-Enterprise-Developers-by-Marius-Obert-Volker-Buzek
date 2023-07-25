// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Control",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "./ShellFloatingAction"
], function (
    Control,
    ushellLibrary,
    resources,
    ShellFloatingAction
) {
    "use strict";

    var ShellFloatingActions = Control.extend("sap.ushell.ui.shell.ShellFloatingActions", {
        metadata: {
            library: "sap.ushell",
            properties: {
                isFooterVisible: { type: "boolean", defaultValue: false }
            },
            aggregations: {
                floatingActions: { type: "sap.ushell.ui.shell.ShellFloatingAction", multiple: true, singularName: "floatingAction" }
            }
        },

        renderer: {
            apiVersion: 2,

            /**
             * Renders the HTML for the ShellFloatingActions, using the provided {@link sap.ui.core.RenderManager}.
             *
             * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
             * @param {sap.ui.core.Control} shellFloatingActions ShellFloatingActions to be rendered
             */
            render: function (rm, shellFloatingActions) {
                var aFloatingActions = shellFloatingActions.getFloatingActions();

                rm.openStart("div", shellFloatingActions);
                rm.class("sapUshellShellFloatingActions");
                rm.openEnd();
                if (aFloatingActions.length) {
                    var oFloatingAction;

                    if (aFloatingActions.length === 1) {
                        oFloatingAction = aFloatingActions[0];
                    } else {
                        oFloatingAction = shellFloatingActions._createMultipleFloatingActionsButton(aFloatingActions);
                        aFloatingActions.forEach(function (oFA) {
                            oFA.setVisible(false);
                            rm.renderControl(oFA);
                        });
                    }
                    rm.renderControl(oFloatingAction);
                }
                rm.close("div");
            }
        }
    });

    ShellFloatingActions.prototype._createMultipleFloatingActionsButton = function (aFloatingActions) {
        var iFloatingActionHeight;
        var that = this;
        return new ShellFloatingAction({
            id: this.getId() + "-multipleFloatingActions",
            icon: "sap-icon://add",
            visible: true,
            press: function () {
                if (!this.hasStyleClass("sapUshellShellFloatingActionRotate")) {
                    this.addStyleClass("sapUshellShellFloatingActionRotate");
                    if (!iFloatingActionHeight) {
                        iFloatingActionHeight = parseInt(this.$().outerHeight(), 10) + parseInt(that.$().css("bottom"), 10);
                    }

                    aFloatingActions.forEach(function (oFloatingButton) {
                        oFloatingButton.setVisible(true);
                    });

                    setTimeout(function () {
                        aFloatingActions.forEach(function (oFloatingButton, iIndex) {
                            var itemY = iFloatingActionHeight * (iIndex + 1);
                            oFloatingButton.$().css("transform", "translateY(-" + itemY + "px)");
                            oFloatingButton.data("transformY", "-" + itemY + "px");
                        });
                    }, 0);
                } else {
                    this.removeStyleClass("sapUshellShellFloatingActionRotate");

                    aFloatingActions.forEach(function (oFloatingButton) {
                        oFloatingButton.$().css("transform", "translateY(0)");
                    });

                    setTimeout(function () {
                        aFloatingActions.forEach(function (oFloatingButton) {
                            oFloatingButton.setVisible(false);
                            oFloatingButton.data("transformY", undefined);
                        });
                    }, 150);
                }
            },
            tooltip: resources.i18n.getText("XXX")
        });
    };

    ShellFloatingActions.prototype.removeFloatingAction = function (oActionButton) {
        if (typeof oActionButton === "number") {
            oActionButton = this.getAggregation("floatingActions")[oActionButton];
        }
        this.removeAggregation("floatingActions", oActionButton);
        return this;
    };

    return ShellFloatingActions;
});
