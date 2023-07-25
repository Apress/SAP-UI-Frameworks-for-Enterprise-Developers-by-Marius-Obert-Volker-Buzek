/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define(["./GroupIDsMode","./BOMode","./UserMode","sap/collaboration/library"],function(e,o,s,n){"use strict";var r=n.FeedType;var t=function(){this._oFeedTypeToModeClass={};this._oFeedTypeToModeClass[r.GroupIds]=e;this._oFeedTypeToModeClass[r.BusinessObjectGroups]=o;this._oFeedTypeToModeClass[r.UserGroups]=s};t._instance=null;t.getInstance=function(){if(t._instance===null){t._instance=new t}return t._instance};t.prototype.createMode=function(e,o){var s=this._oFeedTypeToModeClass[e];if(s===undefined){var n=e+" is not a valid value for the feedSources mode property.\n";n+="It must be equal to the value of either one of the following:\n";n+="sap.collaboration.FeedType.GroupIds\n";n+="sap.collaboration.FeedType.BusinessObjectGroups\n";n+="sap.collaboration.FeedType.UserGroups";o.logError(n);o.byId("timeline").destroy();throw new Error(n)}return new s(o)};return t},true);