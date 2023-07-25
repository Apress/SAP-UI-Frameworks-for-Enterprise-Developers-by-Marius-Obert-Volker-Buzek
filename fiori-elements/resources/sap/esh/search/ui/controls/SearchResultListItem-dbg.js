/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/esh/search/ui/controls/SearchText", "sap/esh/search/ui/controls/SearchLink", "sap/esh/search/ui/SearchHelper", "sap/esh/search/ui/controls/SearchRelatedObjectsToolbar", "sap/m/Button", "sap/m/library", "sap/m/Label", "sap/m/Text", "sap/m/CheckBox", "sap/ui/core/Icon", "sap/ui/core/IconPool", "sap/ui/core/InvisibleText", "sap/ui/core/Control", "../sinaNexTS/providers/abap_odata/UserEventLogger", "../UIUtil"], function (__i18n, SearchText, SearchLink, SearchHelper, SearchRelatedObjectsToolbar, Button, sap_m_library, Label, Text, CheckBox, Icon, IconPool, InvisibleText, Control, ___sinaNexTS_providers_abap_odata_UserEventLogger, ___UIUtil) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var i18n = _interopRequireDefault(__i18n);
  var ButtonType = sap_m_library["ButtonType"];
  var ListType = sap_m_library["ListType"];
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  var registerHandler = ___UIUtil["registerHandler"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchResultListItem = Control.extend("sap.esh.search.ui.controls.SearchResultListItem", {
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        // static function, so use the given "oControl" instance instead of "this" in the renderer function
        oControl._renderer(oRm, oControl);
      }
    },
    metadata: {
      properties: {
        dataSource: "object",
        // sina data source
        itemId: "string",
        title: "string",
        titleDescription: "string",
        titleNavigation: "object",
        titleIconUrl: "string",
        titleInfoIconUrl: "string",
        geoJson: "object",
        type: "string",
        imageUrl: "string",
        imageFormat: "string",
        imageNavigation: "object",
        attributes: {
          type: "object",
          multiple: true
        },
        navigationObjects: {
          type: "object",
          multiple: true
        },
        selected: "boolean",
        expanded: "boolean",
        parentListItem: "object",
        additionalParameters: "object",
        positionInList: "int",
        resultSetId: "string",
        layoutCache: "object",
        countBreadcrumbsHiddenElement: "object"
      },
      aggregations: {
        _titleLink: {
          type: "sap.esh.search.ui.controls.SearchLink",
          multiple: false,
          visibility: "hidden"
        },
        _titleLinkDescription: {
          type: "sap.esh.search.ui.controls.SearchText",
          multiple: false,
          visibility: "hidden"
        },
        _titleInfoIcon: {
          type: "sap.ui.core.Icon",
          multiple: false,
          visibility: "hidden"
        },
        _titleDelimiter: {
          type: "sap.m.Text",
          multiple: false,
          visibility: "hidden"
        },
        _typeText: {
          type: "sap.esh.search.ui.controls.SearchText",
          multiple: false,
          visibility: "hidden"
        },
        _typeLink: {
          type: "sap.esh.search.ui.controls.SearchLink",
          multiple: false,
          visibility: "hidden"
        },
        _typeLinkAriaDescription: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        },
        _multiLineDescriptionText: {
          type: "sap.esh.search.ui.controls.SearchText",
          multiple: false,
          visibility: "hidden"
        },
        _selectionCheckBox: {
          type: "sap.m.CheckBox",
          multiple: false,
          visibility: "hidden"
        },
        _expandButton: {
          type: "sap.m.Button",
          multiple: false,
          visibility: "hidden"
        },
        _attributeLabels: {
          type: "sap.m.Label",
          multiple: true,
          visibility: "hidden"
        },
        _attributeValues: {
          type: "sap.ui.core.Control",
          multiple: true,
          visibility: "hidden"
        },
        _attributeValuesWithoutWhyfoundHiddenTexts: {
          type: "sap.ui.core.InvisibleText",
          multiple: true,
          visibility: "hidden"
        },
        _relatedObjectActionsToolbar: {
          type: "sap.esh.search.ui.controls.SearchRelatedObjectsToolbar",
          multiple: false,
          visibility: "hidden"
        },
        _titleLabeledByText: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        },
        _attributesLabeledByText: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        },
        _expandStateLabeledByText: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      var _this = this;
      Control.prototype.constructor.call(this, sId, settings);
      this._visibleAttributes = undefined;
      this._detailsArea = undefined;
      this._showExpandButton = false;
      this.setAggregation("_titleLink", new SearchLink("".concat(this.getId(), "--titleLink")).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-Title").addStyleClass("sapUshellSearchResultListItem-MightOverflow").attachPress(function (oEvent) {
        var phoneSize = _this._getPhoneSize();
        var windowWidth = $(window).width();
        if (windowWidth <= phoneSize) {
          // On phone devices the whole item is clickable.
          // See click-handler in onAfterRendering below.
          oEvent.preventDefault();
          oEvent.cancelBubble();
          _this._performTitleNavigation();
        } else {
          _this._performTitleNavigation({
            trackingOnly: true
          });
        }
      }));
      this.setAggregation("_titleLinkDescription", new SearchText("".concat(this.getId(), "--titleLinkDescription")).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleDescription").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));
      var iconSetting = {
        src: {
          path: "titleInfoIconUrl"
        }
      };
      var titleInfoIcon = new Icon("".concat(this.getId(), "--titleInfoIcon"), iconSetting);
      titleInfoIcon.addStyleClass("sapUiSmallMarginEnd");
      this.setAggregation("_titleInfoIcon", titleInfoIcon);
      titleInfoIcon.addStyleClass("sapUshellSearchResultListItem-TitleInfoIcon");
      var titleDelimiter = new Text("".concat(this.getId(), "--titleDelimiter"), {
        text: "|"
      });
      titleDelimiter.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          $(titleDelimiter.getDomRef()).attr("aria-hidden", "true");
        }
      });
      this.setAggregation("_titleDelimiter", titleDelimiter.addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleDelimiter").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));
      this.setAggregation("_typeText", new SearchText("".concat(this.getId(), "--typeText")).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleCategory").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));
      this.setAggregation("_typeLinkAriaDescription", new InvisibleText({
        text: i18n.getText("result_list_item_type_link_description")
      }));
      this.setAggregation("_typeLink", new SearchLink("".concat(this.getId(), "--typeLink")).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleCategoryLink").addStyleClass("sapUshellSearchResultListItem-MightOverflow").addAriaDescribedBy(this.getAggregation("_typeLinkAriaDescription")) // ToDo
      );

      this.setAggregation("_multiLineDescriptionText", new SearchText("".concat(this.getId(), "--multilineDescription"), {
        maxLines: 5
      }) // ToDo: 'any' because maxLines is missing in d.ts of UI5, see $TextSettings
      .addStyleClass("sapUshellSearchResultListItem-MultiLineDescription").addStyleClass("sapUshellSearchResultListItem-MightOverflow").data("islongtext", "true", true));
      this.setAggregation("_selectionCheckBox", new CheckBox("".concat(this.getId(), "--selectionCheckbox"), {
        select: function select(oEvent) {
          _this.setProperty("selected", oEvent.getParameter("selected"), true /*no re-rendering needed, change originates in HTML*/); //see section Properties for explanation
          var oModel = _this.getModel();
          oModel.updateMultiSelectionSelected();
          if (oEvent.getParameter("selected")) {
            _this.addStyleClass("sapUshellSearchResultListItem-Selected");
          } else {
            _this.removeStyleClass("sapUshellSearchResultListItem-Selected");
          }
        }
      }));
      this.setAggregation("_expandButton", new Button("".concat(this.getId(), "--expandButton"), {
        type: ButtonType.Transparent,
        press: function press() {
          _this.toggleDetails();
        }
      }));
      this.setAggregation("_relatedObjectActionsToolbar", new SearchRelatedObjectsToolbar("".concat(this.getId(), "--relatedObjectActionsToolbar")));
      this.setAggregation("_titleLabeledByText", new InvisibleText());
      this.setAggregation("_attributesLabeledByText", new InvisibleText());
      this.setAggregation("_expandStateLabeledByText", new InvisibleText());
    },
    _renderer: function _renderer(oRm, oControl) {
      var resultListItem = $(this.getDomRef());
      var relatedObjectsToolbar = resultListItem.find(".sapUshellSearchResultListItem-RelatedObjectsToolbar");
      if (relatedObjectsToolbar.css("display") === "none") {
        var oModel = this.getModel();
        if (oModel.config.optimizeForValueHelp) {
          relatedObjectsToolbar.css("display", "block");
        }
      }
      this._registerItemPressHandler();
      this._resetPrecalculatedValues();
      this._renderContainer(oRm, oControl);
      this._renderAccessibilityInformation(oRm);
    },
    _renderContainer: function _renderContainer(oRm, oControl) {
      var _this$getProperty;
      var oModel = this.getModel();
      oRm.openStart("div", this);
      oRm["class"]("sapUshellSearchResultListItem-Container");
      if (this.getProperty("imageUrl")) {
        oRm["class"]("sapUshellSearchResultListItem-WithImage");
      }
      if (((_this$getProperty = this.getProperty("imageFormat")) === null || _this$getProperty === void 0 ? void 0 : _this$getProperty.toLowerCase()) === "documentthumbnail") {
        oRm["class"]("sapUshellSearchResultListItem-Document");
      }
      oRm.openEnd();
      this._renderContentContainer(oRm, oControl);
      if (!oModel.config.optimizeForValueHelp) {
        this._renderExpandButtonContainer(oRm);
      }
      oRm.close("div");
    },
    _renderContentContainer: function _renderContentContainer(oRm, oControl) {
      var oModel = oControl.getModel();
      oRm.openStart("div", oControl.getId() + "-content");
      oRm["class"]("sapUshellSearchResultListItem-Content");
      if (!oModel.config.optimizeForValueHelp) {
        oRm["class"]("sapUshellSearchResultListItem-ContentValueHelp");
      }
      oRm.openEnd();
      this._renderTitleContainer(oRm, oControl);
      this._renderAttributesContainer(oRm);
      oRm.close("div");
    },
    _renderExpandButtonContainer: function _renderExpandButtonContainer(oRm) {
      var _this2 = this;
      oRm.openStart("div", this.getId() + "-expand-button-container");
      oRm["class"]("sapUshellSearchResultListItem-ExpandButtonContainer");
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-expand-button");
      oRm["class"]("sapUshellSearchResultListItem-ExpandButton");
      oRm.openEnd();
      var icon, tooltip;
      var expanded = this.getProperty("expanded");
      if (expanded) {
        icon = IconPool.getIconURI("slim-arrow-up");
        tooltip = i18n.getText("hideDetailBtn_tooltip");
      } else {
        icon = IconPool.getIconURI("slim-arrow-down");
        tooltip = i18n.getText("showDetailBtn_tooltip");
      }
      var expandButton = this.getAggregation("_expandButton");
      expandButton.setIcon(icon);
      expandButton.setTooltip(tooltip);
      expandButton.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          _this2.setAriaExpandedState();
        }
      });
      oRm.renderControl(expandButton);
      oRm.close("div");
      oRm.close("div");
    },
    _renderTitleContainer: function _renderTitleContainer(oRm, oControl) {
      var _this3 = this;
      var oModel = this.getModel();
      if (!oModel.config.optimizeForValueHelp) {
        oRm.openStart("div", this.getId() + "-title-and-image-container");
        oRm["class"]("sapUshellSearchResultListItem-TitleAndImageContainer");
        oRm.openEnd();
      }
      oRm.openStart("div", this.getId() + "-title-container");
      oRm["class"]("sapUshellSearchResultListItem-TitleContainer");
      if (oModel.config.optimizeForValueHelp) {
        oRm["class"]("sapUshellSearchResultListItem-TitleContainerValueHelp");
      }
      oRm.openEnd();
      this._renderCheckbox(oRm);

      /// Title
      var titleUrl = "";
      var target;
      var hasTargetFunction = false;
      var titleLink = this.getAggregation("_titleLink");
      var titleText = this.getProperty("title");
      var isHierarchyItem = this.getProperty("titleIconUrl") === "sap-icon://folder-blank"; // ToDo

      if (!titleText || titleText.trim().length === 0) {
        titleText = SearchResultListItem.noValue;
      } else if (oModel.config.optimizeForValueHelp && !isHierarchyItem) {
        // do not navigate
        // do not set 'href'
        setTimeout(function () {
          if (oModel.getSearchCompositeControlInstanceByChildControl(titleLink).getDragDropConfig().length > 0) {
            titleLink.addStyleClass("sapUshellSearchResultListItem-DragAndDrop-NoHref");
            titleLink.addStyleClass("deactivateHover");
            titleLink.getDomRef()["draggable"] = false;
            titleLink.getDomRef()["pointer-events"] = "none";
          }
        }, 100);
      } else {
        var titleNavigation = this.getProperty("titleNavigation");
        if (titleNavigation) {
          hasTargetFunction = titleNavigation.hasTargetFunction();
          titleUrl = titleNavigation.getHref();
          target = titleNavigation.getTarget();
        }
        titleLink.setHref(titleUrl);
        if (target) {
          titleLink.setTarget(target);
        }
      }
      titleLink.setText(titleText);
      if ((typeof titleUrl !== "string" || titleUrl.length === 0) && hasTargetFunction !== true) {
        titleLink.setEnabled(false);
      }

      // if the title contains highlighted text, the forward ellipsis might have to be calculated correctly after rendering
      titleLink.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          _this3.forwardEllipsis($(titleLink.getDomRef()));
        }
      });
      if (this.getProperty("titleIconUrl")) {
        var currentTitleIcon = titleLink.getAggregation("icon");
        if (currentTitleIcon !== null) {
          currentTitleIcon.destroy();
        }
        var oIcon = new Icon("".concat(this.getId(), "--titleIcon"), {
          src: this.getProperty("titleIconUrl")
        });
        titleLink.setAggregation("icon", oIcon);
        setTimeout(function () {
          if (!isHierarchyItem && oModel.getSearchCompositeControlInstanceByChildControl(titleLink).getDragDropConfig().length > 0) {
            oIcon.addStyleClass("sapUshellSearchResultListItem-DragAndDrop-NoHref");
            oIcon.addStyleClass("deactivateHover");
            oIcon.getDomRef()["draggable"] = false;
            oIcon.getDomRef()["pointer-events"] = "none";
          }
        }, 100);
      }
      oRm.renderControl(titleLink);
      if (oControl.getProperty("titleInfoIconUrl")) {
        var titleInfoIcon = oControl.getAggregation("_titleInfoIcon");
        if (titleInfoIcon) {
          if (oModel.config.optimizeForValueHelp) {
            titleInfoIcon.addStyleClass("sapUshellSearchResultListItem-TitleInfoIconValueHelp");
          }
          oRm.renderControl(titleInfoIcon);
        }
      }

      /// sub-title aka Title Description
      if (!oModel.config.optimizeForValueHelp) {
        var titleDescription = this.getProperty("titleDescription");
        if (titleDescription && titleDescription.trim().length > 0) {
          var titleLinkDescription = this.getAggregation("_titleLinkDescription");
          titleLinkDescription.setText(titleDescription);
          oRm.renderControl(titleLinkDescription);
        }
      }
      if (oModel.config.optimizeForValueHelp) {
        this._renderRelatedObjectsToolbar(oRm);
      } else {
        /// delimiter between title and sub-title or object type
        var titleDelimiter = this.getAggregation("_titleDelimiter");
        oRm.renderControl(titleDelimiter);

        /// object type
        if (oModel.getDataSource() === this.getProperty("dataSource")) {
          var typeText = this.getAggregation("_typeText");
          typeText.setText(this.getProperty("type"));
          oRm.renderControl(typeText);
        } else {
          var uiFilterClone = this.getModel().getProperty("/uiFilter").clone();
          uiFilterClone.setDataSource(this.getProperty("dataSource"));
          var href = oModel.searchUrlParser.renderFromParameters(oModel.boTopDefault, uiFilterClone, true);
          var typeLink = this.getAggregation("_typeLink");
          typeLink.setText(this.getProperty("type"));
          typeLink.setHref(href);
          typeLink.setTooltip(i18n.getText("searchInDataSourceTooltip", [this.getProperty("dataSource").labelPlural]));
          oRm.renderControl(this.getAggregation("_typeLinkAriaDescription")); // ToDo
          oRm.renderControl(typeLink);
        }
      }
      oRm.close("div");
      if (!oModel.config.optimizeForValueHelp) {
        this._renderImageForPhone(oRm);
        oRm.close("div");
      }
    },
    _renderCheckbox: function _renderCheckbox(oRm) {
      oRm.openStart("div", this.getId() + "-checkbox-expand-container");
      oRm["class"]("sapUshellSearchResultListItem-CheckboxExpandContainer");
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-checkbox-container");
      oRm["class"]("sapUshellSearchResultListItem-CheckboxContainer");
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-checkbox-alignment-container");
      oRm["class"]("sapUshellSearchResultListItem-CheckboxAlignmentContainer");
      oRm.openEnd();
      var checkbox = this.getAggregation("_selectionCheckBox");
      var selected = this.getProperty("selected");
      checkbox.setSelected(selected);
      oRm.renderControl(checkbox);
      oRm.close("div");
      oRm.close("div");
      oRm.close("div");
    },
    _renderImageForPhone: function _renderImageForPhone(oRm) {
      if (this.getProperty("imageUrl")) {
        oRm.openStart("div", this.getId() + "-title-image");
        oRm["class"]("sapUshellSearchResultListItem-TitleImage");
        if (this.getProperty("imageFormat") === "round") {
          oRm["class"]("sapUshellSearchResultListItem-ImageContainerRound");
        }
        oRm.openEnd();
        oRm.openStart("div", this.getId() + "-image-container-aligmnent-helper");
        oRm["class"]("sapUshellSearchResultListItem-ImageContainerAlignmentHelper");
        oRm.openEnd();
        oRm.close("div");
        oRm.openStart("img", this.getId() + "-image-1");
        oRm["class"]("sapUshellSearchResultListItem-Image");
        oRm.attr("src", this.getProperty("imageUrl"));
        oRm.openEnd();
        oRm.close("div");
        oRm.close("div");
      }
    },
    _renderImageForDocument: function _renderImageForDocument(oRm) {
      if (this.getProperty("imageFormat") && this.getProperty("imageFormat").toLowerCase() === "documentthumbnail") {
        var imageNavigation = this.getProperty("imageNavigation");
        var imageNavigationUrl = imageNavigation ? imageNavigation.getHref() : "";
        if (typeof this._zoomIcon !== "undefined") {
          this._zoomIcon.destroy();
        }
        this._zoomIcon = new Icon("", {
          // ToDo: Stable ID, see below
          // this._zoomIcon = new Icon(`${this.getId()}--zoomIcon`, {
          // -> duplicate ID ?!?
          src: IconPool.getIconURI("search"),
          useIconTooltip: false
        });
        this._zoomIcon.addStyleClass("".concat(this.getId(), "--zoomIcon")); // ToDo -> remove as soon as stable ID works
        this._zoomIcon.addStyleClass("sapUshellSearchResultListItem-DocumentThumbnailZoomIcon");
        var imageUrl = this.getProperty("imageUrl");
        oRm.openStart("div", this.getId() + "-document-thumbnail-container");
        oRm["class"]("sapUshellSearchResultListItem-DocumentThumbnailContainer");
        oRm.openEnd();
        if (imageNavigationUrl && imageNavigationUrl.length > 0) {
          oRm.openStart("a", this.getId() + "-document-thumbnail-border-1");
          oRm.attr("href", imageNavigationUrl);
          oRm["class"]("sapUshellSearchResultListItem-DocumentThumbnailBorder");
          oRm.openEnd();
          oRm.openStart("div", this.getId() + "-document-thumbnail-dogear-1");
          oRm["class"]("sapUshellSearchResultListItem-DocumentThumbnail-DogEar");
          oRm.openEnd();
          oRm.close("div");
          oRm.renderControl(this._zoomIcon);
          if (imageUrl && imageUrl.length > 0) {
            oRm.openStart("img", this.getId() + "-document-thumbnail-1");
            oRm["class"]("sapUshellSearchResultListItem-DocumentThumbnail");
            oRm.attr("src", this.getProperty("imageUrl"));
            oRm.openEnd();
            oRm.close("img");
          } // else: is there a placeholder image that could be shown instead?

          oRm.close("a");
        } else {
          oRm.openStart("div", this.getId() + "-document-thumbnail-border-2");
          oRm["class"]("sapUshellSearchResultListItem-DocumentThumbnailBorder");
          oRm.openEnd();
          oRm.openStart("div", this.getId() + "-document-thumbnail-dogear-2");
          oRm["class"]("sapUshellSearchResultListItem-DocumentThumbnail-DogEar");
          oRm.openEnd();
          oRm.close("div");
          oRm.renderControl(this._zoomIcon);
          if (imageUrl && imageUrl.length > 0) {
            oRm.openStart("img", this.getId() + "-document-thumbnail-2");
            oRm["class"]("sapUshellSearchResultListItem-DocumentThumbnail");
            oRm.attr("src", this.getProperty("imageUrl"));
            oRm.openEnd();
            oRm.close("img");
          } // else: is there a placeholder image that could be shown instead?

          oRm.close("div");
        }
        oRm.close("div");
      }
    },
    _cutDescrAttributeOutOfAttributeList: function _cutDescrAttributeOutOfAttributeList() {
      var attributes = this.getProperty("attributes");
      for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        if (attribute.longtext) {
          attributes.splice(i, 1);
          this.setProperty("attributes", attributes);
          return attribute;
        }
      }
      return undefined;
    },
    _renderMultiLineDescription: function _renderMultiLineDescription(oRm) {
      var _this$getProperty2;
      if (((_this$getProperty2 = this.getProperty("imageFormat")) === null || _this$getProperty2 === void 0 ? void 0 : _this$getProperty2.toLowerCase()) === "documentthumbnail") {
        var _description$value;
        // for the time being, only render multiline attribute, if this is a document result item
        var description = this._cutDescrAttributeOutOfAttributeList();
        if ((description === null || description === void 0 ? void 0 : (_description$value = description.value) === null || _description$value === void 0 ? void 0 : _description$value.length) > 0) {
          var descriptionText = this.getAggregation("_multiLineDescriptionText");
          descriptionText.setText(description.value);
          if (description.whyfound) {
            descriptionText.data("ishighlighted", "true", true);
          } else {
            descriptionText.data("ishighlighted", "false", true);
          }
          if (description.valueWithoutWhyfound) {
            // for attribute values with why-found information, use the raw value information (without why-found-tags) for tooltip and ARIA description
            var hiddenValueText = new InvisibleText({});
            hiddenValueText.setText(description.valueWithoutWhyfound);
            descriptionText.data("tooltippedBy", hiddenValueText.getId(), true);
            descriptionText.addEventDelegate({
              onAfterRendering: function onAfterRendering() {
                var $descriptionText = $(descriptionText.getDomRef());
                $descriptionText.attr("aria-describedby", $descriptionText.attr("data-tooltippedby"));
              }
            });
            this.addAggregation("_attributeValuesWithoutWhyfoundHiddenTexts", hiddenValueText, true /* do not invalidate this object */);

            oRm.renderControl(hiddenValueText);
          }
          oRm.renderControl(descriptionText);
        } else {
          oRm.openStart("div", this.getId() + "-multiline-description");
          oRm["class"]("sapUshellSearchResultListItem-MultiLineDescription");
          oRm.openEnd();
          oRm.close("div");
        }
      }
    },
    _renderAttributesContainer: function _renderAttributesContainer(oRm) {
      var oModel = this.getModel();
      oRm.openStart("div", this.getId() + "-attribute-expand-container");
      oRm["class"]("sapUshellSearchResultListItem-AttributesExpandContainer");
      if (oModel.config.optimizeForValueHelp) {
        oRm["class"]("sapUshellSearchResultListItem-AttributesExpandContainerValueHelp");
      }
      var expanded = this.getProperty("expanded");
      if (expanded) {
        oRm["class"]("sapUshellSearchResultListItem-AttributesExpanded");
      }
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-attributes-and-actions");
      oRm["class"]("sapUshellSearchResultListItem-AttributesAndActions");
      oRm.openEnd();
      if (!oModel.config.optimizeForValueHelp) {
        this._renderImageForDocument(oRm);
        this._renderMultiLineDescription(oRm);
      }
      oRm.openStart("ul", this.getId() + "-attributes");
      oRm["class"]("sapUshellSearchResultListItem-Attributes");
      oRm.openEnd();
      var itemAttributes = this.getProperty("attributes");
      if (!oModel.config.optimizeForValueHelp) {
        this._renderImageAttribute(oRm, /* imageIsOnlyAttribute= */itemAttributes.length === 0);
      }
      this._renderAllAttributes(oRm, itemAttributes);

      // this is just a dummie attribute to store additional space information for the expand and collapse JavaScript function
      if (!oModel.config.optimizeForValueHelp) {
        oRm.openStart("li", this.getId() + "-expand-spacer-attribute");
        oRm["class"]("sapUshellSearchResultListItem-ExpandSpacerAttribute");
        oRm.attr("aria-hidden", "true");
        oRm.openEnd();
        oRm.close("li");
      }
      oRm.close("ul");
      if (!oModel.config.optimizeForValueHelp) {
        // related objects toolbar will be rendered in line with title attribute
        this._renderRelatedObjectsToolbar(oRm);
      }
      oRm.close("div");
      oRm.close("div");
    },
    _renderAllAttributes: function _renderAllAttributes(oRm, itemAttributes) {
      var _this4 = this;
      var oModel = this.getModel();
      if (itemAttributes.length === 0) {
        oRm.openStart("li", this.getId() + "-generic-attribute-1");
        oRm["class"]("sapUshellSearchResultListItem-GenericAttribute");
        if (oModel.config.optimizeForValueHelp) {
          oRm["class"]("sapUshellSearchResultListItem-GenericAttributeValueHelp");
        }
        oRm["class"]("sapUshellSearchResultListItem-MainAttribute");
        oRm["class"]("sapUshellSearchResultListItem-EmptyAttributePlaceholder");
        oRm.attr("aria-hidden", "true");
        oRm.openEnd();
        oRm.close("li");
        return;
      }
      var itemAttribute;
      var labelText;
      var valueText;
      var valueWithoutWhyfound;
      var label, value, isLongText;
      var hiddenValueText;
      var oIcon;
      var layoutCache = this.getProperty("layoutCache") || {};
      this.setProperty("layoutCache", layoutCache, /* suppress rerender */true);
      if (!layoutCache.attributes) {
        layoutCache.attributes = {};
      }
      var i = 0,
        numberOfRenderedAttributes = 0;
      var numberOfColumnsDesktop = 4;
      var numberOfColumnsTablet = 3;
      var distributionOfAttributesDesktop = [0, 0, 0]; // three rows for desktop resolution
      var distributionOfAttributesTablet = [0, 0, 0, 0]; // four rows for tablet resolution
      var additionalWhyFoundAttributesDesktop = 2;
      var additionalWhyFoundAttributesTablet = 2;
      var longTextColumnNumber;
      var isDocumentItem = this.getProperty("imageFormat") && this.getProperty("imageFormat").toLowerCase() === "documentthumbnail";
      var includeImageAttribute = this.getProperty("imageUrl") && !isDocumentItem && !oModel.config.optimizeForValueHelp;
      if (isDocumentItem && !oModel.config.optimizeForValueHelp) {
        numberOfColumnsDesktop = numberOfColumnsTablet = 2;
        distributionOfAttributesDesktop = distributionOfAttributesTablet = [0, 0];
        additionalWhyFoundAttributesDesktop = additionalWhyFoundAttributesTablet = 4;
      }
      var remainingSlotsForAttributesDesktop = numberOfColumnsDesktop * distributionOfAttributesDesktop.length;
      var remainingSlotsForAttributesTablet = numberOfColumnsTablet * distributionOfAttributesTablet.length;
      if (includeImageAttribute) {
        remainingSlotsForAttributesDesktop--;
        remainingSlotsForAttributesTablet--;
        distributionOfAttributesDesktop[0]++;
        distributionOfAttributesTablet[0]++;
      }
      this.destroyAggregation("_attributeLabels");
      this.destroyAggregation("_attributeValues");
      this.destroyAggregation("_attributeValuesWithoutWhyfoundHiddenTexts");

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      var createAfterRenderingFunctionForAddingAriaDescribedBy = function createAfterRenderingFunctionForAddingAriaDescribedBy(control) {
        return function () {
          var $this = $(_this4.getDomRef());
          $this.attr("aria-describedby", $this.attr("data-tooltippedby"));
        };
      };
      for (; !(additionalWhyFoundAttributesDesktop <= 0 && additionalWhyFoundAttributesTablet <= 0) && i < itemAttributes.length; i++) {
        itemAttribute = itemAttributes[i];
        var _oModel = this.getModel();
        if (_oModel.config.optimizeForValueHelp && !itemAttribute.whyfound) {
          continue; // for value help mode, only render title and why found
        }

        if (isDocumentItem && numberOfRenderedAttributes >= 4) {
          break;
        }
        if (itemAttribute.isTitle) {
          continue;
        }
        if (remainingSlotsForAttributesDesktop <= 0 && remainingSlotsForAttributesTablet <= 0 && !itemAttribute.whyfound) {
          continue;
        }
        labelText = itemAttribute.name;
        valueText = itemAttribute.value;
        if (labelText === undefined || valueText === undefined) {
          continue;
        }
        if (!valueText || valueText.trim().length === 0) {
          valueText = SearchResultListItem.noValue;
        }
        if (itemAttribute.longtext === undefined || itemAttribute.longtext === null || itemAttribute.longtext === "") {
          isLongText = false;
        } else {
          isLongText = true;
        }
        valueWithoutWhyfound = itemAttribute.valueWithoutWhyfound;
        var _rowCountTablet = -1,
          _rowCountDesktop = -1,
          _attributeWeight = {
            desktop: 1,
            tablet: 1
          };
        var attributeLayout = layoutCache.attributes[itemAttribute.key] || {};
        layoutCache.attributes[itemAttribute.key] = attributeLayout;
        oRm.openStart("li", this.getId() + "-generic-attribute-2-" + i);
        oRm["class"]("sapUshellSearchResultListItem-GenericAttribute");
        if (_oModel.config.optimizeForValueHelp) {
          oRm["class"]("sapUshellSearchResultListItem-GenericAttributeValueHelp");
        }
        oRm["class"]("sapUshellSearchResultListItem-MainAttribute");
        if (isLongText) {
          longTextColumnNumber = attributeLayout.longTextColumnNumber || this._howManyColumnsToUseForLongTextAttribute(valueWithoutWhyfound);
          attributeLayout.longTextColumnNumber = longTextColumnNumber;
          _attributeWeight = longTextColumnNumber;
          oRm["class"]("sapUshellSearchResultListItem-LongtextAttribute");
        }
        if (remainingSlotsForAttributesDesktop <= 0) {
          if (itemAttribute.whyfound && additionalWhyFoundAttributesDesktop > 0) {
            oRm["class"]("sapUshellSearchResultListItem-WhyFoundAttribute-Desktop");
            additionalWhyFoundAttributesDesktop--;
          } else {
            oRm["class"]("sapUshellSearchResultListItem-DisplayNoneAttribute-Desktop");
          }
        }
        if (remainingSlotsForAttributesTablet <= 0) {
          if (itemAttribute.whyfound && additionalWhyFoundAttributesTablet > 0) {
            oRm["class"]("sapUshellSearchResultListItem-WhyFoundAttribute-Tablet");
            additionalWhyFoundAttributesTablet--;
          } else {
            oRm["class"]("sapUshellSearchResultListItem-DisplayNoneAttribute-Tablet");
          }
        }
        if (isLongText && includeImageAttribute && distributionOfAttributesDesktop[0] === 1) {
          _rowCountDesktop = 0;
          longTextColumnNumber = attributeLayout.longTextColumnNumber.desktop < numberOfColumnsDesktop ? attributeLayout.longTextColumnNumber.desktop : numberOfColumnsDesktop - 1;
          distributionOfAttributesDesktop[0] += longTextColumnNumber;
          remainingSlotsForAttributesDesktop -= longTextColumnNumber;
        } else {
          for (var k = 0; k < distributionOfAttributesDesktop.length; k++) {
            if (distributionOfAttributesDesktop[k] + _attributeWeight.desktop <= numberOfColumnsDesktop) {
              distributionOfAttributesDesktop[k] += _attributeWeight.desktop;
              remainingSlotsForAttributesDesktop -= _attributeWeight.desktop;
              _rowCountDesktop = k;
              break;
            }
          }
        }
        if (_rowCountDesktop < 0) {
          _rowCountDesktop = distributionOfAttributesDesktop.length;
        }
        if (isLongText && includeImageAttribute && distributionOfAttributesTablet[0] === 1) {
          _rowCountTablet = 0;
          longTextColumnNumber = attributeLayout.longTextColumnNumber.tablet < numberOfColumnsTablet ? attributeLayout.longTextColumnNumber.tablet : numberOfColumnsTablet - 1;
          distributionOfAttributesTablet[0] += longTextColumnNumber;
          remainingSlotsForAttributesTablet -= longTextColumnNumber;
        } else {
          for (var _k = 0; _k < distributionOfAttributesTablet.length; _k++) {
            if (distributionOfAttributesTablet[_k] + _attributeWeight.tablet <= numberOfColumnsTablet) {
              distributionOfAttributesTablet[_k] += _attributeWeight.tablet;
              remainingSlotsForAttributesTablet -= _attributeWeight.tablet;
              _rowCountTablet = _k;
              break;
            }
          }
        }
        if (_rowCountTablet < 0) {
          _rowCountTablet = distributionOfAttributesTablet.length;
        }
        oRm["class"]("sapUshellSearchResultListItem-OrderTablet-" + _rowCountTablet);
        oRm["class"]("sapUshellSearchResultListItem-OrderDesktop-" + _rowCountDesktop);
        if (isLongText) {
          oRm.attr("data-sap-searchresultitem-attributeweight-desktop", _attributeWeight.desktop);
          oRm.attr("data-sap-searchresultitem-attributeweight-tablet", _attributeWeight.tablet);
        }
        oRm.openEnd();
        label = new Label("".concat(this.getId(), "--attr").concat(i, "_labelText"), {
          displayOnly: true
        });
        label.setText(labelText);
        label.addStyleClass("sapUshellSearchResultListItem-AttributeKey");
        label.addStyleClass("sapUshellSearchResultListItem-MightOverflow");
        oRm.renderControl(label);
        oRm.openStart("span", this.getId() + "-attribute-value-container-" + i);
        oRm["class"]("sapUshellSearchResultListItem-AttributeValueContainer");
        if (_oModel.config.optimizeForValueHelp) {
          oRm["class"]("sapUshellSearchResultListItem-AttributeValueContainerValueHelp");
        }
        oRm.openEnd();
        oIcon = undefined;
        if (itemAttribute.iconUrl) {
          oIcon = new Icon("".concat(this.getId(), "--attr").concat(i, "_itemAttributeIcon"), {
            src: itemAttribute.iconUrl
          });
          oIcon.addStyleClass("sapUshellSearchResultListItem-AttributeIcon");
        }
        if (itemAttribute.defaultNavigationTarget) {
          value = new SearchLink("".concat(this.getId(), "--attr").concat(i, "_defNavTarget_Link"));
          value.setHref(itemAttribute.defaultNavigationTarget.getHref());
          value.setTarget(itemAttribute.defaultNavigationTarget.getTarget());
          value.addStyleClass("sapUshellSearchResultListItem-AttributeLink");
          if (oIcon) {
            value.setAggregation("icon", oIcon);
          }
        } else {
          value = new SearchText("".concat(this.getId(), "--attr").concat(i, "_noDefNavTarget_Text"));
          if (oIcon) {
            value.setAggregation("icon", oIcon);
          }
        }
        value.setText(valueText);
        value.addStyleClass("sapUshellSearchResultListItem-AttributeValue");
        value.addStyleClass("sapUshellSearchResultListItem-MightOverflow");
        if (itemAttribute.whyfound) {
          value.data("ishighlighted", "true", true);
          value.addStyleClass("sapUshellSearchResultListItem-AttributeValueHighlighted");
        }
        if (isLongText) {
          value.data("islongtext", "true", true);
        }
        if (valueWithoutWhyfound) {
          // for attribute values with why-found information, use the raw value information (without why-found-tags) for tooltip and ARIA description
          hiddenValueText = new InvisibleText({});
          hiddenValueText.addStyleClass("sapUshellSearchResultListItem-AttributeValueContainer-HiddenText");
          hiddenValueText.setText(valueWithoutWhyfound);
          value.data("tooltippedBy", hiddenValueText.getId(), true);
          value.addEventDelegate({
            onAfterRendering: createAfterRenderingFunctionForAddingAriaDescribedBy(value)
          });
          this.addAggregation("_attributeValuesWithoutWhyfoundHiddenTexts", hiddenValueText, true /* do not invalidate this object */);

          oRm.renderControl(hiddenValueText);
        }
        oRm.renderControl(value);
        oRm.close("span");
        oRm.close("li");
        this.addAggregation("_attributeLabels", label, true /* do not invalidate this object */);
        this.addAggregation("_attributeValues", value, true /* do not invalidate this object */);

        numberOfRenderedAttributes++;
      }
      if (includeImageAttribute) {
        var availableSpaceOnFirstLineDesktop = numberOfColumnsDesktop - distributionOfAttributesDesktop[0];
        var availableSpaceOnFirstLineTablet = numberOfColumnsTablet - distributionOfAttributesTablet[0];
        if (availableSpaceOnFirstLineDesktop > 0 || availableSpaceOnFirstLineTablet > 0) {
          oRm.openStart("li", this.getId() + "-generic-attribute-3");
          oRm["class"]("sapUshellSearchResultListItem-GenericAttribute");
          if (oModel.config.optimizeForValueHelp) {
            oRm["class"]("sapUshellSearchResultListItem-GenericAttributeValueHelp");
          }
          oRm["class"]("sapUshellSearchResultListItem-MainAttribute");
          oRm["class"]("sapUshellSearchResultListItem-OrderTablet-0");
          oRm["class"]("sapUshellSearchResultListItem-OrderDesktop-0");
          oRm.attr("data-sap-searchresultitem-attributeweight-desktop", availableSpaceOnFirstLineDesktop);
          oRm.attr("data-sap-searchresultitem-attributeweight-tablet", availableSpaceOnFirstLineTablet);
          oRm.openEnd();
          oRm.close("li");
        }
      }
    },
    _howManyColumnsToUseForLongTextAttribute: function _howManyColumnsToUseForLongTextAttribute(attributeValue) {
      if (attributeValue.length < 50) {
        return {
          tablet: 1,
          desktop: 1
        };
      }
      if (attributeValue.length < 85) {
        return {
          tablet: 2,
          desktop: 2
        };
      }
      if (attributeValue.length < 135) {
        return {
          tablet: 3,
          desktop: 3
        };
      }
      return {
        tablet: 3,
        desktop: 4
      };
    },
    _renderImageAttribute: function _renderImageAttribute(oRm, imageIsOnlyAttribute) {
      var oModel = this.getModel();
      if (!this.getProperty("imageUrl") || this.getProperty("imageFormat") && this.getProperty("imageFormat").toLowerCase() === "documentthumbnail") {
        return;
      }
      oRm.openStart("li", this.getId() + "-generic-attribute-4");
      oRm["class"]("sapUshellSearchResultListItem-GenericAttribute");
      if (oModel.config.optimizeForValueHelp) {
        oRm["class"]("sapUshellSearchResultListItem-GenericAttributeValueHelp");
      }
      oRm["class"]("sapUshellSearchResultListItem-ImageAttribute");
      if (imageIsOnlyAttribute) {
        oRm["class"]("sapUshellSearchResultListItem-LonelyImageAttribute");
      }
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-image-container");
      oRm["class"]("sapUshellSearchResultListItem-ImageContainer");
      if (this.getProperty("imageFormat") === "round") {
        oRm["class"]("sapUshellSearchResultListItem-ImageContainerRound");
      }
      oRm.openEnd();
      if (this.getProperty("imageUrl")) {
        oRm.openStart("img", this.getId() + "-image-2");
        oRm["class"]("sapUshellSearchResultListItem-Image");
        if (this.getProperty("imageFormat") === "round") {
          //
        }
        oRm.attr("src", this.getProperty("imageUrl"));
        oRm.openEnd();
        oRm.close("img");
      }
      if (this.getProperty("imageFormat") !== "round") {
        oRm.openStart("div", this.getId() + "-image-container-aligment-helper");
        oRm["class"]("sapUshellSearchResultListItem-ImageContainerAlignmentHelper");
        oRm.openEnd();
        oRm.close("div");
      }
      oRm.close("div");
      oRm.close("li");
    },
    _renderRelatedObjectsToolbar: function _renderRelatedObjectsToolbar(oRm) {
      var navigationObjects = this.getProperty("navigationObjects");
      if (!navigationObjects || navigationObjects.length === 0) {
        return;
      }
      this._showExpandButton = true;
      var relatedObjectActionsToolbar = this.getAggregation("_relatedObjectActionsToolbar");
      relatedObjectActionsToolbar.setProperty("navigationObjects", navigationObjects);
      relatedObjectActionsToolbar.setProperty("positionInList", this.getProperty("positionInList"));
      oRm.renderControl(relatedObjectActionsToolbar);
    },
    _renderAccessibilityInformation: function _renderAccessibilityInformation(oRm) {
      var _this5 = this;
      var parentListItem = this.getProperty("parentListItem");
      if (parentListItem) {
        this._renderAriaDescriptionElementForTitle(oRm, /* withPrefix = */true, /* doRender= */true);
        this._renderAriaDescriptionElementForAttributes(oRm, /* withPrefix = */ /* doRender= */true);
        this._renderAriaDescriptionElementForCollapsedOrExpandedState(oRm, /* withPrefix = */ /* doRender= */true);
        parentListItem.addEventDelegate({
          onAfterRendering: function onAfterRendering() {
            var $parentListItem = $(parentListItem.getDomRef());
            _this5._addAriaDescriptionToParentListElement(parentListItem, /* includeTotalCountElement = */true);
            registerHandler("acc-listitem-focusin", $parentListItem, "focusin", function (event) {
              var $relatedTarget = $(event.relatedTarget);
              if ($relatedTarget.hasClass("sapUshellSearchResultListItem") || $relatedTarget.closest(".sapUshellSearchResultListItemApps").length > 0 && !$relatedTarget.hasClass("sapUshellResultListMoreFooter")) {
                _this5._renderAriaDescriptionElementForTitle(oRm, /* withPrefix = */false, /* doRender= */false);
                _this5._renderAriaDescriptionElementForAttributes(oRm, /* withPrefix = */ /* doRender= */false);
                _this5._renderAriaDescriptionElementForCollapsedOrExpandedState(oRm, /* withPrefix = */ /* doRender= */false);
                _this5._addAriaDescriptionToParentListElement(parentListItem, /* includeTotalCountElement = */false);
              } else {
                _this5._renderAriaDescriptionElementForTitle(oRm, /* withPrefix = */true, /* doRender= */false);
                _this5._renderAriaDescriptionElementForAttributes(oRm, /* withPrefix = */ /* doRender= */false);
                _this5._renderAriaDescriptionElementForCollapsedOrExpandedState(oRm, /* withPrefix = */ /* doRender= */false);
                _this5._addAriaDescriptionToParentListElement(parentListItem, /* includeTotalCountElement = */true);
              }
            });
          },
          onsapspace: function onsapspace(oEvent) {
            if (oEvent["target"] === oEvent["currentTarget"]) {
              _this5.toggleDetails();
            }
          },
          onsapenter: function onsapenter(oEvent) {
            if (oEvent["target"] === oEvent["currentTarget"]) {
              var titleNavigation = _this5.getProperty("titleNavigation");
              if (titleNavigation) {
                titleNavigation.performNavigation();
              }
            }
          }
        });
      }
    },
    getAccessibilityInfo: function _getAccessibilityInfo() {
      var accInfo = {};
      if (sap.ui.core.Control.prototype.getAccessibilityInfo) {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        accInfo = sap.ui.core.Control.prototype.getAccessibilityInfo.apply(this, args) || accInfo;
      }
      accInfo["description"] = ""; // description will be provided dynamically in _renderAccessibilityInformation
      return accInfo;
    },
    _renderAriaDescriptionElementForTitle: function _renderAriaDescriptionElementForTitle(oRm, withPrefix, doRender) {
      this._searchResultListPrefix = this._searchResultListPrefix || i18n.getText("result_list_announcement_screenreaders");
      var labelText = this.getProperty("title") + ", " + this.getProperty("type") + ".";
      if (withPrefix) {
        labelText = this._searchResultListPrefix + " " + labelText;
      }
      var titleLabeledByText = this.getAggregation("_titleLabeledByText");
      if (titleLabeledByText) {
        titleLabeledByText.setText(labelText);
      }
      if (doRender && oRm) {
        oRm.renderControl(titleLabeledByText);
      }
    },
    _renderAriaDescriptionElementForAttributes: function _renderAriaDescriptionElementForAttributes(oRm, doRender) {
      var attributesLabeledByText = this.getAggregation("_attributesLabeledByText");
      var $attributes = $(this.getDomRef()).find(".sapUshellSearchResultListItem-Attributes").find(".sapUshellSearchResultListItem-MainAttribute");
      var labelledByText;
      if ($attributes.length === 0) {
        labelledByText = i18n.getText("result_list_item_aria_no_attributes");
      } else {
        labelledByText = i18n.getText("result_list_item_aria_has_attributes");
        $attributes.each(function () {
          var $this = $(this);
          if ($this.is(":visible") && $this.attr("aria-hidden") !== "true") {
            var attributeKey = $this.find(".sapUshellSearchResultListItem-AttributeKey").text();
            var $attributeValueContainer = $this.find(".sapUshellSearchResultListItem-AttributeValueContainer");
            var $attributeValue = $attributeValueContainer.find(".sapUshellSearchResultListItem-AttributeValueContainer-HiddenText");
            if ($attributeValue.length === 0) {
              $attributeValue = $attributeValueContainer.find(".sapUshellSearchResultListItem-AttributeValue");
            }
            var attributeValue = $attributeValue.text();
            labelledByText += i18n.getText("result_list_item_aria_attribute_and_value", [attributeKey, attributeValue]);
          }
        });
      }
      if (attributesLabeledByText) {
        attributesLabeledByText.setText(labelledByText);
      }
      if (doRender && oRm) {
        oRm.renderControl(attributesLabeledByText);
      }
    },
    _renderAriaDescriptionElementForCollapsedOrExpandedState: function _renderAriaDescriptionElementForCollapsedOrExpandedState(oRm, doRender) {
      var expandStateLabeledByText = this.getAggregation("_expandStateLabeledByText");
      var labelledByText;
      var expandButton = this.getAggregation("_expandButton");
      if (!expandButton) {
        return;
      }
      var $expandButton = $(expandButton.getDomRef());
      if ($expandButton.css("visibility") !== "hidden") {
        if (this.isShowingDetails()) {
          labelledByText = i18n.getText("result_list_item_aria_expanded");
          var navigationObjects = this.getProperty("navigationObjects");
          if (navigationObjects && navigationObjects.length > 0) {
            labelledByText = i18n.getText("result_list_item_aria_has_links") + labelledByText;
          }
        } else {
          labelledByText = i18n.getText("result_list_item_aria_collapsed");
        }
      }
      expandStateLabeledByText.setText(labelledByText);
      if (doRender && oRm) {
        oRm.renderControl(expandStateLabeledByText);
      }
    },
    _addAriaDescriptionToParentListElement: function _addAriaDescriptionToParentListElement(parentListItem, includeTotalCountElement) {
      var titleLabeledByText = this.getAggregation("_titleLabeledByText");
      if (!titleLabeledByText) {
        return;
      }
      var itemAriaLabeledBy = titleLabeledByText.getId();
      if (includeTotalCountElement) {
        var countBreadcrumbsHiddenElement = this.getProperty("countBreadcrumbsHiddenElement");
        if (countBreadcrumbsHiddenElement) {
          itemAriaLabeledBy += " " + countBreadcrumbsHiddenElement.getId();
        }
      }
      var attributesLabeledByText = this.getAggregation("_attributesLabeledByText");
      itemAriaLabeledBy += " " + attributesLabeledByText.getId();
      var expandStateLabeledByText = this.getAggregation("_expandStateLabeledByText");
      itemAriaLabeledBy += " " + expandStateLabeledByText.getId();
      var $parentListItem = $(parentListItem.getDomRef());
      $parentListItem.attr("aria-labelledby", itemAriaLabeledBy);
    },
    _getExpandAreaObjectInfo: function _getExpandAreaObjectInfo() {
      var oModel = this.getModel();
      var resultListItem = $(this.getDomRef());
      resultListItem.addClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      var attributesExpandContainer = resultListItem.find(".sapUshellSearchResultListItem-AttributesExpandContainer");
      var relatedObjectsToolbar = resultListItem.find(".sapUshellSearchResultListItem-RelatedObjectsToolbar");
      var relatedObjectsToolbarHidden = false;
      if (relatedObjectsToolbar.css("display") === "none" && !oModel.config.optimizeForValueHelp) {
        relatedObjectsToolbar.css("display", "block");
        relatedObjectsToolbarHidden = true;
      }
      var currentHeight = attributesExpandContainer.height();
      var expandedHeight = resultListItem.find(".sapUshellSearchResultListItem-AttributesAndActions").height();
      resultListItem.removeClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      if (relatedObjectsToolbarHidden) {
        relatedObjectsToolbar.css("display", "");
      }
      var elementsToFadeInOrOut = this._getElementsInExpandArea();
      var expandAnimationDuration = 200;
      var fadeInOrOutAnimationDuration = expandAnimationDuration / 10;
      var expandAreaObjectInfo = {
        resultListItem: resultListItem,
        // ToDo
        attributesExpandContainer: attributesExpandContainer,
        // ToDo
        currentHeight: currentHeight,
        expandedHeight: expandedHeight,
        elementsToFadeInOrOut: elementsToFadeInOrOut,
        expandAnimationDuration: expandAnimationDuration,
        fadeInOrOutAnimationDuration: fadeInOrOutAnimationDuration,
        relatedObjectsToolbar: relatedObjectsToolbar // ToDo
      };

      return expandAreaObjectInfo;
    },
    _getElementsInExpandArea: function _getElementsInExpandArea() {
      var $resultListItem = $(this.getDomRef());
      var elementsToFadeInOrOut = [];
      $resultListItem.addClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      var attributeElements = $resultListItem.find(".sapUshellSearchResultListItem-GenericAttribute:not(.sapUshellSearchResultListItem-ImageAttribute)");
      if (attributeElements.length > 0) {
        var firstLineY = attributeElements.position().top;
        attributeElements.each(function () {
          if ($(this).position().top > firstLineY) {
            elementsToFadeInOrOut.push(this);
          }
        });
      }
      $resultListItem.removeClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      return elementsToFadeInOrOut;
    },
    isShowingDetails: function _isShowingDetails() {
      var expandAreaObjectInfo = this._getExpandAreaObjectInfo();

      /////////////////////////////
      // Expand Result List Item
      if (expandAreaObjectInfo.currentHeight < expandAreaObjectInfo.expandedHeight) {
        return false;
      }
      return true;
    },
    showDetails: function _showDetails() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      if (this.isShowingDetails()) {
        return;
      }
      var expandAreaObjectInfo = this._getExpandAreaObjectInfo();
      expandAreaObjectInfo.relatedObjectsToolbar["css"]("opacity", 0); // Todo (SearchRelatedObjectsToolbar)
      expandAreaObjectInfo.relatedObjectsToolbar["css"]("display", "block"); // Todo (SearchRelatedObjectsToolbar)

      var relatedObjectActionsToolbar = this.getAggregation("_relatedObjectActionsToolbar");
      if (relatedObjectActionsToolbar) {
        relatedObjectActionsToolbar.layoutToolbarElements();
      }
      this.forwardEllipsis($(that.getDomRef()).find(".sapUshellSearchResultListItem-Title, .sapUshellSearchResultListItem-AttributeKey, .sapUshellSearchResultListItem-AttributeValueHighlighted"));
      $(this.getDomRef()).addClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      var animation02,
        secondAnimationStarted = false;
      var animation01 = expandAreaObjectInfo.attributesExpandContainer["animate"]({
        height: expandAreaObjectInfo.expandedHeight
      }, {
        duration: expandAreaObjectInfo.expandAnimationDuration,
        progress: function progress(animation, _progress, remainingMs) {
          if (!secondAnimationStarted && _progress > 0.5) {
            animation02 = expandAreaObjectInfo.relatedObjectsToolbar["animate"]({
              opacity: 1
            }, remainingMs).promise();
            secondAnimationStarted = true;

            // eslint-disable-next-line @typescript-eslint/no-this-alias
            jQuery.when(animation01, animation02).done(
            // jQuery Deferred for jQuery Animation, Unable to convert to Promise
            function () {
              that.setProperty("expanded", true, true);
              $(this).addClass("sapUshellSearchResultListItem-AttributesExpanded");
              $(this).css("height", "");
              $(expandAreaObjectInfo.elementsToFadeInOrOut).css("opacity", "");
              $(that.getDomRef()).removeClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");
              var iconArrowUp = IconPool.getIconURI("slim-arrow-up");
              var expandButton = that.getAggregation("_expandButton");
              expandButton.setTooltip(i18n.getText("hideDetailBtn_tooltip"));
              expandButton.setIcon(iconArrowUp);
              expandButton.rerender();
              expandAreaObjectInfo.relatedObjectsToolbar["css"]("display", ""); // Todo (SearchRelatedObjectsToolbar)
              expandAreaObjectInfo.relatedObjectsToolbar["css"]("opacity", ""); // Todo (SearchRelatedObjectsToolbar)

              that._renderAriaDescriptionElementForAttributes(undefined, /* withPrefix = */ /* doRender= */false);
              that._renderAriaDescriptionElementForCollapsedOrExpandedState(undefined, /* withPrefix = */ /* doRender= */false);
            }.bind(this));
          }
        }
      }).promise();
      $(expandAreaObjectInfo.elementsToFadeInOrOut).animate({
        opacity: 1
      }, expandAreaObjectInfo.fadeInOrOutAnimationDuration);
    },
    hideDetails: function _hideDetails() {
      var _this6 = this;
      var resultListItem = $(this.getDomRef());
      if (!this.isShowingDetails()) {
        return;
      }
      var expandAreaObjectInfo = this._getExpandAreaObjectInfo();
      expandAreaObjectInfo.relatedObjectsToolbar["css"]("opacity", 1); // Todo (SearchRelatedObjectsToolbar)
      expandAreaObjectInfo.relatedObjectsToolbar["animate"](
      // ToDo
      {
        opacity: 0
      }, expandAreaObjectInfo.expandAnimationDuration / 2);
      var attributeHeight = resultListItem.find(".sapUshellSearchResultListItem-MainAttribute").outerHeight(true) + resultListItem.find(".sapUshellSearchResultListItem-ExpandSpacerAttribute").outerHeight(true);
      var secondAnimationStarted = false;
      var deferredAnimation01 = expandAreaObjectInfo.attributesExpandContainer["animate"]({
        height: attributeHeight
      }, {
        duration: expandAreaObjectInfo.expandAnimationDuration,
        progress: function progress(animation, _progress2, remainingMs) {
          if (!secondAnimationStarted && remainingMs <= expandAreaObjectInfo.fadeInOrOutAnimationDuration) {
            secondAnimationStarted = true;
            var deferredAnimation02 = $(expandAreaObjectInfo.elementsToFadeInOrOut).animate({
              opacity: 0
            }, expandAreaObjectInfo.fadeInOrOutAnimationDuration).promise();
            jQuery.when(deferredAnimation01, deferredAnimation02).done(function () {
              // jQuery Deferred for jQuery Animation, Unable to convert to Promise
              _this6.setProperty("expanded", false, true);
              expandAreaObjectInfo.attributesExpandContainer["removeClass"](
              // ToDo
              "sapUshellSearchResultListItem-AttributesExpanded");
              $(expandAreaObjectInfo.elementsToFadeInOrOut).css("opacity", "");
              expandAreaObjectInfo.relatedObjectsToolbar["css"]("opacity", ""); // ToDo

              var iconArrowDown = IconPool.getIconURI("slim-arrow-down");
              var expandButton = _this6.getAggregation("_expandButton");
              expandButton.setTooltip(i18n.getText("showDetailBtn_tooltip"));
              expandButton.setIcon(iconArrowDown);
              expandButton.rerender();
              _this6._renderAriaDescriptionElementForAttributes(undefined, /* withPrefix = */ /* doRender= */false);
              _this6._renderAriaDescriptionElementForCollapsedOrExpandedState(undefined, /* withPrefix = */ /* doRender= */false);
            });
          }
        }
      }).promise();
    },
    toggleDetails: function _toggleDetails() {
      var eventType;
      var oModel = this.getModel();
      if (this.isShowingDetails()) {
        eventType = UserEventType.ITEM_HIDE_DETAILS;
        this.hideDetails();
      } else {
        eventType = UserEventType.ITEM_SHOW_DETAILS;
        this.showDetails();
      }
      oModel.eventLogger.logEvent({
        type: eventType,
        itemPosition: this.getProperty("positionInList"),
        executionId: this.getProperty("resultSetId")
      });
    },
    isSelectionModeEnabled: function _isSelectionModeEnabled() {
      var isSelectionModeEnabled = false;
      var selectionBoxContainer = $(this.getDomRef()).find(".sapUshellSearchResultListItem-multiSelect-selectionBoxContainer");
      if (selectionBoxContainer) {
        isSelectionModeEnabled = selectionBoxContainer.css("opacity") > 0; // ToDo
      }

      return isSelectionModeEnabled;
    },
    enableSelectionMode: function _enableSelectionMode() {
      var selectionBoxOuterContainer = $(this.getDomRef()).find(".sapUshellSearchResultListItem-multiSelect-innerContainer");
      var selectionBoxInnerContainer = selectionBoxOuterContainer.find(".sapUshellSearchResultListItem-multiSelect-selectionBoxContainer");
      var duration = 200; // 'fast'
      var secondAnimationStarted = false;
      selectionBoxOuterContainer.animate({
        width: "2rem"
      }, {
        duration: duration,
        progress: function progress(animation, _progress3) {
          if (!secondAnimationStarted && _progress3 > 0.5) {
            selectionBoxInnerContainer.css("display", "");
            selectionBoxInnerContainer.animate({
              opacity: "1.0"
            }, duration / 2);
            secondAnimationStarted = true;
          }
        }
      });
    },
    disableSelectionMode: function _disableSelectionMode() {
      var selectionBoxOuterContainer = $(this.getDomRef()).find(".sapUshellSearchResultListItem-multiSelect-innerContainer");
      var selectionBoxInnerContainer = selectionBoxOuterContainer.find(".sapUshellSearchResultListItem-multiSelect-selectionBoxContainer");
      var duration = 200; // 'fast'
      selectionBoxInnerContainer.animate({
        opacity: "0.0"
      }, duration / 2, function () {
        selectionBoxInnerContainer.css("display", "none");
      });
      selectionBoxOuterContainer.animate({
        width: "0"
      }, duration);
    },
    toggleSelectionMode: function _toggleSelectionMode(animated) {
      if (this.isSelectionModeEnabled()) {
        this.disableSelectionMode();
      } else {
        this.enableSelectionMode();
      }
    },
    onAfterRendering: function _onAfterRendering() {
      var $this = $(this.getDomRef());
      this._showOrHideExpandButton();
      this._setListItemStatusBasedOnWindowSize();
      this._renderAriaDescriptionElementForTitle(undefined, /* withPrefix = */false, /* doRender= */false);
      this._renderAriaDescriptionElementForAttributes(undefined, /* withPrefix = */ /* doRender= */false);
      this._renderAriaDescriptionElementForCollapsedOrExpandedState(undefined, /* withPrefix = */ /* doRender= */false);

      // use boldtagunescape like in highlighting for suggestions // TODO
      // allow <b> in title and attributes
      this.forwardEllipsis($this.find(".sapUshellSearchResultListItem-Title, .sapUshellSearchResultListItem-AttributeKey, .sapUshellSearchResultListItem-AttributeValueHighlighted"));
      SearchHelper.attachEventHandlersForTooltip(this.getDomRef()); // ToDo
    },

    resizeEventHappened: function _resizeEventHappened() {
      var $this = $(this.getDomRef());
      this._showOrHideExpandButton();
      this._setListItemStatusBasedOnWindowSize();
      this.getAggregation("_titleLink").rerender();
      this.forwardEllipsis($this.find(".sapUshellSearchResultListItem-Title, .sapUshellSearchResultListItem-AttributeKey, .sapUshellSearchResultListItem-AttributeValueHighlighted"));
    },
    _getPhoneSize: function _getPhoneSize() {
      return 767;
    },
    _resetPrecalculatedValues: function _resetPrecalculatedValues() {
      this._visibleAttributes = undefined;
      this._detailsArea = undefined;
      this._showExpandButton = false;
    },
    _setListItemStatusBasedOnWindowSize: function _setListItemStatusBasedOnWindowSize() {
      var windowWidth = window.innerWidth;
      var parentListItem = this.getProperty("parentListItem");
      if (this.getProperty("titleNavigation") && windowWidth <= this._getPhoneSize()) {
        parentListItem.setType(ListType.Active);
      } else {
        parentListItem.setType(ListType.Inactive);
      }
    },
    _showOrHideExpandButton: function _showOrHideExpandButton() {
      var _this$getProperty3;
      var element = $(this.getDomRef());
      var expandButtonContainer = element.find(".sapUshellSearchResultListItem-ExpandButtonContainer");
      var isVisible = expandButtonContainer.css("visibility") !== "hidden";
      var shouldBeVisible = false;
      var isDocumentItem = ((_this$getProperty3 = this.getProperty("imageFormat")) === null || _this$getProperty3 === void 0 ? void 0 : _this$getProperty3.toLowerCase()) === "documentthumbnail";
      if (!isDocumentItem) {
        var actionBar = element.find(".sapUshellSearchResultListItem-RelatedObjectsToolbar");
        shouldBeVisible = actionBar.length > 0; // && actionBar.css("display") !== "none";
      }

      if (!isDocumentItem && !shouldBeVisible) {
        var elementsInExpandArea = this._getElementsInExpandArea();
        if (elementsInExpandArea.length > 0) {
          shouldBeVisible = true;
        }
      }
      if (isVisible && !shouldBeVisible) {
        expandButtonContainer.css("visibility", "hidden");
        expandButtonContainer.attr("aria-hidden", "true");
        this.setAriaExpandedState();
      } else if (!isVisible && shouldBeVisible) {
        expandButtonContainer.css("visibility", "");
        expandButtonContainer.removeAttr("aria-hidden");
        this.setAriaExpandedState();
      }
    },
    setAriaExpandedState: function _setAriaExpandedState() {
      var expandButton = this.getAggregation("_expandButton");
      if (!expandButton) {
        return;
      }
      var $expandButton = $(expandButton.getDomRef());
      var $this = $(this.getDomRef());
      var $parentListItem = this.getProperty("parentListItem") ? $(this.getProperty("parentListItem").getDomRef()) : $this.closest("li");
      var $expandButtonContainer = $this.find(".sapUshellSearchResultListItem-ExpandButtonContainer");
      if ($expandButtonContainer.css("visibility") === "hidden") {
        $expandButton.removeAttr("aria-expanded");
        $parentListItem.removeAttr("aria-expanded");
      } else {
        var expanded = this.getProperty("expanded");
        if (expanded) {
          $expandButton.attr("aria-expanded", "true");
          $parentListItem.attr("aria-expanded", "true");
        } else {
          $expandButton.attr("aria-expanded", "false");
          $parentListItem.attr("aria-expanded", "false");
        }
      }
    },
    _registerItemPressHandler: function _registerItemPressHandler() {
      var _this7 = this;
      var parentListItem = this.getProperty("parentListItem");
      if (parentListItem) {
        parentListItem.attachPress(function () {
          _this7._performTitleNavigation();
        });
        this._registerItemPressHandler = function () {
          //
        };
      }
    },
    _performTitleNavigation: function _performTitleNavigation(params) {
      var trackingOnly = params && params.trackingOnly || false;
      var titleNavigation = this.getProperty("titleNavigation");
      if (titleNavigation) {
        titleNavigation.performNavigation({
          trackingOnly: trackingOnly
        });
      }
    },
    forwardEllipsis: function _forwardEllipsis(objs) {
      var $this = $(this.getDomRef());
      $this.addClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      objs.each(function (i, d) {
        // recover bold tag with the help of text() in a safe way
        SearchHelper.forwardEllipsis4Whyfound(d);
      });
      $this.removeClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");
    }
  });
  SearchResultListItem.noValue = "\u2013";
  return SearchResultListItem;
});
})();