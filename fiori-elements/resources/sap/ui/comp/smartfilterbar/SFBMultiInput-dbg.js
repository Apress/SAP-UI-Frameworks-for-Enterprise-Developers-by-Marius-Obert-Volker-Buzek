/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides sap.ui.comp.smartfilterbar.SFBMultiInput
sap.ui.define([
	"sap/m/MultiInput",
	"sap/m/MultiInputRenderer",
	'sap/base/strings/whitespaceReplacer'
	],
function (
	MultiInput,
	MultiInputRenderer,
	whitespaceReplacer
) {
	"use strict";

	/**
	 * Constructor for a new <code>SFBMultiInput</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Private control used by the <code>SmartFilterBar</code> control.
	 *
	 * @extends sap.m.MultiInput
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @since 1.73
	 * @alias sap.ui.comp.smartfilterbar.SFBMultiInput
	 */
	var SFBMultiInput = MultiInput.extend("sap.ui.comp.smartfilterbar.SFBMultiInput", {
		metadata: {
			library: "sap.ui.comp"
		},
		renderer: MultiInputRenderer
	});

	SFBMultiInput.prototype.setTokens = function (aTokens) {
		aTokens.map(function (oToken) {
			return oToken.setText(whitespaceReplacer(oToken.getText()));
		});
		MultiInput.prototype.setTokens.apply(this, arguments);
		this._pendingAutoTokenGeneration = true;
		this._getFilterProvider()._tokenUpdate({
			control: this,
			fieldViewMetadata: this._getFieldViewMetadata()
		});
		this._pendingAutoTokenGeneration = false;
		this._isOninputTriggered = false;
	};

	SFBMultiInput.prototype._setFilterProvider = function (oFilterProvider) {
		this.oFilterProvider = oFilterProvider;
	};

	SFBMultiInput.prototype._getFilterProvider = function () {
		return this.oFilterProvider;
	};

	SFBMultiInput.prototype._setFieldViewMetadata = function (oFieldViewMetadata) {
		this.oFieldViewMetadata = oFieldViewMetadata;
	};

	SFBMultiInput.prototype._getFieldViewMetadata = function () {
		return this.oFieldViewMetadata;
	};

	SFBMultiInput.prototype.oninput = function () {
		MultiInput.prototype.oninput.apply(this, arguments);

		this._isOninputTriggered = true;
	};

	SFBMultiInput.prototype.addToken = function () {
		MultiInput.prototype.addToken.apply(this, arguments);

		this._isOninputTriggered = false;
		return this;
	};

	SFBMultiInput.prototype.insertToken = function () {
		MultiInput.prototype.insertToken.apply(this, arguments);

		this._isOninputTriggered = false;
		return this;
	};

	SFBMultiInput.prototype.onBeforeRendering = function () {
		MultiInput.prototype.onBeforeRendering.apply(this, arguments);

		// Try to create a token from a possible (IN) parameter coming from the binding
		// In this phase the value is coming from the binding of the control.
		// BCP: 2180341533 We check if oninput is triggered as input controls now invalidate on keystroke
		if (!this._isOninputTriggered && this.getValue()) {
			this._pendingAutoTokenGeneration = true;
			this._validateCurrentText(true);
			this._pendingAutoTokenGeneration = false;
		}
	};

	return SFBMultiInput;

});
