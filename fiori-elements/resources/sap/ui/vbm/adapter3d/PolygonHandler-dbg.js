/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.vbm.adapter3d.PolygonHandler
sap.ui.define([
	"sap/ui/base/Object",
	"./Utilities",
	"./thirdparty/three",
	"sap/base/Log"
], function(BaseObject, Utilities, THREE, Log) {
	"use strict";

	var thisModule			= "sap.ui.vbm.PolygonHandler";
	var Vector3				= THREE.Vector3;
	var Matrix4				= THREE.Matrix4;
	var propertyAdded   	= Utilities.propertyAdded;
	var propertyRemoved 	= Utilities.propertyRemoved;
	var propertyChanged 	= Utilities.propertyChanged;
	var updateProperty  	= Utilities.updateProperty;
	var getColor        	= Utilities.getColor;
	var rgbaToString     	= Utilities.rgbaToString;
	var equalsRGBA      	= Utilities.equalsRGBA;
	var createMaterial  	= Utilities.createMaterial;
	var createLineMaterial  = Utilities.createLineMaterial;

	/**
	 * Constructor for a new polygon handler.
	 *
	 * @class
	 * Provides a base class for polygon handler.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vbm.adapter3d.PolygonHandler
	 */
	var PolygonHandler = BaseObject.extend("sap.ui.vbm.adapter3d.PolygonHandler", /** @lends sap.ui.vbm.adapter3d.PolygonHandler.prototype */ {

		constructor: function(root) {
			BaseObject.call(this);

			// parent node for all polygons meshes
			this._root = root;

			// last hot instance
			this._hotInstance = null;

			this._instances = new Map();
			//	instance -> instance data {
			//		instance : Object			Instance reference, to access instance from instance data
			//		indices: [Number]			Indices of triangulated geometry
			//		vertices: [THREE.Vector3]	Vertices of triangulated geometry
			//		normal: THREE.Vector3		Polygon normal
			//		lines: [THREE.Vector3]		Border geometry, each pair of vertices -> line segment
			//		matrix: THREE.Matrix4		World matrix
			//		color: THREE.Color			Polygon color
			//		colorHot: THREE.Color		Hot color
			//		colorBorder: THREE.Color	Border color
			//		colorBorderHot: THREE.Color	Border hot color
			//		mesh: Object				Reference to 'meta' mesh data
			//		border: Object				Reference to 'meta' border data
			//	}

			this._meshes = new Map();
			//	rgba color key: String -> [Object] array of 'meta' meshes {
			//		dirty: Boolean				Rebuild required
			//		object3D: THREE.Mesh		Mesh reference
			//		material: THREE.Material	Hot material
			//		triangleCount: Number		Current triangle count in 'meta' mesh
			//		hitInfo: [Object],			Hit info: face index -> instance reference
			//		instances: Map				Instance data -> range data {
			//			start: Number			Index of the first Index of this instance in the 'meta' mesh 'index' BufferAttribute
			//		}
			//	}

			this._borders = new Map();
			//	rgba color key: String -> [Object] array of 'meta' borders {
			//		dirty: Boolean					Rebuild required
			//		object3D: THREE.LineSegments	Reference to lines object
			//		material: THREE.Material		Hot material
			//		lineCount: Number,				Current line count in 'meta' border
			//		instances: new Map()			Instance data -> range data {
			//			start: Number 				Index of the first Vertex of this instance in the 'meta' border 'position' BufferAttribute
			//		}
			//	}
		}
	});

	var MAX_TRIANGLES= 2000; // 'meta' mesh limit of triangles -> to have predictable rebuild time
	var MAX_LINES = 2000; // 'meta' border limit of lines -> to have predictable rebuild time

	/**
	 * Destroys polygon handler object.
	 * @public
	 */
	PolygonHandler.prototype.destroy = function() {
		// Reset references to shared objects.
		this._root = null;
		this._hotInstance = null;

		// destroy 'meta' meshes
		this._meshes.forEach(function(key, array) {
			array.forEach(function(mesh) {
				this._deleteObject3D(mesh.object3D);
			}, this);
		}, this);

		// destroy 'meta' borders
		this._borders.forEach(function(key, array) {
			array.forEach(function(border) {
				this._deleteObject3D(border.object3D);
			}, this);
		}, this);

		// clear
		this._instances.clear();
		this._instances = null;

		this._meshes.clear();
		this._meshes = null;

		this._borders.clear();
		this._borders = null;

		BaseObject.prototype.destroy.call(this);
	};

	/**
	 * Updates polygon's meshes and borders if there are any, requested for update.
	 * @public
	 */
	PolygonHandler.prototype.update = function() {
		var dirty = this._updateMeshes() || false;
		dirty = this._updateBorders() || dirty;
		// hot has to be reapplied as 'meta' mesh or 'meta' border has been recreated during update
		if (this._hotInstance && dirty) {
			this._updateHot(this._hotInstance, true);
		}
	};

	/**
	 * Adds polygon instance to polygon handler.
	 *
	 * @param {object} instance Polygon instance.
	 * @public
	 */
	PolygonHandler.prototype.addInstance = function(instance) {
		this._instances.set(instance, {
			instance : instance,
			indices: [],
			vertices: [],
			normal: null,
			lines: null,
			matrix: new Matrix4(),
			color: null,
			colorHot: null,
			colorBorder: null,
			colorBorderHot: null,
			mesh: null,
			border: null
		});
		this.updateInstance(instance);
	};

	/**
	 * Updates polygon instance in polygon handler
	 *
	 * @param {object} instance Polygon instance.
	 * @public
	 */
	PolygonHandler.prototype.updateInstance = function(instance) {
		var data = this._instances.get(instance), updateMesh = false, updateBorder = false;
		if (data) {
			// position, rotation, scale [mandatory attributes] when change -> recalculate matrix
			if (propertyChanged(instance, ["pos", "rot", "scale"]) ) {
				Utilities.getInstanceMatrix(instance, data.matrix);
				updateMesh = updateBorder = true; // with matrix change -> need update both 'meta' mesh & 'meta' border
			}

			// normal [optional attribute] when change -> update normal
			if (propertyChanged(instance, "OuterNormal")) {
				data.normal = Utilities.toVector3(instance.OuterNormal || "0;0;1").normalize();
				updateMesh = true; // normal change does not affect border geometry
			}

			// posarray [mandatory attribute] when change -> rebuild geometry
			if (propertyChanged(instance, "posarray")) {
				this._getGeometry(instance, data.indices, data.vertices);
				// not handling the case when geometry increased significantly and total triangle could exceed maximum value
				updateMesh = updateBorder = true; // with positions change -> need update both 'meta' mesh & 'meta' border
			}

			// if any property which affects polygon color changed -> check if polygon color actually changed
			// then update polygon color and remove polygon from current 'meta' mesh if it exists
			// and put it into another 'meta' mesh according to polygon updated color
			// color, selectColor, VB:s [mandatory attributes]
			if (propertyChanged(instance, ["color", "selectColor", "VB:s"])) {
				var color = getColor(instance, instance.color, false);

				if (!data.color || !equalsRGBA(color, data.color)) { // color changed
					this._removeInstanceFromMesh(data); // remove polygon from current 'meta' mesh
					data.color = color;
					data.colorHot = getColor(instance, instance.color, true);
					updateMesh = true; // polygon needs moving from one 'meta' mesh to another -> full rebuild for both required
				}
			}

			// border color [optional attribute] can be added or removed at any time
			if (propertyRemoved(instance, "colorBorder")) {
				this._removeInstanceFromBorder(data); // remove polygon from current 'meta' border
				data.lines = data.colorBorder = data.colorBorderHot = null; // erase border related data
			} else if (instance.colorBorder) { // color border is present -> handle it
				// need to generate border geometry when border has been added or polygon geometry has changed
				if (propertyAdded(instance, "colorBorder") || propertyChanged(instance, "posarray")) {
					data.lines = this._getBorderGeometry(data.indices, data.vertices); // generate border geometry
					// skip handling of the case when geometry increased significantly and total line count could exceed maximum value
					updateBorder = true;
				}
				if (propertyChanged(instance, ["colorBorder", "selectColor,", "VB:s"])) {
					var colorBorder = getColor(instance, instance.colorBorder, false);

					if (!data.colorBorder || !equalsRGBA(colorBorder, data.colorBorder)) { // border color changed
						this._removeInstanceFromBorder(data); // remove polygon from current 'meta' border
						data.colorBorder = colorBorder;
						data.colorBorderHot = getColor(instance, instance.colorBorder, true);
						updateBorder = true; // polygon needs moving from one 'meta' border to another -> full rebuild for both required
					}
				}
			}

			// hot color changed -> calc hot colors only
			if (propertyChanged(instance, "hotDeltaColor")) {
				data.colorHot = getColor(instance, instance.color, true);
				if (data.colorBorder) {
					data.colorBorderHot = getColor(instance, instance.colorBorder, true);
				}
			}

			// update properties after processing is done
			updateProperty(instance, ["pos", "rot", "scale", "OuterNormal", "posarray", "color", "colorBorder", "selectColor", "hotDeltaColor", "VB:s"]);

			// update 'meta' mesh
			if (updateMesh) {
				this._requestMeshUpdate(data);
			}

			// update 'meta' border
			if (instance.colorBorder) {
				if (updateBorder) {
					this._requestBorderUpdate(data);
				}
			}
		} else {
			Log.error("Unable to find polygon instance data", "", thisModule);
		}
	};

	/**
	 * Removes polygon instance from polygon handler.
	 *
	 * @param {object} instance Polygon instance.
	 * @public
	 */
	PolygonHandler.prototype.removeInstance = function(instance) {
		var data = this._instances.get(instance);
		if (data) {
			if (this._hotInstance === instance) {
				this._hotInstance = null;
			}
			this._instances.delete(instance);
			this._removeInstanceFromMesh(data);
			this._removeInstanceFromBorder(data);
			instance._last = {}; // reset all LRU variables at once
		} else {
			Log.error("Unable to find polygon instance data", "", thisModule);
		}
	};

	/**
	 * Updates hot instance of the polygon handler.
	 *
	 * @param {object} instance New hot instance.
	 * @public
	 */
	PolygonHandler.prototype.updateHotInstance = function(instance) {
		// if we have hot polygon instance -> clear hot from it
		if (this._hotInstance) {
			this._updateHot(this._hotInstance, false);
		}
		// apply hot on new instance if it's polygon instance only
		if (instance && instance.isPolygon) {
			this._updateHot(instance, true);
		}
		// keep track of hover instance if it's polygon, null otherwise
		this._hotInstance = (instance && instance.isPolygon) ? instance : null;
	};

	/**
	 * Changes hot state of the polygon instance.
	 * Implemented via adding/removing render groups without changing existing geometry
	 *
	 * @param {object} instance Polygon instance.
	 * @param {boolean} hot Hot status of instance.
	 * @public
	 */
	PolygonHandler.prototype._updateHot = function(instance, hot) {
		var data = this._instances.get(instance), material, object3D, geometry, range;
		if (data) {
			if (data.mesh) { // apply hover on polygon geometry
				material = data.mesh.material;
				object3D = data.mesh.object3D;
				geometry = object3D.geometry;

				// reset first
				if (geometry.groups.length) {
					geometry.groups = []; // use no groups
					object3D.material = object3D.material[0]; // use original material
				}

				if (hot) {
					range = data.mesh.instances.get(data);

					// update hot material with current values
					material.color.copy(data.colorHot.rgb);
					material.opacity = data.colorHot.opacity;
					material.transparent = material.opacity < 1;
					material.needsUpdate = true;

					// use array of materials from now on, first material -> original material, second material -> material with hot color
					object3D.material = [object3D.material, material];

					// create 3 or 2 groups, depends on where hot instance geometry is within 'meta' mesh geometry
					geometry.addGroup(range.start, data.indices.length, 1); // use hot material with index #1

					if (range.start !== 0) {
						geometry.addGroup(0, range.start, 0); // use original material with index #0
					}
					if (range.start + data.indices.length < geometry.index.count) {
						geometry.addGroup(range.start + data.indices.length, geometry.index.count - range.start - data.indices.length, 0); // use original material with index #0
					}
				}
			}
			if (data.border) { // apply hover on polygon border geometry
				material = data.border.material;
				object3D = data.border.object3D;
				geometry = object3D.geometry;
				var positions = geometry.getAttribute("position");

				// reset first
				if (geometry.groups.length) {
					geometry.groups = []; // use no groups
					object3D.material = object3D.material[0]; // use original material
				}

				if (hot) {
					range = data.border.instances.get(data);

					// update hot material with current values
					material.color.copy(data.colorBorderHot.rgb);
					material.opacity = data.colorBorderHot.opacity;
					material.transparent = material.opacity < 1;
					material.needsUpdate = true;

					// first material - original material, second material - material with hot color
					object3D.material = [object3D.material, material];

					// create 3 or 2 groups, depends on where hot instance border geometry is within 'meta' border geometry
					var vertexCount = data.lines.length/3;
					geometry.addGroup(range.start, vertexCount, 1); // use hot material with index #1

					if (range.start !== 0) {
						geometry.addGroup(0, range.start, 0); // use original material with index #0
					}
					if (range.start + vertexCount < positions.count) {
						geometry.addGroup(range.start + vertexCount, positions.count - range.start - vertexCount, 0); // use original material with index #0
					}
				}
			}
		} else {
			Log.error("Unable to find polygon instance data", "", thisModule);
		}
	};

	/**
	 * Creates geometry (triangles) of polygons instance.
	 *
	 * @param {object} instance Instance to create geometry for.
	 * @param {object} indices Array of indices where to put generated indices.
	 * @param {object} vertices Array of vertices where to put generated vertices.
	 * @private
	 */
	PolygonHandler.prototype._getGeometry = function(instance, indices, vertices) {
		var i, pos2d = [], pos = instance.posarray.split(";");

		vertices.length = indices.length = 0; // reset arrays

		for (i = 0; i < pos.length/3; ++i) {
			var x = parseFloat(pos[i*3 + 0]);
			var y = parseFloat(pos[i*3 + 1]);
			var z = parseFloat(pos[i*3 + 2]);

			pos2d.push(new THREE.Vector2(x, y));
			vertices.push(x, y, z);
		}
		var faces = THREE.ShapeUtils.triangulateShape(pos2d, []); // contours only, no holes

		for (i = 0; i < faces.length; ++i) {
			indices.push(faces[i][0], faces[i][1], faces[i][2]);
		}
	};

	/**
	 * Creates border geometry (lines) based on polygon instance geometry (triangles).
	 *
	 * @param {object} indices Array of indices of polygon instance.
	 * @param {object} vertices Array of vertices of polygon instance.
	 * @returns {array} array of (x,y,z) of points. Each 2 points defines a line.
	 * @private
	 */
	PolygonHandler.prototype._getBorderGeometry = function(indices, vertices) {
		var geometry = new THREE.BufferGeometry();
		geometry.setIndex(indices);
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

		var edges = new THREE.EdgesGeometry(geometry);
		var lines = edges.getAttribute("position").array;

		edges.dispose();
		geometry.dispose();

		return lines;
	};

	/**
	 * Updates 'meta' meshes requested for rebuild by combining geometry of all instances with the same color into one mesh.
	 *
	 * @returns {boolean} True if hot instance 'meta' mesh has been recreated.
	 * @private
	 */
	PolygonHandler.prototype._updateMeshes = function() {
		var empty = [], hotUpdate = false, hotData = this._hotInstance ? this._instances.get(this._hotInstance) : null;

		this._meshes.forEach(function(array, color) {
			for (var i = 0; i < array.length;) {
				if (array[i].dirty) {
					var j, instance, base, indices = [], vertices = [], normals = [], data = array[i];

					this._deleteObject3D(data.object3D);
					data.object3D = null;
					data.hitInfo.length = 0; // erase hitInfo

					data.instances.forEach(function(range, key) {
						instance = key; // to access instance outside forEach

						// fill range data (for efficient hover update)
						range.start = indices.length;

						// add indices
						for (j = 0, base = vertices.length/3; j < instance.indices.length; ++j) {
							indices.push(base + instance.indices[j]);
						}

						// fill hit info -> face index -> instance reference
						var count = instance.indices.length/3; // face count
						data.hitInfo.length += count;
						data.hitInfo.fill(instance.instance, data.hitInfo.length - count, data.hitInfo.length);

						// add vertices & normals
						if (instance.matrix._identity) {
							for (j = 0; j < instance.vertices.length/3; ++j) {
								vertices.push(instance.vertices[j*3], instance.vertices[j*3 + 1], instance.vertices[j*3 + 2]);
								normals.push(instance.normal.x, instance.normal.y, instance.normal.z);
							}
						} else {
							var pos = new Vector3();
							for (j = 0; j < instance.vertices.length/3; ++j) {
								pos.set(instance.vertices[j*3], instance.vertices[j*3 + 1], instance.vertices[j*3 + 2]);
								pos.applyMatrix4(instance.matrix);
								vertices.push(pos.x, pos.y, pos.z);
								normals.push(instance.normal.x, instance.normal.y, instance.normal.z);
							}
						}
					});

					if (indices.length) {
						var geometry = new THREE.BufferGeometry();

						geometry.setIndex(indices);
						geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
						geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
						geometry.computeBoundingBox(); // needed for ray casting
						geometry.computeBoundingSphere(); // needed for ray casting

						var material = createMaterial(true);
						material.color.copy(instance.color.rgb);
						material.opacity = instance.color.opacity;
						material.transparent = material.opacity < 1;
						material.needsUpdate = true;

						data.object3D = new THREE.Mesh(geometry, material);
						data.object3D.matrixAutoUpdate = false;
						data.object3D.layers.set(0); // put it to layer #0 to enable raycasting
						this._root.add(data.object3D);

						data.object3D._instanceHitTest = this._instanceHitTest.bind(data); // helper function to return instance based on hit test info
						data.triangleCount = indices.length/3; // update triangle count on full rebuild
					}
					// 'meta' mesh with hot instance in it has to be recreated -> hot status has to be reapplied
					if (hotData && data.instances.has(hotData)) {
						hotUpdate = true;
					}
					data.dirty = false;
				}
				if (array[i].object3D) {
					i++; // move to next element in array
				} else {
					array.splice(i, 1); // remove current element from array as it's empty
				}
			}
			if (!array.length) {
				empty.push(color); // remove map entry as it's empty
			}
		}, this);

		// remove empty 'meta' meshes
		empty.forEach(function(key) {
			this._meshes.delete(key);
		}, this);

		return hotUpdate;
	};

	/**
	 * Updates 'meta' borders requested for rebuild by combining geometry of all instances with the same color into one mesh.
	 *
	 * @returns {boolean} True if hot instance 'meta' border has been recreated.
	 * @private
	 */
	PolygonHandler.prototype._updateBorders = function() {
		var empty = [], hotUpdate = false, hotData = this._hotInstance ? this._instances.get(this._hotInstance) : null;

		this._borders.forEach(function(array, color) {
			for (var i = 0; i < array.length;) {
				if (array[i].dirty) {
					var j, instance, vertices = [], data = array[i];

					this._deleteObject3D(data.object3D);
					data.object3D = null;

					data.instances.forEach(function(range, key) {
						instance = key; // to access instance outside forEach
						range.start = vertices.length/3; // x,z,y -> 3 components of a vector3

						// add vertices
						if (instance.matrix._identity) {
							for (j = 0; j < instance.lines.length; ++j) {
								vertices.push(instance.lines[j]);
							}
						} else {
							var pos = new Vector3();
							for (j = 0; j < instance.lines.length/3; ++j) {
								pos.set(instance.lines[j*3], instance.lines[j*3 + 1], instance.lines[j*3 + 2]);
								pos.applyMatrix4(instance.matrix);
								vertices.push(pos.x, pos.y, pos.z);
							}
						}
					});

					if (vertices.length) {
						var geometry = new THREE.BufferGeometry();
						geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
						geometry.computeBoundingBox();

						var material = createLineMaterial();
						material.color.copy(instance.colorBorder.rgb);
						material.opacity = instance.colorBorder.opacity;
						material.transparent = material.opacity < 1;
						material.needsUpdate = true;

						data.object3D = new THREE.LineSegments(geometry, material);
						data.object3D.matrixAutoUpdate = false;
						data.object3D.layers.set(1); // put it to layer #1 to disable hit test
						this._root.add(data.object3D);

						data.lineCount = vertices.length/6; // update line count on full rebuild
					}
					// 'meta' border with hot instance in it has to be recreated -> hot status has to be reapplied
					if (hotData && data.instances.has(hotData)) {
						hotUpdate = true;
					}
					data.dirty = false;
				}
				if (array[i].object3D) {
					i++; // move to next element in array
				} else {
					array.splice(i, 1); // remove current element from array as it's empty
				}
			}
			if (!array.length) {
				empty.push(color); // remove map entry as it's empty
			}
		}, this);

		// remove empty 'meta' borders
		empty.forEach(function(key) {
			this._borders.delete(key);
		}, this);

		return hotUpdate;
	};

	/**
	 * Requests 'meta' mesh to rebuild.
	 * If there is no 'meta' mesh associated with instance then it finds suitable 'meta' mesh,
	 * but also maintains triangle limit of 'meta' mesh.
	 *
	 * @param {object} data Instance data of the polygon instance.
	 * @private
	 */
	PolygonHandler.prototype._requestMeshUpdate = function(data) {
		if (data.mesh) {
			data.mesh.dirty = true;
		} else {
			var key = rgbaToString(data.color);
			var meshes = this._meshes.get(key);
			// color hasn't been used -> add new array
			if (!meshes) {
				meshes = [];
				this._meshes.set(key, meshes);
			}
			// find suitable 'meta' mesh so triangle count will not exceed MAX_TRIANGLES
			for (var i = 0; i < meshes.length; ++i) {
				if (meshes[i].triangleCount + data.indices.length/3 <= MAX_TRIANGLES) {
					data.mesh = meshes[i];
					break;
				}
			}
			// if no 'meta' mesh found -> create new one
			if (!data.mesh) {
				data.mesh = {
					dirty: true,
					object3D: null,
					material: createMaterial(true),
					triangleCount: 0,
					hitInfo: [],
					instances: new Map()
				};
				meshes.push(data.mesh);
			}
			// add instance to it
			data.mesh.instances.set(data, { start: 0 });
			data.mesh.dirty = true;
			data.mesh.triangleCount += data.indices.length/3;
		}
	};

	/**
	 * Requests 'meta' border to rebuild.
	 * If there is no 'meta' border associated with instance then it finds suitable 'meta' border,
	 * but also maintains lines limit of 'meta' border.
	 *
	 * @param {object} data Instance data of the polygon instance.
	 * @private
	 */
	PolygonHandler.prototype._requestBorderUpdate = function(data) {
		if (data.border) {
			data.border.dirty = true;
		} else {
			var key = rgbaToString(data.colorBorder);
			var borders = this._borders.get(key);
			// color hasn't been used -> add new array
			if (!borders) {
				borders = [];
				this._borders.set(key, borders);
			}
			// find suitable 'meta' border so line count will not exceed MAX_LINES
			for (var i = 0; i < borders.length; ++i) {
				if (borders[i].lineCount + data.lines.length/6 <= MAX_LINES) {
					data.border = borders[i];
					break;
				}
			}
			// if no 'meta' border found -> create new one
			if (!data.border) {
				data.border = {
					dirty: true,
					object3D: null,
					material: createLineMaterial(),
					lineCount: 0,
					instances: new Map()
				};
				borders.push(data.border);
			}
			// add instance to it
			data.border.instances.set(data, { start: 0 });
			data.border.dirty = true;
			data.border.lineCount += data.lines.length/6;
		}
	};

	/**
	 * Removes polygon instance from 'meta' mesh.
	 *
	 * @param {object} data Instance data of the polygon instance.
	 * @private
	 */
	PolygonHandler.prototype._removeInstanceFromMesh = function(data) {
		if (data.mesh) {
			if (data.mesh.instances.delete(data)) {
				data.mesh.triangleCount -= data.indices.length/3; // update triangle count
				data.mesh.dirty = true;
				data.mesh = null; // reset reference to 'meta' mesh data
			} else {
				Log.error("Unable to find instance data in polygon mesh data", "", thisModule);
			}
		}
	};

	/**
	 * Removes polygon instance from 'meta' border.
	 *
	 * @param {object} data Instance data of the polygon instance.
	 * @private
	 */
	PolygonHandler.prototype._removeInstanceFromBorder = function(data) {
		if (data.border) {
			if (data.border.instances.delete(data)) {
				data.border.lineCount -= data.lines.length/6; // update line count
				data.border.dirty = true;
				data.border = null; // reset reference to 'meta' border data
			} else {
				Log.error("Unable to find instance data in polygon border data", "", thisModule);
			}
		}
	};

	/**
	 * Removes polygon handler's meshes from 3d scene.
	 *
	 * @param {object} object Mesh object in 3d scene to delete.
	 * @private
	 */
	PolygonHandler.prototype._deleteObject3D = function(object) {
		if (object) {
			if (object.parent) {
				object.parent.remove(object);
			}
			if (object.geometry) {
				object.geometry.dispose();
			}
			Utilities.toArray(object.material).forEach(function(material) {
				material.dispose(); // no maps to dispose
			});
		}
	};

	/**
	 * Helper function which associates each face (triangle) of the 'meta' mesh with actual instance.
	 *
	 * @param {object} hitInfo Hit info from where face index is ised.
	 * @returns {object} A Instance is returned which is associated with the given face index.
	 * @private
	 */
	PolygonHandler.prototype._instanceHitTest = function(hitInfo) {
		return hitInfo.faceIndex >= 0 ? this.hitInfo[hitInfo.faceIndex] : null;
	};

	return PolygonHandler;
});