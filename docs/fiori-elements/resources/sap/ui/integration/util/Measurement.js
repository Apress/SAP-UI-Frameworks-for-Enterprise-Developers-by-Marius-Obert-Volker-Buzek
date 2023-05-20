/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Configuration"],function(e){"use strict";var r=performance&&performance.mark;var t=performance&&performance.measure;var n={start:function(e,r){if(!this.getActive()){return null}return performance.mark(e+"-start",{detail:r})},end:function(e){if(!this.getActive()){return null}var r=performance.getEntriesByName(e+"-start")[0],t,n="";if(r){n=r.detail}t=performance.mark(e+"-end",{start:e,detail:n});performance.measure(e,{start:e+"-start",end:e+"-end",detail:n});return t},hasEnded:function(e){if(!this.getActive()){return false}var r=performance.getEntriesByName(e+"-end")[0];return!!r},getActive:function(){var n=e.getMeasureCards();return n&&r&&t}};return n});