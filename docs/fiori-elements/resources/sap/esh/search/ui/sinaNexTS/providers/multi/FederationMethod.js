/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function r(r,e){if(!(r instanceof e)){throw new TypeError("Cannot call a class as a function")}}function e(r,e){for(var n=0;n<e.length;n++){var t=e[n];t.enumerable=t.enumerable||false;t.configurable=true;if("value"in t)t.writable=true;Object.defineProperty(r,t.key,t)}}function n(r,n,t){if(n)e(r.prototype,n);if(t)e(r,t);Object.defineProperty(r,"prototype",{writable:false});return r}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var t=function(){function e(){r(this,e)}n(e,[{key:"sort",value:function r(e){var n=[];for(var t=0;t<e.length;t++){n=n.concat(e[t])}n.sort(function(r,e){var n=e.score-r.score;return n});return n}}]);return e}();var a=function(){function e(){r(this,e)}n(e,[{key:"sort",value:function r(e){var n=[];for(var t=0;t<e.length;t++){n=this.mergeMultiResults(n,e[t],t+1)}return n}},{key:"mergeMultiResults",value:function r(e,n,t){if(t<1){return[]}if(t===1){return n}var a=e.length;var o=n.length;var u=[];for(var i=0;i<a;i++){u.push(e[i])}for(var f=0;f<a;f++){if(f>=o){break}u.splice(t*(f+1)-1,0,n[f])}if(o>a){u=u.concat(n.slice(a-o))}return u}}]);return e}();var o=function(){function e(){r(this,e)}n(e,[{key:"sort",value:function r(e){var n=[];for(var t=0;t<e.length;t++){n=n.concat(e[t])}var a;var o={};for(var u=0;u<n.length;u++){a=n[u].dataSource.id;if(!o[a]){o[a]=[]}o[a].push(n[u])}var i=[];var f=0;for(var c in o){var v=o[c][0];a=v.dataSource.id;var s=v.score;i.push({dataSourceId:a,score:s,index:f});f++}i.sort(function(r,e){var n=e.score-r.score;if(n===0){n=r.index-e.index}return n});var l=[];var h=0;for(var d=0;d<n.length;){var g=i[h];var p=o[g.dataSourceId];if(p.length>0){l.push(p.shift());d++}h=(h+1)%i.length}return l}}]);return e}();var u={__esModule:true};u.Ranking=t;u.RoundRobin=a;u.AdvancedRoundRobin=o;return u})})();