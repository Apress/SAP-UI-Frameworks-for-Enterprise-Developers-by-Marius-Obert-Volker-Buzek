/* global QUnit, sinon */

sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/core/mvc/Controller",
    "com/apress/openui5/controller/CustomerAdd.controller",
    "sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function (ManagedObject, Controller, CustomerAddController /* sinon, sinonQunit */) {
    QUnit.module("CustomerAdd Controller");
    QUnit.test("should make sure the view model is loaded upon Controller init", function(assert) {
        const oViewStub = new ManagedObject({});
        const oGetViewStub = /** @type {import("sinon") } */ (sinon).stub(Controller.prototype, "getView").returns(oViewStub);

        const oController = new CustomerAddController();
        oController.onInit();
        assert.ok(oController.getView().getModel().getProperty("/country") === "Germany");

        oGetViewStub.restore();
    })
})