/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/UIComponent",
	"sap/suite/ui/commons/library",
	"sap/ui/core/mvc/View",
	"sap/ui/core/library"
],
	function(Log, UIComponent, commonsLibrary, View, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// shortcut for sap.suite.ui.commons.TimelineAxisOrientation
	var TimelineAxisOrientation = commonsLibrary.TimelineAxisOrientation;

	var sComponentName = "sap.collaboration.components.feed.Component";

	/**
	* Constructor for the Feed Component.
	*
	* Accepts an object literal <code>mSettings</code> that defines initial property values, aggregated and associated objects as well as event handlers.
	*
	* @param {sap.ui.core.ID} [sId] id for the new component, generated automatically if no id is given
	* @param {object} [mSettings] initial settings for the new component. See the documentation of the component's properties for the structure of the expected data.
	*
	* @class
	* The Feed Component is an SAPUI5 component that allows you to display SAP Jam feeds.
	* It includes the option to add new posts and reply to entries and view other users' social profiles from SAP Jam.
	* @extends sap.ui.core.UIComponent
	* @version 1.113.0
	* @since 1.30
	*
	* @public
	* @name sap.collaboration.components.feed.Component
	*
	*/
	var FeedComponent = UIComponent.extend("sap.collaboration.components.feed.Component",
		/** @lends sap.collaboration.components.feed.Component.prototype */ {
		metadata : {
			stereotype: "component",
			version: "1.0",
			includes: ["../resources/css/MorePopover.css"],
			dependencies: {
				libs: [],
				components: [],
				ui5version: ""
			},
			properties: {
				"axisOrientation" : { type : "sap.suite.ui.commons.TimelineAxisOrientation", group : "Misc", defaultValue : TimelineAxisOrientation.Vertical },
				"feedSources" : { type : "object|string[]" },
				"enableScroll" : { type : "boolean", defaultValue : true }
			},
			rootView : null, // the rootView to open (view name as string or view configuration object)
			publicMethods: [ "setSettings", "getSelectedGroup" ],
			aggregations: {
			},
			routing: {
			},
			config: {
			},
			customizing: {
			}
		},
		/**
		* Initializes the Component instance after creation.
		* @protected
		* @memberOf sap.collaboration.components.feed.Component
		*/
		init: function() {
			this._logger = Log.getLogger(sComponentName);
			UIComponent.prototype.init.apply(this); // call superclass; needed to call createContent
		},
		/**
		* Cleans up the component instance before destruction.
		* @protected
		* @memberOf sap.collaboration.components.feed.Component
		*/
		exit: function() {

		},
		/**
		* Function is called when the rendering of the Component Container is started.
		* @protected
		* @memberOf sap.collaboration.components.feed.Component
		*/
		onBeforeRendering: function() {

		},

		/**
		* Function is called when the rendering of the Component Container is completed.
		* @protected
		* @memberOf sap.collaboration.components.feed.Component
		*/
		onAfterRendering: function() {
		},
		/**
		 * The method to create the Content (UI Control Tree) of the Component.
		 * @protected
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		createContent: function() {
			this._view = sap.ui.view({
				id: this.createId("group_feed_view"),
				height: "100%",
				type:ViewType.XML,
				viewName:"sap.collaboration.components.feed.views.GroupFeed"
			});

			this.setAxisOrientation(this.getAxisOrientation());

			return this._view;
		},
		/**
		 * Sets all the properties passed in oSettings.
		 * @public
		 * @param {map} settings - key/value map for settings
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		setSettings: function(settings) {
			for (var key in settings) {
				if (settings.hasOwnProperty(key)) {
					this._setProperty(key, settings[key]);
				}
			}
		},
		/**
		 * Returns the selected Group.
		 * @public
		 * @memberOf sap.collaboration.components.feed.Component
		 * @return {map} a map containing information about the selected Group (e.g. Id, Name, etc...)
		 */
		getSelectedGroup: function() {
			return this._view.getModel().getProperty("/groupSelected");
		},
		/**
		 * Set the property's new value in the component and in the view's model.
		 * @private
		 * @param {string} propertyName
		 * @param {string} propertyValue
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		_setProperty: function(propertyName, propertyValue) {
			this._logger.info(propertyName + ": " + propertyValue);
			this._view.getModel().setProperty("/" + propertyName, propertyValue);
			this.setProperty(propertyName, propertyValue);
		},
		/**
		 * Set the axis orientation for the Timeline.
		 * @override
		 * @public
		 * @param {sap.suite.ui.commons.TimelineAxisOrientation} axisOrientation
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		setAxisOrientation: function(axisOrientation) {
			this._setProperty("axisOrientation", axisOrientation);
			return this;
		},
		/**
		 * Sets the sources for the feed.
		 * Array of strings representing the Jam group IDs (e.g. ["groupid1", "groupid2"]).
		 * @override
		 * @public
		 * @param {object} feedSources
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		setFeedSources: function(feedSources) {
			this._setProperty("feedSources", feedSources);
		},
		/**
		 * Sets the enableScroll property for the Timeline.
		 * @override
		 * @public
		 * @param {boolean} enableScroll
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		setEnableScroll: function(enableScroll) {
			this._setProperty("enableScroll", enableScroll);
			return this;
		}
	});

	return FeedComponent;

});

/**
 * Getter for property <code>axisOrientation</code>.
 *
 * Default value is <code>Vertical</code>
 *
 * @returns {sap.suite.ui.commons.TimelineAxisOrientation} the value of property <code>axisOrientation</code>
 * @public
 * @name sap.collaboration.components.feed.Component#getAxisOrientation
 * @function
 * @memberOf sap.collaboration.components.feed.Component
 */

/**
 * Setter for property <code>axisOrientation</code>.
 *
 * Default value is <code>Vertical</code>
 *
 * @param {sap.suite.ui.commons.TimelineAxisOrientation} oAxisOrientation  new value for property <code>axisOrientation</code>
 * @returns {this} <code>this</code> to allow method chaining
 * @public
 * @name sap.collaboration.components.feed.Component#setAxisOrientation
 * @function
 * @memberOf sap.collaboration.components.feed.Component
 */

/**
 * Getter for property <code>feedSources</code>.
 *
 * @returns {map|string[]} the value of property <code>feedSources</code>
 * @public
 * @name sap.collaboration.components.feed.Component#getFeedSources
 * @function
 * @memberOf sap.collaboration.components.feed.Component
 */

/**
 * Setter for property <code>feedSources</code>.
 *
 * The feedSources is either an array of strings (SAP Jam Group IDs) or a map in the following structure:<br>
 * { mode : sap.collaboration.FeedType, data : any }<br>
 * Based on the mode, the data is either required or not.
 *
 * @param {map|string[]} oFeedSources  new value for property <code>feedSources</code>
 * @returns {this} <code>this</code> to allow method chaining
 * @public
 * @name sap.collaboration.components.feed.Component#setFeedSources
 * @function
 * @memberOf sap.collaboration.components.feed.Component
 */

/**
 * Getter for property <code>enableScroll</code>.
 *
 * @returns {boolean} the value of property <code>enableScroll</code>
 * @public
 * @name sap.collaboration.components.feed.Component#getEnableScroll
 * @function
 * @memberOf sap.collaboration.components.feed.Component
 */

/**
 * Setter for property <code>enableScroll</code>.
 *
 * Sets the property enableScroll on the Timeline.
 *
 * Setting this property to false will remove the scrollbar on the Timeline.<br>
 *
 * Default value is <code>true</code>
 *
 * @param {boolean} bEnableScroll new value for property <code>enableScroll</code>
 * @returns {this} <code>this</code> to allow method chaining
 * @public
 * @name sap.collaboration.components.feed.Component#setEnableScroll
 * @function
 * @memberOf sap.collaboration.components.feed.Component
 */
