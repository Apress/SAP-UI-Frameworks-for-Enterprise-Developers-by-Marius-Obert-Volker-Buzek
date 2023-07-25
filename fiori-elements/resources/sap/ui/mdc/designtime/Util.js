/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";function e(){return{actions:{},aggregations:{},description:"{description}",name:"{name}",properties:{}}}function t(e,t,i){var n=e.includes(t);var r=n&&i[t]||{};if(!Object.keys(r).length){r[t]={ignore:!n};Object.assign(i,r)}}return{getDesignTime:function(i,n,r,a){a=a?a:e();a.actions=a.actions?a.actions:{};a.properties=a.properties?a.properties:{};a.aggregations=a.aggregations?a.aggregations:{};var s=i.getMetadata(),n=n?n:[],r=r?r:[],g=Object.keys(s.getAllProperties()).concat(Object.keys(s.getAllPrivateProperties())),o=Object.keys(s.getAllAggregations()).concat(Object.keys(s.getAllPrivateAggregations()));g.forEach(function(e){t(n,e,a.properties)});o.forEach(function(e){t(r,e,a.aggregations)});return a}}});