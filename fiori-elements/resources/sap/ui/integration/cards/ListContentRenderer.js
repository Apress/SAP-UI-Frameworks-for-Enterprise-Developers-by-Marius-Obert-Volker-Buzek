/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseContentRenderer","../controls/ListContentItem"],function(e,t){"use strict";var n=e.extend("sap.ui.integration.cards.ListContentRenderer",{apiVersion:2});n.renderContent=function(e,t){e.renderControl(t.getAggregation("_content"));if(t.getAggregation("_legend")){e.renderControl(t.getAggregation("_legend"))}};n.getMinHeight=function(e,t,n){if(t._fMinHeight){return t._fMinHeight+"px"}var i=n.getContentMinItems(e),r;if(!e||!e.item||i==null){return this.DEFAULT_MIN_HEIGHT}r=this.getItemMinHeight(e,t);return i*r+"rem"};n.getItemMinHeight=function(e,n){if(!e||!e.item){return 0}var i=this.isCompact(n),r=e.item,g=i?2:2.75,o=0,s=t.getLinesCount(r);if(s===2){g=5}else if(s>2){g=s+(s-1)*.5;o=2}if(r.actionsStrip){g+=i?2:2.75;o+=.5;if(s>2){g+=.5;o=1.5}}g+=o;return g};return n});