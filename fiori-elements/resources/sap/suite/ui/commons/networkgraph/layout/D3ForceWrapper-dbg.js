/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([], function() {
	"use strict";

	var D3;

	/**
	 * A wrapper over D3.
	 *
	 * @static
	 * @private
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.layout.D3ForceWrapper
	 */
	var D3ForceWrapper = {};

	D3ForceWrapper._d3Path = sap.ui.require.toUrl("sap/ui/thirdparty") + "/d3.js";

	D3ForceWrapper.run = function (oParameters, resolve) {
		D3ForceWrapper.getD3().then(function (D3) {
			var graph = oParameters.graph;
			var force = D3.layout.force()
				.nodes(graph.nodes)
				.links(graph.links)
				.alpha(oParameters.alpha)
				.friction(oParameters.friction)
				.charge(oParameters.charge)
				.start();

			setTimeout(force.stop, oParameters.maximumDuration);

			force.on("end", function () {
				resolve(graph);
			});
		});
	};

	D3ForceWrapper.layout = function (oParameters) {
		return new Promise(function (resolve, reject) {
			D3ForceWrapper.run(oParameters, resolve);
		});
	};

	D3ForceWrapper.getD3 = function() {
		if (D3) {
			return Promise.resolve(D3);
		} else {
			return new Promise(function (resolve) {
				sap.ui.require(["sap/ui/thirdparty/d3"], function (oD3) {
					D3 = oD3;
					resolve(oD3);
				});
			});
		}
	};

	return D3ForceWrapper;
}, true);