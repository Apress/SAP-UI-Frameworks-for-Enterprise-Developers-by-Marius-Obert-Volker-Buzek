/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
// Provides the Core class.
sap.ui.define([
	"sap/base/strings/capitalize",
	"sap/base/util/each",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Core",
	"sap/ui/core/EventBus",
	"./library"
], function(
	capitalize,
	each,
	ManagedObject,
	ManagedObjectObserver,
	core,
	EventBus,
	vkLibrary
) {
	"use strict";

	/**
	 * @class Core class of the SAP UI VK Library.
	 *
	 * This class boots the Core framework and makes it available for the application
	 * via method <code>sap.ui.vk.getCore()</code>.
	 *
	 * Example:
	 * <pre>
	 * var vkCore = sap.ui.vk.getCore();
	 * var vkEventBus = vkCore.getEventBus();
	 * </pre>
	 *
	 * @final
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.Core
	 * @since 1.50.0
	 */
	var Core = ManagedObject.extend("sap.ui.vk.Core", /** @lends sap.ui.vk.Core.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			aggregations: {
				eventBus: { type: "sap.ui.core.EventBus", multiple: false, visibility: "hidden" }
			}
		},

		constructor: function() {
			// Make this class only available once.
			if (vkLibrary.getCore) {
				return vkLibrary.getCore();
			}

			ManagedObject.call(this);

			var that = this;

			/**
			 * Retrieve the {@link sap.ui.vk.Core Core} instance for the current window.
			 * @returns {sap.ui.vk.Core} the API of the current Core instance.
			 * @public
			 * @function
			 * @alias sap.ui.vk.getCore
			 * @since 1.50.0
			 */
			vkLibrary.getCore = function() {
				return that;
			};

			this.setAggregation("eventBus", new EventBus());
		}
	});

	/**
	 * Gets the instance of {@link sap.ui.core.EventBus} used in {@link sap.ui.vk} library.
	 *
	 * @returns {sap.ui.core.EventBus} The instance of sap.ui.core.EventBus used in the sap.ui.vk library.
	 * @public
	 * @since 1.78.0
	 */
	Core.prototype.getEventBus = function() {
		return this.getAggregation("eventBus");
	};

	////////////////////////////////////////////////////////////////////////////

	function methodName(mutation, association) {
		if (association.multiple) {
			return (mutation === "insert" ? "onAdd" : "onRemove") + capitalize(association.singularName);
		} else {
			return (mutation === "insert" ? "onSet" : "onUnset") + capitalize(association.name);
		}
	}

	/**
	 * Iterate through a list of objects that might have associations with <code>object</code> and notify them if there
	 * is a match.
	 *
	 * @param {sap.ui.base.ManagedObject[]} objects          A list of objects that might have associations with <code>associatedObject</code>.
	 * @param {string}                      mutation         String <code>"insert"</code> or <code>"remove"</code>.
	 * @param {sap.ui.core.Element}         associatedObject An object that might be assigned as an association in other objects.
	 * @private
	 */
	function notifyAllObjectsWithAssociations(objects, mutation, associatedObject) {
		var associatedObjectId = associatedObject.getId();
		objects.forEach(function(object) {
			each(object.getMetadata().getAllAssociations(), function(associationName, association) {
				if (associatedObject.isA(association.type)) { // NB: `isA()` tests for normal types and interfaces
					var ids = object["get" + capitalize(associationName)]();
					if (ids === associatedObjectId || Array.isArray(ids) && ids.indexOf(associatedObjectId) >= 0) { // In most cases `ids` will be a string.
						var method = object[methodName(mutation, association)];
						if (typeof method === "function") {
							method.call(object, associatedObject);
						}
					}
				}
			});
		});
	}

	/**
	 * Observe the lifetime of the object.
	 *
	 * On calling this method the core searches for objects that have associations with <code>object</code> which means
	 * <code>anotherObject.get&lt;AssociationName>() === object.getId()</code> or
	 * <code>anotherObject.get&lt;AssociationName>().indexOf(object.getId()) >= 0</code> and calls their methods
	 * <code>onSet&lt;AssociationName>(object)</code> or <code>onAdd&lt;AssociationSingularName>(object)</code>
	 * (depending on the association's multiplicity) if they exist and the type of the association is compatible with
	 * the type of <code>object</code>.
	 *
	 * When <code>object</code> is destroyed the observer searches for objects that have associations with
	 * <code>object</code> and calls their methods <code>onUnset&lt;AssociationName>(object)</code> or
	 * <code>onRemove&lt;AssociationSingularName>(object)</code> if they exist.
	 *
	 * This method is supposed to be called in the constructor or the <code>init</code> method.
	 *
	 * @example <caption>Observe the object's lifetime</caption>
	 *
	 * var Player = Element.extend("sap.ui.vk.qunit.Player", {
	 *     constructor: function(id, settings) {
	 *         Element.apply(this, arguments);
	 *         vkCore.observeLifetime(this);
	 *     }
	 * });
	 *
	 * @public
	 * @param {sap.ui.core.Element} object An object whose lifetime to observe.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @since 1.79.0
	 * @experimental Since 1.79.0 This class is experimental and might be modified or removed in future versions.
	 */
	Core.prototype.observeLifetime = function(object) {
		if (!this._lifetimeObserver) {
			this._lifetimeObserver = new ManagedObjectObserver(function(change) {
				if (change.type === "destroy" && this._objectsWithAssociations) { // FIX: test for "destroy" might be unnecessary as this observe is for "destroy" only.
					notifyAllObjectsWithAssociations(this._objectsWithAssociations.slice(), "remove", change.object); // NB: use `slice()` as callbacks may change the list.
				}
			}.bind(this));
		}

		this._lifetimeObserver.observe(object, { destroy: true });

		if (this._objectsWithAssociations) {
			notifyAllObjectsWithAssociations(this._objectsWithAssociations.slice(), "insert", object); // NB: use `slice()` as callbacks may change the list.
		}

		return this;
	};

	/**
	 * Observe changes of associations.
	 *
	 * Associations are weak references to other objects, they are just string IDs. When an association is assigned the
	 * corresponding object might not be created yet, or might have been destroyed or might never exist at all.
	 * Likewise, when the associated object is destroyed the object that references it via ID does not know about the
	 * destruction.
	 *
	 * This observer lets the observed objects know when the associated objects become "live" or "dead" by calling
	 * methods <code>onSet&lt;AssociationName>(associatedObject)</code> or
	 * <code>onAdd&lt;AssociationSingularName>(associatedObject)</code> and
	 * <code>onUnset&lt;AssociationName>(associatedObject)</code> or
	 * <code>onRemove&lt;AssociationSingularName>(associatedObject)</code> if they exist. These methods are also called
	 * when the association is changed and the associated objects are "alive".
	 *
	 * So, when you call <code>object.set&lt;AssociationName>(associatedObjectId)</code> if the associated object exists
	 * the observer calls <code>object.onSet&lt;AssociationName>(sap.ui.getCore().byId(associatedObjectId))</code>. If
	 * the associated object does not exist method
	 * <code>object.onSet&lt;AssociationName>(sap.ui.getCore().byId(associatedObjectId))</code> will be called when the
	 * associated object is created. The same applies to methods
	 * <code>object.add&lt;AssociationSingularName>(associatedObjectId)</code> and
	 * <code>object.onAdd&lt;AssociationSingularName>(sap.ui.getCore().byId(associatedObjectId))</code>
	 *
	 * If the associated object is destroyed the observer will call
	 * <code>object.onUnset&lt;AssociationName>(associatedObject)</code> or
	 * <code>object.onRemove&lt;AssociationSingularName>(associatedObject)</code> depending on the association's
	 * multiplicity. The observer will call these methods when the association is changed to another object or
	 * <code>null</code>.
	 *
	 * You can attach/detach event handlers in methods <code>object.onSet&lt;AssociationName>(associatedObject)</code> /
	 * <code>object.onUnset&lt;AssociationName>(associatedObject)</code> and
	 * <code>object.onAdd&lt;AssociationSingularName>(associatedObject)</code> /
	 * <code>object.onRemove&lt;AssociationSingularName>(associatedObject)</code>. You cannot attach/detach event
	 * handlers in regular methods like <code>set&lt;AssociationName>(associatedObjectId)</code> as the associated
	 * object might not exist at all.
	 *
	 * This method is supposed to be called in the constructor or the <code>init</code> method.
	 *
	 * @example <caption> Observe the object's associations</caption>
	 *
	 * var Team = ManagedObject.extend("sap.ui.vk.qunit.Team", {
	 *     metadata: {
	 *         associations: {
	 *             coach: {
	 *                 type: "sap.ui.vk.qunit.Coach",
	 *                 multiple: false
	 *             },
	 *             captain: {
	 *                 type: "sap.ui.vk.qunit.Player",
	 *                 multiple: false
	 *             },
	 *             players: {
	 *                 type: "sap.ui.vk.qunit.Player",
	 *                 multiple: true
	 *             }
	 *         }
	 *     },
	 *     constructor: function(id, settings) {
	 *         ManagedObject.apply(this, arguments);
	 *         vkCore.observeAssociations(this);
	 *     },
	 *     onSetCoach: function(coach) {
	 *         Log.info("onSetCoach(" + coach.getId() + ")");
	 *     },
	 *     onUnsetCoach: function(coach) {
	 *         Log.info("onUnsetCoach(" + coach.getId() + ")");
	 *     },
	 *     onSetCaptain: function(captain) {
	 *         Log.info("onSetCaptain(" + captain.getId() + ")");
	 *     },
	 *     onUnsetCaptain: function(captain) {
	 *         Log.info("onUnsetCaptain(" + captain.getId() + ")");
	 *     },
	 *     onAddPlayer: function(player) {
	 *         Log.info("onAddPlayer(" + player.getId() + ")");
	 *     },
	 *     onRemovePlayer: function(player) {
	 *         Log.info("onRemovePlayer(" + player.getId() + ")");
	 *     }
	 * });
	 *
	 * var Coach = Element.extend("sap.ui.vk.qunit.Coach", {
	 *     constructor: function(id, settings) {
	 *         Element.apply(this, arguments);
	 *         vkCore.observeLifetime(this);
	 *     }
	 * });
	 *
	 * var Player = Element.extend("sap.ui.vk.qunit.Player", {
	 *     constructor: function(id, settings) {
	 *         Element.apply(this, arguments);
	 *         vkCore.observeLifetime(this);
	 *     }
	 * });
	 *
	 * @public
	 * @param {sap.ui.core.Element} object An object whose associations to observe.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @since 1.79.0
	 * @experimental Since 1.79.0 This class is experimental and might be modified or removed in future versions.
	 */
	Core.prototype.observeAssociations = function(object) {
		if (!object.getId()) {
			throw new Error("To observe an object it must have an ID.");
		}

		if (!this._objectsWithAssociations) {
			var that = this;
			this._objectsWithAssociations = [];
			this._associationObserver = new ManagedObjectObserver(function(change) {
				var index = that._objectsWithAssociations.indexOf(change.object);
				if (index < 0) {
					return;
				}
				if (change.type === "destroy") {
					each(change.object.getMetadata().getAllAssociations(), function(associationName, association) {
						var method;
						var capitalizedName = capitalize(association.name);
						if (association.multiple) {
							method = change.object["removeAll" + capitalizedName];
							if (typeof method === "function") {
								method.call(change.object); // This will result in a call to this observer with `change { type: "association", mutation: "remove" }`.
							}
						} else {
							method = change.object["set" + capitalizedName];
							if (typeof method === "function") {
								method.call(change.object, null); // This will result in a call to this observer with `change { type: "association", mutation: "remove" }`.
							}
						}
					});
					that._objectsWithAssociations.splice(index, 1);
				} else if (change.type === "association") {
					var association = change.object.getMetadata().getAllAssociations()[change.name];
					var method = change.object[methodName(change.mutation, association)];
					if (typeof method === "function") {
						if (Array.isArray(change.ids)) {
							change.ids
								.map(function(id) { return core.byId(id); })
								.filter(function(associatedObject) { return associatedObject != null; })
								.forEach(method.bind(change.object));
						} else {
							var associatedObject = core.byId(change.ids);
							if (associatedObject) {
								method.call(change.object, associatedObject);
							}
						}
					}
				}
			});
		}

		// TODO: What if this function is called from the base class and from the derived class?
		if (this._objectsWithAssociations.indexOf(object) < 0) {
			this._objectsWithAssociations.push(object);
			this._associationObserver.observe(object, { associations: true, destroy: true });
			// NB: as this method can be called from the constructor after `init` executes, associations may have
			// already been assigned, so we have to iterate through them.
			each(object.getMetadata().getAllAssociations(), function(associationName, association) {
				var method = object[methodName("insert", association)];
				if (typeof method === "function") {
					var ids = object["get" + capitalize(associationName)]();
					if (Array.isArray(ids)) {
						ids.map(function(id) { return core.byId(id); })
							.filter(function(associatedObject) { return associatedObject != null; })
							.forEach(method.bind(object));
					} else {
						var associatedObject = core.byId(ids);
						if (associatedObject) {
							method.call(object, associatedObject);
						}
					}
				}
			});
		}

		return this;
	};

	return new Core();
});
