/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/library","sap/ui/core/Renderer","sap/m/LinkRenderer"],function(e,r,n){"use strict";var i=r.extend(n);i.apiVersion=2;i.renderText=function(e,r){var i=r.getAggregation("_icon");if(i){e.renderControl(i)}n.renderText.apply(this,arguments)};return i},true);