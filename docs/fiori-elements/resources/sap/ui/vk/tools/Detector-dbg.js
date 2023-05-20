/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.tools.Detector
sap.ui.define([
	"../thirdparty/three"
], function(
	THREE
) {
	"use strict";
	var Detector = function() {
		this._verticesMap = new Map();
		this._objArr = [];
		this._collidedUuids = new Set();
		this._sourceObjects = null;
		this._targetObjects = [];
		this._srcBoxHelper = null;
		this._sourceBox = new THREE.Box3();
		this._originPos = new THREE.Vector3();
		this._targetBoxHelper = [];
		this._targetBoxes = [];
		this._detectDistance = 20.0;
		this._direction = new THREE.Vector3();
		this._isReady = false;
		this._finalDistance = null;
		this._finalSnaps = [];
		this._intersectDistance = Number.NEGATIVE_INFINITY;
		this._collidedUuid = null;
		this._isMoved = false;
		this._detectType = {
			"move": this.detectMove.bind(this),
			"scale": this.detectScale.bind(this),
			"rotate": this.detectRotate.bind(this)
		};
	};

	Detector.prototype.isReady = function() {
		if (this._isReady && this._sourceObjects) {
			return true;
		} else {
			return false;
		}
	};

	Detector.prototype.setMoved = function(value) {
		this._isMoved = value;
		this._intersectDistance = Number.NEGATIVE_INFINITY;
	};

	Detector.prototype.getObjArray = function() {
		return this._objArr;
	};

	Detector.prototype.addObjFromScene = function(viewport) {
		var sceneRef = viewport._scene.getSceneRef();
		var vsm = viewport._viewStateManager;
		this._objArr.length = 0;
		this._verticesMap.clear();
		sceneRef.traverse(function(child) {
			if (child.isMesh) {
				if (!this._objArr.find(function(o) { return o.uuid === child.uuid; })) {
					this._objArr.push(child);
					var vArr = this.getVertices(child.geometry, child.userData.renderGroup);
					this._verticesMap.set(child.uuid, vArr);
				}
			}
		}.bind(this));
		this.setSource(vsm, viewport);
		this._isReady = true;
	};

	Detector.prototype.setSource = function(viewStateManager, viewport) {
		var selectedNodes = [];
		viewStateManager.enumerateSelection(function(nodeRef) {
			selectedNodes.push(nodeRef);
		});
		if (selectedNodes.length > 0) {
			var obj = selectedNodes.pop();
			if (this._isReady) {
				viewStateManager.setSelectionStates(obj, selectedNodes, false, true);
			}
			if (obj.children.length === 0) {
				this._isGroup = false;
				// source object is not grouped into a node
				this._sourceObjects = obj;
			} else {
				// source objects are grouped into a node
				this._isGroup = true;
				var meshes = [];
				obj.traverse(function(node) {
					if (node.type === "Mesh") {
						meshes.push(node);
					}
				});
				this._sourceObjects = meshes[0];
			}
			this._srcBoxHelper = new THREE.BoxHelper(this._sourceObjects);
			this._srcBoxHelper.update();
			this._sourceBox.setFromObject(this._srcBoxHelper);
			this._sourceSize = this._sourceBox.getSize(new THREE.Vector3());
			this._calculateInitialDetectDistance(viewport);
		} else {
			this._isReady = false;
			this._sourceObjects = null;
			this._sourceBox = new THREE.Box3();
		}
		this.setTarget();
	};

	Detector.prototype._calculateInitialDetectDistance = function(viewport) {
		// get 3d space coordinate of top left and top right of viewport
		if (viewport) {
			var vec = new THREE.Vector3();
			var pos1 = new THREE.Vector3();
			var viewportSize = viewport.getRenderer().getSize(new THREE.Vector2());
			vec.set((0 / viewportSize.x) * 2 - 1, -(0 / viewportSize.y) * 2 + 1, 0.5);
			var camera = viewport.getCamera().getCameraRef();
			vec.unproject(camera);
			vec.sub(camera.position).normalize();
			var distance = -camera.position.z / vec.z;
			pos1.copy(camera.position).add(vec.multiplyScalar(distance));

			var pos2 = new THREE.Vector3();
			vec.set((viewportSize.x / viewportSize.x) * 2 - 1, -(0 / viewportSize.y) * 2 + 1, 0.5);
			vec.unproject(camera);
			vec.sub(camera.position).normalize();
			distance = -camera.position.z / vec.z;
			pos2.copy(camera.position).add(vec.multiplyScalar(distance));

			var viewWidth = pos1.distanceTo(pos2);
			this._detectDistance = Math.abs(viewWidth) * 0.05;
		}
	};

	Detector.prototype.setTarget = function() {
		this._intersectDistance = Number.NEGATIVE_INFINITY;
		this._collidedUuid = null;
		this._collidedUuids.clear();
		this._isMoved = false;
		if (this._sourceObjects) {
			this._sourceObjects.geometry.computeBoundingSphere();
			this._originPos = new THREE.Vector3();
			this._targetObjects = this._objArr.filter(function(o) { return o.uuid !== this._sourceObjects.uuid; }.bind(this));
			this._targetBoxes.length = 0;
			this._targetBoxHelper.length = 0;
			this._targetObjects.forEach(function(to) {
				var toBoxHelper = new THREE.BoxHelper(to);
				this._targetBoxHelper.push(toBoxHelper);
				toBoxHelper.update();
				var toBox = new THREE.Box3();
				toBox.setFromObject(to);
				this._targetBoxes.push(toBox);
			}.bind(this));
		} else {
			this._targetObjects.length = 0;
			this._targetBoxes.length = 0;
			this._targetBoxHelper.length = 0;
		}
	};

	Detector.prototype.updateTargetBox = function() {
		this._targetBoxHelper.forEach(function(tbHelper, i) {
			tbHelper.update();
			this._targetBoxes[i].setFromObject(tbHelper);
		}.bind(this));
	};

	Detector.prototype.getVertices = function(geometry, renderGroup) {
		var i, l, vertices = [];
		if (geometry.isGeometry) {
			vertices = geometry.vertices;
		} else if (geometry.isBufferGeometry) {
			var attribute = geometry.attributes.position;
			if (attribute !== undefined) {
				var v = new THREE.Vector3();
				vertices = [];
				var obj = {};
				var vStr = "";
				for (i = renderGroup ? renderGroup.firstVertex : 0, l = renderGroup ? renderGroup.lastVertex : attribute.count; i < l; i++) {
					v.fromBufferAttribute(attribute, i);
					vStr = JSON.stringify(v);
					// remove vertices with the same position
					// only store unique position vertices
					if (!obj[vStr]) {
						vertices.push(v.clone());
						obj[vStr] = true;
					}
				}
			}
		}
		return vertices;
	};

	Detector.prototype.findClosestVertex = function(position, radius, object) {
		var vertices = this._verticesMap.get(object.uuid);
		if (vertices.length === 0) {
			return null;
		}
		var distance, vertex = null,
			localPosition = object.worldToLocal(position.clone());
		for (var i = 0, il = vertices.length; i < il; i++) {
			distance = vertices[i].distanceTo(localPosition);
			if (distance > radius) {
				continue;
			}
			// use distance in new comparison to find the closest point
			radius = distance;
			vertex = vertices[i];
		}
		if (vertex === null) {
			return null;
		}
		return object.localToWorld(vertex.clone());
	};

	Detector.prototype.findClosestSnap = function(position, radius, targetObj) {
		var increment = 2;
		var snap;
		while (!snap) {
			snap = this.findClosestVertex(position, radius, targetObj);
			radius *= increment;
		}
		return snap;
	};

	Detector.prototype.intersectDetect = function(interObjArr) {
		var snaps = new Map();
		var originBBoxExp = this._sourceBox.clone().expandByScalar(this._detectDistance);
		interObjArr.forEach(function(o) {
			var targetIdx = this._targetObjects.findIndex(function(t) { return t.uuid === o.object.uuid; });
			if (!this._collidedUuids.has(o.object.uuid) && targetIdx !== -1 && this._targetBoxes && this._targetBoxes[targetIdx].intersectsBox(originBBoxExp)) {
				var snap = this.findClosestSnap(this._originPos, this._detectDistance, this._targetObjects[targetIdx]);
				snaps.set(snap, this._targetObjects[targetIdx]);
				if (this._targetBoxes[targetIdx].intersectsBox(this._sourceBox) && this._intersectDistance < this._finalDistance) {
					// Collision detect between source object and target
					if (this.detectCollisionGJK(this._sourceObjects, this._targetObjects[targetIdx])) {
						this._collidedUuid = o.object.uuid;
						this._intersectDistance = this._finalDistance;
					}
				}
			}
		}.bind(this));
		return snaps;
	};

	Detector.prototype.getFinalSnaps = function(interObjArr) {
		var finalSnaps = [];
		if (interObjArr.length > 0) {
			var snaps = this.intersectDetect(interObjArr);
			if (snaps.size !== 0) {
				var snapsArray = Array.from(snaps.keys());
				// find the nearest snap point
				var minSnap = snapsArray[0];
				var l = minSnap.distanceTo(this._originPos);
				for (var i = 1; i < snapsArray.length; ++i) {
					var q = snapsArray[i];
					var ql = q.distanceTo(this._originPos);
					if (ql < l) {
						minSnap = q;
						l = ql;
					}
				}
				var objFound = snaps.get(minSnap);
				var currDistance = this._originPos.distanceTo(minSnap);
				var snap, nextSnap;
				snap = this.findClosestSnap(minSnap, currDistance, this._sourceObjects);
				var nextDistance = snap.distanceTo(minSnap);
				nextSnap = this.findClosestSnap(snap, nextDistance, objFound);
				finalSnaps = [snap, nextSnap];
			}
		}
		return finalSnaps;
	};

	Detector.prototype.snapMove = function() {
		var option = this._op;
		// move source obj
		if (this._finalSnaps.length === 2 && this._sourceObjects && Math.abs(this._finalDistance - this._intersectDistance) > 0.1) {
			if (!this._collidedUuid && this._finalDistance >= this._intersectDistance) {
				option.gizmo._tool._handler._gesture = false;
				option.gizmo._moveDelta.add(this._direction.clone().multiplyScalar(0.1));
				option.gizmo._move(option.gizmo._moveDelta);
			} else {
				this._intersectDistance = Number.NEGATIVE_INFINITY;
				this._collidedUuid = null;
				this._isMoved = false;
				option.viewport.setShouldRenderFrame();
			}
			this.detect();
		}
	};

	Detector.prototype.snapScale = function() {
		var option = this._op;
		// scale source obj
		if (!option.gizmo._scaleDelta.equals(new THREE.Vector3(1, 1, 1))
			&& this._finalSnaps.length === 2
			&& this._sourceObjects
			&& Math.abs(this._finalDistance - this._intersectDistance) > 0.1) {
			if (!this._collidedUuid && this._finalDistance >= this._intersectDistance) {
				option.gizmo._tool._handler._gesture = false;
				var gsArray = option.gizmo._scaleDelta.toArray();
				gsArray.forEach(function(s, i) {
					if (s > 1) {
						option.gizmo._scaleDelta.setComponent(i, s * 1.01);
					}
				});
				option.gizmo._scale(option.gizmo._scaleDelta);
			} else {
				this._intersectDistance = Number.NEGATIVE_INFINITY;
				this._collidedUuid = null;
				this._isMoved = false;
				option.viewport.setShouldRenderFrame();
			}
			this.detect();
		} else if (Math.abs(this._finalDistance - this._intersectDistance) <= 0.1) {
			this._collidedUuids.add(this._collidedUuid);
		}
	};

	Detector.prototype.snapRotate = function() {
		var option = this._op;
		// rotate source obj
		if (this._finalSnaps.length === 2 && this._sourceObjects && Math.abs(this._finalDistance - this._intersectDistance) > 0.1) {
			if (!this._collidedUuid && this._finalDistance >= this._intersectDistance) {
				option.gizmo._tool._handler._gesture = false;
				option.angle2 += 0.02 * (option.angle2 - option.angle1) / Math.abs(option.angle2 - option.angle1);
				option.gizmo._setRotationAxisAngle(option.handleIndex, option.angle1, option.angle2);
			} else {
				this._intersectDistance = Number.NEGATIVE_INFINITY;
				this._collidedUuid = null;
				this._isMoved = false;
				option.viewport.setShouldRenderFrame();
			}
			this.detect();
		}
	};

	Detector.prototype._calculateDetectDistance = function() {
		var sourceSize = this._sourceSize;
		var direction = "";
		var newDetectDistance = 0;
		if (Math.abs(this._direction.x) === 1) {
			direction = "x";
		} else if (Math.abs(this._direction.y) === 1) {
			direction = "y";
		} else if (Math.abs(this._direction.z) === 1) {
			direction = "z";
		}
		var halfBoundingBox = (sourceSize[direction] / 2);
		if (halfBoundingBox) {
			newDetectDistance = this._detectDistance + halfBoundingBox;
		}
		return newDetectDistance;
	};

	Detector.prototype.detectMove = function() {
		// for move
		this._direction.copy(this._op.gizmo._moveDelta).normalize();
		var distance = this._calculateDetectDistance();
		var raycaster = new THREE.Raycaster(this._originPos, this._direction, 0, distance);
		this._snapAction = debounce(this.snapMove, 1000 / 60).bind(this);
		return raycaster.intersectObjects(this._targetObjects, false);
	};

	Detector.prototype.detectScale = function() {
		// for scale
		if (this._op.gizmo._scaleDelta.toArray().find(function(s) { return s <= 1; })) {
			this._op.gizmo._tool._handler._gesture = true;
			this._collidedUuids.forEach(function(cid) {
				var cobj = this._targetObjects.find(function(t) {
					return t.uuid === cid;
				});
				if (cobj && !this.detectCollisionGJK(this._sourceObjects, cobj)) {
					this._collidedUuids.delete(cid);
				}
			}.bind(this));
		}
		this._gizmoPos = new THREE.Vector3();
		this._op.gizmo._gizmo.getWorldPosition(this._gizmoPos);
		var srcWorldPos = new THREE.Vector3();
		this._sourceObjects.getWorldPosition(srcWorldPos);
		var rg = this._sourceObjects.userData.renderGroup;
		var tmpSphere = (rg && rg.boundingSphere) ?
			THREE.Sphere.newFromPackedArray(rg.boundingSphere) :
			this._sourceObjects.geometry.boundingSphere.clone();

		var sphereRadius = tmpSphere.applyMatrix4(this._sourceObjects.matrixWorld).radius;
		var bSphere = new THREE.Sphere(srcWorldPos, sphereRadius + this._detectDistance);
		var interObjArr = [];
		this._targetBoxes.forEach(function(targetBBox, i) {
			if (targetBBox.intersectsSphere(bSphere)) {
				interObjArr.push({ object: this._targetObjects[i] });
			}
		}.bind(this));
		this._snapAction = debounce(this.snapScale, 1000 / 60).bind(this);
		return interObjArr;
	};

	Detector.prototype.detectRotate = function() {
		// for rotate
		this._gizmoPos = new THREE.Vector3();
		this._op.gizmo._gizmo.getWorldPosition(this._gizmoPos);
		var pointToSource = new THREE.Vector3();
		var srcWorldPos = new THREE.Vector3();
		var raycaster = new THREE.Raycaster(this._originPos, this._direction, 0, this._detectDistance);
		this._sourceObjects.getWorldPosition(srcWorldPos);
		this._radius = this._gizmoPos.distanceTo(srcWorldPos);
		var axisIndex = this._op.handleIndex;
		this._axis = new THREE.Vector3().setFromMatrixColumn(this._op.gizmo._matOrigin, axisIndex).normalize();
		this._axis.transformDirection(this._op.gizmo._gizmo.matrixWorld);
		// gizmo center is not obj position
		if (this._radius > 0.01) {
			pointToSource.subVectors(srcWorldPos, this._gizmoPos).normalize();
			this._detectDistance = this._radius;
			this._direction.crossVectors(pointToSource, this._axis).normalize();
		} else if (this._finalSnaps.length === 2) {
			pointToSource.subVectors(this._finalSnaps[0], this._gizmoPos).normalize();
			this._direction.crossVectors(pointToSource, this._axis).normalize();
		}
		// rotate counter clockwise
		if (this._op.gizmo._rotationDelta.getComponent(axisIndex) > 0) {
			this._direction.negate();
		}
		var rotatePlane = new THREE.Plane(this._axis);
		var interObjArr = [], tempTargets = [];
		var bSphere, sphereRadius = 0.0;
		if (this._radius < 0.01) {
			// rotate around itself position
			var rg = this._sourceObjects.userData.renderGroup;
			var tmpSphere = (rg && rg.boundingSphere) ?
				THREE.Sphere.newFromPackedArray(rg.boundingSphere) :
				this._sourceObjects.geometry.boundingSphere.clone();

			sphereRadius = tmpSphere.applyMatrix4(this._sourceObjects.matrixWorld).radius;
			bSphere = new THREE.Sphere(this._gizmoPos, sphereRadius);
			this._targetBoxes.forEach(function(targetBBox, i) {
				if (targetBBox.intersectsSphere(bSphere) && targetBBox.intersectsPlane(rotatePlane)) {
					interObjArr.push({ object: this._targetObjects[i] });
				}
			}.bind(this));
		} else {
			// rotate around multi objs center
			// raycast search along direction when rotate
			bSphere = new THREE.Sphere(this._gizmoPos, this._radius);
			this._targetBoxes.forEach(function(targetBBox, i) {
				if (targetBBox.intersectsSphere(bSphere) && targetBBox.intersectsPlane(rotatePlane)) {
					tempTargets.push(this._targetObjects[i]);
				}
			}.bind(this));
			interObjArr = raycaster.intersectObjects(tempTargets, false);
		}
		this._snapAction = debounce(this.snapRotate, 1000 / 60).bind(this);
		return interObjArr;
	};

	// detectOptions: viewport, gizmo, detectType, handleIndex, angle1, angle2
	Detector.prototype.detect = function(detectOptions) {
		var option = this._op = detectOptions || this._op;
		if (!this.isReady() || !this._verticesMap.has(this._sourceObjects.uuid)) {
			this.addObjFromScene(option.viewport);
		} else {
			// update source object BBOX
			this._srcBoxHelper.update();
			this._sourceBox.setFromObject(this._sourceObjects);
			this._sourceBox.getCenter(this._originPos);
			// update target object BBOX
			this.updateTargetBox();
			var interObjArr = this._detectType[option.detectType]();
			this._finalSnaps = this.getFinalSnaps(interObjArr);
			if (this._finalSnaps.length === 2) {
				var finalDirection = new THREE.Vector3();
				finalDirection.subVectors(this._finalSnaps[1], this._finalSnaps[0]);
				this._finalDistance = finalDirection.length();
				// console.log("Distance===", this._finalDistance, this._intersectDistance, this._finalSnaps);
				if (this._finalDistance) { this._snapAction(); }
			}
		}
	};

	/**
	 * Debounce a function and delays invoking it, until after a given time period
	 * have elapsed since the last time the debounced function was invoked
	 * @param {Function} func The function to debounce.
	 * @param {number} wait The amount of milliseconds to delay
	 * @return {Function} The debounce function.
	 */
	function debounce(func, wait) {
		var timeout;
		return function() {
			var that = this,
				args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				timeout = null;
				func.apply(that, args);
			}, wait);
		};
	}

	// GJK algorithm
	Detector.prototype.detectCollisionGJK = function(object, target) {
		var MAX_ITERATIONS = 64;
		var that = this;
		function GJK(shape1, shape2) {
			// Keep track of how many vertices of the simplex are known
			var simplex = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
			var n = 2;

			// Use move direction
			var d = that._direction;
			simplex[1] = support(shape1, shape2, d);

			// If no points are beyond the origin, the origin is outside the minkowski sum
			// No collision is possible
			if (simplex[1].dot(d) < 0) {
				return false;
			}

			// Get another point in the opposite direction of the first
			d = simplex[1].clone().negate();
			simplex[0] = support(shape1, shape2, d);

			if (simplex[0].dot(d) < 0) {
				return false;
			}

			// Pick a direction perpendicular to the line
			var tmp = simplex[1].clone().sub(simplex[0]);
			var tmp2 = simplex[0].clone().negate();
			d = tmp.clone().cross(tmp2).cross(tmp);

			var face = function(a, aO, ab, ac, ad, abc, acd) {
				if (ab.clone().cross(abc).dot(aO) > 0) {
					// In the region of AB
					simplex[1] = simplex[0];
					simplex[0] = a.clone();
					d = ab.clone().cross(aO).cross(ab);
					n = 2;
				} else {
					// In the region of ABC
					simplex[2] = simplex[1];
					simplex[1] = simplex[0];
					simplex[0] = a.clone();
					d = abc.clone();
				}
			};

			var oneFace = function(a, aO, ab, ac, ad, abc, acd) {
				if (abc.clone().cross(ac).dot(aO) > 0) {
					// In the region of AC
					simplex[0] = a.clone();
					d = ac.clone().cross(aO).cross(ac);
					n = 2;
				} else {
					face(a, aO, ab, ac, ad, abc, acd);
				}
			};

			var twoFaces = function(a, aO, ab, ac, ad, abc, acd) {
				if (abc.clone().cross(ac).dot(aO) > 0) {
					// Origin is beyond AC from ABCs view
					// Only need to test ACD
					simplex[0] = simplex[1];
					simplex[1] = simplex[2].clone();

					ab = ac;
					ac = ad.clone();
					abc = acd.clone();

					oneFace(a, aO, ab, ac, ad, abc, acd);
				} else {
					face(a, aO, ab, ac, ad, abc, acd);
				}
			};

			function support(shape1, shape2, d) {
				// Get some point on the minkowski sum (difference really)
				// Do this by getting the farthest point in d
				var dir = d.clone().normalize();

				var p1 = getFarthestPoint(shape1, dir);
				var p2 = getFarthestPoint(shape2, dir.negate());

				return p1.clone().sub(p2);
			}

			function getFarthestPoint(shape, d) {
				var vertices = that._verticesMap.get(shape.uuid);
				// Project all vertices, get the longest vertex position
				var p = shape.localToWorld(vertices[0].clone());
				var l = p.dot(d);
				for (var i = 1; i < vertices.length; ++i) {
					var q = shape.localToWorld(vertices[i].clone());
					var proj = q.dot(d);

					if (proj > l) {
						p = q;
						l = proj;
					}
				}
				return p;
			}

			for (var i = 0; i < MAX_ITERATIONS; ++i) {
				var a = support(shape1, shape2, d);
				if (a.dot(d) < 0) {
					return false;
				}
				var aO, ab, ac, ad, abc;
				if (n === 2) {
					aO = a.clone().negate();

					ab = simplex[0].clone().sub(a);
					ac = simplex[1].clone().sub(a);
					abc = ab.clone().cross(ac);

					var abp = ab.clone().cross(abc);

					if (abp.dot(aO) > 0) {
						// Origin lies outside near edge ab
						simplex[1] = simplex[0];
						simplex[0] = a.clone();
						d = ab.clone().cross(aO).cross(ab);

						continue;
					}

					var acp = abc.clone().cross(ac);

					if (acp.dot(aO) > 0) {
						// Origin lies outside near edge ac
						simplex[0] = a.clone();
						d = ac.clone().cross(aO).cross(ac);

						continue;
					}

					if (abc.dot(aO) > 0) {
						simplex[2] = simplex[1];
						simplex[1] = simplex[0];
						simplex[0] = a.clone();
						d = abc.clone();
					} else {
						simplex[2] = simplex[0];
						simplex[0] = a.clone();
						d = abc.clone().negate();
					}

					// need a tetrahedron to enclose the origin
					n = 3;
					continue;
				}

				// start checking if tetrahedron contains the origin
				aO = a.clone().negate();
				ab = simplex[0].clone().sub(a);
				ac = simplex[1].clone().sub(a);
				ad = simplex[2].clone().sub(a);

				abc = ab.clone().cross(ac);
				var acd = ac.clone().cross(ad);
				var adb = ad.clone().cross(ab);

				// Check if the point is inside the tetrahedron
				var ABC = 0x1;
				var ACD = 0x2;
				var ADB = 0x4;
				var tests =
					(abc.dot(aO) > 0 ? ABC : 0) |
					(acd.dot(aO) > 0 ? ACD : 0) |
					(adb.dot(aO) > 0 ? ADB : 0);

				// Behind all three faces, collision!
				if (tests === 0) {
					return true;
				}
				// Behind one face
				if (tests === ABC) {
					oneFace(a, aO, ab, ac, ad, abc, acd);
				} else if (tests === ACD) {
					// Rotate ACD into ABC
					simplex[0] = simplex[1];
					simplex[1] = simplex[2].clone();
					ab = ac;
					ac = ad.clone();
					abc = acd.clone();
					oneFace(a, aO, ab, ac, ad, abc, acd);
				} else if (tests === ADB) {
					// Rotate ADB into ABC
					simplex[1] = simplex[0];
					simplex[0] = simplex[2].clone();
					ac = ab;
					ab = ad.clone();
					abc = adb.clone();
					oneFace(a, aO, ab, ac, ad, abc, acd);
				} else if (tests === ABC || ACD) {
					twoFaces(a, aO, ab, ac, ad, abc, acd);
				} else if (tests === ACD || ADB) {
					// Rotate ACD, ADB into ABC, ACD
					tmp = simplex[0];
					simplex[0] = simplex[1];
					simplex[1] = simplex[2];
					simplex[2] = tmp;
					tmp = ab;
					ab = ac;
					ac = ad;
					ad = tmp;
					abc = acd;
					acd = adb.clone();
					twoFaces(a, aO, ab, ac, ad, abc, acd);
				} else if (tests === ADB || ABC) {
					// Rotate ADB, ABC into ABC, ACD
					tmp = simplex[1];
					simplex[1] = simplex[0];
					simplex[0] = simplex[2];
					simplex[2] = tmp;
					tmp = ac;
					ac = ab;
					ab = ad;
					ad = tmp;
					acd = abc;
					abc = adb.clone();
					twoFaces(a, aO, ab, ac, ad, abc, acd);
				} else {
					return true;
				}
			}
			return true;
		}

		var start = performance.now();
		var isCollide = GJK(object, target);
		if (isCollide) {
			/* eslint-disable no-console */
			console.log("Collide (ms): ", performance.now() - start);
			return true;
		} else {
			console.log("Not Collide (ms): ", performance.now() - start);
			return false;
		}
	};

	return Detector;
});
