/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchModel", "./SearchShellHelper"], function (SearchModel, __SearchShellHelper) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  var SearchShellHelper = _interopRequireDefault(__SearchShellHelper);
  var SearchShellHelperAndModuleLoader = /*#__PURE__*/_createClass(function SearchShellHelperAndModuleLoader() {
    _classCallCheck(this, SearchShellHelperAndModuleLoader);
    // SearchModel.injectSearchShellHelper(SearchShellHelper);
    SearchShellHelper.injectSearchModel(SearchModel);
  }); // in general a cyclic module dependency should work fine with late dependency
  // resolution, as demonstrated in the following expample:
  /*
  // module yin
  sap.ui.define([‘yang’], function([yang], {
  
      console.log(yang); // will be undefined
  
  return {
      goSteps: function( steps ) {
          yang = sap.ui.require(“yang”); // “late” dependency resolution will return the real module value of yang
          if ( steps > 0 ) {
              yang.goSteps( steps - 1 );
          } else {
              console.log(“you reached your goal”);
          }
      }
  };
  });
  
  // module yang
  sap.ui.define([‘yin’], function(yin), {
  
      console.log(yin); // will be undefined
  
      return {
          goSteps: function ( steps ) {
              yin = sap.ui.require(“yin”); // “late” dependency resolution will return the real module value of yin
              if ( steps > 0 ) {
                  yin.goSteps( steps - 1 );
              } else {
                  console.log(“you reached your goal”);
              }
          }
      };
  });
  
  // usage via yin
  sap.ui.require([yin], function(yin) {
      yin.goSteps ( 100 );
  });
  
  // usage via yang
  sap.ui.require([yang], function(yang) {
      yang.goSteps( 100 );
  });
  */
  return SearchShellHelperAndModuleLoader;
});
})();