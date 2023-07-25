/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Scene class.
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./AnimationSequence",
	"./AnimationTrack",
	"./ViewGroup",
	"./View",
	"./Highlight"
], function(
	ManagedObject,
	AnimationSequence,
	AnimationTrack,
	ViewGroup,
	View,
	Highlight
) {
	"use strict";

	/**
	 * Constructor for a new Scene.
	 *
	 * The objects of this class should not be created directly.
	 * They should be created via {@link sap.ui.vk.ContentConnector sap.ui.vk.ContentConnector}.
	 *
	 * @class Provides the interface for the 3D model.
	 *
	 * The objects of this class should not be created directly.
	 * They should be created via {@link sap.ui.vk.ContentConnector sap.ui.vk.ContentConnector}.
	 *
	 * @public
	 * @abstract
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.Scene
	 */
	var Scene = ManagedObject.extend("sap.ui.vk.Scene", /** @lends sap.ui.vk.Scene.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			"abstract": true,
			properties: {
				/**
				 * Enables or disables double-sided materials
				 */
				doubleSided: {
					type: "boolean",
					defaultValue: false
				}
			}
		}
	});

	/**
	 * Gets the unique ID of the Scene object.
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getId
	 *
	 * @returns {string} The unique ID of the Scene object.
	 * @public
	 */

	/**
	 * Gets the default node hierarchy in the Scene object.
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getDefaultNodeHierarchy
	 *
	 * @returns {sap.ui.vk.NodeHierarchy} The default node hierarchy in the Scene object.
	 * @public
	 */

	/**
	 * Gets the scene reference that this Scene object wraps.
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getSceneRef
	 *
	 * @returns {any} The scene reference that this Scene object wraps.
	 * @public
	 */

	/**
	 * Get initial view
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getInitialView
	 *
	 * @returns {sap.ui.vk.View} initial view
	 * @public
	 */
	Scene.prototype.getInitialView = function() {
		return null;
	};

	/**
	 * Set initial view
	 *
	 * @function
	 * @name sap.ui.vk.Scene#setInitialView
	 *
	 * @param {sap.ui.vk.View} view Initial view
	 *
	 * @public
	 */

	/**
	 * Get material
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getMaterial
	 *
	 * @param {string} materialId material id
	 *
	 * @return {sap.ui.vk.Material} material
	 *
	 * @private
	 */

	/**
	 * Set material
	 *
	 * @function
	 * @name sap.ui.vk.Scene#setMaterial
	 *
	 * @param {string} materialId material id
	 * @param {sap.ui.vk.Material} material to be stored
	 *
	 * @private
	 */

	/**
	 * Clear materials
	 *
	 * @function
	 * @name sap.ui.vk.Scene#clearMaterials
	 *
	 * @private
	 */

	///////////////////////////////////////////////////////////////////////
	//
	// Sequences
	//
	///////////////////////////////////////////////////////////////////////

	/**
	 * Creates an animation sequence.
	 * @param {string} sId persistent sequence ID
	 * @param {any} parameters sequence creation parameters
	 * @param {string} parameters.name sequence name
	 * @param {float} parameters.duration sequence duration
	 *
	 * @returns {sap.ui.vk.AnimationSequence} created sequence
	 *
	 * @public
	 */
	Scene.prototype.createSequence = function(sId, parameters) {
		var sequence = new AnimationSequence(sId, parameters);
		this.addSequence(sequence);

		return sequence;
	};

	/**
	 * Gets a list of sequences
	 * @returns {sap.ui.vk.AnimationSequence[]} list of sequences
	 *
	 * @public
	 */
	Scene.prototype.getSequences = function() {
		if (!this._sequences) {
			this._sequences = [];
		}

		return this._sequences;
	};

	/**
	 * Finds sequence by ID
	 * @param {string} sequenceId sequence ID
	 * @returns {sap.ui.vk.AnimationSequence} sequence with given Id or undefined
	 *
	 * @public
	 */
	Scene.prototype.findSequence = function(sequenceId) {
		if (!this._sequences) {
			return undefined;
		}

		return this._sequences.find(function(sequence) {
			return sequence.getId() === sequenceId;
		});
	};

	/**
	 * Add a sequence to the scene
	 * @param {sap.ui.vk.AnimationSequence} sequence sequence to add
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	Scene.prototype.addSequence = function(sequence) {
		if (!this._sequences) {
			this._sequences = [];
		}

		this._sequences.push(sequence);

		return this;
	};

	/**
	 * Inserts a sequence
	 * @param {sap.ui.vk.AnimationSequence} sequence sequence to insert
	 * @param {int} index index where to insert the sequence
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	Scene.prototype.insertSequence = function(sequence, index) {
		if (!this._sequences) {
			this._sequences = [];
		}

		if (index < 0) {
			index = 0;
		} else if (index !== 0 && index >= this._sequences.length) {
			index = this._sequences.length;
		}

		this._sequences.splice(index, 0, sequence);

		return this;
	};

	/**
	 * Gets index of a sequence in the scene
	 * @param {sap.ui.vk.AnimationSequence} sequence sequence to locate
	 * @returns {int} sequence index of found or -1 otherwise
	 *
	 * @public
	 */
	Scene.prototype.indexOfSequence = function(sequence) {
		if (!this._sequences) {
			return -1;
		}

		return this._sequences.indexOf(sequence);
	};

	/**
	 * Removes a sequence from the scene
	 * @param {sap.ui.vk.AnimationSequence} sequence sequence to remove
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	Scene.prototype.removeSequence = function(sequence) {
		if (this._sequences) {
			var index = this.indexOfSequence(sequence);
			if (index >= 0) {
				this._sequences.splice(index, 1);
			}
		}

		return this;
	};

	/**
	 * Removes all sequences from the scene
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	Scene.prototype.removeSequences = function() {
		if (this._sequences) {
			this._sequences.splice(0);
		}

		return this;
	};

	///////////////////////////////////////////////////////////////////////
	//
	// Animation tracks
	//
	///////////////////////////////////////////////////////////////////////

	/**
	 * Creates an animation track.
	 * @param {string} sId persistent track ID
	 * @param {any} parameters track creation parameters
	 * @param {sap.ui.vk.TrackValueType} parameters.trackValueType track's value type
	 *
	 * @returns {sap.ui.vk.AnimationTrack} created track
	 *
	 * @public
	 */
	Scene.prototype.createTrack = function(sId, parameters) {
		var track = new AnimationTrack(sId, parameters);
		this.addTrack(track);

		return track;
	};

	/**
	 * Gets a list of animation tracks
	 * @returns {sap.ui.vk.AnimationTrack[]} list of animation tracks
	 *
	 * @public
	 */
	Scene.prototype.getTracks = function() {
		if (!this._tracks) {
			this._tracks = [];
		}

		return this._tracks;
	};

	/**
	 * Finds track by ID
	 * @param {string} trackId track ID
	 * @returns {sap.ui.vk.AnimationTrack} track with given Id or undefined
	 *
	 * @public
	 */
	Scene.prototype.findTrack = function(trackId) {
		if (!this._tracks) {
			return undefined;
		}

		return this._tracks.find(function(track) {
			return track.getId() === trackId;
		});
	};

	/**
	 * Add an animation track to the scene
	 * @param {sap.ui.vk.AnimationTrack} track animation track to add
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	Scene.prototype.addTrack = function(track) {
		if (!this._tracks) {
			this._tracks = [];
		}

		this._tracks.push(track);

		return this;
	};

	/**
	 * Inserts an animation track
	 * @param {sap.ui.vk.AnimationTrack} track animation track to insert
	 * @param {int} index index where to insert the animation track
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	Scene.prototype.insertTrack = function(track, index) {
		if (!this._tracks) {
			this._tracks = [];
		}

		if (index < 0) {
			index = 0;
		} else if (index !== 0 && index >= this._tracks.length) {
			index = this._tracks.length;
		}

		this._tracks.splice(index, 0, track);

		return this;
	};

	/**
	 * Gets index of an animation track in the scene
	 * @param {sap.ui.vk.AnimationTrack} track animation track to locate
	 * @returns {int} sequence index of found or -1 otherwise
	 *
	 * @public
	 */
	Scene.prototype.indexOfTrack = function(track) {
		if (!this._tracks) {
			return -1;
		}

		return this._tracks.findIndex(function(item) {
			return item == track;
		});
	};

	/**
	 * Removes an animation track from the scene
	 * @param {sap.ui.vk.AnimationTrack} track animation track to remove
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	Scene.prototype.removeTrack = function(track) {
		if (this._tracks) {
			var index = this.indexOfTrack(track);
			if (index >= 0) {
				this._tracks.splice(index, 1);
			}
		}

		return this;
	};

	/**
	 * Removes all animation tracks from the scene
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	Scene.prototype.removeTracks = function() {
		if (this._tracks) {
			this._tracks.splice(0);
		}

		return this;
	};

	////////////////////////////////////////////////////////////////
	//
	// View Groups
	//
	////////////////////////////////////////////////////////////////

	/**
	 * Provides an array of all ViewGroups
	 * @returns {sap.ui.vk.ViewGroup[]} List of ViewGroups
	 *
	 * @public
	 */
	Scene.prototype.getViewGroups = function() {
		if (!this._viewGroups) {
			this._viewGroups = [];
		}
		return this._viewGroups;
	};

	Scene.prototype.createViewGroup = function(parameters) {
		if (!this._viewGroups) {
			this._viewGroups = [];
		}

		var viewGroup = new ViewGroup(parameters);

		this._viewGroups.push(viewGroup);
		return viewGroup;
	};

	Scene.prototype.indexOfViewGroup = function(viewGroup) {
		if (!this._viewGroups) {
			return -1;
		}

		return this._viewGroups.find(function(item) {
			return item == viewGroup;
		});
	};

	Scene.prototype.insertViewGroup = function(viewGroup, index) {
		if (!this._viewGroups) {
			this._viewGroups = [];
		}

		if (index < 0) {
			index = 0;
		} else if (index !== 0 && index >= this._viewGroups.length) {
			index = this._viewGroups.length;
		}

		this._viewGroups.splice(index, 0, viewGroup);

		return this;

	};

	Scene.prototype.removeViewGroup = function(viewGroup) {
		var index = this.indexOfViewGroup(viewGroup);
		if (index >= 0) {
			this._viewGroups.splice(index, 1);
		}
		return this;
	};

	Scene.prototype.removeViewGroups = function() {
		this._viewGroups.splice(0);
		return this;
	};

	Scene.prototype.findViewGroupByView = function(view) {
		var result;

		if (this._viewGroups) {
			for (var idx = 0; idx < this._viewGroups.length; idx++) {
				if (this._viewGroups[idx].indexOfView(view) >= 0) {
					result = this._viewGroups[idx];
					break;
				}
			}
		}

		return result;
	};

	////////////////////////////////////////////////////////////////
	//
	// Views
	//
	////////////////////////////////////////////////////////////////

	/**
	 * Provides an array of all views
	 * @returns {sap.ui.vk.View[]} List of Views
	 *
	 * @public
	 */
	Scene.prototype.getViews = function() {
		if (!this._views) {
			this._views = [];
		}

		return this._views;
	};

	Scene.prototype.createView = function(parameters) {
		if (!this._views) {
			this._views = [];
		}

		var view = new View(parameters);
		this._views.push(view);
		return view;
	};

	Scene.prototype.removeView = function(view) {
		if (!this._views) {
			return this;
		}

		var viewGroups = this.getViewGroups();
		if (Array.isArray(viewGroups)) {
			viewGroups.forEach(function(viewGroup) {
				viewGroup.removeView(view);
			});
		}

		var index = this._views.indexOf(view);
		if (index >= 0) {
			this._views.splice(index, 1);
		}

		return this;
	};

	/**
	 * Creates a highlight.
	 * @param {string} sId persistent highlight ID
	 * @param {any} parameters highlight creation parameters
	 * @param {string} parameters.name highlight name
	 * @param {float} parameters.duration highlight duration - 0 means static highlight
	 * @param {int} parameters.cycles highlight cycles - 0 with duration > o means infinite highlight
	 * @param {float[]} [parameters.opacities] highlight opacities - optional, can be empty
	 * @param {array[]} [parameters.colours] highlight colours - optional, can be empty, in form of [[r1, g1, b1, a1], [r2, g2, b2, a2], ...]
	 *
	 * @returns {sap.ui.vk.Highlight} created highlight
	 *
	 * @public
	 */
	Scene.prototype.createHighlight = function(sId, parameters) {
		var highlight = new Highlight(sId, parameters);

		if (!this._highlights) {
			this._highlights = new Map();
		}

		this._highlights.set(sId, highlight);

		return highlight;
	};

	/**
	 * get highlight according to ID
	 * @param {string} sId persistent highlight ID
	 *
	 * @returns {sap.ui.vk.Highlight} highlight
	 *
	 * @public
	 */
	Scene.prototype.getHighlight = function(sId) {
		var highlight;

		if (this._highlights) {
			highlight = this._highlights.get(sId);
		}

		return highlight;
	};

	/**
	 * remove highlight according to ID
	 * @param {string} sId persistent highlight ID
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	Scene.prototype.removeHighlight = function(sId) {

		if (this._highlights) {
			this._highlights.delete(sId);
		}

		return this;
	};

	return Scene;
});
