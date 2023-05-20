/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the base visual object.
sap.ui.define([
	"sap/ui/base/Object",
	"./thirdparty/three",
	"sap/base/Log"
], function(BaseObject, THREE, Log) {
	"use strict";

	var thisModule = "sap.ui.vbm.adapter3d.Utilities";
	var Color		= THREE.Color;
	var Vector3		= THREE.Vector3;
	var Matrix4		= THREE.Matrix4;
	var degToRad	= THREE.Math.degToRad;

	var Utilities = BaseObject.extend("sap.ui.vbm.adapter3d.Utilities", /** @lends sap.ui.vbm.adapter3d.Utilities.prototype */ {
	});

	Utilities.refCountPropertyName = "_sapRefCount";

	Utilities.refCountable = function(obj) {
		return obj.hasOwnProperty(Utilities.refCountPropertyName);
	};

	Utilities.refCountableDispose = function(obj) {
		return obj.hasOwnProperty(Utilities.refCountPropertyName) && obj[Utilities.refCountPropertyName] === 0;
	};

	Utilities.addRef = function(obj) {
		if (!obj.hasOwnProperty(Utilities.refCountPropertyName)) {
			obj[Utilities.refCountPropertyName] = 0;
		}
		obj[Utilities.refCountPropertyName] += 1;
	};

	Utilities.subRef = function(obj) {
		if (obj.hasOwnProperty(Utilities.refCountPropertyName)) {
			obj[Utilities.refCountPropertyName] -= 1;
			return obj[Utilities.refCountPropertyName] === 0;
		}
		return false;
	};

	/**
	 * Converts a single or multiple objects to array of objects.
	 *
	 * Rules:
	 *   undefined					-> []
	 *   []							-> []
	 *   obj						-> [obj]
	 *   [obj1, obj2, ..., objN]	-> [obj1, obj2, ..., objN]
	 * @param {object|object[]|null|undefined} input The input object that can be a single object, an array or <code>undefined</code>.
	 * @returns {object[]} An array that contains one element if the input is a single object, multiple elements if the input is an array.
	 *                     If the input is null/undefined then the output is an empty array.
	 * @private
	 */
	Utilities.toArray = function(input) {
		return input === undefined ? [] : [].concat(input);
	};

	Utilities.toBoolean = function(value) {
		var firstChar = value.charAt(0);
		return firstChar === "t" || firstChar !== "" && firstChar !== "f" && firstChar !== " " && firstChar !== "0";
	};

	Utilities.toFloat = function(value) {
		return parseFloat(value);
	};

	Utilities.toVector3 = function(value, out) {
		var a = value.split(";");
		if (a.length !== 3) {
			return out ? out.set(0, 0, 0) : new Vector3(0, 0, 0);
		}
		var x = parseFloat(a[0]), y = parseFloat(a[1]), z = parseFloat(a[2]);
		return out ? out.set(x, y, z) : new Vector3(x, y, z);
	};

	// from threeJS to VB vector (convert from Right Handed [GL] to Left Handed [DX] coordinate system)
	Utilities.threeJsToVb = function(point, out) {
		return out ? out.set(-point.x, point.z, -point.y) : new Vector3(-point.x, point.z, -point.y);
	};

	// from VB to ThreeJS vector (convert from Left Handed [DX] to Right Handed [GL] coordinate system)
	Utilities.vbToThreeJs = function(point, out) {
		return out ? out.set(-point.x, -point.z, point.y) : new Vector3(-point.x, -point.z, point.y);
	};

	Utilities.toColor = (function() {
		var dec = "\\s*(\\d+)\\s*";
		var hex = "\\s*(?:0[xX])([\\da-fA-F]+)\\s*";

		// NB: we use back reference \2 to reference to , (comma) or ; (semicolon) to prevent their mixes.
		// Color components will be in 1, 3, 4, 5 capturing groups.
		var threeDec = dec + "(,|;)" + dec + "\\2" + dec;
		var fourDec  = dec + "(,|;)" + dec + "\\2" + dec + "\\2" + dec;
		var threeHex = hex + "(,|;)" + hex + "\\2" + hex;
		var fourHex  = hex + "(,|;)" + hex + "\\2" + hex + "\\2" + hex;

		var reRGB   = new RegExp("^\\s*RGB\\("  + threeDec + "\\)\\s*$");
		var reRGBx  = new RegExp("^\\s*RGB\\("  + threeHex + "\\)\\s*$");
		var reRGBA  = new RegExp("^\\s*RGBA\\(" + fourDec  + "\\)\\s*$");
		var reRGBAx = new RegExp("^\\s*RGBA\\(" + fourHex  + "\\)\\s*$");
		var reARGB  = new RegExp("^\\s*ARGB\\(" + fourDec  + "\\)\\s*$");
		var reARGBx = new RegExp("^\\s*ARGB\\(" + fourHex  + "\\)\\s*$");
		var reHLS   = new RegExp("^\\s*HLS\\("  + threeDec + "\\)\\s*$"); // eslint-disable-line no-unused-vars
		var reHLSx  = new RegExp("^\\s*HLS\\("  + threeHex + "\\)\\s*$"); // eslint-disable-line no-unused-vars
		var reHLSA  = new RegExp("^\\s*HLSA\\(" + fourDec  + "\\)\\s*$"); // eslint-disable-line no-unused-vars
		var reHLSAx = new RegExp("^\\s*HLSA\\(" + fourHex  + "\\)\\s*$"); // eslint-disable-line no-unused-vars
		var reDec   = new RegExp("^" + dec + "$");                        // eslint-disable-line no-unused-vars
		var reHex   = new RegExp("^" + hex + "$");                        // eslint-disable-line no-unused-vars

		return function(value) {
			var m;
			var rgb;
			var opacity = 1;

			if ((m = value.match(reRGB))) {
				rgb = new Color(parseInt(m[1], 10) / 255, parseInt(m[3], 10) / 255, parseInt(m[4], 10) / 255);
			} else if ((m = value.match(reRGBx))) {
				rgb = new Color(parseInt(m[1], 16) / 255, parseInt(m[3], 16) / 255, parseInt(m[4], 16) / 255);
			} else if ((m = value.match(reRGBA))) {
				rgb = new Color(parseInt(m[1], 10) / 255, parseInt(m[3], 10) / 255, parseInt(m[4], 10) / 255);
				opacity = m[5] / 255;
			} else if ((m = value.match(reRGBAx))) {
				rgb = new Color(parseInt(m[1], 16) / 255, parseInt(m[3], 16) / 255, parseInt(m[4], 16) / 255);
				opacity = m[5] / 255;
			} else if ((m = value.match(reARGB))) {
				rgb = new Color(parseInt(m[3], 10) / 255, parseInt(m[4], 10) / 255, parseInt(m[5], 10) / 255);
				opacity = m[1] / 255;
			} else if ((m = value.match(reARGBx))) {
				rgb = new Color(parseInt(m[3], 16) / 255, parseInt(m[4], 16) / 255, parseInt(m[5], 16) / 255);
				opacity = m[1] / 255;
			} else {
				// ZUTUN: HLS, HLSA, decimal and hexadecimal representations are not handled yet
				Log.warning("Cannot convert color, use default", value, thisModule);
				rgb = new Color(0.5, 0.5, 0.5);
			}
			return {
				rgb: rgb,
				opacity: opacity
			};
		};
	})();

	Utilities.toColorDelta = (function() {
		// HLSA components will be in 1, 2, 3, 4 capturing groups.
		var floatingPoint = "\\s*([-+]?\\d*\\.?\\d+(?:[eE][-+]?\\d+)?)\\s*";
		var reDeltaHLS  = new RegExp("^\\s*RHLS\\("  + floatingPoint + ";" + floatingPoint + ";" + floatingPoint + "\\)\\s*$");
		var reDeltaHLSA = new RegExp("^\\s*RHLSA\\(" + floatingPoint + ";" + floatingPoint + ";" + floatingPoint + ";" + floatingPoint + "\\)\\s*$");

		return function(delta) {
			var m;
			var hls;
			var opacity = 1;

			if ((m = delta.match(reDeltaHLS))) {
				hls = new Vector3(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
			} else if ((m = delta.match(reDeltaHLSA))) {
				hls = new Vector3(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
				opacity = parseFloat(m[4]);
			} else {
				Log.warning("Cannot convert color delta, use default", delta, thisModule);
				hls = new Vector3(1,1,1);
			}
			return {
				hls: hls,
				opacity: opacity
			};
		};
	})();

	Utilities.multiplyColors = function(x, y, out) {
		out.r = Utilities.clamp(x.r * y.r, 0.0, 1.0);
		out.g = Utilities.clamp(x.g * y.g, 0.0, 1.0);
		out.b = Utilities.clamp(x.b * y.b, 0.0, 1.0);
	};

	Utilities.isColorDelta = function(value) {
		return value.startsWith("RHLS");
	};

	Utilities.applyDeltaHLS = function(color, hls) {
		// IMPORTANT: VB uses (H,L,S) where ThreeJS uses (H,S,L)
		var hsl = color.getHSL({});
		// apply it in VB manner, see vbshader.fx for details
		hsl.h = hsl.h + hls.x;
		hsl.s = Utilities.clamp(hsl.s * hls.z, 0.0, 1.0);
		hsl.l = Utilities.clamp(hsl.l * hls.y, 0.0, 1.0);
		color.setHSL(hsl.h, hsl.s, hsl.l);
	};

	Utilities.rgbaToString = function(color) {
		return color.rgb.getHexString() + Math.round(color.opacity * 255).toString(16);
	};

	Utilities.equalsRGBA = function(left, right) {
		return left.rgb.equals(right.rgb) && left.opacity === right.opacity;
	};

	/**
	 * Calculates instance color for given instance, color source & hot status
	 *
	 * @param {object} instance Instance to calculate color for.
	 * @param {string} source Instance base color.
	 * @param {boolean} [hot] Hot status of inctance.
	 * @returns {object} Instance color in format {color: THREE.Color, opacity: Number}
	 */
	Utilities.getColor = function(instance, source, hot) {
		var color = Utilities.toColor(source);
		var selected = Utilities.toBoolean(instance["VB:s"]);

		if (selected) {
			// if direct color -> override current, if delta color -> apply on top
			var selectDelta = Utilities.isColorDelta(instance.selectColor);
			var selectColor = selectDelta ? Utilities.toColorDelta(instance.selectColor) : Utilities.toColor(instance.selectColor);

			if (selectDelta) {
				Utilities.applyDeltaHLS(color.rgb, selectColor.hls);
				color.opacity = Utilities.clamp(color.opacity * selectColor.opacity, 0.0, 1.0);
			} else {
				color.rgb.copy(selectColor.rgb);
				color.opacity = selectColor.opacity;
			}
		}
		if (hot) {
			// if direct color -> override current, if delta color -> apply on top
			var hotDelta = Utilities.isColorDelta(instance.hotDeltaColor);
			var hotColor = hotDelta ? Utilities.toColorDelta(instance.hotDeltaColor) : Utilities.toColor(instance.hotDeltaColor);

			if (hotDelta) {
				Utilities.applyDeltaHLS(color.rgb, hotColor.hls);
				color.opacity = Utilities.clamp(color.opacity * hotColor.opacity, 0.0, 1.0);
			} else {
				color.rgb.copy(hotColor.rgb);
				color.opacity = hotColor.opacity;
			}
		}
		return color;
	};

	/**
	 * Applies color to all materials for given instance, color source, 3d objects & hot status
	 *
	 * @param {object} instance Instance to calculate color for.
	 * @param {string} source Instance base color.
	 * @param {object|object[]} object3D 3D object(s) for which materials color appliles to.
	 * @param {boolean} [hot] Hot status of inctance.
	 * @param {THREE.Texture} [texture] Texture to apply on every material in scope.
	 */
	Utilities.applyColor = function(instance, source, object3D, hot, texture) {
		var color = Utilities.toColor(source);
		var selected = Utilities.toBoolean(instance["VB:s"]);

		var selectDelta, selectColor, hotDelta, hotColor;

		if (selected) {
			selectDelta = Utilities.isColorDelta(instance.selectColor);
			selectColor = selectDelta ? Utilities.toColorDelta(instance.selectColor) : Utilities.toColor(instance.selectColor);
		}
		if (hot) {
			hotDelta = Utilities.isColorDelta(instance.hotDeltaColor);
			hotColor = hotDelta ? Utilities.toColorDelta(instance.hotDeltaColor) : Utilities.toColor(instance.hotDeltaColor);
		}
		// 'reference' object within material where original material color & opacity are stored
		var referencePropertyName = "_sapReference";

		Utilities.toArray(object3D).forEach(function(object) {
			object.traverse(function(node) {
				Utilities.toArray(node.material).forEach(function(material) { // node.material can be array
					// apply/reset texture if supplied
					if (texture !== undefined) {
						material.map = texture;
					}
					// check that material reference is stored
					var reference = material[referencePropertyName] || (material[referencePropertyName] = {
						rgb: material.color.clone(),
						opacity: material.opacity
					});
					// calc diffuse color first: miltiply material color to instance color
					Utilities.multiplyColors(reference.rgb, color.rgb, material.color);
					material.opacity = Utilities.clamp(reference.opacity * color.opacity, 0.0, 1.0);
					// if direct color -> override current, if delta color -> apply on top
					if (selected) {
						if (selectDelta) {
							Utilities.applyDeltaHLS(material.color, selectColor.hls);
							material.opacity = Utilities.clamp(material.opacity * selectColor.opacity, 0.0, 1.0);
						} else {
							material.color.copy(selectColor.rgb);
							material.opacity = selectColor.opacity;
						}
					}
					// if direct color -> override current, if delta color -> apply on top
					if (hot) {
						if (hotDelta) {
							Utilities.applyDeltaHLS(material.color, hotColor.hls);
							material.opacity = Utilities.clamp(material.opacity * hotColor.opacity, 0.0, 1.0);
						} else {
							material.color.copy(hotColor.rgb);
							material.opacity = hotColor.opacity;
						}
					}
					material.transparent = material.opacity < 1;
				});
			});
		});
	};

	Utilities.clamp = function(value, min, max) {
		if (value < min) {
			return min;
		}
		if (value > max) {
			return max;
		}
		return value;
	};

	Utilities.swap = function(obj, a, b) {
		var tmp = obj[a];
		obj[a] = obj[b];
		obj[b] = tmp;
	};

	Utilities.makeDataUri = function(data) {
		return data && "data:text/plain;base64," + data;
	};

	Utilities.base64ToArrayBuffer = function(src) {
		var str = atob(src);
		var bytes = new Uint8Array(str.length);
		for (var i = 0; i < str.length; ++i) {
			bytes[i] = str.charCodeAt(i);
		}
		return bytes.buffer;
	};

	/**
	 * Calculates instance position, rotation, scale
	 *
	 * @param {object} instance Instance to calculate transformation for.
	 * @param {THREE.Vector3} position Computed position of the instance.
	 * @param {THREE.Rotation} rotation Computed rotation of the instance.
	 * @param {THREE.Vector3} scale Computed scale of the instance.
	 * @param {THREE.Box3} [bbox] Bounding box of the instance (needed for model instances only)
	 */
	Utilities.getInstanceTransform = function(instance, position, rotation, scale, bbox) {
		Utilities.toVector3(instance.pos, position);
		Utilities.toVector3(instance.scale, scale);

		var rot = Utilities.toVector3(instance.rot);
		rotation.set(degToRad(rot.x), degToRad(rot.y), degToRad(rot.z), "YXZ");

		var anchor;
		if (instance.isPolygon) {
			anchor = new Vector3(0, 0, 0);
		} else if (instance.isBox || instance.isCylinder) {
			anchor = new Vector3(0, 0, -1); // see sapvobox.cpp::CSapVoBox::GetAnchorPoint() lines 742-744 (cylinder behaviour is the same)
		} else if (instance.isModel) {
			anchor = new Vector3(0, 0, -1.0 * (bbox.min.z > 0 ? bbox.min.z : bbox.max.z)); // see sapvo3d.cpp::CSapVo3D::GetAnchorPoint() lines 801-804
		} else {
			Log.error("Unsupported instance type", "", thisModule);
		}

		// skip anchor related computation if rotation is (0,0,0) and scale is (1,1,1) [common scenario]
		if (rotation.x !== 0 || rotation.y !== 0 || rotation.z !== 0 || scale.x !== 1 || scale.y !== 1 || scale.z !== 1) {
			// transform anchor point: apply scale and rotation, follow implementation in sapvosite.h::CalcWorldTransformation lines 5267-5272
			var mat = new Matrix4();
			mat.makeRotationFromEuler(rotation);

			var out = new Matrix4();
			out.makeScale(scale.x, scale.y, scale.z);
			out.multiply(mat);

			anchor.applyMatrix4(out);
		}
		anchor.z = -anchor.z;
		position.sub(anchor);
	};

	/**
	 * Calculates instance transformation matrix.
	 *
	 * @param {object} instance Instance to calculate transformation matrix for.
	 * @param {THREE.Matrix4} matrix Computed matrix of the instance.
	 * @param {THREE.Box3} [bbox] Bounding box of the instance (needed for model instances only)
	 */
	Utilities.getInstanceMatrix = function(instance, matrix, bbox) {
		var pos = new Vector3(), rot = new THREE.Euler(), scale = new Vector3();
		Utilities.getInstanceTransform(instance, pos, rot, scale, bbox);
		// skip matrix composition for case where position is (0,0,0), rotation is (0,0,0) and scale is (1,1,1) [common scenario of 'default' transform]
		if (pos.x !== 0 || pos.y !== 0 || pos.z !== 0 || rot.x !== 0 || rot.y !== 0 || rot.z !== 0 || scale.x !== 1 || scale.y !== 1 || scale.z !== 1) {
			var quaternion = new THREE.Quaternion();
			quaternion.setFromEuler(rot, false);
			matrix.compose(pos, quaternion, scale);
			matrix._identity = false; // hint
		} else {
			matrix.identity();
			matrix._identity = true; // hint
		}
	};

	Utilities.createMaterial = function(doubleSide) {
		return new THREE.MeshPhongMaterial({
			color: 0xffffff,
			opacity: 1.0,
			shininess: 1,
			specular: 0x101009,
			side: doubleSide ? THREE.DoubleSide : THREE.FrontSide
		});
	};

	Utilities.createLineMaterial = function() {
		return new THREE.LineBasicMaterial({
			// On Mac - linewidth doesn't work with chrome, works with Safari - Issue with WebGL
			// https://github.com/mrdoob/three.js/issues/269,
			// https://github.com/mrdoob/three.js/issues/10357
			color: 0xffffff,
			opacity: 1.0,
			linewidth: 1
		});
	};

	Utilities.propertyAdded = function(instance, property) {
		return instance[property] && !instance._last[property];
	};

	Utilities.propertyRemoved = function(instance, property) {
		return !instance[property] && instance._last[property];
	};

	Utilities.propertyChanged = function(instance, property) {
		if (Array.isArray(property)) {
			for (var i = 0; i < property.length; ++i) {
				if (instance[property[i]] !== instance._last[property[i]]) {
					return true;
				}
			}
			return false;
		} else {
			return instance[property] !== instance._last[property];
		}
	};

	Utilities.updateProperty = function(instance, property) {
		if (Array.isArray(property)) {
			property.forEach(function(prop) {
				instance._last[prop] = instance[prop];
			});
		} else {
			instance._last[property] = instance[property];
		}
	};

	/**
	 * Normalize the object. Implementation replicates Visual Business ActiveX implementation of object(s) normalization.
	 * The node is centered and then scaled uniformly so that vertex coordinates fit into the 3D box defined as range [(-1, -1, -1), (+1, +1, +1)].
	 *
	 * @param {THREE.Object3D} root The node to normalize.
	 * @param {THREE.Matrix4} [matrix] Copy transformation into matrix or apply to root directly.
	 * @param {THREE.Box3} [bbox] Copy bounding box into it.
	 */
	Utilities.normalizeObject3D = function(root, matrix, bbox) {
		// Re-centre according to the VB ActiveX implementation.
		var box = new THREE.Box3().setFromObject(root);
		var center = box.getCenter(new Vector3());

		box.min.sub(new Vector3(center.x, center.y, -center.z));
		box.max.sub(new Vector3(center.x, center.y, -center.z));

		// Normalize coordinates (not the size!) according to the VB ActiveX implementation.
		var scaleFactor = Math.max(
			Math.abs(box.min.x),
			Math.abs(box.min.y),
			Math.abs(box.min.z),
			Math.abs(box.max.x),
			Math.abs(box.max.y),
			Math.abs(box.max.z)
		);
		if (scaleFactor) {
			scaleFactor = 1 / scaleFactor;
		}

		box.min.set(box.min.x * scaleFactor, box.min.y * scaleFactor, -box.min.z * scaleFactor);
		box.max.set(box.max.x * scaleFactor, box.max.y * scaleFactor, -box.max.z * scaleFactor);

		Utilities.swap(box, "min", "max");

		if (bbox) {
			bbox.copy(box);
		}

		var m1 = new Matrix4().makeScale(scaleFactor, scaleFactor, scaleFactor);
		var m2 = new Matrix4().makeTranslation(-center.x, -center.y, -center.z);

		root.updateMatrix(); // make sure local TM is up to date

		m1.multiply(m2);
		m1.multiply(root.matrix);

		if (matrix) {
			matrix.copy(m1);
		} else {
			m1.decompose(root.position, root.quaternion, root.scale);
		}
	};

	/**
	 * Clone material(s). Material can be single object or array of materials.
	 *
	 * @param {THREE.Material|THREE.Material[]} material Material(s) to clone.
	 * @return {THREE.Material|THREE.Material[]} Cloned material(s).
	 */
	Utilities.cloneMaterials = function(material) {
		if (material) {
			if (Array.isArray(material)) {
				return material.map(function(mat) {
					return mat.clone();
				});
			}
			return material.clone();
		}
		return material;
	};

	/**
	* Function returns alias for the specified Attribute within DataType.
	* Only top level data types are checked, nested data types are ignored.
	*
	* @param {object} context The Context which holds all definitions and populated data
	* @param {string} dataType The DataType name for the given attribute
	* @param {string} attribute The Attribute name
	* @returns {string} String alias of an attribute or undefined if not found
	*/
	Utilities.getAttributeAlias = function(context, dataType, attribute) {
		for (var i = 0; i < context.dataTypes.length; ++i) {
			var type = context.dataTypes[i];
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

	/**
	* Function checks whether channel is enabled in layers object
	*
	* @param {THREE.Layers} layers The Layers object
	* @param {number} channel The channel number to test
	* @returns {boolean} True if channel is enabled in Layers objects or false otherwise
	*/
	Utilities.layersEnabled = function(layers, channel) {
		return (layers.mask & ( 1 << channel | 0 ) ) !== 0;
	};

	Utilities.parseKeyboardShortcut = function (shortcutsString) {

		var shortcutsArray = [];
		var shortcutObject = {},
		code = false,
		shortcuts;
		shortcutObject.ctrlKey = false;
		shortcutObject.altKey = false;
		shortcutObject.shiftKey = false;
		

		if (typeof shortcutsString === 'string') {
			shortcuts = shortcutsString.split(",");
		} else {
			shortcuts = shortcutsString;
			shortcutObject.keyCode = shortcuts;
			shortcutsArray.push(shortcutObject);
			return shortcutsArray;
		}

		shortcuts.forEach(parseShortcut);

		function parseShortcut(shortcut) {
			if (shortcut.includes("CTRL")) {
				shortcutObject.ctrlKey = true;
				 code = true;
			}
			if (shortcut.includes("ALT")) {
				shortcutObject.altKey = true;
				code = true;
			}
			if (shortcut.includes("SHIFT")) {
				shortcutObject.shiftKey = true;
				code = true;
			}

			if (code) {
				var keys = shortcut.split("+");
				shortcutObject.keyCode = keys[keys.length - 1];
			} else {
				shortcutObject.keyCode = shortcut;
			}
			shortcutsArray.push({
				shiftKey: shortcutObject.shiftKey,
				ctrlKey: shortcutObject.ctrlKey,
				altKey: shortcutObject.altKey,
				keyCode: shortcutObject.keyCode
			});
			shortcutObject.ctrlKey = false;
			shortcutObject.altKey = false;
			shortcutObject.shiftKey = false;
			shortcutObject.keyCode = '';
		}

		return shortcutsArray;

	};

	Utilities.matchKeyboardShortcut = function (event, shortcutsArray) {
		// The below code will return true if a single pair of shortcut matches with the clicked event
		var flag = false,
			eventCount = 0,
			eventExists = false,
			shortcutsCount = 0;

		if (event.altKey) {
			eventCount++;
			eventExists = true;
		}
		if (event.shiftKey) {
			eventCount++;
			eventExists = true;
		}
		if (event.ctrlKey) {
			eventCount++;
			eventExists = true;
		}

		for (var i = 0; i < shortcutsArray.length; i++) {
			var key = false,
				trueCount = 0,
				specifierCount = 0,
				specifierExists = false;

			if (shortcutsArray[i].altKey || shortcutsArray[i].shiftKey || shortcutsArray[i].ctrlKey) {
				specifierExists = true;
				if (shortcutsArray[i].altKey) {
					shortcutsCount++;
				}
				if (shortcutsArray[i].ctrlKey) {
					shortcutsCount++;
				}
				if (shortcutsArray[i].shiftKey) {
					shortcutsCount++;
				}
			}
			if (event.keyCode == shortcutsArray[i].keyCode) {

				trueCount++;
				key = true;
			} else {
				key = false;
				flag = false;
				continue;
			}
			if (event.altKey || shortcutsArray[i].altKey) {
				if (event.altKey == shortcutsArray[i].altKey) {
					trueCount++;
					specifierCount++;
				}
			}
			if (event.shiftKey || shortcutsArray[i].shiftKey) {
				if (event.shiftKey == shortcutsArray[i].shiftKey) {
					trueCount++;
					specifierCount++;
				}
			}
			if (event.ctrlKey || shortcutsArray[i].ctrlKey) {
				if (event.ctrlKey == shortcutsArray[i].ctrlKey) {
					trueCount++;
					specifierCount++;
				}
			}

			if ((trueCount > 1 && key == true && specifierCount == eventCount && eventCount == shortcutsCount ) ||
				(trueCount = 1 && key == true && specifierExists == false && eventExists == false)) {
				flag = true;
				break;
			}

		}

		return flag;
	};

	return Utilities;
});
