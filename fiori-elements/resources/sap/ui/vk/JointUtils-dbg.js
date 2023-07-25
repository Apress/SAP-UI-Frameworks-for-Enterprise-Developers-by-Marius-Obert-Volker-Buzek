/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./glMatrix"
], function(
	glMatrix
) {
	"use strict";

	var mat4 = glMatrix.mat4;
	var ARRAY_TYPE = glMatrix.glMatrix.ARRAY_TYPE;

	/**
	 * Joint utilities library.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vk.JointUtils
	 * @since 1.74
	 * @experimental Since 1.74 This class is experimental and might be modified or removed in future versions.
	 */
	var JointUtils = {
		/**
		 * Recalculates joints on node transformation change.
		 *
		 * @param {any[]}       joints         The array of joints.
		 * @param {any}         nodeRef        The joint node reference.
		 * @param {float[]|any} transformation The updated world matrix or translation, quaternion, scale of the node.
		 * @param {float[]}     transformation.translation The translation of the node
		 * @param {float[]}     transformation.quaternion  The quaternion of the node
		 * @param {float[]}     transformation.scale       The scale of the node
		 * @returns {any[]} An array of modified joints.
		 * @public
		 * @static
		 */
		recalculateJoints: function(joints, nodeRef, transformation) {
			var worldMatrix;
			if (transformation.length === 16) {
				worldMatrix = transformation;
			} else {
				worldMatrix = new ARRAY_TYPE(16);
				mat4.fromRotationTranslationScale(worldMatrix, transformation.quaternion || [0, 0, 0, 1], transformation.translation || [0, 0, 0], transformation.scale || [1, 1, 1]);
			}
			var invWorldMatrix = new ARRAY_TYPE(16);
			mat4.invert(invWorldMatrix, worldMatrix);
			var matrix = new ARRAY_TYPE(16);
			var modifiedJoints = [];
			joints.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.parent === nodeRef) {
					mat4.multiply(matrix, invWorldMatrix, joint.node.matrixWorld.elements);
				} else if (joint.node === nodeRef) {
					mat4.invert(matrix, joint.parent.matrixWorld.elements);
					mat4.multiply(matrix, matrix, worldMatrix);
				} else {
					return; // skip this joint
				}
				mat4.getTranslation(joint.translation, matrix);
				mat4.getScaling(joint.scale, matrix);
				mat4.scale(matrix, matrix, [1 / joint.scale[0], 1 / joint.scale[1], 1 / joint.scale[2]]); // TODO: there is a bug in glMatrix.mat4.getRotation, remove this code when the bug will be fixed
				mat4.getRotation(joint.quaternion, matrix);
				modifiedJoints.push(joint);
			});
			return modifiedJoints;
		}
	};

	return JointUtils;
});
