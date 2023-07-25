/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/m/Toolbar", "sap/m/library", "sap/m/Button", "sap/m/Link", "sap/m/ToolbarLayoutData", "sap/m/ToolbarSpacer", "sap/m/ActionSheet", "sap/ui/core/InvisibleText", "sap/ui/core/IconPool", "sap/ui/core/delegate/ItemNavigation", "sap/ui/core/Control"], function (__i18n, Toolbar, sap_m_library, Button, Link, ToolbarLayoutData, ToolbarSpacer, ActionSheet, InvisibleText, IconPool, ItemNavigation, Control) {
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
  var i18n = _interopRequireDefault(__i18n);
  var ToolbarDesign = sap_m_library["ToolbarDesign"];
  var ButtonType = sap_m_library["ButtonType"];
  var PlacementType = sap_m_library["PlacementType"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchRelatedObjectsToolbar = Control.extend("sap.esh.search.ui.controls.SearchRelatedObjectsToolbar", {
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm["class"]("sapUshellSearchResultListItem-RelatedObjectsToolbar");
        var oModel = oControl.getModel();
        if (oModel.config.optimizeForValueHelp) {
          oRm["class"]("sapUshellSearchResultListItem-RelatedObjectsToolbarValueHelp");
        }
        oRm.openEnd();
        oRm.renderControl(oControl.getAggregation("_ariaDescriptionForLinks")); // ToDo
        oControl._renderToolbar(oRm, oControl);
        oRm.close("div");
      }
    },
    metadata: {
      properties: {
        itemId: "string",
        navigationObjects: {
          type: "object",
          multiple: true
        },
        positionInList: "int"
      },
      aggregations: {
        _relatedObjectActionsToolbar: {
          type: "sap.m.Toolbar",
          multiple: false,
          visibility: "hidden"
        },
        _ariaDescriptionForLinks: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        },
        _overFlowSheet: {
          type: "sap.m.ActionSheet",
          multiple: false,
          visibility: "hidden"
        }
        /* _overFlowSheetButtons: {
            type: "sap.m.Button",
            multiple: true,
            singularName: "button",
            // visibility: "hidden",
            defaultValue: [],
        }, */
      }
    },

    constructor: function _constructor(sId, settings) {
      Control.prototype.constructor.call(this, sId, settings);
      SearchRelatedObjectsToolbar._allOfMyCurrentInstances.push(this);
      var relatedObjectActionsToolbar = new Toolbar("".concat(this.getId(), "--toolbar"), {
        design: ToolbarDesign.Solid
      });
      relatedObjectActionsToolbar.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);
      relatedObjectActionsToolbar.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Toolbar");
      this.setAggregation("_relatedObjectActionsToolbar", relatedObjectActionsToolbar);

      // overFlowButton
      var overFlowButton = new Button("".concat(this.getId(), "--overflowButton"), {
        icon: IconPool.getIconURI("overflow")
      });
      // overFlowSheet
      var overFlowSheet = new ActionSheet("".concat(this.getId(), "--actionSheet"), {
        placement: PlacementType.Top
      });
      this.setAggregation("_overFlowSheet", overFlowSheet);
      overFlowButton.attachPress(function () {
        overFlowSheet.openBy(overFlowButton);
      });
      this._overFlowButton = overFlowButton;
      relatedObjectActionsToolbar.addContent(overFlowButton);
      this.setAggregation("_ariaDescriptionForLinks", new InvisibleText({
        text: i18n.getText("result_list_item_aria_has_more_links")
      }));
      $(window).on("resize", function () {
        for (var i = 0; i < SearchRelatedObjectsToolbar._allOfMyCurrentInstances.length; i++) {
          SearchRelatedObjectsToolbar._allOfMyCurrentInstances[i].layoutToolbarElements();
        }
      });
    },
    exit: function _exit() {
      if (sap.ui.core.Control.prototype.exit) {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        // check whether superclass implements the method
        sap.ui.core.Control.prototype.exit.apply(this, args); // call the method with the original arguments
      }

      var allOfMyCurrentInstances = SearchRelatedObjectsToolbar._allOfMyCurrentInstances;
      for (var i = 0; i < allOfMyCurrentInstances.length; i++) {
        if (allOfMyCurrentInstances[i] === this) {
          allOfMyCurrentInstances.splice(i, 1);
          break;
        }
      }
      if (this._searchLayoutChangedIsSubscribed) {
        this._searchLayoutChangedIsSubscribed = false;
        this.getModel().unsubscribe("ESHSearchLayoutChanged", this.layoutToolbarElements, this);
      }
    },
    _renderToolbar: function _renderToolbar(oRm, oControl) {
      var oModel = oControl.getModel();
      var _relatedObjectActionsToolbar = oControl.getAggregation("_relatedObjectActionsToolbar");
      var _iterator = _createForOfIteratorHelper(_relatedObjectActionsToolbar.getContent()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var relatedObjectActionsToolbarItem = _step.value;
          if (relatedObjectActionsToolbarItem !== this._overFlowButton) {
            relatedObjectActionsToolbarItem.destroy();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (oModel.config.optimizeForValueHelp) {
        _relatedObjectActionsToolbar.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-ToolbarValueHelp");
      }
      var createPressHandler = function createPressHandler(navigationObject) {
        return function (event) {
          oControl._performNavigation(navigationObject, {
            trackingOnly: true,
            event: event
          });
        };
      };
      var navigationObjects = oControl.getProperty("navigationObjects");
      if (navigationObjects.length > 0) {
        var navigationObjectsLinks = [];
        for (var i = 0; i < navigationObjects.length; i++) {
          var navigationObject = navigationObjects[i];
          var link = new Link("".concat(oControl.getId(), "--link_").concat(i), {
            text: navigationObject.getText(),
            href: navigationObject.getHref(),
            layoutData: new ToolbarLayoutData({
              shrinkable: false
            }),
            press: createPressHandler(navigationObject)
          });
          var target = navigationObject.getTarget();
          if (target) {
            link.setTarget(target);
          }
          link.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Element");
          navigationObjectsLinks.push(link);
        }
        var toolbarSpacer = new ToolbarSpacer();
        toolbarSpacer.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Spacer");
        _relatedObjectActionsToolbar.addContent(toolbarSpacer);
        // navigation objects
        for (var _i = 0; _i < navigationObjectsLinks.length; _i++) {
          _relatedObjectActionsToolbar.addContent(navigationObjectsLinks[_i]);
        }
        if (oModel.config.optimizeForValueHelp) {
          this._overFlowButton.addStyleClass("sapUiSmallMarginBegin");
          this._overFlowButton.addStyleClass("sapUiTinyMarginEnd");
          this._overFlowButton.setType(ButtonType.Transparent);
        }
        oRm.renderControl(_relatedObjectActionsToolbar);
      }
    },
    onAfterRendering: function _onAfterRendering() {
      if (new Date().getMilliseconds() - this._lastAfterRenderingTime < 100) {
        return;
      }
      if (this.getAggregation("_relatedObjectActionsToolbar")) {
        this.layoutToolbarElements();
        this._addAriaInformation();
      }
      if (!this._searchLayoutChangedIsSubscribed) {
        this.getModel().subscribe("ESHSearchLayoutChanged", this.layoutToolbarElements, this);
        this._searchLayoutChangedIsSubscribed = true;
      }
      this._lastAfterRenderingTime = new Date().getMilliseconds();
    },
    layoutToolbarElements: function _layoutToolbarElements() {
      var _this = this;
      var _relatedObjectActionsToolbar = this.getAggregation("_relatedObjectActionsToolbar");
      if (!(this.getDomRef() && _relatedObjectActionsToolbar.getDomRef())) {
        return;
      }
      var $toolbar = $(_relatedObjectActionsToolbar.getDomRef());
      var toolbarWidth = $toolbar.width();

      // following return can cause issues in case of control being rendered more than once immediately after the first render
      // if (toolbarWidth === 0 || (this.toolbarWidth && this.toolbarWidth === toolbarWidth)) {
      //     return;
      // }

      if ($(this.getDomRef()).css("display") === "none" || $toolbar.css("display") === "none") {
        return;
      }
      this.toolbarWidth = toolbarWidth;
      var $overFlowButton = $(this._overFlowButton.getDomRef());
      $overFlowButton.css("display", "none");
      var toolbarElementsWidth = 0;
      var pressButton = function pressButton(event, _navigationObject) {
        _this._performNavigation(_navigationObject, {
          event: event
        });
      };
      var $toolbarElements = $toolbar.find(".sapUshellSearchResultListItem-RelatedObjectsToolbar-Element" // ToDo
      );

      for (var i = 0; i < $toolbarElements.length; i++) {
        var $element = $($toolbarElements[i]);
        $element.css("display", "");
        var _toolbarElementsWidth = toolbarElementsWidth + $element.outerWidth(true);
        if (_toolbarElementsWidth > toolbarWidth) {
          if (i < $toolbarElements.length) {
            $overFlowButton.css("display", "");
            var overFlowButtonWidth = $overFlowButton.outerWidth(true);
            for (; i >= 0; i--) {
              $element = $($toolbarElements[i]);
              _toolbarElementsWidth -= $element.outerWidth(true);
              if (_toolbarElementsWidth + overFlowButtonWidth <= toolbarWidth) {
                break;
              }
            }
          }
          var navigationObjects = this.getProperty("navigationObjects");
          var overFlowSheet = this.getAggregation("_overFlowSheet");
          overFlowSheet.destroyButtons();
          // const overFlowSheetButtons = []; //  = this.getAggregation("_overFlowSheetButtons") as Array<Button>;
          /* for (const overFlowSheetButton of overFlowSheetButtons) {
              overFlowSheetButton.destroy();
          } */
          // overFlowSheet.setAggregation("buttons", []);

          i = i >= 0 ? i : 0;
          for (; i < $toolbarElements.length; i++) {
            $element = $($toolbarElements[i]);
            $element.css("display", "none");
            var navigationObject = navigationObjects[i];
            var button = new Button({
              // const button = new Button(`${$toolbarElements[i].id}--button_${i}`, {
              text: navigationObject.getText()
            });
            // console.log(`${$toolbarElements[i].id}--button_${i}`);
            button.attachPress(navigationObject, pressButton);
            // overFlowSheetButtons.push(button);
            overFlowSheet.addButton(button);
          }
          // this.setAggregation("_overFlowSheetButtons", overFlowSheetButtons);
          // overFlowSheet.setAggregation("buttons", overFlowSheetButtons);
          break;
        }
        toolbarElementsWidth = _toolbarElementsWidth;
      }
      this._setupItemNavigation();
    },
    _setupItemNavigation: function _setupItemNavigation() {
      if (!this._theItemNavigation) {
        this._theItemNavigation = new ItemNavigation(null, []);
        this["addDelegate"](this._theItemNavigation); // ToDo, addDelegate n.a.
      }

      this._theItemNavigation.setCycling(false);
      this._theItemNavigation.setRootDomRef(this.getDomRef());
      var itemDomRefs = [];
      var _relatedObjectActionsToolbar = this.getAggregation("_relatedObjectActionsToolbar");
      var content = _relatedObjectActionsToolbar.getContent();
      for (var i = 0; i < content.length; i++) {
        if (!content[i].hasStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Element")) {
          continue;
        }
        if (!$(content[i].getDomRef()).attr("tabindex")) {
          var tabindex = "-1";
          if (content[i]["getPressed"] && content[i]["getPressed"]()) {
            tabindex = "0";
          }
          $(content[i].getDomRef()).attr("tabindex", tabindex);
        }
        itemDomRefs.push(content[i].getDomRef());
      }
      var overFlowButtonDomRef = this._overFlowButton.getDomRef();
      itemDomRefs.push(overFlowButtonDomRef);
      $(overFlowButtonDomRef).attr("tabindex", "-1");
      this._theItemNavigation.setItemDomRefs(itemDomRefs);
    },
    _addAriaInformation: function _addAriaInformation() {
      var $toolbar = $(this.getAggregation("_relatedObjectActionsToolbar").getDomRef());
      var $navigationLinks = $toolbar.find(".sapUshellSearchResultListItem-RelatedObjectsToolbar-Element");
      var $overFlowButton = $(this._overFlowButton.getDomRef());
      if ($navigationLinks.length > 0 || $overFlowButton.is(":visible")) {
        var ariaDescriptionId = this.getAggregation("_ariaDescriptionForLinks").getId();
        $navigationLinks.each(function () {
          var $this = $(this);
          var ariaDescription = $this.attr("aria-describedby") || "";
          ariaDescription += " " + ariaDescriptionId;
          $this.attr("aria-describedby", ariaDescription);
        });
        if ($overFlowButton.is(":visible")) {
          var ariaDescription = $overFlowButton.attr("aria-describedby") || "";
          ariaDescription += " " + ariaDescriptionId;
          $overFlowButton.attr("aria-describedby", ariaDescription);
        }
      }
    },
    _performNavigation: function _performNavigation(navigationTarget, params) {
      var trackingOnly = (params === null || params === void 0 ? void 0 : params.trackingOnly) || false;
      var event = params === null || params === void 0 ? void 0 : params.event;
      navigationTarget.performNavigation({
        trackingOnly: trackingOnly,
        event: event
      });
    }
  });
  SearchRelatedObjectsToolbar._allOfMyCurrentInstances = [];
  return SearchRelatedObjectsToolbar;
});
})();