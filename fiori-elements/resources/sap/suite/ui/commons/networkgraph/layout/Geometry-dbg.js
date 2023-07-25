/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(
	[],
	function () {
		"use strict";

		var Geometry = {};

		var FREAKISHLY_SMALL_NUMBER = 1e-10;

		/**
		 * @typedef {Object} Point
		 * @property {number} x The X Coordinate
		 * @property {number} y The Y Coordinate
		 */

		/**
		 * @typedef {Object} Line
		 * @property {Point} p1 The first point
		 * @property {Point} p2 The second point
		 */

		/**
		 * @typedef {Object} Rectangle
		 * @property {Point} p1 The lower left point ~ the one with smallest coordinates
		 * @property {Point} p2 The upper right point ~ the one with biggest coordinates
		 */

		/**
		 * @typedef {Object} Polygon
		 * @property {Array.<Point>} points
		 */

		/**
		 * @typedef {Object} Vector
		 * @property {Point} center The starting point
		 * @property {Point} apex The arrow point
		 */

		/**
		 * @typedef {Object} LineEquation
		 * @property {Number} slope The first derivation of the line
		 * @property {Number} intercept Y axis intersection
		 * @property {Number} verticalX X axis intersection for vertical line
		 */

		/**
		 * Calculates distance of two points.
		 * @param {Point} oPoint1 First point
		 * @param {Point} oPoint2 Second point
		 * @returns {number} Distance
		 */
		Geometry.getPointsDistance = function (oPoint1, oPoint2) {
			return Math.sqrt(Math.pow(oPoint1.x - oPoint2.x, 2) + Math.pow(oPoint1.y - oPoint2.y, 2));
		};

		/**
		 * Devises analytical equation of a line based on two of its points.
		 * @param {Line} oLine Line to get equation of
		 * @returns {LineEquation} Equation
		 */
		Geometry.getLineEquation = function (oLine) {
			var fSlope = (oLine.p1.y - oLine.p2.y) / (oLine.p1.x - oLine.p2.x),
				fIntercept = oLine.p1.y - fSlope * oLine.p1.x;
			return {slope: fSlope, intercept: fIntercept, verticalX: oLine.p1.x};
		};

		/**
		 * Checks if the given point lies 'under' the line
		 * @param {Point} oPoint Point to check against the line
		 * @param {LineEquation} oLineEq Line to check the point against
		 * @returns {Number} Returns 1 if the point is UNDER line, -1 if the point is ABOVE line and 0 if the point is ON the line.
		 */
		Geometry.isPointUnderLine = function (oPoint, oLineEq) {
			// special handling of vertical lines
			if (!isFinite(oLineEq.slope)) {
				if (oPoint.x === oLineEq.verticalX) {
					return 0;
				} else if (oPoint.x > oLineEq.verticalX) {
					return 1;
				} else {
					return -1;
				}
			}

			var iPointAtY = oPoint.y - oLineEq.slope * oPoint.x;
			if (Math.abs(iPointAtY - oLineEq.intercept) < (Number.EPSILON * 1000)) {
				return 0;
			} else if (iPointAtY < oLineEq.intercept) {
				return 1;
			} else {
				return -1;
			}
		};

		/**
		 * Checks if the two lines intersect
		 * @param {Line} oLine1 First line
		 * @param {Line} oLine2 Second line
		 * @returns {boolean} True if the two lines intersect, false otherwise
		 */
		Geometry.doLinesIntersect = function (oLine1, oLine2) {
			var oEq1 = Geometry.getLineEquation(oLine1),
				oEq2 = Geometry.getLineEquation(oLine2);
			return Geometry.isPointUnderLine(oLine1.p1, oEq2) != Geometry.isPointUnderLine(oLine1.p2, oEq2)
				&& Geometry.isPointUnderLine(oLine2.p1, oEq1) != Geometry.isPointUnderLine(oLine2.p2, oEq1);
		};

		/**
		 * Calculates intersection of two lines.
		 * @param {Line} oLine1 First line
		 * @param {Line} oLine2 Second line
		 * @returns {Point} The intersection if exists, {x: Infinity, y: Infinity} if lines are coincident, undefined if parallel.
		 */
		Geometry.getLinesIntersection = function (oLine1, oLine2) {
			var x1 = oLine1.p1.x, y1 = oLine1.p1.y,
				x2 = oLine1.p2.x, y2 = oLine1.p2.y,
				x3 = oLine2.p1.x, y3 = oLine2.p1.y,
				x4 = oLine2.p2.x, y4 = oLine2.p2.y,
				iCommonDivisor = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
			if (iCommonDivisor === 0) {
				// either coincident or parallel
				var oEq1 = Geometry.getLineEquation(oLine1),
					oEq2 = Geometry.getLineEquation(oLine2);
				if (oEq1.slope === oEq2.slope && oEq1.intercept === oEq2.intercept) {
					return {x: Infinity, y: Infinity};
				} else {
					return undefined;
				}
			}
			return {
				x: ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / iCommonDivisor,
				y: ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / iCommonDivisor
			};
		};

		/**
		 * Both the line and the rectangle are {p1:{x,y},p2{x,y}}, rectangle has (p1.x < p2.x && p1.y < p2.y)
		 * @param {Line} oLine Line to check against the rectangle
		 * @param {Rectangle} oRect Rectangle to check against the line
		 * @returns {boolean} True ifif the line and rectangle interset.
		 */
		Geometry.doLineRectangleIntersect = function (oLine, oRect) {
			return Geometry.getLineRectangleIntersections(oLine, oRect).length >= 2;
		};

		/**
		 * Both the line and the rectangle are {p1:{x,y},p2{x,y}}, rectangle has (p1.x < p2.x && p1.y < p2.y)
		 * @param {Line} oLine Line to check against the rectangle
		 * @param {Rectangle} oRect Rectangle to check against the line
		 * @returns {Array.<Point>} Points of intersection
		 */
		Geometry.getLineRectangleIntersections = function (oLine, oRect) {
			var aIntersections = [];

			// rule out line completely [in front of, behind, below, above] the rectangle
			if ((oLine.p1.x < oRect.p1.x && oLine.p2.x < oRect.p1.x)
				|| (oLine.p1.x > oRect.p2.x && oLine.p2.x > oRect.p2.x)
				|| (oLine.p1.y < oRect.p1.y && oLine.p2.y < oRect.p1.y)
				|| (oLine.p1.y > oRect.p2.y && oLine.p2.y > oRect.p2.y)) {
				return aIntersections;
			}

			var oIntersection,
				fError = FREAKISHLY_SMALL_NUMBER;
			/* lines of the rectangle: */
			[
				{p1: oRect.p1, p2: {x: oRect.p1.x, y: oRect.p2.y}},
				{p1: {x: oRect.p1.x, y: oRect.p2.y}, p2: oRect.p2},
				{p1: {x: oRect.p2.x, y: oRect.p1.y}, p2: oRect.p2},
				{p1: oRect.p1, p2: {x: oRect.p2.x, y: oRect.p1.y}}
			].forEach(function (oRectLine) {
				oIntersection = Geometry.getLinesIntersection(oLine, oRectLine);
				if (oIntersection
					&& oIntersection.x >= (oRectLine.p1.x - fError)
					&& oIntersection.x <= (oRectLine.p2.x + fError)
					&& oIntersection.y >= (oRectLine.p1.y - fError)
					&& oIntersection.y <= (oRectLine.p2.y + fError)) {
					aIntersections.push(oIntersection);
				}
			});
			return aIntersections;
		};

		/**
		 * Calculates centroid of a polygon.
		 * @param {Polygon} oPolygon Polygon to get the centroid of
		 * @returns {Point} Centroid of the polygon
		 */
		Geometry.getPolygonCentroid = function (oPolygon) {
			var iArea = 0,
				p1, p2,
				iTemp,
				iCx = 0, iCy = 0;

			if (oPolygon.points.length < 3) {
				throw new Error("Polygon must have three or more points.");
			}
			for (var i = 0; i < oPolygon.points.length; i++) {
				p1 = oPolygon.points[i];
				p2 = (i < (oPolygon.points.length - 1)) ? oPolygon.points[i + 1] : oPolygon.points[0];
				iArea += p1.x * p2.y - p2.x * p1.y;
			}
			iArea = iArea / 2;

			for (var j = 0; j < oPolygon.points.length; j++) {
				p1 = oPolygon.points[j];
				p2 = (j < (oPolygon.points.length - 1)) ? oPolygon.points[j + 1] : oPolygon.points[0];
				iTemp = p1.x * p2.y - p2.x * p1.y;
				iCx += (p1.x + p2.x) * iTemp;
				iCy += (p1.y + p2.y) * iTemp;
			}
			iCx = iCx / (6 * iArea);
			iCy = iCy / (6 * iArea);

			return {x: iCx, y: iCy};
		};

		/**
		 * Calculates angle of a vector relative to its center.
		 * @param {Vector} oVector Vector to calculate angle of.
		 * @returns {number} Angle of the vector in radians.
		 */
		Geometry.getAngleOfVector = function (oVector) {
			var iDx = oVector.apex.x - oVector.center.x,
				iDy = oVector.apex.y - oVector.center.y,
				iAtan = Math.atan(iDy / iDx);
			if (iDy > 0) {
				return (iDx >= 0) ? iAtan : iAtan + Math.PI;
			} else {
				return (iDx >= 0) ? iAtan + 2 * Math.PI : iAtan + Math.PI;
			}
		};

		/**
		 * Calculates length of a vector.
		 * @param {Vector} oVector Vector to calculate length of.
		 * @returns {number} Length of the vector.
		 */
		Geometry.getLengthOfVector = function (oVector) {
			return Math.sqrt(Math.pow(oVector.apex.x - oVector.center.x, 2) + Math.pow(oVector.apex.y - oVector.center.y, 2));
		};

		/**
		 * Rotates a point around the planar center.
		 * @param {Point} oPoint Point to rotate.
		 * @param {number} fShift Angle of rotation.
		 * @returns {Point} Rotated point.
		 */
		Geometry.getRotatedPoint = function (oPoint, fShift) {
			return Geometry.getRotatedVector({center: {x: 0, y: 0}, apex: oPoint}, fShift).apex;
		};

		Geometry.getPointSum = function (oPoint1, oPoint2) {
			return {x: oPoint1.x + oPoint2.x, y: oPoint1.y + oPoint2.y};
		};

		Geometry.getPointDif = function (oPoint1, oPoint2) {
			return {x: oPoint1.x - oPoint2.x, y: oPoint1.y - oPoint2.y};
		};

		/**
		 * Rotates a vector around its center ie. the first of the two given points.
		 * @param {Vector} oVector Vector to rotate.
		 * @param {number} fShift Angle of rotation.
		 * @returns {Vector} Rotated vector.
		 */
		Geometry.getRotatedVector = function (oVector, fShift) {
			var fAngle = Geometry.getAngleOfVector(oVector),
				fLength = Geometry.getLengthOfVector(oVector);
			fAngle += fShift;
			var oNewApex = {
				x: Math.cos(fAngle) * fLength + oVector.center.x,
				y: Math.sin(fAngle) * fLength + oVector.center.y
			};

			return {center: oVector.center, apex: oNewApex};
		};

		/**
		 * Calculates a bounding box for given points.
		 * @param {Array.<Point>} aPoints Points to get the bounding box of
		 * @return {Rectangle} Bounding box of the points
		 */
		Geometry.getBoundingBox = function (aPoints) {
			var fMinX = Infinity, fMinY = Infinity, fMaxX = -Infinity, fMaxY = -Infinity;
			aPoints.forEach(function (oPoint) {
				if (oPoint.x < fMinX) {
					fMinX = oPoint.x;
				}
				if (oPoint.x > fMaxX) {
					fMaxX = oPoint.x;
				}
				if (oPoint.y < fMinY) {
					fMinY = oPoint.y;
				}
				if (oPoint.y > fMaxY) {
					fMaxY = oPoint.y;
				}
			});

			return {p1: {x: fMinX, y: fMinY}, p2: {x: fMaxX, y: fMaxY}};
		};

		/**
		 * Enlarges (or shrinks for negative margin) given box to all sides.
		 * @param {Rectangle} oRect Rectangle to enlarge.
		 * @param {number} fMargin How much to resize.
		 */
		Geometry.enlargeBox = function (oRect, fMargin) {
			oRect.p1.x = oRect.p1.x - fMargin;
			oRect.p1.y = oRect.p1.y - fMargin;
			oRect.p2.x += fMargin;
			oRect.p2.y += fMargin;
		};

		/**
		 * Modifies the vector, so its center is shifted to the origin [0, 0] and its length is scaled to the specified new length.
		 * @param {Vector} oVector Vector to normalize.
		 * @param {number} fNewLength To what length to scale.
		 * @returns {Vector} Normalized vector.
		 */
		Geometry.getNormalizedVector = function (oVector, fNewLength) {
			var fRatio = fNewLength / Geometry.getLengthOfVector(oVector),
				fSegmentX = (oVector.apex.x - oVector.center.x) * fRatio,
				fSegmentY = (oVector.apex.y - oVector.center.y) * fRatio;
			return {
				center: {x: 0, y: 0}, apex: {x: fSegmentX, y: fSegmentY}
			};
		};

		/**
		 * Check whether two rectangles overlap, forming an intersection
		 * @param {Rectangle} r1 Rectangle to compare.
		 * @param {Rectangle} r2 Rectangle to compare.
		 * @returns {boolean} True for rectangles who intersect
		 */
		Geometry.hasRectangleRectangleIntersection = function (r1, r2) {
			return !(r2.p1.x > r1.p2.x ||
				r2.p2.x < r1.p1.x ||
				r2.p1.y > r1.p2.y ||
				r2.p2.y < r1.p1.y);
		};

		/**
		 * Find the intersection of two line segments
		 * @param {Line} l1 Line to compare.
		 * @param {Line} l2 Line to compare.
		 * @returns {Point} True for rectangles that overlap, forming an intersection
		 */
		Geometry.getSegmentsIntersection = function (oLine1, oLine2) {
			var eps = 0.0000001;

			var fnBetween = function (a, b, c) {
				return a - eps <= b && b <= c + eps;
			};

			var x1 = oLine1.p1.x, y1 = oLine1.p1.y,
				x2 = oLine1.p2.x, y2 = oLine1.p2.y,
				x3 = oLine2.p1.x, y3 = oLine2.p1.y,
				x4 = oLine2.p2.x, y4 = oLine2.p2.y;

			var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
				((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
			var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
				((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

			if (isNaN(x) || isNaN(y)) {
				return false;
			} else {
				if (x1 >= x2) {
					if (!fnBetween(x2, x, x1)) {
						return false;
					}
				} else if (!fnBetween(x1, x, x2)) {
					return false;
				}

				if (y1 >= y2) {
					if (!fnBetween(y2, y, y1)) {
						return false;
					}
				} else if (!fnBetween(y1, y, y2)) {
					return false;
				}

				if (x3 >= x4) {
					if (!fnBetween(x4, x, x3)) {
						return false;
					}
				} else if (!fnBetween(x3, x, x4)) {
					return false;
				}

				if (y3 >= y4) {
					if (!fnBetween(y4, y, y3)) {
						return false;
					}
				} else if (!fnBetween(y3, y, y4)) {
					return false;
				}
			}
			return {
				x: x,
				y: y
			};
		};

		/**
		 * Takes ortogonal path with sharp corners and bends them using cubic bezier curves.
		 * @param {string} sPath Ortogonal path with sharp edges.
		 * @param {number} fRadius Bezier arc radius of bent corners.
		 * @param {number} fPerpendicularShift When set shifts the points aside along the way.
		 * @returns {string} Path with bent corners.
		 */
		Geometry.getBezierPathCorners = function (sPath, fRadius, fPerpendicularShift) {
			var aResultSteps = [],
				aBowels = [],
				sResult;

			var aPathParts = sPath.split(/[,\s]/).reduce(function (aParts, sPart) {
				var a = sPart.match("([a-zA-Z])(.+)");
				if (a) {
					aParts.push(a[1]);
					aParts.push(a[2]);
				} else {
					aParts.push(sPart);
				}

				return aParts;
			}, []);

			var aSteps = aPathParts.reduce(function (aSteps, fPart) {
				if (parseFloat(fPart) == fPart && aSteps.length) {
					aSteps[aSteps.length - 1].push(fPart);
				} else {
					aSteps.push([fPart]);
				}

				return aSteps;
			}, []);

			function fnShiftInDirection(oPointFrom, oPointTo, fMagnitude) {
				var fDiffX = (oPointTo.x - oPointFrom.x);
				var fDiffY = (oPointTo.y - oPointFrom.y);
				var fDist = Math.sqrt(fDiffX * fDiffX + fDiffY * fDiffY);

				return fnPartialShiftInDirection(oPointFrom, oPointTo, Math.min(1, fMagnitude / fDist));
			}

			function fnPartialShiftInDirection(oPointFrom, oPointTo, fPart) {
				return {
					x: oPointFrom.x + (oPointTo.x - oPointFrom.x) * fPart,
					y: oPointFrom.y + (oPointTo.y - oPointFrom.y) * fPart
				};
			}

			function fnAdjustStep(aStep, oPoint) {
				if (aStep.length > 2) {
					aStep[aStep.length - 2] = oPoint.x;
					aStep[aStep.length - 1] = oPoint.y;
				}
			}

			function fnGetPointOfStep(aStep) {
				return {
					x: parseFloat(aStep[aStep.length - 2]),
					y: parseFloat(aStep[aStep.length - 1])
				};
			}

			function fnGetStepPoint(i) {
				return {
					x: parseFloat(aSteps[i][1]),
					y: parseFloat(aSteps[i][2])
				};
			}

			function fnEqual(a, b) {
				return Math.abs(a - b) < FREAKISHLY_SMALL_NUMBER;
			}

			function fnLess(a, b) {
				return (b - a) > FREAKISHLY_SMALL_NUMBER;
			}

			function fnMore(a, b) {
				return (a - b) > FREAKISHLY_SMALL_NUMBER;
			}

			function fnShiftStepsAside(fShift) {
				var oPrev, oCurr, oNext,
					oShift,
					iSignFlag = (fShift > 0) ? 1 : -1,
					aNewSteps = [], i,
					bBottomTop, bRightLeft, bInner;

				if (fShift === 0) {
					return;
				}

				fShift = Math.abs(fShift);

				// First node specific
				oCurr = fnGetStepPoint(0);
				oNext = fnGetStepPoint(1);
				oShift = Geometry.getNormalizedVector({center: oCurr, apex: oNext}, fShift);
				oShift = Geometry.getRotatedVector(oShift, -iSignFlag * Math.PI / 2).apex;
				oCurr.x += oShift.x;
				oCurr.y += oShift.y;
				aNewSteps.push(oCurr);

				// Middle nodes generic
				for (i = 1; i < aSteps.length - 1; i++) {
					oPrev = fnGetStepPoint(i - 1);
					oCurr = fnGetStepPoint(i);
					oNext = fnGetStepPoint(i + 1);
					bBottomTop = fnEqual(oPrev.x, oCurr.x) && fnLess(oPrev.y, oCurr.y) || fnEqual(oCurr.x, oNext.x) && fnLess(oCurr.y, oNext.y);
					bRightLeft = fnEqual(oPrev.y, oCurr.y) && fnMore(oPrev.x, oCurr.x) || fnEqual(oCurr.y, oNext.y) && fnMore(oCurr.x, oNext.x);
					bInner =
						fnEqual(oPrev.y, oCurr.y) && fnLess(oPrev.x, oCurr.x) && fnEqual(oCurr.x, oNext.x) && fnMore(oCurr.y, oNext.y) // LRTB
						|| fnEqual(oPrev.y, oCurr.y) && fnMore(oPrev.x, oCurr.x) && fnEqual(oCurr.x, oNext.x) && fnLess(oCurr.y, oNext.y) // RLBT
						|| fnEqual(oPrev.x, oCurr.x) && fnLess(oPrev.y, oCurr.y) && fnEqual(oCurr.y, oNext.y) && fnLess(oCurr.x, oNext.x) // BTLR
						|| fnEqual(oPrev.x, oCurr.x) && fnMore(oPrev.y, oCurr.y) && fnEqual(oCurr.y, oNext.y) && fnMore(oCurr.x, oNext.x); // TBRL
					if (iSignFlag < 0) {
						bInner = !bInner;
					}
					oShift.x = (bBottomTop ? fShift : -fShift) * iSignFlag;
					oShift.y = (bRightLeft ? fShift : -fShift) * iSignFlag;
					oCurr.x += oShift.x;
					oCurr.y += oShift.y;
					oCurr.inner = bInner;
					aNewSteps.push(oCurr);
				}

				// Last node specific
				oCurr = fnGetStepPoint(aSteps.length - 1);
				oPrev = fnGetStepPoint(aSteps.length - 2);
				oShift = Geometry.getNormalizedVector({center: oCurr, apex: oPrev}, fShift);
				oShift = Geometry.getRotatedVector(oShift, iSignFlag * Math.PI / 2).apex;
				oCurr.x += oShift.x;
				oCurr.y += oShift.y;
				aNewSteps.push(oCurr);

				for (i = 0; i < aSteps.length; i++) {
					aSteps[i][1] = aNewSteps[i].x.toFixed(0).toString();
					aSteps[i][2] = aNewSteps[i].y.toFixed(0).toString();
					aBowels[i] = aNewSteps[i].inner;
				}
			}

			if (fPerpendicularShift) {
				fnShiftStepsAside(fPerpendicularShift);
			}

			if (aSteps.length > 1) {
				var oStartPoint = fnGetPointOfStep(aSteps[0]),
					aCloseLine = null;

				if (aSteps[aSteps.length - 1][0] == "Z" && aSteps[0].length > 2) {
					aCloseLine = ["L", oStartPoint.x, oStartPoint.y];
					aSteps[aSteps.length - 1] = aCloseLine;
				}

				aResultSteps.push(aSteps[0]);

				for (var iStep = 1; iStep < aSteps.length; iStep++) {
					var aPrevStep = aResultSteps[aResultSteps.length - 1],
						aCurrStep = aSteps[iStep],
						aNextStep = (aCurrStep == aCloseLine) ? aSteps[1] : aSteps[iStep + 1],
						fShiftedRadius;

					if (aBowels[iStep] === true) {
						fShiftedRadius = fRadius * 0.65;
					} else if (aBowels[iStep] === false) {
						fShiftedRadius = fRadius * 1.35;
					} else {
						fShiftedRadius = fRadius;
					}

					if (aNextStep && aPrevStep && (aPrevStep.length > 2) && aCurrStep[0] == "L" && aNextStep.length > 2 && aNextStep[0] == "L") {
						var oPrevPoint = fnGetPointOfStep(aPrevStep),
							oCurrPoint = fnGetPointOfStep(aCurrStep),
							oNextPoint = fnGetPointOfStep(aNextStep),
							oCurveStart, oCurveEnd,
							fPrevDistance = Math.abs(oPrevPoint.x - oCurrPoint.x) + Math.abs(oPrevPoint.y - oCurrPoint.y),
							fNextDistance = Math.abs(oNextPoint.x - oCurrPoint.x) + Math.abs(oNextPoint.y - oCurrPoint.y),
							fRadiusToUse = Math.max(Math.min(fShiftedRadius, fPrevDistance, fNextDistance / 2), 1);

						oCurveStart = fnShiftInDirection(oCurrPoint, oPrevPoint, fRadiusToUse);
						oCurveEnd = fnShiftInDirection(oCurrPoint, oNextPoint, fRadiusToUse);

						fnAdjustStep(aCurrStep, oCurveStart);
						aCurrStep.origPoint = oCurrPoint;
						aResultSteps.push(aCurrStep);

						var oStartControl = fnPartialShiftInDirection(oCurveStart, oCurrPoint, 0.5),
							oEndControl = fnPartialShiftInDirection(oCurrPoint, oCurveEnd, 0.5),
							aCurveStep = ["C", oStartControl.x, oStartControl.y, oEndControl.x, oEndControl.y, oCurveEnd.x, oCurveEnd.y];

						aCurveStep.origPoint = oCurrPoint;
						aResultSteps.push(aCurveStep);
					} else {
						aResultSteps.push(aCurrStep);
					}
				}

				if (aCloseLine) {
					var oNewStartPoint = fnGetPointOfStep(aResultSteps[aResultSteps.length - 1]);
					aResultSteps.push(["Z"]);
					fnAdjustStep(aResultSteps[0], oNewStartPoint);
				}
			} else {
				aResultSteps = aSteps;
			}

			sResult = aResultSteps.reduce(function (s, c) {
				return s + c.join(" ") + " ";
			}, "");

			return sResult;
		};

		return Geometry;
	},
	true);
