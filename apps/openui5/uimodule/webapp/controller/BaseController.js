sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/ui/core/UIComponent", "com/apress/openui5/model/formatter", "sap/ui/Device",
    "sap/ui/core/Fragment", "sap/m/Button", "sap/m/MessageToast"],
    function (Controller, History, UIComponent, formatter, Device, Fragment, Button, MessageToast) {
        "use strict";

        return Controller.extend("com.apress.openui5.controller.BaseController", {
            formatter: formatter,


            fnPageSwitch: function (oEvent) {
                this.navTo(oEvent.getParameter("itemPressed").getTargetSrc());
            },

            fnOpenSwitch: function (oEvent) {
                const oButton = oEvent.getParameter("button");

                if (!this._pPopover) {
                    this._pPopover = Fragment.load({
                        id: this.getView().getId(),
                        name: "com.apress.openui5.view.PageSwitchPopover",
                        controller: this
                    }).then(function (oPopover) {
                        this.getView().addDependent(oPopover);
                        if (Device.system.phone) {
                            oPopover.setEndButton(new Button({ text: "{i18n>close}", type: "Emphasized", press: this.fnCloseSwitch.bind(this) }));
                        }
                        return oPopover;
                    }.bind(this));
                }

                this._pPopover.then(function (oPopover) {
                    oPopover.openBy(oButton);
                });
            },
            fnCloseSwitch: function () {
                this._pPopover.then(function (oPopover) {
                    oPopover.close();
                });
            },


            /**
             * Convenience method for getting the view model by name in every controller of the application.
             * @public
             * @param {string} sName the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getModel: function (sName) {
                return this.getView().getModel(sName);
            },

            /**
             * Convenience method for setting the view model in every controller of the application.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.core.mvc.View} the view instance
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * Convenience method for getting the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            /**
             * Method for navigation to specific view
             * @public
             * @param {string} psTarget Parameter containing the string for the target navigation
             * @param {Object.<string, string>} pmParameters? Parameters for navigation
             * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
             */
            navTo: function (psTarget, pmParameters, pbReplace) {
                this.getRouter().navTo(psTarget, pmParameters, pbReplace);
            },

            getRouter: function () {
                return UIComponent.getRouterFor(this);
            },

            onNavBack: function () {
                const sPreviousHash = History.getInstance().getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.back();
                } else {
                    this.getRouter().navTo("appHome", {}, true /* no history*/);
                }
            },
        });
    });
