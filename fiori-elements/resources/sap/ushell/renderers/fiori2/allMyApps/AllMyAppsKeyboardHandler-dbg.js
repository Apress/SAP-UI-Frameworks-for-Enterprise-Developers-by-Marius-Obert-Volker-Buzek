// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/events/KeyCodes",
    "sap/ui/thirdparty/jquery"
], function (KeyCodes, jQuery) {
    "use strict";

    var KeyboardNavigation = function () { };

    KeyboardNavigation.prototype.init = function (oView) {
        oView.byId("sapUshellAllMyAppsDataSourcesList").addEventDelegate({
            // on tab next (Tab)
            onsaptabnext: function (e) {
                var aDetailAppsElements = jQuery(".sapUshellAllMyAppsListItem");

                this.jqDetailAreaElement = oView.byId("oItemsContainerlist").$();
                this.jqDetailAreaElement.on("keydown.keyboardNavigation", this.keydownHandler.bind(this));

                // Focus the first App in the Detail Area.
                this._setItemFocus(e, aDetailAppsElements[0]);
            }.bind(this)
        });
        oView.byId("oItemsContainerlist").addEventDelegate({
            onsaptabprevious: function (/*e*/) {
                var oCurrentlyFocusedAppElement = jQuery(".sapUshellAllMyAppsListItem[tabindex=\"0\"]")[0];

                jQuery(oCurrentlyFocusedAppElement).attr("tabindex", -1);
            },
            onsaptabnext: function (/*e*/) {
                var aCustomPanel = jQuery(".sapUshellAllMyAppsCustomPanel"),
                    oCurrentlyFocusedAppElement = jQuery(".sapUshellAllMyAppsListItem[tabindex=\"0\"]")[0];

                // Since the is no custom panel, there is no need to "remember" the last selected item
                if (aCustomPanel.length === 0) {
                    jQuery(oCurrentlyFocusedAppElement).attr("tabindex", -1);
                }
            }
        });
        // Clicking SHIFT+TAB from the custom panel should return the focus to the last selected item/app.
        // Clicking TAB should move the focus to the master list and "forget" the last selected item/app
        oView.byId("sapUshellAllMyAppsCustomPanel").addEventDelegate({
            onsaptabnext: function (e) {
                var oCurrentlyFocusedAppElement = jQuery(".sapUshellAllMyAppsListItem[tabindex=\"0\"]")[0];
                jQuery(oCurrentlyFocusedAppElement).attr("tabindex", -1);
            }
        });
    };

    KeyboardNavigation.prototype.keydownHandler = function (e) {
        switch (e.keyCode) {
            case KeyCodes.ARROW_UP:
                this.arrowKeyHandler(e, -2);
                break;
            case KeyCodes.ARROW_DOWN:
                this.arrowKeyHandler(e, 2);
                break;
            case KeyCodes.ARROW_LEFT:
                this.arrowKeyHandler(e, -1);
                break;
            case KeyCodes.ARROW_RIGHT:
                this.arrowKeyHandler(e, 1);
                break;
            default:
                break;
        }
    };

    KeyboardNavigation.prototype.arrowKeyHandler = function (e, iDirectionFactor) {
        var aDetailAppsElements = jQuery(".sapUshellAllMyAppsListItem").toArray(),
            oCurrentlyFocusedAppElement = jQuery(".sapUshellAllMyAppsListItem[tabindex=\"0\"]")[0],
            iCurrentlyFocusedIndex = aDetailAppsElements.indexOf(oCurrentlyFocusedAppElement),
            oElementToFocus = aDetailAppsElements[iCurrentlyFocusedIndex + iDirectionFactor];

        if (oElementToFocus) {
            jQuery(oCurrentlyFocusedAppElement).attr("tabindex", -1);
            this._setItemFocus(e, oElementToFocus);
        }
    };

    KeyboardNavigation.prototype._setItemFocus = function (e, oElementToFocus) {
        if (oElementToFocus) {
            e.preventDefault();
            e.stopImmediatePropagation();
            jQuery(oElementToFocus).attr("tabindex", 0);
            oElementToFocus.focus();
        }
    };

    KeyboardNavigation.prototype.destroy = function () {
        if (this.jqDetailAreaElement) {
            this.jqDetailAreaElement.off(".keyboardNavigation");
        }
        delete this.jqDetailAreaElement;
    };

    return new KeyboardNavigation();
}, /* bExport= */ true);
