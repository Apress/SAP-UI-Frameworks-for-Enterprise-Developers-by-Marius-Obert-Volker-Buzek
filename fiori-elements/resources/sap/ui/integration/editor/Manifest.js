/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/util/Manifest","./Merger"],function(e,t){"use strict";var i=e.extend("sap.ui.integration.editor.Manifest");i.prototype.mergeDeltaChanges=function(e){return t.mergeDelta(e,this._aChanges,this._sSection)};return i});