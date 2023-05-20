/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.CSS_CLASS="sapUiMDCChart";e.render=function(e,t){e.openStart("div",t);e.style("height","100%");e.style("width","100%");e.style("min-height","200px");e.openEnd();e.renderControl(t.getContent());e.renderControl(t.getNoDataContent());e.renderControl(t._getChartNoDataForRenderer());e.close("div")};return e},true);