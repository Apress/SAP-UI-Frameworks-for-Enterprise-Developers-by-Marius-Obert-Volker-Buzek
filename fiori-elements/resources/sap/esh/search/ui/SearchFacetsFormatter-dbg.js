/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
sap.ui.define(["./error/ErrorHandler", "./hierarchydynamic/SearchHierarchyDynamicFacetsFormatter", "./hierarchystatic/SearchHierarchyStaticFacetsFormatter", "./Facet", "./FacetItem", "./sinaNexTS/sina/ComparisonOperator"], function (__ErrorHandler, __SearchHierarchyDynamicFacetsFormatter, __SearchHierarchyStaticFacetsFormatter, __Facet, __FacetItem, ___sinaNexTS_sina_ComparisonOperator) {
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
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
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
  var ErrorHandler = _interopRequireDefault(__ErrorHandler);
  var SearchHierarchyDynamicFacetsFormatter = _interopRequireDefault(__SearchHierarchyDynamicFacetsFormatter);
  var SearchHierarchyStaticFacetsFormatter = _interopRequireDefault(__SearchHierarchyStaticFacetsFormatter);
  var Facet = _interopRequireDefault(__Facet);
  var FacetItem = _interopRequireDefault(__FacetItem);
  var ComparisonOperator = ___sinaNexTS_sina_ComparisonOperator["ComparisonOperator"];
  var SearchFacetsFormatter = /*#__PURE__*/function () {
    function SearchFacetsFormatter(searchModel) {
      _classCallCheck(this, SearchFacetsFormatter);
      this.searchFacetDialogModel = searchModel;
      this.errorHandler = new ErrorHandler({
        model: searchModel
      });
      this.hierarchyDynamicFacetsFormatter = new SearchHierarchyDynamicFacetsFormatter(searchModel);
      this.hierarchyStaticFacetsFormatter = new SearchHierarchyStaticFacetsFormatter(searchModel);
    }
    _createClass(SearchFacetsFormatter, [{
      key: "_getAncestorDataSources",
      value: function _getAncestorDataSources(searchModel) {
        var aRecentDataSources = [];
        var oFilterDataSource = searchModel.dataSourceTree.findNode(searchModel.getProperty("/uiFilter/dataSource"));
        if (oFilterDataSource) {
          var aAncestorNodes = oFilterDataSource.getAncestors().reverse();
          for (var i = 0; i < aAncestorNodes.length; i++) {
            var ds = aAncestorNodes[i].dataSource;
            var dsFacetItem = new FacetItem({
              label: ds.labelPlural,
              icon: ds.icon || "sap-icon://none",
              filterCondition: ds,
              // ToDo !!!
              level: 0,
              value: aAncestorNodes[i].count ? aAncestorNodes[i].count.toString() : "" // ToDo 'toString'
            });

            aRecentDataSources.push(dsFacetItem);
          }
        }
        return aRecentDataSources;
      }
    }, {
      key: "_getSiblingDataSources",
      value: function _getSiblingDataSources(searchModel, level) {
        var aSiblingFacetItems = [];
        var currentDS = searchModel.getProperty("/uiFilter/dataSource");
        var currentNode = searchModel.dataSourceTree.findNode(currentDS);
        var aSiblingNodes;
        if (currentNode.parent && !currentNode.unsureWhetherNodeisBelowRoot) {
          aSiblingNodes = currentNode.parent.getChildren();
        } else {
          aSiblingNodes = [];
        }
        if (aSiblingNodes.length === 0) {
          aSiblingNodes.push(currentNode);
        }
        for (var j = 0, lenJ = aSiblingNodes.length; j < lenJ; j++) {
          var ds = aSiblingNodes[j].dataSource;
          var fi = new FacetItem({
            label: ds.labelPlural,
            icon: ds.icon || "sap-icon://none",
            value: aSiblingNodes[j].count,
            filterCondition: ds,
            selected: currentDS === ds,
            level: level
          });
          aSiblingFacetItems.push(fi);
          if (fi.selected) {
            aSiblingFacetItems.push.apply(aSiblingFacetItems, _toConsumableArray(this._getChildrenDataSources(searchModel, level + 1)));
          }
        }
        return aSiblingFacetItems;
      }
    }, {
      key: "_getChildrenDataSources",
      value: function _getChildrenDataSources(searchModel, level) {
        // add children with data from the tree
        var aChildFacetItems = [];
        var currentDS = searchModel.getProperty("/uiFilter/dataSource");
        var aChildNodes = searchModel.dataSourceTree.findNode(currentDS).getChildren();
        for (var j = 0, lenJ = aChildNodes.length; j < lenJ; j++) {
          var ds = aChildNodes[j].dataSource;
          var fi = new FacetItem({
            label: ds.labelPlural,
            icon: ds.icon || "sap-icon://none",
            value: aChildNodes[j].count ? aChildNodes[j].count.toString() : "",
            // ToDo 'toString'
            filterCondition: ds,
            // ToDo!!!
            selected: false,
            level: level
          });
          aChildFacetItems.push(fi);
        }
        return aChildFacetItems;
      }
    }, {
      key: "getDataSourceFacetFromTree",
      value: function getDataSourceFacetFromTree(searchModel) {
        var _oDataSourceFacet$ite, _oDataSourceFacet$ite2;
        var oDataSourceFacet = new Facet({
          facetType: "datasource",
          title: "Search In"
        });
        var currentDS = searchModel.getProperty("/uiFilter/dataSource");
        var aAncestors = this._getAncestorDataSources(searchModel);
        (_oDataSourceFacet$ite = oDataSourceFacet.items).push.apply(_oDataSourceFacet$ite, _toConsumableArray(aAncestors));
        var aSiblings = this._getSiblingDataSources(searchModel, searchModel.allDataSource === currentDS ? 0 : 1);
        (_oDataSourceFacet$ite2 = oDataSourceFacet.items).push.apply(_oDataSourceFacet$ite2, _toConsumableArray(aSiblings));
        return oDataSourceFacet;
      }
    }, {
      key: "_createFacetItemsFromConditionGroup",
      value: function _createFacetItemsFromConditionGroup(dataSource, rootCondition) {
        // ToDo 'any'
        var facetItems = [];
        for (var i = 0; i < rootCondition.conditions.length; i++) {
          var complexCondition = rootCondition.conditions[i];
          for (var j = 0; j < complexCondition.conditions.length; j++) {
            var condition = complexCondition.conditions[j];
            var facetAttribute = void 0;
            if (condition.type === this.searchFacetDialogModel.sinaNext.ConditionType.Simple) {
              facetAttribute = condition.attribute;
              if (dataSource.getAttributeMetadata(facetAttribute).isHierarchy) {
                continue;
              }
              facetItems.push(new FacetItem({
                facetAttribute: facetAttribute,
                label: this._formatLabel(condition.valueLabel, condition.operator),
                filterCondition: condition,
                selected: true
              }));
            } else {
              facetAttribute = condition.conditions[0].attribute;
              if (dataSource.getAttributeMetadata(facetAttribute).isHierarchy) {
                continue;
              }
              facetItems.push(new FacetItem({
                facetAttribute: facetAttribute,
                label: condition.valueLabel,
                filterCondition: condition,
                selected: true
              }));
            }
          }
        }
        return facetItems;
      }
    }, {
      key: "_formatLabel",
      value: function _formatLabel(label, operator) {
        var labelFormatted;
        switch (operator) {
          case ComparisonOperator.Bw /*"Bw"*/:
            labelFormatted = label + "*";
            break;
          case ComparisonOperator.Ew /*"Ew"*/:
            labelFormatted = "*" + label;
            break;
          case ComparisonOperator.Co /*"Co"*/:
            labelFormatted = "*" + label + "*";
            break;
          default:
            labelFormatted = label;
            break;
        }
        return labelFormatted;
      }
    }, {
      key: "getAttributeFacetsFromPerspective",
      value: function getAttributeFacetsFromPerspective(resultSet, searchModel) {
        var oDataSource = searchModel.getDataSource();
        if (oDataSource.type === searchModel.sinaNext.DataSourceType.Category) {
          return Promise.resolve([]); // UI decision: with Category, common attributes should not be shown
        }

        // get chart facets from resultSet
        var aServerSideFacets = resultSet.facets.filter(function (element) {
          return element && element.type && element.type === searchModel.sinaNext.FacetType.Chart;
        });

        // create facets and facet items from server response
        var aClientSideFacets = [];
        var aClientSideFacetsByDimension = {};
        var _iterator = _createForOfIteratorHelper(aServerSideFacets),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var oServerSideFacet = _step.value;
            var oClientSideFacet = new Facet({
              title: oServerSideFacet.title,
              facetType: "attribute",
              dimension: oServerSideFacet.query.dimension,
              totalCount: resultSet.totalCount
            });
            if (oServerSideFacet.items.length === 0) {
              continue;
            }
            for (var j = 0; j < oServerSideFacet.items.length; j++) {
              var oFacetListItem = oServerSideFacet.items[j];
              // DWC exit, add icon only for space facet
              var icon = "";
              if (typeof searchModel.config.checkAndSetSpaceIcon === "function") {
                icon = searchModel.config.checkAndSetSpaceIcon(oFacetListItem.icon, oServerSideFacet.query.dimension);
              } else {
                icon = oFacetListItem.icon;
              }
              var item = new FacetItem({
                facetAttribute: oServerSideFacet.query.dimension,
                // label: oFacetListItem.dimensionValueFormatted,
                label: this._formatLabel(oFacetListItem.dimensionValueFormatted, oFacetListItem.filterCondition.operator),
                value: oFacetListItem.measureValue,
                // ToDo: types do not match
                // value: oFacetListItem.measureValue.toString(),
                filterCondition: oFacetListItem.filterCondition,
                icon: icon
              });
              item.facetTitle = oServerSideFacet.title;
              item["serverSideItem"] = true; // ToDo: clean-code -> serverSideItem seems to be obsolete
              oClientSideFacet.items.push(item);
            }
            aClientSideFacetsByDimension[oServerSideFacet.query.dimension] = oClientSideFacet;
            aClientSideFacets.push(oClientSideFacet);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.addDataTypeToClientSideFacets(aClientSideFacets, searchModel);

        // create facet items from global filter
        var oClientSideFacetsWithSelection = {};
        var aFacetItemsWithFilterConditions = this._createFacetItemsFromConditionGroup(oDataSource, searchModel.getProperty("/uiFilter/rootCondition"));

        // combine facets from global filter with facets from server
        for (var k = 0, lenK = aFacetItemsWithFilterConditions.length; k < lenK; k++) {
          var oSelectedFacetItem = aFacetItemsWithFilterConditions[k];
          var oClientSideFacetWithSelection = aClientSideFacetsByDimension[oSelectedFacetItem.facetAttribute];
          if (oClientSideFacetWithSelection) {
            // remove and insert selected facet on top, only in facet panel
            var indexOfClientSideFacetWithSelection = aClientSideFacets.indexOf(oClientSideFacetWithSelection);
            if (indexOfClientSideFacetWithSelection > 0) {
              aClientSideFacets.splice(indexOfClientSideFacetWithSelection, 1);
              aClientSideFacets.splice(0, 0, oClientSideFacetWithSelection);
            }
            // facet with the same title as a already selected facetitems facet was sent by the server
            // -> merge the item into this facet. If the same facet item already exists just select it
            // var facetItemFoundInFacet = false;
            for (var m = 0, lenM = oClientSideFacetWithSelection.items.length; m < lenM; m++) {
              var facetItem = oClientSideFacetWithSelection.items[m];
              if (oSelectedFacetItem.filterCondition.equals(facetItem.filterCondition)) {
                facetItem.selected = true;
              }
            }
          }
          oClientSideFacetsWithSelection[oSelectedFacetItem.facetAttribute] = oClientSideFacetWithSelection;
        }
        return Promise.resolve(aClientSideFacets);
      }
    }, {
      key: "addDataTypeToClientSideFacets",
      value: function addDataTypeToClientSideFacets(aClientSideFacets, searchModel) {
        var oDataSource = searchModel.getDataSource();
        for (var i = 0; i < aClientSideFacets.length; i++) {
          var oFacet = aClientSideFacets[i];
          try {
            var metadata = oDataSource.getAttributeMetadata(oFacet.dimension);
            oFacet.dataType = metadata.type;
          } catch (error) {
            this.errorHandler.onError(error);
          }
        }
      }
    }, {
      key: "addQuickSelectDataSourceFacet",
      value: function addQuickSelectDataSourceFacet(searchModel, facets) {
        if (searchModel.config.quickSelectDataSources.length === 0) {
          return;
        }
        var dataSource = searchModel.config.quickSelectDataSources[0];
        var facet;
        if (dataSource.type === "quickSelectDataSourceTreeNode") {
          // tree of datasources (one catalog)
          facet = this.createTreeQuickSelectDataSourceFacet(searchModel);
        } else {
          // flat list of datasources (repository explorer)
          facet = this.createListQuickSelectDataSourceFacet(searchModel);
        }
        facets.push(facet);
      }
    }, {
      key: "createListQuickSelectDataSourceFacet",
      value: function createListQuickSelectDataSourceFacet(searchModel) {
        return {
          facetType: "quickSelectDataSource",
          items: searchModel.config.quickSelectDataSources.map(function (ds) {
            return {
              type: "quickSelectDataSourceListItem",
              dataSource: ds
            };
          })
        };
      }
    }, {
      key: "createTreeQuickSelectDataSourceFacet",
      value: function createTreeQuickSelectDataSourceFacet(searchModel) {
        var _this = this;
        if (!this.treeQuickSelectDataSourceFacet) {
          // use same structure as for list display
          // root tree node is stored as first item
          this.treeQuickSelectDataSourceFacet = {
            facetType: "quickSelectDataSource",
            items: [{
              type: "quickSelectDataSourceTreeNode",
              children: searchModel.config.quickSelectDataSources.map(function (treeNodeProps) {
                return _this.createTreeNodeQuickSelectDataSource(treeNodeProps);
              })
            }]
          };
        }
        var rootNode = this.treeQuickSelectDataSourceFacet.items[0];
        this.expandPathToSelectedDataSource(searchModel, rootNode);
        return this.treeQuickSelectDataSourceFacet;
      }
    }, {
      key: "expandPathToSelectedDataSource",
      value: function expandPathToSelectedDataSource(searchModel, rootNode) {
        // helper function for collecting all tree paths to a datasource
        function collectPaths(rootNode, dataSource) {
          var paths = [];
          function findDataSource(path, node) {
            path = path.slice();
            path.push(node);
            if (node.getDataSource && node.getDataSource() === dataSource) {
              paths.push(path);
              return;
            }
            if (!node.children) {
              return;
            }
            var _iterator2 = _createForOfIteratorHelper(node.children),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var childNode = _step2.value;
                findDataSource(path, childNode);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
          findDataSource([], rootNode);
          return paths;
        }

        // collect all paths in the tree to the current datasource
        var paths = collectPaths(rootNode, searchModel.getDataSource());

        // expand paths
        var _iterator3 = _createForOfIteratorHelper(paths),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var path = _step3.value;
            for (var i = 0; i < path.length - 1; ++i) {
              // i<path.length-1 because last path element is datasource itself and does not need expansion
              var node = path[i];
              node.expanded = true;
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
    }, {
      key: "createTreeNodeQuickSelectDataSource",
      value: function createTreeNodeQuickSelectDataSource(treeNodeProps) {
        var _this2 = this;
        var children = [];
        if (treeNodeProps.children) {
          children = treeNodeProps.children.map(function (childTreeNodeProps) {
            return _this2.createTreeNodeQuickSelectDataSource(childTreeNodeProps);
          });
        }
        return {
          expanded: false,
          type: "quickSelectDataSourceTreeNode",
          label: treeNodeProps.dataSource.labelPlural,
          icon: treeNodeProps.dataSource.icon,
          getDataSource: function getDataSource() {
            return treeNodeProps.dataSource;
          },
          dataSourceId: treeNodeProps.dataSource.id,
          children: children,
          toggleExpand: function toggleExpand() {
            this.expanded = !this.expanded;
          }
        };
      }
    }, {
      key: "getFacets",
      value: function getFacets(oDataSource, oINAPerspective, searchModel) {
        try {
          const _this3 = this;
          // generate datasource facet
          var resultFacets = [_this3.getDataSourceFacetFromTree(searchModel)];

          // add quick datasource select facet
          _this3.addQuickSelectDataSourceFacet(searchModel, resultFacets);

          // for ds=apps or ds=category -> no attribute facets, just return
          if (oDataSource === searchModel.appDataSource || oDataSource.type === searchModel.sinaNext.DataSourceType.Category) {
            return _await(resultFacets);
          }

          // return if we have no perspective
          if (!oINAPerspective) {
            return _await(resultFacets);
          }
          var collectedFacets = [];

          // add dynamic hierarchy facets
          return _await(_this3.hierarchyDynamicFacetsFormatter.getFacets(oINAPerspective, searchModel), function (hierarchyDynamicFacets) {
            collectedFacets.push.apply(collectedFacets, _toConsumableArray(hierarchyDynamicFacets));

            // add static hierarchy facets
            return _await(_this3.hierarchyStaticFacetsFormatter.getFacets(oINAPerspective), function (hierarchyStaticFacets) {
              collectedFacets.push.apply(collectedFacets, _toConsumableArray(hierarchyStaticFacets));

              // add attribute facets
              return _await(_this3.getAttributeFacetsFromPerspective(oINAPerspective, searchModel), function (attributeFacets) {
                collectedFacets.push.apply(collectedFacets, _toConsumableArray(attributeFacets));

                // sort
                _this3.sortFacets(collectedFacets, searchModel);
                resultFacets.push.apply(resultFacets, collectedFacets);
                _this3.setFacetIndex(resultFacets);
                return resultFacets;
              });
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "setFacetIndex",
      value: function setFacetIndex(facets) {
        // facet index is needed in SearchHierarchyFacet and SearchHierarchyStaticFacet for updating facets in the UI
        // see method refreshUI
        for (var i = 0; i < facets.length; ++i) {
          var facet = facets[i];
          if (facet.setFacetIndex) {
            facet.setFacetIndex(i);
          } else {
            facet.facetIndex = i;
          }
        }
      }
    }, {
      key: "sortFacets",
      value: function sortFacets(aAttributeFacets, searchModel) {
        if (aAttributeFacets.length === 0) {
          return aAttributeFacets;
        }
        var oCompareFunction = function oCompareFunction(a, b) {
          if (a.position < b.position) {
            return -1;
          }
          if (a.position > b.position) {
            return 1;
          }
          return 0;
        };
        for (var i = 0; i < aAttributeFacets.length; i++) {
          var aAttributeFacet = aAttributeFacets[i];
          if (typeof aAttributeFacet.position !== "undefined") {
            continue;
          }
          // DWC exit
          if (searchModel.config.searchInAttibuteFacetPostion) {
            aAttributeFacet.position = searchModel.config.searchInAttibuteFacetPostion[aAttributeFacet.dimension] || i + 1000;
          } else {
            aAttributeFacet.position = i + 1000;
          }
        }
        // re-sort attributeFacets according if position is available in config
        // the order of other attributeFacets is kept unchanged
        aAttributeFacets.sort(oCompareFunction);
        return aAttributeFacets;
      }
    }, {
      key: "getDialogFacetsFromMetaData",
      value: function getDialogFacetsFromMetaData(dataSource, searchFacetDialogModel) {
        var facets = [];
        // attribute facets
        var attributeFacets = this.getAttributeDialogFacetsFromMetaData(dataSource, searchFacetDialogModel);
        facets.push.apply(facets, _toConsumableArray(attributeFacets));
        // dynamic hierarchy attribute facets
        var hierarchyDynamicFacets = this.hierarchyDynamicFacetsFormatter.getFacetsFromMetadata(dataSource, searchFacetDialogModel);
        facets.push.apply(facets, _toConsumableArray(hierarchyDynamicFacets));
        // sort
        facets.sort(function (a, b) {
          return a.title.localeCompare(b.title);
        });
        // set facet index
        this.setFacetIndex(facets);
        return facets;
      }
    }, {
      key: "getAttributeDialogFacetsFromMetaData",
      value: function getAttributeDialogFacetsFromMetaData(oMetaData, searchFacetDialogModel) {
        var aServerSideFacets = jQuery.map(oMetaData.attributeMetadataMap, function (el) {
          return el;
        });
        var aClientSideFacets = [];
        // extract facets from server response:
        var _iterator4 = _createForOfIteratorHelper(aServerSideFacets),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var oServerSideFacet = _step4.value;
            if ((oServerSideFacet.usage.Facet || oServerSideFacet.usage.AdvancedSearch) && oServerSideFacet.isHierarchy !== true) {
              var oClientSideFacet = new Facet({
                title: oServerSideFacet.label,
                facetType: "attribute",
                dimension: oServerSideFacet.id,
                dataType: oServerSideFacet.type,
                matchingStrategy: oServerSideFacet.matchingStrategy
              });

              // DWC exit
              if (searchFacetDialogModel.config.showSpaceFacetInShowMoreDialog) {
                if (searchFacetDialogModel.config.showSpaceFacetInShowMoreDialog(oServerSideFacet.id) === false) {
                  oClientSideFacet.visible = false;
                }
              }
              var aFacetItemsWithFilterConditions = this._createFacetItemsFromConditionGroup(searchFacetDialogModel.getDataSource(), searchFacetDialogModel.getProperty("/uiFilter/rootCondition"));
              var count = 0;
              for (var k = 0, lenK = aFacetItemsWithFilterConditions.length; k < lenK; k++) {
                var oSelectedFacetItem = aFacetItemsWithFilterConditions[k];
                oSelectedFacetItem.visible = oClientSideFacet.visible;
                if (oSelectedFacetItem.facetAttribute === oClientSideFacet.dimension) {
                  count++;
                  oClientSideFacet.items.splice(0, 0, oSelectedFacetItem);
                }
              }
              oClientSideFacet["count"] = count; // ToDo, 'count does not exist ?!?'

              aClientSideFacets.push(oClientSideFacet);
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
        return aClientSideFacets;
      }
    }, {
      key: "getDialogFacetsFromChartQuery",
      value: function getDialogFacetsFromChartQuery(resultSet, searchModel, dimension, filters) {
        var oClientSideFacet = new Facet({
          dimension: dimension
        });
        if (resultSet) {
          for (var j = 0; j < resultSet.items.length; j++) {
            var oFacetListItem = resultSet.items[j];
            var item = new FacetItem({
              value: oFacetListItem.measureValue,
              // value: oFacetListItem.measureValue.toString(),
              filterCondition: oFacetListItem.filterCondition,
              label: oFacetListItem.dimensionValueFormatted,
              facetAttribute: resultSet.query.dimension
            });
            oClientSideFacet.items.push(item);
          }

          // add filter conditions as facet items:
          var aFacetItemsWithFilterConditions;
          if (filters) {
            aFacetItemsWithFilterConditions = filters;
          } else {
            aFacetItemsWithFilterConditions = this._createFacetItemsFromConditionGroup(searchModel.getDataSource(), searchModel.getProperty("/uiFilter/rootCondition"));
          }
          for (var k = 0, lenK = aFacetItemsWithFilterConditions.length; k < lenK; k++) {
            var oSelectedFacetItem = aFacetItemsWithFilterConditions[k];
            if (oSelectedFacetItem.facetAttribute === oClientSideFacet.dimension) {
              var facetItemFoundInFacet = false;
              for (var m = 0, lenM = oClientSideFacet.items.length; m < lenM; m++) {
                var facetItem = oClientSideFacet.items[m];
                if (oSelectedFacetItem.filterCondition.equals(facetItem.filterCondition)) {
                  facetItem.selected = true;
                  facetItemFoundInFacet = true;
                }
              }
              if (!facetItemFoundInFacet) {
                // there is no such facet item -> add the facet item to the facet
                oClientSideFacet.items.splice(oClientSideFacet.items.length, 0, oSelectedFacetItem);
                if (oSelectedFacetItem.filterCondition.userDefined) {
                  oSelectedFacetItem.advanced = true;
                } else {
                  oSelectedFacetItem.listed = true;
                  oSelectedFacetItem.value = "";
                  oSelectedFacetItem.valueLabel = "";
                }
              } else {
                oSelectedFacetItem.listed = true;
              }
            }
          }
        }
        return oClientSideFacet;
      }
    }, {
      key: "hasDialogFacetsFromMetaData",
      value: function hasDialogFacetsFromMetaData(searchModel) {
        var oMetaData = searchModel.getDataSource();
        var aServerSideFacets = jQuery.map(oMetaData.attributeMetadataMap, function (el) {
          return el;
        });
        var hasDialogFacets = false;

        // extract facets from server response:
        // for (let i = 0, len = aServerSideFacets.length; i < len; i++) {
        //   const oServerSideFacet = aServerSideFacets[i];
        var _iterator5 = _createForOfIteratorHelper(aServerSideFacets),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var oServerSideFacet = _step5.value;
            // DWC exit
            // if (searchFacetDialogModel.config.showSpaceFacetInShowMoreDialog) {
            //     if (searchFacetDialogModel.config.showSpaceFacetInShowMoreDialog(oServerSideFacet.id) === false) {
            //         continue;
            //     }
            // }

            if (oServerSideFacet.usage) {
              if (oServerSideFacet.usage.Facet || oServerSideFacet.usage.AdvancedSearch) {
                // TODO: ||, show more displays facets + advanced search
                hasDialogFacets = true;
                break;
              }
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
        return hasDialogFacets;
      }
    }, {
      key: "handleDataSourceChanged",
      value: function handleDataSourceChanged() {
        this.hierarchyDynamicFacetsFormatter.handleDataSourceChanged();
        this.hierarchyStaticFacetsFormatter.handleDataSourceChanged();
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.hierarchyDynamicFacetsFormatter.destroy();
        this.hierarchyDynamicFacetsFormatter = null;
        this.hierarchyStaticFacetsFormatter.destroy();
        this.hierarchyStaticFacetsFormatter = null;
      }
    }]);
    return SearchFacetsFormatter;
  }();
  return SearchFacetsFormatter;
});
})();