//Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview A read-only JSON Model. The set and load methods are overwritten by empty methods.
 * Additionally private set and load methods according to the sap.ui.model.json.JSONModel are added.
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    function noop () {
        throw new Error("sap.ushell.utils.RestrictedJSONModel : Function not supported");
    }

    /**
     * Constructor for a new RestrictedJSONModel.
     *
     * @extends sap.ui.model.json.JSONModel
     * @constructor
     * @since 1.72.0
     *
     * @private
     */
    return JSONModel.extend("sap.ushell.utils.RestrictedJSONModel", /** @lends sap.ushell.utils.RestrictedJSONModel */ {
        constructor: function () {
            JSONModel.prototype.constructor.apply(this, arguments);

            this.setDefaultBindingMode("OneWay");
            this.setDefaultBindingMode = noop;

            this.setData = noop;
            this.setJSON = noop;
            this.setProperty = noop;
            this.loadData = noop;
        },

        /**
         * Sets the data, passed as a JS object tree, to the model.
         * @see sap.ui.model.json.JSONModel.setData
         * @since 1.72.0
         *
         * @private
         */
        _setData: function () {
            JSONModel.prototype.setData.apply(this, arguments);
        },

        /**
         * Sets the data, passed as a string in JSON format, to the model.
         *
         * @see sap.ui.model.json.JSONModel.setJSON
         * @since 1.72.0
         *
         * @private
         */
        _setJSON: function () {
            this.setData = JSONModel.prototype.setData;
            JSONModel.prototype.setJSON.apply(this, arguments);
            this.setData = noop;
        },

        /**
         * Sets a new value for the given property sPropertyName in the model.
         * If the model value changed, all interested parties are informed.
         *
         * @see sap.ui.model.json.JSONModel.setProperty
         * @since 1.72.0
         *
         * @private
         */
        _setProperty: function () {
            this.setData = JSONModel.prototype.setData;
            JSONModel.prototype.setProperty.apply(this, arguments);
            this.setData = noop;
        }
    });
});
