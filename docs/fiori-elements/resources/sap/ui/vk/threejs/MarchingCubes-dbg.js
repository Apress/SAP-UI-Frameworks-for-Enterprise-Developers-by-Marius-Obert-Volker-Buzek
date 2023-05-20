/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([
], function() {
	"use strict";

	var edgeTable = new Uint32Array([
		0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
		0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
		0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
		0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
		0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
		0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
		0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
		0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
		0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
		0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
		0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
		0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
		0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
		0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
		0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
		0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
		0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
		0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
		0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
		0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
		0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
		0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
		0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
		0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
		0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
		0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
		0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
		0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
		0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
		0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
		0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
		0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0]
	);

	var triTable = [
		[],
		[0, 8, 3],
		[0, 1, 9],
		[1, 8, 3, 9, 8, 1],
		[1, 2, 10],
		[0, 8, 3, 1, 2, 10],
		[9, 2, 10, 0, 2, 9],
		[2, 8, 3, 2, 10, 8, 10, 9, 8],
		[3, 11, 2],
		[0, 11, 2, 8, 11, 0],
		[1, 9, 0, 2, 3, 11],
		[1, 11, 2, 1, 9, 11, 9, 8, 11],
		[3, 10, 1, 11, 10, 3],
		[0, 10, 1, 0, 8, 10, 8, 11, 10],
		[3, 9, 0, 3, 11, 9, 11, 10, 9],
		[9, 8, 10, 10, 8, 11],
		[4, 7, 8],
		[4, 3, 0, 7, 3, 4],
		[0, 1, 9, 8, 4, 7],
		[4, 1, 9, 4, 7, 1, 7, 3, 1],
		[1, 2, 10, 8, 4, 7],
		[3, 4, 7, 3, 0, 4, 1, 2, 10],
		[9, 2, 10, 9, 0, 2, 8, 4, 7],
		[2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4],
		[8, 4, 7, 3, 11, 2],
		[11, 4, 7, 11, 2, 4, 2, 0, 4],
		[9, 0, 1, 8, 4, 7, 2, 3, 11],
		[4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1],
		[3, 10, 1, 3, 11, 10, 7, 8, 4],
		[1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4],
		[4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3],
		[4, 7, 11, 4, 11, 9, 9, 11, 10],
		[9, 5, 4],
		[9, 5, 4, 0, 8, 3],
		[0, 5, 4, 1, 5, 0],
		[8, 5, 4, 8, 3, 5, 3, 1, 5],
		[1, 2, 10, 9, 5, 4],
		[3, 0, 8, 1, 2, 10, 4, 9, 5],
		[5, 2, 10, 5, 4, 2, 4, 0, 2],
		[2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8],
		[9, 5, 4, 2, 3, 11],
		[0, 11, 2, 0, 8, 11, 4, 9, 5],
		[0, 5, 4, 0, 1, 5, 2, 3, 11],
		[2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5],
		[10, 3, 11, 10, 1, 3, 9, 5, 4],
		[4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10],
		[5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3],
		[5, 4, 8, 5, 8, 10, 10, 8, 11],
		[9, 7, 8, 5, 7, 9],
		[9, 3, 0, 9, 5, 3, 5, 7, 3],
		[0, 7, 8, 0, 1, 7, 1, 5, 7],
		[1, 5, 3, 3, 5, 7],
		[9, 7, 8, 9, 5, 7, 10, 1, 2],
		[10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3],
		[8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2],
		[2, 10, 5, 2, 5, 3, 3, 5, 7],
		[7, 9, 5, 7, 8, 9, 3, 11, 2],
		[9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11],
		[2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7],
		[11, 2, 1, 11, 1, 7, 7, 1, 5],
		[9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11],
		[5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0],
		[11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0],
		[11, 10, 5, 7, 11, 5],
		[10, 6, 5],
		[0, 8, 3, 5, 10, 6],
		[9, 0, 1, 5, 10, 6],
		[1, 8, 3, 1, 9, 8, 5, 10, 6],
		[1, 6, 5, 2, 6, 1],
		[1, 6, 5, 1, 2, 6, 3, 0, 8],
		[9, 6, 5, 9, 0, 6, 0, 2, 6],
		[5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8],
		[2, 3, 11, 10, 6, 5],
		[11, 0, 8, 11, 2, 0, 10, 6, 5],
		[0, 1, 9, 2, 3, 11, 5, 10, 6],
		[5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11],
		[6, 3, 11, 6, 5, 3, 5, 1, 3],
		[0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6],
		[3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9],
		[6, 5, 9, 6, 9, 11, 11, 9, 8],
		[5, 10, 6, 4, 7, 8],
		[4, 3, 0, 4, 7, 3, 6, 5, 10],
		[1, 9, 0, 5, 10, 6, 8, 4, 7],
		[10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4],
		[6, 1, 2, 6, 5, 1, 4, 7, 8],
		[1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7],
		[8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6],
		[7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9],
		[3, 11, 2, 7, 8, 4, 10, 6, 5],
		[5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11],
		[0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6],
		[9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6],
		[8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6],
		[5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11],
		[0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7],
		[6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9],
		[10, 4, 9, 6, 4, 10],
		[4, 10, 6, 4, 9, 10, 0, 8, 3],
		[10, 0, 1, 10, 6, 0, 6, 4, 0],
		[8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10],
		[1, 4, 9, 1, 2, 4, 2, 6, 4],
		[3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4],
		[0, 2, 4, 4, 2, 6],
		[8, 3, 2, 8, 2, 4, 4, 2, 6],
		[10, 4, 9, 10, 6, 4, 11, 2, 3],
		[0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6],
		[3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10],
		[6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1],
		[9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3],
		[8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1],
		[3, 11, 6, 3, 6, 0, 0, 6, 4],
		[6, 4, 8, 11, 6, 8],
		[7, 10, 6, 7, 8, 10, 8, 9, 10],
		[0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10],
		[10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0],
		[10, 6, 7, 10, 7, 1, 1, 7, 3],
		[1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7],
		[2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9],
		[7, 8, 0, 7, 0, 6, 6, 0, 2],
		[7, 3, 2, 6, 7, 2],
		[2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7],
		[2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7],
		[1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11],
		[11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1],
		[8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6],
		[0, 9, 1, 11, 6, 7],
		[7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0],
		[7, 11, 6],
		[7, 6, 11],
		[3, 0, 8, 11, 7, 6],
		[0, 1, 9, 11, 7, 6],
		[8, 1, 9, 8, 3, 1, 11, 7, 6],
		[10, 1, 2, 6, 11, 7],
		[1, 2, 10, 3, 0, 8, 6, 11, 7],
		[2, 9, 0, 2, 10, 9, 6, 11, 7],
		[6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8],
		[7, 2, 3, 6, 2, 7],
		[7, 0, 8, 7, 6, 0, 6, 2, 0],
		[2, 7, 6, 2, 3, 7, 0, 1, 9],
		[1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6],
		[10, 7, 6, 10, 1, 7, 1, 3, 7],
		[10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8],
		[0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7],
		[7, 6, 10, 7, 10, 8, 8, 10, 9],
		[6, 8, 4, 11, 8, 6],
		[3, 6, 11, 3, 0, 6, 0, 4, 6],
		[8, 6, 11, 8, 4, 6, 9, 0, 1],
		[9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6],
		[6, 8, 4, 6, 11, 8, 2, 10, 1],
		[1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6],
		[4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9],
		[10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3],
		[8, 2, 3, 8, 4, 2, 4, 6, 2],
		[0, 4, 2, 4, 6, 2],
		[1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8],
		[1, 9, 4, 1, 4, 2, 2, 4, 6],
		[8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1],
		[10, 1, 0, 10, 0, 6, 6, 0, 4],
		[4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3],
		[10, 9, 4, 6, 10, 4],
		[4, 9, 5, 7, 6, 11],
		[0, 8, 3, 4, 9, 5, 11, 7, 6],
		[5, 0, 1, 5, 4, 0, 7, 6, 11],
		[11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5],
		[9, 5, 4, 10, 1, 2, 7, 6, 11],
		[6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5],
		[7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2],
		[3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6],
		[7, 2, 3, 7, 6, 2, 5, 4, 9],
		[9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7],
		[3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0],
		[6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8],
		[9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7],
		[1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4],
		[4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10],
		[7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10],
		[6, 9, 5, 6, 11, 9, 11, 8, 9],
		[3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5],
		[0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11],
		[6, 11, 3, 6, 3, 5, 5, 3, 1],
		[1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6],
		[0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10],
		[11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5],
		[6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3],
		[5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2],
		[9, 5, 6, 9, 6, 0, 0, 6, 2],
		[1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8],
		[1, 5, 6, 2, 1, 6],
		[1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6],
		[10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0],
		[0, 3, 8, 5, 6, 10],
		[10, 5, 6],
		[11, 5, 10, 7, 5, 11],
		[11, 5, 10, 11, 7, 5, 8, 3, 0],
		[5, 11, 7, 5, 10, 11, 1, 9, 0],
		[10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1],
		[11, 1, 2, 11, 7, 1, 7, 5, 1],
		[0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11],
		[9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7],
		[7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2],
		[2, 5, 10, 2, 3, 5, 3, 7, 5],
		[8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5],
		[9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2],
		[9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2],
		[1, 3, 5, 3, 7, 5],
		[0, 8, 7, 0, 7, 1, 1, 7, 5],
		[9, 0, 3, 9, 3, 5, 5, 3, 7],
		[9, 8, 7, 5, 9, 7],
		[5, 8, 4, 5, 10, 8, 10, 11, 8],
		[5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0],
		[0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5],
		[10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4],
		[2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8],
		[0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11],
		[0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5],
		[9, 4, 5, 2, 11, 3],
		[2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4],
		[5, 10, 2, 5, 2, 4, 4, 2, 0],
		[3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9],
		[5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2],
		[8, 4, 5, 8, 5, 3, 3, 5, 1],
		[0, 4, 5, 1, 0, 5],
		[8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5],
		[9, 4, 5],
		[4, 11, 7, 4, 9, 11, 9, 10, 11],
		[0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11],
		[1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11],
		[3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4],
		[4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2],
		[9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3],
		[11, 7, 4, 11, 4, 2, 2, 4, 0],
		[11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4],
		[2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9],
		[9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7],
		[3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10],
		[1, 10, 2, 8, 7, 4],
		[4, 9, 1, 4, 1, 7, 7, 1, 3],
		[4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1],
		[4, 0, 3, 7, 4, 3],
		[4, 8, 7],
		[9, 10, 8, 10, 11, 8],
		[3, 0, 9, 3, 9, 11, 11, 9, 10],
		[0, 1, 10, 0, 10, 8, 8, 10, 11],
		[3, 1, 10, 11, 3, 10],
		[1, 2, 11, 1, 11, 9, 9, 11, 8],
		[3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9],
		[0, 2, 11, 8, 0, 11],
		[3, 2, 11],
		[2, 3, 8, 2, 8, 10, 10, 8, 9],
		[9, 10, 2, 0, 9, 2],
		[2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8],
		[1, 10, 2],
		[1, 3, 8, 9, 1, 8],
		[0, 9, 1],
		[0, 3, 8],
		[]
	];

	var triCounts = new Uint32Array([
		0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 2, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 3,
		1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 3, 2, 3, 3, 2, 3, 4, 4, 3, 3, 4, 4, 3, 4, 5, 5, 2,
		1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 3, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 4,
		2, 3, 3, 4, 3, 4, 2, 3, 3, 4, 4, 5, 4, 5, 3, 2, 3, 4, 4, 3, 4, 5, 3, 2, 4, 5, 5, 4, 5, 2, 4, 1,
		1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 3, 2, 3, 3, 4, 3, 4, 4, 5, 3, 2, 4, 3, 4, 3, 5, 2,
		2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 4, 3, 4, 4, 3, 4, 5, 5, 4, 4, 3, 5, 2, 5, 4, 2, 1,
		2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 2, 3, 3, 2, 3, 4, 4, 5, 4, 5, 5, 2, 4, 3, 5, 4, 3, 2, 4, 1,
		3, 4, 4, 5, 4, 5, 3, 4, 4, 5, 5, 2, 3, 4, 2, 1, 2, 3, 3, 2, 3, 4, 2, 1, 3, 2, 4, 1, 2, 1, 1, 0]);

	var isolevel = 0.75; // todo: what does this value signify?
	var ofs = 0.55; // todo: what does this value signify?
	var vertlist = new Float32Array(36);
	var tmpval;

	var vertexInterp = function(index3, p1x, p1y, p1z, p2x, p2y, p2z, valp1, valp2, bboxCenter, bboxSize) {
		if (Math.abs(isolevel - valp1) < 0.00001) {
			vertlist[index3] = bboxCenter[0] + p1x * bboxSize[0];
			vertlist[index3 + 1] = bboxCenter[1] + p1y * bboxSize[1];
			vertlist[index3 + 2] = bboxCenter[2] + p1z * bboxSize[2];
		} else if (Math.abs(isolevel - valp2) < 0.00001) {
			vertlist[index3] = bboxCenter[0] + p2x * bboxSize[0];
			vertlist[index3 + 1] = bboxCenter[1] + p2y * bboxSize[1];
			vertlist[index3 + 2] = bboxCenter[2] + p2z * bboxSize[2];
		} else if (Math.abs(valp1 - valp2) < 0.00001) {
			vertlist[index3] = bboxCenter[0] + p1x * bboxSize[0];
			vertlist[index3 + 1] = bboxCenter[1] + p1y * bboxSize[1];
			vertlist[index3 + 2] = bboxCenter[2] + p1z * bboxSize[2];
		} else {
			tmpval = (isolevel - valp1) / (valp2 - valp1);
			vertlist[index3] = bboxCenter[0] + (p1x + tmpval * (p2x - p1x)) * bboxSize[0];
			vertlist[index3 + 1] = bboxCenter[1] + (p1y + tmpval * (p2y - p1y)) * bboxSize[1];
			vertlist[index3 + 2] = bboxCenter[2] + (p1z + tmpval * (p2z - p1z)) * bboxSize[2];
		}
	};

	var MarchingCubes = function() { };

	MarchingCubes.march = function(buf, dimensions, bbox, vertices, normals, indices) {
		var bboxCenter = [(bbox[3] + bbox[0]) * 0.5, (bbox[4] + bbox[1]) * 0.5, (bbox[5] + bbox[2]) * 0.5];
		var bboxSize = [bbox[3] - bbox[0], bbox[4] - bbox[1], bbox[5] - bbox[2]];
		var zres2 = dimensions * dimensions;
		var yres = dimensions;
		var dim1 = dimensions - 1;

		var c000, c100, c101, c001, c010, c110, c111, c011;
		var x, y, z, cubeIndex, ti, tlen;
		var modX, modX1, modY, modY1, modZ, modZ1;

		var vcount = 0;
		var icount = 0;
		for (z = -1; z <= dim1; ++z) {
			for (y = -1; y <= dim1; ++y) {
				for (x = -1; x <= dim1; ++x) {
					c000 = (x < 0 || y < 0 || z < 0) ? 0 : buf[z * zres2 + y * yres + x];
					c100 = (x === dim1 || y < 0 || z < 0) ? 0 : buf[z * zres2 + y * yres + x + 1];
					c101 = (x === dim1 || y < 0 || z === dim1) ? 0 : buf[(z + 1) * zres2 + y * yres + x + 1];
					c001 = (x < 0 || y  < 0 || z === dim1) ? 0 : buf[(z + 1) * zres2 + y * yres + x];
					c010 = (x < 0 || y === dim1 || z < 0) ? 0 : buf[z * zres2 + (y + 1) * yres + x];
					c110 = (x === dim1 || y === dim1 || z < 0) ? 0 : buf[z * zres2 + (y + 1) * yres + x + 1];
					c111 = (x === dim1 || y === dim1 || z === dim1) ? 0 : buf[(z + 1) * zres2 + (y + 1) * yres + x + 1];
					c011 = (x < 0 || y === dim1 || z === dim1) ? 0 : buf[(z + 1) * zres2 + (y + 1) * yres + x];

					modX = (x + 1) / dimensions - ofs;
					modX1 = (x + 2) / dimensions - ofs;
					modY = (y + 1) / dimensions - ofs;
					modY1 = (y + 2) / dimensions - ofs;
					modZ = (z + 1) / dimensions - ofs;
					modZ1 = (z + 2) / dimensions - ofs;

					cubeIndex = 0;
					if (c000 > isolevel) { cubeIndex |= 1; }
					if (c100 > isolevel) { cubeIndex |= 2; }
					if (c101 > isolevel) { cubeIndex |= 4; }
					if (c001 > isolevel) { cubeIndex |= 8; }
					if (c010 > isolevel) { cubeIndex |= 16; }
					if (c110 > isolevel) { cubeIndex |= 32; }
					if (c111 > isolevel) { cubeIndex |= 64; }
					if (c011 > isolevel) { cubeIndex |= 128; }

					if (edgeTable[cubeIndex] === 0) {
						continue;
					}
					if (edgeTable[cubeIndex] & 1) {
						vertexInterp(0, modX, modY, modZ, modX1, modY, modZ, c000, c100, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 2) {
						vertexInterp(3, modX1, modY, modZ, modX1, modY, modZ1, c100, c101, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 4) {
						vertexInterp(6, modX1, modY, modZ1, modX, modY, modZ1, c101, c001, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 8) {
						vertexInterp(9, modX, modY, modZ1, modX, modY, modZ, c001, c000, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 16) {
						vertexInterp(12, modX, modY1, modZ, modX1, modY1, modZ, c010, c110, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 32) {
						vertexInterp(15, modX1, modY1, modZ, modX1, modY1, modZ1, c110, c111, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 64) {
						vertexInterp(18, modX1, modY1, modZ1, modX, modY1, modZ1, c111, c011, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 128) {
						vertexInterp(21, modX, modY1, modZ1, modX, modY1, modZ, c011, c010, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 256) {
						vertexInterp(24, modX, modY, modZ, modX, modY1, modZ, c000, c010, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 512) {
						vertexInterp(27, modX1, modY, modZ, modX1, modY1, modZ, c100, c110, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 1024) {
						vertexInterp(30, modX1, modY, modZ1, modX1, modY1, modZ1, c101, c111, bboxCenter, bboxSize);
					}
					if (edgeTable[cubeIndex] & 2048) {
						vertexInterp(33, modX, modY, modZ1, modX, modY1, modZ1, c001, c011, bboxCenter, bboxSize);
					}

					for (ti = 0, tlen = triTable[cubeIndex].length; ti < tlen; ti += 3) {
						c000 = triTable[cubeIndex][ti] * 3;
						c001 = triTable[cubeIndex][ti + 1] * 3;
						c010 = triTable[cubeIndex][ti + 2] * 3;

						vertices[vcount] = vertlist[c000];
						vertices[vcount + 1] = vertlist[c000 + 1];
						vertices[vcount + 2] = vertlist[c000 + 2];
						vertices[vcount + 3] = vertlist[c001];
						vertices[vcount + 4] = vertlist[c001 + 1];
						vertices[vcount + 5] = vertlist[c001 + 2];
						vertices[vcount + 6] = vertlist[c010];
						vertices[vcount + 7] = vertlist[c010 + 1];
						vertices[vcount + 8] = vertlist[c010 + 2];

						if (normals) {
							modX = vertlist[c000] - vertlist[c001]; // A - B
							modY = vertlist[c000 + 1] - vertlist[c001 + 1];
							modZ = vertlist[c000 + 2] - vertlist[c001 + 2];
							modX1 = vertlist[c010] - vertlist[c001]; // C - B
							modY1 = vertlist[c010 + 1] - vertlist[c001 + 1];
							modZ1 = vertlist[c010 + 2] - vertlist[c001 + 2];

							c100 = modZ * modY1 - modY * modZ1; // cross((A - B), (C - B))
							c101 = modX * modZ1 - modZ * modX1;
							c110 = modY * modX1 - modX * modY1;

							c111 = Math.sqrt(c100 * c100 + c101 * c101 + c110 * c110); // length()

							modX = c100 / c111; // normalize
							modY = c101 / c111;
							modZ = c110 / c111;

							for (c111 = 0; c111 < 3; ++c111) {
								normals[vcount] = modX;
								normals[vcount + 1] = modY;
								normals[vcount + 2] = modZ;
								vcount += 3;
							}
						}

						indices[icount] = icount;
						indices[icount + 1] = icount + 1;
						indices[icount + 2] = icount + 2;
						icount += 3;
					}
				}
			}
		}
	};

	MarchingCubes.count = function(buf, dimensions) {
		var zres2 = dimensions * dimensions;
		var yres = dimensions;
		var dim1 = dimensions - 1;

		var c000, c100, c101, c001, c010, c110, c111, c011;
		var x, y, z, cubeIndex;
		var pointCount = 0;

		for (z = -1; z <= dim1; ++z) {
			for (y = -1; y <= dim1; ++y) {
				for (x = -1; x <= dim1; ++x) {
					c000 = (x < 0 || y < 0 || z < 0) ? 0 : buf[z * zres2 + y * yres + x];
					c100 = (x === dim1 || y < 0 || z < 0) ? 0 : buf[z * zres2 + y * yres + x + 1];
					c101 = (x === dim1 || y < 0 || z === dim1) ? 0 : buf[(z + 1) * zres2 + y * yres + x + 1];
					c001 = (x < 0 || y  < 0 || z === dim1) ? 0 : buf[(z + 1) * zres2 + y * yres + x];
					c010 = (x < 0 || y === dim1 || z < 0) ? 0 : buf[z * zres2 + (y + 1) * yres + x];
					c110 = (x === dim1 || y === dim1 || z < 0) ? 0 : buf[z * zres2 + (y + 1) * yres + x + 1];
					c111 = (x === dim1 || y === dim1 || z === dim1) ? 0 : buf[(z + 1) * zres2 + (y + 1) * yres + x + 1];
					c011 = (x < 0 || y === dim1 || z === dim1) ? 0 : buf[(z + 1) * zres2 + (y + 1) * yres + x];

					cubeIndex = 0;
					if (c000 > isolevel) { cubeIndex |= 1; }
					if (c100 > isolevel) { cubeIndex |= 2; }
					if (c101 > isolevel) { cubeIndex |= 4; }
					if (c001 > isolevel) { cubeIndex |= 8; }
					if (c010 > isolevel) { cubeIndex |= 16; }
					if (c110 > isolevel) { cubeIndex |= 32; }
					if (c111 > isolevel) { cubeIndex |= 64; }
					if (c011 > isolevel) { cubeIndex |= 128; }

					pointCount += triCounts[cubeIndex];
				}
			}
		}

		return pointCount;
	};

	return MarchingCubes;
});
