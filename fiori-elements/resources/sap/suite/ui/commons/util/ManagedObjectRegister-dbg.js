/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/base/ManagedObject",
	"sap/base/assert",
	"sap/base/Log"
], function (BaseObject, ManagedObject, assert, Log) {
	"use strict";

	/**
	 * Creates an object registry for storing references to managed objects.
	 *
	 * @class A registry which keeps a set of managed objects and allows you to lazy load them and destroy them at once.
	 * A lot of controls keep those object as private properties and destroies them one by one.
	 * Instead you can just use:
	 * <pre><code>
	 * this._objectRegister = new ManagedObjectRegister();
	 * this._objectRegister.register("Button", function() {
	 *  return new Button(...);
	 * });
	 *
	 * this._objectRegister.getButton()...
	 *
	 * this._objectRegister.destroyAll();
	 * </code></pre>
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @constructor
	 * @alias sap.suite.ui.commons.util.ManagedObjectRegister
	 * @protected
	 */
	var ManagedObjectRegister = BaseObject.extend("sap.suite.ui.commons.util.ManagedObjectRegister", {
		constructor: function () {
			BaseObject.apply(this, arguments);
			this._mRegister = {};
		}
	});

	/**
	 * Registers an object. Registry will automatically create a getter for the object.
	 * @param {string} sKey Key of the object. Should start with capital letter.
	 * @param {function|sap.ui.base.ManagedObject} oFactoryFunction A managed object to register or a factory function which can build the object.
	 * Factory function can be used for lazy loading of the object. Register will pass sKey to the function, so it can be shared for more objects.
	 * @protected
	 */
	ManagedObjectRegister.prototype.register = function (sKey, oFactoryFunction) {
		assert(typeof sKey === "string", "Key must be a string.");

		sKey = sKey[0].toUpperCase() + sKey.substr(1);
		var getter = "get" + sKey;

		if (typeof this._mRegister[sKey] !== "undefined") {
			this.destroyObject(sKey);
		}
		if (typeof oFactoryFunction === "function") {
			this._mRegister[sKey] = {
				fFactory: oFactoryFunction,
				oValue: undefined
			};
		} else if (oFactoryFunction instanceof ManagedObject) {
			this._mRegister[sKey] = {
				fFactory: undefined,
				oValue: oFactoryFunction
			};
		} else {
			Log.error("oFactoryFunction must be either a factory function or a managed object.");
			return;
		}
		//Register new getter
		if (getter !== "getObject") {
			this[getter] = function () {
				return this.getObject(sKey);
			};
		}
	};

	/**
	 * Returns a stored object. If called without parameters it will return object registered with key "Object".
	 * @param {string} [sKey="Object"] Key of the object.
	 * @returns {sap.ui.base.ManagedObject} An object from the register. If the object doesn't exist it will get created by it's factory function.
	 * @protected
	 */
	ManagedObjectRegister.prototype.getObject = function (sKey) {
		var oRegisteredObject;
		sKey = sKey || "Object";

		oRegisteredObject = this._mRegister[sKey];
		if (oRegisteredObject) {
			if (typeof oRegisteredObject.oValue === "undefined") {
				oRegisteredObject.oValue = oRegisteredObject.fFactory(sKey);
				assert(oRegisteredObject.oValue instanceof ManagedObject, "Factory class must return a managed object.");
			}
			return oRegisteredObject.oValue;
		}
		return null;
	};

	/**
	 * Returns true if there is the object registered and created. If there is not triggered factory function, returns false.
	 * @param {string} [sKey="Object"] Key of the object.
	 * @returns {boolean} True for existing object
	 * @protected
	 */
	ManagedObjectRegister.prototype.isObjectInitialized = function (sKey) {
		var oRegisteredObject;

		oRegisteredObject = this._mRegister[sKey];
		return (oRegisteredObject && typeof oRegisteredObject.oValue !== "undefined");
	};

	/**
	 * Destroys an object and removes it from the registry.
	 * @param {string} sKey Key of the object.
	 * @protected
	 */
	ManagedObjectRegister.prototype.destroyObject = function (sKey) {
		var oRegisteredObject;

		assert(typeof sKey === "string", "Key must be a string.");

		oRegisteredObject = this._mRegister[sKey];
		if (oRegisteredObject) {
			if (oRegisteredObject.oValue) {
				oRegisteredObject.oValue.destroy();
			}
			if (sKey !== "Object") {
				delete this["get" + sKey];
			}
			delete this._mRegister[sKey];
		}
	};

	/**
	 * Destroys all objects in the registry and removes it's definition.
	 * @protected
	 */
	ManagedObjectRegister.prototype.destroyAll = function () {
		var key,
			register;
		for (key in this._mRegister) {
			register = this._mRegister[key];
			if (register.oValue) {
				register.oValue.destroy();
			}
			if (key !== "Object") {
				delete this["get" + key];
			}
		}
		this._mRegister = {};
	};

	return ManagedObjectRegister;
});
