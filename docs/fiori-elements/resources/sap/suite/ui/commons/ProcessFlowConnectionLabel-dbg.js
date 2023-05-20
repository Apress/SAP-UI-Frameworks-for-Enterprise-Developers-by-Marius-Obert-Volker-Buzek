/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.ProcessFlowConnectionLabel.
sap.ui.define(['sap/m/Button', './library', 'sap/ui/core/InvisibleText', './ProcessFlowConnectionLabelRenderer'],
	function(Button, library, InvisibleText, ProcessFlowConnectionLabelRenderer) {
	"use strict";

	/**
	 * Constructor for a new ProcessFlowConnectionLabel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control is used inside the ProcessFlow control providing information on connections. Using this control, you need to take care of the lifetime handling instance as instances of this control are not destroyed automatically.
	 * @extends sap.m.Button
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.ProcessFlowConnectionLabel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ProcessFlowConnectionLabel = Button.extend("sap.suite.ui.commons.ProcessFlowConnectionLabel", /** @lends sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype */ {
		metadata : {
			library : "sap.suite.ui.commons",
			properties : {
				/**
				 * Priority is used to define which label is visible if the state of multiple labels is equal. Assuming there are multiple labels with equal state (e.g. Negative state appears twice), the priority decides which one needs to be selected.
				 */
				priority : {type : "int", group : "Misc", defaultValue : 0},

				/**
				 * Specifies the state of the connection label. If multiple labels are available for one connection, the label will be selected by state based on the following order: Neutral -> Positive -> Critical -> Negative.
				 */
				state : {type : "sap.suite.ui.commons.ProcessFlowConnectionLabelState", group : "Appearance", defaultValue : "Neutral"}
			}
		}
	});

	/**
	 * This file defines the behavior for the control.
	 */
	ProcessFlowConnectionLabel.prototype._bNavigationFocus = false;
	ProcessFlowConnectionLabel.prototype._bSelected = false;
	ProcessFlowConnectionLabel.prototype._bHighlighted = false;
	ProcessFlowConnectionLabel.prototype.ACTIVE_CSS_CLASS = "sapSuiteUiCommonsProcessFlowLabelActive";
	ProcessFlowConnectionLabel.prototype.HOVER_CSS_CLASS = "sapSuiteUiCommonsProcessFlowLabelHover";
	ProcessFlowConnectionLabel.prototype.MOUSE_EVENTS = "mouseenter mousedown mouseup mouseleave";
	/* resource bundle for the localized strings */
	ProcessFlowConnectionLabel.prototype._oResBundle = null;
	ProcessFlowConnectionLabel.prototype._bDimmed = false;

	/* =========================================================== */
	/* Life-cycle Handling                                          */
	/* =========================================================== */

	ProcessFlowConnectionLabel.prototype.init = function () {
		//Handle base class call
		if (Button.prototype.init) {
			Button.prototype.init.apply(this, arguments);
		}

		this.addStyleClass("sapSuiteUiCommonsProcessFlowConnectionLabel");
		if (!this._oResBundle) {
			this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		}
	};

	ProcessFlowConnectionLabel.prototype.exit = function () {
		this.$().off(this.MOUSE_EVENTS, this._handleEvents);
	};

	ProcessFlowConnectionLabel.prototype.onBeforeRendering = function () {
		this.$().off(this.MOUSE_EVENTS, this._handleEvents);
		this._configureStateClasses();
		this._setLabelWidth();
		this._setAriaDetails();
	};

	ProcessFlowConnectionLabel.prototype.onAfterRendering = function () {
		if (!this.getText()){
			if (this.$().children().hasClass("sapMBtnIconFirst")) {
				this.$().children().removeClass("sapMBtnIconFirst");
			}
		}
		this.$().bind(this.MOUSE_EVENTS, this._handleEvents.bind(this));
		document.getElementById(this.getId()).setAttribute("aria-haspopup", "dialog");
	};

	/* =========================================================== */
	/* Event Handling                                              */
	/* =========================================================== */

	/**
	 * General event handler.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The original event object
	 */
	ProcessFlowConnectionLabel.prototype._handleEvents = function (oEvent) {
		var oProcessFlowClass = sap.ui.require("sap/suite/ui/commons/ProcessFlow");
		if (!oProcessFlowClass) {
			return;
		}
		switch (oEvent.type) {
			case oProcessFlowClass._mouseEvents.mouseEnter:
				this.$().find("*").addClass(this.HOVER_CSS_CLASS);
				break;
			case oProcessFlowClass._mouseEvents.mouseDown:
				this.$().find("*").removeClass(this.HOVER_CSS_CLASS);
				this.$().find("*").addClass(this.ACTIVE_CSS_CLASS);
				break;
			case oProcessFlowClass._mouseEvents.mouseUp:
				this.$().find("*").removeClass(this.ACTIVE_CSS_CLASS);
				this.$().find("*").addClass(this.HOVER_CSS_CLASS);
				break;
			case oProcessFlowClass._mouseEvents.mouseLeave:
				this.$().find("*").removeClass(this.ACTIVE_CSS_CLASS);
				this.$().find("*").removeClass(this.HOVER_CSS_CLASS);
				break;
			default:
		}
	};

	/* =========================================================== */
	/* Getter/Setter private methods                               */
	/* =========================================================== */

	/**
	 * Gets the current navigation focus.
	 *
	 * @private
	 * @returns {boolean} Internal state of navigation focus enablement
	 */
	ProcessFlowConnectionLabel.prototype._getNavigationFocus = function () {
		return this._bNavigationFocus;
	};

	/**
	 * Sets the current navigation focus.
	 *
	 * @private
	 * @param {boolean} navigationFocus Whether navigation focus is enabled or not
	 */
	ProcessFlowConnectionLabel.prototype._setNavigationFocus = function (navigationFocus) {
		this._bNavigationFocus = navigationFocus;
	};

	/**
	 * Get the selected value.
	 *
	 * @private
	 * @param {boolean} selected Whether the label is selected or not
	 */
	ProcessFlowConnectionLabel.prototype._setSelected = function (selected) {
		this._bSelected = selected;
	};

	/**
	 * Sets the selected value.
	 *
	 * @private
	 * @returns {boolean} True if the label is selected, otherwise false
	 */
	ProcessFlowConnectionLabel.prototype._getSelected = function () {
		return this._bSelected;
	};

	/**
	 * Sets the highlighted value.
	 *
	 * @private
	 * @param {boolean} highlighted Whether the label is highlighted or not
	 */
	ProcessFlowConnectionLabel.prototype._setHighlighted = function (highlighted) {
		this._bHighlighted = highlighted;
	};

	/**
	 * Get the highlighted value.
	 *
	 * @private
	 * @returns {boolean} Whether the label is highlighted or not
	 */
	ProcessFlowConnectionLabel.prototype._getHighlighted = function () {
		return this._bHighlighted;
	};

	/**
	 * Sets the dimmed value.
	 *
	 * @private
	 * @param {boolean} dimmed The label is dimmed or not
	 */
	ProcessFlowConnectionLabel.prototype._setDimmed = function (dimmed) {
		this._bDimmed = dimmed;
	};

	/**
	 * Get the dimmed value.
	 *
	 * @private
	 * @returns {boolean} Whether the label is dimmed or not
	 */
	ProcessFlowConnectionLabel.prototype._getDimmed = function () {
		return this._bDimmed;
	};

	/**
	 * Overwrites setWidth of base control.
	 * Avoids manual set of width. Only possible in init by control itself.
	 *
	 * @private
	 */
	ProcessFlowConnectionLabel.prototype.setWidth = function () {
		return this;
	};

	/**
	 * Overwrites setIconFirst of base control.
	 * Avoids manual set of iconFirst. Not supported by control.
	 *
	 * @private
	 */
	ProcessFlowConnectionLabel.prototype.setIconFirst = function () {
		return this;
	};

	/**
	 * Sets the width of the label, based on icon and text.
	 *
	 * @private
	 */
	ProcessFlowConnectionLabel.prototype._setLabelWidth = function () {
		if (this.getIcon()) {
			if (this.getText()) {
				this.setProperty("width", "4.5rem", false);
			} else {
				this.setProperty("width", "2rem", false);
			}
		} else if (this.getText() && this.getText().length > 2) {
			this.setProperty("width", "4.5rem", false);
		} else {
			this.setProperty("width", "2rem", false);
		}
	};

	/* =========================================================== */
	/* Helper methods                                              */
	/* =========================================================== */

	/**
	 * Configures the CSS classes based on state.
	 *
	 * @private
	 */
	ProcessFlowConnectionLabel.prototype._configureStateClasses = function () {
		switch (this.getState()) {
			case library.ProcessFlowConnectionLabelState.Positive:
				this.addStyleClass("sapSuiteUiCommonsLabelStatePositive");
				break;
			case library.ProcessFlowConnectionLabelState.Critical:
				this.addStyleClass("sapSuiteUiCommonsLabelStateCritical");
				break;
			case library.ProcessFlowConnectionLabelState.Negative:
				this.addStyleClass("sapSuiteUiCommonsLabelStateNegative");
				break;
			default:
				this.addStyleClass("sapSuiteUiCommonsLabelStateNeutral");
		}

		if (this._getDimmed() && this.getEnabled()) {
			this.addStyleClass("sapSuiteUiCommonsLabelDimmed");
		} else {
			this.removeStyleClass("sapSuiteUiCommonsLabelDimmed");
		}
		if (this._getSelected()) {
			this.addStyleClass("sapSuiteUiCommonsLabelSelected");
		} else {
			this.removeStyleClass("sapSuiteUiCommonsLabelSelected");
		}
		if (this._getHighlighted()) {
			this.addStyleClass("sapSuiteUiCommonsLabelHighlighted");
		} else {
			this.removeStyleClass("sapSuiteUiCommonsLabelHighlighted");
		}
	};

	/**
	 * Sets the ARIA details.
	 *
	 * @private
	 */
	ProcessFlowConnectionLabel.prototype._setAriaDetails = function() {
		//General information that the control is a connection label
		var oInvisibleLabelText = new InvisibleText();
		oInvisibleLabelText.setText(this._oResBundle.getText('PF_CONNECTIONLABEL'));
		oInvisibleLabelText.toStatic(); //Be aware that without a call the screen reader does not read the content.

		if (this.getAriaLabelledBy().length === 0) {
			this.addAriaLabelledBy(oInvisibleLabelText);
		}
	};


	return ProcessFlowConnectionLabel;

});
