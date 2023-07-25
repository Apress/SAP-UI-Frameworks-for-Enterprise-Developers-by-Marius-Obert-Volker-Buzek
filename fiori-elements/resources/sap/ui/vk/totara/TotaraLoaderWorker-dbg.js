/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

(function() {
	"use strict";

	var methodPriority = {};
	[
		"initializeConnection",
		"getScene",
		"getGeomMesh",
		"getAnnotation",
		"getMaterial",
		"getImage",
		"getView"
	].reverse().forEach(function(name, index) {
		methodPriority[name] = index;
	});

	var tileWidths = new Map();

	// URL used for requests that can be cached - api/storage/v1/
	// Used to get geometries, images, thumbnails.
	var url;

	// Correlation ID can be used to trace calls from web browser apps through backend services within one session.
	var correlationId;

	// Access tokens are used when web browser apps do not use approuter. When approuter is used the
	// access token is maintained by approuter and cookie `JSESSIONID` is used between the web app and
	// approuter. If there is an access token it is passed to the server in the Authorization header.
	var authorizationHeaderValue;

	// When authorization is used the application can assign a tenant UUID. Usually the tenant UUID is returned in
	// Access Token Response from the authorization handler executed in the main thread by TotaraLoader.
	var tenantUuidHeaderValue;

	// When this thread receives commands from the UI thread it does not execute them immediately. If there are many
	// active request the web browser will not execute them in parallel anyway. Also, we may want execute some
	// request out of order. So, we use a priority queue and execute in parallel only `maxActiveRequests` requests.
	// Otherwise, if the application also needs to download its own stuff we may end up in a situation when we
	// download 3D content but not scripts and styles for the application itself, and it will looks like the
	// application hung up.
	var requestQueue = [];

	// A number of requests we execute in parallel. See the comment for `requestQueue`.
	var maxActiveRequests = 4;

	// A number of currently running parallel requests, not the number of requests in `requestQueue`. When a
	// request is taken from `requestQueue` this counter is incremented, when the request finishes (succeeds or
	// fails) the counter is decremented, and if the counter falls below `maxActiveRequests` and `requestQueue` is
	// not empty another request is taken from the queue for execution.
	var activeRequestCount = 0;

	/**
	 * Queue a request and execute it whenever possible based on its priority.
	 *
	 * @param {string}   request      A REST API endpoint.
	 * @param {object}   data         The <code>data</code> object sent by TotaraLoader from the UI thread. Used by
	 *                                <code>onResponse</code> callback and used to determine the request priority.
	 * @param {string}   responseType A type the response must be returned in.
	 * @returns {Promise} A promise that resolves or rejects when this request finishes.
	 */
	function sendRequest(request, data, responseType) {
		return new Promise(function(resolve, reject) {
			requestQueue.push({
				url: url + request,
				context: data,
				priority: methodPriority[data && data.method] || 0,
				responseType: responseType,
				resolve: resolve,
				reject: reject
			});

			if (activeRequestCount < maxActiveRequests) {
				processNextRequest();
			}
		});
	}

	/**
	 * Process queued requests.
	 *
	 * First, sort the requests by priority then start fetching the requests from the queue and execute.
	 */
	function processNextRequest() {
		if (!requestQueue.length) {
			return;
		}

		requestQueue.sort(function(a, b) {
			return a.priority - b.priority;
		});

		var request = requestQueue.pop();
		activeRequestCount++;

		executeRequest(encodeURI(request.url), request.responseType)
			.then(function(response) {
				request.resolve(response);
				activeRequestCount--;
				processNextRequest();
			}).catch(function(reason) {
				reportError({
					errorText: "Could not connect to server: " + url,
					error: reason.status,
					reason: reason.message ? reason.message : reason,
					context: request.context
				});
				if (request.reject) {
					request.reject(reason);
				}
				activeRequestCount--;
				processNextRequest();
			});
	}

	/**
	 * Send the request to the server.
	 *
	 * @param {string} url A REST API endpoint to call.
	 * @param {string} [responseType] An optional type of the response. If omitted the type is `arraybuffer`.
	 * @returns {Promise} A promise which is resolved or rejected when the request finishes.
	 */
	function executeRequest(url, responseType) {
		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();

			xhr.onload = function() {
				if (this.status >= 200 && this.status < 300) {
					if (this.getAllResponseHeaders().includes("tile-width")) {
						var tileWidth = this.getResponseHeader("tile-width");
						var re = new RegExp("[^\/]+$");
						var imageId = this.responseURL.match(re); // Get imageId from end of URL
						tileWidths.set(imageId[0], tileWidth);
					}
					resolve(this.response);
				} else {
					reject({
						status: this.status,
						statusText: this.statusText
					});
				}
			};

			xhr.onerror = function() {
				reject({
					status: this.status,
					statusText: this.statusText
				});
			};

			xhr.open("GET", url, true);
			if (authorizationHeaderValue) {
				xhr.setRequestHeader("Authorization", authorizationHeaderValue);
			}
			if (tenantUuidHeaderValue) {
				xhr.setRequestHeader("X-TenantUuid", tenantUuidHeaderValue);
			}
			xhr.setRequestHeader("X-CorrelationID", correlationId);
			xhr.responseType = responseType || "arraybuffer"; // It would be nice to use `json` but IE does not support it.
			xhr.send();
		});
	}

	/**
	 * Extract a UTF8 string from a binary buffer and convert it to a JavaScript string.
	 *
	 * The range of bytes <code>[start, end)</code> includes the first index and excludes the second one. So the length
	 * of the range is <code>end - start</code>.
	 *
	 * @function utf8ToString
	 * @param {ArrayBuffer} arrayBuffer A binary buffer containing a UTF8 string.
	 * @param {int}         start       An index of the first byte of the UTF8 string.
	 * @param {int}         end         An index of the byte following the last byte of the UTF8 string.
	 * @returns {string} A JavaScript string converted from a UTF8 string.
	 */
	var utf8ToString = "TextDecoder" in self
		? (function() {
			var utf8Decoder = new TextDecoder();
			return function(arrayBuffer, start, end) {
				return utf8Decoder.decode(new DataView(arrayBuffer, start, end - start));
			};
		})()
		: function(arrayBuffer, start, end) {
			var encodedString = "";
			// If arrayBuffer is too long, the stack runs out of space in String.fromCharCode.apply,
			// so batch it in a certain size.
			var MAX_CHUNK_SIZE = 1000; // arbitrary number here, not too small, not too big
			try {
				while (start < end) {
					var chunkSize = Math.min(MAX_CHUNK_SIZE, end - start);
					var uint8Array = new Uint8Array(arrayBuffer, start, chunkSize); // This does not create a copy of data, this is just a view inside `arrayBuffer`.
					encodedString += String.fromCharCode.apply(null, uint8Array);
					start += chunkSize;
				}
			} catch (e) {
				return "";
			}
			return decodeURIComponent(escape(encodedString));
		};

	/**
	 * Parse strings with one or two numbers separated by comma.
	 *
	 * The first number is the length of the JSON content, the second number, if any, is the length of the binary
	 * content.
	 *
	 * - <code>"123"</code>     -> <code>{ jsonContentLength: 123, binaryContentLength: 0   }</code>
	 * - <code>"123,456"</code> -> <code>{ jsonContentLength: 123, binaryContentLength: 456 }</code>
	 *
	 * @param {string} contentLengthsString One or two numbers separated by comma.
	 * @returns {object} An object with two properties <code>{ jsonContentLength: 123, binaryContentLength: 456 }</code>.
	 */
	function getContentLengths(contentLengthsString) {
		var list = contentLengthsString.split(",");

		if (list.length < 0 || list.length > 2) {
			throw "invalid content length";
		}

		var jsonContentLength = 0;
		var binaryContentLength = 0;

		try {
			jsonContentLength = parseInt(list[0], 10);

			if (list.length === 2) {
				binaryContentLength = parseInt(list[1], 10);
			}

		} catch (e) {
			throw "invalid content length";
		}

		return {
			jsonContentLength: jsonContentLength,
			binaryContentLength: binaryContentLength
		};
	}

	/**
	 * Parse arrayBuffer into a list of protocol commands with payloads.
	 *
	 * @param {ArrayBuffer} arrayBuffer Contains multiple commands in the following format:                                                   <br/>
	 *                                  <code>COMMAND[JSONLENGTH,BINARYLENGTH]{JSON}BINARY</code>                                             <br/>
	 *                                  or                                                                                                    <br/>
	 *                                  <code>COMMAND[JSONLENGTH]{JSON}</code>                                                                <br/>
	 *                                  where                                                                                                 <br/>
	 *                                  <code>JSONLENGTH</code> is the length in bytes of the JSON payload including {} in the UTF-8 encoding,<br/>
	 *                                  <code>BINARYLENGTH</code> is the length of the binary payload immediately following the JSON payload. <br/>
	 *                                  Multiple commands can optionally be delimited by newlines (\n) or spaces (' ').
	 * @param {boolean} isInitial       Specifies whether the commands are part of the initialView loading.
	 * @returns {objects[]}             An array of objects with the following properties:
	 *                                  <ul>
	 *                                      <li>name: string</li>
	 *                                      <li>jsonString: JSON string</li>
	 *                                      <li>binaryContent: ArrayBuffer</li>
	 *                                  </ul>
	 * @private
	 */
	function parseCommands(arrayBuffer, isInitial) {
		var bracketOpen = "[".charCodeAt(0);
		var bracketClose = "]".charCodeAt(0);

		var commandList = [];

		var start = 0;
		var end = 0;

		var contentLengths;
		var jsonString;
		var binaryContent;

		var uint8Array = new Uint8Array(arrayBuffer); // This is not a copy, this is just a view into arrayBuffer.

		while (end < arrayBuffer.byteLength) {
			end = uint8Array.indexOf(bracketOpen, start);

			if (end === -1) {
				// Could not locate open bracket '['. So, no more commands.
				break;
			}

			// Get the command name and remove possible whitespaces.
			// The streaming protocol allows multiple commands in one message separated by whitespaces,
			// so, the second and subsequent commands might start with whitespaces.
			var commandName = utf8ToString(arrayBuffer, start, end).replace(/\n|\r|\s/g, "");
			start = end + 1;

			end = uint8Array.indexOf(bracketClose, start);

			if (end === -1) {
				throw "No matching [] for command length. abort";
			}

			contentLengths = getContentLengths(utf8ToString(arrayBuffer, start, end));

			start = end + 1;
			end = start + contentLengths.jsonContentLength;

			jsonString = utf8ToString(arrayBuffer, start, end);

			// binary content is optional atm
			if (contentLengths.binaryContentLength) {
				start = end;
				end = start + contentLengths.binaryContentLength;

				binaryContent = new Uint8Array(arrayBuffer, start, contentLengths.binaryContentLength);
			} else {
				binaryContent = undefined;
			}

			start = end;

			var command = {
				name: commandName,
				jsonString: jsonString,
				isInitial: isInitial
			};

			if (binaryContent) {
				command.binaryContent = binaryContent;
			}

			commandList.push(command);
		}

		return commandList;
	}

	/**
	 * Process commands returned from the server.
	 *
	 * Though we use REST API we convert the JSON payloads into Streaming Protocol commands. This will be re-factored
	 * later.
	 *
	 * Commands can be re-ordered. Commands are sent to the main thread to build the scene.
	 *
	 * @param {object[]} commandList Commands to execute.
	 */
	function processCommands(commandList) {
		var command;
		var setPlaybackCommandIndex = -1;
		var viewId, i;
		var needAddIdToSetView = false;
		var afterSetViewCommand = false;
		var setPlaybackAfterSetSequence = false;
		for (i = 0; i < commandList.length; i++) {
			command = commandList[i];
			if (command.name === "setView") {
				if (!needAddIdToSetView) {
					if (!command.jsonContent.viewId) {
						needAddIdToSetView = true;
					}
				}
				afterSetViewCommand = true;
			} else if (command.name === "setViewNode") {
				if (viewId === undefined) {
					viewId = command.jsonContent.viewId;
				}
			} else if (command.name === "setSequence" && afterSetViewCommand) {
				setPlaybackAfterSetSequence = true;
			}
		}

		if (viewId && needAddIdToSetView) {
			for (i = 0; i < commandList.length; i++) {
				command = commandList[i];
				if (command.name === "setView") {
					command.jsonContent = {
						viewId: viewId
					};
					break;
				}
			}
		}

		for (i = 0; i < commandList.length; i++) {
			command = commandList[i];
			if (command.name === "setPlayback" && setPlaybackAfterSetSequence) {
				setPlaybackCommandIndex = i;
				continue;
			}
			if (command.name === "setImage") {
				var imageId = command.jsonContent.id;
				var tileWidth = imageId ? tileWidths.get(imageId) : null;
				if (tileWidth) {
					command.jsonContent.tileWidth = tileWidth;
				}
			}

			// We only handle setScene when it's response of getScene,
			// where we get default view and viewGroup information, and proceed to get views.
			// setScene could also be part of response for getTree command,
			// as we only use getTree command for partial tree retrieval, no need to get view,
			// so setScene is ignored.
			if (command.name === "setScene" && commandList.length > 1) {
				continue;
			}
			processCommand(command);
		}

		if (setPlaybackCommandIndex !== -1) {
			command = commandList[setPlaybackCommandIndex];
			processCommand(command);
		}
	}

	/**
	 * Process a single command.
	 *
	 * Commands are sent for processing to the main thread.
	 *
	 * @param {object} command A command to send to the main thread.
	 */
	function processCommand(command) {
		if (command.binaryContent) {
			self.postMessage({
				name: command.name,
				jsonString: command.jsonString,
				jsonContent: command.jsonContent,
				binaryContent: command.binaryContent,
				isInitial: "isInitial" in command ? command.isInitial : false
			}, [command.binaryContent.buffer]);
		} else {
			self.postMessage({
				name: command.name,
				jsonString: command.jsonString,
				jsonContent: command.jsonContent,
				isInitial: "isInitial" in command ? command.isInitial : false
			});
		}
	}

	/**
	 * Convert a JSON like object to URL query.
	 *
	 * E.g.
	 * <pre>
	 * {
	 *     hidden: true,
	 *     $select: "name,transform,meshId",
	 *     $expand: "nodes,bounds,animation,parametric"
	 * }
	 * </pre>
	 * would be converted to string
	 * <pre>
	 * "hidden=true&$select=name,transform,meshId&$expand=nodes,bounds,animation,parametric"
	 * </pre>
	 *
	 * Properties with <code>null</code> or <code>undefined</code> values are ignored.
	 *
	 * @param {object} query An object with query parameters.
	 * @returns {string} A URL query in string representation.
	 */
	function queryToString(query) {
		var result = "";
		for (var prop in query) {
			if (query[prop] == null) {
				continue;
			}
			if (result.length !== 0) {
				result += "&";
			}
			result += prop + "=" + query[prop];
		}
		return result;
	}

	function sendGetScene(data) {
		// NB: parameter `sid=1` is a temporary hack not to retrieve the whole scene tree which can be huge; in future
		// we will add an explicit parameter for that purpose.
		var request = "scenes/" + data.sceneId + "?sid=1";
		sendRequest(request, data, "text")
			.then(function(response) {
				var json;
				try {
					json = JSON.parse(response);
				} catch (err) {
					reportError({
						errorText: "Failed to parse JSON"
					});
					return;
				}

				processCommands([{
					name: "setScene",
					jsonContent: json.scene
				}]);
			});
	}

	function sendGetView(data) {
		// Some scenes, e.g. symbols, do not have any views. So instead of calling `/scenes/{sceneId}/views/{viewId}`
		// we call `/scenes/{sceneId}` and convert the response as if it was returned by the former endpoint.
		var sceneId = data.parameters.sceneId;
		var viewId = data.parameters.viewId;
		var sids = data.parameters.sids;
		var isInitial = data.isInitial;
		var request = "scenes/" + sceneId;
		if (viewId) {
			request += "/views/" + viewId;
		}
		request += "?" + queryToString(data.parameters.query);
		if (sids && sids.length > 0) {
			request += "&sid=" + sids.join("&sid=");
		}

		// To simulate the streaming protocol command getTree for `CDS.update()`. Instead of the response chain
		// `setViewNode`, `notifyFinishedView` we will return commands `setTreeNode`, `notifyFinishedTree`.
		var isPartialTree = data.isPartialTree;

		sendRequest(request, data, "text")
			.then(function(response) {
				var json;
				try {
					json = JSON.parse(response);
				} catch (err) {
					reportError({
						errorText: "Failed to parse JSON"
					});
					return;
				}

				var commands = [];

				// NB: json.tree because the endpoint is `/scenes/{sceneId}`, not `/scenes/{sceneId}/views/{viewId}`.
				var view = viewId ? json.views[0] : json.tree;
				var nodes = view.nodes;
				delete view.nodes;

				var highlightStyles = json.highlightStyles;
				var annotations = json.annotations;
				var parametrics = json.parametrics;
				var textStyles = json.textStyles;
				var lineStyles = json.linestyles; // NB: sic! all lowercase `linestyles`, probably a typo.
				var fillStyles = json.fillstyles; // NB: sic! all lowercase `fillstyles`, probably a typo.
				var meshes = json.meshes;

				function updateStyleIds(parametric) {
					// NB: to avoid eslint warnings use `["some_id"]` style.

					if ("style" in parametric && textStyles) {
						parametric["style_id"] = textStyles[parametric.style].veid;
					}

					if ("stroke" in parametric && lineStyles) {
						parametric["stroke_id"] = lineStyles[parametric.stroke].veid;
					}

					if ("fill" in parametric && fillStyles) {
						parametric["fill_id"] = fillStyles[parametric.fill].veid;
					}
				}

				// When referenced objects are included in the same JSON payload as the referencing ones we replace
				// references by index with references by id. Sometimes there may be some exemptions due to historical
				// reasons, e.g. materialId, style_id.

				if (nodes) {
					// Nodes may reference highlight styles and parametrics by index.

					nodes.forEach(function(node) {
						if ("highlightStyle" in node && highlightStyles) {
							node.highlightStyleId = highlightStyles[node.highlightStyle].id;
						}

						if ("annotation" in node && annotations) {
							node.annotationId = annotations[node.annotation].id;
						}

						if ("parametric" in node && parametrics) {
							node.parametricId = parametrics[node.parametric].id;
						}
					});
				}

				if (parametrics) {
					// Parametrics may reference by index:
					//
					// - text styles ("style"/"style_id")
					// - line styles ("stroke"/"stroke_id")
					// - fill styles ("fill"/"fill_id")
					//
					// In practice, text styles are referenced by id. In all three cases 'by id' means 'by veid'.

					parametrics.forEach(function(parametric) {
						if ("shapes" in parametric) {
							parametric.shapes.forEach(updateStyleIds);
						} else {
							updateStyleIds(parametric);
						}
					});
				}

				commands.push({
					name: "suppressSendRequests",
					jsonContent: {
						sceneId: sceneId
					}
				});

				// There is not need to return `setView` as it will result in adding a new view. Also, there is no need
				// to return `setScene`. So, just skip it.
				if (!isPartialTree) {
					view.sceneId = sceneId;
					view.viewId = viewId;
					commands.push({
						name: "setView",
						jsonContent: view,
						isInitial: isInitial
					});
				}

				if (nodes) {
					commands.push({
						name: isPartialTree ? "setTreeNode" : "setViewNode",
						jsonContent: {
							sceneId: sceneId,
							viewId: viewId,
							nodes: nodes
						},
						isInitial: isInitial
					});
				}

				commands.push({
					name: isPartialTree ? "notifyFinishedTree" : "notifyFinishedView",
					jsonContent: {
						sceneId: sceneId,
						viewId: viewId
					},
					isInitial: isInitial
				});

				// NB: Materials are included in responses only for views with annotations. Processing the materials
				// here may lead to corrupted materials in the scene due to the current implementation of SceneBuilder
				// that does not expect that the same material can be processed more than one time. This needs to be
				// fixed later. For now, we do not process materials returned alongside the views. They will be
				// requested and processed later as references from annotations. DO NOT REMOVE THIS COMMENTED SECTION.
				// It will be re-factored later.
				//
				// NB: `setMaterial` should be called after `notifyFinishedView` to emulate the old implementation of
				// the streaming protocol, otherwise `SceneContext#_checkSceneCompletion` returns `true` too early.
				// This will be fixed in due time.
				// if (json.materials) {
				// 	commands.push({
				// 		name: "setMaterial",
				// 		jsonContent: {
				// 			sceneId: sceneId,
				// 			viewId: viewId,
				// 			materials: json.materials
				// 		},
				// 		isInitial: isInitial
				// 	});
				// }

				if (highlightStyles) {
					highlightStyles.forEach(function(highlightStyle) {
						highlightStyle.sceneId = sceneId;
						commands.push({
							name: "setHighlightStyle",
							jsonContent: highlightStyle,
							isInitial: isInitial
						});
					});
				}

				if (textStyles) {
					commands.push({
						name: "setTextStyle",
						jsonContent: {
							sceneId: sceneId,
							textStyles: textStyles
						},
						isInitial: isInitial
					});
				}

				if (lineStyles) {
					commands.push({
						name: "setLineStyle",
						jsonContent: {
							sceneId: sceneId,
							lineStyles: lineStyles
						},
						isInitial: isInitial
					});
				}

				if (fillStyles) {
					commands.push({
						name: "setFillStyle",
						jsonContent: {
							sceneId: sceneId,
							fillStyles: fillStyles
						},
						isInitial: isInitial
					});
				}

				if (parametrics) {
					commands.push({
						name: "setParametric",
						jsonContent: {
							sceneId: sceneId,
							parametrics: json.parametrics
						},
						isInitial: isInitial
					});
				}

				if (annotations) {
					commands.push({
						name: "setAnnotation",
						jsonContent: {
							sceneId: sceneId,
							annotations: annotations
						},
						isInitial: isInitial
					});
				}

				if (meshes) {
					commands.push({
						name: "allocateMeshBuffer",
						jsonContent: {
							sceneId: sceneId,
							meshes: meshes
						},
						isInitial: isInitial
					});
				}

				var animation = json.animation;

				if (animation && animation.sequences && animation.playbacks) {
					var jsonContent = {
						sceneId: sceneId,
						viewId: viewId,
						tracks: animation.tracks,
						sequences: animation.sequences
					};

					if (animation.joints) {
						jsonContent.joints = animation.joints;
					}

					commands.push({
						name: "setSequence",
						jsonContent: jsonContent,
						isInitial: isInitial
					});

					// Playbacks reference sequences by index but SceneContext.setPlayback expects references by id.
					animation.playbacks.forEach(function(playback) {
						var sequence = animation.sequences[playback.sequence];
						playback.sequenceId = sequence && sequence.id;
					});
					animation.playbacks = animation.playbacks.filter(function(playback) { return playback.sequenceId != null; }); // remove empty playbacks

					commands.push({
						name: "setPlayback",
						jsonContent: {
							sceneId: sceneId,
							viewId: viewId,
							playbacks: animation.playbacks
						},
						isInitial: isInitial
					});
				}

				commands.push({
					name: "unsuppressSendRequests",
					jsonContent: {
						sceneId: sceneId
					}
				});

				processCommands(commands);

				if (data.pushViewGroups) {
					sendGetViewGroups({
						method: "getViewGroups",
						parameters: {
							sceneId: sceneId
						}
					});
				}
			});
	}

	function sendGetViewAnimations(data) {
		var sceneId = data.parameters.sceneId;
		var viewId = data.parameters.viewId;
		var request = "scenes/" + sceneId + "/views/" + viewId + "/animations?" + queryToString(data.parameters.query);

		sendRequest(request, data, "text")
			.then(function(response) {
				var json;
				try {
					json = JSON.parse(response);
				} catch (err) {
					reportError({
						errorText: "Failed to parse JSON"
					});
					return;
				}

				processCommands([{
					name: "setPlayback",
					jsonContent: {
						sceneId: sceneId,
						viewId: viewId,
						playbacks: json.playbacks
					}
				}]);
			});
	}

	function sendGetViewGroups(data) {
		var sceneId = data.parameters.sceneId;
		var viewGroupId = data.parameters.viewGroupId;
		var request = "scenes/" + sceneId + "/viewGroups";
		if (viewGroupId) {
			request += "/" + viewGroupId;
		}

		sendRequest(request, data, "text")
			.then(function(response) {
				var json;
				try {
					json = JSON.parse(response);
				} catch (err) {
					reportError({
						errorText: "Failed to parse JSON"
					});
					return;
				}

				processCommands(
					json.groups.map(function(group) {
						return {
							name: "setViewGroup",
							jsonContent: group
						};
					})
				);
			});
	}

	function sendGetMaterial(data) {
		var sceneId = data.parameters.sceneId;
		var materialIds = data.parameters.materialIds;
		var ids = materialIds.map(function(materialId) { return "id=" + materialId; }).join("&");
		var request = "scenes/" + sceneId + "/materials?" + ids;

		sendRequest(request, data, "text")
			.then(function(response) {
				var json;
				try {
					json = JSON.parse(response);
				} catch (err) {
					reportError({
						errorText: "Failed to parse JSON"
					});
					return;
				}

				json.sceneId = sceneId;

				processCommands([{
					name: "setMaterial",
					jsonContent: json
				}]);
			});
	}

	function sendGetAnnotation(data) {
		var sceneId = data.parameters.sceneId;
		var annotationIds = data.parameters.annotationIds;
		var ids = annotationIds.map(function(annotationId) { return "id=" + annotationId; }).join("&");
		var request = "scenes/" + sceneId + "/annotations?" + ids;

		sendRequest(request, data, "text")
			.then(function(response) {
				var json;
				try {
					json = JSON.parse(response);
				} catch (err) {
					reportError({
						errorText: "Failed to parse JSON"
					});
					return;
				}

				json.sceneId = sceneId;

				processCommands([{
					name: "setAnnotation",
					jsonContent: json
				}]);
			});
	}

	function sendGetImage(data) {
		var request;
		if (data.materialId) {
			request = "scenes/" + data.sceneId + "/materials/" + data.materialId + "/images/" + data.imageId;
		} else if (data.viewId) {
			request = "scenes/" + data.sceneId + "/views/" + data.viewId + "/images/" + data.imageId;
		} else {
			// TODO: report error
			return;
		}
		sendRequest(request, data, "arraybuffer")
			.then(function(response) {
				processCommands([{
					name: "setImage",
					jsonContent: {
						sceneId: data.sceneId,
						id: data.imageId,
						isInitial: data.isInitial
					},
					binaryContent: new Uint8Array(response)
				}]);
			});
	}

	function sendGetGeomMeshes(data) {
		var request = "scenes/" + data.sceneId + "/meshes?ids=" + data.meshIds.join(",");
		sendRequest(request, data, "arraybuffer")
			.then(function(result) {
				var commandList = parseCommands(result);
				commandList.forEach(function(subCommand) {
					subCommand.jsonContent = {
						sceneId: data.sceneId
					};
				});
				processCommands(commandList);
			});
	}

	// This call is used to retrieve inner boxes only.
	function sendGetMeshes(data) {
		var request = "scenes/" + data.sceneId + "/meshes?ids=" + data.meshIds.join(",") + "&types=box";
		sendRequest(request, data, "arraybuffer")
			.then(function(result) {
				var commandList = parseCommands(result);
				commandList.forEach(function(subCommand) {
					subCommand.jsonContent = {
						sceneId: data.sceneId
					};
				});
				processCommands(commandList);
			});
	}

	function reportError(error) {
		self.postMessage({ name: "notifyError", jsonContent: error });
	}

	/**
	 * This is an entry point for messages sent to this thread by TotaraLoader from the main UI thread.
	 *
	 * The messages have the following payloads:
	 *
	 * <pre>
	 * totaraLoaderWorker.postMessage({
	 *     method: "someMethodName",
	 *     paramA: "someParameterA",
	 *     paramB: "someParameterB",
	 *     ...
	 *     command: "setXXX[123]{...}"
	 * });
	 * </pre>
	 *
	 * The only mandatory property in the payload is <code>method</code>.
	 *
	 * @function onmessage
	 * @param {MessageEvent} event                Event object.
	 * @param {object}       event.data           Data sent by TotaraLoader.
	 * @param {string}       event.data.method    A TotaraLoaderWorker method name to execute in this worker thread.
	 * @param {string}       [event.data.command] A command for the streaming endpoint in the Streaming Protocol format.
	 * @param {string}       [event.data.request] A request to a REST API endpoint.
	 */
	self.onmessage = function(event) {
		var data = event.data;
		switch (data.method) {
			////////////////////////////////////////////////////////////////////
			// Data commands
			case "getAnnotation": {
				sendGetAnnotation(data);
				break;
			}
			case "getGeomMesh": {
				sendGetGeomMeshes(data);
				break;
			}
			case "getMesh": {
				// This call is used to retrieve inner boxes only.
				sendGetMeshes(data);
				break;
			}
			case "getImage": {
				sendGetImage(data);
				break;
			}
			case "getMaterial": {
				sendGetMaterial(data);
				break;
			}
			case "getScene": {
				sendGetScene(data);
				break;
			}
			case "getView": {
				sendGetView(data);
				break;
			}
			case "getViewAnimations": {
				sendGetViewAnimations(data);
			}
			case "getViewGroups": {
				sendGetViewGroups(data);
				break;
			}
			////////////////////////////////////////////////////////////////////
			// Service commands
			case "initializeConnection": {
				url = data.url;
				correlationId = data.cid;
				maxActiveRequests = data.maxActiveRequests;
				break;
			}
			case "close": {
				self.close();
				break;
			}
			case "useAccessTokenResponse": {
				// Access Token Response structure is defined at
				// https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/.
				if (data.accessTokenResponse) {
					authorizationHeaderValue = data.accessTokenResponse.token_type + " " + data.accessTokenResponse.access_token;
					tenantUuidHeaderValue = data.accessTokenResponse.tenant_uuid;
				} else {
					authorizationHeaderValue = null;
					tenantUuidHeaderValue = null;
				}
				break;
			}
			case "setMaxActiveRequests": {
				maxActiveRequests = data.maxActiveRequests;
				break;
			}
			case "addClientLog": {
				// TODO: Implement a REST API endpoint.
				break;
			}
			default: {
				console.warn("Unknown TotaraLoader command: " + data.method); // eslint-disable-line no-console
				break;
			}
		}
	};
})();
