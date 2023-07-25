/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./SearchResultListSelectionHandler", "sap/m/MessageBox"], function (__SearchResultListSelectionHandler, MessageBox) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var SearchResultListSelectionHandler = _interopRequireDefault(__SearchResultListSelectionHandler);
  var MessageBoxIcon = MessageBox["Icon"];
  var MessageBoxAction = MessageBox["Action"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchResultListSelectionHandlerNote = SearchResultListSelectionHandler.extend("sap.esh.search.ui.controls.SearchResultListSelectionHandlerNote", {
    isMultiSelectionAvailable: function _isMultiSelectionAvailable() {
      return true;
    },
    actionsForDataSource: function _actionsForDataSource() {
      var actions = [{
        text: "Show Selected Items",
        action: function action(selection) {
          var message = "No Items were selected!";
          if (selection.length > 0) {
            message = "Following Items were selected:";
            for (var i = 0; i < selection.length; i++) {
              message += "\n" + selection[i].title;
            }
          }
          MessageBox.show(message, {
            icon: MessageBoxIcon.INFORMATION,
            title: "I'm a Custom Action for testing Multi-Selection",
            actions: [MessageBoxAction.OK]
          });
        }
      }];
      return actions;
    }
  });
  return SearchResultListSelectionHandlerNote;
});
})();