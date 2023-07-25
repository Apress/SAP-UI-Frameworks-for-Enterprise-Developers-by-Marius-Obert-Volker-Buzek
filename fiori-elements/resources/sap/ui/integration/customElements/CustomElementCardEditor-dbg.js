/*!
* OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/

sap.ui.require([
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/customElements/CustomElementBase"
], function (
	CardEditor,
	CustomElementBase
) {
	"use strict";

	/**
	 * Constructor for a new <code>CustomElementCardEditor</code>.
	 *
	 * @class
	 * @extends sap.ui.integration.customElements.CustomElementBase
	 * @alias sap.ui.integration.customElements.CustomElementCardEditor
	 * @private
	 */
	var CustomElementCardEditor = CustomElementBase.extend(CardEditor, {

	});
	CustomElementCardEditor.prototype.getCurrentSettings = function () {
		return this._getControl().getCurrentSettings();
	};
	CustomElementCardEditor.prototype.getSeparatePreview = function () {
		return this._getControl().getSeparatePreview();
	};
	var aDependencies = ["ui-integration-card"];
	CustomElementBase.define("ui-integration-card-editor", CustomElementCardEditor, aDependencies);
});
