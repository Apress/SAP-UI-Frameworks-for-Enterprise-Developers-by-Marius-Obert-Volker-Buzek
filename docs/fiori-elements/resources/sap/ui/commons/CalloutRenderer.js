/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./CalloutBaseRenderer","sap/ui/core/Renderer"],function(e,n){"use strict";var t=n.extend(e);t.renderContent=function(e,n){var t=n.getContent();for(var s=0;s<t.length;s++){e.renderControl(t[s])}};t.addRootClasses=function(e,n){e.addClass("sapUiClt")};t.addContentClasses=function(e,n){e.addClass("sapUiCltCont")};t.addArrowClasses=function(e,n){e.addClass("sapUiCltArr")};return t},true);