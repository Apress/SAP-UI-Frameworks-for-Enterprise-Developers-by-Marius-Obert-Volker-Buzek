// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";
    /**
     * Creates a limited buffer of iCapacity entries
     *
     * LimitedBuffer A collection implemented as a circular array
     * for storing key, value tuples.
     *
     * Values are added at the "end" of the circular buffer,
     * overwriting present values.
     * Lookup by key is done in reverse order.
     * @param {integer} iCapacity The capacity
     * @constructor
     * @class
     * @since 1.28.0
     * @private
     */
    function LimitedBuffer (iCapacity) {
        this.index = -1;
        this.capacity = iCapacity;
        this.array = [];
    }

    /**
     * Method to clear the buffer, only for testing!
     *
     * @private
     * @since 1.28.0
     */
    LimitedBuffer.prototype._clear = function () {
        this.array = [];
        this.index = -1;
    };

    /**
     * Method to add a specific key, value pair to the LimitedBuffer
     *
     * @param {string} sKey the key
     * @param {string} sValue the value
     *
     * @private
     * @since 1.28.0
     */
    LimitedBuffer.prototype.addAsHead = function (sKey, sValue, iPersistencyMethod, oPersistencySettings) {
        this.index = (this.index + 1) % this.capacity;
        this.array[this.index] = {
            key: sKey,
            value: sValue,
            persistencyMethod: iPersistencyMethod,
            persistencySettings: oPersistencySettings
        };
    };

    /**
     * Method to get the value by a specific key.
     *
     * Lookup is in reverse order of creation
     *
     * @param {string} sKey
     *  Key of the specific node
     * @returns {object}  { key, value }
     * if found, otherwise undefined
     * @private
     * @since 1.28.0
     */
    LimitedBuffer.prototype.getByKey = function (sKey) {
        var i,
            effectiveIdx;
        // we search backward from index.
        // As we add a new application state as a new head element,
        // it's to be assumed that we find the required application state rather
        // in the beginning of the LinkedList
        for (i = 0; i <= this.capacity - 1; i = i + 1) {
            effectiveIdx = (this.capacity + this.index - i) % this.capacity;
            if (this.array[effectiveIdx] && this.array[effectiveIdx].key === sKey) {
                return this.array[effectiveIdx];
            }
        }
        return undefined;
    };

    /**
     * Method to delete the value by a specific key.
     *
     * Lookup is in reverse order of creation
     *
     * @param {string} sKey
     *  Key of the specific node
     * @returns {boolean}  indication is the state with that key was found and deleted or not
     * if found, otherwise undefined
     * @private
     * @since 1.69.0
     */
    LimitedBuffer.prototype.deleteByKey = function (sKey) {
        var i,
            effectiveIdx,
            bRes = false;
        for (i = 0; i <= this.capacity - 1; i = i + 1) {
            effectiveIdx = (this.capacity + this.index - i) % this.capacity;
            if (this.array[effectiveIdx] && this.array[effectiveIdx].key === sKey) {
                delete this.array[effectiveIdx];
                //do not return as key can be more than once
                bRes = true;
            }
        }
        return bRes;
    };

    return LimitedBuffer;
});
