/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.matai.MataiLoader.
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Core",
	"sap/ui/base/ManagedObject",
	"../getResourceBundle",
	"../helpers/WorkerScriptLoader",
	"../DownloadManager"
], function(
	Log,
	core,
	ManagedObject,
	getResourceBundle,
	WorkerScriptLoader,
	DownloadManager
) {
	"use strict";

	var ProgressPhase = {
		FinishedTree: getResourceBundle().getText("SCENE_CONTEXT_FINISHED_TREE"),
		LoadingGeometries: getResourceBundle().getText("SCENE_CONTEXT_LOADING_GEOMETRIES"),
		LoadingTextures: getResourceBundle().getText("SCENE_CONTEXT_LOADING_TEXTURES"),
		LoadingModelViews: getResourceBundle().getText("SCENE_CONTEXT_LOADING_MODEL_VIEWS")
	};

	var MataiLoader = ManagedObject.extend("sap.ui.vk.matai.MataiLoader", {
		metadata: {
			library: "sap.ui.vk",
			events: {
				contentChangesProgress: {
					parameters: {
						source: "any",
						phase: "string",
						percent: "float"
					}
				},
				contentLoadingFinished: {
					parameters: {
						source: "any",
						node: "any"
					}
				}
			}
		}
	});

	var thisModule = MataiLoader.getMetadata().getName();

	function updateProgress(sceneBuilder, phase, count) {
		var progress = sceneBuilder._progress;
		progress.phase = phase;
		progress.count = count;
		var percentage = 40 + 60 * (progress.totalCount ? progress.count / progress.totalCount : 1);
		// console.log(progress.phase, percentage, progress.count, progress.totalCount);

		sceneBuilder._loader.fireContentChangesProgress({
			source: sceneBuilder._contentResource && sceneBuilder._contentResource.getSource(),
			phase: phase,
			percentage: Math.min(percentage, 100)
		});
	}

	var nextSceneBuilderId = 1;
	// sceneBuilderId -> { sceneBuilder, dependencyLoader, files, waitingCount }
	var sceneBuilders = new Map();

	var getWorker = (function() {
		var promise;
		return function() {
			return promise || (promise = new Promise(function(resolve, reject) {
				var worker = WorkerScriptLoader.loadScript(
					"sap/ui/vk/matai/MataiLoaderWorker.js",
					["sap/ui/vk/ve/matai.js"]
				);

				var OK = 0;
				var ERROR_FILE_NOT_FOUND = -1;
				var ERROR_WRONG_FILE_FORMAT = -2;
				var ERROR_PASSWORD_NOT_PROVIDED = -3;
				var ERROR_READING_FILE_FAILED = -4;
				var ERROR_BUILDING_SCENE_FAILED = -5;
				var ERROR_NO_DEFAULT_VIEW = -6;
				var ERROR_READING_GEOMETRY_FAILED = -7;
				var ERROR_READING_REFERENCED_FILE_FAILED = -8;

				function getErrorMessage(result) {
					var resourceBundle = getResourceBundle();
					switch (result) {
						case ERROR_FILE_NOT_FOUND: return resourceBundle.getText("LOADER_FILENOTFOUND");
						case ERROR_WRONG_FILE_FORMAT: return resourceBundle.getText("LOADER_WRONGFILEFORMAT");
						case ERROR_PASSWORD_NOT_PROVIDED: return resourceBundle.getText("LOADER_WRONGPASSWORD");
						case ERROR_READING_FILE_FAILED: return resourceBundle.getText("LOADER_ERRORREADINGFILE");
						case ERROR_BUILDING_SCENE_FAILED: return resourceBundle.getText("LOADER_FILECONTENT");
						case ERROR_NO_DEFAULT_VIEW: return resourceBundle.getText("LOADER_NODEFAULTVIEW");
						case ERROR_READING_GEOMETRY_FAILED: return resourceBundle.getText("LOADER_FILECONTENT");
						case ERROR_READING_REFERENCED_FILE_FAILED: return resourceBundle.getText("LOADER_ERRORREADINGREFERENCEDFILE");
						default: return resourceBundle.getText("LOADER_UNKNOWNERROR");
					}
				}

				function reportErrorAndFinishLoading(sceneBuilder, result, details) {
					var errorText = getErrorMessage(result);
					sceneBuilder._reject({ status: result, errorText: errorText });

					Log.error(errorText, details, thisModule);

					finishLoading(sceneBuilder, result);
				}

				function finishLoading(sceneBuilder, result) {
					Log.info("Matai loading finished");

					sceneBuilder.loadingFinished({ result: result });

					sceneBuilder._loader.fireContentLoadingFinished({
						source: sceneBuilder._contentResource,
						node: sceneBuilder._rootNode
					});

					// sceneBuilder.cleanup() will be called from ContentManager.destroyContent().
					sceneBuilder._loader = null;

					var sceneBuilderId = sceneBuilder._id;
					worker.postMessage({
						method: "destroyContext",
						args: { sceneBuilderId: sceneBuilderId }
					});

					sceneBuilders.delete(sceneBuilderId);
				}

				worker.onmessage = function(event) {
					var data = event.data;

					if (data.event === "runtimeCreated") {
						resolve(this);
						return;
					}

					var sceneBuilderId = data.sceneBuilderId;
					var context = sceneBuilders.get(sceneBuilderId);
					var sceneBuilder = context.sceneBuilder;

					if ("event" in data) {
						switch (data.event) {
							case "contextCreated":
								if (data.result === OK) {
									worker.postMessage({
										method: "loadFile",
										args: { sceneBuilderId: sceneBuilderId }
									});
								} else {
									reportErrorAndFinishLoading(sceneBuilder, data.result);
								}
								break;

							case "fileLoaded":
								if (data.result === OK) {
									if (context.waitingCount === 0) {
										// There are no more referenced files waiting to be loaded.
										worker.postMessage({
											method: "buildScene",
											args: { sceneBuilderId: sceneBuilderId }
										});
									}
								} else {
									reportErrorAndFinishLoading(sceneBuilder, data.result);
								}
								break;

							case "referencedFileLoaded":
								context.waitingCount -= 1;
								if (data.result !== OK) {
									// Report error, do not abort loading.
									Log.error(getErrorMessage(data.result), data.fileName, thisModule);
								}
								if (context.waitingCount === 0) {
									// There are no more referenced files waiting to be loaded.
									worker.postMessage({
										method: "buildScene",
										args: { sceneBuilderId: sceneBuilderId }
									});
								}
								break;

							case "referencedFileRequested":
								var dependencyLoader = context.dependencyLoader;
								if (dependencyLoader == null) {
									// Report error, do not abort loading.
									Log.error(getResourceBundle().getText("LOADER_NODEPENDENCYLOADER"), null, thisModule);
								} else {
									var fileName = data.fileName;
									var veId = data.veId;
									var veVersion = data.veVersion;
									var files = context.files;

									// The same file can be requested multiple times with different
									// or the same (veId, veVersion). This may happen if a file is
									// referenced by more than one file in case of hierarchical
									// shattered VDS files.

									var promise = files.get(fileName);
									if (promise == null) {
										// If it is the first reference to the file then load it by
										// `dependencyLoader`, otherwise use the result from the
										// first loading.
										promise = dependencyLoader.load(fileName);
										files.set(fileName, promise);
									}

									context.waitingCount += 1;

									promise.then(
										// onFulfilled
										function(response) {
											// context.waitingCount will be decremented when `loadReferencedFile`
											// finishes.
											var buffer = response.buffer;
											// We reset response.buffer so that the detached buffer is not passed to the
											// worker again, otherwise it will lead to an error.
											response.buffer = null;
											worker.postMessage({
												method: "loadReferencedFile",
												args: {
													sceneBuilderId: sceneBuilderId,
													buffer: buffer, // This can be null if onFulfilled is called the second time.
													fileName: fileName,
													veId: veId,
													veVersion: veVersion
												}
											}, buffer == null ? [] : [buffer]);
										},
										// onRejected
										function() {
											context.waitingCount -= 1;
											// Report error, do not abort loading.
											Log.error(getResourceBundle().getText("LOADER_ERRORREADINGREFERENCEDFILE"), fileName, thisModule);
											if (context.waitingCount === 0) {
												// There are no more referenced files waiting to be loaded.
												worker.postMessage({
													method: "buildScene",
													args: { sceneBuilderId: sceneBuilderId }
												});
											}
										}
									);
								}
								break;

							case "sceneBuilt":
								finishLoading(sceneBuilder, data.result);
								break;

							default:
								break;
						}
					} else {
						try {
							sceneBuilder[data.method].apply(sceneBuilder, data.args);
						} catch (e) {
							Log.error("SceneBuilder." + data.method + "()", e);
						}

						switch (data.method) {
							case "setScene":
								var info = data.args[0];
								sceneBuilder._progress.totalCount = info.meshCount + info.imageCount + info.modelViewCount;
								updateProgress(sceneBuilder, ProgressPhase.FinishedTree, 0);
								break;

							case "setGeometry":
								updateProgress(sceneBuilder, ProgressPhase.LoadingGeometries, sceneBuilder._progress.count + 1);
								break;

							case "createImage":
								updateProgress(sceneBuilder, ProgressPhase.LoadingTextures, sceneBuilder._progress.count + 1);
								break;

							case "createThumbnail":
								updateProgress(sceneBuilder, ProgressPhase.LoadingModelViews, sceneBuilder._progress.count + 1);
								break;

							default:
								break;
						}
					}
				};
				worker.onerror = function(err) {
					reject(err);
				};

				var wasmDirectory = WorkerScriptLoader.absoluteUri("sap/ui/vk/ve/").toString();
				worker.postMessage({
					method: "createRuntime",
					args: {
						scriptDirectory: wasmDirectory
					}
				});
			}));
		};
	})();

	function loadContent(loader, buffer, url, parentNode, contentResource, resolve, reject) {
		var dependencyLoader = contentResource.getDependencyLoader();
		sap.ui.require([
			(parentNode.isObject3D ? "sap/ui/vk/threejs/SceneBuilder" : "sap/ui/vk/svg/SceneBuilder")
		], function(
			SceneBuilder
		) {
			getWorker().then(
				// onFulfilled
				function(worker) {
					worker.onerror = function(event) {
						Log.error("Error in WebWorker", event);
						reject(getResourceBundle().getText("LOADER_ERRORREADINGFILE"));
					};

					var sceneBuilder = new SceneBuilder(parentNode, contentResource, resolve, reject);
					sceneBuilder._loader = loader;
					sceneBuilder._progress = {};
					sceneBuilder._id = nextSceneBuilderId++;
					sceneBuilders.set(sceneBuilder._id, {
						sceneBuilder: sceneBuilder,
						// See property `ContentResource#dependencyLoader`.
						dependencyLoader: dependencyLoader,
						// A map where the key (string) is a URI of the dependency and the value
						// (boolean) indicates if processing of the dependency has been finished.
						files: new Map(),
						// The number of dependencies waiting for being processed, equals the number of
						// items in `files` with value `false`.
						waitingCount: 0
					});

					worker.postMessage(
						{
							method: "createContext",
							args: {
								sceneBuilderId: sceneBuilder._id,
								buffer: buffer,
								fileName: url,
								locale: core.getConfiguration().getLanguageTag()
							}
						},
						[buffer]
					);
				},
				// onRejected
				function(reason) {
					reject(reason);
				}
			);
		});
	}

	MataiLoader.prototype.load = function(parentNode, contentResource, authorizationHandler, retryCount) {
		var that = this;
		return new Promise(function(resolve, reject) {
			// download contentResource.source
			// pass it to worker
			if (typeof contentResource.getSource() === "string") {
				var url = contentResource.getSource();
				new DownloadManager([url], undefined, authorizationHandler, retryCount)
					.attachItemSucceeded(function(event) {
						var source = event.getParameter("source");
						var response = event.getParameter("response");

						loadContent(that, response, source, parentNode, contentResource, resolve, reject);
					}, this)
					.attachItemFailed(function(event) {
						var error = event.getParameter("statusText");
						if (error === "") {
							error = getResourceBundle().getText("VIEWER_SOURCE_FAILED_TO_DOWNLOAD_CAUSE");
						}
						reject(error);
					}, this)
					.start();
			} else if (contentResource.getSource() instanceof File) {
				var reader = new FileReader();
				reader.onload = function(e) {
					loadContent(that, e.target.result, contentResource.getSource().name, parentNode, contentResource, resolve, reject);
				};
				reader.onerror = function(err) {
					reject(err);
				};
				reader.readAsArrayBuffer(contentResource.getSource());
			}
		});
	};

	return MataiLoader;
});
