// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview handle all the resources for the different applications.
 * @version 1.113.0
 */
sap.ui.define([], function () {
    "use strict";

    function Storage () {
        var oCacheStorage,
            fnEvictCB;

        function LRU(limit) {
            this.size = 0;
            if (typeof limit == "number") {
                this.limit = limit;
            } else {
                this.limit = 10;
            }
            this.map = {};
            this.head = null;
            this.tail = null;
        }

        LRU.prototype.LRUnode = function(key, value) {
            if (typeof key != "undefined" && key !== null) {
                this.key = key;
            }
            if (typeof value != "undefined" && value !== null) {
                this.value = value;
            }
            this.prev = null;
            this.next = null;
        };

        LRU.prototype.setHead = function(node) {
            node.next = this.head;
            node.prev = null;
            if (this.head !== null) {
                this.head.prev = node;
            }
            this.head = node;
            if (this.tail === null) {
                this.tail = node;
            }
            this.size++;
            this.map[node.key] = node;
        };

        /* Change or add a new value in the cache
         * We overwrite the entry if it already exists
         */
        LRU.prototype.set = function(key, value) {
            var node = new LRU.prototype.LRUnode(key, value);

            if (this.map[key]) {
                this.map[key].value = node.value;
                this.remove(node.key);
            } else if (this.size >= this.limit) {
                var oEvictObj = this.map[this.tail.key];

                delete this.map[this.tail.key];
                this.size--;
                this.tail = this.tail.prev;
                this.tail.next = null;

                if (fnEvictCB) {
                    fnEvictCB(oEvictObj);
                }
            }
            this.setHead(node);
        };

        /* Retrieve a single entry from the cache */
        LRU.prototype.get = function(key) {
            if (this.map[key]) {
                var value = this.map[key].value;
                var node = new LRU.prototype.LRUnode(key, value);
                this.remove(key);
                this.setHead(node);
                return value;
            } else {
                return null;
            }
        };

        /* Remove a single entry from the cache */
        LRU.prototype.remove = function(key) {
            var node = this.map[key];
            if (node.prev !== null) {
                node.prev.next = node.next;
            } else {
                this.head = node.next;
            }
            if (node.next !== null) {
                node.next.prev = node.prev;
            } else {
                this.tail = node.prev;
            }
            delete this.map[key];
            this.size--;
        };

        /* Resets the entire cache - Argument limit is optional to be reset */
        LRU.prototype.removeAll = function (limit) {
            this.size = 0;
            this.map = {};
            this.head = null;
            this.tail = null;
            if (typeof limit == "number") {
                this.limit = limit;
            }
        };

        /* Traverse through the cache elements using a callback function
         * Returns args [node element, element number, cache instance] for the callback function to use
         */
        LRU.prototype.forEach = function (callback) {
            var node = this.head,
                i = 0;

            while (node) {
                callback.apply(this, [node, i, this]);
                i++;
                node = node.next;
            }
        };

        /* Returns a JSON representation of the cache */
        LRU.prototype.toJSON = function () {
            var json = [],
                node = this.head;

            while (node) {
                json.push({
                    key : node.key,
                    value : node.value
                });
                node = node.next;
            }
            return json;
        };

        /* Returns a String representation of the cache */
        LRU.prototype.toString = function () {
            var s = '',
                node = this.head;

            while (node) {
                s += String(node.key)+':'+node.value;
                node = node.next;
                if (node) {
                    s += '\n';
                }
            }
            return s;
        };

        //API:
        //
        //LRU(limit)
        //  Initialize LRU cache with default limit being 10 items
        this.init = function (iLRUSize, infnEvictCB) {
            oCacheStorage = new LRU(iLRUSize);
            fnEvictCB = infnEvictCB;
        };

        //get(key)
        //  Retrieve a single entry from the cache
        this.get = function (key) {
            return oCacheStorage.get(key);
        } ;

        //set(key, value)
        //  Change or add a new value in the cache
        //  We overwrite the entry if it already exists
        this.set = function (key, value) {
            oCacheStorage.set(key, value);
        } ;

        //remove(key)
        //  Remove a single entry from the cache
        this.remove = function (key) {
            oCacheStorage.remove(key);
        } ;

        //removeAll()
        //  Resets the entire cache
        //  Argument limit is optional to be reset

        //forEach(function(){})
        //  Traverse through the cache elements using a callback function
        //  Returns args [node element, element number, cache instance] for the callback function to use
        this.forEach = function (callback) {
            oCacheStorage.forEach(callback);
        };

        this.length = function () {
            return oCacheStorage.size;
        };

        //toJSON()
        //  Returns a JSON representation of the cache

        //toString()
        //  Returns a String representation of the cache

    }


    return new Storage();
}, /* bExport= */ true);
