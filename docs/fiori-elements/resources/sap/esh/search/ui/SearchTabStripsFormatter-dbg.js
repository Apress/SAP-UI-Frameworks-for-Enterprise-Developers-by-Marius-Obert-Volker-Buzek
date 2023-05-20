/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./error/ErrorHandler", "./sinaNexTS/sina/DataSourceResultSet", "./sinaNexTS/sina/UserCategoryDataSource", "sap/esh/search/ui/error/errors"], function (__ErrorHandler, ___sinaNexTS_sina_DataSourceResultSet, ___sinaNexTS_sina_UserCategoryDataSource, errors) {
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
  var DataSourceResultSet = ___sinaNexTS_sina_DataSourceResultSet["DataSourceResultSet"];
  var UserCategoryDataSource = ___sinaNexTS_sina_UserCategoryDataSource["UserCategoryDataSource"];
  // =======================================================================
  // tree node
  // =======================================================================
  var Node = /*#__PURE__*/function () {
    function Node(dataSource, count, tree) {
      _classCallCheck(this, Node);
      this.dataSource = dataSource;
      this.count = count;
      this.children = [];
      this.parent = null;
      this.tree = tree;
    }
    _createClass(Node, [{
      key: "equals",
      value: function equals(other) {
        return this === other;
      }
    }, {
      key: "setCount",
      value: function setCount(count) {
        this.count = count;
      }
    }, {
      key: "getAncestors",
      value: function getAncestors() {
        /* eslint consistent-this: 0 */
        var ancestors = [];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var currentNode = this;
        while (currentNode.parent) {
          ancestors.push(currentNode.parent);
          currentNode = currentNode.parent;
        }
        return ancestors;
      }
    }, {
      key: "getChildren",
      value: function getChildren() {
        // collect children, ignore children with unsure path information
        var children = [];
        for (var i = 0; i < this.children.length; ++i) {
          var child = this.children[i];
          if (child.unsureWhetherNodeisBelowRoot) {
            continue;
          }
          children.push(child);
        }
        return children;
      }
    }, {
      key: "getChildrenSortedByCount",
      value: function getChildrenSortedByCount() {
        // collect children, ignore children with unsure path information
        var children = this.getChildren();
        // sort by count
        children.sort(function (c1, c2) {
          return c2.count - c1.count;
        });
        return children;
      }
    }, {
      key: "clearChildren",
      value: function clearChildren() {
        for (var i = 0; i < this.children.length; ++i) {
          var child = this.children[i];
          child.parent = null;
        }
        this.children = [];
      }
    }, {
      key: "appendNode",
      value: function appendNode(node) {
        node.parent = this;
        this.children.push(node);
      }
    }, {
      key: "appendNodeAtIndex",
      value: function appendNodeAtIndex(node, index) {
        node.parent = this;
        this.children.splice(index, 0, node);
      }
    }, {
      key: "insertNode",
      value: function insertNode(node) {
        // no siblings exist -> append the only one child node
        if (this.children.length === 0) {
          this.appendNode(node);
          return;
        }

        // insert Apps node as the first child node
        if (node.dataSource === this.tree.model.appDataSource) {
          this.appendNodeAtIndex(node, 0);
          return;
        }

        // insert My Favorites node as the first child node but not before the Apps node
        if (node.dataSource === this.tree.model.favDataSource) {
          if (this.children[0].dataSource === this.tree.model.appDataSource) {
            this.appendNodeAtIndex(node, 1);
          } else {
            this.appendNodeAtIndex(node, 0);
          }
          return;
        }
        var index = -1;
        var appendNode = true;
        var _iterator = _createForOfIteratorHelper(this.children),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var nodeWrk = _step.value;
            index++;
            if (nodeWrk.dataSource === this.tree.model.appDataSource || nodeWrk.dataSource === this.tree.model.favDataSource || nodeWrk.children.length > 0) {
              // Do not compare with Apps node or MyFavorites node or folders
              continue;
            }

            // node's position will be before existing node
            if (nodeWrk.dataSource.labelPlural && node.dataSource.labelPlural && nodeWrk.dataSource.labelPlural > node.dataSource.labelPlural) {
              appendNode = false;
              break;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        if (appendNode) {
          this.appendNode(node);
        } else {
          this.appendNodeAtIndex(node, index);
        }
      }
    }, {
      key: "removeChildNode",
      value: function removeChildNode(node) {
        // remove from children
        var index = this.children.indexOf(node);
        if (index < 0) {
          return;
        }
        this.children.splice(index, 1);

        // node now has no parent
        node.parent = null;
      }
    }, {
      key: "hasChild",
      value: function hasChild(node) {
        return this.children.indexOf(node) > -1;
      }
    }, {
      key: "hasSibling",
      value: function hasSibling(node) {
        if (this.equals(node)) {
          return false;
        }
        var parent = this.parent;
        if (!parent) {
          return false;
        }
        if (parent.hasChild(node)) {
          return true;
        }
        return false;
      }
    }, {
      key: "_findNode",
      value: function _findNode(dataSource, result) {
        if (this.dataSource === dataSource) {
          result.push(this);
          return;
        }
        for (var i = 0; i < this.children.length; ++i) {
          var child = this.children[i];
          child._findNode(dataSource, result);
          if (result.length > 0) {
            return;
          }
        }
      }
    }]);
    return Node;
  }(); // =======================================================================
  // tree
  // =======================================================================
  var Tree = /*#__PURE__*/function () {
    function Tree(rootDataSource, model) {
      _classCallCheck(this, Tree);
      this.model = model;
      this.rootNode = new Node(rootDataSource, null, this);
    }
    _createClass(Tree, [{
      key: "reset",
      value: function reset() {
        this.rootNode = null;
      }
    }, {
      key: "invalidate",
      value: function invalidate(dataSource) {
        var node = this.findNode(dataSource);
        if (!node) {
          this.rootNode.children = [];
          this.rootNode.count = 0;
          return;
        }
        var childNode = null;
        while (node) {
          node.children = childNode ? [childNode] : [];
          node.count = null;
          if (childNode) {
            childNode.count = null;
          }
          childNode = node;
          node = node.parent;
        }
      }
    }, {
      key: "findNode",
      value: function findNode(dataSource) {
        if (!this.rootNode) {
          return null;
        }
        var result = [];
        this.rootNode._findNode(dataSource, result);
        return result.length > 0 ? result[0] : null;
      }
    }, {
      key: "hasChild",
      value: function hasChild(ds1, ds2) {
        if (ds2 === this.rootNode.dataSource) {
          return false;
        }
        var node1 = this.findNode(ds1);
        if (!node1) {
          //throw 'No node for datasource ' + ds1.toString();
          return false;
        }
        var node2 = this.findNode(ds2);
        if (!node2) {
          //throw 'No node for datasource ' + ds2.toString();
          return false;
        }
        return node1.hasChild(node2);
      }
    }, {
      key: "hasSibling",
      value: function hasSibling(ds1, ds2) {
        if (ds2 === this.rootNode.dataSource) {
          return false;
        }
        var node1 = this.findNode(ds1);
        if (!node1) {
          //throw 'No node for datasource ' + ds1.toString();
          return false;
        }
        var node2 = this.findNode(ds2);
        if (!node2) {
          //throw 'No node for datasource ' + ds2.toString();
          return false;
        }
        return node1.hasSibling(node2);
      }
    }, {
      key: "removeObsoleteTreeNodes",
      value: function removeObsoleteTreeNodes(node, resultDataSources) {
        // Loop from the end because of deletion of nodes
        for (var i = node.children.length - 1; i >= 0; i--) {
          var childNode = node.children[i];
          if (childNode.children.length > 0) {
            // current node has children
            this.removeObsoleteTreeNodes(childNode, resultDataSources);
          }
          // if dataSource of childNode is not included in resultDataSources -> remove it from node
          if (resultDataSources.map(function (x) {
            return x.dataSource;
          }).indexOf(childNode.dataSource) === -1) {
            node.removeChildNode(childNode);
          }
        }
      }
    }, {
      key: "updateFromPerspective",
      value: function updateFromPerspective(dataSource, perspective) {
        // update current tree node
        var currentCount = 0;
        var resultDataSources;

        // get count from search results (from ESH search without App search result count)
        if (perspective) {
          currentCount = perspective.totalCount;
        }
        var currentNode = this.findNode(dataSource);
        // node for dataSource already exists
        if (currentNode) {
          resultDataSources = this.collectDataSourcesFromResult(currentNode, perspective);
          // remove nodes if not needed for current tree
          this.removeObsoleteTreeNodes(currentNode, resultDataSources);
        } else {
          // node for dataSource not found -> create new node and append temporary below root node
          // we do not really now that this node is directly below root -> set flag unsureWhetherNodeisBelowRoot
          // flag is evaluated later in order to correct location of node
          currentNode = new Node(dataSource, currentCount, this);
          resultDataSources = this.collectDataSourcesFromResult(currentNode, perspective);
          // remove nodes if not needed for current tree
          this.removeObsoleteTreeNodes(this.rootNode, resultDataSources);

          // dataSource is "My Favorites", node is always below "All"
          if (currentNode.dataSource === this.model.favDataSource) {
            currentNode.unsureWhetherNodeisBelowRoot = false;
          } else {
            currentNode.unsureWhetherNodeisBelowRoot = true;
          }
          if (this.isIncludedInMyFavorites(dataSource)) {
            // dataSource is included in "My Favorites" -> create new node for "My Favorites" if not exists
            var myFavNode = this.findNode(this.model.favDataSource);
            if (!myFavNode) {
              myFavNode = new Node(this.model.favDataSource, 0, this);
              myFavNode.unsureWhetherNodeisBelowRoot = false;
              this.rootNode.insertNode(myFavNode);
            }
            myFavNode.insertNode(currentNode);
          } else {
            this.rootNode.insertNode(currentNode);
          }
        }
        currentNode.setCount(currentCount);

        // for root node: add apps count to count
        if (dataSource === this.model.allDataSource || this.model.isUserCategory()) {
          currentNode.setCount(currentNode.count + this.model.getProperty("/appCount"));
        } else if (dataSource === this.model.appDataSource) {
          currentNode.setCount(this.model.getProperty("/appCount"));
        }

        // update child nodes
        this.updateTreeFromPerspective(currentNode, resultDataSources);

        // update count for "My Favorites" node
        this.updateCountMyFavorites(currentNode, resultDataSources);
      }
    }, {
      key: "updateMyFavTreeNode",
      value: function updateMyFavTreeNode(currentNode, resultDataSources) {
        // add node MyFavorites if dataSource = All and
        // "Use Personalized Search Scope" is switched on/ My Favorites is visible
        if (this.model.userCategoryManager && this.model.userCategoryManager.isFavActive()) {
          if (currentNode.dataSource === this.model.allDataSource) {
            var myFavNode = this.findNode(this.model.favDataSource);
            if (!myFavNode) {
              myFavNode = new Node(this.model.favDataSource, resultDataSources.filter(function (x) {
                return x.isFavDataSource;
              }).reduce(function (sum, cur) {
                return sum + cur.measureValue;
              }, 0), this);
              // filter all isFavDataSources from resultDataSources, from the result array sum all measureValues
              // 0 is start value for sum variable
              currentNode.unsureWhetherNodeisBelowRoot = false;
              currentNode.insertNode(myFavNode);
            }
          }
        }
      }
    }, {
      key: "updateCountMyFavorites",
      value: function updateCountMyFavorites(currentNode, resultDataSources) {
        var myFavNode = this.findNode(this.model.favDataSource);
        if (myFavNode && currentNode.dataSource === this.model.allDataSource) {
          // calculate count for All search (works only properly if no other categories exist
          // resultDataSources must contain all dataSources for business objects (not possible with deep hierarchies)
          myFavNode.setCount(resultDataSources.filter(function (x) {
            return x.isFavDataSource;
          }).reduce(function (sum, cur) {
            return sum + cur.measureValue;
          }, 0));
          // Apps are included in "My Favorites" and not included in resultDataSources
          // use case: All search with Apps in "My Favorites"
          if (this.isIncludedInMyFavorites(this.model.appDataSource) && resultDataSources.map(function (x) {
            return x.dataSource;
          }).indexOf(this.model.appDataSource) === -1) {
            myFavNode.setCount(myFavNode.count + this.model.getProperty("/appCount"));
          }
        }
      }
    }, {
      key: "getFacets",
      value: function getFacets(currentNode, perspective) {
        // use facets from perspective if exits
        // else use My Favorites information from subDataSources and perspective (count)
        // for construction the needed dataSource structure for facets,
        // only occurs if search result is from My Favorites and contains 1 business object only (facets are empty)
        function isDataSourceResultSetItem(item) {
          return item instanceof DataSourceResultSet;
        }
        var treeFacets = [];

        // no search results or dataSource is Apps
        if (!perspective || currentNode.dataSource === this.model.appDataSource) {
          return treeFacets;
        }

        // special case for "My Favorites" with one business object with results
        if (perspective.facets.length === 0 && perspective.items.length > 0 && currentNode.dataSource instanceof UserCategoryDataSource) {
          var items = [];
          items.push(this.model.sinaNext._createDataSourceResultSetItem({
            dataSource: currentNode.dataSource.subDataSources[0],
            dimensionValueFormatted: currentNode.dataSource.subDataSources[0].labelPlural,
            measureValue: perspective.totalCount,
            measureValueFormatted: perspective.totalCount.toString()
          }));
          var resultSet = this.model.sinaNext._createDataSourceResultSet({
            title: this.model.query.filter.dataSource.label,
            items: items,
            query: this.model.query
          });
          treeFacets.push(resultSet);
          return treeFacets;
        } else if (perspective.facets.length === 0) {
          return treeFacets;
        }
        if (!isDataSourceResultSetItem(perspective.facets[0])) {
          return treeFacets;
        }
        if (perspective.facets[0].type !== this.model.sinaNext.FacetType.DataSource) {
          return treeFacets;
        }
        // general case
        return perspective.facets;
      }
    }, {
      key: "isIncludedInMyFavorites",
      value: function isIncludedInMyFavorites(dataSource) {
        // dataSource is included in My Favorites
        if (this.model.userCategoryManager && this.model.userCategoryManager.isFavActive() && (this.model.favDataSource.subDataSources.indexOf(dataSource) > -1 || dataSource === this.model.appDataSource && this.model.favDataSource.includeApps)) {
          return true;
        } else {
          return false;
        }
      }
    }, {
      key: "collectDataSourcesFromResult",
      value: function collectDataSourcesFromResult(currentNode, perspective) {
        var _this = this;
        function isDataSourceResultSetItem(item) {
          return item instanceof DataSourceResultSet;
        }
        var resultDataSources = [];
        var resultDataSource = {};

        // Apps can only exists in All or "My Favorites"
        // Apps must have results
        if ((currentNode.dataSource === this.model.allDataSource || currentNode.dataSource === this.model.favDataSource) && this.model.getProperty("/appCount") > 0) {
          resultDataSource.dataSource = this.model.appDataSource;
          resultDataSource.isAppDataSource = true;
          resultDataSource.isFavDataSource = this.model.userCategoryManager ? this.model.userCategoryManager.isFavActive() ? this.model.favDataSource.includeApps : false : false;
          resultDataSource.measureValue = this.model.getProperty("/appCount");
          resultDataSource.measureValueFormatted = resultDataSource.measureValue.toString();
          resultDataSource.dimensionValueFormatted = this.model.appDataSource.labelPlural;
          // current dataSource is "My Favorites" and Apps is included in "My Favorites" or (Apps in MyFav)
          // current dataSource is All and Apps is not included in "My Favorites" (Apps in All)
          // -> add Apps to resultDataSources (not added for dataSource is All and Apps are included in MyFav)
          if (currentNode.dataSource === this.model.favDataSource && resultDataSource.isFavDataSource || currentNode.dataSource === this.model.allDataSource && !resultDataSource.isFavDataSource) {
            resultDataSources.push(resultDataSource);
          }
        }
        // Business Object
        if (currentNode.dataSource.type === this.model.sinaNext.DataSourceType.BusinessObject) {
          resultDataSource.dataSource = currentNode.dataSource;
          resultDataSource.isAppDataSource = false;
          resultDataSource.isFavDataSource = this.isIncludedInMyFavorites(currentNode.dataSource);
          resultDataSource.measureValue = currentNode.count ? currentNode.count : 0;
          resultDataSource.measureValueFormatted = resultDataSource.measureValue.toString();
          resultDataSource.dimensionValueFormatted = currentNode.dataSource.labelPlural ? currentNode.dataSource.labelPlural : currentNode.dataSource.label;
          resultDataSources.push(resultDataSource);
          return resultDataSources;
        }

        // get facets from perspective or from My Favorites subDataSource information
        var facets = this.getFacets(currentNode, perspective);
        if (!facets || facets.length === 0 || !isDataSourceResultSetItem(facets[0])) {
          return resultDataSources;
        }
        facets[0].items.forEach(function (item) {
          return resultDataSources.push({
            dataSource: item.dataSource,
            isAppDataSource: false,
            isFavDataSource: _this.isIncludedInMyFavorites(item.dataSource),
            measureValue: item.measureValue,
            measureValueFormatted: item.measureValueFormatted,
            dimensionValueFormatted: item.dimensionValueFormatted
          });
        });
        return resultDataSources;
      }
    }, {
      key: "updateTreeFromPerspective",
      value: function updateTreeFromPerspective(currentNode, resultDataSources) {
        // dataSource is Apps or no resultDataSources
        if (currentNode.dataSource === this.model.appDataSource || !resultDataSources) {
          return;
        }

        // add My Favorites tree node if needed
        this.updateMyFavTreeNode(currentNode, resultDataSources);
        var myFavNode = this.findNode(this.model.favDataSource);
        var _iterator2 = _createForOfIteratorHelper(resultDataSources),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var resultDataSource = _step2.value;
            var resultNode = this.findNode(resultDataSource.dataSource);
            if (resultNode) {
              if (resultNode.unsureWhetherNodeisBelowRoot) {
                resultNode.unsureWhetherNodeisBelowRoot = false;
              }
              // re-locate existing node for dataSource if neccessary
              // currentNode is UserCategory (My Favorites) or Category and not the correct parent for the child (resultNode)
              // -> delete the child from the wrong parent and insert to the correct node)
              if (currentNode !== resultNode.parent && (currentNode.dataSource.type === this.model.sinaNext.DataSourceType.Category || currentNode.dataSource.type === this.model.sinaNext.DataSourceType.UserCategory)) {
                resultNode.parent.removeChildNode(resultNode);
                currentNode.insertNode(resultNode);
              }
            } else {
              // create node for dataSource
              var childNode = new Node(resultDataSource.dataSource, resultDataSource.measureValue, this);
              childNode.unsureWhetherNodeisBelowRoot = false;
              // resultDataSource is included in "My Favorites" and must be inserted in the "My Favorites" node
              if (myFavNode && resultDataSource.isFavDataSource) {
                myFavNode.insertNode(childNode);
              } else {
                currentNode.insertNode(childNode);
              }
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }]);
    return Tree;
  }(); // =======================================================================
  // formatter
  // =======================================================================
  var Formatter = /*#__PURE__*/function () {
    function Formatter(rootDataSource, model) {
      _classCallCheck(this, Formatter);
      this.errorHandler = new ErrorHandler({
        model: model
      });
      this.tree = new Tree(rootDataSource, model);
    }
    _createClass(Formatter, [{
      key: "format",
      value: function format(dataSource, perspective, model) {
        this.tree.updateFromPerspective(dataSource, perspective);
        var tabStrips = this.generateTabStrips(dataSource, model);
        return tabStrips;
      }
    }, {
      key: "invalidate",
      value: function invalidate(dataSource) {
        if (this.tree) {
          this.tree.invalidate(dataSource);
        }
      }
    }, {
      key: "generateTabStrips",
      value: function generateTabStrips(dataSource, model) {
        // call default tab strip generation
        var tabStrips = this.doGenerateTabStrips(dataSource, model);
        // modify tabstips by exit but always ensure that selected datsasource is included in the tabstrips
        var formattedStrips;
        try {
          formattedStrips = model.config.tabStripsFormatter(tabStrips.strips);
          if (formattedStrips.indexOf(tabStrips.selected) < 0) {
            formattedStrips.splice(0, 0, tabStrips.selected); // add selected datasource
          }

          tabStrips.strips = formattedStrips;
        } catch (err) {
          var oError = new errors.ConfigurationExitError("tabStripsFormatter", model.config.applicationComponent, err);
          this.errorHandler.onError(oError);
          // do not throw oError, use standard DS tabstrips
          tabStrips = this.doGenerateTabStrips(dataSource, model);
        }
        return tabStrips;
      }
    }, {
      key: "doGenerateTabStrips",
      value: function doGenerateTabStrips(dataSource, model) {
        /* eslint no-lonely-if:0 */

        // init
        var tabStripLimit = 9999;
        var i, child, children;
        var tabStrips = {
          strips: [],
          selected: null
        };
        var node = this.tree.findNode(dataSource);

        // 1) no node in tree -> show ALL+ current datasource (should never happen)
        if (!node) {
          if (dataSource !== model.allDataSource) {
            tabStrips.strips.push(model.allDataSource);
          }
          tabStrips.strips.push(dataSource);
          tabStrips.selected = dataSource;
          return tabStrips;
        }

        // 2) node is $$ALL$$ -> show $$ALL$$ + children of $$ALL$$
        if (node.dataSource === model.allDataSource) {
          tabStrips.strips.push(model.allDataSource);
          children = node.getChildrenSortedByCount();
          for (i = 0; i < children.length && tabStrips.strips.length < tabStripLimit; ++i) {
            child = children[i];
            tabStrips.strips.push(child.dataSource);
          }
          tabStrips.selected = model.allDataSource;
          return tabStrips;
        }

        // 3) node is direct child of $$ALL$$ -> show $$ALL$$ + children of $$ALL$$
        if (node.parent === this.tree.rootNode && !node.unsureWhetherNodeisBelowRoot) {
          tabStrips.strips.push(model.allDataSource);

          // limit number of tabstrips but ensure that selected
          // node is included
          var includesNode = false;
          children = this.tree.rootNode.getChildrenSortedByCount();
          for (i = 0; i < children.length; ++i) {
            child = children[i];
            if (includesNode) {
              if (tabStrips.strips.length >= tabStripLimit) {
                break;
              }
              tabStrips.strips.push(child.dataSource);
            } else {
              if (tabStrips.strips.length < tabStripLimit - 1 || node === child) {
                tabStrips.strips.push(child.dataSource);
                if (node === child) {
                  includesNode = true;
                }
              }
            }
          }
          if (children.length === 0) {
            tabStrips.strips.push(node.dataSource);
          }

          // To be verified: move current datasource to second position
          //                var indexOfMyDatasource = tabStrips.strips.indexOf(node.dataSource);
          //                tabStrips.strips.splice(indexOfMyDatasource, 1);
          //                tabStrips.strips.splice(1, 0, node.dataSource);

          tabStrips.selected = node.dataSource;
          return tabStrips;
        }

        // 4) node not direct child of $$ALL$$ or unknown whether node is direct child of $$ALL$$
        // -> show $$ALL$$ + node
        tabStrips.strips.push(model.allDataSource);
        tabStrips.strips.push(node.dataSource);
        tabStrips.selected = node.dataSource;
        return tabStrips;
      }
    }]);
    return Formatter;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.Tree = Tree;
  __exports.Formatter = Formatter;
  return __exports;
});
})();