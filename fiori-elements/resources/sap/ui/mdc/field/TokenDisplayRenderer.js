/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Renderer","sap/m/TokenRenderer"],function(e,t){"use strict";var r=e.extend(t);r.apiVersion=2;r._setAttributes=function(e,r){t._setAttributes(e,r);e.attr("delimiter",r.getProperty("_delimiter"))};return r});