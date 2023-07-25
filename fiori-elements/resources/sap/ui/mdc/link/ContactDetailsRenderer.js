/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var n={apiVersion:2};n.render=function(n,e){var r=e.getAggregation("_content");n.openStart("div",e);n.openEnd();n.renderControl(r);n.close("div")};return n});