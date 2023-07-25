/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/Link",
	"sap/m/TextArea",
	"sap/m/Popover",
	"sap/m/ToolbarSpacer",
	"sap/m/Avatar",
	"sap/m/Button",
	"sap/ui/Device",
	"sap/suite/ui/commons/util/ManagedObjectRegister",
	"sap/suite/ui/commons/util/DateUtils",
	"sap/ui/core/Icon",
	"sap/m/library",
	"sap/ui/core/format/DateFormat",
	"sap/ui/base/Object",
	"sap/ui/dom/containsOrEquals",
	"sap/base/security/encodeXML",
	"./TimelineItemRenderer",
	"sap/ui/events/KeyCodes"
], function (jQuery, Control, Text, Toolbar, Link, TextArea, Popover, ToolbarSpacer, Avatar, Button, Device,
			 ManagedObjectRegister, DateUtils, Icon, mLibrary, DateFormat, BaseObject, containsOrEquals, encodeXML, TimelineItemRenderer, KeyCodes) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mLibrary.PlacementType;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = mLibrary.ToolbarDesign;

	// shortcuts for sap.m.AvatarShape and sap.m.AvatarSize
	var AvatarShape = mLibrary.AvatarShape;
    var AvatarSize = mLibrary.AvatarSize;

	/**
	 * Constructor for a new TimelineItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * An entry posted on the timeline.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.TimelineItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TimelineItem = Control.extend("sap.suite.ui.commons.TimelineItem", /** @lends sap.suite.ui.commons.TimelineItem.prototype */ {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Date and time value of the timeline post. This value must be in one of the following formats:
				 * <ul>
				 * <li> A valid instance of the <code>Date</code> object. </li>
				 * <li> An integer representing Unix time (also known as POSIX or Epoch time) in milliseconds. </li>
				 * <li> A string with an integer representing Unix time in milliseconds. </li>
				 * <li> A string that contains <code>Date([number])</code>, where <code>[number]</code>
				 * represents Unix time in milliseconds. </li>
				 * </ul>
				 * If this property has any other format, the timeline will try to parse it using <code>Date.parse</code>.
				 * It is not recommended to use this functionality, as different web browsers implement this function differently,
				 * which may lead to unpredictable behavior.
				 */
				dateTime: {type: "any", group: "Misc", defaultValue: null},

				/**
				 * Text for the items filter name. This text will be used as the name of the items filter in the
				 * filter popover.
				 */
				filterValue: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Icon on the timeline axis that corresponds to the point in time when the entry was posted.
				 * Posts can be displayed in chronological or reverse chronological order.
				 */
				icon: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Defines the shape of the icon.
				 * @since 1.88
				 */
				iconDisplayShape: { type: "sap.m.AvatarShape", defaultValue: AvatarShape.Circle },

				/**
				 * Defines the initials of the icon.
				 * @since 1.88
				 */
				iconInitials: { type: "string", defaultValue: "" },

				/**
				 * Defines the size of the icon.
				 * @since 1.88
				 */
				iconSize: { type: "sap.m.AvatarSize", defaultValue: AvatarSize.XS },

				/**
				 * Tooltip for an icon displayed on the timeline axis.
				 */
				iconTooltip: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Decides whether a default Icon tooltip should be used if no tooltip is set.
				 */
				useIconTooltip: {type: "boolean", group: "Accessibility", defaultValue: true},

				/**
				 * The expand and collapse feature is set by default and uses 300 characters on mobile devices
				 * and 500 characters on desktop computers as limits. Based on these values, the text of the timeline post
				 * is collapsed once it reaches these character limits. In this case, only the specified number of characters
				 * is displayed. By clicking the More link, the entire text can be displayed. Clicking Less collapses the text.
				 * The application can set the value according to its needs.
				 */
				maxCharacters: {type: "int", group: "Behavior", defaultValue: null},

				/**
				 * Number of replies to a timeline post.
				 */
				replyCount: {type: "int", group: "Misc", defaultValue: null},

				/**
				 * Indicates the post status. The status affects the post's icon color. Supported values:
				 * <ul>
				 * <li> <code>Information</code> </li>
				 * <li> <code>Success</code> </li>
				 * <li> <code>Warning</code> </li>
				 * <li> <code>Error</code> </li>
				 * </ul>
				 */
				status: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Text shown in the post title right after the user name.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Text shown inside the timeline post.
				 */
				text: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * User name shown in the post title.
				 */
				userName: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Makes the user name clickable. Clicking the name fires a userNameClicked event.
				 */
				userNameClickable: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Picture shown next to the user name.
				 */
				userPicture: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null}
			},
			defaultAggregation: "embeddedControl",
			aggregations: {

				/**
				 * Custom actions displayed as links in the links section of the post. The key must be unique
				 * for each link. Values are used as labels for the link. When a user clicks the link, a customActionClicked
				 * event is fired.
				 */
				customAction: {type: "sap.ui.core.CustomData", multiple: true, singularName: "customAction"},

				/**
				 * A UI5 control that acts as a custom reply dialog. It is used instead of the default reply dialog
				 * that is displayed when the user clicks the Reply link. Supports UI5 controls that have an openBy method,
				 * for example, the Popup control.
				 */
				customReply: {type: "sap.ui.core.Control", multiple: false},

				/**
				 * A UI5 control that is displayed as a timeline post's content instead of the default content (text).
				 * Examples of such a control include the Panel control and the List control.
				 */
				embeddedControl: {type: "sap.ui.core.Control", multiple: false},

				/**
				 * A list of replies related to the post.
				 */
				replyList: {type: "sap.m.List", multiple: false},

				/**
				 * Suggested posts.<br>
				 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
				 * @deprecated Since version 1.46.0.
				 * Use the Group Feed Component instead.
				 */
				suggestionItems: {
					type: "sap.m.StandardListItem",
					multiple: true,
					singularName: "suggestionItem",
					deprecated: true
				}
			},
			events: {

				/**
				 * This event is fired when a user name is clicked in the post's header section.
				 */
				userNameClicked: {
					parameters: {

						/**
						 * A clickable UI element representing the user name.
						 */
						uiElement: {type: "sap.ui.core.Control"}
					}
				},
				/**
				 * This event is fired when a non-interactive content or
				 * white space(where no content is available) inside an timeline post is clicked,
				 * triggers the click event of the item.
				 * @since 1.95
				 */

				select: {},
				/**
				 * This event is fired when the embedded control link is clicked of the timeline post.
				 * triggers the click event of the content.
				 * @since 1.95
				 */

				press: {},

				/**
				 * This event is fired when the Reply button is clicked in the links section of a timeline post.
				 */
				replyPost: {
					parameters: {

						/**
						 * Content of the reply to the post.
						 */
						value: {type: "string"}
					}
				},

				/**
				 * This event is fired when the Reply link is clicked to open the reply dialog.
				 */
				replyListOpen: {},

				/**
				 * Fired when custom action link is clicked.
				 */
				customActionClicked: {
					parameters: {

						/**
						 * Value of the custom action.
						 */
						value: {type: "string"},

						/**
						 * Key of the custom action.
						 */
						key: {type: "string"},

						/**
						 * Link on which the user clicked.
						 */
						linkObj: {type: "sap.m.Link"}
					}
				},

				/**
				 * This event is fired when the user types text into the search field and showSuggestion
				 * is set to true. Changing the suggestItems aggregation will show the suggestions inside a popup.<br>
				 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
				 * @since 1.28.1
				 * @deprecated Since version 1.46.0.
				 * Use the Group Feed Component instead.
				 */
				suggest: {
					deprecated: true,
					parameters: {

						/**
						 * The current value that has been typed into the search field.
						 */
						suggestValue: {type: "string"}
					}
				},

				/**
				 * This event is fired when a suggested post is selected in the search suggestions popup. This event
				 * is fired only when the showSuggestion propery is set to <code>true</code> and there are
				 * suggested posts shown in the suggestions popup.<br>
				 * As of version 1.46, replaced by {@link sap.collaboration.components.feed.Component}.
				 * @since 1.28.1
				 * @deprecated Since version 1.46.0.
				 * Use the Group Feed Component instead.
				 */
				suggestionItemSelected: {
					deprecated: true,
					parameters: {

						/**
						 * The post selected in the suggestions popup.
						 */
						selectedItem: {type: "sap.ui.core.Item"}
					}
				}
			},
			associations: {
				/**
				 * Assigns label to a control using the ID of the associated control. (Refer WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			}
		}
	});

	var resBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons"),
		STATUS_CLASS_MAP = {
			"Warning": "sapSuiteUiCommonsTimelineStatusWarning",
			"Error": "sapSuiteUiCommonsTimelineStatusError",
			"Success": "sapSuiteUiCommonsTimelineStatusSuccess",
			"Information": "sapSuiteUiCommonsTimelineStatusInformation"
		};

	TimelineItem.prototype.init = function () {
		this._customReply = false;
		this._objects = new ManagedObjectRegister();

		this._nMaxCharactersMobile = 500;
		this._nMaxCharactersDesktop = 800;

		this._sTextShowMore = resBundle.getText("TIMELINE_TEXT_SHOW_MORE");

		this._registerControls();
		this._registerPopup();

		//notch orientation
		this._orientation = "V";
	};

	/* =========================================================== */
	/* Public API */
	/* =========================================================== */
	/**
	 * Set custom message to display
	 * @param {string} msg Message text
	 */
	TimelineItem.prototype.setCustomMessage = function (msg) {
		this._objects.getInfoText().setText(msg);
		this._objects.getInfoBar().setVisible(msg && msg.length > 0);
		this.invalidate();
	};

	TimelineItem.prototype.setDateTime = function (oDateTime) {
		var sMilliSecondPatern = "";

		/**
		 * Regex for validating the dateformat and creating the corresponding date pattern
		 * for parsing the date in the format "2020-01-01T15:29:04.0Z" milliseconds
		 * are supported upto 12 digits.
		 */
		var sMillisecondsExp = RegExp(/^(?:[0-9]{4}-[0-9]{2}-[0-9]{2})?(?:[ T][0-9]{2}:[0-9]{2}:[0-9]{2})(?:[.][0-9]{1,12})?[Z]/);
		/**
		 * Regex for validating the dateformat and creating the corresponding date pattern
		 * for parsing the date in the format "2020-01-01T15:29:04"
		 *  */
		var sDateExp = RegExp(/^(?:[0-9]{4}-[0-9]{2}-[0-9]{2})?(?:[ T][0-9]{2}:[0-9]{2}:[0-9]{2})/);
		//If Pattern matches convert the oDateTime to Date Format.
		if (sMillisecondsExp.test(oDateTime)) {
			//Set the pattern based on number of milliseconds value available.
			if (oDateTime.indexOf(".") > 0 && oDateTime.split(".")[1]) {
				var iDigits = oDateTime.split(".")[1].length - 1;
				for (var i = 0; i < iDigits; i++) {
					sMilliSecondPatern = sMilliSecondPatern + "S";
				}
				var sPattern = "yyyy-MM-dd'T'HH:mm:ss." + sMilliSecondPatern + "X";
				var oInst = DateFormat.getDateTimeInstance({ pattern: sPattern });

				var oParsed = oInst.parse(oDateTime);

				if (oParsed instanceof Date) {
					oDateTime = oParsed;
				}
			} else {
				oDateTime = oDateTime ? DateUtils.parseDate(oDateTime) : oDateTime;
			}
		} else if (sDateExp.test(oDateTime)) {
			oDateTime = oDateTime ? DateUtils.parseDate(oDateTime) : oDateTime;
		}
		this.setProperty("dateTime", oDateTime);

		return this;
	};

	/* =========================================================== */
	/* Private methods*/
	/* =========================================================== */
	/**
	 * Override to fix scrollbar moving after new data are loaded
	 * @private
	 */
	TimelineItem.prototype.applyFocusInfo = function () {
		this.focus();

		// scroll to visible position when scrolling not to focused item - see _moveScrollBar
		this.getParent()._moveScrollBar(true);
	};

	/**
	 * Focus handling
	 * @returns {HTMLElement} DOM Reference
	 * @private
	 */
	TimelineItem.prototype.getFocusDomRef = function () {
		return this.$("outline")[0];
	};

	/**
	 * Trigger after reply is pressed
	 * @private
	 */
	TimelineItem.prototype._replyPost = function () {
		var replyText = this._objects.getReplyInputArea().getValue();
		this.fireReplyPost({value: replyText});
	};

	/**
	 * Register popup window for complete message
	 * @private
	 */
	TimelineItem.prototype._registerPopup = function () {
		var that = this; //eslint-disable-line

		// popover content
		this._objects.register("fullText", function () {
			var oText = new Text(that.getId() + "-fullText", {
				text: that.getText()
			});
			oText.addStyleClass("sapSuiteUiCommonsTimelineItemPopoverText");
			return oText;
		});

		this._objects.register("fullTextPopover", function () {
			var oPopover = new Popover({
				placement: PlacementType.Bottom,
				showArrow: false,
				showHeader: false,
				contentMinWidth: '300px',
				contentWidth: '450px',
				resizable: true,
				content: [that._objects.getFullText()]
			});

			oPopover.addStyleClass("sapSuiteUiCommonsTimelineItemShowMorePopover");
			return oPopover;
		});
	};

	/**
	 * Opens reply dialog after reply pressed
	 * @private
	 */
	TimelineItem.prototype._openReplyDialog = function () {
		if (this._customReply) {
			this.getCustomReply().openBy(this._objects.getReplyLink());
			this.fireReplyListOpen();
		} else {
			this.fireReplyListOpen();
			this._objects.getReplyInputArea().setValue('');
			this._oldReplyInputArea = '';

			this._list = this.getReplyList();

			if (this._list !== null) {
				// we want to prevent rerender timeline item so we need to remove this aggregation from it first with 'suppressinvalidation' true
				// otherwise addContent on popover would do it when switching parents (and you can't specify whether you want invalidate)
				this.setAggregation("replyList", null, true);
				this._objects.getReplyPop().addContent(this._list);
			}
			this._objects.getReplyPop().addContent(this._objects.getReplyInputArea());
			this._objects.getReplyPop().openBy(this._objects.getReplyLink());
		}
	};

	/**
	 * Call parent function if there is any parent defined. Usually timeline, but there may be cases when item is standalone.
	 * @returns {*} Return value of parent function
	 * @private
	 */
	TimelineItem.prototype._callParentFn = function () {
		var args = Array.prototype.slice.call(arguments),
			fnName = args.shift(),
			parent = this.getParent();
		if (parent && (typeof parent[fnName] === "function")) {
			return parent[fnName].apply(parent, args);
		}
	};

	/**
	 * Return correct icon for grouping based on the settings
	 * @returns {string} Icon name
	 * @private
	 */
	TimelineItem.prototype._getCorrectGroupIcon = function () {
		var sIcon = "",
			fnIsDoubleSided = function () {
				return this.getParent() && this.getParent()._renderDblSided;
			}.bind(this),
			bIsGroupCollapsed = this._isGroupCollapsed();

		if (this._orientation === "H") {
			sIcon = "sap-icon://navigation-right-arrow";
			if (!bIsGroupCollapsed) {
				sIcon = this._callParentFn("_isLeftAlignment") || fnIsDoubleSided() ? "sap-icon://navigation-down-arrow" : "sap-icon://navigation-up-arrow";
			}
		} else {
			sIcon = "sap-icon://navigation-down-arrow";
			if (bIsGroupCollapsed) {
				sIcon = this._callParentFn("_isLeftAlignment") || fnIsDoubleSided() ? "sap-icon://navigation-right-arrow" : "sap-icon://navigation-left-arrow";
			}
		}

		return sIcon;
	};

	/**
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	TimelineItem.prototype.onclick = function (oEvent) {
		var that = this; //eslint-disable-line
		// this check whether group header was clicked
		var srcControl = oEvent.srcControl;
		if (containsOrEquals(this.$("outline").get(0), oEvent.target)) {
			if (this._isGroupHeader) {
				that._performExpandCollapse(that._groupID);
			}
		}

		if (srcControl && (srcControl instanceof Icon || srcControl.getId().indexOf("userNameLink") > -1) || srcControl instanceof sap.m.Avatar) {
			return;
		}

		if (srcControl instanceof Link) {
			this.firePress();
		} else {
			this.fireSelect();
		}
	};

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * @param oEvent - the keyboard event.
	 * @private
	 */
	TimelineItem.prototype.onkeydown = function (oEvent) {
		if (oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.SPACE) {
			if (oEvent.srcControl.getId().indexOf("userNameLink") > -1) {
				return; // sap.m.Link handles click/key events for userNameClicked. Hence we do not need seperate handling.
			} else if (oEvent.srcControl instanceof Link) {
				this.firePress();
			} else {
				this.fireSelect();
			}
		}
	};


	/**
	 * Performs expand or collapse
	 * @param {string} sGroupID Group for action
	 * @private
	 * @returns {Promise} A new promise
	 */
	TimelineItem.prototype._performExpandCollapse = function (sGroupID) {
		var bGroupClassSet = false,
			bExpand = this._isGroupCollapsed(sGroupID);
		var fnSetHeightClass = function ($item, $corrector) {
				var $line = $item.find(".sapSuiteUiCommonsTimelineItemBarV"),
					sGroup, bGroupExpanded;
				if ($corrector.get(0)) {
					sGroup = $corrector.attr("groupId");
					bGroupExpanded = !this._isGroupCollapsed(sGroup);
					if (bGroupExpanded) {
						$line.addClass("sapSuiteUiCommonsTimelineGroupNextExpanded");
					} else {
						$line.removeClass("sapSuiteUiCommonsTimelineGroupNextExpanded");
					}
				}
			}.bind(this),
			fnSetGroupClass = function () {
				var oIcon, $this, bIsCollapsed;
				if (!bGroupClassSet) {
					oIcon = this._objects.getGroupCollapseIcon && this._objects.getGroupCollapseIcon();
					$this = this.$();
					bIsCollapsed = this._isGroupCollapsed();

					if (!bIsCollapsed) {
						$this.removeClass("sapSuiteUiCommonsTimelineGroupCollapsed");
						$this.addClass("sapSuiteUiCommonsTimelineGroupExpanded");
					} else {
						$this.addClass("sapSuiteUiCommonsTimelineGroupCollapsed");
						$this.removeClass("sapSuiteUiCommonsTimelineGroupExpanded");
					}
					oIcon.setSrc(this._getCorrectGroupIcon());
					bGroupClassSet = true;
				}
			}.bind(this),
			fnSetGroupFlag = function () {
				if (this.getParent()) {
					this.getParent()._collapsedGroups[sGroupID] = !bExpand;
				}
			}.bind(this),
			$li = this.$(),
			that = this, //eslint-disable-line
			$parent = $li.parent(),
			$bar, $next, $prev, $lastChild, oExpandResult, $outline;

		fnSetGroupFlag();

		// setup line classes
		if (this._orientation === "H") {
			$bar = this.$("line");
		} else {
			$bar = $li.find(".sapSuiteUiCommonsTimelineGroupHeaderBarWrapper");
			$next = $parent.next().children("li").first();
			$prev = $parent.prev().children(":visible:last");

			// fix previous item based on whether current item is expanded
			if ($prev.get(0)) {
				fnSetHeightClass($prev, $li);
			}

			if (bExpand) {
				// fix last item in case next group was changed while this one was closed (so it was not affected
				// by collapsing next group)
				$lastChild = $parent.children().last();
				fnSetHeightClass($lastChild, $next);
			} else {
				// first fix current item based on whether next item is expanded group
				fnSetHeightClass($li, $next);
			}
		}

		// expanded groups don't have visible lines
		if (bExpand) {
			$bar.hide();
		} else {
			$bar.show();
		}
		$outline = $li.find(".sapSuiteUiCommonsTimelineGroupHeaderMainWrapper");
		$outline.attr("aria-expanded", !!bExpand);
		$li.attr("aria-expanded", !!bExpand);
		if (bExpand) {
			$outline.attr("aria-label", resBundle.getText("TIMELINE_ACCESSIBILITY_GROUP_HEADER") + ": " + $outline.prevObject[0].outerText + " " + resBundle.getText("TIMELINE_ACCESSIBILITY_GROUP_EXPAND"), true);
		} else {
			$outline.attr("aria-label", resBundle.getText("TIMELINE_ACCESSIBILITY_GROUP_HEADER") + ": " + $outline.prevObject[0].outerText + " " + resBundle.getText("TIMELINE_ACCESSIBILITY_GROUP_COLLAPSE"), true);
		}
		// nicer rendering - for collapsing horizontal we want to change group classes after animation is done
		if (this._orientation !== "H" || bExpand) {
			fnSetGroupClass();
		}

		oExpandResult = this._callParentFn("_performExpandCollapse", sGroupID, bExpand, this);
		if (oExpandResult) {
			return new Promise(function (resolve, reject) {
				oExpandResult.then(function () {
					fnSetGroupClass();
					that._callParentFn("_performUiChanges");
					resolve();
				});
			});
		}
	};

	/**
	 * Return class if there is any status bound to item
	 * @returns {string} status color class
	 * @private
	 */
	TimelineItem.prototype._getStatusColorClass = function () {
		var status = this.getStatus();
		return STATUS_CLASS_MAP[status] || "";
	};

	/**
	 * Return icon displayed in timeline
	 * @returns {object} icon
	 * @private
	 */
	TimelineItem.prototype._getLineIcon = function () {
		var that = this, //eslint-disable-line
			oIcon;
		this._objects.register("lineIcon", function () {
			var src = "sap-icon://circle-task",
				isGroupHeader = that.getText() === "GroupHeader";

			if (!isGroupHeader) {
				src = that.getIcon() ? that.getIcon() : "sap-icon://activity-items";
			}

			oIcon = new Icon(that.getId() + '-icon', {
				src: src,
				tooltip: that.getIconTooltip(),
				useIconTooltip: that.getUseIconTooltip()
			});

			oIcon.addStyleClass("sapSuiteUiCommonsTimelineBarIcon");

			return oIcon;
		});

		return this._objects.getLineIcon();
	};

	/**
	 * Indicates whether this item is in collapsed group
	 * @param {string} sId Group id to test.
	 * @private
	 * @returns {boolean} Whether or not the given group is collapsed
	 */
	TimelineItem.prototype._isGroupCollapsed = function (sId) {
		var oParent = this.getParent();
		sId = sId || this._groupID;

		return oParent && oParent._collapsedGroups && oParent._collapsedGroups[sId];
	};

	/**
	 * The first this._nMaxCollapsedLength characters of the text are shown in the collapsed form, the text string ends up
	 * with a complete word, the text string contains at least one word
	 *
	 * @private
	 * @returns {string} Collapsed text
	 */
	TimelineItem.prototype._getCollapsedText = function () {
		var sShortText = this.getText().substring(0, this._nMaxCollapsedLength);
		var nLastSpace = sShortText.lastIndexOf(" ");
		if (nLastSpace > 0) {
			this._sShortText = sShortText.substr(0, nLastSpace);
		} else {
			this._sShortText = sShortText;
		}
		return this._sShortText;
	};

	/**
	 * Opens popover with whole item's text
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @private
	 */
	TimelineItem.prototype._toggleTextExpanded = function (oEvent) {
		var that = this, //eslint-disable-line
			oLink = oEvent.getSource(),
			$link = oLink.$(),
			$text = this.$("realtext"),
			buttonHeight = $link.height(),
			topButton = $link.position().top,
			topText = $text.parent().position().top,
			$parent = $link.parent().prev(),
			$span, $dots,
			bNoAnimation = this.getParent() && this.getParent()._noAnimation,
			OFFSET = 8,
			fnIsDoubleSided = function () {
				return that.getParent() && that.getParent()._renderDblSided;
			},
			fnSetHeight = function (sValue, sAnimateValue, sLineClamp) {
				$parent.css("-webkit-line-clamp", sLineClamp + "px");

				// so far we don't support animation in doublesided mode
				if (fnIsDoubleSided() || bNoAnimation) {
					$parent.css("height", sValue + "px");
					that._callParentFn("_performUiChanges");
				} else {
					$parent.animate({
						height: sAnimateValue
					}, 250, that._callParentFn("_performUiChanges"));
				}
			};
		if (this._orientation === "V") {
			$dots = this.$("threeDots");
			$span = $parent.children().first();

			if (!this._expanded) {
				this._textProperties = {
					height: $parent.css("height"),
					clamp: $parent.css("-webkit-line-clamp"),
					text: $span.html()
				};

				// we have to show wrapper to full height, but also if there are restriction by charts
				// we need to set span full length and hide span dots.
				$parent.attr("expanded", true);
				$dots.hide();
				$span.html(this._encodeHTMLAndLineBreak(this.getText()));
				var sShowLessText = resBundle.getText("TIMELINE_TEXT_SHOW_LESS");
				oLink.setText(sShowLessText);
				// for some reason setText changes are not rendered to DOM by the Link control when inside Timeline
				oLink.rerender();


				fnSetHeight("", $span.height(), "");

			} else {
				$parent.attr("expanded", false);
				oLink.setText(this._sTextShowMore);
				// for some reason setText changes are not rendered to DOM by the Link control when inside Timeline
				oLink.rerender();
				$dots.show();
				$span.html(this._textProperties.text);

				fnSetHeight(this._textProperties.height, this._textProperties.height, this._textProperties.clamp);
			}

			that._expanded = !that._expanded;
		} else {
			// // if the button is at the bottom of the page, we want to enforce minimal height of the popup window
			var iDefaultOffset = topText - topButton - buttonHeight - OFFSET,
				iWindowButtonDiff = jQuery(window).height() - $link.offset().top,
				CORRECTIONMARGIN = 200;
			if (iWindowButtonDiff < CORRECTIONMARGIN) {
				iDefaultOffset -= (CORRECTIONMARGIN - iWindowButtonDiff);
			}

			this._objects.getFullText().setText(this.getText());
			this._objects.getFullTextPopover().setOffsetY(Math.floor(iDefaultOffset));
			this._objects.getFullTextPopover().openBy(this._objects.getExpandButton());
		}
	};

	/**
	 * Gets the link for expanding/collapsing the text
	 *
	 * @private
	 * @returns {sap.m.Link} The expand action
	 */
	TimelineItem.prototype._getButtonExpandCollapse = function () {
		var that = this; //eslint-disable-line
		this._objects.register("expandButton", function () {
			return new Link(that.getId() + "-fullTextBtn", {
				text: that._sTextShowMore,
				press: that._toggleTextExpanded.bind(that)
			});
		});

		return this._objects.getExpandButton();
	};

	/**
	 * Checks if the text is expandable: If maxCharacters is empty the default values are used, which are 300 characters (
	 * on mobile devices) and 500 characters ( on tablet and desktop). Otherwise maxCharacters is used as a limit. Based on
	 * this value, the text of the FeedListItem is collapsed once the text reaches this limit.
	 *
	 * @private
	 * @returns {boolean} Whether or not the text is expandable
	 */
	TimelineItem.prototype._checkTextIsExpandable = function () {
		this._nMaxCollapsedLength = this.getMaxCharacters();

		if (this._nMaxCollapsedLength === 0) {
			this._nMaxCollapsedLength = Device.system.phone ? this._nMaxCharactersMobile : this._nMaxCharactersDesktop;
		}

		return this.getText().length > this._nMaxCollapsedLength;
	};

	TimelineItem.prototype.onBeforeRendering = function () {
		var that = this; //eslint-disable-line

		//when odata update happens, only once?
		if (!this._list) {
			this._list = this.getReplyList();
		}

		if (this.getReplyCount() > 0) {
			this._objects.getReplyLink().setText(resBundle.getText("TIMELINE_REPLY") + " (" + this.getReplyCount() + ")");
		} else if (this._list && this._list.getItems().length > 0) {
			this._objects.getReplyLink().setText(resBundle.getText("TIMELINE_REPLY") + " (" + this._list.getItems().length + ")");
		}

		this._objects.getSocialBar().removeAllContent();
		if (this._callParentFn("getEnableSocial")) {
			this._objects.getSocialBar().addContent(this._objects.getReplyLink());
		}

		this._actionList = this.getCustomAction();

		function fnFireCustomActionClicked(oEvent, oData) {
			that.fireCustomActionClicked({
				"value": oData.value,
				"key": oData.key,
				"linkObj": this
			});
		}

		for (var i = 0; i < this._actionList.length; i++) {
			var key = this._actionList[i].getKey();
			var value = this._actionList[i].getValue();
			var actionLink = new Link({
				text: value
			});
			actionLink.addStyleClass("sapSuiteUiCommonsTimelineItemActionLink");
			actionLink.attachPress({"value": value, "key": key}, fnFireCustomActionClicked);

			this._objects.getSocialBar().addContent(actionLink);
		}
	};

	/**
	 * Encodes HTML and add '/n' replace to '<BR>'
	 * @private
	 * @param {string} sText Text to encode
	 * @returns {jQuery} Encoded HTML with linebreaks
	 */
	TimelineItem.prototype._encodeHTMLAndLineBreak = function (sText) {
		return encodeXML(sText).replace(/&#xa;/g, "<br>");
	};

	/**
	 * Creates avatar control for timeline item picture
	 * @returns {sap.m.Avatar} Avatar
	 * @private
	 */
	TimelineItem.prototype._getUserPictureControl = function () {
		var sId = this.getId() + "-userPictureControl",
			sUserPicture = this.getUserPicture(),
			sIconInitials = this.getIconInitials(),
			sDisplayShape = this.getIconDisplayShape(),
			sIconSize = this.getIconSize();

		if (!sUserPicture) {
			return null;
		}

		this._objects.register("userPictureControl", function () {
				var oAvatar = new Avatar({
					id: sId,
					src: sUserPicture,
					initials: sIconInitials,
					displayShape: sDisplayShape,
					displaySize: sIconSize,
					tooltip: resBundle.getText("TIMELINE_USER_PICTURE")
				});

			return oAvatar;
		});

		return this._objects.getUserPictureControl();
	};

	/**
	 * Creates clickable link for user name (if set)
	 * @returns {sap.m.Link} link
	 * @private
	 */
	TimelineItem.prototype._getUserNameLinkControl = function () {
		var that = this; //eslint-disable-line

		if (this.getUserNameClickable()) {
			this._objects.register("userNameLink", function () {
				var link = new Link(that.getId() + "-userNameLink", {
					text: that.getUserName(),
					//tooltip: that.getUserName(),
					press: function (oEvent) {
						that.fireUserNameClicked({uiElement: this});
					}
				});
				link.addStyleClass("sapUiSelectable");
				return link;
			});

			return this._objects.getUserNameLink();
		}
	};

	TimelineItem.prototype.onAfterRendering = function () {
		this._expanded = false;
		// calls this function to test whether the whole timeline should be recalculated
		// it may be usefull when one single item is invalidate after rendering is completed
		this._callParentFn("_itemRendered");
	};

	/**
	 * Register basic controls for item
	 * @private
	 */
	TimelineItem.prototype._registerControls = function () {
		var that = this; //eslint-disable-line
		this._objects.register("infoText", new Text(this.getId() + "-infoText", {
			maxLines: 1,
			width: "100%"
		}));

		this._objects.register("infoBar", new Toolbar(this.getId() + "-infoBar", {
			id: this.getId() + "-customMessageInfoBar",
			content: [this._objects.getInfoText()],
			design: ToolbarDesign.Info,
			visible: false
		}));

		this._objects.register("replyLink", function () {
			var link = new Link(that.getId() + "-replyLink", {
				text: resBundle.getText("TIMELINE_REPLY"),
				press: [that._openReplyDialog, that]
			});
			link.addStyleClass("sapSuiteUiCommonsTimelineItemActionLink");

			return link;
		});

		this._objects.register("socialBar", function () {
			var socialBar = new Toolbar(that.getId() + "-socialBar", {});
			socialBar.data("sap-ui-fastnavgroup", null);
			return socialBar;
		});

		this._objects.register("replyInputArea", new TextArea(this.getId() + "-replyInputArea", {
			height: "4rem",
			width: "100%"
		}));

		this._objects.register("replyPop", function () {
			return new Popover(that.getId() + "-replyPop", {
				initialFocus: that._objects.getReplyInputArea(),
				title: resBundle.getText("TIMELINE_REPLIES"),
				placement: PlacementType.Vertical,
				footer: new Toolbar({
					content: [//this._replyInput,
						new ToolbarSpacer(),
						new Button(that.getId() + "-replyButton", {
							text: resBundle.getText("TIMELINE_REPLY"),
							press: function () {
								that._replyPost();
								that._objects.getReplyPop().close();
							}
						})]
				}),
				contentHeight: "15rem",
				contentWidth: "20rem"
			});
		});
	};

	/**
	 * @private
	 */
	TimelineItem.prototype.exit = function () {
		this._objects.destroyAll();
	};

	/**
	 * Returns date time property without trying it parse if value is of type string.
	 * @returns {Date} Date property
	 */
	TimelineItem.prototype.getDateTimeWithoutStringParse = function () {
		var oDateTime = this.getProperty("dateTime");
		return DateUtils.parseDate(oDateTime, false) || "";
	};

	/* =========================================================== */
	/* Setters & getters*/
	/* =========================================================== */
	TimelineItem.prototype.setCustomReply = function (oReply) {
		if (oReply) {
			this._customReply = true;
			this.setAggregation("customReply", oReply, true);

		} else {
			this._customReply = false;
		}

		return this;
	};

	TimelineItem.prototype.setReplyList = function (replyList) {
		if (replyList === null) {
			return this;
		}
		//this method get called  implicitly when open popup, thus need to check if its null
		this.setAggregation("replyList", replyList, true);

		// after update need to reset the focus
		var that = this; //eslint-disable-line
		this.getReplyList().attachUpdateFinished(function (oEvent) {
			var oFocusRef = that._objects.getReplyInputArea().getDomRef("inner");
			if (oFocusRef) { //if popup already open , reset focus
				jQuery(oFocusRef.id).focus();
			}
		});

		return this;
	};

	TimelineItem.prototype.getDateTime = function () {
		var oDateTime = this.getProperty("dateTime");
		oDateTime = DateUtils.parseDate(oDateTime);
		// When logged in with local languages like 'ES' or 'CS' and dateTime property of timelineItem if uses standard formatter
		// "sap.ui.model.type.Date" with Style "long" the converted dates are in local language string format (ex : "12 de june de 2008" local lan-es).
		// and these converted dates are not parsed back to date object with "DateUtils.parseDate" and so grouping fails.
		//So for grouping to work we need to fetch actual dateTime value from binding context and it will be used for grouping.
		if (typeof (oDateTime) === "string" && this instanceof sap.suite.ui.commons.TimelineItem && this.getBinding("dateTime")) {
		  var oDateTimeActual = this.getBinding("dateTime").getValue();
		  if (oDateTimeActual instanceof Date) {
			return oDateTimeActual;
		  } else {
			return DateUtils.parseDate(oDateTimeActual);
		  }
		} else {
			return oDateTime;
		}
	};

	TimelineItem.prototype.onkeyup = function (oEvent) {
		if (oEvent.which == KeyCodes.ENTER || oEvent.which == KeyCodes.SPACE) {
			if (containsOrEquals(this.$("outline").get(0), oEvent.target)) {
				if (this._isGroupHeader) {
					this._performExpandCollapse(this._groupID);
				}
			}
		}
	};

	return TimelineItem;
});
