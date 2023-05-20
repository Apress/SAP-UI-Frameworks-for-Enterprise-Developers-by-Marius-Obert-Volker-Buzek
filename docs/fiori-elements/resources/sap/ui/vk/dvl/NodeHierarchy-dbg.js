/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the NodeHierarchy class.
sap.ui.define([
	"../NodeHierarchy",
	"../NodeContentType",
	"sap/ui/base/ObjectPool",
	"./BaseNodeProxy",
	"./NodeProxy",
	"./LayerProxy",
	"../Messages",
	"../DvlException",
	"./checkResult",
	"./getJSONObject",
	"../getResourceBundle",
	"sap/base/util/array/uniqueSort",
	"sap/base/Log"
], function(
	NodeHierarchyBase,
	NodeContentType,
	ObjectPool,
	BaseNodeProxy,
	NodeProxy,
	LayerProxy,
	Messages,
	DvlException,
	checkResult,
	getJSONObject,
	getResourceBundle,
	uniqueSort,
	Log
) {
	"use strict";

	// This is a dictionary that we use to convert query values
	// from strings to actual numbers that are passed to DVL when finding nodes.
	// The DVL method FindNodes requires integer values as parameters so it's better
	// to avoid passing "0" or "1" as arguments. Instead we can make conversions such as
	// string "equals" to the DvlEnum "sap.ve.dvl.DVLFINDNODEMODE.DVLFINDNODEMODE_EQUAL"
	// which is an integer.
	var searchDictionary = {
		modeDictionary: {
			equals: function(isCaseSensitive) {
				return isCaseSensitive ? sap.ve.dvl.DVLFINDNODEMODE.DVLFINDNODEMODE_EQUAL : sap.ve.dvl.DVLFINDNODEMODE.DVLFINDNODEMODE_EQUAL_CASE_INSENSITIVE;
			},
			contains: function(isCaseSensitive) {
				return isCaseSensitive ? sap.ve.dvl.DVLFINDNODEMODE.DVLFINDNODEMODE_SUBSTRING : sap.ve.dvl.DVLFINDNODEMODE.DVLFINDNODEMODE_SUBSTRING_CASE_INSENSITIVE;
			},
			startsWith: function(isCaseSensitive) {
				return isCaseSensitive ? sap.ve.dvl.DVLFINDNODEMODE.DVLFINDNODEMODE_STARTS_WITH : sap.ve.dvl.DVLFINDNODEMODE.DVLFINDNODEMODE_STARTS_WITH_CASE_INSENSITIVE;
			}
		}
	};

	/**
	 * Constructor for a new NodeHierarchy.
	 *
	 * The objects of this class should not be created directly, and should only be created via a call to
	 * {@link sap.ui.vk.Scene#getDefaultNodeHierarchy sap.ui.vk.Scene.getDefaultNodeHierarchy}.
	 *
	 * @class
	 * Provides the ability to explore a Scene object's node structure.
	 *
	 * The objects of this class should not be created directly, and should only be created via a call to
	 * {@link sap.ui.vk.Scene#getDefaultNodeHierarchy sap.ui.vk.Scene.getDefaultNodeHierarchy}.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.NodeHierarchy
	 * @alias sap.ui.vk.dvl.NodeHierarchy
	 * @deprecated Since version 1.72.0.
	 * @since 1.32.0
	 */
	var NodeHierarchy = NodeHierarchyBase.extend("sap.ui.vk.dvl.NodeHierarchy", /** @lends sap.ui.vk.dvl.NodeHierarchy.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},

		_baseNodeProxyPool: new ObjectPool(BaseNodeProxy),

		constructor: function(scene) {
			NodeHierarchyBase.call(this);

			this._graphicsCore = scene.getGraphicsCore();
			this._scene = scene;
			this._dvlSceneRef = this._scene.getSceneRef();
			this._dvl = this._graphicsCore._getDvl();
			this._nodeProxies = [];
			this._layerProxies = [];
		}
	});

	NodeHierarchy.prototype.destroy = function() {
		this._layerProxies.slice().forEach(this.destroyLayerProxy, this);
		this._nodeProxies.slice().forEach(this.destroyNodeProxy, this);
		this._dvl = null;
		this._dvlSceneRef = null;
		this._scene = null;
		this._graphicsCore = null;

		NodeHierarchyBase.prototype.destroy.call(this);
	};

	/**
	 * Gets the GraphicsCore object this Scene object belongs to.
	 * @returns {sap.ui.vk.dvl.GraphicsCore} The GraphicsCore object this Scene object belongs to.
	 * @public
	 */
	NodeHierarchy.prototype.getGraphicsCore = function() {
		return this._graphicsCore;
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
		return this._dvlSceneRef;
	};

	/**
	 * Enumerates the child nodes of a particular node in the Scene object.
	 *
	 * This method gets the child nodes of a particular node, and then calls the <code>callback</code> function to which it passes the child nodes to one by one.<br/>
	 * The <code>BaseNodeProxy</code> objects passed to the <code>callback</code> function are temporary objects, which are reset after each call to the <code>callback</code> function.<br/>
	 *
	 * @param {any} [nodeRef] The node reference whose child nodes we want enumerated.<br/>
	 * When <code>nodeRef</code> is specified, the child nodes of this node are enumerated.<br/>
	 * When no <code>nodeRef</code> is specified, only the top level nodes are enumerated.<br/>

	 * @param {function} callback A function to call when the child nodes are enumerated. The function takes one parameter of type {@link sap.ui.vk.dvl.BaseNodeProxy}, or string if parameter <code>passNodeRef</code> parameter is <code>true</code>.

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

		// NB: At the moment DVL scenes support only one hierarchy, so we just enumerate top level nodes of the scene if nodeRef is omitted.
		var nodeRefs;
		if (nodeRef) {
			// Child nodes of the node.
			if (stepIntoClosedNodes || (getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED) === 0) {
				nodeRefs = getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_CHILDREN)).ChildNodes;
			} else {
				// Do not step into closed nodes.
				nodeRefs = [];
			}
		} else {
			// Top level nodes.
			nodeRefs = getJSONObject(this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneRef, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_CHILDREN)).ChildNodes;
		}
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
	 * @param {any} nodeRef The node reference whose ancestor nodes we want enumerated.

	 * @param {function} callback A function to call when the ancestor nodes are enumerated. The function takes one parameter of type {@link sap.ui.vk.dvl.BaseNodeProxy}, or string if parameter <code>passNodeRef</code> parameter is <code>true</code>.

	 * @param {boolean} [passNodeRef=false] Indicates whether to pass the node references of the ancestor nodes, or the whole node proxy to the <code>callback</code> function.<br/>
	 * If <code>true</code>, then only the node references of the ancestor nodes are passed to the <code>callback</code> function. <br/>
	 * If <code>false</code>, then the node proxies of the ancestor nodes are passed to the <code>callback</code> function.

	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 *
	 */
	NodeHierarchy.prototype.enumerateAncestors = function(nodeRef, callback, passNodeRef) {
		var nodeRefs = getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_PARENTS)).ParentNodes;

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
	 * @param {any} nodeRef The node reference for which to create a proxy object.
	 * @returns {sap.ui.vk.dvl.NodeProxy} The proxy object.
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
	 * @param {sap.ui.vk.dvl.NodeProxy} nodeProxy The node proxy object.
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
	 * Returns a list of IDs belonging to the children of a particular node.
	 *
	 * @param {any} nodeRef The node reference of the node whose children will be returned. If <code>nodeRef</code> is not passed to the <code>getChildren</code> function, the IDs of the root nodes will be returned.
	 * @param {boolean} [stepIntoClosedNodes=false] Indicates whether to return only the child nodes of a <i>closed</i> node or not. If <code>true</code>, then the children of that closed node  will be returned. If <code>false</code>, then the children of that <i>closed</i> node will not be returned.
	 * @returns {string[]} A list of IDs belonging to the children of <code>nodeRef</code>.
	 * @public
	 */
	NodeHierarchy.prototype.getChildren = function(nodeRef, stepIntoClosedNodes) {
		// if nodeRef is not passed, but stepIntoClosedNodes is passed as a boolean
		if (typeof nodeRef === "boolean") {
			stepIntoClosedNodes = nodeRef;
			nodeRef = undefined;
		}

		if (nodeRef) {
			// Child nodes of the node.
			if (stepIntoClosedNodes || (getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED) === 0) {
				return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_CHILDREN)).ChildNodes;
			} else {
				// Do not step into closed nodes.
				return [];
			}
		} else {
			// Top level nodes.
			return getJSONObject(this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneRef, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_CHILDREN)).ChildNodes;
		}
	};

	/**
	 * Returns a list of IDs belonging to the ancestors of a particular node.
	 *
	 * @param {any} nodeRef The node reference of the node whose ancestors will be returned.
	 * @returns {string[]} A list of IDs belonging to the ancestors of <code>nodeRef</code>.
	 * @public
	 */
	NodeHierarchy.prototype.getAncestors = function(nodeRef) {
		return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_PARENTS)).ParentNodes;
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
	 * @returns {string[]} A list of IDs belonging to nodes that matched the search criteria.
	 * @public
	 */
	NodeHierarchy.prototype.findNodesByName = function(query) {

		// searchType is in this case by name
		var searchType = sap.ve.dvl.DVLFINDNODETYPE.DVLFINDNODETYPE_NODE_NAME,
			// allSearchResults is the array that the function returns
			allSearchResults = [],
			// search mode can be  "equals", "contains", "startsWith",
			// each of these modes having a caseSensitive true or false option
			searchMode,
			searchStringsArray;

		if (query === undefined || query === null || jQuery.isEmptyObject(query)) {
			// this condition caters for the case where the query is null, undefined or empty object
			// we search for nodes that contain an empty string ("");
			searchMode = searchDictionary.modeDictionary.contains(false);
			searchStringsArray = [""];
		} else {
			// query object validation
			if (query.value === undefined || query.value === null || query.value === "") {
				Log.error(getResourceBundle().getText(Messages.VIT6.summary), Messages.VIT6.code, "sap.ui.vk.dvl.NodeHierarchy");
				return [];
			}

			var predicate = query.hasOwnProperty("predicate") ? query.predicate : "equals";
			if (predicate === undefined || predicate === null || predicate === "") {
				Log.error(getResourceBundle().getText(Messages.VIT7.summary), Messages.VIT7.code, "sap.ui.vk.dvl.NodeHierarchy");
				return [];
			} else if (["equals", "contains", "startsWith"].indexOf(predicate) === -1) {
				Log.error(getResourceBundle().getText(Messages.VIT8.summary), Messages.VIT8.code, "sap.ui.vk.dvl.NodeHierarchy");
				return [];
			}

			searchMode = searchDictionary.modeDictionary[predicate](query.caseSensitive);
			// If we search for a string, we create an array having one element, the string.
			// If we search for an array of strings, we leave the array as is.
			searchStringsArray = (typeof query.value === "string") ? [query.value] : query.value;
		}

		// We multiple calls to the DVL api; one call per search string from array of search strings.
		for (var i = 0; i < searchStringsArray.length; i++) {
			allSearchResults = allSearchResults.concat(getJSONObject(this._dvl.Scene.FindNodes(this._dvlSceneRef, searchType, searchMode, searchStringsArray[i])).nodes);
		}

		// We sort the array and remove all duplicate node references
		return uniqueSort(allSearchResults);
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
		var layerProxy = new LayerProxy(this, layerId);
		this._layerProxies.push(layerProxy);
		return layerProxy;
	};

	/**
	 * Destroys the layer proxy object.
	 *
	 * @param {sap.ui.vk.LayerProxy} layerProxy The layer proxy object.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	NodeHierarchy.prototype.destroyLayerProxy = function(layerProxy) {
		var index = this._layerProxies.indexOf(layerProxy);
		if (index >= 0) {
			this._layerProxies.splice(index, 1)[0].destroy();
		}
		return this;
	};

	/**
	 * Returns a list of layer IDs.
	 *
	 * @returns {string[]} A list of layer IDs.
	 * @public
	 */
	NodeHierarchy.prototype.getLayers = function() {
		return getJSONObject(this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneRef, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_LAYERS)).Layers;
	};

	/**
	 * Returns a list of hotspot IDs.
	 *
	 * @returns {string[]} A list of hotspot IDs.
	 * @public
	 */
	NodeHierarchy.prototype.getHotspotNodeIds = function() {
		var hotspotNodeRefs = getJSONObject(this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneRef, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_HOTSPOTS).ChildNodes);
		return hotspotNodeRefs.length > 0 ? hotspotNodeRefs : this._getLegacyHotspotNodeIds();
	};

	/**
	 * Returns a list of node references which are sitting the Hotspots layer. This is used for the legacy hotspots.
	 *
	 * @returns {string[]} A list of node references.
	 * @private
	 */
	NodeHierarchy.prototype._getLegacyHotspotNodeIds = function() {
		var allLayerIds = this.getLayers(),
			hotspotNodeRefs = [];

		// searching the layer which happens to be named "Hotspots".
		// By convention, this layer will contain the actual hotspots.
		for (var i = 0; i < allLayerIds.length; i++) {
			// create layer proxy
			var layerProxy = this.createLayerProxy(allLayerIds[i]),
				layerName = layerProxy.getName();
			// check name
			if (layerName.toLowerCase() === "hotspots") {
				hotspotNodeRefs = layerProxy.getNodes();
				this.destroyLayerProxy(layerProxy);
				break;
			}
			this.destroyLayerProxy(layerProxy);
		}
		return hotspotNodeRefs;
	};

	/**
	 * Creates a new node.
	 * @param {any} parentNode          The parent node reference where the created node is added to. If equals <code>null</code> the newly
	 *                                  created node is a top level node.
	 * @param {string} name             The name of the new node.
	 * @param {any} insertBeforeNode    The created node is added before this specified node. If equals <code>null</code> the newly created
	 *                                  node is added at the end of the parent's list of nodes.
	 * @returns {any}                   The node reference of the newly created node.
	 * @public
	 * @since 1.48.0
	 */
	NodeHierarchy.prototype.createNode = function(parentNode, name, insertBeforeNode) {
		var nodeRef = this._dvl.Scene.CreateNode(this._dvlSceneRef, parentNode, name, insertBeforeNode);
		this.fireNodeCreated({ nodeRef: nodeRef, nodeId: nodeRef });
		this.fireChanged();
		return nodeRef;
	};

	/**
	 * Creates a copy of an existing node.
	 * @param {any} nodeToCopy          The reference to the node to copy.
	 * @param {any} parentNode          The reference to the parent node where the created node is added to. If equals <code>null</code> the newly
	 *                                  created node is a top level node.
	 * @param {string} name             The name of the new node.
	 * @param {any} insertBeforeNode    The created node is added before this specified node. If equals <code>null</code> the newly created
	 *                                  node is added at the end of the parent's list of nodes.
	 * @returns {any}                   The node reference of the newly created node.
	 * @public
	 * @since 1.48.0
	 */
	NodeHierarchy.prototype.createNodeCopy = function(nodeToCopy, parentNode, name, insertBeforeNode) {
		var nodeRef = this._dvl.Scene.CreateNodeCopy(this._dvlSceneRef, nodeToCopy, parentNode, sap.ve.dvl.DVLCREATENODECOPYFLAG.COPY_CHILDREN, name, insertBeforeNode);
		this.fireNodeCreated({ nodeRef: nodeRef, nodeId: nodeRef });
		this.fireChanged();
		return nodeRef;
	};

	/**
	 * Get node content type
	 * @param {any} nodeRef	The node reference
	 * @returns {sap.ui.vk.NodeContentType} Node content type
	 * @public
	 * @since 1.73.0
	 */
	NodeHierarchy.prototype.getNodeContentType = function(nodeRef) {
		return NodeContentType.Regular;
	};

	/**
	 * Deletes a node and destroys it.
	 * @param {any} nodeRef The reference to a node or an array of nodes to destroy.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.48.0
	 */
	NodeHierarchy.prototype.removeNode = function(nodeRef) {
		// create array from nodeRef parameter - incases of 1 nodeRef string passed
		var arrayOfNodeRefs = [].concat(nodeRef);

		arrayOfNodeRefs.forEach(function(nodeRef) {
			this.fireNodeRemoving({ nodeRef: nodeRef, nodeId: nodeRef });
			try {
				checkResult(this._dvl.Scene.DeleteNode(this._dvlSceneRef, nodeRef));
			} catch (e) {
				var message = "Failed to delete node with ID = " + nodeRef + ".";
				if (e instanceof DvlException) {
					message += " Error code: " + e.code + ". Message: " + e.message + ".";
				}
				Log.error(message);
			}
		}.bind(this));
		this.fireChanged();
		return this;
	};

	return NodeHierarchy;
});
