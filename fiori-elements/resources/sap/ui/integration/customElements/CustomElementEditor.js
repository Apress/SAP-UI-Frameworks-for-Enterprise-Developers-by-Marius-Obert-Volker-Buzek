/*!
* OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
sap.ui.require(["sap/ui/integration/editor/Editor","sap/ui/integration/customElements/CustomElementBase"],function(t,e){"use strict";var r=e.extend(t,{});r.prototype.getCurrentSettings=function(){return this._getControl().getCurrentSettings()};r.prototype.getSeparatePreview=function(){return this._getControl().getSeparatePreview()};e.define("ui-integration-editor",r)});