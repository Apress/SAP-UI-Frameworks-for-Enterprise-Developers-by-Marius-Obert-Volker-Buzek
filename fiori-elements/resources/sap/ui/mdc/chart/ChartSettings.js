/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var n={showPanel:function(e,t,r,i){return n["showUI"+t](e,r)},showUIChart:function(n,e){return n.getEngine().uimanager.show(n,"Item")},showUISort:function(n,e){return n.getEngine().uimanager.show(n,"Sort")},showUIFilter:function(n,e){return n.getEngine().uimanager.show(n,"Filter")}};return n});