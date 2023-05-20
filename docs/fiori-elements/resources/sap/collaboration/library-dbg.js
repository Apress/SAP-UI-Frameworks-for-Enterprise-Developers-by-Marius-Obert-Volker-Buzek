/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.collaboration.
 */
sap.ui.define([
	'sap/ui/core/Core',
	'sap/ui/core/library',
	'sap/suite/ui/commons/library' // library dependency
], function(Core) {
	"use strict";

	/**
	 * SAP UI library: SAP Collaboration for Social Media Integration.
	 *
	 * @namespace
	 * @alias sap.collaboration
	 * @public
	 */


	// library dependencies
	// delegate further initialization of this library to the Core
	var thisLib = sap.ui.getCore().initLibrary({
		name: "sap.collaboration",
		dependencies: ["sap.ui.core","sap.suite.ui.commons"],
		types: [
			"sap.collaboration.AppType",
			"sap.collaboration.DisplayFeedType",
			"sap.collaboration.FeedType"
		],
		interfaces: [],
		controls: [
			"sap.collaboration.components.controls.FeedEntryEmbedded",
			"sap.collaboration.components.controls.FilterPopover",
			"sap.collaboration.components.controls.ReplyPopover",
			"sap.collaboration.components.controls.SocialTextArea",
			"sap.collaboration.components.controls.TimelineEntryEmbedded",
			"sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded"
		],
		elements: [],
		version: "1.113.0"
	});

	/**
	 * Application Type (Mode)
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AppType = {

		/**
		 * Fiori Split App
		 * @public
		 */
		split : "split",

		/**
		 * SAP Jam Feed Widget Wrapper
		 * @public
		 */
		widget : "widget"

	};
	/**
	 * Feed Types to be displayed by the Social Timeline
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
         */
	thisLib.DisplayFeedType = {

		/**
		 * The main feed for the Business Record Feed
		 * @public
		 */
		BusinessRecordFeed : "BusinessRecordFeed",

		/**
		 * Group feeds where the business record is primary or featured
		 * @public
		 */
		GroupFeedsWhereBusinessRecordIsLinked : "GroupFeedsWhereBusinessRecordIsLinked"

	};
	/**
	 * Feed Types
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
         */
	thisLib.FeedType = {

		/**
		 * Follows feed type
		 * @public
		 * @deprecated Since version 1.30.0.
		 * The feed type was deprecated because the original feed dialog component does not use it anymore.
		 * It also does not conform to naming conventions.
		 */
		follows : "follows",

		/**
		 * Company feed type
		 * @public
		 * @deprecated Since version 1.30.0.
		 * The feed type was deprecated because the original feed dialog component does not use it anymore.
		 * It also does not conform to naming conventions.
		 */
		company : "company",

		/**
		 * Group feed type
		 * @public
		 * @deprecated Since version 1.30.0.
		 * The feed type was deprecated because the original feed dialog component does not use it anymore.
		 * It also does not conform to naming conventions.
		 */
		group : "group",

		/**
		 * Object group feed type
		 * @public
		 * @deprecated Since version 1.30.0.
		 * The feed type was deprecated because the original feed dialog component does not use it anymore.
		 * It also does not conform to naming conventions.
		 */
		objectGroup : "objectGroup",

		/**
		 * Oject feed type
		 * @public
		 * @deprecated Since version 1.30.0.
		 * The feed type was deprecated because the original feed dialog component does not use it anymore.
		 * It also does not conform to naming conventions.
		 */
		object : "object",

		/**
		 * The mode type that accepts an array of group IDs. Users will be able to select these groups from a selector. The list will have the groups' names.
		 * @public
		 */
		GroupIds : "GroupIds",

		/**
		 * The mode type that accepts the OData details of a business object. Users will be able to select groups where the business object is featured or primary.
		 * @public
		 */
		BusinessObjectGroups : "BusinessObjectGroups",

		/**
		 * Users of this mode type will be able to select from groups where they are members. This mode is used by the feed component. In the feed component, the list of groups displayed in the pop up will be the current user's personal groups.
		 * @public
		 */
		UserGroups : "UserGroups"

	};

	return thisLib;

});
