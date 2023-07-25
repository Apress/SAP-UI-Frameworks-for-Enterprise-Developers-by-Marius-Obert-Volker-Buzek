/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/Button", "sap/m/CheckBox", "sap/m/FlexBox", "sap/m/FlexItemData", "sap/m/Label", "sap/m/library", "sap/m/List", "sap/m/MessageBox", "sap/m/StandardListItem", "sap/m/Title", "sap/m/VBox", "sap/ui/core/mvc/View", "sap/ui/model/BindingMode", "../i18n"], function (Button, CheckBox, FlexBox, FlexItemData, Label, sap_m_library, List, MessageBox, StandardListItem, Title, VBox, View, BindingMode, __i18n) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var ListMode = sap_m_library["ListMode"];
  var MessageBoxIcon = MessageBox["Icon"];
  var MessageBoxAction = MessageBox["Action"];
  var i18n = _interopRequireDefault(__i18n);
  /**
   * @namespace sap.esh.search.ui.userpref
   */
  var SearchPrefsDialog = View.extend("sap.esh.search.ui.userpref.SearchPrefsDialog", {
    createContent: function _createContent() {
      var _this = this;
      this.firstTimeBeforeRendering = true;

      // *********** upper area (always visilble) ******************
      // Title for Personalized Search
      var oTitlePersSearch = new Title({
        text: i18n.getText("sp.personalizedSearch")
      });

      // CheckBox for Track Search Activities
      var oPersSearchCheckBox = new CheckBox("personalizedSearchCheckbox", {
        selected: {
          path: "/personalizedSearch",
          mode: BindingMode.TwoWay
        },
        text: i18n.getText("sp.trackPersonalizedSearch"),
        enabled: {
          path: "/isPersonalizedSearchEditable"
        },
        layoutData: new FlexItemData({
          growFactor: 1
        })
      });

      // Reset button
      var oResetButton = new Button("", {
        text: i18n.getText("sp.deleteSearchTracks"),
        press: this.resetHistory.bind(this),
        enabled: {
          parts: [{
            path: "/isPersonalizedSearchEditable"
          }, {
            path: "/resetButtonWasClicked"
          }],
          formatter: function formatter(isPersonalizedSearchEditable, resetButtonWasClicked) {
            return isPersonalizedSearchEditable && !resetButtonWasClicked;
          }
        }
      });
      var oPersSearchFlexBox = new FlexBox({
        items: [oPersSearchCheckBox, oResetButton]
      });
      var oPersSearchVBox = new VBox("", {
        items: [oTitlePersSearch, oPersSearchFlexBox],
        visible: {
          path: "/isPersonalizedSearchAreaVisible"
        }
      });

      // *********** lower area - Not always visilble depending on isMyFavoritesAvailable ******************

      // Title for Default Search Scope
      var oTitleDefaultSearch = new Title({
        text: i18n.getText("sp.defaultSearchScope")
      });

      // Checkbox for using Personalized Search Scope (switch on/off)
      var oCheckBoxScope = new CheckBox("defaultSearchScopeCheckbox", {
        selected: {
          path: "/favActive",
          mode: BindingMode.TwoWay
        },
        text: i18n.getText("sp.usePersSearchScope")
      });

      // Headline for connector list
      var oListLabel = new Label("connectorListLabel", {
        text: i18n.getText("sp.connectorList"),
        visible: {
          path: "/favActive"
        },
        layoutData: new FlexItemData({
          growFactor: 1
        })
      }).addStyleClass("sapUiSmallMarginTop");

      // Display selected count and total count of connectors in headline
      var oListCount = new Label("", {
        text: {
          parts: [{
            path: "/selectedDataSourceCount"
          }, {
            path: "/dataSourceCount"
          }],
          formatter: function formatter(selectedDataSourceCount, dataSourceCount) {
            return i18n.getText("sp.connectorListCount", [selectedDataSourceCount, dataSourceCount]);
          }
        },
        visible: {
          path: "/favActive"
        }
      }).addStyleClass("sapUiSmallMarginTop");
      var oListHeadlineFlexBox = new FlexBox({
        items: [oListLabel, oListCount]
      });

      // Connector list
      var oList = new List("connectorListId", {
        mode: ListMode.MultiSelect,
        visible: {
          path: "/favActive"
        },
        //    visible: "{/favActive}",
        selectionChange: function selectionChange(oEvent) {
          _this.onListItemSelectionChange(oEvent);
        },
        growing: true,
        growingThreshold: 1000
        //  growingScrollToLoad: true,
      }).addStyleClass("sapUiTinyMarginTop");
      oList.bindAggregation("items", {
        path: "/subDataSources",
        factory: function factory() {
          var oListItem = new StandardListItem("", {
            title: {
              path: "label"
            },
            selected: {
              path: "selected"
            }
          });
          return oListItem;
        }
      });

      // assemble
      var oDefaultSearchVBox = new VBox("", {
        items: [oTitleDefaultSearch, oCheckBoxScope, oListHeadlineFlexBox, oList],
        visible: {
          path: "/isMyFavoritesAvailable"
        }
      }).addStyleClass("sapUiSmallMarginTop");
      var oSearchPrefsVBox = new VBox({
        items: [oPersSearchVBox, oDefaultSearchVBox]
      });
      return [oSearchPrefsVBox];
    },
    onBeforeRendering: function _onBeforeRendering() {
      // first -> no model reload
      if (this.firstTimeBeforeRendering) {
        this.firstTimeBeforeRendering = false;
        return;
      }
      // reload model data
      this.getModel().reload();
    },
    resetHistory: function _resetHistory() {
      this.getModel().resetProfile().then(function () {
        // success: nothing to do here
      }, function (response) {
        // error: display error popup
        var errorText = i18n.getText("sp.resetFailed");
        errorText += "\n" + response;
        MessageBox.show(errorText, {
          title: i18n.getText("sp.resetFailedTitle"),
          icon: MessageBoxIcon.ERROR,
          actions: [MessageBoxAction.OK]
        });
      });
    },
    onListItemSelectionChange: function _onListItemSelectionChange(oEvent) {
      this.getModel().setProperty("/selectedDataSourceCount", oEvent.getSource().getSelectedItems().length);
    }
  });
  return SearchPrefsDialog;
});
})();