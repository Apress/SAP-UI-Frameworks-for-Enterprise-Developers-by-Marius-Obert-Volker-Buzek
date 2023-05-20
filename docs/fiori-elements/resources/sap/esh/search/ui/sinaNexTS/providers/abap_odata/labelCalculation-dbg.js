/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../core/LabelCalculator"], function (____core_LabelCalculator) {
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var LabelCalculator = ____core_LabelCalculator["LabelCalculator"];
  function createLabelCalculator() {
    return new LabelCalculator({
      key: function key(dataSource) {
        return [dataSource.labelPlural, dataSource.system.id];
      },
      data: function data(dataSource) {
        return {
          label: dataSource.label,
          labelPlural: dataSource.labelPlural
        };
      },
      setLabel: function setLabel(dataSource, labels, data) {
        labels[0] = data.label;
        dataSource.label = labels.join(" ");
        labels[0] = data.labelPlural;
        dataSource.labelPlural = labels.join(" ");
      },
      setFallbackLabel: function setFallbackLabel(dataSource, data) {
        dataSource.label = data.labelPlural + " duplicate " + dataSource.id;
        dataSource.labelPlural = dataSource.label;
      }
    });
  }
  var __exports = {
    __esModule: true
  };
  __exports.createLabelCalculator = createLabelCalculator;
  return __exports;
});
})();