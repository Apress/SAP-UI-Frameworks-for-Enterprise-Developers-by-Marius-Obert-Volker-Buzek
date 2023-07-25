// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.Page.
sap.ui.define([
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/core/Control",
    "sap/ui/core/dnd/DragDropInfo",
    "sap/ui/core/InvisibleMessage",
    "sap/ui/core/library",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/ExtendedChangeDetection",
    "./PageRenderer"
], function (
    Button,
    mLibrary,
    Text,
    Control,
    DragDropInfo,
    InvisibleMessage,
    coreLibrary,
    ushellLibrary,
    resources,
    ExtendedChangeDetection,
    PageRenderer
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mLibrary.ButtonType;

    // shortcut for sap.ui.core.TextAlign
    var TextAlign = coreLibrary.TextAlign;

    // shortcut for InvisiblesMessageMode
    var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    /**
     * Constructor for a new Page.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The Page represents a collection of sections.
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version 1.113.0
     *
     * @private
     * @alias sap.ushell.ui.launchpad.Page
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var Page = Control.extend("sap.ushell.ui.launchpad.Page", /** @lends sap.ushell.ui.launchpad.Page.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 * Specifies whether the addSection button is visible.
                 */
                edit: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies whether section reordering is enabled. Relevant only for desktop devices.
                 */
                enableSectionReordering: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies the data-help-id attribute of the Page.
                 * If left empty, the attribute is not rendered.
                 */
                dataHelpId: { type: "string", group: "Misc", defaultValue: "" },

                /**
                 * This text is displayed when the control contains no sections.
                 */
                noSectionsText: { type: "string", group: "Misc", defaultValue: "" },

                /**
                 * Defines whether or not the text specified in the <code>noSectionsText</code> property is displayed.
                 */
                showNoSectionsText: { type: "boolean", group: "Misc", defaultValue: true },

                /**
                 * Defines whether or not the title specified in the <code>title</code> property is displayed.
                 */
                showTitle: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * This title is displayed on top of the Page.
                 */
                title: { type: "string", group: "Misc", defaultValue: "" }
            },
            defaultAggregation: "sections",
            aggregations: {

                /**
                 * The sections displayed in the Page.
                 */
                sections: { type: "sap.ushell.ui.launchpad.Section", multiple: true, dnd: true },

                /**
                 * MessageStrip to show on top of the page
                 * @since 1.89.0
                 */
                messageStrip: { type: "sap.m.MessageStrip", multiple: false },

                /**
                 * Internal aggregation to show the addSection buttons if the edit property is enabled.
                 */
                _addSectionButtons: { type: "sap.m.Button", multiple: true, visibility: "hidden" },

                /**
                 * Internal aggregation to show the noSectionText.
                 */
                _noSectionText: { type: "sap.m.Text", multiple: false, visibility: "hidden" }
            },
            events: {

                /**
                 * Fires when the addSection Button is pressed.
                 */
                addSectionButtonPressed: {
                    parameters: {

                        /**
                         * The index the new section should be added.
                         */
                        index: { type: "int" }
                    }
                },

                /**
                 *  Fires when the sections are dropped on the page.
                 */
                sectionDrop: {
                    parameters: {

                        /**
                         * The section that was dragged.
                         */
                        draggedControl: { type: "sap.ushell.ui.launchpad.Section" },

                        /**
                         * The section where the dragged section was dropped.
                         */
                        droppedControl: { type: "sap.ushell.ui.launchpad.Section" },

                        /**
                         * A string defining from what direction the dragging happend.
                         */
                        dropPosition: { type: "string" }
                    }
                }
            }
        },
        renderer: PageRenderer
    });

    Page.prototype.enhanceAccessibilityState = function (oElement, oAriaProps) {
        delete oAriaProps.readonly;
    };

    Page.prototype.init = function () {
        this.setAggregation("_noSectionText", new Text({
            text: resources.i18n.getText("Page.NoSectionText"),
            width: "100%",
            textAlign: TextAlign.Center
        }));

        this._oDragDropInfo = new DragDropInfo({
            sourceAggregation: "sections",
            targetAggregation: "sections",
            dropPosition: "Between",
            dragStart: function (oEvent) {
                // Do not allow to drag the default section
                if (oEvent.getParameter("target").getDefault()) {
                    oEvent.preventDefault();
                }
            },
            dragEnter: function (oEvent) {
                // Do not allow to drag on top of the default section
                if (oEvent.getParameter("target").getDefault()) {
                    oEvent.preventDefault();
                }
            },
            drop: function (oInfo) {
                this.fireSectionDrop(oInfo.getParameters());
            }.bind(this)
        });

        this.addDelegate({
            onsappageup: this._handleKeyboardPageNavigation.bind(this),
            onsappagedown: this._handleKeyboardPageNavigation.bind(this),
            onsapdown: this._handleKeyboardArrowNavigation.bind(this, false),
            onsapdownmodifiers: this._handleKeyboardArrowNavigation.bind(this, true),
            onsapup: this._handleKeyboardArrowNavigation.bind(this, false),
            onsapupmodifiers: this._handleKeyboardArrowNavigation.bind(this, true),
            onsaphome: this._handleKeyboardHomeEndNavigation.bind(this),
            onsaphomemodifiers: this._handleKeyboardHomeEndNavigation.bind(this),
            onsapend: this._handleKeyboardHomeEndNavigation.bind(this),
            onsapendmodifiers: this._handleKeyboardHomeEndNavigation.bind(this),

            onfocusin: this._saveFocus.bind(this),
            onsapskipback: this._handleSkipBack.bind(this),
            onsapskipforward: this._handleSkipForward.bind(this),
            onBeforeFastNavigationFocus: this._handleBeforeFastNavigationFocus.bind(this)
        });

        this._oSectionsChangeDetection = new ExtendedChangeDetection("sections", this);
        this._oSectionsChangeDetection.attachItemDeleted(this.invalidate, this);
        this._oSectionsChangeDetection.attachItemsReordered(this.invalidate, this);

        this._oInvisibleMessageInstance = InvisibleMessage.getInstance();
    };

    /**
     * Gets called on every focusin event within this control/ custom fastnavgroup.
     * Saves the last focused visualization and section to a private variable.
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._saveFocus = function (oEvent) {
        var oSrcControl = oEvent.srcControl;

        // Section Control
        if (oSrcControl.isA("sap.m.VBox")) {
            var oSection = oSrcControl.getParent();
            if (oSection) {
                // Check whether the focused section changed
                if (oSection.indexOfVisualization(this._oLastFocusedViz) === -1) {
                    this._oLastFocusedViz = oSection.getVisualizations()[0];
                    // this is only set if the focused section is empty
                    this._oLastFocusedSection = this._oLastFocusedViz ? undefined : oSection;
                }
            } else {
                this._oLastFocusedViz = undefined;
                this._oLastFocusedSection = undefined;
            }
        // Visualization Control
        } else if (oSrcControl.isA("sap.f.GridContainer")) {
            var aGridItems = oSrcControl.getItems();

            this._oLastFocusedViz = aGridItems.find(function (oControl) {
                var oDomRef = oControl.getDomRef();
                return oDomRef && oDomRef.parentNode === oEvent.target;
            });
        } else if (oSrcControl.isA("sap.ushell.ui.launchpad.VizInstanceLink")) {
            // If the focused control is a vizInstance, we can directly save it to restore focus later.
            this._oLastFocusedViz = oSrcControl;
        }
    };

    /**
     * Gets called on backward fast navigation within this control/ custom fastnavgroup
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._handleSkipBack = function (oEvent) {
        if (this.getEdit()) {
            var oTarget;
            var oSrcControl = oEvent.srcControl;

            // focus is on visualization and needs to move to the section
            if (oSrcControl.isA("sap.f.GridContainer") || oSrcControl.isA("sap.ushell.ui.launchpad.VizInstanceLink")) {
                oTarget = this._getAncestorSection(oSrcControl);
            }

            if (oTarget) {
                oEvent.preventDefault();
                oTarget.focus();
            }
        }
    };

    /**
     * Gets called on forward fast navigation within this control/ custom fastnavgroup
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._handleSkipForward = function (oEvent) {
        var oTarget, oSection;
        var oSrcControl = oEvent.srcControl;

        // focus is on section and needs to move to the visualization
        if (oSrcControl.isA("sap.m.VBox")) {
            oSection = oSrcControl.getParent();
        }

        if (oSection) {
            // check whether the last focused viz is contained by the section
            if (oSection.indexOfVisualization(this._oLastFocusedViz) !== -1) {
                oTarget = this._oLastFocusedViz;
            // default to the first visualization in the section
            } else {
                oTarget = oSection.getAllItems()[0];
            }
        }

        if (oTarget) {
            oEvent.preventDefault();
            this._focusVisualization(oTarget);
        }
        // focus needs to move to the next fastnavgroup
    };

    /**
     * Gets called when f6 handling is about to focus this control/ custom fastnavgroup
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._handleBeforeFastNavigationFocus = function (oEvent) {
        var aSections = this.getSections();
        var bEdit = this.getEdit();

        // There is a last focused viz / section

        if (bEdit && this._oLastFocusedSection) {
            // There is a last focused section
            this._oLastFocusedSection.focus();
        } else if (bEdit && oEvent.forward && this._oLastFocusedViz) {
            // Focus moves from menuBar to page
            this._getAncestorSection(this._oLastFocusedViz).focus();
        } else if (this._oLastFocusedViz && this._oLastFocusedViz.getDomRef()) {
            // There is a last focused viz
            this._focusVisualization(this._oLastFocusedViz);
        } else if (bEdit && oEvent.forward && aSections.length > 0) {

            // There is no last focused viz / section

            // Focus moves from menuBar to page
            // Default to the first section
            this._getFirstVisibleSection().focus();
        } else if (bEdit && !oEvent.forward && aSections.length > 0) {
            // Focus moves from closeBar to page
            // Default to the first viz within the first section

            var oFirstSection = aSections[0];

            if (oFirstSection.getAllItems().length === 0) {
                oFirstSection.focus();
            } else {
                this._focusVisualization(oFirstSection.getAllItems()[0]);
            }
        } else {
            // If we are not in edit mode, only visualizations can be focused, not sections.

            var oSection = aSections.find(function (section) {
                return section.getDomRef() && section.getAllItems().length > 0;
            });

            this._focusVisualization(oSection.getAllItems()[0]);
        }

        oEvent.preventDefault();
    };

    /**
     * Finds the ancestor section control of a control
     * @param {sap.ui.core.Control} oControl A control
     *
     * @returns {sap.ushell.ui.launchpad.Section} The parent section or null
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._getAncestorSection = function (oControl) {
        if (!oControl) {
            return null;
        }

        if (oControl.isA("sap.ushell.ui.launchpad.Section")) {
            return oControl;
        } else if (oControl.getParent) {
            return this._getAncestorSection(oControl.getParent());
        }
        return null;
    };

    Page.prototype.exit = function () {
        this._oDragDropInfo.destroy();
        this._oSectionsChangeDetection.destroy();
    };

    Page.prototype.onBeforeRendering = function () {
        var iNrOfSections = this.getSections().length;
        var aAddSectionButtons = this.getAggregation("_addSectionButtons") || [];
        var oAddSectionButton;

        // must always have at least one button (e.g. on an empty page/no sections)
        // on non-empty pages, index 0 button is hidden, so first visible button is index 1 then
        for (var i = aAddSectionButtons.length; i < iNrOfSections + 1; i++) {
            oAddSectionButton = new Button({
                type: ButtonType.Transparent,
                icon: "sap-icon://add",
                text: resources.i18n.getText("Page.Button.AddSection"),
                press: this.fireAddSectionButtonPressed.bind(this, { index: i })
            });
            oAddSectionButton.addStyleClass("sapUshellPageAddSectionButton");
            this.addAggregation("_addSectionButtons", oAddSectionButton);
        }
    };

    Page.prototype.getFocusDomRef = function () {
        var aAddSectionButtons = this.getAggregation("_addSectionButtons") || [];

        if (!this.getSections().length && aAddSectionButtons.length && this.getEdit()) {
            return aAddSectionButtons[0].getFocusDomRef();
        }
        return this.getDomRef();
    };

    Page.prototype.setEnableSectionReordering = function (value) {
        if (value === undefined || this.getEnableSectionReordering() === value) {
            return this;
        }
        this.setProperty("enableSectionReordering", !!value, true);

        if (value) {
            this.addDragDropConfig(this._oDragDropInfo);
        } else {
            this.removeDragDropConfig(this._oDragDropInfo);
        }

        return this;

    };

    Page.prototype.setNoSectionsText = function (text) {
        if (text === undefined || this.getNoSectionsText() === text) {
            return this;
        }
        this.setProperty("noSectionsText", text, true);

        var oNoSectionText = this.getAggregation("_noSectionText");
        oNoSectionText.setText(text || resources.i18n.getText("Page.NoSectionText"));

        return this;
    };

    /**
     * Sets focus onto the given visualization.
     * If the visualization is a Link (compact visualization), it can directly be focused, whereas for other
     * visualizations the parent element has to be focused.
     *
     * @param {sap.ui.core.Control} visualization The visualization to be focused.
     * @private
     */
    Page.prototype._focusVisualization = function (visualization) {
        if (!visualization) {
            return;
        } else if (visualization.isA("sap.ushell.ui.launchpad.VizInstanceLink")) {
            visualization.focus();
        } else {
            visualization.getDomRef().parentElement.focus();
        }
    };

    /**
     * Handles the keyboard navigation of visualizations across sections.
     *
     * @param {object} oInfo An object that contains instructions on what visualization to focus next.
     *
     * @private
     */
    Page.prototype._focusNextVisualization = function (oInfo) {
        var aSections = this.getSections();
        var iSectionIndex = this.indexOfSection(oInfo.section);
        var oOrigEvent = oInfo.event.getParameter ? oInfo.event.getParameter("event") : oInfo.event;
        var oDomRef = oOrigEvent.target.firstElementChild;
        var oSection,
            bFocused;

        while (true) {
            if (oInfo.direction === "up") {
                iSectionIndex--;
            } else {
                iSectionIndex++;
            }

            oSection = aSections[iSectionIndex];
            if (!oSection) {
                return;
            }
            bFocused = oSection.focusVisualization({
                keycode: oOrigEvent.keyCode,
                ref: oDomRef
            });
            if (bFocused) {
                oOrigEvent.preventDefault();
                return;
            }
        }
    };

    /**
     * Handles the focus change of the page up & down keys.
     *
     * @param {jQuery.Event} oEvent The keyboard event.
     *
     * @private
     */
    Page.prototype._handleKeyboardPageNavigation = function (oEvent) {
        if (this._isFocusInInput()) {
            return;
        }

        var aSections = this.getSections();

        for (var i = 0; i < aSections.length; i++) {
            var oSectionDomRef = aSections[i].getDomRef();

            if (oSectionDomRef.contains(window.document.activeElement)) {
                this._focusNextVisualization({
                    event: oEvent,
                    section: aSections[i],
                    direction: oEvent.type === "sappagedown" ? "down" : "up",
                    prefIndex: 0
                });
                return;
            }
        }
    };

    /**
     * Handles the reordering and focus change of the arrow keys.
     *
     * @param {boolean} bMove If a section should be moved.
     * @param {jQuery.Event} oEvent The keyboard event.
     *
     * @private
     */
    Page.prototype._handleKeyboardArrowNavigation = function (bMove, oEvent) {
        if ((bMove && !this.getEnableSectionReordering()) || (bMove && !oEvent.ctrlKey)) {
            return;
        }

        var aSections = this.getSections();
        var oPreviousSection,
            oSection,
            oNextSection;

        for (var i = 0; i < aSections.length; i++) {
            oPreviousSection = aSections[i - 1];
            oSection = aSections[i];
            oNextSection = aSections[i + 1];

            if (window.document.activeElement === oSection.getFocusDomRef()) {
                if (oEvent.type === "sapup" && oPreviousSection) {
                    oPreviousSection.focus();
                } else if (oEvent.type === "sapdown" && oNextSection) {
                    oNextSection.focus();
                } else if (oEvent.type === "sapupmodifiers" && oPreviousSection) {
                    if (oPreviousSection.getDefault()) { // Do not drag over the default section
                        return;
                    }
                    this.fireSectionDrop({
                        draggedControl: oSection,
                        droppedControl: oPreviousSection,
                        dropPosition: "Before"
                    });
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                } else if (oEvent.type === "sapdownmodifiers" && oNextSection) {
                    if (oSection.getDefault()) { // Do not drag the default section
                        return;
                    }
                    this.fireSectionDrop({
                        draggedControl: oSection,
                        droppedControl: oNextSection,
                        dropPosition: "After"
                    });
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                }
                return;
            }
        }
    };


    /**
     * checks if focus is in input field
     * @returns {boolean} true if focus is in Input field
     */
    Page.prototype._isFocusInInput = function () {
        var sTagName = (document.activeElement || {}).tagName;
        return sTagName === "INPUT" || sTagName === "TEXTAREA";
    };

    /**
     * Handles the home and end key focus change.
     *
     * @param {jQuery.Event} oEvent The keyboard event.
     *
     * @private
     */
    Page.prototype._handleKeyboardHomeEndNavigation = function (oEvent) {
        if (this._isFocusInInput()) {
            return;
        }

        var oSection, aItems;
        /*Hint for future debugging:
        The GridContainer currently has its own logic regarding HOME/END navigation.
        Therefore the HOME/END navigation happens per area and not per section.*/

        var bLast = false;
        if (oEvent.type === "saphome") {
            // Go to first viz in current section / area
            aItems = this._getSectionAreaItems(oEvent.srcControl);
        } else if (oEvent.type === "saphomemodifiers") {
            // Go to first viz in first visible section
            oSection = this._getFirstVisibleSection(true);
        } else if (oEvent.type === "sapend") {
            // Go to last viz in current section
            aItems = this._getSectionAreaItems(oEvent.srcControl);
            bLast = true;
        } else if (oEvent.type === "sapendmodifiers") {
            // Go to last viz in last visible section
            oSection = this._getLastVisibleSection(true);
            bLast = true;
        }

        if (oSection) {
            aItems = oSection.getAllItems();
        }

        if (bLast) {
            this._focusVisualization(aItems[aItems.length - 1]);
        } else {
            this._focusVisualization(aItems[0]);
        }

        oEvent.preventDefault();
        oEvent.stopPropagation();
    };

    Page.prototype._getFirstVisibleSection = function (bAtLeastOneViz) {
        var aSections = this.getSections();

        return aSections.find(function (oSection) {
            return this._isSectionVisible(oSection, bAtLeastOneViz);
        }.bind(this));
    };

    Page.prototype._getLastVisibleSection = function (bAtLeastOneViz) {
        var aSections = this.getSections().reverse();

        return aSections.find(function (oSection) {
            return this._isSectionVisible(oSection, bAtLeastOneViz);
        }.bind(this));
    };

    Page.prototype._isSectionVisible = function (section, bAtLeastOneViz) {
        var bEdit = bAtLeastOneViz ? false : this.getEdit();

        return bEdit || section.getVisualizations().length > 0 && section.getDomRef() && section.getShowSection();
    };

    /**
     * Returns the visualizations of the area the visualization is part of
     * @param {object} oElement The element
     * @returns {object[]} An array of all visualizations contained by the area
     *
     * @private
     * @since 1.91.0
     */
    Page.prototype._getSectionAreaItems = function (oElement) {
        var aItems, sDisplayFormat;

        // get displayFormat assuming the element is a visualization
        var oBindingContext = oElement.getBindingContext();
        if (oBindingContext) {
            sDisplayFormat = oBindingContext.getProperty("displayFormatHint");
        }

        var aSections = this.getSections();
        var oTargetSection = aSections.find(function (oSection) {
            var oDomRef = oSection.getDomRef();
            return oDomRef && oDomRef.contains(oElement.getDomRef());
        });

        if (oTargetSection) {
            switch (sDisplayFormat) {
                case DisplayFormat.Compact:
                    return oTargetSection.getCompactItems();
                case DisplayFormat.Standard:
                case DisplayFormat.StandardWide:
                    return oTargetSection.getDefaultItems();
                case DisplayFormat.Flat:
                case DisplayFormat.FlatWide:
                    return oTargetSection.getFlatItems();
                default:
                    // default to the first non empty area
                    aItems = oTargetSection.getDefaultItems();
                    if (aItems.length > 0) {
                        return aItems;
                    }
                    aItems = oTargetSection.getFlatItems();
                    if (aItems.length > 0) {
                        return aItems;
                    }
                    aItems = oTargetSection.getCompactItems();
                    return aItems;
            }
        }
        return [];
    };

    Page.prototype._getCurrentlyFocusedSection = function () {
        var aSections = this.getSections();
        var oCurrentlyFocusedElement = window.document.activeElement;

        return aSections.find(function (oSection) {
            return oSection.getDomRef().contains(oCurrentlyFocusedElement);
        });
    };

    /**
     * Handles the borderReached event of a Section.
     *
     * @param {object} oInfo The borderReached event.
     *
     * @private
     */
    Page.prototype._handleSectionBorderReached = function (oInfo) {
        this._focusNextVisualization(oInfo.getParameters());
    };

    Page.prototype.addAggregation = function (sAggregationName, oObject) {
        Control.prototype.addAggregation.apply(this, arguments);

        if (sAggregationName === "sections") {
            oObject.attachEvent("borderReached", this._handleSectionBorderReached.bind(this));
        }

        return this;
    };

    Page.prototype.insertAggregation = function (sAggregationName, oObject/*, iIndex*/) {
        Control.prototype.insertAggregation.apply(this, arguments);

        if (sAggregationName === "sections") {
            oObject.attachEvent("borderReached", this._handleSectionBorderReached.bind(this));
        }

        return this;
    };

    Page.prototype.announceMove = function () {
        var sSectionMovedMessage = resources.i18n.getText("PageRuntime.Message.SectionMoved");
        this._oInvisibleMessageInstance.announce(sSectionMovedMessage, InvisibleMessageMode.Polite);
    };

    return Page;
});
