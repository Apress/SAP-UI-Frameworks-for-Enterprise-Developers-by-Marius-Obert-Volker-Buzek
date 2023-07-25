/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/suite/ui/commons/library",
	"./LayoutAlgorithm",
	"./Geometry",
	"./LayoutTask",
	"sap/ui/performance/Measurement"
], function (library, LayoutAlgorithm, Geometry, LayoutTask, Measurement) {
	"use strict";

	/**
	 * Constructor for a new ForceDirectedLayout.
	 *
	 * @class
	 * This algorithm uses the deterministic variant of the force-directed layout algorithm {@link sap.suite.ui.commons.networkgraph.layout.ForceBasedLayout}
	 * to arrange the nodes included in the network graph.
	 * It can be useful for complex graphs, where {@link sap.suite.ui.commons.networkgraph.layout.LayeredLayout} is not sufficient.
	 *
	 * @extends sap.suite.ui.commons.networkgraph.layout.LayoutAlgorithm
	 *
	 * @constructor
	 * @public
	 * @since 1.58
	 * @alias sap.suite.ui.commons.networkgraph.layout.ForceDirectedLayout
	 */
	var ForceDirectedLayout = LayoutAlgorithm.extend("sap.suite.ui.commons.networkgraph.layout.ForceDirectedLayout", {
		metadata: {
			properties: {
				/**
				 * The "C" constant from the optimal distance equation used in the Fruchterman-Reingold Algorithm.
				 * See {@link https://www.researchgate.net/publication/309193795_Force-Directed_Graph_Drawing_Algorithm}
				 */
				optimalDistanceConstant: {
					type: "float", defaultValue: 0.2
				},
				/**
				 * Maximum number of iterations (or cooldown steps) the layouting process will go through.
				 */
				maxIterations: {
					type: "int", defaultValue: 200
				},
				/**
				 * Maximum time in milliseconds the layouting process will run for.
				 */
				maxTime: {
					type: "int", defaultValue: 2000
				},
				/**
				 * Initial 'temperature' of the system, that controls the step width of the nodes' movements and that decreases, or 'cools down', after each iteration.
				 */
				initialTemperature: {
					type: "float", defaultValue: 200
				},
				/**
				 * Specifies how much the 'temperature' decreases after every iteration.
				 */
				coolDownStep: {
					type: "float", defaultValue: 1
				},
				/**
				 * List of keys of nodes that should ignore cooldown iterations and keep their original positions (x and y coordinates) in the graph.
				 */
				staticNodes: {
					type: "string[]", defaultValue: []
				}
			}
		}
	});

	var LayoutRenderType = library.networkgraph.LayoutRenderType,
		SUNFLOWER_SCALE = 200,
		GOLDEN_ANGLE = 2.39996322972865332;

	/**
	 * Specifies the type of layout algorithm that defines the visual features and layout of the network graph.
	 *
	 * @returns {sap.suite.ui.commons.networkgraph.LayoutRenderType}
	 * @public
	 */
	ForceDirectedLayout.prototype.getLayoutRenderType = function () {
		return LayoutRenderType.Forces;
	};

	/**
	 * Specifies if this layout algorithm distributes nodes into layers. The parent graph may affect the behaviour based
	 * on this option.
	 *
	 * @returns {boolean} Always false
	 * @public
	 */
	ForceDirectedLayout.prototype.isLayered = function () {
		return false;
	};

	/**
	 * Runs the layout algorithm.
	 *
	 * @returns {sap.suite.ui.commons.networkgraph.layout.LayoutTask} Task to get the layout calculated.
	 * @public
	 */
	ForceDirectedLayout.prototype.layout = function () {
		return new LayoutTask(function (fnResolve, fnReject, oLayoutTask) {
			var oGraph = this.getParent();

			if (!oGraph) {
				fnReject("The algorithm must be associated with a graph.");
				return;
			}
			this.oGraph = oGraph;

			Measurement.start("NetworkGraph - ForceDirectedLayout", "Layouting of a graph " + oGraph.getId());

			this._initPhyllotaxisPattern();
			this._runSimulation();
			this._normalizeLines();
			this._alignCoordinatesWithView();

			fnResolve();
		}.bind(this));
	};

	ForceDirectedLayout.prototype._initPhyllotaxisPattern = function () {
		var fShift = SUNFLOWER_SCALE * Math.sqrt(this.oGraph.getNodes().length),
			fAngle = 0,
			oVector = {center: {x: 0, y: 0}, apex: {x: 0, y: 0}};
		this.aCenters = [];

		this.oGraph.getNodes().forEach(function (oNode, iIndex) {
			if (this.getStaticNodes().indexOf(oNode.getKey()) > -1) {
				oNode.center = {x: oNode.getCenterPosition().x, y: oNode.getCenterPosition().y};
			} else {
				oVector.apex.x = Math.sqrt(iIndex + 1) * SUNFLOWER_SCALE;
				oVector.apex.y = 0;
				fAngle += GOLDEN_ANGLE;
				oVector = Geometry.getRotatedVector(oVector, fAngle);
				oNode.center = {x: oVector.apex.x + fShift, y: oVector.apex.y + fShift};
			}
			this.aCenters.push(oNode.center);
		}.bind(this));
	};

	ForceDirectedLayout.prototype._runSimulation = function () {
		var iMaxIterations = this.getMaxIterations(),
			fTemperature = this.getInitialTemperature(),
			fCoolDown = this.getCoolDownStep(),
			dTimeLimit = (this.getMaxTime() > 0) ? (this.getMaxTime() + Date.now()) : 0,
			iCount = 0,
			oDiff, fDist, fDisplaceRate,
			oFrom, oTo, fXDisp, fYDisp;

		var oBBox = Geometry.getBoundingBox(this.aCenters),
			fArea = (oBBox.p2.x - oBBox.p1.x) * (oBBox.p2.y - oBBox.p1.y),
			fOptDistance = this.getOptimalDistanceConstant() * Math.sqrt(fArea / this.oGraph.getNodes().length);

		var fnDist = function (oPoint) {
				return Math.sqrt(oPoint.x * oPoint.x + oPoint.y * oPoint.y);
			},
			fnAttraction = function (fDist) {
				return (fDist * fDist) / fOptDistance;
			},
			fnRepulsion = function (fDist) {
				return (fOptDistance * fOptDistance) / (fDist);
			};

		/* eslint-disable no-loop-func */
		while (fTemperature > 0 && iCount < iMaxIterations && (dTimeLimit === 0 || Date.now() < dTimeLimit)) {
			// Repulsive forces
			this.oGraph.getNodes().forEach(function (oNode) {
				oNode.disp = {x: 0, y: 0};
			});
			this.oGraph.getNodes().forEach(function (oNode) {
				this.oGraph.getNodes().forEach(function (oOtherNode) {
					if (oNode.getKey() === oOtherNode.getKey()) {
						return;
					}
					oDiff = Geometry.getPointDif(oNode.center, oOtherNode.center);
					fDist = Math.max(1, fnDist(oDiff) - (oNode._getCircleSize() / 2 + oOtherNode._getCircleSize() / 2));
					oNode.disp.x += (oDiff.x / fDist) * fnRepulsion(fDist);
					oNode.disp.y += (oDiff.y / fDist) * fnRepulsion(fDist);
				});
			}.bind(this));

			// Attractive forces
			this.oGraph.getLines().forEach(function (oLine) {
				oFrom = oLine.getFromNode();
				oTo = oLine.getToNode();
				// Ignore attractive forces for loops
				if (oFrom.getKey() === oTo.getKey()) {
					return;
				}

				oDiff = Geometry.getPointDif(oFrom.center, oTo.center);
				fDist = fnDist(oDiff);
				fXDisp = (oDiff.x / fDist) * fnAttraction(fDist);
				fYDisp = (oDiff.y / fDist) * fnAttraction(fDist);
				oFrom.disp.x -= fXDisp;
				oFrom.disp.y -= fYDisp;
				oTo.disp.x += fXDisp;
				oTo.disp.y += fYDisp;
			});

			// Displacement
			this.oGraph.getNodes().forEach(function (oNode) {
				if (this.getStaticNodes().indexOf(oNode.getKey()) > -1) {
					return;
				}

				fDist = fnDist(oNode.disp);
				// Limit displacement to temperature
				fDisplaceRate = Math.min(fDist, fTemperature) / fDist;
				oNode.center.x += oNode.disp.x * fDisplaceRate;
				oNode.center.y += oNode.disp.y * fDisplaceRate;
			}.bind(this));

			fTemperature -= fCoolDown;
			iCount++;
		}
		/* eslint-disable no-loop-func */

		// Update nodes via API
		this.oGraph.getNodes().forEach(function (oNode) {
			oNode.setX(oNode.center.x - oNode._iWidth / 2);
			oNode.setY(oNode.center.y - oNode._iHeight / 2);
		});
	};

	ForceDirectedLayout.prototype.destroy = function () {
		this.aCenters = null;
		this.oGraph = null;
		LayoutAlgorithm.prototype.destroy.apply(this);
	};

	return ForceDirectedLayout;
});