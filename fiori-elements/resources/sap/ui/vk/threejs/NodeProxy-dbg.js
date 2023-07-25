/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the NodeProxy class.
sap.ui.define([
	"../NodeProxy",
	"./Material",
	"../cssColorToColor",
	"../colorToCSSColor",
	"../abgrToColor",
	"../colorToABGR",
	"../TransformationMatrix",
	"./ThreeExtensions",
	"../ObjectType",
	"../thirdparty/three"
], function(
	NodeProxyBase,
	Material,
	cssColorToColor,
	colorToCSSColor,
	abgrToColor,
	colorToABGR,
	TransformationMatrix,
	ThreeExtensions,
	ObjectType,
	THREE
) {
	"use strict";

	/**
	 * Constructor for a new NodeProxy.
	 *
	 * @class
	 * Provides a proxy object to the node in the node hierarchy.
	 *
	 * Objects of this type should only be created with the {@link sap.ui.vk.NodeHierarchy#createNodeProxy sap.ui.vk.NodeHierarchy.createNodeProxy} method.
	 * and destroyed with the {@link sap.ui.vk.NodeHierarchy#destroyNodeProxy sap.ui.vk.NodeHierarchy.destroyNodeProxy} method.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.NodeProxy
	 * @alias sap.ui.vk.threejs.NodeProxy
	 */
	var NodeProxy = NodeProxyBase.extend("sap.ui.vk.threejs.NodeProxy", /** @lends sap.ui.vk.threejs.NodeProxy.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},

		constructor: function(nodeHierarchy, obj3D) {
			NodeProxyBase.call(this);

			this._object3D = obj3D; // THREE.Object3D
			this._nodeHierarchy = nodeHierarchy;
		}
	});

	NodeProxy.prototype.destroy = function() {
		this._object3D = null;

		NodeProxyBase.prototype.destroy.call(this);
	};

	NodeProxy.prototype.getNodeHierarchy = function() {
		return this._nodeHierarchy;
	};

	NodeProxy.prototype.getNodeRef = function() {
		return this._object3D;
	};

	NodeProxy.prototype.getNodeId = function() {
		return this._object3D;
	};

	NodeProxy.prototype.getVeIds = function() {
		return this._object3D.userData.veids || [];
	};

	NodeProxy.prototype.getVeId = function() {
		return this._object3D.userData.treeNode ? this._object3D.userData.treeNode.sid : null;
	};

	NodeProxy.prototype.getMaterialId = function() {
		var refWithMaterial = this._object3D;
		if (this._object3D && !this._object3D.geometry) {
			if (this._object3D.children.length === 1 && this._object3D.children[0].geometry && (this._object3D.children[0].name === "" || this._object3D.children[0].name === undefined)) {
				refWithMaterial = this._object3D.children[0];
			}
		}

		if (refWithMaterial.material !== undefined &&
			refWithMaterial.material.userData !== undefined &&
			refWithMaterial.material.userData.materialId !== undefined) {
			return refWithMaterial.material.userData.materialId;
		} else if (refWithMaterial.userData.originalMaterial !== undefined &&
			refWithMaterial.userData.originalMaterial.userData !== undefined &&
			refWithMaterial.userData.originalMaterial.userData.materialId !== undefined) {
			return refWithMaterial.userData.originalMaterial.userData.materialId;
		}

		return undefined;
	};

	NodeProxy.prototype.getName = function() {
		return this._object3D.name || ("<" + this._object3D.type + ">");
	};

	NodeProxy.prototype._updateAncestorsBoundingBox = function() {
		var parent = this._object3D.parent;
		while (parent) {
			if (parent.userData.boundingBox !== undefined) {
				// TODO(VSM): REDO
				parent._vkCalculateObjectOrientedBoundingBox();
			}
			parent = parent.parent;
		}
	};

	NodeProxy.prototype.getLocalMatrix = function() {
		return TransformationMatrix.convertTo4x3(this._object3D.matrix.elements);
	};

	NodeProxy.prototype.setLocalMatrix = function(value) {
		if (value) {
			var obj3D = this._object3D;
			obj3D.matrix.fromArray(TransformationMatrix.convertTo4x4(value));
			obj3D.matrix.decompose(obj3D.position, obj3D.quaternion, obj3D.scale);
			obj3D.updateMatrixWorld(true);
			this._updateAncestorsBoundingBox();
		}
		this.setProperty("localMatrix", value, true);
		return this;
	};

	NodeProxy.prototype.setLocalMatrixNotUpdatingBBox = function(value) {
		if (value) {
			var obj3D = this._object3D;
			obj3D.matrix.fromArray(TransformationMatrix.convertTo4x4(value));
			obj3D.matrix.decompose(obj3D.position, obj3D.quaternion, obj3D.scale);
			obj3D.updateMatrixWorld(true);
		}
		this.setProperty("localMatrix", value, true);
		return this;
	};

	NodeProxy.prototype.getWorldMatrix = function() {
		return TransformationMatrix.convertTo4x3(this._object3D.matrixWorld.elements);
	};

	NodeProxy.prototype.setWorldMatrix = function(value) {
		if (value) {
			var obj3D = this._object3D;
			obj3D.matrixWorld.fromArray(TransformationMatrix.convertTo4x4(value));
			if (obj3D.parent) {
				obj3D.matrix.multiplyMatrices(new THREE.Matrix4().copy(obj3D.parent.matrixWorld).invert(), obj3D.matrixWorld);
			} else {
				obj3D.matrix.copy(obj3D.matrixWorld);
			}
			obj3D.matrix.decompose(obj3D.position, obj3D.quaternion, obj3D.scale);
			obj3D.updateMatrixWorld(true);
			this._updateAncestorsBoundingBox();
		}
		this.setProperty("worldMatrix", value, true);
		return this;
	};

	NodeProxy.prototype.getOpacity = function() {
		return this._object3D.userData.opacity;
	};

	NodeProxy.prototype.setOpacity = function(value) {
		var vsManager = this._nodeHierarchy.getScene().getViewStateManager();
		if (vsManager) {
			vsManager.setOpacity(this._object3D, value);
		} else {
			this._object3D._vkSetOpacity(value);
		}
		this.setProperty("opacity", value, true);
		return this;
	};

	NodeProxy.prototype.getTintColorABGR = function() {
		return this._object3D.userData.tintColor;
	};

	NodeProxy.prototype.setTintColorABGR = function(value) {
		var vsManager = this._nodeHierarchy.getScene().getViewStateManager();
		if (vsManager) {
			vsManager.setTintColor(this._object3D, value);
		} else {
			this._object3D._vkSetTintColor(value);
		}
		this.setProperty("tintColorABGR", value, true);
		this.setProperty("tintColor", colorToCSSColor(abgrToColor(value)), true);
		return this;
	};

	NodeProxy.prototype.getTintColor = function() {
		return colorToCSSColor(abgrToColor(this._object3D.userData.tintColor));
	};

	NodeProxy.prototype.setTintColor = function(value) {
		var abgr = colorToABGR(cssColorToColor(value));

		var vsManager = this._nodeHierarchy.getScene().getViewStateManager();
		if (vsManager) {
			vsManager.setTintColor(this._object3D, abgr);
		} else {
			this._object3D._vkSetTintColor(abgr);
		}
		this.setProperty("tintColorABGR", abgr, true);
		this.setProperty("tintColor", value, true);
		return this;
	};

	NodeProxy.prototype.getNodeMetadata = function() {
		return this._object3D.userData.metadata || {};
	};

	NodeProxy.prototype.getHasChildren = function() {
		return this._object3D.children.length > 0;
	};

	NodeProxy.prototype.getClosed = function() {
		return !!this._object3D.userData.closed;
	};

	NodeProxy.prototype.getBoundingBox = function() {
		return this._object3D.userData.boundingBox;
	};

	/**
	 * Assign material to all mesh nodes contained in the current node
	 *
	 * @param {sap.ui.vk.Material} value Material to be assigned.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	NodeProxy.prototype.assignMaterial = function(value) {

		var setNodeRefMaterial = function(materialRef, nodeRef) {

			var materialId;
			if (materialRef.userData) {
				materialId = materialRef.userData.materialId;
				nodeRef.userData.materialId = materialId;
			}

			if (nodeRef.material !== undefined) {
				if (nodeRef.userData.highlightColor !== undefined) {
					if (nodeRef.userData.originalMaterial.side) {
						materialRef.side = nodeRef.userData.originalMaterial.side;
					}
					nodeRef.userData.originalMaterial = materialRef;
					materialRef.userData.materialUsed++;

					nodeRef.material = materialRef.clone();
					var c = abgrToColor(nodeRef.userData.highlightColor);
					nodeRef.material.color.lerp(new THREE.Color(c.red / 255.0, c.green / 255.0, c.blue / 255.0), c.alpha);
					// when highlightColor = 0: total transparent, so do not change original emissive and specular
					if (materialRef.userData.defaultHighlightingEmissive && nodeRef.userData.highlightColor !== 0) {
						nodeRef.material.emissive.copy(materialRef.userData.defaultHighlightingEmissive);
					}
					if (materialRef.userData.defaultHighlightingSpecular && nodeRef.userData.highlightColor !== 0) {
						nodeRef.material.specular.copy(materialRef.userData.defaultHighlightingSpecular);
					}
				} else {
					if (nodeRef.material.side) {
						materialRef.side = nodeRef.material.side;
					}
					nodeRef.material = materialRef;
					materialRef.userData.materialUsed++;
					delete nodeRef.userData.originalMaterial;
				}

				nodeRef._vkUpdateMaterialOpacity();
			}
		};

		setNodeRefMaterial(value.getMaterialRef(), this._object3D);

		if (!this._object3D.children) {
			return this;
		}

		this._object3D.children.forEach(function(child) {
			if (!child || child.userData.objectType === ObjectType.PMI || child.userData.objectType === ObjectType.Hotspot) {
				return;
			}
			setNodeRefMaterial(value.getMaterialRef(), child);
		});

		return this;
	};

	/**
	 * Retrieve all materials defined in the current node
	 *
	 * @param {boolean} recursive If <code>true</code> then include materials defined in all child nodes
	 * @returns {sap.ui.vk.Material[]} The array of materials.
	 * @public
	 */
	NodeProxy.prototype.enumerateMaterials = function(recursive) {
		var collectMaterials = function(nodeRef, materialRefSet, recursive) {
			if (nodeRef) {
				if (nodeRef.userData.originalMaterial) {
					materialRefSet.add(nodeRef.userData.originalMaterial);
				} else if (nodeRef.material) {
					materialRefSet.add(nodeRef.material);
				}

				if (nodeRef.children) {
					nodeRef.children.forEach(function(child) {
						if (child) {
							if (recursive) {
								collectMaterials(child, materialRefSet, recursive);
							} else if (child.userData.originalMaterial) {
								materialRefSet.add(child.userData.originalMaterial);
							} else if (child.material) {
								materialRefSet.add(child.material);
							}
						}
					});
				}
			}
		};

		var matRefSet = new Set();
		collectMaterials(this._object3D, matRefSet, recursive);

		var materialRefs = [];
		matRefSet.forEach(function(val) {
			materialRefs.push(val);
		});

		var materials = [];

		for (var i = 0; i < materialRefs.length; i++) {
			var material = new Material();
			material.setMaterialRef(materialRefs[i]);
			materials.push(material);
		}

		return materials;
	};

	/**
	 * Replace material with another material
	 *
	 * @param {sap.ui.vk.Material|THREE.Material} materialToReplace Material to be replaced.
	 * @param {sap.ui.vk.Material|THREE.Material} material Material replacement.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	NodeProxy.prototype.replaceMaterial = function(materialToReplace, material) {
		var materialToReplaceRef = (typeof materialToReplace.getMaterialRef === "function") ? materialToReplace.getMaterialRef() : materialToReplace;
		var materialRef = (typeof material.getMaterialRef === "function") ? material.getMaterialRef() : material;
		if (this._object3D.userData.originalMaterial && this._object3D.userData.originalMaterial === materialToReplaceRef) {
			this._object3D.userData.originalMaterial = materialRef;
			this._object3D._vkUpdateMaterialColor();
		} else if (this._object3D.material && this._object3D.material === materialToReplaceRef) {
			this._object3D.material = materialRef;
		}

		if (material.id) {
			this._object3D.userData.materialId = material.id;
		}

		if (!this._object3D.children) {
			return this;
		}

		this._object3D.children.forEach(function(child) {
			if (child && child.userData.originalMaterial && child.userData.originalMaterial === materialToReplaceRef) {
				child.userData.originalMaterial = materialRef;
				child._vkUpdateMaterialColor();
			} else if (child && child.material && child.material === materialToReplaceRef) {
				child.material = materialRef;
			}
		});

		return this;
	};

	/**
	 * get local translate vector
	 *
	 * @returns {float[]} translate vector
	 * @public
	 */
	NodeProxy.prototype.getLocalTranslate = function() {
		var obj3D = this._object3D;
		return [obj3D.position.x, obj3D.position.y, obj3D.position.z];
	};

	/**
	 * get local scale vector
	 *
	 * @returns {float[]} scale vector
	 * @public
	 */
	NodeProxy.prototype.getLocalScale = function() {
		var obj3D = this._object3D;
		return [obj3D.scale.x, obj3D.scale.y, obj3D.scale.z];
	};

	/**
	 * get local rotation represented by quaternion
	 *
	 * @returns {float[]} quaternion [x, y, z, w]
	 * @public
	 */
	NodeProxy.prototype.getLocalRotationInQuaternion = function() {
		var obj3D = this._object3D;
		return [obj3D.quaternion.x, obj3D.quaternion.y, obj3D.quaternion.z, obj3D.quaternion.w];
	};

	/**
	 * get local rotation represented by axis and angle
	 *
	 * @returns {float[]} angleAxis rotation [x, y, z, angle], (x, y, z) - rotation axis
	 * @public
	 */
	NodeProxy.prototype.getLocalRotationInAngleAxis = function() {
		var obj3D = this._object3D;
		var q = obj3D.quaternion;
		if (q.w > 1) {
			q.normalise();
		}

		var angle = 2 * Math.acos(q.w);

		var s = Math.sqrt(1 - q.w * q.w);
		var x, y, z;
		if (s < 0.001) {
			x = q.x;
			y = q.y;
			z = q.z;
		} else {
			x = q.x / s;
			y = q.y / s;
			z = q.z / s;
		}

		return [x, y, z, angle];
	};

	/**
	 * get local rotation in Euler form
	 *
	 * @returns {float[]} angleAxis rotation [a1, a2, a3, order]
	 * 						a1, a2, a3 - rotation angles about 1st, 2nd, 3nd axis
	 * 						order - int encoding order of XYZ axis (e.g, order "XZY" - 011100  (01 - 3rd axis(Y), 11 - 2nd axis(Z), 00 - 1st axis(X)))
	 * @public
	 */
	NodeProxy.prototype.getLocalRotationInEuler = function() {
		var obj3D = this._object3D;
		var q = obj3D.quaternion;
		if (q.w > 1) {
			q.normalise();
		}

		var order = 26; // 100100 - "xyz"
		var test = q.x * q.y + q.z * q.w;
		var heading, attitude, bank;
		if (test > 0.499) { // singularity at north pole
			heading = 2 * Math.atan2(q.x, q.w);
			attitude = Math.PI / 2;
			bank = 0;
		}
		if (test < -0.499) { // singularity at south pole
			heading = -2 * Math.atan2(q.x, q.w);
			attitude = -Math.PI / 2;
			bank = 0;
		} else {
			var sqx = q.x * q.x;
			var sqy = q.y * q.y;
			var sqz = q.z * q.z;
			heading = Math.atan2(2 * q.y * q.w - 2 * q.x * q.z, 1 - 2 * sqy - 2 * sqz);
			attitude = Math.asin(2 * test);
			bank = Math.atan2(2 * q.x * q.w - 2 * q.y * q.z, 1 - 2 * sqx - 2 * sqz);
		}

		return [heading, attitude, bank, order];
	};

	return NodeProxy;
});
