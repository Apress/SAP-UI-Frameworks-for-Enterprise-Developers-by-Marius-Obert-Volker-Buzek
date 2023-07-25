// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * Provides control sap.ushell.ui.shell.ShellAppTitle
 *
 * This control is responsible to display the Shell Header Title.
 * This control could be rendered in two different states:
 * 1. Title only: only the title will be rendered inside the Shell Header
 * 2. Title with popover button: A button will be placed in the Shell Header Title area.
 *    When the user clicks on the button, a popover will raise and render the innerControl as its content.
 *
 *    innerControl: the content of the popover. Will be destroyed by the ShellAppTitle control.
 */
sap.ui.define([
    "sap/ushell/library",
    "sap/m/Bar",
    "sap/m/Button",
    "sap/m/Title",
    "sap/m/library",
    "sap/m/Popover",
    "sap/m/ResponsivePopover",
    "sap/m/ToggleButton",
    "sap/ui/core/Core",
    "sap/ui/core/IconPool",
    "sap/ui/Device",
    "sap/ushell/Config",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ushell/resources",
    "sap/ui/performance/Measurement",
    "sap/ushell/services/AllMyApps"
], function (
    library,
    Bar,
    Button,
    Title,
    mLibrary,
    Popover,
    ResponsivePopover,
    ToggleButton,
    Core,
    IconPool,
    Device,
    Config,
    AccessibilityCustomData,
    oResources,
    Measurement
) {
    "use strict";

    var AppTitleState = library.AppTitleState;
    var AllMyAppsState = library.AllMyAppsState;
    var PlacementType = mLibrary.PlacementType;

    var ShellAppTitle = Button.extend("sap.ushell.ui.shell.ShellAppTitle", {
        metadata: {
            library: "sap.ushell",
            associations: {
                navigationMenu: {
                    type: "sap.ushell.ui.shell.ShellNavigationMenu"
                },
                allMyApps: {
                    type: "sap.ui.core.mvc.View"
                }
            },
            events: {
                /**
                 * @deprecated since 1.68. The event is never fired.
                 */
                textChanged: { deprecated: true }
            }
        },

        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                // Calculate visibility of the ShellAppTitle control and the state of the ShallNavMenu/AllMyAps UIs
                var bShellAppTitleIsVisible = oControl._getControlVisibilityAndState(),
                    sText = oControl.getText(),
                    oModel = oControl.getModel();


                oRm.openStart("h1", oControl);
                oRm.class("sapUshellHeadTitle");
                if (bShellAppTitleIsVisible || Device.system.phone) {
                    oRm.class("sapUshellAppTitleClickable");
                }
                oRm.attr("aria-level", "1");
                oRm.openEnd(); // span - tag

                oRm.openStart("div", oControl.getId() + "-button");
                oRm.class("sapUshellAppTitle");
                if (bShellAppTitleIsVisible || Device.system.phone) {
                    oRm.attr("tabindex", "0");
                }

                if (oControl.getTooltip_AsString()) {
                    oRm.attr("title", oControl.getTooltip_AsString());
                }

                if (bShellAppTitleIsVisible) {
                    oRm.attr("role", "button");
                    oRm.attr("aria-haspopup", "dialog");
                    if (oModel && ShellAppTitle._getCurrentState() === AppTitleState.AllMyAppsOnly) {
                        oRm.attr("aria-label", oResources.i18n.getText("ShowAllMyApps_AriaLabel", [sText]));
                    } else {
                        oRm.attr("aria-label", oResources.i18n.getText("ShellNavigationMenu_AriaLabel", [sText]));
                    }
                }
                oRm.openEnd(); // span - tag

                if (Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name !== "Phone") { // do not render title text on phones
                    oRm.openStart("span");
                    oRm.class("sapUshellAppTitleText");
                    oRm.openEnd();
                    oRm.text(sText || "");
                    oRm.close("span");
                }

                if (bShellAppTitleIsVisible && sText) { // Chevron Icon
                    oRm.openStart("span");
                    oRm.class("sapUshellShellHeadAction");
                    oRm.openEnd(); // span - tag
                    oRm.renderControl(oControl.oIcon);
                    oRm.close("span");
                }
                oRm.close("div");

                oRm.close("h1");
            }
        }
    });

    ShellAppTitle.prototype.init = function () {
        Button.prototype.init.apply(this, arguments);

        this.oIcon = IconPool.createControlByURI(IconPool.getIconURI("slim-arrow-down"));
        this.oIcon.addStyleClass("sapUshellAppTitleMenuIcon");

        // only for desktop
        if (Device.system.desktop) {
            // add acc support for open menu
            this.addEventDelegate({
                onkeydown: function (oEvent) {
                    // support for open the menu with Alt&Down arrow
                    if (oEvent.altKey && oEvent.keyCode === 40) {
                        this.onclick(oEvent);
                    }
                }.bind(this)
            });
        }
    };

    ShellAppTitle.prototype.getFocusDomRef = function () {
        return this.getDomRef("button");
    };

    /**
     * Retrieves the ShellAppTitleState configuration value.
     *
     * @returns {sap.ushell.AppTitleState} The current value as a member of sap.ushell.AppTitleState.
     * @static
     * @private
     */
    ShellAppTitle._getCurrentState = function () {
        return Config.last("/core/shellHeader/ShellAppTitleState");
    };

    /*
    * ShellAppTitle click handler:
    * 1. Calculating UI visibility and state
    * 2. Creating content popover
    */
    ShellAppTitle.prototype.onclick = function (oEvent) {
        oEvent.preventDefault();
        this.firePress();

        // it may be that the Title was clicked on (and not the icon which opens the menu)
        // we need to make sure the icon is displayed (e.g. rendered) - in case not we do not
        // open the menu
        if (!this._getControlVisibilityAndState()) {
            if (Device.system.phone) {
                window.hasher.setHash(Config.last("/core/shellHeader/rootIntent"));
            }
            return;
        }

        // The current state must be read from the configuration as it might not be saved to the model in some cases.
        // See BCP: 2070002470
        if (ShellAppTitle._getCurrentState() === AppTitleState.AllMyAppsOnly) {
            Measurement.start("FLP:ShellAppTitle.onClick", "Click ShellAppTitle in HOME state, Launching AllMyApps", "FLP");
            this._openCloseAllMyAppsPopover();
            return;
        }

        this._openCloseNavMenuPopover();
    };

    ShellAppTitle.prototype._openCloseAllMyAppsPopover = function () {
        // create a popover for the allMyApps menu
        if (!this.oAllMyAppsPopover) {
            this.oAllMyAppsPopover = this._createAllMyAppsPopover();
        }

        // might not be availabe, as AllMyApps might not be loaded yet
        if (this.oAllMyAppsPopover) {
            if (this.oAllMyAppsPopover.isOpen()) {
                this.oAllMyAppsPopover.close();
            } else {
                this.oAllMyAppsPopover.openBy(this);
            }
        }
    };

    ShellAppTitle.prototype._openCloseNavMenuPopover = function () {
        // create a popover for the navMenu
        if (!this.oNavMenuPopover) {
            this.oNavMenuPopover = this._createNavMenuPopover();
        }

        this.getModel().setProperty("/ShellAppTitleState", AppTitleState.ShellNavMenu);

        if (this.oNavMenuPopover.isOpen()) {
            this.oNavMenuPopover.close();
        } else {
            this.oNavMenuPopover.openBy(this);
        }

        if (this.oNavMenuPopover.getFooter()) {
            var sStateName = Config.last("/core/shell/model/currentState/stateName");
            // Popover footer should be visible only on SHELL_NAV_MENU state, while the shell is either in home or in app state
            this.oNavMenuPopover.getFooter().setVisible(sStateName === "home" || sStateName === "app");
        }
    };

    /**
     * Calculates the visibility of the shellAppTitle button and UI
     * (i.e. whether the the header title should be clickable or not)
     * and the state of the shellAppTitle UI (states defined by AppTitleState)
     *
     * @returns {boolean} true in case the header title should be clickable and false if not
     */
    ShellAppTitle.prototype._getControlVisibilityAndState = function () {
        Measurement.start(
            "FLP:ShellAppTitle.getControlVisibilityAndState",
            "Check AllMyApps and NavShellMenu visibility",
            "FLP"
        );

        var oModel = this.getModel(),
            sShellStateName = Config.last("/core/shell/model/currentState/stateName"),
            bNavMenuEnabled = this._isNavMenuEnabled(),
            bVisible = bNavMenuEnabled;

        if (!oModel) {
            return false;
        }

        if (sShellStateName === "app" || sShellStateName === "home") {
            var bAllMyAppsEnabled = Config.last("/core/services/allMyApps/enabled");

            // ShellAppTitle is visible if at least one of the options AllMyApps & NavMenu is enabled
            bVisible = bAllMyAppsEnabled || bNavMenuEnabled;

            // Calculate the state
            // Option 1: both AllMyApps && NavMenu are enabled
            if (bAllMyAppsEnabled && bNavMenuEnabled) {
                oModel.setProperty("/ShellAppTitleState", AppTitleState.ShellNavMenu);

                // Option 2: Only NavMenu is enabled
            } else if (!bAllMyAppsEnabled && bNavMenuEnabled) {
                oModel.setProperty("/ShellAppTitleState", AppTitleState.ShellNavMenuOnly);

                // Option 3: Only AllMyApps is enabled
            } else if (bAllMyAppsEnabled && !bNavMenuEnabled) {
                oModel.setProperty("/ShellAppTitleState", AppTitleState.AllMyAppsOnly);
            }
        } else {
            oModel.setProperty("/ShellAppTitleState", AppTitleState.ShellNavMenuOnly);
        }
        Measurement.end("FLP:ShellAppTitle.getControlVisibilityAndState");
        return bVisible;
    };

    /*******************************************************************************************************/
    /****************************************** Create Popover UI ******************************************/

    /*
    * Create and return the popover object that will contains the AllMyApps UI
    */
    ShellAppTitle.prototype._createAllMyAppsPopover = function () {
        var oAllMyApps = Core.byId(this.getAllMyApps());

        // do not open the all my apps popover if the data is not available yet
        if (!oAllMyApps) {
            return null;
        }

        var oAllMyAppsPopover = new ResponsivePopover("sapUshellAllMyAppsPopover", {
            placement: PlacementType.Bottom,
            title: "",
            showArrow: true,
            customHeader: this._getPopoverHeader(),
            verticalScrolling: false,
            showHeader: {
                path: "/ShellAppTitleState",
                formatter: function (oCurrentState) {
                    return oCurrentState !== AppTitleState.ShellNavMenu;
                }
            },
            content: [oAllMyApps],
            contentHeight: "28rem",
            contentWidth: "56rem"
        }).addStyleClass("sapContrastPlus");
        oAllMyAppsPopover.setModel(this.getModel());

        oAllMyAppsPopover.attachAfterOpen(function () {
            oAllMyApps.getController()._afterOpen();

            var oHeader = oAllMyAppsPopover.getCustomHeader(),
                oBackButton = oHeader.getContentLeft()[0],
                oToggleButton = oHeader.getContentLeft()[1];

            if (oToggleButton.getVisible()) {
                oToggleButton.firePress();
                oToggleButton.setPressed(true);
            }
            oBackButton.focus();
        });

        oAllMyAppsPopover.attachAfterClose(function () {
            this._bPressedSpace = false;
            if (!Device.system.phone && !(this.oNavMenuPopover && this.oNavMenuPopover.isOpen())) {
                this.focus();
            }
        }.bind(this));

        return oAllMyAppsPopover;
    };

    /*
    * Create and return the popover object that will contains the ShellNavMenu UI
    */
    ShellAppTitle.prototype._createNavMenuPopover = function () {
        var oNavMenu = Core.byId(this.getNavigationMenu());

        var oNavMenuPopover = new Popover("sapUshellAppTitlePopover", {
            placement: PlacementType.Bottom,
            title: "",
            showArrow: true,
            showHeader: {
                path: "/ShellAppTitleState",
                formatter: function (oCurrentState) {
                    return oCurrentState !== AppTitleState.ShellNavMenu;
                }
            },
            contentWidth: "20rem",
            content: oNavMenu
        }).addStyleClass("sapContrastPlus");

        if (Config.last("/core/services/allMyApps/enabled")) {
            oNavMenuPopover.setFooter(this._getPopoverFooterContent());
        }

        oNavMenuPopover.addStyleClass("sapUshellAppTitleNavigationMenuPopover");
        oNavMenuPopover.setModel(this.getModel());
        Config.emit("/core/shell/model/allMyAppsMasterLevel", AllMyAppsState.FirstLevel);

        // before popover open - call to before menu open
        oNavMenuPopover.attachBeforeOpen(function () {
            oNavMenu._beforeOpen();
        });

        // after popover open - fix scrolling for IOS and call to menu after open
        oNavMenuPopover.attachAfterOpen(function () {
            // fix for scrolling (By @Alexander Pashkov) on sap.m.Popover being override
            // in Mobile by UI5
            oNavMenu.$().on("touchmove.scrollFix", function (e) {
                e.stopPropagation();
            });

            // calls to afterOpen on the navigation menu itself in case some things needed to be made
            oNavMenu._afterOpen();
        });

        oNavMenuPopover.attachAfterClose(function () {
            this._bPressedSpace = false;
            if (!Device.system.phone && !(this.oAllMyAppsPopover && this.oAllMyAppsPopover.isOpen())) {
                this.focus();
            }
        }.bind(this));

        return oNavMenuPopover;
    };

    /*
    * Create and return the popover header, containing back button and toggle button
    */
    ShellAppTitle.prototype._getPopoverHeader = function () {
        var oAllMyAppsTitle = new Title({
            text: oResources.i18n.getText("allMyApps_headerTitle"),
            level: "H1"
        });

        var oPopoverHeader = new Bar("sapUshellShellAppPopoverHeader", {
            contentLeft: [
                this._createPopoverBackButton(),
                this._createPopoverToggleButton()
            ],
            contentMiddle: [oAllMyAppsTitle]
        });
        return oPopoverHeader;
    };

    ShellAppTitle.prototype.onAfterRendering = function () {
        var oShellHeader = Core.byId("shell-header");
        if (oShellHeader) {
            oShellHeader.refreshLayout();
        }
    };

    /*
    * Popover Back Button functionality:
    * 1. In case the Master area is in first level - switch to ShellNavMenu
    * 2. In case the Master area is in second level - return the Master area to the first level (call switchToInitialState)
    */
    ShellAppTitle.prototype._createPopoverBackButton = function () {
        var oBackButton = new Button("sapUshellAppTitleBackButton", {
            icon: IconPool.getIconURI("nav-back"),
            press: [this._popoverBackButtonPressHandler, this],
            tooltip: oResources.i18n.getText("backBtn_tooltip"),
            visible: this.getAllMyAppsController().getBackButtonVisible()
        });
        oBackButton.addStyleClass("sapUshellCatalogNewGroupBackButton");

        return oBackButton;
    };

    ShellAppTitle.prototype._popoverBackButtonPressHandler = function () {
        var oAllMyAppsController = this.getAllMyAppsController(),
            oAllMyAppsState = oAllMyAppsController.getCurrentState();

        // In case of clicking "back" when in FIRST_LEVEL - switch to ShellNavMenu
        if ((oAllMyAppsState === AllMyAppsState.FirstLevel) ||
            (oAllMyAppsState === AllMyAppsState.FirstLevelSpread)) {
            if (ShellAppTitle._getCurrentState() !== AppTitleState.AllMyAppsOnly) {
                this.getModel().setProperty("/ShellAppTitleState", AppTitleState.ShellNavMenu);

                //Open Nav Menu popover and close allMyAppsPopover
                this.oAllMyAppsPopover.close();
                this.oNavMenuPopover.openBy(this);
            }
        } else if (oAllMyAppsState === AllMyAppsState.SecondLevel) {
            oAllMyAppsController.switchToInitialState();
        } else {
            oAllMyAppsController.handleSwitchToMasterAreaOnPhone();
        }
        oAllMyAppsController.updateHeaderButtonsState();
    };

    /*
    * This button should be visible only on devices, and is used for toggling between the master and the details areas
    */
    ShellAppTitle.prototype._createPopoverToggleButton = function () {
        var oAllMyAppsController = this.getAllMyAppsController();

        var oToggleButton = new ToggleButton("sapUshellAllMyAppsToggleListButton", {
            icon: IconPool.getIconURI("sap-icon://menu2"),
            press: function (eEvent) {
                oAllMyAppsController.switchToInitialState();
                this.setTooltip(eEvent.getParameter("pressed") ?
                    oResources.i18n.getText("ToggleButtonHide") :
                    oResources.i18n.getText("ToggleButtonShow"));
            },
            tooltip: oResources.i18n.getText("ToggleButtonShow"),
            visible: oAllMyAppsController.getToggleListButtonVisible()
        });

        Device.media.attachHandler(function () {
            oToggleButton.setVisible(oAllMyAppsController.getToggleListButtonVisible());
        }, this, Device.media.RANGESETS.SAP_STANDARD);

        oToggleButton.addStyleClass("sapUshellAllMyAppsToggleListButton");

        return oToggleButton;
    };

    /*
    * Create and return the popover footer, containing a button for switching from ShellNavMenu to AllMyApps
    */
    ShellAppTitle.prototype._getPopoverFooterContent = function () {
        var that = this,
            oAllMyAppsButton;

        oAllMyAppsButton = new Button("allMyAppsButton", {
            text: oResources.i18n.getText("allMyApps_launchingButtonTitle"),
            press: function () {
                that._openCloseAllMyAppsPopover();

                // might not be available, as AllMyApps might not be loaded yet
                if (that.oAllMyAppsPopover) {
                    Measurement.start(
                        "FLP:ShellNavMenu.footerClick",
                        "Click the footer of ShellNavMenu, Launching AllMyApps",
                        "FLP"
                    );
                    that.getModel().setProperty("/ShellAppTitleState", AppTitleState.AllMyApps);
                    that.oNavMenuPopover.close();
                }
            },
            visible: {
                path: "/ShellAppTitleState",
                formatter: function (oCurrentState) {
                    return oCurrentState === AppTitleState.ShellNavMenu;
                }
            }
        });

        var oPopoverFooterContent = new Bar("shellpopoverFooter", {
            contentMiddle: [oAllMyAppsButton]
        });
        this.addCustomData(oAllMyAppsButton, "role", "button");
        this.addCustomData(oAllMyAppsButton, "aria-label", oResources.i18n.getText("allMyApps_launchingButtonTitle"));
        return oPopoverFooterContent;
    };

    /*************************************** Create Popover UI - End ***************************************/
    /*******************************************************************************************************/

    ShellAppTitle.prototype._isNavMenuEnabled = function () {
        var oNavMenu = Core.byId(this.getNavigationMenu());
        return oNavMenu ? oNavMenu.getItems() && oNavMenu.getItems().length > 0 : false;
    };

    ShellAppTitle.prototype.addCustomData = function (oItem, sKey, sValue) {
        oItem.addCustomData(new AccessibilityCustomData({
            key: sKey,
            value: sValue,
            writeToDom: true
        }));
    };

    ShellAppTitle.prototype.close = function () {
        if (this.oNavMenuPopover && this.oNavMenuPopover.isOpen()) {
            this.oNavMenuPopover.close();
        }

        if (this.oAllMyAppsPopover && this.oAllMyAppsPopover.isOpen()) {
            this.oAllMyAppsPopover.close();
        }
    };

    ShellAppTitle.prototype.setTooltip = function (sTooltip) {
        this.setAggregation("tooltip", sTooltip);
        this.oIcon.setTooltip(sTooltip);
    };

    ShellAppTitle.prototype.getAllMyAppsController = function () {
        var oAllMyApps = Core.byId(this.getAllMyApps());
        return oAllMyApps.getController();
    };

    ShellAppTitle.prototype.onkeyup = function (oEvent) {
        if (oEvent.keyCode === 32) { // Spacebar
            this.onclick(oEvent);
        }
    };

    ShellAppTitle.prototype.onsapenter = ShellAppTitle.prototype.onclick;

    ShellAppTitle.prototype.exit = function () {
        var oNavMenu = Core.byId(this.getNavigationMenu()),
            oAllMyApps = Core.byId(this.getAllMyApps());

        if (oNavMenu) {
            oNavMenu.destroy();
        }

        if (oAllMyApps) {
            oAllMyApps.destroy();
        }

        if (this.oAllMyAppsPopover) {
            this.oAllMyAppsPopover.destroy();
        }

        if (this.oNavMenuPopover) {
            this.oNavMenuPopover.destroy();
        }

        if (this.oIcon) {
            this.oIcon.destroy();
        }
    };

    return ShellAppTitle;
}, true);
