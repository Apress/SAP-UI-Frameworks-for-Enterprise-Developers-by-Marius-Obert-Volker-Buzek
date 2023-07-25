/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";function t(t,e,o){if(o!==""||o.toLowerCase()==="auto"){t.style(e,o)}}var e={apiVersion:2};e.render=function(e,o){e.openStart("iframe",o);t(e,"width",o.getWidth());t(e,"height",o.getHeight());e.style("display","block");e.style("border","none");e.attr("sandbox","allow-forms allow-popups allow-scripts allow-same-origin allow-modals");e.attr("src",o.getUrl());var r=o.getTitle();if(r){e.attr("title",r)}e.openEnd();e.close("iframe")};return e},true);