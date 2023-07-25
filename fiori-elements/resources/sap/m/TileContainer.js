/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/Control","sap/ui/core/Core","sap/ui/core/Element","sap/ui/core/IconPool","sap/ui/Device","sap/ui/core/ResizeHandler","./TileContainerRenderer","sap/base/Log","sap/ui/thirdparty/jquery","sap/ui/dom/jquery/Selectors"],function(e,t,i,s,o,r,n,a,h,l){"use strict";var f=t.extend("sap.m.TileContainer",{metadata:{library:"sap.m",deprecated:true,properties:{width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"100%"},height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"100%"},editable:{type:"boolean",group:"Misc",defaultValue:null},allowAdd:{type:"boolean",group:"Misc",defaultValue:null}},defaultAggregation:"tiles",aggregations:{tiles:{type:"sap.m.Tile",multiple:true,singularName:"tile"}},events:{tileMove:{parameters:{tile:{type:"sap.m.Tile"},newIndex:{type:"int"}}},tileDelete:{parameters:{tile:{type:"sap.m.Tile"}}},tileAdd:{}}},renderer:a});o.insertFontFaceStyle();f.prototype._bRtl=i.getConfiguration().getRTL();f.prototype.init=function(){this._iCurrentTileStartIndex=0;this._oDim=null;this._iScrollLeft=0;this._iScrollGap=0;if(!r.system.desktop){this._iScrollGap=0}this.bAllowTextSelection=false;this._oDragSession=null;this._oTouchSession=null;this._bAvoidChildTapEvent=false;this._iEdgeShowStart=r.system.phone?10:20;if(r.system.phone){this._iTriggerScrollOffset=10}else if(r.system.desktop){this._iTriggerScrollOffset=-40}else{this._iTriggerScrollOffset=20}this._iCurrentFocusIndex=-1;if(r.system.desktop||r.system.combi){var e=l.proxy(function(e){if(this._iCurrentFocusIndex>=0){var t=this._iCurrentFocusIndex-this._iCurrentFocusIndex%this._iMaxTilesX;var i=this._iCurrentTileStartIndex===this._iCurrentFocusIndex?0:this._iCurrentTileStartIndex;var s=e.ctrlKey?i:t;var o=this._getVisibleTiles()[s];if(o){this._findTile(o.$()).trigger("focus");e.stopPropagation()}this._handleAriaActiveDescendant()}},this),t=l.proxy(function(e){if(this._iCurrentFocusIndex>=0){var t=this._getVisibleTiles();var i=this._iCurrentFocusIndex-this._iCurrentFocusIndex%this._iMaxTilesX;var s=i+this._iMaxTilesX<t.length?i+this._iMaxTilesX-1:t.length-1;var o=this._iCurrentTileStartIndex+this._iMaxTiles<t.length?this._iCurrentTileStartIndex+this._iMaxTiles-1:t.length-1;var r=o===this._iCurrentFocusIndex?t.length-1:o;var n=e.ctrlKey?r:s;if(t.length>0){this._findTile(t[n].$()).trigger("focus");e.stopPropagation()}this._handleAriaActiveDescendant()}},this),s=l.proxy(function(e){var t=this._getVisibleTiles();if(t.length>0){var i=this._iCurrentFocusIndex-this._iMaxTiles>=0?this._iCurrentFocusIndex-this._iMaxTiles:0;var s=t[i];if(s){this._renderTilesInTheSamePage(i,t);this._findTile(s.$()).trigger("focus");e.stopPropagation()}this._handleAriaActiveDescendant()}},this),o=l.proxy(function(e){var t=this._getVisibleTiles(),i=t.length;if(i>0){var s=this._iCurrentFocusIndex+this._iMaxTiles<i?this._iCurrentFocusIndex+this._iMaxTiles:i-1;var o=t[s];if(o){this._renderTilesInTheSamePage(s,t);this._findTile(o.$()).trigger("focus");e.stopPropagation()}this._handleAriaActiveDescendant()}},this),n=l.proxy(function(e){if(this._iCurrentFocusIndex>=0){var t=this._getVisibleTiles();var i=this._iCurrentFocusIndex+1<t.length?this._iCurrentFocusIndex+1:this._iCurrentFocusIndex;if(!e.ctrlKey){var s=t[i];if(s){if(i<this._iCurrentTileStartIndex+this._iMaxTiles){this._findTile(s.$()).trigger("focus")}else{this._renderTilesInTheSamePage(i,t);this.scrollIntoView(s,true,t);var o=this;setTimeout(function(){o._findTile(s.$()).trigger("focus")},400)}}}else if(this.getEditable()){var r=t[this._iCurrentFocusIndex];this.moveTile(r,i);r.$().trigger("focus")}this._handleAriaActiveDescendant();e.stopPropagation()}},this),a=l.proxy(function(e){if(this._iCurrentFocusIndex>=0){var t=this._getVisibleTiles();var i=this._iCurrentFocusIndex-1>=0?this._iCurrentFocusIndex-1:this._iCurrentFocusIndex;if(!e.ctrlKey){var s=t[i];if(s){if(i>=this._iCurrentTileStartIndex){this._findTile(s.$()).trigger("focus")}else{this._renderTilesInTheSamePage(i,t);this.scrollIntoView(s,true,t);var o=this;setTimeout(function(){o._findTile(s.$()).trigger("focus")},400)}}}else if(this.getEditable()){var r=t[this._iCurrentFocusIndex];this.moveTile(r,i);r.$().trigger("focus")}this._handleAriaActiveDescendant();e.stopPropagation()}},this),h=l.proxy(function(e){var t=this._getVisibleTiles();if(this._iCurrentFocusIndex>=0){var i=this._iCurrentFocusIndex%this._iMaxTiles,s=this._iCurrentFocusIndex+this._iMaxTilesX,o=s%this._iMaxTiles;if(!e.ctrlKey){var r=t[s];if(o>i&&r){this._findTile(r.$()).trigger("focus")}}else if(this.getEditable()){var n=t[this._iCurrentFocusIndex];this.moveTile(n,s);n.$().trigger("focus")}this._handleAriaActiveDescendant();e.stopPropagation()}},this),f=l.proxy(function(e){var t=this._getVisibleTiles();if(this._iCurrentFocusIndex>=0){var i=this._iCurrentFocusIndex%this._iMaxTiles,s=this._iCurrentFocusIndex-this._iMaxTilesX,o=s%this._iMaxTiles;if(!e.ctrlKey){var r=t[s];if(o<i&&r){this._findTile(r.$()).trigger("focus")}}else if(this.getEditable()){var n=t[this._iCurrentFocusIndex];this.moveTile(n,s);n.$().trigger("focus")}this._handleAriaActiveDescendant();e.stopPropagation()}},this),u=l.proxy(function(e){var t=this._getVisibleTiles();if(this._iCurrentFocusIndex>=0&&this.getEditable()){var i=t[this._iCurrentFocusIndex];if(i.getRemovable()){this.deleteTile(i);t=this._getVisibleTiles();if(this._iCurrentFocusIndex===t.length){if(t.length!==0){t[this._iCurrentFocusIndex-1].$().trigger("focus")}else{this._findNextTabbable().trigger("focus")}}else{t[this._iCurrentFocusIndex].$().trigger("focus")}this._handleAriaActiveDescendant()}e.stopPropagation()}},this);this.onsaphome=e;this.onsaphomemodifiers=e;this.onsapend=t;this.onsapendmodifiers=t;this.onsapright=this._bRtl?a:n;this.onsaprightmodifiers=this._bRtl?a:n;this.onsapleft=this._bRtl?n:a;this.onsapleftmodifiers=this._bRtl?n:a;this.onsapup=f;this.onsapupmodifiers=f;this.onsapdown=h;this.onsapdownmodifiers=h;this.onsappageup=s;this.onsappagedown=o;this.onsapdelete=u;this.data("sap-ui-fastnavgroup","true",true)}if(r.system.tablet||r.system.phone){this._fnOrientationChange=function(e){if(this.getDomRef()){this._oTileDimensionCalculator.calc()}}.bind(this)}this._oTileDimensionCalculator=new g(this);this._bRtl=i.getConfiguration().getRTL();this._oPagesInfo=function(e){var t,i,s,o,r=false,n=e;return{setCurrentPage:function(e){s=t;t=e},setCount:function(e){o=i;i=e},setPagerCreated:function(e){r=e},syncOldToCurrentValues:function(){o=i;s=t},reset:function(){o=undefined;s=undefined;i=undefined;t=undefined;r=false},getCurrentPage:function(){return t},getCount:function(){return i},getOldCurrentPage:function(){return s},getOldCount:function(){return o},isPagerCreated:function(){return r},currentPageIsLast:function(){return n?t===0:t===i-1},currentPageIsFirst:function(){return n?t===i-1:t===0},oldCurrentPageIsLast:function(){if(isNaN(s)){return false}return n?s===0:s===o-1},oldCurrentPageIsFirst:function(){if(isNaN(s)){return false}return n?s===o-1:s===0},currentPageIsLastChanged:function(){return this.currentPageIsLast()!==this.oldCurrentPageIsLast()},currentPageIsFirstChanged:function(){return this.currentPageIsFirst()!==this.oldCurrentPageIsFirst()},currentPageRelativePositionChanged:function(){return this.currentPageIsFirstChanged()||this.currentPageIsLastChanged()},pageCountChanged:function(){return i!==o},currentPageChanged:function(){return t!==s}}}(this._bRtl);this._iMaxTiles=1};f.prototype._findNextTabbable=function(){var e=this.$();var t=l.merge(l.merge(e.nextAll(),e.parents().nextAll()).find(":sapTabbable").addBack(":sapTabbable"),l.merge(e.parents().prevAll(),e.prevAll()).find(":sapTabbable").addBack(":sapTabbable"));return t.first()};f.prototype.onBeforeRendering=function(){var e=this.getTiles(),t=e.length;if(this._sResizeListenerId){n.deregister(this._sResizeListenerId);this._sResizeListenerId=null}this._oPagesInfo.reset();for(var i=0;i<t;i++){e[i]._rendered=false}};f.prototype.onAfterRendering=function(){var e=[];this._sResizeListenerId=n.register(this.getDomRef().parentElement,l.proxy(this._resize,this));this._oDim=this._calculateDimension();this._applyDimension();this.$().toggleClass("sapMTCEditable",this.getEditable()===true);if(this._bRenderFirstPage){this._bRenderFirstPage=false;e=this._getVisibleTiles();this._updateTileDimensionInfoAndPageSize(e);if(this.getTiles().length===1){this._update(false,e)}else if(this._iMaxTiles!==Infinity&&this._iMaxTiles){this._renderTiles(e,0,this._iMaxTiles-1)}}else{this._update(true)}if(r.system.desktop||r.system.combi){var t=e||this._getVisibleTiles();if(t.length>0&&this._mFocusables&&this._mFocusables[t[0].getId()]){this._mFocusables[t[0].getId()].eq(0).attr("tabindex","0")}}if(r.system.tablet||r.system.phone){r.orientation.attachHandler(this._fnOrientationChange,this)}};f.prototype.setEditable=function(e){var t=this._getVisibleTiles();this.setProperty("editable",e,true);var i=this.getEditable();this.$().toggleClass("sapMTCEditable",i);for(var s=0;s<t.length;s++){var o=t[s];if(o.isA("sap.m.Tile")){o.isEditable(i)}}return this};f.prototype.updateTiles=function(){this.destroyTiles();this.updateAggregation("tiles")};f.prototype._applyDimension=function(){var e=this._getDimension(),t=this.$(),i,s=10,o=this.$("scrl"),n,a,h=this.$("pager").outerHeight();o.css({width:e.outerwidth+"px",height:e.outerheight-h+"px"});i=t.position();n=o.position();a=o.outerHeight();if(r.system.phone){s=2}else if(r.system.desktop){s=0}this.$("blind").css({top:n.top+s+"px",left:n.left+s+"px",right:"auto",width:o.outerWidth()-s+"px",height:a-s+"px"});this.$("rightedge").css({top:i.top+s+"px",right:s+"px",left:"auto",height:a-s+"px"});this.$("leftedge").css({top:i.top+s+"px",left:i.left+s+"px",right:"auto",height:a-s+"px"})};f.prototype._resize=function(){if(this._oDragSession){return}setTimeout(l.proxy(function(){var e=this._getVisibleTiles(),t=e.length,i=this._iCurrentTileStartIndex,s=this._oDim,o,r,n;this._oPagesInfo.reset();this._oDim=this._calculateDimension();this._updateTileDimensionInfoAndPageSize(e);if(s.width!==this._oDim.width||s.height!==this._oDim.height){for(var a=0;a<t;a++){if(e[a]._rendered){e[a]._rendered=false;e[a].$().remove()}}o=this._getPageNumberForTile(i);r=o*this._iMaxTiles;n=r+this._iMaxTiles-1;this._renderTiles(e,r,n)}},this),0)};f.prototype.exit=function(){if(this._sResizeListenerId){n.deregister(this._sResizeListenerId);this._sResizeListenerId=null}if(r.system.tablet||r.system.phone){r.orientation.detachHandler(this._fnOrientationChange,this)}delete this._oPagesInfo};f.prototype._update=function(e,t){if(!this.getDomRef()){return}if(!this.getVisible()){return}t=t||this._getVisibleTiles();this._oTileDimensionCalculator.calc(t);this._updateTilePositions(t);if(!this._oDragSession){this.scrollIntoView(this._iCurrentTileStartIndex||0,e,t)}};f.prototype.getPageFirstTileIndex=function(){return this._iCurrentTileStartIndex||0};f.prototype.moveTile=function(e,t){if(!isNaN(e)){e=this._getVisibleTiles()[e]}if(!e){h.info("No Tile to move");return this}this.deleteTile(e);this.insertTile(e,t);return this};f.prototype.addTile=function(e){this.insertTile(e,this.getTiles().length);return this};f.prototype.insertTile=function(e,t){var i=this,s;e.isEditable(this.getEditable());if(r.system.desktop||r.system.combi){e.addEventDelegate({onAfterRendering:function(){if(!i._mFocusables){i._mFocusables={}}i._mFocusables[this.getId()]=this.$().find("[tabindex!='-1']").addBack().filter(i._isFocusable);i._mFocusables[this.getId()].attr("tabindex","-1")}},e);var o=function(e){var t=i._getVisibleTiles().indexOf(this),s=Math.floor(t/i._iMaxTiles),o=s-i._oPagesInfo.getCurrentPage();var r=i._iCurrentFocusIndex>=0?i._iCurrentFocusIndex:0;var n=i._getVisibleTiles();var a=n[r];if(a){i._mFocusables[a.getId()].attr("tabindex","-1");i._mFocusables[this.getId()].attr("tabindex","0")}if(o!=0){i.scrollIntoView(t,null,n)}i._handleAriaActiveDescendant();i._iCurrentFocusIndex=t};e.addEventDelegate({onfocusin:o},e)}if(this.getDomRef()){this.insertAggregation("tiles",e,t,true);s=this._getVisibleTiles();if(!this._oDragSession){if(e.getVisible()&&(s.length===1||this._getPageNumberForTile(t)<=this._oPagesInfo.getCurrentPage())){this._renderTile(e,t);this._update(false,s)}else{this._oPagesInfo.setCount(Math.ceil(s.length/this._iMaxTiles));this._updatePager()}}else{this._update(false,s)}if(r.system.desktop||r.system.combi){this._updateTilesTabIndex(s)}}else{this.insertAggregation("tiles",e,t);s=this._getVisibleTiles()}if(e.getVisible()){_.call(this,t,s.length,s);u.call(this,s)}return this};f.prototype._updateTilesTabIndex=function(e){e=e||this._getVisibleTiles();if(e.length&&e.length>0){for(var t=0;t<e.length;t++){if(e[t].$().attr("tabindex")==="0"){return}}}e[0].$().attr("tabindex","0")};f.prototype._isFocusable=function(e,t){var i=!isNaN(l(t).attr("tabindex"));var s=t.nodeName.toLowerCase();if(s==="area"){var o=t.parentNode,r=o.name,n;if(!t.href||!r||o.nodeName.toLowerCase()!=="map"){return false}n=l("img[usemap='#"+r+"']")[0];return!!n}return/input|select|textarea|button|object/.test(s)?!t.disabled:s=="a"?t.href||i:i};f.prototype.deleteTile=function(e){var t=this._getVisibleTiles(),i=this._indexOfVisibleTile(e,t);if(this.getDomRef()){t.splice(i,1);this.removeAggregation("tiles",e,true);if(!this._oDragSession){if(e.getDomRef()){e.getDomRef().parentNode.removeChild(e.getDomRef())}if(r.system.desktop||r.system.combi){if(this._mFocusables&&this._mFocusables[e.getId()]){delete this._mFocusables[e.getId()]}}}if(t.length===0){this._oPagesInfo.reset()}else if(e.getVisible()&&i>=0&&this._getPageNumberForTile(i)<=this._oPagesInfo.getCurrentPage()){this._renderTilesInTheSamePage(this._oPagesInfo.getCurrentPage()*this._iMaxTiles,t)}this._update(false)}else{this.removeAggregation("tiles",e,false);t=this._getVisibleTiles()}_.call(this,i,t.length);u.call(this,t);return this};f.prototype.removeTile=f.prototype.deleteTile;f.prototype.removeAllTiles=function(){var e=this.getTiles().length-1;for(var t=e;t>=0;t--){var i=this.getTiles()[t];this.deleteTile(i)}return this};f.prototype.destroyTiles=function(){if(this.getDomRef()){var e=this.getTiles();this.removeAllAggregation("tiles",true);this._oPagesInfo.reset();this._update();for(var t=0;t<e.length;t++){var i=e[t];i.destroy()}}else{this.destroyAggregation("tiles",false)}return this};f.prototype.rerender=function(){if(!this._oDragSession||this._oDragSession.bDropped){t.prototype.rerender.apply(this)}};f.prototype.scrollLeft=function(){var e=0,t=this._getVisibleTiles();if(this._bRtl){e=this._iCurrentTileStartIndex+this._iMaxTiles}else{e=this._iCurrentTileStartIndex-this._iMaxTiles}this._renderTiles(t,e,e+this._iMaxTiles-1);this.scrollIntoView(e,null,t)};f.prototype.scrollRight=function(){var e=0,t=this._getVisibleTiles();if(this._bRtl){e=this._iCurrentTileStartIndex-this._iMaxTiles}else{e=this._iCurrentTileStartIndex+this._iMaxTiles}this._renderTiles(t,e,e+this._iMaxTiles-1);this.scrollIntoView(e,null,t)};f.prototype._renderTilesInTheSamePage=function(e,t){var i=this._getPageNumberForTile(e),s=i*this._iMaxTiles,o=s+this._iMaxTiles-1;this._renderTiles(t,s,o)};f.prototype._renderTiles=function(e,t,i){var s=false,o;for(o=t;o<=i;o++){if(e[o]&&!e[o]._rendered){this._renderTile(e[o],o);s=true}}if(s){this._update(false,e);if(r.system.desktop||r.system.combi){this._updateTilesTabIndex()}}};f.prototype.scrollIntoView=function(e,t,i){var s=this._getContentDimension().outerwidth,o=e,r=this.getTiles();if(isNaN(e)){o=this.indexOfAggregation("tiles",e)}if(!r[o]||!r[o].getVisible()){return}i=i||this._getVisibleTiles();o=this._indexOfVisibleTile(r[o]);if(o>-1){this._renderTilesInTheSamePage(o,i)}this._applyPageStartIndex(o,i);this._oPagesInfo.setCurrentPage(Math.floor(this._iCurrentTileStartIndex/this._iMaxTiles));if(this._bRtl){this._scrollTo((this._oPagesInfo.getCount()-this._oPagesInfo.getCurrentPage())*s,t)}else{this._scrollTo(this._oPagesInfo.getCurrentPage()*s,t)}this._updatePager()};f.prototype._updateTilePositions=function(e){var t=this._getDimension();if(t.height===0){return}e=e||this._getVisibleTiles();if(e.length===0){this._oPagesInfo.setCount(0);this._updatePager();return}this._applyPageStartIndex(this._iCurrentTileStartIndex,e);this._applyDimension();var i=this._getContentDimension();this._oPagesInfo.setCount(Math.ceil(e.length/this._iMaxTiles));var s=this._oTileDimensionCalculator.getLastCalculatedDimension();for(var o=0;o<e.length;o++){if(!e[o]._rendered||e[o].isDragged()){continue}var r=Math.floor(o/this._iMaxTiles),n=e[o],a=r*i.outerwidth+this._iOffsetX+o%this._iMaxTilesX*s.width,h=this._iOffsetY+Math.floor(o/this._iMaxTilesX)*s.height-r*this._iMaxTilesY*s.height;if(this._bRtl){a=(this._oPagesInfo.getCount()-r)*i.outerwidth-this._iOffsetX-(o%this._iMaxTilesX+1)*s.width}n.setPos(a,h);n.setSize(s.width,s.height)}};f.prototype._findTile=function(e){if(e.hasClass("sapMTile")||e.hasClass("sapMCustomTile")){return e}else{return e.find(".sapMTile")||e.find(".sapMCustomTile")}};f.prototype._updatePager=function(){var e,t,i,s,o=false;if(!this._oPagesInfo.pageCountChanged()&&!this._oPagesInfo.currentPageChanged()){return}e=this.$("pager")[0];t=this.$("leftscroller")[0];i=this.$("rightscroller")[0];if(this._oPagesInfo.getCount()==undefined||this._oPagesInfo.getCount()<=1){e.innerHTML="";i.style.right="-100px";t.style.left="-100px";t.style.display="none";i.style.display="none";this._oPagesInfo.setPagerCreated(false);return}if(!this._oPagesInfo.isPagerCreated()){s=[""];for(var n=0;n<this._oPagesInfo.getCount();n++){s.push("")}e.innerHTML=s.join("<span></span>");e.style.display="block";e.childNodes[0].className="sapMTCActive";this._oPagesInfo.setPagerCreated(true);o=true}else if(this._oPagesInfo.pageCountChanged()){if(this._oPagesInfo.getCount()-this._oPagesInfo.getOldCount()<0){e.removeChild(e.lastChild)}else{e.appendChild(document.createElement("span"))}}if(this._oPagesInfo.currentPageChanged()){e.childNodes[this._oPagesInfo.getCurrentPage()].className="sapMTCActive";if(e.childNodes[this._oPagesInfo.getOldCurrentPage()]){e.childNodes[this._oPagesInfo.getOldCurrentPage()].className=""}if(this._oPagesInfo.getCurrentPage()>=1){e.childNodes[0].className=""}}if(r.system.desktop&&(o||this._oPagesInfo.currentPageRelativePositionChanged())){if(this._bRtl){i.style.left="auto";t.style.right="auto"}i.style.right=this._oPagesInfo.currentPageIsLast()?"-100px":"1rem";t.style.left=this._oPagesInfo.currentPageIsFirst()?"-100px":"1rem";i.style.display=this._oPagesInfo.currentPageIsLast()?"none":"block";t.style.display=this._oPagesInfo.currentPageIsFirst()?"none":"block"}this._oPagesInfo.syncOldToCurrentValues()};f.prototype._getContentDimension=function(){if(!this.getDomRef()){return}var e=this.$("scrl");return{width:e.width(),height:e.height()-20,outerheight:e.outerHeight()-20,outerwidth:e.outerWidth()}};f.prototype._getDimension=function(){if(!this._oDim){this._oDim=this._calculateDimension()}return this._oDim};f.prototype._calculatePageSize=function(e){var t,i;e=e||this._getVisibleTiles();i=e.length;if(i===0){return}t=l.extend({},this._getDimension());if(t.height===0){return}if(r.system.desktop){t.width-=45*2}var s=this._oTileDimensionCalculator.getLastCalculatedDimension(),o=this.$("pager")[0].offsetHeight,n=Math.max(Math.floor(t.width/s.width),1),a=Math.max(Math.floor((t.height-o)/s.height),1),h=i<n?i:n,f=i/h<a?Math.ceil(i/h):a;this._iMaxTiles=n*a;this._iMaxTilesX=n;this._iMaxTilesY=a;this._iOffsetX=Math.floor((t.width-s.width*h)/2);if(r.system.desktop){this._iOffsetX+=45}this._iOffsetY=Math.floor((t.height-o-s.height*f)/2)};f.prototype._getTilesFromPosition=function(e,t){if(!this._getVisibleTiles().length){return[]}e=e+this._iScrollLeft;var i=this._getVisibleTiles(),s=[];for(var o=0;o<i.length;o++){var r=i[o],n={top:r._posY,left:r._posX,width:r._width,height:r._height};if(!i[o].isDragged()&&t>n.top&&t<n.top+n.height&&e>n.left&&e<n.left+n.width){s.push(i[o])}}return s};f.prototype._applyPageStartIndex=function(e,t){var i=this._getDimension();if(i.height===0){return}t=t||this._getVisibleTiles();this._calculatePageSize(t);var s=t.length;if(e<0){e=0}else if(e>s-1){e=s-1}var o=Math.floor(e/this._iMaxTiles||0);this._iCurrentTileStartIndex=o*(this._iMaxTiles||0);h.info("current index "+this._iCurrentTileStartIndex)};f.prototype._scrollTo=function(e,t){if(t!==false){t=true}this._applyTranslate(this.$("cnt"),-e,0,t);if(this._bRtl){this._iScrollLeft=e-this._getContentDimension().outerwidth}else{this._iScrollLeft=e}};f.prototype._applyTranslate=function(e,t,i,s){var o=e[0];this.$("cnt").toggleClass("sapMTCAnim",s);if("webkitTransform"in o.style){e.css("-webkit-transform","translate3d("+t+"px,"+i+"px,0)")}else if("MozTransform"in o.style){e.css("-moz-transform","translate("+t+"px,"+i+"px)")}else if("transform"in o.style){e.css("transform","translate3d("+t+"px,"+i+"px,0)")}else if("msTransform"in o.style){e.css("-ms-transform","translate("+t+"px,"+i+"px)")}};f.prototype._initTouchSession=function(e){if(e.type=="touchstart"){var t=e.targetTouches[0];this._oTouchSession={dStartTime:new Date,fStartX:t.pageX,fStartY:t.pageY,fDiffX:0,fDiffY:0,oControl:e.srcControl,iOffsetX:t.pageX-e.target.offsetLeft}}else{this._oTouchSession={dStartTime:new Date,fStartX:e.pageX,fStartY:e.pageY,fDiffX:0,fDiffY:0,oControl:e.srcControl,iOffsetX:e.pageX-e.target.offsetLeft}}};f.prototype._initDragSession=function(e){while(e.srcControl&&e.srcControl.getParent()!=this){e.srcControl=e.srcControl.getParent()}var t=this.indexOfAggregation("tiles",e.srcControl);if(e.type=="touchstart"){this._oDragSession={oTile:e.srcControl,oTileElement:e.srcControl.$()[0],iOffsetLeft:e.targetTouches[0].pageX-e.srcControl._posX+this._iScrollLeft,iOffsetTop:e.targetTouches[0].pageY-e.srcControl._posY,iIndex:t,iOldIndex:t,iDiffX:e.targetTouches[0].pageX,iDiffY:e.targetTouches[0].pageY}}else{this._oDragSession={oTile:e.srcControl,oTileElement:e.srcControl.$()[0],iOffsetLeft:e.pageX-e.srcControl._posX+this._iScrollLeft,iOffsetTop:e.pageY-e.srcControl._posY,iIndex:t,iOldIndex:t,iDiffX:e.pageX,iDiffY:e.pageY}}};f.prototype.onclick=function(e){var t=this.$("pager")[0];if(e.target.id==this.getId()+"-leftscroller"||e.target.parentNode.id==this.getId()+"-leftscroller"){this.scrollLeft()}else if(e.target.id==this.getId()+"-rightscroller"||e.target.parentNode.id==this.getId()+"-rightscroller"){this.scrollRight()}else if(e.target==t&&r.system.desktop){if(e.offsetX<t.offsetWidth/2){this.scrollLeft()}else{this.scrollRight()}}};f.prototype.ontouchstart=function(e){e.setMarked();if(e.targetTouches.length>1||this._oTouchSession){return}while(e.srcControl&&e.srcControl.getParent()!=this){e.srcControl=e.srcControl.getParent()}if(e.srcControl&&e.srcControl.isA("sap.m.Tile")&&this.getEditable()){if(e.target.className!="sapMTCRemove"){this._initDragSession(e);this._initTouchSession(e);this._oDragSession.oTile.isDragged(true)}else{this._initTouchSession(e)}this._bAvoidChildTapEvent=true}else{this._initTouchSession(e)}l(document).on("touchmove mousemove",l.proxy(this._onmove,this));l(document).on("touchend touchcancel mouseup",l.proxy(this._onend,this))};f.prototype._onmove=function(e){if(document.selection&&document.selection.clear){document.selection.clear()}if(e.isMarked("delayedMouseEvent")){return}if(e.targetTouches&&e.targetTouches.length>1){return}if(!e.targetTouches){e.targetTouches=[{pageX:e.pageX,pageY:e.pageY}]}var t=this._oTouchSession;t.fDiffX=t.fStartX-e.targetTouches[0].pageX;t.fDiffY=t.fStartY-e.targetTouches[0].pageY;if(this._oDragSession){if(Math.abs(t.fDiffX)>5){if(!this._oDragSession.bStarted){this._oDragSession.bStarted=true;this._onDragStart(e)}else{this._onDrag(e)}this._bAvoidChildTapEvent=true}}else if(t){var i=this._getContentDimension().outerwidth;var s=-this._iScrollLeft-t.fDiffX;if(s>this._iScrollGap){return}else if(s<-((this._oPagesInfo.getCount()-1)*i+this._iScrollGap)){return}if(this._bRtl){s=s-i}var o=this._getVisibleTiles();var r=t.fDiffX>0?1:-1;var n=this._iCurrentTileStartIndex+r*this._iMaxTiles;var a=n+this._iMaxTiles-1;this._renderTiles(o,n,a);this._applyTranslate(this.$("cnt"),s,0,false)}};f.prototype._onend=function(e){if(e.isMarked("delayedMouseEvent")){return}l(document).off("touchend touchcancel mouseup",this._onend);l(document).off("touchmove mousemove",this._onmove);if(this._oDragSession){this._onDrop(e);delete this._oTouchSession;return}if(!this._oTouchSession){return}var t=this._oTouchSession,i=new Date,s=i-t.dStartTime<600,o=this._bRtl?-1:1;if(s){var n=this.$("pager")[0];if(Math.abs(t.fDiffX)>30){this._applyPageStartIndex(this._iCurrentTileStartIndex+(t.fDiffX*o>0?1:-1)*this._iMaxTiles);this._bAvoidChildTapEvent=true}else if(e.target==n&&!r.system.desktop){if((t.iOffsetX-n.offsetWidth/2)*o<0){this.scrollLeft()}else{this.scrollRight()}this._bAvoidChildTapEvent=true}else if(e.target.className=="sapMTCRemove"){if(e.type==="touchend"||e.type==="mouseup"&&e.button===0){this.fireTileDelete({tile:t.oControl})}}}else{var a=this._getContentDimension();if(Math.abs(t.fDiffX)>a.outerwidth/2){this._applyPageStartIndex(this._iCurrentTileStartIndex+(t.fDiffX*o>0?1:-1)*this._iMaxTiles);this._bAvoidChildTapEvent=true}}this._update();delete this._oDragSession;delete this._oTouchSession;var h=this;setTimeout(function(){h._bAvoidChildTapEvent=false},100)};f.prototype._onDragStart=function(e){this.$().append(this._oDragSession.oTileElement);this._oDragSession.iDiffX=this._oTouchSession.fStartX-this._oTouchSession.fDiffX;this._oDragSession.iDiffY=this._oTouchSession.fStartY-this._oTouchSession.fDiffY;this._oDragSession.oTile.setPos(this._oDragSession.iDiffX-this._oDragSession.iOffsetLeft,this._oDragSession.iDiffY-this._oDragSession.iOffsetTop);this.$("blind").css("display","block")};f.prototype._onDrag=function(e){if(!this._oTouchSession){clearTimeout(this.iScrollTimer);this._oDragSession=null;this.iScrollTimer=null;this._bTriggerScroll=false;return}this._oDragSession.iDiffX=this._oTouchSession.fStartX-this._oTouchSession.fDiffX;this._oDragSession.iDiffY=this._oTouchSession.fStartY-this._oTouchSession.fDiffY;var t=this._getContentDimension(),i=this._oDragSession.iDiffY-this._oDragSession.iOffsetTop,s=this._oDragSession.iDiffX-this._oDragSession.iOffsetLeft,o=i+this._oDragSession.oTileElement.offsetHeight/2,r=s+this._oDragSession.oTileElement.offsetWidth/2,n=s+this._oDragSession.oTileElement.offsetWidth-this._iTriggerScrollOffset>t.width,a=s<-this._iTriggerScrollOffset,h=t.width-(s+this._oDragSession.oTileElement.offsetWidth),l=s;this._oDragSession.oTile.setPos(s,i);this._oDragSession.oTile.$().css("clip","auto");var f=this.$("rightedge")[0];if(s+this._oDragSession.oTile._width>f.offsetLeft+f.offsetWidth&&this._oPagesInfo.getCurrentPage()<this._oPagesInfo.getCount()-1){var g=f.offsetLeft+f.offsetWidth-s-(this._oDragSession.oTile._width-this._oDragSession.oTile.$().outerWidth(false))/2-2;this._oDragSession.oTile.$().css("clip","rect(-25px,"+g+"px,"+(this._oDragSession.oTile._height+20)+"px,-25px)")}var u=this.$("leftedge")[0];if(s<u.offsetLeft+2+(this._oDragSession.oTile._width-this._oDragSession.oTile.$().outerWidth(false))/2&&this._oPagesInfo.getCurrentPage()>0){var _=u.offsetLeft+4-s-(this._oDragSession.oTile._width-this._oDragSession.oTile.$().outerWidth(false))/2;this._oDragSession.oTile.$().css("clip","rect(-25px,"+this._oDragSession.oTile._width+"px,"+(this._oDragSession.oTile._height+20)+"px,"+_+"px)")}if(h<this._iEdgeShowStart&&this._oPagesInfo.getCurrentPage()<this._oPagesInfo.getCount()-1){var d=(this._iEdgeShowStart-h)/(this._iEdgeShowStart+this._iTriggerScrollOffset);this.$("rightedge").css("opacity",""+d)}else{this.$("rightedge").css("opacity","0.01")}if(l<this._iEdgeShowStart&&this._oPagesInfo.getCurrentPage()>0){var d=(this._iEdgeShowStart-l)/(this._iEdgeShowStart+this._iTriggerScrollOffset);this.$("leftedge").css("opacity",""+d)}else{this.$("leftedge").css("opacity","0.01")}var c;if(this._bRtl){c=n&&this._oPagesInfo.getCurrentPage()>0||a&&this._oPagesInfo.getCurrentPage()<this._oPagesInfo.getCount()-1}else{c=a&&this._oPagesInfo.getCurrentPage()>0||n&&this._oPagesInfo.getCurrentPage()<this._oPagesInfo.getCount()-1}if(c){if(this._bTriggerScroll){a?this.scrollLeft():this.scrollRight()}else{var p=this;if(!this.iScrollTimer){this.iScrollTimer=setInterval(function(){p._bTriggerScroll=true;p._onDrag(e);p._bTriggerScroll=false},1e3)}}return}else{if(this.iScrollTimer){clearTimeout(this.iScrollTimer);this._bTriggerScroll=false;this.iScrollTimer=null}}var T=this._getTilesFromPosition(r,o);if(T&&T.length>0){var m=T[0],C={top:m._posY,left:m._posX,width:m._width,height:m._height};var x=this.indexOfAggregation("tiles",m);if(r+this._iScrollLeft<(C.left+C.width)/2&&x%this._iMaxTilesX!=0){x--}this._oDragSession.iIndex=x;this.moveTile(this._oDragSession.oTile,this._oDragSession.iIndex)}else if(this._oPagesInfo.getCurrentPage()==this._oPagesInfo.getCount()-1){var S=this._getVisibleTiles(),v=S[S.length-1];if(v&&r>v._posX-this._iScrollLeft&&o>v._posY){this._oDragSession.iIndex=S.length-1;this.moveTile(this._oDragSession.oTile,this._oDragSession.iIndex)}}};f.prototype._onDrop=function(e){if(this._oDragSession){var t=this._oDragSession.oTile,i=this._oDragSession.iIndex;this._oDragSession.oTile.isDragged(false);if(this._oDragSession.iOldIndex!=this._oDragSession.iIndex){this.fireTileMove({tile:t,newIndex:i})}this.$("blind").css("display","block");if(this._oDragSession.bStarted){this._oDragSession.oTile.setPos(this._oDragSession.oTile._posX+this._iScrollLeft,this._oDragSession.oTile._posY)}this._oDragSession.oTile.$().css("clip","auto");this.$("rightedge").css("opacity","0.01");this.$("leftedge").css("opacity","0.01");this.$("cnt").append(this._oDragSession.oTileElement);delete this._oDragSession;this.moveTile(t,i);this.scrollIntoView(t,false);if(r.system.desktop||r.system.combi){this._findTile(t.$()).trigger("focus")}this._handleAriaActiveDescendant();this.$("blind").css("display","none")}};f.prototype._handleAriaActiveDescendant=function(){var e=s.closestTo(document.activeElement);if(e&&e.isA("sap.m.Tile")&&e.getParent()===this){this.getDomRef().setAttribute("aria-activedescendant",e.getId())}};f.prototype._renderTile=function(e,t){var s=i.createRenderManager(),o=this.$("cnt")[0];s.renderControl(e);s.flush(o,false,t);s.destroy()};f.prototype.onThemeChanged=function(){if(this.getDomRef()){this.invalidate()}};f.prototype._calculateDimension=function(){var e=this.$();if(!e){return}return{width:e.width(),height:e.height(),outerheight:e.outerHeight(),outerwidth:e.outerWidth()}};f.prototype._getVisibleTiles=function(){var e=[],t=this.getTiles();for(var i=0,s=t.length;i<s;i++){if(t[i].mProperties["visible"]){e.push(t[i])}}return e};f.prototype._indexOfVisibleTile=function(e,t){var i,s;t=t||this._getVisibleTiles();s=t.length;for(i=0;i<s;i++){if(t[i]===e){return i}}return-1};f.prototype._updateTileDimensionInfoAndPageSize=function(e){e=e||this._getVisibleTiles();this._oTileDimensionCalculator.calc(e);this._calculatePageSize(e)};f.prototype._getPageNumberForTile=function(e){return Math.floor(e/this._iMaxTiles||0)};var g=function(e){this._oDim=null;this._oTileContainer=e};g.prototype.calc=function(e){var t,i;if(!this._oTileContainer.getDomRef()){return}t=e||this._oTileContainer._getVisibleTiles();if(t.length){i=t[0];for(var s=0,o=t.length;s<o;s++){if(t[s]._rendered){i=t[s];break}}this._oDim={width:Math.round(i.$().outerWidth(true)),height:Math.round(i.$().outerHeight(true))}}return this._oDim};g.prototype.getLastCalculatedDimension=function(){return this._oDim};function u(e){var t,i,s;e=e||this._getVisibleTiles();t=e.length;for(i=0;i<t;i++){s=e[i];if(s._rendered&&s.getDomRef()){s.getDomRef().setAttribute("aria-setsize",t)}}}function _(e,t,i){var s,o=null;i=i||this._getVisibleTiles();for(s=e;s<t;s++){o=i[s];if(o){o.$().attr("aria-posinset",this._indexOfVisibleTile(o,i)+1)}}}return f});