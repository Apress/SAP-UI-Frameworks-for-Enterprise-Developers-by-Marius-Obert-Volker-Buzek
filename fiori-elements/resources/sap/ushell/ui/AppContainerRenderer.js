/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,n){if(!n.getVisible()){return}e.openStart("div",n);e.openEnd();n.getPages().forEach(function(n){e.renderControl(n)});e.close("div")};return e},true);