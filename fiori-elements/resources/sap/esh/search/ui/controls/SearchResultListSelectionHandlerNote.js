/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./SearchResultListSelectionHandler","sap/m/MessageBox"],function(e,t){function n(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}var o=n(e);var i=t["Icon"];var r=t["Action"];var a=o.extend("sap.esh.search.ui.controls.SearchResultListSelectionHandlerNote",{isMultiSelectionAvailable:function e(){return true},actionsForDataSource:function e(){var n=[{text:"Show Selected Items",action:function e(n){var o="No Items were selected!";if(n.length>0){o="Following Items were selected:";for(var a=0;a<n.length;a++){o+="\n"+n[a].title}}t.show(o,{icon:i.INFORMATION,title:"I'm a Custom Action for testing Multi-Selection",actions:[r.OK]})}}];return n}});return a})})();