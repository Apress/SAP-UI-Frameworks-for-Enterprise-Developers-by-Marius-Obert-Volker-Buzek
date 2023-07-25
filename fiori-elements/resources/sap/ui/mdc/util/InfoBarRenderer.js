/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["../library"],function(r){"use strict";var e={apiVersion:2};e.render=function(r,e){r.openStart("div",e);r.attr("id",e.getId());r.openEnd();r.renderControl(e.getAggregation("_toolbar"));r.close("div")};return e},true);