sap.ui.define([
	"sap/base/Log",
	"./BaseHelperService",
	"./TeamsHelperService",
	"../windowmessages/CollaborationMessageBroker"
], function (Log, BaseHelperService, TeamsHelperService, CollaborationMessageBroker) {
	"use strict";

	var oLogger = Log.getLogger("sap.suite.ui.commons.collaboration.ServiceContainer");
	var oProviderConfiguration;
	var oServicePromise; // Promise object which will be returned by getServiceAsync method

	function fnGetCollaborationType() {
		var oHelperService;
		if (oProviderConfiguration) {
			var sProvider = oProviderConfiguration.sProvider;
			var oProviderConfig = oProviderConfiguration.oProviderConfig;
			if (sProvider === "COLLABORATION_MSTEAMS") {
				oHelperService = new TeamsHelperService(oProviderConfig);
				oServicePromise = Promise.resolve(oHelperService);
				return oServicePromise;
			}
		}
		oHelperService = new BaseHelperService({});
		oLogger.info("Collaboration provider is not activated on the tenant");
		return Promise.resolve(oHelperService);
	}

	// Private constructor so that no one could create an instance of the class
	function ServiceContainer() {}

	/**
	 * Service container to get the collaboration type.
	 * @namespace
	 * @since 1.108
	 * @public
	 */
	sap.suite.ui.commons.collaboration.ServiceContainer = new ServiceContainer();

	/**
	 * 	Method that returns the collaboration service object as 'active' on the system.
	 *	Microsoft Teams is supported as a collaboration option and must be enabled using the communication service SAP_COM_0860.
	 *	The type definition and class are only available internally and are not intended for external consumers.
	 *	@returns {Promise<sap.suite.ui.commons.collaboration.BaseHelperService>} Returns the promise that is resolved to the instance of the collaboration service.
	 * 	@public
	 */
	sap.suite.ui.commons.collaboration.ServiceContainer.getServiceAsync = function () {
		if (oServicePromise) {
			return oServicePromise;
		}

		return fnGetCollaborationType();
	};

	sap.suite.ui.commons.collaboration.ServiceContainer.setCollaborationType = function (sProvider, oProviderConfig) {
		oLogger.info("Collaboration properties are now configured");
		oProviderConfiguration = {
			sProvider: sProvider,
			oProviderConfig: oProviderConfig
		};

		CollaborationMessageBroker.startInstance(oProviderConfiguration);
	};

	return sap.suite.ui.commons.collaboration.ServiceContainer;
});
