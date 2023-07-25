/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides class sap.ui.vk.ContentResource.
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./ContentResourceSourceTypeToCategoryMap"
], function(
	ManagedObject,
	ContentResourceSourceTypeToCategoryMap
) {
	"use strict";

	/**
	 * Constructor for a new ContentResource.
	 *
	 * @class
	 * Specifies a resource to load.

	 * @param {string} [sId] ID of the new content resource. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new content resource.
	 * @param {object} [oScope] scope An object for resolving string-based type and formatter references in bindings.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.ContentResource
	 */
	var ContentResource = ManagedObject.extend("sap.ui.vk.ContentResource", /** @lends sap.ui.vk.ContentResource.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {
				/**
				 * The source URL or the {@link https://developer.mozilla.org/en-US/docs/Web/API/File File} object of the content resource/file to load from.
				 * The source may be omitted if a grouping node is needed.
				 */
				source: "any",

				/**
				 * The source type of the content resource. Valid types:
				 * <ul>
				 *   <li>vds</li>
				 *   <li>vds4</li>
				 *   <li>svg</li>
				 *   <li>png</li>
				 *   <li>jpg</li>
				 *   <li>jpeg</li>
				 *   <li>gif</li>
				 *   <li>bmp</li>
				 *   <li>tif*</li>
				 *   <li>tiff*</li>
				 *   <li>stream</li>
				 * </ul>
				 * The source type may be omitted if this is a grouping content node.
				 * </br>NOTE: The tif and tiff image formats are not supported on all browsers.
				 *       Source type "vds" initializes deprecated DVL namespace and uses legacy library to load and display VDS file content.
				 *       If source type of "vds4" is used then new namespace based on Threejs rendering model will be used to load and display VDS file content.
				 *       Since DVL namespace is deprecated in one of future releases it will be removed and source type "vds" will also use Threejs model.
				 */
				sourceType: "string",

				/**
				 * The unique ID of the content resource.
				 */
				sourceId: "string",

				/**
				 * The local transformation matrix of the node created for this content resource.
				 */
				localMatrix: "sap.ui.vk.TransformationMatrix",

				/**
				 * The name of the node created for this content resource.
				 */
				name: "string",

				/**
				 * The password to use when opening the resource.
				 */
				password: "string",

				/**
				 * If set to false, unsecure connections will be used. Default: true.
				 */
				useSecureConnection: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Id of scene to retrieve tree for. Mandatory for the stream source type.
				 */
				veid: "string",

				/**
				 * Send structural data for hidden objects, if false they will be omitted, reducing data size. Default: true.
				 */
				includeHidden: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Send structural data for animation objects, if false they will be omitted, reducing data size. Default: true.
				 */
				includeAnimation: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * If set to true, elements for PMI rendering content will be returned. Default: false.
				 */
				pushPMI: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Optional metadata filter that can trim the tree before sending to the client only keeping nodes that passed
				 * the filter and their parents. Default: null. Format: Comma-separated list of meta.category1.tag1.value1,
				 * meta.category2.tag2.value2. "meta." is the prefix and all metadata filters must start with it. Multiple filters
				 * are supported, they are combined using `OR` operator. Includes parent nodes of matching nodes (e.g. breadcrumb)
				 * even if they don't pass the filter.
				 */
				metadataFilter: "string",

				/**
				 * Optional parameter with view id which shall be activated when scene is loaded.
				 */
				activateView: "string",

				/**
				 * Optional boolean parameter to enable detailed logging. Can be used to track performance issues during data streaming from SAP 3D Visualization Service.
				 */
				enableLogger: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * If set to true, information of view groups will be returned. Default: true.
				 */
				pushViewGroups: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * If set to true, will return nodes with the type background
				 */
				includeBackground: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * If set to true, will load parametric nodes
				 */
				includeParametric: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Optional parameter to load UsageIds. Valid values:
				 * <ul>
				 *   <li><code>true</code> - Load all UsageIds. This is potentially very expensive, as there could be many UsageIds defined for the tenant which are not relevant to the current application.
				 *   <li><code>false</code> - Do not load any UsageIds.
				 *   <li><code>string</code> - A single non-empty string which defines the name of the requested UsageId.
				 *   <li><code>string[]</code> - An array of non-empty strings which define the names of requested UsageIds.
				 * </ul>
				 */
				includeUsageId: {
					type: "sap.ui.vk.IncludeUsageIdType",
					defaultValue: false
				},

				/**
				 * An object used to load content resource's dependencies.
				 *
				 * A content resource may have dependencies, e.g. if the loaded content resource is a shattered VDS file
				 * it reference other VDS files.
				 *
				 * <code>dependencyLoader</code> should be an object with method <code>function load(uri: string,
				 * context: any): Promise<{buffer: ArrayBuffer, context: any}></code>, where <code>uri</code> is a
				 * reference to a dependency and <code>context</code> is opaque data.
				 *
				 * <code>uri</code> is application specific and can be a full URL or a relative file name or anything
				 * else, e.g. some identifier known to <code>dependencyLoader</code>.
				 */
				dependencyLoader: "any"
			},

			aggregations: {
				/**
				 * Child content resources.
				 */
				contentResources: "sap.ui.vk.ContentResource"
			}
		},

		constructor: function(sId, mSettings, oScope) {
			ManagedObject.apply(this, arguments);
		}
	});

	ContentResource.prototype.isTreeBinding = function(name) {
		return name === "contentResources";
	};

	ContentResource.prototype.destroy = function() {
		ManagedObject.prototype.destroy.call(this);
	};

	ContentResource.prototype.setLocalMatrix = function(value) {
		var nodeProxy = this.getNodeProxy();
		if (nodeProxy) {
			nodeProxy.setLocalMatrix(value);
		}
		this.setProperty("localMatrix", value, true);
		return this;
	};

	/**
	 * Gets content resource source properties.
	 *
	 * The content resource source properties depend on the content resource source type. They are different for VDS and PNG for example.
	 * The list of possible source properties:
	 * <ul>
	 *   <li>version - object
	 *     <ul>
	 *       <li>major - number</li>
	 *       <li>minor - number</li>
	 *     </ul>
	 *   </li>
	 *   <li>compressed - boolean</li>
	 *   <li>encrypted - boolean</li>
	 * </ul>
	 * The source properties are optional and the list might be extended in future versions.
	 *
	 * @returns {object} A JSON like object containing the content resource source properties.
	 * @public
	 */
	ContentResource.prototype.getSourceProperties = function() {
		return this._shadowContentResource && this._shadowContentResource.sourceProperties || {};
	};

	/**
	 * Gets the {@link sap.ui.vk.NodeProxy NodeProxy} object created for this content resource.
	 *
	 * If this is the only top level content resource, the {@link sap.ui.vk.NodeProxy NodeProxy} object is not set since
	 * the grouping node is not created, which means that there may be multiple top level nodes.
	 *
	 * @returns {sap.ui.vk.NodeProxy} The {@link sap.ui.vk.NodeProxy NodeProxy} object created for this content resource if any, otherwise <code>null</code>.
	 * @public
	 */
	ContentResource.prototype.getNodeProxy = function() {
		return this._shadowContentResource && this._shadowContentResource.nodeProxy || null;
	};

	/**
	 * Collects content resource categories. The result is tested if the content resource hierarchy has the same category - 2D or 3D.
	 *
	 * @param {sap.ui.vk.ContentResource[]} resources The array of content resources.
	 * @returns {sap.ui.vk.ContentResourceSourceCategory[]} The array of distinct content resource categories.
	 * @static
	 * @public
	 * @deprecated Since version 1.50.0.
	 */
	ContentResource.collectCategories = function(resources) {
		var categories = [];
		var map = {};

		function getResourceCategory(resource) {
			var sourceType = (resource.getSourceType() || "").toLowerCase();
			if (sourceType) {
				var category = ContentResourceSourceTypeToCategoryMap[sourceType] || "unknown";
				if (!map.hasOwnProperty(category)) {
					map[category] = true;
					categories.push(category);
				}
			}
			resource.getContentResources().forEach(getResourceCategory);
		}

		resources.forEach(getResourceCategory);

		return categories;
	};

	return ContentResource;
});
