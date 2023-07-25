/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Author: Ulrich Roegelein

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.GeoLocation = function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var geolocation = {};
	geolocation.vbiclass = "GeoLocation";

	geolocation.m_coords = {};
	geolocation.m_bValid = false;

	// copy of last geoposition...............................................//
	geolocation.m_coords.latiude = 0;
	geolocation.m_coords.longitude = 0;
	geolocation.m_coords.altitude = 0;
	geolocation.m_coords.accuracy = 0;
	geolocation.m_coords.altiudeAccuracy = 0;
	geolocation.m_coords.heading = 0;
	geolocation.m_coords.speed = 0;
	geolocation.m_timestamp = 0;

	geolocation.m_watch = null;

	geolocation.OnError = function(msg) {
		// trace the geolocation error.........................................//
		jQuery.sap.log.debug("GeoLocation.OnError: " + (typeof msg == 'string' ? msg : "unknown"));
	};

	geolocation.OnPosition = function(pos) {
		geolocation.m_coords.latiude = pos.coords.latitude * Math.PI / 180;
		geolocation.m_coords.longitude = pos.coords.longitude * Math.PI / 180;
		geolocation.m_coords.altitude = pos.coords.altitude;
		geolocation.m_coords.accuracy = pos.coords.accuracy;
		geolocation.m_coords.altiudeAccuracy = pos.coords.altiudeAccuracy;
		geolocation.m_coords.heading = pos.coords.heading;
		geolocation.m_coords.speed = pos.coords.speed;
		geolocation.m_timestamp = pos.timestamp;

		geolocation.m_bValid = true;

		// call changed event...................................................//
		geolocation.OnPositionChanged(geolocation);
	};

	// interface..............................................................//

	geolocation.StartWatch = function() {
		if (geolocation.watch) { // watch handle already active
			return;
		}

		if (!navigator) {
			return;
		}

		geolocation.m_watch = navigator.geolocation.watchPosition(geolocation.OnPosition, geolocation.OnError);
		return;
	};

	geolocation.StopWatch = function() {
		if (geolocation.watch) {
			navigator.geolocation.clearWatch(geolocation.watch);
		}

		geolocation.watch = null;
	};

	geolocation.GetWifiScan = function(longitude, latitude) {
		// try to get the wifi scanner object and do a wif scan................//
		var wifi = VBI.Utilities.CreateWifiObject();
		if (wifi) {
			return wifi.ScanWifi("Scan " + latitude + "," + longitude, 0);
		}

		return null;
	};

	// public interface.......................................................//
	geolocation.OnPositionChanged = null;

	return geolocation;
};

});
