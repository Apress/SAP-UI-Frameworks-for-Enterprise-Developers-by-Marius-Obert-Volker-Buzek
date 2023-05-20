/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define(["./GroupIDsMode", "./BOMode", "./UserMode", "sap/collaboration/library"], function(GroupIDsMode, BOMode, UserMode, library) {
	"use strict";

	// shortcut for sap.collaboration.FeedType
	var FeedType = library.FeedType;

	/**
	 * A ModeFactory object is used to construct sub-class instance of the Mode abstract-class.
	 * This class implements the singleton pattern.
	 * @class
	 * @private
	 */
	var ModeFactory = function() {
		this._oFeedTypeToModeClass = {};
		this._oFeedTypeToModeClass[FeedType.GroupIds] = GroupIDsMode;
		this._oFeedTypeToModeClass[FeedType.BusinessObjectGroups] = BOMode;
		this._oFeedTypeToModeClass[FeedType.UserGroups] = UserMode;
	};
	/**
	 * Instance variable used to store the instance of the ModeFactory class to return.
	 * @private
	 * @static
	 * @type {ModeFactory}
	 */
	ModeFactory._instance = null;
	/**
	 * Returns the instance of the ModeFactory class.
	 * @public
	 * @static
	 * @return {ModeFactory} the ModeFactory class instance
	 */
	ModeFactory.getInstance = function() {
		if (ModeFactory._instance === null) {
			ModeFactory._instance = new ModeFactory();
		}
		return ModeFactory._instance;
	};
	/**
	 * Creates and returns an instance of the corresponding Mode sub-class.
	 * @public
	 * @param  {string} sFeedType the feed type for which to obtain a Mode sub-class instance
	 * @param  {sap.ui.mvc.Controller} oFeedController the collaborating feed controller
	 * @return {Mode} an instance of the corresponding Mode sub-class
	 * @throws {Error} if there is no corresponding class
	 */
	ModeFactory.prototype.createMode = function(sFeedType, oFeedController) {
		var ModeClass = this._oFeedTypeToModeClass[sFeedType];
		if (ModeClass === undefined) {
			var sErrorMessage = sFeedType + " is not a valid value for the feedSources mode property.\n";
			sErrorMessage += "It must be equal to the value of either one of the following:\n";
			sErrorMessage += "sap.collaboration.FeedType.GroupIds\n";
			sErrorMessage += "sap.collaboration.FeedType.BusinessObjectGroups\n";
			sErrorMessage += "sap.collaboration.FeedType.UserGroups";
			oFeedController.logError(sErrorMessage);
			oFeedController.byId("timeline").destroy();
			throw new Error(sErrorMessage);
		}
		return new ModeClass(oFeedController);
	};
	return ModeFactory;
}, true);