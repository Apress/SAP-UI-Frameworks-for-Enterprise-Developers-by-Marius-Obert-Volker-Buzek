/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseContentRenderer","../library"],function(e,t){"use strict";var n=e.extend("sap.ui.integration.cards.TableContentRenderer",{apiVersion:2});n.getMinHeight=function(e,t,n){if(t._fMinHeight){return t._fMinHeight+"px"}var i=n.getContentMinItems(e);if(i==null){return this.DEFAULT_MIN_HEIGHT}var r=this.isCompact(t),a=r?2:2.75,s=r?2:2.75;return i*a+s+"rem"};n.getItemMinHeight=function(e,t){if(!e||!e.row){return 0}var n=this.isCompact(t);return n?2:2.75};return n});