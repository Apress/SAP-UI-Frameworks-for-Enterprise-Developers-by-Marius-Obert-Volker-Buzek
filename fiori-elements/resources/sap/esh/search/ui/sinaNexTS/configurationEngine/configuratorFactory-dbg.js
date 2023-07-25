/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./configurators/CustomFunctionConfigurator", "./configurators/ListConfigurator", "./configurators/ObjectConfigurator", "./configurators/TemplateConfigurator", "./configurators/TextResourceConfigurator", "./configurators/SimpleValueConfigurator"], function (___configurators_CustomFunctionConfigurator, ___configurators_ListConfigurator, ___configurators_ObjectConfigurator, ___configurators_TemplateConfigurator, ___configurators_TextResourceConfigurator, ___configurators_SimpleValueConfigurator) {
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var CustomFunctionConfigurator = ___configurators_CustomFunctionConfigurator["CustomFunctionConfigurator"];
  var ListConfigurator = ___configurators_ListConfigurator["ListConfigurator"];
  var ObjectConfigurator = ___configurators_ObjectConfigurator["ObjectConfigurator"];
  var TemplateConfigurator = ___configurators_TemplateConfigurator["TemplateConfigurator"];
  var TextResourceConfigurator = ___configurators_TextResourceConfigurator["TextResourceConfigurator"];
  var SimpleValueConfigurator = ___configurators_SimpleValueConfigurator["SimpleValueConfigurator"];
  var configuratorClasses = [CustomFunctionConfigurator, ListConfigurator, ObjectConfigurator, TemplateConfigurator, TextResourceConfigurator, SimpleValueConfigurator];
  function createConfiguratorAsync(options) {
    options.createConfiguratorAsync = createConfiguratorAsync;
    for (var i = 0; i < configuratorClasses.length; ++i) {
      var configuratorClass = configuratorClasses[i];
      if (configuratorClass.prototype.isSuitable(options)) {
        return _createAsync(configuratorClass, options);
      }
    }
  }
  function _createAsync(configuratorClass, options) {
    var configurator = new configuratorClass(options); // eslint-disable-line new-cap
    return Promise.resolve().then(function () {
      return configurator.initResourceBundleAsync();
    }).then(function () {
      return configurator.initAsync();
    }).then(function () {
      return configurator;
    });
  }
  var __exports = {
    __esModule: true
  };
  __exports.createConfiguratorAsync = createConfiguratorAsync;
  return __exports;
});
})();