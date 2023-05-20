/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the NodeHierarchy class.
sap.ui.define([
	"../NodeHierarchy",
	"sap/ui/base/ObjectPool",
	"./BaseNodeProxy",
	"./NodeProxy",
	"../Messages",
	"../getResourceBundle",
	"../NodeContentType",
	"sap/base/util/uid",
	"sap/base/assert",
	"sap/base/Log",
	"../thirdparty/three"
], function(
	NodeHierarchyBase,
	ObjectPool,
	BaseNodeProxy,
	NodeProxy,
	Messages,
	getResourceBundle,
	NodeContentType,
	uid,
	assert,
	Log,
	THREE
) {
	"use strict";

	var searchModeFunctions = {
		equals: function(str, searchString) {
			return str === searchString;
		},
		contains: function(str, searchString) {
			return str.indexOf(searchString) !== -1;
		},
		startsWith: function(str, searchString) {
			return str.indexOf(searchString) === 0;
		}
	};

	/**
	 * Constructor for a new NodeHierarchy.
	 *
	 * @class
	 * Provides the ability to explore a Scene object's node structure.
	 *
	 * The objects of this class should not be created directly, and should only be created via a call to {@link sap.ui.vk.Scene#getDefaultNodeHierarchy sap.ui.vk.Scene#getDefaultNodeHierarchy}.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.NodeHierarchy
	 * @alias sap.ui.vk.threejs.NodeHierarchy
	 */
	var NodeHierarchy = NodeHierarchyBase.extend("sap.ui.vk.threejs.NodeHierarchy", /** @lends sap.ui.vk.threejs.NodeHierarchy.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},

		_baseNodeProxyPool: new ObjectPool(BaseNodeProxy),

		constructor: function(scene) {
			NodeHierarchyBase.call(this);

			this._scene = scene;
			this._nodeProxies = [];
		}
	});

	NodeHierarchy.prototype.destroy = function() {
		this._nodeProxies.slice().forEach(this.destroyNodeProxy, this);
		this._scene = null;

		NodeHierarchyBase.prototype.destroy.call(this);
	};

	/**
	 * Gets the Scene object the node hierarchy belongs to.
	 * @returns {sap.ui.vk.Scene} The Scene object the node hierarchy belongs to.
	 * @public
	 */
	NodeHierarchy.prototype.getScene = function() {
		return this._scene;
	};

	/**
	 * Gets the scene reference that this NodeHierarchy object wraps.
	 * @returns {any} The scene reference that this NodeHierarchy object wraps.
	 * @public
	 */
	NodeHierarchy.prototype.getSceneRef = function() {
		return this._scene.getSceneRef();
	};


	/**
	 * Enumerates the child nodes of a particular node in the Scene object.
	 *
	 * This method gets the child nodes of a particular node, and then calls the <code>callback</code> function to which it passes the child nodes to one by one.<br/>
	 * The <code>BaseNodeProxy</code> objects passed to the <code>callback</code> function are temporary objects, which are reset after each call to the <code>callback</code> function.<br/>
	 *
	 * @param {any} [nodeRef] The reference object of a node whose child nodes we want enumerated.<br/>
	 * When <code>nodeRef</code> is specified, the child nodes of this node are enumerated.<br/>
	 * When no <code>nodeRef</code> is specified, only the top level nodes are enumerated.<br/>

	 * @param {function} callback A function to call when the child nodes are enumerated. The function takes one parameter of type {@link sap.ui.vk.BaseNodeProxy}, or string if parameter <code>passNodeRef</code> parameter is <code>true</code>.

	 * @param {boolean} [stepIntoClosedNodes=false] Indicates whether to enumerate the child nodes if the node is <i>closed</i>. <br/>
	 * If <code>true</code>, the children of that closed node will be enumerated <br/>
	 * If <code>false</code>, the children of that node will not be enumerated<br/>

	 * @param {boolean} [passNodeRef=false] Indicates whether to pass the node references of the child nodes, or the whole node proxy to the <code>callback</code> function. <br/>
	 * If <code>true</code>, then only the node references of the child nodes are passed to the <code>callback</code> function. <br/>
	 * If <code>false</code>, then the node proxies created from the child node references are passed to the <code>callback</code> function.

	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	NodeHierarchy.prototype.enumerateChildren = function(nodeRef, callback, stepIntoClosedNodes, passNodeRef) {
		if (typeof nodeRef === "function") {
			// The 'nodeRef' parameter is omitted, let's shift the parameters to right.
			passNodeRef = stepIntoClosedNodes;
			stepIntoClosedNodes = callback;
			callback = nodeRef;
			nodeRef = undefined;
		}

		var nodeRefs = this.getChildren(nodeRef, stepIntoClosedNodes);

		if (passNodeRef) {
			nodeRefs.forEach(callback);
		} else {
			var nodeProxy = this._baseNodeProxyPool.borrowObject();
			try {
				nodeRefs.forEach(function(nodeRef) {
					nodeProxy.init(this, nodeRef);
					callback(nodeProxy);
					nodeProxy.reset();
				}.bind(this));
			} finally {
				this._baseNodeProxyPool.returnObject(nodeProxy);
			}
		}

		return this;
	};

	/**
	 * Enumerates the ancestor nodes of a particular node in the Scene object.
	 *
	 * This method enumerates the ancestor nodes of a particular node, and then calls the <code>callback</code> function, to which it passes the ancestor nodes to one by one.<br/>
	 * The BaseNodeProxy objects passed to <code>callback</code> are temporary objects, they are reset after each call to the <code>callback</code> function.<br/>
	 * The ancestor nodes are enumerated starting from the top level node, and progresses down the node hierarchy.
	 *
	 * @param {any} nodeRef The reference object of a node whose ancestor nodes we want enumerated.

	 * @param {function} callback A function to call when the ancestor nodes are enumerated. The function takes one parameter of type {@link sap.ui.vk.BaseNodeProxy}, or string if parameter <code>passNodeRef</code> parameter is <code>true</code>.

	 * @param {boolean} [passNodeRef=false] Indicates whether to pass the node references of the ancestor nodes, or the whole node proxy to the <code>callback</code> function.<br/>
	If <code>true</code>, then only the node references of the ancestor nodes are passed to the <code>callback</code> function. <br/>
	If <code>false</code>, then the node proxies of the ancestor nodes are passed to the <code>callback</code> function.

	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 *
	 */
	NodeHierarchy.prototype.enumerateAncestors = function(nodeRef, callback, passNodeRef) {
		var nodeRefs = this.getAncestors(nodeRef);

		if (passNodeRef) {
			nodeRefs.forEach(callback);
		} else {
			var nodeProxy = this._baseNodeProxyPool.borrowObject();
			try {
				nodeRefs.forEach(function(nodeRef) {
					nodeProxy.init(this, nodeRef);
					callback(nodeProxy);
					nodeProxy.reset();
				}.bind(this));
			} finally {
				this._baseNodeProxyPool.returnObject(nodeProxy);
			}
		}

		return this;
	};

	/**
	 * Creates a node proxy object.
	 *
	 * The node proxy object must be destroyed with the {@link #destroyNodeProxy destroyNodeProxy} method.
	 *
	 * @param {any} nodeRef The reference object for which to create a proxy object.
	 * @returns {sap.ui.vk.NodeProxy} The proxy object.
	 * @public
	 */
	NodeHierarchy.prototype.createNodeProxy = function(nodeRef) {
		var nodeProxy = new NodeProxy(this, nodeRef);
		this._nodeProxies.push(nodeProxy);
		return nodeProxy;
	};

	/**
	 * Destroys the node proxy object.
	 *
	 * @param {sap.ui.vk.NodeProxy} nodeProxy The node proxy object.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	NodeHierarchy.prototype.destroyNodeProxy = function(nodeProxy) {
		var index = this._nodeProxies.indexOf(nodeProxy);
		if (index >= 0) {
			this._nodeProxies.splice(index, 1)[0].destroy();
		}
		return this;
	};

	/**
	 * Returns a list of reference objects belonging to the children of a particular node.
	 *
	 * @param {any} nodeRef                         The reference object of the node whose children will be returned. If
	 *                                              <code>nodeRef</code> is not passed to the <code>getChildren</code>
	 *                                              function, the reference objects of the root nodes will be returned.
	 * @param {boolean} [stepIntoClosedNodes=false] Indicates whether to return only the child nodes of a <i>closed</i>
	 *                                              node or not. If <code>true</code>, then the children of that closed
	 *                                              node  will be returned. If <code>false</code>, then the children of
	 *                                              that <i>closed</i> node will not be returned.
	 * @returns {any[]} A list of reference objects belonging to the children of <code>nodeRef</code>.
	 * @public
	 */
	NodeHierarchy.prototype.getChildren = function(nodeRef, stepIntoClosedNodes) {
		// if nodeRef is not passed, but stepIntoClosedNodes is passed as a boolean
		if (typeof nodeRef === "boolean") {
			stepIntoClosedNodes = nodeRef;
			nodeRef = undefined;
		}

		if (!nodeRef) {
			nodeRef = this._scene.getSceneRef(); // the scene root node
		}

		var children = [];
		if (stepIntoClosedNodes || !nodeRef.userData.closed) {
			nodeRef.children.forEach(function(child) {
				if (!child.private && (child.geometry === undefined || !child.userData.skipIt)) {// ignore private and skipIt geometry nodes
					children.push(child);
				}
			});
		}
		return children;
	};

	/**
	 * Returns a list of reference objects belonging to the ancestors of a particular node.
	 *
	 * @param {any} nodeRef The reference object of the node whose ancestors will be returned.
	 * @returns {any[]} A list of reference objects belonging to the ancestors of <code>nodeRef</code>.
	 * @public
	 */
	NodeHierarchy.prototype.getAncestors = function(nodeRef) {
		var nodeRefs = [];
		nodeRef.traverseAncestors(function(parent) {
			// ancestor array starts from top
			nodeRefs.unshift(parent);
		});
		if (nodeRefs.length > 0 && nodeRefs[0] === this._scene.getSceneRef()) {
			nodeRefs.shift(); // ignore root node
		}
		return nodeRefs;
	};

	/**
	 * Finds nodes in a scene via node name.
	 *
	 * @param {object} query JSON object containing the search parameters. <br/>
	 * The following example shows what the structure of the <code>query</code> object should look like:
	 * <pre>query = {
	 * 	value: <i>string</i> | <i>string[]</i>,
	 * 	predicate: <i>"equals"</i> | <i>"contains"</i> | <i>"startsWith"</i>,
	 * 	caseSensitive: <i>true</i> | <i>false</i>
	 * }</pre>
	 * <br/>
	 * <ul>
	 * 	<li>
	 * 		<b>query.value</b><br/> A string or an array of strings containing the name of a node or names of nodes.
	 * 		If no value is specified, then all nodes in the scene will be returned.<br/>
	 * 		The following example shows a single string being passed in:
	 * 		<pre>value: "Box #14"</pre>
	 * 		The following example shows an array of strings being passed in:
	 * 		<pre>value: ["Box #3", "box #4", "BOX #5"]</pre>
	 * 	</li>
	 * 	<li>
	 * 		<b>query.predicate</b><br/> Represents a search mode.
	 * 		The available search modes are <code>"equals"</code>, <code>"contains"</code>, and <code>"startsWith"</code>. <br/>
	 * 		Using <code>"equals"</code> will search for nodes with names that exactly match the provided string or array of strings. <br/>
	 * 		Using <code>"contains"</code> will search for nodes with names containing all or part of the provided string or array of strings. <br/>
	 * 		Using <code>"startsWith"</code> will search for nodes with names starting with the provided string or array of strings. <br/>
	 * 		If no value is specified, the search mode will default to <code>"equals"</code>. <br/><br/>
	 * 	</li>
	 * 	<li>
	 * 		<b>query.caseSensitive</b><br/> Indicates whether the search should be case sensitive or not. <br/>
	 * 		If <code>true</code>, the search will be case sensitive, and <code>false</code> indicates otherwise. <br/>
	 * 		If no value is specified, <code>caseSensitive</code> will default to <code>false</code> (that is, the search will be a case-insensitive search).
	 * 	</li>
	 * </ul>
	 * @returns {THREE.Object3D[]} A list of reference objects belonging to nodes that matched the search criteria.
	 * @public
	 */
	NodeHierarchy.prototype.findNodesByName = function(query) {
		var result = [];
		if (query === undefined || query === null || query === "" || jQuery.isEmptyObject(query)) {
			// If the query is empty then find all nodes in the scene.
			this._scene.getSceneRef().children.forEach(function(rootChild) {
				rootChild.traverse(function(obj3D) {
					if (!obj3D.private && !obj3D.userData.skipIt) {// ignore private and skipIt nodes
						result.push(obj3D);
					}
				});
			});
		} else {
			// query object validation
			var searchModeFunction = searchModeFunctions[query.predicate || "equals"];
			if (searchModeFunction === undefined) {
				Log.error(getResourceBundle().getText(Messages.VIT8.summary), Messages.VIT8.code, "sap.ui.vk.threejs.NodeHierarchy");
			} else if (!Array.isArray(query.value) && typeof query.value !== "string") {
				Log.error(getResourceBundle().getText(Messages.VIT6.summary), Messages.VIT6.code, "sap.ui.vk.threejs.NodeHierarchy");
			} else {
				// If we search for a string, we create an array having one element, the string.
				// If we search for an array of strings, we leave the array as is.
				var searchStringsArray = Array.isArray(query.value) ? query.value : [query.value];
				if (!query.caseSensitive) {
					for (var i in searchStringsArray) {
						searchStringsArray[i] = searchStringsArray[i].toLowerCase();
					}
				}

				this._scene.getSceneRef().children.forEach(function(rootChild) {
					rootChild.traverse(function(obj3D) {
						if (!obj3D.private && !obj3D.userData.skipIt) {// ignore private and skipIt nodes
							var name = obj3D.name || "";
							if (!query.caseSensitive) {
								name = name.toLowerCase();
							}
							for (var i in searchStringsArray) {
								if (searchModeFunction(name, searchStringsArray[i])) {
									result.push(obj3D);
									break;
								}
							}
						}
					});
				});
			}
		}

		return result;
	};

	/**
	 * Find nodes by UsageId path.
	 *
	 * The method can return multiple nodes matching <code>path</code> especially when <code>path<code>
	 * contains a string <code>"**"</code>.
	 *
	 * @param {string} usageIdName A UsageId name which the keys in <code>path</code> belong to.
	 * @param {any[]} path An array of UsageId keys where each item is a single JSON like object with
	 *        properties <code>name</code> and <code>value</code> for single-key UsageIds and an array
	 *        of such objects for multi-key UsageIds. The item can can be a string <code>"*"</code> to
	 *        indicate that it can be any node or the item can be a string <code>"**"</code> to
	 *        indicate that some nodes can be skipped.
	 * @param {object} [options] Optional settings for the method.
	 * @param {any} [options.searchUnder] An optional non-<code>null</code> node reference for limiting
	 *        the scope of search with a subtree starting with the <code>options.searchUnder</code> node
	 *        excluding the <code>options.searchUnder</code> node itself.
	 * @param {boolean} [options.stepIntoClosedNodes=false] An indicator to search in <em>closed</em> nodes as well.
	 * @returns {any[]} An array of node references.
	 * @public
	 */
	NodeHierarchy.prototype.findNodesByUsageIdPath = function(usageIdName, path, options) {
		var nodes = [];

		function searchNodes(node, pathIndex, canSkip) {
			if (!node.userData.skipIt) {
				if (pathIndex >= 0) {
					var pathKey = path[pathIndex];
					if (pathKey === "**") {
						pathKey = path[++pathIndex];
						canSkip = true;
					}

					var res = pathKey === "*";
					if (!res && Array.isArray(node.userData.usageIds)) {
						var usageId = node.userData.usageIds.find(function(element) { return element.name === usageIdName; });
						var usageIdKeys = usageId && usageId.keys;
						var pathKeys = Array.isArray(pathKey) ? pathKey : [pathKey];
						if (Array.isArray(usageIdKeys) && usageIdKeys.length === pathKeys.length) {
							res = usageIdKeys.every(function(usageIdKey) {
								return pathKeys.some(function(pathKey) {
									return pathKey.name === usageIdKey.name && pathKey.value === usageIdKey.value;
								});
							});
						}
					}

					if (res) {
						pathIndex++;
						if (pathIndex >= path.length) {
							nodes.push(node);
							return;
						}
						canSkip = false;
					} else if (!canSkip) {
						return;
					}
				} else {
					pathIndex = 0;
				}
			}

			if (!node.userData.closed || (options && options.stepIntoClosedNodes)) {
				node.children.forEach(function(child) {
					searchNodes(child, pathIndex, canSkip);
				});
			}
		}

		searchNodes(options && options.searchUnder || this._scene.getSceneRef(), -1, false);

		return nodes;
	};

	/**
	 * Creates a layer proxy object.
	 *
	 * The layer proxy object must be destroyed with the {@link #destroyLayerProxy destroyLayerProxy} method.
	 *
	 * @param {string} layerId The layer ID for which to create a proxy object.
	 * @returns {sap.ui.vk.LayerProxy} The proxy object.
	 * @public
	 */
	NodeHierarchy.prototype.createLayerProxy = function(layerId) {
		// TODO: implement.
		return null;
	};

	/**
	 * Destroys the layer proxy object.
	 *
	 * @param {sap.ui.vk.LayerProxy} layerProxy The layer proxy object.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	NodeHierarchy.prototype.destroyLayerProxy = function(layerProxy) {
		// TODO: implement.
		return this;
	};

	/**
	 * Returns a list of layer IDs.
	 *
	 * @returns {string[]} A list of layer IDs.
	 * @public
	 */
	NodeHierarchy.prototype.getLayers = function() {
		// TODO: implement.
		return [];
	};

	/**
	 * Returns a list of hotspot IDs.
	 *
	 * @returns {string[]} A list of hotspot IDs.
	 * @public
	 */
	NodeHierarchy.prototype.getHotspotNodeIds = function() {
		// TODO: implement.
		return null;
	};

	NodeHierarchy.prototype.attachChanged = function(data, func, listener) {
		return this.attachEvent("changed", data, func, listener);
	};

	NodeHierarchy.prototype.detachChanged = function(data, func, listener) {
		return this.detachEvent("changed", data, func, listener);
	};

	NodeHierarchy.prototype.fireChanged = function(parameters, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("changed", parameters, allowPreventDefault, enableEventBubbling);
	};

	NodeHierarchy.prototype.attachNodeCreated = function(data, func, listener) {
		return this.attachEvent("nodeCreated", data, func, listener);
	};

	NodeHierarchy.prototype.detachNodeCreated = function(data, func, listener) {
		return this.detachEvent("nodeCreated", data, func, listener);
	};

	NodeHierarchy.prototype.fireNodeCreated = function(parameters, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("nodeCreated", parameters, allowPreventDefault, enableEventBubbling);
	};

	NodeHierarchy.prototype.attachNodeRemoving = function(data, func, listener) {
		return this.attachEvent("nodeRemoving", data, func, listener);
	};

	NodeHierarchy.prototype.detachNodeRemoving = function(data, func, listener) {
		return this.detachEvent("nodeRemoving", data, func, listener);
	};

	NodeHierarchy.prototype.fireNodeRemoving = function(parameters, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("nodeRemoving", parameters, allowPreventDefault, enableEventBubbling);
	};

	NodeHierarchy.prototype.attachNodeReplaced = function(data, func, listener) {
		return this.attachEvent("nodeReplaced", data, func, listener);
	};

	NodeHierarchy.prototype.detachNodeReplaced = function(data, func, listener) {
		return this.detachEvent("nodeReplaced", data, func, listener);
	};

	NodeHierarchy.prototype.fireNodeReplaced = function(parameters, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("nodeReplaced", parameters, allowPreventDefault, enableEventBubbling);
	};

	NodeHierarchy.prototype.attachNodeUpdated = function(data, func, listener) {
		return this.attachEvent("nodeUpdated", data, func, listener);
	};

	NodeHierarchy.prototype.detachNodeUpdated = function(data, func, listener) {
		return this.detachEvent("nodeUpdated", data, func, listener);
	};

	NodeHierarchy.prototype.fireNodeUpdated = function(parameters, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("nodeUpdated", parameters, allowPreventDefault, enableEventBubbling);
	};

	/**
	 * Creates a new node.
	 * @param {THREE.Object3D} parentNode	The reference object of the parent node where the created node is added to. If equals <code>null</code>
	 *                                      the newly created node is a top level node.
	 * @param {string} name                 The name of the new node.
	 * @param {THREE.Object3D} insertBeforeNode The created node is added before this specified node. If equals <code>null</code> the newly created
	 *                                      node is added at the end of the parent's list of nodes.
	 * @param {sap.ui.vk.NodeContentType} [nodeContentType=sap.ui.vk.NodeContentType.Regular] The created node content type.
	 * @param {object} [content]            Optional Json structure used to define node properties.
	 * @returns {THREE.Object3D} The reference object of the newly created node.
	 * @public
	 * @since 1.48.0
	 */
	NodeHierarchy.prototype.createNode = function(parentNode, name, insertBeforeNode, nodeContentType, content) {
		var sceneBuilder = this.getScene().getSceneBuilder();
		var object3D = null;
		var nodeInfo;
		if (sceneBuilder) {
			if (nodeContentType === NodeContentType.Annotation) {
				// For annotations we want the userData field to be similar to the structure when we
				// load annotation nodes from the server.
				nodeInfo = {
					contentType: "ANNOTATION",
					name: name,
					sid: content.sid || uid(),
					annotationId: uid()
				};
			} else {
				nodeInfo = content || {};
				nodeInfo.name = nodeInfo.name || name;
				nodeInfo.sid = nodeInfo.sid || uid();
			}
			object3D = sceneBuilder.createNode(nodeInfo);
			if (!parentNode) {
				parentNode = object3D.parent;
			}
		} else {
			// Scene builder may not be available if we use custom file loaders
			if (!parentNode) {
				parentNode = this._scene.getSceneRef(); // the scene root node
			}

			object3D = new THREE.Group();
			object3D.name = name;
			parentNode.add(object3D);
		}

		var insertIndex = parentNode.children.indexOf(insertBeforeNode);

		assert(parentNode.children[parentNode.children.length - 1] === object3D, getResourceBundle().getText("NODEHIERARCHY_MSG_CREATENODEFAILED"));
		if (insertIndex >= 0) {
			parentNode.children.splice(insertIndex, 0, parentNode.children.pop());
		}

		if (nodeContentType) {
			object3D._vkSetNodeContentType(nodeContentType);
		} else {
			object3D._vkSetNodeContentType(NodeContentType.Regular);
		}

		if (content && sceneBuilder) {
			// Extend this method to create other object types
			switch (object3D._vkGetNodeContentType()) {
				case NodeContentType.Annotation:
					// content.node = object3D;
					content.nodeId = object3D._vkPersistentId();
					content.id = nodeInfo.annotationId;
					sceneBuilder.createAnnotation(content);
					break;
				case NodeContentType.Background:
					sceneBuilder.setParametricContent(content.sid, content.parametricContent);
					break;
				default:
			}
		}

		this.fireNodeCreated({ nodeRef: object3D, nodeId: object3D });
		this.fireChanged();
		return object3D;
	};

	/**
	 * Get node content type
	 * @param {any} nodeRef	The node reference
	 * @returns {sap.ui.vk.NodeContentType} Node content type
	 * @public
	 * @since 1.73.0
	 */
	NodeHierarchy.prototype.getNodeContentType = function(nodeRef) {
		if (nodeRef == null) {
			// There is nothing else we can return
			return NodeContentType.Regular;
		}
		var contentType = nodeRef._vkGetNodeContentType();
		if (!contentType) {
			contentType = NodeContentType.Regular;
		}
		return contentType;
	};

	/**
	 * Creates a copy of an existing node.
	 * @param {any} nodeToCopy              The reference object of the node to copy.
	 * @param {any} parentNode              The reference object of the parent node where the created node is added to. If equals <code>null</code>
	 *                                      the newly created node is a top level node.
	 * @param {string} name                 The name of the new node.
	 * @param {any}    insertBeforeNode     The created node is added before this specified node. If equals <code>null</code> the newly created
	 *                                      node is added at the end of the parent's list of nodes.
	 * @returns {any}                       The reference object of the newly created node.
	 * @public
	 * @since 1.48.0
	 */
	NodeHierarchy.prototype.createNodeCopy = function(nodeToCopy, parentNode, name, insertBeforeNode) {
		if (!parentNode) {
			parentNode = this._scene.getSceneRef(); // the scene root node
		}

		var insertIndex = parentNode.children.indexOf(insertBeforeNode);
		var clone = nodeToCopy.clone(true);
		clone.name = name;
		parentNode.add(clone);
		assert(parentNode.children[parentNode.children.length - 1] === clone, getResourceBundle().getText("NODEHIERARCHY_MSG_CREATENODEFAILED"));
		if (insertIndex >= 0) {
			parentNode.children.splice(insertIndex, 0, parentNode.children.pop());
		}

		this.fireNodeCreated({ nodeRef: clone, nodeId: clone });
		this.fireChanged();
		return clone;
	};

	/**
	 * Deletes a node and destroys it.
	 * @param {any} nodeRef The reference object of a node or an array of nodes to destroy.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.48.0
	 */
	NodeHierarchy.prototype.removeNode = function(nodeRef) {
		// create array from nodeRef parameter - in cases of 1 nodeRef string passed
		var arrayOfNodeRefs = [].concat(nodeRef);
		arrayOfNodeRefs.forEach(function(nodeRef) {
			if (nodeRef && nodeRef.parent) {
				this.fireNodeRemoving({ nodeRef: nodeRef, nodeId: nodeRef });
				nodeRef.parent.remove(nodeRef);
				// TODO: missing resource handling, i.e. calling geometry, material or texture dispose() when necessary.
			}
		}.bind(this));

		var sceneBuilder = this.getScene().getSceneBuilder();
		if (sceneBuilder) {
			arrayOfNodeRefs.forEach(sceneBuilder.removeNode, sceneBuilder);
		}

		this.fireChanged();

		return this;
	};

	return NodeHierarchy;
});
