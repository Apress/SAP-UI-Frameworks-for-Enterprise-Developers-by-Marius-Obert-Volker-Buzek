/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// tools extensions for VBI namespace

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.QuadTree = function(maxQuadItems, maxLOD, rect) {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	// quadrants
	// ---------
	// | 0 | 1 |
	// | ------|
	// | 2 | 3 |
	// ---------
	// constants for quadrants................................................//
	var LT = 0, RT = 1, LB = 2, RB = 3, OUT = 4;

	// quad creator...........................................................//
	var quad = function(rc, depth, maxQuadItems, maxLOD) {
		var quads = []; // array of quadrants
		var items = []; // array of items

		// returns the quad object.............................................//
		return {
			// functions...............................................//
			// query using callback....................................//
			quc: function(rect, cb) {
				var tmp;
				for (var nJ = 0, len = items.length; nJ < len; ++nJ) {
					// the item might be located on a division line......//
					tmp = items[nJ];
					if (tmp[0] > rect[2] || tmp[2] < rect[0] || tmp[1] > rect[3] || tmp[3] < rect[1]) {
						continue;
					}
					cb(tmp);
				}

				// iterate through quads................................//
				// to get the sub items.................................//
				if (quads.length) {
					// call query on all matching subquads
					// this.calcIntersectingNodes( rect, function( dir ) { quads[dir].quc( rect, cb ); } );
					// todo: remove function
					// this.calcIntersectingNodes( rect, function( dir ) { quads[dir].quc( rect, cb ); } );
					this.calcIntersectingNodes(rect, cb);
				}
			},

			// query using array.......................................//
			qua: function(rect, a) {
				this.quc(rect, function(item) {
					a.push(item);
				});
			},

			// detect the quads that are affected......................//
			calcIntersectingNodes: function(rect, cb) {
				// h2, w2 half of height and half of width
				var l = rc[0], t = rc[1], w2 = (rc[2] - l) / 2.0, h2 = (rc[3] - t) / 2.0;

				if (rect[0] < l + w2) { // left side
					if (rect[1] < t + h2) {
						quads[LT].quc(rect, cb);
					}
					// cb( LT ); // top
					if (rect[3] >= t + h2) {
						quads[LB].quc(rect, cb);
					}
					// cb( LB ); // bottom
				}
				if (rect[2] >= l + w2) {// right side
					if (rect[1] < t + h2) {
						quads[RT].quc(rect, cb);
					}
					// cb( RT ); // top
					if (rect[3] >= t + h2) {
						quads[RB].quc(rect, cb);
					}
					// cb( RB ); // bottom
				}
			},

			// find the quadrant where the rect fits...................//
			// when there is an intersection at the border, it reports.//
			// an out..................................................//
			calcQuadrant: function(rect) {
				var l, t, w2 = ((rc[2] - (l = rc[0])) / 2.0), h2 = ((rc[3] - (t = rc[1])) / 2.0);

				// left quadrants.......................................//
				if (rect[2] < l + w2) {
					if (rect[3] < t + h2) {
						return LT;
					}
					if (rect[1] >= t + h2) {
						return LB;
					}
					return OUT;
				}

				// right quadrants......................................//
				if (rect[0] >= l + w2) {
					if (rect[3] < t + h2) {
						return RT;
					}
					if (rect[1] >= t + h2) {
						return RB;
					}
					return OUT;
				}

				return OUT;
			},

			subdivide: function() {
				var cx = rc[0]; // current x
				var cy = rc[1]; // current y

				// split the quad into the 4 quadrants..................//
				var width = ((rc[2] - cx) / 2.0), height = ((rc[3] - cy) / 2.0);
				var childrenDepth = ++this.m_D;

				var l, t;
				// set new quad, left top, right top, left bottom, right bottom
				quads[LT] = quad([
					l = cx, t = cy, l + width, t + height
				], childrenDepth, maxQuadItems, maxLOD); // left top
				quads[RT] = quad([
					l = cx + width, t = cy, l + width, t + height
				], childrenDepth, maxQuadItems, maxLOD); // right top
				quads[LB] = quad([
					l = cx, t = cy + height, l + width, t + height
				], childrenDepth, maxQuadItems, maxLOD); // left bottom
				quads[RB] = quad([
					l = cx + width, t = cy + height, l + width, t + height
				], childrenDepth, maxQuadItems, maxLOD); // right bottom

				// remember the current item............................//
				var tmp = items;
				items = []; // clear current items....//

				// insert them again into the subquads..................//
				for (var nJ = 0, len = tmp.length; nJ < len; ++nJ) {
					this.insert(tmp[nJ]);
				}
			},

			// insert an item..........................................//
			insert: function(rect) {
				var res;
				if (quads.length) {
					// quadrants are available...........................//
					// determine the quadrant to place the item..........//
					if ((res = this.calcQuadrant(rect)) == OUT) {
						// add it as child................................//
						items.push(rect);
					} else {
						quads[res].insert(rect);
					}
				} else {
					// add it to the item list...........................//
					items.push(rect); // just add it to the items.....//

					// subdivide as long as limits are not reached.......//
					if (items.length > maxQuadItems && this.m_D < maxLOD) {
						this.subdivide();
					}
				}
			},

			// clear content...........................................//
			clear: function() {
				for (var nJ = 0, len = quads.length; nJ < len; ++nJ) {
					quads[nJ].clear();
				}
				items.length = 0;
				quads.length = 0;
			},

			// access the quads........................................//
			getNodes: function() {
				return quads.length ? quads : null;
			},

			// quad members............................................//
			m_R: rc, // rectangle of node
			m_D: depth
		// nesting level of node

		}; // end of quad object return
	}; // end of quad constructor function

	return {
		// members.......................................................//
		insertArray: function(item) {
			for (var nJ = 0, len = item.length; nJ < len; ++nJ) {
				this.m_Root.insert(item[nJ]);
			}
		},

		// members.......................................................//
		insert: function(rect) {
			this.m_Root.insert(rect);
		},

		// this query returns an array of potentially fitting items......//
		queryArray: function(rect, a) {
			return this.m_Root.qua(rect, a);
		},

		// this array does a callback on fitting items...................//
		queryCallback: function(rect, cb) {
			return this.m_Root.quc(rect, cb);
		},

		clear: function() {
			this.m_Root.clear();
		},

		// the root quad itself is a quad................................//
		m_Root: (function() {
			return quad(rect, 0, maxQuadItems, maxLOD);
		})()
	};
};

});
