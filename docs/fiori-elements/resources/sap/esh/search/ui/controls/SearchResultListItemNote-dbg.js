/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/esh/search/ui/controls/SearchResultListItem", "sap/esh/search/ui/controls/SearchText"], function (__i18n, SearchResultListItem, SearchText) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var i18n = _interopRequireDefault(__i18n);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchResultListItemNote = SearchResultListItem.extend("sap.esh.search.ui.controls.SearchResultListItemNote", {
    renderer: {
      apiVersion: 2
    },
    _renderContentContainer: function _renderContentContainer(oRm) {
      var oModel = this.getModel();
      oRm.openStart("div", this.getId() + "-content");
      oRm["class"]("sapUshellSearchResultListItem-Content");
      if (!oModel.config.optimizeForValueHelp) {
        oRm["class"]("sapUshellSearchResultListItem-ContentValueHelp");
      }
      oRm.openEnd();
      this._renderTitleContainer(oRm);
      this._renderAttributesContainer(oRm);
      oRm.close("div");
    },
    _renderTitleContainer: function _renderTitleContainer(oRm) {
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

      /// /// Title
      var titleURL = this.getProperty("titleUrl");
      var titleLink = this.getAggregation("_titleLink");
      titleLink.setHref(titleURL);
      titleLink.setText(this.getProperty("title"));
      if (titleURL.length === 0) {
        titleLink.setEnabled(false);
      }
      oRm.renderControl(titleLink);

      /// /// Object Type
      var typeText = this.getAggregation("_typeText");
      typeText.setText(this.getProperty("Type"));
      oRm.renderControl(typeText);
      oRm.close("div");
      if (!oModel.config.optimizeForValueHelp) {
        this._renderImageForPhone(oRm);
      }
      oRm.close("div");
    },
    _renderAttributesContainer: function _renderAttributesContainer(oRm) {
      oRm.openStart("div", this.getId() + "-attributes-expand-container");
      oRm["class"]("sapUshellSearchResultListItemDoc-AttributesExpandContainer");
      var expanded = this.getProperty("expanded");
      if (expanded) {
        oRm["class"]("sapUshellSearchResultListItem-AttributesExpanded");
      }
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-attributes-and-actions");
      oRm["class"]("sapUshellSearchResultListItem-AttributesAndActions");
      oRm.openEnd();
      oRm.openStart("ul", this.getId() + "-attributes");
      oRm["class"]("sapUshellSearchResultListItem-Attributes");
      oRm.openEnd();
      this._renderThumbnailSnippetContainer(oRm);
      this._renderDocAttributesContainer(oRm);

      // This is just a dummie attribute to store additional space information for the expand and collapse JavaScript function
      oRm.openStart("div", this.getId() + "-expand-spacer-attribute");
      oRm["class"]("sapUshellSearchResultListItem-ExpandSpacerAttribute");
      oRm.attr("aria-hidden", "true");
      oRm.openEnd();
      oRm.close("div");
      oRm.close("ul");
      this._renderRelatedObjectsToolbar(oRm);
      oRm.close("div");
      oRm.close("div");
    },
    _renderImageForPhone: function _renderImageForPhone(oRm) {
      if (this.getProperty("imageUrl") && this.getProperty("containsThumbnail") === true) {
        oRm.openStart("div", this.getId() + "-title-image");
        oRm["class"]("sapUshellSearchResultListItem-TitleImage");
        oRm.openEnd();
        oRm.openStart("div", this.getId() + "-image-container-alignment-helper");
        oRm["class"]("sapUshellSearchResultListItem-ImageContainerAlignmentHelper");
        oRm.openEnd();
        oRm.close("div");
        oRm.openStart("img", this.getId() + "-image");
        oRm["class"]("sapUshellSearchResultListItem-Image");
        oRm.attr("src", this.getProperty("imageUrl"));
        oRm.openEnd();
        oRm.close("img");
        oRm.close("div");
      }
    },
    _renderDocAttributesContainer: function _renderDocAttributesContainer(oRm) {
      oRm.openStart("div", this.getId() + "-attributes-container");
      oRm["class"]("sapUshellSearchResultListItemNote-AttributesContainer");
      oRm.openEnd();
      var itemAttributes = this.getProperty("attributes");
      this._renderAllAttributes(oRm, itemAttributes);
      oRm.close("div");
    },
    _renderThumbnailSnippetContainer: function _renderThumbnailSnippetContainer(oRm) {
      oRm.openStart("div", this.getId() + "-thumbnail-snippet-container");
      oRm["class"]("sapUshellSearchResultListItemNote-ThumbnailSnippetContainer");
      oRm.openEnd();
      this._renderSnippetContainer(oRm);
      oRm.close("div");
    },
    _renderSnippetContainer: function _renderSnippetContainer(oRm) {
      var itemAttributes = this.getProperty("attributes");
      for (var i = 0; i < itemAttributes.length; i++) {
        var itemAttribute = itemAttributes[i];
        if (itemAttribute.longtext) {
          var value = new SearchText("".concat(this.getId(), "_snippet-").concat(i, "-longtext"));
          value.setText(itemAttribute.value);
          value.addStyleClass("sapUshellSearchResultListItemDoc-Snippet");
          oRm.renderControl(value);
        }
      }
    },
    _renderAllAttributes: function _renderAllAttributes(oRm, itemAttributes) {
      var itemAttribute;
      var labelText;
      var valueText;
      var value;

      // skip first attribute which is the title attribute for the table
      var numberOfMainAttributes = 4;
      if (this.getProperty("imageUrl")) {
        numberOfMainAttributes--;
      }
      this.destroyAggregation("_attributeValues");
      for (var i = 0, j = 0; j < numberOfMainAttributes && i < itemAttributes.length; i++) {
        itemAttribute = itemAttributes[i];
        if (itemAttribute.isTitle || itemAttribute.longtext) {
          continue;
        }
        if (!itemAttribute.value) {
          continue;
        }
        labelText = itemAttribute.name;
        valueText = itemAttribute.value;
        if (labelText === undefined || valueText === undefined) {
          continue;
        }
        if (!valueText || valueText === "") {
          valueText = SearchResultListItem.noValue;
        }
        value = new SearchText("".concat(this.getId(), "_").concat(i, "_").concat(j, "_noteText"), {
          text: valueText
        });
        value.addStyleClass("sapUshellSearchResultListItemNote-AttributeValue");
        value.addStyleClass("sapUshellSearchResultListItem-MightOverflow");
        oRm.renderControl(value);
        this.addAggregation("_attributeValues", value, true /* do not invalidate this object */);

        j++;
      }
    },
    _getExpandAreaObjectInfo: function _getExpandAreaObjectInfo() {
      var resultListItem = $(this.getDomRef());
      var attributesExpandContainer = resultListItem.find(".sapUshellSearchResultListItemDoc-AttributesExpandContainer");
      var relatedObjectsToolbar = resultListItem.find(".sapUshellSearchResultListItem-RelatedObjectsToolbar");
      var relatedObjectsToolbarHidden = false;
      if (relatedObjectsToolbar.css("display") === "none") {
        relatedObjectsToolbar.css("display", "block");
        relatedObjectsToolbarHidden = true;
      }
      var currentHeight = attributesExpandContainer.height();
      var expandedHeight = resultListItem.find(".sapUshellSearchResultListItem-AttributesAndActions").height();
      if (relatedObjectsToolbarHidden) {
        relatedObjectsToolbar.css("display", "");
      }
      var elementsToFadeInOrOut = [];
      resultListItem.find(".sapUshellSearchResultListItem-GenericAttribute").each(function () {
        var element = $(this);
        if (Number(element.css("order")) > 2) {
          elementsToFadeInOrOut.push(this);
        }
      });
      var expandAnimationDuration = 200;
      var fadeInOrOutAnimationDuration = expandAnimationDuration / 10;
      var expandAreaObjectInfo = {
        resultListItem: resultListItem,
        attributesExpandContainer: attributesExpandContainer,
        currentHeight: currentHeight,
        expandedHeight: expandedHeight,
        elementsToFadeInOrOut: elementsToFadeInOrOut,
        expandAnimationDuration: expandAnimationDuration,
        fadeInOrOutAnimationDuration: fadeInOrOutAnimationDuration,
        relatedObjectsToolbar: relatedObjectsToolbar
      };
      return expandAreaObjectInfo;
    },
    hideDetails: function _hideDetails() {
      var resultListItem = $(this.getDomRef());
      if (!this.isShowingDetails()) {
        return;
      }
      var expandAreaObjectInfo = this._getExpandAreaObjectInfo();
      var attributeHeight = resultListItem.find(".sapUshellSearchResultListItem-Attributes").outerHeight(true);
      var secondAnimationStarted = false;
      var deferredAnimation01 = expandAreaObjectInfo.attributesExpandContainer.animate({
        height: attributeHeight
      }, {
        duration: expandAreaObjectInfo.expandAnimationDuration,
        progress: function progress(animation, _progress, remainingMs) {
          if (!secondAnimationStarted && remainingMs <= expandAreaObjectInfo.fadeInOrOutAnimationDuration) {
            secondAnimationStarted = true;
            var deferredAnimation02 = $(expandAreaObjectInfo.elementsToFadeInOrOut).animate({
              opacity: 0
            }, expandAreaObjectInfo.fadeInOrOutAnimationDuration).promise();
            jQuery.when(deferredAnimation01, deferredAnimation02).done(function () {
              // jQuery Deferred for jQuery Animation, Unable to convert to Promise
              this.setProperty("expanded", false, true);
              expandAreaObjectInfo.attributesExpandContainer.removeClass("sapUshellSearchResultListItem-AttributesExpanded");
              $(expandAreaObjectInfo.elementsToFadeInOrOut).css("opacity", "");
              var iconArrowDown = sap.ui.core.IconPool.getIconURI("slim-arrow-down");
              var expandButton = this.getAggregation("_expandButton");
              expandButton.setTooltip(i18n.getText("showDetailBtn_tooltip"));
              expandButton.setIcon(iconArrowDown);
              expandButton.rerender();
            });
          }
        }
      }).promise();
    }
  });
  return SearchResultListItemNote;
});
})();