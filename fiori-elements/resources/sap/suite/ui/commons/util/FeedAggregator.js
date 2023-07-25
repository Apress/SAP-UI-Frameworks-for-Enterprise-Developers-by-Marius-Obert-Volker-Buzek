/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","./DateUtils","sap/ui/model/json/JSONModel","sap/ui/model/xml/XMLModel"],function(e,t,r,i){"use strict";var a=function(){throw new Error};a.filterItems=function(t,r,i){var a=function(r,i){var a=t.find("rss>channel>item");if(a.length>0){for(var n=a.length-1;n>=0;n--){var l=e(a[n]);var s=l.find("title");var f=false;for(var o=0;o<r.length;o++){var v=r[o];if(v){if(s.text().toLowerCase().indexOf(v.toLowerCase())!==-1){f=true;break}}}if(f!==i){l.remove()}}}};if(r&&r.length>0){a(r,true)}if(i&&i.length>0){a(i,false)}};a.getFeeds=function(n,l,s,f,o){var v={items:[]};var d=new r;var h=n.length;var u=0;var c=function(r){var i=e(this.getData());a.filterItems(i,l,s);if(i.find("rss>channel>item>title").length>0){var n=i.find("rss>channel>item");var o=e(i.find("rss>channel>title")).text();var c=e(i.find("rss>channel>image>url")).text();for(var m=0;m<n.length;m++){var g=e(n[m]);var p=new Date(g.children("pubDate").text());var x=g.children("image").text();if(x){c=x}if(!t.isValidDate(p)){p=null}v.items.push({title:g.children("title").text(),link:g.children("link").text(),description:g.children("description").text(),pubDate:p,source:o,image:c})}}u++;if(u===h){d.setData(v);if(f){f()}}};for(var m=0;m<n.length;m++){var g=new i;g.attachRequestCompleted(c);g.loadData(n[m])}return d};return a},true);