// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Dark Mode Support
 *
 * The service provide dark mode support functionality
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Configuration",
    "sap/ui/core/Core",
    "sap/ui/Device",
    "sap/ushell/Config",
    "sap/ushell/EventHub"
], function (
    Log,
    Configuration,
    Core,
    Device,
    Config,
    EventHub
) {
    "use strict";

    var PREFERS_DARK_COLOR_QUERY = "(prefers-color-scheme: dark)";

    /**
     * Dark Mode service.
     *
     * @name sap.ushell.services.DarkModeSupport
     * @constructor
     * @since 1.72.0
     * @private
     */
    function DarkModeSupport () {
        this.channel = EventHub.createChannel({
            mode: undefined
        });
        this.darkMediaQueryList = window.matchMedia(PREFERS_DARK_COLOR_QUERY);
        this.doables = [];
        this.themeChangedCallback = null;
        this.darkMediaQueryListListener = null;
    }

    /**
     * @name sap.ushell.services.DarkModeSupport.Mode
     * @since 1.72.0
     * @private
     */
    DarkModeSupport.Mode = {
        LIGHT: "light",
        DARK: "dark"
    };

    DarkModeSupport.prototype.setup = function () {
        // idempotency
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        // notify the mode can be switched based on current theme
        this.themeChangedCallback = function () {
            //if theme does not support the dark mode, null value will be set
            this.channel.emit("/mode", this.getCurrentThemeMode());
        }.bind(this);

        Core.attachThemeChanged(this.themeChangedCallback);
        this.themeChangedCallback(); // in case setup is made after a theme change

        if (this.canAutomaticallyToggleDarkMode() && sap.ushell.Container.getUser().getDetectDarkMode()) {
            // listen for change of system preference
            this.enableDarkModeBasedOnSystem();
        }
    };

    DarkModeSupport.prototype.destroy = function () {
        this.channel.emit("/mode", null);
        this.doables.forEach(function (oDoable) {
            oDoable.off();
        });
        this.doables = [];

        if (this.initialized) {
            Core.detachThemeChanged(this.themeChangedCallback);
            this.themeChangedCallback = null;
            this.disableDarkModeBasedOnSystem();

            this.initialized = false;
        }
    };

    DarkModeSupport.prototype.attachModeChanged = function (fnCallback) {
        var oDoable = this.channel.on("/mode").do(function (sMode) {
            fnCallback(sMode);
        });
        this.doables.push(oDoable);
    };

    /**
     * The method returns true if prefers-color-scheme query is supported and
     * there is no the "sap-theme" parameter in URL.
     *
     * @returns {boolean} true is when prefers-color-scheme query is supported and
     * there is no the "sap-theme" parameter in URL.
     *
     * @private
     */
    DarkModeSupport.prototype.canAutomaticallyToggleDarkMode = function () {
        //not all browser supported "(prefers-color-scheme: dark)" query
        var isColorSchemeQuerySupported = this.darkMediaQueryList.media === PREFERS_DARK_COLOR_QUERY;
        return isColorSchemeQuerySupported && !new URLSearchParams(window.location.search).get("sap-theme");
    };

    /**
     * Defines the criteria that determines whether theme supports dark/light mode.
     *
     * @param {string} [sTheme] Theme to check. Default value is current user theme.
     *
     * @returns {boolean} return true if current theme support dark/light mode.
     * @private
     */
    DarkModeSupport.prototype.isThemeSupportDarkMode = function (sTheme) {
        sTheme = sTheme || this._getCurrentTheme();
        return !!this._findSupportedThemePair(sTheme);
    };

    DarkModeSupport.prototype._toggleDarkModeBasedOnSystemColorScheme = function () {
        var sCurrentTheme = this._getCurrentTheme();
        if (this.darkMediaQueryList && this.isThemeSupportDarkMode(sCurrentTheme)) {
            var oSupportedThemePair = this._findSupportedThemePair(sCurrentTheme),
                bIsDarkModeInSystem = this.darkMediaQueryList.matches;

            var sToTheme = bIsDarkModeInSystem ? oSupportedThemePair.dark : oSupportedThemePair.light;
            sap.ushell.Container.getUser().applyTheme(sToTheme);
        }
    };

    DarkModeSupport.prototype._applyDefaultUserTheme = function () {
        var oUser = sap.ushell.Container.getUser();
        if (oUser.constants && oUser.constants.themeFormat) {
            oUser.applyTheme(oUser.getTheme(oUser.constants.themeFormat.ORIGINAL_THEME));
        }
    };

    /**
     * Switch the theme mode without any saving on backend.
     * If the current applied theme does not support dark/light mode, the theme is not changed
     *
     * @private
     */
    DarkModeSupport.prototype.toggleModeChange = function () {
        var sCurrentTheme = this._getCurrentTheme(),
            oSupportedThemePair = this._findSupportedThemePair(sCurrentTheme);
        if (oSupportedThemePair) {
            var sToTheme = sCurrentTheme === oSupportedThemePair.light
                ? oSupportedThemePair.dark
                : oSupportedThemePair.light;
            sap.ushell.Container.getUser().applyTheme(sToTheme);
        }
    };

    /**
     * Enable dark mode detection.
     * If system does not support the mode detection, the warning will be logged in console.
     *
     * @private
     */
    DarkModeSupport.prototype.enableDarkModeBasedOnSystem = function () {
        if (!this.initialized) {
            Log.warning("Automatic dark mode detection cannot be enabled, because the DarkModeSupport service was not setup.");
            return;
        }
        if (!this.canAutomaticallyToggleDarkMode()) {
            Log.warning("Automatic dark mode detection cannot be enabled, because your browser does not support dark mode detection");
            return;
        }
        if (this.darkMediaQueryListListener) {
            Log.warning("Automatic dark mode detection was already enabled");
            return;
        }

        if (Device.support.matchmedialistener) {
            this.darkMediaQueryListListener = this._toggleDarkModeBasedOnSystemColorScheme.bind(this);
            this.darkMediaQueryList.addListener(this.darkMediaQueryListListener);
        }
        //set the correct theme mode based on the current system preference
        this._toggleDarkModeBasedOnSystemColorScheme();
    };

    /**
     * Disable dark mode detection.
     *
     * @private
     */
    DarkModeSupport.prototype.disableDarkModeBasedOnSystem = function () {
        if (this.darkMediaQueryListListener) {
            this.darkMediaQueryList.removeListener(this.darkMediaQueryListListener);
            this.darkMediaQueryListListener = null;
        }
        this._applyDefaultUserTheme(); // restore the default theme from settings
    };

    /**
     * Return the theme mode based on the applied theme. If theme does not support the dark/light mode,
     * null value is returned
     *
     * @returns {DarkModeSupport.Mode|null} The theme mode or null.
     * @private
     */
    DarkModeSupport.prototype.getCurrentThemeMode = function () {
        var sCurrentTheme = this._getCurrentTheme(),
            oSupportedThemePair = this._findSupportedThemePair(sCurrentTheme);
        if (oSupportedThemePair) {
            return sCurrentTheme === oSupportedThemePair.light
                ? DarkModeSupport.Mode.LIGHT
                : DarkModeSupport.Mode.DARK;
        }
        return null;
    };

    DarkModeSupport.prototype._getCurrentTheme = function () {
        return Configuration.getTheme();
    };

    DarkModeSupport.prototype._findSupportedThemePair = function (sCurrentTheme) {
        var aSupportedThemes = Config.last("/core/darkMode/supportedThemes");
        return aSupportedThemes.filter(function (oSupportedThemePair) {
            return oSupportedThemePair.dark === sCurrentTheme
                || oSupportedThemePair.light === sCurrentTheme;
        })[0];
    };

    DarkModeSupport.hasNoAdapter = true;

    return DarkModeSupport;
}, true /* bExport */);
