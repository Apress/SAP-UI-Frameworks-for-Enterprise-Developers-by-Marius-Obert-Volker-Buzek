/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the base visual object.
sap.ui.define([
	"sap/ui/base/Object",
	"./Utilities",
	"./PolygonHandler",
	"./ModelHandler",
	"./thirdparty/three",
	"./thirdparty/DecalGeometry",
	"./thirdparty/html2canvas",
	"sap/base/Log"
], function(BaseObject, Utilities, PolygonHandler, ModelHandler, THREE, DecalGeometry, html2canvas, Log) {
	"use strict";

	var thisModule			= "sap.ui.vbm.adapter3d.SceneBuilder";
	var Matrix4				= THREE.Matrix4;
	var Vector3				= THREE.Vector3;
	var degToRad			= THREE.Math.degToRad;
	var toArray				= Utilities.toArray;
	var toBoolean			= Utilities.toBoolean;
	var toVector3			= Utilities.toVector3;
	var createMaterial		= Utilities.createMaterial;
	var propertyChanged		= Utilities.propertyChanged;
	var propertyRemoved		= Utilities.propertyRemoved;
	var propertyAdded		= Utilities.propertyAdded;
	var updateProperty		= Utilities.updateProperty;
	var refCountableDispose	= Utilities.refCountableDispose;

	// Box visual objects share the box geometries.
	// There are two box geometries - one with UV coordinates for 4 sided texture, one for 6 sided texture.
	// Materials share textures.
	// Shared three.js objects have the _sapRefCount property to track the lifetime.

	// Forward declarations.
	var createBox;
	var createCylinder;

	/**
	 * Constructor for a new three.js scene builder.
	 *
	 * @class
	 * Provides a base class for three.js scene builder.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vbm.adapter3d.SceneBuilder
	 */
	var SceneBuilder = BaseObject.extend("sap.ui.vbm.adapter3d.SceneBuilder", /** @lends sap.ui.vbm.adapter3d.SceneBuilder.prototype */ {

		constructor: function(context, viewport) {
			BaseObject.call(this);

			// shared context object
			this._context = context;

			// to control camera
			this._viewport = viewport;

			// Root for visual objects except Decals
			this._root = viewport.getRoot();

			// scene objects for Decals
			this._scene = viewport.getScene();

			// last hot instance
			this._hotInstance = null;

			// Decal helper object
			this._decalHelper = null;

			// instance key -> instance, for targeted objects like Decal
			this._targets = new Map();

			// instance -> list of Decal instances targeted it
			this._instanceDecals = new Map();

			// Cached objects. THREE.Texture is reference countable.
			this._textures = new Map(); //texture name -> THREE.Texture

			// The Box geometry can be shared amongst multiple 3D objects. Its properties are not changed after creation, reference countable.
			this._box4 = null;
			this._box6 = null;

			// The cylinder geometry can be shared amongst multiple 3D objects. Its properties are not changed after creation, reference countable.
			this._cylinder = null;
			this._cylinderCaps = null;

			// Polygon handler -> incapsulates logic of handling polygons, processing & interaction logic
			this._polygonHandler = new PolygonHandler(this._root);

			// Model handler -> incapsulates logic of handling models, procesing & interaction logic
			this._modelHandler = new ModelHandler(this._context.resources, this._textures, this._scene, this._root);

			// These object is created on first use
			this._textureLoader = null;
		}
	});

	SceneBuilder.prototype.destroy = function() {
		// Reset references to shared objects.
		this._root = null;
		this._scene = null;
		this._viewport = null;
		this._context = null;
		this._hotInstance = null;


		if (this._box4) {
			this._box4.dispose();
		}
		if (this._box6) {
			this._box6.dispose();
		}
		if (this._cylinder) {
			this._cylinder.dispose();
		}
		if (this._cylinderCaps) {
			this._cylinderCaps.dispose();
		}

		if (this._decalHelper) {
			this._decalHelper.material.dispose();
			this._decalHelper.geometry.dispose();
			this._scene.remove(this._decalHelper);
			this._decalHelper = null;
		}

		this._polygonHandler.destroy();
		this._polygonHandler = null;

		this._modelHandler.destroy();
		this._modelHandler = null;

		this._textures.forEach(function(texture) {
			texture.dispose();
		});

		this._targets.clear();
		this._targets = null;

		this._instanceDecals.clear();
		this._instanceDecals = null;

		BaseObject.prototype.destroy.call(this);
	};

	/**
	 * Builds or updates the three.js scene.
	 *
	 * @returns {Promise} A Promise that gets resolved when the scene has been built or updated.
	 * @public
	 */
	SceneBuilder.prototype.synchronize = function() {
		var that = this;

		// Adds a texture the textures map if it's not there yet.
		// The data property will be populated later in the _loadTexture method.
		function addTexture(resource) {
			var texture = that._textures.get(resource);
			if (!texture) {
				that._textures.set(resource, null);
			}
		}

		return new Promise(function(resolve, reject) {
			// Find the first 3D window and its scene.
			var window = sap.ui.vbm.findInArray(that._context.windows, function(window) {
				return window.type === "default";
			});

			var scene = window && sap.ui.vbm.findInArray(that._context.scenes, function(scene) {
				return scene.id === window.refScene;
			});

			if (!scene) {
				resolve();
				return;
			}

			// keep it there for future references
			that._context.scene = scene;

			// Setup initial view, is set if most recent payload has 3d scene with camera setup instructions
			if (that._context.setupView) {
				var state = that._context.setupView;
				that._setupView(state.position, state.zoom, state.pitch, state.yaw, state.home, state.flyTo);
				that._context.setupView = undefined; // reset
			}

			// A list of decals with texts needed to be rendered to image
			var decalTexts = [];

			// list of decals to add/update to process in second pass
			var addDecals = [], updateDecals = [];

			// Visual object instances split by types of changes.
			var toAdd    = that._context.voQueues.toAdd.get(scene) || [];
			var toUpdate = that._context.voQueues.toUpdate.get(scene) || [];
			var toRemove = that._context.voQueues.toRemove.get(scene) || [];

			[].concat(toAdd, toUpdate).forEach(function(instance) {
				if (instance.isModel) {
					that._modelHandler.addModel(instance);
				}
				if (instance.texture && propertyChanged(instance, "texture")) {
					addTexture(instance.texture);
				}
				if (instance.textureCap && propertyChanged(instance, "textureCap")) {
					addTexture(instance.textureCap);
				}
				if (instance.isDecal && instance.text && propertyChanged(instance, ["text", "size"])) {
					decalTexts.push(instance); // re-render text when text/size change (size affects image ratio)
				}
			});

			that._loadTextures()
				.then(function() {
					return that._modelHandler.loadModels();
				})
				.then(function() {
					return that._renderTexts(decalTexts);
				})
				.then(function() {
					//DEBUG
					// var timestamp = performance.now();
					toRemove.forEach(that._removeInstance.bind(that));
					toUpdate.forEach(that._updateInstance.bind(that, updateDecals));
					toAdd.forEach(that._addInstance.bind(that, addDecals));

					// performing pending updates if any
					that._polygonHandler.update();
					that._modelHandler.update();

					// create/update decals in second pass when everything else is up to date
					that._scene.updateMatrixWorld(true); // make sure all world matrices are up to date
					updateDecals.forEach(that._updateInstance.bind(that, null));
					addDecals.forEach(that._addInstance.bind(that, null));

					// cleanup
					that._cleanupCache();
					// DEBUG
					// Log.info("instance processing took " + (performance.now() - timestamp)  + " milliseconds", "", thisModule);
					resolve();
				})
				.catch(function(reason) {
					reject(reason);
				});
		});
	};

	SceneBuilder.prototype._findMesh = function(node) {
		var mesh = null;
		node.traverse(function(obj) {
			if (!mesh && obj.isMesh) {
				mesh = obj;
			}
		});
		return mesh;
	};

	SceneBuilder.prototype._getGeometrySize = function() {
		return 2.0; // should be scene bounding box but in VB is't always 2.0
	};

	SceneBuilder.prototype._getZoomFactor = function(position, target) {
		var dir = new Vector3();
		dir.subVectors(target, position);
		return (this._getGeometrySize() * 2) / dir.length();
	};

	SceneBuilder.prototype._setupView = function(position, zoom, pitch, yaw, home, flyTo) {
		position = toVector3(position || "0;0;0");
		zoom = parseFloat(zoom || "1");
		// use existing VB logic
		if (zoom === 0) {
			zoom = 1;
		} else if (zoom < 0) {
			zoom = 0.1;
		}
		var radius = this._getGeometrySize() * 2 / zoom;

		pitch = parseFloat(pitch || "0");
		yaw = parseFloat(yaw || "0");

		// correct pitch to avoid gimbal lock of OrbitControls
		pitch = (pitch % 180 === 0 ? pitch + 1 : pitch);

		// calculate rotation matrices
		var rotX = new Matrix4();
		rotX.makeRotationX(degToRad(pitch + 180));

		var rotZ = new Matrix4();
		rotZ.makeRotationZ(degToRad(-(yaw + 180)));

		var rot = new Matrix4();
		rot.multiplyMatrices(rotZ, rotX);

		// default camera orientation: camera looking down towards Z+ axis to world center
		var camPos = new Vector3(0, 0, -5);
		var camTarget = new Vector3(0, 0, 0);

		// set camera origin
		var pos = new Vector3();
		pos.subVectors(camTarget, camPos).normalize();
		pos.multiplyScalar(radius);
		pos.applyMatrix4(rot);

		// ideally "up" should be rotated too
		// var up = new THREE.Vector3(0, 1, 0);
		// up.applyMatrix4(rot);
		// up.normalize();
		// this._viewport._camera.up.set(-up.x, -up.z, up.y);
		// but don't touch up vector as OrbitControl is specifically sensitive to it
		// i.e not designed to work with "up" anything but (0,1,0)

		// adding requested position of the camera, once orientation is calculated
		pos.add(position);
		camTarget.add(position);

		var state = {
			zoom: 1.0,
			// convert from left handed (DirectX) to right handed (OpenGL)
			target: new Vector3(-camTarget.x, -camTarget.z, camTarget.y),
			position: new Vector3(-pos.x, -pos.z, pos.y)
		};

		if (home) {
			this._viewport._setCameraHome(state);
			this._viewport._applyCamera(state, flyTo);
		} else {
			this._viewport._applyCamera(state, flyTo);
		}
	};

	SceneBuilder.prototype._getDecalTextKey = function(instance) {
		return instance.size + ";" + instance.text; // hash size with text as rendered image depends on both
	};

	SceneBuilder.prototype._renderTexts = function(instances) {
		var promises = [];
		instances.forEach(function(instance) {
			if (!this._textures.has(this._getDecalTextKey(instance))) {
					promises.push(this._renderText(instance));
			}
		}, this);
		return Promise.all(promises);
	};

	SceneBuilder.prototype._renderText = function(instance) {
		var that = this;
		return new Promise(function(resolve, reject) {
			var size = toVector3(instance.size);

			if (size.length() < 1E-6) {
				Log.error("Unable render text to html: decal size is invalid", "", thisModule);
				resolve();
			} else {
				var TEXTURE_SIZE = 512;
				var ratio = size.x / size.y;
				var width = Math.ceil(ratio >= 1 ? TEXTURE_SIZE : TEXTURE_SIZE * ratio);
				var height = Math.ceil(ratio <= 1 ? TEXTURE_SIZE : TEXTURE_SIZE / ratio);

				var iframe = document.createElement("iframe");
				iframe.style.visibility = "hidden";
				// use sandbox attribute to disable script execution and all other suspicious activities in iframe as we cannot affectively escape input HTML.
				iframe.sandbox = "allow-same-origin";
				iframe.width = width;
				iframe.height = height;
				document.body.appendChild(iframe);

				var doc = iframe.contentDocument || iframe.contentWindow.document;
				doc.open();
				doc.close();
				doc.body.innerHTML = instance.text;

				var canvas = document.createElement("canvas");
				canvas.width = iframe.width * window.devicePixelRatio;
				canvas.height = iframe.height * window.devicePixelRatio;
				canvas.style.width = iframe.width + "px";
				canvas.style.height = iframe.height + "px";
				var context = canvas.getContext("2d");
				context.scale(window.devicePixelRatio, window.devicePixelRatio);

				html2canvas(doc.body, {canvas:canvas, width:width, height:height, backgroundColor:null, logging:false}).then(function(out) {
					if (out.width > 0 && out.height > 0) {
						var texture = new THREE.Texture(out);
						texture.needsUpdate = true;
						Utilities.addRef(texture);
						that._textures.set(that._getDecalTextKey(instance), texture);
					} else {
						Log.error("Failed render text to html", "", thisModule);
					}
					document.body.removeChild(iframe);
					resolve();
				});
			}
		});
	};

	SceneBuilder.prototype._loadTextures = function() {
		var promises = [];
		this._textures.forEach(function(texture, resource) {
			if (!texture) {
				promises.push(this._loadTexture(resource));
			}
		}, this);
		return Promise.all(promises);
	};

	SceneBuilder.prototype._loadTexture = function(resource) {
		var that = this;
		var res = this._context.resources.get(resource);

		if (!res) {
			this._textures.delete(resource); // remove from textures to prevent failing again next time
			Log.error("Failed to get texture from context", resource, thisModule);
			return Promise.resolve(); // Do not fail
		}
		return new Promise(function(resolve, reject) {
			that._getTextureLoader().load(
				Utilities.makeDataUri(res),
				function(texture) {
					texture.flipY = false; // Use the Direct3D texture coordinate space where the origin is in the top left corner
					that._textures.set(resource, texture);
					resolve();
				},
				null,
				function(xhr) {
					that._textures.delete(resource);
					Log.error("Failed to load texture from Data URI: " + resource, "status: " + xhr.status + ", status text: " + xhr.statusText, thisModule);
					resolve(); // Do not fail
				}
			);
		});
	};

	/**
	 * Cleans up the scene builder's cache.
	 *
	 * If some textures are not referenced from materials anymore they will be disposed of.
	 * If there are no more Box visual object instances the box geometry will be disposed of.
	 * @private
	 */
	SceneBuilder.prototype._cleanupCache = function() {
		this._textures.forEach(function(texture) {
			if (refCountableDispose(texture)) {
				texture.dispose();
				this._textures.delete(texture);
			}
		}, this);

		if (this._box4 && refCountableDispose(this._box4)) {
			this._box4.dispose();
			this._box4 = null;
		}

		if (this._box6 && refCountableDispose(this._box6)) {
			this._box6.dispose();
			this._box6 = null;
		}

		if (this._cylinder && refCountableDispose(this._cylinder)) {
			this._cylinder.dispose();
			this._cylinder = null;
		}

		if (this._cylinderCaps && refCountableDispose(this._cylinderCaps)) {
			this._cylinderCaps.dispose();
			this._cylinderCaps = null;
		}
	};

	SceneBuilder.prototype._addInstance = function(decals, instance) {
		if (!instance.isDecal) {
			this._updateInstanceKeys(instance); // keep track of instance keys, Decal cannot be target
		}

		if (instance.isPolygon) {
			this._polygonHandler.addInstance(instance);
		} else if (instance.isModel) {
			this._modelHandler.addInstance(instance);
		} else if (instance.isBox) {
			this._assignBoxProperties(instance);
		} else if (instance.isCylinder) {
			this._assignCylinderProperties(instance);
		} else if (instance.isDecal) {
			if (decals) {
				decals.push(instance); // first pass -> keep decal for the second pass
			} else {
				this._assignDecalProperties(instance); // second pass -> create decal
			}
		} else {
			Log.error("Unable to add instance: instance type is unknown", "", thisModule);
		}
	};

	SceneBuilder.prototype._updateInstance = function(decals, instance) {
		if (!instance.isDecal) {
			this._updateInstanceKeys(instance);
		}

		if (instance.isPolygon) {
			this._polygonHandler.updateInstance(instance);
		} else if (instance.isModel) {
			this._modelHandler.updateInstance(instance);
		} else if (instance.isBox) {
			this._assignBoxProperties(instance, instance === this._hotInstance);
		} else if (instance.isCylinder) {
			this._assignCylinderProperties(instance, instance === this._hotInstance);
		} else if (instance.isDecal) {
			if (decals) {
				decals.push(instance); // first pass -> keep decal for the second pass
			} else {
				this._assignDecalProperties(instance); // second pass -> update decal
			}
		} else {
			Log.error("Unable to update instance: instance type is unknown", "", thisModule);
		}
	};

	SceneBuilder.prototype._removeInstance = function(instance) {
		if (!instance.isDecal) {
			this._removeInstanceKeys(instance);
		}

		if (instance.isPolygon) {
			this._polygonHandler.removeInstance(instance);
		} else if (instance.isModel) {
			this._modelHandler.removeInstance(instance);
		} else if (instance.isBox || instance.isCylinder || instance.isDecal) { // box, cylinder, decal can be removed in a same way
			if (instance.object3D) {
				this._deleteObject3D(instance.object3D);
				instance.object3D = null;
				instance._last = {}; // reset all LRU variables at once

				// update (instance <-> decals) map if decal has target
				if (instance.isDecal && instance.target) {
					var target = this._targets.get(instance.target);
					if (target) {
						this._instanceDecals.get(target).delete(instance);
					} else {
						Log.error("Unable to remove decal from (instance <-> decals) map", "", thisModule);
					}
				}
			} else {
				Log.error("Unable to remove instance: object3D is missing", "", thisModule);
			}
		} else {
			Log.error("Unable to remove instance: instance type is unknown", "", thisModule);
		}

		// reset hot instance
		if (this._hotInstance === instance) {
			this._hotInstance = null;
		}
	};

	SceneBuilder.prototype.updateSelection = function(selected, deselected) {
		// DEBUG
		// var timestamp = performance.now();
		selected.concat(deselected).forEach(function(instance) {
			if (instance.isPolygon) {
				this._polygonHandler.updateInstance(instance);
			} else if (instance.isModel) {
				this._modelHandler.updateInstance(instance);
			} else if (instance.isBox) {
				this._assignBoxProperties(instance, instance === this._hotInstance);
			} else if (instance.isCylinder) {
				this._assignCylinderProperties(instance, instance === this._hotInstance);
			}
		}, this);

		// perform pending updates if any
		this._polygonHandler.update();
		this._modelHandler.update();
		// DEBUG
		// Log.info("selection update took " + (performance.now() - timestamp)  + " milliseconds", "", thisModule);
	};

	SceneBuilder.prototype._updateHotStatus = function(instance, hot) {
		if (instance.isBox) {
			this._assignBoxProperties(instance, hot);
		} else if (instance.isCylinder) {
			this._assignCylinderProperties(instance, hot);
		}
	};

	SceneBuilder.prototype.updateHotInstance = function(instance) {
		// DEBUG
		// var timestamp = performance.now();
		this._polygonHandler.updateHotInstance(instance);
		this._modelHandler.updateHotInstance(instance);

		// perform pending updates if any
		this._polygonHandler.update();
		this._modelHandler.update();

		// reset hot status for previous hot instance
		if (this._hotInstance) {
			this._updateHotStatus(this._hotInstance, false);
		}
		if (instance) {
			this._updateHotStatus(instance, true);
		}

		this._hotInstance = instance;
		// DEBUG
		// Log.info("update hover took " + (performance.now() - timestamp)  + " milliseconds", "", thisModule);
	};

	SceneBuilder.prototype._assignBoxProperties = function(instance, hot) {
		var box = instance.object3D || null;

		// geometry has to be created initially or recreated when 'texture6' changed
		if (!box || propertyChanged(instance, "texture6")) {
			var geometry = this._getBoxGeometry(toBoolean(instance.texture6));
			Utilities.addRef(geometry);

			if (box) {
				Utilities.subRef(box.geometry); // release previous geometry
				box.geometry = geometry;
			} else {
				box = new THREE.Mesh(geometry, createMaterial(false));
				box.matrixAutoUpdate = false;
				box.layers.set(0); // put it to layer #0 to enable raycasting
				box._sapInstance = instance; // keep reference to instance
				this._root.add(box);
				instance.object3D = box;
			}
		}

		// update properties after processing is done
		updateProperty(instance, "texture6");

		// handle common properties
		this._assignProperties(instance, hot);
	};

	SceneBuilder.prototype._assignCylinderProperties = function(instance, hot) {
		var material, updateTextureCap = false, open = toBoolean(instance.isOpen), cylinder = instance.object3D || null;

		// geometry has to be created initially or recreated when 'isOpen' changed
		if (!cylinder || propertyChanged(instance, "isOpen")) {
			var geometry = this._getCylinderGeometry(open);
			Utilities.addRef(geometry);

			if (cylinder) {
				Utilities.subRef(cylinder.geometry); // release previous geometry
				cylinder.geometry = geometry;

				if (open) {
					// cylinder was closed -> now open -> 3 materials replaced with one material, dispose second material (caps material)
					material = cylinder.material[1]; // caps material, shared between caps
					if (material.map) {
						Utilities.subRef(material.map);
						material.dispose();
					}
					cylinder.material = cylinder.material[0]; // switch back to one material only
					cylinder.material.side = THREE.DoubleSide;
					cylinder.material.needsUpdate = true; // required by threeJS
				} else {
					// cylinder was open -> now closed -> need to add one more material and assign texture if 'textureCap' is present
					material = cylinder.material.clone();
					material.map = null; // reset map as we don't need sides texture on caps at this stage
					cylinder.material = [cylinder.material, material, material]; // define 3 materials -> first one for sides, second one for both caps (shared between caps)
					// update both materials acoordingly
					cylinder.material.forEach(function(mat) {
						mat.needsUpdate = true;
						mat.side = THREE.FrontSide;
					});
					updateTextureCap = true;
				}
			} else {
				if (open) {
					cylinder = new THREE.Mesh(geometry, createMaterial(true)); // one double sided material for open cylinder
				} else {
					material = createMaterial(false);
					cylinder = new THREE.Mesh(geometry, [createMaterial(false), material, material]); // 3 materials if cylinder is closed, one material for sides, one for both caps (shared)
				}

				cylinder.matrixAutoUpdate = false;
				cylinder.layers.set(0); // put it to layer #0 to enable raycasting
				cylinder._sapInstance = instance; // keep reference to instance
				this._root.add(cylinder);
				instance.object3D = cylinder;
			}
		}

		if (propertyChanged(instance, "textureCap") || updateTextureCap) {
			material = Array.isArray(cylinder.material) ? cylinder.material[1] : null;

			if (material) {
				if (material.map) {
					Utilities.subRef(material.map); // release current texture in use
					material.map = null;
					material.needsUpdate = true;
				}
				if (instance.textureCap) {
					material.map = this._textures.get(instance.textureCap);
					if (material.map) {
						material.needsUpdate = true;
						Utilities.addRef(material.map); // count reference of new texture
					} else {
						Log.error("Unable to apply cap texture on cylinder, texture not found", instance.textureCap, thisModule);
					}
				}
			}
		}

		// update cylinder properties after processing is done
		updateProperty(instance, ["isOpen", "textureCap"]);

		// handle common properties
		this._assignProperties(instance, hot);
	};

	SceneBuilder.prototype._assignProperties = function(instance, hot) {
		var color, material, mesh = instance.object3D;

		if (propertyChanged(instance, "texture")) {
			material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;

			if (material.map) {
				Utilities.subRef(material.map); // release current texture in use
				material.map = null;
				material.needsUpdate = true; // required by threeJS
			}
			if (instance.texture) {
				material.map = this._textures.get(instance.texture);
				if (material.map) {
					material.needsUpdate = true; // required by threeJS
					Utilities.addRef(material.map); // count reference of new texture
				} else {
					Log.error("Unable to apply texture, texture not found", instance.texture, thisModule);
				}
			}
		}

		// if any property which affects color changed (including change in hot status) -> update object with new color
		if (propertyChanged(instance, ["color", "selectColor", "VB:s"]) || hot !== undefined) {
			color = Utilities.getColor(instance, instance.color, hot);

			Utilities.toArray(mesh.material).forEach(function(mat) {
				mat.color.copy(color.rgb);
				mat.opacity = color.opacity;
				mat.transparent = mat.opacity < 1;
				mat.needsUpdate = true;
			});
		}

		var border = mesh.children.length === 0 ? null : mesh.children[0]; // border mesh

		if (propertyRemoved(instance, "colorBorder")) {
			border.material.dispose();
			border.geometry.dispose();
			mesh.remove(border);
		} else if (instance.colorBorder) {
			if (propertyAdded(instance, "colorBorder")) {
				var geometry = instance.isBox ? new THREE.EdgesGeometry(mesh.geometry) : new THREE.EdgesGeometry(mesh.geometry, 60);
				border = new THREE.LineSegments(geometry, Utilities.createLineMaterial());
				border.matrixAutoUpdate = false;
				border.layers.set(1); // put it to layer #1 to disable hit test
				mesh.add(border);
			}
			if (propertyChanged(instance, ["colorBorder", "selectColor,", "VB:s"]) || hot !== undefined) {
				material = border.material;
				color = Utilities.getColor(instance, instance.colorBorder, hot);
				material.color.copy(color.rgb);
				material.opacity = color.opacity;
				material.transparent = material.opacity < 1;
				material.needsUpdate = true;
			}
		}

		// if any of the following properties changed -> recalculate transform matrix & normalize matrix -> decompose it and assign to the mesh
		if (propertyChanged(instance, ["pos", "rot", "scale", "normalize"])) {
			var normalizeMatrix = new Matrix4(), transformMatrix = new Matrix4();
			if (toBoolean(instance.normalize)) {
				mesh.position.set(0, 0, 0);
				mesh.rotation.set(0, 0, 0);
				mesh.scale.set(1, 1, 1);
				mesh.updateMatrix();
				// reset local transform first as it affects normalization
				Utilities.normalizeObject3D(mesh, normalizeMatrix);
			}
			Utilities.getInstanceMatrix(instance, transformMatrix);

			transformMatrix.multiply(normalizeMatrix);
			transformMatrix.decompose(mesh.position, mesh.quaternion, mesh.scale);

			mesh.updateMatrix(); // important to update local TM once transformation attributes have changed
		}

		// update properties after processing is done
		updateProperty(instance, ["texture", "color", "selectColor", "VB:s", "colorBorder", "normalize", "pos", "rot", "scale"]);
	};

	SceneBuilder.prototype._assignDecalProperties = function(instance) {
		var update = false, material;

		// decal rebuild required if any of the following properties have changed
		if (propertyChanged(instance, ["position", "direction", "size", "rotation", "target"])) {
			update = true;
		}

		// non targeted decal rebuild required only if plane parameters have changed
		if (!instance.target && propertyChanged(instance, ["planeOrigin", "planeNormal"])) {
			update = true;
		}

		if (update) {
			// delete current decal object, but keeping material
			if (instance.object3D) {
				material = instance.object3D.material.clone(); // keep material properties
				this._deleteObject3D(instance.object3D);
				instance.object3D = null;
			}

			var target = this._getDecalTarget(instance);
			if (!target) {
				Log.error("Unable to create decal", "target is missing", thisModule);
				return; // nothing left to do
			}
			var result = this._createDecal(instance, target, material);
			this._disposeDecalTarget(instance, target); // dispose target if it's applicable

			if (!result) {
				return;
			}
		}

		if (propertyChanged(instance, ["texture", "text"])) {
			material = instance.object3D.material;

			if (material.map) {
				Utilities.subRef(material.map); // release current texture in use
				material.map = null;
			}

			material.map = this._textures.get(instance.text ? this._getDecalTextKey(instance) : instance.texture);

			if (material.map) {
				material.map.flipY = true;
				material.needsUpdate = true; // required by threeJS
				Utilities.addRef(material.map); // count reference of new texture
			} else {
				Log.error("Unable to apply texture, texture not found", instance.texture, thisModule);
			}
		}

		// update (instance <-> decals) map
		if (propertyChanged(instance, "target")) {
			var targetInstance = this._targets.get(instance._last.target);
			if (targetInstance) {
				this._instanceDecals.get(targetInstance).delete(instance);
			}
			targetInstance = this._targets.get(instance.target);
			if (targetInstance) {
				if (!this._instanceDecals.has(targetInstance)) {
					this._instanceDecals.set(targetInstance, new Set());
				}
				this._instanceDecals.get(targetInstance).add(instance);
			}
		}

		// update properties after processing is done
		updateProperty(instance, ["position", "direction", "size", "rotation", "target", "texture", "text", "planeOrigin", "planeNormal"]);
	};

	/**
	 * Create Decal object based in definition and target geometry
	 *
	 * @param {Object} instance The decal instance
	 * @param {THREE.Object3D} target The decal target object
	 * @param {THREE.Material} material Material to use with decal mesh
	 * @return {Boolean} True if successfull
	 * @private
	 */
	SceneBuilder.prototype._createDecal = function(instance, target, material) {
		this._root.updateMatrixWorld(true); // make sure all matrices are up to date

		var position = toVector3(instance.position);
		var direction = toVector3(instance.direction).normalize();

		if (direction.length() < 1E-6) {
			Log.error("Unable create decal: direction is invalid", "", thisModule);
			return false;
		}
		var rotation = degToRad(Utilities.toFloat(instance.rotation));
		var size = toVector3(instance.size);

		if (size.length() < 1E-6) {
			Log.error("Unable create decal: size is invalid", "", thisModule);
			return false;
		}
		// to world space both
		position.applyMatrix4(target.matrixWorld);
		direction.transformDirection(target.matrixWorld);

		// find intersection point -> which is our origin for decal
		var rayCaster = new THREE.Raycaster(position, direction);
		var intersections = rayCaster.intersectObject(target);

		if (!intersections.length) {
			Log.error("Unable create decal: cannot project decal to plane", "", thisModule);
			return false;
		}

		// helper object to sort out decal frustrum rotation
		if (!this._decalHelper) {
			this._decalHelper = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 5));
			this._decalHelper.visible = false;
			this._decalHelper.layers.set(1); // put it to layer #1 to disable hit test
			this._decalHelper.up.set(0,1,0);
			this._scene.add(this._decalHelper);	// add to the scene as we're working in ThreeJS space here
		}

		// sort out decal frustrum rotation
		var inter = intersections[0];
		var origin = inter.point;
		var normal = direction.clone().negate();

		// debug: visualize decal projection
		// this._scene.add(new THREE.ArrowHelper(normal, origin, 8, 0xff00ff, 0.5));

		// use object size (bounding box diagonal)
		var box = new THREE.Box3().setFromObject(target);
		var targetSize = box.max.clone().sub(box.min).length();
		normal.multiplyScalar(targetSize);
		normal.add(origin);

		// get rotation using lookAt method
		this._decalHelper.position.copy(origin);
		this._decalHelper.lookAt(normal);
		this._decalHelper.rotation.z += rotation;

		// special decal material
		material = material || new THREE.MeshPhongMaterial({
			specular: 0x444444,
			shininess: 0,
			opacity: 0.99,
			transparent: true,
			depthTest: true,
			depthWrite: false,
			polygonOffset: true,
			polygonOffsetUnits: 0.1,
			polygonOffsetFactor: -1
		});
		// debug: visualize desired decal direction
		// this._scene.add(new THREE.ArrowHelper( direction, position, 8, 0xff00ff, 0.5));

		// debug: visualize decal frustrum
		// var cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0x00ff00}));
		// cube.position.copy(origin);
		// cube.rotation.copy(this._decalHelper.rotation);
		// cube.scale.copy(size);
		// this._scene.add(cube);

		var geometry = new THREE.DecalGeometry(target, origin, this._decalHelper.rotation, size);
		instance.object3D = new THREE.Mesh(geometry, material);
		instance.object3D.renderOrder = 100;
		instance.object3D.matrixAutoUpdate = false;
		instance.object3D.layers.set(1); // put it to layer #1 to disable hit test
		this._scene.add(instance.object3D);

		// debug: visualize decal geometry normals
		// this._scene.add(new THREE.VertexNormalsHelper(instance.object3D, 0.2, 0x00ff00, 1));

		// debug: visualize decal geometry as wireframe
		// var wireframe = new THREE.WireframeGeometry(geometry);
		// var line = new THREE.LineSegments(wireframe);
		// this._scene.add(line);

		return true;
	};

	/**
	 * Create plane geometry for non targeted decal instance
	 *
	 * @param {Object} instance The decal instance
	 * @param {THREE.Object3D} parent the plane's parent node
	 * @returns {THREE.Mesh} The plane geometry as mesh (or null if failed to create plane)
	 * @private
	 */
	SceneBuilder.prototype._createPlane = function(instance, parent) {
		var origin = toVector3(instance.planeOrigin);
		var normal = toVector3(instance.planeNormal).normalize();

		if (normal.length() < 1E-6) {
			Log.error("Unable to create plane for decal: normal is invalid", "", thisModule);
			return null;
		}
		// find direction which is "different" to the plane normal
		var dir1 = new Vector3(normal.x  === 0 ? 10 : -normal.x, normal.y  === 0 ? -10 : normal.y, normal.z  === 0 ? 10 : -normal.z );

		// find point which is "different" to the plane origin
		var pos = origin.clone(origin).add(dir1);

		// project point to plane to find another point on the plane in addition to origin: p' = p - normal.dot(pos - origin) * normal
		pos.sub(normal.clone().multiplyScalar(normal.dot(pos.clone().sub(origin))));

		// plane "size" constant
		var PLANE_SIZE = 10000; // better to use whole scene bbox to make sure plane is bigger than the scene but it can be expensive

		// find first direction on the plane
		dir1 = pos.clone().sub(origin).normalize();

		// find second firection on the plane via cross product
		var dir2 = normal.clone().cross(dir1).normalize();

		// scale both direction vectors to plane "size"
		dir1.multiplyScalar(PLANE_SIZE);
		dir2.multiplyScalar(PLANE_SIZE);

		// find 4 points of the 2-triangle plane
		var p1 = origin.clone().add(dir1);
		var p2 = origin.clone().sub(dir1);
		var p3 = origin.clone().add(dir2);
		var p4 = origin.clone().sub(dir2);

		// create plane mesh consisting of 2 triangles
		var geometry = new THREE.BufferGeometry();

		geometry.setAttribute("position", new THREE.Float32BufferAttribute([
			p1.x, p1.y, p1.z,
			p3.x, p3.y, p3.z,
			p2.x, p2.y, p2.z,
			p2.x, p2.y, p2.z,
			p4.x, p4.y, p4.z,
			p1.x, p1.y, p1.z
		], 3));

		// use plane normal as normal for triangles
		geometry.setAttribute("normal", new THREE.Float32BufferAttribute([
			normal.x, normal.y, normal.z,
			normal.x, normal.y, normal.z,
			normal.x, normal.y, normal.z,
			normal.x, normal.y, normal.z,
			normal.x, normal.y, normal.z,
			normal.x, normal.y, normal.z
		], 3));

		var plane = new THREE.Mesh(geometry);
		parent.add(plane);

		return plane;
	};

	SceneBuilder.prototype._getDecalTarget = function(instance) {
		if (instance.target) {
			var target = this._targets.get(instance.target);
			if (target) {
				if (target.isBox || target.isCylinder) {
					return target.object3D;
				} else if (target.isPolygon) {
					return this._polygonHandler.getTarget(target);
				} else if (target.isModel) {
					return this._modelHandler.getTarget(target);
				} else {
					Log.error("Unable to get decal's target", "target instance type is unknown", thisModule);
					return null;
				}
			}
		} else if (instance.planeOrigin && instance.planeNormal) {
			return this._createPlane(instance, this._root);
		} else {
			Log.error("Unable to get/create decal's target", "missing parameters", thisModule);
			return null;
		}
	};

	SceneBuilder.prototype._disposeDecalTarget = function(instance, target) {
		if (instance.target) {
			var targetInstance = this._targets.get(instance.target);
			if (targetInstance) {
				if (targetInstance.isPolygon || targetInstance.isModel) {
					this._deleteObject3D(target);
				}
			} else {
				Log.error("Unable to dispose decal's target", "target not found", thisModule);
			}
		} else {
			this._deleteObject3D(target);
		}
	};

	SceneBuilder.prototype._updateInstanceKeys = function(instance) {
		var value = this._getInstanceKeys(instance);
		if (value) {
			if (value.key !== instance._last.key) {
				this._targets.delete(instance._last.key);
				this._targets.delete(instance._last.group);

				this._targets.set(value.key, instance);
				this._targets.set(value.group, instance);

				instance._last.key = value.key;
				instance._last.group = value.group;
			}
		}
	};

	SceneBuilder.prototype._removeInstanceKeys = function(instance) {
		var value = this._getInstanceKeys(instance);
		if (value) {
			this._targets.delete(value.key);
			this._targets.delete(value.group);
		}
	};

	SceneBuilder.prototype._getInstanceKeys = function(instance) {
		if (instance.dataInstance) {
			var keyAttribute = instance.voGroup.keyAttributeName;
			if (keyAttribute) {
				var value = instance.dataInstance[keyAttribute];
				if (value) {
					return {
						key: value,
						group: instance.voGroup.id + "." + value
					};
				}
			}
		}
		return null;
	};

	SceneBuilder.prototype._deleteObject3D = function(object) {
		object.traverse(function(node) {
			if (node.geometry) {
				if (Utilities.refCountable(node.geometry)) {
					Utilities.subRef(node.geometry);
				} else {
					node.geometry.dispose();
				}
			}
			toArray(node.material).forEach(function(material) {
				if (material.map) {
					Utilities.subRef(material.map);
				}
				material.dispose();
			});
		});
		object.parent.remove(object);
	};

	SceneBuilder.prototype._getBoxGeometry = function(sixSided) {
		if (sixSided) {
			return this._box6 || (this._box6 = createBox(sixSided));
		} else {
			return this._box4 || (this._box4 = createBox(sixSided));
		}
	};

	SceneBuilder.prototype._getCylinderGeometry = function(open) {
		if (open) {
			return this._cylinder ||  (this._cylinder = createCylinder(open));
		} else {
			return this._cylinderCaps || (this._cylinderCaps = createCylinder(open));
		}
	};

	SceneBuilder.prototype._getTextureLoader = function() {
		return this._textureLoader || (this._textureLoader = new THREE.TextureLoader());
	};

	/**
	 * Creates a box.
	 *
	 * We cannot use the three.js BoxGeometry class as its faces, UVs etc are quite different from what is expected in legacy VB.
	 *
	 * The geometry is generated according to the algorithm in the legacy VB ActiveX control.
	 *
	 * @param {boolean} sixSided If equals <code>true</code> assign UV coordinates for 6-sided texture, otherwise for 4-sided texture.
	 * @returns {THREE.BufferGeometry} The box geometry.
	 * @private
	 */
	createBox = function(sixSided) {
		var geometry = new THREE.BufferGeometry();

		geometry.setAttribute("position", new THREE.Float32BufferAttribute([
			// Top
			 0.1,  0.1, -0.1,
			-0.1, -0.1, -0.1,
			-0.1,  0.1, -0.1,
			 0.1,  0.1, -0.1,
			 0.1, -0.1, -0.1,
			-0.1, -0.1, -0.1,

			// Bottom
			 0.1,  0.1,  0.1,
			-0.1,  0.1,  0.1,
			-0.1, -0.1,  0.1,
			 0.1,  0.1,  0.1,
			-0.1, -0.1,  0.1,
			 0.1, -0.1,  0.1,

			// Right
			0.1,  0.1, -0.1,
			0.1, -0.1,  0.1,
			0.1, -0.1, -0.1,
			0.1,  0.1, -0.1,
			0.1,  0.1,  0.1,
			0.1, -0.1,  0.1,

			// Front
			 0.1, -0.1, -0.1,
			-0.1, -0.1,  0.1,
			-0.1, -0.1, -0.1,
			 0.1, -0.1, -0.1,
			 0.1, -0.1,  0.1,
			-0.1, -0.1,  0.1,

			// Left
			-0.1, -0.1, -0.1,
			-0.1,  0.1,  0.1,
			-0.1,  0.1, -0.1,
			-0.1, -0.1, -0.1,
			-0.1, -0.1,  0.1,
			-0.1,  0.1,  0.1,

			// Back
			 0.1,  0.1,  0.1,
			-0.1,  0.1, -0.1,
			-0.1,  0.1,  0.1,
			 0.1,  0.1,  0.1,
			 0.1,  0.1, -0.1,
			-0.1,  0.1, -0.1
		], 3));

		geometry.setAttribute("normal", new THREE.Float32BufferAttribute([
			// Top
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,

			// Bottom
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,

			// Right
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,

			// Front
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,

			// Left
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,

			// Back
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0
		], 3));

		geometry.setAttribute("color", new THREE.Float32BufferAttribute([
			// Top
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,

			// Bottom
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,

			// Right
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,

			// Front
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,

			// Left
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,

			// Back
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,
			0.5, 0.5, 0.5
		], 3));

		if (sixSided) {
			// Use the Direct3D texture coordinate space where the origin is in the top left corner.
			// If there is a texture with the following quadrants
			//   (0,0)     (1/3,0)    (2/3,0)     (1,0)
			//     +----------+----------+----------+
			//     |   BACK   |  FRONT   |  BOTTOM  |
			//     +----------+----------|----------+ (1,0.5)
			//     |   LEFT   |  RIGHT   |    TOP   |
			//     +----------+----------|----------+
			//   (0,1)                            (1,1)
			// then those quadrants should map to faces as in the comments below.
			geometry.setAttribute("uv", new THREE.Float32BufferAttribute([
				// Top
				2/3, 0.5,
				1.0, 1.0,
				2/3, 1.0,
				2/3, 0.5,
				1.0, 0.5,
				1.0, 1.0,

				// Bottom
				// VB ActiveX incorrectly defines bottom the same as right/left, though the comments say it is the same as top.
				// same botton orientation as in ActiveX, cross oriented to the top face
				2/3, 0.0,
				1.0, 0.0,
				1.0, 0.5,
				2/3, 0.0,
				1.0, 0.5,
				2/3, 0.5,

				// Right
				2/3, 0.5,
				1/3, 1.0,
				1/3, 0.5,
				2/3, 0.5,
				2/3, 1.0,
				1/3, 1.0,

				// Front
				2/3, 0.0,
				1/3, 0.5,
				1/3, 0.0,
				2/3, 0.0,
				2/3, 0.5,
				1/3, 0.5,

				// Left
				1/3, 0.5,
				0.0, 1.0,
				0.0, 0.5,
				1/3, 0.5,
				1/3, 1.0,
				0.0, 1.0,

				// Back
				0.0, 0.5,
				1/3, 0.0,
				1/3, 0.5,
				0.0, 0.5,
				0.0, 0.0,
				1/3, 0.0
			], 2));
		} else {
			// Use the Direct3D texture coordinate space where the origin is in the top left corner.
			// If there is a texture with the following quadrants
			//   (0,0)                 (1,0)
			//     +----------+----------+
			//     |   BACK   |  FRONT   |
			//     +----------+----------+ (1,0.5)
			//     |RIGHT/LEFT|TOP/BOTTOM|
			//     +----------+----------+
			//   (0,1)                 (1,1)
			// then those quadrants should map to faces as in the comments below.
			geometry.setAttribute("uv", new THREE.Float32BufferAttribute([
				// Top
				0.5, 0.5,
				1.0, 1.0,
				0.5, 1.0,
				0.5, 0.5,
				1.0, 0.5,
				1.0, 1.0,

				// Bottom
				1.0, 0.5,
				1.0, 1.0,
				0.5, 1.0,
				1.0, 0.5,
				0.5, 1.0,
				0.5, 0.5,

				// Right
				0.5, 0.5,
				0.0, 1.0,
				0.0, 0.5,
				0.5, 0.5,
				0.5, 1.0,
				0.0, 1.0,

				// Front
				0.5, 0.5,
				1.0, 0.0,
				1.0, 0.5,
				0.5, 0.5,
				0.5, 0.0,
				1.0, 0.0,

				// Left
				0.5, 0.5,
				0.0, 1.0,
				0.0, 0.5,
				0.5, 0.5,
				0.5, 1.0,
				0.0, 1.0,

				// Back
				0.0, 0.5,
				0.5, 0.0,
				0.5, 0.5,
				0.0, 0.5,
				0.0, 0.0,
				0.5, 0.0
			], 2));
		}

		return geometry;
	};

	/**
	 * Creates a cylinder.
	 *
	 * Use standard THREE.Cylinder geometry.
	 *
	 *
	 * @param {boolean} open If equals <code>true</code> will create a hollow cylinder / pipe.
	 * @returns {THREE.BufferGeometry} The cylinder geometry.
	 * @private
	 */
	createCylinder = function(open) {
		var radius = 0.1; // Initial radius for cylinder
		return new THREE.CylinderGeometry(radius, radius, 2 * radius, 24, 1, open);
	};

	return SceneBuilder;
});
