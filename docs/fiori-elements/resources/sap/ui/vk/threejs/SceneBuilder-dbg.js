/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.threejs.SceneBuilder.
sap.ui.define([
	"../thirdparty/three",
	"sap/base/Log",
	"./UsageCounter",
	"../totara/TotaraUtils",
	"./OrthographicCamera",
	"./PerspectiveCamera",
	"./DetailView",
	"./AnimationHelper",
	"./Thrustline",
	"./Billboard",
	"./Callout",
	"../BillboardCoordinateSpace",
	"../BillboardTextEncoding",
	"../BillboardStyle",
	"../BillboardBorderLineStyle",
	"../BillboardHorizontalAlignment",
	"../LeaderLineMarkStyle",
	"../DetailViewType",
	"../DetailViewShape",
	"../AnimationPlayback",
	"../AnimationRotateType",
	"../RenderMode",
	"./Material",
	"./MaterialType",
	"./SphericalMapMaterial",
	"../ObjectType",
	"./ParametricGenerators",
	"../NodeContentType",
	"../NavigationMode",
	"sap/base/util/uid",
	"./ThreeUtils",
	"sap/base/assert",
	"../colorToCSSColor"
], function(
	THREE,
	Log,
	UsageCounter,
	TotaraUtils,
	OrthographicCamera,
	PerspectiveCamera,
	DetailView,
	AnimationHelper,
	Thrustline,
	Billboard,
	Callout,
	BillboardCoordinateSpace,
	BillboardTextEncoding,
	BillboardStyle,
	BillboardBorderLineStyle,
	BillboardHorizontalAlignment,
	LeaderLineMarkStyle,
	DetailViewType,
	DetailViewShape,
	AnimationPlayback,
	AnimationRotateType,
	RenderMode,
	Material,
	MaterialType,
	SphericalMapMaterial,
	ObjectType,
	ParametricGenerators,
	NodeContentType,
	NavigationMode,
	uid,
	ThreeUtils,
	assert,
	colorToCSSColor
) {
	"use strict";

	/**
	 * Provides the ability to create three.js scene from the information retrieved from streaming or vds file.

	 * SceneBuilder allows for creating scene tree, material, and geometry in any order.
	 * It is up to user to maintain the ids of entities that have not been created,
	 * and call the updating functions once the entities are created, for instance,
	 * calling node updating functions after the associated material or geometry is created,
	 * or material updating function after the associated images are created.

	 *
	 * Constructor for a new SceneBuilder
	 *
	 * @param {any} rootNode The reference object of a root node.
	 * 							When <code>rootNode</code> is specified in constructor, it's assumed that
	 * 							the constructed SceneBuilder only deals with one root node, and therefore one single scene.<br/>
	 * 							When no <code>rootNode</code> is not specified, the function setRootNode has to be called for each root node.

	 * @param {any} contentResource From content manager, only used for vds file reading (matai.js).
	 * @param {any} resolve From content manager, called in setScene function, only used for vds file reading (matai.js).
	 * @param {any} reject From content manager, called in serScene function, only used for vds file reading (matai.js).
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var SceneBuilder = function(rootNode, contentResource, resolve, reject) {
		this._rootNode = rootNode;
		this._contentResource = contentResource;
		this._resolve = resolve;
		this._reject = reject;

		// resources below are shared among different scenes (represented by root nodes)
		this._callouts = new Map();
		this._cameras = new Map();
		this._images = new Map();
		this._imageIdsAndTileWidths = new Map();
		this._imageTextures = new Map(); // imageId -> [ { materialId, textureType } ]
		this._geometries = new Map();  // geometryId -> [ { geometry: THREE.BufferGeometry, vertexStart, vertexCount, indexStart, indexCount, ... } ]
		this._meshNodes = new Map(); // meshId -> [ THREE.Group ] - these are cloned from _meshSubmeshes and exist in a scene
		this._meshSubmeshes = new Map(); // meshId -> [ THREE.Mesh ] - array of submeshes in a mesh, don't belong to a scene
		this._geometryMeshes = new Map(); // geometryId -> [ meshId ]
		this._materialMeshes = new Map(); // materialId -> [ meshId ]
		this._geometryMaterials = new Map(); // geometryId -> [ materialId ]
		this._materialClones = new Map(); // materialId -> [ THREE.Material ]
		this._joints = [];
		this._imageAddedToMaterialHandlers = [];
		this._isSmallScene = null; // a flag to enable some fancy effects for small scenes

		// resources below are created for each scene
		if (rootNode) {
			this._nodes = new Map(); // current map of node Ids and tree nodes , for current root node
			this._tracks = new Map();
			this._trackIdSequenceNodeMap = new Map();
			this._viewGroups = new Map();
			this._views = new Map();
		} else {  // to be initiated in function setRootNode
			this._nodes = null;
			this._tracks = null;
			this._trackIdSequenceNodeMap = null;
			this._viewGroups = null;
			this._views = null;
		}

		this._currentSceneId = null;
		this._sceneIdTreeNodesMap = new Map();	// map of scene id and map of tree nodes: sceneId and this._meshSubmeshIds
		this._sceneIdRootNodeMap = new Map();	// map of scene id and root node

		this._animationHelper = new AnimationHelper(this);

		if (contentResource) {
			var nodeProxy = contentResource.getNodeProxy();
			var nodeHierarchy = nodeProxy.getNodeHierarchy();
			this._vkScene = nodeHierarchy.getScene();
			var source = contentResource.getSource();
			if (source && source.name) {
				this._sceneIdTreeNodesMap.set(source.name, this._nodes);
				this._sceneIdRootNodeMap.set(source.name, rootNode);
				this._currentSceneId = source.name;
			}
		}

		this._viewThumbnails = new Map();
		this._thrustlines = new Map();
		// for reading vds file (matai.js), need to revisit when re-developing animation is done
		this._animations = new Map();
		this._animationTracks = new Map();

		this._jointNodesMap = new Map();
		this._jointParentsMap = new Map();

		this._upAxis = 2; // (0 = +X, 1 = -X, 2 = +Y, 3 = -Y, 4 = +Z, 5 = -Z)
		this._voxelThreshold = 0.0;
	};

	/**
	 * Get threshold number which controls loading of LOD levels
	 * @returns {number} Threshold level.
	 * @public
	 */
	SceneBuilder.prototype.getVoxelThreshold = function() {
		return this._voxelThreshold;
	};

	/**
	 * Set threshold number which controls loading of LOD levels
	 * @param {number} voxelThreshold The ratio of the item bounding box to the scene/view bounding box.
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	SceneBuilder.prototype.setVoxelThreshold = function(voxelThreshold) {
		this._voxelThreshold = voxelThreshold;
		return this;
	};

	var renderModes = [
		RenderMode.Default, // Default = 0,
		RenderMode.Default, // Solid,
		RenderMode.Default, // Transparent,
		RenderMode.LineIllustration, // LineIllustration,
		RenderMode.SolidOutline, // SolidOutline,
		RenderMode.ShadedIllustration // ShadedIllustration
	];

	/**
	 * Set scene information
	 *
	 * @param {any} info The reference object of root node
	 * @public
	 */
	SceneBuilder.prototype.setScene = function(info) {
		this._vkScene.setSceneBuilder(this);
		var camera = this._cameras.get(info.cameraId);
		this._upAxis = info.upAxis;
		this._resolve({
			node: this._rootNode,
			camera: camera,
			backgroundTopColor: info.backgroundTopColor,
			backgroundBottomColor: info.backgroundBottomColor,
			upAxis: info.upAxis, // (0 = +X, 1 = -X, 2 = +Y, 3 = -Y, 4 = +Z, 5 = -Z)
			// renderMode: renderModes[info.renderMethod],
			contentResource: this._contentResource,
			builder: this
		});
	};

	/**
	 * Set current root node, and create corresponding tree nodes map and mesh ID map
	 *
	 * @param {any} rootNode The reference object of root node
	 * @param {any} nodeId The id of root node in the scene tree
	 * @param {any} sceneId The id of scene with the root node as its top node
	 * @param {sap.ui.vk.threejs.Scene} vkScene scene
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	SceneBuilder.prototype.setRootNode = function(rootNode, nodeId, sceneId, vkScene) {
		this._rootNode = rootNode;
		this._nodes = new Map();
		this._nodes.set(nodeId, rootNode);
		this._tracks = new Map();
		this._trackIdSequenceNodeMap = new Map();
		this._sequenceIdToPlaybacks = new Map();
		this._viewGroups = new Map();
		this._views = new Map();

		if (sceneId) {
			this._sceneIdTreeNodesMap.set(sceneId, this._nodes);
			this._sceneIdRootNodeMap.set(sceneId, rootNode);
			this._currentSceneId = sceneId;
		}

		if (vkScene) {
			this._vkScene = vkScene;
		}
		return this;
	};

	////////////////////////////////////////////////////////////////////////
	// Reset current scene
	SceneBuilder.prototype._resetCurrentScene = function(sceneId) {
		if (sceneId && sceneId !== this._currentSceneId) {
			var nodes = this._sceneIdTreeNodesMap.get(sceneId);
			if (nodes) {
				this._nodes = nodes;
			} else {
				this._nodes = null;
			}

			var node = this._sceneIdRootNodeMap.get(sceneId);
			if (node) {
				this._rootNode = node;
			} else {
				this._rootNode = null;
			}

			this._currentSceneId = sceneId;
		}
	};

	/**
	 * Get three.js node
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {THREE.Group} three.js group node
	 * @public
	 */
	SceneBuilder.prototype.getNode = function(nodeId, sceneId) {
		if (sceneId) {
			this._resetCurrentScene(sceneId);
			if (this._nodes) {
				return this._nodes.get(nodeId);
			}
		} else {
			var contextIterator = this._sceneIdTreeNodesMap.values();
			var contextItem = contextIterator.next();
			while (!contextItem.done) {
				var node = contextItem.value.get(nodeId);
				if (node) {
					return node;
				}
				contextItem = contextIterator.next();
			}
		}
		return null;
	};

	SceneBuilder.prototype.hasMesh = function(meshId) {
		return this._meshSubmeshes.has(meshId);
	};

	SceneBuilder.prototype.hasImage = function(imageId) {
		return this._images.has(imageId);
	};

	SceneBuilder.prototype.hasAnnotation = function(annotationId) {
		return this._vkScene._hasAnnotation(annotationId);
	};

	/**
	 * @param {THREE.Object3D} nodeRef Reference to the node which persistent id is set
	 * @param {string} nodeId Node's persistent identifier
	 * @param {string} sceneId The id of the scene containing nodeRef
	 * @returns {boolean} <code>true</code> if id is successfully set, otherwise <code>false</code>
	 * @public
	 */
	SceneBuilder.prototype.setNodePersistentId = function(nodeRef, nodeId, sceneId) {
		if (!nodeRef.userData.treeNode) {
			nodeRef.userData.treeNode = {};
		}

		var oldId = null;
		if (nodeRef.userData.treeNode.sid) {
			oldId = nodeRef.userData.treeNode.sid;
			delete (nodeRef.userData.treeNode.sid);
		}

		this._resetCurrentScene(sceneId);

		nodeRef.userData.treeNode.sid = nodeId;
		if (this._nodes) {
			if (oldId) {
				this._nodes.delete(oldId);
			}
			this._nodes.set(nodeId, nodeRef);
			return true;
		}
		return false;
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// Create three.js matrix for an array, which may contain
	// 3 values --> x y z position
	// 12 values --> 4x3 column major matrix
	// 16 values --> 4x4 column major matrix
	var arrayToMatrix = function(arr) {
		var matrix = new THREE.Matrix4();
		if (arr.length === 3) {
			// position only matrix
			matrix.setPosition(new THREE.Vector3().fromArray(arr));
		} else if (arr.length === 12) {
			// 4x3 matrix
			matrix.set(arr[0], arr[3], arr[6], arr[9], arr[1], arr[4], arr[7], arr[10], arr[2], arr[5], arr[8], arr[11], 0.0, 0.0, 0.0, 1.0);
		} else if (arr.length === 16) {
			// 4x4 matrix
			matrix.set(arr[0], arr[4], arr[8], arr[12], arr[1], arr[5], arr[9], arr[13], arr[2], arr[6], arr[10], arr[14], arr[3], arr[7], arr[11], arr[15]);
		} else {
			throw "Invalid matrix format";
		}
		return matrix;
	};

	var DefaultHighlightingEmissive = {
		r: 0.0235,
		g: 0.0235,
		b: 0.0235
	};

	var DefaultHighlightingSpecular = {
		r: 0.0602,
		g: 0.0602,
		b: 0.0602
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Create a place-holder material, whose value should be updated when material data is available
	SceneBuilder.prototype._createTemporaryMaterial = function(materialId, materialType) {
		var vkMaterial = new Material(materialType || MaterialType.MeshPhongMaterial);
		var material = vkMaterial.getMaterialRef();
		material.userData.defaultHighlightingEmissive = DefaultHighlightingEmissive;
		material.userData.defaultHighlightingSpecular = DefaultHighlightingSpecular;
		material.userData.materialUsed = 0;
		material.userData.materialId = materialId;
		material.userData.toBeUpdated = true;
		if (this._vkScene.getDoubleSided()) {
			material.side = THREE.DoubleSide;
			// be consistent with scene's setDoubleSided function
			material.userData.originalMaterialSide = THREE.FrontSide;
		}
		this._vkScene.setMaterial(materialId, vkMaterial);

		// replace material in submeshes
		var meshIds = this._materialMeshes.get(materialId);
		if (meshIds) {
			meshIds.forEach(function(meshId) {
				this._updateMeshSubmeshesMaterial(meshId, materialId, material);
			}, this);
		}

		var nativeSceneUD = this._vkScene.getSceneRef().userData;
		if (!nativeSceneUD.instanceDataTexture) {
			// todo: determine maximum texture width/height and support multiple data textures for large scenes
			var dataTextureWidth = 2048; // also change uOccurrenceTexelWidth in three.js!
			var dataTextureHeight = 2048; // also change uOccurrenceTexelHeight in three.js!
			nativeSceneUD.instanceDataTexture = new THREE.DataTexture(new Float32Array(dataTextureWidth * dataTextureHeight * 4), dataTextureWidth, dataTextureHeight, THREE.RGBAFormat, THREE.FloatType);
			nativeSceneUD.instanceDataTexture.version = 1;
			nativeSceneUD.instanceDataTexture.image.needsUpdate = true;
			nativeSceneUD.textureUpdateResults = null;
		}
		material.specularMap = nativeSceneUD.instanceDataTexture;

		return material;
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Get threejs material
	SceneBuilder.prototype._getMaterialRef = function(materialId) {
		var material = this._vkScene.getMaterial(materialId);
		return material ? material.getMaterialRef() : null;
	};

	/**
	 * Check if material is already loaded
	 * @param {string} materialId Id of the material
	 * @param {boolean} temporaryMaterialNeeded Is set to <code>true</code> and material with <code>materialId</code> does not exist then temporary material will be created
	 * @returns {boolean} <code>true</code> if material exists, otherwise <code>false</code>
	 * @public
	 */
	SceneBuilder.prototype.checkMaterialExists = function(materialId, temporaryMaterialNeeded) {
		if (this._getMaterialRef(materialId) === null) {
			if (temporaryMaterialNeeded) {
				this._createTemporaryMaterial(materialId);
			}
			return false;
		}
		return true;
	};

	/**
	 * Check if material is needed for given content
	 * @param {any} content Json representation of a scene object
	 * @returns {boolean} Return <code>True</code> if material is needed
	 * @public
	 */
	SceneBuilder.prototype.materialNeeded = function(content) {
		return true;
	};

	/**
	 * Attach handler for the event of imageAddedToMaterial
	 * @param {function} func, handler for event of imageAddedToMaterial
	 * @param {object} listener, object that owns the handler, optional
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	SceneBuilder.prototype.attachImageAddedToMaterial = function(func, listener) {

		this._imageAddedToMaterialHandlers.push({ func: func, listener: listener });

		return this;
	};


	/**
	 * Detach handler for the event of imageAddedToMaterial
	 * @param {function} func, handler for event of imageAddedToMaterial
	 * @param {object} listener, object that owns the handler, optional
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	SceneBuilder.prototype.detachImageAddedToMaterial = function(func, listener) {

		for (var i = 0; i < this._imageAddedToMaterialHandlers.length; i++) {
			var item = this._imageAddedToMaterialHandlers[i];
			if (item.func === func && item.listener === listener) {
				this._imageAddedToMaterialHandlers.splice(i, 1);
				return this;
			}
		}
		return this;
	};

	/**
	 * Execute handlers for the event of imageAddedToMaterial
	 * @param {any} parameters for event of imageAddedToMaterial, an object with property of materialId, optional
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	SceneBuilder.prototype.fireImageAddedToMaterial = function(parameters) {
		var handlers = this._imageAddedToMaterialHandlers.slice(); // create a copy as the original may change when calling callbacks;
		handlers.forEach(function(handler) {
			handler.func.call(handler.listener, parameters);
		});
		return this;
	};

	SceneBuilder.prototype._attachMaterialClone = function(materialId, materialClone) {
		TotaraUtils.pushElementIntoMapArray(this._materialClones, materialId, materialClone);
	};

	SceneBuilder.prototype._addDynamicObject = function(node, updateFunction, is2D) {
		var userData = this._rootNode.userData;
		if (!userData._vkDynamicObjects) {
			userData._vkDynamicObjects = [];
		}
		if (userData._vkDynamicObjects.indexOf(node) < 0) { // some annotations may have ORTHO2D transform type
			userData._vkDynamicObjects.push(node);
		}
		node._vkUpdate = updateFunction;
		if (is2D) {
			node.userData.is2D = true;
		}
	};

	/**
	 * Create three.js node.
	 *
	 * @param {any} nodeInfo The node information object containing the following properties <br/>
	 *							<code>sid</code>: String. The id of node.
	 *							<code>name</code>: String. The name of the node. Optional.<br/>
	 *       					<code>transform</code>: matrix as either 12(no shear), 16(full) or 3(position only) values. Optional</br>
	 * 							<code>transformType</code>: string . "BILLBOARD_VIEW" or "LOCK_TOVIEWPORT". Optional</br>
	 *       					<code>visible</code>: Boolean. True if the node is visible. Default true. Optional<br/>
	 * 							<code>visualisable</code>: Boolean. False if the node is skipped. Default true. Optional<br/>
	 * 							<code>selectable</code>: Boolean. True if the node can be selected. Default true. Optional<br/>
	 * 							<code>closed</code>: Boolean. True if the node is close. Default false. Optional<br/>
	 *       					<code>materialId</code>: String. The id of the material the node is associated with. Optional<br/>
	 *       					<code>meshId</code>: String. The id of the mesh. Optional<br/>
	 * 							<code>opacity</code>: String. The opacity of node, to be applied to submesh nodes. Optional<br/>
	 * 							<code>parentId</code>: id of parent node. Optional<br/>
	 * 							<code>renderOrder</code>: order of rendering. Optional<br/>
	 * 							<code>renderMethod</code>: rendering method. Optional<br/>
	 * 							<code>renderStage</code>: rendering stage. Optional<br/>
	 * 							<code>metaData</code>: meta data. Optional<br/>
	 * 							<code>veids</code>: veids. Optional<br/>
	 *
	 *
	 * @param {string} sceneId The id of scene containing the node
	 * @returns {any} The created node<br/>
	 */
	SceneBuilder.prototype.createNode = function(nodeInfo, sceneId) {
		this._resetCurrentScene(sceneId);

		var node = new THREE.Group();
		this._nodes.set(nodeInfo.sid, node);

		var i;
		var jointObjects = this._jointNodesMap.get(nodeInfo.sid);
		if (jointObjects && jointObjects.length) {
			for (i = 0; i < jointObjects.length; i++) {
				jointObjects[i].node = node;
			}
		}

		var jointObjectsForParent = this._jointParentsMap.get(nodeInfo.sid);
		if (jointObjectsForParent && jointObjectsForParent.length) {
			for (i = 0; i < jointObjectsForParent.length; i++) {
				jointObjectsForParent[i].parent = node;
			}
		}

		var parent = this._nodes.get(nodeInfo.parentId);
		(parent || this._rootNode).add(node);

		var userData = node.userData;
		userData.treeNode = nodeInfo;
		if (nodeInfo.closed) {
			userData.closed = true;
		}
		if (nodeInfo.selectable === false) {
			userData.selectable = false;
		}
		if (nodeInfo.visualisable === false && nodeInfo.contentType !== "SYMBOL") {
			userData.skipIt = true; // // Don't display this node in scene tree
		}
		if (nodeInfo.metadata) {
			userData.metadata = nodeInfo.metadata;
		}
		if (nodeInfo.veids) {
			userData.veids = nodeInfo.veids;
		}
		if (nodeInfo.usageIds) {
			userData.usageIds = nodeInfo.usageIds;
		}
		if (nodeInfo.sid) {
			userData.nodeId = nodeInfo.sid;
		}
		if (nodeInfo.name) {
			node.name = nodeInfo.name;
		}

		if (nodeInfo.visible !== undefined) {
			node.visible = !!nodeInfo.visible;
		}

		if (parent) {
			var ancestor;
			if (userData.skipIt ||
				(parent.name && node.name === parent.name + " offset geometry")) {
				userData.skipIt = true; // offset geometry visibility fix
			} else {
				ancestor = parent;
				while (ancestor) {
					if (ancestor.userData.closed) {
						userData.skipIt = true;
						// Remember the reason why skipIt flag was set, skipItClosed=true means that skipIt was set because
						// some ancestor of this node was closed. Application can later treat this flag properly.
						// See EPDVISUALIZATION-2864.
						userData.skipItClosed = true;
					}
					ancestor = ancestor.parent;
				}
			}
			if (parent.userData.symbolContent) {
				userData.skipIt = true;
				if (userData.skipItClosed === true) {
					userData.skipItClosed = false; // The reason for skipIt has now changed
				}
				userData.symbolContent = true;
			}
			if (node.visible && !userData.skipIt && this._contentResource) {// fix ancestor visibility if matai.js is in use
				ancestor = parent;
				while (ancestor) {
					ancestor.visible = true;
					ancestor = ancestor.parent;
				}
			}
		}

		// nodes visibility debugging code:
		// node._visible = node.visible;
		// Object.defineProperty(node, "visible", {
		// 	get: function() { return this._visible; },
		// 	set: function(visible) {
		// 		console.log(this.name, this.userData.skipIt, visible ? "+" : "-");
		// 		if (this.userData.skipIt && !visible) {
		// 			debugger;
		// 		}
		// 		this._visible = visible;
		// 	}
		// });

		if (nodeInfo.renderOrder) {
			node.renderOrder = nodeInfo.renderOrder;
		}

		if (nodeInfo.renderMethod) {
			userData.renderMethod = nodeInfo.renderMethod;
		}

		if (nodeInfo.renderStage) {
			if (typeof nodeInfo.renderStage === "string") { // Storage server sends text values instead of numbers
				nodeInfo.renderStage = { UNDERLAY_2D: -1, OVERLAY_2D: 1 }[nodeInfo.renderStage] || 0;
			}
			userData.renderStage = nodeInfo.renderStage; // Underlay2D = -1, Default3D = 0, Overlay2D = 1
		}

		userData.opacity = nodeInfo.opacity;

		// if tree has transform, it should overwrite one from the element.
		if (nodeInfo.transform) {
			node.applyMatrix4(arrayToMatrix(nodeInfo.transform));
			if (!isFinite(node.quaternion.x) || !isFinite(node.quaternion.y) || !isFinite(node.quaternion.z) || !isFinite(node.quaternion.w)) {
				node.quaternion.set(0, 0, 0, 1);
			}
		}
		node.updateMatrixWorld(true);

		if (nodeInfo.transformType) {
			userData.transformType = nodeInfo.transformType;
			switch (nodeInfo.transformType) {
				case "ORTHO2D":
					userData.originalTransform = {
						p: node.position.clone(),
						q: node.quaternion.clone(),
						s: node.scale.clone()
					};
					this._addDynamicObject(node, Billboard.prototype._ortho2DUpdate, true);
					break;
				case "BILLBOARD_VIEW": this._addDynamicObject(node, Billboard.prototype._billboardViewUpdate, false); break;
				case "LOCK_TOVIEWPORT": this._addDynamicObject(node, Billboard.prototype._lockToViewportUpdate, true); break;
				default: break;
			}
		}

		if (nodeInfo.materialId) {// overridden material for node submeshes
			userData.materialId = nodeInfo.materialId;
		}

		if (nodeInfo.geometryType) {
			userData.geometryType = nodeInfo.geometryType;
		}

		if (nodeInfo.meshId) {
			this.setMeshNode(nodeInfo.sid, nodeInfo.meshId);
		}

		if (nodeInfo.parametricId) {
			this.setParametricNode(nodeInfo.sid, nodeInfo.parametricId, nodeInfo.visible);
		}

		if (node.parent.userData.objectType === ObjectType.Hotspot) {
			userData.objectType = ObjectType.Hotspot;
		} else if (node.parent.userData.objectType === ObjectType.PMI) {
			userData.objectType = ObjectType.PMI;
		} else if (nodeInfo.contentType === "HOTSPOT") {
			userData.objectType = ObjectType.Hotspot;
		} else if (nodeInfo.contentType === "PMI") {
			userData.objectType = ObjectType.PMI;
		}

		if (nodeInfo.contentType === "REFERENCE") {
			node._vkSetNodeContentType(NodeContentType.Reference);
		} else if (nodeInfo.contentType === "ANNOTATION") {
			node._vkSetNodeContentType(NodeContentType.Annotation);
		} else if (nodeInfo.contentType === "BACKGROUND") {
			node._vkSetNodeContentType(NodeContentType.Background);
		} else if (nodeInfo.contentType === "SYMBOL") {
			node._vkSetNodeContentType(NodeContentType.Symbol);
			userData.symbolContent = true;
		}

		// node.name += node.id.toString();
		// console.log("createNode", node.name, node);

		return node;
	};

	/**
	 * Clean up internal lists when node is deleted (recursively)
	 * @param {any} nodeRef Node to be removed
	 * @public
	 */
	SceneBuilder.prototype.removeNode = function(nodeRef) {
		this._nodes.delete(nodeRef._vkPersistentId());

		this._vkScene._removeAnnotationsForNode(nodeRef);

		var updatedTexture = false;
		if (!this._forbiddenTextureUpdate) {
			this._forbiddenTextureUpdate = true;
			updatedTexture = true;
			var nativeSceneUD = this._vkScene.getSceneRef().userData;

			if (nativeSceneUD.instanceDataTexture) {
				// all children must be deleted from cluster rendering
				var geometryClusters = nativeSceneUD.geometryClusters;
				var textureUpdateResults = ThreeUtils.prepareTextureUpdateResults(geometryClusters ? geometryClusters.length : 0, nativeSceneUD.textureUpdateResults);
				ThreeUtils.removeNodeFromClusterRenderingRecursive(nodeRef, nativeSceneUD.instanceDataTexture.image.data, textureUpdateResults);
				nativeSceneUD.textureUpdateResults = textureUpdateResults;
			}
		}

		nodeRef.children.forEach(this.removeNode, this); // recursively remove children, similar to SceneBuilder.prototype.remove()

		if (updatedTexture) {
			// a trick to not perform this recursive texture update multiple times inside a traversal recursion
			delete this._forbiddenTextureUpdate;
		}
	};

	/**
	 * Check if node exists in SceneBuilder node map
	 * @param {any} nodeRef The node provided to check for existence
	 * @returns {boolean} true if the node exists in node map
	 * @public
	 */
	SceneBuilder.prototype.hasNode = function(nodeRef) {
		return this._nodes.has(nodeRef._vkPersistentId());
	};

	function makeLineMaterial(material) {
		if (material && material.type === MaterialType.LineBasicMaterial) {
			return material;
		}

		var lineMaterial = new THREE.LineBasicMaterial({
			color: 0xff0000,
			linewidth: 1
		});

		if (material) {
			lineMaterial.color.copy(material.color);
			lineMaterial.specularMap = material.specularMap;
			lineMaterial.userData.materialId = material.userData.materialId;
		}

		return lineMaterial;
	}

	/**
	 * Get ids of child nodes of a node.
	 *
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} sceneId The id of scene containing the node
	 * @param {boolean} includeMeshNode The id of scene containing the node
	 * @returns {any[]} array of child node ids
	 * @public
	 */
	SceneBuilder.prototype.getChildNodeIds = function(nodeId, sceneId, includeMeshNode) {
		this._resetCurrentScene(sceneId);

		var node = this._nodes.get(nodeId);

		var ids = [];

		if (!node) {
			return ids;
		}

		if (node && node.children) {
			for (var i = 0; i < node.children.length; i++) {
				var child = node.children[i];
				if (child.userData.treeNode && child.userData.treeNode.sid) {
					ids.push(child.userData.treeNode.sid);
				} else if (includeMeshNode && child.userData.submeshInfo && child.userData.submeshInfo.id) {
					ids.push(child.userData.submeshInfo.id);
				}
			}
		}
		return ids;
	};

	function findInnerBoxLOD(lods) {
		for (var i = 0; i < lods.length; i++) {
			if (lods[i].type === "box" && lods[i].data) {
				return lods[i];
			}
		}
		return null;
	}

	function findBestLOD(lods) {
		if (Array.isArray(lods)) {
			for (var i = 0; i < lods.length; i++) {
				if (lods[i].type === undefined || lods[i].type === "mesh" || lods[i].type === "line") {
					return lods[i];
				}
			}
		}

		return null;
	}

	SceneBuilder.prototype._addGeometryToCluster = function(points, normals, uvs, indices, isPolyline, materialId, instanceCount) {
		var nativeSceneUD = this._vkScene.getSceneRef().userData;
		var maxVertices = 65536; // must be 65536 to be able to address it with 16-bit index
		// Note: we want to avoid situation when cluster cannot accomodate more data because there are
		// no more 2-byte indices, but plenty of free 24-byte vertices, so maxIndices should be larger
		var maxIndices = 3 * maxVertices;

		var vertexCount = points.length / 3;
		var indexCount = indices.length;
		var hasUVs = !isPolyline && (uvs && uvs.length === vertexCount * 2);
		var bucketSuffix = ":" + (isPolyline ? "l" : "t") + (hasUVs ? "u" : "n");
		var clusterType = materialId + bucketSuffix + instanceCount;

		if (!nativeSceneUD.currentClusters) {
			nativeSceneUD.currentClusters = new Map(); // clusterType -> THREE.BufferGeometry
		}

		var cluster = nativeSceneUD.currentClusters.get(clusterType);
		if (!cluster || cluster.freeVertices < vertexCount || cluster.freeIndices < indexCount) {
			// create a new cluster
			cluster = new THREE.BufferGeometry();
			if (instanceCount > 1) {
				cluster.userData.renderInstanceCount = instanceCount;
			}
			nativeSceneUD.currentClusters.set(clusterType, cluster);
			cluster.freeVertices = maxVertices;
			cluster.freeIndices = maxIndices;
			cluster.instanceIndices = [];
			cluster.userData.geometryUsed = 0;
			cluster.setIndex(new THREE.BufferAttribute(new Uint16Array(maxIndices), 1));
			cluster.setAttribute("position", new THREE.BufferAttribute(new Float32Array(maxVertices * 3), 3));
			cluster.setAttribute("clusterInstance", new THREE.BufferAttribute(new Float32Array(maxVertices), 1));
			if (isPolyline) {
				cluster.userData.isPolyline = true;
			} else {
				cluster.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(maxVertices * 3), 3));
			}

			if (hasUVs) {
				cluster.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(maxVertices * 2), 2));
			}

			// create a three.js cluster mesh
			var meshMaterial = this._getMaterialRef(materialId);
			var mesh = isPolyline ? new THREE.LineSegments(cluster, makeLineMaterial(meshMaterial))
				: new THREE.Mesh(cluster, meshMaterial);

			if (nativeSceneUD.geometryClusters) {
				nativeSceneUD.geometryClusters.push(mesh);
			} else {
				nativeSceneUD.geometryClusters = [mesh];
				nativeSceneUD.currentInstanceIndex = 0;
			}

			mesh.userData.isGeometryCluster = true;
			cluster.userData.clusterIndex = nativeSceneUD.geometryClusters.length - 1;
		}

		// add geometry data to the cluster
		var vertexStart = maxVertices - cluster.freeVertices;
		ThreeUtils.updateClusterAttrib(cluster, "position", vertexStart * 3, points);

		var instanceAttrib = cluster.getAttribute("clusterInstance");
		instanceAttrib.array.fill(nativeSceneUD.currentInstanceIndex, vertexStart, vertexStart + vertexCount);
		if (instanceAttrib.updateRange.count < 0) {
			instanceAttrib.updateRange.offset = vertexStart;
			instanceAttrib.updateRange.count = vertexCount;
		} else {
			instanceAttrib.updateRange.count += vertexCount;
		}
		instanceAttrib.needsUpdate = true;

		if (!isPolyline) {
			if (!normals || normals.length !== points.length) {
				normals = computeNormals(points, indices);
			}

			ThreeUtils.updateClusterAttrib(cluster, "normal", vertexStart * 3, normals);
		}

		if (hasUVs) {
			ThreeUtils.updateClusterAttrib(cluster, "uv", vertexStart * 2, uvs);
		}

		// offset vertex indices
		var indexStart = maxIndices - cluster.freeIndices;
		ThreeUtils.updateClusterIndices(cluster, indices, vertexStart, indexStart, indexCount);

		cluster.freeVertices -= vertexCount;
		cluster.freeIndices -= indexCount;
		cluster.drawRange.count = indexStart + indexCount;
		cluster.instanceIndices.push(nativeSceneUD.currentInstanceIndex);

		// compute bbox/sphere only for this mesh part of the cluster, not for the whole cluster
		cluster.computeBoundingBox(vertexStart, vertexStart + vertexCount);
		cluster.computeBoundingSphere(vertexStart, vertexStart + vertexCount, true);

		var geometryDescriptor = {
			geometry: cluster,
			vertexStart: vertexStart,
			vertexCount: vertexCount,
			indexStart: indexStart,
			indexCount: indexCount,
			boundingBox: cluster.boundingBox,
			boundingSphere: cluster.boundingSphere
		};
		cluster.boundingBox = null;
		cluster.boundingSphere = null;
		return geometryDescriptor;
	};

	function makeRenderGroupFromDescriptor(descriptor, instanceIndex) {
		var bbi = descriptor.boundingBox.min;
		var bba = descriptor.boundingBox.max;
		var bs = descriptor.boundingSphere;
		return {
			firstVertex: descriptor.vertexStart,
			lastVertex: descriptor.vertexStart + descriptor.vertexCount,
			start: descriptor.indexStart,
			count: descriptor.indexCount,
			instanceIndex: instanceIndex,
			clusterIndex: descriptor.geometry.userData.clusterIndex,
			boundingBox: [bbi.x, bbi.y, bbi.z, bba.x, bba.y, bba.z],
			boundingSphere: [bs.center.x, bs.center.y, bs.center.z, bs.radius]
		};
	}

	SceneBuilder.prototype._cloneSubmesh = function(submesh, node) {
		var clonedSubmesh = (submesh instanceof THREE.Mesh ? submesh._vkClone() : submesh.clone());
		if (node.userData.transformType === "ORTHO2D") {
			clonedSubmesh.position.setScalar(0);
			clonedSubmesh.scale.setScalar(1);
		}
		clonedSubmesh.userData.skipIt = true;
		clonedSubmesh.renderOrder = node.renderOrder;
		if (node.userData.materialId) {// the parent node overrides the original submesh material
			ThreeUtils.disposeMaterial(clonedSubmesh.material);
			clonedSubmesh.material = this._getMaterialRef(node.userData.materialId) || submesh.material;
			clonedSubmesh.userData.materialId = node.userData.materialId;
		}

		return clonedSubmesh;
	};

	/**
	 * Insert a submesh to the mesh.
	 *
	 * @param {any} submeshInfo The object of submesh information that have the following properties<br/>
	 *								<code>meshId</code>: string id of mesh that this sub-mesh belongs to<br/>
	 *								<code>materialId</code>: string, id of the material this sub-mesh is associated with, optional<br/>
	 *								<code>bondingBox</code>: [minx, miny, minz, maxx, maxy, maxz], only used for reading vds file (maitai.js)<br/>
	 *								<code>transform</code>: matrix as either 12(no shear), 16(full) or 3(position only) values. Optional</br>
	 *								<code>lods</code>: array of lods each containing the follow properties, only used for <br/>
	 *	 									<code>id</code>: string, geometry id the lod is associated with<br/>
	 *										<code>type</code>: string enum, default is 'mesh', other values are 'box' or 'line', optional<br/>
	 *										<code>boundingBox</code>: [minx, miny, minz, maxx, maxy, maxz]<br/>
	 *										<code>data</code>: inline base64 data for small or box geometry<br/>
	 *
	 * @returns {boolean} true if the submesh was successfully created and inserted in to the mesh.
	 * @public
	 */

	SceneBuilder.prototype.insertSubmesh = function(submeshInfo, sceneBoundingbox) {
		var material = this._getMaterialRef(submeshInfo.materialId) || this._createTemporaryMaterial(submeshInfo.materialId);

		if (!submeshInfo.lods) {
			return false;
		}

		var lod = findBestLOD(submeshInfo.lods);
		if (!lod) {
			return false;
		}

		var pointCount = lod.pointCount;
		var elementCount = lod.elementCount;
		var flags = lod.flags;
		var boundingBox = lod.boundingBox;
		var forceEmptyMesh = !boundingBox || flags == null; // todo: use the "loader.getSkipLowLODRendering()" flag here
		var nodes = this._meshNodes.get(submeshInfo.meshId); // list of group nodes that represent this mesh
		var geometryDescriptor = null;

		var submesh;
		if (forceEmptyMesh) {
			// create an empty mesh that is not visible and you cannot hittest
			var emptyGeometry = new THREE.BufferGeometry();
			var emptyIndexAttribute = new THREE.BufferAttribute(new Uint16Array(0), 1);
			var emptyPositionAttribute = new THREE.BufferAttribute(new Float32Array(0), 3);
			emptyGeometry.setIndex(emptyIndexAttribute);
			emptyGeometry.setAttribute("position", emptyPositionAttribute);
			submesh = new THREE.Mesh(emptyGeometry, material);
		} else {
			var isLine = (flags & 1) > 0;
			var instancesCount = nodes ? nodes.length : 0;
			var innerBoxesLod = findInnerBoxLOD(submeshInfo.lods);
			var innerBoxesData = innerBoxesLod ? TotaraUtils.base64ToUint8Array(innerBoxesLod.data) : null;

			if (this._isSmallScene == null) {
				// we don't want creating all these marching cubes meshes in a large scene (too slow and lots of RAM)
				this._isSmallScene = this._meshNodes.size < 2000 && this._nodes.size < 5000;
			}

			var forceSingleCube = isLine || !innerBoxesData;
			var forceNonCluster = isLine || instancesCount < 1 || pointCount < 24 || elementCount < 12;
			// note: we have "sceneBoundingbox" and can prioritize large objects
			var limitPointElementCount = 1; // must fit into given pointCount/elementCount
			if (forceNonCluster) {
				limitPointElementCount = -1; // completely ignore existing pointCount/elementCount
			} else if (this._isSmallScene || forceSingleCube) {
				limitPointElementCount = 0; // result can be larger than pointCount/elementCount, but if it fits, then mesh will have exact pointCount/elementCount padded with zeroes
			}

			var r = ThreeUtils.buildTemporaryMesh(boundingBox, flags, pointCount, elementCount, innerBoxesData, forceSingleCube, limitPointElementCount);
			if (forceNonCluster || r.points.length > pointCount * 3 || r.indices.length > elementCount * 3) {
				// create a separate mesh geometry
				var tempGeometry = new THREE.BufferGeometry();
				var tempIndexAttribute = new THREE.BufferAttribute(r.indices, 1);
				var tempPositionAttribute = new THREE.BufferAttribute(r.points, 3);
				var tempNormalAttribute = new THREE.BufferAttribute(r.normals, 3);
				tempGeometry.setIndex(tempIndexAttribute);
				tempGeometry.setAttribute("position", tempPositionAttribute);
				tempGeometry.setAttribute("normal", tempNormalAttribute);
				submesh = new THREE.Mesh(tempGeometry, material);
			} else {
				// use existing preallocated space in a cluster
				geometryDescriptor = this._addGeometryToCluster(r.points, r.normals, r.uvs, r.indices, false, submeshInfo.materialId, instancesCount);
				TotaraUtils.pushElementIntoMapArray(this._geometries, lod.id, geometryDescriptor);
				submesh = new THREE.Mesh(geometryDescriptor.geometry, material);
			}
		}

		submesh.userData.geometryId = lod.id;
		submesh.userData.lodInfo = lod;

		// if tree has transform, it should overwrite one from the element.
		if (submeshInfo.transform) {
			submesh.applyMatrix4(arrayToMatrix(submeshInfo.transform));
		}
		submesh.updateMatrixWorld(true);

		// submesh.name = "submesh-" + meshId + "-" + submeshInfo.id + "-" + lod.id;
		submesh.userData.submeshId = submeshInfo.id;
		submesh.userData.initialMaterialId = submeshInfo.materialId;
		submesh.userData.meshId = submeshInfo.meshId;
		submesh.userData.materialId = submeshInfo.materialId;
		submesh.userData.submeshInfo = submeshInfo;

		TotaraUtils.pushElementIntoMapArray(this._materialMeshes, submeshInfo.materialId, submeshInfo.meshId);
		TotaraUtils.pushElementIntoMapArray(this._geometryMaterials, lod.id, submeshInfo.materialId);
		TotaraUtils.pushElementIntoMapArray(this._geometryMeshes, lod.id, submeshInfo.meshId);
		TotaraUtils.pushElementIntoMapArray(this._meshSubmeshes, submeshInfo.meshId, submesh);

		if (nodes) {
			nodes.forEach(function(node) {
				var clonedSubmesh = this._cloneSubmesh(submesh, node);

				if (clonedSubmesh.material && node.userData && node.userData.geometryType &&
					(node.userData.geometryType === "PLANE" || node.userData.geometryType === "SURFACE")) {
					clonedSubmesh.material.side = THREE.DoubleSide;
					if (this._vkScene.getDoubleSided()) {
						// be consistent with scene's setDoubleSided function
						if (!clonedSubmesh.material.userData) {
							clonedSubmesh.material.userData = {};
						}
						clonedSubmesh.material.userData.originalMaterialSide = THREE.DoubleSide;
					}
				}

				if (geometryDescriptor) {
					var nativeSceneUD = this._vkScene.getSceneRef().userData;
					clonedSubmesh.userData.renderGroup = makeRenderGroupFromDescriptor(geometryDescriptor, nativeSceneUD.currentInstanceIndex);
					nativeSceneUD.currentInstanceIndex++;
				}

				node.add(clonedSubmesh);
				clonedSubmesh.updateMatrixWorld(true);
				applyNodeOpacityToSubmeshMaterial(node, submeshInfo.materialId, this._materialClones);
			}, this);
		}

		return true;
	};

	function replaceSubmeshGeometry(children, geometryId, geometryDescriptor, instanceIndex) {
		var instanceCount = 0;
		var geometry = geometryDescriptor.geometry;
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (geometryId && child.userData.geometryId === geometryId && child.geometry !== geometry) {
				var renderGroup = makeRenderGroupFromDescriptor(geometryDescriptor, instanceIndex + instanceCount);
				instanceCount++;

				if (child.type === "Mesh" && !geometry.userData.isPolyline) {
					if (child.geometry) {
						ThreeUtils.disposeGeometry(child);
					}
					child.geometry = geometry;
					child.userData.renderGroup = renderGroup;
					child.updateMatrixWorld(true);
					UsageCounter.increaseGeometryUsed(geometry);
				} else {
					// this happens when we created a temporary "Mesh" and now the real thing is "LineSegments"
					var newSubmesh = new THREE.LineSegments(geometry, child.material);
					UsageCounter.increaseGeometryUsed(geometry);

					newSubmesh.position.copy(child.position);
					newSubmesh.quaternion.copy(child.quaternion);
					newSubmesh.scale.copy(child.scale);
					newSubmesh.matrix.copy(child.matrix);
					newSubmesh.updateMatrixWorld(true);
					newSubmesh.userData = child.userData;
					newSubmesh.userData.renderGroup = renderGroup;
					newSubmesh.renderOrder = child.renderOrder;
					newSubmesh.parent = child.parent;
					children[i] = newSubmesh;
					child.parent = null;
				}
			}
		}

		return instanceCount;
	}

	SceneBuilder.prototype._setSubmeshMaterial = function(child, material, materialId) {
		UsageCounter.increaseMaterialUsed(material);
		child.material = material;
		child.userData.materialId = materialId;
		delete child.userData.originalMaterial;
		child._vkUpdateMaterialOpacity();
		if (child.material !== material) {
			TotaraUtils.pushElementIntoMapArray(this._materialClones, materialId, child.material);
		}
	};

	SceneBuilder.prototype._updateMaterial = function(node, materialId, material) {
		node.children.forEach(function(child) {
			if (child.material && child.userData.materialId === materialId) {
				this._setSubmeshMaterial(child, material, materialId);
			}
		}, this);
	};

	SceneBuilder.prototype._updateMeshSubmeshesMaterial = function(meshId, materialId, material) {
		var submeshes = this._meshSubmeshes.get(meshId);
		if (submeshes) {
			submeshes.forEach(function(submesh) {
				if (submesh.material && submesh.material.userData.materialId === materialId) {
					submesh.material = material;
				}
			});
		}
	};

	function applyNodeOpacityToSubmeshMaterial(node, materialId, materialClones) {
		node.children.forEach(function(child) {
			if (child.material && (!materialId || materialId === child.material.userData.materialId)) {
				var prevMaterial = child.material;
				child._vkUpdateMaterialOpacity();
				if (child.material !== prevMaterial) {
					TotaraUtils.pushElementIntoMapArray(materialClones, child.material.userData.materialId, child.material);
				}
			}
		});
	}

	function computeNormals(points, indices) {
		var normals = new Float32Array(points.length);
		var p0 = new THREE.Vector3();
		var p1 = new THREE.Vector3();
		var p2 = new THREE.Vector3();
		var normal = new THREE.Vector3();
		var i, count;
		for (i = 0, count = indices.length; i < count; i += 3) {
			var pi = [indices[i] * 3, indices[i + 1] * 3, indices[i + 2] * 3];
			p0.fromArray(points, pi[0]);
			p1.fromArray(points, pi[1]).sub(p0);
			p2.fromArray(points, pi[2]).sub(p0);
			normal.crossVectors(p1, p2).normalize();
			for (var j = 0; j < 3; j++) {
				var k = pi[j];
				normals[k] += normal.x;
				normals[k + 1] += normal.y;
				normals[k + 2] += normal.z;
			}
		}
		for (i = 0, count = normals.length; i < count; i += 3) {
			normal.fromArray(normals, i).normalize().toArray(normals, i);
		}
		return normals;
	}

	/**
	 * Create a geometry from geometry information
	 *
	 * @param {any} geoInfo The object of geometry information that have the following properties<br/>
	 *								<code>id</code> : string, id of this geometry<br/>
	 *								<code>isPolyline</code>: boolean, true if the submesh is polyline<br/>
	 *								<code>meshId</code>: id of mesh that contains the submesh with the geometry, optional
	 *								<code>data.indices</code>: array of point index<br/>
	 *								<code>data.points</code>: array of point coordinates<br/>
	 *								<code>data.normals</code>: array of point normal coordinates, optional<br/>
	 *								<code>data.uvs</code>: array of texture uv coordinates, optional<br/>
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setGeometry = function(geoInfo) {
		var geometryId = geoInfo.id;
		var data = geoInfo.data;

		var existingDescriptors = this._geometries.get(geometryId);
		if (existingDescriptors) {
			// we already have a proxy geometry allocated in a cluster, so we only need to update it

			existingDescriptors.forEach(function(desc) {
				if (!ThreeUtils.updateClusterGeometry(desc, data.points, data.normals, data.uvs, data.indices)) {
					// todo: this will never happen, right?
					Log.error("Invalid geometry in setGeometry");
				}
			});
		}

		var instanceCount = 0;
		var meshIds = existingDescriptors ? null : this._geometryMeshes.get(geometryId);
		if (meshIds) {
			meshIds.forEach(function(cmid) {
				var mn = this._meshNodes.get(cmid);
				if (mn) {
					instanceCount += mn.length;
				}
			}, this);
		}

		if (instanceCount < 1) {
			// this happens during UTs for example, in normal scene load we expect to have the
			// correct number of instances here (as otherwise instanced rendering would be suboptimal).
			instanceCount = 1;
		}

		// put geometry data into one of the clusters
		var materialIds = existingDescriptors ? null : this._geometryMaterials.get(geometryId);
		if (materialIds) {
			materialIds.forEach(function(materialId) {
				var geometryDescriptor = this._addGeometryToCluster(data.points, data.normals, data.uvs, data.indices, geoInfo.isPolyline, materialId, instanceCount);
				TotaraUtils.pushElementIntoMapArray(this._geometries, geometryId, geometryDescriptor);

				if (meshIds) {
					var nativeSceneUD = this._vkScene.getSceneRef().userData;
					for (var mi = 0; mi < meshIds.length; mi++) {
						var meshId = meshIds[mi];
						var nodes = this._meshNodes.get(meshId);
						if (nodes) {
							// "nodes" is a list of all meshes that have this geometry
							for (var ni = 0; ni < nodes.length; ni++) {
								// "nodes[ni].children" are all submeshes of a mesh
								nativeSceneUD.currentInstanceIndex += replaceSubmeshGeometry(nodes[ni].children, geometryId, geometryDescriptor, nativeSceneUD.currentInstanceIndex);
							}
						}
						var submeshes = this._meshSubmeshes.get(meshId);
						if (submeshes) {
							replaceSubmeshGeometry(submeshes, geometryId, geometryDescriptor, nativeSceneUD.currentInstanceIndex);
						}
					}
				}
			}, this);
		}

		if (this._fireSceneUpdated) {
			this._fireSceneUpdated();
		}

		return this;
	};

	/**
	 * Set a node as mesh node
	 * @param {string} nodeId The id of node
	 * @param {string} meshId The id of mesh
	 * @public
	 */
	SceneBuilder.prototype.setMeshNode = function(nodeId, meshId) {
		var node = this._nodes.get(nodeId);
		if (node) {
			TotaraUtils.pushElementIntoMapArray(this._meshNodes, meshId, node);
			var submeshes = this._meshSubmeshes.get(meshId); // [ THREE.Mesh ]
			if (submeshes) {
				submeshes.forEach(function(submesh) {
					var clonedSubmesh = this._cloneSubmesh(submesh, node);

					var descriptors = this._geometries.get(submesh.userData.geometryId);
					if (descriptors) {
						// If we are here, then the scene was fully loaded and all cluster geometry already
						// assigned (loader would first create node instances (this._meshNodes) and only then populate this._meshSubmeshes).
						// So we cannot use cluster rendering for these submeshes, because number of
						// submesh instances was counted at scene load and now it will different.
						// We are using "null" for instanceIndex for such meshes.
						clonedSubmesh.userData.renderGroup = makeRenderGroupFromDescriptor(descriptors[0], null);
					}

					node.add(clonedSubmesh);
				}, this);
				applyNodeOpacityToSubmeshMaterial(node, null, this._materialClones);
			}
		}
	};

	SceneBuilder.prototype.setParametricNode = function(nodeId, parametricId, visible) {
		var node = this._nodes.get(nodeId);
		if (node) {
			node.userData.parametricVisible = visible !== undefined ? visible : true;
		}
	};

	SceneBuilder.prototype.progress = function(progress) {
		Log.log("reading progress:", progress);
	};

	SceneBuilder.prototype.loadingFinished = function(info) {
		if (this._fireLoadingFinished) {
			this._fireLoadingFinished(info);
		}
	};

	/**
	 * Get three.js geometry
	 * @param {any} geometryId The id of geometry
	 * @returns {THREE.BufferGeometry} three.js geometry
	 * @public
	 */
	SceneBuilder.prototype.getGeometry = function(geometryId) {
		var descriptors = this._geometries.get(geometryId);
		return descriptors ? descriptors[0].geometry : null;
	};

	var annotationStyles = {
		rect: BillboardStyle.RectangularShape,
		circle: BillboardStyle.CircularShape,
		none: BillboardStyle.None,
		textGlow: BillboardStyle.TextGlow
	};

	var annotationBorderLineStyles = {
		none: BillboardBorderLineStyle.None,
		solid: BillboardBorderLineStyle.Solid,
		dash: BillboardBorderLineStyle.Dash,
		dot: BillboardBorderLineStyle.Dot,
		dashdot: BillboardBorderLineStyle.DashDot,
		dashdotdot: BillboardBorderLineStyle.DashDotDot
	};

	var billboardHorizontalAlignments = {
		left: BillboardHorizontalAlignment.Left,
		center: BillboardHorizontalAlignment.Center,
		right: BillboardHorizontalAlignment.Right
	};

	var leaderLineMarkStyles = {
		none: LeaderLineMarkStyle.None,
		point: LeaderLineMarkStyle.Point,
		arrow: LeaderLineMarkStyle.Arrow
	};

	var _color = new THREE.Color();

	function evaluateOrtho2DTransformation(node) {
		var matrix = new THREE.Matrix4();
		var matrixTotal = new THREE.Matrix4();
		var n = node;
		while (n && n.userData.originalTransform) {
			assert(n.userData.transformType === "ORTHO2D");
			var originalTransform = n.userData.originalTransform;
			matrix.compose(originalTransform.p, originalTransform.q, originalTransform.s);
			matrixTotal.premultiply(matrix);
			n = n.parent;
		}
		matrixTotal.decompose(node.position, node.quaternion, node.scale);
	}

	////////////////////////////////////////////////////////////////////////
	// Add an annotation to a node
	SceneBuilder.prototype.createAnnotation = function(annotation, sceneId) {
		this._resetCurrentScene(sceneId);
		var node = this._nodes.get(annotation.nodeId);
		if (!node) {
			Log.warning("Annotation node not found", annotation);
			return;
		}

		// console.log("createAnnotation", annotation, node);

		if (node.userData.originalTransform) {// if node has ORTHO2D transformType, then we need to restore its original transformation because it can be changed
			evaluateOrtho2DTransformation(node);
		}

		var type = annotation.type;
		if (type === undefined) {
			this.createLegacyAnnotation(annotation, node);
			return;
		}

		node.userData.annotationType = type;

		if (type === "html") {
			annotation.id = annotation.id || uid();
			var targetNodes = [];
			if (annotation.leaderLines) {
				annotation.leaderLines.forEach(function(leaderLine) {
					if (leaderLine.start && leaderLine.start.sid) {
						targetNodes.push(this._nodes.get(leaderLine.start.sid));
					}
				}, this);
			}
			this._vkScene._addAnnotation(annotation.id, {
				annotation: annotation,
				node: node,
				attachment: (annotation.attachment && annotation.attachment.sid) ? this._nodes.get(annotation.attachment.sid) : null,
				targetNodes: targetNodes
			});
			return;
		}

		var label = annotation.label || {};
		var text = annotation.text || {};
		var colour = label.colour || [1, 1, 1, 1];
		var borderColour = label.borderColour || [0, 0, 0, 1];

		var params = {
			node: node,
			renderOrder: node.renderOrder || 0,
			style: annotationStyles[label.shape] || BillboardStyle.RectangularShape,
			width: label.width || 64,
			height: label.height || 64,
			backgroundColor: _color.fromArray(colour).getStyle(),
			backgroundOpacity: colour[3],
			borderColor: _color.fromArray(borderColour).getStyle(),
			borderOpacity: borderColour[3],
			borderWidth: label.borderColour ? (label.borderWidth || 0) : 0,
			borderLineStyle: annotationBorderLineStyles[label.borderLineStyle] || BillboardBorderLineStyle.Solid,
			horizontalAlignment: billboardHorizontalAlignments[text.align]
		};

		if (text.html) {
			params.encoding = BillboardTextEncoding.HtmlText;
			params.text = text.html;
		} else {
			params.encoding = BillboardTextEncoding.PlainText;
			params.text = text.text;
			params.font = text.fontFace || "Arial";
			params.fontSize = Math.abs(text.fontSize) || 16;
			params.fontWeight = Math.min(text.fontWeight, 900);
			params.fontItalic = text.fontItalic;
			params.textColor = _color.fromArray(text.colour || [0, 0, 0]).getStyle();
		}

		if (type === "text") { // billboard
			var pos = node.position;
			params.position = new THREE.Vector3(pos.x * 2, pos.y * 2, pos.z);
			var billboard = new Billboard(params);
			billboard.setText(params.text);
			this._addDynamicObject(node, billboard._update.bind(billboard), true);
		} else if (type === "note") { // callout
			var attachment = annotation.attachment || {};
			params.position = new THREE.Vector3().fromArray(attachment.position || [0, 0, 0]);
			params.anchorNode = this._nodes.get(attachment.sid) || this._rootNode;
			params.depthTest = false;

			var callout = new Callout(params);
			callout.setText(params.text);

			this._callouts.set(annotation.id, callout);
			this._addDynamicObject(node, callout._update.bind(callout), false);
		} else {
			Log.warning("Unsupported annotation type", annotation);
		}
	};

	var legacyAnnotationStyles = [
		BillboardStyle.RectangularShape,
		BillboardStyle.CircularShape,
		BillboardStyle.None,
		BillboardStyle.TextGlow
	];

	var legacyAnnotationCoordinateSpaces = [
		BillboardCoordinateSpace.Viewport,
		BillboardCoordinateSpace.Screen,
		BillboardCoordinateSpace.World
	];

	var legacyAnnotationBorderLineStyles = [
		BillboardBorderLineStyle.None,
		BillboardBorderLineStyle.Solid,
		BillboardBorderLineStyle.Dash,
		BillboardBorderLineStyle.Dot,
		BillboardBorderLineStyle.DashDot,
		BillboardBorderLineStyle.DashDotDot
	];

	var legacyLeaderLineMarkStyles = [
		LeaderLineMarkStyle.None,
		LeaderLineMarkStyle.Point,
		LeaderLineMarkStyle.Arrow
	];

	var legacyBillboardHorizontalAlignments = [
		BillboardHorizontalAlignment.Left,
		BillboardHorizontalAlignment.Center,
		BillboardHorizontalAlignment.Right
	];

	function cssColor(color) {
		var hexColor = color.toString(16);
		if (color.length >= 3) {
			hexColor = (((color[0] * 255) << 16) | ((color[1] * 255) << 8) | (color[2] * 255)).toString(16);
		}
		return "#" + "000000".substring(hexColor.length) + hexColor;
	}

	function checkArray(array) {
		if (!array) {
			return false;
		}
		for (var i = 0, l = array.length; i < l; i++) {
			if (!isFinite(array[i])) {
				return false;
			}
		}
		return true;
	}

	SceneBuilder.prototype.createLegacyAnnotation = function(annotation, node) {
		var pos = annotation.position;
		if (!checkArray(pos)) {
			Log.warning("Incorrect annotation position", annotation);
			return;
		}

		annotation.coordinateSpace |= 0;
		var backgroundOpacity = annotation.backgroundOpacity;
		if (!backgroundOpacity) {
			backgroundOpacity = annotation.backgroundColour ? annotation.backgroundColour[3] : 0;
		}

		var borderOpacity = annotation.borderOpacity;
		if (!borderOpacity) {
			borderOpacity = annotation.borderColour ? annotation.borderColour[3] : 0;
		}
		var params = {
			node: node,
			coordinateSpace: legacyAnnotationCoordinateSpaces[annotation.coordinateSpace],
			style: legacyAnnotationStyles[annotation.shape || 0],
			width: annotation.width,
			height: annotation.height,
			backgroundColor: annotation.backgroundColour ? cssColor(annotation.backgroundColour) : "#fff",
			backgroundOpacity: backgroundOpacity,
			borderColor: annotation.borderColour ? cssColor(annotation.borderColour) : "#000",
			borderOpacity: borderOpacity,
			borderWidth: annotation.borderWidth,
			borderLineStyle: legacyAnnotationBorderLineStyles[annotation.borderLineStyle]
		};

		if (annotation.encoding !== undefined) {  // for reading vds file (matai.js)
			params.encoding = annotation.encoding ? BillboardTextEncoding.HtmlText : BillboardTextEncoding.PlainText;
			params.font = annotation.font;
			params.fontSize = annotation.fontSize;
			params.fontWeight = Math.min(annotation.fontWeight, 900);
			params.fontItalic = annotation.fontItalic;
			params.textColor = cssColor(annotation.textColour);
			params.link = annotation.link;
			params.horizontalAlignment = legacyBillboardHorizontalAlignments[annotation.textHorizontalAlignment];
			params.position = new THREE.Vector3().fromArray(pos);
		} else if (annotation.fontFace) {
			params.encoding = BillboardTextEncoding.PlainText;
			params.font = annotation.fontFace;
			params.fontSize = Math.abs(annotation.fontSize);
			params.fontWeight = Math.min(annotation.fontWeight, 900);
			// params.fontItalic = !!annotation.fontItalic;
			params.textColor = cssColor(annotation.textColour);
		} else {
			params.encoding = BillboardTextEncoding.HtmlText;
		}

		if (annotation.coordinateSpace < 2) {// billboard (text annotation)
			if (!params.positions) {
				params.position = new THREE.Vector3(pos[0] * 2 - 1, pos[1] * -2 + 1, pos[2]);
			}
			params.renderOrder = (annotation.order | 0) + 1000;
			var billboard = new Billboard(params);
			billboard.setText(annotation.text);
			this._addDynamicObject(node, billboard._update.bind(billboard), true);
		} else {// callout
			params.anchorNode = this._nodes.get(annotation.sid) || this._rootNode;
			if (!params.position) {
				params.position = new THREE.Vector3().fromArray(pos);
			}
			params.depthTest = false;
			params.renderOrder = annotation.order | 0;
			if (annotation.alwaysOnTop) {
				params.renderOrder = 1;
			}
			var callout = new Callout(params);
			callout.setText(annotation.text);

			this._callouts.set(annotation.id, callout);
			this._addDynamicObject(node, callout._update.bind(callout), false);
		}
	};

	function getTransformType(node) {
		while (node) {
			if (node.userData.transformType) {
				return node.userData.transformType;
			}
			node = node.parent;
		}
	}

	SceneBuilder.prototype.createImageNote = function(annotation, sceneId) {
		this._resetCurrentScene(sceneId);
		var node = this._nodes.get(annotation.nodeId);
		if (!node) {
			Log.warning("Image annotation node not found", annotation);
			return;
		}

		if (node.userData.originalTransform) {// if node has ORTHO2D transformType, then we need to restore its original transformation because it can be changed
			evaluateOrtho2DTransformation(node);
		}

		if (annotation.type === "image") {
			var label = annotation.label || {};
			var materialId = label.materialId;
			var material = this._getMaterialRef(materialId);
			if (!material) {
				Log.warning("Image annotation material not found", annotation);
				return;
			}
			// console.log("createImageNote", annotation, node.position, node.scale);
			if (label.projection === "spherical") {
				node.position.setScalar(0);
				node.scale.setScalar(1);
				label.width = -1;
				label.height = -1;
				node.userData.transformType = "LOCK_TOVIEWPORT";
				node.userData.renderStage = -1; // must be Underlay2D

				var oldMaterial = material;
				material = new SphericalMapMaterial({
					upAxis: this._upAxis,
					map: oldMaterial.map,
					color: oldMaterial.color
				});
				material.userData = oldMaterial.userData;
				this._vkScene.getMaterial(materialId)._nativeMaterial = material;
			}

			material.depthTest = false;
			material.depthWrite = false;
			material.blending = THREE.CustomBlending; // enables blending even for non-transparent materials, transparency breaks the rendering order
			material.side = THREE.DoubleSide;

			if (node.userData.renderStage === undefined) {
				if (annotation.order) {
					node.userData.renderStage = Math.sign(annotation.order); // Overlay2D or Underlay2D
				} else if (annotation.order === undefined && getTransformType(node) !== undefined) {
					node.userData.renderStage = 1; // Overlay2D by default
				}
			}

			switch (node.userData.transformType) {
				case "ORTHO2D":
				case "LOCK_TOVIEWPORT":
					var billboard = new Billboard({
						node: node,
						renderOrder: node.renderOrder || 0,
						coordinateSpace: BillboardCoordinateSpace.Screen,
						// renderOrder: (annotation.order | 0) + 1000,
						position: new THREE.Vector3(node.position.x, node.position.y, 0),
						width: (label.width || 200) * node.scale.x * 0.5,
						height: (label.height || 200) * node.scale.y * 0.5
					});
					billboard.setMaterial(material);

					node.position.setScalar(0);
					node.scale.setScalar(1);
					this._addDynamicObject(node, billboard._update.bind(billboard), true);
					break;
				case "BILLBOARD_VIEW":
				default: // undefined
					var planeMesh = new THREE.Mesh(Billboard.prototype._planeGeometry, material);
					planeMesh.scale.set(label.width, label.height, 1);
					planeMesh.updateMatrix();
					node.add(planeMesh);
					break;
			}
		} else {
			this.createLegacyImageNote(annotation, node);
		}
	};

	SceneBuilder.prototype.createLegacyImageNote = function(annotation, node) {
		var position = new THREE.Vector3().fromArray(annotation.position);
		var width = annotation.width;
		var height = annotation.height;
		if (!annotation.properlyAligned) {
			position.x += annotation.width * 0.5;
			position.y += annotation.height * 0.5;
			position.applyMatrix4(node.matrix);
			width = annotation.width * 0.5 * node.matrix.elements[0];
			height = annotation.height * 0.5 * node.matrix.elements[5];
		}

		var material = this._getMaterialRef(annotation.labelMaterialId);
		material.depthTest = false;
		material.depthWrite = false;
		material.blending = THREE.CustomBlending; // enables blending even for non-transparent materials, transparency breaks the rendering order
		// material.premultipliedAlpha = true;

		if (getTransformType(node) === "LOCK_TOVIEWPORT") {
			var billboard = new Billboard({
				node: node,
				coordinateSpace: BillboardCoordinateSpace.Screen,
				renderOrder: (annotation.order | 0) + 1000,
				position: position,
				width: width,
				height: height
			});
			billboard.setMaterial(material);

			this._addDynamicObject(node, billboard._update.bind(billboard), true);
		} else {
			var planeMesh = new THREE.Mesh(Billboard.prototype._planeGeometry, material);
			planeMesh.renderOrder = (annotation.order | 0) + 1000;
			planeMesh.position.copy(position);
			planeMesh.scale.set(width * 2, height * 2, 1);
			planeMesh.updateMatrix();
			node.add(planeMesh);
			node.scale.setScalar(1);
			node.updateMatrix();
		}
	};

	SceneBuilder.prototype.insertLeaderLine = function(leaderLine, sceneId) {
		this._resetCurrentScene(sceneId);
		var callout = this._callouts.get(leaderLine.annotationId);
		if (callout) {
			var material = this._getMaterialRef(leaderLine.materialId);
			if (!material) {
				Log.warning("Leader line material not found", leaderLine);
				return;
			}

			var vertices = [];
			var points = leaderLine.points;
			for (var i = 0, l = points.length; i < l; i++) {
				vertices.push(new THREE.Vector3().fromArray(points[i]));
			}
			// console.log("insertLeaderLine", callout.getNode().name, leaderLine, material.userData.materialInfo, vertices);

			var anchorNode;
			if (leaderLine.start) {
				var start = leaderLine.start || {};
				var end = leaderLine.end || {};
				var extension = leaderLine.extension || {};
				anchorNode = this._nodes.get(leaderLine.start.sid) || this._rootNode;
				callout.addLeaderLine(vertices, anchorNode, material,
					leaderLineMarkStyles[start.style] || LeaderLineMarkStyle.None, leaderLineMarkStyles[end.style] || LeaderLineMarkStyle.None,
					start.size, extension.length || 0);
			} else { // legacy leader line support
				anchorNode = this._nodes.get(leaderLine.startPointSid) || this._rootNode;
				callout.addLeaderLine(vertices, anchorNode, material,
					legacyLeaderLineMarkStyles[leaderLine.startPointHeadStyle], legacyLeaderLineMarkStyles[leaderLine.endPointHeadStyle],
					leaderLine.pointHeadConstant, leaderLine.extensionLength);
			}
		}
	};

	SceneBuilder.prototype._findDetailViewNodes = function(nodeRefs) {
		var nodes = [];
		if (nodeRefs) {
			nodeRefs.forEach(function(nodeRef) {
				var node = this._nodes.get(nodeRef);
				if (node) {
					nodes.push(node);
				} else {
					Log.warning("Unknown detailView node reference", nodeRef);
				}
			}, this);
		}
		return nodes;
	};

	SceneBuilder.prototype.createDetailView = function(info, sceneId) {
		this._resetCurrentScene(sceneId);
		var node = this._nodes.get(info.nodeId);
		// console.log("createDetailView", info, node);
		if (!node) {
			Log.warning("Detail view node not found", info);
			return;
		}

		var label = info.label;
		if (!label) {
			this.createLegacyDetailView(info, node);
			return;
		}

		var attachment = info.attachment;
		var params = {
			name: info.name,
			camera: label.camera ? this.createCamera(label.camera) : null,
			type: info.cutaway ? DetailViewType.Cutaway : DetailViewType.DetailView,
			borderWidth: label.borderWidth || 0,
			backgroundColor: _color.fromArray(label.colour || [1, 1, 1]).getStyle(),
			borderColor: _color.fromArray(label.borderColour || [1, 1, 1]).getStyle(),
			origin: new THREE.Vector2(node.position.x * 2 - 1 + node.scale.x, node.position.y * -2 + 1 - node.scale.x),
			size: new THREE.Vector2(node.scale.x, node.scale.y),
			attachmentPoint: new THREE.Vector3().fromArray(attachment.position || [0, 0, 0]),
			veId: info.veid,
			visibleNodes: this._findDetailViewNodes(info.visibleNodes),
			targetNodes: this._findDetailViewNodes(info.targetNodes)
		};

		if (label.shape === "rect") {
			params.shape = !label.leaderStyle || label.leaderStyle === "none" ? DetailViewShape.Box : DetailViewShape.BoxLine;
		} else {
			params.shape = {
				none: DetailViewShape.Circle,
				line: DetailViewShape.CircleLine,
				pointer: DetailViewShape.CirclePointer,
				arrow: DetailViewShape.CircleArrow,
				bubbles: DetailViewShape.CircleBubbles
			}[label.leaderStyle] || DetailViewShape.Circle;
		}

		var detailView = new DetailView(params);
		if (!this._rootNode.userData._vkDetailViews) {
			this._rootNode.userData._vkDetailViews = [];
		}
		this._rootNode.userData._vkDetailViews.push({
			detailView: detailView,
			node: node,
			renderOrder: info.renderOrder || node.renderOrder || 0
		});
	};

	SceneBuilder.prototype.createLegacyDetailView = function(info, node) {
		if (!info.properlyAligned) {
			if (!info.shape) { // box = 0 or undefined
				info.shape = info.leaderStyle ? DetailViewShape.BoxLine : DetailViewShape.Box;
			} else { // circle = 1
				info.shape = [
					DetailViewShape.Circle,
					DetailViewShape.CircleLine,
					DetailViewShape.CirclePointer,
					DetailViewShape.CircleArrow,
					DetailViewShape.CircleBubbles
				][info.leaderStyle || 0];
			}

			info.type = info.cutaway ? DetailViewType.Cutaway : DetailViewType.DetailView;
			info.camera = info.camera ? this.createCamera(info.camera) : null;
			info.origin = new THREE.Vector2(node.position.x * 2 - 1 + node.scale.x, node.position.y * -2 + 1 - node.scale.x);
			info.size = new THREE.Vector2(node.scale.x, node.scale.y);
			info.renderOrder = node.renderOrder;
		} else {
			info.type = [
				DetailViewType.DetailView,
				DetailViewType.Cutaway
			][info.type];
			info.shape = [
				DetailViewShape.Box,
				DetailViewShape.Circle,
				DetailViewShape.CircleLine,
				DetailViewShape.CirclePointer,
				DetailViewShape.CircleArrow,
				DetailViewShape.CircleBubbles,
				DetailViewShape.BoxLine,
				DetailViewShape.BoxNoOutline,
				DetailViewShape.SolidPointer,
				DetailViewShape.SolidArrow
			][info.shape];
			info.camera = this._cameras.get(info.cameraId);
			info.origin = new THREE.Vector2().fromArray(info.origin);
			info.size = new THREE.Vector2().fromArray(info.size);
		}

		var detailView = new DetailView({
			name: info.name,
			camera: info.camera,
			type: info.type,
			shape: info.shape,
			borderWidth: info.borderWidth || 0,
			backgroundColor: info.backgroundColour ? cssColor(info.backgroundColour) : "#fff",
			borderColor: info.borderColour ? cssColor(info.borderColour) : "#000",
			origin: info.origin,
			size: info.size,
			attachmentPoint: new THREE.Vector3().fromArray(info.attachment),
			metadata: info.metadata,
			veId: info.veid,
			visibleNodes: this._findDetailViewNodes(info.visibleNodes),
			targetNodes: this._findDetailViewNodes(info.targetNodes)
		});
		if (!this._rootNode.userData._vkDetailViews) {
			this._rootNode.userData._vkDetailViews = [];
		}
		this._rootNode.userData._vkDetailViews.push({
			detailView: detailView,
			node: node,
			renderOrder: info.renderOrder || 0
		});
	};

	SceneBuilder.prototype.insertThrustline = function(info) {
		var node = this._nodes.get(info.thrustlineId);
		if (node && !this._thrustlines.get(info.thrustlineId)) {
			var thrustline = new Thrustline({
				node: node,
				principleAxis: new THREE.Vector3().fromArray(info.principleAxis),
				material: this._getMaterialRef(info.materialId)
			});

			var items = [];
			var basisAxisCount = 0;
			var boundPointCount = 0;
			var count = 0;
			for (var ii = 0; ii < info.itemCount; ii++) {
				var item = {};
				item.target = this._nodes.get(info.targets[ii]);
				item.majorAxisIndex = info.itemMajorAxisesIndices[ii];

				var bi;

				item.basisAxises = [];
				count = basisAxisCount + info.itemBasisAxisesCounts[ii];
				for (bi = basisAxisCount; bi < count; bi++) {
					var basisAxis = {};
					basisAxis.x = info.itemBasisAxisesCoordinates[bi * 3];
					basisAxis.y = info.itemBasisAxisesCoordinates[bi * 3 + 1];
					basisAxis.z = info.itemBasisAxisesCoordinates[bi * 3 + 2];
					item.basisAxises.push(basisAxis);
				}
				basisAxisCount = count;

				item.dimension = {};
				item.dimension.x = info.itemDimensionsCoordinates[ii * 3];
				item.dimension.y = info.itemDimensionsCoordinates[ii * 3 + 1];
				item.dimension.z = info.itemDimensionsCoordinates[ii * 3 + 2];

				item.center = {};
				item.center.x = info.itemCentersCoordinates[ii * 3];
				item.center.y = info.itemCentersCoordinates[ii * 3 + 1];
				item.center.z = info.itemCentersCoordinates[ii * 3 + 2];

				item.boundPoints = [];
				count = boundPointCount + info.itemBoundPointsCounts[ii];
				for (bi = boundPointCount; bi < count; bi++) {
					var point = {};
					point.x = info.itemBoundPointsCoordinates[bi * 3];
					point.y = info.itemBoundPointsCoordinates[bi * 3 + 1];
					point.z = info.itemBoundPointsCoordinates[bi * 3 + 2];
					item.boundPoints.push(point);
				}
				boundPointCount = count;

				items.push(item);
			}

			thrustline.setItems(items);

			var ratioCount = 0;
			var segments = [];
			for (var si = 0; si < info.segmentCount; si++) {
				var segment = {};
				segment.startItemIndex = info.segmentsStartItemIndices[si];
				segment.endItemIndex = info.segmentsEndItemIndices[si];
				segment.startBoundIndex = info.segmentsStartBoundIndices[si];
				segment.endBoundIndex = info.segmentsEndBoundIndices[si];
				segment.ratios = [];
				count = ratioCount + info.segmentRatioCounts[si];
				for (var ri = 0; ri < count; ri++) {
					var ratio = {};
					ratio.x = info.segmentRatiosCoordinates[ri * 2];
					ratio.y = info.segmentRatiosCoordinates[ri * 2 + 1];
					segment.ratios.push(ratio);
				}
				ratioCount = count;
				segments.push(segment);
			}
			thrustline.setSegments(segments);
			this._thrustlines.set(info.thrustlineId, thrustline);
			this._addDynamicObject(node, thrustline._update.bind(thrustline), false);
		}
	};

	SceneBuilder.prototype.updateViewsForReplacedNodes = function(nodeInfos) {
		var updates = new Map();
		nodeInfos.forEach(function(nodeInfo) {
			var node = this._nodes.get(nodeInfo.sid);
			if (node) {
				updates.set(nodeInfo.sid, node);
			}
		}, this);

		function replaceTarget(view, updates) {
			var nodeInfos = view.getNodeInfos();
			nodeInfos.forEach(function(nodeInfo) {
				var originalTarget = nodeInfo.target;
				if (originalTarget && originalTarget.userData &&
					originalTarget.userData.treeNode && originalTarget.userData.treeNode.sid) {
					var node = updates.get(originalTarget.userData.treeNode.sid);
					if (node) {
						nodeInfo.target = node;
						node.updateMatrixWorld();
					}
				}
			});
		}

		function replaceAnimationNodes(view, updates) {
			var node;
			var playbacks = view.getPlaybacks();
			for (var pi = 0; pi < playbacks.length; pi++) {
				var playback = playbacks[pi];
				var sequence = playback.getSequence();
				if (sequence) {
					var sequenceChanged = false;
					var nodeAnimations = sequence.getNodeAnimation();
					for (var ni = 0; ni < nodeAnimations.length; ni++) {
						var nodeAnimation = nodeAnimations[ni];
						var animationNode = nodeAnimation.nodeRef;
						if (animationNode && animationNode.userData &&
							animationNode.userData.treeNode && animationNode.userData.treeNode.sid) {
							node = updates.get(animationNode.userData.treeNode.sid);
							if (node) {
								sequence.removeNodeAnimation(animationNode, null, true);
								for (var property in nodeAnimation) {
									if (property === "nodeRef") {
										continue;
									}
									sequence.setNodeAnimation(node, property, nodeAnimation[property], true);
								}
								sequenceChanged = true;
							}
						}
					}

					var joints = sequence.getJoint();
					for (var ji = 0; joints && ji < joints.length; ji++) {
						var joint = joints[ji];
						if (joint.parentSid) {
							node = updates.get(joint.parentSid);
							if (node) {
								joint.parent = node;
								sequenceChanged = true;
							}
						}
						if (joint.nodeSid) {
							node = updates.get(joint.nodeSid);
							if (node) {
								joint.node = node;
								sequenceChanged = true;
							}
						}
					}
					if (sequenceChanged) {
						sequence._fireSequenceChanged();
					}
				}
			}
			nodeInfos.forEach(function(nodeInfo) {
				var originalTarget = nodeInfo.target;
				if (originalTarget && originalTarget.userData &&
					originalTarget.userData.treeNode && originalTarget.userData.treeNode.sid) {
					var node = updates.get(originalTarget.userData.treeNode.sid);
					if (node) {
						nodeInfo.target = node;
						node.updateMatrixWorld();
					}
				}
			});
		}

		this._views.forEach(function(view, viewId) {
			replaceTarget(view, updates);
			replaceAnimationNodes(view, updates);
		});
	};

	////////////////////////////////////////////////////////////////////////
	// Decrease material and geometry counters in a node
	SceneBuilder.prototype._decrementResourceCounters = function(target) {
		target.traverse(function(child) { // Gather all geometries of node children
			if (child.isMesh) { // if child is instance of mesh then look for material and geometries

				UsageCounter.decreaseMaterialUsed(child.material);

				UsageCounter.decreaseGeometryUsed(child.geometry);
			}
		});
	};

	/**
	 * Decrease material and geometry counters in nodes
	 * This function should be called after node are deleted without using sceneBuilder "remove" function
	 *
	 * @param {any[]} nodeIds Array of node ids that are deleted
	 * @param {any} sceneId The id of scene containing the nodes
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.decrementResourceCountersForDeletedTreeNode = function(nodeIds, sceneId) {
		this._resetCurrentScene(sceneId);

		var that = this;

		nodeIds = [].concat(nodeIds);
		nodeIds.forEach(function(id) {
			var target = that._nodes.get(id); // search tree node map
			if (target) {
				that._decrementResourceCounters(target);
				that._nodes.delete(id);
			}
		});

		return this;
	};

	/**
	 * Delete array of nodes
	 *
	 * @param {any[]} nodeIds Array of ids of nodes to be deleted
	 * @param {any} sceneId The id of scene containing the nodes
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.remove = function(nodeIds, sceneId) {
		this._resetCurrentScene(sceneId);

		var that = this;

		nodeIds = [].concat(nodeIds);
		nodeIds.forEach(function(id) {
			var target = that._nodes.get(id); // search tree node map
			if (target) {
				that._decrementResourceCounters(target);
				if (target.parent) {
					// this may not have parent as application may removed it already
					// As application wants instance update on deletion, they can remove a node
					// before they get the confirmation from the server
					target.parent.remove(target);
				}
				that._nodes.delete(id);

				var updatedTexture = false;
				if (!that._forbiddenTextureUpdate) {
					that._forbiddenTextureUpdate = true;
					updatedTexture = true;
					var nativeSceneUD = that._vkScene.getSceneRef().userData;
					if (nativeSceneUD.instanceDataTexture) {
						// all children must be deleted from cluster rendering
						var geometryClusters = nativeSceneUD.geometryClusters;
						var textureUpdateResults = ThreeUtils.prepareTextureUpdateResults(geometryClusters ? geometryClusters.length : 0, nativeSceneUD.textureUpdateResults);
						ThreeUtils.removeNodeFromClusterRenderingRecursive(target, nativeSceneUD.instanceDataTexture.image.data, textureUpdateResults);
						nativeSceneUD.textureUpdateResults = textureUpdateResults;
					}
				}

				for (var i = 0; i < target.children.length; i++) {
					var child = target.children[i];
					if (child.userData && child.userData.treeNode && child.userData.treeNode.sid) {
						that.remove(child.userData.treeNode.sid, sceneId);
					}
				}

				if (updatedTexture) {
					// a trick to not perform this recursive texture update multiple times inside a traversal recursion
					delete that._forbiddenTextureUpdate;
				}
			}
		});

		return this;
	};

	/**
	 * Clean up unused materials and geometries
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.resourcesCleanUp = function() {
		var geoMap = this._geometries;
		geoMap.forEach(function(geoArray) {
			geoArray.forEach(function(geo) {
				var geoCount = geo.geometry.userData.geometryUsed;
				if (geoCount <= 0) {
					geo.dispose();
				}
			});
		});
		return this;
	};

	/**
	 * Create a three.js camera from camera information
	 *
	 * @param {any} cameraInfo The object of camera information that have the following properties<br/>
	 *								<code>id</code>: string, id of this camera<br/>
	 *								<code>origin</code>: [ float, x, y, z ]<br/>
	 *								<code>target</code>: [ float, x, y, z relative to origin ]<br/>
	 *								<code>up</code>: [ float, x, y, z relative to origin ]<br/>
	 *								<code>ortho</code>: bool,  true - orthographic, false - perspective<br/>
	 *								<code>zoom</code>: float, zoom<br/>
	 *								<code>aspect</code>: float, aspect ratio<br/>
	 *								<code>near</code>: float, near Z plane, negative value for auto-evaluate<br/>
	 *								<code>far</code>: float, far Z plane, negative value for auto-evaluate<br/>
	 *								<code>fov</code>: float, field of view<br/>
	 *
	 * @param {any} sceneId The id of scene containing the nodes
	 *
	 * @returns {sap.ui.vk.Camera} The created three.js camera
	 * @public
	 */
	SceneBuilder.prototype.createCamera = function(cameraInfo, sceneId) {
		this._resetCurrentScene(sceneId);

		var near = cameraInfo.near || 1;
		var far = cameraInfo.far || 200000;

		// current solution for identify panoramic scene
		if (cameraInfo.origin.length === 3
			&& cameraInfo.origin[0] === 0
			&& cameraInfo.origin[1] === 0
			&& cameraInfo.origin[2] === 0) {
			cameraInfo.ortho = false;
			cameraInfo.rotate = true;
		}

		var nativeCamera;
		if (cameraInfo.ortho) {
			nativeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, near, far);
			nativeCamera.zoom = cameraInfo.zoom || -1; // -1 means that the zoom will be adjusted on the 1st rendering frame
		} else {
			nativeCamera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(cameraInfo.fov), 1, near, far);
		}

		// update position and up
		if (cameraInfo.origin) {
			nativeCamera.position.fromArray(cameraInfo.origin);
		}

		if (cameraInfo.up) {
			nativeCamera.up.fromArray(cameraInfo.up);
			if (cameraInfo.notUseDirectionVector) {
				nativeCamera.up.sub(nativeCamera.position);
			}
			nativeCamera.up.normalize();
		}

		if (cameraInfo.rotate) {
			nativeCamera.userData.rotate = cameraInfo.rotate;
			// set camera upDir along with pano scene upDir
			nativeCamera.up.set(0, 1, 0);
		}

		// update target
		if (cameraInfo.target) {
			var target = new THREE.Vector3().fromArray(cameraInfo.target);
			if (!cameraInfo.notUseDirectionVector) {
				target.add(nativeCamera.position);
			}
			nativeCamera.lookAt(target);
		}

		this._rootNode.userData.camera = nativeCamera;
		// this._cameras.set(info.cameraRef, camera);
		var camera = null;
		if (nativeCamera.isOrthographicCamera) {
			camera = new OrthographicCamera();
		} else if (nativeCamera.isPerspectiveCamera) {
			camera = new PerspectiveCamera();
		}
		camera.setCameraRef(nativeCamera);

		camera.setUsingDefaultClipPlanes(true); // always use auto as specific near far always cause trouble

		var camId = cameraInfo.id;
		if (camId) {
			this._cameras.set(camId, camera);
		}
		this._rootNode.userData.camera = camera;
		return camera;
	};

	/**
	 * Attach camera to a node
	 *
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} cameraId The id of camera
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertCamera = function(nodeId, cameraId, sceneId) {
		this._resetCurrentScene(sceneId);
		var node = this._nodes.get(nodeId);
		var vkCamera = this._cameras.get(cameraId);
		var camera = vkCamera && vkCamera.getCameraRef();
		if (node && camera) {
			(node || this._rootNode).add(camera.parent ? camera.clone() : camera);
		}
		return this;
	};

	/**
	 * Get three.js camera from camera Id
	 *
	 * @param {any} cameraId The ID of camera
	 * @returns {sap.ui.vk.Camera} The created three.js camera
	 * @public
	 */
	SceneBuilder.prototype.getCamera = function(cameraId) {
		return this._cameras.get(cameraId);
	};

	/**
	 * Make three.js material double-sided if geometry does not have normal defined
	 *
	 * @param {any} materialId The id of material
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.updateMaterialForGeometryWithoutNormal = function(materialId) {
		var material = this._getMaterialRef(materialId);
		if (material && material.emissive) {
			material.emissive.copy(material.color);
			material.side = THREE.DoubleSide;
			if (this._vkScene.getDoubleSided()) {
				// be consistent with scene's setDoubleSided function
				if (!material.userData) {
					material.userData = {};
				}
				material.userData.originalMaterialSide = THREE.DoubleSide;
			}
		}
		return this;
	};

	/**
	 * Create a three.js material from material information
	 *
	 * @param {any} materialInfo The object of material information that have the following properties<br/>
	 *								<code>id</code>: string, id of this element<br/>
									<code>name</code>: material name<br/>
									<code>ambientColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									<code>diffuseColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									<code>specularColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									<code>emissiveColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									<code>opacity</code>: float, opacity, defaults to 0, optional<br/>
									<code>glossiness</code>: float, glossiness, defaults to 0, optional<br/>
									<code>specularLevel</code>: float, specular level, defaults to 0, optional<br/>
									<code>colourMapEnabled</code>: boolean, affects modulation of some colours in material shader, defaults to false, optional<br/>
									<code>lineDashPattern</code>: [ array of floats of dash pattern, optional]<br/>
									<code>lineDashPatternScale</code> : line's dash pattern segment scale, defaults to 0, optional<br/>
									<code>lineColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									<code>lineWidth</code>: float, line's width, defaults to 0, optional<br/>
									<code>lineHaloWidth</code>
									<code>lineEndCapStyle</code>
									<code>lineWidthCoordinateSpace</code>
									<code>textureDiffuse</code>:<br/>
									<code>textureBump</code>:<br/>
									<code>textureOpacity</code>:<br/>
									<code>textureReflection</code>:<br/>
									<code>textureRefraction</code>:<br/>
									<code>textureSpecular</code>:<br/>
									<code>textureAmbient</code>:<br/>
									<code>textureEmissive</code>:<br/>
									<code>textureSpecularLevel</code>:<br/>
									<code>textureGlossiness</code>:<br/>
									<code>textureAmbientOcclusion</code>:<br/>
									<code>textureDecal</code>:<br>
											<code>imageId</code>: string - images session id, optional<br/>
											<code>uvChannelIndex</code>: uint32 - the Uv channel index<br/>
											<code>filterMode</code>: uint32: Bilinear=0, NearestNeighbour=1<br/>
											<code>influence</code>: float  - the influence<br/>
											<code>uvRotationAngle</code>: float - the Uv rotation angle<br/>
											<code>uvHorizontalOffset</code>: float - the Uv horizontal offset<br/>
											<code>uvVerticalOffset</code>: float - the Uv vertical offset<br/>
											<code>uvHorizontalScale</code>: float - the Uv horizontal scale<br/>
											<code>uvVerticalScale</code>: float - the Uv vertical scale<br/>
											<code>uvHorizontalTilingEnabled</code>: boolean - if the Uv horizontal tiling enabled<br/>
											<code>uvVerticalTilingEnabled</code>: boolean - if the Uv vertical tiling enabled<br/>
											<code>uvClampToBordersEnabled</code>: boolean - if the Uv clamp-to-borders enabled<br/>
											<code>inverted</code>: boolean  - if inverted flag is set<br/>
											<code>modulate</code>: boolean - false --> replace, true --> modulate<br/>
											<code>colourMap</code>: boolean - false --> map, true --> do not map<br/>
	 *
	 * @returns {any[]} Array of result objects, and each result contains two properties on an associated texture<br/>
	 * 						  <code>textureType</code>: type of texture to be updated<br/>
							  <code>imageId</code>: id of associated image that has not been created<br/>
	 * @public
	 */
	SceneBuilder.prototype.createMaterial = function(materialInfo) {
		var texturesToLoad = [];
		var materialId = materialInfo.id;
		var material = this._getMaterialRef(materialId);
		var vkMaterial;

		if (materialInfo.lineWidth > 0) {
			if (!material || !material.isLineBasicMaterial) {
				vkMaterial = new Material(MaterialType.LineBasicMaterial);
				material = vkMaterial.getMaterialRef();
				this._vkScene.setMaterial(materialId, vkMaterial);
			}

			material.color = new THREE.Color(materialInfo.lineColour[0], materialInfo.lineColour[1], materialInfo.lineColour[2]);
			material.linewidth = materialInfo.lineWidth;
			material.userData.lineStyle = {
				width: materialInfo.lineWidth,
				haloWidth: materialInfo.lineHaloWidth || 0,
				endCapStyle: materialInfo.lineEndRound ? 1 : 0,
				dashPattern: materialInfo.lineDashPattern || [],
				dashPatternScale: materialInfo.lineDashPatternScale,
				widthCoordinateSpace: materialInfo.lineWidthCoordinateSpace
			};
			material.userData.materialInfo = materialInfo;
			material.userData.materialId = materialId;
			return texturesToLoad;
		}

		var previousMaterial = null;
		if (materialInfo.textureEmissive) {
			if (!material || !material.isMeshBasicMaterial) {
				previousMaterial = material;
				material = this._createTemporaryMaterial(materialId, MaterialType.MeshBasicMaterial);
			}
		}

		if (!material) {
			material = this._createTemporaryMaterial(materialId);
		}

		delete material.userData.toBeUpdated;

		material.userData.materialInfo = materialInfo;

		if (materialInfo.diffuseColour) {
			material.color.fromArray(materialInfo.diffuseColour);
		}

		if (materialInfo.specularColour && material.specular) {
			material.specular.fromArray(materialInfo.specularColour);
			if (materialInfo.specularLevel) {
				material.specular.multiplyScalar(materialInfo.specularLevel);
			}
		}

		var useAmbientColour = true;
		if (materialInfo.emissiveColour) {
			if (material.emissive) { // MeshPhongMaterial
				material.emissive.fromArray(materialInfo.emissiveColour);
				if (material.emissive.r !== 0 || material.emissive.g !== 0 || material.emissive.b !== 0) {
					useAmbientColour = false;
					material.depthFunc = THREE.LessDepth;
				}
			} else {
				material.color.fromArray(materialInfo.emissiveColour); // MeshBasicMaterial
			}
		}

		if (useAmbientColour && materialInfo.ambientColour && material.emissive) { // no ambient colour in three js. use emissive for now
			material.emissive.fromArray(materialInfo.ambientColour);
			material.emissive.multiplyScalar(0.2); // vds cuts ambient colour to 0.2 before rendering
		}

		if (materialInfo.opacity !== undefined) {
			material.opacity = materialInfo.opacity;
			material.transparent = materialInfo.opacity < 1;
			material.side = THREE.DoubleSide;
		}

		var glossiness = materialInfo.glossiness ? materialInfo.glossiness : 0;

		var phExp = Math.pow(2.0, glossiness * 10.0) * 2.0;
		if (phExp < 0.0) {
			phExp = 0.0;
		}
		if (phExp > 128.0) {
			phExp = 128.0;
		}

		material.shininess = phExp;

		// threeSpecular = irradienceK * dvlSpecular * ( shininess * 0.5 + 1.0 )
		// see: float D_BlinnPhong( const in float shininess, const in float dotNH ) { return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess ); }
		// we can compensate for "D_BlinnPhong" difference by scaling the specular color
		// 1.75 coefficient "looks about right" to compensate for irradienceK
		// exact pixel to pixel equality seems to be impossible without using custom shaders
		// material.specular.multiplyScalar(3.0 / (material.shininess * 0.5 + 1.0));

		material.userData.defaultHighlightingEmissive = DefaultHighlightingEmissive;
		material.userData.defaultHighlightingSpecular = DefaultHighlightingSpecular;

		material.userData.imageIdsToAddAsTexture = new Set();
		var info, infos;
		if (materialInfo.textureDiffuse) {
			infos = materialInfo.textureDiffuse;
			info = infos[0] || infos;
			material.userData.imageIdsToAddAsTexture.add(info.imageId);
		} else if (materialInfo.textureDecal) {
			infos = materialInfo.textureDecal;
			info = infos[0] || infos;
			material.userData.imageIdsToAddAsTexture.add(info.imageId);
		}

		if (materialInfo.textureBump) {
			infos = materialInfo.textureBump;
			info = infos[0] || infos;
			material.userData.imageIdsToAddAsTexture.add(info.imageId);
		}

		if (materialInfo.textureEmissive) {
			infos = materialInfo.textureEmissive;
			info = infos[0] || infos;
			material.userData.imageIdsToAddAsTexture.add(info.imageId);
		}

		if (materialInfo.textureAmbientOcclusion) {
			infos = materialInfo.textureAmbientOcclusion;
			info = infos[0] || infos;
			material.userData.imageIdsToAddAsTexture.add(info.imageId);
		}

		if (materialInfo.textureReflection) {
			infos = materialInfo.textureReflection;
			info = infos[0] || infos;
			material.userData.imageIdsToAddAsTexture.add(info.imageId);
		}

		if (material.userData.imageIdsToAddAsTexture.size === 0) {
			delete material.userData.imageIdsToAddAsTexture;
		}

		texturesToLoad = this.updateTextureMaps(materialId);
		if (texturesToLoad.length > 0) {
			material.userData.imageIdsToLoad = new Set();

			for (var ti = 0; ti < texturesToLoad.length; ti++) {
				var textureInfo = texturesToLoad[ti];
				TotaraUtils.pushElementIntoMapArray(this._imageTextures, textureInfo.imageId, { textureType: textureInfo.textureType, materialId: materialId });
				material.userData.imageIdsToLoad.add(textureInfo.imageId);
			}
		}

		// replace material in mesh nodes
		var meshIds = this._materialMeshes.get(materialId);
		if (meshIds) {
			for (var mi = 0; mi < meshIds.length; mi++) {
				var meshId = meshIds[mi];
				var nodes = this._meshNodes.get(meshId);
				if (nodes) {
					for (var ni = 0; ni < nodes.length; ni++) {
						this._updateMaterial(nodes[ni], materialId, material);
					}
				}

				if (previousMaterial) {
					this._updateMeshSubmeshesMaterial(meshId, materialId, material);
				}
			}
		}

		if (previousMaterial) {
			ThreeUtils.disposeMaterial(previousMaterial);
		}

		return texturesToLoad;
	};

	/**
	 * Get three.js material
	 *
	 * @param {any} materialId The id of material
	 * @returns {THREE.Material} three.js material.
	 * @public
	 */
	SceneBuilder.prototype.getMaterial = function(materialId) {
		return this._getMaterialRef(materialId);
	};

	var uint8ArrayToString = function(uint8Array) {

		var finalString = "";
		try {
			// if uint8Array is too long, stack runs out in String.fromCharCode.apply
			// so batch it in certain size
			var CHUNK_SIZE = 0x8000; // arbitrary number here, not too small, not too big
			var index = 0;
			var length = uint8Array.length;
			var slice;
			while (index < length) {
				slice = uint8Array.slice(index, Math.min(index + CHUNK_SIZE, length)); // `Math.min` is not really necessary here I think
				finalString += String.fromCharCode.apply(null, slice);
				index += CHUNK_SIZE;
			}
		} catch (e) {
			finalString = "";
			// console.log(e);
		}
		return finalString;
	};

	/**
	 * Create a three.js image from image information
	 *
	 * @param {any} imageInfo The object of image information that have the following properties<br/>
	 *								  <code>id</code>: string, id of this image</br>
	 *								  <code>binaryData</code>: binary image data</br>
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.createImage = function(imageInfo) {

		if (imageInfo.binaryData.length < 32) {
			Log.warning("SceneBuilder.createImage()", "Can't create image from empty data");
			return this;
		}

		var dv = new DataView(imageInfo.binaryData.buffer);

		var isPng = true;
		// rest is image blob
		// check jpeg magic number
		if (dv.getUint8(0, true) === parseInt("0xFF", 16) &&
			dv.getUint8(1, true) === parseInt("0xD8", 16)) {
			// you must be jpg.
			isPng = false; // currently we only support jpg and png
		}

		var imageDataStr = uint8ArrayToString(imageInfo.binaryData);

		var dataUri = "data:image/" + (isPng ? "png" : "jpeg") + ";base64," + btoa(imageDataStr);

		this._images.set(imageInfo.id, dataUri);

		var textures = this._imageTextures.get(imageInfo.id);
		if (textures) {
			this._imageTextures.delete(imageInfo.id);
			for (var i = 0; i < textures.length; i++) {
				var texture = textures[i];
				this.updateTextureMap(texture.materialId, texture.textureType);
			}
		}

		return this;
	};

	var textureLoader = new THREE.TextureLoader();

	var TextureType = {
		Diffuse: 0,
		Bump: 1,
		Opacity: 2,
		Reflection: 3,
		Refraction: 4,
		Specular: 5,
		Ambient: 6,
		Emissive: 7,
		SpecularLevel: 8,
		Glossiness: 9,
		AmbientOcclusion: 10,
		Decal: 11
	};

	/**
	 * Update all textures defined in a material
	 *
	 * @param {any} materialId id of material
	 * @returns {any[]} Array of result objects, and each result contains two properties on a texture<br/>
	 * 						  <code>textureType</code>: type of texture to be updated<br/>
							  <code>imageId</code>: id of associated image that has not been created<br/>
	 * @public
	 */
	SceneBuilder.prototype.updateTextureMaps = function(materialId) {
		var result = [];

		var material = this._getMaterialRef(materialId);
		if (!material) {
			return result;
		}

		var materialInfo = material.userData.materialInfo;
		if (!materialInfo) {
			return result;
		}

		if (materialInfo.textureDiffuse) {
			var diffuseRes = this.updateTextureMap(materialId, TextureType.Diffuse);
			if (diffuseRes.imageId) {
				result.push(diffuseRes);
			}
		} else if (materialInfo.textureDecal) {
			var decalRes = this.updateTextureMap(materialId, TextureType.Decal);
			if (decalRes.imageId) {
				result.push(decalRes);
			}
		}

		if (materialInfo.textureBump) {
			var bumpRes = this.updateTextureMap(materialId, TextureType.Bump);
			if (bumpRes.imageId) {
				result.push(bumpRes);
			}
		}

		// if (materialInfo.textureOpacity) { // opacity texture is not supported by DVL
		// 	var opacityRes = this.updateTextureMap(materialId,  TextureType.Opacity);
		// 	if (opacityRes.imageId) {
		// 		result.push(opacityRes);
		// 	}
		// }

		if (materialInfo.textureEmissive) {
			var emissiveRes = this.updateTextureMap(materialId, TextureType.Emissive);
			if (emissiveRes.imageId) {
				material[material.emissive ? "emissive" : "color"].setRGB(1, 1, 1);
				result.push(emissiveRes);
			}
		}

		if (materialInfo.textureAmbientOcclusion) {
			var aoRes = this.updateTextureMap(materialId, TextureType.AmbientOcclusion);
			if (aoRes.imageId) {
				result.push(aoRes);
			}
		}

		if (materialInfo.textureReflection) {
			var reflectionRes = this.updateTextureMap(materialId, TextureType.Reflection);
			if (reflectionRes.imageId) {
				result.push(reflectionRes);
			}
		}

		return result;
	};

	/**
	 * Update a texture defined in a material
	 *
	 * @param {any} materialId id of material
	 * @param {any} type Texture type
	 * @returns {any[]} The result object contains two properties on the texture<br/>
	 * 						  <code>textureType</code>: type of texture to be updated<br/>
							  <code>imageId</code>: id of associated image that has not been created<br/>
	 * @public
	 */
	SceneBuilder.prototype.updateTextureMap = function(materialId, type) {
		var result = {
			textureType: type,
			imageId: null
		};

		var material = this._getMaterialRef(materialId);
		if (!material) {
			return result;
		}

		var materialInfo = material.userData.materialInfo;
		if (!materialInfo) {
			return result;
		}

		var infos = null;

		switch (type) {
			case TextureType.Diffuse:
				infos = materialInfo.textureDiffuse;
				break;

			case TextureType.Decal:
				infos = materialInfo.textureDecal;
				break;

			case TextureType.Bump:
				infos = materialInfo.textureBump;
				break;

			// case TextureType.Opacity: // opacity texture is not supported by DVL
			// 	infos = materialInfo.textureOpacity;
			// 	break;

			case TextureType.Reflection:
				infos = materialInfo.textureReflection;
				break;

			case TextureType.Emissive:
				infos = materialInfo.textureEmissive;
				break;

			case TextureType.AmbientOcclusion:
				infos = materialInfo.textureAmbientOcclusion;
				break;
			default:
				break;
		}

		if (!infos) {
			return result;
		}

		var info = infos[0] || infos;

		var imageDataUri = this._images.get(info.imageId);
		if (!imageDataUri) {
			result.imageId = info.imageId;
			return result;
		}

		if (material.userData.imageIdsToLoad) {
			material.userData.imageIdsToLoad.delete(info.imageId);
			if (material.userData.imageIdsToLoad.size === 0) {
				delete material.userData.imageIdsToLoad;
			}
		}

		if (material.userData.parametricType === "sphere") {
			// flip 360 background image
			info.uvHorizontalScale = -1;
		}

		var influence = info.influence !== undefined ? info.influence : 0;

		function updateMaterialTexture(m, texture) {
			switch (type) {
				case TextureType.Diffuse:
				case TextureType.Decal:
					// If map influence is 0 then color will not be changed but if influence is 1 then color will be white which means use 100% texture
					// Interpolate all intermediate values.
					// Turn off influence for diffuse map, needs further investigation
					// material.color.lerp(new THREE.Color(1.0, 1.0, 1.0), influence);

					m.map = texture;
					if (imageDataUri.startsWith("data:image/png")) {
						// assume it has alpha channel if it is png
						m.transparent = true;
					}
					break;

				case TextureType.Bump:
					m.bumpMap = texture;
					m.bumpScale = influence;
					break;

				case TextureType.Opacity:
					m.alphaMap = texture;
					break;

				case TextureType.Reflection:
					texture.mapping = THREE.EquirectangularReflectionMapping;
					m.envMap = texture;
					m.combine = THREE.AddOperation;
					m.reflectivity = influence;
					break;

				case TextureType.Emissive:
					m[m.emissiveMap !== undefined ? "emissiveMap" : "map"] = texture;
					if (m.isSphericalMapMaterial) {
						texture.minFilter = THREE.LinearFilter; // turn off mipmapping
					}
					break;

				case TextureType.AmbientOcclusion:
					m.aoMap = texture;
					break;

				default:
				// console.log("Not implemented map type " + type);
			}

			m.needsUpdate = true;
		}

		textureLoader.load(imageDataUri, function(texture) {
			texture.wrapS = info.uvHorizontalTilingEnabled ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
			texture.wrapT = info.uvVerticalTilingEnabled ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
			texture.magFilter = info.filterMode === 1 ? THREE.NearestFilter : THREE.LinearFilter;
			texture.minFilter = info.filterMode === 1 ? THREE.NearestFilter : THREE.LinearMipMapLinearFilter;
			texture.anisotropy = 4;

			var offsetS = info.uvHorizontalOffset || 0;
			var offsetT = info.uvVerticalOffset || 0;
			texture.repeat.set(info.uvHorizontalScale || 1, info.uvVerticalScale || 1);
			texture.center.set(-offsetS, -offsetT);
			texture.offset.set(offsetS, offsetT);
			texture.rotation = -info.uvRotationAngle;

			if (material.isMeshBasicMaterial) {
				// disable mipmaps to save GPU RAM and improve rendering speed of huge navigation backround maps
				// MeshBasicMaterial is used for 2D objects and navigation backgrounds
				texture.generateMipmaps = false;
				texture.minFilter = info.filterMode === 1 ? THREE.NearestFilter : THREE.LinearFilter;
			}

			updateMaterialTexture(material, texture);

			if (material.userData.imageIdsToAddAsTexture && info.imageId) {
				material.userData.imageIdsToAddAsTexture.delete(info.imageId);
				if (material.userData.imageIdsToAddAsTexture.size === 0) {
					delete material.userData.imageIdsToAddAsTexture;
				}
			}

			var materialClones = this._materialClones.get(materialId);
			if (materialClones) {
				materialClones.forEach(function(materialClone) {
					// console.log("update material clone", materialId, materialClone, material);
					updateMaterialTexture(materialClone, texture);
				});
			}

			this.fireImageAddedToMaterial({ materialId: materialId });
			if (this._fireSceneUpdated) {
				this._fireSceneUpdated();
			}
		}.bind(this));

		return result;
	};

	/**
	 * Insert playback data
	 *
	 * @param {any} playbackInfo The object of playback information that have the following properties<br/>
	 *								  <code>sequenceId</code>: string, id of corresponding sequence</br>
	 *								  <code>playbackSpeed</code>: float, corresponding to time scale in threejs AnimationAction</br>
	 *								  <code>playbackPreDelay</code>: float, time of delay before playing animation</br>
	 *								  <code>playbackPostDelay</code>: float, time of delay after playing animation</br>
	 *								  <code>playbackRepeat</code>: int, number of repeats of animation</br>
	 *								  <code>playbackReversed</code>: bool, if track should be reversed</br>
	 *
	 * @param {string} viewId Id of view to which playback belongs to
	 *
	 * @param {string} sceneId Id of scene
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertPlayback = function(playbackInfo, viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		var sequence = this._vkScene.findSequence(playbackInfo.sequenceId);
		var playback = new AnimationPlayback(playbackInfo.id, {
			sequence: sequence,
			timeScale: playbackInfo.speed ? 1.0 / playbackInfo.speed : 1,
			preDelay: playbackInfo.preDelay ? playbackInfo.preDelay : 0,
			postDelay: playbackInfo.postDelay ? playbackInfo.postDelay : 0,
			repeats: playbackInfo.repeat ? Math.abs(playbackInfo.repeat) : 0,
			reversed: playbackInfo.reversed ? true : false,
			startTime: playbackInfo.start ? playbackInfo.start : 0
		});
		var view = this._views.get(viewId);
		if (view) {
			view.addPlayback(playback);
		}

		if (!sequence) {
			TotaraUtils.pushElementIntoMapArray(this._sequenceIdToPlaybacks, playbackInfo.sequenceId, playback);
		}

		return this;
	};

	/**
	 * Insert sequence data
	 *
	 * @param {any} info The object of sequence information
	 * @param {string} sceneId Id of scene
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertSequence = function(info, sceneId) {
		var sequence = this._vkScene.findSequence(info.id);
		if (sequence) {
			this._vkScene.removeSequence(sequence);
		}

		var duration;
		if (info.endTime) {
			if (info.startTime) {
				duration = info.endTime - info.startTime;
			} else {
				duration = info.endTime;
			}
		} else {
			duration = 1.0;
		}

		sequence = this._vkScene.createSequence(info.id, {
			name: info.name,
			duration: duration
		});

		if (Array.isArray(info.joints)) {
			info.joints.forEach(function(index) {
				var joint = this._joints[index];
				if (joint) {
					sequence.setJoint(joint, true);
				}
			}, this);
		}

		if (info.nodes && info.nodes.length > 0) {
			for (var ni = 0; ni < info.nodes.length; ni++) {
				var track = info.nodes[ni];
				if (track.empty) {
					track.type = track.binding;
					var node = this._nodes.get(track.sid);
					this._animationHelper.insertEmptyTrack(track, sequence, node, this._vkScene);
					continue;
				}
				TotaraUtils.pushElementIntoMapArray(this._trackIdSequenceNodeMap, track.trackId,
					{ sequenceId: info.id, targetId: track.sid, type: track.binding, pivot: track.pivot, isAbsoluteValue: track.isAbsoluteValue });
			}
		}

		var playbacks = this._sequenceIdToPlaybacks.get(info.id);
		if (playbacks) {
			playbacks.forEach(function(playback) {
				playback.setSequence(sequence);
			});
		}

		return this;
	};

	/**
	 * Insert track data
	 *
	 * @param {any[]} tracks array of the object of track information
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertTracks = function(tracks) {

		this._animationHelper.insertTracks(tracks, this._trackIdSequenceNodeMap, this._nodes, this._vkScene);

		return this;
	};

	/**
	 * Insert joint data
	 *
	 * @param {any[]} joints array of the object of joint information
	 * @param {string} sceneId Id of scene
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertJoints = function(joints, sceneId) {
		this._resetCurrentScene(sceneId);

		this._joints = [];
		joints.forEach(function(joint) {
			var node = this._nodes.get(joint.childSid);
			var parent = this._nodes.get(joint.parentSid);

			var jointObject = {
				id: joint.id,
				node: node,
				parent: parent,
				translation: new Float32Array(joint.t ? joint.t : [0, 0, 0]),
				quaternion: new Float32Array(joint.q ? joint.q : [0, 0, 0, 1]),
				scale: new Float32Array(joint.s ? joint.s : [1, 1, 1])
			};


			if (!node) {
				var jointObjects = this._jointNodesMap.get(joint.childSid);
				if (!jointObjects) {
					jointObjects = [];
				}
				jointObjects.push(jointObject);
				this._jointNodesMap.set(joint.childSid, jointObjects);
			}
			if (!parent) {
				var jointObjectsForParent = this._jointParentsMap.get(joint.parentSid);
				if (!jointObjectsForParent) {
					jointObjectsForParent = [];
				}
				jointObjectsForParent.push(jointObject);
				this._jointParentsMap.set(joint.parentSid, jointObjectsForParent);
			}
			this._joints.push(jointObject);
		}, this);

		return this;
	};

	/**
	 * Finalize animation clip data, should be called after all track data have been read
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.finalizeAnimation = function() {
		var topNode = this._rootNode;
		if (topNode) {
			while (topNode.parent) {
				topNode = topNode.parent;
			}
			topNode.userData.tracks = this._tracks;
		}

		return this;
	};

	/**
	 * Finalize playback data, should be called after all track data have been read
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.finalizePlaybacks = function() {
		var topNode = this._rootNode;
		if (topNode) {
			while (topNode.parent) {
				topNode = topNode.parent;
			}
		} else {
			return this;
		}

		if (!topNode.userData.animationNodeOriginalData) {
			topNode.userData.animationNodeOriginalData = new Map();
		}

		var viewGroup;
		var values = this._viewGroups.entries();
		var next = values.next();

		while (!next.done) {
			viewGroup = next.value[1];
			next = values.next();
			var viewsInGroup = [];
			for (var vi = 0; vi < viewGroup.getViews().length; vi++) {
				if (viewGroup.getViews()[vi].id) {
					var view = this._views.get(viewGroup.getViews()[vi].id);
					if (view) {
						viewsInGroup.push(view);
					}
				}
			}
		}
		return this;
	};

	/**
	 * Finalize view group data, should be called after all views are read
	 *
	 * @param {string} sceneId Id of scene
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.finalizeViewGroups = function(sceneId) {
		this._resetCurrentScene(sceneId);

		var entries = this._viewGroups.entries();
		var next = entries.next();
		while (!next.done) {
			var viewGroup = next.value[1];
			var viewGroupId = next.value[0];
			if (!viewGroup || !viewGroup.views || !viewGroup.views.length) {
				next = entries.next();
				continue;
			}

			viewGroup.removeViews();
			for (var vi = 0; vi < viewGroup.views.length; vi++) {
				var viewId = viewGroup.views[vi].id;
				var view = this._views.get(viewId);
				if (view && view.userData.viewInfo.thumbnailId && !view.thumbnailData) {
					var imageData = this._images.get(view.userData.viewInfo.thumbnailId);
					if (imageData) {
						view.thumbnailData = imageData;
					}
				}
				if (view) {
					view.viewGroupId = viewGroupId;
					viewGroup.addView(view);
				}
			}
			next = entries.next();
		}
		return this;
	};

	/**
	 * Insert a view group
	 *
	 * @param {any} info view group information
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertViewGroup = function(info, sceneId) {
		this._resetCurrentScene(sceneId);

		var viewGroup = this._viewGroups.get(info.id);

		if (!viewGroup) {
			viewGroup = this._vkScene.createViewGroup({
				viewGroupId: info.id,
				name: info.name,
				description: info.description
			});
			this._viewGroups.set(info.id, viewGroup);
		} else {
			viewGroup.setViewGroupId(info.id);
			viewGroup.setName(info.name);
			viewGroup.setDescription(info.description);
		}

		viewGroup.type = info.type;
		viewGroup.metadata = info.metadata;
		viewGroup.veids = info.veids;
		viewGroup.views = info.views;
		viewGroup.sceneId = info.sceneId;

		return this;
	};

	/**
	 * get a view group - array of views
	 *
	 * @param {any} viewGroupId view group information
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {sap.ui.vk.view[]} array of views.
	 * @public
	 */
	SceneBuilder.prototype.getViewGroup = function(viewGroupId, sceneId) {
		this._resetCurrentScene(sceneId);
		var viewGroup = this._viewGroups.get(viewGroupId);
		var views = [];
		if (viewGroup && viewGroup.views) {
			for (var vi = 0; vi < viewGroup.views.length; vi++) {
				var viewId = viewGroup.views[vi].id;
				var view = this._views.get(viewId);
				if (view) {
					views.push(view);
				}
			}
		}

		return views;
	};

	var NavigationModes = {
		turntable: NavigationMode.Turntable,
		orbit: NavigationMode.Orbit,
		pan: NavigationMode.Pan,
		zoom: NavigationMode.Zoom
	};

	/**
	 * Insert a view
	 *
	 * @param {any} viewInfo View information
	 * @param {any} sceneId The scene identifier
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertView = function(viewInfo, sceneId) {
		this._resetCurrentScene(sceneId);

		var description = viewInfo.description;

		if (description) {
			// matches <> tag at start of description
			var reg = new RegExp("^<[^>]*?>");
			if (reg.test(description)) {
				// matches all <> tags at start and end of description
				var reg2 = new RegExp("(^(<[^>]*?>\s*)+)|((<[^>]*?>\s*)+$)", "g");
				var temporaryDescription = description.replace(reg2, "");
				if (!temporaryDescription) {
					description = temporaryDescription;
				}
			}
			// Currently this is plain text so we preserve its formatting (line breaks).
			description = "<pre class=\"sapVizKitViewGalleryStepDescriptionPre\">" + description + "</pre>";
		}

		var view = this._views.get(viewInfo.viewId);

		if (view == null) {
			view = this._vkScene.createView({
				viewId: viewInfo.viewId,
				name: viewInfo.name,
				description: description,
				aspectRatio: viewInfo.safeAreaAspectRatio,
				autoPlayAnimation: viewInfo.autoPlayAnimation,
				navigationMode: NavigationModes[viewInfo.navigationMode] || NavigationMode.NoChange,
				dimension: viewInfo.dimension || 3
			});
			this._views.set(viewInfo.viewId, view);
		} else {
			view.removePlaybacks(true);
			view.setName(viewInfo.name);
			view.setDescription(description);
			view.setAspectRatio(viewInfo.safeAreaAspectRatio);
			view.setAutoPlayAnimation(viewInfo.autoPlayAnimation);
			view.setNavigationMode(NavigationModes[viewInfo.navigationMode] || NavigationMode.NoChange);
			view.setDimension(viewInfo.dimension || 3);
		}

		view.userData = {};
		view.userData.viewInfo = viewInfo;

		if (viewInfo.thumbnailId) {
			var imageData = this._images.get(viewInfo.thumbnailId);
			if (imageData) {
				view.thumbnailData = imageData;
			} else {
				this._viewThumbnails.set(viewInfo.thumbnailId, view);
			}
		}

		if (viewInfo.animatedThumbnailId) {
			var imageData2 = this._images.get(viewInfo.animatedThumbnailId);
			if (imageData2) {
				view.animatedThumbnailData = imageData2;
				view.tileWidth = this._imageIdsAndTileWidths.get(viewInfo.animatedThumbnailId);
			}
		}
		if (viewInfo.cameraId) {
			view.setCamera(this._cameras.get(viewInfo.cameraId));
		}
		view.type = viewInfo.type;
		view.flyToTime = viewInfo.flyToTime;
		view.preDelay = viewInfo.preDelay;
		view.postDelay = viewInfo.postDelay;
		view.navigationMode = viewInfo.navigationMode;

		// Background color handling, will convert everything to CSSColor object
		var topColor = this._getSavedColor(viewInfo.topColour, localStorage.getItem("color.backgroundTop"));
		if (topColor != null) {
			view.setTopColor(topColor);
		}

		var bottomColor = this._getSavedColor(viewInfo.bottomColour, localStorage.getItem("color.backgroundBottom"));
		if (bottomColor != null) {
			view.setBottomColor(bottomColor);
		}

		view.renderMode = renderModes[viewInfo.renderMethod];
		view.dimension = viewInfo.dimension;
		view.query = viewInfo.query;
		view.metadata = viewInfo.metadata;
		view.veids = viewInfo.veids;

		view.viewGroupId = viewInfo.viewGroupId;
		view.id = viewInfo.viewId;

		if (view.viewGroupId) {
			var viewGroup = this._viewGroups.get(view.viewGroupId);
			if (viewGroup) {
				var index = viewGroup.indexOfView(view);
				if (index < 0) {
					viewGroup.addView(view);
				}
			}
		}
		return this;
	};

	SceneBuilder.prototype.setModelViewVisibilitySet = function(info) {
		var view = this._views.get(info.viewId);
		var visibleNodes = new Set();
		var visibleNodeInfos = [];
		info.visibleNodes.forEach(function(nodeRef) {
			var node = this._nodes.get(nodeRef);
			if (node) {
				visibleNodes.add(node);
				visibleNodeInfos.push({
					target: node,
					visible: true
				});
			} else {
				Log.warning("Unknown modelView visible node reference", nodeRef);
			}
		}, this);

		// set the ancestors of visible nodes as visible (fix VDS4 non-recursive visibility info)
		Array.from(visibleNodes).forEach(function(node) {
			node = node.parent;
			while (node && !visibleNodes.has(node)) {
				visibleNodes.add(node);
				visibleNodeInfos.push({
					target: node,
					visible: true
				});
				node = node.parent;
			}
		});

		if (view) {
			view.updateNodeInfos(visibleNodeInfos);
		}
	};

	/**
	 * Record a highlighted node
	 *
	 * @param {any} highlightStyleId id of highlight style
	 * @param {any} nodeId id of node
	 * @param {any} viewId id of view
	 * @param {any} sceneId The scene identifier
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.recordHighlightedNodeInView = function(highlightStyleId, nodeId, viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		var view = this._views.get(viewId);
		if (!view) {
			return this;
		}

		var node = this._nodes.get(nodeId);
		if (!node) {
			return this;
		}
		view.addHighlightedNodes(highlightStyleId, node);

		return this;
	};

	/**
	 * Insert highlight styles
	 *
	 * @param {any} info information of the highlight style
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertHighlightStyle = function(info) {
		var highlightStyle = this._vkScene.getHighlight(info.id);

		if (highlightStyle) {
			return this;
		}

		if (info.duration > 0) {
			if (info.colours && info.colours.length === 1 && (!info.opacities || info.opacities.length === 1)) {
				// When a highlight has a duration but only a single color and single / no opacity,
				// assume color highlight flashing, so insert a second color with same RGB components
				// but Alpha == 0 to make the flashing cycle work.
				var color = info.colours[0];
				info.colours.push([color[0], color[1], color[2], 0]);
			} else if (!info.colours && info.opacities && info.opacities.length === 1) {
				// When a highlight has a duration but only a single opacity and no color,
				// assume opacity flashing, so insert a second opacity value of 0 to make the flashing cycle work.
				info.opacities.push(0);
			}
		}

		this._vkScene.createHighlight(info.id, info);

		return this;
	};

	SceneBuilder.prototype.insertModelViewHighlight = function(info) {
		var view = this._views.get(info.viewId);
		if (view) {
			var highlightNodes = [];
			info.highlightNodes.forEach(function(nodeId) {
				var node = this._nodes.get(nodeId);
				if (node) {
					highlightNodes.push(node);
				} else {
					// console.warn("Unknown node reference", nodeRef, this._nodes);
				}
			}, this);

			var highlight = {
				duration: info.duration,
				cycles: info.cycles
			};

			if (!info.id) {
				info.id = THREE.MathUtils.generateUUID().toLowerCase();
			}

			var color1 = new THREE.Color(info.color1).toArray();
			var color2 = new THREE.Color(info.color2).toArray();
			color1[3] = ((info.color1 >>> 24) & 255) / 255; // highlighting intensity
			color2[3] = ((info.color2 >>> 24) & 255) / 255; // highlighting intensity
			highlight.colours = [color1, color2];
			highlight.opacities = [info.opacity1, info.opacity2];
			this._vkScene.createHighlight(info.id, highlight);
			view.addHighlightedNodes(info.id, highlightNodes);
		}
	};

	SceneBuilder.prototype.createThumbnail = function(info) {
		var view = this._viewThumbnails.get(info.imageId);
		if (view) {
			view.thumbnailData = "data:image/" + "jpeg" + ";base64," + window.btoa(String.fromCharCode.apply(null, info.data));
			if (this._fireThumbnailLoaded) {
				this._fireThumbnailLoaded({ modelView: view });
			}
		}
	};

	/**
	 * Insert highlight styles
	 *
	 * @param {any} id id of the highlight style
	 *
	 * @returns {boolean} true if exists
	 * @public
	 */
	SceneBuilder.prototype.highlightStyleExists = function(id) {
		var highlightStyle = this._vkScene.getHighlight(id);
		return highlightStyle !== undefined;
	};

	/**
	 * Get a view
	 *
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene
	 * @returns {sap.ui.vk.View} View
	 * @public
	 */
	SceneBuilder.prototype.getView = function(viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		return this._views.get(viewId);
	};

	/**
	 * Get a sequence
	 *
	 * @param {any} sequenceId The id of sequence
	 * @returns {sap.ui.vk.AnimationSequence} View
	 * @public
	 */
	SceneBuilder.prototype.getSequence = function(sequenceId) {
		return this._vkScene.findSequence(sequenceId);
	};

	/**
	 * Add a camera to a view
	 *
	 * @param {any} cameraId The id of camera
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setViewCamera = function(cameraId, viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		var camera = this._cameras.get(cameraId);
		var view = this._views.get(viewId);

		if (camera && view) {
			view.setCamera(camera);
		}

		return this;
	};

	/**
	 * Add an array of node infos to a view
	 *
	 * @param {any} nodeInfos array of node info
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setViewNodeInfos = function(nodeInfos, viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		var view = this._views.get(viewId);
		view.setNodeInfos(nodeInfos);

		return this;
	};

	/**
	 * Add thumbnail image data to view
	 *
	 * @param {any} imageId The id of image data
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene containing the node
	 * @param {any} tileWidth The width of each individual frame of an animated thumbnail
	 * @returns {sap.ui.vk.view} View
	 * @public
	 */
	SceneBuilder.prototype.setViewThumbnail = function(imageId, viewId, sceneId, tileWidth) {
		this._resetCurrentScene(sceneId);
		var view = this._views.get(viewId);
		var imageData = this._images.get(imageId);
		if (tileWidth) {
			this._imageIdsAndTileWidths.set(imageId, tileWidth);
		}
		if (view && imageData) {
			if (view.userData !== undefined) {
				if (view.userData.viewInfo.thumbnailId === imageId) {
					view.thumbnailData = imageData;
				} else if (view.userData.viewInfo.animatedThumbnailId === imageId) {
					view.animatedThumbnailData = imageData;
					view.tileWidth = tileWidth;
				}
			}
		}
		return this;
	};

	/**
	 * Clear all data stored in SceneBuilder
	 *
	 * @public
	 */
	SceneBuilder.prototype.cleanup = function() {
		this._rootNode = null;
		this._currentSceneId = null;
		this._contentResource = null;
		this._resolve = null;
		this._reject = null;

		if (this._vkScene) {
			this._vkScene.clearMaterials();
		}

		this._callouts.forEach(function(cl) {
			cl.destroy();
		});
		this._callouts.clear();

		this._cameras.forEach(function(c) {
			if (!c instanceof THREE.Camera) {
				c.destroy();
			}
		});
		this._cameras.clear();
		this._images.clear();
		this._imageIdsAndTileWidths.clear();
		this._imageTextures.clear();
		this._geometries.clear();
		this._meshNodes.clear();
		this._meshSubmeshes.clear();
		this._geometryMeshes.clear();
		this._materialMeshes.clear();
		this._geometryMaterials.clear();
		this._materialClones.clear();
		this._joints = [];
		this._imageAddedToMaterialHandlers = [];
		this._isSmallScene = null;

		if (this._nodes) {
			this._nodes.clear();
		}

		if (this._tracks) {
			this._tracks.clear();
		}
		if (this._trackIdSequenceNodeMap) {
			this._trackIdSequenceNodeMap.clear();
		}
		if (this._viewGroups) {
			this._viewGroups.clear();
		}
		if (this._views) {
			this._views.clear();
		}

		this._sceneIdTreeNodesMap.clear();
		this._sceneIdRootNodeMap.clear();

		this._viewThumbnails.clear();
		this._thrustlines.clear();

		this._animations.clear();
		this._animationTracks.clear();

		this._jointNodesMap.clear();
		this._jointParentsMap.clear();
	};

	// The codes below are for reading animation data from vds file (matai.js), which is not incorporated with the existing codes for animation,
	// as we are in process of re-developing animation
	SceneBuilder.prototype.insertAnimationGroup = function(info) {

		var animationSequence = this._vkScene.findSequence(info.animationGroupRef.toString());
		if (!animationSequence) {
			var duration;
			if (info.endTime) {
				duration = info.endTime - info.startTime;
				if (!info.startTime) {
					info.startTime = 0;
				}
			}
			animationSequence = this._vkScene.createSequence(info.animationGroupRef.toString(), {
				name: info.name,
				duration: duration
			});
			if (!animationSequence.userData) {
				animationSequence.userData = {};
			}
			animationSequence.userData.animations = [];
		}

		if (info.modelViewRef) {
			var modelView = this._views.get(info.modelViewRef);
			if (modelView) {
				var sequence = this._vkScene.findSequence(info.animationGroupRef.toString());
				var playback = new AnimationPlayback({
					sequence: sequence,
					timeScale: info.playbackSpeed ? 1.0 / info.playbackSpeed : 1,
					preDelay: info.playbackPreDelay ? info.playbackPreDelay : 0,
					postDelay: info.playbackPostDelay ? info.playbackPostDelay : 0,
					repeat: info.playbackRepeat ? Math.abs(info.playbackRepeat) : 0,
					reversed: info.playbackReversed ? true : false,
					startTime: 0
				});

				modelView.addPlayback(playback);
			}
		}
	};

	SceneBuilder.prototype.insertAnimation = function(info) {
		var animation = this._animations.get(info.animationRef);
		if (!animation) {
			animation = {};
			animation.type = info.animationType;
			animation.targetRefs = [];
			animation.targetPivots = [];
			animation.sequenceId = info.animationGroupRef.toString();
			animation.trackIds = new Set();
			animation.tracks = [];
			this._animations.set(info.animationRef, animation);
		}

		if (info.animationGroupRef) {
			var animationSequence = this._vkScene.findSequence(info.animationGroupRef.toString());
			if (!animationSequence.userData.animations.includes(info.animationRef)) {
				animationSequence.userData.animations.push(info.animationRef);
			}
		}
	};

	SceneBuilder.prototype.insertAnimationTarget = function(info) {
		var animation = this._animations.get(info.animationRef);
		if (animation) {
			if (!animation.targetRefs.includes(info.targetRef)) {
				animation.targetRefs.push(info.targetRef);
				animation.targetPivots.push({ x: info.targetPivotX, y: info.targetPivotY, z: info.targetPivotZ });
			}
		}
	};

	SceneBuilder.prototype.insertAnimationTrack = function(info) {
		var animationTrack = this._animationTracks.get(info.animationTrackRef);
		var animationRef = info.animationRef;
		if (!animationTrack) {
			delete info.animationRef;
			animationTrack = info;
			this._animationTracks.set(info.animationTrackRef, animationTrack);
		}

		if (!animationRef) {
			return;
		}

		var animation = this._animations.get(animationRef);
		if (!animation || !animation.sequenceId) {
			return;
		}

		if (animation.trackIds.has(animationTrack.animationTrackRef)) {
			return;
		}

		animation.trackIds.add(animationTrack.animationTrackRef);

		for (var ti = 0; animation.targetRefs && ti < animation.targetRefs.length; ti++) {
			var targetRef = animation.targetRefs[ti];
			var targetPivot = animation.targetPivots[ti];
			var node = this._nodes.get(targetRef);
			if (!node) {
				continue;
			}

			var pivot;
			if (targetPivot.x !== 0 || targetPivot.y !== 0 || targetPivot.z !== 0) {
				pivot = [targetPivot.x, targetPivot.y, targetPivot.z];
			}

			var type = ["OPACITY", "COLOUR", "TRANSLATE", "SCALE", "ROTATE"][animationTrack.type] || "";

			TotaraUtils.pushElementIntoMapArray(this._trackIdSequenceNodeMap, info.animationTrackRef,
				{ sequenceId: animation.sequenceId, targetId: targetRef, type: type, pivot: pivot, isAbsoluteValue: true });

			var track = {};
			track.times = Array.prototype.slice.call(animationTrack.times);
			track.values = Array.prototype.slice.call(animationTrack.values);
			track.id = info.animationTrackRef;
			track.cyclicInfo = {};
			track.cyclicInfo.cyclicStart = animationTrack.cyclicStart;
			track.cyclicInfo.cyclicEnd = animationTrack.cyclicEnd;

			var ki;

			if (animation.type === 0) {
				if (animationTrack.dataType === 0) { // scalar
					if (animationTrack.values.length !== animationTrack.keyCount ||
						animationTrack.times.length !== animationTrack.keyCount) {
						continue;
					}
					if (animationTrack.type === 3) {// scale
						track.values = [];
						for (ki = 0; ki < animationTrack.keyCount; ki++) {
							track.values.push(animationTrack.values[ki]);
							track.values.push(animationTrack.values[ki]);
							track.values.push(animationTrack.values[ki]);
						}
					}
				} else if (animationTrack.dataType === 1 || animationTrack.dataType === 3) {

					if (animationTrack.values.length !== 3 * animationTrack.keyCount ||
						animationTrack.times.length !== animationTrack.keyCount) {
						continue;
					}

				} else if (animationTrack.dataType === 4 || animationTrack.dataType === 5 || animationTrack.dataType === 6) {

					if (animationTrack.values.length !== 4 * animationTrack.keyCount ||
						animationTrack.times.length !== animationTrack.keyCount) {
						continue;
					}

					if (animationTrack.dataType === 4) {
						track.rotateType = AnimationRotateType.AngleAxis;
					} else if (animationTrack.dataType === 6) {
						track.rotateType = AnimationRotateType.Euler;
					} else {
						track.rotateType = AnimationRotateType.Quaternion;
						// to be consistent with quaternion defined in three.js
						for (var vi = 3; vi < track.values.length; vi = vi + 4) {
							track.values[vi] = -track.values[vi];
						}
					}
				}
			}

			animation.tracks.push(track);
		}
	};

	SceneBuilder.prototype.setAnimationTracks = function(animationRef) {
		var animation = this._animations.get(animationRef);
		if (animation) {
			this._animationHelper.insertTracks(animation.tracks, this._trackIdSequenceNodeMap, this._nodes, this._vkScene);
		}
	};

	SceneBuilder.prototype.setAnimationPlaybacks = function(info) {

		var viewGroup = this._viewGroups.get(info.viewGroupId);


		this._animationHelper.setInitialNodePositionsFromSubsequentViews(viewGroup.getViews(), this._vkScene);

		this._animationHelper.setInitialNodePositionsFromPreviousViews(viewGroup.getViews(), this._vkScene);

		this._animationHelper.setInitialNodePositionsFromCurrenetViews(viewGroup.getViews(), this._vkScene);

		this._animationHelper.setPlaybackStartTimes(viewGroup.getViews(), this._vkScene);

		this._animationHelper.buildViewsInitialState(viewGroup.getViews(), this._vkScene);
	};

	SceneBuilder.prototype.getSphere = function(node, parametricContent, material) {
		var parametricSphere = ParametricGenerators.generateSphere(parametricContent, material);
		if (node.userData && node.userData.nodeContentType) {
			parametricSphere.userData.nodeContentType = node.userData.nodeContentType;
		}
		parametricSphere.userData.skipIt = true;
		parametricSphere.renderOrder = node.renderOrder;
		node.add(parametricSphere);
	};

	SceneBuilder.prototype.getPlane = function(node, parametricContent, material) {
		var parametricRect = ParametricGenerators.generatePlane(parametricContent, material);
		if (node.userData && node.userData.nodeContentType) {
			parametricRect.userData.nodeContentType = node.userData.nodeContentType;
		}
		parametricRect.userData.skipIt = true;
		parametricRect.renderOrder = node.renderOrder;
		node.add(parametricRect);
	};

	/**
	 * If node has both mesh and parametric definitions this method will tell which one to use.
	 * @returns {boolean} true if meshes are preferred over parametric definition
	 * @public
	 */
	SceneBuilder.prototype.preferMeshes = function() {
		return true;
	};

	/**
	 * Set parametric content to scene node
	 * @param {string} nodeId Identifier of the node which will have parametric content assigned
	 * @param {any} parametricContent  The object with parametric content with the following properties<br/>
	 * 									<code>id</code>: string, id of this object<br/>
	 * 									<code>type</code>: string, type of this object<br/>
	 * @param {any} sceneId The scene identifier
	 * @public
	 */
	SceneBuilder.prototype.setParametricContent = function(nodeId, parametricContent, sceneId) {
		this._resetCurrentScene(sceneId);

		var setParametricType = {
			"sphere": this.getSphere.bind(this),
			"plane": this.getPlane.bind(this)
		};

		if (parametricContent.type in setParametricType === false) {
			Log.warning("Attempt to load unknown parametric type: " + parametricContent.type);
			return;
		}

		var parametricType = parametricContent.type;
		var node = this.getNode(nodeId, this.sceneId);
		var materialId = parametricContent.materialID;
		var material = null;
		if (materialId) {
			material = this._getMaterialRef(materialId) || this._createTemporaryMaterial(materialId);
			if (node.userData.parametricVisible) {
				material.userData.parametricType = parametricType;
			}
		}

		setParametricType[parametricType](node, parametricContent, material);
	};

	/**
	 * Load fill style
	 * @param {any} fillStyle Objects with veid and fill colour
	 * @public
	 */
	SceneBuilder.prototype.insertFillStyle = function(fillStyle) {
		// Empty implementation
	};

	/**
	 * Load line style
	 * @param {any} lineStyle Objects with veid, line colour and dash pattern
	 * @public
	 */
	SceneBuilder.prototype.insertLineStyle = function(lineStyle) {
		// Empty implementation
	};

	/**
	 * Load text style
	 * @param {any} textStyle Objects with veid, font family and font size
	 * @public
	 */
	SceneBuilder.prototype.insertTextStyle = function(textStyle) {
		// Empty implementation
	};

	SceneBuilder.prototype._getSavedColor = function(viewInfoColor, settingColor) {
		if (viewInfoColor && viewInfoColor.length > 2) {
			return colorToCSSColor({
				red: Math.floor(viewInfoColor[0] * 255),
				green: Math.floor(viewInfoColor[1] * 255),
				blue: Math.floor(viewInfoColor[2] * 255),
				alpha: viewInfoColor.length > 3 ? viewInfoColor[3] : 1
			});
		} else if (settingColor) {
			return settingColor;
		}
		return undefined;
	};

	return SceneBuilder;
});
