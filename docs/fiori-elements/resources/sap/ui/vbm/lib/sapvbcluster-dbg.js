/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// this module defines the clustering
// Author: Jürgen Gatter for Grid based Clustering,
// Dimitar Vangelovski for Distance based Clustering

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.Clustering = function(target) {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var clustering = {};
	var Delaunay = {};
	var EPSILON = 1.0 / 1048576.0;

	clustering.m_Clusters = []; // array of clusters
	clustering.m_Clustergroups = [];
	clustering.m_loadCount = 0; // to verify whether preassembled data is still valid
	clustering.m_Parser = VBI.Parser();
	clustering.m_nClustertypes = 5; // 0 :=: no Clustering 3 :=: Distance Based
	// 1 :=: Grid Based 4 :=: Tree Based
	// 2 :=: Grid Based Group
	clustering.clear = function() {
		clustering.m_Clusters = []; // array of clusters
	};

	clustering.load = function(dat, ctx) {
		// load the json delta data............................................//
		if (dat.Set) {
			clustering.clear();
			clustering.m_Parser.clear();
			clustering.m_loadCount++;

			var cluster, res = dat.Set.Cluster;

			if (jQuery.type(res) == 'object') {
				cluster = new VBI.Clustering.Cluster();
				cluster.load(res, ctx, clustering.m_Clusters.length); // load the cluster...//
				clustering.m_Clusters.push(cluster);
				clustering.UpdateAutomaticClusterGroup(cluster.m_groupID);
			} else if (jQuery.type(res) == 'array') {
				var index = clustering.m_Clusters.length;
				// load from array...............................................//
				for (var nJ = 0, len = res.length; nJ < len; ++nJ) {
					cluster = new VBI.Clustering.Cluster();
					cluster.load(res[nJ], ctx, index++); // load the cluster...//
					clustering.m_Clusters.push(cluster);
					clustering.UpdateAutomaticClusterGroup(cluster.m_groupID);
				}
			}
			for (var nK = 0; nK < clustering.m_Clustergroups.length; ++nK) {
				clustering.m_Clusters.push(clustering.m_Clustergroups.shift());
			}
		}
	};

	clustering.UpdateAutomaticClusterGroup = function(groupID) {
		if (groupID == "") {
			return;
		}

		var insertedCluster = clustering.m_Clusters[clustering.m_Clusters.length - 1];
		var nGroupIndex, nOtherIndex, elte, groupCluster;

		for (var nI = 0; nI < clustering.m_Clustergroups.length; ++nI) {
			elte = clustering.m_Clustergroups[nI];
			if (elte.m_id == groupID) {
				nGroupIndex = nI;
			}
		}

		if (nGroupIndex != undefined) {
			groupCluster = clustering.m_Clustergroups[nGroupIndex];
			groupCluster.m_limit = Math.min(insertedCluster.m_limitOnSum, groupCluster.m_limit);
			insertedCluster.m_bPartOfGrp = true;
		} else {
			for (var nJ = 0, len = clustering.m_Clusters.length - 1; nJ < len; ++nJ) {
				elte = clustering.m_Clusters[nJ];
				if ((elte.m_type == "grid") && (elte.m_groupID == groupID)) {
					nOtherIndex = nJ;
				}
			}
			if (nOtherIndex != undefined) {
				var otherCluster = clustering.m_Clusters[nOtherIndex];
				groupCluster = new VBI.Clustering.Cluster();
				groupCluster.m_type = "clustergroup";
				groupCluster.m_nType = 2;
				groupCluster.m_id = groupID;
				groupCluster.m_dividerX = otherCluster.m_dividerX;
				groupCluster.m_dividerY = otherCluster.m_dividerY;
				groupCluster.m_limit = Math.min(insertedCluster.m_limitOnSum, otherCluster.m_limitOnSum);
				groupCluster.initializeFunctions();
				clustering.m_Clustergroups.push(groupCluster);
				insertedCluster.m_bPartOfGrp = otherCluster.m_bPartOfGrp = true;
			}
		}

	};

	clustering.PreassembleDataForVO = function(scene, vResult, index, vo, ctx) {
		var node;
		var baseLod = vResult.config.m_BaseLod;
		var fLod = clustering.tw * ((baseLod >= 0) ? (1 << baseLod) : 1 / (1 << -baseLod));

		if ((node = vo.m_DataSource.GetCurrentNode(ctx))) {
			var mID = vo.m_ID;
			var myArray = vResult.base[index];
			if (node.m_dataelements.length) {
				vo.m_DataSource.Select(0);
				var ele = vo.m_DataSource.GetIndexedElement(ctx, 0);
				var id = ele.GetPath();
				var myKeyLen = ele.GetKeyValue().length;
				myArray.strDataPath = id.substring(0, id.length - myKeyLen);
				for (var nL = 0; nL < node.m_dataelements.length; ++nL) {
					var ucsPos = [
						fLod, fLod
					];
					vo.m_DataSource.Select(nL);
					ele = vo.m_DataSource.GetIndexedElement(ctx, nL);
					var orgPos = vo.m_Pos.GetValueVector(ctx);
					scene.m_Proj.LonLatToUCS(VBI.MathLib.DegToRad(orgPos), ucsPos);
					var nCl = clustering.m_Parser.evaluate(vo, index, ctx);

					if (nCl >= 0) {
						ucsPos.t = clustering.m_Clusters[nCl].m_nType;
						(myArray.targets[nCl])++;
					} else {
						ucsPos.t = -1;
					}

					ucsPos.h = vo.BaseIsHot(nL, ctx);
					ucsPos.hscale = vo.GetHotScale(ctx);
					ucsPos.hcol = vo.m_HotDeltaColor.GetValueString(ctx);

					if ((ucsPos.s = vo.IsSelected(ctx))) {
						ucsPos.scol = vo.m_SelectColor.GetValueString(ctx);
						ucsPos.simag = vo.m_ImageSelected.GetValueString(ctx);
						vResult.m_SelectedVOs.unshift({
							m_vo: index,
							m_index: myArray.length,
							m_dataIndex: nL
						});

					}
					if (ucsPos.im == undefined) {
						ucsPos.im = vo.m_Image.GetValueString(ctx);
					}

					ucsPos.ic = vo.m_Icon.GetValueString(ctx);
					ucsPos.tx = vo.m_Text.GetValueString(ctx);
					ucsPos.ctcol = vo.m_ContentColor.GetValueString(ctx); // color of content ( icon or text )
					ucsPos.ctoffs = vo.m_ContentOffset.GetValueVector(ctx); // offset of content ( icon or text )
					ucsPos.ctfont = vo.m_ContentFont.GetValueString(ctx); // font of content ( icon or text )
					ucsPos.ctsz = vo.m_ContentSize.GetValueLong(ctx); // size in px of content ( text )
					ucsPos.sc = vo.m_Scale.GetValueVector(ctx);
					ucsPos.al = vo.m_Alignment.GetValueString(ctx);
					ucsPos.m_ID = mID;
					ucsPos.nI = nL;
					ucsPos.b2Ignore = false;
					ucsPos.cI = nCl;
					ucsPos.vI = index;
					ucsPos.key = ele.GetKeyValue();

					ucsPos.label = vo.GetLabel(ctx);
					myArray.push(ucsPos);
				}
			}
			for (var nK = myArray.targets.length; nK--;) {
				var tType = clustering.m_Clusters[nK].m_nType;
				myArray.targTypes[tType] += myArray.targets[nK];
				vResult.base.targTypes[tType] += myArray.targets[nK];
			}
		}
	};

	clustering.InitializeResultVector = function(mapMan, numVOs, lod, x, y, nx, ny, nDataVersion) {
		clustering.tw = mapMan.m_tileWidth;
		clustering.th = mapMan.m_tileHeight;

		var ResultData = {};

		var nClusters = clustering.m_Clusters.length;
		ResultData.base = [];
		ResultData.hotItem = {};
		var i, j, elem;

		for (i = 0; i < numVOs; ++i) {
			elem = [];
			elem.clusterings = [];
			elem.m_lodOffset = 1;
			elem.m_BaseX = x;
			elem.m_BaseY = y;
			ResultData.base.push(elem);
			elem.targets = [];
			elem.targTypes = [];
			elem.hotItem = ResultData.hotItem;
			for (j = nClusters; j--;) {
				elem.targets.push(0);
			}
			for (j = clustering.m_nClustertypes; j--;) {
				elem.targTypes.push(0);
			}
			elem.m_nNumIgnore = 0;
		}
		ResultData.base.targTypes = [];
		for (j = clustering.m_nClustertypes; j--;) {
			ResultData.base.targTypes.push(0);
		}

		ResultData.clust = [];
		for (var nJ = 0; nJ < nClusters; ++nJ) {
			elem = [];
			elem.cI = nJ;
			elem.m_lodOffset = 1;
			elem.m_BaseX = x;
			elem.m_BaseY = y;
			elem.hotItem = ResultData.hotItem;
			elem.m_nRecalcs = 0;
			ResultData.clust.push(elem);
		}

		ResultData.config = {};
		var conf = ResultData.config;
		conf.m_version = clustering.m_loadCount;
		conf.bNeedsShadowLayer = false;

		conf.m_lod = lod;
		conf.m_lodOffset = 1;
		conf.m_x = x;
		conf.m_y = y;
		conf.m_nx = nx;
		conf.m_ny = ny;
		conf.m_nData = nDataVersion;
		conf.m_calcMode = 2;

		conf.m_BaseX = x * clustering.tw;
		conf.m_BaseY = y * clustering.tw;
		conf.m_BaseLod = lod;

		ResultData.hotItem = {};

		ResultData.m_SelectedVOs = [];

		return ResultData;
	};

	clustering.CheckNonClusteredVOs = function(ResultData, ClusterData) {
		if (!ResultData.base.targTypes[1]) { // only relevant for grid clustered VOs
			return;
		}

		for (var nI = 0; nI < ResultData.base.length; ++nI) {
			var vos = ResultData.base[nI];
			if (!vos.targTypes[1]) { // only relevant for grid clustered VOs
				continue;
			}
			var nJ, vl, cnt = 0;
			for (nJ = 0, vl = vos.length; nJ < vl; ++nJ) {
				var elem = vos[nJ];
				if (!elem.isCl) {
					if ((elem.cI != undefined) && (elem.sq != undefined) && (ClusterData[elem.cI])[elem.sq].b2Cluster) {
						vos.m_nNumIgnore++;
						elem.b2Ignore = true;
					}
					if (!elem.b2Ignore) {
						elem.bbInd = cnt;
						cnt++;
					}
				}
			}
			vos.m_NumVisVOs = cnt;
		}
	};

	clustering.FetchClusterVOData = function(scene, vos, ctx) {
		var clust = clustering.m_Clusters;
		var cl = clust.length;

		var result = [];
		for (var k = 0; k < cl; ++k) {
			result.push({});
		}

		var nl = vos.length;
		for (var i = 0; i < nl; ++i) {
			for (var j = 0; j < cl; ++j) {
				if (vos[i].m_ID == clust[j].m_VO) {
					result[j].m_index = i;
					result[j].m_image = vos[i].m_Image != undefined ? vos[i].m_Image.GetValueString(ctx) : "";
					result[j].m_scale = vos[i].m_Scale != undefined ? vos[i].m_Scale.GetValueVector(ctx) : [
						1, 1, 1
					];
					result[j].m_hotscale = vos[i].m_HotScale != undefined ? vos[i].m_HotScale.GetValueVector(ctx) : [
						1, 1, 1
					];
					result[j].m_hotcol = vos[i].m_HotDeltaColor != undefined ? vos[i].m_HotDeltaColor.GetValueString(ctx) : "";
					result[j].m_alignment = vos[i].m_Alignment != undefined ? vos[i].m_Alignment.GetValueString(ctx) : 0;
				}
			}
		}

		return result;
	};

	clustering.FetchClusterGroupData = function() {
		var clust = clustering.m_Clusters;
		var cl = clust.length;
		var result = [];
		for (var i = 0; i < cl; ++i) {
			var sources = [];
			if (clust[i].m_type == "clustergroup") {
				for (var j = 0; j < cl; ++j) {
					if ((i != j) && (clust[i].m_id == clust[j].m_groupID)) {
						sources.push({
							index: j,
							limit: clust[j].m_limit
						});
					}
				}
			}
			result.push(sources);
		}
		return result;
	};

	clustering.AdaptOffsets = function(preData, posDiff, lod, xPos, yPos, nX, nY) {
		preData.config.m_calcMode = 1;

		var lodDelta = (lod - preData.config.m_BaseLod);
		var fLodOffset = (lodDelta >= 0) ? (1 << lodDelta) : 1 / (1 << -lodDelta);
		var elem;

		for (var i = preData.base.length - 1; i >= 0; --i) {
			elem = preData.base[i];
			elem.m_lodOffset = fLodOffset;
			elem.m_BaseX = xPos;
			elem.m_BaseY = yPos;
		}

		for (var j = preData.clust.length - 1; j >= 0; --j) {
			elem = preData.clust[j];
			elem.m_lodOffset = fLodOffset;
			elem.m_BaseX = xPos;
			elem.m_BaseY = yPos;
		}
		preData.config.m_lod = lod;
		preData.config.m_x = xPos;
		preData.config.m_y = yPos;
		preData.config.m_nx = nX;
		preData.config.m_ny = nY;
		preData.config.m_lodOffset = fLodOffset;
	};

	clustering.DetermineChanges = function(oldPreData, lod, xPos, yPos, nX, nY, nData) {
		var r = {};

		r.bPosChanged = true;
		r.bDataChanged = true;
		r.bClusteringChanged = true;
		r.lodDiff = 0;
		r.lodFactor = 1;
		r.posDiff = [
			0, 0
		];

		if (oldPreData != undefined) {
			var config = oldPreData.config;
			r.lodDiff = lod - config.m_lod;
			if (r.lodDiff == 0) {
				r.lodFactor = 1 << (r.lodDiff);
				r.posDiff = [
					clustering.tw * (xPos - r.lodFactor * config.m_x), clustering.th * (yPos - r.lodFactor * config.m_y)
				];
			} else if (r.lodDiff > 0) {
				r.lodFactor = 1 << (r.lodDiff);
				r.posDiff = [
					clustering.tw * (xPos - r.lodFactor * config.m_x), clustering.th * (yPos - r.lodFactor * config.m_y)
				];
			} else {
				r.lodFactor = 1 / (1 << (-r.lodDiff));
				r.posDiff = [
					clustering.tw * (xPos - r.lodFactor * config.m_x), clustering.th * (yPos - r.lodFactor * config.m_y)
				];
			}

			if (config.m_nData == nData) {
				r.bDataChanged = false;
			}
			if (config.m_version == clustering.m_loadCount) {
				r.bClusteringChanged = false;
			}
			if (!r.lodDiff && (config.m_x == xPos) && (config.m_y == yPos) && (config.m_nx == nX) && (config.m_ny == nY)) {
				r.bPosChanged = false;
			}
		}

		r.bNothingChanged = !r.bDataChanged && !r.bPosChanged && !r.bClusteringChanged;

		return r;
	};

	clustering.InvalidateOutdatedClustering = function(ResultData, changes) {
		var bGeneralRemove = changes.bDataChanges || changes.bClusteringChanged;
		var bSomethingOutdated = bGeneralRemove;
		for (var i = 0; i < ResultData.base.length; ++i) {
			var voBase = ResultData.base[i];
			for (var j = voBase.clusterings.length - 1; j >= 0; --j) {
				var crossRef = voBase.clusterings[j];
				var b2BeRemoved = true;
				switch (crossRef.t) {
					case 0:
						b2BeRemoved = true;
						break;
					case 1:
						b2BeRemoved = bGeneralRemove || (changes.lodDiff != 0);
						break;
					case 2:
						b2BeRemoved = bGeneralRemove;
						break;
					default:
						break;
				}
				if (b2BeRemoved) {
					voBase.clusterings.splice(j, 1);
					var myArr = ResultData.clust[crossRef.i];
					myArr.m_nRecalcs++;
					myArr.splice(0, myArr.length);
					bSomethingOutdated = true;
				}
			}
		}

		return bSomethingOutdated;
	};

	clustering.ClearTreeClusterNode = function(node) {
		if (node.bw) {
			for (var i = node.bw.length; i--;) {
				clustering.ClearTreeClusterNode(node.bw[i]);
			}
			for (var j = node.bw.length; j--;) {
				node.bw[j] = undefined;
			}
			node.bw = undefined;
		}
		node.e = undefined;
		node.c = undefined;
	};

	clustering.ClearClusterFromPreData = function(clust, index) {
		if (clust[index].m_TreeFatherNode != undefined) {
			clustering.ClearTreeClusterNode(clust[index].m_TreeFatherNode);
		}
		clust[index] = undefined;
	};

	clustering.ClearPreassembledData = function(scene) {
		var preData = scene.m_PreassembledData;
		var i;
		if (preData == undefined) {
			return;
		}

		for (i = preData.clust.length; i--;) {
			clustering.ClearClusterFromPreData(preData.clust, i);
		}
		preData.clust = undefined;
		for (i = preData.base.length; i--;) {
			preData.base[i] = undefined;
		}
		scene.m_PreassembledData = undefined;
	};

	clustering.getEdge = function(edgeRef, edgeTable) {
		if (edgeRef[1] != undefined) {
			return edgeRef;
		}
		var e1 = edgeTable[edgeRef];
		var e2 = edgeTable[edgeRef + 1];
		return [
			[
				e1.c[0], e1.c[1]
			], [
				e2.c[0], e2.c[1]
			]
		];

	};

	clustering.createEdgeIndex = function(edgeTable, edges) {
		var i, ei = [];
		var edge;
		for (i = edges.length; i--;) {
			edge = clustering.getEdge(edges[i], edgeTable);
			edge[0].ot = edge[1];
			edge[0].i = i;
			edge[1].ot = edge[0];
			edge[1].i = -i;
			var elte1 = {};
			elte1.i = i;
			elte1.c = 0;
			elte1.p = edge[0];
			edge[0].li = elte1;
			ei.push(elte1);
			var elte2 = {};
			elte2.p = edge[1];
			elte2.i = -i;
			elte2.c = 1;
			edge[1].li = elte2;
			ei.push(elte2);
		}

		ei.sort(function(i, j) {
			var x = i.p[0] - j.p[0];
			return x ? x : i.p[1] - j.p[1];
		});

		for (i = 0; i < ei.length; i += 2) {
			ei[i].ot = i + 1;
			ei[i + 1].ot = i;
		}

		return ei;
	};

	clustering.getTreeClusterIndex = function(node) {
		var myNode = node;
		while (myNode.c != undefined) {
			myNode = myNode.c;
		}
		return myNode.cI;
	};

	clustering.getNodeIdent = function(preData, node, cI) {
		if (node.bw != undefined) {
			return clustering.getClusterIdent(preData, cI, node.nJ);
		} else {
			return preData.base[node.vI].strDataPath + node.key;
		}
	};

	clustering.getClusterIdent = function(preData, cI, nI) {
		if (!preData) {
			return "";
		}
		var preDataConfig = preData.config;
		var clust = preData.clust[cI];
		if (!clust) {
			return "";
		}
		return "[" + preDataConfig.m_version + "," + preDataConfig.m_nData + "," + clust.m_nRecalcs + "," + cI + "," + nI + "]";
	};

	clustering.getClusterArea = function(scene, node) {
		if (!node.bo) {
			return undefined;
		}

		var preData = scene.m_PreassembledData;
		var xOff = scene.m_Canvas[0].m_nCurrentX * scene.m_MapManager.m_tileWidth;
		var yOff = scene.m_Canvas[0].m_nCurrentY * scene.m_MapManager.m_tileHeight;
		var nLod = preData.config.m_lodOffset;
		var ucsLU = [
			nLod * node.bo[0] - xOff, nLod * node.bo[1] - yOff
		];
		var ucsRL = [
			nLod * node.bo[2] - xOff, nLod * node.bo[3] - yOff
		];
		var posLU = VBI.MathLib.RadToDeg(scene.GetGeoFromPoint(ucsLU));
		var posRL = VBI.MathLib.RadToDeg(scene.GetGeoFromPoint(ucsRL));
		return posLU[0].toString() + ';' + posLU[1].toString() + ';' + posRL[0].toString() + ';' + posRL[1].toString();
	};

	clustering.getClusterPosition = function(scene, node) {
		var preData = scene.m_PreassembledData;
		var xOff = scene.m_Canvas[0].m_nCurrentX * scene.m_MapManager.m_tileWidth;
		var yOff = scene.m_Canvas[0].m_nCurrentY * scene.m_MapManager.m_tileHeight;
		var nLod = preData.config.m_lodOffset;
		var ucsLU = [
			nLod * node[0] - xOff, nLod * node[1] - yOff
		];
		return VBI.MathLib.RadToDeg(scene.GetGeoFromPoint(ucsLU));
	};

	clustering.getInfoForCluster = function(params, type, scene) {
		var preData = scene.m_PreassembledData;
		var preDataConfig = preData.config;
		var cI;
		var clust = preData.clust[params[3]];
		var retList = [];
		if (preDataConfig.m_version == params[0] && preDataConfig.m_nData == params[1] && clust.m_nRecalcs == params[2]) {
			var node = clust[params[4]];
			if (type == 10) {
				var bws = node.bw ? node.bw.length : 0;
				return {
					pos: clustering.getClusterPosition(scene, node),
					bb: clustering.getClusterArea(scene, node),
					image: node.im,
					lod: node.lod,
					ulod: node.c ? node.c.lod : undefined,
					cnt: node.cnt,
					subs: bws,
					type: node.isCl
				};
			}
			if (node.bw) {
				switch (type) {
					case 0:
						clustering.collectNodes(retList, node, preData);
						break;
					case 1:
						cI = clustering.getTreeClusterIndex(node);
						for (var i = 0; i < node.bw.length; ++i) {
							retList.push(clustering.getNodeIdent(preData, node.bw[i], cI));
						}
						break;
					case 2:
						cI = clustering.getTreeClusterIndex(node);
						if (node.c) {
							retList.push(clustering.getNodeIdent(preData, node.c, cI));
						}
						break;
					case 11:
						cI = clustering.getTreeClusterIndex(node);
						return clustering.collectEdges(scene, node, preData.clust[cI].m_edges);
					default:
						break;
				}
			}
		}
		retList.sort();
		return retList;
	};

	clustering.collectEdges = function(scene, node, edgeTable) {
		var edgeList = [];
		if (!node.e || !node.e.length) {
			return [];
		}
		var pList = clustering.createEdgeIndex(edgeTable, node.e);
		var preData = scene.m_PreassembledData;
		var xOff = scene.m_Canvas[0].m_nCurrentX * scene.m_MapManager.m_tileWidth;
		var yOff = scene.m_Canvas[0].m_nCurrentY * scene.m_MapManager.m_tileHeight;
		var nLod = preData.config.m_lodOffset;

		var p0 = pList[0].p, p1, l0, l1, numEdges = node.e.length - 1;
		edgeList.push(VBI.MathLib.RadToDeg(scene.GetGeoFromPoint([
			nLod * p0[0] - xOff, nLod * p0[1] - yOff
		])));
		for (var i = numEdges; i--;) {
			p1 = p0.ot;
			edgeList.push(VBI.MathLib.RadToDeg(scene.GetGeoFromPoint([
				nLod * p1[0] - xOff, nLod * p1[1] - yOff
			])));
			l1 = p1.li;
			l0 = pList[l1.ot];
			p0 = l0.p;
		}

		return edgeList;
	};

	clustering.collectNodes = function(retList, node, preData) {
		if (node.bw != undefined) {
			for (var i = 0; i < node.bw.length; ++i) {
				clustering.collectNodes(retList, node.bw[i], preData);
			}
		} else {
			var myVO = preData.base[node.vI];
			retList.push(myVO.strDataPath + node.key);
		}

	};

	clustering.DoClustering = function(scene, lod, orgXPos, yPos, nX, nY, vos, ctx, lastHotCluster, bForceRender, bForceClustering, nDataVersion) {
		var completeX = (1 << lod);
		var xPos = orgXPos;
		while (xPos < 0) {
			xPos += completeX;
		}
		while (xPos > completeX) {
			xPos -= completeX;
		}
		var changes = clustering.DetermineChanges(scene.m_PreassembledData, lod, xPos, yPos, nX, nY, nDataVersion);
		var ResultData;

		if (changes.bNothingChanged) {
			scene.m_PreassembledData.config.m_calcMode = 0;
			return scene.m_PreassembledData;
		}

		var nJ;
		var clusterVOData = clustering.FetchClusterVOData(scene, vos, ctx);
		var groupConnections = clustering.FetchClusterGroupData();
		clustering.m_Parser.verifyAttributes(vos, ctx);

		var ClusterData = clustering.InitializeClusterData(scene, lod, xPos, yPos, nX, nY);

		if (changes.bDataChanged || changes.bClusteringChanged) {
			clustering.ClearPreassembledData(scene);
			ResultData = clustering.InitializeResultVector(scene.m_MapManager, vos.length, lod, xPos, yPos, nX, nY, nDataVersion);
			for (nJ = 0; nJ < vos.length; ++nJ) {
				var vo = vos[nJ];
				if (vo.IsClusterable()) {
					clustering.PreassembleDataForVO(scene, ResultData, nJ, vo, ctx);
				}
			}
		} else {
			ResultData = scene.m_PreassembledData;
			clustering.AdaptOffsets(ResultData, changes.posDiff, lod, xPos, yPos, nX, nY);
			if (!clustering.InvalidateOutdatedClustering(ResultData, changes)) {
				return ResultData;
			}
		}

		for (nJ = 0; nJ < clustering.m_Clusters.length; ++nJ) {
			clustering.m_Clusters[nJ].ClusterPass1(nJ, ResultData, ClusterData, changes);
		}
		for (nJ = 0; nJ < clustering.m_Clusters.length; ++nJ) {
			clustering.m_Clusters[nJ].ClusterPass2(nJ, ResultData, ClusterData, groupConnections);
		}

		for (nJ = 0; nJ < clustering.m_Clusters.length; ++nJ) {
			clustering.m_Clusters[nJ].DecisionPass(scene, nJ, ResultData, ClusterData, clusterVOData, groupConnections, changes);
		}

		clustering.CheckNonClusteredVOs(ResultData, ClusterData);

		return ResultData;
	};

	clustering.InitializeClusterData = function(scene, lod, xPos, yPos, nX, nY) {
		var ClusterData = [];

		var numTiles = (1 << lod);
		// normalize complete dimension on current LOD.........................//
		ClusterData.numTiles = numTiles;
		ClusterData.completeX = numTiles * scene.m_nWidthCanvas / scene.m_nTilesX;
		ClusterData.completeY = numTiles * scene.m_nHeightCanvas / scene.m_nTilesY;
		ClusterData.minLOD = scene.GetMinLOD();

		for (var nJ = 0; nJ < clustering.m_Clusters.length; ++nJ) {
			var clust = clustering.m_Clusters[nJ];
			var nGridcellsX = (nX + 2) * clust.m_dividerX;
			var nGridcellsY = (nY + 2) * clust.m_dividerY;
			ClusterData.push(clust.InitializeClusterData(scene, nJ, xPos - 1, yPos - 1, nGridcellsX, nGridcellsY));
		}

		return ClusterData;
	};

	clustering.VerifyCurrentSelection = function(vos, ResultData, ctx) {
		for (var i = ResultData.m_SelectedVOs.length - 1; i >= 0; --i) {
			var selElte = ResultData.m_SelectedVOs[i];
			var vo = vos[selElte.m_vo];
			vo.m_DataSource.Select(selElte.m_dataIndex);
			if (!vo.IsSelected(ctx)) { // in case the entity is no more selected we have to reset it.
				var vArray = (selElte.cI != undefined ? ResultData.clust[selElte.cI] : ResultData.base[selElte.m_vo]);
				vArray[selElte.m_index].s = false;
				ResultData.m_SelectedVOs.splice(i, 1);
			}
		}
	};

	clustering.AddSingle2Selected = function(voIndex, vos, instIndex, ResultData, ctx) {
		var vo = vos[voIndex];
		if (vo.IsClusterable()) { // the new one is the only one possibly added
			var vArray = (instIndex.cI != undefined ? ResultData.clust[instIndex.cI] : ResultData.base[voIndex]);
			var elte = vArray[instIndex.i];
			vo.m_DataSource.Select(elte.nI);
			if (vo.IsSelected(ctx)) {
				ResultData.m_SelectedVOs.unshift({
					m_vo: voIndex,
					m_index: instIndex.i,
					m_dataIndex: elte.nI,
					cI: instIndex.cI
				});
				elte.scol = vo.m_SelectColor.GetValueString(ctx);
				elte.simag = vo.m_ImageSelected.GetValueString(ctx);
				elte.s = true;
			}
		}
	};

	clustering.AddMultiple2Selected = function(instArray, vos, ResultData, ctx) {
		for (var ni = 0; ni < instArray.length; ++ni) {
			var row = instArray[ni];
			var vo = vos[ni];
			if (vo.IsClusterable()) {
				for (var nj = 0; nj < row.length; ++nj) {
					clustering.AddSingle2Selected(ni, vos, vo.GetInternalIndex(row[nj]), ResultData, ctx);
				}
			}
		}
	};

	VBI.Clustering.Cluster = function() {
		var cluster = {};

		// additional properties array.........................................//
		cluster.m_additionalProperties = [];

		cluster.clear = function() {
			cluster.m_addProperties = null;
		};

		cluster.load = function(dat, ctx, index) {
			cluster.m_id = dat.id;
			cluster.m_type = dat.type;
			cluster.m_type2 = dat.type2;
			cluster.m_switch = parseInt(dat.typeswitch, 10);
			cluster.m_bPartOfGrp = false;
			cluster.m_VO = dat.VO;
			cluster.m_order = parseInt(dat.order, 10);
			cluster.m_dispOffsetX = parseInt(dat.offsetX, 10);
			if (isNaN(cluster.m_dispOffsetX)) {
				cluster.m_dispOffsetX = 0;
			}
			cluster.m_dispOffsetY = parseInt(dat.offsetY, 10);
			if (isNaN(cluster.m_dispOffsetY)) {
				cluster.m_dispOffsetY = 0;
			}
			clustering.m_Parser.addFormula(index, dat.rule == undefined ? "" : dat.rule);
			cluster.m_textcolor = dat.textcolor;
			if (cluster.m_textcolor == undefined) {
				cluster.m_textcolor = "rgba(0,0,0,0.7)";
			}
			cluster.m_textfont = dat.textfont;
			cluster.m_textfontscale = dat.textfontscale;
			cluster.m_textfontsize = dat.textfontsize;
			if (isNaN(cluster.m_textfontscale)) {
				cluster.m_textfontscale = 2.0;
			}
			cluster.m_textoffset = parseInt(dat.textoffset, 10);
			cluster.m_textoffsetY = parseInt(dat.textoffsetY, 10);
			if (isNaN(cluster.m_textoffset)) {
				cluster.m_textoffset = 0;
			}
			if (isNaN(cluster.m_textoffsetY)) {
				cluster.m_textoffsetY = 0;
			}
			cluster.m_spotcol = dat.spotcol;
			cluster.m_spotsize = parseInt(dat.spotsize, 10);
			cluster.m_bordersize = dat.areabordersize ? parseInt(dat.areabordersize, 10) : 2;
			cluster.m_bordercol = dat.areabordercol;

			if (cluster.m_type == "grid") {
				cluster.m_nType = 1;
				cluster.m_distanceX = ((dat.distanceX == undefined) || (dat.distanceX <= 0)) ? 256 : dat.distanceX;
				cluster.m_dividerX = Math.max(1, Math.round(256 / cluster.m_distanceX));
				cluster.m_distanceY = ((dat.distanceY == undefined) || (dat.distanceY <= 0)) ? 256 : dat.distanceY;
				cluster.m_dividerY = Math.max(1, Math.round(256 / cluster.m_distanceY));
				cluster.m_groupID = (dat.groupID == undefined ? "&" : dat.groupID) + cluster.m_dividerX + "_" + cluster.m_dividerY;
				cluster.m_omitEmpties = (dat.showEmpties != "true");
				cluster.m_fillcol = dat.areafillcol;
				cluster.m_permanentArea = (dat.areapermanent == "true");
			}
			if (cluster.m_type == "distance") {
				cluster.m_nType = 3;
				cluster.m_distance = dat.distance;
				if (cluster.m_distance == undefined || cluster.m_distance <= 0) {
					cluster.m_distance = 128; // default distance if undefined
				}
			}
			if (cluster.m_type == "tree") {
				cluster.m_nType = 4;
				cluster.m_distance = dat.distance;
				if (cluster.m_distance == undefined || cluster.m_distance <= 0) {
					cluster.m_distance = 16; // default distance if undefined
				}
				cluster.m_bordercol2 = dat.areabordercol2;
				cluster.m_bordercol3 = dat.areabordercol3;
				cluster.m_fillcol = dat.areafillcol;
				cluster.m_fillcol2 = dat.areafillcol2;
				cluster.m_fillcol3 = dat.areafillcol3;
				cluster.m_animated = dat.animation == "true" ? "2" : dat.animation;
				cluster.m_permanentArea = (dat.areapermanent == "true");
			}

			cluster.m_limit = parseInt(dat.limit, 10);
			cluster.m_limitOnSum = dat.limitOnSum == undefined ? 999999 : parseInt(dat.limitOnSum, 10);

			cluster.initializeFunctions();
		};

		cluster.initializeFunctions = function() {
			switch (cluster.m_type) {
				case "grid":
					cluster.InitializeClusterData = cluster.InitializeGridClusterData;
					cluster.ClusterPass1 = cluster.gridClusteringCounting;
					cluster.ClusterPass2 = cluster.NothingToDo;
					cluster.DecisionPass = cluster.gridBasedDecision;
					cluster.CheckClusterData = cluster.CheckSingleClusterData;
					break;
				case "clustergroup":
					cluster.InitializeClusterData = cluster.InitializeGridClusterData;
					cluster.ClusterPass1 = cluster.NothingToDo;
					cluster.ClusterPass2 = cluster.gridClustergroupCounting;
					cluster.DecisionPass = cluster.gridBasedDecision;
					cluster.CheckClusterData = cluster.CheckGroupClusterData;
					break;
				case "distance":
					cluster.InitializeClusterData = cluster.InitializeDistClusterData;
					cluster.ClusterPass1 = cluster.NothingToDo;
					cluster.ClusterPass2 = cluster.NothingToDo;
					cluster.DecisionPass = cluster.distanceBasedDecision;
					cluster.CheckClusterData = cluster.NothingToDo; // not applicable
					break;
				case "tree":
					cluster.InitializeClusterData = cluster.InitializeTreeClusterData;
					cluster.ClusterPass1 = cluster.NothingToDo;
					cluster.ClusterPass2 = cluster.NothingToDo;
					cluster.DecisionPass = cluster.treeBasedDecision;
					cluster.CheckClusterData = cluster.NothingToDo; // not applicable
					break;
				default:
					break;
			}
		};

		cluster.gridClusteringCounting = function(nI, ResultData, ClusterData, changes) {
			var myGrid = ClusterData[nI];
			var myResult = ResultData.clust[nI];
			var xSize = myGrid.nX;
			var ySize = myGrid.nY;
			var xMult = cluster.m_dividerX * ClusterData.numTiles / ClusterData.completeX;
			var yMult = cluster.m_dividerY * ClusterData.numTiles / ClusterData.completeX;
			var completeTiles = ClusterData.completeX / 256;

			var xGridPos, yGridPos, nPos;
			var myVO, elem;
			var baseX = clustering.th * myGrid.m_BaseX;
			var baseY = clustering.th * myGrid.m_BaseY;
			var lodOff = myResult.m_lodOffset;

			for (var nK = 0; nK < ResultData.base.length; ++nK) {
				myVO = ResultData.base[nK];
				for (var nJ = 0; nJ < myVO.length; ++nJ) {
					elem = myVO[nJ];
					if (elem.cI == nI) {
						if (elem.b2Ignore) {
							myVO.m_nNumIgnore--;
							elem.b2Ignore = false;
						}
						xGridPos = Math.floor((lodOff * elem[0] - baseX) * xMult);
						if (xGridPos < 0) {
							xGridPos += completeTiles; // we have to take a look on the next instance
						}

						yGridPos = Math.floor((lodOff * elem[1] - baseY) * yMult);
						if ((xGridPos >= 0) && (xGridPos < xSize) && (yGridPos >= 0) && (yGridPos < ySize)) {
							nPos = xGridPos + xSize * yGridPos;
							elem.sq = nPos;
							myGrid[nPos].numInst++;
							myGrid[nPos].bw.push(elem);
						}
					}
				}
			}
		};

		cluster.gridClustergroupCounting = function(nI, ResultData, ClusterData, groupConnections) {
			var myConnects = groupConnections[nI];
			var connects = myConnects.length;
			var myGrid = ClusterData[nI];

			for (var nK = 0; nK < myGrid.length; ++nK) {
				var cnt = 0;
				var cell = myGrid[nK];
				cell.bLimitExceeded = false;

				for (var nL = 0; nL < connects; ++nL) {
					var inst = myConnects[nL].index;
					var cGrid = ClusterData[inst];
					var newVal = cGrid[nK].numInst;
					cnt += newVal;
					if (newVal >= myConnects[nL].limit) {
						cell.bLimitExceeded = true;
					}
				}
				cell.numInst = cnt;
			}
		};

		cluster.distanceBasedDecision = function(scene, nJ, ResultData, ClusterData, clusterVOData, groupConnections, changes) {
			if (changes.lodDiff || changes.bDataChanged || changes.bClusteringChanged) {
				var clust = clustering.m_Clusters[nJ];
				var distClusters = cluster.doDistClustering(nJ, ResultData, clust.m_distance, ClusterData.completeX);
				cluster.distFillClusterData(scene, distClusters, ResultData, clusterVOData[nJ], nJ);
			}
		};

		cluster.treeBasedDecision = function(scene, nJ, ResultData, ClusterData, clusterVOData, groupConnections, changes) {
			if (changes.bDataChanged || changes.bClusteringChanged) {
				var clust = clustering.m_Clusters[nJ];
				var treeClusters = cluster.doTreeClustering(nJ, ResultData, clusterVOData[nJ], clust.m_distance, ClusterData.completeX);
				cluster.treeFillClusterData(scene, treeClusters, ResultData, clusterVOData[nJ], nJ, scene.GetMinLOD());
			}
		};

		cluster.gridBasedDecision = function(scene, nK, ResultData, ClusterData, clusterVOData, groupConnections, changes) {
			ResultData.config.bNeedsShadowLayer = cluster.fillClusterConfig(ResultData.clust[nK], ResultData.config, 0, false) || ResultData.config.bNeedsShadowLayer;

			var clust = clustering.m_Clusters[nK];
			if (!clust.m_bPartOfGrp) {
				var clustsq = ClusterData[nK];

				var myConnections = groupConnections[nK];
				if (myConnections.length) {
					for (var i = myConnections.length; i--;) {
						var con = myConnections[i].index;
						ResultData.base[clusterVOData[con].m_index].clusterings.push({
							i: con,
							t: 0
						});
					}
				} else {
					ResultData.base[clusterVOData[nK].m_index].clusterings.push({
						i: nK,
						t: 0
					});
				}
				for (var x = 0; x < clustsq.nX; ++x) {
					for (var y = 0; y < clustsq.nY; ++y) {
						var nJ = x + clustsq.nX * y;
						clust.CheckClusterData(ResultData, ClusterData, clustsq[nJ], nK, nJ, x, y, clusterVOData, myConnections);
					}
				}
			}
		};

		cluster.NothingToDo = function() {

		};

		cluster.ReturnFalse = function() {
			return false;
		};

		cluster.CheckSingleClusterData = function(ResultData, ClusterData, cellclust, nK, nJ, x, y, voData, connections) {
			if (cellclust.numInst >= cluster.m_limit) {
				var target = ClusterData[nK];
				clustering.m_Clusters[nK].FillClusterData(ResultData, target[nJ], x, y, target, voData[nK], nK, 1);
				return;
			}
			cellclust.b2Cluster = false;

			return;
		};

		cluster.CheckGroupClusterData = function(ResultData, ClusterData, cellclust, nK, nJ, x, y, voData, connections) {
			var i, target, groupCnt = 1;
			if (cellclust.bLimitExceeded || (cellclust.numInst >= cluster.m_limit)) {
				for (i = 0; i < connections.length; ++i) {
					var tg = connections[i].index;
					target = ClusterData[tg];
					groupCnt = clustering.m_Clusters[tg].FillClusterData(ResultData, target[nJ], x, y, target, voData[tg], tg, groupCnt);
				}
			} else {
				cellclust.b2Cluster = false;
				for (i = 0; i < connections.length; ++i) {
					target = ClusterData[connections[i].index];
					target[nJ].b2Cluster = false;
				}
			}

			return;
		};

		cluster.InitializeGridClusterData = function(scene, nJ, xPos, yPos, nX, nY) {
			var myGrid = [];

			myGrid.cI = nJ;
			myGrid.nX = nX;
			myGrid.nY = nY;
			myGrid.XPerTile = scene.m_nWidthCanvas / (scene.m_nTilesX * cluster.m_dividerX);
			myGrid.YPerTile = scene.m_nHeightCanvas / (scene.m_nTilesY * cluster.m_dividerY);

			var cnt = 0;
			for (var x = 0; x < nX; ++x) {
				for (var y = 0; y < nY; ++y) {
					var elem = {};
					elem.numInst = 0;
					elem.bw = [];
					elem.sq = cnt++;
					myGrid.push(elem);
				}
			}

			myGrid.m_BaseX = xPos;
			myGrid.m_BaseY = yPos;

			return myGrid;
		};

		cluster.InitializeDistClusterData = function(scene, nJ, xPos, yPos, nX, nY) {
			var elem = {};
			elem.numInst = 0;
			elem.type = cluster.m_type;
			elem.cI = nJ;

			return elem;
		};

		cluster.InitializeTreeClusterData = function(scene, nJ, xPos, yPos, nX, nY) {
			var elem = {};
			elem.numInst = 0;
			elem.type = cluster.m_type;

			return elem;
		};

		cluster.FillSquareEdges = function(elem, b2Times, bSize, x0, y0, x1, y1) {
			var ret = [];
			ret.push([
				[
					x0, y0
				], [
					x1, y0
				]
			]);
			ret.push([
				[
					x1, y0
				], [
					x1, y1
				]
			]);
			ret.push([
				[
					x1, y1
				], [
					x0, y1
				]
			]);
			ret.push([
				[
					x0, y1
				], [
					x0, y0
				]
			]);
			elem.e = ret;
			if (b2Times) {
				var ret2 = [];
				var xDiff = (x1 - x0) / 256 * Math.abs(bSize) / 2;
				var yDiff = (y1 - y0) / 256 * Math.abs(bSize) / 2;
				ret2.push([
					[
						x0 + xDiff, y0 + yDiff
					], [
						x1 - xDiff, y0 + yDiff
					]
				]);
				ret2.push([
					[
						x1 - xDiff, y0 + yDiff
					], [
						x1 - xDiff, y1 - yDiff
					]
				]);
				ret2.push([
					[
						x1 - xDiff, y1 - yDiff
					], [
						x0 + xDiff, y1 - yDiff
					]
				]);
				ret2.push([
					[
						x0 + xDiff, y1 - yDiff
					], [
						x0 + xDiff, y0 + yDiff
					]
				]);
				elem.ei = ret2;
			}

		};

		cluster.FillClusterData = function(ResultData, cellclust, x, y, myClusterData, voData, nK, groupCnt) { // Fills data and returns BOOL whether
			// grid has yet to be displayed
			var myResult = ResultData.clust[nK];
			var xPerTile = myClusterData.XPerTile;
			var yPerTile = myClusterData.YPerTile;
			var xBase = clustering.th * myClusterData.m_BaseX;
			var yBase = clustering.th * myClusterData.m_BaseY;

			if (cluster.m_omitEmpties && !cellclust.numInst) {
				cellclust.b2Cluster = false;
				return groupCnt;
			}
			cellclust.b2Cluster = true;
			var yMin = y * yPerTile;
			var yMax = yMin + yPerTile;
			var xMin = x * xPerTile;
			var xMax = xMin + xPerTile;
			var halfXSize = xPerTile / 2;
			var halfYSize = yPerTile / 2;
			var elem = [
				(xBase + xMin + halfXSize + cluster.m_dispOffsetX) / myResult.m_lodOffset, (yBase + yMin + halfYSize + cluster.m_dispOffsetY) / myResult.m_lodOffset, 0, 0
			];
			cluster.FillSquareEdges(elem, myResult.config.b2Times, myResult.config.bSize, (xBase + xMin) / myResult.m_lodOffset, (yBase + yMin) / myResult.m_lodOffset, (xBase + xMax) / myResult.m_lodOffset, (yBase + yMax) / myResult.m_lodOffset);
			elem.sq = cellclust.sq;
			elem.cI = myClusterData.cI;
			elem.h = elem.s = false;
			elem.im = voData.m_image;
			elem.sc = voData.m_scale;
			elem.hscale = voData.m_hotscale;
			elem.hcol = voData.m_hotcol;
			elem.al = voData.m_alignment;
			elem.cnt = cellclust.numInst;
			if (cluster.m_textfont != undefined) {
				elem.f = cluster.m_textfont;
				elem.fc = cluster.m_textcolor;
				elem.fs = cluster.m_textfontscale;
				elem.fz = cluster.m_textfontsize;
				elem.fo = cluster.m_textoffset;
				elem.foy = cluster.m_textoffsetY;
			}
			elem.isCl = 1;
			elem.nJ = myResult.length;
			elem.grI = groupCnt;
			elem.bw = cellclust.bw;
			myResult.push(elem);

			return groupCnt + 1;
		};

		cluster.doDistClustering = function(nK, ResultData, orgDistThreshold, completeX) {
			var i, j, a, b, ax;
			var aTemp = [];
			var eElem = {};
			var lodOffset = ResultData.clust[nK].m_lodOffset;
			var distThreshold = orgDistThreshold / lodOffset;

			// check which objects belong to nK cluster and create a temp list
			for (i = 0; i < ResultData.base.length; ++i) {
				eElem = ResultData.base[i];

				for (j = 0; j < eElem.length; ++j) {
					if (eElem[j].cI == nK) {
						aTemp.push(eElem[j]);
						if (eElem[j].b2Ignore) {
							eElem.m_nNumIgnore--;
							eElem[j].b2Ignore = false;
						}
						eElem[j].isGrouped = false;
					}
				}
			}

			if (!aTemp.length) {
				return [];
			}

			aTemp.sort(function(a, b) {
				return a[0] - b[0];
			}); // sort the objects on x coordinate

			// find the first gap between clusters from the left side
			var nn = aTemp.length - 1;
			var iGap = 0;
			var firstP = aTemp[0], lastP = aTemp[nn];
			var distGap = firstP[0] - lastP[0] + completeX;
			if (distGap <= distThreshold) {
				for (i = 0; i < nn; ++i) {
					a = aTemp[i];
					b = aTemp[i + 1];
					ax = b[0] - a[0];

					if (ax > distThreshold) {
						iGap = i + 1;
						break;
					}
				}
			}

			// ---------------------------------------------------------------------
			// distance clustering part

			var aGroups = [];
			var minY, maxY, xa, xb, im, jm;
			var nLn = aTemp.length + iGap;
			var nAll = aTemp.length;

			for (i = iGap; i < nLn; ++i) {
				im = i % nAll;

				a = aTemp[im];
				if (a.isGrouped) {
					continue;
				}

				xa = a[0];
				if (i > nAll - 1) {
					xa += completeX;
				}

				for (j = i + 1; j < nLn; ++j) {
					jm = j % nAll;

					b = aTemp[jm];
					if (b.isGrouped) {
						continue;
					}

					xb = b[0];
					if (j > nAll - 1) {
						xb += completeX;
					}

					if (xb - xa <= distThreshold) {
						if (a.isGrouped && aGroups.length > 0) {
							minY = aGroups[a.nGrp].minY;
							maxY = aGroups[a.nGrp].maxY;
						} else {
							minY = a[1];
							maxY = a[1];
						}

						if (Math.abs(b[1] - minY) <= distThreshold && Math.abs(b[1] - maxY) <= distThreshold) {

							if (a.isGrouped) {
								aGroups[a.nGrp].push(b);
								b.isGrouped = true;
								b.nGrp = a.nGrp;
								b.b2Ignore = true;
								ResultData.base[b.vI].m_nNumIgnore++;

								// update y borders
								if (b[1] < aGroups[a.nGrp].minY) {
									aGroups[a.nGrp].minY = b[1];
								}
								if (b[1] > aGroups[a.nGrp].maxY) {
									aGroups[a.nGrp].maxY = b[1];
								}

								// update x borders
								if (xb < aGroups[a.nGrp].minX) {
									aGroups[a.nGrp].minX = xb;
								}
								if (xb > aGroups[a.nGrp].maxX) {
									aGroups[a.nGrp].maxX = xb;
								}

								// add the X and Y coordinates for gravity center calc
								if (aGroups[a.nGrp].sumX == undefined) {
									aGroups[a.nGrp].sumX = xb;
								} else {
									aGroups[a.nGrp].sumX += xb;
								}

								if (aGroups[a.nGrp].sumY == undefined) {
									aGroups[a.nGrp].sumY = b[1];
								} else {
									aGroups[a.nGrp].sumY += b[1];
								}
							} else {
								var aGr = [];
								aGr.push(a);
								aGr.push(b);
								aGroups.push(aGr);

								var lg = aGroups.length - 1;
								a.isGrouped = true;
								a.nGrp = lg;
								a.b2Ignore = true;
								ResultData.base[a.vI].m_nNumIgnore++;
								b.isGrouped = true;
								b.nGrp = lg;
								b.b2Ignore = true;
								ResultData.base[b.vI].m_nNumIgnore++;

								// update y borders
								if (a[1] < b[1]) {
									aGroups[lg].minY = a[1];
									aGroups[lg].maxY = b[1];
								} else {
									aGroups[lg].minY = b[1];
									aGroups[lg].maxY = a[1];
								}

								// update x borders
								if (xa < xb) {
									aGroups[lg].minX = xa;
									aGroups[lg].maxX = xb;
								} else {
									aGroups[lg].minX = xb;
									aGroups[lg].maxX = xa;
								}

								// add the X and Y coordinates for gravity center calc
								if (aGroups[lg].sumX == undefined) {
									aGroups[lg].sumX = xa + xb;
								} else {
									aGroups[lg].sumX += xa + xb;
								}

								if (aGroups[lg].sumY == undefined) {
									aGroups[lg].sumY = a[1] + b[1];
								} else {
									aGroups[lg].sumY += a[1] + b[1];
								}
							}
						}
					} else {
						break;
					}
				}

			}

			return aGroups;
		};

		cluster.distFillClusterData = function(scene, distClusters, ResultData, voData, iClust) {
			for (var i = 0; i < distClusters.length; ++i) {
				var myCl = distClusters[i];
				var ll = myCl.length;
				var xc = myCl.sumX / ll;
				var yc = myCl.sumY / ll;
				var elem = [
					xc, yc, 0, 0
				];

				elem.bo = [
					myCl.minX, myCl.minY, myCl.maxX, myCl.maxY
				];
				elem.h = false;
				elem.hscale = voData.m_hotscale;
				elem.hcol = voData.m_hotcol;
				elem.al = voData.m_alignment;
				elem.s = false;
				elem.im = voData.m_image;
				elem.sc = voData.m_scale;
				elem.cnt = ll;
				if (cluster.m_textfont != undefined) {
					elem.f = cluster.m_textfont;
					elem.fc = cluster.m_textcolor;
					elem.fs = cluster.m_textfontscale;
					elem.fz = cluster.m_textfontsize;
					elem.fo = cluster.m_textoffset;
					elem.foy = cluster.m_textoffsetY;
				}
				elem.bw = myCl;
				elem.isCl = 3;
				elem.nJ = ResultData.clust[iClust].length;
				ResultData.clust[iClust].push(elem);
				elem.grI = 1;
				elem.cI = iClust;
			}
			ResultData.config.bNeedsShadowLayer = cluster.fillDistConfig(ResultData.clust[iClust], ResultData.config, ResultData) || ResultData.config.bNeedsShadowLayer;
			ResultData.base[voData.m_index].clusterings.push({
				i: iClust,
				t: 1
			});
			return true;
		};

		cluster.AddEdgeChain = function(nodes) {
			var retArray = [];
			var lastNode = nodes[0], node, len;
			var nNodes = nodes.length;
			for (var i = 1; i < nNodes; ++i) {
				node = nodes[i];
				// len = Math.abs(lastNode[0]-node[0]) + Math.abs(lastNode[1]-node[1]);
				len = Math.max(Math.abs(lastNode[0] - node[0]), Math.abs(lastNode[1] - node[1]));
				retArray.push({
					s: lastNode[2],
					d: node[2],
					l: len,
					c: undefined
				});
				lastNode = node;
			}

			return retArray;
		};

		cluster.doTreeClustering = function(nK, ResultData, voData, distThreshold, completeX) {
			var aTemp = [];
			var eElem = {};
			var i, j;

			// check which objects belong to nK cluster and create a temp list
			for (i = 0; i < ResultData.base.length; ++i) {
				eElem = ResultData.base[i];

				for (j = 0; j < eElem.length; ++j) {
					if (eElem[j].cI == nK) {
						var elte = eElem[j];
						while (elte[0] < 0) {
							elte[0] += completeX;
						}
						while (elte[0] > completeX) {
							elte[0] -= completeX;
						}
						elte.lod = 30;
						elte.cnt = 1;
						elte.e = [];
						aTemp.push(elte);
						elte.b2Ignore = true;
						eElem.m_nNumIgnore++;
						elte.vo = i;
					}
				}
			}

			var a, ax, b;
			aTemp.sort(function(a, b) {
				return a[0] != b[0] ? a[0] - b[0] : a[1] - b[1];
			}); // sort the objects on x coordinate

			// we have to enrich the selected VO data
			if (ResultData.m_SelectedVOs.length) {
				for (var ii = 0; ii < aTemp.length; ++ii) {
					if (aTemp[ii].s) {
						for (var jj = 0; jj < ResultData.m_SelectedVOs.length; jj++) {
							if (aTemp[ii].nI == ResultData.m_SelectedVOs[jj].m_dataIndex) {
								ResultData.m_SelectedVOs[jj].m_index = ii;
								ResultData.m_SelectedVOs[jj].cI = nK;
							}
						}
					}
				}
			}

			// find the first gap between clusters from the left side
			var nn = aTemp.length - 1;
			if (nn < 0) {
				return [];
			}
			var iGap = 0;

			var adTemp = [];
			var firstP = aTemp[0], lastP = aTemp[nn];
			var distGap = firstP[0] - lastP[0] + completeX;
			var gapThreshold = distThreshold * completeX / clustering.tw;

			if (distGap < gapThreshold) {
				for (i = 0; i < nn; ++i) {
					a = aTemp[i];
					b = aTemp[i + 1];
					ax = b[0] - a[0];

					if (ax > distGap) {
						iGap = i + 1;
						distGap = ax;
						if (distGap > gapThreshold) {
							break;
						}
					}
				}
			}
			VBI.Trace("iGap is " + iGap);
			var entities = aTemp.length;
			var lastEntity = iGap + entities;
			var lastIndex = -1, last;
			var zeroEdges = [];
			var x, y;
			for (i = iGap; i < lastEntity; ++i) {
				if (i >= entities) {
					j = i - entities;
					(aTemp[j])[0] += completeX;
				} else {
					j = i;
				}

				a = aTemp[j];
				a.bo = [
					a[0], a[1], a[0], a[1]
				];

				x = a[0];
				y = a[1];
				if (lastIndex != -1 && x === last[0] && y === last[1]) {
					zeroEdges.push({
						s: lastIndex,
						d: j,
						l: 0,
						z: 1,
						zero: true
					});
				} else {
					adTemp.push([
						x, y, j
					]);
					lastIndex = j;
					last = a;
				}
			}

			// do the Delaunay triangulation
			var temp = Delaunay.triangulate(adTemp);
			var triangles = temp[0];
			var virtualEdges = temp[1];
			if (triangles.length == 0) {
				triangles = cluster.AddEdgeChain(adTemp);
			}

			triangles.sort(function(a, b) { // sort by Length, source, Dest, -Virtual
				var diff = a.l - b.l;
				if (diff) {
					return diff;
				}
				diff = a.s - b.s;
				if (diff) {
					return diff;
				}
				diff = a.d - b.d;
				return diff ? diff : b.v - a.v;
			});

			var edges = zeroEdges.concat(triangles);
			var lodDist = (1 << ResultData.config.m_BaseLod);

			for (j = 0; j < aTemp.length; j++) {
				aTemp[j].nJ = j;
			}
			cluster.clcnt = aTemp.length;

			ResultData.config.m_0ref = cluster.buildTree(aTemp, nK, edges, voData, distThreshold, completeX);
			ResultData.config.m_ref = ResultData.config.m_0ref / lodDist;

			cluster.determineClusterPositions(aTemp.m_TreeFatherNode);

			cluster.assembleAreaInfo(aTemp, edges, virtualEdges);
			aTemp.m_edges = edges;
			return aTemp;
		};

		cluster.determineClusterPositions = function(node) {
			if (node.isCl) {
				var x = 0, y = 0, bw = node.bw, c;

				for (var i = bw.length; i--;) {
					c = cluster.determineClusterPositions(bw[i]);
					x += (c[0] * c[2]);
					y += (c[1] * c[2]);
				}
				node[0] = x / node.cnt;
				node[1] = y / node.cnt;
			}
			return [
				node[0], node[1], node.cnt
			];

		};

		cluster.AddVirtuals = function(node, index, virtuals) {
			var myNode = virtuals[index];
			if (myNode.executed == undefined) {
				var source = myNode.v0, dest;
				if (source) {
					for (var i = 0; i < myNode.length; ++i) {
						dest = myNode[i];
						node.e.push([
							[
								source.c[0], source.c[1]
							], [
								dest.c[0], dest.c[1]
							]
						]);
					}
				} else {
					source = myNode[0];
					dest = myNode[1];
					node.e.push([
						[
							source.c[0], source.c[1]
						], [
							dest.c[0], dest.c[1]
						]
					]);
				}
			}
		};

		cluster.AddEdge = function(node, e1, e2, virtuals, bSourceInCluster, bDestInCluster, eIndex) {
			if (!bSourceInCluster || !bDestInCluster) {
				// node.e.push( [ [ e1.c[0], e1.c[1] ], [ e2.c[0], e2.c[1] ] ] );
				node.e.push(eIndex);
			}

			if (e1.v) {
				if (bSourceInCluster) {
					cluster.AddVirtuals(node, e1.s, virtuals);
				}
				if (bDestInCluster) {
					cluster.AddVirtuals(node, e1.d, virtuals);
				}
			}
			return node.c;
		};

		cluster.MarkVirtuals = function(source, dest, virtuals) {
			virtuals[source].executed = true;
			virtuals[dest].executed = true;
		};

		cluster.assembleAreaInfo = function(nodes, edges, virtuals) {
			var e1, e2, n1, n2;
			var l = edges.length - 1;
			for (var i = 0; i <= l; ++i) {
				var bStopExec = false;
				e1 = edges[i];
				e2 = i < l ? edges[i + 1] : undefined;
				if (e1.l && e1.s >= 0 && e1.d >= 0) {
					n1 = nodes[e1.s];
					n2 = nodes[e1.d];
					if ((i < l) && (e1.s === e2.s) && (e1.d === e2.d)) { // inner edge, we connect the centers of the triangle circles
						while (n1 != undefined && bStopExec == false) {
							if (n1.lod < n2.lod) {
								n2 = cluster.AddEdge(n2, e1, e2, virtuals, false, true, i);
							} else if (n1.lod > n2.lod) {
								n1 = cluster.AddEdge(n1, e1, e2, virtuals, true, false, i);
							} else if (n1.nJ === n2.nJ) {
								if (e1.v) {
									n1 = cluster.AddEdge(n1, e1, e2, virtuals, true, true, i);
									n2 = n2.c;
								} else {
									bStopExec = true;
								}
							} else {
								n1 = cluster.AddEdge(n1, e1, e2, virtuals, true, false, i);
								n2 = cluster.AddEdge(n2, e1, e2, virtuals, false, true, i);
							}
						}
						i++; // skip second entity
					}
				}
				if (e1.v) {
					virtuals[e1.s].executed = true;
					virtuals[e1.d].executed = true;
				}
			}
		};

		cluster.recCheck = function(nodes, aNode1, eix1, eix1s, aNode2, eix2, eix2s, aboveLod, vo, edgeLod, log2ComplX, distThreshold, lvl) {
			var listBOs = [];
			var inserts = [
				0, 0
			];
			var eNode2 = aNode2[eix2];
			var bo1, bo2, i, elte;

			var res = cluster.analyzePath(listBOs, aNode1, eix1, eNode2, aboveLod, log2ComplX, distThreshold);
			if (res.nLod == aboveLod) {
				return inserts; // nothing to do here
			}

			var uNode1 = aNode1[res.i];

			if (res.nLod == res.oLod) {
				if (cluster.NodeMerge(res.nLod, aNode2, eix2, aNode1, res.i) && eix2) {
					inserts = cluster.recCheck(nodes, aNode1, res.i - 1, res.i - 1, aNode2, eix2 - 1, eix2 - 1, res.nLod, vo, edgeLod, log2ComplX, distThreshold, lvl + 1);
				}
			} else if (eNode2.lod > res.nLod) {
				cluster.Merge2NewNode(nodes, res.nLod, aNode1[res.i], eNode2, aNode1, res.i + 1, vo);
				inserts[1] = 1;
			} else {
				inserts = cluster.recCheck(nodes, aNode2, eix2, eix2s, aNode1, res.i, eix1s, eNode2.lod - 1, vo, edgeLod, log2ComplX, distThreshold, lvl + 1);
				if (listBOs.length > 1) {
					var rIndex = res.i + 1 + inserts[0];
					var rNode = aNode1[rIndex];
					var eix1PlusIns = eix1 + inserts[0];
					cluster.NodeMerge(rNode.lod, aNode2, eix2 + inserts[1], aNode1, rIndex);
					for (i = rIndex; i <= eix1s + inserts[0]; i++) {
						elte = aNode1[i];
						if (i < eix1PlusIns) {
							elte.bo = listBOs[eix1 + inserts[0] - i];
						} else {
							bo1 = elte.bo;
							bo2 = eNode2.bo;
							elte.bo = [
								Math.min(bo1[0], bo2[0]), Math.min(bo1[1], bo2[1]), Math.max(bo1[2], bo2[2]), Math.max(bo1[3], bo2[3])
							];
						}
						elte.cnt += (eNode2.cnt - uNode1.cnt);
					}
				}
				return [
					inserts[1], inserts[0]
				];
			}

			for (i = res.i; i <= eix1s; i++) {
				elte = aNode1[i + inserts[1]];
				elte.cnt += eNode2.cnt;
				if (i <= eix1) {
					elte.bo = listBOs[eix1 - i];
				} else {
					bo1 = elte.bo;
					bo2 = eNode2.bo;
					elte.bo = [
						Math.min(bo1[0], bo2[0]), Math.min(bo1[1], bo2[1]), Math.max(bo1[2], bo2[2]), Math.max(bo1[3], bo2[3])
					];
				}
			}

			return inserts;
		};

		cluster.buildTree = function(nodes, cI, edges, vo, distThreshold, completeX) {

			var dLog2 = 1 / Math.log(2);
			cluster.dLog2 = dLog2;
			var log2ComplX = dLog2 * Math.log(completeX / clustering.tw) + 4;
			var prev, bSwitchNodes, edgeLen, i;
			var eNode1, eNode2, e, eix1, eix2;
			for (e = 0; e < edges.length; ++e) {
				var entry = edges[e];
				if (prev && (entry.s == prev.s) && (entry.d == prev.d)) {
					continue; // virtual edge or same as edge before -> ignore
				}
				prev = entry;

				edgeLen = entry.l;

				var edgeLod = Math.floor(Math.min(24, dLog2 * Math.log(distThreshold / edgeLen) + log2ComplX));
				// var reference = distThreshold / Math.exp(-log2ComplX/dLog2);

				var aNode1 = [
					nodes[entry.s]
				];
				for (i = 0; aNode1[i].c != undefined; ++i) {
					aNode1[i + 1] = aNode1[i].c;
				}
				eNode1 = aNode1[i];

				var aNode2 = [
					nodes[entry.d]
				];
				for (i = 0; aNode2[i].c != undefined; ++i) {
					aNode2[i + 1] = aNode2[i].c;
				}
				eNode2 = aNode2[i];

// if (entry.v && aNode1[aNode1.length-1].nJ == aNode2[aNode2.length-1].nJ )
// continue; // do not connect sub levels over outer edges

				bSwitchNodes = false;
				if ((aNode1.length == 1) && (aNode2.length > 1)) { // to avoid one case we switch source and destination if source is atomic
					bSwitchNodes = true;
				} else if (aNode2.length > 1) {
					if ((eNode2.lod < eNode1.lod) || ((eNode2.lod == eNode1.lod) && (eNode2.cnt > eNode1.cnt))) {
						bSwitchNodes = true;
					}
				}

				eix1 = aNode1.length - 1;
				eix2 = aNode2.length - 1;
				var aboveLod = -1000;

				if (eNode1.nJ == eNode2.nJ) {
					do { // move upwards to the first difference which must exist
						aboveLod = eNode1.lod;
						eNode1 = aNode1[--eix1];
						eNode2 = aNode2[--eix2];
					} while (eNode1.nJ == eNode2.nJ);
				}

				if (bSwitchNodes) {
					cluster.recCheck(nodes, aNode2, eix2, eix2, aNode1, eix1, eix1, aboveLod, vo, edgeLod, log2ComplX, distThreshold, 0);
				} else {
					cluster.recCheck(nodes, aNode1, eix1, eix1, aNode2, eix2, eix2, aboveLod, vo, edgeLod, log2ComplX, distThreshold, 0);
				}
				// cluster.CheckNodeConsistency(undefined,aNode1,aNode2, log2ComplX, distThreshold);
			}

			if (nodes.length) {
				var fatherNode = nodes[0];
				while (fatherNode.c != undefined) {
					fatherNode = fatherNode.c;
				}
				fatherNode.cI = cI;
				nodes.m_TreeFatherNode = fatherNode;
			}

			return distThreshold / (2 * Math.exp(-log2ComplX / dLog2)); // return length reference
		};

		cluster.Merge2NewNode = function(nodes, lod, uNode, eNode, aNode, ii, vo) {
			var uNodeNext = uNode.c;
			var eNodeNext = eNode.c;

			var newNode = {
				lod: lod,
				nJ: cluster.clcnt++,
				isCl: 4,
				cnt: uNode.cnt,
				e: [],
				h: false,
				hscale: vo.m_hotscale,
				hcol: vo.m_hotcol,
				s: false,
				im: vo.m_image,
				sc: vo.m_scale,
				f: cluster.m_textfont,
				fc: cluster.m_textcolor,
				fs: cluster.m_textfontscale,
				fz: cluster.m_textfontsize,
				fo: cluster.m_textoffset,
				foy: cluster.m_textoffsetY,
				al: vo.m_alignment,
				grI: 1
			};
			newNode.bw = [
				uNode, eNode
			];
			uNode.c = newNode;
			eNode.c = newNode;
			aNode.splice(ii, 0, newNode);
			if (uNodeNext != undefined) {
				newNode.c = uNodeNext;
				cluster.ReplaceBWE(uNodeNext.bw, uNode.nJ, newNode);
			}
			if (eNodeNext != undefined) {
				cluster.RemoveBWE(eNodeNext.bw, eNode.nJ);
			}

			nodes.push(newNode);

			return newNode;
		};

		cluster.NodeMerge = function(nLod, list1, i1, list2, i2) {
			var retVal = false;
			var newParent = list2[i2];
			var newSon = list1[i1];
			var oldParent = newSon.c;
			if (nLod < newSon.lod) {
				newParent.bw.push(newSon);
				newSon.c = newParent;
			} else {
				var bwNode;
				for (var i = newSon.bw.length; i--;) {
					bwNode = newSon.bw[i];
					bwNode.c = newParent;
					newParent.bw.push(bwNode);
					newSon.bw[i] = undefined;
				}
				newSon.bInvalid = true;
				retVal = true;
			}
			if (oldParent != undefined) {
				cluster.RemoveBWE(oldParent.bw, newSon.nJ);
			}
			return retVal;
		};

		cluster.ReplaceBWE = function(myList, oldEntry, entry) {
			for (var i = myList.length; i--;) {
				if (myList[i].nJ == oldEntry) {
					if (entry == -1) {
						myList.splice(i, 1);
					} else {
						myList[i] = entry;
					}
				}
			}
		};

		cluster.RemoveBWE = function(myList, oldEntry) {
			for (var i = myList.length; i--;) {
				if (myList[i].nJ == oldEntry) {
					myList.splice(i, 1);
				}
			}
		};

// cluster.CheckNodeConsistency = function(newNode, aNode1, aNode2, log2ComplX, distThreshold)
// {
// // cluster.CheckConsistency(newNode, log2ComplX, distThreshold);
// for (var j=0; j< aNode1.length;++j)
// cluster.CheckConsistency(aNode1[j], log2ComplX, distThreshold);
// for (var j=0; j< aNode2.length;++j)
// cluster.CheckConsistency(aNode2[j], log2ComplX, distThreshold);
// };
//
// cluster.CheckConsistency = function ( node, log2ComplX, distThreshold )
// {
// if ((node == -1)||(node.bw==undefined)||(node.bInvalid)||!node.bCluster) return;
// var cnt = 0;
// for (var i = 0; i < node.bw.length; ++i)
// if ( node.bInvalid != true )
// cnt += node.bw[i].cnt;
// if (node.cnt != cnt)
// VBI.Trace("Count Inconsistency found ");
//
// var bo = node.bo;
// if (bo == undefined ){
// VBI.Trace("bo undefined issue");
// return;
// }
// // var myLen = bo[2] - bo[0] + bo[3] - bo[1];
// var myLen = Math.max(bo[2] - bo[0], bo[3] - bo[1] );
// // var myLod = Math.floor(Math.min(22, cluster.dLog2 * Math.log(distThreshold / myLen) + log2ComplX));
// var myLod = Math.floor(Math.min(22, cluster.dLog2 * Math.log( distThreshold / myLen) + log2ComplX));
//
// if (myLod != node.lod){
// VBI.Trace("["+bo[0]+","+bo[1]+","+bo[2]+","+bo[3]+"] evaluates to Len="+myLen+" with Dist="+distThreshold+" and logFactor="+log2ComplX);
// VBI.Trace("LOD Inconsistency found, expected LOD: "+myLod+", actual LOD: "+node.lod+" BO:["+bo[0]+","+bo[1]+","+bo[2]+","+bo[3]+"]");
// }
// };

		cluster.analyzePath = function(BOs, nodeChain, index, eNode2, aboveLod, log2ComplX, distThreshold) {
			var eNode1 = nodeChain[index];
			var bo1 = eNode1.bo, bo2 = eNode2.bo;
			var newBO = [
				Math.min(bo1[0], bo2[0]), Math.min(bo1[1], bo2[1]), Math.max(bo1[2], bo2[2]), Math.max(bo1[3], bo2[3])
			];

			// var myLod = edgeLod;
			var myLen = Math.max(newBO[2] - newBO[0], newBO[3] - newBO[1]);
			var myLod = Math.floor(Math.min(24, cluster.dLog2 * Math.log(distThreshold / myLen) + log2ComplX));

			if (myLod <= aboveLod) {
				return {
					i: index + 1,
					nLod: aboveLod,
					oLod: aboveLod
				};
			}

			BOs.push(newBO);
			if (index == 0 || myLod < eNode1.lod) {
				return {
					i: index,
					nLod: myLod,
					oLod: eNode1.lod
				};
			}
			return cluster.analyzePath(BOs, nodeChain, index - 1, eNode2, myLod, log2ComplX, distThreshold);
		};

		cluster.fillClusterConfig = function(myResult, baseConfig, minLOD, bAnimationAllowed) {
			var elte = {};
			elte.bCol = cluster.m_bordercol;
			elte.bSize = Math.abs(cluster.m_bordersize);
			if (cluster.m_bordersize < 0) {
				elte.b2Times = true;
			}
			elte.fCol = cluster.m_fillcol;
			elte.permArea = cluster.m_permanentArea;
			if (cluster.m_bordercol2) {
				elte.bCol2 = cluster.m_bordercol2;
			}
			if (cluster.m_bordercol3) {
				elte.bCol3 = cluster.m_bordercol3;
			}
			if (cluster.m_fillcol2) {
				elte.fCol2 = cluster.m_fillcol2;
			}
			if (cluster.m_fillcol3) {
				elte.fCol3 = cluster.m_fillcol3;
			}
			elte.sCol = cluster.m_spotcol;
			elte.sSize = cluster.m_spotsize;
			elte.anim = (!bAnimationAllowed) ? undefined : cluster.m_animated;
			elte.animLow = Math.ceil(minLOD);
			elte.baseConf = baseConfig;

			myResult.config = elte;
			return ((elte.bCol != undefined) || (elte.sCol && elte.sSize));
		};

		cluster.fillDistConfig = function(myResult, baseConfig, ResultData) {
			var elte = {};
			elte.baseConf = baseConfig;
			myResult.config = elte;
			if ((cluster.m_spotsize != undefined) && (cluster.m_spotsize != 0) && (cluster.m_spotcol != undefined)) {
				elte.sCol = cluster.m_spotcol;
				elte.sSize = cluster.m_spotsize;
				elte.base = ResultData.base;
				return true;
			}

			return false;
		};

		cluster.treeFillClusterData = function(scene, treeClusters, ResultData, voData, nJ, minLOD) {
			ResultData.clust[nJ] = treeClusters;
			ResultData.clust[nJ].hotItem = ResultData.hotItem;
			ResultData.clust[nJ].cI = nJ;
			ResultData.clust[nJ].m_lodOffset = 1;
			ResultData.clust[nJ].m_nRecalcs = 0;
			ResultData.base[voData.m_index].clusterings.push({
				i: nJ,
				t: 2
			});
			ResultData.config.bNeedsShadowLayer = cluster.fillClusterConfig(ResultData.clust[nJ], ResultData.config, minLOD, true) || ResultData.config.bNeedsShadowLayer;

			return true;
		};

		return cluster;
	};

	Delaunay = {

		supertriangle: function(vertices) {
			var xmin = Number.POSITIVE_INFINITY, ymin = Number.POSITIVE_INFINITY, xmax = Number.NEGATIVE_INFINITY, ymax = Number.NEGATIVE_INFINITY, i, dx, dy, dmax, xmid, ymid;

			for (i = vertices.length; i--;) {
				if (vertices[i][0] < xmin) {
					xmin = vertices[i][0];
				}
				if (vertices[i][0] > xmax) {
					xmax = vertices[i][0];
				}
				if (vertices[i][1] < ymin) {
					ymin = vertices[i][1];
				}
				if (vertices[i][1] > ymax) {
					ymax = vertices[i][1];
				}
			}

			dx = xmax - xmin;
			dy = ymax - ymin;
			dmax = Math.max(dx, dy);
			xmid = xmin + dx * 0.5;
			ymid = ymin + dy * 0.5;

			return [
				[
					xmid - 40 * dmax, ymid - dmax, -1
				], [
					xmid, ymid + 40 * dmax, -2
				], [
					xmid + 40 * dmax, ymid - dmax, -3
				]
			];
		},

		circumcircle: function(vertices, i, j, k) {
			var x1 = vertices[i][0], y1 = vertices[i][1], x2 = vertices[j][0], y2 = vertices[j][1], x3 = vertices[k][0], y3 = vertices[k][1], fabsy1y2 = Math.abs(y1 - y2), fabsy2y3 = Math.abs(y2 - y3), xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

// // Check for coincident points
// if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
// throw new Error("Eek! Coincident points!");

			if (fabsy1y2 < EPSILON) {
				m2 = -((x3 - x2) / (y3 - y2));
				mx2 = (x2 + x3) / 2.0;
				my2 = (y2 + y3) / 2.0;
				xc = (x2 + x1) / 2.0;
				yc = m2 * (xc - mx2) + my2;
			} else if (fabsy2y3 < EPSILON) {
				m1 = -((x2 - x1) / (y2 - y1));
				mx1 = (x1 + x2) / 2.0;
				my1 = (y1 + y2) / 2.0;
				xc = (x3 + x2) / 2.0;
				yc = m1 * (xc - mx1) + my1;
			} else {
				m1 = -((x2 - x1) / (y2 - y1));
				m2 = -((x3 - x2) / (y3 - y2));
				mx1 = (x1 + x2) / 2.0;
				mx2 = (x2 + x3) / 2.0;
				my1 = (y1 + y2) / 2.0;
				my2 = (y2 + y3) / 2.0;
				xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
				yc = (fabsy1y2 > fabsy2y3) ? m1 * (xc - mx1) + my1 : m2 * (xc - mx2) + my2;
			}

			dx = x2 - xc;
			dy = y2 - yc;
			return {
				i: i,
				j: j,
				k: k,
				x: xc,
				y: yc,
				r: dx * dx + dy * dy
			};
		},

		dedup: function(edges) {
			var i, j, a, b, m, n;

			for (j = edges.length; j;) {
				b = edges[--j];
				a = edges[--j];

				for (i = j; i;) {
					n = edges[--i];
					m = edges[--i];

					if ((a === m && b === n) || (a === n && b === m)) {
						edges.splice(j, 2);
						edges.splice(i, 2);
						break;
					}
				}
			}
		},

		assemble: function(open, closed, virtuals, vertices, n) {
			open.length = 0;
			var i;

			for (i = closed.length; i--;) {
				var numVirtual = (closed[i].i >= n) + (closed[i].j >= n) + (closed[i].k >= n);
				// var bVirtual = (closed[i].i >= n || closed[i].j >= n || closed[i].k >= n);
				var nodes = [
					closed[i].i, closed[i].j, closed[i].k
				];
				nodes.sort();
				var vi = vertices[nodes[0]], vj = vertices[nodes[1]], vk = vertices[nodes[2]];
				var ds1 = Math.max(Math.abs(vi[0] - vj[0]), Math.abs(vi[1] - vj[1]));
				var ds2 = Math.max(Math.abs(vi[0] - vk[0]), Math.abs(vi[1] - vk[1]));
				var ds3 = Math.max(Math.abs(vk[0] - vj[0]), Math.abs(vk[1] - vj[1]));
				var c = [
					closed[i].x, closed[i].y
				];
				// var c = [ ( vi[0]+vj[0]+vk[0] ) / 3, ( vi[1]+vj[1]+vk[1] ) / 3 ]
				var v0 = (vertices[nodes[0]])[2], v1 = (vertices[nodes[1]])[2], v2 = (vertices[nodes[2]])[2];

				if (v0 >= 0 && v1 >= 0) {
					open.push({
						s: v0,
						d: v1,
						l: ds1,
						c: c,
						v: numVirtual
					});
				}

				if (v0 >= 0 && v2 >= 0) {
					open.push({
						s: v0,
						d: v2,
						l: ds2,
						c: c,
						v: numVirtual
					});
				}

				if (v1 >= 0 && v2 >= 0) {
					open.push({
						s: v1,
						d: v2,
						l: ds3,
						c: c,
						v: numVirtual
					});
				}

				if (numVirtual) {
					if (v0 >= 0) {
						this.addToVirtual(virtuals, v0, v1, v2, c, numVirtual);
					}
					if (v1 >= 0) {
						this.addToVirtual(virtuals, v1, v0, v2, c, numVirtual);
					}
					if (v2 >= 0) {
						this.addToVirtual(virtuals, v2, v0, v1, c, numVirtual);
					}
				}

			}

			return open;
		},

		triangulate: function(vertices, key) {
			var n = vertices.length, i, j, indices, st, open, closed, edges, virtuals, dx, dy, a, b, c;

			// check if there are enough vertices to form any triangles
			if (n < 1) {
				return [];
			}

			// Slice out the actual vertices from the passed objects.
			// (Duplicate the array even if we don't, though, since we need to make a supertriangle later on!)
			vertices = vertices.slice(0);

			if (key) {
				for (i = n; i--;) {
					vertices[i] = vertices[i][key];
				}
			}

			// Make an array of indices into the vertex array, sorted by the vertices' x-position
			indices = new Array(n);

			for (i = n; i--;) {
				indices[i] = i;
			}

			indices.sort(function(i, j) {
				return vertices[j][0] - vertices[i][0];
			});

			// Next, find the vertices of the supertriangle (which contains all other triangles),
			// and append them onto the end of a (copy of) the vertex array
			st = this.supertriangle(vertices);
			vertices.push(st[0], st[1], st[2]);

			// Initialize the open list (containing the supertriangle and nothing else)
			// and the closed list (which is empty since we haven't processed any triangles yet)
			open = [
				this.circumcircle(vertices, n + 0, n + 1, n + 2)
			];
			closed = [];
			edges = [];
			virtuals = [];

			// Incrementally add each vertex to the mesh
			for (i = indices.length; i--; edges.length = 0) {
				c = indices[i];

				// For each open triangle, check to see if the current point is
				// inside it's circumcircle. If it is, remove the triangle and add
				// it's edges to an edge list
				for (j = open.length; j--;) {
					// If this point is to the right of this triangle's circumcircle,
					// then this triangle should never get checked again. Remove it
					// from the open list, add it to the closed list, and skip
					dx = vertices[c][0] - open[j].x;
					if (dx > 0.0 && dx * dx > open[j].r) {
						closed.push(open[j]);
						open.splice(j, 1);
						continue;
					}

					// If we're outside the circumcircle, skip this triangle
					dy = vertices[c][1] - open[j].y;
					if (dx * dx + dy * dy - open[j].r > EPSILON) {
						continue;
					}

					// Remove the triangle and add it's edges to the edge list
					edges.push(open[j].i, open[j].j, open[j].j, open[j].k, open[j].k, open[j].i);
					open.splice(j, 1);
				}

				// Remove any doubled edges
				this.dedup(edges);

				// Add a new triangle for each edge
				for (j = edges.length; j;) {
					b = edges[--j];
					a = edges[--j];
					open.push(this.circumcircle(vertices, a, b, c));
				}
			}

			// Copy any remaining open triangles to the closed list, and then
			// remove any triangles that share a vertex with the supertriangle,
			// building a list of triplets that represent triangles
			for (i = open.length; i--;) {
				closed.push(open[i]);
			}

			open = this.assemble(open, closed, virtuals, vertices, n);

			return [
				open, virtuals
			// , st
			];
		},

		addToVirtual: function(virtuals, v0, v1, v2, c, numVirtual) {
			var elte = {
				n1: v1,
				n2: v2,
				c: c,
				v: numVirtual
			};
			if (virtuals[v0] == undefined) {
				virtuals[v0] = [];
			}

			if (v1 < 0 && v2 < 0) {
				virtuals[v0].v0 = elte;
			} else {
				virtuals[v0].push(elte);
			}
		},

		contains: function(tri, p) {
			// Bounding box test first, for quick rejections
			if ((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) || (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) || (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) || (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1])) {
				return null;
			}

			var a = tri[1][0] - tri[0][0], b = tri[2][0] - tri[0][0], c = tri[1][1] - tri[0][1], d = tri[2][1] - tri[0][1], i = a * d - b * c;

			// Degenerate triangle
			if (i === 0.0) {
				return null;
			}
			var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i, v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

			// check if we are outside the triangle
			if (u < 0.0 || v < 0.0 || (u + v) > 1.0) {
				return null;
			}
			return [
				u, v
			];
		}
	};

	return clustering;
};

});
