/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/PropertyStrictEquals",
    "./waitForLink",
    "./waitForNavigationPopover"
], function(
	Opa5,
	Ancestor,
	PropertyStrictEquals,
    waitForLink,
    waitForNavigationPopover
) {
	"use strict";

	return {
        /**
        * Opa5 test action
        * @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.comp.navpopover.SmartLink</code> which opens the popover
        * @returns {Promise} OPA waitFor
        * Assumes that there is an open popover for a given <code>sap.ui.comp.navpopover.SmartLink</code>.
        */
        iShouldSeeAPopover: function(oLinkIdentifier) {
            return waitForLink.call(this, oLinkIdentifier, {
                success: function(oLink) {
                    waitForNavigationPopover.call(this, {
                        matchers: new Ancestor(oLinkIdentifier.objectIdentifier ? oLink.getParent() : oLink)
                    });
                }
            });
        },
        /**
         * Opa5 test action
         * @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.comp.navpopover.SmartLink</code> which opens the popover
         * @param {string[]} aLinks array containing the texts of the links that should be visible on the popover
         * @returns {Promise} OPA waitFor
         * Assumes that there is an open popover for a given <code>sap.ui.comp.navpopover.SmartLink</code> and checks that all given links defined in <code>aLinks</code> are on that popover in defined order.
         */
        iShouldSeeLinksOnPopover: function(oLinkIdentifier, aLinks) {
            var aVisibleAvailableActions;
            return waitForLink.call(this, oLinkIdentifier, {
                success: function(oLink) {
                    waitForNavigationPopover.call(this, {
                        matchers: new Ancestor(oLinkIdentifier.objectIdentifier ? oLink.getParent() : oLink),
                        success: function(oNavigationPopover) {
                            this.waitFor({
                                controlType: "sap.ui.comp.navpopover.NavigationContainer",
                                matchers: new Ancestor(oNavigationPopover, false),
                                check: function(aNavigationContainers) {
                                    Opa5.assert.ok(aNavigationContainers.length === 1, "NavigationContainer found");
                                    var oNavigationContainer = aNavigationContainers[0];
                                    aVisibleAvailableActions = oNavigationContainer.getAvailableActions().filter(function(oAvailableAction) {
                                        return !!oAvailableAction.getVisible() && !!oAvailableAction.getHref();
                                    });
                                    Opa5.assert.equal(aVisibleAvailableActions.length, aLinks.length, "Amount of visible Links is as expected");
                                    return aVisibleAvailableActions.every(function(oAction, iIndex) {
                                        return oAction.getText() === aLinks[iIndex];
                                    });
                                },
                                error: function(oError) {
                                    var aVisibleAvailableActionTexts = [];
                                    aVisibleAvailableActionTexts = aVisibleAvailableActions.map(function(oVisibleAvailableAction) {
                                        return oVisibleAvailableAction.getText();
                                    });
                                    oError.errorMessage = "Links " + JSON.stringify(aLinks) + " not found in NavigationContainer " + JSON.stringify(aVisibleAvailableActionTexts) + " found instead.";
                                }
                            });
                        }
                    });
                }
            });
        },
		/**
		 * Checks if a {@link sap.ui.comp.navpopover.NavigationContainer} contains a {@link sap.ui.layout.form.SimpleForm} which represents a {@link sap.ui.comp.navpopover.ContactDetailsController}.
         * @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.comp.navpopover.SmartLink</code> which opens the popover
		 * @returns {object} An object extending a jQuery <code>Promise</code> - see {@link sap.ui.test.Opa5#waitFor}
		 */
		iShouldSeeContactInformationOnPopover: function(oLinkIdentifier) {
            return waitForLink.call(this, oLinkIdentifier, {
                success: function(oLink) {
                    waitForNavigationPopover.call(this, {
                        matchers: new Ancestor(oLinkIdentifier.objectIdentifier ? oLink.getParent() : oLink),
                        success: function(oNavigationPopover) {
                            this.waitFor({
                                controlType: "sap.ui.comp.navpopover.NavigationContainer",
                                matchers: new Ancestor(oNavigationPopover, false),
                                success: function(aNavigationContainers) {
                                    this.waitFor({
                                        controlType: "sap.ui.layout.form.SimpleForm",
                                        matchers: new Ancestor(aNavigationContainers[0], false),
                                        errorMessage: "No ContactInformation found in the NavigationContainer"
                                    });
                                },
                                errorMessage: "No NavigationContainer found"
                            });
                        }
                    });
                }
            });
		},
        /**
		 * Checks if a {@link sap.ui.comp.navpopover.NavigationContainer} contains a {@link sap.m.Text} as subtitle to the main navigation item.
         * @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.comp.navpopover.SmartLink</code> which opens the popover
		 * @param {string} sSubTitleText The text value of the subtitle
		 * @returns {object} An object extending a jQuery <code>Promise</code> - see {@link sap.ui.test.Opa5#waitFor}
		 */
		iShouldSeeASubTitleOnPopover: function(oLinkIdentifier, sSubTitleText) {
			return waitForLink.call(this, oLinkIdentifier, {
                success: function(oLink) {
                    waitForNavigationPopover.call(this, {
                        matchers: new Ancestor(oLinkIdentifier.objectIdentifier ? oLink.getParent() : oLink),
                        success: function(oNavigationPopover) {
                            this.waitFor({
                                controlType: "sap.ui.comp.navpopover.NavigationContainer",
                                matchers: new Ancestor(oNavigationPopover, false),
                                success: function(aNavigationContainers) {
                                    return this.waitFor({
                                        controlType: "sap.m.Text",
                                        matchers: [
                                            new Ancestor(aNavigationContainers[0], false),
                                            new PropertyStrictEquals({
                                                name: "text",
                                                value: sSubTitleText
                                            })
                                        ],
                                        errorMessage: "No text control found with given subtitle '" + sSubTitleText + "'"
                                    });
                                },
                                errorMessage: "No NavigationContainer found"
                            });
                        }
                    });
                }
			});
		}
	};
});
