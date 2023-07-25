/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseContentRenderer"],function(e){"use strict";var t=e.extend("sap.ui.integration.cards.TimelineContentRenderer",{apiVersion:2});t.getMinHeight=function(e,t,n){if(t._fMinHeight){return t._fMinHeight+"px"}var i=n.getContentMinItems(e);if(i==null){return this.DEFAULT_MIN_HEIGHT}var r=this.getItemMinHeight(e,t);return i*r+"rem"};t.getItemMinHeight=function(e,t){if(!e||!e.item){return 0}return e.item.ownerImage?7:5.625};return t});