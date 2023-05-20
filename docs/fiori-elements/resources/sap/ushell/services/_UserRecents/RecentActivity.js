// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["./UserRecentsBase","sap/base/Log","sap/base/util/extend","sap/ui/Device","sap/ui/thirdparty/jquery","sap/ushell/EventHub","sap/ushell/library"],function(e,t,i,r,n,s,a){"use strict";var o=a.AppType;var c=e.extend("sap.ushell.services.RecentActivity",{constructor:function(t){e.call(this,"RecentActivity",t,c._compareItems)}});c.MAX_DAYS=30;c.ITEM_COUNT=30;c._compareItems=function(e,t){if(e.appType===t.appType){if(e.appType!==o.APP){return e.url===t.url}return e.appId===t.appId}else if(e.appType===o.APP||t.appType===o.APP){return e.appId===t.appId&&e.url===t.url}return false};c.prototype._updateIfAlreadyIn=function(t,r){return this.oRecentActivities.recentUsageArray.some(function(n){var s;if(c._compareItems(n.oItem,t)){if(t.appType===n.oItem.appType||t.appType!==o.APP){i(n.oItem,t);n.iTimestamp=r;n.oItem.timestamp=r;n.mobile=undefined;n.tablet=undefined;n.desktop=undefined;if(t.appType===n.oItem.appType||t.appType!==o.APP&&n.oItem.appType!==o.APP){n.aUsageArray[n.aUsageArray.length-1]+=1;n.iCount+=1}this.oRecentActivities.recentUsageArray.sort(e._itemSorter)}s=true}else{s=false}return s}.bind(this))};c.prototype._insertNew=function(e,t,i){e.timestamp=t;if(i){e.icon=i}var r={oItem:e,iTimestamp:t,aUsageArray:[1],iCount:1,mobile:undefined,tablet:undefined,desktop:undefined};if(this.oRecentActivities.recentUsageArray.length===this.iMaxItems){this.oRecentActivities.recentUsageArray.pop()}this.oRecentActivities.recentUsageArray.unshift(r)};c.prototype.newItem=function(e){var t=new n.Deferred;var i=Date.now();var r=this.getActivityIcon(e.appType,e.icon);var a;var o=this.getDayFromDateObj(new Date);this._load().done(function(n){this.oRecentActivities=this.getRecentActivitiesFromLoadedData(n);if(o!==this.oRecentActivities.recentDay){this.addNewDay();this.oRecentActivities.recentDay=o}a=this._updateIfAlreadyIn(e,i);if(!a){this._insertNew(e,i,r)}this._save(this.oRecentActivities).done(function(){s.emit("newUserRecentsItem",this.oRecentActivities);t.resolve()}.bind(this)).fail(function(){t.reject()})}.bind(this));return t.promise()};c.prototype.getActivityIcon=function(e,t){switch(e){case o.SEARCH:return t||"sap-icon://search";case o.COPILOT:return t||"sap-icon://co";case o.URL:return t||"sap-icon://internet-browser";default:return t||"sap-icon://product"}};c.prototype.clearAllActivities=function(){var e=new n.Deferred;this._save([]).done(function(){s.emit("userRecentsCleared",Date.now());e.resolve()}).fail(function(){e.reject()});return e.promise()};c.prototype.getRecentItemsHelper=function(e){var t=new n.Deferred;var i;var s;var a;var o=false;var c=[];var p=[];var u=this.getDayFromDateObj(new Date);if(r.system.desktop){a="desktop"}else if(r.system.tablet){a="tablet"}else{a="mobile"}this._load().done(function(r){this.oRecentActivities=this.getRecentActivitiesFromLoadedData(r);var n=false;var f;if(u!==this.oRecentActivities.recentDay){this.addNewDay();this.oRecentActivities.recentDay=u;n=true}for(i=0;i<this.oRecentActivities.recentUsageArray.length&&!o;i++){s=this.oRecentActivities.recentUsageArray[i];if(s[a]===undefined){if(!(s.oItem.url[0]==="#")){p.push(s.oItem.url)}else if(s.oItem.url.indexOf("?")>-1){f=s.oItem.url.substring(s.oItem.url.indexOf("?"));if(f.indexOf("&/")>-1){f=f.substring(0,f.indexOf("&/"))}c.push(s.oItem.appId+f)}else{c.push(s.oItem.appId)}}else{o=true}}if(p.length>0){var v;for(i=0;i<this.oRecentActivities.recentUsageArray.length;i++){if(!(this.oRecentActivities.recentUsageArray[i].oItem.url[0]==="#")){v=this.oRecentActivities.recentUsageArray[i];v[a]=true}}if(c.length<=0){this._save(this.oRecentActivities).done(function(){var i=this._getRecentItemsForDevice(a,this.oRecentActivities,e);t.resolve(i)}.bind(this)).fail(function(){t.reject()})}}if(c.length>0){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.isIntentSupported(c).done(function(r){o=false;for(i=0;i<this.oRecentActivities.recentUsageArray.length&&!o;i++){s=this.oRecentActivities.recentUsageArray[i];if(s[a]===undefined){f="";if(s.oItem.url.indexOf("?")>-1){f=s.oItem.url.substring(s.oItem.url.indexOf("?"));if(f.indexOf("&/")>-1){f=f.substring(0,f.indexOf("&/"))}}var n=r[s.oItem.appId+f];s[a]=!!(n&&n.supported)}else if(s.oItem.url[0]==="#"){o=true}}this._save(this.oRecentActivities).done(function(){var i=this._getRecentItemsForDevice(a,this.oRecentActivities,e);t.resolve(i)}.bind(this)).fail(function(){t.reject()})}.bind(this)).fail(function(e){t.reject(e)})}.bind(this))}else if(c.length<=0&&p.length<=0){if(n){this._save(this.oRecentActivities).done(function(){var i=this._getRecentItemsForDevice(a,this.oRecentActivities,e);t.resolve(i)}.bind(this)).fail(function(){t.reject()})}else{var l=this._getRecentItemsForDevice(a,this.oRecentActivities,e);t.resolve(l)}}}.bind(this)).fail(function(){t.reject()});return t.promise()};c.prototype._getRecentItemsForDevice=function(e,t,i){var r=[];var n=0;var s;for(var a=0;a<t.recentUsageArray.length&&(!i||n<i);a++){s=t.recentUsageArray[a];if(s[e]){r.push(s);n++}}return r};c.prototype.getRecentItems=function(){var e=new n.Deferred;this.getRecentItemsHelper(c.ITEM_COUNT).done(function(t){e.resolve(n.map(t,function(e){return e.oItem}))}).fail(function(){e.reject()});return e.promise()};c.prototype.getFrequentItems=function(){var e=new n.Deferred;this.getRecentItemsHelper().done(function(t){var i;var r=0;var s=[];var a;var o=t[0]?new Date(t[0].iTimestamp):undefined;var p;for(i=0;i<t.length&&r<c.MAX_DAYS;i++){a=t[i];if(a.iCount>1){s.push(a)}p=new Date(a.iTimestamp);if(o.toDateString()!==p.toDateString()){r++;o=p}}s.sort(function(e,t){return t.iCount-e.iCount});s=s.slice(0,c.ITEM_COUNT);e.resolve(n.map(s,function(e){return e.oItem}))}).fail(function(){e.reject()});return e.promise()};c.prototype.addNewDay=function(){var e;for(var t=0;t<this.oRecentActivities.recentUsageArray.length;t++){if(this.oRecentActivities.recentUsageArray[t].aUsageArray){e=this.oRecentActivities.recentUsageArray[t].aUsageArray}else{e=[];this.oRecentActivities.recentUsageArray[t].aUsageArray=e;this.oRecentActivities.recentUsageArray[t].iCount=0}e[e.length]=0;if(e.length>c.MAX_DAYS){this.oRecentActivities.recentUsageArray[t].iCount-=e[0];e.shift()}}};c.prototype.getDayFromDateObj=function(e){return e.getUTCFullYear()+"/"+(e.getUTCMonth()+1)+"/"+e.getUTCDate()};c.prototype.getRecentActivitiesFromLoadedData=function(e){var i;if(Array.isArray(e)){i={recentDay:null,recentUsageArray:e}}else{i=e||{recentDay:null,recentUsageArray:[]}}i.recentUsageArray=(i.recentUsageArray||[]).filter(function(e){var i=e&&e.oItem&&e.oItem.url;if(!i){t.error("FLP Recent Activity",e,"is not valid. The activity is removed from the list.")}return i});return i};return c});