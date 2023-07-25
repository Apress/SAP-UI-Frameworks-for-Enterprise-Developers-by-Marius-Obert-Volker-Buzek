/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// mapmanager object
// Author: Ulrich Roegelein

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.MapManager = (function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var mapmanager = {};
	mapmanager.vbiclass = "MapManager";

	mapmanager.m_nRequest = 0;
	mapmanager.m_tileWidth = 256;
	mapmanager.m_tileHeight = 256;
	mapmanager.m_runningRequests = 0;
	mapmanager.m_runningXhrRequests = 0;
	mapmanager.m_limitRequests = 12;
	mapmanager.m_requestQueue = [];
	mapmanager.m_renderQueue = [];
	mapmanager.m_renderRequestID = 0;
	mapmanager.m_failedSendTimer = 0;
	mapmanager.m_renderJunksize = 100;
	// image is loaded

	/**
	 * Increments and Decrements counters related to tile download connections
	 *
	 * @private
	 * @param {Image} image - Image object to track counters agains
	 * @param {number} factor - A positive or negative integer to be added to the counter
	 */
	mapmanager._modifyReqCounters = function(image, factor) {
		if (image.m_Headers) { // if headers presents -> this is xhr request
			mapmanager.m_runningXhrRequests += factor;
		} else {
			mapmanager.m_runningRequests += factor;
		}
		if (VBI.m_bTrace) {
			VBI.Trace("Running Requests - Xhr: " + mapmanager.m_runningXhrRequests + ", src: " + mapmanager.m_runningRequests);
		}
	};

	mapmanager.onAbort = function(event) {
		var image = event.srcElement;

		if (VBI.m_bTrace) {
			VBI.Trace("onAbort " + image.src);
		}

		//decrement the counters
		mapmanager._modifyReqCounters(image, -1);

		//trigger more requests if there are some in the queue
		mapmanager.CheckReqQueue();

		// unlink the image from within the image chain
		mapmanager.UnlinkImage(image);
		mapmanager.CheckTmpCanvas(image.m_Target, image.m_nRequest, image.m_nLayersAbove);
	};

	mapmanager.onFailedSend = function(object) {
		if (VBI.m_bTrace) {
			VBI.Trace("onFailedSend " + object.src);
		}

		//decrement the counters
		mapmanager._modifyReqCounters(object, -1);
		mapmanager.m_bRequestError = true;

		if (!mapmanager.m_failedSendTimer) {
			mapmanager.m_failedSendTimer = setInterval(function() {
				mapmanager.RetrySending();
			}, 750);
		}
	};

	mapmanager.onError = function(event) {
		var image = event.srcElement;

		if (VBI.m_bTrace) {
			VBI.Trace("onError " + image.src);
		}

		//decrement the counters
		mapmanager._modifyReqCounters(image, -1);
		mapmanager.CheckReqQueue();

		var imageRender = null;
		// inherit the fillstyle
		if (image.m_Next != null) {
			image.m_Next.m_FillStyle = image.m_FillStyle;
		}

		if (image.m_Prev == null && image.m_Next != null && image.m_Next.complete == true) {
			imageRender = image.m_Next;
		}

		// unlink the image from within the image chain
		mapmanager.UnlinkImage(image);

		// when the image is the first in current and would be rendered
		if (imageRender != null) {
			mapmanager.m_renderQueue.push(imageRender);
			if (!mapmanager.m_renderRequestID) {
				mapmanager.m_renderRequestID = window.requestAnimationFrame(mapmanager.RenderTiles);
			}
		} else {
			mapmanager.CheckTmpCanvas(image.m_Target, image.m_nRequest, image.m_nLayersAbove);
		}
	};

	mapmanager.onLoad = function(event) {
		var image = event.target;

		if (!image.complete) { //skip odd onload event from IE where image is not loaded yet
			return;
		}

		//If the request is xhr then we need to revoke the blob data url once loaded
		if (image.m_Headers) {
			(window.URL || window.webkitURL).revokeObjectURL(image.src);
		}

		if (VBI.m_bTrace) {
			VBI.Trace("VBI.MapManager: onLoad " + (image.m_Headers ? "(xhr) " : " ") + (image.m_Headers ? image.src2execute : image.src));
		}

		//decrement the counters
		mapmanager._modifyReqCounters(image, -1);
		mapmanager.CheckReqQueue();

		var bChainComplete = true; // I for myself am complete as I am in onLoad.
		var item;
		for (item = image.m_Prev; item != null; item = item.m_Prev) {
			bChainComplete &= item.complete;
		}
		for (item = image.m_Next; item != null; item = item.m_Next) {
			bChainComplete &= item.complete;
		}
		if (!bChainComplete) {
			if (VBI.m_bTrace) {
				VBI.Trace("VBI.MapManager: onLoad skip as there is a a not yet loaded tile ");
			}
			return;
		}
		// mapmanager.RenderTile(image);
		mapmanager.m_renderQueue.push(image);
		if (!mapmanager.m_renderRequestID) {
			mapmanager.m_renderRequestID = window.requestAnimationFrame(mapmanager.RenderTiles);
		}
	};

	mapmanager.RetrySending = function() {
		clearInterval(mapmanager.m_failedSendTimer);
		mapmanager.m_failedSendTimer = 0;
		mapmanager.m_bRequestError = false;
		mapmanager.CheckReqQueue();
	};

	mapmanager.CheckReqQueue = function() {
		while ((mapmanager.m_requestQueue.length) && (!mapmanager.m_bRequestError)) {
			var image = mapmanager.m_requestQueue.shift();
			var targetCanvas = image.m_Target;
			if (image.m_nLOD != targetCanvas.m_nCurrentLOD || targetCanvas.m_bInvalid) {
				mapmanager.UnlinkImage(image);
				mapmanager.CheckTmpCanvas(targetCanvas, image.m_nRequest, image.m_nLayersAbove);
			} else {
				try {
					//Check for xhr object and resend if present, otherwise set image src
					if (image.m_Headers) {
						mapmanager._createHttpRequest(image);
					} else {
						mapmanager.m_bRequestError = false;
						mapmanager._modifyReqCounters(image, 1);
						image.src = image.src2execute;
					}
				} catch (e) {
					mapmanager.m_requestQueue.unshift(image);
					mapmanager.onFailedSend(image);
				}
				return;
			}
		}
		// no further request to be executed
	};

	mapmanager.RenderTiles = function() {
		var nCount = Math.min(mapmanager.m_renderQueue.length, mapmanager.m_renderJunksize);
		for (var i = 0; i < nCount; ++i) {
			mapmanager.RenderTile(mapmanager.m_renderQueue.shift());
		}
		mapmanager.m_renderRequestID = mapmanager.m_renderQueue.length > 0 ? window.requestAnimationFrame(mapmanager.RenderTiles) : 0;
	};

	mapmanager.RenderTile = function(image) {
		if (!image.bRendered) {

			//get the target canvas reference from the image property and check whether rendering should be redirected to another canvas
			var targetCanvas = image.m_Target;
			if ((targetCanvas.m_CanvasRedirect != undefined) && (targetCanvas.m_CanvasRedirRequest == image.m_nRequest)) {
				targetCanvas = targetCanvas.m_CanvasRedirect;
			}

			//If the canvas isn't connected to a scene then don't render
			var currentScene = targetCanvas.m_Scene;
			if (!currentScene) {
				return;
			}

			var canvasWidth = targetCanvas.getPixelWidth();
			var canvasHeight = targetCanvas.getPixelHeight();

			targetCanvas.m_nAppliedRequest = Math.max(targetCanvas.m_nAppliedRequest, image.m_nRequest);
			var context = targetCanvas.getContext('2d');

			//Get the maximum number of tiles for the specified zoom level
			var nMaxX = (1 << context.canvas.m_nCurrentLOD);

			//Calculate whether current image is still visibile for the current canvas
			var nCol = ((image.m_nReqX - context.canvas.m_nCurrentX) % nMaxX + nMaxX) % nMaxX; // double mod for neg.numbers
			if (nMaxX < currentScene.m_nTilesX) {
				nCol = image.m_nCol + image.m_nXOrigin - context.canvas.m_nCurrentX;
			}
			var nRow = image.m_nReqY - context.canvas.m_nCurrentY;

			// unlink and return when image request is outdated / would not be visible
			if (image.m_bOutdated || (nCol < 0) || (nRow < 0) || (nCol >= image.m_numCol) || (nRow >= image.m_numRow) || (image.m_nLOD != targetCanvas.m_nCurrentLOD || targetCanvas.m_bInvalid)) {
				mapmanager.UnlinkImage(image);

				if (VBI.m_bTrace) {
					VBI.Trace("VBI.MapManager: RenderTile  " + image.src + " is outdated");
				}
				mapmanager.CheckTmpCanvas(targetCanvas, image.m_nRequest, image.m_nLayersAbove);
				return;
			}

			if (VBI.m_bTrace) {
				VBI.Trace("VBI.MapManager: RenderTile  " + image.src);
			}
			// do regular work
			var nWidth = currentScene.m_nWidthCanvas;
			var nHeight = currentScene.m_nHeightCanvas;

			// size it down to prevent from fragments
			targetCanvas.setPixelWidth(nWidth);
			targetCanvas.setPixelHeight(nHeight);

			//Calculate the current image/tile width relative to the canvas
			var tilewidth = nWidth / currentScene.m_nTilesX;
			var tileheight = nHeight / currentScene.m_nTilesY;

			//Calculate the correct offset for this tile on the current canvas
			var left = nCol * tilewidth;
			var top = nRow * tileheight;

			//Scale the image to canvas if required (e.g. smaller tile / static map image)
			var picWidth = image.m_nXExpansion * tilewidth;
			var picHeight = image.m_nYExpansion * tileheight;

			// draw chained images in sequence
			var imageTemp = image;
			var tmpFillStyle;
			while (imageTemp.m_Prev != null) {
				imageTemp = imageTemp.m_Prev;
			}

			while (imageTemp != null && imageTemp.complete == true) {
				// optional draw the image background into the canvas
				if (imageTemp.m_FillStyle != null) {
					if (VBI.m_bTrace) {
						VBI.Trace("RenderTile fillRect " + imageTemp.src);
					}
					tmpFillStyle = context.fillStyle;
					context.fillStyle = imageTemp.m_FillStyle;
					context.fillRect(left, top, picWidth, picHeight);
					context.fillStyle = tmpFillStyle;
				}

				//Draw the image to the canvas with the specified opacity
				if (VBI.m_bTrace) {
					VBI.Trace("RenderTile drawImage " + imageTemp.src);
				}
				context.globalAlpha = imageTemp.m_Opacity;

				context.drawImage(imageTemp, left, top, picWidth, picHeight);
				imageTemp.bRendered = true;

				// as soon as an image is rendererd set the parent of the next to null
				if (imageTemp.m_Next != null) {
					imageTemp.m_Next.m_Prev = null;
				}
				imageTemp = imageTemp.m_Next;
			}

			// draw debug information on tile
			if (VBI.m_bTrace) {
				tmpFillStyle = context.fillStyle;
				context.fillStyle = "#FF0000";
				context.font = "18px Arial";
				context.fillText(image.m_nRequest + "." + image.m_nCount + ":" + image.m_nLOD + "/" + image.m_nReqX + "/" + image.m_nReqY + "@(" + (left / 256) + "," + (top / 256) + ")", left + 10, top + 30);
				context.fillStyle = tmpFillStyle;
			}
			// size it up again
			targetCanvas.setPixelWidth(canvasWidth);
			targetCanvas.setPixelHeight(canvasHeight);

			// raise the changed event
			if (targetCanvas.onTileLoaded) {
				targetCanvas.onTileLoaded(image);
			}
			context.globalAlpha = 1.0;

			mapmanager.CheckTmpCanvas(targetCanvas, image.m_nRequest, 0);
			if (currentScene.m_Ctx.moThumbnail) {
				currentScene.Copy2Thumbnail();
			}
		}
	};

	mapmanager.CheckTmpCanvas = function(targetCanvas, imgRequest, nTilesAbove) {
		//tries to fill the hidden canvas with tiles before displaying it
		if ((targetCanvas.m_nTilesBefSwitch != undefined) && (targetCanvas.m_nRequest == imgRequest) && !nTilesAbove) {
			targetCanvas.m_nTilesBefSwitch--;
			if (!targetCanvas.m_nTilesBefSwitch) {
				targetCanvas.m_Scene.SwitchTmpCanvasToActive();
			}
		}

	};

	// request the tiles
	mapmanager.RequestTiles = function(targetCanvas, maplayerstack, x, y, nx, ny, leftOffset, topOffset, rightOffset, bottomOffset, lod, bclear) {
		mapmanager.m_bRequestError = false;
		if (lod < 0) {
			return false;
		}
		var sc = targetCanvas.m_Scene;

		if (!maplayerstack || ((sc.AnimZoomTarget) && (Math.abs(sc.AnimZoomTarget - lod) > sc.m_nMaxAnimLodDiff))) { // - With an existing
			// animation target which is
			// too far away we skip
			// loading as otherwise
			// we would have to wait for all intermediate tiles after reaching target
			// - Without maplayerstack requesting is also not done
			targetCanvas.m_nCurrentX = x;
			targetCanvas.m_nCurrentY = y;
			targetCanvas.m_nCurrentLOD = lod;
			return false;
		}

		var nCount = 0;

		//Calculate XMax based on the YMax for a given ratio of X->Y for the current projection
		var nYMax = (1 << lod);
		var xyRatio = sc.m_Proj.m_nXYRatio;
		var nXMax = nYMax * xyRatio;

		var fTileSize = 2.0 / nYMax;

		if (bclear) {
			var context = targetCanvas.getContext("2d");
			context.fillStyle = 'white';
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		}

		var maplayerarray = maplayerstack.m_MapLayerArray;

		targetCanvas.m_nRequest = mapmanager.m_nRequest++;
		targetCanvas.m_bInvalid = false; // the request makes it valid

		// store current requested tile information in the canvas
		targetCanvas.m_nCurrentX = x;
		targetCanvas.m_nCurrentY = y;
		targetCanvas.m_nCurrentLOD = lod;

		var ni, nk, nYExpansion, nCurrentXExpansion = 1;
		var yCorr = y;

		//future: Adjust logic to account for m_bSingleBMP on maplayer level
		if (maplayerstack.m_bSingleBMP) {
			nk = 1;
			yCorr = Math.max(0, y);
			nYExpansion = Math.min(ny - topOffset - bottomOffset, nYMax - yCorr);
		} else {
			nk = ny - topOffset - bottomOffset;
			nYExpansion = 1;
		}

		var nLayerArrayLen = maplayerarray.length;
		ni = nx - leftOffset - rightOffset; // on LOD 0 and 1 there are less tiles
		for (var i = 0; i < ni; ++i) {
			nCurrentXExpansion--;
			if (!nCurrentXExpansion) { // we are no more part of an expanded tile
				for (var k = 0; k < nk; ++k) {
					nCount++;
					var imagePrev = null;
					var fillStyle = null;
					var nReqX = (x + leftOffset + i) % nXMax;
					if (nReqX < 0) {
						nReqX = nXMax + nReqX;
					}

					var nReqY = yCorr + topOffset + k;
					if ((nReqY + nYExpansion) <= 0 || nReqY >= nYMax) {
						if ((targetCanvas.m_nTilesBefSwitch != undefined) && (targetCanvas.m_nTilesBefSwitch > 0)) {
							targetCanvas.m_nTilesBefSwitch--;
						}
						continue;
					}
					nCurrentXExpansion = maplayerstack.m_bSingleBMP ? Math.min(nXMax - nReqX, ni - i) : 1;

					// iterate over all map providers
					for (var s = 0; s < nLayerArrayLen; ++s) {
						var maplayer = maplayerarray[s];

						// remember the maplayer fill style
						// to inherit the style when image chain gets shortened due to LOD limits
						if (maplayerstack.fillStyle) {
							fillStyle = maplayerstack.fillStyle;
						} else if (maplayerstack.m_colBkgnd) {
							fillStyle = maplayerstack.m_colBkgnd;
						}
						// create the chained list only in the vaild LOD range
						if ((maplayer.GetMinLOD() > lod) || (maplayer.GetMaxLOD() < lod)) {
							continue;
						}
						var image = new Image();

						// enhance image object
						image.m_nLayersAbove = nLayerArrayLen - s - 1;
						image.m_nXOrigin = x;
						image.m_nYOrigin = y;
						image.m_nCol = i + leftOffset; // remember column
						image.m_nRow = k + topOffset; // remember row
						image.m_numCol = nx; // remember column count
						image.m_numRow = ny; // remember row count
						image.m_Target = targetCanvas; // canvas to render into
						image.m_nRequest = targetCanvas.m_nRequest;
						// image.m_MapProvider = maplayer.GetMapProvider();
						image.m_Opacity = maplayer.m_fOpacity;
						image.m_bOutdated = false;

						// do image linkage
						// this leads to a uplink and downlink chain
						image.m_Prev = imagePrev;
						if (imagePrev != null) {
							imagePrev.m_Next = image;
						}
						// set the inherited fill style only when image is the chain root
						if (image.m_Prev == null) {
							image.m_FillStyle = fillStyle;
						}

						image.m_nReqX = nReqX;
						image.m_nReqY = nReqY;
						image.m_nXExpansion = nCurrentXExpansion;
						image.m_nYExpansion = nYExpansion;
						image.m_nLOD = lod;

						var mapProv = maplayer.GetMapProvider();
						var url;

						if (mapProv.m_bPosRequired) {
							var leftupper = [nReqX * fTileSize / xyRatio - 1, nReqY * fTileSize - 1];
							var rightlower = [(nReqX + nCurrentXExpansion) * fTileSize / xyRatio - 1, (nReqY + nYExpansion) * fTileSize - 1];
							// VBI.Trace("Requesting "+nReqX+","+nReqY+" with Extension "+nCurrentXExpansion+". Coordinates :
							// "+leftupper[0]+"-->"+rightlower[0]+","+rightlower[1]);
							url = mapProv.CombineUrlWPos(nReqX, nReqY, lod, fTileSize, leftupper, rightlower, nCurrentXExpansion, nYExpansion, mapmanager.m_requestTileWidth, mapmanager.m_requestTileHeight);
						} else {
							url = mapProv.CombineUrl(nReqX, nReqY, lod);
						}

						image.onload = mapmanager.onLoad;
						image.onerror = mapmanager.onError;
						image.onabort = mapmanager.onAbort;

						//If the provider has headers defined, then we must use the HTTP Request approach
						//as it is possible that the application provided an image via the URL callback, we check for a data url before proceeding with the HTTP Request creation
						if (mapProv.m_Headers && url.substring(0, 5).toLowerCase() != "data:") {
							image.m_Headers = mapProv.m_Headers;
							image.src2execute = url; //store the URL in case the request ends up being queued
							mapmanager._createHttpRequest(image);
						} else if ((mapmanager.m_runningRequests < mapmanager.m_limitRequests) && (!mapmanager.m_bRequestError)) { //The request is for a URL only or it is a data URL
							try {
								mapmanager._modifyReqCounters(image, 1);
								image.src = url;
							} catch (e) {
								image.src2execute = url;
								mapmanager.m_requestQueue.push(image);
								mapmanager.onFailedSend(image);
							}
						} else {
							image.src2execute = url;
							mapmanager.m_requestQueue.push(image);
						}

						image.m_nCount = nCount;

						if (VBI.m_bTrace) {
							VBI.Trace("RequestTiles " + url);
						}
						// remember previous image
						imagePrev = image;
						// VBI.Trace("Requesting from origin ("+x+","+y+") m_col/row:("+lod+"/"+image.m_nCol+","+image.m_nRow+")
						// m_NumCol/Row:"+image.m_numCol+","+image.m_numRow+")\n");
					}
				}
			}
		}
		return true;
	};

	mapmanager.UnlinkImage = function(img) {
		var item;
		for (item = img.m_Prev; item; item = item.m_Prev) {
			item.m_bOutdated = true;
		}

		for (item = img.m_Next; item; item = item.m_Next) {
			item.m_bOutdated = true;
		}

		var curPrev = img.m_Prev;
		var curNext = img.m_Next;

		if (curPrev != null) {
			img.m_Prev.m_Next = curNext;
			img.m_Prev = null;
		}
		if (curNext != null) {
			img.m_Next.m_Prev = curPrev;
			img.m_Next = null;
		}
	};

	mapmanager.GetPreviewImage = function(lon, lat, lod, maplayerstack, scene, callback) {
		//extend layer configuration object with preview location object which is {lat, lon, lod}
		if (!callback || !maplayerstack || !lon || !lod || !lat || !scene) { //check that parameters are valid
			return;
		}

		var exactLod = Math.min(Math.max(lod, scene.GetMinLOD()), scene.GetMaxLOD()); // clamp [min lod...max lod]
		lod = Math.floor(exactLod); //avoid fractional lod

		var tileWidth = scene.m_MapManager.m_tileWidth; //get proper tile width
		var tileHeight = scene.m_MapManager.m_tileHeight; //get proper tile height
		var xyRatio = scene.m_Proj.m_nXYRatio; //ratio from  current projection
		var lodDistance = (1 << lod); //how many tiles on a particular lod?
		var tileSize = 2.0 / lodDistance; //???
		var lonlat = VBI.MathLib.DegToRad([parseFloat(lon), parseFloat(lat)]); //from degrees to radians
		var uxy = [lodDistance * tileWidth, lodDistance * tileHeight]; //prepare conversion from lat,lon
		scene.m_Proj.LonLatToUCS(lonlat, uxy); // to User Coordinate System (pixel space of a target lod)
		var x = Math.floor(uxy[0] / tileWidth); // calculate X tile coordinate
		var y = Math.floor(uxy[1] / tileHeight); //calculate Y tile coordinate

		var mapLayerArray = maplayerstack.m_MapLayerArray;

		var context = {
			m_Callback: callback,
			m_Images: [],
			m_ImagesRemain: mapLayerArray.length,
			m_MapLayerStack: maplayerstack,

			compose: function() {
				this.m_ImagesRemain -= 1;

				if (this.m_ImagesRemain <= 0) { //all images processes (succeeded, failed or aborted)
					//create canvas to store image
					var canvas = document.createElement('canvas');
					context = canvas.getContext('2d');

					var background = this.m_MapLayerStack.m_colBkgnd;
					context.fillStyle = background; //respect background colour
					context.fillRect(0, 0, canvas.width, canvas.height);

					for (var i = 0; i < this.m_Images.length; ++i) {
						if (this.m_Images[i]) { //skip failed images

							// respect transparency
							context.globalAlpha = this.m_Images[i].m_Opacity;

							// X and Y Starting positions of the clipping
							var clipPosX = 0;
							var clipPosY = 0;

							// Portion of image you want to clip.
							var clipWidth = this.m_Images[i].width;
							var clipHeight = this.m_Images[i].height;

							//	Draw image onto canvas
							var offsetX = 0;
							var offsetY = 0;

							// Scale to stretch
							var stretchX = canvas.width;
							var stretchY = canvas.height;

							// Draw image based on measurments
							context.drawImage(this.m_Images[i], clipPosX, clipPosY, clipWidth, clipHeight, offsetX, offsetY, stretchX, stretchY); //draw image to canvas
						}
					}
					var tileImages = new Image();
					// convert into image
					tileImages.src = canvas.toDataURL();
					callback(tileImages);
				}
			}
		};

		var onImageLoad = function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("onLoad " + event.target.src);
			}
			var image = event.target;

			//If the request was xhr then we need to revoke the blob data url once loaded
			if (image.m_Headers) {
				(window.URL || window.webkitURL).revokeObjectURL(image.src);
			}
			image.m_Context.compose();
		};

		var onImageAbort = function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("onAbort " + event.target.src);
			}
			var image = event.target;
			image.m_Context.m_Images[image.m_Index] = null;
			image.m_Context.compose();
		};

		var onImageError = function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("onError " + event.target.src);
			}
			var image = event.target;
			image.m_Context.m_Images[image.m_Index] = null;
			image.m_Context.compose();
		};

		for (var i = 0; i < mapLayerArray.length; ++i) {
			var layer = mapLayerArray[i];
			var provider = layer.GetMapProvider();

			if (layer.GetMinLOD() > lod || layer.GetMaxLOD() < lod) { //skip if provider doesn't support required lod
				continue;
			}
			var url;

			if (provider.m_bPosRequired) {
				var leftUpper = [x * tileSize / xyRatio - 1, y * tileSize - 1];
				var rightLower = [(x + 1) * tileSize / xyRatio - 1, (y + 1) * tileSize - 1];
				url = provider.CombineUrlWPos(x, y, lod, tileSize, leftUpper, rightLower, 1, 1, tileWidth, tileHeight);
			} else {
				url = provider.CombineUrl(x, y, lod);
			}
			var image = new Image();
			image.setAttribute('crossOrigin', 'anonymous');
			context.m_Images[i] = image;
			image.m_Index = i;
			image.m_Context = context;

			if (layer.m_fOpacity) {
				image.m_Opacity = layer.m_fOpacity;
			}

			image.onload = onImageLoad;
			image.onabort = onImageAbort;
			image.onerror = onImageError;

			try {
				if (provider.m_Headers && url.substring(0, 5).toLowerCase() != "data:") {
					//Handle requests that require headers
					image.m_Headers = provider.m_Headers;
					image.src2execute = url;
					mapmanager._createHttpRequest(image, true);
				} else {
					image.src = url;
				}
			} catch (ex) {
				if (VBI.m_bTrace) {
					VBI.Trace("GetPreviewImage " + ex);
				}
				image.m_Context.m_Images[image.m_Index] = null;
				image.m_Context.compose();
			}
		}
	};

	/**
	 * Helper function used to create and manage HTTP request objects
	 *
	 * @private
	 * @param {Image} image - Image object to use for request
	 * @param {boolean} preview - True if image is requested for preview.
	 */
	mapmanager._createHttpRequest = function(image, preview) {
		if (preview || mapmanager.m_runningXhrRequests < mapmanager.m_limitRequests) { // 'preview' images not restricted
			if (!preview) { // modify counter only if it is not a 'preview' image
				mapmanager._modifyReqCounters(image, 1);
			}
			//Make a xhr request promise
			var oXMLHttpRequest = (typeof window.sinon === "object" && window.sinon.xhr && window.sinon.xhr.XMLHttpRequest) ? window.sinon.xhr.XMLHttpRequest : XMLHttpRequest;
			var xhr = new oXMLHttpRequest();
			xhr.m_Image = image;

			xhr.onerror = function(event) {
				// onerror event caters for events such as CORS errors
				if (this.m_Image && this.m_Image.onerror) {
					this.m_Image.onerror({
						srcElement: this.m_Image, // in case of a normal image
						target: this.m_Image // in case of a 'preview' image
					});
				}
				jQuery.sap.log.error("Download error: " + this.statusText);
			}

			if (!preview) { // skip for 'preview' images as they cannot be outdated
				//If the mapmanager has decided the image is outdated then abort loading
				xhr.onprogress = function(event) {
					if (this.m_Image && this.m_Image.m_bOutdated) {
						this.abort();
						this.m_Image.onabort({
							srcElement: this.m_Image
						});
						jQuery.sap.log.error("Download error: image outdated");
					}
				}
			}

			xhr.onload = function(event) {
				// When file is loaded from a Cordova container the status equals 0
				if (this.status === 200 || this.status === 0) {
					var contentType = this.getResponseHeader("Content-Type");
					if (contentType.split("/")[0] == "image") {
						this.m_Image.src = (window.URL || window.webkitURL).createObjectURL(this.response);
					} else {
						this.m_Image.onerror({
							srcElement: this.m_Image, // in case of a normal image
							target: this.m_Image // in case of a 'preview' image
						});
						jQuery.sap.log.error("Download error: image response type expected. Recieved: " + contentType);
					}
				} else {
					// onload event is also called in the case of status code 404 Not Found.
					// This is why we have to check for the right status. If the status is not
					// something that indicates success, we fire the fireItemFailed event.
					if (preview) {
						this.m_Image.onerror({
							target: this.m_Image // in case of a 'preview' image
						});
					} else {
						if (this.m_Image && !this.m_Image.m_bOutdated) {
							mapmanager.m_requestQueue.push(this.m_Image);
						}
						mapmanager.onFailedSend(this.m_Image);
					}
					jQuery.sap.log.error("Download error: " + this.statusText);
				}
			};

			xhr.open("GET", image.src2execute, true);

			//Add headers array to the request
			image.m_Headers.forEach(function(header) {
				xhr.setRequestHeader(header.name, header.value);
			});

			xhr.responseType = "blob";
			xhr.send(null);
		} else {
			mapmanager.m_requestQueue.push(image);
			return;
		}
	};

	return mapmanager;
})();

});
