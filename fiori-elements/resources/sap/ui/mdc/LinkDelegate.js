/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/BaseDelegate"],function(e){"use strict";var n=Object.assign({},e);n.fetchLinkItems=function(e,n,i){return Promise.resolve(null)};n.fetchLinkType=function(e,n){return Promise.resolve({initialType:{type:2,directLink:undefined},runtimeType:null})};n.fetchAdditionalContent=function(e,n){return Promise.resolve([])};n.modifyLinkItems=function(e,n,i){return Promise.resolve(i)};n.beforeNavigationCallback=function(e,n){return Promise.resolve(true)};return n});