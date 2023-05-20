/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchHelper", "sap/m/List", "sap/ui/core/ResizeHandler"], function (SearchHelper, List, ResizeHandler) {
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
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchResultList = List.extend("sap.esh.search.ui.controls.SearchResultList", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      List.prototype.constructor.call(this, sId, options);
      this.addStyleClass("searchResultList");
    },
    onAfterRendering: function _onAfterRendering() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // first let the original sap.m.List do its work
      List.prototype.onAfterRendering.apply(this, args);
      var model = this.getModel();
      var multiSelectionEnabled = model.getProperty("/multiSelectionEnabled");
      if (multiSelectionEnabled) {
        this.enableSelectionMode(false);
      }
      this._prepareResizeHandler();
      this.collectListItemsForNavigation();
    },
    collectListItemsForNavigation: function _collectListItemsForNavigation() {
      var _this = this;
      var aMyListItems = this.getItems();
      if (aMyListItems.length === 0) {
        return;
      }
      var doCollectListItemsForNavigationCallback = function doCollectListItemsForNavigationCallback() {
        _this._doCollectListItemsForNavigation();
      };

      // we need to be aware of any re-rendering happening inside the app tile container,
      // thus let's listen for any re-rendering going on inside
      for (var i = 0; i < aMyListItems.length; i++) {
        var oMyItem = aMyListItems[i];
        if (oMyItem.hasStyleClass("sapUshellSearchResultListItemApps")) {
          var oContent = oMyItem.getContent(); // see SearchCompositeControl, function assembleAppContainerResultListItem
          if (oContent.length > 0) {
            oContent[0].addEventDelegate({
              onAfterRendering: doCollectListItemsForNavigationCallback
            });
          }
        }
      }
      this._doCollectListItemsForNavigation();
    },
    _doCollectListItemsForNavigation: function _doCollectListItemsForNavigation() {
      var i, j;
      var oFocusRef = this.getDomRef();
      if (!oFocusRef) {
        return;
      }
      var oItemNavigation = this.getItemNavigation();
      if (!oItemNavigation) {
        this["_startItemNavigation"](); // ToDo: access to private property
        oItemNavigation = this.getItemNavigation();
      }
      if (!oItemNavigation) {
        return; // apparently this is a Tap-Device, e.g. an iPad
      }

      this["_bItemNavigationInvalidated"] = false; // ToDo: access to private property

      // adopt the item navigation to our needs:

      // collect the dom references of the items
      var aRows = oFocusRef.getElementsByTagName("li");
      var aDomRefs = [];
      var aTileDomRefs = [];
      for (i = 0; i < aRows.length; i++) {
        var oRow = aRows[i];
        if (oRow.classList.contains("sapUshellSearchResultListItemApps")) {
          // handle tiles (including the ShowMore-Tile)
          var aTiles = oRow.getElementsByClassName("sapUshellSearchTileWrapper"); // ToDo: 'sapUshellSearchTileWrapper' might be replaced by UI5
          for (j = 0; j < aTiles.length; j++) {
            var tile = aTiles[j];
            var domRef = SearchHelper.getFocusableTileDomRef(tile); // ToDo 'any'
            if (!domRef || $(domRef).is(":hidden")) {
              continue;
            }
            aDomRefs.push(domRef);
            aTileDomRefs.push(domRef);
          }
          $(oRow).removeAttr("tabindex");
          $(oRow).removeAttr("role");
          $(oRow).attr("aria-hidden", "true");
        } else if ($(oRow).hasClass("sapUshellSearchResultListFooter")) {
          // handle ShowMore-Button
          var aShowMoreLink = oRow.getElementsByClassName("sapUshellResultListMoreFooter");
          for (j = 0; j < aShowMoreLink.length; j++) {
            aDomRefs.push(aShowMoreLink[j]);
            aTileDomRefs.push(aShowMoreLink[j]);
          }
        } else if ($(oRow).hasClass("sapUshellSearchResultListItem")) {
          // normal List Items
          aDomRefs.push(oRow);
          aTileDomRefs.push(oRow);
        }
      }

      // set the root dom node that surrounds the items
      if (aDomRefs.length > 0) {
        var $closestUL = $(aDomRefs[0]).closest("ul");
        var rootDomRef = $closestUL.length > 0 ? $closestUL[0] : aDomRefs[0].parentElement;
        oItemNavigation.setRootDomRef(rootDomRef);
      }

      // set the array of dom nodes representing the items.
      oItemNavigation.setItemDomRefs(aDomRefs);

      // turn of the cycling
      oItemNavigation.setCycling(false);
      oItemNavigation.setPageSize(10);
      if (aTileDomRefs.length > 0) {
        var ariaOwnsString = $(aTileDomRefs[0]).attr("id");
        for (i = 1; i < aTileDomRefs.length; i++) {
          ariaOwnsString += " " + $(aTileDomRefs[i]).attr("id");
        }
        $(this.getDomRef()).children("[role='listbox']").attr("aria-owns", ariaOwnsString);
      }
    },
    _prepareResizeHandler: function _prepareResizeHandler() {
      var _this2 = this;
      var resizeThresholds = [768, 1151];
      var windowWidthIndex = function windowWidthIndex() {
        var windowWidth = window.innerWidth;
        if (windowWidth < resizeThresholds[0]) {
          return 0;
        }
        for (var i = 0; i < resizeThresholds.length - 1; i++) {
          if (windowWidth >= resizeThresholds[i] && windowWidth < resizeThresholds[i + 1]) {
            return i + 1;
          }
        }
        return resizeThresholds.length;
      };
      var lastWindowWidthIndex = windowWidthIndex();
      this._resizeHandler = function (forceResize) {
        var currentWindowWidthIndex = windowWidthIndex();
        if (currentWindowWidthIndex != lastWindowWidthIndex || forceResize) {
          lastWindowWidthIndex = currentWindowWidthIndex;
          var aMyListItems = _this2.getItems();
          var _iterator = _createForOfIteratorHelper(aMyListItems),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var listItem = _step.value;
              var listItemContent = listItem.getContent(); // ToDo
              if ((listItemContent === null || listItemContent === void 0 ? void 0 : listItemContent.length) > 0) {
                var _listItemContent$;
                if (typeof ((_listItemContent$ = listItemContent[0]) === null || _listItemContent$ === void 0 ? void 0 : _listItemContent$.resizeEventHappened) === "function") {
                  var _listItemContent$2;
                  (_listItemContent$2 = listItemContent[0]) === null || _listItemContent$2 === void 0 ? void 0 : _listItemContent$2.resizeEventHappened();
                }
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
      };
      ResizeHandler.register(this, function () {
        // similar to $(window).on("resize", this._resizeHandler)
        _this2._resizeHandler();
      });
    },
    resize: function _resize() {
      if (typeof this._resizeHandler !== "undefined") {
        this._resizeHandler(true /* forceResize */);
      }
    },

    enableSelectionMode: function _enableSelectionMode(animated) {
      var _this3 = this;
      var deferredReturn = jQuery.Deferred(); // jQuery Deferred for jQuery Animation und Non-Animation

      animated = animated === undefined ? true : animated;
      var searchResultList = $(this.getDomRef());
      if (!animated) {
        searchResultList.addClass("sapUshellSearchResultList-ShowMultiSelection");
        deferredReturn.resolve();
        return deferredReturn.promise();
      }
      var animationDuration = 200;
      var checkBoxExpandContainers = searchResultList.find(".sapUshellSearchResultListItem-CheckboxExpandContainer");
      var attributesContainers = searchResultList.find(".sapUshellSearchResultListItem-Attributes");
      var currentAttributesPadding = parseFloat(attributesContainers.css("padding-left"));
      var checkBoxContainer = checkBoxExpandContainers.find(".sapUshellSearchResultListItem-CheckboxContainer");
      var checkBoxWidth = checkBoxContainer.width();
      if (!searchResultList.hasClass("sapUshellSearchResultList-ShowMultiSelection")) {
        checkBoxExpandContainers.css("width", "0");
        checkBoxExpandContainers.css("opacity", "0");
        attributesContainers.css("padding-left", currentAttributesPadding);
        searchResultList.addClass("sapUshellSearchResultList-ShowMultiSelection");
        var newPadding = currentAttributesPadding + checkBoxWidth;
        checkBoxExpandContainers.animate({
          width: checkBoxWidth,
          opacity: 1
        }, animationDuration, function () {
          $(_this3).css("width", "");
          $(_this3).css("opacity", "");
        });
        attributesContainers.animate({
          "padding-left": newPadding
        }, animationDuration, function () {
          $(_this3).css("padding-left", "");
        });
      }
    },
    disableSelectionMode: function _disableSelectionMode(animated) {
      var deferredReturn = jQuery.Deferred(); // jQuery Deferred for jQuery Animation und Non-Animation

      animated = animated === undefined ? true : animated;
      var searchResultList = $(this.getDomRef());
      if (!animated) {
        searchResultList.removeClass("sapUshellSearchResultList-ShowMultiSelection");
        deferredReturn.resolve();
        return deferredReturn.promise();
      }
      var animationDuration = 200;
      var checkBoxExpandContainers = searchResultList.find(".sapUshellSearchResultListItem-CheckboxExpandContainer");
      var attributesContainers = searchResultList.find(".sapUshellSearchResultListItem-Attributes");
      var currentAttributesPadding = parseFloat(attributesContainers.css("padding-left"));
      var checkBoxContainer = checkBoxExpandContainers.find(".sapUshellSearchResultListItem-CheckboxContainer");
      var checkBoxWidth = checkBoxContainer.width();
      if (searchResultList.hasClass("sapUshellSearchResultList-ShowMultiSelection")) {
        var newPadding = currentAttributesPadding - checkBoxWidth;
        var animation01 = checkBoxExpandContainers.animate({
          width: 0,
          opacity: 0
        }, animationDuration).promise();
        var animation02 = attributesContainers.animate({
          "padding-left": newPadding
        }, animationDuration).promise();
        jQuery.when(animation01, animation02).done(function () {
          // jQuery Deferred for jQuery Animation, Unable to convert to Promise
          searchResultList.removeClass("sapUshellSearchResultList-ShowMultiSelection");
          checkBoxExpandContainers.css("width", "");
          checkBoxExpandContainers.css("opacity", "");
          attributesContainers.css("padding-left", "");
        });
      }
    }
  });
  return SearchResultList;
});
})();