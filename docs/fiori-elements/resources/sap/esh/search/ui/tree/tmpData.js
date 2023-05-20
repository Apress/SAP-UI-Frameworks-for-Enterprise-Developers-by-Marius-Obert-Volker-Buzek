/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){var t=0;var e={};function n(){var n={};n.tmpDataId=""+ ++t;e[n.tmpDataId]=n;return n}function a(t){var n=e[t];if(!n){throw"no tmp data"}return n}function r(t){delete e[t]}function u(){return Object.keys(e).length}function i(){return Object.keys(e).length===0}var o={__esModule:true};o.createTmpData=n;o.getTmpData=a;o.deleteTmpData=r;o.getCountTmpData=u;o.isEmptyTmpData=i;return o})})();