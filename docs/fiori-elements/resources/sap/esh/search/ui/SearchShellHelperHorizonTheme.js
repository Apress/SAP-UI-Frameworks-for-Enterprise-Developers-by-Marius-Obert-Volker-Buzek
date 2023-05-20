/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){var e={isSearchFieldExpandedByDefault:function e(){try{var a=sap.ui.getCore().byId("shell-header");if(!a||!a.isExtraLargeState){return false}var r=sap.ushell.Container.getRenderer("fiori2").getShellController();var t=r.getView();var i=(t.getViewData()?t.getViewData().config:{})||{};return i.openSearchAsDefault||a.isExtraLargeState()}catch(e){return false}}};return e})})();