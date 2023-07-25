/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the NodeHierarchy class.
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./Messages",
	"./getResourceBundle",
	"sap/base/util/array/uniqueSort",
	"sap/base/Log"
], function(
	ManagedObject,
	Messages,
	getResourceBundle,
	uniqueSort,
	Log
) {
	"use strict";

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
	 * @abstract
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.NodeHierarchy
	 */
	var NodeHierarchy = ManagedObject.extend("sap.ui.vk.NodeHierarchy", /** @lends sap.ui.vk.NodeHierarchy.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			"abstract": true,

			events: {
				/**
				 * This event will be fired when the node hierarchy changes, e.g. a node is added or removed.
				 */
				changed: {},

				/**
				 * This event will be fired when a new node is created.
				 */
				nodeCreated: {
					parameters: {
						nodeRef: {
							type: "any"
						},
						nodeId: {
							type: "string"
						}
					}
				},

				/**
				 * This event will be fired when a node is about to be removed.
				 */
				nodeRemoving: {
					parameters: {
						nodeRef: {
							type: "any"
						},
						nodeId: {
							type: "string"
						}
					}
				},

				nodeReplaced: {
					parameters: {
						ReplacedNodeRef: {
							type: "any"
						},
						ReplacementNodeRef: {
							type: "any"
						},
						ReplacedNodeId: {
							type: "string"
						},
						ReplacementNodeId: {
							type: "string"
						}
					}
				},

				nodeUpdated: {
					parameters: {
						nodeRef: {
							type: "any"
						},
						nodeId: {
							type: "string"
						}
					}
				}
			}
		}
	});

	/**
	 * Gets the scene reference that this NodeHierarchy object wraps.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#getSceneRef
	 *
	 * @returns {any} The scene reference that this NodeHierarchy object wraps.
	 * @public
	 */

	/**
	 * Gets the Scene object the node hierarchy belongs to.
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#getScene
	 * @returns {sap.ui.vk.Scene} The Scene object the node hierarchy belongs to.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Enumerates the child nodes of a particular node in the Scene object.
	 *
	 * This method gets the child nodes of a particular node, and then calls the <code>callback</code> function to which it passes the child nodes to one by one.<br/>
	 * The <code>BaseNodeProxy</code> objects passed to the <code>callback</code> function are temporary objects, which are reset after each call to the <code>callback</code> function.<br/>
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#enumerateChildren
	 *
	 * @param {any} [nodeRef] The reference object of a node whose child nodes we want enumerated.<br/>
	 * When <code>nodeRef</code> is specified, the child nodes of this node are enumerated.<br/>
	 * When no <code>nodeRef</code> is specified, only the top level nodes are enumerated.<br/>

	 * @param {function} callback A function to call when the child nodes are enumerated. The function takes one parameter of type {@link sap.ui.vk.BaseNodeProxy}, or string if parameter <code>passNodeRef</code> parameter is <code>true</code>.

	 * @param {boolean} [stepIntoClosedNodes=false] Indicates whether to enumerate the child nodes if the node is <i>closed</i>. <br/>
	 * If <code>true</code>, the children of that closed node will be enumerated <br/>
	 * If <code>false</code>, the children of that node will not be enumerated<br/>

	 * @param {boolean} [passNodeRef=false] Indicates whether to pass the reference objects of the child nodes, or the whole node proxy to the <code>callback</code> function. <br/>
	 * If <code>true</code>, then only the reference objects of the child nodes are passed to the <code>callback</code> function. <br/>
	 * If <code>false</code>, then the node proxies created from the child reference objects are passed to the <code>callback</code> function.

	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Enumerates the ancestor nodes of a particular node in the Scene object.
	 *
	 * This method enumerates the ancestor nodes of a particular node, and then calls the <code>callback</code> function, to which it passes the ancestor nodes to one by one.<br/>
	 * The BaseNodeProxy objects passed to <code>callback</code> are temporary objects, they are reset after each call to the <code>callback</code> function.<br/>
	 * The ancestor nodes are enumerated starting from the top level node, and progresses down the node hierarchy.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#enumerateAncestors
	 *
	 * @param {any} nodeRef The reference object of a node whose ancestor nodes we want enumerated.

	 * @param {function} callback A function to call when the ancestor nodes are enumerated. The function takes one parameter of type {@link sap.ui.vk.BaseNodeProxy}, or string if parameter <code>passNodeRef</code> parameter is <code>true</code>.

	 * @param {boolean} [passNodeRef=false] Indicates whether to pass the reference objects of the ancestor nodes, or the whole node proxy to the <code>callback</code> function.<br/>
										 If <code>true</code>, then only the reference objects of the ancestor nodes are passed to the <code>callback</code> function. <br/>
										 If <code>false</code>, then the node proxies of the ancestor nodes are passed to the <code>callback</code> function.

	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Creates a node proxy object.
	 *
	 * The node proxy object must be destroyed with the {@link #destroyNodeProxy destroyNodeProxy} method.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#createNodeProxy
	 *
	 * @param {any} nodeRef The reference object for which to create a proxy object.
	 * @returns {sap.ui.vk.NodeProxy} The proxy object.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Destroys the node proxy object.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#destroyNodeProxy
	 *
	 * @param {sap.ui.vk.NodeProxy} nodeProxy The node proxy object.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Returns a list of reference objects belonging to the children of a particular node.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#getChildren
	 *
	 * @param {any} nodeRef The reference object of the node whose children will be returned. If <code>nodeRef</code> is not passed to the <code>getChildren</code> function, the reference objects of the root nodes will be returned.
	 * @param {boolean} [stepIntoClosedNodes=false] Indicates whether to return only the child nodes of a <i>closed</i> node or not. If <code>true</code>, then the children of that closed node  will be returned. If <code>false</code>, then the children of that <i>closed</i> node will not be returned.
	 * @returns {any[]} A list of reference objects belonging to the children of <code>nodeRef</code>.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Returns a list of reference objects belonging to the ancestors of a particular node.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#getAncestors
	 *
	 * @param {any} nodeRef The reference object of the node whose ancestors will be returned.
	 * @returns {any[]} A list of reference objects belonging to the ancestors of <code>nodeRef</code>.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Searches for VE IDs, and returns a list of reference objects of nodes with VE IDs matching the search.
	 * The query is run specifically against VE ID structures, which are strictly related to VDS4 models.
	 *
	 * @param {object} query JSON object containing the search parameters. <br/>
	 * The following example shows what the structure of the <code>query</code> object should look like:
	 * <pre>query = {
	 * 	source: <i>string</i> (if not specified, the query returns an empty array), <br>
	 * 	type: <i>string</i> (if not specified, the query returns an empty array), <br>
	 * 	fields: <i>field[]</i>
	 * 	}</pre>
	 * 	<br/>
	 * 	<ul>
	 * 		<li>
	 * 			<b>field.name</b><br/> A string containing the name of the VE ID.
	 * 			If no value is specified, then the query will return an empty array.<br/>
	 * 		</li>
	 * 		<li>
	 * 			<b>field.value</b><br/> A string representing the search keyword.
	 * 			If no value is specified, it defaults to empty string.<br/>
	 * 			The following example shows a string being passed in:
	 * 			<pre>value: "Box #14"</pre>
	 * 		</li>
	 * 		<li>
	 * 			<b>field.predicate</b><br/> Represents a search mode.
	 * 			The available search modes are <code>"equals"</code>, <code>"contains"</code>, and <code>"startsWith"</code>. <br/>
	 * 			Using <code>"equals"</code> will search for IDs with names that exactly match the provided string. <br/>
	 * 			Using <code>"contains"</code> will search for IDs with names containing the provided string. <br/>
	 * 			Using <code>"startsWith"</code> will search for IDs with names starting with the provided string. <br/>
	 * 			If no value is specified, the search mode will default to <code>"equals"</code>. <br/><br/>
	 * 		</li>
	 * 		<li>
	 * 			<b>field.caseSensitive</b><br/> Indicates whether the search should be case sensitive or not. <br/>
	 * 			If <code>true</code>, the search will be case sensitive, and <code>false</code> indicates otherwise. <br/>
	 * 			If no value is specified, <code>caseSensitive</code> will default to <code>false</code> (that is, the search will be a case-insensitive search).
	 * 		</li>
	 * 	</ul>
	 * @returns {any[]} A list of reference objects belonging to nodes that matched the VE IDs search criteria.
	 * @public
	 * @since 1.50.0
	 */
	NodeHierarchy.prototype.findNodesById = function(query) {

		// Checking if the query id values should be case sensitive or not.
		// If they are not case sensitive, we make them all lower-case.
		if (query.fields.some(function(field) { return !field.caseSensitive; })) {
			// we clone the query object that gets passed as parameter so we don't modify the original one.
			query = jQuery.extend(true, {}, query);
			// we change all the search values to lower-case.
			query.fields.forEach(function(field) {
				if (!field.caseSensitive) {
					field.value = field.value.toLowerCase();
				}
			});
		}

		// compareValuesByPredicate compares query value for an id with the value of a ve id from the node.
		// This function compares them using the predicate from the query (equals, contains, startsWith)
		var compareValuesByPredicate = function(predicate, isCaseSensitive, veFieldValueString, queryFieldValue) {
			var matchFound;
			// if the predicate is undefined, it will default to "equals"
			predicate = predicate || "equals";
			// if the query value is undefined, we make it an empty string
			queryFieldValue = queryFieldValue || "";

			var veFieldValue = isCaseSensitive ? veFieldValueString : veFieldValueString.toLowerCase();

			switch (predicate) {
				case "equals":
					matchFound = (veFieldValue === queryFieldValue);
					break;
				case "contains":
					matchFound = (veFieldValue.indexOf(queryFieldValue) !== -1);
					break;
				case "startsWith":
					matchFound = (veFieldValue.indexOf(queryFieldValue) === 0);
					break;
				default:
					matchFound = false;
					// if the predicate is not a supported one, we show a relevant error in the console
					Log.error(getResourceBundle().getText(Messages.VIT8.summary), Messages.VIT8.code, "sap.ui.vk.dvl.NodeHierarchy");
			}
			return matchFound;
		};
		// Queries can have multiple ids in the array so we use this function to search in array of ids
		// and see if the id is missing from that list or not.
		var isQueryIdObjectMissingFromArrayOfIds = function(listOfFields, queryFieldObject) {
			return !listOfFields.some(function(veFieldObject) {
				return queryFieldObject.name === veFieldObject.name ? compareValuesByPredicate(queryFieldObject.predicate, queryFieldObject.caseSensitive, veFieldObject.value, queryFieldObject.value) : false;
			});
		};

		// The filtering function takes the query and the collection of ve ids as parameters.
		// This function throws away all the nodes that are missing query ids from their list of ve ids.
		var filteringFunction = function(query, veIds) {
			// First we check if the query source and the query type are matching.
			// Then we check if all ids from the query are found in the list of ids that each node has.
			// If at least one id is missing, then we don't need to keep that node
			// because it doesn't match the query.
			return query.source === veIds.source && query.type === veIds.type && !query.fields.some(isQueryIdObjectMissingFromArrayOfIds.bind(undefined, veIds.fields));
		};

		// We retrieve a list of all node reference objects.
		var allNodeRefs = this.findNodesByName();

		// We filter the list of reference objects and we keep only what matches the query.
		var filteredNodeRefs = allNodeRefs.filter(function(nodeRef) {
			// We create a node proxy based on each node reference.
			var nodeProxy = this.createNodeProxy(nodeRef);
			// We retrieve the ve ids from each node proxy.
			var veIds = nodeProxy.getVeIds();
			// we destroy the node proxy after using it.
			this.destroyNodeProxy(nodeProxy);
			// we filter then return the nodes that match the query.
			return veIds.some(filteringFunction.bind(undefined, query));
		}.bind(this));

		return filteredNodeRefs;
	};

	/**
	 * Finds nodes in a scene via node name.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#findNodesByName
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
	 * @returns {any[]} A list of reference objects belonging to nodes that matched the search criteria.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Finds nodes in a scene via metadata information.
	 *
	 * @param {object} query JSON object containing the search parameters. <br/>
	 * The following example shows what the structure of the <code>query</code> object should look like:
	 * <pre>query = {
	 *   category: <i>string</i>,
	 *   key: <i>string</i>,
	 *   value: <i>string</i> | <i>string[]</i>,
	 *   predicate: <i>"equals"</i> | <i>"contains"</i> | <i>"startsWith"</i>,
	 *   caseSensitive: <i>true</i> | <i>false</i>
	 * }</pre>
	 * <br>
	 * <i>NOTE: <code>query.predicate</code> and <code>query.caseSensitive</code> refer to <code>query.value</code>.</i>
	 * <br/>
	 * <ul>
	 *   <li>
	 *     <b>query.category</b><br/>
	 *     A string indicating the name of the metadata category.<br/>
	 *     If no value is specified for <code>query.category</code>, all nodes in the scene will be returned in the search.<br/><br/>
	 *   </li>
	 *   <li>
	 *     <b>query.key</b><br/>
	 *     A string indicating the key which belongs to the metadata category specified in <code>query.category</code>.
	 *     You can only use <code>query.key</code> if <code>query.category</code> has been specified.<br/>
	 *     If no value is specified for <code>query.key</code>, then all nodes grouped under the specified category will be returned in the search.<br/><br/>
	 *   </li>
	 *   <li>
	 *     <b>query.value</b><br/>
	 *     A string or an array of strings containing the value or values associated with <code>query.key</code>.
	 *     You can only use <code>query.value</code> in the search if <code>query.key</code> has been specified.<br/>
	 *     If no value is specified for <code>query.value</code>, then all nodes containing the specified key will be returned, regardless of what the value of the key is.<br/>
	 *     The following example shows a single string being passed in:
	 *     <pre>value: "Box #14"</pre>
	 *     The following example shows an array of strings being passed in:
	 *     <pre>value: ["Box #3", "box #4", "BOX #5"]</pre>
	 *   </li>
	 *   <li>
	 *     <b>query.predicate</b><br/>
	 *     Represents a search mode.
	 *     The available search modes are <code>"equals"</code>, <code>"contains"</code>, and <code>"startsWith"</code>. <br/>
	 *     Using <code>"equals"</code> will search for key values that exactly match the provided string or array of strings. <br/>
	 *     Using <code>"contains"</code> will search for key values containing all or part of the provided string or array of strings. <br/>
	 *     Using <code>"startsWith"</code> will search key values starting with the provided string or array of strings. <br/>
	 *     If no value is specified, the search mode will default to <code>"equals"</code>. <br/><br/>
	 *   </li>
	 *   <li>
	 *     <b>query.caseSensitive</b><br/> Indicates whether the search should be case sensitive or not. <br/>
	 *     If <code>true</code>, the search will be case sensitive, and <code>false</code> indicates otherwise. <br/>
	 *     If no value is specified, <code>caseSensitive</code> will default to <code>false</code> (that is, the search will be a case-insensitive search).
	 *   </li>
	 * </ul>
	 * @returns {any[]} A list of reference objects belonging to nodes that matched the search criteria.
	 * @public
	 * @since 1.50.0
	 */
	NodeHierarchy.prototype.findNodesByMetadata = function(query) {

		// checkMetadataByPredicate is used for filtering all nodes
		// so we can keep only the ones that match the query.
		var checkMetadataByPredicate = function(metadata, category, key, values, predicate, caseSensitive) {
			if (metadata && metadata.hasOwnProperty(category)) {
				var metadataCategory = metadata[category];
				if (metadataCategory.hasOwnProperty(key)) {
					var metadataValue = metadataCategory[key];
					if (!caseSensitive) {
						metadataValue = metadataValue.toLowerCase();
					}
					return values.some(predicate.bind(undefined, metadataValue));
				}
			}
			return false;
		};

		// checkMetadataByCategory looks inside the metadata to see
		// if it contains the category we are querying on.
		var checkMetadataByCategory = function(metadata, category) {
			return metadata && metadata.hasOwnProperty(category);
		};

		// getFilteredResults filters the entire list of nodes
		// and returns only what matches the query.
		var getFilteredResults = function(allNodeRefs, filteringFunction, category, key, values, predicate, caseSensitive) {
			// We get all nodes, get metadata from each node and manually filter it against the query.
			// initialize empty baseNodeProxy
			var nodeProxy = this._baseNodeProxyPool.borrowObject();
			// filter the whole node collection so we can keep only the nodes that match the query
			var result = allNodeRefs.filter(function(nodeRef) {
				// get the node with the current id
				nodeProxy.init(this, nodeRef);
				// extract metadata from node
				var metadata = nodeProxy.getNodeMetadata();
				// check if the metadata matches the query
				var keepThisNode = filteringFunction(metadata, category, key, values, predicate, caseSensitive);
				// clear the data from the base node proxy
				nodeProxy.reset();
				// filter the current node
				return keepThisNode;
			}.bind(this));
			this._baseNodeProxyPool.returnObject(nodeProxy);
			return result;
		};

		// Get all nodes as a start point.
		var allNodeRefs = this.findNodesByName(),
			result = [];

		if (query === undefined || query === null || jQuery.isEmptyObject(query)) {
			// If the query object is empty, we return a list of all nodes.
			result = allNodeRefs;
		} else if (query.category !== null && query.category !== undefined && query.category !== "") {
			var filteringFunction,
				values,
				predicateName,
				predicate,
				caseSensitive = !!(query && query.caseSensitive);
			// We determine what filtering type to use.
			// Filtering by category only as opposed to filtering by category and key-value pairs.
			if (query.key === undefined || query.key === null) {
				// If we specify the category, but not the key-value pairs,
				// we return all nodes that have that particular category.
				filteringFunction = checkMetadataByCategory;
			} else {
				// If the category and the key are specified, but the value is omitted,
				// it is expected that we return a list of all nodes containing that category
				// and that key, no matter what the value for the key is. That's why we set the
				// value to empty string and predicate to "contains".
				values = query.value;
				predicateName = query.predicate || "equals";
				if (values === undefined || values === null) {
					values = "";
					predicateName = "contains";
				}
				// If the category and the key-value pair are specified,
				// we return the nodes that match this criteria.
				if (!Array.isArray(values)) {
					values = [values];
				}
				if (!caseSensitive) {
					values = values.map(function(value) {
						return value.toLowerCase();
					});
				}
				switch (predicateName) {
					case "equals":
						predicate = function(metadataValue, queryValue) {
							return metadataValue === queryValue;
						};
						break;
					case "contains":
						predicate = function(metadataValue, queryValue) {
							return metadataValue.indexOf(queryValue) !== -1;
						};
						break;
					case "startsWith":
						predicate = function(metadataValue, queryValue) {
							return metadataValue.indexOf(queryValue) === 0;
						};
						break;
					default:
						Log.error(getResourceBundle().getText(Messages.VIT9.summary), Messages.VIT9.code, "sap.ui.vk.dvl.NodeHierarchy");
				}
				filteringFunction = checkMetadataByPredicate;
			}
			// After determining what filtering function we use,
			// we pass it as an argument to getFilteredResults.
			result = getFilteredResults.bind(this)(allNodeRefs, filteringFunction, query.category, query.key, values, predicate, caseSensitive);
		} else {
			Log.error(getResourceBundle().getText(Messages.VIT10.summary), Messages.VIT10.code, "sap.ui.vk.dvl.NodeHierarchy");
		}
		return uniqueSort(result);
	};

	NodeHierarchy.prototype._appendAncestors = function(nodeRefs, skipNodeRefs) {
		skipNodeRefs = skipNodeRefs ? new Set(skipNodeRefs) : null;
		var nodeSet = new Set(nodeRefs);
		nodeRefs.forEach(function(nodeRef) {
			var ancestors = this.getAncestors(nodeRef);
			ancestors.forEach(function(ancestorNodeRef) {
				if (skipNodeRefs === null || !skipNodeRefs.has(ancestorNodeRef)) {
					nodeSet.add(ancestorNodeRef);
				}
			});
		}, this);

		return Array.from(nodeSet);
	};

	/**
	 * Creates a layer proxy object.
	 *
	 * The layer proxy object must be destroyed with the {@link #destroyLayerProxy destroyLayerProxy} method.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#createLayerProxy
	 *
	 * @param {string} layerId The layer ID for which to create a proxy object.
	 * @returns {sap.ui.vk.LayerProxy} The proxy object.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Destroys the layer proxy object.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#destroyLayerProxy
	 *
	 * @param {sap.ui.vk.LayerProxy} layerProxy The layer proxy object.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Returns a list of layer IDs.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#getLayers
	 *
	 * @returns {string[]} A list of layer IDs.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Returns a list of hotspot IDs.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#getHotspotNodeIds
	 *
	 * @returns {string[]} A list of hotspot IDs.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Creates a new node.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#createNode
	 *
	 * @param {any} parentNode       The reference object of the parent node where the created node is added to. If equals <code>null</code> the newly
	 *                               created node is a top level node.
	 * @param {string} name          The name of the new node.
	 * @param {any} insertBeforeNode The created node is added before this specified node. If equals <code>null</code> the newly created
	 *                               node is added at the end of the parent's list of nodes.
	 * @param {sap.ui.vk.NodeContentType} [nodeContentType=sap.ui.vk.NodeContentType.Regular] The created node content type.
	 * @param {object} [content]     Optional Json structure used to define node properties.
	 * @returns {any} The reference object of the newly created node.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Get node content type
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#getNodeContentType
	 *
	 * @param {any} nodeRef	The node reference
	 * @returns {sap.ui.vk.NodeContentType} Node content type
	 * @public
	 * @since 1.73.0
	 */


	/**
	 * Creates a copy of an existing node.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#createNodeCopy
	 *
	 * @param {any} nodeToCopy       The reference object of the node to copy.
	 * @param {any} parentNode       The reference object of the parent node where the created node is added to. If equals <code>null</code> the newly
	 *                               created node is a top level node.
	 * @param {string} name          The name of the new node.
	 * @param {any} insertBeforeNode The created node is added before this specified node. If equals <code>null</code> the newly created
	 *                               node is added at the end of the parent's list of nodes.
	 * @returns {any} The reference object of the newly created node.
	 * @public
	 * @since 1.50.0
	 */

	/**
	 * Deletes a node and destroys it.
	 *
	 * @function
	 * @name sap.ui.vk.NodeHierarchy#removeNode
	 *
	 * @param {any} nodeRef The reference object of the node to destroy.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */

	return NodeHierarchy;
});
