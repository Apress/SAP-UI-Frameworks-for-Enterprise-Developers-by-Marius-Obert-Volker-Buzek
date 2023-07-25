// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/ui/Device",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/ui/shell/ShellHeadItem"
], function (
    Log,
    Device,
    UIComponent,
    JSONModel,
    Config,
    resources,
    WindowUtils,
    ShellHeadItem
) {
    "use strict";

    function getProductSwitchButton () {
        return sap.ui.getCore().byId("productSwitchBtn");
    }

    function getProductSwitchPopover () {
        return sap.ui.getCore().byId("sapUshellProductSwitchPopover");
    }

    return UIComponent.extend("sap.ushell.components.shell.ProductSwitch.Component", {

        metadata: {
            version: "1.113.0",
            library: "sap.ushell.components.shell.ProductSwitch",
            dependencies: {
                libs: {
                    "sap.m": {},
                    "sap.f": {
                        lazy: true
                    }
                }
            }
        },

        createContent: function () {
            this.oModel = this._getModel();
        },

        _getModel: function () {
            var that = this,
                oModel = new JSONModel();
            oModel.loadData(Config.last("/core/productSwitch/url"))
                .then(function () {
                    var aProducts = oModel.getData();
                    if (aProducts.length === 0) {
                        Log.debug("There are no other profucts configured for your user. ProductSwitch button will be hidden.");
                    } else {
                        that._addProductSwitchButtonToHeader();
                    }
                })
                .catch(function (err) {
                    Log.debug(err);
                });
            return oModel;
        },

        _openProductSwitch: function () {
            var oPopover = getProductSwitchPopover(),
                oLoadPopover = Promise.resolve();

            if (!oPopover) {
                oLoadPopover = new Promise(function (resolve, reject) {
                    sap.ui.require(["sap/ui/core/Fragment"], function (Fragment) {
                        Fragment.load({
                            name: "sap.ushell.components.shell.ProductSwitch.ProductSwitch",
                            type: "XML",
                            controller: this
                        }).then(resolve).catch(reject);
                    }.bind(this), reject);
                }.bind(this)).then(function (popover) {
                    oPopover = popover;
                    oPopover.setModel(this.oModel);
                    oPopover.setModel(resources.i18nModel, "i18n");
                    if (Device.system.phone) {
                        oPopover.setShowHeader(true);
                    }
                }.bind(this));
            }

            oLoadPopover.then(function () {
                var oSource = getProductSwitchButton();
                // if the button is hidden in the overflow, use the overflow button itself
                if (!oSource || !oSource.$().width()) {
                    oSource = sap.ui.getCore().byId("endItemsOverflowBtn");
                }

                oPopover.openBy(oSource);
            });

            return oLoadPopover;
        },

        onProductItemPress: function (oEvent) {
            var sTargetUrl = oEvent.getParameter("itemPressed").getTargetSrc();
            getProductSwitchPopover().close();
            WindowUtils.openURL(sTargetUrl, "_blank");
        },

        /**
         * Create and add the product switch button to the header
         */
        _addProductSwitchButtonToHeader: function () {
            var oProductSwitchButton = new ShellHeadItem({
                id: "productSwitchBtn",
                icon: "sap-icon://grid",
                visible: true,
                text: resources.i18n.getText("productSwitch"),
                ariaHaspopup: "dialog",
                press: this._openProductSwitch.bind(this)
            });
            sap.ushell.Container.getRenderer("fiori2").showHeaderEndItem([oProductSwitchButton.getId()], false);
        },


        exit: function () {
            var oPopover = getProductSwitchPopover();
            if (!oPopover) {
                oPopover.destroy();
            }
            var oHeaderButton = getProductSwitchButton();
            if (oHeaderButton) {
                oHeaderButton.destroy();
            }
        }
    });

});
