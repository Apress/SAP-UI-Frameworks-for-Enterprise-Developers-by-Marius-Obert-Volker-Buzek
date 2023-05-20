/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.ProcessFlowLaneHeader.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/m/Image',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'sap/ui/core/Icon',
	"./ProcessFlowLaneHeaderRenderer"
], function(jQuery, Image, library, Control, IconPool, Device, Icon, ProcessFlowLaneHeaderRenderer) {
	"use strict";

	/**
	 * Constructor for a new ProcessFlowLaneHeader.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control gives you an overview of documents or items used in a process flow. The process flow is represented by donut chart sections that are colored according to the status of documents. This control can be used in two different ways. If you use it standalone, an event is triggered and can be caught to display the node map. If you use it with nodes or documents, it gives you an overview of the documents or items used in the process flow, which is represented by the donut chart sections.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.ProcessFlowLaneHeader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ProcessFlowLaneHeader = Control.extend("sap.suite.ui.commons.ProcessFlowLaneHeader", /** @lends sap.suite.ui.commons.ProcessFlowLaneHeader.prototype */ { metadata : {
		library : "sap.suite.ui.commons",
		properties : {
			/**
			 * Text information that is displayed in the control.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Icon to be displayed in the middle of the control.
			 */
			iconSrc : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * Position of the lane in the process flow control. Numbering of the position has to be sequential and needs to start from 0.
			 */
			position : {type : "int", group : "Misc", defaultValue : null},

			/**
			 * Internal identification of the header.
			 */
			laneId : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Array of the ProcessFlowLaneState. The user can explicitly set an array with the two properties state and value of the state, for example [state:sap.suite.ui.commons.ProcessFlowNodeState.Neutral, value: 20]. Possible states are states are positive, negative, neutral, and planned.
			 */
			state : {type : "object", group : "Misc", defaultValue : null},

			/**
			 * Current zoom level for the lane header.
			 */
			zoomLevel : {type : "sap.suite.ui.commons.ProcessFlowZoomLevel", group : "Misc", defaultValue : null}
		},
		events : {
			/**
			 * This event is fired when the header is clicked.
			 */
			press : {
				parameters : {

					/**
					 * tbd
					 */
					oEvent : {type : "object"}
				}
			}
		}
	}});

	/*
	 * Resource bundle for the localized strings
	 */
	ProcessFlowLaneHeader.prototype._oResBundle = null;

	ProcessFlowLaneHeader.prototype._mergedLanePosition = null;

	/**
	 * Symbol type enumeration. Describes the type of the rendered control.
	 * @static
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.symbolType = {
		startSymbol: "startSymbol",
		endSymbol: "endSymbol",
		processSymbol: "processSymbol",
		standardType: "standardType"
	};

	/**
	 * ProcessFlowLineHeader constants.
	 * @static
	 * @since 1.22
	 */
	ProcessFlowLaneHeader._constants = {
		halfGapSize: 0.0241, // half gap size in radians (ca. 2 px for full gap) // 5
		minPercentage: 0.025, // 1/40, was halfGapSize / Math.PI (percentage equal to the size of the gap) = 0.0077
		ringThickness: 5,
		ringInnerRadius: 23,
		positionX: 32,
		positionY: 32,
		outerCircleRadius: 31,
		outerCircleStrokeColor: "OuterCircleStrikeColor", //used implicitly to set CSS class
		outerCircleStrokeWidth: 1,
		sectorPositiveColor: "suiteUiCommonsProcessFlowHeaderPositiveColor", // CSS class
		sectorNegativeColor: "suiteUiCommonsProcessFlowHeaderNegativeColor", // CSS class
		sectorNeutralColor: "suiteUiCommonsProcessFlowHeaderNeutralColor", // CSS class
		sectorCriticalColor: "suiteUiCommonsProcessFlowHeaderCriticalColor", // CSS class
		sectorPlannedColor: "suiteUiCommonsProcessFlowHeaderPlannedColor", // CSS class
		ellipsis: '...',
		ellipsisLength: 3
	};

	/* =========================================================== */
	/* Life-cycle Handling                                         */
	/* =========================================================== */

	ProcessFlowLaneHeader.prototype.init = function() { // EXC_JSLINT_021
		this._virtualTableSpan = 1;

		if (!this._oResBundle) {
			this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		}
	};

	ProcessFlowLaneHeader.prototype.exit = function() {
		this._destroyImage();
		this.$().off("click", this.ontouchend);
	};

	ProcessFlowLaneHeader.prototype.onBeforeRendering = function() {
		this.$("lh-icon").off('click', jQuery.proxy(this.ontouchend, this));
		this.$().off("click", this.ontouchend);
	};

	ProcessFlowLaneHeader.prototype.onAfterRendering = function() {
		var $This = this.$();
		var $icon = this.$("lh-icon");
		var sClickEvent = 'click';

		if (Device.support.touch) {
			sClickEvent = 'touchend';
		}
		if ($icon.length > 0) {
			$icon.on(sClickEvent, jQuery.proxy(this.ontouchend, this));
			$icon.css("cursor", "inherit");
		}

		this.$().on("click", jQuery.proxy(this.ontouchend, this));

		if (this._isHeaderMode()) {
			$This.addClass("suiteUiProcessFlowLaneHeaderPointer");
		} else {
			$This.removeClass("suiteUiProcessFlowLaneHeaderPointer");
		}

		// FF long-word break does not work correct, so allow to break the words anywhere.
		if (Device.browser.mozilla) {
			this.$("lh-text").css("word-break", "break-all");
		}

		// insert ellipsis for non-webkit browsers
		if (!this._ellipsisDisabled && !ProcessFlowLaneHeader._hasNativeLineClamp) {
			this._clampText();
		}
	};

	/* =========================================================== */
	/* Event Handling                                              */
	/* =========================================================== */

	/**
	 * Press event handler for control click.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The original event object
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype.ontouchend = function(oEvent) {
		if (oEvent && !oEvent.isDefaultPrevented()) {
			oEvent.preventDefault();
		}
		if (this) {
			this.firePress(this);
		}
		if (oEvent && !oEvent.isPropagationStopped()) {
			oEvent.stopPropagation();
		}
		if (oEvent && !oEvent.isImmediatePropagationStopped()) {
			oEvent.stopImmediatePropagation();
		}
	};

	/* =========================================================== */
	/* Getter/Setter private methods                               */
	/* =========================================================== */

	/**
	 * Sets the position that was changed due to artificial lanes of a merged lane as hidden property.
	 * If it's not set here, the property _mergedLanePosition is false.
	 *
	 * @private
	 * @param {int} position The position in the merged lane
	 */
	ProcessFlowLaneHeader.prototype._setMergedPosition = function(position) {
		this._mergedLanePosition = position;
	};

	/**
	 * Getter method for the symbol type. Returns the type of the node (variation of Lane header control).
	 * For details on the available types see {sap.suite.ui.commons.ProcessFlowLaneHeader.prototype.symbolType}.
	 *
	 * @private
	 * @returns {string} symbol type to set for the control
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._getSymbolType = function() {
		return this._oSymbolType ? this._oSymbolType : ProcessFlowLaneHeader.symbolType.standardType;
	};

	/**
	 * Setter method for the symbol type. Specifies the type of the node to display.
	 * For details on the available types see {sap.suite.ui.commons.ProcessFlowLaneHeader.symbolType}.
	 *
	 * @private
	 * @param {string} symbolType symbol type to set for the control
	 * @param {object} context the JS object context
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._setSymbolType = function(symbolType, context) {
		context._oSymbolType = symbolType;
	};

	/**
	 * Gets the image control for the Header, creating it if it does not already exist.
	 * If the control is already created and the value of src has changed then the old control will be destroyed
	 * and a new control returned.
	 *
	 * @private
	 * @param {string} id The icon control id
	 * @param {sap.ui.core.URI} src The URI of the image
	 * @returns {sap.ui.core.Control} The new or modified image control
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._getImage = function(id, src) {
		this._destroyImage();

		if (this._oImageControl) {
			this._oImageControl.setSrc(src);
		} else {
			this._oImageControl = IconPool.createControlByURI(src, Image);
			this._oImageControl.sId = id;
			this._oImageControl.setParent(this, null, true);
		}

		//disable technical tooltip for all sap.ui.core.Icons
		if (this._oImageControl instanceof Icon) {
			this._oImageControl.setUseIconTooltip(false);
		}

		return this._oImageControl;
	};

	/**
	 * Header mode setter. Header mode is true when a hand cursor should be displayed above the control.
	 *
	 * @private
	 * @param {boolean} isHeaderMode true if in header mode
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._setHeaderMode = function(isHeaderMode) {
		this._bHeaderMode = isHeaderMode;
	};

	/**
	 * Setter for the virtual table span in PF node element count.
	 *
	 * @private
	 * @param {number} [elementsCount] number of PF node elements which will be under this header control
	 * @since 1.23
	 * @see sap.suite.ui.commons.sap.suite.ui.commons.ProcessFlowLaneHeader._setVirtualTableSpan
	 */
	ProcessFlowLaneHeader._setVirtualTableSpan = function(elementsCount) {
		this._virtualTableSpan = elementsCount;
	};

	/**
	 * Getter for the virtual table span in object count. The value is used by the PF renderer to set a colspan for 2*iElements+1 lanes to fit this lane header control.
	 * By default is set to 1;
	 *
	 * @private
	 * @returns {number} Number of PF node elements which will be under this header control
	 * @since 1.23
	 */
	ProcessFlowLaneHeader._getVirtualTableSpan = function() {
		return this._virtualTableSpan;
	};

	/**
	 * Header mode getter. Header mode is true when a hand cursor should be displayed above the control.
	 *
	 * @private
	 * @returns {boolean} true if the control is in header mode, false otherwise
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._isHeaderMode = function() {
		return this._bHeaderMode;
	};

	/* =========================================================== */
	/* Helper methods                                              */
	/* =========================================================== */

	/**
	 * Method clamps the values provided in the input array to 0 in case of values lower than minValue.
	 * The method modifies the input array to one with non-negative values.
	 *
	 * @private
	 * @param {number[]} clampValues array of values to clamp (array of numbers)
	 * @param {number} minValue minimal value which is still not clamped to clampToValue
	 * @param {number} clampToValue value set to clampValues[i] in case clampValues[i] < minValue
	 * @returns {boolean} true if at least 1 value was clamped
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._clampValues = function(clampValues, minValue, clampToValue) {
		var i = clampValues.length - 1,
			bClamped = false,
			v;

		while (i >= 0) {
			v = clampValues[i];
			if (v < minValue) {
				clampValues[i] = clampToValue;
				bClamped = true;
			}
			i--;
		}

		return bClamped;
	};

	/**
	 * Method re-scales the values in input array rescaleValues so their sum equals to 1.
	 * The method modifies the input array to a rescaled one.
	 * In case all the input values in rescaleValues are 0, the array is left unchanged.
	 * All the values between (0, minPercentage> are set to minPercentage and the rest is rescaled accounting this change.
	 *
	 * @private
	 * @param {number[]} rescaleValues array of values to re-scale (array of numbers)
	 * @param {number} minPercentage the minimal percentage to consider (lower values will be rounded up to this value)
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._rescaleToUnit = function(rescaleValues, minPercentage) {
		var iRescaledFactor,
			i,
			iValuesGreaterMinCount,
			iValuesLessMinCount,
			iRescaleOriginalValue,
			iRescaledValue;

		// if undefined, null or 0 minPercentage
		if (!minPercentage) {
			minPercentage = 0;
		}

		i = rescaleValues.length - 1;
		iRescaledFactor = 0;
		iValuesGreaterMinCount = iValuesLessMinCount = 0;

		while (i >= 0) {
			iRescaleOriginalValue = rescaleValues[i];
			if (iRescaleOriginalValue > 0) {
				if (iRescaleOriginalValue <= minPercentage) {
					iValuesLessMinCount++;
				} else {
					iRescaledFactor += rescaleValues[i];
				}
				iValuesGreaterMinCount++;
			}
			i--;
		}

		iRescaledFactor -= (iValuesGreaterMinCount - iValuesLessMinCount) * minPercentage;
		iRescaledValue = (1 - iValuesGreaterMinCount * minPercentage) / iRescaledFactor;

		i = rescaleValues.length - 1;
		while (i >= 0) {
			iRescaleOriginalValue = rescaleValues[i];
			if (iRescaleOriginalValue > 0) {
				if (iRescaleOriginalValue <= minPercentage) {
					rescaleValues[i] = minPercentage;
				} else {
					rescaleValues[i] = (iRescaleOriginalValue - minPercentage) * iRescaledValue + minPercentage;
				}
			}
			i--;
		}
	};

	/**
	 * Method retrieves the number of gaps to be put on the donut chart given the input percentages.
	 * Zero percentages are ignored. For the case of 1 value there is no gap to be displayed.
	 *
	 * @private
	 * @param {number[]} inputPercentages Array of input percentages (array of doubles)
	 * @returns {number} iGapsCount Number of gaps
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._countGaps = function(inputPercentages) {
		var i = inputPercentages.length - 1,
			iGapsCount = 0;

		while (i >= 0) {
			if (inputPercentages[i] > 0) {
				iGapsCount++;
			}
			i--;
		}

		if (iGapsCount === 1) {
			iGapsCount = 0;
		}

		return iGapsCount;
	};

	/**
	 * Method re-scales the values in aPerc array by the provided factor.
	 * The method modifies the aPerc array to the rescaled one.
	 *
	 * @private
	 * @param {number[]} rescaleValues array of values to re-scale
	 * @param {number} factor the scaling factor
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._rescaleByFactor = function(rescaleValues, factor) {
		var i = rescaleValues.length - 1;

		while (i >= 0) {
			rescaleValues[i] *= factor;
			i--;
		}
	};

	/**
	 * Map of donut sector positions to the sector colors.
	 *
	 * @private
	 */
	ProcessFlowLaneHeader.prototype._colorMap = [
		ProcessFlowLaneHeader._constants.sectorPositiveColor,
		ProcessFlowLaneHeader._constants.sectorNegativeColor,
		ProcessFlowLaneHeader._constants.sectorNeutralColor,
		ProcessFlowLaneHeader._constants.sectorPlannedColor,
		ProcessFlowLaneHeader._constants.sectorCriticalColor
	];

	/**
	 * Calculation of the donut sector angle start/end definitions along with their colors.
	 *
	 * @private
	 * @param {number[]} inputPercentages input percentage array (should sum up to 1)
	 * @param {number} fullGap angle for the sector gap (in radians)
	 * @returns {object[]} aDefinitions
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._calculateSectorRangeDefinitions = function(inputPercentages, fullGap) {
		var aDefinitions = [],
			fCalculatedStart = -Math.PI / 2,
			fCalculatedEnd,
			iInputPercentagesCount = inputPercentages.length,
			i = 0;

		while (i < iInputPercentagesCount) {
			if (inputPercentages[i] > 0) {
				fCalculatedEnd = fCalculatedStart + 2 * Math.PI * inputPercentages[i];
				aDefinitions.push({start: fCalculatedStart, end: fCalculatedEnd, color: this._colorMap[i]});
				fCalculatedStart = fCalculatedEnd + fullGap;
			}
			i++;
		}

		return aDefinitions;
	};

	/**
	 * Method renders the donut sectors of the control. The method reads the "amounts" property and sets the amount
	 * percentages into the donut segments accordingly.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the render manager into which the control will be rendered
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._renderDonutPercentages = function(oRm) { // EXC_SAP_006_1
		var aStateAmounts = this.getState(),
			iGaps = 0,
			aSectorDefs,
			aPerc = [
				0,
				0,
				0,
				0
			],
			fScaleFactor,
			sColor,
			fHalfGap = ProcessFlowLaneHeader._constants.halfGapSize,
			iRadiusInner = ProcessFlowLaneHeader._constants.ringInnerRadius,
			iRingThickness = ProcessFlowLaneHeader._constants.ringThickness,
			iRadiusOuter = ProcessFlowLaneHeader._constants.ringInnerRadius + iRingThickness,
			sOuterCircleStrokeColor = ProcessFlowLaneHeader._constants.outerCircleStrokeColor,
			iOuterCircleStrokeWidth = ProcessFlowLaneHeader._constants.outerCircleStrokeWidth,
			iOuterCircleRadius = ProcessFlowLaneHeader._constants.outerCircleRadius,
			iPositionX = ProcessFlowLaneHeader._constants.positionX,
			iPositionY = ProcessFlowLaneHeader._constants.positionY,
			fMinPercentage = ProcessFlowLaneHeader._constants.minPercentage;

		if (aStateAmounts && Object.prototype.toString.call(aStateAmounts) === '[object Array]'
				&& (aStateAmounts.length > 0)) {
			aStateAmounts.forEach(function(oStateAmount) {
				switch (oStateAmount.state) {
					case library.ProcessFlowNodeState.Positive:
						aPerc[0] = oStateAmount.value;
						break;
					case library.ProcessFlowNodeState.Negative:
						aPerc[1] = oStateAmount.value;
						break;
					case library.ProcessFlowNodeState.Neutral:
						aPerc[2] = oStateAmount.value;
						break;
					case library.ProcessFlowNodeState.Planned: // EXC_JSHINT_016
						aPerc[3] = oStateAmount.value;
						break;
					case library.ProcessFlowNodeState.Critical:
						aPerc[4] = oStateAmount.value;
						break;
					default: // EXC_JSLINT_073
						aPerc[3] = oStateAmount.value; // planned
				}
			});

			this._clampValues(aPerc, 0, 0);

			this._rescaleToUnit(aPerc);
			this._rescaleToUnit(aPerc, fMinPercentage);

			iGaps = this._countGaps(aPerc);

			fScaleFactor = (1 - iGaps * fHalfGap / Math.PI); // adjust the percentages for the gaps
			this._rescaleByFactor(aPerc, fScaleFactor);

			this._renderCircle(oRm, sOuterCircleStrokeColor, iOuterCircleStrokeWidth,
				iPositionX, iPositionY, iOuterCircleRadius);

			if (iGaps > 0) {
				aSectorDefs = this._calculateSectorRangeDefinitions(aPerc, 2 * fHalfGap);
				this._renderDonutSectors(oRm, aSectorDefs, iPositionX, iPositionY, iRadiusInner, iRadiusOuter);
			} else {
				sColor = this._selectColor(aPerc);
				this._renderCircle(oRm, sColor, iRingThickness, iPositionX, iPositionY,
					iRadiusInner + iRingThickness / 2, true);
			}
		} else {
			this._renderCircle(oRm, sOuterCircleStrokeColor, iOuterCircleStrokeWidth,
				iPositionX, iPositionY, iOuterCircleRadius);
		}
	};

	/**
	 * Method renders the white circle around the donut segments.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the render manager into which the control will be rendered
	 * @param {string} strokeColor the stroke color of the circle
	 * @param {number} strokeWidth circle stroke width in pixels
	 * @param {number} positionX coordinate x of the middle of circle in pixels
	 * @param {number} positionY coordinate y of the middle of circle in pixels
	 * @param {number} radius radius in pixels
	 * @param {boolean} [inner] if true, the circle is rendered with '-inner' appended to it's id in DOM
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._renderCircle = function(oRm, strokeColor, strokeWidth, positionX, positionY, radius, inner) { // EXC_JSHINT_034
		oRm.openStart("circle");
		var sIdSuffix = inner ? this.getId() + "-donut-circle-inner" : this.getId() + "-donut-circle";
		oRm.attr("id", sIdSuffix);
		if (strokeColor !== ProcessFlowLaneHeader._constants.outerCircleStrokeColor) {
			oRm.class("suiteUiCommonsProcessFlowHeaderIconFill").class(strokeColor);
		} else {
			oRm.class("suiteUiCommonsProcessFlowHeaderIconFill");
		}
		oRm.attr("stroke-width", strokeWidth);
		oRm.attr("cx", positionX);
		oRm.attr("cy", positionY);
		oRm.attr("r", radius);
		oRm.openEnd().close("circle"); // div element for the outer circle
	};

	/**
	 * Method renders all the donut sector paths.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the render manager into which the control will be rendered
	 * @param {object[]} sectorDefs array of donut sector definitions containing begin end and color
	 * @param {number} positionX coordinate x of the center of sector in pixels
	 * @param {number} positionY coordinate y of the center of sector in pixels
	 * @param {number} radiusInner inner radius in pixels
	 * @param {number} radiusOuter outer radius in pixels
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._renderDonutSectors = function(oRm, sectorDefs, positionX, positionY, radiusInner, radiusOuter) { // EXC_JSHINT_034
		var i = 0,
			iDefLength = sectorDefs.length,
			oSector,
			sPath;

		while (i < iDefLength) {
			oSector = sectorDefs[i];
			sPath = this._getDonutSectorPath(positionX, positionY, oSector.start, oSector.end, radiusInner, radiusOuter);
			oRm.openStart("path");
			oRm.attr("id", this.getId() + "-donut-segment-" + i);
			oRm.attr("d", sPath);
			oRm.attr("class", oSector.color);
			oRm.attr("opacity", "1");
			oRm.openEnd().close("path");
			i++;
		}
	};

	/**
	 *  Helper method for donut sector color selection.
	 *
	 * @private
	 * @param {number[]} percentages array of input percentages
	 * @returns {string} color selection
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._selectColor = function(percentages) {
		var sColor;

		if (percentages[0]) {
			sColor = ProcessFlowLaneHeader._constants.sectorPositiveColor;
		} else if (percentages[1]) {
			sColor = ProcessFlowLaneHeader._constants.sectorNegativeColor;
		} else if (percentages[2]) {
			sColor = ProcessFlowLaneHeader._constants.sectorNeutralColor;
		} else if (percentages[3]) {
			sColor = ProcessFlowLaneHeader._constants.sectorPlannedColor;
		} else if (percentages[4]) {
			sColor = ProcessFlowLaneHeader._constants.sectorCriticalColor;
		} else {
			sColor = ProcessFlowLaneHeader._constants.sectorNeutralColor;
		}

		return sColor;
	};

	/**
	 * Helper method returning SVG path data for a single donut sector.
	 *
	 * @private
	 * @param {number} positionX coordinate x of the center of sector in pixels
	 * @param {number} positionY coordinate y of the center of sector in pixels
	 * @param {number} startAngle start angle in radians (rotating right - resp. negative amount of real angle)
	 * @param {number} endAngle end angle
	 * @param {number} radiusInner inner radius in pixels
	 * @param {number} radiusOuter outer radius in pixels
	 * @returns {string} string definition of the SVG path put into the "d" attribute of the svg "path" element.
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._getDonutSectorPath = function(positionX, positionY, startAngle, endAngle, radiusInner, radiusOuter) { // EXC_JSHINT_034
		var iOuter = 0, /* outer angle flag */
			sPosition1, sPosition2, sPosition3, sPosition4,
			sSectorPath,
			fStartAngleCos, fEndAngleCos, fStartAngleSin, fEndAngleSin;

		if ((endAngle - startAngle) % (Math.PI * 2) > Math.PI) {
			iOuter = 1;
		}

		fStartAngleCos = Math.cos(startAngle);
		fEndAngleCos = Math.cos(endAngle);
		fStartAngleSin = Math.sin(startAngle);
		fEndAngleSin = Math.sin(endAngle);

		sPosition1 = (positionX + radiusInner * fStartAngleCos).toFixed(3) + ',' + (positionY + radiusInner * fStartAngleSin).toFixed(3);
		sPosition2 = (positionX + radiusOuter * fStartAngleCos).toFixed(3) + ',' + (positionY + radiusOuter * fStartAngleSin).toFixed(3);
		sPosition3 = (positionX + radiusOuter * fEndAngleCos).toFixed(3) + ',' + (positionY + radiusOuter * fEndAngleSin).toFixed(3);
		sPosition4 = (positionX + radiusInner * fEndAngleCos).toFixed(3) + ',' + (positionY + radiusInner * fEndAngleSin).toFixed(3);
		sSectorPath = "M" + sPosition1 +
			"L" + sPosition2 +
			"A" + radiusOuter + ',' + radiusOuter + " 0 " + iOuter + " 1 " + sPosition3 +
			"L" + sPosition4 +
			"A" + radiusInner + ',' + radiusInner + " 0 " + iOuter + " 0 " + sPosition1 +
			"z";

		return sSectorPath;
	};

	/**
	 * Resource cleanup for the control icon.
	 *
	 * @private
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._destroyImage = function() {
		if (this._oImageControl) {
			this._oImageControl.destroy();
		}

		this._oImageControl = null;
	};

	/**
	 * Clamps the wrapping text to _constants.nMaxTextLines lines and appends ellipsis ('...' if needed).
	 *
	 * @private
	 * @since 1.22
	 */
	ProcessFlowLaneHeader.prototype._clampText = function() {
		var $text = this.$("lh-text").length ? this.$("lh-text") : null,
			sText = this.getText(),
			sLastText = "",
			sEllipsis = ProcessFlowLaneHeader._constants.ellipsis,
			iEllipsisLength = ProcessFlowLaneHeader._constants.ellipsisLength,
			iStartPos = iEllipsisLength + 1,
			iMidPos,
			iEndPos = sText.length,
			iMaxHeight,
			bVisibility;

		if ($text) {
			iMaxHeight = parseInt($text.css("height").slice(0, -2), 10); // i.e. parse number from "32px"

			// We expect that less than ellipsis length number of characters never needs to be clamped
			// if text overflow - clamping is needed
			if ($text[0].scrollHeight > iMaxHeight) {

				// Save the visibility state and hide the text
				bVisibility = $text.css("visibility");
				$text.css("visibility", "hidden");

				// Search by bisection to find the position of ellipsis
				sLastText = sText;
				do {

					// Check the middle position and update text
					iMidPos = (iStartPos + iEndPos) >> 1;

					$text.textContent = sText.slice(0, iMidPos - iEllipsisLength) + sEllipsis;
					// Check for text overflow
					if ($text.scrollHeight > iMaxHeight) {
						iEndPos = iMidPos;
					} else {
						iStartPos = iMidPos;
						sLastText = $text.textContent;
					}
				} while (iEndPos - iStartPos > 1);

				// Reset to the original visibility state
				$text.css("visibility", bVisibility);
			}

			// Set the last valid solution in case of overflow
			if ($text.scrollHeight > iMaxHeight) {
				$text.textContent = sLastText;
			}
		}
	};

	/**
	 * Defines whether browser supports native line clamp or not
	 *
	 * @private
	 * @static
	 * @returns {boolean} true if document has webkit line clamp style, false if not
	 * @readonly
	 * @since 1.22
	 */
	ProcessFlowLaneHeader._hasNativeLineClamp = (function() {
		return document.documentElement.style.webkitLineClamp !== undefined;
	}());

	/**
	 * Returns ARIA text for the passed node status value.
	 *
	 * @private
	 * @param sStatus {sap.suite.ui.commons.ProcessFlowNodeState} Status key
	 * @returns {string} Translated text for status
	 */
	ProcessFlowLaneHeader.prototype._getAriaTextForStatusValue = function(sStatus) {
		switch (sStatus) {
			case library.ProcessFlowNodeState.Positive:
				return this._oResBundle.getText('PF_ARIA_STATUS_POSITIVE');
			case library.ProcessFlowNodeState.Negative:
				return this._oResBundle.getText('PF_ARIA_STATUS_NEGATIVE');
			case library.ProcessFlowNodeState.Critical:
				return this._oResBundle.getText('PF_ARIA_STATUS_CRITICAL');
			case library.ProcessFlowNodeState.Planned:
				return this._oResBundle.getText('PF_ARIA_STATUS_PLANNED');
			case library.ProcessFlowNodeState.PlannedNegative:
				return this._oResBundle.getText('PF_ARIA_STATUS_PLNNEGATIVE');
			case library.ProcessFlowNodeState.Neutral:
			default:
				return this._oResBundle.getText('PF_ARIA_STATUS_NEUTRAL');
		}
	};

	/**
	 * Returns ARIA text for current lane header object.
	 *
	 * @private
	 * @returns {string} Message for screen reader
	 */
	ProcessFlowLaneHeader.prototype._getAriaText = function() {
		var sAriaText = this.getText();
		var oStatuses = this.getState();
		if (oStatuses) {
			var statusValues = [];
			for (var i in oStatuses) {
			statusValues.push(oStatuses[i].value);
			}
			// Needed to rescale the values to percentage
			this._clampValues(statusValues, 0, 0);
			this._rescaleToUnit(statusValues);

			var sAriaStatusText = this._oResBundle.getText('PF_ARIA_STATUS');
			var bStatus = false;
			for (var j in oStatuses) {
				if (oStatuses[j].value !== 0) {
				var sStatusTranslatable = this._getAriaTextForStatusValue(oStatuses[j].state);
				var sValueText = " " + Math.round(statusValues[j] * 100) + "% " + sStatusTranslatable + ",";
				sAriaStatusText = sAriaStatusText.concat(sValueText);
				bStatus = true;
				}
			}
			if (bStatus) {
				// Removes the last character which is a ','
				if (sAriaText == "") {
					sAriaText = sAriaStatusText.slice(0, -1);
				} else {
					sAriaText = sAriaText + ", " + sAriaStatusText.slice(0, -1);
				}
			}
		}
		return sAriaText;
		};

	/**
	 * Returns ARIA text for symbols in lane header.
	 *
	 * @private
	 * @returns {string} Text for screen reader
	 */
	ProcessFlowLaneHeader.prototype._getSymbolAriaText = function() {
		var sAriaText = "";
		switch (this._getSymbolType()) {
			case ProcessFlowLaneHeader.symbolType.startSymbol:
				sAriaText = this._oResBundle.getText('PF_ARIA_SYMBOL_LANE_START');
				break;
			case ProcessFlowLaneHeader.symbolType.endSymbol:
				sAriaText = this._oResBundle.getText('PF_ARIA_SYMBOL_LANE_END');
				break;
			case ProcessFlowLaneHeader.symbolType.processSymbol:
				sAriaText = this._oResBundle.getText('PF_ARIA_SYMBOL_LANE_PROCESS');
				break;
			default:
		}
		return sAriaText;
	};

	/**
	 * Creates the start symbol at the beginning of the lane header.
	 *
	 * @private
	 * @param {boolean} isHeaderMode true if the hand cursor should be displayed above the header
	 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} a new start symbol node
	 * @since 1.22
	 */

	ProcessFlowLaneHeader.createNewStartSymbol = function(isHeaderMode) {
		var oStartSymbol = new ProcessFlowLaneHeader({
				laneId: "processFlowLaneStart"
			});

		oStartSymbol._setSymbolType(ProcessFlowLaneHeader.symbolType.startSymbol, oStartSymbol);
		oStartSymbol._setHeaderMode(isHeaderMode);
		return oStartSymbol;
	};

	/**
	 * Process symbol node factory method - creates a control with a square symbol used at the end of the lane header.
	 *
	 * @private
	 * @param {boolean} isHeaderMode true if the hand cursor should be displayed above the header
	 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} a new end symbol node
	 * @since 1.22
	 *
	 */

	ProcessFlowLaneHeader.createNewEndSymbol = function(isHeaderMode) {
		var oEndSymbol = new ProcessFlowLaneHeader({
				laneId: "processFlowLaneEnd"
			});

		oEndSymbol._setSymbolType(ProcessFlowLaneHeader.symbolType.endSymbol, oEndSymbol);
		oEndSymbol._setHeaderMode(isHeaderMode);
		return oEndSymbol;
	};

	/**
	 * Process symbol node factory method - creates a control with a '>>>' symbol.
	 *
	 * @private
	 * @param {boolean} isHeaderMode true if the hand cursor should be displayed above the header
	 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} a new process symbol node
	 * @since 1.22
	 *
	 */

	ProcessFlowLaneHeader.createNewProcessSymbol = function(isHeaderMode) {
		var oProcessSymbol = new ProcessFlowLaneHeader({
				laneId: "processFlowLaneProcess", iconSrc: "sap-icon://process"
			});
		oProcessSymbol._setSymbolType(ProcessFlowLaneHeader.symbolType.processSymbol, oProcessSymbol);
		oProcessSymbol._setHeaderMode(isHeaderMode);
		return oProcessSymbol;
	};

	/**
	 * Enable/disable ellipsis support for non-webkit browsers (for the case where there is no native ellipsis support).
	 * It is recommended to disable the ellipsis support in case the control is inserted
	 * into a container of variable width as the ellipsis position is not updated automatically.
	 * By default the ellipsis support is enabled.
	 *
	 * @private
	 * @param {boolean} isSupportEnabled false if the ellipsis support is to be disabled
	 * @since 1.22
	 *
	 */

	ProcessFlowLaneHeader.enableEllipsisSupportForText = function(isSupportEnabled) {
		this._ellipsisDisabled = !isSupportEnabled;
	};

	/* =========================================================== */
	/* Public methods                                              */
	/* =========================================================== */

	/**
	 * Overrides the getter method for property position. It returns the position that was changed due to the artificial merged lanes.
	 * Otherwise it returns the position set as a property.
	 *
	 * @public
	 * @returns {int} Lane position
	 */
	ProcessFlowLaneHeader.prototype.getPosition = function() {
		if (this._mergedLanePosition) {
			return this._mergedLanePosition;
		} else {
			return this.getProperty("position");
		}
	};


	return ProcessFlowLaneHeader;

});
