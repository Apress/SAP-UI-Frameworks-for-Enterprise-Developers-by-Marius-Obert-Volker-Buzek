/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/ui/core/Control", "sap/m/library", "sap/ui/core/Icon", "sap/m/Label", "sap/m/Breadcrumbs", "sap/ui/core/CustomData", "sap/esh/search/ui/controls/SearchLink", "../sinaNexTS/sina/LogicalOperator", "../sinaNexTS/sina/ComparisonOperator", "../sinaNexTS/sina/ComplexCondition", "../sinaNexTS/sina/SimpleCondition", "../sinaNexTS/sina/Filter", "sap/base/strings/formatMessage"], function (Control, sap_m_library, Icon, Label, Breadcrumbs, CustomData, SearchLink, ___sinaNexTS_sina_LogicalOperator, ___sinaNexTS_sina_ComparisonOperator, ___sinaNexTS_sina_ComplexCondition, ___sinaNexTS_sina_SimpleCondition, ___sinaNexTS_sina_Filter, formatMessage) {
  var LabelDesign = sap_m_library["LabelDesign"];
  var LogicalOperator = ___sinaNexTS_sina_LogicalOperator["LogicalOperator"];
  var ComparisonOperator = ___sinaNexTS_sina_ComparisonOperator["ComparisonOperator"];
  var ComplexCondition = ___sinaNexTS_sina_ComplexCondition["ComplexCondition"];
  var SimpleCondition = ___sinaNexTS_sina_SimpleCondition["SimpleCondition"];
  var Filter = ___sinaNexTS_sina_Filter["Filter"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchCountBreadcrumbs = Control.extend("sap.esh.search.ui.controls.SearchCountBreadcrumbs", {
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm["class"]("sapUshellSearchTotalCountBreadcrumbs");
        oRm.openEnd();
        oRm.renderControl(oControl.getAggregation("icon"));
        oRm.renderControl(oControl.getAggregation("label"));
        var searchModel = oControl.getModel();
        if (searchModel.config.FF_hierarchyBreadcrumbs === true) {
          oRm.renderControl(oControl.getAggregation("breadcrumbs"));
        }
        oRm.close("div");
      }
    },
    metadata: {
      aggregations: {
        icon: {
          type: "sap.ui.core.Icon",
          multiple: false
        },
        label: {
          type: "sap.m.Label",
          multiple: false
        },
        breadcrumbs: {
          type: "sap.m.Breadcrumbs",
          multiple: false
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Control.prototype.constructor.call(this, sId, settings);
      this.initIcon();
      this.initLabel();
      this.initBreadCrumbs();
    },
    initIcon: function _initIcon() {
      var icon = new Icon(this.getId() + "-Icon", {
        visible: {
          parts: [{
            path: "/count"
          }, {
            path: "/breadcrumbsHierarchyNodePaths"
          }],
          formatter: function formatter(count, breadcrumbs) {
            if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
              return false;
            }
            return true;
            // return count !== 0;
          }
        },

        src: {
          path: "/searchInIcon"
        }
      });
      icon.addStyleClass("sapUiTinyMarginEnd");
      icon.addStyleClass("sapUshellSearchTotalCountBreadcrumbsIcon");
      this.setAggregation("icon", icon);
    },
    initLabel: function _initLabel() {
      var label = new Label(this.getId() + "-Label", {
        visible: {
          parts: [{
            path: "/count"
          }, {
            path: "/breadcrumbsHierarchyNodePaths"
          }],
          formatter: function formatter(count, breadcrumbs) {
            if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
              return false;
            }
            return true;
            // return count !== 0;
          }
        },

        design: LabelDesign.Bold,
        text: {
          path: "/countText"
        }
      });
      label.addStyleClass("sapUshellSearchTotalCountSelenium");
      this.setAggregation("label", label);
    },
    initBreadCrumbs: function _initBreadCrumbs() {
      var linkIcon = new Icon(this.getId() + "-SearchLinkIcon", {
        src: {
          path: "icon"
        }
      });
      linkIcon.addStyleClass("sapElisaSearchLinkIcon");
      var links = {
        path: "/breadcrumbsHierarchyNodePaths",
        template: new SearchLink(this.getId() + "-SearchLink", {
          text: {
            path: "label"
          },
          icon: linkIcon,
          visible: true,
          emphasized: {
            path: "isLast",
            formatter: function formatter(isLastPath) {
              if (isLastPath === true) {
                return true;
              }
              return false;
            }
          },
          customData: [new CustomData("", {
            key: "containerId",
            value: {
              path: "id"
            }
          }), new CustomData("", {
            key: "containerName",
            value: {
              path: "label"
            }
          })],
          press: this.handleBreadcrumbLinkPress.bind(this)
        }).addStyleClass("sapUshellSearchTotalCountBreadcrumbsLinks"),
        templateShareable: false
      };
      var breadCrumbsSettings = {
        visible: {
          parts: [{
            path: "/breadcrumbsHierarchyNodePaths"
          }],
          formatter: function formatter(path) {
            if (path && Array.isArray(path) && path.length > 0) {
              return true;
            }
            return false;
          }
        },
        currentLocationText: {
          parts: [{
            path: "i18n>countnumber"
          }, {
            path: "/count"
          }],
          formatter: formatMessage
        },
        separatorStyle: sap.m.BreadcrumbsSeparatorStyle.GreaterThan,
        links: links
      };
      var breadCrumbs = new Breadcrumbs(this.getId() + "-Breadcrumbs", breadCrumbsSettings).addStyleClass("sapUshellSearchTotalCountBreadcrumbs sapUiNoMarginBottom");
      this.setAggregation("breadcrumbs", breadCrumbs);
    },
    handleBreadcrumbLinkPress: function _handleBreadcrumbLinkPress(oEvent) {
      var oSrc = oEvent.getSource();
      var valueRaw = oSrc.data().containerId;
      var valueLabel = oSrc.data().containerName;
      var searchModel = oSrc.getModel();
      var sina = searchModel.sinaNext;
      var dataSource = searchModel.getDataSource();
      var attrName = searchModel.getProperty("/breadcrumbsHierarchyAttribute");
      // const _calculateOperator = function (dataSource) {
      //     let operator = ComparisonOperator.ChildOf;
      //     if (
      //         dataSource.isHierarchyDefinition !== true ||
      //         dataSource.hierarchyDisplayType !== sina.HierarchyDisplayType.HierarchyResultView
      //     ) {
      //         operator = ComparisonOperator.DescendantOf;
      //     }
      //     return operator;
      // };
      // const operator = _calculateOperator(dataSource);

      // The above code does not conside the difference between search mode and navigation mode
      // Set operator as DescendantOf and let Sina SearchQuery _executeSearchQuery decide the final operator/operators
      var operator = ComparisonOperator.DescendantOf;
      var childrenCondition = new SimpleCondition({
        attribute: attrName,
        operator: operator,
        value: valueRaw,
        valueLabel: valueLabel
      });
      var wrapComplexConditionFolder = new ComplexCondition({
        operator: LogicalOperator.And,
        conditions: [childrenCondition]
      });
      var rootConditionFolder = new ComplexCondition({
        operator: LogicalOperator.And,
        conditions: valueRaw === "$$ROOT$$" ? [] : [wrapComplexConditionFolder] // DescendantOf root makes no sense
      });

      var filterFolder = new Filter({
        dataSource: dataSource,
        searchTerm: "*",
        //navigation mode, ignore content in search input box
        rootCondition: rootConditionFolder,
        sina: sina
      });
      var navTarget;
      if (sina.configuration.updateUrl === true) {
        var top = sina.configuration.pageSize || 10;
        var parameters = {
          top: top,
          filter: encodeURIComponent(JSON.stringify(filterFolder.toJson()))
        };
        var urlFolder = sina.configuration.renderSearchUrl(parameters);
        navTarget = sina._createNavigationTarget({
          targetUrl: urlFolder,
          label: "Children Folders",
          //
          target: "_self"
        });
      } else {
        navTarget = sina._createNavigationTarget({
          targetFunction: sina.filterBasedSearch,
          label: "Children Folders" || "",
          filter: filterFolder
        });
      }
      navTarget.performNavigation();
    },
    setModel: function _setModel(model) {
      // ToDo: return type is SearchCountBreadcrumbs but syntax TS-error
      this.getAggregation("icon").setModel(model);
      this.getAggregation("label").setModel(model);
      this.getAggregation("breadcrumbs").setModel(model);
      return this;
    }
  });
  return SearchCountBreadcrumbs;
});
})();