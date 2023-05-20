// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/Core",
    "sap/ui/core/theming/Parameters",
    "sap/ui/Device",
    "sap/ui/dom/units/Rem",
    "sap/base/Log",
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/ShellHeaderRenderer",
    "sap/ushell/utils",
    "sap/ushell/utils/WindowUtils"
], function (
    Control,
    Core,
    ThemingParameters,
    Device,
    Rem,
    Log,
    EventHub,
    Config,
    ushellLibrary,
    resources,
    ShellHeaderRenderer,
    utils,
    WindowUtils
) {
    "use strict";

    var sSearchOverlayCSS = "sapUshellShellShowSearchOverlay";

    var _iSearchWidth = 0; // width as requested by the SearchShellHelper
    var _sCurrentTheme;
    var _sCurrentLogo;
    var _sSapLogo = sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg");

    var ShellHeader = Control.extend("sap.ushell.ui.ShellHeader", {
        /** @lends sap.ushell.ui.ShellHeader.prototype */
        metadata: {
            library: "sap.ushell",
            properties: {
                /*
                Company logo in the header.
                If not set, the "sapUiGlobalLogo" of the current theme is used.
                If the "sapUiGlobalLogo" is "none", SAP logo is displayed.
                */
                logo: { type: "sap.ui.core.URI", defaultValue: "" },
                showLogo: { type: "boolean", defaultValue: true },
                homeUri: { type: "sap.ui.core.URI", defaultValue: "#" }, /* navigation URI when pressing on the header Logo */
                searchState: { type: "string", defaultValue: "COL" },
                ariaLabel: { type: "string" },
                centralAreaElement: { type: "string", defaultValue: null },
                title: { type: "string", defaultValue: "" }
            },
            aggregations: {
                headItems: { type: "sap.ushell.ui.shell.ShellHeadItem", multiple: true },
                headEndItems: { type: "sap.ui.core.Control", multiple: true },
                search: { type: "sap.ui.core.Control", multiple: false },
                appTitle: { type: "sap.ushell.ui.shell.ShellAppTitle", multiple: false }
            },
            associations: {
                shellLayout: { type: "sap.ui.base.ManagedObject", multiple: false }
            },
            events: {
                searchSizeChanged: {}
            }
        },

        renderer: ShellHeaderRenderer
    });

    /**
     * Setter for the property "homeUri"
     *
     * @param {string} sHomeUri The new value for homeUri
     * @returns {sap.ushell.ui.ShellHeader} this to allow method chaining
     * @private
     */
    ShellHeader.prototype.setHomeUri = function (sHomeUri) {
        if (WindowUtils.hasInvalidProtocol(sHomeUri)) {
            Log.fatal("Tried to set a URL with an invalid protocol as the home uri. Setting to an empty string instead.", null, "sap/ushell/ui/ShellHeader");
            sHomeUri = "";
        }
        this._bHomeIsRoot = utils.isRootIntent(sHomeUri);
        return this.setProperty("homeUri", sHomeUri);
    };

    /**
     * @returns {sap.ui.core.Control} the related ShellLayout control
     * @private
     */
    ShellHeader.prototype.getShellLayoutControl = function () {
        return Core.byId(this.getShellLayout());
    };

    /**
     * Create a separate UI Area and place the Shell Header therein
     * @private
     */
    ShellHeader.prototype.createUIArea = function () {
        var headerArea = window.document.getElementById("shell-hdr");
        if (!headerArea) {
            window.document.body.insertAdjacentHTML("afterbegin", "<div id=\"shell-hdr\" class=\"sapContrastPlus sapUshellShellHead\"></div>");
            this.placeAt("shell-hdr");
        }
    };

    /**
     * The search states that can be passed as a parameter to the setSearchState.
     * Values:
     * COL - search field is hidden
     * EXP - search field is visible, other shell header elements can be hidden
     * EXP_S - search field is visible, other elements in the header remain visible
     */
    ShellHeader.prototype.SearchState = {
        COL: "COL",
        EXP: "EXP",
        EXP_S: "EXP_S"
    };

    ShellHeader.prototype.init = function () {
        Device.media.attachHandler(this.invalidate, this, Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
        Device.resize.attachHandler(this.refreshLayout, this);

        this.getCustomLogoAltText(); // Get the custom alt text for the logo

        /*
         * Calling shell navigation directly here would cause
         * sap.ushell.Container to load and instantiate ShellNavigation early.
         * This causes Shell.controller#getServiceAsync("ShellNavigation") to
         * load the service faster, therefore soon executing ShellNavigation
         * initialization code. In the past we implemented an optimization that
         * prioritized rendering and delayed all processing on the critical
         * path.  Navigation included. To preserve that optimization we let
         * shell controller initialize ShellNavigation before using it here.
         */
        EventHub.once("ShellNavigationInitialized").do(function () {
            sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigation) {
                this._rerenderLogoNavigationFilterBound = this._rerenderLogoNavigationFilter.bind(this, oShellNavigation);

                oShellNavigation.registerNavigationFilter(this._rerenderLogoNavigationFilterBound);
                this._rerenderLogoNavigationFilterBound.detach = function () {
                    oShellNavigation.unregisterNavigationFilter(this._rerenderLogoNavigationFilterBound);
                };
            }.bind(this));
        }.bind(this));
    };

    /**
     * This hook is called before the shell header control is destroyed
     * @private
     */
    ShellHeader.prototype.exit = function () {
        Device.media.detachHandler(this.invalidate, this, Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
        Device.resize.detachHandler(this.refreshLayout, this);
        var oShellHeader = window.document.getElementById("shell-hdr");
        if (oShellHeader) {
            oShellHeader.parentElement.removeChild(oShellHeader);
        }

        if (this._rerenderLogoNavigationFilterfnRerenderLogoNavigationFilter) {
            this._rerenderLogoNavigationFilterfnRerenderLogoNavigationFilter.detach();
        }
    };

    /**
     * Set focus to the shell Header
     * @param {boolean} backwardsNavigation whether the focus should be on the first or last element of the shell header
     * @private
     */
    ShellHeader.prototype.setFocusOnShellHeader = function (backwardsNavigation) {
        if (backwardsNavigation) {
            var aHeaderEndItems = this.getHeadEndItems();
            if (aHeaderEndItems.length > 0) {
                aHeaderEndItems[aHeaderEndItems.length - 1].focus();
            } else {
                this.getAppTitle().focus();
            }
        } else {
            var aHeaderItems = this.getHeadItems();

            if (aHeaderItems.length > 0) {
                aHeaderItems[0].focus();
            } else {
                this.getAppTitle().focus();
            }
        }
    };

    /**
     * Handle space key when focus is in the ShellHeader.
     *
     * @param {object} oEvent - the keyboard event
     * @private
     */
    ShellHeader.prototype.onsapspace = function (oEvent) {
        // Navigate home when a user presses the space keyboard button in the logo
        if (oEvent.target === this.getDomRef("logo")) {
            this._setLocationHref(oEvent.target.href);
        }
    };

    ShellHeader.prototype._setLocationHref = function (sHref) {
        if (WindowUtils.hasInvalidProtocol(sHref)) {
            Log.fatal("Tried to navigate to URL with an invalid protocol. Preventing navigation.", null, "sap/ushell/ui/ShellHeader");
            return;
        }
        window.location.href = sHref;
    };

    ShellHeader.prototype.onAfterRendering = function () {
        // ShellHeader may render earlier than the initial theme is loaded.
        // Check this situation and hide the unstyled content.
        // Ideally, getComputedStyle should be used, but getBoundingClientRect is faster
        var oHeaderElement = this.getDomRef();
        if (!_sCurrentTheme && oHeaderElement.parentElement.getBoundingClientRect().height > 0) {
            // The header has position:static -> the library style is not applied yet -> hide it
            oHeaderElement.style.visibility = "hidden";
            oHeaderElement.style.height = "2.75rem";
            return;
        }

        this.refreshLayout();
    };

    /**
     * Triggered by UI5.
     * Necessary also for Themedesigner.
     * Scenario:
     * Themedesigner changes CSS and triggers "themeChanged". The theme NAME did not change in that case.
     * Therefore special logic for the logo is needed.
     *
     * @param {object} oEvent Given
     * @private
     */
    ShellHeader.prototype.onThemeChanged = function (oEvent) {
        var bInvalidate = false;
        if (_sCurrentTheme !== oEvent.theme) {
            _sCurrentTheme = oEvent.theme;
            bInvalidate = true;
        }

        if (_sCurrentLogo !== this.getLogo()) {
            _sCurrentLogo = this.getLogo();
            bInvalidate = true;
        }

        if (bInvalidate) {
            this.invalidate();
        }
    };

    /**
     * RTA uses getLogo() to find the current logo URL.
     * Modify getLogo until a better way is implemented in RTA.
     * Logo priority: 1) specifically set, 2) theme logo 3) SAP logo
     * In case the logo cannot yet be retrieved from the theme, a invalidation is triggered.
     *
     * @returns {string|undefined} Logo URL
     * @private
     */
    ShellHeader.prototype.getLogo = function () {
        if (this.getProperty("logo") !== "") {
            return this.getProperty("logo");
        }

        var sThemeLogo = ThemingParameters.get({
            name: "sapUiGlobalLogo",
            callback: function () {
                // When no Logo can be retrieved yet, null is returned by ThemingParameters.get() - and a rerender is triggered.
                this.invalidate();
            }
        });

        if (sThemeLogo === "none") {
            return _sSapLogo;
        }
        if (sThemeLogo) {
            // check given logo URL: Is it valid?
            var aMatch = /url[\s]*\('?"?([^'")]*)'?"?\)/.exec(sThemeLogo);
            if (aMatch) {
                return aMatch[1];
            }
        }
        return undefined;
    };

    /**
     * Get the custom ALT text for the logo image and current language.
     * @private
     */
    ShellHeader.prototype.getCustomLogoAltText = function () {
        var sCompanyLogoAltTexts = Config.last("/core/companyLogo/accessibleText");
        var sCurrentLanguage;

        delete this._sCustomAltText;
        if (sCompanyLogoAltTexts) {
            try {
                var oLogoAltTexts = JSON.parse(sCompanyLogoAltTexts);
                if (oLogoAltTexts) {
                    sCurrentLanguage = Core.getConfiguration().getLanguage();
                    // 1. Exact match
                    this._sCustomAltText = oLogoAltTexts[sCurrentLanguage];
                    // 2. Current language: "en", custom language: "en-GB"
                    if (!this._sCustomAltText) {
                        Object.keys(oLogoAltTexts).forEach(function (sKey) {
                            if (sKey.indexOf(sCurrentLanguage) === 0) {
                                this._sCustomAltText = oLogoAltTexts[sKey];
                            }
                        }.bind(this));
                    }
                    // 3. Current language: "en-GB", custom language: "en"
                    if (!this._sCustomAltText) {
                        Object.keys(oLogoAltTexts).forEach(function (sKey) {
                            if (sCurrentLanguage.indexOf(sKey) === 0) {
                                this._sCustomAltText = oLogoAltTexts[sKey];
                            }
                        }.bind(this));
                    }
                    // 4. Default value
                    if (!this._sCustomAltText) {
                        this._sCustomAltText = oLogoAltTexts.default;
                    }
                }
            } catch (err) {
                Log.warning("Custom logo image ALT text is not a JSON string.", sCompanyLogoAltTexts);
                this._sCustomAltText = sCompanyLogoAltTexts; // Still, a customer may provide a "[Company name] logo" instead of JSON
            }
        }
    };

    /**
     * Returns the ALT text for the logo image.
     * @param {string} sLogoUri The Uri of the logo image
     * @returns {string} Logo ALT text
     * @private
     */
    ShellHeader.prototype.getLogoAltText = function (sLogoUri) {
        if (!sLogoUri) {
            return "";
        }
        if (sLogoUri === _sSapLogo) {
            return resources.i18n.getText("sapLogoText"); // "SAP Logo"
        }
        return this._sCustomAltText || resources.i18n.getText("SHELL_LOGO_TOOLTIP"); // Custom text or "Company logo"
    };

    /**
     * Recalculates the sizes and what should be shown on the shellHeader
     * @protected
     */
    ShellHeader.prototype.refreshLayout = function () {
        if (!this.getDomRef()) {
            return;
        }
        this._setAppTitleFontSize();
        this._adjustAppTitleTooltip();

        // Search field related logic:
        if (this.getSearchVisible()) {
            var oSearch = this.getDomRef("hdr-search");
            oSearch.style.display = "none";
            this._hideElementsForSearch();
            oSearch.style.display = "";
            oSearch.style["max-width"] = _iSearchWidth + "rem";
            this.fireSearchSizeChanged({
                remSize: Rem.fromPx(oSearch.getBoundingClientRect().width),
                isFullWidth: this.isPhoneState() || this.getDomRef("hdr-end").style.display === "none"
            });
        }
    };

    /**
     * If there is not enought space for the App title, reduce the font size
     * @private
     */
    ShellHeader.prototype._setAppTitleFontSize = function () {
        if (this.isExtraLargeState()) {
            return; // Do not change font size on XL
        }
        var oBeginContainer = this.getDomRef("hdr-begin"),
            oAppTitle = window.document.getElementById("shellAppTitle"),
            cssClassName = "sapUshellHeadTitleWithSmallerFontSize";

        if (oBeginContainer && oAppTitle) {
            oAppTitle.classList.remove(cssClassName);
            oAppTitle.style.overflow = "visible";

            var oBeginContainerRect = oBeginContainer.getBoundingClientRect(),
                iBeginContainerLeft = oBeginContainerRect.x + oBeginContainerRect.width,
                oAppTitleRect = oAppTitle.getBoundingClientRect(),
                iAppTitleLeft = oAppTitleRect.x + oAppTitleRect.width;

            if (iAppTitleLeft > iBeginContainerLeft) {
                oAppTitle.classList.add(cssClassName);
            }
            oAppTitle.style.overflow = "";
        }
    };

    /**
     * Set the correct tooltip for the ShellAppTitle.
     * If the ShellAppTitle has a navigation menu it should be: "Navigation menu".
     * Otherwise there should only be a tooltip if the Title is truncated.
     */
    ShellHeader.prototype._adjustAppTitleTooltip = function () {
        var oAppTitle = Core.byId("shellAppTitle");
        if (oAppTitle) {
            var oDivElement = oAppTitle.getDomRef("button");
            var oSpanElement = oDivElement && oDivElement.firstChild;
            if (oSpanElement) {
                var sNewTooltip;

                var sShellStateName = Config.last("/core/shell/model/currentState/stateName");
                var bAllMyAppsEnabled = Config.last("/core/services/allMyApps/enabled");
                var bAllMyAppsMenu = (sShellStateName === "app" || sShellStateName === "home") && bAllMyAppsEnabled;

                var oNavMenu = Core.byId(oAppTitle.getNavigationMenu());
                var bNavMenu = oNavMenu && oNavMenu.getItems() && oNavMenu.getItems().length > 0;
                if (bAllMyAppsMenu || bNavMenu) {
                    sNewTooltip = resources.i18n.getText("shellNavMenu_openMenuTooltip");
                } else {
                    var bTruncated = oSpanElement.offsetWidth < oSpanElement.scrollWidth;
                    sNewTooltip = bTruncated ? oAppTitle.getText() : null;
                }

                // This will trigger a rerender
                if (oAppTitle.getTooltip() !== sNewTooltip) {
                    oAppTitle.setTooltip(sNewTooltip);
                }
            }
        }
    };

    ShellHeader.prototype.removeHeadItem = function (vItem) {
        if (typeof vItem === "number") {
            vItem = this.getHeadItems()[vItem];
        }
        this.removeAggregation("headItems", vItem);
    };

    ShellHeader.prototype.addHeadItem = function (oItem) {
        this.addAggregation("headItems", oItem);
    };

    ShellHeader.prototype.isExtraLargeState = function () {
        return Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED).from === 1440;
    };

    ShellHeader.prototype.isPhoneState = function () {
        var deviceType = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;
        var bEnoughSpaceForSearch = this.getDomRef().getBoundingClientRect().width > _iSearchWidth;
        return (Device.system.phone || deviceType === "Phone" || !bEnoughSpaceForSearch);
    };

    /**
     * @param {string} sStateName The search state to be set. The validate values are - COL, EXP, EXP_S.
     * @param {string} [maxRemSize] The optional max width in rem.
     * @param {boolean} [bWithOverlay] If the state is EXP the overlay appears according to this parameter (the default is true).
     */
    ShellHeader.prototype.setSearchState = function (sStateName, maxRemSize, bWithOverlay) {
        if (this.SearchState[sStateName] && this.getSearchState() !== sStateName) {
            if (typeof maxRemSize === "boolean") {
                bWithOverlay = maxRemSize;
                maxRemSize = undefined;
            }

            this.setProperty("searchState", sStateName, false);

            var bShow = (sStateName !== "COL");
            var shellLayout = this.getShellLayoutControl();
            if (shellLayout) {
                shellLayout.toggleStyleClass(sSearchOverlayCSS, bShow && bWithOverlay);
            }

            // save for animation after rendering
            _iSearchWidth = bShow ? maxRemSize || 35 : 0;
        }
    };

    // When the search field is opened, hide header elements, one after another,
    // until the requested width is provided
    ShellHeader.prototype._hideElementsForSearch = function () {
        if (this.isExtraLargeState()) { // do not hide elements in XL
            return;
        }

        var nReqWidth,
            oSearchContainer = this.getDomRef("hdr-search-container"),
            oBeginContainer = this.getDomRef("hdr-begin"),
            oCenterContainer = this.getDomRef("hdr-center"),
            oEndContainer = this.getDomRef("hdr-end");

        if (this.getSearchState() === "EXP" || this.isPhoneState()) {
            nReqWidth = Rem.toPx(_iSearchWidth + 3); // 3 rem minimal distance for EXP
        } else {
            nReqWidth = Rem.toPx(9 + 0.5); // minimal search width for EXP_S
        }

        // order of elements: center container, left items in reverse order, left container, right container
        var aElements = [oBeginContainer];
        // add left items in reverse order before the begin container
        // IE11: NodeList does not have the forEach function
        Array.prototype.forEach.call(oBeginContainer.childNodes, function (element) {
            aElements.unshift(element);
        });
        // center container is hidden first
        if (oCenterContainer) {
            aElements.unshift(oCenterContainer);
        }

        // restore all hidden elements to unhide some or all of them when the user makes the window wider
        oBeginContainer.style.flexBasis = "";
        oEndContainer.style.display = "";
        aElements.forEach(function (e) {
            if (e.getAttribute("id") === "shellAppTitle") {
                e.classList.remove("sapUiPseudoInvisibleText");
            } else {
                e.style.display = "";
            }
        });

        // remove elements one-by-one
        var oElement;
        for (var i = 0; i < aElements.length; i++) {
            oElement = aElements[i];
            if (nReqWidth > oSearchContainer.getBoundingClientRect().width) {
                if (oElement.getAttribute("id") === "shellAppTitle") {
                    oElement.classList.add("sapUiPseudoInvisibleText");
                } else {
                    oElement.style.display = "none";
                    if (oCenterContainer && i === 0) {
                        oBeginContainer.style.flexBasis = "auto";
                    }
                }
            } else {
                return; // finished, do not hide any more elements
            }
        }
        // last attempt to get the required space: hide the end items container
        if (Rem.toPx(_iSearchWidth) > oSearchContainer.getBoundingClientRect().width) { // no minimal distance for the head-end items
            oEndContainer.style.display = "none";
        }
    };

    /**
     * @returns {integer} the max width of the search field in rem
     * @private
     */
    ShellHeader.prototype.getSearchWidth = function () {
        return _iSearchWidth;
    };

    /**
     * @returns {boolean} true if the current page is the homepage
     */
    ShellHeader.prototype.isHomepage = function () {
        var sHash = (window.hasher && "#" + window.hasher.getHash()) || "";

        var rIntentParameterBeforeAppRoute = new RegExp(
            "[?]" + // question mark character
            "(?:" + // begin non capturing block
            "(?!&[/])." + // any character which is not '&' followed by '/'
            ")*" // repeat
        );
        var sHashNoParams = sHash.replace(rIntentParameterBeforeAppRoute, "");

        return utils.isRootIntent(sHashNoParams) || sHashNoParams === "#Launchpad-openFLPPage";
    };

    ShellHeader.prototype._rerenderLogoNavigationFilter = function (oShellNavigation, sNewHash, sOldHash) {
        var bAppSpecificChange = oShellNavigation.hashChanger.isInnerAppNavigation(sNewHash, sOldHash);
        if (bAppSpecificChange) {
            this.invalidate(); // enable/disable logo
        }

        return oShellNavigation.NavigationFilterStatus.Continue;
    };

    // Returns true when the search field is visible
    ShellHeader.prototype.getSearchVisible = function () {
        return this.getSearchState() !== this.SearchState.COL;
    };

    ShellHeader.prototype.getCentralControl = function () {
        return Core.byId(this.getCentralAreaElement());
    };

    ShellHeader.prototype.setNoLogo = function () {
        this.setLogo(undefined);
    };

    /**
     * @returns {boolean} true if FLP runs in lean mode (no back button, no home button)
     * @private
     */
    ShellHeader.prototype._getLeanMode = function () {
        return sap.ushell.Container.getRenderer().getSapUshellConfigParam() === "lean";
    };

    return ShellHeader;
});
