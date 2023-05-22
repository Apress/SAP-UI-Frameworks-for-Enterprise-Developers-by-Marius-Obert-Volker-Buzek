sap.ui.define(["com/apress/openui5/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/ui/core/ValueState"], function (Controller, JSONModel, ValueState) {
    "use strict";

    return Controller.extend("com.apress.openui5.controller.BeerAdd", {
        onInit: function () {
            this.getView().setModel(new JSONModel({}));
        },

        handleSavePress: function (event) {
            const button = event.getSource();
            if (this.triggerValidation(true)) {
                button.setBusy(true);
                const beer = this.getView().getModel().getData();
                const nextId = this.getModel("sample").getProperty("/beers/length");
                beer.id = nextId;
                setTimeout(
                    function () {
                        button.setBusy(false);
                        this.getView().setModel(new JSONModel({}));
                        this.getModel("sample").setProperty(`/beers/${nextId}`, beer);
                        this.navTo("BeerList");
                    }.bind(this),
                    3000
                );
            }
        },

        onValidationSuccess: function (oEvent) {
            oEvent.getSource().setValueState(ValueState.None);
        },

        triggerValidation: function (updateValueState) {
            const inputs = this.getView()
                .getControlsByFieldGroupId("newBeer")
                .filter(function (c) {
                    return c.isA("sap.m.Input");
                });
            let validationStatus = true;
            inputs.forEach(function (input) {
                const oBinding = input.getBinding("value");
                try {
                    oBinding.getType() && oBinding.getType().validateValue(input.getValue());
                    updateValueState && input.setValueState(ValueState.None);
                } catch (oException) {
                    validationStatus = false;
                    updateValueState && input.setValueState(ValueState.Error);
                }
            });

            return validationStatus;
        },
    });
});
