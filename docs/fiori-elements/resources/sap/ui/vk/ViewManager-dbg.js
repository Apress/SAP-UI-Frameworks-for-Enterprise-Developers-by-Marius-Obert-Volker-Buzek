/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Scene class.
sap.ui.define([
	"sap/ui/core/Element",
	"./Core",
	"./Scene",
	"sap/ui/core/Core"
], function(
	Element,
	vkCore,
	Scene,
	core
) {
	"use strict";

	/**
	 * Constructor for a new ViewManager.
	 *
	 * @class
	 * An instance of the ViewManager class is responsible for tracking the current view, activating views and playing
	 * views in view groups.
	 *
	 * @param {string} [sId] ID for the new ViewManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ViewManager object.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Element
	 * @alias sap.ui.vk.ViewManager
	 */
	var ViewManager = Element.extend("sap.ui.vk.ViewManager", /** @lends sap.ui.vk.ViewManager.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			associations: {
				/**
				 * An association to the {@link sap.ui.vk.ContentConnector ContentConnector} instance that manages
				 * content resources.
				 */
				contentConnector: {
					type: "sap.ui.vk.ContentConnector"
				},

				/**
				 * An association to the {@link sap.ui.vk.AnimationPlayer AnimationPlayer} instance that manages
				 * animation sequences.
				 *
				 * If no AnimationPlayer is associated with ViewManager the views can still be activated but no
				 * animation will be played.
				 */
				animationPlayer: {
					type: "sap.ui.vk.AnimationPlayer"
				}
			}
		},

		constructor: function(sId, mSettings) {
			Element.apply(this, arguments);

			// The scene currently loaded in the associated content connector.
			this._scene = null;

			// The active view or the view currently being activated.
			this._activeView = null;

			// If we play a view group and request the view group playing to stop, this flag
			// prevents the next view from activation. This flag is needed as the view activation
			// and requesting view group playing to stop are asynchronous.
			this._cancelPlayingViewGroup = false;

			vkCore.observeLifetime(this);
			vkCore.observeAssociations(this);
		}
	});

	ViewManager.prototype._setScene = function(scene) {
		if (this._scene !== scene) {
			this._scene = scene;

			if (scene) {
				var initialView = scene.getInitialView();
				if (initialView) {
					this.activateView(initialView, true, true);
				}
			}
		}

		return this;
	};

	/**
	 * Gets the active view or the view being activated.
	 *
	 * @public
	 * @returns {sap.ui.vk.View} The active view or the view being activated.
	 */
	ViewManager.prototype.getActiveView = function() {
		return this._activeView;
	};

	ViewManager.prototype._getNextView = function(view, viewGroup) {
		var scene = this._scene;
		if (!viewGroup) {
			viewGroup = scene.findViewGroupByView(view);
		}

		var views;
		var index = -1;

		if (!viewGroup) {
			views = scene.getViews();
			index = views.indexOf(view);
		} else {
			views = viewGroup.getViews();
			index = viewGroup.indexOfView(view);
		}

		if (index < 0) {
			// unable to determine index of the current view
			return undefined;
		} else if (index >= views.length - 1) {
			return undefined;
		}
		index++;

		return views[index];
	};

	ViewManager.prototype._setContent = function(content) {
		var scene = null;
		if (content && content instanceof Scene) {
			scene = content;
		}
		this._setScene(scene);
	};

	ViewManager.prototype.onSetContentConnector = function(contentConnector) {
		contentConnector.attachContentReplaced(this._onContentReplaced, this);
		this._setContent(contentConnector.getContent());
	};

	ViewManager.prototype.onUnsetContentConnector = function(contentConnector) {
		this._setContent(null);
		contentConnector.detachContentReplaced(this._onContentReplaced, this);
	};

	ViewManager.prototype._onContentReplaced = function(event) {
		this._setContent(event.getParameter("newContent"));
	};

	/**
	 * Activates a view.
	 *
	 * @param {sap.ui.vk.View} view A view to activate.
	 * @param {boolean} [skipCameraTransitionAnimation=false] An indicator to skip camera transition animation.
	 * @param {boolean} [skipViewAnimation=false] An indicator to skip playing animation after activating the view whose
	 *                  property {@link sap.ui.vk.View#autoPlayAnimation autoPlayAnimation} equals <code>true</code>.
	 * @returns {Promise<sap.ui.vk.View>} A promise which resolves with the view when the view is fully activated.
	 * @public
	 */
	ViewManager.prototype.activateView = function(view, skipCameraTransitionAnimation, skipViewAnimation) {
		if (skipViewAnimation == null) {
			skipViewAnimation = false;
		}
		if (skipCameraTransitionAnimation == null) {
			skipCameraTransitionAnimation = false;
		}
		return this._activateView(view, null, skipCameraTransitionAnimation, skipViewAnimation, false);
	};

	/**
	 * Plays views in the specified view group.
	 *
	 * The playing starts with the view provided and continues to the next views until the very last
	 * in the view group.
	 *
	 * @param {sap.ui.vk.View} view A view to start playing.
	 * @param {sap.ui.vk.ViewGroup} viewGroup A view group to play.
	 * @param {int} [autoAdvanceViewTimeout=1000] A delay in milliseconds between view activations when views do not
			have animations or there is no {@link sap.ui.vk.AnimationPlayer AnimationPlayer} associated with the
			ViewManager.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewManager.prototype.playViewGroup = function(view, viewGroup, autoAdvanceViewTimeout) {
		this._cancelPlayingViewGroup = false;

		if (view === this.getActiveView()) {
			var animationPlayer = core.byId(this.getAnimationPlayer());
			if (animationPlayer) {
				if (animationPlayer.getTime() >= animationPlayer.getTotalDuration()) {
					animationPlayer.setTime(0);
				}
			}
			return this._play(view, viewGroup, true, autoAdvanceViewTimeout);
		}

		this._activateView(view, viewGroup, false, false, true, autoAdvanceViewTimeout);

		return this;
	};

	/**
	 * Stops playing views in the currently active view group.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewManager.prototype.stopPlayingViewGroup = function() {
		this._cancelPlayingViewGroup = true;
		var animationPlayer = core.byId(this.getAnimationPlayer());
		if (animationPlayer) {
			animationPlayer.stop();
		}
		return this;
	};

	ViewManager.prototype._play = function(view, viewGroup, autoAdvanceToNextView, autoAdvanceViewTimeout) {
		var eventBus = vkCore.getEventBus();
		var animationPlayer = core.byId(this.getAnimationPlayer());

		var canPlayAnimation = animationPlayer != null && view.hasAnimation() && view.getAutoPlayAnimation();

		if (autoAdvanceToNextView) {
			var activateNextView = function() {
				if (this._cancelPlayingViewGroup) {
					return;
				}

				var nextView = this._getNextView(view, viewGroup);

				if (nextView) {
					this._activateView(nextView, viewGroup, false, false, autoAdvanceToNextView);
				} else {
					eventBus.publish("sap.ui.vk", "procedureFinished");
				}
			}.bind(this);

			var onViewPlaybackStateChanged = function(channel, eventId, event) {
				if (event.source !== animationPlayer) {
					return;
				}

				if (event.stopped) {
					eventBus.unsubscribe("sap.ui.vk", "animationPlayStateChanged", onViewPlaybackStateChanged, this);
					if (event.endOfAnimation) {
						activateNextView();
					}
				}
			};

			if (canPlayAnimation) {
				eventBus.subscribe("sap.ui.vk", "animationPlayStateChanged", onViewPlaybackStateChanged, this);
			} else {
				setTimeout(activateNextView, autoAdvanceViewTimeout);
			}
		}

		if (canPlayAnimation) {
			animationPlayer.play();
		}
	};

	ViewManager.prototype._activateView = function(view, viewGroup, skipCameraTransitionAnimation, skipAnimation, autoAdvanceToNextView, autoAdvanceViewTimeout) {
		var animationPlayer = core.byId(this.getAnimationPlayer());
		if (animationPlayer) {
			animationPlayer.stop();
		}
		this._cancelPlayingViewGroup = false;
		var that = this;
		return new Promise(function(resolve, reject) {
			var eventBus = vkCore.getEventBus();

			that._activeView = view;

			var onViewApplied = function(channel, eventId, event) {
				if (event.view !== view) {
					return;
				}

				eventBus.unsubscribe("sap.ui.vk", "readyForAnimation", onViewApplied, that);

				if (!that._cancelPlayingViewGroup && !skipAnimation) {
					that._play(view, viewGroup, autoAdvanceToNextView, autoAdvanceViewTimeout);
				}

				resolve({
					view: view
				});
			};

			eventBus.subscribe("sap.ui.vk", "readyForAnimation", onViewApplied, that);

			eventBus.publish("sap.ui.vk", "activateView", {
				source: that,
				view: view,
				skipCameraTransitionAnimation: skipCameraTransitionAnimation,
				playViewGroup: autoAdvanceToNextView
			});
		});
	};

	return ViewManager;
});
