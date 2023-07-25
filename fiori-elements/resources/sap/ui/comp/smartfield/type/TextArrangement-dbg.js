/*
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/model/CompositeType",
	"sap/ui/comp/util/FormatUtil",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/base/util/isPlainObject",
	"sap/base/assert"
], function(
	coreLibrary,
	CompositeType,
	FormatUtil,
	ParseException,
	ValidateException,
	isPlainObject,
	assert
) {
	"use strict";
	var TextArrangement = CompositeType.extend("sap.ui.comp.smartfield.type.TextArrangement", {
		constructor: function(oFormatOptions, oConstraints, oSettings) {
			this.getPrimaryType().call(this, oFormatOptions, oConstraints);
			CompositeType.call(this, oFormatOptions, oConstraints);
			this.init(oFormatOptions, oConstraints, oSettings);
			assert(oSettings.keyField !== undefined, "Missing value for the keyField. - " + this.getName());
		},

		metadata: {
			"abstract": true
		}
	});

	TextArrangement.prototype.init = function(oFormatOptions, oConstraints, oSettings) {
		this.sName = "TextArrangement";
		this.bParseWithValues = true;
		this.async = true;

		var oDefaultFormatOptions = {
			textArrangement: "idOnly"
		};

		var oDefaultSettings = {
			onBeforeValidateValue: function() {}
		};

		this.oSettings = Object.assign(oDefaultSettings, oSettings);
		this.oFormatOptions = Object.assign(oDefaultFormatOptions, oFormatOptions);

		this.fnParser = this.getValidator({
			textArrangement: this.oFormatOptions.textArrangement,
			prefix: "parse"
		});

		this.fnValidator = this.getValidator({
			textArrangement: this.oFormatOptions.textArrangement,
			prefix: "validate"
		});

		this.bValueListNoValidation = oSettings.valueListNoValidation;
		this.bIsInvalid = false;
	};

	TextArrangement.prototype.getSettings = function(){
		return this.oSettings;
	};

	TextArrangement.prototype.parseValue = function(vValue, sSourceType, aCurrentValues) {
		var aResult, sTextArrangement = this.oFormatOptions.textArrangement;

		if (typeof vValue === "string" ) {
			vValue = vValue.replace(/\u0020+$/, "");
		}

		if (vValue === "" || (sTextArrangement === "idOnly")) {
			aResult = this.parseIDOnly(vValue, sSourceType);
		} else {
			aResult = this.fnParser(vValue, sSourceType, aCurrentValues, this.oFormatOptions, this.oSettings);
		}

		if (aResult[0] && aResult[0].toUpperCase && this.oFormatOptions.displayFormat === "UpperCase") {
			aResult[0] = aResult[0].toUpperCase();
		}

		return aResult;
	};

	TextArrangement.prototype.parseIDOnly = function(vValue, sSourceType) {
		vValue = this.getPrimaryType().prototype.parseValue.call(this, vValue, sSourceType);
		return [vValue, undefined];
	};

	TextArrangement.prototype.setSelectedValue = function (sValue) {
		this._sSelectedValue = sValue;
	};

	TextArrangement.prototype._isValueSelected = function (sValue) {
		return this._sSelectedValue && this._sSelectedValue === sValue;
	};

	TextArrangement.prototype.parseIDAndDescription = function(vValue, sSourceType, aCurrentValues, oFormatOptions) {
		var aResult;

		// Only extract ID on user input
		if (!this._isValueSelected(vValue)) {

			// if the value format matches the pattern "ID (description)" or "description (ID)"
			if (oFormatOptions && oFormatOptions.textArrangement === "idAndDescription") {
				aResult = /^([\S\s]+?)\s\([\S\s]+\)$/.exec(vValue);
			} else {
				aResult = /^[\S\s]+\s\(([\S\s]+?)\)$/.exec(vValue);
			}

		}

		// TODO: We should move this after the validation phase
		this.setSelectedValue("");

		// Assign value only if regex execution has succeeded
		if (Array.isArray(aResult) && aResult[1]) {
			vValue = aResult[1];
		}

		return this.parseIDOnly(vValue, sSourceType);
	};

	TextArrangement.prototype.parseDescriptionOnly = function(vValue, sSourceType, aCurrentValues, oFormatOptions, oSettings) {

		return new Promise(function(fnResolve, fnReject) {
			var iMaxLength = this.oConstraints && this.oConstraints.maxLength ? this.oConstraints.maxLength : 0;
			// The request for the description won't be sent and we need to resolve the promise
			if ( vValue === null || vValue === "" ){
				return fnResolve([vValue, ""]);
			}

			if (vValue && vValue.toUpperCase && this.oFormatOptions.displayFormat === "UpperCase") {
				vValue = vValue.toUpperCase();
			}

			if (vValue && iMaxLength && vValue.length > iMaxLength) {
				fnReject(new ValidateException(this.getCoreResourceBundleText("EnterTextMaxLength", [iMaxLength])));
				return;
			}

			function handleSuccess(aData) {
				var sID,
					sKeyField = oSettings.keyField,
					sDescriptionField = oSettings.descriptionField;

				// filtering in the text/description field first as the textArrangement format option is set to "descriptionOnly"
				var aIDs = filterValuesByKey(vValue, {
					key: sDescriptionField,
					value: sKeyField,
					data: aData
				});

				var aIDsLength = aIDs.length;

				if (aIDsLength === 1) {
					sID = this.getPrimaryType().prototype.parseValue.call(this, aIDs[0], sSourceType);
					fnResolve([sID, undefined]);
					return;
				}

				// if no IDs were found in the text/description field, filtering the key field
				if (aIDsLength === 0) {

					aIDs = filterValuesByKey(vValue, {
						key: sKeyField,
						value: sDescriptionField,
						data: aData
					});

					aIDsLength = aIDs.length;
				}

				// TODO: We should move the validation logic to the validate method.
				if (!this.bValueListNoValidation) {
					if (aIDsLength === 0) {
						fnReject(new ValidateException(this.getResourceBundleText("SMARTFIELD_NOT_FOUND")));
						return;
					}

					// duplicate IDs were found
					if (aIDsLength > 1) {
						fnReject(new ValidateException(this.getResourceBundleText("SMARTFIELD_DUPLICATE_VALUES")));
						return;
					}
				}

				sID = this.getPrimaryType().prototype.parseValue.call(this, vValue, sSourceType);
				fnResolve([sID, undefined]);
			}

			function handleException(error) {
				// TODO: In the future maybe handle the error from the server
				fnReject(new ValidateException(this.getResourceBundleText("SMARTFIELD_INVALID_ENTRY")));
			}

			var oOnBeforeValidateValueSettings = {
				filterFields: this.getFilterFields(),
				success: handleSuccess.bind(this),
				error: handleException.bind(this)
			};

			this.onBeforeValidateValue(vValue, oOnBeforeValidateValueSettings);
		}.bind(this));
	};

	TextArrangement.prototype.validateValue = function(aValues, bCheckValuesValidity) {
		this.validateIDOnly(aValues);
		var vID = aValues[0];

		// prevent a request to be sent when the ID value is "" (empty)
		if (vID === null) {
			return;
		}

		// prevent a request to be sent when the description is known
		if (this.oFormatOptions.textArrangement === "descriptionOnly") {
			this.validateDescriptionOnly(aValues, this.oSettings);
			return;
		}

		var oPromise = new Promise(function(fnResolve, fnReject) {

			function handleSuccess(aData) {
				var oSettings = Object.assign({}, this.oSettings, {
					data: aData,
					reject: fnReject
				});

				var bValidValue = this.fnValidator(aValues, oSettings);

				if (bValidValue) {
					fnResolve(aValues);
				}
			}

			function handleException(error) {
				// TODO: In the future maybe handle the error from the server
				fnReject(new ValidateException(this.getResourceBundleText("SMARTFIELD_INVALID_ENTRY")));
			}

			var oOnBeforeValidateValueSettings = {
				filterFields: this.getFilterFields(),
				success: handleSuccess.bind(this),
				error: handleException.bind(this),
				bCheckValuesValidity: bCheckValuesValidity
			};

			this.onBeforeValidateValue(vID, oOnBeforeValidateValueSettings);
		}.bind(this));

		if (this.bValueListNoValidation) {
			return;
		} else {
			return oPromise;
		}
	};

	TextArrangement.prototype.validateIDOnly = function (aValue, oData) {
		var sValue = aValue[0],
			oResult,
			fnReject;

		this.getPrimaryType().prototype.validateValue.call(this, sValue);

		// We do validation only in valueList scenario
		if (this.getSettings().valueList && oData) {
			oResult = oData.data;
			fnReject = oData.reject;

			// if no description is found
			if (oResult.length === 0) {
				fnReject(new ValidateException(this.getResourceBundleText("SMARTFIELD_NOT_FOUND")));
				return false;
			}

			// more descriptions were found for the same ID
			if (oResult.length > 1) {
				fnReject(new ValidateException(this.getResourceBundleText("SMARTFIELD_DUPLICATE_VALUES")));
				return false;
			}
		}

		return true;
	};

	TextArrangement.prototype.validateIDAndDescription = function(aValues, oSettings) {
		var oFilterSettings = {
				key: oSettings.keyField,
				value: oSettings.descriptionField,
				data: oSettings.data
			};

		if (this.oFormatOptions && this.oFormatOptions.displayFormat) {
			oFilterSettings.displayFormat = this.oFormatOptions.displayFormat;
		}

		// filter for description given the ID
		var aDescription = filterValuesByKey(aValues[0], oFilterSettings, this.oConstraints);

		var fnReject = oSettings.reject;

		if (!this.bValueListNoValidation) {
			// if no description is found
			if (aDescription.length === 0) {
				fnReject(new ValidateException(this.getResourceBundleText("SMARTFIELD_NOT_FOUND")));
				return false;
			}

			// more descriptions were found for the same ID
			if (aDescription.length > 1) {
				fnReject(new ValidateException(this.getResourceBundleText("SMARTFIELD_DUPLICATE_VALUES")));
				return false;
			}
		}

		return true;
	};

	TextArrangement.prototype.validateDescriptionOnly = function(aValues, oSettings) {};

	TextArrangement.prototype.formatValue = function(aValues, sTargetType) {
		var sKey;

		// In case we receive a string or if context is removed we can receive a value of null
		if (!Array.isArray(aValues)) {
			return aValues;
		}

		// Handle unwanted comma in the model - In case we have only ID in the field and recieve again only ID.
		if (this.bValueListNoValidation && aValues[1] === undefined){
			aValues.splice(1, 1);
		}
		sKey = this.getPrimaryType().prototype.formatValue.call(this, aValues[0], sTargetType);

		if (sKey === "" || sKey === null) {
			return sKey;
		}

		if (sKey && this.oFormatOptions.displayFormat === "UpperCase") {
			sKey = sKey.toUpperCase();
		}

		var vDescription = aValues[1];

		if (
			vDescription === "" &&
			this.oFormatOptions.textArrangement !== "idOnly" &&
			this.oSettings.delegate
		){
			this.oSettings.delegate._sTextArrangementLastReadValue = null;
		}

		// In case of descriptionOnly and no description we fallback and show the ID
		if (!vDescription && this.oFormatOptions.textArrangement === "descriptionOnly") {
			return sKey;
		}

		// in case the binding path is invalid/empty
		if (isPlainObject(vDescription) || this.bIsInvalid) {
			vDescription = "";
		}

		return FormatUtil.getFormattedExpressionFromDisplayBehaviour(this.oFormatOptions.textArrangement, sKey, vDescription);
	};

	TextArrangement.prototype.setDescriptionIsInvalid = function(isInvalid) {
		this.bIsInvalid = isInvalid;
	};

	TextArrangement.prototype.getDescriptionIsInvalid = function() {
		return this.bIsInvalid;
	};

	TextArrangement.prototype.destroy = function() {
		this.oFormatOptions = null;
		this.oSettings = null;
		this.fnParser = null;
		this.fnValidator = null;
	};

	TextArrangement.prototype.getName = function() {
		return "sap.ui.comp.smartfield.type.TextArrangement";
	};

	TextArrangement.prototype.onBeforeValidateValue = function(vValue, mSettings) {
		this.oSettings.onBeforeValidateValue(vValue, mSettings);
	};

	TextArrangement.prototype.getResourceBundleText = function(sKey, aParams) {
		return coreLibrary.getLibraryResourceBundle("sap.ui.comp").getText(sKey, aParams);
	};

	TextArrangement.prototype.getCoreResourceBundleText = function(sKey, aParams) {
		return coreLibrary.getLibraryResourceBundle("sap.ui.core").getText(sKey, aParams);
	};

	/**
	 * Gets the primary type of this object.
	 *
	 * @returns {sap.ui.model.odata.type.ODataType} The data type used for parsing, validation and formatting
	 * @protected
	 * @abstract
	 */
	TextArrangement.prototype.getPrimaryType = function() {};

	TextArrangement.prototype.getValidator = function(mSettings) {

		switch (mSettings.textArrangement) {

			case "idAndDescription":
			case "descriptionAndId":
				return this[mSettings.prefix + "IDAndDescription"];

			case "descriptionOnly":
				return this[mSettings.prefix + "DescriptionOnly"];

			default:
				return this[mSettings.prefix + "IDOnly"];
		}
	};

	TextArrangement.prototype.getFilterFields = function(vValue) {
		return ["keyField"];
	};

	function filterValuesByKey(sKey, mSettings, oConstraints) {
		var aValues = [];
		if (mSettings.displayFormat === "UpperCase") {
			sKey = sKey.toLowerCase();
		}
		mSettings.data.forEach(function (mData, iIndex, aData) {
			var sCurrKey = mSettings.displayFormat === "UpperCase" ? mData[mSettings.key].toLowerCase() : mData[mSettings.key],
				bIsValueNumcEqual = oConstraints && oConstraints.isDigitSequence && oConstraints.maxLength && sKey.lastIndexOf(sCurrKey) !== -1;

			if (bIsValueNumcEqual || sCurrKey === sKey) {
				aValues.push(mData[mSettings.value]);
			}
		});

		return aValues;
	}

	return TextArrangement;
});
