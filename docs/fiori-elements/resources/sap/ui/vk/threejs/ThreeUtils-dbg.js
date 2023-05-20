/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

/**
 * Provides utility methods to dispose three.js geometries and materials.
 */
sap.ui.define([
	"../thirdparty/three",
	"sap/base/Log",
	"./MarchingCubes",
	"../ObjectType"
], function(
	THREE,
	Log,
	MarchingCubes,
	ObjectType
) {
	"use strict";

	var ThreeUtilsZeroBuffer = new Float32Array(1); // will store 4 bytes with zeroes (== 0x00000000u)
	var ThreeUtils = {};

	ThreeUtils._disposeMaterial = function(oMaterial) {
		if (oMaterial.map) {
			oMaterial.map.dispose();
		}
		if (oMaterial.lightMap) {
			oMaterial.lightMap.dispose();
		}
		if (oMaterial.bumpMap) {
			oMaterial.bumpMap.dispose();
		}
		if (oMaterial.normalMap) {
			oMaterial.normalMap.dispose();
		}
		if (oMaterial.specularMap) {
			oMaterial.specularMap.dispose();
		}
		if (oMaterial.envMap) {
			oMaterial.envMap.dispose();
		}
		if (oMaterial.alphaMap) {
			oMaterial.alphaMap.dispose();
		}
		if (oMaterial.emissiveMap) {
			oMaterial.emissiveMap.dispose();
		}
		if (oMaterial.aoMap) {
			oMaterial.aoMap.dispose();
		}

		oMaterial.dispose();
	};

	ThreeUtils.disposeMaterial = function(oMaterial) {
		if (oMaterial) {
			ThreeUtils._disposeMaterial(oMaterial);
		}
	};

	ThreeUtils.disposeObject = function(oThreeObject) {
		if (oThreeObject instanceof THREE.Mesh || oThreeObject instanceof THREE.Line || oThreeObject instanceof THREE.Box3Helper) {
			if (oThreeObject.geometry) {
				oThreeObject.geometry.dispose();
			}
			if (oThreeObject.material) {
				ThreeUtils._disposeMaterial(oThreeObject.material);
			}
		}
	};

	ThreeUtils.disposeGeometry = function(oThreeObject) {
		if (oThreeObject instanceof THREE.Mesh || oThreeObject instanceof THREE.Line || oThreeObject instanceof THREE.Box3Helper) {
			if (oThreeObject.geometry) {
				oThreeObject.geometry.dispose();
			}
		}
	};

	ThreeUtils.getAllTHREENodes = function(nodeList, all3DNodes, allGroupNodes) {
		if (!nodeList) {
			return;
		}

		if (!all3DNodes || !allGroupNodes) {
			Log.error("getAllTHREENodes input parameters - all3DNodes and/or allGroupNodes are undefined.");
			return;
		}

		nodeList.forEach(function(n) {
			if (n instanceof THREE.Mesh) {
				all3DNodes.push(n);
			} else if (n instanceof THREE.Light) {
				all3DNodes.push(n);
			} else if (n instanceof THREE.Camera) {
				all3DNodes.push(n);
			} else if (n instanceof THREE.Box3Helper) {
				all3DNodes.push(n);
			} else if (n instanceof THREE.Group) {
				allGroupNodes.push(n);
			}

			if (n.children && n.children.length > 0) {
				ThreeUtils.getAllTHREENodes(n.children, all3DNodes, allGroupNodes);
			}
		});
	};

	// Be careful not use this caching object in recursive calls.
	var vertex = new THREE.Vector3();

	var computeBoundingBoxExcludingHotSpotAndPMI = function(object, box) {
		box.makeEmpty();

		object.updateMatrixWorld(true);
		object.traverse(function(node) {
			if (node.userData.objectType === ObjectType.Hotspot || node.userData.objectType === ObjectType.PMI) {
				return;
			}

			var i;
			var count;
			var geometry = node.geometry;
			if (geometry != null) {
				if (geometry.isGeometry) {
					var vertices = geometry.vertices;

					for (i = 0, count = vertices.length; i < count; i++) {
						vertex.copy(vertices[i]);
						vertex.applyMatrix4(node.matrixWorld);
						box.expandByPoint(vertex);
					}
				} else if (geometry.isBufferGeometry) {
					var attribute = geometry.attributes.position;
					if (attribute != null) {
						var rg = node.userData.renderGroup;
						for (i = rg ? rg.firstVertex : 0, count = rg ? rg.lastVertex : attribute.count; i < count; i++) {
							vertex.fromBufferAttribute(attribute, i).applyMatrix4(node.matrixWorld);
							box.expandByPoint(vertex);
						}
					}
				}
			}
		});

		return box;
	};

	ThreeUtils.computeObjectOrientedBoundingBox = function(object, box) {
		var parent = object.parent;
		var matrix = object.matrix.clone();
		var matrixAutoUpdate = object.matrixAutoUpdate;
		object.parent = null;
		object.matrix.identity();
		object.matrixAutoUpdate = false;
		computeBoundingBoxExcludingHotSpotAndPMI(object, box);
		object.matrixAutoUpdate = matrixAutoUpdate;
		object.matrix.copy(matrix);
		object.parent = parent;
		object.updateMatrixWorld(true);
		return box;
	};

	ThreeUtils.computeClusterBoundingBoxes = function(clusters, data, nativeScene, textureUpdateResults) {
		var data8 = new Uint8Array(data.buffer);
		var cluster, instances, repeats, j, jCount, instanceIndex, k, offset, t, w;
		var maxRadiusSq;
		var tm = new THREE.Matrix4();
		var m = tm.elements;
		var vec = new THREE.Vector3();

		// update cluster bbox / bsphere using only the data array (not touching threejs objects)
		for (var i = 0, iCount = clusters.length; i < iCount; ++i) {
			if (textureUpdateResults[3 + i] === 0) {
				continue; // no need to update this cluster bbox
			}

			// for each cluster...
			var box = new THREE.Box3();
			var sphereCenter = new THREE.Vector3();
			maxRadiusSq = 0;
			cluster = clusters[i].geometry;
			repeats = cluster.userData.renderInstanceCount || 1; // some clusters are used with instanced rendering
			instances = cluster.instanceIndices;
			for (w = 0; w < 2; ++w) {
				for (j = 0, jCount = instances.length; j < jCount; ++j) {
					// ...for each instance in the cluster
					instanceIndex = instances[j];
					for (k = 0; k < repeats; ++k) {
						offset = instanceIndex * 20;
						instanceIndex++;

						if ((data8[offset * 4 + 3] & 1) === 1) {
							// this instance is visible
							m[0] = data[offset + 8];
							m[4] = data[offset + 9];
							m[8] = data[offset + 10];
							m[12] = data[offset + 11];
							m[1] = data[offset + 12];
							m[5] = data[offset + 13];
							m[9] = data[offset + 14];
							m[13] = data[offset + 15];
							m[2] = data[offset + 16];
							m[6] = data[offset + 17];
							m[10] = data[offset + 18];
							m[14] = data[offset + 19];

							for (t = 0; t < 8; ++t) {
								// iterate all 8 corners of a bbox
								vec.x = data[offset + ((t & 1) > 0 ? 3 : 2)];
								vec.y = data[offset + ((t & 2) > 0 ? 5 : 4)];
								vec.z = data[offset + ((t & 4) > 0 ? 7 : 6)];
								vec.applyMatrix4(tm);
								if (w > 0) {
									maxRadiusSq = Math.max(maxRadiusSq, sphereCenter.distanceToSquared(vec));
								} else {
									box.expandByPoint(vec);
								}
							}
						}
					}
				}

				if (w === 0) {
					// first pass is for computing bounding box
					if (box.isEmpty()) {
						// probably all objects are hidden inside this cluster
						cluster.boundingBox = null;
						cluster.boundingSphere = null;
						break;
					}

					// computing bounding sphere will require another pass (or storing computed values in an array)
					box.getCenter(sphereCenter);
				} else {
					// second pass for computing bounding sphere finished
					cluster.boundingBox = box;
					cluster.boundingSphere = new THREE.Sphere(sphereCenter, Math.sqrt(maxRadiusSq));
				}
			}

			// debug: leave here
			// if (cluster.boundingBox) {
			// 	// var tempBox = new THREE.Box3Helper(cluster.boundingBox, clusters[i].material.color);
			// 	var tempBox = new THREE.Box3Helper(cluster.boundingBox, 0xff0000);
			// 	tempBox.updateMatrixWorld();
			// 	nativeScene.add(tempBox);
			// }

			// debug: leave here
			// if (cluster.boundingBox) {
			// 	var tempSphere = new THREE.Mesh(new THREE.SphereGeometry(cluster.boundingSphere.radius, 8, 8), clusters[i].material.clone());
			// 	tempSphere.position.copy(cluster.boundingSphere.center);
			// 	tempSphere.material.color.set(0x0000ff);
			// 	// tempSphere.material.transparent = true;
			// 	tempSphere.material.wireframe = true;
			// 	tempSphere.updateMatrixWorld();
			// 	nativeScene.add(tempSphere);
			// }
		}
	};

	ThreeUtils.processUpdatedDataTexture = function(dataTexture, updatedFrom, updatedTo) {
		var perTexel = 4;
		var perLine = perTexel * dataTexture.image.width;
		var yOffset = Math.floor(updatedFrom / perLine);
		var lastLine = Math.ceil(updatedTo / perLine);
		var height = lastLine - yOffset;
		var xOffset = 0;
		var width = dataTexture.image.width;
		var dataOffset = yOffset * perLine;
		if (height === 1) {
			// update less than a whole scanline
			xOffset = Math.floor((updatedFrom - perLine * yOffset) / perTexel);
			dataOffset += xOffset * perTexel;
			width = Math.ceil((updatedTo - dataOffset) / perTexel);
		}

		// rewriting the whole texture each time is slow, only update what's needed
		dataTexture.userData.textureUpdateParams = {
			xOffset: xOffset,
			yOffset: yOffset,
			width: width,
			height: height,
			dataOffset: dataOffset
		};
		dataTexture.needsUpdate = true;
	};

	ThreeUtils.prepareTextureUpdateResults = function(numClusters, previousResults) {
		var length = 3 + numClusters; // [0] = min texel, [1] = max texel, [2] = 2nd pass flag, [3]..[length-1] = per-cluster flags
		if (!previousResults) {
			var textureUpdateResults = new Uint32Array(length);
			textureUpdateResults[0] = 0xFFFFFFFF;
			return textureUpdateResults;
		}

		if (previousResults.length >= length) {
			return previousResults;
		}

		// this may happen if a node was deleted and then some clusters added without a frame redraw
		var newResults = new Uint32Array(length);
		newResults.set(previousResults);
		return newResults;
	};

	function updateDataTexels(textureDataArray, textureUpdateResults, rg, data, len) {
		for (var i = 0, ofs = rg.instanceIndex * 20; i < len; ++i, ++ofs) {
			if (textureDataArray[ofs] != data[i]) {
				textureDataArray[ofs] = data[i];

				textureUpdateResults[3 + rg.clusterIndex] = 1; // this cluster bbox would have to be rebuilt

				if (ofs < textureUpdateResults[0]) {
					textureUpdateResults[0] = ofs;
				}
				if (ofs > textureUpdateResults[1]) {
					textureUpdateResults[1] = ofs;
				}
			}
		}
	}

	function patchNodeVisibilityInDataTexture(node, zeroBuf, textureDataArray, textureUpdateResults) {
		var rg = node.userData.renderGroup;
		if (rg) {
			updateDataTexels(textureDataArray, textureUpdateResults, rg, zeroBuf, 1);
		}

		var children = node.children;
		for (var i = 0, l = children.length; i < l; i++) {
			patchNodeVisibilityInDataTexture(children[i], zeroBuf, textureDataArray, textureUpdateResults);
		}
	}

	ThreeUtils.removeNodeFromClusterRenderingRecursive = function(node, textureDataArray, textureUpdateResults) {
		patchNodeVisibilityInDataTexture(node, ThreeUtilsZeroBuffer, textureDataArray, textureUpdateResults);
	};

	ThreeUtils.updateTextureDataForNode = function(node, scratchBuf, textureDataArray, textureUpdateResults) {
		var ud = node.userData;
		var rg = ud.renderGroup;
		if (rg) {
			if (rg.instanceIndex === null) {
				// this geometry is not rendered using cluster rendering, but is using geometry from the cluster
				// so we must use a conventional threejs renderer for them in a separate pass
				ud.skipDuringClusterRendering = true;
				textureUpdateResults[2] = 1;
			} else if (textureDataArray) {
				var scratch8 = new Uint8Array(scratchBuf.buffer);
				scratch8[0] = 0;
				scratch8[1] = 0;
				scratch8[2] = 0;

				// scratch8[3]: bit0+1 is enum, bits 2..7 are free
				// '0' - hidden, '1' - draw as cluster, '2' - render by three js, '3' - cluster with custom color
				if (ud.initialMaterialId !== ud.materialId
					|| ud.highlightingColor
					|| ud.defaultMaterial // defaultMaterial is used for Outline objects
					|| node.material.transparent === true) {

					scratch8[3] = 2; // render using threejs standard rendering
					ud.skipDuringClusterRendering = true;
					textureUpdateResults[2] = 1;
				} else if (ud.highlightColor || ud.tintColor) {
					// custom diffuse and hardcoded specular+emissive
					var ce = node.material.emissive;
					var cs = node.material.specular;
					if (ce.r === 0.0235 && ce.g === 0.0235 && ce.b === 0.0235
						&& cs.r === 0.0602 && cs.g === 0.0602 && cs.b === 0.0602) {
						ce = node.material.color;
						scratch8[0] = 255 * ce.r;
						scratch8[1] = 255 * ce.g;
						scratch8[2] = 255 * ce.b;
						scratch8[3] = 3; // cluster render + patch color
						delete ud.skipDuringClusterRendering;
					} else {
						scratch8[3] = 2; // render using threejs standard rendering
						ud.skipDuringClusterRendering = true;
						textureUpdateResults[2] = 1;
					}
				} else {
					scratch8[3] = 1; // cluster render
					delete ud.skipDuringClusterRendering;
				}

				scratchBuf[1] = 0.0; // todo: empty

				var rgbb = rg.boundingBox;
				scratchBuf[2] = rgbb[0];
				scratchBuf[3] = rgbb[3];
				scratchBuf[4] = rgbb[1];
				scratchBuf[5] = rgbb[4];
				scratchBuf[6] = rgbb[2];
				scratchBuf[7] = rgbb[5];

				// transposed world matrix
				var m = node.matrixWorld.elements;
				scratchBuf[8] = m[0];
				scratchBuf[9] = m[4];
				scratchBuf[10] = m[8];
				scratchBuf[11] = m[12];
				scratchBuf[12] = m[1];
				scratchBuf[13] = m[5];
				scratchBuf[14] = m[9];
				scratchBuf[15] = m[13];
				scratchBuf[16] = m[2];
				scratchBuf[17] = m[6];
				scratchBuf[18] = m[10];
				scratchBuf[19] = m[14];

				updateDataTexels(textureDataArray, textureUpdateResults, rg, scratchBuf, 20);
			}
		} else if (node.isMesh || node.isLine) {
			// this is not a cluster object (for example, lines or bboxes),
			// so we must use a conventional threejs renderer for them in a separate pass
			textureUpdateResults[2] = 1;
		}
	};

	function recursiveDecode(data, decoded, gx, gy, gz, curLevel, maxLevel, ptrs, dimension) {
		if (curLevel === maxLevel) {
			decoded[gz * dimension * dimension + gy * dimension + gx] = 1;
		}

		if (curLevel < maxLevel) {
			var code = data[ptrs[0]];
			ptrs[0]++;
			gx *= 2;
			gy *= 2;
			gz *= 2;

			var x, y, z;
			for (z = 0; z < 2; ++z) {
				for (y = 0; y < 2; ++y) {
					for (x = 0; x < 2; ++x) {
						if ((code & (1 << (z * 4 + y * 2 + x))) !== 0) {
							recursiveDecode(data, decoded, gx + x, gy + y, gz + z, curLevel + 1, maxLevel, ptrs, dimension);
						}
					}
				}
			}
		}
	}

	function shrinkWrap(buf, dimension) {
		var x, y, z, last;
		var dim2 = dimension * dimension;
		var rerun = true;
		var count;

		while (rerun) {
			// note: usually we need to run this code 2 times to make sure that filling one line in X does not make another line in Y or Z longer
			rerun = false;
			count = 0;

			// X
			for (z = 0; z < dimension; ++z) {
				for (y = 0; y < dimension; ++y) {
					for (x = 0; x < dimension; ++x) {
						if (buf[z * dim2 + y * dimension + x] > 0) {
							x++;

							// found first non-empty in a line, now let's find the last one...
							for (last = dimension - 1; last > x; --last) {
								if (buf[z * dim2 + y * dimension + last] > 0) {
									// now fill all boxes between 'x' and 'last'
									for (; x < last; ++x) {
										if (buf[z * dim2 + y * dimension + x] === 0) {
											buf[z * dim2 + y * dimension + x] = 1;
											rerun = true;
										}
									}

									break;
								}
							}

							count++;
							break;
						}
					}
				}
			}

			// Y
			for (z = 0; z < dimension; ++z) {
				for (x = 0; x < dimension; ++x) {
					for (y = 0; y < dimension; ++y) {
						if (buf[z * dim2 + y * dimension + x] > 0) {
							y++;

							// found first non-empty in a line, now let's find the last one...
							for (last = dimension - 1; last > y; --last) {
								if (buf[z * dim2 + last * dimension + x] > 0) {
									// now fill all boxes between 'y' and 'last'
									for (; y < last; ++y) {
										if (buf[z * dim2 + y * dimension + x] === 0) {
											buf[z * dim2 + y * dimension + x] = 1;
											rerun = true;
										}
									}

									break;
								}
							}

							count++;
							break;
						}
					}
				}
			}

			// Z
			for (y = 0; y < dimension; ++y) {
				for (x = 0; x < dimension; ++x) {
					for (z = 0; z < dimension; ++z) {
						if (buf[z * dim2 + y * dimension + x] > 0) {
							z++;

							// found first non-empty in a line, now let's find the last one...
							for (last = dimension - 1; last > z; --last) {
								if (buf[last * dim2 + y * dimension + x] > 0) {
									// now fill all boxes between 'z' and 'last'
									for (; z < last; ++z) {
										if (buf[z * dim2 + y * dimension + x] === 0) {
											buf[z * dim2 + y * dimension + x] = 1;
											rerun = true;
										}
									}

									break;
								}
							}

							count++;
							break;
						}
					}
				}
			}
		}

		return count * 2; // 2 squares per line
	}

	function buildSquare(config, count, bb, output) {
		var vo = count * 4;
		var pos, nx, ny, nz;

		switch (config) {
			case 0:
				pos = [bb[0], bb[1], bb[5], bb[3], bb[1], bb[5], bb[0], bb[4], bb[5], bb[3], bb[4], bb[5]];
				nx = 0.0;
				ny = 0.0;
				nz = 1.0;
				break;

			case 1:
				pos = [bb[0], bb[1], bb[2], bb[0], bb[4], bb[2], bb[3], bb[1], bb[2], bb[3], bb[4], bb[2]];
				nx = 0.0;
				ny = 0.0;
				nz = -1.0;
				break;
			case 2:
				pos = [bb[0], bb[4], bb[5], bb[3], bb[4], bb[5], bb[0], bb[4], bb[2], bb[3], bb[4], bb[2]];
				nx = 0.0;
				ny = 1.0;
				nz = 0.0;
				break;

			case 3:
				pos = [bb[0], bb[1], bb[5], bb[0], bb[1], bb[2], bb[3], bb[1], bb[5], bb[3], bb[1], bb[2]];
				nx = 0.0;
				ny = -1.0;
				nz = 0.0;
				break;

			case 4:
				pos = [bb[3], bb[1], bb[5], bb[3], bb[1], bb[2], bb[3], bb[4], bb[5], bb[3], bb[4], bb[2]];
				nx = 1.0;
				ny = 0.0;
				nz = 0.0;
				break;

			default:
				pos = [bb[0], bb[1], bb[5], bb[0], bb[4], bb[5], bb[0], bb[1], bb[2], bb[0], bb[4], bb[2]];
				nx = -1.0;
				ny = 0.0;
				nz = 0.0;
				break;
		}

		output.points.set(pos, vo * 3);

		if (output.normals !== undefined) {
			output.normals.set([nx, ny, nz, nx, ny, nz, nx, ny, nz, nx, ny, nz], vo * 3);
		}

		output.indices.set([vo + 0, vo + 1, vo + 2, vo + 2, vo + 1, vo + 3], count * 6);
	}

	function initArrayBoundingBox(bb, x, y, z, bbox, quants) {
		bb[0] = bbox[0] + x * quants[0];
		bb[1] = bbox[1] + y * quants[1];
		bb[2] = bbox[2] + z * quants[2];
		bb[3] = bb[0] + quants[0];
		bb[4] = bb[1] + quants[1];
		bb[5] = bb[2] + quants[2];
}

	function buildShrinkWrapSquares(buf, dimensionX, dimensionY, dimensionZ, bbox, output) {
		var x, y, z, last;
		var dimensionXY = dimensionX * dimensionY;
		var count = 0;
		var quants = [(bbox[3] - bbox[0]) / dimensionX, (bbox[4] - bbox[1]) / dimensionY, (bbox[5] - bbox[2]) / dimensionZ];
		var bb = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]; // bounding box of a small cube

		// X
		for (z = 0; z < dimensionZ; ++z) {
			for (y = 0; y < dimensionY; ++y) {
				for (x = 0; x < dimensionX; ++x) {
					if (buf[z * dimensionXY + y * dimensionX + x] > 0) {
						initArrayBoundingBox(bb, x, y, z, bbox, quants);
						buildSquare(5, count, bb, output);
						count++;

						for (last = dimensionX - 1; last >= x; --last) {
							if (buf[z * dimensionXY + y * dimensionX + last] > 0) {
								initArrayBoundingBox(bb, last, y, z, bbox, quants);
								buildSquare(4, count, bb, output);
								count++;
								break;
							}
						}

						break;
					}
				}
			}
		}

		// Y
		for (z = 0; z < dimensionZ; ++z) {
			for (x = 0; x < dimensionX; ++x) {
				for (y = 0; y < dimensionY; ++y) {
					if (buf[z * dimensionXY + y * dimensionX + x] > 0) {
						initArrayBoundingBox(bb, x, y, z, bbox, quants);
						buildSquare(3, count, bb, output);
						count++;

						for (last = dimensionY - 1; last >= y; --last) {
							if (buf[z * dimensionXY + last * dimensionX + x] > 0) {
								initArrayBoundingBox(bb, x, last, z, bbox, quants);
								buildSquare(2, count, bb, output);
								count++;
								break;
							}
						}

						break;
					}
				}
			}
		}

		// Z
		for (y = 0; y < dimensionY; ++y) {
			for (x = 0; x < dimensionX; ++x) {
				for (z = 0; z < dimensionZ; ++z) {
					if (buf[z * dimensionXY + y * dimensionX + x] > 0) {
						initArrayBoundingBox(bb, x, y, z, bbox, quants);
						buildSquare(1, count, bb, output);
						count++;

						for (last = dimensionZ - 1; last >= z; --last) {
							if (buf[last * dimensionXY + y * dimensionX + x] > 0) {
								initArrayBoundingBox(bb, x, y, last, bbox, quants);
								buildSquare(0, count, bb, output);
								count++;
								break;
							}
						}

						break;
					}
				}
			}
		}

		return count * 4; // number of vertices
	}

	function allocMeshData(data, actualPointCount, actualTriangleCount, desiredPointCount, desiredTriangleCount, limitPointElementCount) {
		var useActual;
		if (limitPointElementCount > 0) {
			useActual = false;
		} else if (limitPointElementCount < 0) {
			useActual = true;
		} else {
			useActual = actualPointCount > desiredPointCount || actualTriangleCount > desiredTriangleCount;
		}

		var pointCount = useActual ? actualPointCount : desiredPointCount;
		var elementCount = useActual ? actualTriangleCount : desiredTriangleCount;
		data.points = new Float32Array(pointCount * 3);
		data.indices = new Uint16Array(elementCount * 3);
		if (data.normals !== undefined) {
			data.normals = new Float32Array(pointCount * 3);
		}
		if (data.uvs !== undefined) {
			data.uvs = new Float32Array(pointCount * 2);
		}
	}

	function downsampleVoxels(src, dst, dimensions, bbox) {
		var dx = dimensions[0] <= 2 ? Infinity : (bbox[3] - bbox[0]) / dimensions[0];
		var dy = dimensions[1] <= 2 ? Infinity : (bbox[4] - bbox[1]) / dimensions[1];
		var dz = dimensions[2] <= 2 ? Infinity : (bbox[5] - bbox[2]) / dimensions[2];
		var sd = -1;
		if (dx <= dy && dx <= dz) {
			if (dx !== Infinity) {
				sd = 0;
			}
		} else if (dy <= dx && dy <= dz) {
			if (dy !== Infinity) {
				sd = 1;
			}
		} else if (dz <= dx && dz <= dy) {
			if (dz !== Infinity) {
				sd = 2;
			}
		}

		if (sd < 0) {
			// cannot find a dimension to downsample
			return 0;
		}

		dx = dimensions[0]; // note: reusing dx, dy, dz for different purpose here
		dy = dimensions[1];
		dz = dimensions[2];
		var dxy = dx * dy;
		var nx = dx, ny = dy, nz = dz;
		var nxy = nx * ny;
		var x, y, z;

		// downsample X
		if (sd === 0) {
			dimensions[0] = dimensions[0] >> 1;
			nx = dimensions[0];
			nxy = nx * ny;
			for (z = 0; z < dz; ++z) {
				for (y = 0; y < dy; ++y) {
					for (x = 0; x < dx; ++x) {
						dst[z * nxy + y * nx + x] = src[z * dxy + y * dx + x * 2] | src[z * dxy + y * dx + x * 2 + 1];
					}
				}
			}
		}

		// downsample Y
		if (sd === 1) {
			dimensions[1] = dimensions[1] >> 1;
			ny = dimensions[1];
			nxy = nx * ny;
			for (z = 0; z < dz; ++z) {
				for (y = 0; y < dy; ++y) {
					for (x = 0; x < dx; ++x) {
						dst[z * nxy + y * nx + x] = src[z * dxy + (y * 2) * dx + x] | src[z * dxy + (y * 2 + 1) * dx + x];
					}
				}
			}
		}

		// downsample Z
		if (sd === 2) {
			dimensions[2] = dimensions[2] >> 1;
			nz = dimensions[2];
			nxy = nx * ny;
			for (z = 0; z < dz; ++z) {
				for (y = 0; y < dy; ++y) {
					for (x = 0; x < dx; ++x) {
						dst[z * nxy + y * nx + x] = src[(z * 2) * dxy + y * dx + x] | src[(z * 2 + 1) * dxy + y * dx + x];
					}
				}
			}
		}

		// count number of squares in "dst"
		var count = 0;
		for (z = 0; z < nz; ++z) {
			for (y = 0; y < ny; ++y) {
				for (x = 0; x < nx; ++x) {
					if (dst[z * nxy + y * nx + x] > 0) {
						count++;
						break;
					}
				}
			}
		}
		for (z = 0; z < nz; ++z) {
			for (x = 0; x < nx; ++x) {
				for (y = 0; y < ny; ++y) {
					if (dst[z * nxy + y * nx + x] > 0) {
						count++;
						break;
					}
				}
			}
		}
		for (y = 0; y < ny; ++y) {
			for (x = 0; x < nx; ++x) {
				for (z = 0; z < nz; ++z) {
					if (dst[z * nxy + y * nx + x] > 0) {
						count++;
						break;
					}
				}
			}
		}

		return count * 2; // 2 squares per scanline
	}

	ThreeUtils.buildTemporaryMesh = function(bbox, flags, pointCount, triangleCount, innerBoxes, forceSingleCube, limitPointTriangleCount) {
		var unlimitedBudget = limitPointTriangleCount <= 0;
		var ret = {
			points : null,
			normals : (flags & 3) > 0 ? null : undefined, // need normals also if original object is a line (flags & 1)
			uvs : (flags & 4) > 0 ? null : undefined,
			indices : null
		};

		var donePoints = 0;
		var numSquares = 0;
		var maxLevel = !innerBoxes || forceSingleCube ? 0 : innerBoxes[0];
		if (!unlimitedBudget && (pointCount < 384 || triangleCount < 192)) {
			// don't bother trying marching cubes or inner boxes - go straight to a single cube, as the budget is just way too low
			// note: the numbers 384 and 192 are the number of points/triangles in a 4x4x4 shrinkwrapped array
			maxLevel = 0;
		}

		var decodedBuf = null;
		var dimension = 0;
		if (maxLevel > 0) {
			// try to create a marching cubes mesh that fits into our vertices/indices arrays
			decodedBuf = new Uint8Array(Math.pow(Math.pow(2, maxLevel), 3));
			dimension = Math.pow(2, maxLevel);
			var ptrsDecode = new Uint32Array(2);
			ptrsDecode[0] = 1; // [0] - offset in data
			recursiveDecode(innerBoxes, decodedBuf, 0, 0, 0, 0, maxLevel, ptrsDecode, dimension);
			var numVertices = 3 * MarchingCubes.count(decodedBuf, dimension);
			var maxVertices = Math.min(pointCount, triangleCount); // note: marching cubes is not producing indexed triangles, just a stream of verties [so vertex count == element count]

			if (!unlimitedBudget && numVertices > maxVertices) {
				// we are over budget, fill all "inside" inner boxes to reduce number of marching cubes triangles
				numSquares = shrinkWrap(decodedBuf, dimension);
				numVertices = 3 * MarchingCubes.count(decodedBuf, dimension);
			}

			if (unlimitedBudget || numVertices <= maxVertices) {
				allocMeshData(ret, numVertices, numVertices, pointCount, triangleCount, limitPointTriangleCount);
				MarchingCubes.march(decodedBuf, dimension, bbox, ret.points, ret.normals, ret.indices);
				donePoints = numVertices;
			}
		}

		if (donePoints === 0 && dimension >= 2) {
			// marching cubes was over budget, try to find an "inner boxes" level that fits into our budget
			var maxSquares = Math.floor(Math.min(pointCount / 4, triangleCount / 2));
			if (unlimitedBudget) {
				maxSquares = numSquares;
			}

			var decodedBuf2 = new Uint8Array(dimension * dimension * dimension / 2);
			var dimensions = [dimension, dimension, dimension];
			var use2 = false;
			var attempt = 0;
			for (;;) {
				if (numSquares <= maxSquares) {
					allocMeshData(ret, numSquares * 4, numSquares * 2, pointCount, triangleCount, limitPointTriangleCount);
					donePoints = buildShrinkWrapSquares(use2 ? decodedBuf2 : decodedBuf, dimensions[0], dimensions[1], dimensions[2], bbox, ret);
					break;
				}

				numSquares = attempt === 4 ? 0 : downsampleVoxels(use2 ? decodedBuf2 : decodedBuf, use2 ? decodedBuf : decodedBuf2, dimensions, bbox);
				if (!numSquares) {
					break;
				}

				use2 = !use2;
				attempt++;
			}
		}

		if (donePoints === 0) {
			// worst case scenario: just a single cube
			allocMeshData(ret, 24, 12, pointCount, triangleCount, limitPointTriangleCount);
			for (; donePoints < 6; ++donePoints) {
				// using "donePoints" as "var cubeSideIndex"
				buildSquare(donePoints, donePoints, bbox, ret);
			}
			donePoints = 24; // 6 sides, 4 vertices and 2 triangles per side
		}

		// fill vertex array, so that bbox computation works correctly for temporary meshes
		// (normals, uvs, indices array don't require this as they are initialized to zero on allocation)
		var points = ret.points;
		for (var i = donePoints, len = points.length / 3; i < len; ++i) {
			points[i * 3] = points[0];
			points[i * 3 + 1] = points[1];
			points[i * 3 + 2] = points[2];
		}

		return ret;
	};

	ThreeUtils.updateClusterAttrib = function(cluster, name, start, newValues) {
		var attrib = cluster.getAttribute(name);
		attrib.array.set(newValues, start);
		var ur = attrib.updateRange;
		if (ur.count < 0) {
			ur.offset = start;
			ur.count = newValues.length;
		} else {
			ur.count += ur.offset;
			ur.offset = Math.min(ur.offset, start);
			ur.count = Math.max(ur.count, start + newValues.length) - ur.offset;
		}
		attrib.needsUpdate = true;
	};

	ThreeUtils.updateClusterIndices = function(cluster, indices, vertexStart, indexStart, indexCount) {
		var attrib = cluster.getIndex();
		var ur = attrib.updateRange;
		if (ur.count < 0) {
			ur.offset = indexStart;
			ur.count = indexCount;
		} else {
			ur.count += ur.offset;
			ur.offset = Math.min(ur.offset, indexStart);
			ur.count = Math.max(ur.count, indexStart + indexCount) - ur.offset;
		}
		attrib.needsUpdate = true;

		var dstArray = attrib.array;
		for (var ii = 0; ii < indexCount; ++ii) {
			dstArray[indexStart + ii] = vertexStart + indices[ii];
		}
	};

	ThreeUtils.updateClusterGeometry = function(descriptor, points, normals, uvs, indices) {
		if (points.length !== descriptor.vertexCount * 3 || indices.length !== descriptor.indexCount) {
			return false;
		}

		var cluster = descriptor.geometry;
		var vertexStart = descriptor.vertexStart;
		ThreeUtils.updateClusterAttrib(cluster, "position", vertexStart * 3, points);
		if (normals && normals.length) {
			ThreeUtils.updateClusterAttrib(cluster, "normal", vertexStart * 3, normals);
		}

		if (uvs && uvs.length) {
			ThreeUtils.updateClusterAttrib(cluster, "uv", vertexStart * 2, uvs);
		}

		ThreeUtils.updateClusterIndices(cluster, indices, vertexStart, descriptor.indexStart, descriptor.indexCount);
		return true;
	};

	return ThreeUtils;
});
