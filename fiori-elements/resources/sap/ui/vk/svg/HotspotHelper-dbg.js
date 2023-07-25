/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/

// Provides HotspotHelper class.

sap.ui.define([
	"../NodeContentType",
	"./Element",
	"./Rectangle",
	"./Path",
	"sap/base/assert",
	"sap/base/util/uid",
	"../TransformationMatrix",
	"../thirdparty/imagetracer",
	"../uuidv4"
], function(
	NodeContentType,
	Element,
	Rectangle,
	Path,
	assert,
	uid,
	TransformationMatrix,
	ImageTracer,
	uuidv4
) {
	"use strict";

	var HotspotHelper = function() { };

	/**
	 * Creates a hotspot.
	 * @param {sap.ui.vk.svg.Scene} scene The active scene reference object.
	 * @param {sap.ui.vk.svg.Element} parentNode The reference object of the parent node where the created hotspot is added to.
	 * @param {sap.ui.vk.svg.Element[]} jointNodes Array of nodes to include into hotspot.
	 * @param {string} name The name of the new hotspot node.
	 * @param {object|undefined} nodeInfo Optional Json structure used to define node properties.
	 * @returns {sap.ui.vk.svg.Element} The reference object of the newly created hotspot node.
	 * @experimental
	 * @public
	 */
	HotspotHelper.prototype.createHotspot = function(scene, parentNode, jointNodes, name, nodeInfo) {
		var hotspotNode = scene.getDefaultNodeHierarchy().createNode(parentNode, name, null, NodeContentType.Hotspot, nodeInfo);
		this.updateHotspot(hotspotNode, jointNodes);
		return hotspotNode;
	};

	/**
	 * Deletes a hotspot.
	 * @param {sap.ui.vk.svg.Scene} scene The active scene reference object.
	 * @param {sap.ui.vk.svg.Element} hotspotNode Hotspot object to remove.
	 * @experimental
	 * @public
	 */
	HotspotHelper.prototype.removeHotspot = function(scene, hotspotNode) {
		scene.getDefaultNodeHierarchy().removeNode(hotspotNode);
	};

	/**
	 * Creates duplicates for a hotspot or list of hotspots.
	 * @param {sap.ui.vk.svg.Element|sap.ui.vk.svg.Element[]} hotspots Hotspot object to duplicate or list of hotspots.
	 * @param {sap.ui.vk.svg.Element} parentNode The reference object of the parent node where the created hotspot is added to.
	 * @param {float[]|null} transformationMatrix Position for duplicate of the first hotspot in the hotspots list.
	 *                                            If omitted, duplicated hotspots must be placed at a small offset from the original.
	 * @param {sap.ui.vk.svg.Viewport} viewport Viewport to determine duplicate hotspot offset if transformationMatrix not specified.
	 * @returns {sap.ui.vk.svg.Element|sap.ui.vk.svg.Element[]} Duplicated hotspots in a form can be passed to the backend service.
	 * @experimental
	 * @public
	 */
	HotspotHelper.prototype.duplicateHotspot = function(hotspots, parentNode, transformationMatrix, viewport) {
		hotspots = Array.isArray(hotspots) ? hotspots : [hotspots];
		var matrixOffset;
		if (transformationMatrix) {
			matrixOffset = Element._multiplyMatrices(Element._invertMatrix(hotspots[0]._matrixWorld()), transformationMatrix);
		} else if (viewport) {
			var rect = viewport._camera._transformRect({ x1: 0, y1: 0, x2: 30, y2: 30 });
			matrixOffset = [1, 0, 0, 1, rect.x2 - rect.x1, rect.y2 - rect.y1];
		}

		var parentMatrixWorldInv = Element._invertMatrix(parentNode._matrixWorld());
		var newHotspots = [];
		hotspots.forEach(function(hotspot) {
			var newHotspot = hotspot.clone();
			newHotspot.userData.duplicatedFrom = hotspot.sid;
			var matrixWorld = Element._multiplyMatrices(matrixOffset, hotspot._matrixWorld());
			var matrix = Element._multiplyMatrices(parentMatrixWorldInv, matrixWorld);
			newHotspot.matrix.set(matrix);
			parentNode.add(newHotspot);
			newHotspots.push(newHotspot);
		});

		return newHotspots.length === 1 ? newHotspots[0] : newHotspots;
	};

	/**
	 * Updates a hotspot.
	 * @param {sap.ui.vk.svg.Element} hotspotNode Hotspot object to update.
	 * @param {sap.ui.vk.svg.Element[]|null} jointNodes Array of nodes to include into hotspot.
	 * @experimental
	 * @private
	 */
	HotspotHelper.prototype.updateHotspot = function(hotspotNode, jointNodes) {
		// remove all previous joint nodes
		var i = hotspotNode.children.length;
		while (i-- > 0) {
			var child = hotspotNode.children[i];
			if (child.userData.sourceJointNode !== undefined) {
				hotspotNode.remove(child);
			}
		}

		if (jointNodes) {
			hotspotNode.userData.jointNodes = Array.from(jointNodes);
		}

		var parentMatrixWorldInv = Element._invertMatrix(hotspotNode._matrixWorld());
		function addNodeGeometry(jointNode) {
			jointNode.traverse(function(child) {
				if (child.nodeContentType === NodeContentType.Hotspot || child.parent === hotspotNode) {
					return; // ignore this joint node because it is already embedded in the hotspot
				}
				var clone;
				if (child.type === "Image") {
					clone = new Rectangle({
						x: child.x,
						y: child.y,
						width: child.width,
						height: child.height
					});
				} else if (child.type !== "Group") {
					clone = new child.constructor().copy(child, false);
				}
				if (clone) {
					clone.matrix = Element._multiplyMatrices(parentMatrixWorldInv, child._matrixWorld());
					clone.userData.sourceJointNode = child;
					hotspotNode.add(clone);
				}
			});
		}

		jointNodes = hotspotNode.userData.jointNodes;
		if (jointNodes) {
			jointNodes.forEach(function(jointNode) {
				if (jointNode.nodeContentType !== NodeContentType.Hotspot && jointNode.parent !== hotspotNode) {// skip joint nodes already embedded in the hotspot
					addNodeGeometry(jointNode);
				}
			});
		}

		hotspotNode._initAsHotspot();
	};

	HotspotHelper.prototype.getHotspotRelatedNodes = function(hotspotNode) {
		if (hotspotNode && hotspotNode.userData && hotspotNode.userData.jointNodes) {
			return hotspotNode.userData.jointNodes;
		}

		return [];
	};

	/**
	 * Creates a hotspot.
	 * @param {sap.ui.vk.svg.Scene} scene The active scene reference object.
	 * @param {sap.ui.vk.svg.Element[]} hotspots Array of nodes to be merged.
	 * @returns {any} object contains the follow fields
	 *          {any} <code>nodeRef</code> Merged hotspot node reference
	 *          {any} <code>request</code> Merged hotspots in a form can be passed to the backend service
	 * @experimental
	 * @public
	 */
	HotspotHelper.prototype.mergeHotspots = function(scene, hotspots) {
		var hierarchy = scene.getDefaultNodeHierarchy();
		var firstHotspot = hotspots[0];
		var target = hierarchy.createNode(null, firstHotspot.name, null, NodeContentType.Hotspot, { sid: uid() });

		var targetJointNodes = [], nodesToBeRemoved = [];
		var targetMatrixWorldInv = Element._invertMatrix(target._matrixWorld());

		var contentTypeChecker = function(contentType, node) { return node._vkGetNodeContentType() === contentType; };
		hotspots.forEach(function(hotspot) {
			if (hotspot.children.every(contentTypeChecker.bind(null, NodeContentType.Hotspot))) {
				// Hotspot.children are all of content type Hotspot for linked (to own copies)
				var childCount = hotspot.children.length;

				while (childCount--) {
					var child = hotspot.children[0];
					var matrix = Element._multiplyMatrices(targetMatrixWorldInv, child._matrixWorld());

					hotspot.remove(child);
					target.add(child);

					child.matrix = matrix;
					targetJointNodes.push(child);
				}
				nodesToBeRemoved.push(hotspot);
			} else if (hotspot.children.every(contentTypeChecker.bind(null, NodeContentType.Regular))) {
				// Hotspot.children are all of content type Regular for embedded
				hotspot.parent.remove(hotspot);
				target.add(hotspot);

				hotspot.matrix = Element._multiplyMatrices(targetMatrixWorldInv, hotspot._matrixWorld());
				targetJointNodes.push(hotspot);
			}
		});

		if (targetJointNodes) {
			target.userData.jointNodes = Array.from(targetJointNodes);
		}

		if (firstHotspot.hotspotColor != null) {// copy highlight color from first hotpost
			target.setHotspotColor(firstHotspot.vMask, firstHotspot.hotspotColor);
		}
		if (firstHotspot.customHotspotColor != null) {// copy custom highlight color from first hotpost
			target.setCustomHotspotColor(firstHotspot.vMask, firstHotspot.customHotspotColor);
		}

		hierarchy.removeNode(nodesToBeRemoved);

		var nodes = [], parametrics = [], fillStyles = [], lineStyles = [], textStyles = [];
		var targetNode = {
			name: target.name,
			contentType: NodeContentType.Hotspot,
			joints: [],
			children: []
		};

		target.userData.jointNodes.forEach(function(jn, i) {
			var parametricContent = jn.getParametricContent(fillStyles, lineStyles, textStyles);
			parametrics.push(parametricContent);

			nodes.push({
				name: jn.name,
				transform: TransformationMatrix.convert3x2To4x3(jn.matrix),
				parametric: i,
				contentType: NodeContentType.Hotspot
			});

			targetNode.joints.push({
				child: i,
				type: "LINK",
				action: "bubble"
			});

			targetNode.children.push(i);
		});

		nodes.push(targetNode);

		hotspots.forEach(function(h) {
			nodes.push({ suppressed: true, sid: h.sid });
		});

		var currentView = scene.getViewStateManager().getCurrentView();

		return {
			nodeRef: target,
			request: {
				views: [
					{
						id: currentView.getViewId(),
						name: currentView.getName(),
						nodes: nodes
					}
				],
				parametrics: parametrics,
				fillstyles: fillStyles,
				linestyles: lineStyles,
				textStyles: textStyles
			}
		};
	};

	/**
	 * Merges nodes geometries into a single node.
	 * @param {sap.ui.vk.svg.NodeHierarchy} nodeHierarchy The node hierarchy.
	 * @param {sap.ui.vk.svg.Element[]} nodes Array of nodes to be merged.
	 * @returns {any} object contains the follow fields
	 *          {any} <code>nodeRef</code> Merged node reference
	 *          {any} <code>request</code> Merged nodes in a form can be passed to the backend service
	 * @experimental
	 * @public
	 */
	HotspotHelper.prototype.mergeElements = function(nodeHierarchy, nodes) {
		assert(nodes.length && "HotspotHelper.mergeElements: at least one node must be provided");

		var target = nodeHierarchy.createNode(null, nodes[0].name, null, NodeContentType.Regular, { sid: uid() });
		var targetMatrixWorldInv = Element._invertMatrix(target._matrixWorld());
		var targetNode = {
			name: target.name,
			contentType: "geometry",
			parametric: 0
		};
		var requestNodes = [targetNode], shapes = [], fillStyles = [], lineStyles = [], textStyles = [];

		var geomNodes = new Set();
		nodes.forEach(function(node) {
			node.traverse(function(childNode) {
				if (childNode._isGeometryNode()) {
					geomNodes.add(childNode);
				}
			});
		});

		nodes.forEach(function(node) {
			requestNodes.push({ suppressed: true, sid: node.sid });
		});

		geomNodes.forEach(function(node) {
			var matrixWorld = node._matrixWorld(); // store the world matrix
			node.parent.remove(node);
			target.add(node);
			node.setMatrix(Element._multiplyMatrices(targetMatrixWorldInv, matrixWorld)); // update the local matrix
			node.userData.skipIt = true; // the node is converted to a parametric shape node

			var shape = node._getParametricShape(fillStyles, lineStyles, textStyles);
			if (shape.type !== undefined) {
				shapes.push(shape);
			}
		});

		// remove remaining nodes from the scene
		nodes.forEach(function(node) {
			if (!geomNodes.has(node)) {
				node.parent.remove(node);
			}
		});

		var request = {
			nodes: requestNodes,
			parametrics: [{ shapes: shapes }]
		};

		if (fillStyles.length > 0) {
			request.fillStyles = fillStyles;
		}
		if (lineStyles.length > 0) {
			request.lineStyles = lineStyles;
		}
		if (textStyles.length > 0) {
			request.textStyles = textStyles;
		}

		return {
			nodeRef: target,
			request: request
		};
	};

	/**
	 * Creates a hotspot from the geometry of the specified elements.
	 * @param {sap.ui.vk.svg.Element|sap.ui.vk.svg.Element[]} elements The element reference or the array of element references.
	 * @param {sap.ui.vk.svg.NodeHierarchy} nodeHierarchy The node hierarchy.
	 * @param {sap.ui.vk.svg.Element|null} parentNode The reference object of the parent node where the created hotspot is added to.
	 * @returns {Promise} The Promise that resolves the created hotspot object.
	 * @public
	 */
	HotspotHelper.prototype.createHotspotFromGeometry = function(elements, nodeHierarchy, parentNode) {
		return new Promise(function(resolve, reject) {
			elements = Array.isArray(elements) ? elements : [elements];

			// find geometry nodes
			var geometryNodes = [];
			elements.forEach(function(node) {
				node.traverseVisible(function(child) {
					if (child._isGeometryNode()) {
						geometryNodes.push(child);
					}
				}, -1 >>> 0);
			});

			if (geometryNodes.length === 1) {
				switch (geometryNodes[0].type) {
					case "Rectangle":
					case "Ellipse":
					case "Line":
						// one simple object, no need to convert to path object
						var hotspotNode = nodeHierarchy.createNode(parentNode, elements[0].name, null, NodeContentType.Hotspot);
						hotspotNode.setMatrix(Element._multiplyMatrices(Element._invertMatrix(hotspotNode.parent._matrixWorld()), geometryNodes[0]._matrixWorld()));
						var geom = geometryNodes[0].clone();
						geom.setMatrix([1, 0, 0, 1, 0, 0]);
						hotspotNode.add(geom);
						resolve(hotspotNode);
						return;
					default: break;
				}
			}

			var bbox;
			var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			geometryNodes.forEach(function(node) {// copy geometry to svg and update bbox
				var rect = node._getBBox(node._matrixWorld());
				if (!bbox) {
					bbox = rect;
				} else {
					bbox.width = Math.max(bbox.x + bbox.width, rect.x + rect.width); // max x
					bbox.height = Math.max(bbox.y + bbox.height, rect.y + rect.height); // max y
					bbox.x = Math.min(bbox.x, rect.x);
					bbox.y = Math.min(bbox.y, rect.y);
					bbox.width -= bbox.x;
					bbox.height -= bbox.y;
				}
				var domRef = node.domRef.cloneNode(true);
				if (domRef.getAttribute("fill")) {
					domRef.setAttribute("fill", "#000");
				}
				if (domRef.getAttribute("stroke")) {
					domRef.setAttribute("stroke", "#000");
				}
				domRef.setAttribute("transform", "matrix(" + node._matrixWorld().join(",") + ")");
				svg.appendChild(domRef);
			});

			// expand bbox by 10% because some thick lines may be outside the svg boundaries, getBBox() doesn't take stroke-width into account
			var dx = bbox.width * 0.05;
			var dy = bbox.height * 0.05;
			bbox.x -= dx;
			bbox.y -= dy;
			bbox.width += dx * 2;
			bbox.height += dy * 2;

			svg.setAttribute("width", Math.ceil(1000 * bbox.width / Math.max(bbox.width, bbox.height))); // max width = 1000px
			svg.setAttribute("height", Math.ceil(1000 * bbox.height / Math.max(bbox.width, bbox.height))); // max height = 1000px
			svg.setAttribute("viewBox", [bbox.x, bbox.y, bbox.width, bbox.height].join(" "));
			svg.setAttribute("font-family", "\"72\",\"72full\",Arial,Helvetica,sans-serif"); // default font family comes from .sapUiBody css rule
			// console.log(svg);

			var image = new Image();
			image.onload = function() {
				var canvas = document.createElement("canvas");
				var width = canvas.width = this.width;
				var height = canvas.height = this.height;
				var ctx = canvas.getContext("2d");
				var hotspotNode = nodeHierarchy.createNode(parentNode, elements[0].name, null, NodeContentType.Hotspot);
				var parentMatrixWorld = hotspotNode.parent._matrixWorld();
				var flipY = parentMatrixWorld[3] < 0;
				if (flipY) {
					hotspotNode.setMatrix(Element._multiplyMatrices(Element._invertMatrix(parentMatrixWorld), [bbox.width / width, 0, 0, -bbox.height / height, bbox.x, bbox.y + bbox.height]));
					ctx.transform(1, 0, 0, -1, 0, height);
				} else {
					hotspotNode.setMatrix(Element._multiplyMatrices(Element._invertMatrix(parentMatrixWorld), [bbox.width / width, 0, 0, bbox.height / height, bbox.x, bbox.y]));
				}
				ctx.drawImage(this, 0, 0, width, height);
				var srcData = ctx.getImageData(0, 0, width, height); // svg rasterized image data

				function pixelPos(x, y) {
					return (x + y * width) << 2;
				}

				// expand hotspot boundaries by 2 pixels for better UX
				var destData = ctx.createImageData(width, height);
				var x, y;
				var src, dest;
				function getAlpha(x, y) {
					return x >= 0 && x < width && y >= 0 && y < height ? src[pixelPos(x, y) + 3] : 0;
				}
				for (var it = 0; it < 2; it++) {
					src = srcData.data;
					dest = destData.data;
					for (y = 1; y < height; y++) {
						for (x = 1; x < width; x++) {
							if (getAlpha(x, y) > 127 ||
								getAlpha(x - 1, y) > 127 || getAlpha(x + 1, y) > 127 ||
								getAlpha(x, y - 1) > 127 || getAlpha(x, y + 1) > 127) {
								dest[pixelPos(x, y) + 3] = 255; // set alpha to 255
							}
						}
					}
					var tmp = srcData;
					srcData = destData;
					destData = tmp;
				}

				var data = srcData.data;
				function notMarked(x, y) {
					var p = pixelPos(x, y);
					return data[p + 3] < 128 && data[p] !== 1;
				}

				// mark outside area
				var pixels = [0, 0];
				while (pixels.length > 0) {
					y = pixels.pop();
					x = pixels.pop();
					data[pixelPos(x, y)] = 1; // mark pixel
					if (x + 1 < width && notMarked(x + 1, y)) {
						pixels.push(x + 1, y);
					}
					if (x > 0 && notMarked(x - 1, y)) {
						pixels.push(x - 1, y);
					}
					if (y + 1 < height && notMarked(x, y + 1)) {
						pixels.push(x, y + 1);
					}
					if (y > 0 && notMarked(x, y - 1)) {
						pixels.push(x, y - 1);
					}
				}

				// fill inside empty areas
				for (y = 0; y < height; y++) {
					for (x = 0; x < width; x++) {
						if (notMarked(x, y)) {
							data[pixelPos(x, y) + 3] = 255; // set alpha to 255
						}
					}
				}

				// synchronous tracing to SVG string
				var svgXml = ImageTracer.imagedataToSVG(srcData, {
					ltres: 2,
					qtres: 2,
					pathomit: 8,
					rightangleenhance: false,

					colorsampling: 0,
					numberofcolors: 2,
					mincolorratio: 0,
					colorquantcycles: 1,

					blurradius: 0,
					blurdelta: 20,

					strokewidth: 0,
					linefilter: true,
					roundcoords: 0,
					pal: [{ r: 0, g: 0, b: 0, a: 0 }, { r: 0, g: 0, b: 0, a: 255 }],

					desc: false
				});
				// console.log(svgXml);

				// var resultImage = new Image();
				// resultImage.src = "data:image/svg+xml;base64," + btoa(svgXml);
				// window.open("").document.write(resultImage.outerHTML);

				var segments = [];
				var doc = new DOMParser().parseFromString(svgXml, "image/svg+xml");
				if (doc && doc.firstChild && doc.firstChild.tagName === "svg") {
					// collect opaque path segments (ignore transparent)
					for (var domRef = doc.firstChild.firstChild; domRef !== null; domRef = domRef.nextSibling) {
						if (domRef.tagName === "path" && domRef.getAttribute("opacity") > 0.5) {
							segments = segments.concat(Path._extractSegmentsFromDomRef(domRef));
						}
					}
				}

				if (segments.length > 0) {
					hotspotNode.add(new Path({ segments: segments }));
					resolve(hotspotNode);
				} else {
					hotspotNode.parent.remove(hotspotNode);
					reject();
				}
			};

			image.src = "data:image/svg+xml;base64," + btoa(new XMLSerializer().serializeToString(svg));
			// window.open("").document.write(image.outerHTML);
		});
	};

	/**
	 * Creates a request payload for a storage server to create a parametric primitives for the specified elements.
	 * @param {sap.ui.vk.svg.Element|sap.ui.vk.svg.Element[]} elements The element reference or the array of element references.
	 * @param {sap.ui.vk.svg.Viewport} viewport The current Viewport.
	 * @returns {object} JSON payload for the request.
	 * @public
	 */
	HotspotHelper.prototype.createRequest = function(elements, viewport) {
		if (!elements || !viewport) {
			return null;
		}

		var nodes = [];
		var parametrics = [];
		var fillStyles = [];
		var lineStyles = [];
		var textStyles = [];
		var view = viewport && viewport._currentView;

		function pushNode(element, scene) {
			scene.setNodePersistentId(element, uuidv4());

			var nodeInfo = {
				name: element.name,
				transform: TransformationMatrix.convert3x2To4x3(element.matrix),
				veId: element.sid
			};

			if (element.nodeContentType === NodeContentType.Hotspot) {
				nodeInfo.contentType = "HOTSPOT";
			}

			if (element.userData.duplicatedFrom) {
				nodeInfo.duplicatedFrom = element.userData.duplicatedFrom;
				delete element.userData.duplicatedFrom;
			}

			var parametric = element.getParametricContent(fillStyles, lineStyles, textStyles);
			if (parametric) {
				nodeInfo.parametric = parametrics.length;
				parametrics.push(parametric);
			}

			var index = nodes.length;
			nodes.push(nodeInfo);

			var children = element.children;
			if (children.length > 0) {
				var childrenInfo = [];
				for (var i = 0; i < children.length; i++) {
					if (children[i].type === "Group") {
						childrenInfo.push(pushNode(children[i], scene));
					}
				}
				if (childrenInfo.length > 0) {
					nodeInfo.children = childrenInfo;
				}
			}

			return index;
		}

		var scene = viewport.getScene();
		(Array.isArray(elements) ? elements : [elements]).forEach(function(element) {
			pushNode(element, scene);
		});

		var request = {
			views: [{
				id: view && view.getViewId(),
				nodes: nodes
			}],
			parametrics: parametrics
		};

		if (fillStyles.length > 0) {
			request.fillstyles = fillStyles;
		}
		if (lineStyles.length > 0) {
			request.linestyles = lineStyles;
		}
		if (textStyles.length > 0) {
			request.textStyles = textStyles;
		}

		return request;
	};

	return HotspotHelper;
});
