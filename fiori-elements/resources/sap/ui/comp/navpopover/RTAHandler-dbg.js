/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	'sap/ui/comp/library',
	'sap/ui/comp/personalization/Controller',
	'sap/ui/comp/personalization/Util',
	'./Util',
	'sap/ui/comp/navpopover/flexibility/changes/AddLink',
	'sap/ui/comp/navpopover/flexibility/changes/RemoveLink',
	'./Factory'
], function(
	CompLibrary,
	Controller,
	PersonalizationUtil,
	Util,
	AddLink,
	RemoveLink,
	Factory
) {
	"use strict";

	// shortcut for sap.ui.comp.navpopover.ChangeHandlerType
	var ChangeHandlerType = CompLibrary.navpopover.ChangeHandlerType;

	/**
	 * Key user adaptation handler (formerly known as "Runtime Adaptation").
	 *
	 * @constructor
	 * @private
	 * @since 1.44.0
	 * @alias sap.ui.comp.navpopover.RTAHandler
	 */
	var RTAHandler = {};

	RTAHandler.isSettingsAvailable = function() {
		return !!Factory.getService("CrossApplicationNavigation");
	};

	RTAHandler.getStableElements = function(oNavigationPopoverHandler) {
		if (!oNavigationPopoverHandler || !(oNavigationPopoverHandler.isA("sap.ui.comp.navpopover.NavigationPopoverHandler"))) {
			return null;
		}
		var sStableID = oNavigationPopoverHandler.getNavigationPopoverStableId();
		if (!sStableID) {
			return null;
		}
		var oAppComponent = oNavigationPopoverHandler.getAppComponent();
		if (!oAppComponent) {
			return null;
		}
		return [
			{
				id: sStableID,
				appComponent: oAppComponent
			}
		];
	};

	RTAHandler.execute = function(oNavigationPopoverHandler, fGetUnsavedChanges, sRtaStyleClass) {
		return new Promise(function(resolve, reject) {
			if (!oNavigationPopoverHandler || !(oNavigationPopoverHandler.isA("sap.ui.comp.navpopover.NavigationPopoverHandler"))) {
				reject(new Error("oNavigationPopoverHandler is not of supported type sap.ui.comp.navpopover.NavigationPopoverHandler"));
				return;
			}
			if (!oNavigationPopoverHandler.getNavigationPopoverStableId()) {
				reject(new Error("StableId is not defined. SemanticObject=" + oNavigationPopoverHandler.getSemanticObject()));
				return;
			}
			var oAppComponent = oNavigationPopoverHandler.getAppComponent();
			if (!oAppComponent) {
				reject(new Error("AppComponent is not defined. oControl=" + oNavigationPopoverHandler.getControl()));
				return;
			}

			oNavigationPopoverHandler._getNavigationContainer().then(function(oNavigationContainer) {
				var aMAddedLinks = [];
				var aMRemovedLinks = [];

				var fCallbackAfterClose = function(aChanges) {
					var sStableId = oNavigationContainer.getId();
					aMAddedLinks = aChanges.filter(function(oMLink) {
						return oMLink.visible === true;
					}).map(function(oMLink) {
						return {
							selectorControl: {
								id: sStableId,
								controlType: "sap.ui.comp.navpopover.NavigationContainer",
								appComponent: oAppComponent
							},
							changeSpecificData: {
								changeType: ChangeHandlerType.addLink,
								content: oMLink
							}
						};
					});
					aMRemovedLinks = aChanges.filter(function(oMLink) {
						return oMLink.visible === false;
					}).map(function(oMLink) {
						return {
							selectorControl: {
								id: sStableId,
								controlType: "sap.ui.comp.navpopover.NavigationContainer",
								appComponent: oAppComponent
							},
							changeSpecificData: {
								changeType: ChangeHandlerType.removeLink,
								content: oMLink
							}
						};
					});

					resolve(aMAddedLinks.concat(aMRemovedLinks));
				};

				oNavigationContainer.openSelectionDialog(true, false, fCallbackAfterClose, false, sRtaStyleClass, undefined).then(function() {
					oNavigationContainer.destroy();
				});
			});
		});
	};

	return RTAHandler;
},
/* bExport= */true);
