/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./error/ErrorHandler", "./i18n", "sap/ui/model/resource/ResourceModel", "sap/esh/search/ui/controls/SearchFieldGroup", "sap/esh/search/ui/SearchModel", "sap/esh/search/ui/controls/SearchLayoutResponsive", "sap/esh/search/ui/controls/SearchResultContainer", "sap/esh/search/ui/controls/SearchResultList", "sap/esh/search/ui/controls/SearchResultTable", "sap/esh/search/ui/controls/SearchResultGrid", "sap/esh/search/ui/controls/SearchSpreadsheet", "sap/esh/search/ui/controls/SearchText", "sap/esh/search/ui/controls/SearchLink", "sap/esh/search/ui/controls/SearchCountBreadcrumbs", "sap/esh/search/ui/controls/SearchResultListItem", "sap/esh/search/ui/controls/CustomSearchResultListItem", "sap/esh/search/ui/controls/SearchTileHighlighter", "sap/esh/search/ui/controls/SearchFilterBar", "sap/esh/search/ui/controls/SearchFacetFilter", "sap/esh/search/ui/SearchHelper", "sap/ui/core/Control", "sap/ui/core/InvisibleText", "sap/ui/core/Icon", "sap/ui/core/IconPool", "sap/ui/layout/VerticalLayout", "sap/ui/model/BindingMode", "sap/m/Button", "sap/m/OverflowToolbarButton", "sap/m/library", "sap/m/SegmentedButton", "sap/m/SegmentedButtonItem", "sap/m/ToggleButton", "sap/m/Bar", "sap/m/IconTabBar", "sap/m/IconTabFilter", "sap/m/OverflowToolbarLayoutData", "sap/m/OverflowToolbar", "sap/m/ToolbarSeparator", "sap/m/Label", "sap/m/Text", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/CustomListItem", "sap/m/ActionSheet", "sap/m/FlexBox", "sap/m/GenericTile", "sap/m/TileContent", "sap/m/ViewSettingsDialog", "sap/m/ViewSettingsItem", "sap/m/MessagePopover", "sap/m/MessageItem", "sap/m/HBox", "sap/m/VBox", "sap/f/GridContainer", "sap/f/GridContainerSettings", "sap/f/GridContainerItemLayoutData", "./error/errors", "./sinaNexTS/providers/abap_odata/UserEventLogger", "sap/base/Log", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageType", "sap/m/IllustratedMessageSize", "sap/esh/search/ui/error/errors", "sap/ui/core/ResizeHandler", "./controls/OpenShowMoreDialog", "sap/m/ToolbarSpacer", "./UIEvents", "./SearchResultTablePersonalizer"], function (__ErrorHandler, __i18n, ResourceModel, SearchFieldGroup, SearchModel, SearchLayoutResponsive, SearchResultContainer, SearchResultList, SearchResultTable, SearchResultGrid, SearchSpreadsheet, SearchText, SearchLink, SearchCountBreadcrumbs, SearchResultListItem, CustomSearchResultListItem, sap_esh_search_ui_controls_SearchTileHighlighter, SearchFilterBar, SearchFacetFilter, SearchHelper, Control, InvisibleText, Icon, IconPool, VerticalLayout, BindingMode, Button, OverflowToolbarButton, sap_m_library, SegmentedButton, SegmentedButtonItem, ToggleButton, Bar, IconTabBar, IconTabFilter, OverflowToolbarLayoutData, OverflowToolbar, ToolbarSeparator, Label, Text, Column, ColumnListItem, CustomListItem, ActionSheet, FlexBox, GenericTile, TileContent, ViewSettingsDialog, ViewSettingsItem, MessagePopover, MessageItem, HBox, VBox, GridContainer, GridContainerSettings, GridContainerItemLayoutData, ___error_errors, ___sinaNexTS_providers_abap_odata_UserEventLogger, Log, IllustratedMessage, IllustratedMessageType, IllustratedMessageSize, errors, ResizeHandler, ___controls_OpenShowMoreDialog, ToolbarSpacer, __UIEvents, __SearchResultTablePersonalizer) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  var ErrorHandler = _interopRequireDefault(__ErrorHandler);
  var i18n = _interopRequireDefault(__i18n);
  var Highlighter = sap_esh_search_ui_controls_SearchTileHighlighter["Highlighter"];
  var ButtonType = sap_m_library["ButtonType"];
  var ToolbarDesign = sap_m_library["ToolbarDesign"];
  var PlacementType = sap_m_library["PlacementType"];
  var OverflowToolbarPriority = sap_m_library["OverflowToolbarPriority"];
  var ListMode = sap_m_library["ListMode"];
  var ListType = sap_m_library["ListType"];
  var PopinDisplay = sap_m_library["PopinDisplay"];
  var FlexJustifyContent = sap_m_library["FlexJustifyContent"];
  var PopinLayout = sap_m_library["PopinLayout"];
  var ProgramError = ___error_errors["ProgramError"];
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  var openShowMoreDialog = ___controls_OpenShowMoreDialog["openShowMoreDialog"];
  var UIEvents = _interopRequireDefault(__UIEvents);
  var SearchResultTablePersonalizer = _interopRequireDefault(__SearchResultTablePersonalizer); // =============== WARNING ===============================================================
  // do not use async/await in this file
  // --> async/await does work locally but not in barrier
  // because buildNPM does not transpile to Control.extend
  // questions:
  // -why
  // -why do we have different builds local/central
  // =============== WARNING ===============================================================
  /**
   * Search control (input for search terms, suggestions, facets, result list views "list", "table", "grid")
   *
   */
  /**
   * Constructs a new <code>SearchCompositeControl</code> to interact with SAP Enterprise Search Services.
   *
   * @param {string} [sId] ID for the new control, generated automatically if no ID is given
   * @param {object} [mSettings] Initial settings for the new control
   *
   * @class
   *
   * This is the SAPUI5 composite control by the Enterprise Search Team which helps to make full use of the Enterprise Search Engine
   * features built into ABAP and HANA.
   * It includes a search input box including a suggestion dropdown, a result list which can have different styles including tiles and table, result facets and more.
   * This control is ready to use with an enterprise search backend service but also allows deep modifications to match requirements of adopting applications.
   *
   * @extends sap.ui.core.Control
   *
   * @author SAP SE
   * @version 1.113.0
   *
   * @see https://help.sap.com/viewer/691cb949c1034198800afde3e5be6570/2.0.05/en-US/ce86ef2fd97610149eaaaa0244ca4d36.html
   * @see https://help.sap.com/viewer/6522d0462aeb4909a79c3462b090ec51/1709%20002/en-US
   *
   *
   * @constructor
   * @public
   * @alias sap.esh.search.ui.SearchCompositeControl
   * @since 1.93.0
   * @name sap.esh.search.ui.SearchCompositeControl
   *
   */
  /**
   * @namespace sap.esh.search.ui
   */
  var SearchCompositeControl = Control.extend("sap.esh.search.ui.SearchCompositeControl", {
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm.style("width", "100%");
        oRm.style("height", "100%");
        oRm.openEnd();
        var aChildren = oControl.getAggregation("content");
        if (aChildren) {
          for (var i = 0; i < aChildren.length; i++) {
            oRm.renderControl(aChildren[i]);
          }
        }
        oRm.close("div");
      }
    },
    metadata: {
      library: "sap.esh.search.ui",
      dnd: {
        draggable: true,
        droppable: false
      },
      // result view (list/table/grid) support dragging (dropping not supported)
      properties: {
        /**
         * An additional CSS class to add to this control
         * @since 1.93.0
         */
        cssClass: {
          type: "string"
        },
        /**
         * Defines the initial search term for the search input.
         * @since 1.93.0
         */
        searchTerm: {
          type: "string",
          group: "Misc",
          defaultValue: ""
        },
        /**
         * Defines if the search composite control will send a search request after loading for the given term, data source and filter root condition settings.
         * @since 1.93.0
         */
        searchOnStart: {
          type: "boolean",
          group: "Behavior",
          defaultValue: true
        },
        /**
                 * Defines the filter root condition of a filter tree which shall be applied to the search request.
                 * This control only allows filter trees which have a the following structure:
                 * complex condition (root level)
                 *      \
                 *  complex condition (attribute level)
                 *        \
                 *      simple condition (attribute value level)
                 * Filter root conditions which do not follow this structure won't be accepted and an error will be thrown.
                 * Please see the below for a more in-depth example.
                 * 
                 * @since 1.98.0
                 * @example
                 * sap.ui.require(
                       [
                            // Adjust the path to the .js files accordingly!
                            "sap/esh/search/ui/sinaNexTS/sina/LogicalOperator",
                            "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator",
                            "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition",
                            "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition",
                       ], function (
                            LogicalOperatorModule,
                            ComparisonOperatorModule,
                            ComplexConditionModule,
                            SimpleConditionModule
                       ) {
                            ("use strict");
                                // Root condition must always be of type ComplexCondition!
                            const rootCondition = new ComplexConditionModule.ComplexCondition({
                                operator: LogicalOperatorModule.LogicalOperator.And,
                            });
                             // Conditions of root condition must always be of type ComplexCondition!
                            // Create one of those for each attribute.
                            // This condition will hold all values for attribute 'FOLKLORIST':
                            const complexChildCondition = new ComplexConditionModule.ComplexCondition({
                                operator: LogicalOperatorModule.LogicalOperator.Or,
                            });
                             // Conditions of complexChildCondition have to be simple conditions!
                            // This filter specfies the value of the attributes.
                            // The result is an attribute filter like 'FOLKLORIST' = 'Douglas Milford':
                            const simpleGrandChildCondition = new SimpleConditionModule.SimpleCondition({
                                operator: ComparisonOperatorModule.ComparisonOperator.Eq, // results should be equal to the filter value
                                attribute: "FOLKLORIST", // example: name of the attribute
                                value: "Douglas Milford", // example: value of the filter
                            });
                            complexChildCondition.addCondition(simpleGrandChildCondition); // Add the conditions to the condition tree
                            rootCondition.addCondition(complexChildCondition);
                                // The filter tree now looks like this:
                            //                                   rootCondition
                            //                                  /      And    \
                            //                   complexChildCondition       
                            //                   /        Or
                            //        simpleGrandChildCondition ('FOLKLORIST' Eq 'Douglas Milford')
                            // Additional complex child conditions would be linked by an "And" operator, additional simple attribute
                            // filter conditions will be linked by an "Or":
                             // If you would like to apply an additional filter to the 'FOLKLORIST' attribute you can do that, too:
                            const simpleGrandChildCondition2 = new SimpleConditionModule.SimpleCondition({
                                operator: ComparisonOperatorModule.ComparisonOperator.Eq, // results should be equal to the filter value
                                attribute: "FOLKLORIST", // example: name of the attribute
                                value: "Cynthia MacDonald", // example: value of the filter
                            });
                                complexChildCondition.addCondition(simpleGrandChildCondition2);
                             // The filter tree now looks like this:
                            //                                   rootCondition
                            //                                  /      And    
                            //                          complexChildCondition       
                            //                         /         Or          \
                            // simpleGrandChildCondition               simpleGrandChildCondition2
                             // create a new search ui:
                            const searchUI = new SearchCompositeControl({
                                filterRootCondition: rootCondition,
                            });
                             // or if it already exists:
                            // const searchUI = window.sap.ui.getCore().byId("eshCompGenId_0");
                            // searchUI.setFilterRootCondition(rootCondition);
                   });
                */
        filterRootCondition: {
          type: "object",
          group: "Misc"
        },
        /**
         * Configuration for the Enterprise Search Client API.
         * @since 1.93.0
         */
        sinaConfiguration: {
          type: "object",
          group: "Misc"
        },
        /**
         * The id of the data source in which it will search right after initialization.
         * @since 1.98.0
         */
        dataSource: {
          type: "string",
          group: "Misc"
        },
        /**
         * Defines selectable search result view types.
         * The value can be set/get in attach event "searchFinished".
         * Case 1: Search in Apps: result is displayed in a mandatory view type <code>["appSearchResult"]</code>, and it is not switchable.
         * Case 2: Search in All or other Category: result is switchable between different view types.
         * Possible values for the array items are <code>"searchResultList"</code> and <code>"searchResultGrid"</code>.
         * Case 3, Search in Business Object: result is switchable between different view types.
         * Possible values for the array items are <code>"searchResultList"</code>, <code>"searchResultTable"</code> and <code>"searchResultGrid"</code>.
         * Note: The value of <code>resultViewTypes</code> and <code>resultViewType</code> must be compatible to each other.
         *
         * @since 1.98.0
         */
        resultViewTypes: {
          type: "string[]",
          group: "Misc",
          defaultValue: ["searchResultList", "searchResultTable"]
          //  Case 2.1, Search in All or other Category (configuration.isUshell !== true): result is switchable between different view types.
          //  Possible values for the array items are <code>"searchResultList"</code> and <code>"searchResultGrid"</code>.
          //  Case 2.2, Search in All or other Category (configuration.isUshell === true): result is displayed in a mandatory view type <code>["searchResultList"]</code>.
        },

        /**
         * Defines active search result view type.
         * The value can be set/get in attach event "searchFinished", and it must be contained in resultViewTypes.
         * Case 1, Search in Apps: result is displayed in a mandatory view type <code>"appSearchResult"</code>.
         * Case 2.1, Search in All or other Category (configuration.isUshell !== true): result is switchable between different view types.
         * Possible value is <code>"searchResultList"</code>, or <code>"searchResultGrid"</code>.
         * Case 2.2, Search in All or other Category (configuration.isUshell === true): result is displayed in a mandatory view type <code>"searchResultList"</code>.
         * Case 3, Search in Business Object: result is switchable between different view types.
         * Possible value is <code>"searchResultList"</code>, <code>"searchResultTable"</code> or <code>"searchResultGrid"</code>.
         * Note: The value of <code>resultViewTypes</code> and <code>resultViewType</code> must be compatible to each other.
         *
         * @since 1.98.0
         */
        resultViewType: {
          type: "string",
          group: "Misc",
          defaultValue: "searchResultList"
        },
        /**
         * Defines a pair of search result view settings.
         * The value is an object of properties <code>resultViewTypes</code> and <code>resultViewType</code>.
         * An example: <code>{resultViewTypes: ["searchResultList", "searchResultTable"], resultViewType: "searchResultList"}</code>
         * Find more detail in the definition of each child property.
         * The value can be set/get in attached event "searchFinished".
         * Function <code>setResultViewSettings</code> prevents incompatibility of sequential execution of functions <code>setResultViewTypes</code> and <code>setResultViewType</code>.
         * Note: The value of <code>resultViewTypes</code> and <code>resultViewType</code> must be compatible to each other.
         *
         * @since 1.100.0
         */
        resultViewSettings: {
          settings: {
            resultViewTypes: "string[]",
            resultViewType: "string"
          },
          group: "Misc",
          defaultValue: {
            resultViewTypes: ["searchResultList", "searchResultTable"],
            resultViewType: "searchResultList"
          }
        },
        /**
         * Function callback for formatting the datasource tabstrips in the top toolbar.
         * To the callback function a list of datasources is passed. The callback functions return a modified list of datasources
         * to be displayed in the tabstrips.
         *
         * @since 1.103.0
         */
        tabStripsFormatter: {
          type: "function",
          group: "Misc"
        },
        /**
         * Activates the folder mode. Precondition for folder mode is
         * 1) Search model:
         * In the search model for the current datasource a hierarchy attribute (representing the folders) is defined
         * 1.1) the hierarchy attribute is annotated with displayType=TREE and for the hierarchy there is a helper
         * connector representing the hierarchy or
         * 1.2) the current datasource is the helper datasource representing the folder hierarchy. The hierarchy attribute
         * is annotated with displayType=FLAT
         * 2) Search query:
         * The folder mode is only active in case the search query has an empty search term and no filter conditions
         * (except the hierarchy attribute) are set.
         *
         * In folder mode and in case a folder filter is set the result view only shows direct children of a folder.
         * In contrast the counts in the facets are calculated by counting direct and not direct children.
         * In case the folder mode is not active the UI uses the search mode: The result list shows direct and
         * not direct children of a folder.
         * * @since 1.106.0
         */
        folderMode: {
          type: "boolean",
          group: "Misc",
          defaultValue: false
        },
        /**
         * In case folder mode is active:
         * Automatically switch result view type to list in search mode and to table in folder mode.
         * @since 1.106.0
         */
        autoAdjustResultViewTypeInFolderMode: {
          type: "boolean",
          group: "Misc",
          defaultValue: false
        },
        /**
         * Enables the query language for the hana_odata provider.
         * With query language it is possible for the end user to enter complex search
         * queries with logical operators.
         * @since 1.107.0
         */
        enableQueryLanguage: {
          type: "boolean",
          group: "Misc",
          defaultValue: false
        },
        /**
         * Relevant for SAP partners and SAP, the "Application Component" you expect customers to create incidents.
         * @since 1.108.0
         */
        applicationComponent: {
          type: "string",
          group: "Misc",
          defaultValue: "HAN-AS-INA-UI"
        },
        /**
         * Display a splitter bar to resize the left hand panel, containing all facets and filter criteria.
         * @since 1.108.0
         */
        facetPanelResizable: {
          type: "boolean",
          group: "Misc",
          defaultValue: false
        },
        /**
         * Default size (percent) of the left hand panel, containing all facets and filter criteria. If "facetPanelResizable" is true, the width of the facet panel can be changed by the user.
         * @since 1.108.0
         */
        facetPanelWidthInPercent: {
          type: "float",
          group: "Misc",
          defaultValue: 25
        },
        /**
         * Whenever a search has no results, a 'No Results Page' is displayed. You can provide a custom page to be more specific and add some hints, links, buttons or other content.
         * @since 1.94.0
         */
        getCustomNoResultScreen: {
          type: "function",
          group: "Misc"
        },
        /**
         * Shall the window title be overwritten by this control?
         * If true, the control will set the current search condition as window title.
         * If false, it will not set or update the window title.
         * @since 1.93.0
         */
        overwriteBrowserTitle: {
          type: "boolean",
          group: "Misc"
        },
        /**
         * Data source id which is set when the UI is loaded or filter is reset.
         * If dataSource is also set, dataSource will be used during UI load and this
         * parameter will used only after filter is reset.
         * @since 1.93.0
         */
        defaultDataSource: {
          type: "string",
          group: "Misc"
        },
        /**
         * The layout is optimized for object selection / value help (narrow view w/o facet panel).
         * @since 1.111.0
         */
        optimizeForValueHelp: {
          type: "boolean",
          group: "Misc"
        },
        /**
         * Callback for filtering the datasources displayed in the datasource dropdown listbox.
         * The callback gets a list of datsources and returns the filtered list of datasources.
         * @since 1.112.0
         */
        filterDataSources: {
          type: "function",
          group: "Misc"
        },
        /**
         * A boolean which indicates whether the facet panel is initially openend or closed.
         * This affects only the initial state of the facet panel.
         * When not setting facetVisibility the initial state of the facet panel typically is
         * taken from the user personalization storage.
         * @since 1.113.0
         */
        facetVisibility: {
          type: "boolean",
          group: "Misc"
        },
        /**
         * A boolean for enabling (business) object suggestions.
         * @since 1.113.0
         */
        boSuggestions: {
          type: "boolean",
          group: "Misc",
          defaultValue: false
        },
        /**
         * When set to true the facet panel is displayed also in case there are no search results.
         * @since 1.113.0
         */
        displayFacetPanelInCaseOfNoResults: {
          type: "boolean",
          group: "Misc",
          defaultValue: false
        },
        /**
         * A boolean indicating that the search state is written to the URL.
         * @since 1.113.0
         */
        updateUrl: {
          type: "boolean",
          group: "Misc",
          defaultValue: true
        },
        /**
         * A callback for rendering the search URL. The callback gets a list of url encoded parameters and returns the URL string.
         * Typically you need to register this callback in case updateUrl=true.
         * @since 1.113.0
         * @example
         * <code>
         * const renderSearchUrl = function (properties){
            return (
                "#Action-search&/top=" +
                properties.top +
                (properties.orderby ? "&orderBy=" + properties.orderby : "") +
                (properties.sortorder ? "&sortOrder=" + properties.sortorder : "") +
                "&filter=" +
                properties.filter
            );
          };
          </code>
         */
        renderSearchUrl: {
          type: "function",
          group: "Misc"
        },
        /**
         * A callback for checking whether a URL is a search URL. The callback receives a URL and returns true in case the URL is a search URL.
         * Typically you need to register this callback in case updateUrl=true.
         * @since 1.113.0
         * @example
         * <code>
         * const isSearchUrl =function (url) {
              return url.indexOf("#Action-search") === 0;
           };
           </code>
         */
        isSearchUrl: {
          type: "function",
          group: "Misc"
        },
        /**
         * A callback for parsing URL parameters. The callback receices URL parameters and returns modified URL parameters.
         * This is an optional callback. Also in case you set updateUrl=true typcically this callback is not needed.
         * @since 1.113.0
         */
        parseSearchUrlParameters: {
          type: "function",
          group: "Misc"
        },
        /**
         * A list of datasources to be displayed in the facet panel in the collection area.
         * @since 1.113.0
         */
        quickSelectDataSources: {
          type: "object",
          group: "Misc"
        },
        /**
         * A callback which is called whenever the selection of result list items changes.
         * @since 1.113.0
         */
        selectionChange: {
          type: "function",
          group: "Misc"
        },
        /**
         * A callback which is called after the initialization of the search composite control.
         * @since 1.113.0
         */
        initAsync: {
          type: "function",
          group: "Misc"
        }
      },
      aggregations: {
        /**
         * Control instances which are part of this composite control.
         * @private
         */
        content: {
          singularName: "content",
          multiple: true
        }
      },
      events: {
        /**
         * Event is fired when search is started.
         */
        searchStarted: {},
        /**
         * Event is fired when search is finished.
         */
        searchFinished: {}
      }
    },
    constructor: function _constructor(sId, settings) {
      var _this = this;
      var initialErrorHandler = new ErrorHandler({
        model: null
      });
      var searchModel;
      var createContentRunning = false;
      try {
        // unify input parameters
        var unifiedParameters = SearchCompositeControl.unifyInputParameters(sId, settings);
        sId = unifiedParameters.sId;
        settings = unifiedParameters.settings;

        // create search model (within search model the SearchConfiguration is created and initialized with settings)
        searchModel = settings["model"] || settings["searchModel"]; // ToDo, adjust flp/cflp, user 'searchModel' instead of 'model' (renamed because of syntax check errors with type of existing property 'model')
        if (!searchModel) {
          searchModel = new SearchModel({
            configuration: settings
          });
        } else {
          searchModel.config.id = sId; // FLP use case
        }

        initialErrorHandler.setSearchModel(searchModel);

        // call super constructor with all UI5 relevant settings
        var settingsKnownToUI5 = SearchCompositeControl.getUI5ControlSettings(searchModel.config);
        Control.prototype.constructor.call(this, sId, settingsKnownToUI5);
        this.errorHandler = initialErrorHandler;

        // init composite control
        this._oLogger = Log.getLogger("sap.esh.search.ui.SearchCompositeControl");
        this.addStyleClass("sapUshellSearchInputHelpPage");
        if (searchModel.config.optimizeForValueHelp) {
          this.addStyleClass("sapUshellSearchInputHelpPageValueHelp");
        }
        this.setModel(searchModel);
        this.setModel(new ResourceModel({
          bundle: i18n
        }), "i18n");
        var scc = this;
        this.oFocusHandler = new SearchHelper.SearchFocusHandler(scc);
        searchModel.focusHandler = this.oFocusHandler;

        // create views
        searchModel.config.performanceLogger.enterMethod({
          name: "createContent"
        }, {
          isSearch: true
        });
        createContentRunning = true;
        this.createContent();
        searchModel.config.performanceLogger.leaveMethod({
          name: "createContent"
        });
        createContentRunning = false;
        ResizeHandler.register(this, function () {
          _this._resizeHandler();
        });

        // trigger async search init
        this.initSearch();
      } catch (error) {
        initialErrorHandler.onError(error);
        throw error;
      } finally {
        if (createContentRunning) {
          searchModel.config.performanceLogger.leaveMethod({
            name: "createContent"
          });
          createContentRunning = false;
        }
      }
    },
    initSearch: function _initSearch() {
      var _this2 = this;
      // TODO in case UI is started with URL: firePerspectiveQuery is called twice (second call is ignored because query does not change)
      var searchModel = this.getModel();
      searchModel.config.performanceLogger.enterMethod({
        name: "init search"
      }, {
        isSearch: true
      });
      // this handles starting the UI via URL -> triggers firePerspectiveQuery
      searchModel.searchUrlParser.parse().then(function () {
        searchModel.initAsync().then(function () {
          if (_this2.getProperty("searchOnStart") && !searchModel.config.isUshell) {
            searchModel._firePerspectiveQuery(); // this handles starting the UI without URL but with initial searchTerm -> triggers firePerspectiveQuery
          }

          if (searchModel) {
            searchModel.config.performanceLogger.leaveMethod({
              name: "init search"
            });
          }
        });
      });
    },
    exit: function _exit() {
      var _this$tablePersonaliz;
      if (this.oErrorPopover) {
        // ugly workaround for BCP 2280141554
        // do not destroy popover in order to prevent problems with import wizard
        // this.oErrorPopover.destroy();
      }
      if (this.oFilterBar) {
        // ToDo: ugly workaround for "ap22: duplicate id 'eshCompGenId_0-searchFilterBar'"
        // -> after adding a stable id to the filter bar, the existing memory clean-up issue became a duplicate id issue
        this.oFilterBar.destroy();
      }
      if (this.noResultScreen) {
        // in case a custom result screen is used, we need to explicitely destroy the default no result screen
        // in the shadow dom of UI5. Otherwise a duplicate id exception will be thrown if search composite control
        // is instantiated next time.
        this.noResultScreen.destroy();
      }

      // avoid to create same-id-TablePersoDialog by oTablePersoController.activate()
      // destroy TablePersoDialog when exit search app
      (_this$tablePersonaliz = this.tablePersonalizer) === null || _this$tablePersonaliz === void 0 ? void 0 : _this$tablePersonaliz.destroyControllerAndDialog();
      if (this !== null && this !== void 0 && this.oSearchPage["oFacetDialog"]) {
        // oFacetDialog doesn't have id
        // destroy oFacetDialog when exit search app anyway
        this.oSearchPage["oFacetDialog"].destroy(); // ToDo
      }

      var oModel = this.getModel();
      oModel.unsubscribe(UIEvents.ESHSearchStarted, this.onAllSearchStarted, this);
      oModel.unsubscribe(UIEvents.ESHSearchFinished, this.onAllSearchFinished, this);
    },
    createContent: function _createContent() {
      var _this3 = this;
      var oModel = this.getModel();
      if (!oModel.config.isUshell) {
        this.oSearchFieldGroup = new SearchFieldGroup(this.getId() + "-searchInputHelpPageSearchFieldGroup");
        this.oSearchFieldGroup.setCancelButtonActive(false);
        this.oSearchFieldGroup.addStyleClass("sapUshellSearchInputHelpPageSearchFieldGroup");
        this.oSearchFieldGroup.input.setShowValueHelp(false);
        oModel.setProperty("/inputHelp", this.oSearchFieldGroup.input);
        if (oModel.config.optimizeForValueHelp) {
          this.oSearchFieldGroup.setActionsMenuButtonActive(true);
          this.oSearchFieldGroup.setSelectQsDsActive(true);
          this.oSearchFieldGroup.addStyleClass("sapUiTinyMarginBegin");
          this.oSearchFieldGroup.addStyleClass("sapUiTinyMarginEnd");
        }
      }
      if (oModel !== null && oModel !== void 0 && oModel.subscribe) {
        if (!this.subscribeDone_SearchStarted) {
          oModel.subscribe(UIEvents.ESHSearchStarted, this.onAllSearchStarted, this);
          this.subscribeDone_SearchStarted = true;
        }
        if (!this.subscribeDone_SearchFinished) {
          oModel.subscribe(UIEvents.ESHSearchFinished, this.onAllSearchFinished, this);
          this.subscribeDone_SearchFinished = true;
        }
      }
      if (this.oSearchFieldGroup) {
        if (oModel) {
          oModel.subscribe(UIEvents.ESHSearchFinished, function () {
            _this3.oSearchFieldGroup.input.setValue(oModel.getSearchBoxTerm());
          }, this);
        }
      }
      this.oFilterButton = this.assembleFilterButton();
      this.oDataSourceTabBar = this.assembleDataSourceTabBar();
      var toolbarLeftContent = [this.oFilterButton, this.oDataSourceTabBar];
      var genericButtonsToolbarData = this.assembleGenericButtonsToolbar();
      this.oGenericItemsToolbar = genericButtonsToolbarData.toolbar;
      this.oSearchBar = new OverflowToolbar(this.getId() + "-searchBar", {
        width: "100%",
        visible: {
          parts: [{
            path: "/count"
          }],
          formatter: function formatter(count) {
            var _oModel$config;
            return count !== 0 || (oModel === null || oModel === void 0 ? void 0 : (_oModel$config = oModel.config) === null || _oModel$config === void 0 ? void 0 : _oModel$config.showSearchBarForNoResults);
          }
        },
        content: toolbarLeftContent.concat(this.oGenericItemsToolbar),
        design: ToolbarDesign.Transparent
      });
      this.oSearchBar.addStyleClass("sapUshellSearchBar");
      if (!genericButtonsToolbarData.hasCustomButtons) {
        this.oDataSourceTabBar.addStyleClass("sapUshellSearchBarHasNoCustomButtons");
      }
      if (oModel.config.optimizeForValueHelp) {
        this.oSearchBar.addStyleClass("sapUshellSearchBarValueHelp");
      }
      this.oFilterBar = new SearchFilterBar(this.getId() + "-searchFilterBar");
      this.oSearchPage = this.createSearchPage(this.getId());
      if (this.oSearchFieldGroup) {
        this["addContent"](this.oSearchFieldGroup); // ToDo
      }

      var _iterator = _createForOfIteratorHelper(this.oSearchPage),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var searchPageContent = _step.value;
          this["addContent"](searchPageContent); // ToDo
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    onAfterRendering: function _onAfterRendering() {
      var oModel = this === null || this === void 0 ? void 0 : this.getModel();
      if (oModel !== null && oModel !== void 0 && oModel.subscribe) {
        // search started
        if (!this.subscribeDone_SearchStarted) {
          oModel.subscribe(UIEvents.ESHSearchStarted, this.onAllSearchStarted, this);
          this.subscribeDone_SearchStarted = true;
        }
        // search finished
        if (!this.subscribeDone_SearchFinished) {
          oModel.subscribe(UIEvents.ESHSearchFinished, this.onAllSearchFinished, this);
          this.subscribeDone_SearchFinished = true;
        }
      }
    },
    assembleFilterButton: function _assembleFilterButton() {
      var _this4 = this;
      var oModel = this.getModel();
      var filterBtn = new ToggleButton(this.getId() + "-searchBarFilterButton", {
        icon: IconPool.getIconURI("filter"),
        tooltip: {
          parts: [{
            path: "/facetVisibility"
          }],
          formatter: function formatter(facetVisibility) {
            return facetVisibility ? i18n.getText("hideFacetBtn_tooltip") : i18n.getText("showFacetBtn_tooltip");
          }
        },
        pressed: {
          path: "/facetVisibility"
        },
        press: function press(oEvent) {
          var oModel = _this4.getModel();
          // open/close facet panel
          _this4.searchContainer.setProperty("animateFacetTransition", true);
          oModel.setFacetVisibility(oEvent.getParameter("pressed"));
          _this4.searchContainer.setProperty("animateFacetTransition", false);
          _this4.adjustSearchbarCustomGenericButtonWidth(); // see this._resizeHandler();
        },

        visible: {
          parts: [{
            path: "/businessObjSearchEnabled"
          }, {
            path: "/count"
          }],
          formatter: function formatter(businessObjSearchEnabled, count) {
            if (count === 0) {
              return false;
            }
            return (
              // do not show button on phones
              // do not show in value-help mode
              // only show, if business obj. search is active
              !sap.ui.Device.system.phone && !oModel.config.optimizeForValueHelp && businessObjSearchEnabled
            );
          }
        }
      });
      filterBtn.addStyleClass("searchBarFilterButton");
      filterBtn.setLayoutData(new OverflowToolbarLayoutData({
        priority: OverflowToolbarPriority.NeverOverflow
      }));
      return filterBtn;
    },
    assembleCountBreadcrumbsHiddenElement: function _assembleCountBreadcrumbsHiddenElement() {
      var countBreadcrumbsHiddenElement = new InvisibleText("", {
        text: {
          parts: [{
            path: "/count"
          }, {
            path: "/nlqSuccess"
          }, {
            path: "/nlqDescription"
          }],
          formatter: function formatter(count, nlqSuccess, nlqDescription) {
            if (nlqSuccess) {
              return nlqDescription;
            }
            if (typeof count !== "number") {
              return "";
            }
            return i18n.getText("results_count_for_screenreaders", [count.toString()]);
          }
        }
      });
      return countBreadcrumbsHiddenElement;
    },
    assembleGenericButtonsToolbar: function _assembleGenericButtonsToolbar() {
      var _this5 = this,
        _oModel$config2;
      var oModel = this.getModel();

      // table data export button
      var dataExportButton = new OverflowToolbarButton((this.getId() ? this.getId() + "-" : "") + "dataExportButton", {
        icon: "sap-icon://download",
        text: "{i18n>exportData}",
        tooltip: "{i18n>exportData}",
        type: ButtonType.Transparent,
        visible: {
          parts: [{
            path: "/count"
          }, {
            path: "/tableColumns"
          }],
          formatter: function formatter(count, columns) {
            var oModel = _this5.getModel();
            if (oModel && oModel.isHomogenousResult() && count > 0 && columns.length > 0) {
              return true;
            } else {
              return false;
            }
          }
        },
        press: function press() {
          if (_this5.searchSpreadsheet === undefined) {
            _this5.searchSpreadsheet = new SearchSpreadsheet("ushell-search-spreadsheet");
          }
          _this5.searchSpreadsheet.onExport();
        }
      }).addStyleClass("sapUshellSearchTableDataExportButton");
      dataExportButton.setLayoutData(new OverflowToolbarLayoutData({
        priority: OverflowToolbarPriority.High
      }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
      );

      // display-switch tap strips
      this.assembleResultViewSwitch();

      // sort button
      var sortButton = new OverflowToolbarButton((this.getId() ? this.getId() + "-" : "") + "tableSortButton", {
        icon: "sap-icon://sort",
        text: "{i18n>sortTable}",
        tooltip: "{i18n>sortTable}",
        type: ButtonType.Transparent,
        visible: {
          parts: [{
            path: "/count"
          }, {
            path: "/sortableAttributes"
          }],
          formatter: function formatter(count, sortAttributes) {
            var oModel = _this5.getModel();
            if (oModel && oModel.isHomogenousResult() && count > 0 && sortAttributes.length > 0) {
              return true;
            } else {
              return false;
            }
          }
        },
        press: function press() {
          _this5.openSortDialog();
        }
      });
      sortButton.addStyleClass("sapUshellSearchTableSortButton");
      sortButton.setLayoutData(new OverflowToolbarLayoutData({
        priority: OverflowToolbarPriority.High
      }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
      );

      // table personalize button
      var tablePersonalizeButton = new OverflowToolbarButton((this.getId() ? this.getId() + "-" : "") + "tablePersonalizeButton", {
        icon: "sap-icon://action-settings",
        text: "{i18n>personalizeTable}",
        tooltip: "{i18n>personalizeTable}",
        type: ButtonType.Transparent,
        enabled: {
          parts: [{
            path: "/resultViewType"
          }],
          formatter: function formatter(resultViewType) {
            return resultViewType === "searchResultTable";
          }
        },
        visible: {
          parts: [{
            path: "/count"
          }, {
            path: "/tableColumns"
          }],
          formatter: function formatter(count, columns) {
            var oModel = _this5.getModel();
            if (oModel && oModel.isHomogenousResult() && count > 0 && columns.length > 0) {
              return true;
            } else {
              return false;
            }
          }
        },
        press: function press() {
          var _this5$tablePersonali;
          (_this5$tablePersonali = _this5.tablePersonalizer) === null || _this5$tablePersonali === void 0 ? void 0 : _this5$tablePersonali.openDialog();
        }
      });
      tablePersonalizeButton.addStyleClass("sapUshellSearchTablePersonalizeButton");
      tablePersonalizeButton.setLayoutData(new OverflowToolbarLayoutData({
        priority: OverflowToolbarPriority.High
      }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
      );

      var toolbarContent = [dataExportButton, sortButton, tablePersonalizeButton];
      var bWithShareButton = oModel === null || oModel === void 0 ? void 0 : (_oModel$config2 = oModel.config) === null || _oModel$config2 === void 0 ? void 0 : _oModel$config2.isUshell;
      if (bWithShareButton) {
        var shareButton = this.assembleShareButton();
        shareButton.setLayoutData(new OverflowToolbarLayoutData({
          priority: OverflowToolbarPriority.High
        }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
        );

        toolbarContent.push(shareButton);
      }
      toolbarContent.push(this.resultViewSwitch);
      var hasCustomButtons = false;
      try {
        var _oModel$config3;
        var customToolbar = [new ToolbarSpacer()];
        var customToolbarContent = oModel === null || oModel === void 0 ? void 0 : (_oModel$config3 = oModel.config) === null || _oModel$config3 === void 0 ? void 0 : _oModel$config3.getCustomToolbar();
        if ((customToolbarContent === null || customToolbarContent === void 0 ? void 0 : customToolbarContent.length) > 0) {
          hasCustomButtons = true;
          customToolbarContent.push(new ToolbarSeparator("", {
            visible: {
              parts: [{
                path: "/resultViewSwitchVisibility"
              }, {
                path: "/count"
              }],
              formatter: function formatter(resultViewSwitchVisibility, count) {
                return resultViewSwitchVisibility && count !== 0;
              }
            }
          }));
        }
        customToolbar = customToolbar.concat(customToolbarContent);
        toolbarContent = customToolbar.concat(toolbarContent);
      } catch (err) {
        var oError = new errors.ConfigurationExitError("getCustomToolbar", oModel.config.applicationComponent, err);
        this.errorHandler.onError(oError);
        // do not throw oError, just do not any custom buttons to 'toolbar'
      }
      // put toobar buttons in a separate overflow toolbar to control its width independently of datasource tab strip
      var toolbar = new OverflowToolbar(this.getId() + "-searchBar--genericButtonsToolbar", {
        content: toolbarContent
      });
      toolbar.addStyleClass("sapElisaSearchGenericButtonsToolbar");
      return {
        toolbar: toolbar,
        hasCustomButtons: hasCustomButtons
      };
    },
    assembleShareButton: function _assembleShareButton() {
      var oModel = this.getModel();
      // bookmark button (entry in action sheet)
      var oBookmarkButton = new sap.ushell.ui["footerbar"].AddBookmarkButton(
      // ToDo
      (this.getId() ? this.getId() + "-" : "") + "bookmarkButton", {
        width: "auto",
        beforePressHandler: function beforePressHandler() {
          var oAppData = {
            url: document.URL,
            title: oModel.getDocumentTitle(),
            icon: IconPool.getIconURI("search")
          };
          oBookmarkButton.setAppData(oAppData);
        }
      });
      // email button
      var oEmailButton = new Button((this.getId() ? this.getId() + "-" : "") + "emailButton", {
        icon: "sap-icon://email",
        text: i18n.getText("eMailFld"),
        width: "auto",
        press: function press() {
          sap.m.URLHelper.triggerEmail(null, oModel.getDocumentTitle(), document.URL);
        }
      });

      // create action sheet
      var oActionSheet = new ActionSheet((this.getId() ? this.getId() + "-" : "") + "shareActionSheet", {
        placement: PlacementType.Bottom,
        buttons: [oBookmarkButton, oEmailButton]
      });
      this.addDependent(oActionSheet); // -> destroys action sheet if SearchCompositeControl gets destroyed

      // button which opens action sheet
      var oShareButton = new OverflowToolbarButton((this.getId() ? this.getId() + "-" : "") + "shareButton", {
        icon: "sap-icon://action",
        text: i18n.getText("shareBtn"),
        tooltip: i18n.getText("shareBtn"),
        type: ButtonType.Transparent,
        press: function press() {
          oActionSheet.openBy(oShareButton);
        }
      });
      return oShareButton;
    },
    assembleDataSourceTabBar: function _assembleDataSourceTabBar() {
      var _this6 = this;
      var dataSourceTabBar = new IconTabBar((this.getId() ? this.getId() + "-" : "") + "dataSourceTabBar", {
        // tabDensityMode: "Compact", // not working, we have IconTabBar in left container of another bar -> see search.less
        // headerMode: "Inline",   // do not use, confuses css when used on sap.m.Bar
        expandable: false,
        stretchContentHeight: false,
        // selectedKey: "{/tabStrips/strips/selected/id}", // id of selected data source -> does not work, special logic see below, addEventDelegate -> onBeforeRendering
        // backgroundDesign: BackgroundDesign.Transparent  // not relevant, content container is not in use
        // content: -> not needed, we only need the 'switcher' for data source change (triggers new search to update search container)
        visible: {
          parts: [{
            path: "/facetVisibility"
          }, {
            path: "/count"
          }, {
            path: "/businessObjSearchEnabled"
          }],
          formatter: function formatter(facetVisibility, count, bussinesObjSearchEnabled) {
            return !facetVisibility && count > 0 && bussinesObjSearchEnabled;
          }
        },
        select: function select(oEvent) {
          var oModel = _this6.getModel();
          if (oModel.config.searchScopeWithoutAll) {
            return;
          }
          if (oModel.getDataSource() !== oEvent.getParameter("item").getBindingContext().getObject()) {
            // selection has changed
            oModel.setDataSource(oEvent.getParameter("item").getBindingContext().getObject());
          } else {
            // selection has NOT changed, but tab lost its arrow/underline (see class sapMITBContentArrow)
            if (dataSourceTabBar["selectFired"]) {
              dataSourceTabBar["selectFired"] = false;
            } else {
              dataSourceTabBar["selectFired"] = true;
              dataSourceTabBar.fireSelect({
                item: oEvent.getParameter("item")
              }); // make sure the blue line does not vanish (permanently) when clicking active tab (class sapMITBContentArrow, sapMITBSelected). With this logic, it will be at least displayed at mouse-out
            }
          }
        }
      });
      // define group for F6 handling
      dataSourceTabBar.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);

      dataSourceTabBar.addStyleClass("searchTabStripBar"); // ToDo: Remove as soon as replacement css-class 'searchDataSourceTabStripBar' reached all stakeholders
      dataSourceTabBar.addStyleClass("searchDataSourceTabStripBar");
      dataSourceTabBar.addStyleClass("sapUiSmallMarginBegin");
      // dataSourceTabBar.addStyleClass("sapUiNoMarginEnd");
      // dataSourceTabBar.addStyleClass("sapUiResponsiveContentPadding");

      dataSourceTabBar.setAriaTexts({
        headerLabel: i18n.getText("dataSources"),
        headerDescription: i18n.getText("dataSources")
      });
      dataSourceTabBar.bindAggregation("items", {
        path: "/tabStrips/strips",
        template: new IconTabFilter("", {
          key: "{id}",
          // data source id, only needed for indicator (bottom). We use bindingContext().getObject to switch search container content
          text: "{labelPlural}"
        })
      });
      dataSourceTabBar.addEventDelegate({
        // special logic, selectedKey not working via binding
        onBeforeRendering: function onBeforeRendering() {
          if (_this6.getModel().getProperty("/tabStrips")) {
            if (dataSourceTabBar.getSelectedKey() !== _this6.getModel().getProperty("/tabStrips/selected").id) {
              dataSourceTabBar.setSelectedKey(_this6.getModel().getProperty("/tabStrips/selected").id);
            }
          }
        }
      });
      return dataSourceTabBar;
    },
    assembleResultViewSwitch: function _assembleResultViewSwitch() {
      var _this7 = this;
      if (this.resultViewSwitch !== undefined) {
        return;
      }
      this.resultViewSwitch = new SegmentedButton(this.getId() + "-ResultViewType", {
        selectedKey: "{/resultViewType}",
        visible: {
          parts: [{
            path: "/resultViewSwitchVisibility"
          }, {
            path: "/count"
          }],
          formatter: function formatter(resultViewSwitchVisibility, count) {
            return resultViewSwitchVisibility && count !== 0;
          }
        },
        selectionChange: function selectionChange(oEvent) {
          var resultViewType = oEvent.getParameter("item").getKey();
          _this7.setResultViewType(resultViewType);
          _this7.assignDragDropConfig();
        }
      });
      this.resultViewSwitch.bindAggregation("items", {
        path: "/resultViewTypes",
        factory: function factory(id, context) {
          var oButton = new SegmentedButtonItem("", {
            visible: true
          });
          switch (context.getObject()) {
            case "searchResultList":
              oButton.setIcon("sap-icon://list");
              oButton.setTooltip(i18n.getText("displayList"));
              oButton.setKey("searchResultList");
              break;
            case "searchResultTable":
              oButton.setIcon("sap-icon://table-view");
              oButton.setTooltip(i18n.getText("displayTable"));
              oButton.setKey("searchResultTable");
              break;
            case "searchResultGrid":
              oButton.setIcon("sap-icon://grid");
              oButton.setTooltip(i18n.getText("displayGrid"));
              oButton.setKey("searchResultGrid");
              break;
            default:
              oButton.setVisible(false);
          }
          return oButton;
        }
      });
      // this.resultViewSwitch.addStyleClass("sapUshellSearchresultViewSwitch");  // ToDo: remove this line, 'sapUshellSearchresultViewSwitch' ('...Searchresult...', lower-case 'r'!!!!!) later, deprecated (0.55.0, Jan 2023)
      this.resultViewSwitch.addStyleClass("sapUshellSearchResultViewSwitch");
      this.resultViewSwitch.setLayoutData(new OverflowToolbarLayoutData({
        priority: OverflowToolbarPriority.High
      }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
      );
    },

    isShowMoreFooterVisible: function _isShowMoreFooterVisible() {
      var oModel = this.getModel();
      return oModel.getProperty("/boCount") > oModel.getProperty("/boResults").length;
    },
    assembleCenterArea: function _assembleCenterArea(idPrefix) {
      var _this8 = this;
      // sort dialog
      this.sortDialog = this.assembleSearchResultSortDialog();

      // list
      this.searchResultList = this.assembleSearchResultList(idPrefix);

      // table
      this.searchResultTable = this.assembleSearchResultTable(idPrefix);
      this.searchResultTable["addDelegate"]({
        onBeforeRendering: function onBeforeRendering() {
          _this8.updateTableLayout();
        },
        onAfterRendering: function onAfterRendering() {
          var $tableTitleRow = $(_this8.searchResultTable.getDomRef()).find("table > thead > tr:first");
          if ($tableTitleRow) {
            $tableTitleRow.attr("aria-labelledby", _this8.countBreadcrumbsHiddenElement.getId());
          }
        }
      });

      // grid
      this.searchResultGrid = this.assembleSearchResultGrid(idPrefix);

      // app search result
      this.appSearchResult = this.assembleAppSearch(idPrefix);

      // show more footer
      this.showMoreFooter = this.assembleShowMoreFooter();
      var centerArea = [this.sortDialog, this.searchResultList, this.searchResultTable, this.searchResultGrid, this.appSearchResult, this.showMoreFooter, this.countBreadcrumbsHiddenElement];
      return centerArea;
    },
    assembleSearchResultSortDialog: function _assembleSearchResultSortDialog() {
      var _this9 = this;
      var sortDialog = new ViewSettingsDialog(this.getId() + "-sortDialog", {
        sortDescending: {
          parts: [{
            path: "/orderBy"
          }],
          formatter: function formatter(orderBy) {
            return Object.keys(orderBy).length === 0 || orderBy.sortOrder === "DESC";
          }
        },
        confirm: function confirm(oEvent) {
          var paramsSortItem = oEvent.getParameter("sortItem");
          var paramsSortDescending = oEvent.getParameter("sortDescending");
          var oModel = _this9.getModel();
          if (typeof paramsSortItem === "undefined" || paramsSortItem.getBindingContext().getObject().attributeId === "DEFAULT_SORT_ATTRIBUTE") {
            sortDialog.setSortDescending(true);
            oModel.resetOrderBy(true);
          } else {
            oModel.setOrderBy({
              orderBy: paramsSortItem.getBindingContext().getObject().attributeId,
              sortOrder: paramsSortDescending === true ? "DESC" : "ASC"
            }, true);
          }
          // sortDialog.unbindAggregation("sortItems", true);
        },

        cancel: function cancel() {
          // sortDialog.unbindAggregation("sortItems", true);
        },
        resetFilters: function resetFilters() {
          // issue: default sort item can't be set, multiple reset selection in UI5
          // workaround: set sort item after time delay
          setTimeout(function () {
            sortDialog.setSortDescending(true);
            sortDialog.setSelectedSortItem("searchSortAttributeKeyDefault");
          }, 500);
        }
      });
      return sortDialog;
    },
    assembleSearchResultGrid: function _assembleSearchResultGrid(idPrefix) {
      var oModel = this.getModel();
      var resultGrid;
      if (typeof oModel.config.customGridView === "function") {
        try {
          resultGrid = oModel.config.customGridView();
        } catch (err) {
          var oError = new errors.ConfigurationExitError("customGridView", oModel.config.applicationComponent, err);
          throw oError;
        }
      } else {
        var l = new GridContainerSettings("", {
          rowSize: "11rem",
          columnSize: "11rem",
          gap: "0.5rem"
        });
        resultGrid = new SearchResultGrid(idPrefix + "-ushell-search-result-grid", {
          layout: l,
          snapToRow: true
        });
      }
      resultGrid.bUseExtendedChangeDetection = false; // workaround to avoid circular structure issue for data binding
      resultGrid.bindProperty("visible", {
        parts: ["/resultViewType", "/count"],
        formatter: function formatter(resultViewType, count) {
          return resultViewType === "searchResultGrid" && count !== 0;
        }
      });
      resultGrid.addStyleClass("sapUshellSearchGrid");
      return resultGrid;
    },
    assembleSearchResultTable: function _assembleSearchResultTable(idPrefix) {
      var _this10 = this;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      var resultTable = new SearchResultTable(idPrefix + "-ushell-search-result-table", {
        mode: {
          parts: [{
            path: "/multiSelectionEnabled"
          }],
          formatter: function formatter(multiSelectionEnabled) {
            return multiSelectionEnabled === true ? ListMode.MultiSelect : ListMode.None;
          }
        },
        noDataText: "{i18n>noCloumnsSelected}",
        visible: {
          parts: [{
            path: "/resultViewType"
          }, {
            path: "/count"
          }],
          formatter: function formatter(resultViewType, count) {
            return resultViewType === "searchResultTable" && count !== 0;
          }
        },
        popinLayout: PopinLayout.GridLarge,
        rememberSelections: false,
        selectionChange: function selectionChange() {
          var oModel = _this10.getModel();
          oModel.updateMultiSelectionSelected();
        }
      });
      resultTable.bindAggregation("columns", {
        path: "/tableColumns",
        factory: function factory(path, bData) {
          var tableColumn = bData.getObject();
          var column = new Column(idPrefix + "-" + tableColumn.persoColumnId, {
            header: new Label("", {
              text: "{name}"
            }),
            visible: true,
            // set by _createInitialTablePersoState()
            width: "{width}"
          });
          return column;
        }
      });
      resultTable.bindItems({
        path: "/tableRows",
        factory: function factory(path, bData) {
          return that.assembleTableItems(bData);
        }
      });
      resultTable.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          var $control = $(_this10.getDomRef());
          $control.find("table tbody tr").each(function () {
            var $this = $(this);
            var tableRow = sap.ui.getCore().byId($this.attr("id"));
            if (tableRow) {
              var currentAriaLabelledBy = tableRow.getAriaLabelledBy();
              if ($.inArray(that.countBreadcrumbsHiddenElement.getId(), currentAriaLabelledBy) === -1) {
                tableRow.addAriaLabelledBy(that.countBreadcrumbsHiddenElement);
              }
            }
            return false; // stop after first line for now
          });

          $control.find(".sapMListTblCell").each(function () {
            // normal table cell
            var $cell = $(this)[0];
            SearchHelper.attachEventHandlersForTooltip($cell);
          });
          $control.find(".sapMListTblSubCntVal").each(function () {
            // pop-in table cell
            var $cell = $(this)[0];
            SearchHelper.attachEventHandlersForTooltip($cell);
          });
        }
      });
      return resultTable;
    },
    assembleTableItems: function _assembleTableItems(bData) {
      var oData = bData.getObject();
      if (oData.type === "footer") {
        return new CustomListItem("", {
          visible: false
        });
      }
      return this.assembleTableMainItems(oData, bData.getPath());
    },
    assembleTableMainItems: function _assembleTableMainItems(oData, path) {
      var _this11 = this;
      var subPath = path + "/cells";
      var columnListItem = new ColumnListItem("", {
        selected: {
          path: "selected"
        }
      }).addStyleClass("sapUshellSearchTable");
      columnListItem.bindAggregation("cells", {
        path: subPath,
        factory: function factory(subPath, bData) {
          if (bData.getObject().isTitle) {
            // build title cell
            var titleUrl = "";
            var target;
            var hasTargetFunction = false;
            var enabled = true;
            var titleNavigation = bData.getObject().titleNavigation;
            if (titleNavigation) {
              hasTargetFunction = titleNavigation.hasTargetFunction();
              titleUrl = titleNavigation.getHref();
              target = titleNavigation.getTarget();
            }
            if ((typeof titleUrl !== "string" || titleUrl.length === 0) && hasTargetFunction === false) {
              enabled = false;
            }
            var titleLink = new SearchLink("", {
              text: {
                path: "value"
              },
              enabled: enabled,
              wrapping: true,
              press: function press() {
                var titleNavigation = bData.getObject().titleNavigation;
                if (titleNavigation) {
                  titleNavigation.performNavigation({
                    trackingOnly: true
                  });
                }
              }
            });
            titleLink.setHref(titleUrl);
            var titleIconUrl = bData.getObject().titleIconUrl;
            if (titleIconUrl) {
              var oIcon = new Icon("", {
                src: titleIconUrl
              });
              titleLink.setAggregation("icon", oIcon);
            }
            // for tooltip handling, see in SearchResultTable.onAfterRendering for event handlers
            titleLink.addStyleClass("sapUshellSearchResultListItem-MightOverflow");
            titleLink.addStyleClass("sapUshellSearchTableTitleLink");
            if (target) {
              titleLink.setTarget(target);
            }
            var returnObject = titleLink;
            var titleInfoIconUrl = bData.getObject().titleInfoIconUrl;
            if (titleInfoIconUrl) {
              var titleInfoIcon = new Icon("", {
                src: titleInfoIconUrl,
                tooltip: i18n.getText("collectionShared")
              }).addStyleClass("sapUshellSearchTableTitleInfoIcon");
              if (!enabled) {
                titleInfoIcon.addStyleClass("sapUshellSearchTableTitleInfoIconDisabled");
              }
              returnObject = new HBox("", {
                items: [titleLink, titleInfoIcon]
              });
            }
            return returnObject;
          }
          if (bData.getObject().isRelatedApps) {
            // build related objects aka navigation objects cell
            var navigationObjects = bData.getObject().navigationObjects;
            var navigationButtons = [];
            var navigationButton;
            var pressButton = function pressButton(event, navigationObject) {
              navigationObject.performNavigation();
            };
            for (var i = 0; i < navigationObjects.length; i++) {
              var navigationObject = navigationObjects[i];
              navigationButton = new Button("", {
                text: navigationObject.getText(),
                tooltip: navigationObject.getText()
              });
              navigationButton.attachPress(navigationObject, pressButton);
              navigationButtons.push(navigationButton);
            }
            var relatedAppsButton = new Button("", {
              icon: "sap-icon://action",
              press: function press() {
                var actionSheet = new ActionSheet("", {
                  buttons: navigationButtons,
                  placement: PlacementType.Auto
                });
                actionSheet.openBy(relatedAppsButton);
              }
            });
            relatedAppsButton.addStyleClass("sapElisaSearchTableRelatedAppsButton"); // for test purposes
            return relatedAppsButton;
          }
          if (bData.getObject().isExtendTableColumnCell) {
            var oModel = _this11.getModel();
            return oModel.config.extendTableColumn.bindingFunction(bData.getObject()); // ToDo
          }

          // build other cells
          var cell = new SearchText("", {
            text: {
              path: "value"
            },
            isForwardEllipsis4Whyfound: true
          }).addStyleClass("sapUshellSearchResultListItem-MightOverflow");
          if (bData.getObject().icon) {
            var cellIcon = new Icon("", {
              src: bData.getObject().icon
            });
            cell.setAggregation("icon", cellIcon);
          }
          return cell;
        }
      });
      return columnListItem;
    },
    assembleShowMoreFooter: function _assembleShowMoreFooter() {
      var _this12 = this;
      var button = new Button(this.getId() + "-resultview-moreFooter-button", {
        text: "{i18n>showMore}",
        type: ButtonType.Transparent,
        press: function press() {
          var oCurrentModel = _this12.getModel();
          oCurrentModel.setProperty("/focusIndex", oCurrentModel.getTop());
          var newTop = oCurrentModel.getTop() + oCurrentModel.pageSize;
          oCurrentModel.setTop(newTop);
          oCurrentModel.eventLogger.logEvent({
            type: UserEventType.SHOW_MORE
          });
        }
      });
      button.addStyleClass("sapUshellResultListMoreFooter");
      var container = new FlexBox(this.getId() + "-resultview-moreFooter", {
        visible: {
          parts: [{
            path: "/boCount"
          }, {
            path: "/boResults"
          }],
          formatter: function formatter(boCount, boResults) {
            return boResults.length < boCount;
          }
        },
        justifyContent: FlexJustifyContent.Center
      });
      container.addStyleClass("sapUshellResultListMoreFooterContainer");
      container.addItem(button);
      return container;
    },
    assembleSearchResultList: function _assembleSearchResultList(idPrefix) {
      var _this13 = this;
      var resultList = new SearchResultList(idPrefix + "-ushell-search-result-list", {
        mode: ListMode.None,
        width: "auto",
        showNoData: false,
        visible: {
          parts: [{
            path: "/resultViewType"
          }, {
            path: "/count"
          }],
          formatter: function formatter(resultViewType, count) {
            return resultViewType === "searchResultList" && count !== 0;
          }
        }
      });
      resultList.bindItems({
        path: "/results",
        factory: function factory(path, oContext) {
          return _this13.assembleListItem(path, oContext);
        }
      });
      return resultList;
    },
    assembleAppSearch: function _assembleAppSearch(idPrefix) {
      var _this14 = this;
      var l1 = new GridContainerSettings("", {
        rowSize: "5.5rem",
        columnSize: "5.5rem",
        gap: "0.25rem"
      });
      var gridContainer = new GridContainer(idPrefix + "-ushell-search-result-app", {
        layout: l1,
        snapToRow: true,
        visible: {
          parts: [{
            path: "/count"
          }],
          formatter: function formatter(count) {
            var oModel = _this14.getModel();
            return (oModel.isAppCategory() || oModel.isUserCategoryAppSearchOnlyWithoutBOs()) && count !== 0;
          }
        },
        items: {
          path: "/appResults",
          factory: function factory(id, context) {
            var oModel = _this14.getModel();
            if (oModel.isAppCategory() || oModel.isUserCategoryAppSearchOnlyWithoutBOs()) {
              var item = context.getObject();
              var visualization = item.visualization;
              var visualizationService = oModel.uShellVisualizationInstantiationService;
              var visualizationControl = visualizationService.instantiateVisualization(visualization);
              visualizationControl.attachPress(function () {
                oModel.eventLogger.logEvent({
                  type: UserEventType.TILE_NAVIGATE,
                  tileTitle: visualization.title,
                  targetUrl: visualization.targetURL
                });
              });
              visualizationControl.addEventDelegate({
                onAfterRendering: _this14.highlightTile
              });
              visualizationControl.setActive(false, true);
              visualizationControl.setLayoutData(new GridContainerItemLayoutData(visualizationControl.getLayout()));
              return visualizationControl;
            }
            // bind dummy view, prevent douplicated binding
            return new Text("", {
              text: ""
            });
          }
        }
      });
      gridContainer.addStyleClass("sapUshellSearchGridContainer");
      var button = new Button({
        text: "{i18n>showMore}",
        type: ButtonType.Transparent,
        visible: {
          parts: [{
            path: "/appCount"
          }, {
            path: "/appResults"
          }],
          formatter: function formatter(appCount, appResults) {
            var oModel = _this14.getModel();
            return (oModel.isAppCategory() || oModel.isUserCategoryAppSearchOnlyWithoutBOs()) && appResults.length < appCount;
          }
        },
        press: function press() {
          var oModel = _this14.getModel();
          var newTop = oModel.getTop() + oModel.pageSize;
          oModel.setProperty("/focusIndex", oModel.getTop());
          oModel.setTop(newTop);
          oModel.eventLogger.logEvent({
            type: UserEventType.SHOW_MORE
          });
        }
      });
      button.addStyleClass("sapUshellResultListMoreFooter");
      var verticalLayout = new VerticalLayout("", {
        width: "100%",
        visible: {
          parts: [{
            path: "/count"
          }],
          formatter: function formatter(count) {
            var oModel = _this14.getModel();
            return (oModel.isAppCategory() || oModel.isUserCategoryAppSearchOnlyWithoutBOs()) && count !== 0;
          }
        },
        content: [gridContainer, button]
      });
      verticalLayout.addStyleClass("sapUshellResultApps");
      return verticalLayout;
    },
    highlightTile: function _highlightTile(oEvent) {
      var _oEvent$srcControl;
      var oInnerControl = (_oEvent$srcControl = oEvent["srcControl"]) === null || _oEvent$srcControl === void 0 ? void 0 : _oEvent$srcControl.getAggregation("content"); // ToDo
      if (oInnerControl) {
        var aControls = oInnerControl.findAggregatedObjects(true, function (oControl) {
          return oControl.isA("sap.m.GenericTile") || oControl.isA("sap.f.Card");
        });
        if (aControls.length === 0 && oInnerControl.getComponentInstance) {
          aControls = oInnerControl.getComponentInstance().findAggregatedObjects(true, function (oControl) {
            return oControl.isA("sap.m.GenericTile") || oControl.isA("sap.f.Card");
          });
        }
        if (aControls.length > 0) {
          var _oEvent$srcControl2;
          var tile = aControls[0];
          var tileHighlighter = new Highlighter();
          tileHighlighter.setHighlightTerms((_oEvent$srcControl2 = oEvent["srcControl"]) === null || _oEvent$srcControl2 === void 0 ? void 0 : _oEvent$srcControl2.getModel().getProperty("/uiFilter/searchTerm"));
          tileHighlighter.highlight(tile);
        }
      }
    },
    assembleAppContainerResultListItem: function _assembleAppContainerResultListItem(resultItemPath) {
      var _this15 = this;
      var appItemContainerLayout = new GridContainerSettings("", {
        rowSize: "5.5rem",
        columnSize: "5.5rem",
        gap: "0.25rem"
      });
      var appContainerId = "".concat(resultItemPath, "-appItemContainer");
      var container = new GridContainer(appContainerId, {
        layout: appItemContainerLayout,
        snapToRow: true,
        items: {
          path: "/appResults",
          factory: function factory(id, context) {
            var oModel = _this15.getModel();
            if (!oModel.isAppCategory()) {
              var item = context.getObject();
              var visualization = item.visualization;
              var visualizationService = oModel.uShellVisualizationInstantiationService;
              var visualizationControl = visualizationService.instantiateVisualization(visualization);
              visualizationControl.attachPress(function () {
                var oModel = _this15.getModel();
                oModel.eventLogger.logEvent({
                  type: UserEventType.TILE_NAVIGATE,
                  tileTitle: visualization.title,
                  targetUrl: visualization.targetURL
                });
              });
              visualizationControl.addEventDelegate({
                onAfterRendering: _this15.highlightTile
              });
              visualizationControl.setActive(false, true);
              visualizationControl.setLayoutData(new GridContainerItemLayoutData(visualizationControl.getLayout()));
              return visualizationControl;
            }
            // bind dummy view, prevent douplicated binding
            // tile can handel only one view
            return new Text(id, {
              text: ""
            });
          }
        }
      });
      container.addStyleClass("sapUshellSearchGridContainer");
      container.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          var oModel = _this15.getModel();
          // calculate the suitable items for container
          if (container.getDomRef().clientWidth === 0) {
            return;
          }
          var maxWidth = container.getDomRef().clientWidth - 176; // container width - last show more tile width
          var maxItems = Math.floor(maxWidth / 184);
          var fullItems = container.getItems();
          var appCount = oModel.getProperty("/appCount");
          var boCount = oModel.getProperty("/boCount");
          if (fullItems.length > maxItems + 1) {
            // items greater than maxItems+showMore, must be cut
            var width = 0,
              i = 0;
            for (; i < fullItems.length; i++) {
              width = width + fullItems[i].getDomRef().clientWidth + 8; // tile width + margin
              if (width > maxWidth) {
                break;
              }
            }
            var appResults = oModel.getProperty("/appResults");
            oModel.setProperty("/appResults", appResults.slice(0, i));
          } else {
            var lastItem = fullItems[fullItems.length - 1];
            // appCount greater than maxItems, add showMore tile
            if (appCount > maxItems && !lastItem.hasStyleClass("sapUshellSearchResultListItemAppsShowMore")) {
              var appContainerShowMoreId = "".concat(appContainerId, "--showMore");
              var showMoreTile = new GenericTile(appContainerShowMoreId, {
                tileContent: new TileContent("".concat(appContainerShowMoreId, "--content"), {
                  content: new Text("".concat(appContainerShowMoreId, "--content--text"), {
                    text: i18n.getText("showMoreApps")
                  })
                }),
                press: function press() {
                  var oModel = _this15.getModel();
                  oModel.setDataSource(oModel.appDataSource);
                }
              });
              showMoreTile.addStyleClass("sapUshellSearchResultListItemAppsShowMore");
              container.addItem(showMoreTile);
              // force update showMore button to avoid outdated binding
              oModel.setProperty("/resultViewType", "appSearchResult");
              oModel.setProperty("/resultViewType", "searchResultList");
              oModel.setProperty("/boCount", 0);
              oModel.setProperty("/boCount", boCount);
            }
          }
        }
      }, container);
      var listItem = new CustomListItem("".concat(this.getId(), "-appItem"), {
        content: container
      });
      listItem.addStyleClass("sapUshellSearchResultListItem");
      listItem.addStyleClass("sapUshellSearchResultListItemApps");
      listItem.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          var $listItem = $(listItem.getDomRef());
          $listItem.removeAttr("tabindex");
          $listItem.removeAttr("role");
          $listItem.attr("aria-hidden", "true");
        }
      }, listItem);
      return listItem;
    },
    assembleResultListItem: function _assembleResultListItem(resultItemPath, oData) {
      var oModel = this.getModel();
      var dataSourceConfig = oModel.config.getDataSourceConfig(oData.dataSource);
      var searchResultListItemSettings = {
        dataSource: oData.dataSource,
        title: "{title}",
        titleDescription: "{titleDescription}",
        titleNavigation: "{titleNavigation}",
        type: "{dataSourceName}",
        imageUrl: "{imageUrl}",
        imageFormat: "{imageFormat}",
        imageNavigation: "{imageNavigation}",
        geoJson: "{geoJson}",
        attributes: {
          path: "itemattributes"
        },
        navigationObjects: {
          path: "navigationObjects"
        },
        selected: {
          path: "selected"
        },
        expanded: {
          path: "expanded"
        },
        positionInList: {
          path: "positionInList"
        },
        resultSetId: {
          path: "resultSetId"
        },
        layoutCache: {
          path: "layoutCache"
        },
        titleIconUrl: {
          path: "titleIconUrl"
        },
        titleInfoIconUrl: {
          path: "titleInfoIconUrl"
        }
      };
      var itemContent;
      if (dataSourceConfig.searchResultListItemControl) {
        itemContent = new dataSourceConfig.searchResultListItemControl(searchResultListItemSettings);
      } else if (dataSourceConfig.searchResultListItemContentControl) {
        searchResultListItemSettings["content"] =
        // ToDo
        new dataSourceConfig.searchResultListItemContentControl();
        itemContent = new CustomSearchResultListItem("".concat(resultItemPath, "--customItemContent"), searchResultListItemSettings);
      } else {
        itemContent = new SearchResultListItem("".concat(resultItemPath, "--itemContent"), searchResultListItemSettings);
      }
      if (itemContent.setCountBreadcrumbsHiddenElement) {
        itemContent.setCountBreadcrumbsHiddenElement(this.countBreadcrumbsHiddenElement);
      }
      var listItem = new CustomListItem("".concat(resultItemPath, "--customListItem"), {
        content: itemContent,
        type: ListType.Inactive
      });
      listItem.addStyleClass("sapUshellSearchResultListItem");
      if (itemContent.setParentListItem) {
        itemContent.setParentListItem(listItem);
      }
      return listItem;
    },
    assembleListItem: function _assembleListItem(resultItemPath, oContext) {
      var oData = oContext.getObject(); // ToDo
      if (oData.type === "footer") {
        return new CustomListItem("".concat(resultItemPath, "-footerItem")); // return empty list item
      } else if (oData.type === "appcontainer") {
        this.appResultListItem = this.assembleAppContainerResultListItem(resultItemPath);
        return this.appResultListItem;
      }
      return this.assembleResultListItem(resultItemPath, oData);
    },
    assignDragDropConfig: function _assignDragDropConfig() {
      var dragDropConfig = this.getDragDropConfig();
      if (dragDropConfig.length === 0) {
        dragDropConfig = this._dragDropConfig || [];
      }
      if (dragDropConfig.length > 0) {
        var controlToAssignDragDropConfig;
        switch (this.getResultViewType()) {
          case "appSearchResult":
            // no drag&drop support
            break;
          case "searchResultList":
            if (this.searchResultList) {
              controlToAssignDragDropConfig = this.searchResultList;
            }
            break;
          case "searchResultTable":
            if (this.searchResultTable) {
              controlToAssignDragDropConfig = this.searchResultTable;
            }
            break;
          case "searchResultGrid":
            if (this.searchResultGrid) {
              controlToAssignDragDropConfig = this.searchResultGrid;
            }
            break;
          // for other cases (empty or not table/list/grid), do nothing
        }
        // re-assign D&D config
        if (controlToAssignDragDropConfig) {
          var _iterator2 = _createForOfIteratorHelper(dragDropConfig),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var dragDropConfigItem = _step2.value;
              controlToAssignDragDropConfig.addDragDropConfig(dragDropConfigItem);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      }
    },
    addDragDropConfig: function _addDragDropConfig(oDragDropConfig) {
      // oDragDropConfig cannot be assigned to multiple controls in parallel.
      // -> we need to (re-)assign it to the active result view
      switch (this.getResultViewType()) {
        case "appSearchResult":
          // no drag&drop support
          break;
        case "searchResultList":
          if (this.searchResultList) {
            this.searchResultList.addDragDropConfig(oDragDropConfig);
            this._dragDropConfig = this.getDragDropConfig();
            return this.searchResultList;
          }
          break;
        case "searchResultTable":
          if (this.searchResultTable) {
            this.searchResultTable.addDragDropConfig(oDragDropConfig);
            this._dragDropConfig = this.getDragDropConfig();
            return this.searchResultTable;
          }
          break;
        case "searchResultGrid":
          if (this.searchResultGrid) {
            this.searchResultGrid.addDragDropConfig(oDragDropConfig);
            this._dragDropConfig = this.getDragDropConfig();
            return this.searchResultGrid;
          }
          break;
        case "":
          this._dragDropConfig = [oDragDropConfig];
      }
      return this;
    },
    insertDragDropConfig: function _insertDragDropConfig(oDragDropConfig, iIndex) {
      var _this16 = this;
      switch (this.getResultViewType()) {
        case "appSearchResult":
          // no drag&drop support
          break;
        case "searchResultList":
          if (this.searchResultList) {
            this.searchResultList.insertDragDropConfig(oDragDropConfig, iIndex);
            this._dragDropConfig = this.getDragDropConfig();
            return this.searchResultList;
          }
          break;
        case "searchResultTable":
          if (this.searchResultTable) {
            this.searchResultTable.insertDragDropConfig(oDragDropConfig, iIndex);
            this._dragDropConfig = this.getDragDropConfig();
            return this.searchResultTable;
          }
          break;
        case "searchResultGrid":
          if (this.searchResultGrid) {
            this.searchResultGrid.insertDragDropConfig(oDragDropConfig, iIndex);
            this._dragDropConfig = this.getDragDropConfig();
            return this.searchResultGrid;
          }
          break;
        case "":
          setTimeout(function () {
            return _this16.insertDragDropConfig(oDragDropConfig, iIndex);
          }, 500);
        // ToDo: Try to prevent setTimeout
      }

      return this;
    },
    indexOfDragDropConfig: function _indexOfDragDropConfig(oDragDropConfig) {
      var _this$searchResultLis, _this$searchResultLis2, _this$searchResultTab, _this$searchResultTab2, _this$searchResultGri, _this$searchResultGri2;
      if ((_this$searchResultLis = this.searchResultList) !== null && _this$searchResultLis !== void 0 && _this$searchResultLis.getDragDropConfig() && ((_this$searchResultLis2 = this.searchResultList) === null || _this$searchResultLis2 === void 0 ? void 0 : _this$searchResultLis2.getDragDropConfig().length) > 0) {
        return this.searchResultList.indexOfDragDropConfig(oDragDropConfig);
      } else if ((_this$searchResultTab = this.searchResultTable) !== null && _this$searchResultTab !== void 0 && _this$searchResultTab.getDragDropConfig() && ((_this$searchResultTab2 = this.searchResultTable) === null || _this$searchResultTab2 === void 0 ? void 0 : _this$searchResultTab2.getDragDropConfig().length) > 0) {
        return this.searchResultTable.indexOfDragDropConfig(oDragDropConfig);
      } else if ((_this$searchResultGri = this.searchResultGrid) !== null && _this$searchResultGri !== void 0 && _this$searchResultGri.getDragDropConfig() && ((_this$searchResultGri2 = this.searchResultGrid) === null || _this$searchResultGri2 === void 0 ? void 0 : _this$searchResultGri2.getDragDropConfig().length) > 0) {
        return this.searchResultGrid.indexOfDragDropConfig(oDragDropConfig);
      } else {
        return -1;
      }
    },
    getDragDropConfig: function _getDragDropConfig() {
      var _this$searchResultLis3, _this$searchResultLis4, _this$searchResultTab3, _this$searchResultTab4, _this$searchResultGri3, _this$searchResultGri4;
      if ((_this$searchResultLis3 = this.searchResultList) !== null && _this$searchResultLis3 !== void 0 && _this$searchResultLis3.getDragDropConfig() && ((_this$searchResultLis4 = this.searchResultList) === null || _this$searchResultLis4 === void 0 ? void 0 : _this$searchResultLis4.getDragDropConfig().length) > 0) {
        return this.searchResultList.getDragDropConfig();
      } else if ((_this$searchResultTab3 = this.searchResultTable) !== null && _this$searchResultTab3 !== void 0 && _this$searchResultTab3.getDragDropConfig() && ((_this$searchResultTab4 = this.searchResultTable) === null || _this$searchResultTab4 === void 0 ? void 0 : _this$searchResultTab4.getDragDropConfig().length) > 0) {
        return this.searchResultTable.getDragDropConfig();
      } else if ((_this$searchResultGri3 = this.searchResultGrid) !== null && _this$searchResultGri3 !== void 0 && _this$searchResultGri3.getDragDropConfig() && ((_this$searchResultGri4 = this.searchResultGrid) === null || _this$searchResultGri4 === void 0 ? void 0 : _this$searchResultGri4.getDragDropConfig().length) > 0) {
        return this.searchResultGrid.getDragDropConfig();
      } else {
        return [];
      }
    },
    removeDragDropConfig: function _removeDragDropConfig(vDragDropConfig) {
      var _this$searchResultLis5, _this$searchResultLis6, _this$searchResultTab5, _this$searchResultTab6, _this$searchResultGri5, _this$searchResultGri6;
      var dragDropBase = null;
      if ((_this$searchResultLis5 = this.searchResultList) !== null && _this$searchResultLis5 !== void 0 && _this$searchResultLis5.getDragDropConfig() && ((_this$searchResultLis6 = this.searchResultList) === null || _this$searchResultLis6 === void 0 ? void 0 : _this$searchResultLis6.getDragDropConfig().length) > 0) {
        dragDropBase = this.searchResultList.removeDragDropConfig(vDragDropConfig);
        this._dragDropConfig = this.getDragDropConfig();
      } else if ((_this$searchResultTab5 = this.searchResultTable) !== null && _this$searchResultTab5 !== void 0 && _this$searchResultTab5.getDragDropConfig() && ((_this$searchResultTab6 = this.searchResultTable) === null || _this$searchResultTab6 === void 0 ? void 0 : _this$searchResultTab6.getDragDropConfig().length) > 0) {
        dragDropBase = this.searchResultTable.removeDragDropConfig(vDragDropConfig);
        this._dragDropConfig = this.getDragDropConfig();
      } else if ((_this$searchResultGri5 = this.searchResultGrid) !== null && _this$searchResultGri5 !== void 0 && _this$searchResultGri5.getDragDropConfig() && ((_this$searchResultGri6 = this.searchResultGrid) === null || _this$searchResultGri6 === void 0 ? void 0 : _this$searchResultGri6.getDragDropConfig().length) > 0) {
        dragDropBase = this.searchResultGrid.removeDragDropConfig(vDragDropConfig);
        this._dragDropConfig = this.getDragDropConfig();
      } else {
        // do nothing
      }
      return dragDropBase;
    },
    removeAllDragDropConfig: function _removeAllDragDropConfig() {
      var _this$searchResultLis7, _this$searchResultLis8, _this$searchResultTab7, _this$searchResultTab8, _this$searchResultGri7, _this$searchResultGri8;
      var removedDragDropConfig = [];
      if ((_this$searchResultLis7 = this.searchResultList) !== null && _this$searchResultLis7 !== void 0 && _this$searchResultLis7.getDragDropConfig() && ((_this$searchResultLis8 = this.searchResultList) === null || _this$searchResultLis8 === void 0 ? void 0 : _this$searchResultLis8.getDragDropConfig().length) > 0) {
        removedDragDropConfig = this.searchResultList.removeAllDragDropConfig();
        this._dragDropConfig = this.getDragDropConfig();
      } else if ((_this$searchResultTab7 = this.searchResultTable) !== null && _this$searchResultTab7 !== void 0 && _this$searchResultTab7.getDragDropConfig() && ((_this$searchResultTab8 = this.searchResultTable) === null || _this$searchResultTab8 === void 0 ? void 0 : _this$searchResultTab8.getDragDropConfig().length) > 0) {
        removedDragDropConfig = this.searchResultTable.removeAllDragDropConfig();
        this._dragDropConfig = this.getDragDropConfig();
      } else if ((_this$searchResultGri7 = this.searchResultGrid) !== null && _this$searchResultGri7 !== void 0 && _this$searchResultGri7.getDragDropConfig() && ((_this$searchResultGri8 = this.searchResultGrid) === null || _this$searchResultGri8 === void 0 ? void 0 : _this$searchResultGri8.getDragDropConfig().length) > 0) {
        removedDragDropConfig = this.searchResultGrid.removeAllDragDropConfig();
        this._dragDropConfig = this.getDragDropConfig();
      } else {
        // do nothing;
      }
      return removedDragDropConfig;
    },
    destroyDragDropConfig: function _destroyDragDropConfig() {
      var _this$searchResultLis9, _this$searchResultLis10, _this$searchResultTab9, _this$searchResultTab10, _this$searchResultGri9, _this$searchResultGri10;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var control = this;
      if ((_this$searchResultLis9 = this.searchResultList) !== null && _this$searchResultLis9 !== void 0 && _this$searchResultLis9.getDragDropConfig() && ((_this$searchResultLis10 = this.searchResultList) === null || _this$searchResultLis10 === void 0 ? void 0 : _this$searchResultLis10.getDragDropConfig().length) > 0) {
        control = this.searchResultList.destroyDragDropConfig();
      } else if ((_this$searchResultTab9 = this.searchResultTable) !== null && _this$searchResultTab9 !== void 0 && _this$searchResultTab9.getDragDropConfig() && ((_this$searchResultTab10 = this.searchResultTable) === null || _this$searchResultTab10 === void 0 ? void 0 : _this$searchResultTab10.getDragDropConfig().length) > 0) {
        control = this.searchResultTable.destroyDragDropConfig();
      } else if ((_this$searchResultGri9 = this.searchResultGrid) !== null && _this$searchResultGri9 !== void 0 && _this$searchResultGri9.getDragDropConfig() && ((_this$searchResultGri10 = this.searchResultGrid) === null || _this$searchResultGri10 === void 0 ? void 0 : _this$searchResultGri10.getDragDropConfig().length) > 0) {
        control = this.searchResultGrid.destroyDragDropConfig();
      } else {
        // do nothing
      }
      this._dragDropConfig = [];
      return control;
    },
    onAllSearchStarted: function _onAllSearchStarted() {
      this.fireEvent("searchStarted");
    },
    onAllSearchFinished: function _onAllSearchFinished() {
      var _this17 = this;
      var oModel = this.getModel();
      this.assignDragDropConfig(); // reassign drag&drop config (result view regenerated/switched)
      this.chooseNoResultScreen(); // there can be custom no-result-screems, depending on data source
      this.oFocusHandler.setFocus();
      // the search-app container of FLP has ID "viewPortContainer"
      if (oModel.config.isUshell) {
        var viewPortContainer = sap.ui.getCore().byId("viewPortContainer"); // sap.m.NavContainer
        if (viewPortContainer !== null && viewPortContainer !== void 0 && viewPortContainer.switchState) {
          viewPortContainer.switchState("Center");
        }
      }
      this.fireEvent("searchFinished");

      // adjust style classes (needed for very first search call / initial-load)
      var rootCondition = this.getModel().getProperty("/uiFilter/rootCondition");
      var count = this.getModel().getProperty("/count");
      var facetVisibility = this.getModel().getProperty("/facetVisibility");
      var filterBarVisible = false;
      if (!facetVisibility && rootCondition && rootCondition.hasFilters()) {
        filterBarVisible = true;
      }
      if (rootCondition && oModel.filterWithoutFilterByConditions()) {
        filterBarVisible = false;
      }
      // DWC exit
      if (rootCondition && typeof oModel.config.hasSpaceFiltersOnly === "function") {
        if (oModel.config.hasSpaceFiltersOnly(rootCondition) === true) {
          filterBarVisible = false;
        }
      }
      var searchBarVisible = count !== 0 || oModel.config.showSearchBarForNoResults;

      // optimize layout (css)
      setTimeout(function () {
        // (1) search container height
        _this17.adjustSearchContainerHeightClasses(searchBarVisible, filterBarVisible);
        // (2) search toolbar ('overflow' of buttons at the right)
        _this17.adjustSearchbarCustomGenericButtonWidth();
      }, 0);
      if (!this.tablePersonalizer) {
        this.tablePersonalizer = new SearchResultTablePersonalizer(oModel);
      }
      this.tablePersonalizer.update(this.searchResultTable);
    },
    updateTableLayout: function _updateTableLayout() {
      if (!this.getModel() || !this.getModel().getDataSource()) {
        return;
      }
      var uiColumns = this.searchResultTable.getColumns();
      var uiColumnsOrdered = uiColumns.sort(this._orderColumns); // sort columns by perso order, necessary for setMinScreenWidth()
      var visibleCloumns = 0;
      uiColumnsOrdered.forEach(function (column) {
        column.setDemandPopin(false);
        if (column.getVisible()) {
          visibleCloumns++;
          column.setDemandPopin(true);
          column.setPopinDisplay(PopinDisplay.Inline);
          column.setMinScreenWidth(12 * visibleCloumns + "rem");
        }
      });
      if (visibleCloumns <= 3) {
        this.searchResultTable.setFixedLayout(false);
      } else {
        this.searchResultTable.setFixedLayout(true);
      }
    },
    _orderColumns: function _orderColumns(columnA, columnB) {
      if (columnA.getOrder() < columnB.getOrder()) {
        return -1;
      }
      if (columnA.getOrder() > columnB.getOrder()) {
        return 1;
      }
      return 0;
    },
    createSearchPage: function _createSearchPage(idPrefix) {
      var _this18 = this;
      var oModel = this.getModel();
      this.oFilterBar.bindProperty("visible", {
        parts: [{
          path: "/count"
        }, {
          path: "/facetVisibility"
        }, {
          path: "/uiFilter/rootCondition"
        }],
        formatter: function formatter(count, facetVisibility, rootCondition) {
          var filterBarVisible = false;
          if (!facetVisibility && rootCondition && rootCondition.hasFilters()) {
            filterBarVisible = true;
          }
          if (rootCondition && oModel.filterWithoutFilterByConditions()) {
            filterBarVisible = false;
          }
          // DWC exit
          if (rootCondition && typeof oModel.config.hasSpaceFiltersOnly === "function") {
            if (oModel.config.hasSpaceFiltersOnly(rootCondition) === true) {
              filterBarVisible = false;
            }
          }
          var searchBarVisible = count !== 0 || oModel.config.showSearchBarForNoResults;
          // set current style classes
          _this18.adjustSearchContainerHeightClasses(searchBarVisible, filterBarVisible);
          return filterBarVisible;
        }
      });
      this.oFooter = this.createFooter(this.getId()); // not available for device type 'phone'
      if (this.oFooter) {
        this.oFooter.bindProperty("visible", {
          parts: [{
            path: "/errors/length"
          }],
          formatter: function formatter(numberErrors) {
            var footerVisible = numberErrors > 0 ? true : false;
            return footerVisible;
          }
        });
      }
      this.searchContainer = this.createSearchContainer(idPrefix);
      var searchPageContent = [
      // generic buttons
      this.oSearchBar,
      // filter bar
      this.oFilterBar,
      // search container (responsive splitter)
      this.searchContainer];
      return searchPageContent;
    },
    createNoResultScreen: function _createNoResultScreen(idPrefix) {
      var additionalContent = [];
      var illustrationSize = IllustratedMessageSize.Auto;
      var title = {
        parts: [{
          path: "/queryFilter/searchTerm"
        }],
        formatter: function formatter(searchTerm) {
          return i18n.getText("no_results_info_1", [searchTerm]);
        }
      };
      var description = i18n.getText("no_results_info_2");
      var illustrationType = IllustratedMessageType.NoSearchResults;
      var illustratedMessageSettings = {
        title: title,
        description: description,
        illustrationSize: illustrationSize,
        illustrationType: illustrationType,
        additionalContent: additionalContent
      };
      var oIllustratedMessage = new IllustratedMessage("".concat(idPrefix, "-searchContainerResultsView-noResultScreen-illustratedMessage"), illustratedMessageSettings).addStyleClass("sapElisaNoResultScreen");
      oIllustratedMessage.addStyleClass("sapUiMediumMarginTop");
      this.noResultScreen = new VBox("".concat(idPrefix, "-searchContainerResultsView-noResultScreen"), {
        items: oIllustratedMessage,
        // ToDo: sap.m data types seem to be incomplete
        width: "100%",
        justifyContent: FlexJustifyContent.Center,
        visible: {
          parts: [{
            path: "/count"
          }, {
            path: "/isBusy"
          }, {
            path: "/firstSearchWasExecuted"
          }],
          formatter: function formatter(count, isBusy, firstSearchWasExecuted) {
            return count === 0 && !isBusy && firstSearchWasExecuted;
          }
        }
      });
      return this.noResultScreen;
    },
    createSearchContainer: function _createSearchContainer(idPrefix) {
      var oModel = this.getModel();

      // total count hidden element for ARIA purposes
      this.countBreadcrumbsHiddenElement = this.assembleCountBreadcrumbsHiddenElement();

      // center area
      this.centerArea = this.assembleCenterArea(idPrefix);

      // main result list
      this.oSearchCountBreadcrumbs = new SearchCountBreadcrumbs(this.getId() + "-SearchCountBreadcrumbs").addStyleClass("sapElisaSearchContextBarContent");
      this.oContextBar = new Bar(this.getId() + "-searchContextBar", {
        contentLeft: this.oSearchCountBreadcrumbs
      }).addStyleClass("sapElisaSearchContextBar");
      this.oContextBarContainer = new VerticalLayout("", {
        content: [this.oContextBar]
      });
      this.oContextBarContainer.addStyleClass("sapElisaSearchContextBarContainer");
      this.oContextBarContainer.addStyleClass("sapUiNoMarginBegin");
      this.oContextBarContainer.addStyleClass("sapUiNoMarginEnd");
      this.oSearchResultContainer = new SearchResultContainer("".concat(idPrefix, "-searchContainerResultsView"), {
        centerArea: this.centerArea,
        contextBarContainer: this.oContextBarContainer,
        noResultScreen: this.createNoResultScreen(idPrefix)
      });

      // container for normal search result list + facets
      var searchLayoutResponsiveSettings = {
        /* width: "100%",  not needed, it is the default of sap.ui.layout.ResponsiveSplitter
        height: "100%", */
        resultContainer: this.oSearchResultContainer,
        searchIsBusy: {
          path: "/isBusy"
        },
        busyDelay: {
          path: "/busyDelay"
        },
        // facets
        facetPanelResizable: oModel.config.facetPanelResizable,
        facetPanelWidthInPercent: oModel.config.facetPanelWidthInPercent,
        facetPanelContent: new SearchFacetFilter("".concat(this.getId(), "-SearchFacetFilter")),
        showFacets: {
          parts: [{
            path: "/count"
          }, {
            path: "/facetVisibility"
          }, {
            path: "/uiFilter/rootCondition"
          }, {
            path: "/isBusy"
          }, {
            path: "/config"
          }],
          formatter: function formatter(count, facetVisibility, filterConditions, isBusy, config) {
            var facetVisible = true;
            if (!facetVisibility) {
              facetVisible = false;
            }
            var filterExists = filterConditions && filterConditions.conditions && filterConditions.conditions.length > 0;
            if (count === 0 && !config.displayFacetPanelInCaseOfNoResults && !filterExists && !isBusy) {
              facetVisible = false;
            }
            return facetVisible;
          }
        },
        // footer
        footer: this.oFooter,
        showFooter: {
          parts: [{
            path: "/errors/length"
          }],
          formatter: function formatter(numberOfErrors) {
            return numberOfErrors > 0;
          }
        }
      };
      var searchLayout = new SearchLayoutResponsive("".concat(this.getId(), "-searchLayout"), searchLayoutResponsiveSettings).addStyleClass("sapUshellSearchLayout") // only needed for tests
      .addStyleClass("sapUshellSearchLayoutHeightDefault");
      return searchLayout;
    },
    isSearchFieldGroupLocatedInsideSearchComposite: function _isSearchFieldGroupLocatedInsideSearchComposite(currentControlDomRef) {
      // check if the search field group is a child of the SearchCompositeControl
      if (typeof currentControlDomRef === "undefined" || currentControlDomRef === null) {
        // null: before first rendering
        return false;
      } else if (currentControlDomRef.classList) {
        if (currentControlDomRef.classList.contains("sapUshellSearchInputHelpPage")) {
          return true;
        } else if (typeof currentControlDomRef.parentNode !== "undefined") {
          return this.isSearchFieldGroupLocatedInsideSearchComposite(currentControlDomRef.parentNode);
        } else {
          console.error("function: isSearchFieldGroupLocatedInsideSearchComposite: Element has no property 'parentNode' but has property 'classlist'");
          return false;
        }
      } else if (currentControlDomRef.nodeType === Node.DOCUMENT_NODE) {
        // document node (root)
        return false;
      } else {
        console.error("function: isSearchFieldGroupLocatedInsideSearchComposite: Element has no property 'classlist'");
        return false;
      }
    },
    adjustSearchbarCustomGenericButtonWidth: function _adjustSearchbarCustomGenericButtonWidth() {
      if (this.oFilterButton.getVisible() && this.oFilterButton.getDomRef() === null) {
        return; // not yet rendered
      }

      var searchCompositeControlSizes = window.document.getElementById(this.getDomRef().id).getBoundingClientRect();
      var filterButtonWidth = this.oFilterButton.getVisible() ? window.document.getElementById(this.oFilterButton.getDomRef().id).getBoundingClientRect().width : 0;
      var dataSourceTabBarWidthPx = 0;
      if (this.oDataSourceTabBar.getVisible()) {
        var dataSourceTabBarDomRef = this.oDataSourceTabBar.getDomRef();
        if (dataSourceTabBarDomRef !== null && dataSourceTabBarDomRef !== void 0 && dataSourceTabBarDomRef.id) {
          dataSourceTabBarWidthPx = window.document.getElementById(dataSourceTabBarDomRef.id).getBoundingClientRect().width;
        } else {
          // data source tab bar not rendered any longer because of i.e. window/container width less than 500px (see media query)
          // nothing to do, default value dataSourceTabBarWidthPx = 0 is OK
        }
      }
      var genericToolbarWidthPx = searchCompositeControlSizes.width - filterButtonWidth - dataSourceTabBarWidthPx;
      var genericToolbarWidthRem = this.convertPixelToRem(genericToolbarWidthPx);
      this.oGenericItemsToolbar.setWidth("".concat(genericToolbarWidthRem - 2.75, "rem"));
    },
    _resizeHandler: function _resizeHandler() {
      var _this19 = this;
      // search toolbar ('overflow' of buttons at the right)
      setTimeout(function () {
        return _this19.adjustSearchbarCustomGenericButtonWidth();
      }, 0);
    },
    convertPixelToRem: function _convertPixelToRem(pxValue) {
      return pxValue / parseFloat(getComputedStyle(document.documentElement).fontSize);
    },
    adjustSearchContainerHeightClasses: function _adjustSearchContainerHeightClasses(searchBarVisible, filterBarVisible) {
      // search bar:
      //   - filter btn <-> DS tabstrip <-> custom btn <-> generic btn (sort, attr, viewtype, coll. dropdown (value help mode)
      // filter bar:
      //   - displayed whenever there is a filter AND the facet panel is closed ("greeen bar")
      var searchFieldGroupIsLocatedInsideSearchCompositeView = this.oSearchFieldGroup ? this.isSearchFieldGroupLocatedInsideSearchComposite(this.oSearchFieldGroup.input.getDomRef()) : false;
      // remove 'all' style classes
      // search container
      //  1: w/o search bar
      //    a) search input is located as part of shell or custom header (not located at SearchCompositeControl)
      this.searchContainer.removeStyleClass("sapUshellSearchLayoutHeightDefault");
      this.searchContainer.removeStyleClass("sapUshellSearchLayoutHeightFilterbar");
      //    b) search input is located at SearchCompositeControl
      this.searchContainer.removeStyleClass("sapUshellSearchLayoutHeightDefaultHasSearchInputBar");
      this.searchContainer.removeStyleClass("sapUshellSearchLayoutHeightFilterbarHasSearchInputBar");
      //  2: with search bar
      //     a) search input is located as part of shell or custom header (not located at SearchCompositeControl)
      this.searchContainer.removeStyleClass("sapUshellSearchLayoutHeightDefaultHasSearchBar");
      this.searchContainer.removeStyleClass("sapUshellSearchLayoutHeightFilterbarHasSearchBar");
      //     b) search input is located at SearchCompositeControl
      this.searchContainer.removeStyleClass("sapUshellSearchLayoutHeightDefaultHasSearchInputBarHasSearchBar");
      this.searchContainer.removeStyleClass("sapUshellSearchLayoutHeightFilterbarHasSearchInputBarHasSearchBar");
      if (filterBarVisible) {
        if (searchFieldGroupIsLocatedInsideSearchCompositeView) {
          // search input group of SearchCompositeControl is used AND it is located in its view
          if (searchBarVisible) {
            this.searchContainer.addStyleClass("sapUshellSearchLayoutHeightFilterbarHasSearchInputBarHasSearchBar");
          } else {
            this.searchContainer.addStyleClass("sapUshellSearchLayoutHeightFilterbarHasSearchInputBar");
          }
        } else {
          if (searchBarVisible) {
            this.searchContainer.addStyleClass("sapUshellSearchLayoutHeightFilterbarHasSearchBar");
          } else {
            this.searchContainer.addStyleClass("sapUshellSearchLayoutHeightFilterbar");
          }
        }
      } else {
        if (searchFieldGroupIsLocatedInsideSearchCompositeView) {
          // search input group of SearchCompositeControl is used AND it is located in its view
          if (searchBarVisible) {
            this.searchContainer.addStyleClass("sapUshellSearchLayoutHeightDefaultHasSearchInputBarHasSearchBar");
          } else {
            this.searchContainer.addStyleClass("sapUshellSearchLayoutHeightDefaultHasSearchInputBar");
          }
        } else {
          if (searchBarVisible) {
            this.searchContainer.addStyleClass("sapUshellSearchLayoutHeightDefaultHasSearchBar");
          } else {
            this.searchContainer.addStyleClass("sapUshellSearchLayoutHeightDefault");
          }
        }
      }
    },
    createFooter: function _createFooter(idPrefix) {
      var _this20 = this;
      var oModel = this.getModel();

      // create error message popover
      this.oErrorPopover = new MessagePopover(idPrefix + "-" + messagePopoverId++ + "-" + "-searchMessagePopover", {
        placement: PlacementType.Top
      });
      this.oErrorPopover.setModel(oModel);
      oModel.setProperty("/messagePopoverControlId", this.oErrorPopover.getId());
      this.oErrorPopover.bindAggregation("items", {
        path: "/errors",
        factory: function factory() {
          var item = new MessageItem("", {
            title: "{title}",
            description: "{description}"
          });
          return item;
        }
      });

      // create error message popover button
      var oErrorButton = new Button(this.getId() + "-searchErrorButton", {
        icon: IconPool.getIconURI("alert"),
        text: {
          parts: [{
            path: "/errors/length"
          }],
          formatter: function formatter(length) {
            return length;
          }
        },
        visible: {
          parts: [{
            path: "/errors/length"
          }],
          formatter: function formatter(length) {
            return length > 0;
          },
          mode: BindingMode.OneWay
        },
        type: ButtonType.Emphasized,
        tooltip: i18n.getText("errorBtn"),
        press: function press() {
          if (_this20.oErrorPopover.isOpen()) {
            _this20.oErrorPopover.close();
          } else {
            _this20.oErrorPopover.setVisible(true);
            _this20.oErrorPopover.openBy(oErrorButton);
          }
        }
      });
      oErrorButton.addStyleClass("sapUiSmallMarginBegin");
      oErrorButton["addDelegate"]({
        // ToDo
        onAfterRendering: function onAfterRendering() {
          var oModel = _this20.getModel();
          if (!oModel.getProperty("/isErrorPopovered")) {
            // automatically open the error popup (only after first rendering of button)
            oErrorButton.firePress();
            oModel.setProperty("/isErrorPopovered", true);
          }
        }
      });
      oErrorButton.setLayoutData(new OverflowToolbarLayoutData("", {
        priority: OverflowToolbarPriority.NeverOverflow
      }));

      // create footer bar
      var footer = new OverflowToolbar(this.getId() + "-searchFooter", {
        content: [oErrorButton]
      });
      footer.addStyleClass("sapUiTinyMarginTop");
      return footer;
    },
    chooseNoResultScreen: function _chooseNoResultScreen() {
      var _oModel$config4;
      // update "no result screen"
      var oModel = this.getModel();
      var noResultScreen;
      if (typeof (oModel === null || oModel === void 0 ? void 0 : (_oModel$config4 = oModel.config) === null || _oModel$config4 === void 0 ? void 0 : _oModel$config4.getCustomNoResultScreen) === "function") {
        try {
          noResultScreen = oModel.config.getCustomNoResultScreen(oModel.getDataSource(), oModel);
        } catch (err) {
          var oError = new errors.ConfigurationExitError("chooseNoResultScreen", oModel.config.applicationComponent, err);
          this.errorHandler.onError(oError);
          // do not throw oError, use standard 'no results' screen
          noResultScreen = this.oSearchResultContainer.getAggregation("noResultScreen");
        }
      }
      if (!noResultScreen) {
        noResultScreen = this.oSearchResultContainer.getAggregation("noResultScreen");
      }
      this.oSearchResultContainer.setNoResultScreen(noResultScreen);
    },
    openSortDialog: function _openSortDialog() {
      // issue: selection information is lost by clicking cancel, multiple reset selection in UI5
      // workaround: rebind sort items by opening dialog
      this.sortDialog.unbindAggregation("sortItems", false);
      this.sortDialog.bindAggregation("sortItems", {
        path: "/sortableAttributes",
        factory: function factory() {
          return new ViewSettingsItem("", {
            key: {
              path: "key"
            },
            text: {
              path: "name"
            },
            selected: {
              path: "selected"
            }
          });
        }
      });
      this.sortDialog.open();
    },
    openShowMoreDialog: function _openShowMoreDialog(dimension) {
      openShowMoreDialog(this.getModel(), dimension);
    },
    getResultViewTypes: function _getResultViewTypes() {
      var oModel = this.getModel();
      return oModel === null || oModel === void 0 ? void 0 : oModel.getResultViewTypes();
      // if search model hasn't been instantiated yet (see constructor of SearchCompositeControl)
      // -> do nothing!
    },

    setResultViewTypes: function _setResultViewTypes(resultViewTypes) {
      var oModel = this.getModel();
      if (typeof resultViewTypes === "undefined") {
        throw Error("Search Result View Type Error In SearchCompositeControl:\n\n" + "The function parameter 'resultViewTypes' is mandatory.\n" + 'Valid example: setResultViewTypes(["searchResultList"])');
      } else if (typeof oModel === "undefined" || typeof oModel.config === "undefined") {
        // if search model hasn't been instantiated yet (see constructor of SearchCompositeControl)
        // -> do nothing!
        return this;
      }
      this.setResultViewSettings({
        resultViewTypes: resultViewTypes,
        resultViewType: oModel.getResultViewType()
      });
      return this;
    },
    getResultViewType: function _getResultViewType() {
      var oModel = this.getModel();
      return oModel === null || oModel === void 0 ? void 0 : oModel.getResultViewType();
    },
    setResultViewType: function _setResultViewType(resultViewType) {
      var oModel = this.getModel();
      if (typeof resultViewType === "undefined") {
        throw Error("Search Result View Type Error In SearchCompositeControl:\n\n" + "The function parameter 'resultlViewType' is mandatory.\n" + 'Valid example: setResultViewType("searchResultList")');
      } else if (typeof oModel === "undefined" || typeof oModel.config === "undefined") {
        // if search model hasn't been instantiated yet (see constructor of SearchCompositeControl)
        // -> do nothing!
        return this;
      }
      this.setResultViewSettings({
        resultViewTypes: oModel.getResultViewTypes(),
        resultViewType: resultViewType
      });
      return this;
      // if search model hasn't been instantiated yet (see constructor of SearchCompositeControl)
      // -> do nothing!
    },

    getResultViewSettings: function _getResultViewSettings() {
      var oModel = this.getModel();
      if (oModel) {
        return {
          resultViewTypes: oModel.getResultViewTypes(),
          resultViewType: oModel.getResultViewType()
        };
      }
      // if search model hasn't been instantiated yet (see constructor of SearchCompositeControl)
      // -> do nothing!
    },

    setResultViewSettings: function _setResultViewSettings(resultlViewSettings) {
      var oModel = this.getModel();
      if (typeof resultlViewSettings === "undefined") {
        throw Error("Search Result View Type Error In SearchCompositeControl:\n\n" + "The function parameter 'resultlViewSettings' is mandatory.\n" + 'Valid example: setResultViewSettings({resultViewTypes: ["searchResultList", "searchResultTable"], resultViewType: "searchResultList"})');
      } else if (typeof oModel === "undefined" || typeof oModel.config === "undefined") {
        // if search model hasn't been instantiated yet (see constructor of SearchCompositeControl)
        // -> do nothing!
        return this;
      }
      if (typeof resultlViewSettings.resultViewTypes === "undefined" || typeof resultlViewSettings.resultViewType === "undefined") {
        throw Error("Search Result View Type Error In SearchCompositeControl:\n\n" + "One of properties of function parameter is undefined.\n" + 'Valid example: setResultViewSettings({resultViewTypes: ["searchResultList", "searchResultTable"], resultViewType: "searchResultList"})');
      }
      oModel.calculateResultViewSwitchVisibility({
        resultViewTypes: resultlViewSettings.resultViewTypes,
        resultViewType: resultlViewSettings.resultViewType
      });
      this.showMoreFooter.setVisible(this.isShowMoreFooterVisible());
      oModel.enableOrDisableMultiSelection();
      oModel._firePerspectiveQuery(); // search will not be retriggered if model /isQueryInvalidated
      return this;
    },
    getControllerName: function _getControllerName() {
      return "sap.esh.search.ui.container.Search";
    },
    getCssClass: function _getCssClass() {
      return this._cssClass;
    },
    setCssClass: function _setCssClass(cssClass) {
      if (cssClass && !this.hasStyleClass(cssClass)) {
        this._cssClass = cssClass;
        this.addStyleClass(cssClass);
      }
      return this;
    },
    getDataSource: function _getDataSource() {
      if (typeof this.getModel() !== "undefined") {
        var oModel = this.getModel();
        var ds = oModel.getDataSource();
        return ds.id;
      }
    },
    setDataSource: function _setDataSource(dataSourceId, fireQuery, resetTop) {
      if (typeof this.getModel() !== "undefined") {
        var oModel = this.getModel();
        oModel.setDataSourceById(dataSourceId, fireQuery, resetTop);
      }
      return this;
    },
    getSearchTerm: function _getSearchTerm() {
      if (typeof this.getModel() !== "undefined") {
        var oModel = this.getModel();
        return oModel.getSearchBoxTerm();
      }
      return SearchCompositeControl.getMetadata().getPropertyDefaults()["searchTerm"];
    },
    setSearchTerm: function _setSearchTerm(searchTerm, fireQuery) {
      if (typeof this.getModel() !== "undefined") {
        var oModel = this.getModel();
        oModel.setSearchBoxTerm(searchTerm, fireQuery);
      }
      return this;
    },
    getFilterRootCondition: function _getFilterRootCondition() {
      if (this.getModel()) {
        var oModel = this.getModel();
        return oModel.getFilterRootCondition();
      }
      return SearchCompositeControl.getMetadata().getPropertyDefaults()["filterRootCondition"];
    },
    setFilterRootCondition: function _setFilterRootCondition(filterRootCondition, fireQuery) {
      if (this.getModel()) {
        var oModel = this.getModel();
        oModel.setFilterRootCondition(filterRootCondition, fireQuery);
      }
      return this;
    },
    renderSearchUrlFromParameters: function _renderSearchUrlFromParameters(top, filter, encodeFilter) {
      var model = this.getModel();
      if (!model) {
        throw new ProgramError(null, "cannot construct URL because model is undefined");
      }
      return model.searchUrlParser.renderFromParameters(top, filter, encodeFilter);
    }
  });
  SearchCompositeControl.eshCompCounter = 0;
  SearchCompositeControl.getUI5ControlSettings = function getUI5ControlSettings(settings) {
    var settingsKnownToUI5 = {}; // this is a subset of settings which contain only parameters which are also in this controls metadata
    var metadataProperties = SearchCompositeControl.getMetadata().getProperties();
    for (var metadataProperty in metadataProperties) {
      if (typeof settings[metadataProperty] === "undefined") {
        continue;
      }
      settingsKnownToUI5[metadataProperty] = settings[metadataProperty];
    }
    return settingsKnownToUI5;
  };
  SearchCompositeControl.unifyInputParameters = function unifyInputParameters(sId, settings) {
    // shift arguments in case sId was missing, but mSettings was given
    if (typeof sId !== "string" && sId !== undefined && settings === undefined) {
      settings = sId;
      sId = settings && settings.id;
    } else if (typeof settings === "undefined") {
      settings = {};
    }

    // add sId to mSettings
    if (typeof sId === "string" && sId.length > 0) {
      settings.id = sId;
    }

    // no id -> create one
    if (!sId || sId.length === 0) {
      sId = "eshComp" + "GenId_" + SearchCompositeControl.eshCompCounter++;
      settings.id = sId;
    }

    // check sId === mSettings.id
    if (typeof sId === "string" && sId.length > 0 && typeof settings.id !== "undefined") {
      if (sId !== settings.id) {
        throw new Error("Constructor of component 'sap.esh.search.ui.SearchCompositeControl' has failed\n\n" + "sId and mSettings.id are not the same. It is sufficient to set either 'id' (sId) or 'settings.id' (mSettings.id).");
      }
    }
    return {
      sId: sId,
      settings: settings
    };
  };
  var messagePopoverId = 1;
  return SearchCompositeControl;
});
})();