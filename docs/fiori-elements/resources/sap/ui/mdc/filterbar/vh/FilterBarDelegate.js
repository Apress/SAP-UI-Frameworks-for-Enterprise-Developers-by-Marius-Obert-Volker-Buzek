/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/FilterBarDelegate"],function(e){"use strict";var t=Object.assign({},e);t.fetchProperties=function(t){return Promise.resolve([{name:"$search",typeConfig:e.getTypeUtil().getTypeConfig("String",null,null)}])};return t});