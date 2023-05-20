/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/collaboration/components/utils/CommonUtil', 'sap/collaboration/components/utils/NotificationTypeUtil', 'sap/collaboration/components/utils/OdataUtil', 'sap/ui/core/mvc/Controller', 'sap/ui/model/odata/ODataModel', 'sap/ui/Global'], function(CommonUtil, NotificationTypeUtil, OdataUtil, Controller, ODataModel, Global) {
	"use strict";

	sap.ui.controller("sap.collaboration.components.fiori.notification.Notification", {

	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* Initialize class variables
	* memberOf Notification
	*/
		onInit: function() {
			this.initializeRefreshAndTransitionState();

			this.sPrefixId = this.getView().getViewData().controlId;
			this.oView = this.getView();
			this.oLangBundle = this.oView.oLangBundle;
			this.sOdataServiceUrl = this.getView().getViewData().oDataServiceUrl;
			this.iTransitionInterval = this.getView().getViewData().transitionInterval;
			this.iRefreshInterval = this.getView().getViewData().refreshInterval;

			this.sProfilePhotoHiddenStyleClass = this.oView.sStyleClassPrefix + "ProfileImageHidden";
			this.sLoadingAnimationDummyTextStyleClass = this.oView.sStyleClassPrefix + "LoadingText";
			this.sNewNotificationTextStyleClass = this.oView.sStyleClassPrefix + "NewNotificationText";
			this.sErrorTextStyleClass = this.oView.sStyleClassPrefix + "ErrorText";

			this.oView.oNotificationNewNotificationOrErrorText.addStyleClass(this.sLoadingAnimationDummyTextStyleClass);
			this.oView.oNotificationNewNotificationOrErrorText.setText(". . . . . . . . . . . .");
			this.oView.oNotificationNewNotificationOrErrorText.setBusy(true);

			this.oNotificationTypeUtil = new NotificationTypeUtil();
		},

		initializeRefreshAndTransitionState: function() {
			this.bErrorInUnreadCountODataResponse = true;
			this.bErrorInNoticesODataResponse = true;
			this.bErrorInODataResponse = true;

			this.iNotificationCurrentIndex = undefined;
			this.iNotificationPreviousIndex = undefined;

			this.aNotifications = undefined;

			this.bIsTransitionActive = false;
			this.iNotificationsTransitionCallbackRegistrationId = undefined;

			this.bIsRefreshActive = false;
			this.iNotificationsRefreshCallbackRegistrationId = undefined;

			this.iNotificationUnreadCount = undefined;

			// Maximum number of notifications to display.
			this.iMaxNotificationsToDisplay = this.getView().getViewData().numberOfNotifications;
			this.aImageControls = this.getView().getViewData().aProfilePhotos;

			this.iNotificationsToDisplay = undefined;
			this.aUsedImageControls = [];
		},

	/**
	* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	* (NOT before the first rendering! onInit() is used for that one!).
	*/
		onBeforeRendering: function() {
			this.initializeCommonUtil();
			this.initializeOdataModel();
			this.initializeOdataUtils();
		},

	/**
	* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	* This hook is the same one that SAPUI5 controls get after being rendered.
	*/
		onAfterRendering: function() {
			this.fetchNotificationData();
		},

		/**
		 * Initializes the OData Model
		 * @private
		 */
		initializeOdataModel : function() {
			var asJson = true;
			this.oOdataModel = new ODataModel(this.sOdataServiceUrl, asJson);
		},

		/**
		 * Initialize the OData Utility Class
		 * @private
		 */
		initializeOdataUtils : function() {
			this.oODataUtil = new OdataUtil();
		},

		/**
		 * Initialize the Common Utility Class
		 * @private
		 */
		initializeCommonUtil: function() {
			this.oCommonUtil = new CommonUtil();
		},

		fetchNotificationData : function() {
			var aRequests = [];

			var oNotificationUnreadCountReq = this.oODataUtil.createNotificationUnreadCountBatchOperation(this.oOdataModel);
			var oNotificationReq = this.oODataUtil.createNotificationBatchOperation(this.oOdataModel, this.iMaxNotificationsToDisplay);

			aRequests.push(oNotificationUnreadCountReq);
			aRequests.push(oNotificationReq);

			var fParseResult = this.getFunctionParseResult();
			var fErrorCallBack = this.getFunctionErrorCallBack();

			//var self = this;
			this.oODataUtil.executeODataBatchRequest(this.oOdataModel, aRequests, fParseResult, true, fErrorCallBack);
		},

		getFunctionParseResult : function() {
			var self = this;
			return function(aResults){
				// Here we turn off the loading animation.
				self.oView.oNotificationNewNotificationOrErrorText.setBusy(false);
				self.oView.oNotificationNewNotificationOrErrorText.setText("");
				self.oView.oNotificationNewNotificationOrErrorText.removeStyleClass(self.sLoadingAnimationDummyTextStyleClass);

				// And set the internal state to the initial state.
				self.initializeRefreshAndTransitionState();
				if (aResults[0].error && !aResults[1].error) {
					self.bErrorInNoticesODataResponse = false;
					self.aNotifications = aResults[1].results;
					self.clearAllUiTexts();
					self.hideAllProfilePhotoControls();
					self.setUiContent();
					self.activateNotificationRefresh();
				}
				else if (!aResults[0].error && aResults[1].error) {
					self.bErrorInUnreadCountODataResponse = false;
					self.iNotificationUnreadCount = aResults[0].GetNoticeUnreadCount.UnreadCount;
					self.clearAllUiTexts();
					self.hideAllProfilePhotoControls();
					self.setUiContent();
					self.activateNotificationRefresh();
				}
				else if (aResults[0].error && aResults[1].error) {
					self.clearAllUiTexts();
					self.hideAllProfilePhotoControls();
					self.setUiContent();
					self.activateNotificationRefresh();
				}
				else {
					self.bErrorInUnreadCountODataResponse = false;
					self.bErrorInNoticesODataResponse = false;
					self.bErrorInODataResponse = false;
					self.aNotifications = aResults[1].results;
					self.iNotificationUnreadCount = aResults[0].GetNoticeUnreadCount.UnreadCount;
					if (self.iMaxNotificationsToDisplay > 0) {
						// The user wants to display at least one notification.
						if (self.aNotifications.length > 0) {
							// There is at least one notification that is available to display.
							if (self.iNotificationUnreadCount > 0) {
								// There are at least one unread notification.
								self.iNotificationsToDisplay = Math.min(self.iMaxNotificationsToDisplay, self.aNotifications.length, self.iNotificationUnreadCount);
								self.iNotificationCurrentIndex = 0;
								self.iNotificationPreviousIndex = self.iNotificationsToDisplay - 1;
								self.clearAllUiTexts();
								self.hideAllProfilePhotoControls();
								self.setProfilePhotosSrc();
								self.setUiContent();
								self.activateNotificationTransition();
								self.activateNotificationRefresh();
							}
							else {
								// In the case where the number of unread notifications is less than
								// or equal to zero and there are notifications to display, we only
								// display the one notification.
								// We do not activate transitions in this case because there
								// is only one notification to display. But we do activate the
								// refresh.
								self.iNotificationsToDisplay = 1;
								self.iNotificationCurrentIndex = 0;
								self.iNotificationPreviousIndex = self.iNotificationsToDisplay - 1;
								self.clearAllUiTexts();
								self.hideAllProfilePhotoControls();
								self.setProfilePhotosSrc();
								self.setUiContent();
								self.activateNotificationRefresh();
							}
						}
						else {
							// There are no notifications available to display.
							// The assumption we make here is that the unread
							// count is also zero. The user has requested that we display
							// some notifications, but since there's absolutely nothing to display,
							// then we display nothing. We may want to display the number of
							// unread notifications, but this is not part of the specification
							// Hence, we simply display nothing.
							// We only activate the refresh since there may be new notifications
							// that come in later.
							self.iNotificationsToDisplay = 0;
							self.clearAllUiTexts();
							self.hideAllProfilePhotoControls();
							self.activateNotificationRefresh();
						}
					}
					else {
						// The user has requested we display absolutely nothing. The user
						// has requested less than or equal to 0 number of notifications
						// be displayed. Hence, we display nothing. And since we don't allow
						// applications using our component to change the number of notifications
						// to display after creating the component, then we don't bother activating
						// the refresh or the transition. If a refresh should be done, then it
						// only makes sense if we want to update the number of unread notifications.
						// However, the setUIContent method currently doesn't allow for displaying
						// only the unread notifications.
						self.iNotificationsToDisplay = 0;
						self.clearAllUiTexts();
						self.hideAllProfilePhotoControls();
					}
				}
			};
		},

		getFunctionErrorCallBack : function() {
			var self = this;
			return function(oError){
				self.initializeRefreshAndTransitionState();
				self.clearAllUiTexts();
				self.hideAllProfilePhotoControls();
				self.setUiContent();
				self.activateNotificationRefresh();
			};
		},

		setProfilePhotosSrc : function() {
			// If the notification was triggered by a Jam member, then this is that member's id and full name.
			var iSenderId;
			var sSenderFullName;
			var sProfilePhotoURL;
			for (var i = 0; i < this.iNotificationsToDisplay; ++i) {
				iSenderId = this.aNotifications[i].SenderId;
				sSenderFullName = this.aNotifications[i].SenderFullName;
				sProfilePhotoURL = this.getProfilePhotoURL(sSenderFullName,iSenderId);
				this.oView.aProfilePhotos[i].addStyleClass(this.sProfilePhotoHiddenStyleClass);
				this.oView.aProfilePhotos[i].setSrc(sProfilePhotoURL);
			}
		},

		getProfilePhotoURL : function(sSenderFullName,iSenderId) {
			if (sSenderFullName !== "") {
				return this.sOdataServiceUrl + "/Members(" + iSenderId + ")/ProfilePhoto/$value";
			}
			else {
				return sap.ui.resource('sap.collaboration.components',"images/Anonymous.png");
			}
		},

		hideAllProfilePhotoControls: function() {
			for (var i = 0; i < this.oView.aProfilePhotos.length; ++i) {
				this.oView.aProfilePhotos[i].addStyleClass(this.sProfilePhotoHiddenStyleClass);
			}
		},

		clearAllUiTexts : function() {
			this.oView.oNotificationTypeText.setText("");
			this.oView.oNotificationMessageText.setText("");
			this.oView.oNotificationUnreadCountText.setText("");
			this.oView.oNotificationNewNotificationOrErrorText.setText("");
			this.oView.oNotificationAgeText.setText("");
			this.oView.oNotificationGroupText.setText("");
		},

		setUiContent : function() {
			if (this.bErrorInODataResponse) {
				// Then display an error.
				this.oView.oNotificationNewNotificationOrErrorText.removeStyleClass(this.sNewNotificationTextStyleClass); // In case the "New Notifications" text was previously being displayed.
				this.oView.oNotificationNewNotificationOrErrorText.addStyleClass(this.sErrorTextStyleClass);
				this.oView.oNotificationNewNotificationOrErrorText.setText(this.oLangBundle.getText("NOTIF_ERROR_MESSAGE"));
			}
			else {
				// No errors. Go ahead and display the content of the tile.

				// JavaScript object representation of an OData Notification entity type instance.
				var oNotification = this.aNotifications[this.iNotificationCurrentIndex];

				// Key used to fetch the notification type's text.
				var sNotificationTypeText = "NOTIF_" + oNotification.EventType.toUpperCase();

				// If the sender that triggered the notification has written a message, then this
				// message will be non-empty.
				var sNotificationMessageText = oNotification.Message;

				var sNotificationUnreadCountText;
				if (this.iNotificationUnreadCount > 999) {
					sNotificationUnreadCountText = this.oLangBundle.getText("NOTIF_MORE_THAN_999_NEW_NOTIFICATIONS");
				}
				else {
					sNotificationUnreadCountText = this.iNotificationUnreadCount;
				}

				// The date on which the notification was created.
				var dCreatedAt = oNotification.CreatedAt;

				// If the notification has a corresponding Jam group, then this is that group's name.
				// For example, when someone posts an update using @@notify in a group's feed that you're
				// a member of, then the string below will have the name of that group.
				var sGroupName = oNotification.GroupName;

				// These are the notification entity type instance's properties that are needed
				// to correctly generate this notification type's text. For example, some notifications
				// require the sender's full name only, while others need both the sender's full name and
				// company name.
				var aNotificationTypePropertyNames = this.oNotificationTypeUtil.getRequiredNotificationPropertyNames(oNotification.EventType);
				var aNotificationPropertyValues = this.getNotificationPropertyValues(aNotificationTypePropertyNames, oNotification);

				// Using the properties retrieved above, we can now get this notification type's text and
				// display it in the UI.
				this.oView.oNotificationTypeText.setText(this.oLangBundle.getText(sNotificationTypeText, aNotificationPropertyValues));
				this.oView.oNotificationMessageText.setText(sNotificationMessageText);


				// Instead of setting the image source for a single image control when we want to display
				// the next image, we now hide the currently displayed image control and unhide the next
				// image control we want to display. Here we make the assumption that the array we use
				// has been prepopulated with image controls, and that the source of each of those image
				// controls has already been set. We hide and unhide image controls by changing the CSS
				// classes that are currently applied to them.
				this.oView.aProfilePhotos[this.iNotificationPreviousIndex].addStyleClass(this.sProfilePhotoHiddenStyleClass);
				this.oView.aProfilePhotos[this.iNotificationCurrentIndex].removeStyleClass(this.sProfilePhotoHiddenStyleClass);

				this.oView.oNotificationUnreadCountText.setText(sNotificationUnreadCountText);
				this.oView.oNotificationNewNotificationOrErrorText.removeStyleClass(this.sErrorTextStyleClass); // In case there was previously an error being displayed.
				this.oView.oNotificationNewNotificationOrErrorText.addStyleClass(this.sNewNotificationTextStyleClass);
				this.oView.oNotificationNewNotificationOrErrorText.setText(this.oLangBundle.getText("NOTIF_NEW_NOTIFICATIONS"));
				var aNotificationAgeAndGroup = this.calculateNotificationAge(dCreatedAt,sGroupName).split("\n");
				var sNotificationAgeText = aNotificationAgeAndGroup[0];
				var sNotificationGroupText = "";
				if (aNotificationAgeAndGroup.length > 1){
					sNotificationGroupText = aNotificationAgeAndGroup[1];
				}

				this.oView.oNotificationAgeText.setText(sNotificationAgeText);
				this.oView.oNotificationGroupText.setText(sNotificationGroupText);

				this.iNotificationPreviousIndex = this.iNotificationCurrentIndex;
				this.iNotificationCurrentIndex = (this.iNotificationCurrentIndex + 1) % this.iNotificationsToDisplay;
			}
		},


		getNotificationPropertyValues : function(aNotificationTypePropertyNames, oNotification) {
			var aNotificationTypePropertyValues = [];
			for (var i = 0; i < aNotificationTypePropertyNames.length; i++){
				aNotificationTypePropertyValues.push(oNotification[aNotificationTypePropertyNames[i]]);
			}
			return aNotificationTypePropertyValues;
		},

		/**
		   * This function calculates the age of the notification
		   *
		   * @param {Date} The notification date
		   * @private
		   */
		   calculateNotificationAge : function(dCreatedAt, sGroupName) {


				if (!this.oCommonUtil.isValidDate(dCreatedAt)) {
				  return "";
				}

				var dNow = new Date();

				// ignore milliseconds
				dCreatedAt.setMilliseconds(0);
				dNow.setMilliseconds(0);

				var nMillisInOneMinute = 60000;
				var nMillisInOneHour = nMillisInOneMinute * 60;
				var nMillisInOneDay = nMillisInOneHour * 24;

				var nNotificationAgeInMillis = dNow.getTime() - dCreatedAt.getTime();

				if (nNotificationAgeInMillis >= nMillisInOneDay) {
					var nNumberOfDays = Math.round(parseFloat(nNotificationAgeInMillis / nMillisInOneDay, 10));
					if (nNumberOfDays === 1) {
						if (sGroupName !== "") {
							return this.oLangBundle.getText("NOTIF_DAY_AGO_GRP", [nNumberOfDays.toString(), sGroupName]);
						}
						else {
							return this.oLangBundle.getText("NOTIF_DAY_AGO_NO_GRP", [nNumberOfDays.toString()]);
						}
					}
					else {
						if (sGroupName !== "") {
							return this.oLangBundle.getText("NOTIF_DAYS_AGO_GRP", [nNumberOfDays.toString(), sGroupName]);
						}
						else {
							return this.oLangBundle.getText("NOTIF_DAYS_AGO_NO_GRP", [nNumberOfDays.toString()]);
						}
					}
				}
				else if (nNotificationAgeInMillis >= nMillisInOneHour) {
					var nNumberOfHours = Math.round(parseFloat(nNotificationAgeInMillis / nMillisInOneHour, 10));

					if (nNumberOfHours === 1) {
						if (sGroupName !== "") {
							return this.oLangBundle.getText("NOTIF_HOUR_AGO_GRP", [nNumberOfHours.toString(), sGroupName]);
						}
						else {
							return this.oLangBundle.getText("NOTIF_HOUR_AGO_NO_GRP", [nNumberOfHours.toString()]);
						}
					}
					else {
						if (sGroupName !== "") {
							return this.oLangBundle.getText("NOTIF_HOURS_AGO_GRP", [nNumberOfHours.toString(), sGroupName]);
						}
						else {
							return this.oLangBundle.getText("NOTIF_HOURS_AGO_NO_GRP", [nNumberOfHours.toString()]);
						}
					}
				}
				else {
					var nNumberOfMins = Math.round(parseFloat(nNotificationAgeInMillis / nMillisInOneMinute, 10));

					if (nNumberOfMins === 1) {
						if (sGroupName !== "") {
							return this.oLangBundle.getText("NOTIF_MINUTE_AGO_GRP", [nNumberOfMins.toString(), sGroupName]);
						}
						else {
							return this.oLangBundle.getText("NOTIF_MINUTE_AGO_NO_GRP" ,[nNumberOfMins.toString()]);
						}
					}
					else {
						if (sGroupName !== "") {
							return this.oLangBundle.getText("NOTIF_MINUTES_AGO_GRP", [nNumberOfMins.toString(), sGroupName]);
						}
						else {
							return this.oLangBundle.getText("NOTIF_MINUTES_AGO_NO_GRP", [nNumberOfMins.toString()]);
						}
					}
				}
		   },

		  activateNotificationTransition : function() {
			  if (!this.bIsTransitionActive) {
				  this.iNotificationsTransitionCallbackRegistrationId = this.getTransitionRegistrationId();
				  this.bIsTransitionActive = true;
			  }
		  },

		  getTransitionRegistrationId: function() {
			  return setInterval(this.setUiContent.bind(this),this.iTransitionInterval);
		  },

		  deactivateNotificationTransition : function() {
			  if (this.bIsTransitionActive) {
				  clearInterval(this.iNotificationsTransitionCallbackRegistrationId);
				  this.bIsTransitionActive = false;
			  }
		  },

		  activateNotificationRefresh : function() {
			  if (!this.bIsRefreshActive) {
				  this.iNotificationsRefreshCallbackRegistrationId = this.getRefreshRegistrationId();
				  this.bIsRefreshActive = true;
			  }
		  },

		  getRefreshRegistrationId: function() {
			  return setInterval(this.refreshNotification.bind(this),this.iRefreshInterval);
		  },

		  deactivateNotificationRefresh : function() {
			  if (this.bIsRefreshActive) {
				  clearInterval(this.iNotificationsRefreshCallbackRegistrationId);
				  this.bIsRefreshActive = false;
			  }
		  },

		  refreshNotification : function() {
			   // Deactivate the transitions and the refresh.
			   this.deactivateNotificationTransition();
			   this.deactivateNotificationRefresh();

			   // Update the array and index.
			   this.fetchNotificationData();
		  }

	});

});
