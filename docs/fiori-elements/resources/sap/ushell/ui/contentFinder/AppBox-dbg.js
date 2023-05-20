// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.contentFinder.AppBox.
sap.ui.define([
    "sap/m/Button",
    "sap/m/CheckBox",
    "sap/m/library",
    "sap/ui/core/Control",
    "sap/ui/core/Icon",
    "sap/ui/events/KeyCodes",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/contentFinder/AppBoxRenderer"
], function (
    Button,
    CheckBox,
    mobileLibrary,
    Control,
    Icon,
    KeyCodes,
    ushellLibrary,
    resources,
    AppBoxRenderer
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.ushell.AppBoxPreviewSize
    var AppBoxPreviewSize = ushellLibrary.AppBoxPreviewSize;

    /**
     * Constructor for a new ui/contentFinder/AppBox.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The appBox is a widget that represents content that can be placed on the homepage using the contentFinder.
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version 1.113.0
     *
     * @constructor
     * @private
     * @name sap.ushell.ui.contentFinder.AppBox
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var AppBox = Control.extend("sap.ushell.ui.contentFinder.AppBox", /** @lends sap.ushell.ui.contentFinder.AppBox.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 * Specifies the appId of the content represented by the appBox.
                 */
                appId: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies the data-help-id of the appBox.
                 */
                dataHelpId: { type: "string", group: "Behavior", defaultValue: null },

                /**
                 * Specifies if the appBox is disabled.
                 */
                disabled: { type: "boolean", group: "Behavior", defaultValue: false },

                /**
                 * Specifies if the preview button of the appBox is disabled.
                 */
                disablePreview: { type: "boolean", group: "Behavior", defaultValue: false },

                /**
                 * Specifies the grid gap size of a gird around the appBox in rem.
                 */
                gridGapSize: { type: "float", group: "Behavior", defaultValue: 1.5 },

                /**
                 * Specifies the icon url of the appBox.
                 */
                icon: { type: "string", group: "Appearance", defaultValue: null },

                /**
                 * Specifies the info of the content represented by the appBox.
                 */
                info: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies the url to be launched when clicking on the launch button of the appBox.
                 * The launch button will only show, if this property is provided.
                 */
                launchUrl: { type: "string", group: "Behavior", defaultValue: null },

                /**
                 * Specifies the type of the content represented by the appBox.
                 */
                previewSize: { type: "sap.ushell.AppBoxPreviewSize", group: "Misc", defaultValue: AppBoxPreviewSize.Small },

                /**
                 * Specifies the posinset of the appBox.
                 */
                posinset: { type: "int", group: "Misc", defaultValue: 0 },

                /**
                 * Specifies if the appBox is selectable.
                 */
                selectable: { type: "boolean", group: "Behavior", defaultValue: false },

                /**
                 * Specifies if the appBox is currently selected.
                 */
                selected: { type: "boolean", group: "Appearance", defaultValue: false },

                /**
                 * Specifies the setsize of the appBox.
                 */
                setsize: { type: "int", group: "Misc", defaultValue: 0 },

                /**
                 * Specifies if the extra information about the content represented by the appBox is shown.
                 */
                showExtraInformation: { type: "boolean", group: "Behavior", defaultValue: false },

                /**
                 * Specifies if the preview of the appBox is shown.
                 */
                showPreview: { type: "boolean", group: "Behavior", defaultValue: false },

                /**
                 * Specifies the subtitle of the appBox.
                 */
                subtitle: { type: "string", group: "Appearance", defaultValue: null },

                /**
                 * Specifies the system information of the content represented by the appBox.
                 */
                systemInfo: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies the title of the appBox.
                 */
                title: { type: "string", group: "Appearance", defaultValue: null },

                /**
                 * Specifies the type of the content represented by the appBox.
                 */
                type: { type: "string", group: "Misc", defaultValue: null }
            },
            defaultAggregation: "preview",
            aggregations: {

                /**
                 * The preview of the widget that is represented by the appbox.
                 */
                preview: { type: "sap.ui.core.Control", multiple: false },

                /**
                 * The icon in the title of the appbox.
                 */
                _icon: { type: "sap.ui.core.Icon", multiple: false, hidden: true },

                /**
                 * The launch button of the appbox.
                 */
                _launchButton: { type: "sap.m.Button", multiple: false, hidden: true },

                /**
                 * The button to preview the content represented by the appbox.
                 */
                _previewButton: { type: "sap.m.Button", multiple: false, hidden: true },

                /**
                 * The select checkbox of the appbox.
                 */
                _selectCheckBox: { type: "sap.m.CheckBox", multiple: false, hidden: true }

            },
            events: {

                /**
                 * Event is triggered when the appBox is not selectable and pressed.
                 */
                press: {},

                /**
                 * Event is triggered when the appBox launch button is pressed.
                 */
                launch: {
                    parameters: {

                        /**
                         * The url to be launched.
                         */
                        url: { type: "string" }
                    }
                },

                /**
                 * Event is triggered when the appBox Preview/Close button is pressed.
                 */
                previewShown: {
                    parameters: {

                        /**
                         * Checks whether the preview is shown or not.
                         */
                        showPreview: { type: "boolean" }
                    }
                },

                /**
                 * Event is triggered when the appBox selected property is changed by the user by selecting or deselecting the appbox.
                 */
                select: {
                    parameters: {

                        /**
                         * Checks whether the CheckBox is marked or not.
                         */
                        selected: { type: "boolean" }
                    }
                },

                /**
                 * Event is triggered when the appBox visibility was changed.
                 */
                visibilityChanged: {}
            }
        },
        renderer: AppBoxRenderer
    });

    /**
     * Provides control sap.ushell.ui.contentFinder.AppBox
     * @private
     */
    AppBox.prototype.init = function () {
        this.setAggregation("_icon", new Icon());

        this.setAggregation("_launchButton", new Button({
            icon: "sap-icon://action",
            type: ButtonType.Transparent,
            tooltip: resources.i18n.getText("ContentFinder.AppBox.Button.Tooltip.LaunchApplication"),
            press: this.launchAction.bind(this)
        }));

        this.setAggregation("_previewButton", new Button({
            iconFirst: false,
            type: ButtonType.Transparent,
            press: this.togglePreview.bind(this)
        }));

        this.setAggregation("_selectCheckBox", new CheckBox());
    };

    AppBox.prototype.onBeforeRendering = function () {
        var oTitleDomRef = this.getDomRef("title");
        if (oTitleDomRef) {
            oTitleDomRef.classList.remove("sapUshellContentFinderAppBoxTitleMoreLines");
            oTitleDomRef.removeAttribute("title");
        }

        var oSubtitleDomRef = this.getDomRef("subtitle");
        if (oSubtitleDomRef) {
            oSubtitleDomRef.classList.remove("sapUshellContentFinderAppBoxSubtitleMoreLines");
            oSubtitleDomRef.removeAttribute("title");
        }

        var oInfoDomRef = this.getDomRef("info");
        if (oInfoDomRef) {
            var aSpans = oInfoDomRef.getElementsByTagName("span");
            for (var iSpanIndex = 0; iSpanIndex < aSpans.length; ++iSpanIndex) {
                aSpans[iSpanIndex].removeAttribute("title");
            }
        }
    };

    AppBox.prototype.onAfterRendering = function () {
        var oTitleDomRef = this.getDomRef("title");
        var bTitleTwoLines = false;
        if (oTitleDomRef) {
            if (oTitleDomRef.offsetHeight < oTitleDomRef.scrollHeight) {
                oTitleDomRef.classList.add("sapUshellContentFinderAppBoxTitleMoreLines");
                if (oTitleDomRef.offsetHeight < oTitleDomRef.scrollHeight) {
                    oTitleDomRef.setAttribute("title", this.getTitle());
                }
                bTitleTwoLines = true;
            }
        }

        var oSubtitleDomRef = this.getDomRef("subtitle");
        if (oSubtitleDomRef) {
            if (!bTitleTwoLines && oSubtitleDomRef.offsetHeight < oSubtitleDomRef.scrollHeight) {
                oSubtitleDomRef.classList.add("sapUshellContentFinderAppBoxSubtitleMoreLines");
            }

            if (oSubtitleDomRef.offsetHeight < oSubtitleDomRef.scrollHeight) {
                oSubtitleDomRef.setAttribute("title", this.getSubtitle());
            }
        }

        var oInfoDomRef = this.getDomRef("info");
        if (oInfoDomRef) {
            var aSpans = oInfoDomRef.getElementsByTagName("span");
            var oSpan;
            for (var iSpanIndex = 0; iSpanIndex < aSpans.length; ++iSpanIndex) {
                oSpan = aSpans[iSpanIndex];
                if (oSpan.offsetWidth < oSpan.scrollWidth) {
                    oSpan.setAttribute("title", oSpan.innerText);
                }
            }
        }
    };

    AppBox.prototype.setVisible = function (bValue, bSuppressInvalidate) {
        this.setProperty("visible", bValue, bSuppressInvalidate);

        // This is needed to update the correct aria-posinset and aria-setsize attributes on each sibling appBox.
        this.fireVisibilityChanged();

        return this;
    };

    /**
     * Fires the launch event with the launchUrl as parameter.
     * @param {sap.ui.base.Event} oEvent The Launch Button Press event object
     */
    AppBox.prototype.launchAction = function (oEvent) {
        var oAppBoxInstance = oEvent.getSource().getParent();
        oAppBoxInstance.fireLaunch({ url: oAppBoxInstance.getLaunchUrl() });
    };

    /**
     * Fires the previewShown event and expands/collapses the appBox preview.
     * @param {sap.ui.base.Event} oEvent The Preview Button event object
     */
    AppBox.prototype.togglePreview = function (oEvent) {
        var oAppBoxInstance = oEvent.getSource().getParent();
        var bOldValue = oAppBoxInstance.getShowPreview();
        oAppBoxInstance.setShowPreview(!bOldValue);
        oAppBoxInstance.firePreviewShown({ showPreview: !bOldValue });
    };

    /**
     * Event handler called when the appBox is tapped.
     *
     * @param {jQuery.Event} oEvent The <code>tap</code> event object
     */
    AppBox.prototype.ontap = function (oEvent) {
        // If something is selected, prevent the event
        var oSelection = window.getSelection();
        var sTextSelection = oSelection.toString().replace("\n", "");
        if (sTextSelection && jQuery.contains(this.getDomRef(), oSelection.focusNode)) {
            return;
        }

        // The user tap can occur on different controls (GridContainer, AppBox, Checkbox within the AppBox).
        var oSource = oEvent.srcControl;
        if (!this.getDisabled() && (
            oSource === this
            || oSource === this.getAggregation("_selectCheckBox")
            || (oEvent.target && oEvent.target.firstChild === this.getDomRef())
        )) {
            if (this.getSelectable()) {
                var bOldValue = this.getSelected();
                this.setSelected(!bOldValue);
                this.fireSelect({ selected: !bOldValue });
            } else {
                this.firePress();
            }
        }

        // Set the focus to the source again
        oSource.focus();
    };

    /**
     * Handles the keyup event for SPACE and ENTER.
     *
     * @param {jQuery.Event} oEvent The event object
     */
    AppBox.prototype.onkeyup = function (oEvent) {
        if (oEvent && (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) && !oEvent.shiftKey) {
            this.ontap(oEvent);
            // stop browsers default behavior
            oEvent.preventDefault();
        }
    };

    /**
     * Handles the keydown event for SPACE on which we have to prevent the browser scrolling.
     *
     * @param {jQuery.Event} oEvent The event object.
     */
    AppBox.prototype.onsapspace = function (oEvent) {
        // stop browsers default behavior
        oEvent.preventDefault();
    };

    return AppBox;
});
