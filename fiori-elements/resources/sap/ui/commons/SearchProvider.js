/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/search/OpenSearchProvider"],function(e,r){"use strict";var t=r.extend("sap.ui.commons.SearchProvider",{metadata:{deprecated:true,library:"sap.ui.commons"}});t.prototype._doSuggest=function(e,r){this.suggest(r,function(r,t){if(e&&e.suggest){e.suggest(r,t)}})};return t});