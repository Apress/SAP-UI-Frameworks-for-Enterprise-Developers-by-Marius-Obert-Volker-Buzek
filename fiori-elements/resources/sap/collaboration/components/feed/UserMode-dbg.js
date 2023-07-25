/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define(["./Mode"], function(Mode) {
	"use strict";

	var UserMode = Mode.extend("sap.collaboration.components.feed.UserMode",{
		constructor: function(oFeedController) {
			// Calls the superclass's constructor. This
			// causes this class to inherit the instance
			// variables list below.
			Mode.apply(this, [oFeedController]);

			// Inherited instance variables
			// this._oCommonUtil
			// this._oFeedController
			// this._oListItemTemplate
			// this._oList
			// this._oViewDataModel
			// this._oJamModel
			// this._oSelectPopover

			this._oList.setModel(this._oJamModel);
		}
	});

	/**
	 * Asks the UserMode object to start.
	 * @public
	 * @memberOf sap.collaboration.components.feed.UserMode
	 */
	UserMode.prototype.start = function() {
		// Prior to binding the path for the list items, since this
		// is the start of a new list of list items being
		// populated, we attach to the list's update finished
		// event to update the view's data model about the
		// selection. The update finished method will then
		// detach itself to make sure it isn't called again.
		this._oList.attachUpdateFinished(this.onGroupSelectorUpdateFinished, this);

		// Attach event handler for the List's updateFinished, this handler function simply removes the busy indicator on the list.
		// The reason we can't put it in this.onGroupSelectorUpdateFinished is because after this.onGroupSelectorUpdateFinished is executed, it then detaches itself
		this._oList.attachUpdateFinished(this.onUpdateFinished, this);

		// We must figure out a way to deal with the things that can
		// potentially go wrong after the list sends a request for
		// the groups. Whatever callback functions we register
		// must be unregistered when the request is successful.
		// Also, the registered callback should not have to worry
		// about other parts of the component that also use the
		// list control and/or ODataModel object.
		this._oList.bindItems({
			path: "/Groups",
			template: this._oListItemTemplate
		});

		//enable group feed by enabling add post button, group selector and the more button
		this._oFeedController.enableGroupFeed();
	};

	/**
	 * Asks the UserMode object to stop.
	 * @public
	 * @memberOf sap.collaboration.components.feed.UserMode
	 */
	UserMode.prototype.stop = function() {
		// detach handler for the list
		this._oList.detachUpdateFinished(this.onUpdateFinished, this);
	};

	UserMode.prototype._updateSelectedGroupInViewDataModel = function(oGroup) {
		this._oViewDataModel.setProperty("/groupSelected", {
			Id : oGroup.Id,
			Name : oGroup.Name,
			WebURL : oGroup.WebURL
		});

		this._oViewDataModel.setProperty("/feedEndpoint", "/Groups('" + oGroup.Id + "')/FeedEntries");
	};

	/**
	 * Returns the OData path for Add Post
	 * @public
	 * @return {string} The OData path for Add Post
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	UserMode.prototype.getAddPostPath = function () {
		return "/Groups('" + this._oViewDataModel.getProperty("/groupSelected/Id") + "')/FeedEntries";
	};

	/**
	 * Displays  the feed source selector popover next to the specified control.
	 * @param {object} oControl the control next to which to display the feed source selector
	 * @memberOf sap.collaboration.components.feed.UserMode
	 */
	UserMode.prototype.displayFeedSourceSelectorPopover = function(oControl) {
		this._oList.setBusy(true);
		this._oJamModel.refresh(/* bForceUpdate */ true);
		this._oGroupSelectPopover.openBy(oControl);
	};

	/**
	 * Event handler for the selector list when an item is selected.
	 * The structure of the model set on the individual list items
	 * must be known, and there must exist a way of mapping the
	 * selected list item.
	 * @param {object} oEvent
	 * @memberOf sap.collaboration.components.feed.UserMode
	 */
	UserMode.prototype.onGroupSelected = function(oEvent) {
		var oGroupSelected = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
		this._updateSelectedGroupInViewDataModel(oGroupSelected);
		this._oGroupSelectPopover.close();
	};

	/**
	 * Required method by the Mode abstract method. However, this
	 * mode doesn't need to implement anything for this method.
	 * @memberOf sap.collaboration.components.feed.UserMode
	 */
	UserMode.prototype.onBatchCompleted = function() {};

	/**
	 * When the group list is finished updating, then we make the
	 * the currently selected group equal to the first group
	 * in the list.
	 * @memberOf sap.collaboration.components.feed.UserMode
	 */
	UserMode.prototype.onGroupSelectorUpdateFinished = function() {
		var aListItems = this._oList.getItems();
		var oFirstListItem;
		var oFirstGroup;
		if (aListItems.length > 0) {
			oFirstListItem = aListItems[0];
			this._oList.setSelectedItem(oFirstListItem);
			oFirstGroup = oFirstListItem.getBindingContext().getObject();
			this._updateSelectedGroupInViewDataModel(oFirstGroup);
		}

		// detach this event handler function since we only want it to run once
		this._oList.detachUpdateFinished(this.onGroupSelectorUpdateFinished, this);
	};

	/**
	 * When the group list is finished updating, then we make the
	 * the currently selected group equal to the first group
	 * in the list.
	 * @memberOf sap.collaboration.components.feed.UserMode
	 */
	UserMode.prototype.onUpdateFinished = function() {
		this._oList.setBusy(false);
	};

	return UserMode;
});
