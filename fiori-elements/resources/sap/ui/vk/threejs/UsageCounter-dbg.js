/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"../thirdparty/three"
], function(
	THREE
) {

	"use strict";

	var UsageCounter = function() { };

	UsageCounter.increaseMaterialUsed = function(material) {
		if (material && material.userData && material.userData.materialUsed !== undefined) {
			material.userData.materialUsed++;
			return true;
		}
		return false;
	};

	UsageCounter.decreaseMaterialUsed = function(material) {
		if (material && material.userData && material.userData.materialUsed !== undefined) {
			material.userData.materialUsed--;
			return true;
		}
		return false;
	};

	UsageCounter.increaseGeometryUsed = function(geo) {
		if (geo && geo.userData && geo.userData.geometryUsed !== undefined) {
			geo.userData.geometryUsed++;
			return true;
		}
		return false;
	};

	UsageCounter.decreaseGeometryUsed = function(geo) {
		if (geo && geo.userData && geo.userData.geometryUsed !== undefined) {
			geo.userData.geometryUsed--;
			return true;
		}
		return false;
	};
	return UsageCounter;
});
