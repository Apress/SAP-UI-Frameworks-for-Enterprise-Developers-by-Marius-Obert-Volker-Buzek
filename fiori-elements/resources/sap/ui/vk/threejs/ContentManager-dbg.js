/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.threejs.ContentManager.
sap.ui.define([
	"jquery.sap.script",
	"sap/base/Log",
	"../thirdparty/three",
	"../ContentManager",
	"./Scene",
	"../TransformationMatrix",
	"./PerspectiveCamera",
	"./OrthographicCamera",
	"../Messages",
	"../getResourceBundle",
	"./ContentDeliveryService",
	"./ThreeUtils",
	// The following modules are pulled in to avoid their synchronous loading in
	// `sap.ui.vk.Viewport` and `sap.ui.vk.ViewStateManager`. They go last in this list
	// to avoid declaration of unused parameters in the callback.
	"./Viewport",
	"./ViewStateManager"
], function(
	jQuery,
	Log,
	THREE,
	ContentManagerBase,
	Scene,
	TransformationMatrix,
	PerspectiveCamera,
	OrthographicCamera,
	Messages,
	getResourceBundle,
	ContentDeliveryService,
	ThreeUtils
) {
	"use strict";

	// When the hierarchy of content resources changes we need to find what was changed.
	// The ShadowResource class is used to keep the original information of content resources.
	// We cannot keep references to the ContentResource objects because they can be rebuilt any time due
	// to data binding. The lifetime of objects of this class is controlled by the ContentManager, so
	// content resource object can have reference to shadow resource.
	var ShadowContentResource = function(contentResource) {
		Object.defineProperties(this, {
			source: {
				value: contentResource.getSource()
			},
			sourceType: {
				value: contentResource.getSourceType()
			},
			sourceId: {
				value: null,
				writable: true
			},
			name: {
				value: null,
				writable: true
			},
			localMatrix: {
				value: null,
				writable: true
			},
			children: {
				value: []
			},
			nodeProxy: {
				value: null,
				writable: true
			},
			loader: {
				value: null,
				writable: true
			},
			builder: {
				value: null,
				writable: true
			}
		});
		contentResource._shadowContentResource = this;
	};

	/**
	 * Constructor for a new ContentManager.
	 *
	 * @class
	 * Provides a content manager object that uses the three.js library to load 3D files.
	 *
	 * When registering a content manager resolver with {@link sap.ui.vk.ContentConnector.addContentManagerResolver sap.ui.vk.ContentConnector.addContentManagerResolver}
	 * you can pass a function that will load a model and merge it into the three.js scene.
	 *
	 * The loader function takes two parameters:
	 * <ul>
	 *   <li>parentNode - {@link https://threejs.org/docs/index.html#api/objects/Group THREE.Group} - a grouping node to merge the content into</li>
	 *   <li>contentResource - {@link sap.ui.vk.ContentResource sap.ui.vk.ContentResource} - a content resource to load</li>
	 * </ul>
	 * The loader function returns a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise}
	 * object. If the loading the model succeeds the promise object resolves with a value with the following structure:
	 * <ul>
	 *   <li>node - {@link https://threejs.org/docs/index.html#api/objects/Group THREE.Group} - the grouping node to which the content
	 *       is merged into. It should be the <code>parentNode</code> parameter that was passed to the loader function.</li>
	 *   <li>contentResource - {@link sap.ui.vk.ContentResource sap.ui.vk.ContentResource} - the content resource that was loaded.</li>
	 * </ul>
	 *
	 * @see {@link sap.ui.vk.ContentConnector.addContentManagerResolver sap.ui.vk.ContentConnector.addContentManagerResolver} for an example.
	 *
	 * @param {string} [sId] ID for the new ContentManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ContentManager object.
	 * @protected
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.ContentManager
	 * @alias sap.ui.vk.threejs.ContentManager
	 * @since 1.50.0
	 */
	var ContentManager = ContentManagerBase.extend("sap.ui.vk.threejs.ContentManager", /** @lends sap.ui.vk.threejs.ContentManager.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = ContentManager.getMetadata().getParent().getClass().prototype;

	ContentManager.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._shadowContentResources = [];
	};

	ContentManager.prototype.exit = function() {
		if (this.defaultCdsLoader) {
			this.defaultCdsLoader.destroy();
			this.defaultCdsLoader = null;
		}

		if (this.defaultMataiLoader) {
			this.defaultMataiLoader.destroy();
			this.defaultMataiLoader = null;
		}

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}

		this._shadowContentResources = null;
	};

	ContentManager.prototype._handleContentChangesProgress = function(event) {
		this.fireContentChangesProgress({
			phase: event.getParameter("phase"),
			source: event.getParameter("source"),
			percentage: event.getParameter("percentage")
		});
	};

	ContentManager.prototype._handleContentLoadingFinished = function(event) {
		this.fireContentLoadingFinished({
			source: event.getParameter("source"),
			node: event.getParameter("node")
		});
	};

	function setCastShadow(object) {
		if (object && object.isMesh) {
			object.castShadow = true;
			object.receiveShadow = false;
		}
		if (object && object.children) {
			for (var ni = 0; ni < object.children.length; ni++) {
				setCastShadow(object.children[ni]);
			}
		}
	}

	function initLights(nativeScene, castShadow) {
		// temp measure to add light automatically. remove this later
		if (nativeScene) {
			var lightGroup = new THREE.Group();
			nativeScene.add(lightGroup);
			lightGroup.name = "DefaultLights";
			lightGroup.private = true;

			var bbox = new THREE.Box3().setFromObject(nativeScene);
			var size = bbox.getSize(new THREE.Vector3());
			var center = bbox.getCenter(new THREE.Vector3());
			var maxSize = size.length();

			var pointLight = new THREE.PointLight();
			pointLight.color.setRGB(0.72, 0.72, 0.81);
			pointLight.visible = true;
			pointLight.private = true;
			lightGroup.add(pointLight);

			var lightColors = [
				new THREE.Color(0.2, 0.2, 0.2),
				new THREE.Color(0.32, 0.32, 0.36),
				new THREE.Color(0.36, 0.36, 0.36)];
			var lightDirs = [
				new THREE.Vector3(2.0, -0.5, -1.5), // -2.0f, -1.5f, -0.5f
				new THREE.Vector3(-2.0, -2.5, 1.1), // 2.0f, 1.1f, -2.5f
				new THREE.Vector3(-0.04, 2.0, 0.01)]; // 0.04f, 0.01f, 2.0f

			for (var l = 0, lMax = lightColors.length; l < lMax; l++) {
				var directionalLight = new THREE.DirectionalLight();
				directionalLight.color.copy(lightColors[l]);
				directionalLight.position.copy(lightDirs[l]);
				directionalLight.private = true;
				directionalLight.updateWorldMatrix(false, false);
				lightGroup.add(directionalLight);
			}

			if (castShadow) {
				setCastShadow(nativeScene);
				var topLight = new THREE.DirectionalLight();

				topLight.color.setRGB(0.5, 0.5, 0.5);
				topLight.position.set(0, 1, 0);

				topLight.castShadow = true;
				topLight.shadow.mapSize.width = 512;
				topLight.shadow.mapSize.height = 512;

				var d = 2000;
				topLight.shadow.camera.left = -d;
				topLight.shadow.camera.right = d;
				topLight.shadow.camera.top = d;
				topLight.shadow.camera.bottom = -d;

				topLight.shadow.camera.far = 3500;

				topLight.shadow.bias = -0.0001;
				topLight.private = true;
				lightGroup.add(topLight);

				// GROUND
				var groundGeo = new THREE.PlaneGeometry(size.x, size.z);
				var groundMat = new THREE.ShadowMaterial();
				groundMat.opacity = 0.2;
				var ground = new THREE.Mesh(groundGeo, groundMat);
				ground.rotation.x = -Math.PI / 2;
				ground.position.x = center.x;
				ground.position.y = bbox.min.y - maxSize * 0.1;
				ground.position.z = center.z;

				nativeScene.add(ground);
				ground.receiveShadow = true;
			}
		}
	}

	/**
	 * Starts downloading and building or updating the content from the content resources.
	 *
	 * This method is asynchronous.
	 *
	 * @param {any}                         content          The current content to update. It can be <code>null</code> if this is an initial loading call.
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to load or update.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */
	ContentManager.prototype.loadContent = function(content, contentResources) {
		this.fireContentChangesStarted();
		var scene = content || new Scene(new THREE.Scene()); // use existing content or create new one
		var that = this;

		this._loadContentResources(scene, contentResources).then(
			function(values) { // onFulfilled
				Log.info("Content loading resolved");
				if (values) {
					for (var i = 0; i < values.length; ++i) {
						// pick up first initial view if not assigned already
						if (!scene.getInitialView() && values[i].initialView) {
							scene.setInitialView(values[i].initialView);
						}
						// pick up first camera if not assigned already
						scene.camera = scene.camera || values[i].camera;
						// Add loader/builder information to content to show who loaded it, if specified by the loader
						// This is useful if the loader is not something app writer registered.
						// For example, we need to do some extra stuff if the loader is content delivery service loader.
						// Add loader/builder information to shadowContentResource to cleanup things properly in case of partial tree restructure
						var shadow = values[i].contentResource ? values[i].contentResource._shadowContentResource : null;

						if (values[i].loader) {
							if (shadow) {
								shadow.loader = values[i].loader;
							}
							scene.loaders = scene.loaders || [];
							scene.loaders.push(values[i].loader);
						}
						if (values[i].builder) {
							if (shadow) {
								shadow.builder = values[i].builder;
							}
							scene.builders = scene.builders || [];
							scene.builders.push(values[i].builder);
						}
					}
					// use other parameters from first resolved content
					if (values.length > 0) {
						var value = values[0];
						scene.backgroundTopColor = value.backgroundTopColor; // hex color or undefined
						scene.backgroundBottomColor = value.backgroundBottomColor; // hex color or undefined
						scene.renderMode = value.renderMode; // sap.ui.vk.RenderMode or undefined
						scene.upAxis = value.upAxis; // (0 = +X, 1 = -X, 2 = +Y, 3 = -Y, 4 = +Z, 5 = -Z)
					}
				}

				// update world matrices for nodes after scene restructure
				scene.getSceneRef().updateMatrixWorld();

				// init lights only once, when new native scene gets created
				if (!content) {
					initLights(scene.getSceneRef(), false);
				}

				if (scene.loaders) {
					that._initSceneWithCDSLoaderIfExists(scene, scene.loaders);
				}

				that.fireContentChangesFinished({
					content: scene
				});
			},
			function(reason) { // onRejected
				Log.info("Content loading rejected:", reason);
				var errMsg;
				if (typeof reason === "string") {
					errMsg = reason;
				} else if (reason.errorText) {
					errMsg = reason.errorText;
				} else if (reason.message) {
					errMsg = reason.message;
				}
				errMsg = errMsg || getResourceBundle().getText(Messages.VIT37.summary);
				Log.error(getResourceBundle().getText("CONTENTMANAGER_MSG_CONTENTRESOURCESFAILEDTOLOAD"), errMsg);
				that.fireContentChangesFinished({
					content: null,
					failureReason: [
						{
							error: reason,
							errorMessage: errMsg
						}
					]
				});
			});

		return this;
	};

	ContentManager.prototype._findLoader = function(contentResource) {
		if (contentResource._contentManagerResolver
			&& contentResource._contentManagerResolver.settings
			&& contentResource._contentManagerResolver.settings.loader
		) {
			return Promise.resolve(contentResource._contentManagerResolver.settings.loader);
		}

		if (contentResource.getSource()) {
			// Try one of default loaders.
			var sourceType = contentResource.getSourceType().toLowerCase();

			var that = this;
			switch (sourceType) {
				case "stream": {
					if (this.defaultCdsLoader == null) {
						return new Promise(function(resolve) {
							var cdsModule = "sap/ui/vk/threejs/ContentDeliveryService";
							sap.ui.require([
								cdsModule
							], function(Class) {
								resolve(that.defaultCdsLoader = new Class({ authorizationHandler: that._authorizationHandler }));
							});
						});
					}
					return Promise.resolve(this.defaultCdsLoader);
				}
				case "vds4": {
					if (this.defaultMataiLoader == null) {
						return new Promise(function(resolve) {
							var mataiModule = "sap/ui/vk/matai/MataiLoader";
							sap.ui.require([
								mataiModule
							], function(Class) {
								resolve(that.defaultMataiLoader = new Class());
							});
						});
					}
					return Promise.resolve(this.defaultMataiLoader);
				}
				default:
					break;
			}
		}

		return Promise.resolve(null);
	};

	ContentManager.prototype._loadContentResources = function(scene, contentResources) {
		// returns unique key for the ContentResource or ShadowContentResource
		function getKey(type, source) {
			if (typeof source === "string") {
				return (type || "") + source;
			}
			return null;
		}

		// compares ShadowContentResource and ContentResource
		function equals(shadow, resource) {
			if (!shadow && !resource) {
				// Both are undefined/null
				return true;
			} else if (!!shadow ^ !!resource) {
				// One is undefined/null, another is not undefined/null
				return false;
			} else {
				// Both are not undefined/null
				return shadow.source === resource.getSource() && shadow.sourceType === resource.getSourceType();
			}
		}

		// updates properties which can be updated on the fly
		function updateProperties(shadow, resource) {
			resource._shadowContentResource = shadow;
			var root = shadow.nodeProxy.getNodeRef();

			shadow.name = resource.getName();
			root.name = shadow.name;

			shadow.sourceId = resource.getSourceId();
			root.sourceId = shadow.sourceId;

			// compare matrices in float[] form
			function compareMatrix(left, right) {
				if (!left && !right) {
					return true;
				}
				var identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
				var first = left || identity, second = right || identity;
				for (var i = 0; i < identity.length; ++i) {
					if (first[i] !== second[i]) {
						return false;
					}
				}
				return true;
			}

			// detect if actual local matrix change occurred to avoid updating world matrices for entire subtree
			if (!compareMatrix(shadow.localMatrix, resource.getLocalMatrix())) {
				shadow.localMatrix = resource.getLocalMatrix();
				root.matrix.fromArray(TransformationMatrix.convertTo4x4(shadow.localMatrix));
				root.matrix.decompose(root.position, root.quaternion, root.scale);
				root.matrixWorldNeedsUpdate = true;
			}
		}

		var toInsert = []; // contains ContentResource objects
		var toDelete = new Map(); // contains ShadowContentResource objects

		// remove subtree of shadow content resources and put it's nodes into deletion list
		function remove(shadow) {
			var key = getKey(shadow.sourceType, shadow.source);
			var list = toDelete.get(key);
			if (!list) {
				list = [];
				toDelete.set(key, list);
			}
			list.push(shadow);
			var root = shadow.nodeProxy.getNodeRef();
			root.parent.remove(root);

			shadow.children.forEach(function(child) {
				remove(child);
			});
			shadow.children.length = 0;
		}

		// create new ShadowContentResource based on ContentResource
		function add(resource, parent) {
			var shadow = new ShadowContentResource(resource);
			var root = new THREE.Group();
			parent.add(root);
			root.matrixWorldNeedsUpdate = true;
			shadow.nodeProxy = scene.getDefaultNodeHierarchy().createNodeProxy(root);
			updateProperties(shadow, resource);
			toInsert.push(resource);
			return shadow;
		}

		// first step is synchronous and brings ShadowContentResource tree and ContentResource tree to isomorphic state i.e. structurally identical trees
		// ShadowContentResource for deletion removed but is kept in a list for possible reuse on next step
		(function update(shadowContentResources, contentResources, parent) {
			var i = 0; // index in shadowContentResources
			var changes = jQuery.sap.arrayDiff(shadowContentResources, contentResources, equals, true);

			changes.forEach(function(change) {
				// Compare unchanged items
				for (; i < change.index; ++i) {
					updateProperties(shadowContentResources[i], contentResources[i]);
					update(shadowContentResources[i].children, contentResources[i].getContentResources(), shadowContentResources[i].nodeProxy.getNodeRef());
				}

				if (change.type === "delete") {
					remove(shadowContentResources[change.index]); // remove entire subtree
					shadowContentResources.splice(change.index, 1);
				} else if (change.type === "insert") {
					var shadow = add(contentResources[change.index], parent); // add new shadow content resource node
					shadowContentResources.splice(change.index, 0, shadow);
					update(shadow.children, contentResources[change.index].getContentResources(), shadow.nodeProxy.getNodeRef());
				}
				++i;
			});

			// update remaining unchanged items
			for (; i < shadowContentResources.length; ++i) {
				updateProperties(shadowContentResources[i], contentResources[i]);
				update(shadowContentResources[i].children, contentResources[i].getContentResources(), shadowContentResources[i].nodeProxy.getNodeRef());
			}

		})(this._shadowContentResources, contentResources, scene.getSceneRef());

		var promises = [];

		// second step synchronously tries to reuse existing subtrees where possible instead of loading new ones
		// and if not possible to reuse then asynchronously finds loader and loads content
		toInsert.forEach(function(resource) {
			var root = resource._shadowContentResource.nodeProxy.getNodeRef();
			var key = getKey(resource.getSourceType(), resource.getSource());
			var toReuse = toDelete.get(key);
			// shadow content resources without key cannot be reused
			if (key && toReuse && toReuse.length > 0) {
				var shadow = toReuse.pop();
				var node = shadow.nodeProxy.getNodeRef();
				// move children from old placeholder root to the new one
				for (var i = 0; i < node.children.length; ++i) {
					root.add(node.children[i]);
				}
				// move loader/builder as well
				if (shadow.loader) {
					resource._shadowContentResource.loader = shadow.loader;
				}
				if (shadow.builder) {
					resource._shadowContentResource.builder = shadow.builder;
				}
				scene.getDefaultNodeHierarchy().destroyNodeProxy(shadow.nodeProxy);
				shadow.nodeProxy = null;
			} else {
				var that = this;
				promises.push(this._findLoader(resource).then(function(loader) {
					if (loader) {
						if (loader.attachContentChangesProgress) {
							loader.attachContentChangesProgress(that._handleContentChangesProgress, that);
						}
						if (loader.attachContentLoadingFinished) {
							loader.attachContentLoadingFinished(that._handleContentLoadingFinished, that);
						}
					}
					if (typeof loader === "function") {
						return loader(root, resource, that._authorizationHandler, that._retryCount);
					} else if (loader && loader.load) {
						return loader.load(root, resource, that._authorizationHandler, that._retryCount);
					} else {
						return Promise.resolve({
							node: root,
							contentResource: resource
						});
					}
				}));
			}
		}, this);

		// properly dispose of ThreeJS subtree, see Scene.prototype.clearThreeScene() for details
		function disposeSubtree(root) {
			var allNodes = [];
			var allGroupNodes = [];

			ThreeUtils.getAllTHREENodes([root], allNodes, allGroupNodes);

			var materials = new Map();
			var geometries = new Map();

			allNodes.forEach(function(node) {
				if (node instanceof THREE.Mesh) {
					if (!geometries.has(node.geometry.uuid)) {
						ThreeUtils.disposeGeometry(node);
						geometries.set(node.geometry.uuid, true);
					}
					if (node.material) {
						if (!materials.has(node.material.uuid)) {
							ThreeUtils.disposeMaterial(node.material);
							materials.set(node.material.uuid, true);
						}
					}
					if (node.userData &&
						node.userData.originalMaterial &&
						node.userData.originalMaterial.uuid !== node.material.uuid &&
						!materials.has(node.userData.originalMaterial.uuid)) {
						ThreeUtils.disposeMaterial(node.userData.originalMaterial);
						materials.set(node.userData.originalMaterial.uuid, true);
					}
				}
				if (node.parent) {
					node.parent.remove(node);
				}
			});

			allGroupNodes.forEach(function(node) {
				if (node.parent) {
					node.parent.remove(node);
				}
			});

			materials.clear();
			geometries.clear();
		}

		// third step is to dispose unused ShadowContentResource objects, i.e. disposing ThreeJS subtrees and associated resources properly
		toDelete.forEach(function(list, key) {
			for (var i = 0; i < list.length; ++i) {
				var shadow = list[i];
				disposeSubtree(shadow.nodeProxy.getNodeRef());
				// if ShadowContentResource has loader or builder, cleanup accordingly, see ContentManager.prototype.destroyContent() for details
				if (shadow.builder) {
					shadow.builder.cleanup();
				}
				if (shadow.loader) {
					if (shadow.loader._loader && shadow.loader._loader.sceneBuilder) {
						shadow.loader._loader.removeContext(shadow.loader._loader.currentSceneInfo.id);
						shadow.loader._loader.sceneBuilder.cleanup();
					}
					if (shadow.loader.detachContentChangesProgress) {
						shadow.loader.detachContentChangesProgress(this._handleContentChangesProgress, this);
					}
					if (shadow.loader.detachContentLoadingFinished) {
						shadow.loader.detachContentLoadingFinished(this._handleContentLoadingFinished, this);
					}
				}
			}
		}, this);

		// fourth step is to check one specific configuration
		// when there is one top level content resource which doesn't have name & matrix
		// then root (placeholder) for that content resource must be hidden
		// this is to mimic how scene tree looks like for a single resource where should be no artificial top level node
		if (contentResources.length === 1 && contentResources[0].getName() == null && contentResources[0].getLocalMatrix() == null) {
			contentResources[0]._shadowContentResource.nodeProxy.getNodeRef().userData.skipIt = true;
		} else {
			// reset flag for all top level content resources otherwise
			contentResources.forEach(function(res) {
				res._shadowContentResource.nodeProxy.getNodeRef().userData.skipIt = false;
			});
		}

		return Promise.all(promises);
	};

	ContentManager.prototype._initSceneWithCDSLoaderIfExists = function(scene, loaders) {
		if (loaders) {
			var sceneBuilder;
			for (var i = 0; i < loaders.length; i++) {
				// if we find one, we return it as we can only have one CDS at the moment
				if (loaders[i] instanceof ContentDeliveryService) {
					sceneBuilder = loaders[i].getSceneBuilder();
					break;
				}
			}
			if (sceneBuilder) {
				scene.setSceneBuilder(sceneBuilder);

				// when things are removed from cds, we need to update the state
				// currently only author removes nodes and at TreeNode level.
				// If it is not tree node, we do nothing for now. We may have to revisit this.
				scene.getDefaultNodeHierarchy().attachNodeRemoving(function(event) {
					var removed = event.getParameter("nodeRef");
					if (removed.userData.treeNode && removed.userData.treeNode.sid) {
						// someone removed treeNode
						sceneBuilder.decrementResourceCountersForDeletedTreeNode(removed.userData.treeNode.sid);
					}
				});

				return true;
			}
		}
		return false;
	};

	/**
	 * Destroys the content.
	 *
	 * @param {any} content The content to destroy.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */
	ContentManager.prototype.destroyContent = function(content) {
		if (content) {
			content.destroy();
			this._shadowContentResources = [];
			// we do not want the content (i.e Scene) to cleanup the SceneBuilder hence we do it here.
			// if the content was loaded by MataiLoader, it will have builders populated
			// if the content was loaded by TotaraLoader, it will have loaders populated with
			// only one element
			if (content.loaders && Array.isArray(content.loaders) && content.loaders.length > 0) {
				if (content.loaders[0]._loader && content.loaders[0]._loader.sceneBuilder) {
					content.loaders[0]._loader.removeContext(content.loaders[0]._loader.currentSceneInfo.id);
					content.loaders[0]._loader.sceneBuilder.cleanup();
				}

				if (content.loaders[0].detachContentChangesProgress) {
					content.loaders[0].detachContentChangesProgress(this._handleContentChangesProgress, this);
				}
				if (content.loaders[0].detachContentLoadingFinished) {
					content.loaders[0].detachContentLoadingFinished(this._handleContentLoadingFinished, this);
				}
			} else if (content.builders && Array.isArray(content.builders)) {
				content.builders.forEach(function(sb) {
					if (sb) {
						sb.cleanup();
					}
				});
			}
		}
		return this;
	};

	/**
	 * Collects and destroys unused objects and resources.
	 *
	 * @function
	 * @name sap.ui.vk.threejs.ContentManager#collectGarbage
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Creates an Orthographic camera
	 *
	 * @returns {sap.ui.vk.OrthographicCamera} Created Camera.
	 * @public
	 * @since 1.52.0
	 */
	ContentManager.prototype.createOrthographicCamera = function() {
		return new OrthographicCamera();
	};

	/**
	 * Creates a Perspective camera
	 *
	 * @returns {sap.ui.vk.PerspectiveCamera} Created Camera.
	 * @public
	 * @since 1.52.0
	 */
	ContentManager.prototype.createPerspectiveCamera = function() {
		return new PerspectiveCamera();
	};

	return ContentManager;
});
