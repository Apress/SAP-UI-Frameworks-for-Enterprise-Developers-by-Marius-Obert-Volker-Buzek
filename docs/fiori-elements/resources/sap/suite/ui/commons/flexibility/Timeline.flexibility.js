/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./changeHandler/PropertyChangeMapper","sap/base/Log"],function(e,r){"use strict";var n=Object.freeze({"-sortIcon":"showSort","-filterIcon":["showItemFilter","showTimeFilter"],"-searchField":"showSearch","-headerBar":"showHeaderBar"});function t(e){var t;for(t in n){if(typeof t=="string"&&t.length>0&&e.endsWith(t)){return n[t]}}r.fatal("Unkonw id of an inner component: "+e);return null}return{hideToolbarItem:new e(function(e){var r=e.removedElement.id;return t(r)},false),unhideToolbarItem:new e(function(e){var r=e.revealedElementId;return t(r)},true),hideControl:"default",unhideControl:"default",moveControls:"default"}},true);