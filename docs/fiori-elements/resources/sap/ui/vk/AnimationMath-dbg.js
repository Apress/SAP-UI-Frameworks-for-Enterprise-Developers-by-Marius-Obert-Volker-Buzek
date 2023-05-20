/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/Log",
	"./glMatrix",
	"./AnimationTrackType",
	"./AnimationTrackValueType"
], function(
	Log,
	glMatrix,
	AnimationTrackType,
	AnimationTrackValueType
) {
	"use strict";

	var thisModule = "sap.ui.vk.AnimationMath"; // The module's name for Log.error.

	var AnimationMath = {};

	AnimationMath.clamp11 = function(value) {
		return Math.max(-1, Math.min(1, value));
	};

	AnimationMath.neutralAngleAxisToGlMatrixQuat = function(value) {
		return glMatrix.quat.setAxisAngle(glMatrix.quat.create(), glMatrix.vec3.fromValues(value[0], value[1], value[2]), value[3]);
	};

	AnimationMath.neutralEulerToGlMatrixQuat = function(value) {
		var m0 = 1, m1 = 1, m2 = 1, m3 = 1;

		switch (value[3]) {
			case 6:// XYZ
				m1 = -1;
				m3 = -1;
				break;

			case 18:// YXZ
				m1 = -1;
				m2 = -1;
				break;

			case 33:// ZXY
				m0 = -1;
				m3 = -1;
				break;

			case 36:// ZYX
				m0 = -1;
				m2 = -1;
				break;

			case 24:// YZX
				m2 = -1;
				m3 = -1;
				break;

			case 9:// XZY
				m0 = -1;
				m1 = -1;
				break;

			default:
			// console.warn('Unknown order: ' + order);
		}

		var heading = value[0];
		var attitude = value[1];
		var bank = value[2];
		var c1 = Math.cos(heading / 2);
		var s1 = Math.sin(heading / 2);
		var c2 = Math.cos(attitude / 2);
		var s2 = Math.sin(attitude / 2);
		var c3 = Math.cos(bank / 2);
		var s3 = Math.sin(bank / 2);

		var x = s1 * c2 * c3 + m0 * c1 * s2 * s3;
		var y = c1 * s2 * c3 + m1 * s1 * c2 * s3;
		var z = c1 * c2 * s3 + m2 * s1 * s2 * c3;
		var w = c1 * c2 * c3 + m3 * s1 * s2 * s3;
		return glMatrix.quat.fromValues(x, y, z, w);
	};

	AnimationMath.threeQuatToNeutralEuler = function(q, order) {
		var rm = glMatrix.mat4.fromQuat(glMatrix.mat4.create(), glMatrix.quat.fromValues(q.x, q.y, q.z, q.w));
		var m11 = rm[0], m12 = rm[4], m13 = rm[8];
		var m21 = rm[1], m22 = rm[5], m23 = rm[9];
		var m31 = rm[2], m32 = rm[6], m33 = rm[10];
		var x = 0, y = 0, z = 0;
		var eps = 0.9999999;

		switch (order) {
			case 6:// XYZ
				y = Math.asin(AnimationMath.clamp11(m13));
				if (Math.abs(m13) < eps) {
					x = Math.atan2(-m23, m33);
					z = Math.atan2(-m12, m11);
				} else {
					x = Math.atan2(m32, m22);
				}
				break;

			case 18:// YXZ
				x = Math.asin(-AnimationMath.clamp11(m23));
				if (Math.abs(m23) < eps) {
					y = Math.atan2(m13, m33);
					z = Math.atan2(m21, m22);
				} else {
					y = Math.atan2(-m31, m11);
				}
				break;

			case 33:// ZXY
				x = Math.asin(AnimationMath.clamp11(m32));
				if (Math.abs(m32) < eps) {
					y = Math.atan2(-m31, m33);
					z = Math.atan2(-m12, m22);
				} else {
					z = Math.atan2(m21, m11);
				}
				break;

			case 36:// ZYX
				y = Math.asin(-AnimationMath.clamp11(m31));
				if (Math.abs(m31) < eps) {
					x = Math.atan2(m32, m33);
					z = Math.atan2(m21, m11);
				} else {
					z = Math.atan2(-m12, m22);
				}
				break;

			case 24:// YZX
				z = Math.asin(AnimationMath.clamp11(m21));
				if (Math.abs(m21) < eps) {
					x = Math.atan2(-m23, m22);
					y = Math.atan2(-m31, m11);
				} else {
					y = Math.atan2(m13, m33);
				}
				break;

			case 9:// XZY
				z = Math.asin(-AnimationMath.clamp11(m12));
				if (Math.abs(m12) < eps) {
					x = Math.atan2(m32, m22);
					y = Math.atan2(m13, m11);
				} else {
					x = Math.atan2(-m23, m33);
				}
				break;

			default:
			// console.warn('Unknown order: ' + order);
		}

		var value = [x, y, z, order];
		return value;
	};

	AnimationMath.neutralQuatToGlMatrixQuat = function(value) {
		return glMatrix.quat.fromValues(value[0], value[1], value[2], value[3]);
	};

	AnimationMath.glMatrixQuatToNeutral = function(value) {
		return [value[0], value[1], value[2], value[3]];
	};

	/**
	 * Get the value after removing the mod value.
	 * @param {float[]} original Euler Angle.
	 * @returns {float} original - original % (2 * Math.PI).
	 */
	AnimationMath.getModulatedAngularValue = function(original) {
		return original - original % (2 * Math.PI);
	};

	AnimationMath.equalMatrices = function(matrix1, matrix2, error) {
		for (var ei = 0; ei < matrix1.elements.length; ei++) {
			if (Math.abs(matrix1.elements[ei] - matrix2.elements[ei]) > error) {
				return false;
			}
		}
		return true;
	};

	// TODO: introduce interpolation type parameter (a function, maybe?)
	// will always return rotation as Quaternion, regardless of input format
	/**
	 * Interpolate animation keys.
	 *
	 * @param {sap.ui.vk.AnimationTrackValueType} valueType A value type.
	 * @param {object} keyBefore The key before the current time.
	 * @param {object} keyAfter The key after the current time.
	 * @param {float} k The interpolation factor in range [0, 1] in the formula <code>k * keyBefore.value + (1 - k) * keyAfter.value</code>.
	 *  For axis-angle animation the formula is different: <code>k * keyAfter.value[3]</code> for forward animation,
	 *  <code>(k - 1) * keyAfter.value[3]</code> for reversed animation.
	 * @param {sap.ui.vk.AnimationTrack} track The track whose keys are used for interpolation. It is required only for
	 *   the axis-angle rotations.
	 * @param {sap.ui.vk.AnimationTrackType} trackType The type of track. This type defines what `subtract` means for
	 *   parameter <code>valueToSubtract</code>.
	 * @param {true|float|float[]|null} [valueToSubtract] If this is <code>null</code> this interpolation is for a
	 *   forward playback, otherwise this interpolation is for a reverse playback. For axis-angle tracks <code>true</code>
	 *   is just an indicator that the rotations must be accumulated in reverse order. For other track types this value
	 *   is "subtracted" from the interpolated values.
	 * @returns {object} The result has the following properties:
	 *   <ul>
	 *     <li><code>value: float|float[]</code> - The type corresponds to <code>valueType</code>.
	 *   </ul>
	 * @private
	 */
	AnimationMath.interpolate = (function() {
		// These variables are like `static` variables in C/C++. As JS is single-threaded it is safe to re-use them.
		// We need these `static` variable to reduce the number of memory allocations in each call to `interpolate()`.
		var quat = glMatrix.quat;
		var vec3 = glMatrix.vec3;
		var aaQuatTotalRotation = quat.create();    // A cumulative rotation for axis-angle calculations.
		var aaQuatSingleRotation = quat.create();   // A single axis-angle rotation.
		var aaAxis = vec3.create();                 // An axis for a single axis-angle rotation. It is needed as
		                                            // a parameter to `glMatrix.quat.setAxisAngle()`.

		return function(valueType, keyBefore, keyAfter, k, track, trackType, valueToSubtract) {
			var valueBefore = keyBefore.value;
			var valueAfter = keyAfter.value;
			var result = {};
			var q1;
			var q2;
			var q;
			var epsilonForDivision = 0.0001; // Scale or opacity factors for reverse playbacks smaller than this value can lead to computational errors.

			switch (valueType) {
				case AnimationTrackValueType.Quaternion:
					q1 = AnimationMath.neutralQuatToGlMatrixQuat(valueBefore);
					q2 = AnimationMath.neutralQuatToGlMatrixQuat(valueAfter);
					q = glMatrix.quat.slerp(glMatrix.quat.create(), q1, q2, k);
					if (valueToSubtract != null) {
						// Interpolate is for a reversed playback.
						// "Subtract" rotation `valueToSubtract` from the interpolated value.
						q = glMatrix.quat.multiply(glMatrix.quat.create(), q, glMatrix.quat.invert(glMatrix.quat.create(), AnimationMath.neutralQuatToGlMatrixQuat(valueToSubtract)));
					}
					result.value = AnimationMath.glMatrixQuatToNeutral(q);
					break;

				case AnimationTrackValueType.Euler:
					var r = [
						AnimationMath.interpolateScalarLinear(valueBefore[0], valueAfter[0], k),
						AnimationMath.interpolateScalarLinear(valueBefore[1], valueAfter[1], k),
						AnimationMath.interpolateScalarLinear(valueBefore[2], valueAfter[2], k),
						valueBefore[3]
					];
					if (valueToSubtract != null) {
						// Interpolate is for a reversed playback.
						// "Subtract" rotation `valueToSubtract` from the interpolated value.
						r[0] -= valueToSubtract[0];
						r[1] -= valueToSubtract[1];
						r[2] -= valueToSubtract[2];
					}
					result[AnimationTrackValueType.Euler] = r;
					q = AnimationMath.neutralEulerToGlMatrixQuat(r);
					result.value = AnimationMath.glMatrixQuatToNeutral(q);
					break;

				case AnimationTrackValueType.AngleAxis:
					var key;
					var idx;
					var keyCount;
					var lastX;
					var lastY;
					var lastZ;
					var lastAngle;

					quat.identity(aaQuatTotalRotation);

					// The first rotations are accumulated. The last rotation is interpolated.
					if (valueToSubtract === true) {
						// For reversed playbacks axis-angle rotations are accumulated from the last key. And the
						// rotation direction is opposite to the value in the key. The angle and the axis are taken from
						// the right bracket, i.e. `keyAfter`.
						for (idx = track.getKeysCount() - 1; idx >= 0; idx--) {
							key = track.getKey(idx);
							if (key === keyAfter) {
								break;
							}
							quat.setAxisAngle(aaQuatSingleRotation, vec3.copy(aaAxis, key.value), -key.value[3]);
							quat.multiply(aaQuatTotalRotation, aaQuatSingleRotation, aaQuatTotalRotation);
						}
						lastX = valueAfter[0];
						lastY = valueAfter[1];
						lastZ = valueAfter[2];
						// 0 <= k <= 1 and we accumulate rotations in reverse order, so we need to rotate by fraction
						// `1 - k` and the fraction must be negative.
						lastAngle = (k - 1) * valueAfter[3];
					} else {
						// For forward playbacks axis-angle rotations are accumulated from the first key.
						for (idx = 0, keyCount = track.getKeysCount(); idx < keyCount; idx++) {
							key = track.getKey(idx);
							if (key === keyAfter) {
								break;
							}
							quat.setAxisAngle(aaQuatSingleRotation, vec3.copy(aaAxis, key.value), key.value[3]);
							quat.multiply(aaQuatTotalRotation, aaQuatSingleRotation, aaQuatTotalRotation);
						}
						lastX = valueAfter[0];
						lastY = valueAfter[1];
						lastZ = valueAfter[2];
						lastAngle = k * valueAfter[3];
					}

					// The last rotation is interpolated.
					result[AnimationTrackValueType.AngleAxis] = [lastX, lastY, lastZ, lastAngle];
					quat.setAxisAngle(aaQuatSingleRotation, vec3.set(aaAxis, lastX, lastY, lastZ), lastAngle);
					quat.multiply(aaQuatTotalRotation, aaQuatSingleRotation, aaQuatTotalRotation);

					result.value = AnimationMath.glMatrixQuatToNeutral(aaQuatTotalRotation);
					break;

				case AnimationTrackValueType.Vector3:
					result.value = [
						AnimationMath.interpolateScalarLinear(valueBefore[0], valueAfter[0], k),
						AnimationMath.interpolateScalarLinear(valueBefore[1], valueAfter[1], k),
						AnimationMath.interpolateScalarLinear(valueBefore[2], valueAfter[2], k)
					];
					if (valueToSubtract != null) {
						// Interpolate is for a reversed playback.
						// "Subtract" rotation `valueToSubtract` from the interpolated value.
						switch (trackType) {
							case AnimationTrackType.Translate:
								result.value[0] -= valueToSubtract[0];
								result.value[1] -= valueToSubtract[1];
								result.value[2] -= valueToSubtract[2];
								break;
							case AnimationTrackType.Scale:
								if (Math.abs(valueToSubtract[0]) < epsilonForDivision || Math.abs(valueToSubtract[1]) < epsilonForDivision || Math.abs(valueToSubtract[2]) < epsilonForDivision) {
									Log.error("The scale factor for reverse relative animation is too small", "[" + valueToSubtract[0] + ", " + valueToSubtract[1] + ", " + valueToSubtract[2] + "]", thisModule);
								} else {
									result.value[0] /= valueToSubtract[0];
									result.value[1] /= valueToSubtract[1];
									result.value[2] /= valueToSubtract[2];
								}
								break;
							default:
								break;
						}
					}
					break;

				default:
					// scalar

					result.value = AnimationMath.interpolateScalarLinear(valueBefore, valueAfter, k);

					if (valueToSubtract != null) {
						switch (trackType) {
							case AnimationTrackType.Opacity:
								if (Math.abs(valueToSubtract) < epsilonForDivision) {
									Log.warning("The opacity factor for reverse relative animation is too small", "[" + valueToSubtract + "]", thisModule);
								} else {
									result.value /= valueToSubtract;
								}
								break;
							default:
								break;
						}
					}
					break;
			}

			return result;
		};
	})();

	AnimationMath.interpolateScalarLinear = function(value1, value2, k) {
		return value1 + k * (value2 - value1);
	};

	/**
	 * Converts cartesian coordinates to polar coordinates
	 * @param {float[]} cartesian Coordinates in cartesian space
	 * @returns {object} Coordinates in polar space
	 * <ul>
	 *     <li><code>azimuth: float</code> - An azimuth of the axis of rotation in radians</li>
	 *     <li><code>elevation: float</code> - An elevation of the axis of rotation in radians</li>
	 *     <li><code>radius: float</code> - A radial distance</li>
	 * </ul>
	 */
	AnimationMath.cartesianToPolar = function(cartesian) {
		var result = {
			azimuth: 0,
			elevation: 0,
			radius: 1
		};

		if (Array.isArray(cartesian) && cartesian.length === 3) {
			var x = cartesian[0];
			var y = cartesian[1];
			var z = cartesian[2];

			var length2 = x * x + z * z;
			if (length2 > 0) {
				result.azimuth = Math.acos(z / Math.sqrt(length2)) * (x < 0 ? -1 : 1);
			}

			result.radius = Math.sqrt(x * x + y * y + z * z);

			if (result.radius > 0) {
				result.elevation = Math.asin(y / result.radius);
			}
		}

		return result;
	};

	/**
	 * Converts polar coordinates to cartesian coordinates
	 * @param {object} polar Coordinates in polar space
	 * <ul>
	 *     <li><code>polar.azimuth: float</code> - An azimuth of the axis of rotation in radians</li>
	 *     <li><code>polar.elevation: float</code> - An elevation of the axis of rotation in radians</li>
	 *     <li><code>radius: float</code> - A radial distance. Defaults to 1.0 if omitted</li>
	 * </ul>
	 * @returns {float[]} Coordinates on cartesian space
	 */
	AnimationMath.polarToCartesian = function(polar) {
		var result = [0, 0, 1];
		var radius = "radius" in polar ? polar.radius : 1.0;

		result[0] = radius * Math.cos(polar.elevation) * Math.sin(polar.azimuth);
		result[1] = radius * Math.sin(polar.elevation);
		result[2] = radius * Math.cos(polar.elevation) * Math.cos(polar.azimuth);

		return result;
	};

	/**
	 * Converts cartesian coordinates to polar coordinates
	 * @param {float[]} cartesian Coordinates in cartesian space
	 * @returns {object} Coordinates in polar space
	 * <ul>
	 *     <li><code>azimuth: float</code> - An azimuth of the axis of rotation in radians</li>
	 *     <li><code>elevation: float</code> - An elevation of the axis of rotation in radians</li>
	 *     <li><code>radius: float</code> - A radial distance</li>
	 * </ul>
	 */
	AnimationMath.cartesianToPolar = function(cartesian) {
		var result = {
			azimuth: 0,
			elevation: 0,
			radius: 1
		};

		if (Array.isArray(cartesian) && cartesian.length === 3) {
			var x = cartesian[0];
			var y = cartesian[1];
			var z = cartesian[2];

			var length2 = x * x + z * z;
			if (length2 > 0) {
				result.azimuth = Math.acos(z / Math.sqrt(length2)) * (x < 0 ? -1 : 1);
			}

			result.radius = Math.sqrt(x * x + y * y + z * z);

			if (result.radius > 0) {
				result.elevation = Math.asin(y / result.radius);
			}
		}

		return result;
	};

	/**
	 * Converts polar coordinates to cartesian coordinates
	 * @param {object} polar Coordinates in polar space
	 * <ul>
	 *     <li><code>polar.azimuth: float</code> - An azimuth of the axis of rotation in radians</li>
	 *     <li><code>polar.elevation: float</code> - An elevation of the axis of rotation in radians</li>
	 *     <li><code>radius: float</code> - A radial distance. Defaults to 1.0 if omitted</li>
	 * </ul>
	 * @returns {float[]} Coordinates on cartesian space
	 */
	AnimationMath.polarToCartesian = function(polar) {
		var result = [0, 0, 1];
		var radius = "radius" in polar ? polar.radius : 1.0;

		result[0] = radius * Math.cos(polar.elevation) * Math.sin(polar.azimuth);
		result[1] = radius * Math.sin(polar.elevation);
		result[2] = radius * Math.cos(polar.elevation) * Math.cos(polar.azimuth);

		return result;
	};

	return AnimationMath;
});
