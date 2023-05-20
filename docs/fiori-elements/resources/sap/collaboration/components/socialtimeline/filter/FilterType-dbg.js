/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2015 SAP AG. All rights reserved
 */
sap.ui.define([
	'sap/ui/base/Object'
], function(BaseObject) {
	"use strict";

var FilterType = BaseObject.extend("sap.collaboration.components.socialtimeline.filter.FilterType", {
		constructor: function(){
			if (Object.freeze){
				Object.freeze(this);
			}
		},

		FILTER_TYPE:
				{
					feedUpdates: "FeedUpdates",
					systemUpdates: "SystemUpdates",
					custom: "Custom"
				}
	});

	return FilterType;

});
