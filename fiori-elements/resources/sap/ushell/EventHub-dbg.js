// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview provides a sticky EventHub implementation to be used internally by the shell.
 * @private
 */

sap.ui.define([
    "sap/base/Log"
    /*Be careful by adding dependencies: Module is used in uhsell's boottask! */
], function (Log) {
    "use strict";


    var _oHub = {
        pendingEvents: { /* sEventName -> vData */ },
        subscribers: { /* sEventName -> fnCallback */ },
        dispatchOperations: { /* sEventName -> oDispatchOperation */ },
        store: createEmptyStore(),
        dispatchTimeoutIds: new window.Set()
    };

    function createEmptyStore () {
        return {
            nextKey: 0,
            objectToKey: new window.WeakMap(),
            keyToObject: {}
        };
    }

    function log (sMessage, sDetails, fnCausedBy) {
        Log.error(sMessage, sDetails, "sap.ushell.EventHub");
        return;
    }

    function logCallbackError (oError) {
        var sMessage = "An exception was raised while executing a registered callback on event '" + oError.eventName + "'",
            sDetails = "Data passed to the event were: '" + oError.eventData + "'";
        if (oError.error.stack) {
            sDetails += " Error details: " + oError.error.stack;
        }

        log(sMessage, sDetails, oError.fnCausedBy);
    }

    function safeCall (sEvent, fnCallback, vData) {
        var vResult;
        try {
            vResult = fnCallback(vData);
        } catch (oError) {
            logCallbackError({
                eventName: sEvent,
                eventData: vData,
                fnCausedBy: fnCallback,
                error: oError
            });
        }

        return vResult;
    }

    function JSONReplacer (oHub /*sKey, vPropertyValue*/) {
        if (typeof arguments[2] === "function") {
            return storeSave(oHub, arguments[2]);
        }
        return arguments[2];
    }

    function JSONReviver (oHub /*sKey, vPropertyValue*/) {
        if (typeof arguments[2] === "string" && arguments[2].indexOf("<function") === 0) {
            return storeLoad(oHub, arguments[2]);
        }
        return arguments[2];
    }

    function serialize (oHub, vData, /* optional */ bPretty) {
        if (typeof vData === "object" || typeof vData === "function") {
            try {
                var aStringifyArgs = [vData, JSONReplacer.bind(null, oHub)];
                if (bPretty) {
                    aStringifyArgs.push(3);
                }
                return JSON.stringify.apply(JSON, aStringifyArgs);
            } catch (oError) {
                log("" + oError, oError.stack, serialize);
            }
        }
        return vData;
    }

    function deserialize (oHub, sData) {
        try {
            return JSON.parse(sData, JSONReviver.bind(null, oHub));
        } catch (oError) {
            return sData;
        }
    }

    /*
     * Subscribe a group of subscribers.
     */
    function subscribe (oHub, sEvent, aSubscriberGroup) {
        if (!oHub.subscribers[sEvent]) {
            oHub.subscribers[sEvent] = [];
        }
        oHub.subscribers[sEvent].push(aSubscriberGroup);
    }

    /*
     * Find and unsubscribe a subscriber from the hub using its event handler for searching.
     */
    function unsubscribe (oHub, sEvent, fnHandler) {
        oHub.subscribers[sEvent] = (oHub.subscribers[sEvent] || [])
            .map(function (aSubscriberGroup) {
                return aSubscriberGroup.filter(function (oListener) {
                    return oListener.fn !== fnHandler;
                });
            })
            .filter(function (aGroup) {
                return aGroup.length > 0;
            });
    }

    function createDispatchOperation () {
        var fnDispatchComplete,
            oDispatchPromise = new Promise(function (fnResolve) {
                fnDispatchComplete = fnResolve;
            }),
            oDispatchOperation = {
                dispatching: oDispatchPromise,
                cancelled: false,
                cancel: function () {
                    oDispatchOperation.cancelled = true;
                },
                complete: function () {
                    fnDispatchComplete();
                }
            };

        return oDispatchOperation;
    }

    function dispatchEvent (oHub, sEvent) {
        if (!oHub.subscribers.hasOwnProperty(sEvent)) {
            return null; // no interested parties
        }

        var oDispatchOperation = createDispatchOperation(),
            // -- dispatch
            aSubscriberGroups = oHub.subscribers[sEvent],
            aGroupsDispatchedPromise = aSubscriberGroups.map(function (aSubscriberGroup) {
                return dispatchEventToGroup(oHub, sEvent, aSubscriberGroup, oDispatchOperation, 0);
            });

        Promise.all(aGroupsDispatchedPromise).then(
            oDispatchOperation.complete,
            oDispatchOperation.complete
        );

        return oDispatchOperation;
    }

    function dispatchEventToGroup (oHub, sEvent, aSubscriberGroup, oDispatchOperation, iStartFrom) {
        var iOriginalGroupSize = aSubscriberGroup.length,
            aSubscriberGroupSlice = aSubscriberGroup.slice(iStartFrom);

        return aSubscriberGroupSlice.reduce(
            function (oPreviousHandlerCalledPromise, oSubscriber) {
                return oPreviousHandlerCalledPromise.then(function (bOffCalledFromHandler) {
                    if (oDispatchOperation.cancelled) {
                        if (bOffCalledFromHandler) {
                            unsubscribe(oHub, sEvent, oSubscriber.fn); // don't notify next listener in the group
                        }
                        return bOffCalledFromHandler;
                    }
                    return notifySubscriber(oHub, sEvent, oSubscriber, aSubscriberGroup)
                        .then(function (bSubscriberCallbackCalledOff) {
                            // -- off call detected
                            if (bSubscriberCallbackCalledOff) {
                                oDispatchOperation.cancelled = true;
                            }
                            return bSubscriberCallbackCalledOff;
                        });
                });
            },
            Promise.resolve(false /* Off called from handler */)
        ).then(function (bHandlerCalledOff) {
            // if listeners called do inside a do, the group size increases
            if (!bHandlerCalledOff && iOriginalGroupSize < aSubscriberGroup.length) {
                // dispatch to remaining
                return dispatchEventToGroup(oHub, sEvent, aSubscriberGroup, oDispatchOperation, iOriginalGroupSize);
            }
            return bHandlerCalledOff;
        });
    }

    function notifySubscriber (oHub, sEvent, oSubscriber, aSubscriberGroup) {
        return new Promise(function (fnResolve) {
            var vDeserializedValue = deserialize(oHub, oHub.pendingEvents[sEvent]);
            var iDispatchTimeoutId = setTimeout(function () {
                oHub.dispatchTimeoutIds.delete(iDispatchTimeoutId);

                if (oSubscriber.called && aSubscriberGroup.offed) {
                    fnResolve(false);
                    return;
                }
                oSubscriber.called = true;

                // check handler was offed as late as possible to allow off before the call
                var bOffBeforeCall = aSubscriberGroup.offed;
                safeCall(sEvent, oSubscriber.fn, vDeserializedValue);
                var bOffAfterCall = aSubscriberGroup.offed;

                // -- unsubscribe offed subscriber after the call as it was already called and offed
                if (bOffAfterCall) {
                    unsubscribe(oHub, sEvent, oSubscriber.fn);
                }

                fnResolve(!bOffBeforeCall && bOffAfterCall);
            }, 0);
            oHub.dispatchTimeoutIds.add(iDispatchTimeoutId);
        });
    }

    function createFnOff (oHub, sEvent, aSubscriberGroup) {
        /*
         * When off is called, it immediately removes any subscribed listener that was already called.
         */
        return function () {
            aSubscriberGroup.forEach(function (oListener) {
                if (oListener.called) {
                    unsubscribe(oHub, sEvent, oListener.fn);
                }
            });

            // note: offs any current and future listener
            aSubscriberGroup.offed = true;

            return { off: createFnOff(oHub, sEvent, []) };
        };
    }

    function createFnDo (oHub, sEvent, aSubscriberGroup) {
        /*
         * Create a new subscriber and add it to the given subscriber group.
         */
        return function (fnCallback) {
            var oSubscriber = {
                fn: fnCallback,
                called: false
            };

            // The dispatching process picks up and calls this listener if dispatching is ongoing.
            aSubscriberGroup.push(oSubscriber);

            if (oHub.pendingEvents.hasOwnProperty(sEvent)) {
                // check if event is being dispatched already
                var oDispatchOperation = oHub.dispatchOperations[sEvent];
                if (!oDispatchOperation) {
                    notifySubscriber(oHub, sEvent, oSubscriber, aSubscriberGroup);
                } else {
                    /*
                     * This subscriber is not called if during dispatching if it was added to another subscriber group.
                     * This is the case in situations like:
                     *
                     *   EventHub.on("Event")  [ group A ]
                     *        .do( ... )
                     *        .do( ... )
                     *        ...
                     *
                     *   EventHub.on("Event")  [ group B ]
                     *        .do( ... )
                     *        ...
                     *
                     * Expectation is that sequence is kept during dispatching.
                     * So we wait on the ongoing dispatching operation and continue afterwards.
                     */
                    oDispatchOperation.dispatching.then(function () {
                        if (!oSubscriber.called) {
                            notifySubscriber(oHub, sEvent, oSubscriber, aSubscriberGroup);
                        }
                    });
                }
            }

            return {
                do: createFnDo(oHub, sEvent, aSubscriberGroup),
                off: createFnOff(oHub, sEvent, aSubscriberGroup)
            };
        };
    }

    /* --- API --- */

    /**
     * Subscribes any future subscriber to a certain event.
     *
     * Internally, pushes a group of subscribers onto the 'subscribers' queue.
     * This group is associated to the "on" call. The group has the following properties:
     *
     * - "off": indicates that #off was called on behalf of the whole group.
     *   Indicating that if a handler was already called it shouldn't be called ever again.
     *
     * @return {object} a Doable
     */
    function on (oHub, sEvent) {
        var aSubscriberGroup = [];
        subscribe(oHub, sEvent, aSubscriberGroup);

        return {
            do: createFnDo(oHub, sEvent, aSubscriberGroup),
            off: createFnOff(oHub, sEvent, aSubscriberGroup)
        };
    }

    function once (oHub, sEvent) {
        var oDoable = on(oHub, sEvent);
        oDoable.off();
        return oDoable;
    }

    /*
     * Emit an event - it really does only if data have changed.
     *
     * Event data are updated immediately.
     * When new data enter, any pending dispatching is interrupted and a new (asyncronous) dispatching takes place.
     */
    function emit (oHub, sEvent, oData, bForce) {
        var sSerializedData = serialize(oHub, oData);

        if (!bForce && oHub.pendingEvents.hasOwnProperty(sEvent)
            && oHub.pendingEvents[sEvent] === sSerializedData) {

            return this; // same data -> no need to emit again
        }
        oHub.pendingEvents[sEvent] = sSerializedData;

        var oDispatchOperation = oHub.dispatchOperations[sEvent];
        if (oDispatchOperation) {
            oDispatchOperation.cancel();
        }

        var oNewDispatchOperation = dispatchEvent(oHub, sEvent);
        oHub.dispatchOperations[sEvent] = oNewDispatchOperation;

        return this;
    }

    function last (oHub, sEvent) {
        return deserialize(oHub, oHub.pendingEvents[sEvent]);
    }

    function join (/*oHub, args*/) {
        var aArgDoables = Array.prototype.slice.call(arguments);
        aArgDoables.shift(); // oHub

        var iCount = 0,
            aOneTimeCounts = new Array(aArgDoables.length)
                .join(",")
                .split(",")
                .map(function () {
                    return 1;
                }),
            aEventValues = [],
            oDoable = {
                do: function (fnCallback) {
                    aArgDoables.forEach(function (oArgDoable, iIdx) {
                        oArgDoable.do(function (iIdx, vValue) {
                            aEventValues[iIdx] = vValue;

                            iCount += aOneTimeCounts[iIdx];
                            aOneTimeCounts[iIdx] = 0; // never add again

                            if (iCount === aArgDoables.length) {
                                fnCallback.apply(null, aEventValues);
                            }
                        }.bind(null, iIdx));
                    });

                    return { off: oDoable.off }; // don't allow chaining
                },
                off: function () {
                    var fnOff = aArgDoables.reduce(function (fnOff, oArgDoable) {
                        return oArgDoable.off();
                    }, function () { });

                    return { off: fnOff };
                }
            };

        return oDoable; // allow to call do after join
    }

    function wait (oHub, sEvent) {
        var oDispatchOperation = oHub.dispatchOperations[sEvent];

        return oDispatchOperation
            ? oDispatchOperation.dispatching
            : Promise.resolve();
    }

    function storeSave (oHub, vObject) {
        if (oHub.store.objectToKey.has(vObject)) {
            return oHub.store.objectToKey.get(vObject);
        }

        oHub.store.nextKey++;
        var sKey = "<" + typeof vObject + ">#" + oHub.store.nextKey;
        oHub.store.keyToObject[sKey] = vObject;
        oHub.store.objectToKey.set(vObject, sKey);

        return sKey;
    }

    function storeLoad (oHub, sKey) {
        return oHub.store.keyToObject[sKey];
    }

    function createEventHub (oHub) {
        var oEventHub = {};

        oEventHub.emit = emit.bind(oEventHub, oHub);
        oEventHub.on = on.bind(null, oHub);
        oEventHub.once = once.bind(null, oHub);
        oEventHub.last = last.bind(null, oHub);
        oEventHub.join = join.bind(null, oHub);
        oEventHub.wait = wait.bind(null, oHub);

        // for testing only
        oEventHub._reset = function (oHub) {
            oHub.pendingEvents = {};
            oHub.subscribers = {};
            oHub.dispatchOperations = {};
            oHub.store = createEmptyStore();

            oHub.dispatchTimeoutIds.forEach(clearTimeout);
            oHub.dispatchTimeoutIds = new window.Set();
        }.bind(null, oHub);

        return oEventHub;
    }

    function createChannel (oContract) {
        var oEventHubData = {
            pendingEvents: {},
            subscribers: {},
            dispatchOperations: {},
            store: createEmptyStore(),
            dispatchTimeoutIds: new window.Set()
        },
            oEventHub = createEventHub(oEventHubData),
            oContractClone = deserialize(oEventHubData, serialize(oEventHubData, oContract));

        function parsePath (sPath) {
            var sSeparator = sPath.charAt(0);
            if (sSeparator.match(/[a-zA-Z0-9]/)) {
                throw new Error("Invalid path separator '" + sSeparator + "'. Please ensure path starts with a non alphanumeric character");
            }

            var aPath = sPath.split(sSeparator);
            aPath.shift(); // initial separator character
            return aPath;
        }

        function serializePath (vPrefixOrPath, aMaybePath) {
            var aPath = vPrefixOrPath,
                sPrefix = "";
            if (arguments.length === 2) {
                aPath = aMaybePath;
                sPrefix = vPrefixOrPath;
            }
            return sPrefix + "/" + aPath.join("/");
        }

        function isArray (v) {
            return Object.prototype.toString.apply(v) === "[object Array]";
        }

        function isPrimitive (v) {
            return Object(v) !== v;
        }

        function isEmpty (v) {
            return (isArray(v) ? v.length : Object.keys(v).length) === 0;
        }

        function setObjectValue (oDef, vObject, aPath, vValue) {
            var sPathSoFar = "",
                oDefSoFar = oDef,
                aPathsWritten = [];

            aPath.reduce(function (oCurrentObject, sKey, iIdx) {
                sPathSoFar = serializePath(sPathSoFar, [sKey]);
                oDefSoFar = oDefSoFar[sKey];

                if (iIdx === aPath.length - 1) {
                    if (!isPrimitive(vValue) && !isPrimitive(oDefSoFar) && Object.keys(oDefSoFar).length > 0) {
                        // Before writing, we need to check that the structure of the value we want to override allows it.
                        var sExampleValue,
                            oRemainingPaths = Object.keys(oDefSoFar).reduce(function (o, sKey) {
                                o[sKey] = true;
                                return o;
                            }, {}),
                            bKeysNotInContractOrNonEmpty = Object.keys(vValue).some(function (sKey) {
                                sExampleValue = sKey;

                                var bFoundInDef = oRemainingPaths.hasOwnProperty(sKey);
                                delete oRemainingPaths[sKey];

                                var bNonEmptyComplexType = !isPrimitive(oDefSoFar[sKey]) && Object.keys(oDefSoFar[sKey]).length > 0;

                                return !bFoundInDef || bNonEmptyComplexType;
                            }),
                            bMissingKeys = (Object.keys(oRemainingPaths).length > 0),
                            bIsOverrideForbidden = (bKeysNotInContractOrNonEmpty || bMissingKeys);
                        if (bIsOverrideForbidden) {
                            var sReason = bKeysNotInContractOrNonEmpty
                                ? "One or more values are not defined in the channel contract or are defined as a non-empty object/array, for example, check '" + sExampleValue + "'."
                                : "Some keys are missing in the event data: " + Object.keys(oRemainingPaths).join(", ") + ".";

                            throw new Error("Cannot write value '" + serialize(oEventHubData, vValue, true /* bPretty */) + "' to path '" + sPathSoFar + "'. "
                                + sReason
                                + " All childrens in the value must appear in the channel contract and must have a simple value or should be defined as an empty complex value");
                        }

                        var aAllPathsForValue = Object.keys(vValue).map(function (sKey) {
                            return {
                                serializedPath: serializePath(sPathSoFar, [sKey]),
                                value: vValue[sKey]
                            };
                        });

                        Array.prototype.push.apply(aPathsWritten, aAllPathsForValue);
                    }

                    // Checks passed.
                    oCurrentObject[sKey] = vValue;
                } else if (!oCurrentObject.hasOwnProperty(sKey)) {
                    // we must create based on definition
                    oCurrentObject[sKey] = isArray(oDefSoFar) ? [] : {};
                }

                aPathsWritten.push({
                    serializedPath: sPathSoFar,
                    value: oCurrentObject[sKey]
                });

                return oCurrentObject[sKey];
            }, vObject);

            return aPathsWritten;
        }

        function getObjectValue (oObjectOrArray, aPath) {
            var sPathSoFar = "",
                oLastItem = aPath.reduce(function (oCurrentObject, sKey) {
                    sPathSoFar += "/" + sKey;

                    if (isArray(oCurrentObject) && !sKey.match(/^[0-9]+$/)) {
                        throw new Error("Invalid array index '" + sKey + "' provided in path '" + sPathSoFar + "'");
                    }

                    if (!oCurrentObject.hasOwnProperty(sKey)) {
                        throw new Error("The item '" + sKey + "' from path " + sPathSoFar + " cannot be accessed in the object: " + serialize(oEventHubData, oCurrentObject));
                    }

                    return oCurrentObject[sKey];
                }, oObjectOrArray);
            return oLastItem;
        }

        function getObjectValueOrDefault (oObjectOrArray, aPath, vDefault) {
            return aPath.reduce(function (oCurrentObject, sKey, iIdx) {
                var bLast = iIdx === (aPath.length - 1);
                if (oCurrentObject.hasOwnProperty(sKey)) {
                    return oCurrentObject[sKey];
                }
                return bLast ? vDefault : {};
            }, oObjectOrArray);
        }

        function getParentValues (oObject, aPath) {
            aPath.pop(); // we want to return only the *parent* paths.

            var oValueSoFar = oObject,
                aPathSoFar = [];

            return aPath.reduce(function (aParentValues, sPathSegment) {
                oValueSoFar = oValueSoFar[sPathSegment];
                aPathSoFar.push(sPathSegment);
                aParentValues.push({
                    serializedPath: serializePath(aPathSoFar),
                    value: oValueSoFar
                });
                return aParentValues;
            }, []);
        }

        function findEmittableParentEvents (aAllWrittenValues) {
            return aAllWrittenValues
                .map(function (oParentValue) {
                    var sSerializedPath = oParentValue.serializedPath;

                    if (!oEventHubData.subscribers.hasOwnProperty(sSerializedPath)
                        || oEventHubData.subscribers[sSerializedPath].length === 0) {
                        return null;
                    }

                    return {
                        path: sSerializedPath,
                        value: oParentValue.value
                    };
                })
                .filter(function (oEvents) {
                    return !!oEvents;
                });
        }

        function channelEmit (sPath, vData) {
            var aPath = parsePath(sPath);

            // check if path is valid
            getObjectValue(oContract, aPath); // throws if path is invalid

            // write in the clone
            var aAllPathsAndValuesWritten = setObjectValue(oContract, oContractClone, aPath, vData);

            // Emit in the channel for interested subscribers
            aAllPathsAndValuesWritten.forEach(function (oParentEventInfo) {
                oEventHub.emit(oParentEventInfo.serializedPath, oParentEventInfo.value);
            });
        }

        function channelLast (sPath) {
            var aPath = parsePath(sPath),
                vValueFromOriginalObject = getObjectValue(oContract, aPath); // throws if path is invalid

            return getObjectValueOrDefault(oContractClone, aPath, vValueFromOriginalObject);
        }

        function channelOn (sPath) {
            // publish event if we did not publish it before and there is a value in the object.
            var aPath = parsePath(sPath),
                sSerializedPath = serializePath(aPath),
                // ensure on is called on an existing path
                vLastChangedValue = oEventHub.last(sSerializedPath),
                bValueWasChanged = oEventHubData.pendingEvents.hasOwnProperty(sSerializedPath);
            if (bValueWasChanged) {
                return oEventHub.on(sSerializedPath);
            }

            // emit the value from the original object
            vLastChangedValue = getObjectValue(oContract, aPath);
            if (typeof vLastChangedValue !== "undefined"
                && (isPrimitive(vLastChangedValue)
                    || !isEmpty(deserialize(oEventHub, serialize(oEventHub, vLastChangedValue))))
            ) {
                oEventHub.emit(sSerializedPath, vLastChangedValue);
            }

            return oEventHub.on(sSerializedPath);
        }

        function channelOnce (sPath) {
            var oDoable = channelOn(sPath);
            oDoable.off();
            return oDoable;
        }

        function channelWait (sPath) {
            var aPath = parsePath(sPath),
                aParentValues = getParentValues(oContractClone, aPath),
                aWaitPromises = findEmittableParentEvents(aParentValues).map(function (oParentEventInfo) {
                    return oEventHub.wait(oParentEventInfo.path, oParentEventInfo.value);
                });
            return Promise.all(aWaitPromises.concat(oEventHub.wait(sPath)));
        }

        return {
            emit: channelEmit,
            on: channelOn,
            once: channelOnce,
            last: channelLast,
            wait: channelWait,
            join: join.bind(null, oEventHub)
        };
    }

    var oExport = createEventHub(_oHub);
    oExport.createChannel = createChannel.bind(null);

    return oExport;
});
