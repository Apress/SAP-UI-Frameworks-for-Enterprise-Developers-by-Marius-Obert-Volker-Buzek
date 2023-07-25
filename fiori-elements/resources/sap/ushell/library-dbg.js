// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Core",
    "sap/ui/core/library",
    "sap/m/library"
], function (
    Core,
    coreLibrary,
    mobileLibrary
) {
    "use strict";

    /**
     * SAP library: sap.ushell
     *
     * @namespace
     * @alias sap.ushell
     */
    var oUshellLibrary = Core.initLibrary({
        name: "sap.ushell",
        version: "1.113.0",
        dependencies: [
            "sap.ui.core",
            "sap.m"
        ],
        types: [
            "sap.ushell.AllMyAppsState",
            "sap.ushell.AllMyAppsProviderType",
            "sap.ushell.AppTitleState",
            "sap.ushell.ContentNodeType",
            "sap.ushell.components.container.ApplicationType",
            "sap.ushell.DisplayFormat",
            "sap.ushell.NavigationState",
            "sap.ushell.ui.launchpad.ViewPortState",
            "sap.ushell.ui.tile.State",
            "sap.ushell.ui.tile.StateArrow",
            "sap.ushell.VisualizationLoadState",
            "sap.ushell.AppType",
            "sap.ushell.AppBoxPreviewSize",
            "sap.ushell.FloatingNumberType"
            // "sap.ushell.UI5ComponentType" Adding this type to the library leads to undefined requires when required after the library is loaded
        ],
        interfaces: [],
        controls: [
            "sap.ushell.components.container.ApplicationContainer",
            "sap.ushell.components.factsheet.controls.PictureTile", // deprecated since 1.22
            "sap.ushell.components.factsheet.controls.PictureViewer", // deprecated since 1.22
            "sap.ushell.components.factsheet.controls.PictureViewerItem", // deprecated since 1.22
            "sap.ushell.components.shell.Settings.userDefaults.UserDefaultsForm",
            "sap.ushell.components.tiles.sbtilecontent",

            "sap.ushell.components.workPageBuilder.controls.WorkPage",
            "sap.ushell.components.workPageBuilder.controls.WorkPageButton",
            "sap.ushell.components.workPageBuilder.controls.WorkPageCell",
            "sap.ushell.components.workPageBuilder.controls.WorkPageColumn",
            "sap.ushell.components.workPageBuilder.controls.WorkPageColumnResizer",
            "sap.ushell.components.workPageBuilder.controls.WorkPageRow",

            // VizInstance service
            "sap.ushell.services._VisualizationInstantiation.VizInstance",
            "sap.ushell.services._VisualizationInstantiation.VizInstanceAbap",
            "sap.ushell.services._VisualizationInstantiation.VizInstanceCdm",
            "sap.ushell.services._VisualizationInstantiation.VizInstanceLaunchPage",
            "sap.ushell.services._VisualizationInstantiation.VizInstanceLink",

            "sap.ushell.ui.AppContainer",
            "sap.ushell.ui.ContentNodeSelector",
            "sap.ushell.ui.ContentNodeTreeItem",
            "sap.ushell.ui.CustomGroupHeaderListItem",
            "sap.ushell.ui.ShellHeader",
            "sap.ushell.ui.appfinder.AppBox",
            "sap.ushell.ui.appfinder.PinButton",
            "sap.ushell.ui.contentFinder.AppBox",
            "sap.ushell.ui.footerbar.AboutButton",
            "sap.ushell.ui.footerbar.AddBookmarkButton",
            "sap.ushell.ui.footerbar.ContactSupportButton",
            "sap.ushell.ui.footerbar.JamDiscussButton",
            "sap.ushell.ui.footerbar.JamShareButton",
            "sap.ushell.ui.footerbar.LogoutButton",
            "sap.ushell.ui.footerbar.SendAsEmailButton",
            "sap.ushell.ui.launchpad.ActionItem",
            "sap.ushell.ui.launchpad.AnchorItem",
            "sap.ushell.ui.launchpad.AnchorNavigationBar",
            "sap.ushell.ui.launchpad.CatalogEntryContainer",
            "sap.ushell.ui.launchpad.CatalogsContainer",
            "sap.ushell.ui.launchpad.DashboardGroupsContainer",
            "sap.ushell.ui.launchpad.GroupHeaderActions",
            "sap.ushell.ui.launchpad.GroupListItem",
            "sap.ushell.ui.launchpad.LinkTileWrapper",
            "sap.ushell.ui.launchpad.LoadingDialog",
            "sap.ushell.ui.launchpad.Page",
            "sap.ushell.ui.launchpad.PlusTile",
            "sap.ushell.ui.launchpad.Section",
            "sap.ushell.ui.launchpad.Tile",
            "sap.ushell.ui.launchpad.TileContainer",
            "sap.ushell.ui.launchpad.TileState",
            "sap.ushell.ui.launchpad.section.CompactArea",
            "sap.ushell.ui.shell.FloatingContainer",
            "sap.ushell.ui.shell.NavigationMiniTile",
            "sap.ushell.ui.shell.OverflowListItem",
            "sap.ushell.ui.shell.RightFloatingContainer",
            "sap.ushell.ui.shell.ShellAppTitle",
            "sap.ushell.ui.shell.ShellFloatingAction",
            "sap.ushell.ui.shell.ShellFloatingActions",
            "sap.ushell.ui.shell.ShellHeadItem",
            "sap.ushell.ui.shell.ShellLayout",
            "sap.ushell.ui.shell.ShellNavigationMenu",
            "sap.ushell.ui.shell.ToolArea",
            "sap.ushell.ui.shell.ToolAreaItem",
            "sap.ushell.ui.tile.DynamicTile",
            "sap.ushell.ui.tile.ImageTile",
            "sap.ushell.ui.tile.StaticTile",
            "sap.ushell.ui.tile.TileBase"
        ],
        elements: [
            "sap.ushell.ui.launchpad.AccessibilityCustomData"
        ],
        extensions: {
            "sap.ui.support": {
                diagnosticPlugins: [
                    "sap/ushell/support/plugins/flpConfig/FlpConfigurationPlugin"
                ]
            }
        }
    });

    /**
     * Denotes the states of the all my apps menu.
     *
     * @enum {string}
     * @private
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.AllMyAppsState = {
        /**
         * Show first level.
         * @private
         */
        FirstLevel: "FirstLevel",

        /**
         * Show second level.
         * @private
         */
        SecondLevel: "SecondLevel",

        /**
         * Show details.
         * @private
         */
        Details: "Details",

        /**
         * Show first level.
         * @private
         */
        FirstLevelSpread: "FirstLevelSpread"
    };

    /**
     * Denotes the provider types of the all my apps menu entries.
     *
     * @enum {int}
     * @private
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.AllMyAppsProviderType = {
        /**
        * Homepage Apps
        * @private
        */
        HOME: 0,

        /**
        * External Apps
        * @private
        */
        EXTERNAL: 1,

        /**
        * Catalog Apps
        * @private
        */
        CATALOG: 2
    };

    /**
     * Denotes the states of the shell app title.
     *
     * @enum {string}
     * @private
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.AppTitleState = {
        /**
         * Only the Shell Navigation menu is available.
         * @private
         */
        ShellNavMenuOnly: "ShellNavMenuOnly",

        /**
         * Only the All My Apps menu is available.
         * @private
         */
        AllMyAppsOnly: "AllMyAppsOnly",

        /**
         * The Shell Navigation menu is currently active.
         * This state is only relevant if both ShellNavMenu and AllMyApps are active
         * and the user can navigate between them.
         * @private
         */
        ShellNavMenu: "ShellNavMenu",

        /**
         * The All My Apps menu is currently active.
         * This state is only relevant if both ShellNavMenu and AllMyApps are active
         * and the user can navigate between them.
         * @private
         */
        AllMyApps: "AllMyApps"
    };

    /**
     * Denotes the types of the content nodes.
     *
     * @enum {string}
     * @public
     */
    oUshellLibrary.ContentNodeType = {
        /**
         * A group of the classic homepage
         * @public
         */
        HomepageGroup: "HomepageGroup",
        /**
         * A space in spaces mode
         * @public
         */
        Space: "Space",
        /**
         * A page which is assigned to a space in spaces mode
         * @public
         */
        Page: "Page"
    };

    oUshellLibrary.components = oUshellLibrary.components || {};
    oUshellLibrary.components.container = oUshellLibrary.components.container || {};

    /**
     * The application types supported by the embedding container.
     *
     * @since 1.15.0
     * @enum {String}
     * @private
     */
    oUshellLibrary.components.container.ApplicationType = {
        NWBC: "NWBC",
        SAPUI5: "SAPUI5",
        TR: "TR",
        URL: "URL",
        WCF: "WCF",
        WDA: "WDA"
    };

    /**
     * Denotes display types for tiles in Spaces mode
     *
     * @private
     * @since 1.85
     */
    oUshellLibrary.DisplayFormat = {
        /**
         * Indicates a standard 2x2 tile.
         */
        Standard: "standard",

        /**
         * Indicates that the tile is displayed as a link.
         */
        Compact: "compact",

        /**
         * Indicates a flat 1x2 tile.
         */
        Flat: "flat",

        /**
         * Indicates a flat, wide 1x4 tile.
         */
        FlatWide: "flatWide",

        /**
         * Indicates a wide 2x4 tile.
         */
        StandardWide: "standardWide"
    };

    /**
     * The state of a navigation operation
     *
     * @enum {string}
     * @public
     */
    oUshellLibrary.NavigationState = {
        InProgress: "InProgress",
        Finished: "Finished"
    };

    oUshellLibrary.ui = oUshellLibrary.ui || {};
    oUshellLibrary.ui.launchpad = oUshellLibrary.ui.launchpad || {};

    /**
     * Denotes display states of the viewport
     *
     * @enum {string}
     * @public
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.ui.launchpad.ViewPortState = {
        /**
         * Indicates state, when only left content is in the viewport.
         * @public
         */
        Left: "Left",

        /**
         * Indicates state, when only center content is in the viewport.
         * @public
         */
        Center: "Center",

        /**
         * Indicates state, when only right content is in the viewport.
         * @public
         */
        Right: "Right",

        /**
         * Indicates state, when the left content as well as a part from the center content is in the viewport.
         * @public
         */
        LeftCenter: "LeftCenter",

        /**
         * Indicates state, when the center content as well as a part from the left content is in the viewport.
         * @public
         */
        CenterLeft: "CenterLeft",

        /**
         * Indicates state, when the right content as well as a part from the center content is in the viewport.
         * @public
         */
        RightCenter: "RightCenter",

        /**
         * Indicates state, when the center content as well as a part from the right content is in the viewport.
         * @public
         */
        CenterRight: "CenterRight"
    };

    oUshellLibrary.ui.tile = oUshellLibrary.ui.tile || {};

    /**
     * Denotes states for control parts and translates into standard SAP color codes
     *
     * @enum {string}
     * @private
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.ui.tile.State = {
        /**
         * Indicates a state that is neutral, e.g. for standard display (Grey color)
         * @public
         */
        Neutral: "Neutral",

        /**
         * Alias for "None"
         * @public
         */
        None: "None",

        /**
         * Indicates a state that is negative,
         * e.g. marking an element that has to get attention urgently or indicates negative values (Red color)
         * @public
         */
        Negative: "Negative",

        /**
         * Alias for "Error"
         * @public
         */
        Error: "Error",

        /**
         * Indicates a state that is positive, e.g. marking a task successfully executed or a state where all is good (Green color)
         * @public
         */
        Positive: "Positive",

        /**
         * Alias for "Success"
         * @public
         */
        Success: "Success",

        /**
         * Indicates a state that is critical, e.g. marking an element that needs attention (Orange color)
         * @public
         */
        Critical: "Critical",

        /**
         * Alias for "Warning"
         * @public
         */
        Warning: "Warning"
    };

    /**
     * The state of an arrow as trend direction indicator, pointing either up or down
     *
     * @enum {string}
     * @private
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.ui.tile.StateArrow = {
        /**
         * The trend direction indicator is invisible
         * @public
         */
        None: "None",

        /**
         * The trend direction indicator points up
         * @public
         */
        Up: "Up",

        /**
         * The trend direction indicator points down
         * @public
         */
        Down: "Down"
    };

    /**
     * Enumeration of possible VisualizationLoad statuses.
     *
     * @enum {string}
     * @private
     * @since 1.76.0
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.VisualizationLoadState = {
        /**
         * The control is loading.
         * @private
         */
        Loading: "Loading",

        /**
         * The control has loaded.
         * @private
         */
        Loaded: "Loaded",

        /**
         * The control failed to load, because it has insufficient roles.
         * @private
         */
        InsufficientRoles: "InsufficientRoles",

        /**
         * The control is out of the selected role context.
         * @private
         */
        OutOfRoleContext: "OutOfRoleContext",

        /**
         * The control has no resolved navigation target.
         * @private
         */
        NoNavTarget: "NoNavTarget",

        /**
         * The control failed to load.
         * @private
         */
        Failed: "Failed",

        /**
         * The control is disabled.
         * @private
         */
        Disabled: "Disabled"
    };

    /**
     * Enumeration of possible application types.
     * Used by services in order to add activities of certain types.
     *
     * @enum {string}
     * @private
     * @since 1.94.0
     */
    oUshellLibrary.AppType = {
        /**
         * Overview page.
         * @private
         */
        OVP: "OVP",

        /**
         * Search.
         * @private
         */
        SEARCH: "Search",

        /**
         * Factsheet application.
         * @private
         */
        FACTSHEET: "FactSheet",

        /**
         * Co-pilot.
         * @private
         */
        COPILOT: "Co-Pilot",

        /**
         * External link.
         * @private
         */
        URL: "External Link",

        /**
         * Generic application.
         * @private
         */
        APP: "Application"
    };

    /**
     * Enumeration of possible appBox preview sizes.
     * Used by the appBox to determine the size of the appBox when viewing the preview.
     *
     * @enum {string}
     * @private
     * @since 1.105.0
     */
    oUshellLibrary.AppBoxPreviewSize = {

        /**
         * "2x2" or "1x2" tile
         * @private
         */
        Small: "Small",

        /**
         * "2x4" tile or Card
         * @private
         */
        Large: "Large"
    };

    /**
     * Enumeration of possible floating number types/states.
     *
     * @enum {string}
     * @private
     * @since 1.106.0
     */
    oUshellLibrary.FloatingNumberType = {

        /**
         * Used when the "floatingNumber" should be disregarded.
         * @private
         */
        None: "None",

        /**
         * Used when the "floatingNumber" should represent the number of new notifications.
         * @private
         */
        Notifications: "Notifications",

        /**
         * Used when the "floatingNumber" should represent the number of new notifications,
         * but is displayed in an "overflow" button instead of the "notifications" button itself.
         * @private
         */
        OverflowButton: "OverflowButton"
    };

    return oUshellLibrary;
});
