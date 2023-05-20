/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*************************************************************
* OdataUtil helper class
*
* Is responsible for the integration and communication with the
* Backend OData Server
**************************************************************/

sap.ui.define(["sap/ui/base/Object"], function(BaseObject) {
	"use strict";

	var NotificationTypeUtil = BaseObject.extend("sap.collaboration.components.utils.NotificationTypeUtil",{

		/**
		 * Constants for the OdataUtil Class
		 */
		map: {
			AbuseReported : [],
			AcceptAddedAsAssistant : ["SenderFullName"],
			AcceptAddedAsMgr : ["SenderFullName"],
			AcceptAddedAsReport : ["SenderFullName"],
			AddedAsAssistant : ["SenderFullName"],
			AddedAsMgr : ["SenderFullName"],
			AddedAsReport : ["SenderFullName"],
			AutoGroupAdmin : ["SenderFullName"],
			AutoGroupMember : ["SenderFullName"],
			CommentInDiscussion : ["SenderFullName"],
			CrossCompanyInviteToGroup : ["SenderFullName", "ObjName"],
			FeatureInGroup : ["SenderFullName"],
			GoalMigrated : [],
			GroupContentPendingApproval : [],
			GroupAccessRequest : ["ObjName"], // there are {0} pending requests to join a group
			InviteToFollow : ["SenderFullName"],
			InviteToInactiveGroup : ["SenderFullName"],
			InviteToGroup : ["SenderFullName"],
			Like : ["SenderFullName"],
			MarkComment : ["SenderFullName"],
			MarkCommentSimple : ["SenderFullName"],
			MentionInFeed : ["SenderFullName"],
			ReceiveKudoType : ["SenderFullName", "ObjName"],
			ReceivedKudo : ["SenderFullName", "ObjName"],
			ReceiveKudo : ["SenderFullName", "ObjName"],
			RejectAddedAsAssistant : ["SenderFullName"],
			RejectAddedAsMgr : ["SenderFullName"],
			RejectAddedAsReport : ["SenderFullName"],
			ReplyInFeed : ["SenderFullName"],
			RemovedAsAssistant : ["SenderFullName"],
			RemovedAsMgr : ["SenderFullName"],
			RemovedAsReport : ["SenderFullName"],
			RejectPendingContent : ["ObjName"],
			RequestToBeGroupAdmin : ["SenderFullName"],
			SkillNudge : ["SenderFullName"],
			SubscribedToFeed : ["SenderFullName"],
			SuggestTopic : ["SenderFullName", "ObjName"],
			send_nudge : ["custom_brand_name"],
			TaskAssigned : ["SenderFullName"],
			TaskNudge : ["SenderFullName"],
			user_new_features : ["custom_brand_name"]
		},

		/**
		 * Gets the notification type text for a given notification
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {string} sJamUrl A string containing the URL of the Collaboration Tool (Jam)
		 * @private
		 */
		getRequiredNotificationPropertyNames : function(sNotificationType) {
			return this.map[sNotificationType] ? this.map[sNotificationType] : [];
		}

	});

	return NotificationTypeUtil;

});
