/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

/**
 * Provides utility functions for the personalization dialog
 *
 * @author SAP SE
 * @version 1.113.0
 * @private
 * @since 1.25.0
 * @alias sap.ui.comp.personalization.Util
 */
sap.ui.define([
	'sap/ui/comp/library', './Factory', './LinkData', "sap/base/Log"
], function(CompLibrary, Factory, LinkData, Log) {
	"use strict";

	var Util = {

		/**
		 * Determines the contact annotation path based on the oControl and the oSemanticObjectController.
		 * @param {sap.ui.comp.navpopover.SmartLink | sap.ui.comp.navpopover.NavigationPopoverHandler} oControl SmartLink or NavigationPopoverHandler
		 * @param {sap.ui.comp.navpopover.SemanticObjectController} oSemanticObjectController  SemanticObjectController
		 * @returns {string} Contact annotation path
		 */
		getContactAnnotationPath: function(oControl, oSemanticObjectController) {
			// Priority rules: 1. own contact annotation path 2. contact annotation path of SemanticObjectController
			var sContactAssociationPath = oControl ? oControl.getContactAnnotationPath() : undefined;
			if (sContactAssociationPath === undefined && oSemanticObjectController && oSemanticObjectController.getContactAnnotationPaths() && oSemanticObjectController.getContactAnnotationPaths()[oControl.getFieldName()] !== undefined) {
				sContactAssociationPath = oSemanticObjectController.getContactAnnotationPaths()[oControl.getFieldName()];
			}
			return sContactAssociationPath;
		},

		/**
		 * Determines whether the <code>SmartLink</code> control is rendered as a link or not based on the oControl and the oSemanticObjectController.
		 * @param {sap.ui.comp.navpopover.SmartLink | sap.ui.comp.navpopover.NavigationPopoverHandler} oControl SmartLink or NavigationPopoverHandler
		 * @param {sap.ui.comp.navpopover.SemanticObjectController} oSemanticObjectController  SemanticObjectController
		 * @returns {boolean} <code>true</code> if the <code>SmartLink</code> control is rendered as a link
		 */
		getForceLinkRendering: function(oControl, oSemanticObjectController) {
			if (!oControl) {
				return undefined;
			}
			// Priority rules: 1. own forceLinkRendering 2. forceLinkRendering of SemanticObjectController
			return oControl.getForceLinkRendering() || !!(oSemanticObjectController && oSemanticObjectController.getForceLinkRendering() && oSemanticObjectController.getForceLinkRendering()[oControl.getFieldName()]);
		},

		/**
		 * Returns available actions with key.
		 *
		 * @param {Object[]} aMAvailableActions Available actions
		 * @returns {Object[]} Available actions containing key
		 */
		getStorableAvailableActions: function(aMAvailableActions) {
			return aMAvailableActions ? aMAvailableActions.filter(function(oMAvailableAction) {
				return oMAvailableAction && oMAvailableAction.key !== undefined;
			}) : [];
		},

		/**
		 * Sort the string array in alphabetical order.
		 *
		 * @param {string[]} aNames String array
		 */
		sortArrayAlphabetical: function(aNames) {
			var sLanguage;
			try {
				sLanguage = sap.ui.getCore().getConfiguration().getLocale().toString();
				if (typeof window.Intl !== 'undefined') {
					var oCollator = window.Intl.Collator(sLanguage, {
						numeric: true
					});
					aNames.sort(function(a, b) {
						return oCollator.compare(a, b);
					});
				} else {
					aNames.sort(function(a, b) {
						return a.localeCompare(b, sLanguage, {
							numeric: true
						});
					});
				}
			} catch (oException) {
				// this exception can happen if the configured language is not convertible to BCP47 -> getLocale will deliver an exception
			}
		},

		/**
		 * Reads navigation targets using CrossApplicationNavigation of the unified shell service.
		 *
		 * @param {string} sSemanticObjectDefault Default semantic object name
		 * @param {string[]} aAdditionalSemanticObjects String array of additional semantic objects
		 * @param {string} sAppStateKey Application state key
		 * @param {sap.ui.core.Component} oComponent Component
		 * @param {object} oSemanticAttributes Semantic attributes
		 * @param {string} sMainNavigationId Main navigation id
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution
		 */
		retrieveNavigationTargets: function(sSemanticObjectDefault, aAdditionalSemanticObjects, sAppStateKey, oComponent, oSemanticAttributes, sMainNavigationId, sPropertyName, oODataModel, sBindingPath, oLog) {
			var oNavigationTargets = {
				mainNavigation: undefined,
				ownNavigation: undefined,
				availableActions: []
			};

			var oXApplNavigation = Factory.getService("CrossApplicationNavigation");
			var oURLParsing = Factory.getService("URLParsing");
			if (!oXApplNavigation || !oURLParsing) {
				Log.error("Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
				return Promise.resolve(oNavigationTargets);
			}
			var aSemanticObjects = [
				sSemanticObjectDefault
			].concat(aAdditionalSemanticObjects);
			var aParams = aSemanticObjects.map(function(sSemanticObject) {
				return [
					{
						semanticObject: sSemanticObject,
						params: oSemanticAttributes ? oSemanticAttributes[sSemanticObject] : undefined,
						appStateKey: sAppStateKey,
						ui5Component: oComponent,
						sortResultsBy: "text" // since 1.50
					}
				];
			});

			var aFlpLinks;
			return new Promise(function(resolve) {
				// We have to wrap getLinks method into Promise. The returned jQuery.Deferred.promise brakes the Promise chain.
				oXApplNavigation.getLinks(aParams).then(function(aLinks) {
					return resolve(aLinks);
				});
			}).then(function(aLinks) {
				aFlpLinks = aLinks;

				return (aFlpLinks && aFlpLinks.length) ? this.retrieveSemanticObjectUnavailableActions(sPropertyName, oODataModel, sBindingPath) : Promise.resolve({});
			}.bind(this)).then(function(oUnavailableActions) {
				if (!aFlpLinks || !aFlpLinks.length) {
					return Promise.resolve(oNavigationTargets);
				}

				var sCurrentHash = oXApplNavigation.hrefForExternal();
				if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
					// sCurrentHash can contain query string, cut it off!
					sCurrentHash = sCurrentHash.split("?")[0];
				}
				if (sCurrentHash) {
					// BCP 1770315035: we have to set the end-point '?' of action in order to avoid matching of "#SalesOrder-manage" in "#SalesOrder-manageFulfillment"
					sCurrentHash += "?";
				}

				var fnIsUnavailableAction = function(sSemanticObject, sAction) {
					return !!oUnavailableActions && !!oUnavailableActions[sSemanticObject] && oUnavailableActions[sSemanticObject].indexOf(sAction) > -1;
				};
				aFlpLinks[0][0].forEach(function(oLink) {
					var oShellHash = oURLParsing.parseShellHash(oLink.intent);
					var sKey = (oShellHash.semanticObject && oShellHash.action) ? oShellHash.semanticObject + "-" + oShellHash.action : undefined;
					var isSuperiorAction = (oLink.tags && oLink.tags.indexOf("superiorAction") > -1);
					// var sDescription;
					// if (oLink.subTitle && !oLink.shortTitle) {
					//     sDescription = oLink.subTitle;
					// } else if (!oLink.subTitle && oLink.shortTitle) {
					//     sDescription = oLink.shortTitle;
					// } else if (oLink.subTitle && oLink.shortTitle) {
					//     sDescription = oLink.subTitle + " - " + oLink.shortTitle;
					// }

					if (oLink.intent.indexOf(sCurrentHash) === 0) {
						// Prevent current app from being listed
						// NOTE: If the navigation target exists in
						// multiple contexts (~XXXX in hash) they will all be skipped
						// Moved the text property out of the LinkData creation
						var oOwnNavigation = new LinkData({
							key: sKey,
							href: oLink.intent,
							visible: true,
							isSuperiorAction: isSuperiorAction
							// ,
							// description: sDescription
						});
						oOwnNavigation.setText(oLink.text);
						oNavigationTargets.ownNavigation = oOwnNavigation;
						return;
					}

					// Check if a FactSheet exists for this SemanticObject (to skip the first one found)
					if (oShellHash.action && oShellHash.action === 'displayFactSheet' && !fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
						// Prevent FactSheet from being listed in 'Related Apps' section. Requirement: Link with action 'displayFactSheet' should
						// be shown in the 'Main Link' Section
						oNavigationTargets.mainNavigation = new LinkData({
							key: sKey,
							href: oLink.intent,
							text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_FACTSHEET"),
							visible: true,
							isSuperiorAction: isSuperiorAction
							// ,
							// description: sDescription
						});

						if (oLog) {
							oLog.addSemanticObjectIntent(oShellHash.semanticObject, {
								text: oLink.text,
								intent: oLink.intent
							});
						}
						return;
					}
					if (!fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
						// Moved the text property out of the LinkData creation
						var oAvailableAction = new LinkData({
							key: sKey,
							href: oLink.intent,
							visible: true,
							isSuperiorAction: isSuperiorAction
							// ,
							// description: sDescription
						});
						oAvailableAction.setText(oLink.text);
						oNavigationTargets.availableActions.push(oAvailableAction);

						if (oLog) {
							oLog.addSemanticObjectIntent(oShellHash.semanticObject, {
								text: oLink.text,
								intent: oLink.intent
							});
						}
					}
				});

				// Main navigation could not be resolved, so only set link text as MainNavigation
				// Moved the text property out of the LinkData creation
				if (!oNavigationTargets.mainNavigation && typeof sMainNavigationId === "string") {
					var oMainNavigation = new LinkData({
						visible: true
					});
					oMainNavigation.setText(sMainNavigationId);
					oNavigationTargets.mainNavigation = oMainNavigation;
				}

				// Collect links of additional SemanticObjects
				var aAvailableIntents = [];
				for (var i = 1; i < aSemanticObjects.length; i++) {
					aAvailableIntents = aAvailableIntents.concat(aFlpLinks[i][0]);
				}
				aAvailableIntents.forEach(function(oLink) {
					var oShellHash = oURLParsing.parseShellHash(oLink.intent);
					if (fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
						return;
					}
					var isSuperiorAction = (oLink.tags && oLink.tags.indexOf("superiorAction") > -1);
					// var sDescription = oLink.subTitle;
					// if (!sDescription) {
					//     sDescription = oLink.shortTitle;
					// } else {
					//     sDescription = sDescription + " - " + oLink.shortTitle;
					// }

					// Moved the text property out of the LinkData creation
					var oAvailableAction = new LinkData({
						key: (oShellHash.semanticObject && oShellHash.action) ? oShellHash.semanticObject + "-" + oShellHash.action : undefined,
						href: oLink.intent,
						visible: true,
						isSuperiorAction: isSuperiorAction
						// ,
						// description: sDescription
					});
					oAvailableAction.setText(oLink.text);
					oNavigationTargets.availableActions.push(oAvailableAction);

					if (oLog) {
						oLog.addSemanticObjectIntent(oShellHash.semanticObject, {
							text: oLink.text,
							intent: oLink.intent
						});
					}
				});

				return Promise.resolve(oNavigationTargets);
			});
		},

		/**
		 * Retrieves SemanticObjectMapping annotation.
		 *
		 * @param {string} sPropertyName Name of property
		 * @param {sap.ui.model.odata.ODataModel} oODataModel OData model
		 * @param {string} sBindingPath Qualified name with namespace of current EntityType
		 * @returns {object|null} SemanticObjectMapping  annotation
		 * @private
		 */
		retrieveSemanticObjectMapping: function(sPropertyName, oODataModel, sBindingPath) {
			return this._getEntityTypeAnnotationOfProperty(sPropertyName, oODataModel, sBindingPath).then(function(aProperties) {
				if (!aProperties) {
					return Promise.resolve(null);
				}
				if (!aProperties[0]["com.sap.vocabularies.Common.v1.SemanticObjectMapping"]) {
					return Promise.resolve(null);
				}
				var oSemanticObjectQualifiers = this._getSemanticObjectMappingsOfProperty(aProperties[0], this._getSemanticObjectsOfProperty(aProperties[0], oODataModel, sBindingPath));
				var oSemanticObjects = {};
				for ( var sQualifier in oSemanticObjectQualifiers) {
					oSemanticObjects[oSemanticObjectQualifiers[sQualifier].name] = oSemanticObjectQualifiers[sQualifier].mapping;
				}

				return Promise.resolve(oSemanticObjects);
			}.bind(this));
		},

		retrieveSemanticObjectUnavailableActions: function(sPropertyName, oODataModel, sBindingPath) {
			return this._getEntityTypeAnnotationOfProperty(sPropertyName, oODataModel, sBindingPath).then(function(aProperties) {
				if (!aProperties) {
					return Promise.resolve(null);
				}
				if (!aProperties[0]["com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"]) {
					return Promise.resolve(null);
				}
				var oSemanticObjectQualifiers = this._getSemanticObjectUnavailableActionsOfProperty(aProperties[0], this._getSemanticObjectsOfProperty(aProperties[0], oODataModel, sBindingPath));
				var oSemanticObjects = {};
				for ( var sQualifier in oSemanticObjectQualifiers) {
					oSemanticObjects[oSemanticObjectQualifiers[sQualifier].name] = oSemanticObjectQualifiers[sQualifier].unavailableActions;
				}
				return Promise.resolve(oSemanticObjects);
			}.bind(this));
		},

		oNavigationPromise: undefined,
		navigate: function(sHref) {
			if (sHref.indexOf("#") === 0 && sap.ushell && sap.ushell.Container && sap.ushell.Container.getServiceAsync) {
				// if we are inside a FLP -> navigate with CrossApplicationNavigation
				var that = this;
				if (!that.oNavigationPromise) {
					that.oNavigationPromise = sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossApplicationNavigation) {
						oCrossApplicationNavigation.toExternal({
							target: {
								// navigate to href without #
								shellHash: sHref.substring(1)
							}
						});
						that.oNavigationPromise = undefined;
					});
				}
			} else {
				// if we are not inside a FLP -> navigate "normally"
				window.location.href = sHref;
			}
		},

		_getEntityTypeAnnotationOfProperty: function(sPropertyName, oODataModel, sBindingPath) {
			if (!sPropertyName) {
				return Promise.resolve(null);
			}
			// ODataModel returns MetaModel, JSONModel returns undefined
			if (!oODataModel || !oODataModel.getMetaModel()) {
				return Promise.resolve(null);
			}
			var oMetaModel = oODataModel.getMetaModel();
			return oMetaModel.loaded().then(function() {
				var oMetaContext;

				try {
					oMetaContext = oMetaModel.getMetaContext(sBindingPath);
				} catch (oError) {
					Log.error("sap.ui.comp.navpopover.Util._getEntityTypeAnnotationOfProperty: binding path '" + sBindingPath + "' is not valid. Error has been caught: " + oError);
					return Promise.resolve(null);
				}
				if (!oMetaContext) {
					return Promise.resolve(null);
				}
				var oEntityType = oMetaContext.getProperty(oMetaContext.getPath());
				if (!oEntityType.property) {
					return Promise.resolve(null);
				}
				var aProperties = oEntityType.property.filter(function(oProperty) {
					return oProperty.name === sPropertyName;
				});
				if (aProperties.length !== 1) {
					return Promise.resolve(null);
				}
				return Promise.resolve(aProperties);
			});
		},
		_getSemanticObjectsOfProperty: function(oProperty, oODataModel, sBindingPath) {
			var oSemanticObjects = {};
			for ( var sAttr in oProperty) {
				var sAnnotationName = sAttr.split("#")[0];
				var sQualifierName = sAttr.split("#")[1] || ""; // as of specification the qualifier MUST have at least one character
				if (sAnnotationName.startsWith("com.sap.vocabularies.Common.v1.SemanticObject") && sAnnotationName.endsWith("com.sap.vocabularies.Common.v1.SemanticObject")) {
					oSemanticObjects[sQualifierName] = {
						name: oProperty[sAttr]["Path"] ? oODataModel.getProperty(sBindingPath + "/" +  oProperty[sAttr]["Path"]) : oProperty[sAttr]["String"],
						mapping: undefined
					};
				}
			}
			return oSemanticObjects;
		},

		_getSemanticObjectMappingsOfProperty: function(oProperty, oSemanticObjects) {
			var fGetMapping = function(oSemanticObjectMappingAnnotation) {
				var oMapping = {};
				if (Array.isArray(oSemanticObjectMappingAnnotation)) {
					oSemanticObjectMappingAnnotation.forEach(function(oPair) {
						oMapping[oPair.LocalProperty.PropertyPath] = oPair.SemanticObjectProperty.String;
					});
				}
				return oMapping;
			};
			for ( var sAttr in oProperty) {
				var sAnnotationName = sAttr.split("#")[0];
				var sQualifierName = sAttr.split("#")[1] || ""; // as of specification the qualifier MUST have at least one character
				if (sAnnotationName.startsWith("com.sap.vocabularies.Common.v1.SemanticObjectMapping") && sAnnotationName.endsWith("com.sap.vocabularies.Common.v1.SemanticObjectMapping")) {
					if (oSemanticObjects[sQualifierName]) {
						oSemanticObjects[sQualifierName].mapping = fGetMapping(oProperty[sAttr]);
					}
				}
			}
			return oSemanticObjects;
		},
		_getSemanticObjectUnavailableActionsOfProperty: function(oProperty, oSemanticObjects) {
			var fGetUnavailableActions = function(aSemanticObjectUnavailableActions) {
				var aUnavailableActions = [];
				if (Array.isArray(aSemanticObjectUnavailableActions)) {
					aSemanticObjectUnavailableActions.forEach(function(oAction) {
						aUnavailableActions.push(oAction.String);
					});
				}
				return aUnavailableActions;
			};
			for ( var sAttr in oProperty) {
				var sAnnotationName = sAttr.split("#")[0];
				var sQualifierName = sAttr.split("#")[1] || ""; // as of specification the qualifier MUST have at least one character
				if (sAnnotationName.startsWith("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") && sAnnotationName.endsWith("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions")) {
					if (oSemanticObjects[sQualifierName]) {
						oSemanticObjects[sQualifierName].unavailableActions = fGetUnavailableActions(oProperty[sAttr]);
					}
				}
			}
			return oSemanticObjects;
		}
	};

	return Util;
}, /* bExport= */true);

