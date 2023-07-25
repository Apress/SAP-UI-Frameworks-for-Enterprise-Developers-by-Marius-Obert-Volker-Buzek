/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./Command",
	"../IncludeUsageIdType"
], function(
	Command,
	IncludeUsageIdType
) {
	"use strict";

	var TotaraUtils = {};

	// Create a string in Streaming Protocol format `command[len]{...}` to pass as a `request` parameter to the
	// `streaming-http` endpoint.
	TotaraUtils.createCommand = function(commandName, parameters) {
		var requestCommandContent = JSON.stringify(parameters);
		return commandName + ("[" + requestCommandContent.length + "]") + requestCommandContent;
	};

	// Create a message to pass from TotaraLoader to TotaraLoaderWorker.
	// Includes a `request` parameter created by `createCommand`, the name of the command and flag `isInitial`.
	TotaraUtils.createRequestCommand = function(commandName, parameters, isInitial) {
		return {
			command: TotaraUtils.createCommand(commandName, parameters),
			method: commandName,
			isInitial: isInitial === true
		};
	};

	// Create a REST API request to pass from TotaraLoader to TotaraLoaderWorker.
	TotaraUtils.createRequest = function(commandName, parameters, isInitial) {
		return {
			method: commandName,
			parameters: parameters,
			isInitial: isInitial === true
		};
	};

	function ProgressLogger(id, context, totaraLoader) {

		if (!id || !context || !totaraLoader) {
			throw "ProgressLogger: invalid args";
		}

		this.context = context;
		this.loader = totaraLoader;

		var tokens = new Set();

		this.logPerformance = function(name, token) {

			if (!name || !token) {
				return;
			}

			tokens.add(token);

			var options = {
				name: name,
				timestamp: Date.now(),
				token: token
			};

			var message = {
				method: Command.addClientLog,
				url: this.loader.getUrl(),
				token: context.token,
				command: TotaraUtils.createCommand(Command.addClientLog, options)
			};

			this.loader.postMessage(message);
		};

		this.getTokens = function() {
			return tokens;
		};

		this.logPerformanceTiming = function(measureList, pUuid) {
			var that = this;
			measureList.sort(function(a, b) {
				return a.timestamp - b.timestamp;
			});
			if (!measureList.length) {
				return;
			}
			tokens.add(context.token);
			// group measure list to small chunk
			var measureListArray = [];
			while (measureList.length) {
				measureListArray.push(measureList.splice(0, 10));  // pick 10 measure element
			}
			measureListArray.forEach(function(measureListElement) {
				var options = {
					records: [],
					timestamp: Date.now()
				};
				measureListElement.forEach(function(perf) {
					options.records.push({
						name: perf.name,
						timestamp: perf.timestamp,
						uuid: perf.uuid,
						duration: perf.duration,
						value: perf.value,
						/* eslint-disable camelcase */
						parent_uuid: pUuid // storage service required this`parent_uuid` key
						/* eslint-enable camelcase */
					});
				});

				var commandStr = TotaraUtils.createCommand(Command.performanceTiming, options);
				that.loader.postPerformanceTiming({
					method: Command.performanceTiming,
					url: that.loader.getUrl(),
					token: context.token,
					command: commandStr
				});
			});
		};
	}

	TotaraUtils.mark = function(tag) {
		window.performance.mark(tag);
	};

	// measure startTag to endTag/now
	TotaraUtils.measure = function(name, startTag, endTag) {
		var perf = window.performance;
		if (performance.getEntriesByName(startTag).length !== 0) {
			if (!endTag) {
				perf.measure(name, startTag);
			} else {
				perf.measure(name, startTag, endTag);
			}
		}
		perf.clearMarks(startTag);
		if (endTag) { perf.clearMarks(endTag); }
		perf.clearMeasures(name);
	};

	TotaraUtils.perfObserve = function(context) {
		if (!window.PerformanceObserver) {
			return;
		}
		var _perfList = [];
		var sceneMeasureUuid;  // used for parent uuid
		var startTimestamp = performance.timing.navigationStart;
		// observe the performance list
		var perfObserver = new window.PerformanceObserver(function(list) {
			// process the new add performance event
			list.getEntries().forEach(function(entry) {
				entry.uuid = TotaraUtils.generateToken();
				// set timestamp to mark time
				entry.timestamp = startTimestamp + entry.startTime;
				if (entry.name === "sceneMeasure") { sceneMeasureUuid = entry.uuid; }
				_perfList.push(entry);
			});

			if (_perfList.find(function(perf) {
				return perf.name === "sceneCompleted";
			})) {
				TotaraUtils.measure("sceneMeasure", "modelRequested", "sceneCompleted");
			}

			if (sceneMeasureUuid) {
				_perfList = _perfList.filter(
					function(perf) {
						return perf instanceof PerformanceMeasure;
					});
				context.progressLogger.logPerformanceTiming(_perfList, sceneMeasureUuid);
				sceneMeasureUuid = "";
			}
		});
		perfObserver.observe({ entryTypes: ["mark", "measure"] });
	};

	TotaraUtils.createLogger = function(id, context, connector) {
		if (!context) {
			return null;
		}

		context.progressLogger = new ProgressLogger(id, context, connector);
		TotaraUtils.perfObserve(context);
		return context.progressLogger;
	};

	TotaraUtils.base64ToUint8Array = function(base64) {
		var binaryString = atob(base64);
		var len = binaryString.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes;
	};

	// arr --> content deliver service transform
	TotaraUtils.arrayToColumnMajorMatrixArray16 = function(arr) {
		if (arr.length === 16) {
			return [arr[0], arr[4], arr[8], arr[12], arr[1], arr[5], arr[9], arr[13], arr[2], arr[6], arr[10], arr[14], arr[3], arr[7], arr[11], arr[15]];
		}

		if (arr.length === 12) {
			return [arr[0], arr[3], arr[6], arr[9], arr[1], arr[4], arr[7], arr[10], arr[2], arr[5], arr[8], arr[11], 0.0, 0.0, 0.0, 1.0];
		}

		if (arr.length === 3) {
			return [1, 0, 0, arr[0],
				0, 1, 0, arr[1],
				0, 0, 1, arr[2],
				0, 0, 0, 1];
		}

		return null;
	};

	TotaraUtils.pushElementIntoMapArray = function(map, key, elem) {
		var array = map.get(key);
		if (!array) {
			array = [];
			map.set(key, array);
		} else if (array.length > 0 && array[array.length - 1] === elem) {
			return; // the last array element matches the new element
		}
		array.push(elem);
	};

	TotaraUtils.generateToken = function() {
		return guid();
	};

	// TODO: change to something else?
	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
			s4() + "-" + s4() + s4() + s4();
	}

	var default$select = [
		"annotationId",
		"closed",
		"contentType",
		"entityId",
		"highlightStyleId",
		"materialId",
		"meshId",
		"name",
		"opacity",
		"renderOrder",
		"renderStage",
		"transform",
		"visible",
		"selectable"
	];

	var default$expand = [
		"annotation",
		"bounds",
		"meshes",
		"box",
		"highlight",
		"nodes"
	];

	var defaultContentTypes = [
		"annotation",
		"drawing",
		"geometry",
		"hotspot",
		"reference",
		"sectionplane",
		"solid",
		"symbol",
		"unknown"
	];

	/**
	 * Configure query parameters for endpoint <code>/scenes/{sceneId}/views/{viewId}</code>.
	 *
	 * @param {sap.ui.vk.totara.SceneContext} context The loader context with options based on which
	 *        the parameters for <code>/scenes/{sceneId}/views/{viewId}</code> are configured.
	 * @returns {object} A JSON like structure with parameters <code>$select</code>,
	 *          <code>$expand</code> and <code>contentTypes</code>.
	 * @private
	 */
	TotaraUtils.configureSceneViewQuery = function(context) {
		// Create copies of arrays with default values in order not to overwrite the original arrays.
		var $select = default$select.slice();
		var $expand = default$expand.slice();
		var contentTypes = defaultContentTypes.slice();

		if (context.includeAnimation) {
			$expand.push("animation");
		}

		if (context.includeBackground) {
			contentTypes.push("background");
		}

		if (context.includeParametric) {
			$expand.push("parametric");
			contentTypes.push("parametric");
		}

		if (context.includeUsageId) {
			$expand = $expand.concat(IncludeUsageIdType.to$expandQueryParameter(context.includeUsageId));
		}

		if (context.pushPMI) {
			contentTypes.push("pmi");
			// NB: We do not add `pmi` to the $expand parameter yet as we do not process semantic PMI info.
		}

		var query = {
			$select: $select.join(","),
			$expand: $expand.join(","),
			contentTypes: contentTypes.join(","),
			hidden: context.includeHidden
		};

		if (context.metadataFilter != null) {
			query.metadataFilter = context.metadataFilter;
		}

		return query;
	};

	return TotaraUtils;
});
