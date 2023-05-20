/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){
/*!
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/esh/search/ui/SearchModel"],function(){"use strict";return sap.ui.controller("sap.esh.search.ui.container.Search",{onExit:function e(){var i=this;var r=i.getView().getModel();r.unsubscribe("ESHSearchStarted",i.getView().onAllSearchStarted,i.getView());r.unsubscribe("ESHSearchFinished",i.getView().onAllSearchFinished,i.getView())}})})})();