/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.vbm.adapter3d.ModelHandler
sap.ui.define([
	"sap/ui/base/Object",
	"./Utilities",
	"./thirdparty/three",
	"./thirdparty/ColladaLoader",
	"sap/base/Log"
], function(BaseObject, Utilities, THREE, ColladaLoader, Log) {
	"use strict";

	var thisModule			= "sap.ui.vbm.ModelHandler";
	var Box3				= THREE.Box3;
	var Matrix4				= THREE.Matrix4;
	var propertyAdded 		= Utilities.propertyAdded;
	var propertyChanged 	= Utilities.propertyChanged;
	var updateProperty  	= Utilities.updateProperty;
	var	addRef				= Utilities.addRef;
	var subRef				= Utilities.subRef;

	/**
	 * Constructor for a new model handler.
	 *
	 * @class
	 * Provides a base class for model handler.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vbm.adapter3d.ModelHandler
	 */
	var ModelHandler = BaseObject.extend("sap.ui.vbm.adapter3d.ModelHandler", /** @lends sap.ui.vbm.adapter3d.ModelHandler.prototype */ {

		constructor: function(resources, textures, scene, root) {
			BaseObject.call(this);

			// resources
			this._resources = resources;

			// shared texture objects (Map: name -> THREE.Texture)
			this._textures = textures;

			// parent node for all 'meta' meshes as THREE.InstancedMesh's instances must have world matrices
			this._scene = scene;

			// root node to take it's world transform into account
			this._root = root;
			this._root.updateWorldMatrix(false, false); // make sure world matrix is present & up to date

			// last hot instance
			this._hotInstance = null;

			this._instances = new Map();
			//	instance -> instance data {
			//		instance: Object			Instance reference
			//		matrices: [THREE.Matrix4]	World matrices of meshes in model
			//		model: Object				Reference to model
			//		texture: THREE.Texture		Referene to texture
			//		mesh: Object				Reference to 'meta' mesh data
			//	}

			this._models = new Map();
			//	model resource name -> model data {
			//		root: THREE.Object3D		Root node for the model plain list hierarchy (meshes only)
			//		bbox: THREE.Box3			Bounding box of the non normalized model  (lazy calculated, can be null)
			//		normalized: {
			//			bbox: THREE.Box3		Bounding box of the normalized model (lazy calculated, can be null)
			//			world: THREE.Matrix4	World matrix of normalized model root (lazy calculated, can be null)
			//		},
			//		_sapRefCount: Number		Reference count
			//	  }

			// key(instance resource + instance color) -> 'meta' mesh data
			this._meshes = new Map();

			// These objects are created on first use
			this._colladaLoader = null;
			this._glTFLoader = null;
		}
	});

	var MAX_INSTANCES = 4000; // 'meta' mesh limit of instances -> to have predictable rebuild time

	/**
	 * Destroys polygon handler object.
	 * @public
	 */
	ModelHandler.prototype.destroy = function() {
		// Reset references to shared objects.
		this._resources = null;
		this._textures = null;
		this._scene = null;
		this._root = null;
		this._hotInstance = null;

		// destroy 'meta' meshes
		this._meshes.forEach(function(array) {
			array.forEach(function(item) {
				item.objects3D.forEach(function(object) {
					this._deleteObject3D(object);
				}, this);
			}, this);
		}, this);

		// release shared textures
		this._instances.forEach(function(instance) {
			if (instance.texture) {
				subRef(instance.texture);
			}
		});

		// destroy models
		this._models.forEach(function(model, resource) {
			this._deleteModel(model);
		}, this);

		this._meshes.clear();
		this._meshes = null;

		this._instances.clear();
		this._instances = null;

		this._models.clear();
		this._models = null;

		this._glTFLoader = null;
		this._colladaLoader = null;

		BaseObject.prototype.destroy.call(this);
	};

	/**
	 * Adds model instance to model handler.
	 *
	 * @param {object} instance Model instance.
	 * @public
	 */
	ModelHandler.prototype.addInstance = function(instance) {
		this._instances.set(instance, {
			instance : instance,
			world: new Matrix4(),
			matrices: [],
			model: null,
			texture: null,
			key: null,
			mesh: null
		});
		this.updateInstance(instance);
	};

	/**
	 * Updates model instance in model handler
	 *
	 * @param {object} instance Model instance.
	 * @public
	 */
	ModelHandler.prototype.updateInstance = function(instance) {
		var data = this._instances.get(instance), update = false, hot = this._hotInstance && this._hotInstance === instance;
		if (data) {
			var normalized = Utilities.toBoolean(instance.normalize);

			// when model change -> need to maintain reference count -> link instance data with model data
			if (propertyChanged(instance, "model")) {
				if (!propertyAdded(instance, "model")) {
					this._removeInstanceFromMesh(data);
					subRef(data.model); // previous model has to be released
				}
				data.model = this._models.get(instance.model); // link instance data with model data
				if (!data.model) {
					Log.error("Removing broken instance with unknown model", instance.model, thisModule);
					this.removeInstance(instance);
					return;
				}
				addRef(data.model); // add reference to current model in use
				data.matrices.length = 0;
				update = true;
			}

			if (propertyChanged(instance, "texture") ) {
				if (!propertyAdded(instance, "texture")) {
					if (data.texture) {
						subRef(data.texture); // previous texture has to be released
						data.texture = null;
					}
				}
				if (instance.texture) { // texture is optional
					data.texture = this._textures.get(instance.texture) || null;
					if (data.texture) {
						addRef(data.texture); // add reference to current texture in use
					} else {
						Log.error("Failed to apply texture on model, texture not found", instance.texture, thisModule);
					}
				}
				update = true;
			}

			// when model normalization changed -> update model properties -> reset instance model matrices
			if (propertyChanged(instance, ["normalize", "model"])) {
				this._updateModel(data.model, normalized);
				data.matrices.length = 0;
				update = true;
			}

			// instance transformation changed -> recalculate instance matrix & reset instance model matrices
			if (propertyChanged(instance, ["pos", "rot", "scale"]) ) {
				Utilities.getInstanceMatrix(instance, data.world, normalized ? data.model.normalized.bbox : data.model.bbox);
				data.matrices.length = 0;
				update = true;
			}

			// If any instance property included in instance 'key' has changed -> remove instance from current 'meta' mesh
			// this include: instance color, texture, selected or not, selected color, hot color
			var key = this._getInstanceKey(instance, hot);
			// instance key has changed -> need to remove instance from current 'meta' mesh and add to new one
			if (!data.key || key !== data.key) {
				this._removeInstanceFromMesh(data);
				data.key = key;
				update = true;
			}

			// update properties after processing is done
			updateProperty(instance, ["model", "normalize", "pos", "rot", "scale", "texture", "color", "selectColor", "hotDeltaColor", "VB:s"]);

			// calculate world matrix for every mesh in a model for this instance
			if (data.matrices.length === 0) {
				var world = this._root.matrixWorld.clone(); // start from the _root
				world.multiply(data.world); // apply instance world matrix

				// if instance normalized -> apply normalized model root matrix as otherwise (non normalized case) model root has identity matrix
				if (normalized) {
					world.multiply(data.model.normalized.world);
				}
				// apply individual mesh matrices from the model at last
				data.model.root.children.forEach(function(child) {
					data.matrices.push(new Matrix4().multiplyMatrices(world, child.matrixWorld));
				});
			}

			// update 'meta' mesh
			if (update) {
				this._requestUpdate(data);
			}

		} else {
			Log.error("Unable to find model instance data", "", thisModule);
		}
	};

	/**
	 * Removes model instance from model handler.
	 *
	 * @param {object} instance Model instance.
	 * @public
	 */
	ModelHandler.prototype.removeInstance = function(instance) {
		var data = this._instances.get(instance);
		if (data) {
			if (this._hotInstance === instance) {
				this._hotInstance = null;
			}
			this._instances.delete(instance);
			this._removeInstanceFromMesh(data);
			instance._last = {}; // reset all LRU variables at once

			if (data.model) {
				subRef(data.model); // model can be null if removing 'broken' instance
			}
			if (data.texture) {
				subRef(data.texture); // texture is optional, can be null
			}
		} else {
			Log.error("Unable to find model instance data", "", thisModule);
		}
	};

	/**
	 * Updates model's 'meta' meshes if there are any, requested for update.
	 * @public
	 */
	ModelHandler.prototype.update = function() {
		var empty = [];
		this._meshes.forEach(function(array, key) {
			for (var i = 0; i < array.length;) {
				if (array[i].dirty) {
					var j, instance, index = 0, data = array[i];

					// delete current instanced meshes from scene
					data.objects3D.forEach(function(object) {
						this._deleteObject3D(object);
					}, this);
					data.objects3D.length = data.hitInfo.length = 0;

					if (data.instances.size) {
						// create instanced meshes based on meshes from the model, share geometry but clone materials
						data.model.root.children.forEach(function(source) {
							// create new instanced mesh,  geometry -> shared, materials -> cloned
							var mesh = new THREE.InstancedMesh(source.geometry, Utilities.cloneMaterials(source.material), data.instances.size);
							mesh.matrixAutoUpdate = false;
							mesh.layers.set(0); // put it to layer #0 to enable raycasting
							mesh._instanceHitTest = this._instanceHitTest.bind(data); // helper function to return instance based on hit test info
							this._scene.add(mesh);
							data.objects3D.push(mesh);
						}, this);

						data.instances.forEach(function(value) {
							instance = value;
							data.hitInfo.push(instance);
							for (j = 0; j < data.objects3D.length; ++j) {
								data.objects3D[j].setMatrixAt(index, instance.matrices[j]);
							}
							index++;
						});
						// change materials according to colors from instance
						Utilities.applyColor(instance.instance, instance.instance.color, data.objects3D, this._hotInstance === instance.instance, instance.texture);
					}
					data.dirty = false;
				}
				if (array[i].objects3D.length !== 0) {
					i++; // move to next element in array
				} else {
					array.splice(i, 1); // remove current element from array as it's empty
				}
			}
			if (!array.length) {
				empty.push(key); // remove map entry as it's empty
			}
		}, this);

		// remove empty 'meta' meshes
		empty.forEach(function(key) {
			this._meshes.delete(key);
		}, this);

		// remove unused models
		this._models.forEach(function(model, resource) {
			if (Utilities.refCountableDispose(model)) {
				this._deleteModel(model);
				this._models.delete(resource);
			}
		}, this);
	};

	/**
	 * Updates hot instance of the model handler.
	 *
	 * @param {object} instance Hot instance.
	 * @public
	 */
	ModelHandler.prototype.updateHotInstance = function(instance) {
		var data;
		// if we have hot model instance -> clear hot from it
		if (this._hotInstance) {
			data = this._instances.get(this._hotInstance);
			data.key = this._getInstanceKey(this._hotInstance, false);
			this._removeInstanceFromMesh(data);
			this._requestUpdate(data);
		}
		// apply hot on new instance if it's model instance only
		if (instance && instance.isModel) {
			data = this._instances.get(instance);
			data.key = this._getInstanceKey(instance, true);
			this._removeInstanceFromMesh(data);
			this._requestUpdate(data);
		}
		// keep track of hover instance if it's model, null otherwise
		this._hotInstance = (instance && instance.isModel) ? instance : null;
	};

	ModelHandler.prototype.addModel = function(instance) {
		if (instance.isModel && instance.model && !this._models.has(instance.model)) {
			this._models.set(instance.model, {root: null, bbox: null, normalized: null});
		}
	};

	ModelHandler.prototype.loadModels = function() {
		var promises = [];
		this._models.forEach(function(content, resource) {
			if (!content.root) {
				promises.push(this._loadModel(resource, content));
			}
		}, this);
		return Promise.all(promises);
	};

	ModelHandler.prototype._loadModel = function(resource, content) {
		var that = this;
		var res = this._resources.get(resource);

		if (!res) {
			Log.error("Failed to get model from context", resource, thisModule);
			this._models.delete(resource); // remove from models to prevent failing again next time
			return Promise.resolve(); // Do not fail
		}

		return new Promise(function(resolve, reject) {
			if (atob(res.slice(0,6)).startsWith("glTF")) { // check for binary glTF (glb) first as it does have signature
				try {
					that._getGlTFLoader().parse(
						Utilities.base64ToArrayBuffer(res),
						"",
						function(model) {
							that._postprocess(model, content);
							resolve();
						}
					);
				} catch (ex) {
					that._models.delete(resource);
					Log.error("Failed to load glb model", resource, thisModule);
					resolve(); // Do not fail
				}
			} else {
				try {
					that._postprocess(that._getColladaLoader().parse(atob(res)), content); // try COLLADA
					resolve();
				} catch (ex) {
					try {
						that._getGlTFLoader().parse( // try glTF text based
							atob(res),
							"",
							function(model) {
								that._postprocess(model, content);
								resolve();
							}
						);
					} catch (ex) {
						that._models.delete(resource);
						Log.error("Failed to load collada/gltf model", resource, thisModule);
						resolve(); // Do not fail
					}
				}
			}
		});
	};

	// keeps meshes only, replaces hierarchy with plane list of objects
	ModelHandler.prototype._postprocess = function(model, content) {
		// mirror on Z axis entire collada root which is effectively the same as collada processing with baking transformations and inverting Z coordinates in ActiveX
		model.scene.scale.set(1,1,-1);

		var meshes = [], materials = new Set(), marked = "_sapUsed";
		// collect meshes only + calculate world matrix, mark used materials & maps
		model.scene.traverse(function(object) {
			object.updateWorldMatrix(false, false); // don't touch parent or children, we calculate world matrix as we go
			var used = object.isMesh && object.visible;
			if (used) {
				meshes.push(object);
			} else if (object.geometry) {
				object.geometry.dispose();
			}
			// mark all materials as used/unused to dispose unused later
			Utilities.toArray(object.material).forEach(function(material) {
				if (used || !material[marked]) {
					material[marked] = used;
				}
				materials.add(material);
			});
		});
		// dispose unused materials & maps
		materials.forEach(function(material) {
			if (!material[marked]) {
				for (var prop in material) {
					if (prop instanceof THREE.Texture) {
						prop.dispose(); // dispose all textures in material
					}
				}
				material.dispose();
			}
		});
		content.root = new THREE.Group();

		// replace hierarchy with the plain list of meshes under group node
		meshes.forEach(function(mesh) {
			mesh.remove(mesh.children);
			content.root.add(mesh);
			mesh.matrixWorld.decompose(mesh.position, mesh.quaternion, mesh.scale);
		});
	};

	ModelHandler.prototype._requestUpdate = function(data) {
		if (data.mesh) {
			data.mesh.dirty = true;
		} else {
			var meshes = this._meshes.get(data.key);
			// key hasn't been used -> add new array
			if (!meshes) {
				meshes = [];
				this._meshes.set(data.key, meshes);
			}
			// find suitable 'meta' mesh so instance count will not exceed MAX_INSTANCES
			for (var i = 0; i < meshes.length; ++i) {
				if (meshes[i].instances.size < MAX_INSTANCES) {
					data.mesh = meshes[i];
					break;
				}
			}
			// if no 'meta' mesh found -> create new one
			if (!data.mesh) {
				data.mesh = {
					dirty: true,
					model: data.model,
					hitInfo: [],
					objects3D: [],
					instances: new Set()
				};
				meshes.push(data.mesh);
			}
			// add instance to it
			data.mesh.instances.add(data);
			data.mesh.dirty = true;
		}
	};

	ModelHandler.prototype._updateModel = function(model, normalized) {
		if (normalized) {
			if (!model.normalized) { // lazy model normalize
				model.normalized = {
					bbox: new Box3(),
					world: new Matrix4()
				};
				Utilities.normalizeObject3D(model.root, model.normalized.world, model.normalized.bbox);
			}
		} else if (!model.bbox) {
			model.bbox = new Box3().setFromObject(model.root); // lazy bounding box calculation (non normalized scenario)
		}
	};

	ModelHandler.prototype._deleteModel = function(model) {
		model.root.children.forEach(function(mesh) {
			mesh.geometry.dispose();
			Utilities.toArray(mesh.material).forEach(function(material) {
				for (var prop in material) {
					if (prop instanceof THREE.Texture) {
						prop.dispose(); // dispose all textures in material
					}
				}
				material.dispose();
			});
		}, this);
	};

	/**
	 * Removes model instance from 'meta' mesh.
	 *
	 * @param {object} data Instance data of the model instance.
	 * @private
	 */
	ModelHandler.prototype._removeInstanceFromMesh = function(data) {
		if (data.mesh) {
			if (data.mesh.instances.delete(data)) {
				data.mesh.dirty = true;
				data.mesh = null; // reset reference to 'meta' mesh data
			} else {
				Log.error("Unable to find instance data in polygon mesh data", "", thisModule);
			}
		}
	};

	/**
	 * Removes model handler's instanced meshes from 3d scene.
	 *
	 * @param {object} object Mesh object in 3d scene to delete.
	 * @private
	 */
	ModelHandler.prototype._deleteObject3D = function(object) {
		if (object) {
			// remove instanced mesh from scene
			if (object.parent) {
				object.parent.remove(object);
			}
			// geometries are shared -> cannot dispose
			Utilities.toArray(object.material).forEach(function(material) {
				material.dispose(); // materials are cloned -> can be disposed, maps are shared -> don't touch, cannot be disposes
			});
		}
	};

	ModelHandler.prototype._getInstanceKey = function(instance, hot) {
		var selected = Utilities.toBoolean(instance["VB:s"]);
		var k1 = instance.texture ? "_texture_" + instance.texture : "";
		var k2 = "_color_" + instance.color.toLowerCase();
		var k3 = selected ? "_selected_" + instance.selectColor.toLowerCase() : "";
		var k4 = hot ? "_hot_" + instance.hotDeltaColor.toLowerCase() : "";
		return	instance.model + k1 + k2 + k3 + k4;
	};

	ModelHandler.prototype.getTarget = function(instance) {
		var data = this._instances.get(instance);
		if (data) {
			var mesh = new THREE.Mesh(data.model.root.children[0].geometry.clone()); // take first mesh from the model (for now)
			// target has to be added to _root to mimic original model and must have same world matrix as original model
			// so we calculate world matrix for target which will be under _root and not under _scene as instance mesh
			var world = data.world.clone(); // use instance world as starting point
			if (data.model.normalized) {
				world.multiply(data.model.normalized.world);
			}
			world.multiply(data.model.root.children[0].matrixWorld);
			world.decompose(mesh.position, mesh.quaternion, mesh.scale);
			mesh.updateMatrix();
			this._root.add(mesh);
			return mesh;
		}
		return null;
	};

	/**
	 * Helper function which associates each instance of the InstancedMesh of 'meta' mesh with actual instance.
	 *
	 * @param {object} hitInfo Hit info from where instanceId is ised.
	 * @returns {object} A Instance is returned which is associated with the given instance index.
	 * @private
	 */
	ModelHandler.prototype._instanceHitTest = function(hitInfo) {
		if (hitInfo.instanceId >= 0 ) {
			var data = this.hitInfo[hitInfo.instanceId];
			hitInfo.world = data.matrices[hitInfo.instanceId]; // hint
			return data.instance;
		}
		return null;
	};

	ModelHandler.prototype._getColladaLoader = function() {
		return this._colladaLoader || (this._colladaLoader = new THREE.ColladaLoader());
	};

	ModelHandler.prototype._getGlTFLoader = function() {
		return this._glTFLoader || (this._glTFLoader = new THREE.GLTFLoader());
	};

	return ModelHandler;
});