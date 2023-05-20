/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./ButtonRenderer","sap/ui/core/Renderer","sap/ui/core/Configuration"],function(t,e,n){"use strict";var r=e.extend(t);r.renderButtonAttributes=function(t,e){if(n.getAccessibility()){t.writeAttribute("aria-haspopup","true")}};r.renderButtonContentAfter=function(t,e){t.write('<span class="sapUiMenuButtonIco"></span>')};return r},true);