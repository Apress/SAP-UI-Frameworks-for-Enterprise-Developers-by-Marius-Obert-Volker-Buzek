/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/base/Log"
], function (BaseObject, PropertyChange, Log) {

	/**
	 * Constructor for PropertyChangeMapper.
	 *
	 * @param {string|function} vProperty - A property name mapper. If it's a string it's expected to be a name of a property to set. If it's a function, it must return the name of a property to set. It's going to be called with specificChangeInfo in action handler.
	 * @param {any} vValue - Value to set. If it's a function, it's going to be called with property name as a parameter.
	 *
	 * @class
	 * A mapper which tralslates an RTA action to a property change. This class is useful for complex components.
	 *
	 * @constructor
	 * @alias sap.suite.ui.commons.flexibility.changeHandler.PropertyChangeMapper
	 * @version 1.113.0
	 * @since 1.50
	 * @private
	 */
	var PropertyChangeMapper = BaseObject.extend("sap.suite.ui.commons.flexibility.changeHandler.PropertyChangeMapper", {
		constructor: function (vProperty, vValue) {
			if (typeof vProperty === "function") {
				this._fnProperty = vProperty;
			} else if (typeof vProperty === "string") {
				this._fnProperty = function () {
					return vProperty;
				};
			} else {
				Log.fatal("Incorrect type of property: " + typeof vProperty);
			}
			if (typeof vValue === "function") {
				this._fnValue = vValue;
			} else {
				this._fnValue = function () {
					return vValue;
				};
			}
		}
	});

	/**
	 * Changes the properties on the given control
	 *
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 * @name sap.ui.fl.changeHandler.PropertyChange#applyChange
	 */
	PropertyChangeMapper.prototype.applyChange = function (oChange, oControl, mPropertyBag) {
		var oContent = oChange.getDefinition().content,
			oProperty = oContent.property;
		if (Array.isArray(oProperty)) {
			oProperty.forEach(function (sProp) {
				oContent.property = sProp;
				PropertyChange.applyChange(oChange, oControl, mPropertyBag);
			});
		} else {
			PropertyChange.applyChange(oChange, oControl, mPropertyBag);
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute property which contains an array which holds objects which have attributes
	 *                   id and index - id is the id of the field to property and index the new position of the field in the smart form group
	 * @public
	 * @name sap.ui.fl.changeHandler.PropertyChange#completeChangeContent
	 */
	PropertyChangeMapper.prototype.completeChangeContent = function (oChange, oSpecificChangeInfo) {
		var sProperty = this._fnProperty(oSpecificChangeInfo),
			oMySpecificChangeInfo = Object.assign(oSpecificChangeInfo, {
				content: {
					property: sProperty,
					newValue: this._fnValue(sProperty)
				}
			});
		PropertyChange.completeChangeContent(oChange, oMySpecificChangeInfo);
	};

	/**
	 * Changes the properties on the given control
	 *
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 * @name sap.ui.fl.changeHandler.PropertyChange#revertChange
	 */
	PropertyChangeMapper.revertChange = function(oChange, oControl, mPropertyBag) {
		var oContent = oChange.getDefinition().content,
			oProperty = oContent.property;
		if (Array.isArray(oProperty)) {
			oProperty.forEach(function (sProp) {
				oContent.property = sProp;
				PropertyChange.revertChange(oChange, oControl, mPropertyBag);
			});
		} else {
			PropertyChange.revertChange(oChange, oControl, mPropertyBag);
		}
	};

	return PropertyChangeMapper;
});
