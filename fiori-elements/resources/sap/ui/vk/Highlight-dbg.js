/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/Object"
], function(
	BaseObject
) {
	"use strict";

	/**
	 * Constructor for an animated highlight.
	 *
	 * @class Provides the interface for an animated highlight. The objects of this class should not be created directly.
	 * @param {string} sId Highlight ID
	 * @param {any} parameters Highlight parameters
	 * @param {string} parameters.name highlight name
	 * @param {float} parameters.duration highlight duration - 0 means static highlight
	 * @param {int} parameters.cycles highlight cycles - 0 with duration > o means infinite highlight
	 * @param {float[]} [parameters.opacities] highlight opacities - optional, can be empty
	 * @param {array[]} [parameters.colours] highlight colours - optional, in form of [[r1, g1, b1, a1], [r2, g2, b2, a2], ...]
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.Object
	 * @alias sap.ui.vk.Highlight
	 * @since 1.73.0
	 * @experimental This class is experimental and might be modified or removed in future versions.
	 */
	var Highlight = BaseObject.extend("sap.ui.vk.Highlight", /** @lends sap.ui.vk.Highlight.prototype */ {

		constructor: function(sId, parameters) {
			this._id = sId;

			this._name = parameters && parameters.name ? parameters.name : "";
			this._duration = parameters && parameters.duration ? parameters.duration : 0.0;
			this._cycles = parameters && parameters.cycles ? parameters.cycles : 0;
			this._colours = parameters && parameters.colours ? parameters.colours : [];
			this._opacities = parameters && parameters.opacities ? parameters.opacities : [];

			this._fadeOut = parameters && parameters.fadeOut ? parameters.fadeOut : false;

			this._reset();
		}
	});

	/**
	 * Gets the highlight ID.
	 * @returns {string} The highlight ID.
	 * @public
	 */
	Highlight.prototype.getId = function() {
		return this._id;
	};

	/**
	 * Gets the highlight name.
	 * @returns {string} The highlight name.
	 * @public
	 */
	Highlight.prototype.getName = function() {
		return this._name;
	};

	/**
	 * Sets the highlight name.
	 * @param {string} name The highlight name.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Highlight.prototype.setName = function(name) {
		this._name = name;
		return this;
	};

	/**
	 * Gets the highlight duration.
	 * @returns {float} The highlight duration.
	 * @public
	 */
	Highlight.prototype.getDuration = function() {
		return this._duration;
	};

	/**
	 * Sets the highlight duration.
	 * @param {float} duration The highlight duration.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Highlight.prototype.setDuration = function(duration) {
		this._duration = duration;
		this._reset();
		return this;
	};

	/**
	 * Gets the highlight cycles.
	 * @returns {IntersectionObserverEntryInit} The highlight cycles.
	 * @public
	 */
	Highlight.prototype.getCycles = function() {
		return this._cycles;
	};

	/**
	 * Sets the highlight cycles.
	 * @param {int} cycles The highlight cycles.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Highlight.prototype.setCycles = function(cycles) {
		this._cycles = cycles;
		this._reset();
		return this;
	};

	/**
	 * Gets the highlight opacities.
	 * @returns {float[]} The highlight opacities.
	 * @public
	 */
	Highlight.prototype.getOpacities = function() {
		return this._opacities;
	};

	/**
	 * Sets the highlight opacities.
	 * @param {float[]} opacities The highlight opacities.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Highlight.prototype.setOpacities = function(opacities) {
		this._opacities = opacities;
		this._reset();
		return this;
	};

	/**
	 * Gets the highlight colours.
	 * @returns {array[]} The highlight colours [[r1, g1, b1, a1], [r2, g2, b2, a2], ...]
	 * @public
	 */
	Highlight.prototype.getColours = function() {
		return this._colours;
	};

	/**
	 * Sets the highlight colours.
	 * @param {array[]} colours The highlight colours [[r1, g1, b1, a1], [r2, g2, b2, a2], ...]
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Highlight.prototype.setColours = function(colours) {
		this._colours = colours;
		this._reset();
		return this;
	};

	Highlight.prototype._reset = function() {

		var ki, oi, timeInterval;

		var needOpacity = false;
		if (this._opacities && this._opacities.length) {
			for (var i = 0; i < this._opacities.length; i++) {
				if (this._opacities[i] < 0.999) {
					needOpacity = true;
					break;
				}
			}
		}
		if (needOpacity) {
			if (Math.abs(this._duration - 0.0) < 0.000000001 || this._opacities.length === 1) {   // static
				this._adjustedOpacities = [this._opacities[0]];
				this._opacityTimes = [0.0];
			} else if (this._cycles > 0) {   // finite
				timeInterval = this._duration / this._opacities.length;
				this._adjustedOpacities = [];
				this._opacityTimes = [];
				for (ki = 0; ki < this._cycles; ki++) {
					for (oi = 0; oi < this._opacities.length; oi++) {
						this._adjustedOpacities.push(this._opacities[oi]);
						this._opacityTimes.push(timeInterval * (ki * this._opacities.length + oi));
					}
				}
			} else {  // infinite
				timeInterval = this._duration / this._opacities.length;
				this._adjustedOpacities = [];
				this._opacityTimes = [];
				for (oi = 0; oi < this._opacities.length; oi++) {
					this._adjustedOpacities.push(this._opacities[oi]);
					this._opacityTimes.push(timeInterval * oi);
				}

				this._adjustedOpacities.push(this._opacities[0]);
				this._opacityTimes.push(timeInterval * this._opacities.length);
			}
		} else {
			this._adjustedOpacities = [];
			this._opacityTimes = [];
		}

		var needColour = true;

		if (this._colours && this._colours.length) {
			for (var j = 0; j < this._colours.length; j++) {
				if (this._colours[j][3] < 0) {
					needColour = false;
					break;
				}
			}
		} else {
			needColour = false;
		}

		if (needColour) {
			if (this._cycles === 0 && this._duration > 0.0) {  // infinite highlight
				if (this._colours.length === 1) {
					this._colours.push([0, 0, 0, 0]);
				}
			}

			if (Math.abs(this._duration - 0.0) < 0.000000001 || this._colours.length === 1) {   // static
				this._adjustedColours = [this._colours[0]];
				this._colourTimes = [0.0];
			} else if (this._cycles > 0) {   // finite
				timeInterval = this._duration / this._colours.length;
				this._adjustedColours = [];
				this._colourTimes = [];
				for (ki = 0; ki < this._cycles; ki++) {
					for (oi = 0; oi < this._colours.length; oi++) {
						this._adjustedColours.push(this._colours[oi]);
						this._colourTimes.push(timeInterval * (ki * this._colours.length + oi));
					}
				}

			} else {  // infinite
				timeInterval = this._duration / this._colours.length;
				this._adjustedColours = [];
				this._colourTimes = [];
				for (oi = 0; oi < this._colours.length; oi++) {
					this._adjustedColours.push(this._colours[oi]);
					this._colourTimes.push(timeInterval * oi);
				}

				this._adjustedColours.push(this._colours[0]);
				this._colourTimes.push(timeInterval * this._colours.length);
			}
		} else {
			this._adjustedColours = [];
			this._colourTimes = [];
		}
	};

	/**
	 * Gets the highlight opacity at the specified time.
	 * @param {float} time Time from beginning of the highlight animation
	 * @returns {object} <code>undefined</code> if highlight opacity does not exist or object with two properties:
	 * <ul>
	 *   <li>{float | undefined} result.opacity, if undefined the original opacity of object should be restored</li>
	 *   <li>{boolean} result.isCompleted, true if highlight is completed</li>
	 * </ul>
	 * @public
	 */
	Highlight.prototype.getOpacity = function(time) {
		if (!this._adjustedOpacities || !this._adjustedOpacities.length) {
			return undefined;
		}

		var result = {};
		if (this._adjustedOpacities.length === 1) { // static highlight or single opacity
			result.opacity = this._adjustedOpacities[0];
			result.isCompleted = true;
			return result;
		}

		var duration = this._opacityTimes[this._opacityTimes.length - 1];

		var currentTime = time;
		if (this._cycles === 0) {  // infinite highlight
			while (currentTime > duration) {
				currentTime -= duration;
			}
		}

		if (currentTime >= duration) {
			if (this._cycles > 0) { // finite highlight, need to use the original opacity
				result.isCompleted = true;
				result.opacity = undefined;
			} else {
				result.isCompleted = false;
				result.opacity = this._adjustedOpacities[this._adjustedOpacities.length - 1];
			}
			return result;
		}

		var timeInterval = this._opacityTimes[1] - this._opacityTimes[0];

		var ratio = currentTime / timeInterval;
		var index1 = Math.floor(ratio);
		var intepolateRatio = ratio - index1;
		result.opacity = this._adjustedOpacities[index1] * (1 - intepolateRatio) + this._adjustedOpacities[index1 + 1] * intepolateRatio;
		result.isCompleted = false;
		return result;
	};

	/**
	 * Gets the highlight colour at the specified time.
	 * @param {float} time the time from highlight starts
	 * @returns {undefined | object} <code>undefined</code> if highlight colour does not exist or object with two properties:
	 * <ul>
	 *   <li>{float[] | undefined} result.colour in form [r,g,b,a], if undefined the original colour of object should be restored</li>
	 *   <li>{boolean} result.isCompleted, true if highlight is completed</li>
	 * </ul>
	 * @public
	 */
	Highlight.prototype.getColour = function(time) {
		if (!this._adjustedColours || !this._adjustedColours.length) {
			return undefined;
		}

		var result = {};
		if (this._adjustedColours.length === 1) { // static highlight or single colours
			result.colour = this._adjustedColours[0];
			result.isCompleted = true;
			return result;
		}

		var duration = this._colourTimes[this._colourTimes.length - 1];

		var currentTime = time;
		if (this._cycles === 0) {  // infinite highlight
			while (currentTime > duration) {
				currentTime -= duration;
			}
		}

		if (currentTime >= duration) {
			if (this._cycles > 0) { // finite highlight, need to use the original colour
				result.isCompleted = true;
				result.colour = undefined;
			} else {
				result.isCompleted = false;
				result.colour = this._adjustedColours[this._adjustedColours.length - 1];
			}
			return result;
		}

		var timeInterval = this._colourTimes[1] - this._colourTimes[0];

		var ratio = currentTime / timeInterval;
		var index = Math.floor(ratio);
		var intepolateRatio = ratio - index;

		var r = this._adjustedColours[index][0] * (1 - intepolateRatio) + this._adjustedColours[index + 1][0] * intepolateRatio;
		var g = this._adjustedColours[index][1] * (1 - intepolateRatio) + this._adjustedColours[index + 1][1] * intepolateRatio;
		var b = this._adjustedColours[index][2] * (1 - intepolateRatio) + this._adjustedColours[index + 1][2] * intepolateRatio;
		var a = this._adjustedColours[index][3] * (1 - intepolateRatio) + this._adjustedColours[index + 1][3] * intepolateRatio;

		result.colour = [r, g, b, a];  // finite highlight outside playing cycles
		result.isCompleted = false;
		return result;
	};

	/**
	 * Gets the last opacity value.
	 * @returns {float} last opacity value
	 * @public
	 */
	Highlight.prototype.getLastOpacity = function() {
		var result;
		if (this._opacities && this._opacities.length > 0) {
			result = this._opacities[this._opacities.length - 1];
		}
		return result;
	};

	/**
	 * Gets if the highlighted nodes are fading out.
	 * @returns {boolean} true if the highlighted nodes fade out at the end
	 * @public
	 */
	Highlight.prototype.isFadeOut = function() {
		return this._fadeOut;
	};

	return Highlight;
});
