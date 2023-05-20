/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  var UIEvents;
  (function (UIEvents) {
    UIEvents["ESHSearchFinished"] = "ESHSearchFinished";
    UIEvents["ESHSearchStarted"] = "ESHSearchStarted";
    UIEvents["ESHSearchLayoutChanged"] = "ESHSearchLayoutChanged";
  })(UIEvents || (UIEvents = {}));
  return UIEvents;
});
})();