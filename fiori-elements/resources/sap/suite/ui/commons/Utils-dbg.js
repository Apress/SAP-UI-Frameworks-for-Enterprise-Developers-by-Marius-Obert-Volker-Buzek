/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * Utility is a static class providing support functions for other classes.
	 *
	 * @static
	 * @private
	 * @since 1.63
	 * @alias sap.suite.ui.commons.Utils
	 */
	var Utils = {};

	Utils._setupMobileDraggable = function ($el) {
		if (sap.ui.getCore().isMobile()) {
			var fnSimulateMouseEvent = function (event, simulatedType) {
				if (event.originalEvent.touches.length > 1) {
					return;
				}

				event.preventDefault();

				var touch = event.originalEvent.changedTouches[0],
					simulatedEvent = document.createEvent('MouseEvents');

				simulatedEvent.initMouseEvent(
					simulatedType,    // type
					true,             // bubbles
					true,             // cancelable
					window,           // view
					1,                // detail
					touch.screenX,    // screenX
					touch.screenY,    // screenY
					touch.clientX,    // clientX
					touch.clientY,    // clientY
					false,            // ctrlKey
					false,            // altKey
					false,            // shiftKey
					false,            // metaKey
					0,                // button
					null              // relatedTarget
				);

				event.target.dispatchEvent(simulatedEvent);
			};

			var touchHandled = false;

			$el.bind({
				touchstart: function (ev) {
					if (touchHandled) {
						return;
					}

					touchHandled = true;

					fnSimulateMouseEvent(ev, 'mouseover');
					fnSimulateMouseEvent(ev, 'mousemove');
					fnSimulateMouseEvent(ev, 'mousedown');
				},
				touchmove: function (ev) {
					if (!touchHandled) {
						return;
					}

					fnSimulateMouseEvent(ev, 'mousemove');
				},
				touchend: function (ev) {
					if (!touchHandled) {
						return;
					}

					fnSimulateMouseEvent(ev, 'mouseup');
					fnSimulateMouseEvent(ev, 'mouseout');

					// possible tech for touchMoved not working on some android devices
					// they always trigger touchmove
					fnSimulateMouseEvent(ev, 'click');

					touchHandled = false;
				}
			});
		}
	};

	return Utils;
}, true);
