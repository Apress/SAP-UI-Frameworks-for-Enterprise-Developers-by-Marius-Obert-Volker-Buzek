/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/Core"],function(t,e){"use strict";var i=t.extend("sap.ui.integration.editor.fields.fragment.Controller",{});i.prototype.init=function(){};i.prototype.setField=function(t){this._oField=t};i.prototype.saveValue=function(t){var i=e.getConfiguration().getLanguage().replaceAll("_","-");var n=this._oField.getConfiguration();if(n.type==="string"&&n.translatable){this._oField.setTranslationValueInTexts(i,n.manifestpath,t)}else{this._oField._settingsModel.setProperty(n.manifestpath,t)}};return i});