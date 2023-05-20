/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Notifications.
sap.ui.define([
	"sap/base/Log",
	"./library",
	"sap/ui/core/Control",
	"./Messages",
	"sap/m/ToggleButton",
	"./NotificationsRenderer",
	"./getResourceBundle"
], function(
	Log,
	vkLibrary,
	Control,
	Messages,
	ToggleButton,
	NotificationsRenderer,
	getResourceBundle
) {
	"use strict";

	/**
	 * Constructor for a new Notifications.
	 *
	 * @class
	 * Provides the ability to display logged console messages within your application.
	 *
	 * @param {string} [sId] ID for the new Notifications control. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new Notifications control.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.Notifications
	 * @since 1.38.0
	 */
	var Notifications = Control.extend("sap.ui.vk.Notifications", /** @lends sap.ui.vk.Notifications.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"clearAllMessages"
			],
			aggregations: {
				_messagePopover: {
					type: "sap.m.MessagePopover",
					multiple: false,
					visibility: "hidden"
				},
				_messagePopoverToggleButton: {
					type: "sap.m.ToggleButton",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				/**
				 * This event will be fired when all messages in the log are deleted.
				 */
				allMessagesCleared: {},

				/**
				 * This event will be fired when a new log message is added.
				 */
				messageAdded: {}
			}
		}
	});

	Notifications.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.call(this);
		}

		var messagePopover; // forward declaration.

		var messagePopoverToggleButton = new ToggleButton({
			icon: "sap-icon://message-popup",
			type: sap.m.ButtonType.Emphasized,
			tooltip: getResourceBundle().getText("MESSAGEPOPOVERBUTTON"),
			text: "0",
			press: function(event) {
				if (messagePopoverToggleButton.getPressed()) {
					messagePopover.openBy(messagePopoverToggleButton);
				} else {
					messagePopover.close();
				}
			}
		});
		messagePopoverToggleButton.addStyleClass("messagePopoverButton");
		this.setAggregation("_messagePopoverToggleButton", messagePopoverToggleButton);

		messagePopover = new sap.m.MessagePopover({
			headerButton: new sap.m.Button({
				text: getResourceBundle().getText("MESSAGEPOPOVER_CLEARBUTTON"),
				type: sap.m.ButtonType.Emphasized,
				tooltip: getResourceBundle().getText("MESSAGEPOPOVER_CLEARBUTTON"),
				press: function(event) {
					messagePopover.getParent().clearAllMessages();
				}
			}),
			// If the popover is closed via its Close button we need to change the toggle button's state.
			afterClose: messagePopoverToggleButton.setPressed.bind(messagePopoverToggleButton, false)
		});
		messagePopover.addStyleClass("sapVizKitNotificationPopover");
		this.setAggregation("_messagePopover", messagePopover);

		Log.addLogListener(this);
	};

	Notifications.prototype.exit = function() {
		Log.removeLogListener(this);

		if (Control.prototype.exit) {
			Control.prototype.exit.call(this);
		}
	};

	// Implementation of LogListener.onLogEntry() interface method.
	Notifications.prototype.onLogEntry = function(event) {
		if (event.component.startsWith("sap.ui.vk")
			&& (event.level === Log.Level.WARNING || event.level === Log.Level.ERROR || event.level === Log.Level.FATAL)
		) {
			var mess = event.details,
				cause,
				reso,
				code;
			if (Messages[event.details]) {
				mess = getResourceBundle().getText(Messages[event.details].summary);
				cause = getResourceBundle().getText(Messages[event.details].cause);
				reso = getResourceBundle().getText(Messages[event.details].resolution);
				code = getResourceBundle().getText("ERROR_DESCRIPTION_CODE");
			}
			var component = getResourceBundle().getText("ERROR_DESCRIPTION_COMPONENT");
			var date = getResourceBundle().getText("ERROR_DESCRIPTION_DATE");
			var time = getResourceBundle().getText("ERROR_DESCRIPTION_TIME");
			var level = getResourceBundle().getText("ERROR_DESCRIPTION_LEVEL");
			var messageTitle = getResourceBundle().getText("ERROR_DESCRIPTION_MESSAGE");
			var causeTitle = getResourceBundle().getText("ERROR_DESCRIPTION_CAUSE");
			var resolutionTitle = getResourceBundle().getText("ERROR_DESCRIPTION_RESOLUTION");

			var description =
				"<div><b>" + component + ":</b><br>" + event.component + "</div><br>" +
				"<div><b>" + date + ":</b><br>" + event.date + "</div><br>" +
				(code ? "<div><b>" + code + ":</b><br>" + event.details + "</div><br>" : "") +
				"<div><b>" + time + ":</b><br>" + event.time.slice(0, event.time.indexOf(".")) + "</div><br>" +
				"<div><b>" + level + ":</b><br>" + event.level + "</div><br>" +
				"<div><b>" + messageTitle + ":</b><br>" + mess + "</div><br>" +
				(cause ? "<div><b>" + causeTitle + ":</b><br>" + cause + "</div><br>" : "") +
				(reso ? "<div><b>" + resolutionTitle + ":</b><br>" + reso + "</div>" : "");

			var item = new sap.m.MessageItem({
				markupDescription: true,
				title: event.message,
				description: description
			});
			var messagePopover = this.getAggregation("_messagePopover");
			messagePopover.addItem(item);
			this.getAggregation("_messagePopoverToggleButton").setText(messagePopover.getItems().length);
			this.fireMessageAdded();
		}
	};

	/**
	 * Clears the items in the Message Popover list.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Notifications.prototype.clearAllMessages = function() {
		var messagePopover = this.getAggregation("_messagePopover");
		messagePopover.removeAllItems();
		messagePopover.close();
		this.getAggregation("_messagePopoverToggleButton").setText(messagePopover.getItems().length);
		this.fireAllMessagesCleared();
		return this;
	};

	return Notifications;
});
