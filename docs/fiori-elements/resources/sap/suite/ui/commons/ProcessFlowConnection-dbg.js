/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.ProcessFlowConnection.
sap.ui.define([ './library', 'sap/ui/core/Control', './ProcessFlowConnectionRenderer' ],
	function(library, Control, ProcessFlowConnectionRenderer) {
	"use strict";

	/**
	 * Constructor for a new ProcessFlowConnection.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control is used inside the ProcessFlow control to connect process flow node A with process flow node B in respect to the style(x) chosen by the application.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.ProcessFlowConnection
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ProcessFlowConnection = Control.extend("sap.suite.ui.commons.ProcessFlowConnection", /** @lends sap.suite.ui.commons.ProcessFlowConnection.prototype */ { metadata : {
		library : "sap.suite.ui.commons",
		properties : {
			/**
			 * This is an array of the following attributes for one element:
			 * 1. flowLine (string) - A connection definition where the line should be drawn. A string which defines a course of a flow line. A flow line is a connection between nodes in a process flow control. The string can contain the following characters:
			 * - "r" for right,
			 * - "t" for top,
			 * - "l" for left,
			 * - "b" for bottom.
			 * 2. targetNodeState (ProcessFlowNodeState) - A copy of the target node status. If the target node is created, the line is solid.
			 * If the target node is planned, the line is dashed.
			 * 3. displayState (ProcessFlowDisplayState) - Display state of the node. This property defines if the node is displayed regularly, highlighted, or dimmed in combination with a selected visual style of the control.
			 * 4. hasArrow (boolean) - Indicates if the line has an arrow on the right end.
			 */
			drawData : {type : "object[]", group : "Misc", defaultValue : null},

			/**
			 * This is a current zoom level for the connection. The point of connection to the node is derived from zoom level.
			 */
			zoomLevel : {type : "sap.suite.ui.commons.ProcessFlowZoomLevel", group : "Misc", defaultValue : "Two"},

			/**
			 * Type of the connection.
			 * @deprecated Since version 1.32.
			 * Type is deprecated because of no usages. There will be no replacement.
			 */
			type : {type : "sap.suite.ui.commons.ProcessFlowConnectionType", group : "Appearance", defaultValue : "Normal", deprecated: true},

			/**
			 * State of the connection.
			 * @deprecated Since version 1.32.
			 * State is deprecated because of no usages. There will be no replacement.
			 */
			state : {type : "sap.suite.ui.commons.ProcessFlowConnectionState", group : "Appearance", defaultValue : "Regular", deprecated: true}
		},
		defaultAggregation : "_labels",
		aggregations : {

			/**
			 * Specifies the ProcessFlowConnectionLabels for the current ProcessFlowConnection.
			 */
			_labels : {type : "sap.suite.ui.commons.ProcessFlowConnectionLabel", multiple : true, singularName : "_label", visibility : "hidden"}
		}
	}});

	/* Resource bundle for the localized strings. */
	ProcessFlowConnection.prototype._oResBundle = null;

	/* Internal property to hand over showLabels from parent control. */
	ProcessFlowConnection.prototype._showLabels = false;

	/* Defines the order of states from low to high priority. */
	ProcessFlowConnection.prototype._oStateOrderMapping = null;

	/* =========================================================== */
	/* Life-cycle Handling                                         */
	/* =========================================================== */

	ProcessFlowConnection.prototype.init = function () {
		if (!this._oResBundle) {
			this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		}

		this._oStateOrderMapping = {};
		this._oStateOrderMapping[library.ProcessFlowConnectionLabelState.Neutral] = 1;
		this._oStateOrderMapping[library.ProcessFlowConnectionLabelState.Positive] = 2;
		this._oStateOrderMapping[library.ProcessFlowConnectionLabelState.Critical] = 3;
		this._oStateOrderMapping[library.ProcessFlowConnectionLabelState.Negative] = 4;
	};

	/* =========================================================== */
	/* Getter/Setter private methods                               */
	/* =========================================================== */

	/**
	 * Returns ARIA text for current connection object.
	 *
	 * @private
	 * @param {object} traversedConnection The traversed connection object
	 * @returns {string} The ARIA result text for the connection
	 */
	ProcessFlowConnection.prototype._getAriaText = function (traversedConnection) {
		var sAriaText = "";
		var sAddArrowValue = " " + this._oResBundle.getText('PF_CONNECTION_ENDS');
		if (this._isHorizontalLine(traversedConnection)) {
			sAriaText = this._oResBundle.getText('PF_CONNECTION_HORIZONTAL_LINE');
			if (traversedConnection.arrow) {
				sAriaText += sAddArrowValue;
			}
		} else if (this._isVerticalLine(traversedConnection)) {
			sAriaText = this._oResBundle.getText('PF_CONNECTION_VERTICAL_LINE');
			if (traversedConnection.arrow) {
				sAriaText += sAddArrowValue;
			}
		} else {
			sAriaText = this._oResBundle.getText('PF_CONNECTION_BRANCH');
			if (traversedConnection.arrow) {
				sAriaText += sAddArrowValue;
			}
		}
		return sAriaText;
	};

	/**
	 * Returns the visible label. If multiple labels are available for one connection,
	 * the label will be selected by state and priority.
	 * The first criteria is state, based on the order 'Neutral --> Positive --> Critical --> Negative'
	 * Assuming there are multiple entries with the same state (e.g. 2x Negative),
	 * the priority decides which one needs to be selected.
	 *
	 * @private
	 * @returns {sap.suite.ui.commons.ProcessFlowConnectionLabel} The visible label
	 */
	ProcessFlowConnection.prototype._getVisibleLabel = function () {
		var oVisibleLabel = null;

		if (this.getAggregation("_labels")) {
			var aLabels = this.getAggregation("_labels");
			for (var i = 0; i < aLabels.length; i++) {
				var oCurrentLabel = aLabels[i];
				if (oCurrentLabel && oCurrentLabel.getMetadata().getName() === "sap.suite.ui.commons.ProcessFlowConnectionLabel") {
					if (oVisibleLabel) {
						//Selects label to render, based on state.
						if (this._oStateOrderMapping[oVisibleLabel.getState()] < this._oStateOrderMapping[oCurrentLabel.getState()]) {
							oVisibleLabel = oCurrentLabel;
						} else if (this._oStateOrderMapping[oVisibleLabel.getState()] === this._oStateOrderMapping[oCurrentLabel.getState()]) {
							//Selects label to render, based on priority. This is only relevant, if state is the same.
							if (oVisibleLabel.getPriority() < oCurrentLabel.getPriority()) {
								oVisibleLabel = oCurrentLabel;
							}
						}
					} else {
						oVisibleLabel = oCurrentLabel;
					}
				}
			}
		}

		return oVisibleLabel;
	};

	/**
	 * Returns the internal value for showLabels.
	 *
	 * @private
	 * @returns {boolean} The showLabels value
	 */
	ProcessFlowConnection.prototype._getShowLabels = function () {
		return ProcessFlowConnection.prototype._showLabels;
	};

	/**
	 * Sets the internal value for showLabels.
	 *
	 * @private
	 * @param {boolean} showLabels The showLabels value to set
	 */
	ProcessFlowConnection.prototype._setShowLabels = function (showLabels) {
		ProcessFlowConnection.prototype._showLabels = showLabels;
	};

	/* =========================================================== */
	/* Helper methods                                              */
	/* =========================================================== */

	/**
	 * Create connection object depends on draw data.
	 *
	 * @private
	 * @returns {object} connection
	 */
	ProcessFlowConnection.prototype._traverseConnectionData = function () { // EXC_SAP_006_1
		var aConnectionData = this.getDrawData();
		if (!aConnectionData) {
			return {};
		}
		var oTraversedConnection = this._createConnection(aConnectionData);
		if (this.getAggregation("_labels")) {
			oTraversedConnection.labels = this.getAggregation("_labels");
		}
		return oTraversedConnection;
	};

	/**
	 * Checks if the given connection is a vertical line.
	 *
	 * @private
	 * @param {object} connection To retrieve information for vertical line from
	 * @returns {boolean} True if the line is vertical, otherwise false
	 */
	ProcessFlowConnection.prototype._isVerticalLine = function (connection) {
		return connection.hasOwnProperty("left") && !connection.left.draw && connection.hasOwnProperty("right") && !connection.right.draw &&
			connection.hasOwnProperty("top") && connection.top.draw && connection.hasOwnProperty("bottom") && connection.bottom.draw;
	};

	/**
	 * Checks if the given connection is a horizontal line.
	 *
	 * @private
	 * @param {object} connection To retrieve information for horizontal line from
	 * @returns {boolean} True if the line is horizontal, otherwise false
	 */
	ProcessFlowConnection.prototype._isHorizontalLine = function (connection) {
		return connection.hasOwnProperty("left") && connection.left.draw && connection.hasOwnProperty("right") && connection.right.draw &&
			connection.hasOwnProperty("top") && !connection.top.draw && connection.hasOwnProperty("bottom") && !connection.bottom.draw;
	};

	/**
	 * Creates the connection object using the connection data array.
	 * Connection in this context means all lines (top,right,bottom,left)
	 *
	 * @private
	 * @param {object[]} connectionData Array with connection data input to generate connection
	 * @returns {object} The generated connection
	 */
	ProcessFlowConnection.prototype._createConnection = function (connectionData) {
		var oLine = { draw: false, type: "", state: "" };
		var oConnection = { right: oLine, top: oLine, left: oLine, bottom: oLine, arrow: false };

		for (var i = 0; i < connectionData.length; i++) {
			oConnection.right = this._createLine(connectionData[i], "r", oConnection.right);
			oConnection.top = this._createLine(connectionData[i], "t", oConnection.top);
			oConnection.left = this._createLine(connectionData[i], "l", oConnection.left);
			oConnection.bottom = this._createLine(connectionData[i], "b", oConnection.bottom);

			if (connectionData[i].flowLine.indexOf("r") >= 0) {
				if (connectionData[i].hasArrow) {
					oConnection.arrow = true;
				}
			}
		}
		return oConnection;
	};

	/**
	 * Creates the line (element of connection) for the given direction based on the connection data.
	 * Line in this context means a specific line (e.g. left) of a connection.
	 *
	 * @private
	 * @param {object} connectionData Connection data input
	 * @param {string} direction Flag which direction is looked for
	 * @param {object} line Current line information
	 * @returns {object} The plain object containing connection line information
	 */
	ProcessFlowConnection.prototype._createLine = function (connectionData, direction, line) {
		var oLine = {
			draw: line.draw,
			type: line.type,
			state: line.state
		};
		if (connectionData.flowLine.indexOf(direction) >= 0) {
			oLine.draw = true;

			//Type
			if (connectionData.targetNodeState === library.ProcessFlowNodeState.Neutral ||
				connectionData.targetNodeState === library.ProcessFlowNodeState.Positive ||
				connectionData.targetNodeState === library.ProcessFlowNodeState.Negative ||
				connectionData.targetNodeState === library.ProcessFlowNodeState.Critical) {
				oLine.type = library.ProcessFlowConnectionType.Normal;
			} else if (connectionData.targetNodeState === library.ProcessFlowNodeState.Planned ||
				connectionData.targetNodeState === library.ProcessFlowNodeState.PlannedNegative) {
				// Planned state cannot override created state.
				if (oLine.type !== library.ProcessFlowConnectionType.Normal) {
					oLine.type = library.ProcessFlowConnectionType.Planned;
				}
			}

			//DisplayState
			if (connectionData.displayState === library.ProcessFlowDisplayState.Selected ||
				connectionData.displayState === library.ProcessFlowDisplayState.SelectedHighlighted ||
				connectionData.displayState === library.ProcessFlowDisplayState.SelectedHighlightedFocused ||
				connectionData.displayState === library.ProcessFlowDisplayState.SelectedFocused) {

				oLine.state = library.ProcessFlowConnectionState.Selected;

			} else if (connectionData.displayState === library.ProcessFlowDisplayState.Highlighted ||
				connectionData.displayState === library.ProcessFlowDisplayState.HighlightedFocused) {

				// Highlighted display state cannot override selected display state.
				if (oLine.state !== library.ProcessFlowConnectionState.Selected) {
					oLine.state = library.ProcessFlowConnectionState.Highlighted;
				}

			} else if (connectionData.displayState === library.ProcessFlowDisplayState.Regular ||
				connectionData.displayState === library.ProcessFlowDisplayState.RegularFocused) {

				// Regular display state cannot override selected or highlighted display states.
				if (oLine.state !== library.ProcessFlowConnectionState.Highlighted &&
					oLine.state !== library.ProcessFlowConnectionState.Selected) {
					oLine.state = library.ProcessFlowConnectionState.Regular;
				}

			} else if (connectionData.displayState === library.ProcessFlowDisplayState.Dimmed ||
				connectionData.displayState === library.ProcessFlowDisplayState.DimmedFocused) {

				// Dimmed display state cannot override highlighted, selected or regular display states.
				if (oLine.state !== library.ProcessFlowConnectionState.Highlighted &&
					oLine.state !== library.ProcessFlowConnectionState.Regular &&
					oLine.state !== library.ProcessFlowConnectionState.Selected) {
					oLine.state = library.ProcessFlowConnectionState.Dimmed;
				}
			}
		}
		return oLine;
	};

	/* =========================================================== */
	/* Public methods                                              */
	/* =========================================================== */

	ProcessFlowConnection.prototype.addConnectionData = function (singleConnectionData) {
		var oTempConnectionData = this.getDrawData();
		if (!oTempConnectionData) {
			oTempConnectionData = [];
		}
		oTempConnectionData.push(singleConnectionData);
		this.setDrawData(oTempConnectionData);
		return oTempConnectionData;
	};

	ProcessFlowConnection.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		this.removeAllAggregation("_labels", true);
	};


	return ProcessFlowConnection;

});
