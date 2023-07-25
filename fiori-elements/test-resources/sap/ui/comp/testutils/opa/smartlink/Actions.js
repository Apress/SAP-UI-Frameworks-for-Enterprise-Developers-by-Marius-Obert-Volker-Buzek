/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
    "./waitForLink",
    "./waitForNavigationPopover",
    "./waitForP13nDialog",
    "../actions/CloseNavigationPopover",
    "./Util"
], function(
	Opa5,
	Matcher,
	Properties,
	Ancestor,
	Descendant,
	PropertyStrictEquals,
	Press,
    waitForLink,
    waitForNavigationPopover,
    waitForP13nDialog,
    CloseNavigationPopover,
    Util
) {
	"use strict";

    var iPressOnMoreLinksButton = function(oSettings) {
        var aMatchers = oSettings.matchers ? oSettings.matchers : [];
        aMatchers.push(new PropertyStrictEquals({
            name: "text",
            value: Util.texts.moreLinks
        }));

        return this.waitFor({
            controlType: "sap.m.Button",
            matchers: aMatchers,
            actions: new Press(),
            success: function(aButtons) {
                Opa5.assert.ok(aButtons.length, "Button with text '" + Util.texts.moreLinks + "' found and pressed");
                if (oSettings.success) {
                    oSettings.success.call(this, aButtons[0]);
                }
            },
            errorMessage: "Button with text '" + Util.texts.moreLinks + "' not found"
        });
    };

    var iPressAButtonOnTheDialog = function(oDialog, sButtonText, oSettings) {
		return this.waitFor({
			searchOpenDialogs: true,
			controlType: "sap.m.Button",
			matchers: [
				new PropertyStrictEquals({
					name: "text",
					value: sButtonText
				}),
				new Ancestor(oDialog, false)
			],
			actions: new Press(),
			success: function() {
				if (oSettings && typeof oSettings.success === "function") {
					oSettings.success.call(this);
				}
			},
			errorMessage: "Could not find the '" + sButtonText + "' button"
		});
	};

    var iPressTheOKButtonOnTheDialog = function(oDialog, oSettings) {
		return iPressAButtonOnTheDialog.call(this, oDialog, Util.texts.ok, oSettings);
	};

    var iPressTheResetButtonOnTheDialog = function(oDialog, oSettings) {
		return iPressAButtonOnTheDialog.call(this, oDialog, Util.texts.reset, oSettings);
	};

    var waitForTheWarningDialog = function(oSettings) {
		return this.waitFor({
			controlType: "sap.m.Dialog",
			matchers: new PropertyStrictEquals({
				name: "title",
				value: Util.texts.resetwarning
			}),
			success: function(aDialogs) {
				Opa5.assert.equal(aDialogs.length, 1, "warning dialog found");
				if (oSettings && typeof oSettings.success === "function") {
					oSettings.success.call(this, aDialogs[0]);
				}
			}
		});
	};

    return {
        iPersonalizeTheLinks: function(oLinkIdentifier, aLinks) {
            return waitForLink.call(this, oLinkIdentifier, {
                actions: new Press(),
                success: function(oLinkControl) {
                    waitForNavigationPopover.call(this, {
                        matchers: new Ancestor(oLinkIdentifier.objectIdentifier ? oLinkControl.getParent() : oLinkControl),
                        success: function(oNavigationPopover) {
                            iPressOnMoreLinksButton.call(this, {
                                matchers: [
                                    new Ancestor(oNavigationPopover, false)
                                ],
                                success: function() {
                                    waitForP13nDialog.call(this, {
                                        success: function(oP13nDialog) {
                                            this.waitFor({
                                                controlType: "sap.m.ColumnListItem",
                                                matchers: new Ancestor(oP13nDialog, false),
                                                actions: function(oColumnListItem) {
                                                    this.waitFor({
                                                        controlType: "sap.m.Link",
                                                        matchers: new Ancestor(oColumnListItem, false),
                                                        success: function(aLinkControls) {
                                                            var oLinkControl = aLinkControls[0];
                                                            this.waitFor({
                                                                controlType: "sap.m.CheckBox",
                                                                matchers: [
                                                                    new Ancestor(oColumnListItem, false)
                                                                ],
                                                                actions: function(oCheckBox) {
                                                                    if ((!oCheckBox.getSelected() && aLinks.includes(oLinkControl.getText())) ||
                                                                        (oCheckBox.getSelected() && !aLinks.includes(oLinkControl.getText()))) {
                                                                        new Press().executeOn(oCheckBox);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                }.bind(this),
                                                success: function() {
                                                    iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        iResetThePersonalization: function(oLinkIdentifier) {
            return waitForLink.call(this, oLinkIdentifier, {
                actions: new Press(),
                success: function(oLinkControl) {
                    waitForNavigationPopover.call(this, {
                        matchers: new Ancestor(oLinkIdentifier.objectIdentifier ? oLinkControl.getParent() : oLinkControl),
                        success: function(oNavigationPopover) {
                            iPressOnMoreLinksButton.call(this, {
                                matchers: [
                                    new Ancestor(oNavigationPopover, false)
                                ],
                                success: function() {
                                    waitForP13nDialog.call(this, {
                                        success: function(oP13nDialog) {
                                            iPressTheResetButtonOnTheDialog.call(this, oP13nDialog, {
                                                success: function() {
                                                    waitForTheWarningDialog.call(this, {
                                                        success: function(oWarningDialog) {
                                                            iPressTheOKButtonOnTheDialog.call(this, oWarningDialog, {
                                                                success: function() {
                                                                    iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        iPressTheLink: function(oLinkIdentifier) {
            return waitForLink.call(this, oLinkIdentifier, {
                actions: new Press()
            });
        },
        iPressLinkOnPopover: function(oLinkIdentifier, sLink) {
            return waitForLink.call(this, oLinkIdentifier, {
                success: function(oLink) {
                    waitForNavigationPopover.call(this, {
                        matchers: new Ancestor(oLinkIdentifier.objectIdentifier ? oLink.getParent() : oLink),
                        success: function(oNavigationPopover) {
                            this.waitFor({
                                controlType: "sap.m.Link",
                                matchers: [
                                    new Ancestor(oNavigationPopover, false),
                                    new PropertyStrictEquals({
                                        name: "text",
                                        value: sLink
                                    })
                                ],
                                actions: new Press(),
                                success: function(aLinks) {
                                    Opa5.assert.equal(aLinks.length, 1, "link on NavigationPopover found and pressed");
                                }
                            });
                        }
                    });
                }
            });
        },
        iCloseThePopover: function() {
            return this.waitFor({
				controlType: "sap.ui.comp.navpopover.NavigationPopover",
				actions: new CloseNavigationPopover()
			});
        }
    };
});