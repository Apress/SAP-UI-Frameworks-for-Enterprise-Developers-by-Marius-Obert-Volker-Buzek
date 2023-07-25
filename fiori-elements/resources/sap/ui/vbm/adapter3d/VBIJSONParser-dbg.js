/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.vbm.adapter3d.VBIJSONParser
sap.ui.define([
	"sap/ui/base/Object",
	"./Utilities",
	"./ObjectFactory",
	"sap/base/Log",
	"./../library"
], function(BaseObject, Utilities, ObjectFactory, Log, library) {
	"use strict";

	var thisModule = "sap.ui.vbm.VBIJSONParser";
	var toArray = Utilities.toArray;

	// The VBI JSON parser expects the following sequence of payloads.
	//
	// 1. An initial VBI JSON payload. It usually contains the following sections:
	//   1.1. Resources
	//   1.2. DataTypes
	//   1.3. Windows - the main 3D or geo scene
	//   1.4. Scenes - the main 3D or geo scene
	//       1.4.1. VO - visual object templates for the main 3D or geo scene
	//   1.5. Actions
	//
	// 2. Subsequent VBI JSON payloads usually contain the following sections:
	//   2.1. Data - VO instances for the main 3D or geo scenes, and/or VO instances for detail windows.
	//   2.2. Windows - for detail window
	//   2.3. Scenes - for detail window
	//       2.3.1 VO - visual object templates for detail window
	//   2.4. Actions - for detail window

	/**
	 * Constructor for VBIJSONParser.
	 *
	 * @param {object}   context                       An object with the following structure.
	 * @param {Map}      context.resources             A map from resource names to resource content.
	 * @param {object}   context.dataTypes             An array of data type objects.
	 * @param {object}   context.data                  A data object.
	 * @param {object[]} context.windows               An array of window objects. A window object can be 3D Window or Detail Window.
	 * @param {object[]} context.scenes                An array of scene objects. There are two types of scenes supported in Adapter3D - 3D scene and Detail Window scene.
	 * @param {object[]} context.actions               An array of actions. The elements of this array are references to the original actions in VBI JSON.
	 * @param {object}   context.voQueues              An object with lists of visual objects to add, update or remove.
	 * @param {Map}      context.voQueues.toAdd        An map whose key is a scene object and values are the scene's visual objects to be added.
	 * @param {Map}      context.voQueues.toUpdate     An map whose key is a scene object and values are the scene's visual objects to be updated.
	 * @param {Map}      context.voQueues.toRemove     An map whose key is a scene object and values are the scene's visual objects to be removed.
	 * @param {object}   context.windowQueues          An object with lists of windows to add, update or remove.
	 * @param {object[]} context.windowQueues.toAdd    An array of windows to add.
	 * @param {object[]} context.windowQueues.toUpdate An array of windows to update.
	 * @param {object[]} context.windowQueues.toRemove An array of windows to remove.
	 *
	 * @class
	 * Provides a base class for VBIJSONParser.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vbm.adapter3d.VBIJSONParser
	 */
	var VBIJSONParser = BaseObject.extend("sap.ui.vbm.adapter3d.VBIJSONParser", /** @lends sap.ui.vbm.adapter3d.VBIJSONParser.prototype */ {

		constructor: function(context) {
			BaseObject.call(this);

			this._context = context;
			this._factory = new ObjectFactory();
		}
	});

	/**
	 * Parses the VBI JSON.
	 *
	 * As a result of parsing the context object is updated to reflect the current state.
	 *
	 * The context.voQueues and context.windowQueues queues are populated with visual objects and windows that
	 * need to be added, updated or removed as a result of the VBI JSON parsing.
	 *
	 * The calling code is responsible for cleaning those queues.
	 *
	 * @param {object} payload The VBI JSON Payload to be processed.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @public
	 */
	VBIJSONParser.prototype.loadVBIJSON = function(payload) {
		if (payload && payload.SAPVB) {
			// Resources
			if (payload.SAPVB.Resources) {
				this._processResources(payload.SAPVB.Resources);
			}

			// Config
			if (payload.SAPVB.Config) {
				this._processConfig(payload.SAPVB.Config);
			}

			// DataTypes
			if (payload.SAPVB.DataTypes) {
				this._processDataTypes(payload.SAPVB.DataTypes);
			}

			// Data
			if (payload.SAPVB.Data) {
				this._processData(payload.SAPVB.Data);
			}

			// Scenes
			if (payload.SAPVB.Scenes) {
				this._processScenes(payload.SAPVB.Scenes);
			}

			// Windows
			if (payload.SAPVB.Windows) {
				this._processWindows(payload.SAPVB.Windows);
			}

			// Actions
			if (payload.SAPVB.Actions) {
				this._processActions(payload.SAPVB.Actions);
			}

			// Automation
			if (payload.SAPVB.Automation) {
				this._processAutomation(payload.SAPVB.Automation);
			}

			if (payload.SAPVB.Data || payload.SAPVB.Scenes) {
				this._refreshVisualObjects();
			}
		}

		return this;
	};

	////////////////////////////////////////////////////////////////////////////
	// region: Helper functions

	/**
	 * Copies the named properties from the source to the target if the properties exist in the source.
	 *
	 * @param {object}   target        The target object.
	 * @param {object}   source        The source object.
	 * @param {string[]} sourcePropertyNames The list of properties to copy from source object.
	 * @param {string[]} targetPropertyNames The list of property names on target object.
	 * @return {object} The target object
	 * @private
	 */
	var copyProperties = function(target, source, sourcePropertyNames, targetPropertyNames) {
		targetPropertyNames = toArray(targetPropertyNames);
		for (var i = 0, count = sourcePropertyNames.length; i < count; ++i) {
			var sourcePropertyName = sourcePropertyNames[i];
			var targetPropertyName = targetPropertyNames.length > i ? targetPropertyNames[i] : sourcePropertyName;
			if (source.hasOwnProperty(sourcePropertyName)) {
				target[targetPropertyName] = source[sourcePropertyName];
			}
		}
		return target;
	};

	// endregion: Helper functions
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Resources

	/**
	 * Processes the resources section of VBI JSON.
	 *
	 * @param {object} resources The resources section of VBI JSON.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._processResources = function(resources) {
		// Delta not supported
		toArray(resources.Set.Resource).forEach(function(res) {
			this._context.resources.set(res.name, res.value);
		}, this);
		return this;
	};

	// endregion: Resources
	////////////////////////////////////////////////////////////////////////////


	////////////////////////////////////////////////////////////////////////////
	// region: Config

	/**
	 * Processes the config section of VBI JSON.
	 *
	 * @param {object} config The config section of VBI JSON.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	 VBIJSONParser.prototype._processConfig = function(config) {
		// Delta not supported
		toArray(config.Set.P).forEach(function(cfg) {
			this._context.config.set(cfg.name, cfg.value);
		}, this);
		return this;
	};

	// endregion: config
	////////////////////////////////////////////////////////////////////////////


	////////////////////////////////////////////////////////////////////////////
	// region: DataTypes

	/**
	 * Processes the data types section of VBI JSON.
	 *
	 * The method converts from VBI JSON structure into a tree of data type nodes.
	 * See dataTypePrototype and dataTypeAttributePrototype in ObjectFactory.js.
	 *
	 * @param {object} dataTypes The DataTypes section of VBI JSON.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._processDataTypes = function(dataTypes) {
		// Adapter3D supports only the single Set verb with no type attribute, which means delete all data type nodes
		// and create everything from scratch.
		if (dataTypes && dataTypes.Set && !Array.isArray(dataTypes.Set) && !dataTypes.Set.name) {
			this._context.dataTypes.splice(0);

			var create = function(dataTypeElement) {
				var dataType = copyProperties(this._factory.createDataType(), dataTypeElement, ["name", "key", "minSel", "maxSel"]);

				toArray(dataTypeElement.A).forEach(function(attributeElement) {
					dataType.attributes.push(copyProperties(this._factory.createDataTypeAttribute(), attributeElement, ["name", "alias", "type"]));
				}, this);

				// Nested data types processed to one level deep only
				toArray(dataTypeElement.N).forEach(function(childDataTypeElement) {
					dataType.dataTypes.push(create(childDataTypeElement));
				});

				return dataType;
			}.bind(this);

			toArray(dataTypes.Set.N).forEach(function(dataTypeElement) {
				this._context.dataTypes.push(create(dataTypeElement));
			}, this);
		} else {
			Log.error("DataTypes: only the Set verb with no type attribute is supported.", "", thisModule);
		}

		return this;
	};

	/**
	 * Finds data type by path.
	 *
	 * @param {string[]} path The path to the data type.
	 * @returns {object|undefined} The data type object, or <code>undefined</code> if not found.
	 * @private
	 */
	VBIJSONParser.prototype._findDataTypeByPath = function(path) {
		var find = function(dataTypes, level) {
			if (level > path.length) {
				return undefined;
			}
			var typeName = path[level - 1];
			for (var i = 0, count = dataTypes.length; i < count; ++i) {
				var dataType = dataTypes[i];
				if (dataType.name === typeName) {
					if (level === path.length) {
						return dataType;
					} else {
						return find(dataType.dataTypes, level + 1);
					}
				}
			}
			return undefined;
		};
		return find(this._context.dataTypes, 1);
	};

	/**
	 * Finds data type by data node path.
	 *
	 * Data node path contains indices, e.g. [ 'DetailData', '0', 'Column', '4' ], the result of such search would be
	 * the data type identified by path DetailData.Column.
	 *
	 * @param {string[]} dataNodePath The data node path.
	 * @returns {object|undefined} The data type object, or <code>undefined</code> if not found.
	 * @private
	 */
	VBIJSONParser.prototype._findDataTypeByDataNodePath = function(dataNodePath) {
		var dataTypePath = [];
		for (var i = 0, count = (dataNodePath.length + 1) / 2; i < count; ++i) {
			dataTypePath.push(dataNodePath[i * 2]);
		}
		return this._findDataTypeByPath(dataTypePath);
	};

	// endregion: DataTypes
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Data

	/**
	 * Processes the data section of VBI JSON.
	 *
	 * Converts VBI JSON into internal data representation.
	 *
	 * @param {object} data The Data section of VBI JSON.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._processData = function(data) {
		// Adapter3D supports only the Remove verb with type 'E' and the 'E' elements with keys.
		toArray(data.Remove).forEach(function(removeElement) {
			if (removeElement.type !== "E") {
				Log.error("Data: the Remove verb is supported for the 'E' type only.", removeElement.type, thisModule);
				return;
			}
			if (!removeElement.name) {
				Log.error("Data: the Remove verb must have the non-empty name attribute.", "", thisModule);
				return;
			}
			var dataType = this._findDataTypeByPath(removeElement.name.split("."));
			if (!dataType) {
				Log.error("Data: the Remove verb is supported for data nodes with data types only.", removeElement.name, thisModule);
				return;
			}
			var keyAttribute = dataType.getKeyAttribute();
			if (!keyAttribute) {
				Log.error("Data: the Remove verb is supported for data types with keys only.", removeElement.name, thisModule);
				return;
			}
			var dataInstanceKeys = toArray(removeElement.N.E).map(function(instanceElement) { return instanceElement[keyAttribute.alias]; });
			var dataNode = this._findDataNodeByPath(removeElement.name.split("."));
			if (!dataNode) {
				if (dataInstanceKeys.length > 0) {
					Log.warning("Data: unknown data node.", removeElement.name, thisModule);
				}
				return;
			}
			this._removeDataInstancesByKey(dataNode, keyAttribute.name, dataInstanceKeys);
		}, this);

		// Adapter3D only supports either a single Set verb with no name attribute and multiple N elements
		// or multiple Set verbs with the name attribute and the single data node (the N element).

		var loadDataNode = function(dataNode, nodeElement, dataTypePath) {
			var dataType = this._findDataTypeByPath(dataTypePath);
			var keyAttribute = dataType && dataType.getKeyAttribute();
			toArray(nodeElement.E).forEach(function(instanceElement, index) {
				// If the data type does not have key then use the element's natural order index.
				// The explicit VB:ix is not supported yet.
				var instance = keyAttribute
					? sap.ui.vbm.findInArray(dataNode, function(instance) { return instance[keyAttribute.name] === instanceElement[keyAttribute.alias]; })
					: dataNode[index];
				if (!instance) {
					instance = this._factory.createDataInstance();
					if (keyAttribute) {
						dataNode.push(instance);
					} else {
						dataNode[index] = instance;
					}
				}
				instance.isDirty = true;
				for (var prop in instanceElement) {
					if (prop === "N") {
						if (instanceElement.N.name) {
							loadDataNode(
								instance[instanceElement.N.name] || (instance[instanceElement.N.name] = this._factory.createDataNode()),
								instanceElement.N, dataTypePath.concat(instanceElement.N.name)
							);
						} else {
							Log.error("Data: child data nodes must have names.", "", thisModule);
						}
					} else {
						var attribute = dataType.getAttributeByAlias(prop);
						if (attribute) {
							instance[attribute.name] = instanceElement[prop];
						} else {
							// Attributes like VB:c, VB:s, VB:ix are well-known attributes,
							// usually without definitions in the DataTypes section.
							instance[prop] = instanceElement[prop];
						}
					}
				}
			}, this);
		}.bind(this);

		var setElements = toArray(data.Set);
		if (setElements.length === 1 && !setElements[0].name) {
			this._removeAllDataNodes();
			toArray(setElements.N).forEach(function(nodeElement) {
				loadDataNode((this._context.data[nodeElement.name] = this._factory.createDataInstance()), nodeElement, [nodeElement.name]);
			}, this);
		} else if (setElements.length > 0) {
			if (setElements.some(function(setElement) { return !setElement.name; })) {
				Log.error("Data: if there are multiple Set verbs then all Set verbs must have the non-empty name attribute.", "", thisModule);
				return this;
			}
			if (setElements.some(function(setElement) { return !setElement.N || toArray(setElement.N).length > 1; })) {
				Log.error("Data: all Set verbs with the name attribute must have the single N element.", "", thisModule);
				return this;
			}
			setElements.forEach(function(setElement) {
				var nodePath = setElement.name.split(".");
				if (nodePath.length !== 1) {
					Log.error("Compound data node paths are not supported yet.", "", thisModule);
				}
				// ZUTUN: when we support composite node paths this code needs to be changed to extract
				// data type path from node path. E.g. DetailData.2.Column.3 -> DetailData.Column.
				loadDataNode(
					this._findDataNodeByPath(nodePath) || (this._context.data[setElement.name] = this._factory.createDataNode()),
					setElement.N,
					[nodePath[0]]
				);
			}, this);
		}

		return this;
	};

	/**
	 * Finds data node by path.
	 *
	 * @param {string} path The path to the data node.
	 * @returns {object|undefined} The data object, or <code>undefined</code> if not found.
	 * @private
	 */
	VBIJSONParser.prototype._findDataNodeByPath = function(path) {
		if (path.length > 1) {
			Log.error("Compound paths for data nodes are not supported yet.", path, thisModule);
			return undefined;
		}
		return this._context.data[path[0]];
	};

	/**
	 * Gets the value from the data section by path.
	 *
	 * @param {string[]} path The path to data value.
	 * @returns {string|undefined} The value found at the path or <code>undefined</code> if not found.
	 * @private
	 */
	VBIJSONParser.prototype._getDataValueByPath = function(path) {
		if (path.length % 2 !== 1) {
			Log.error("The absolute path to data value must contain an odd number of elements.", path.join("."), thisModule);
			return undefined;
		}
		var data;
		var instance;
		for (var i = 0, count = path.length; i < count; ++i) {
			var pathComponent = path[i];
			if (i % 2 === 0) {
				// Attribute's name if it the last elemeny in the path, data node's name otherwise.
				if (i === count - 1) {
					return instance && instance[pathComponent];
				} else {
					data = (i == 0 ? this._context.data : instance)[pathComponent];
					if (data === undefined) {
						return undefined;
					}
				}
			} else {
				// Instance index.
				instance = data[pathComponent];
				if (instance === undefined) {
					return undefined;
				}
			}
		}
		return undefined;
	};

	/**
	 * Removes all data nodes.
	 *
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._removeAllDataNodes = function() {
		// Remove data nodes recursively.
		//this._context.data.splice(0).forEach(this._clearDataNode, this);
		for (var dataNodeName in this._context.data) {
			this._clearDataNode(this._context.data[dataNodeName]);
			delete this._context.data[dataNodeName];
		}
		return this;
	};

	/**
	 * Clears data node.
	 *
	 * All child data instances and data nodes are removed recursively as well.
	 *
	 * @param {object} dataNode The data node to remove.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._clearDataNode = function(dataNode) {
		// Remove child data instances recursively.
		dataNode.splice(0).forEach(this._clearDataInstance, this);
		return this;
	};

	/**
	 * Clears data instance.
	 *
	 * All child data nodes and data instances are removed recursively as well.
	 *
	 * @param {object} dataInstance The data instance to remove.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._clearDataInstance = function(dataInstance) {
		if (dataInstance.visualObject) {
			this._removeVisualObject(dataInstance.visualObject);
		}
		// Remove child data nodes recursively.
		for (var propName in dataInstance) {
			if (Array.isArray(dataInstance[propName])) {
				this._clearDataNode(dataInstance[propName]);
				delete dataInstance[propName];
			}
		}
		return this;
	};

	/**
	 * Removes data instances from a data node.
	 *
	 * @param {object}   dataNode The data node to remove instances from.
	 * @param {string}   keyName  The name of the key attribute.
	 * @param {string[]} keys     The key values of data instances to remove.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._removeDataInstancesByKey = function(dataNode, keyName, keys) {
		for (var i = dataNode.length - 1; i >= 0 && keys.length > 0; --i) {
			var dataInstance = dataNode[i];
			var instanceKey = dataInstance[keyName];
			for (var k = keys.length - 1; k >= 0; --k) {
				if (instanceKey === keys[k]) {
					this._clearDataInstance(dataInstance);
					// For each key there might be only one instance. When we have found the instance to remove
					// we remove both the data instance and the key to reduce the search scope.
					dataNode.splice(i, 1);
					keys.splice(k, 1);
					break;
				}
			}
		}
		return this;
	};

	// endregion: Data
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Scenes

	/**
	 * Processes the Scenes section of VBI JSON.
	 *
	 * @param {object} data The Scenes section of VBI JSON.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._processScenes = function(data) {
		var loadScene = function(scene, sceneElement) {
			copyProperties(scene, sceneElement, ["id", "type", "initialStartPosition", "initialPitch", "initialYaw", "initialZoom"],
												["id", "type", "position", "pitch", "yaw", "zoom"]);

			if (scene.position || scene.zoom || scene.pitch || scene.yaw) {
				this._context.setupView = {
					position: scene.position,
					zoom: scene.zoom,
					pitch: scene.pitch,
					yaw: scene.yaw,
					home: true,
					flyTo: false
				};
			}

			toArray(sceneElement.VO).forEach(function(voElement) {
				var voGroup = scene.getVisualObjectGroupById(voElement.id);
				if (!voGroup) {
					voGroup = this._factory.createVisualObjectGroup(scene);
					for (var prop in voElement) {
						switch (prop) {
							case "id":
							case "datasource":
							case "type":
								voGroup[prop] = voElement[prop];
								break;
							case "DragSource":
							case "DropTarget":
								// Not implemented yet. Ignore these attributes.
								break;
							default:
								if (prop.endsWith(".bind")) {
									voGroup.isDataBound = true;
									var voAttribute = prop.split(".")[0];
									var path = voElement[prop].split(".");
									if (voElement["datasource"]) {
										path.shift();
									}
									voGroup.template[voAttribute] = { path: path };
								} else {
									voGroup.template[prop] = { value: voElement[prop] };
								}
								break;
						}
					}
				} else {
					// Updating existing VO was not supported in VB ActiveX.
					Log.warning("Scenes: cannot modify existing VO group.", voElement.id, thisModule);
				}
			}, this);
			return scene;
		}.bind(this);

		if (data.Remove) {
			this._removeScenes(toArray(data.Remove).map(function(removeElement) { return removeElement.name; }));
		}

		if (data.Set) {
			var setElements = toArray(data.Set);

			if (setElements.length === 1 && !setElements[0].name) {
				// Remove all scenes.
				this._removeScenes(this._context.scenes.map(function(scene) { return scene.id; }));
			} else if (setElements.length > 0) {
				// Remove named scenes.
				if (setElements.some(function(setElement) { return !setElement.name; })) {
					Log.error("Scenes: if there are multiple Set verbs then all Set verbs must have the non-empty name attribute.", "", thisModule);
					return this;
				}
				if (setElements.some(function(setElement) { return !setElement.Scene || toArray(setElement.Scene).length > 1; })) {
					Log.error("Scene: all Set verbs with the name attribute must have the single Scene element.", "", thisModule);
					return this;
				}
				if (setElements.some(function(setElement) { return setElement.name !== setElement.Scene.id; })) {
					Log.error("Scene: the Set's attribute 'name' must equal the Set.Scene's attribute 'id'.", "", thisModule);
					return this;
				}
				this._removeScenes(setElements.map(function(setElement) { return setElement.name; }));
			}

			setElements.forEach(function(setElement) {
				toArray(setElement.Scene || setElement.SceneGeo).forEach(function(sceneElement) {
					var scene = this._factory.createScene(!!setElement.SceneGeo);
					loadScene(scene, sceneElement);
					this._context.scenes.push(scene);
					this._context.sceneQueues.toAdd.push(scene);
				}, this);
			}, this);
		}

		if (data.Merge) {
			var mergeElements = toArray(data.Merge);

			if (mergeElements.length > 0) {
				if (mergeElements.some(function(mergeElement) { return !mergeElement.name; })) {
					Log.error("Scenes: all Merge elements must have the name attribute.", "", thisModule);
					return this;
				}
				if (mergeElements.some(function(mergeElement) { return !mergeElement.Scene || toArray(mergeElement.Scene).length > 1; })) {
					Log.error("Scenes: all Merge verbs must have the single Scene element.", "", thisModule);
					return this;
				}
				if (mergeElements.some(function(mergeElement) { return mergeElement.name !== mergeElement.Scene.id; })) {
					Log.error("Scenes: the Merge's attribute 'name' must equal the Merge.Scene's attribute 'id'.", "", thisModule);
					return this;
				}

				mergeElements.forEach(function(mergeElement) {
					toArray(mergeElement.Scene || mergeElement.SceneGeo).forEach(function(sceneElement) {
						var scene = this._findSceneById(mergeElement.name);
						if (scene) {
							loadScene(scene, sceneElement);
							this._context.sceneQueues.toUpdate.push(scene);
						}
					}, this);
				}, this);
			}
		}
		return this;
	};

	/**
	 * Finds a scene by ID.
	 *
	 * @param {string} id The scene ID.
	 * @returns {object|undefined} The scene object, or <code>undefined</code> if not found.
	 * @private
	 */
	VBIJSONParser.prototype._findSceneById = function(id) {
		for (var i = 0, count = this._context.scenes.length; i < count; ++i) {
			var scene = this._context.scenes[i];
			if (scene.id === id) {
				return scene;
			}
		}
		return undefined;
	};

	/**
	 * Removes the scenes.
	 *
	 * @param {string[]} ids The IDs of scenes to remove.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._removeScenes = function(ids) {
		for (var i = this._context.scenes.length - 1; i >= 0 && ids.length > 0; --i) {
			var scene = this._context.scenes[i];
			var sceneId = scene.id;
			for (var k = ids.length - 1; k >= 0; --k) {
				if (ids[k] === sceneId) {
					this._context.sceneQueues.toRemove.push(scene);
					// For each ID there might be only one scene. When we have found the scene to remove
					// we remove both the scene and the ID to reduce the search scope.
					this._context.scenes.splice(i, 1);
					ids.splice(k, 1);

					scene.voGroups.forEach(function(voGroup) {
						for (var i = voGroup.vos.length - 1; i >= 0; --i) {
							this._removeVisualObject(voGroup.vos[i]);
						}
					}, this);

					break;
				}
			}
		}
		return this;
	};

	/**
	 * Creates/updates visual objects.
	 *
	 * @param {object} voGroup The visual object group to process.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._processVisualObjectGroup = function(voGroup) {
		if (voGroup.isDataBound && voGroup.datasource) {
			// We support only simple bindable attributes relative to a data instance in form DataNodeName.AttributeName.
			// E.g.: Boxes.Position, where 'Boxes' is the data node name, and 'Position' is the attribute name.
			var dataNodePath = voGroup.datasource.split(".");
			var dataNode = this._findDataNodeByPath(dataNodePath);
			if (dataNode) {
				var dataType = this._findDataTypeByDataNodePath(dataNodePath);

				// Make copies from the DataTypes section for optimized access to these properties.
				if (dataType) {
					voGroup.maxSel = dataType.maxSel;
					voGroup.minSel = dataType.minSel;
					var keyAttribute = dataType.getKeyAttribute();
					if (keyAttribute) {
						voGroup.keyAttributeName = keyAttribute.name;
					}
				}

				dataNode.forEach(function(dataInstance) {
					if (dataInstance.visualObject) {
						if (dataInstance.isDirty || voGroup.isDirty) {
							this._queueVisualObjectToUpdate(voGroup.scene, this._populateVisualObject(dataInstance.visualObject, dataInstance));
						}
					} else {
						this._queueVisualObjectToAdd(voGroup.scene, this._populateVisualObject(this._factory.createVisualObject(voGroup), dataInstance));
					}
				}, this);
			} /* else {
				// No data yet. This might occur on the initial load.
			} */
		} else if (voGroup.vos.length === 0) {
			// Create a single instance of the visual object.
			this._queueVisualObjectToAdd(voGroup.scene, this._populateVisualObject(this._factory.createVisualObject(voGroup)));
		} else if (voGroup.vos.length === 1) {
			// Update the single instance of the visual object.
			// There might be attributes that reference different data instances.
			// Do not check for isDirty flag, always re-populate the visual object.
			this._queueVisualObjectToUpdate(voGroup.scene, this._populateVisualObject(voGroup.vos[0]));
		}

		return this;
	};

	/**
	 * Updates the flags of the VO to indicate deletion.
	 *
	 * @param {object} vo The VO whose flags need to be updated.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._removeVisualObject = function(vo) {
		var groupInstances = vo.voGroup.vos;
		var index = groupInstances.indexOf(vo);
		if (index >= 0) {
			groupInstances.splice(index, 1);
		}

		var groupSelectedInstances = vo.voGroup.selected;
		var selectedIndex = groupSelectedInstances.indexOf(vo);
		if (selectedIndex >= 0) {
			groupSelectedInstances.splice(selectedIndex, 1);
		}

		var scene = vo.voGroup.scene;
		vo.voGroup = null;
		if (vo.dataInstance) {
			vo.dataInstance.visualObject = null;
			vo.dataInstance = null;
		}

		this._queueVisualObjectToRemove(scene, vo);

		return this;
	};

	/**
	 * Populates the visual object attributes with values from visual object definition and data section.
	 *
	 * @param {object} vo The visual object.
	 * @param {object} dataInstance The data instance.
	 * @returns {object} The input visual object.
	 * @private
	 */
	VBIJSONParser.prototype._populateVisualObject = function(vo, dataInstance) {
		var voGroup = vo.voGroup;
		var template = voGroup.template;
		for (var attributeName in template) {
			var attribute = template[attributeName], value;
			if ("path" in attribute) { // The attribute is data bound.
				if (dataInstance) {
					// We get here when there is 'datasource' specified in the visual object group definition.
					value = dataInstance[attribute.path[0]];
					if (value !== undefined) {
						vo[attributeName] = value;
					}
				} else {
					// We get here when there is no 'datasource' specified in the visual object group definition
					// but the attribute is defined like e.g. "text.bind": "DetailData.0.Column.4.Text".
					 value = this._getDataValueByPath(attribute.path);
					 if (value != undefined) {
						vo[attributeName] = value;
					 }
				}
			} else {
				// The visual object group definition contains a value of the attribute, not a binding expression.
				vo[attributeName] = attribute.value;
			}
		}
		if (dataInstance) {
			if (voGroup.keyAttributeName) {
				vo.id = dataInstance[voGroup.keyAttributeName];
			}
			dataInstance.visualObject = vo;
			vo.dataInstance = dataInstance;
			// ZUTUN: add attributes defined in data instance but not defined in voGroup.
			// E.g. the 'DisplayRole' custom attribute in Transportaion Management scenarios is defined in
			// the DataTypes section and is used in the Data section but no visual object has a standard attribute
			// corresponding to it.

			// TODO directly copy changeable attribute for now
			vo["VB:c"] = dataInstance["VB:c"];

			// update selection
			var wasSelected = vo["VB:s"] && vo["VB:s"] !== "false" ? true : false;
			var isSelected = dataInstance["VB:s"] && dataInstance["VB:s"] !== "false" ? true : false;

			if (wasSelected !== isSelected) {
				if (wasSelected) {
					// Deselect instance, but follow "minSel" rule
					if (voGroup.minSel === "0" || voGroup.selected.length > 1) {
						voGroup.selected.splice(voGroup.selected.indexOf(vo), 1);
						vo["VB:s"] = "false";
					}
				} else if (voGroup.maxSel !== "0") { // check if selection allowed on a VO level i.e "maxSel" <> 0
					if (voGroup.maxSel === "1") {
						// Deselect previously selected instance (can be only 1 as "maxSel" == 1
						voGroup.selected.splice(0).forEach(function(instance) {
							instance["VB:s"] = "false";
							this._queueVisualObjectToUpdate(voGroup.scene, instance);
						}, this);
					}
					// add instance to selection
					voGroup.selected.push(vo);
					vo["VB:s"] = "true";
				}
			}
		}
		return vo;
	};

	var addToQueue = function(queue, scene, vo) {
		if (queue.has(scene)) {
			queue.get(scene).push(vo);
		} else {
			queue.set(scene, [ vo ]);
		}
		return vo;
	};

	/**
	 * Adds a visual object to the queue of recently added visual objects.
	 *
	 * @param {object} scene The scene whose visual object was recently added.
	 * @param {object} vo    The visual object that was recently added.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._queueVisualObjectToAdd = function(scene, vo) {
		addToQueue(this._context.voQueues.toAdd, scene, vo);
		return this;
	};

	/**
	 * Adds a visual object to the queue of recently updated visual objects.
	 *
	 * @param {object} scene The scene whose visual object was recently updated.
	 * @param {object} vo    The visual object that was recently updated.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._queueVisualObjectToUpdate = function(scene, vo) {
		addToQueue(this._context.voQueues.toUpdate, scene, vo);
		return this;
	};

	/**
	 * Adds a visual object to the queue of recently removed visual objects.
	 *
	 * @param {object} scene The scene whose visual object was recently removed.
	 * @param {object} vo    The visual object that was recently removed.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._queueVisualObjectToRemove = function(scene, vo) {
		addToQueue(this._context.voQueues.toRemove, scene, vo);
		return this;
	};

	/**
	 * Created or updates visual objects.
	 *
	 * New visual objects can be added as a result of changes in the Data section or in the Scene.VO sections.
	 *
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._refreshVisualObjects = function() {
		this._context.scenes.forEach(function(scene) {
			scene.voGroups.forEach(this._processVisualObjectGroup, this);
		}, this);
		this._resetDirtyFlag();
		return this;
	};

	// endregion: Scenes
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Windows

	/**
	 * Processes the Windows section of VBI JSON.
	 *
	 * Removes windows from the context.windows array.
	 * Adds or updates windows in the context.windows array.
	 *
	 * @param {object} data The Windows section of VBI JSON.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._processWindows = function(data) {
		// One function to return both window and its index in context.windows.
		var findWindowById = function(id) {
			for (var i = 0, count = this._context.windows.length; i < count; ++i) {
				var window = this._context.windows[i];
				if (window.id === id) {
					return {
						window: window,
						index: i
					};
				}
			}
			return {};
		}.bind(this);

		if (data.Remove) {
			toArray(data.Remove).forEach(function(removeElement) {
				var result = findWindowById(removeElement.name);
				if (result.window) {
					this._context.windows.splice(result.index, 1);
					this._context.windowQueues.toRemove.push(result.window);
				}
			}, this);
		}

		if (data.Set) {
			var setElements = toArray(data.Set);

			if (setElements.length === 1 && !setElements[0].name) {
				// Remove all windows.
				this._context.windows.splice(0).forEach(function(window) {
					this._context.windowQueues.toRemove.push(window);
				}, this);
			} else if (setElements.length > 0) {
				if (setElements.some(function(setElement) { return !setElement.name; })) {
					Log.error("Windows: if there are multiple Set verbs then all Set verbs must have the non-empty name attribute.", "", thisModule);
					return this;
				}
				if (setElements.some(function(setElement) { return !setElement.Window || toArray(setElement.Window).length > 1; })) {
					Log.error("Window: all Set verbs with the name attribute must have the single Window element.", "", thisModule);
					return this;
				}
				if (setElements.some(function(setElement) { return setElement.name !== setElement.Window.id; })) {
					Log.error("Window: the Set's attribute 'name' must equal the Set.Window's attribute 'id'.", "", thisModule);
					return this;
				}
			}

			setElements.forEach(function(setElement) {
				toArray(setElement.Window).forEach(function(windowElement) {
					var window = findWindowById(windowElement.id).window;
					if (window) {
						this._context.windowQueues.toUpdate.push(window);
					} else {
						window = this._factory.createWindow();
						this._context.windows.push(window);
						this._context.windowQueues.toAdd.push(window);
					}
					copyProperties(window, windowElement, ["id", "type", "caption", "refScene", "refParent", "width", "height", "modal"]);
					if ("pos.bind" in windowElement) {
						window.pos = this._getDataValueByPath(windowElement["pos.bind"]);
					} else if ("pos" in windowElement) {
						window.pos = windowElement.pos;
					}
				}, this);
			}, this);
		}

		return this;
	};

	// endregion: Windows
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Actions

	/**
	 * Processes the Actions section of VBI JSON.
	 *
	 * @param {object[]} actions The Actions section of VBI JSON.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._processActions = function(actions) {
		if (actions &&
			actions.Set &&
			actions.Set.Action
		) {
			Array.prototype.push.apply(this._context.actions, toArray(actions.Set.Action));
		}
		return this;
	};

	// endregion: Actions
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Autmation

	/**
	 * Processes the Automation section of VBI JSON.
	 *
	 * @param {object} automation The Automation section of VBI JSON.
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._processAutomation = function(automation) {
		/**
		 * Haven't come across instances of multiple Automations in the same JSON payload.
		 * It can be like below:
		 *    "Automation" : { "Call: [{"handler":"FLYTOHANDLER",....}, {"handler":"CONTEXTMENUHANDLER",....}]"}
		 *
		 * FLYTOHANDLER Parameters will contain a field called Mode whose value would look like an intger. Below is
		 * significance of each of them.
		 *
		 * 	1 Basic Linear Animation
		 *  2 Basic Cyclic Animation
		 *  3 Basic Hyperbolic Animation
		 *  4 Linear Pitched Animation
		 *  5 Cyclic Pitched Animation
		 *  6 Hyperbolic Pitched Animation
		 *  7 Linear Aiming Animation
		 *  8 Cyclic Aiming Animation
		 *  9 Hyperbolic Aiming Animation
		 * 20 Basic Steep Turn Animation
		 * 21 Steep Turn with animated roll
		 * 22 Overtorqued Steep Turn
		 *
		 * Animation isn't currently supported.
		 *
		 */
		if (automation && automation.Call) {
			toArray(automation.Call).forEach(function(call) {
				switch (call.handler) {
					// ZUTUN: Refactor to handle CONTEXTMENUHANDLER as well here.
					case "FLYTOHANDLER":
						var params = toArray(call.Param);
						var scene = sap.ui.vbm.findInArray(this._context.scenes, function(s) {
							return s.id === (sap.ui.vbm.findInArray(params, function(p) {
								return p.name === "scene";
							}) || {})["#"] || "";
						});

						if (scene) {
							var abcissae = (sap.ui.vbm.findInArray(params, function(p) { return p.name === "x"; }) || {})["#"] || "0";
							var ordinate = (sap.ui.vbm.findInArray(params, function(p) { return p.name === "y"; }) || {})["#"] || "0";
							var applicate = (sap.ui.vbm.findInArray(params, function(p) { return p.name === "z"; }) || {})["#"] || "0";
							scene.position = abcissae + ";" + ordinate + ";" + applicate;

							scene.zoom = (sap.ui.vbm.findInArray(params, function(p) { return p.name === "lod"; }) || {})["#"] || "0";
							scene.pitch = (sap.ui.vbm.findInArray(params, function(p) { return p.name === "pitch"; }) || {})["#"] || "0";
							scene.yaw = (sap.ui.vbm.findInArray(params, function(p) { return p.name === "yaw"; }) || {})["#"] || "0";

							this._context.setupView = {
								position: scene.position,
								zoom: scene.zoom,
								pitch: scene.pitch,
								yaw: scene.yaw,
								flyTo: true
							};
						}
						break;
					default:
						break; // no other automations are supported yet
				}
			}, this);
		}
		return this;
	};

	// endregion: Actions
	////////////////////////////////////////////////////////////////////////////

	/**
	 * Resets the <code>isDirty</code> flag on all data instances and visual object groups.
	 *
	 * @returns {sap.ui.vbm.adapter3d.VBIJSONParser} <code>this</code> to allow method chaining.
	 * @private
	 */
	VBIJSONParser.prototype._resetDirtyFlag = function() {
		for (var propName in this._context.data) {
			(function traverseDataNode(node) {
				node.forEach(function(instance) {
					instance.isDirty = false;
					for (var propName in instance) {
						if (Array.isArray(instance[propName])) {
							traverseDataNode(instance[propName]);
						}
					}
				});
			})(this._context.data[propName]);
		}

		this._context.scenes.forEach(function(scene) {
			scene.voGroups.forEach(function(voGroup) {
				voGroup.isDirty = false;
			});
		});
		return this;
	};

	/**
	 * Utility function returns alias for the specified Attribute within DataType.
	 * Only top level data types are checked, nested data types are ignored.
	 *
	 * @param {string} dataType The DataType name for the given attribute
	 * @param {string} attribute The Attribute name
	 * @returns {string} String alias of an attribute or undefined if not found
	 */
	 VBIJSONParser.prototype.getAttributeAlias = function(dataType, attribute) {
		for (var i = 0; i < this._context.dataTypes.length; ++i) {
			var type = this._context.dataTypes[i];
			if (type.name === dataType) {
				for (var j = 0; j < type.attributes.length; ++j) {
					var attr = type.attributes[j];
					if (attr.name === attribute) {
						return attr.alias;
					}
				}
			}
		}
		return undefined;
	 };

	return VBIJSONParser;
});