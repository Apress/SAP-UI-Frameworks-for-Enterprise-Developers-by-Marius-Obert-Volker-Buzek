// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Required init with {getGroups: functions}
sap.ui.define([
    "sap/base/util/extend",
    "sap/ui/core/Configuration",
    "sap/ui/core/Core",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Config"
], function (
    Extend,
    Configuration,
    Core,
    Device,
    jQuery,
    Config
) {
    "use strict";

    var CollisionModule = function (settings) {
        this.init(settings);
    };

    CollisionModule.prototype = {
        settings: null,
        tileWidth: 0,
        tileHeight: 0,
        tileMargin: 0,
        curTouchMatrixCords: null,
        tilesInRow: null,
        groupsList: null,
        item: null,
        matrix: null,
        tiles: null,
        collisionLeft: false,
        startGroup: null,
        currentGroup: null,
        endGroup: null,

        init: function (settings) {
            this.curTouchMatrixCords = { column: null, row: null };
            this.endGroup = null;
            this.groupSwitched = false;
            this.item = null;
            this.matrix = null;
            this.tiles = null;
            this.collisionLeft = false;
            this.startArea = null;
            this.currentArea = null;
            this.endArea = undefined;
            this.startGroup = null;
            this.draggedTileDomRef = null;
            this.sDragStartGroupModelId = undefined;
            this.sDragTargetGroupModelId = undefined;
            this.currentGroup = null;
            this.groupsList = null;
            this.allGroups = null;
            //setting contains thisLayout property
            this.settings = this.settings || settings;
            Extend(this, this.settings);
            this.tileWidth = this.thisLayout.styleInfo.tileWidth;
            this.tileHeight = this.thisLayout.styleInfo.tileHeight;
            this.tileMargin = this.thisLayout.styleInfo.tileMarginWidth;
            this.aExcludedControlClass = this.aExcludedControlClass || [];
            this.reorderElementsCallback = this.reorderElementsCallback || function () { };
            this.rightToLeft = Configuration.getRTL();
            this.tabBarArrowCollisionRight = false;
            this.tabBarArrowCollisionLeft = false;
            this.collidedLinkAreas = [];
            this.intersectedLink = null; // When we drag tile/link we can hover on tiles/links, in that case IntersectionItem is the tile/link we hover above
            this.aLinksBoundingRects = [];
            this.intersectedLinkPlaceHolder = undefined;
            this.isLinkPersonalizationSupported = this.thisLayout.oLaunchPageService ? this.thisLayout.oLaunchPageService.isLinkPersonalizationSupported() : null;
            this.isLinkMarkerShown = false;
            this.bIsTabBarCollision = false;
        },

        moveDraggable: function (moveX, moveY, aTabBarItemsLocation) {
            var oCollision = this.getCollisionObject(moveX, moveY, aTabBarItemsLocation);
            var bNeedsPlaceHolder;
            if (oCollision) {
                this._toggleAnchorItemHighlighting(false);
                if (oCollision.collidedObjectType !== "TabBar") {
                    // We are not in tab bar
                    this._toggleTabBarOverflowArrows(false);
                    this.thisLayout.setOnTabBarElement(false);
                    this._resetOverFlowButtonElements();
                    this.bIsTabBarCollision = false;
                } else {
                    this.bIsTabBarCollision = true;
                    this._toggleTabBarOverflowArrows(true);
                    this.removePlaceHolders();
                    this._handleTabBarCollision(moveX, aTabBarItemsLocation);
                }
                if (this.isLinkPersonalizationSupported && oCollision.collidedObjectType === "Group-link") {
                    bNeedsPlaceHolder = this._handleLinkAreaIntersection(oCollision.collidedObject, moveX, moveY);
                } else if (oCollision.collidedObjectType === "Group-tile") {
                    bNeedsPlaceHolder = this._handleTileAreaIntersection(oCollision.collidedObject, moveX, moveY);
                    this._toggleTileCloneHoverOpacity(false);
                }
                if (bNeedsPlaceHolder || this.endAreaChanged) { // we change the place holder according to intersection handlers or if the endArea has changes
                    this.handlePlaceHolder(oCollision.collidedObject);
                }
            } else {
                this._removeEmptyLinkAreaMark();
            }
        },

        _toggleAnchorItemHighlighting: function (bHighlightAnchorItem) {
            if (this.targetGroup) {
                this.targetGroup.classList.toggle("sapUshellAnchorItemDropCollision", bHighlightAnchorItem);
                this.targetGroup.firstElementChild.classList.toggle("sapUshellAnchorInnerMarker", bHighlightAnchorItem);
            }
        },

        removePlaceHolders: function () {
            this._removeLinkDropMarker();
            this._removeEmptyLinkAreaMark();
            this._handleChangedGroup(this.currentGroup);
        },

        handlePlaceHolder: function (oCollidedObject) {
            if (this.endArea === "tiles") {
                if (this.endAreaChanged) {
                    // Remove link placeholder and show tile placeholder
                    this._removeLinkDropMarker();
                }
                this.handlePlaceholderChange();
            } else if (this.endArea === "links" && this.intersectedLink) {
                this._changeLinkPlaceholder(this.intersectedLink, oCollidedObject);
                if (this.endAreaChanged) {
                    // Remove tile placeholder and show link placeholder
                    this.handlePlaceholderChange();
                }
            }
        },

        switchLinkWithClone: function (oItem) {
            if (oItem) {
                this.intersectedLinkPlaceHolder = oItem.getDomRef().cloneNode(true);
                this.intersectedLinkPlaceHolder.setAttribute("id", "sapUshellIntersectedLinkPlaceHolder");
                oItem.$().replaceWith(this.intersectedLinkPlaceHolder);
            }
        },

        _removeLinkDropMarker: function () {
            jQuery("#sapUshellLinkDropMarker").remove();
            this.isLinkMarkerShown = false;
        },

        saveLinkBoundingRects: function (elLink) {
            var oLink = Core.byId(elLink.getAttribute("id"));
            this.draggedLinkBoundingRects = oLink.getBoundingRects();
        },

        _getMarkerOffset: function (aRects, oContainer) {
            // The reason behind the numbers of left adjustment and right adjustment is that the total distance between links is 22px, but the division to left and right is like
            // that because the space taken by marker is not equal on the left and right side and this is in order to place the marker properly with the first link in a row.
            // For RTL the numbers are different because of the different offsets.
            var oFirstLineModeContainerBoundingClientRect = oContainer.getDomRef().getElementsByClassName("sapUshellLineModeContainer")[0].getBoundingClientRect();
            var nContainerLeftOffset = oFirstLineModeContainerBoundingClientRect.left;
            var nContainerTopOffset = oFirstLineModeContainerBoundingClientRect.top;
            var nRightAdjustment = this.rightToLeft ? 20 : -1;
            var nLeftAdjustment = this.rightToLeft ? 42 : 21;
            var right = aRects[aRects.length - 1].offset.x - nContainerLeftOffset + aRects[aRects.length - 1].width - nRightAdjustment;
            var left = aRects[this.rightToLeft ? aRects.length - 1 : 0].offset.x - nContainerLeftOffset - nLeftAdjustment;
            var topLeft = aRects[this.rightToLeft ? aRects.length - 1 : 0].offset.y - nContainerTopOffset;
            var topRight = aRects[this.rightToLeft ? 0 : aRects.length - 1].offset.y - nContainerTopOffset;

            if (document.body.classList.contains("sapUiSizeCompact")) {
                topLeft -= 6;
                topRight -= 6;
            }
            // When the link is first in a row, its position in RTL should be set to 0, so it will be close to the beginning of the first link
            // So we assume that if the left position value is less than 1 rem, the this link is positioned first.
            // For RTL - we check if the right offset position is less than 1 rem, and than set it to the right most position of the link
            if (this.rightToLeft) {
                if (oFirstLineModeContainerBoundingClientRect.right - aRects[aRects.length - 1].offset.x - aRects[aRects.length - 1].width < 16) {
                    right = right - 8;
                }
            } else if (left < 16) {
                left = 0;
            }
            return {
                right: right,
                left: left,
                topLeft: topLeft,
                topRight: topRight
            };
        },

        _changeLinkPlaceholder: function (oLink, oContainer) {
            var oCurrentLinkBoundingRect = this.aLinksBoundingRects[oLink.link.getId()];
            var left = oCurrentLinkBoundingRect.left;
            var topLeft = oCurrentLinkBoundingRect.topLeft;
            var topRight = oCurrentLinkBoundingRect.topRight;
            var right = oCurrentLinkBoundingRect.right;

            if (!oContainer.getDomRef().querySelector("#sapUshellLinkDropMarker")) {
                this._removeLinkDropMarker();
                var oInnerContainer = oContainer.getDomRef().getElementsByClassName("sapUshellLinksInnerContainer")[0];
                jQuery(oInnerContainer).prepend(this.LinkDropMarker);
            }
            this.LinkDropMarker.style.left = (oLink.leftSide ? left : right) + "px";
            this.LinkDropMarker.style.top = (oLink.leftSide ? topLeft : topRight) + "px";
            this.isLinkMarkerShown = true;
        },

        showTilePlaceholder: function (currentGroup, bTileChangedGroup, bTilesToLinks) {
            var tiles;
            var row = this.curTouchMatrixCords.row;
            var column = this.curTouchMatrixCords.column;
            this.domRef = this.item.getDomRef() ? this.item.getDomRef() : this.domRef;
            this.domRef.style.display = "";
            this.removeExcludedElementsFromMatrix(this.aExcludedControlClass);
            tiles = this.tiles || this.thisLayout.getGroupTiles(this.endGroup).slice(0);
            if (this.matrix[row] && typeof this.matrix[row][column] === "object") {
                this.handleMatrixCollision(tiles, currentGroup, bTileChangedGroup, bTilesToLinks);
                return;
            }
            this._handleMoveOutOfBorders(tiles, currentGroup);
        },

        removeTilePlaceholder: function () {
            this.domRef = this.item.getDomRef() || this.domRef;

            var currentHostTiles = this.thisLayout.getGroupTiles(this.currentGroup);
            currentHostTiles = currentHostTiles.slice(0);
            if (this.startArea !== "links" && currentHostTiles.indexOf(this.item) > -1) {
                currentHostTiles.splice(currentHostTiles.indexOf(this.item), 1);
            }
            if (!this.domRef.parentNode.contains("sapUshellLinksInnerContainer")) {
                this.domRef.style.display = "none";
            }

            this.thisLayout.initGroupDragMode(this.endGroup);
            var currentGroupMatrix = this.thisLayout.organizeGroup(currentHostTiles);
            this.thisLayout.renderLayoutGroup(this.currentGroup, currentGroupMatrix);
        },

        handlePlaceholderChange: function () {
            var currentGroup = this.currentGroup;
            var bTileChangedGroup = (this.endGroup !== this.currentGroup);
            var bTilesToLinks = this.endAreaChanged && this.endArea === "links";
            var bIsTabBarGroupSwitched = this.thisLayout.isTabBarActive() && this.groupSwitched;

            this.tiles = this.thisLayout.getGroupTiles(this.endGroup).slice(0);
            this.matrix = this.thisLayout.organizeGroup(this.tiles);

            if (bIsTabBarGroupSwitched) {
                this.handleTabBarSwitch(currentGroup);
            }

            if (bTileChangedGroup) {
                this._handleChangedGroup(currentGroup);
            } else if (bTilesToLinks) {
                this.removeTilePlaceholder();
            }

            if (!bTilesToLinks) {
                this.showTilePlaceholder(currentGroup, bTileChangedGroup, bTilesToLinks);
            }
        },

        handleMatrixCollision: function (tiles, currentGroup, bTileChangedGroup, bTilesToLinks) {
            var replacedTile = this.matrix[this.curTouchMatrixCords.row][this.curTouchMatrixCords.column];
            var replacedTileIndex = tiles.indexOf(replacedTile);
            var currentTileIndex = tiles.indexOf(this.item);

            if (this.rightToLeft) {
                this.collisionLeft = !this.collisionLeft;
            }
            // tiles are in the same group and the target tile is located after the tile you drag
            if (currentTileIndex > -1 && currentTileIndex < replacedTileIndex) {
                replacedTile = tiles[replacedTileIndex + 1];
            }
            if (replacedTile === this.item) {
                if (bTileChangedGroup || bTilesToLinks) {
                    tiles.splice(tiles.indexOf(this.item), 1);
                }
                this._handleTileReplace(tiles, currentGroup);
                return;
            }
            var newTilesOrder = this.changeTilesOrder(this.item, replacedTile, tiles, this.matrix);
            if (newTilesOrder && !this.isLinkMarkerShown) {
                this._handleTileReplace(newTilesOrder, currentGroup);
            }
        },

        handleTabBarSwitch: function (currentGroup) {
            // The DomRef of the dragged tile is appended to the DomRef of the target group
            this._appendTargetGroupDomRefWithDraggedTile();
            if (!this.item.getDomRef()) {
                this.endGroup.getInnerContainersDomRefs()[0].appendChild(this.draggedTileDomRef);
            } else {
                this.endGroup.getInnerContainersDomRefs()[0].appendChild(this.item.getDomRef());
            }
            this.currentGroup = this.endGroup;

            var currentTiles = this.thisLayout.getGroupTiles(currentGroup);
            this.thisLayout.initGroupDragMode(this.endGroup);
            var currentMatrix = this.thisLayout.organizeGroup(currentTiles);
            this.thisLayout.renderLayoutGroup(currentGroup, currentMatrix);
        },

        _handleMoveOutOfBorders: function (tiles, currentGroup) {
            var maxTile = this.findTileToPlaceAfter(this.matrix, tiles);
            if (tiles[maxTile + 1] == this.item) {
                return;
            }

            var replacedTile;
            if (tiles[maxTile + 1]) {
                replacedTile = tiles[maxTile + 1];
            } else if (this.currentGroup.getShowPlaceholder()) {
                replacedTile = tiles[0];
            }
            var newTilesOrder = this.changeTilesOrder(this.item, replacedTile, tiles, this.matrix);
            if (newTilesOrder) {
                this._handleTileReplace(newTilesOrder, currentGroup);
            }
        },

        _handleChangedGroup: function (currentGroup) {
            var currentHostTiles = this.thisLayout.getGroupTiles(this.currentGroup);
            if (this.currentGroup === this.startGroup && (this.startArea === "tiles" || this.intersectedLinkPlaceHolder)) {
                currentHostTiles = currentHostTiles.slice(0);
                if (currentHostTiles.indexOf(this.item) > -1) {
                    currentHostTiles.splice(currentHostTiles.indexOf(this.item), 1);
                }
            }

            if (this.startGroup === this.endGroup && this.startArea === "tiles") {
                this.tiles.splice(this.tiles.indexOf(this.item), 1);
            }
            var oItemDomRef = this.item.getDomRef() || this.domRef;
            if (this.startArea === "links" && !this.intersectedLinkPlaceHolder) {
                this.switchLinkWithClone(this.item);
            }
            if (this.endArea === "tiles") {
                this.endGroup.getInnerContainersDomRefs()[0].appendChild(oItemDomRef);
            }
            if (!oItemDomRef.parentNode.contains("sapUshellLinksInnerContainer")) {
                oItemDomRef.style.display = "none";
            }
            this.currentGroup = this.endGroup;

            this.thisLayout.initGroupDragMode(this.endGroup);
            var currentGroupMatrix = this.thisLayout.organizeGroup(currentHostTiles);
            this.thisLayout.renderLayoutGroup(currentGroup, currentGroupMatrix);
        },

        _handleTileReplace: function (tiles, currentGroup) {
            this.reorderElementsCallback({ currentGroup: currentGroup, endGroup: this.endGroup, tiles: tiles, item: this.item });
            this.reorderTilesView(tiles, this.endGroup);
            this.reorderTilesInDom();

            this.thisLayout.renderLayoutGroup(this.endGroup, this.matrix);
        },

        _getIntersectedLink: function (collidedGroup, moveX, moveY) {
            var elLink = document.getElementsByClassName("sapUshellLinkTile")[0];

            if (!elLink) {
                return;
            }
            var collidedGroupRect = collidedGroup.getDomRef().querySelector(".sapUshellLineModeContainer").getBoundingClientRect();
            var bCozyLayout = !document.body.classList.contains("sapUiSizeCompact");
                // the reason for devision in 31 is related to link height - which is 34, then each link overlaps with its neighbours by 3px
                // so the absolute height needed to calculate the intersected link is 31, with cozy layout the height is 48 (45 after reducing the overlap)
            var nRow = Math.floor((moveY - collidedGroupRect.top) / (bCozyLayout ? 45 : 31));
            var aCollidedLinkAreas = this.collidedLinkAreas[collidedGroup.getId()];
            var column;

            if (this.rightToLeft) {
                column = Math.floor((collidedGroupRect.right - moveX) / 20); //see _addLinkToHashMap to understand the devision in 20
            } else {
                column = Math.floor((moveX - collidedGroupRect.left) / 20);
            }

            if (nRow < aCollidedLinkAreas.length && aCollidedLinkAreas[nRow] && column < aCollidedLinkAreas[nRow].length) {
                return aCollidedLinkAreas[nRow][column];
            } else if (aCollidedLinkAreas.length) { // in edit mode we enable to drop to empty link area, this condition will prevent "index out of bounds exception" error
                // in case links area is not empty, but (moveX,MoveY) mouse position is in link area and not on link, we define the last link in line as intersected link
                var linksAreaRowLength = aCollidedLinkAreas.length;
                if (nRow >= linksAreaRowLength) {
                    nRow = linksAreaRowLength - 1;
                }
                if (!this.collidedLinkAreas[collidedGroup.getId()][nRow]) {
                    return;
                }
                column = this.collidedLinkAreas[collidedGroup.getId()][nRow].length;
                return this.collidedLinkAreas[collidedGroup.getId()][nRow][column - 1];
            }
        },

        _mapGroupLinks: function (collidedGroup) {
            // check if mapping of this group was already done
            var sGroupId = collidedGroup.getId();
            if (!this.collidedLinkAreas[sGroupId] || this.bElapseGroupLinksMap) {
                this.bElapseGroupLinksMap = false;
                var aLinks = collidedGroup.getLinks();
                var collidedLinksHashMap = [];
                var iLastLinkOffset;
                var aRects;
                var iRow = 0;
                this.collidedLinkAreas.push(collidedGroup.getId());
                aLinks.forEach(function (oItem) {
                    aRects = this._getLinkBoundingRects(oItem, collidedGroup);
                    aRects.forEach(function (oRect) {
                        if (oRect.offset.y > iLastLinkOffset) {
                            iRow++;
                        }
                        iLastLinkOffset = oRect.offset.y;
                        this._addLinkToHashMap(collidedLinksHashMap, collidedGroup, oRect, iRow, oItem);
                    }.bind(this));
                }.bind(this));
                this.collidedLinkAreas[sGroupId] = collidedLinksHashMap;
            }
        },

        _getLinkBoundingRects: function (oLink, collidedGroup) {
            var aRects = oLink.getBoundingRects();
            if (this.item && this.item.getId() === oLink.getId()) {
                aRects = this.draggedLinkBoundingRects;
            }
            if (aRects.length) {
                this.aLinksBoundingRects[oLink.getId()] = this._getMarkerOffset(aRects, collidedGroup);
            }
            return aRects;
        },

        _addLinkToHashMap: function (collidedLinksHashMap, collidedGroup, oRect, nRow, oLink) {
            if (!collidedLinksHashMap[nRow]) {
                collidedLinksHashMap[nRow] = [];
            }
            for (var i = 0; i <= (oRect.width + 20) / 20; i++) {
                // we duplicate the link in the matrix in order to be able to find it in O(1). We devide by 20 because thats the "space" between links
                var link = {
                    link: oLink,
                    leftSide: !this.rightToLeft
                };
                if (i > ((oRect.width + 20) / 20) / 2) {
                    link.leftSide = this.rightToLeft;
                }
                collidedLinksHashMap[nRow].push(link);
            }
        },

        _isLinkAreaIntersection: function (collidedGroup, moveX, moveY) {
            var innerContainerElement = collidedGroup.getInnerContainersDomRefs();
            // In case link area is empty of links it should not appear in normal mode.
            // Tile container will return empty links area domref only when it is in edit mode.
            // Otherwise, we should not check collisions on it.
            if (innerContainerElement[1]) {
                return this._isElementCollideByGivenCordinates(innerContainerElement[1], moveX, moveY);
            }
            return false;
        },

        _isLinksEquals: function (oLinkA, oLinkB) {
            if (!oLinkA || !oLinkB) {
                return false;
            }

            if (oLinkA.link.getId() !== oLinkB.link.getId()) {
                return false;
            }

            return oLinkA.link.leftSide === oLinkB.link.leftSide;
        },

        _toggleTileCloneHoverOpacity: function (bValue) {
            var aClonedTileElements = document.getElementsByClassName("sapUshellTile-clone");
            for (var i = 0; i < aClonedTileElements.length; ++i) {
                aClonedTileElements[i].classList.toggle("sapUshellTileDragOpacity", bValue);
            }
        },

        _handleLinkAreaIntersection: function (collidedGroup, moveX, moveY) {
            if (this.isLinkPersonalizationSupported) {
                this._toggleTileCloneHoverOpacity(true);
            }

            this._mapGroupLinks(collidedGroup);
            this.matrix = this.matrix || this.thisLayout.organizeGroup(this.thisLayout.getGroupTiles(collidedGroup));
            var intersectedLink = this._getIntersectedLink(collidedGroup, moveX, moveY);
            var bChangePlaceHolder = false;
            if (intersectedLink) {
                bChangePlaceHolder = this._isLinksEquals(this.intersectedLink, intersectedLink);
                this.intersectedLink = intersectedLink;
            } else {
                this.removeTilePlaceholder();
            }
            this._markEmptyLinkArea(collidedGroup);
            return bChangePlaceHolder;
        },

        _markEmptyLinkArea: function (collidedGroup) {
            if (!collidedGroup.getLinks().length) { // empty link area
                var oCollidedGroupDomRef = collidedGroup.getDomRef();
                if (oCollidedGroupDomRef) {
                    var aLineModeContainerElements = oCollidedGroupDomRef.getElementsByClassName("sapUshellLineModeContainer");
                    for (var i = 0; i < aLineModeContainerElements.length; ++i) {
                        aLineModeContainerElements[i].classList.add("sapUshellEmptyLinkAreaHover");
                    }
                }
            }
        },

        _removeEmptyLinkAreaMark: function () {
            var aLineModeContainerElements = document.getElementsByClassName("sapUshellLineModeContainer");
            for (var i = 0; i < aLineModeContainerElements.length; ++i) {
                aLineModeContainerElements[i].classList.remove("sapUshellEmptyLinkAreaHover");
            }
        },

        reorderTilesInDom: function () {
            var jsSelectedTile = this.item.getDomRef() ? this.item.getDomRef() : this.domRef;
            var iSelectedTileIndex = jQuery(jsSelectedTile).index();
            var jqSelectedTileGroup = jQuery(jsSelectedTile).closest(".sapUshellTilesContainer-sortable");
            var destTileIndex = this.calcDestIndexInGroup();
            var jqTargetGroup = jQuery(this.endGroup.getDomRef()).find(".sapUshellTilesContainer-sortable");
            var jqGroupTiles = jqTargetGroup.find(".sapUshellTile");

            if (this.startArea === "tiles") {
                // remove the dragged tile
                jqSelectedTileGroup.find(jqGroupTiles[iSelectedTileIndex]).remove();
            } else if (!this.intersectedLinkPlaceHolder) {
                this.switchLinkWithClone(this.item);
            }
            if (this.endArea !== "links") {
                jqGroupTiles = jqTargetGroup.find(".sapUshellTile");
                // add the dragged tile to the correct position
                jqTargetGroup[0].insertBefore(jsSelectedTile, jqGroupTiles[destTileIndex]);
            }
        },

        isLinkIntersected: function () {
            return this.intersectedLink !== undefined;
        },

        calcDestIndexInGroup: function () {
            var lastTileId;
            var tilesCount = 0;
            var i;
            var j;
            var bItemFound = false;

            for (i = 0; i < this.matrix.length && !bItemFound; i++) {
                for (j = 0; j < this.matrix[i].length; j++) {
                    if (this.matrix[i][j] !== undefined) {
                        if (this.item.sId !== this.matrix[i][j].sId) {
                            if (lastTileId !== this.matrix[i][j].sId) {
                                lastTileId = this.matrix[i][j].sId;
                                tilesCount++;
                            }
                        } else {
                            bItemFound = true;
                            break;
                        }
                    }
                }
            }

            return tilesCount;
        },

        layoutStartCallback: function (element) {
            this.init();
            this.item = Core.byId(element.getAttribute("id"));
            this.tilesInRow = this.thisLayout.getTilesInRow();
            this.groupsList = this.thisLayout.getGroups();
            this.allGroups = this.thisLayout.getAllGroups();
            this.startGroup = this.currentGroup = this.item.getParent();
            this.groupSwitched = false;
            this.startArea = this.isLinkPersonalizationSupported && this.item.getMode && this.item.getMode() === "LineMode" ? "links" : "tiles";
            this.currentArea = this.startArea;
            this.thisLayout.initDragMode();
            if (this.isLinkPersonalizationSupported) {
                this.LinkDropMarker = this._getLinkDropMarkerElement();
            }
        },

        _getLinkDropMarkerElement: function () {
            var elLinkDropMarker = document.createElement("DIV");
            var elMarkerDot = document.createElement("DIV");
            var elMarkerLine = document.createElement("DIV");

            elLinkDropMarker.setAttribute("id", "sapUshellLinkDropMarker");
            elMarkerDot.setAttribute("id", "sapUshellLinkDropMarkerDot");
            elMarkerLine.setAttribute("id", "sapUshellLinkDropMarkerLine");
            elLinkDropMarker.appendChild(elMarkerDot);
            elLinkDropMarker.appendChild(elMarkerLine);

            return elLinkDropMarker;
        },

        isAreaChanged: function () {
            return (this.currentArea && this.endArea) ? this.currentArea !== this.endArea : false;
        },

        isOriginalAreaChanged: function () {
            return (this.startArea && this.endArea) ? this.startArea !== this.endArea : false;
        },

        _getDestinationIndex: function (sType) {
            if (sType === "links") {
                if (this.intersectedLink) {
                    var intersectedLinkIndex = this.endGroup.getLinks().indexOf(this.intersectedLink.link);
                    var draggedItemIndex = this.endGroup.getLinks().indexOf(this.item);
                    if (this.intersectedLink.leftSide) {
                        intersectedLinkIndex = this.rightToLeft ? intersectedLinkIndex + 1 : intersectedLinkIndex - 1;
                    }
                    // In case draggedItemIndex > intersectedLinkIndex it means that we insert the dragged item after the intersected link, therefor we return intersectedLinkIndex++
                    // In case draggedItemIndex < 0 then it mean that we drag tile to link area - in that case we insert the dragged after the intersected link
                    // In other cases we don't increament intersectedLinkIndex because it is "already incremented" when the item is removed from the model
                    if (draggedItemIndex < 0 || draggedItemIndex > intersectedLinkIndex) {
                        intersectedLinkIndex = this.rightToLeft ? intersectedLinkIndex : intersectedLinkIndex + 1;
                    }
                    return intersectedLinkIndex;
                }
                // if this.intersectedLink is not defiend then we drop the item in link area in the last position
                return this.endGroup.getLinks().length;
            }
            return this._getDestinationTileIndex();
        },

        layoutEndCallback: function () {
            var response;
            var oSourceGroup;
            var oDestinationGroup;

            this._removeLinkDropMarker();
            if (this.endArea !== "links" && !this.tiles) {
                return { tile: this.item };
            }
            oSourceGroup = this._getDragSourceGroup();
            if (!Layout.isTabBarActive() || !this.bIsTabBarCollision) {
                this.targetGroup = "";
            }
            oDestinationGroup = this._getDestGroupObject(this.targetGroup);

            response = {
                srcGroup: oSourceGroup,
                dstGroup: oDestinationGroup,
                dstGroupData: this._getDropTargetGroup(),
                tile: this.item,
                dstTileIndex: this._getDestinationIndex(this.endArea),
                tileMovedFlag: true,
                srcArea: this.startArea,
                dstArea: this.bIsTabBarCollision ? undefined : this.endArea
            };
            return response;
        },

        _getDestGroupObject: function ($targetGroup) {
            return $targetGroup ? Core.byId(($targetGroup.getAttribute("id"))) : this.endGroup;
        },

        _getDragSourceGroup: function () {
            var oSourceGroup;

            oSourceGroup = this.startGroup;
            // TabBar use-case and the current group is not the one from which the tile was dragged
            if (this.thisLayout.isTabBarActive() && (this.groupSwitched === true)) {
                oSourceGroup = {
                    groupId: this.sDragStartGroupModelId
                };
            }

            return oSourceGroup;
        },

        /**
         * Returns the destination group of the drag&drop action.
         * There are two options:
         *   1. In case of TabBar mode, when the drop action was done on a tab (i.e. another group) -
         *      the the returned value is an object with only the destination group's model ID
         *      because destination group UI control does not exist
         *   2. In case of TabBar when the drop action was not done on a tab, or when it is not TabBar mode -
         *      then the returned value is destination group UI control
         */
        _getDropTargetGroup: function () {
            var oDestinationGroup;

            // TabBar use-case,  and the drop action was done on a tab
            if (this.thisLayout.isTabBarActive() && this.thisLayout.isOnTabBarElement()) {
                oDestinationGroup = { groupId: this.sDragTargetGroupModelId };
            } else {
                oDestinationGroup = this.endGroup;
            }
            return oDestinationGroup;
        },

        /**
         * Returns the index of the dropped tile in the destination group.
         * In case of TabBar mode, when the drop action was done on a tab (i.e. another group) -
         * then the tile should be places as the last tile in the destination group
         */
        _getDestinationTileIndex: function () {
            var sDestinationModelGroupId;
            var oModelGroup;

            if (this.thisLayout.isTabBarActive() && this.thisLayout.isOnTabBarElement()) {
                sDestinationModelGroupId = this._getDropTargetGroup().groupId;
                oModelGroup = this._getModelGroupById(sDestinationModelGroupId);
                return oModelGroup.tiles.length;
            }
            return this.tiles.indexOf(this.item);
        },

        compareArrays: function (a1, a2) {
            if (a1.length !== a2.length) {
                return false;
            }
            for (var i = 0; i < a1.length; i++) {
                if (a1[i] !== a2[i]) {
                    return false;
                }
            }
            return true;
        },

        reorderTilesView: function (tiles/*, group*/) {
            this.tiles = tiles;
            this.matrix = this.thisLayout.organizeGroup(tiles);
        },

        /**
         * @param item
         * @param replacedTile
         * @param tiles
         * @returns {*}
         */
        changeTilesOrder: function (item, replacedTile, tiles, matrix) {
            var newTiles = tiles.slice(0);
            var deletedItemIndex = newTiles.indexOf(item);
            var newMatrix;
            var cords;
            var newCords;

            if (deletedItemIndex > -1) {
                newTiles.splice(deletedItemIndex, 1);
            }
            if (replacedTile) {
                newTiles.splice(newTiles.indexOf(replacedTile), 0, this.item);
            } else {
                newTiles.push(item);
            }
            if (this.currentGroup == this.endGroup) {
                if (this.compareArrays(tiles, newTiles)) {
                    return false;
                }
                newMatrix = this.thisLayout.organizeGroup(newTiles);
                cords = this.thisLayout.getTilePositionInMatrix(item, matrix);
                newCords = this.thisLayout.getTilePositionInMatrix(item, newMatrix);
                if ((cords.row == newCords.row) && (cords.col == newCords.col)) {
                    return false;
                }
            }
            this.tiles = newTiles;
            this.currentGroup = this.endGroup;
            return newTiles;
        },

        setMatrix: function (newMatrix) {
            this.matrix = newMatrix;
        },

        findTileToPlaceAfter: function (curMatrix, tiles) {
            var x = (this.thisLayout.rightToLeft) ? 0 : this.curTouchMatrixCords.column;
            var iIncrease = (this.thisLayout.rightToLeft) ? 1 : -1;
            var maxTile = 0;
            var i;
            var j;
            var tileIndex;
            var rowLength = curMatrix[0].length;

            for (i = this.curTouchMatrixCords.row; i >= 0; i--) {
                for (j = x; j >= 0 && j < rowLength; j += iIncrease) {
                    if (!curMatrix[i] || typeof curMatrix[i][j] !== "object") {
                        continue;
                    }
                    tileIndex = tiles.indexOf(curMatrix[i][j]);
                    maxTile = tileIndex > maxTile ? tileIndex : maxTile;
                }
                x = curMatrix[0].length - 1;
            }

            return maxTile || (tiles.length - 1);
        },

        /**
         * Checks if the element collides with another element.
         *
         * If a group is empty, the TileContainer has no height, and thus no overlap is ever found.
         * To avoid this, we look for the height of the parent node in case a group is empty (the parent node has a height).
         * We also check that the element isn't an empty link container, as returning an overlap to it would lead to a bug.
         *
         * @param element The element that is being dragged
         * @param moveX The X coordinate of the element's current position
         * @param moveY The Y coordinate of the element's current position
         * @returns {boolean}
         * @private
         */
        _isElementCollideByGivenCordinates: function (element, moveX, moveY) {
            var tilesRect = element.getBoundingClientRect();
            var isHorizontalIntersection = false;
            var isVerticalIntersection = false;

            if (tilesRect.height === 0 && !element.classList.contains("sapUshellNoLinksAreaPresent")) {
                tilesRect = element.parentNode.getBoundingClientRect();
            }
            isHorizontalIntersection = tilesRect.right >= moveX && tilesRect.left <= moveX;
            isVerticalIntersection = tilesRect.bottom >= moveY && tilesRect.top <= moveY;

            return isHorizontalIntersection && isVerticalIntersection;
        },

        //Returns the collided tile element position in this.matrix
        _getMatrixCordinatesOfTouchedTile: function (collidedGroup, moveX, moveY) {
            var curTouchMatrixCords = Extend({}, this.curTouchMatrixCords);
            var tilesRect = collidedGroup.getInnerContainersDomRefs()[0].getBoundingClientRect();

            this.matrix = this.matrix || this.thisLayout.organizeGroup(this.thisLayout.getGroupTiles(collidedGroup));
            var offset = this.rightToLeft ? (tilesRect.right + (-1) * moveX) : (tilesRect.left * (-1) + moveX);
            var matrixTouchY = (tilesRect.top * (-1) + moveY) / (this.tileHeight + this.tileMargin);
            var matrixTouchX = offset / (this.tileWidth + this.tileMargin);

            curTouchMatrixCords = {
                row: Math.floor(matrixTouchY),
                column: Math.floor(matrixTouchX)
            };

            return curTouchMatrixCords;
        },

        _getCollidedGroup: function (moveX, moveY) {
            for (var i = 0; i < this.groupsList.length; i++) {
                var oGroup = this.groupsList[i];
                var innerContainerElements = oGroup.getInnerContainersDomRefs();

                if (!innerContainerElements) {
                    continue;
                }

                for (var j = 0; j < innerContainerElements.length; j++) { // innerContainerElement[0]: intersect in tile area, innerContainerElement[1]: intersect in link area
                    if (innerContainerElements[j] && this._isElementCollideByGivenCordinates(innerContainerElements[j], moveX, moveY)) {
                        /*
                         * Collapse the empty groups with no overlap to the dragged tile.
                         * Once the group(s) are collapsed, all the groups underneath will be scrolled up.
                         * While this is fine in general, it might be problematic if we are collapsing an empty group in a series if empty groups:
                         * the empty groups are quite thin and we would move the focus away from the group the user is hovering over.
                         * To avoid this, we only collapse groups if the user is hovering a non-empty group.
                         */
                        var bCurrentGroupHasNoTiles = !oGroup.groupHasTiles();
                        for (var idx = this.groupsList.length - 1; idx >= i; idx--) {
                            if (bCurrentGroupHasNoTiles) { // we always collapse groups underneath the current one, as this is fine.
                                break;
                            }
                            if (!this.groupsList[idx].groupHasTiles()) {
                                var oLastGroupExpanded = this.groupsList[idx].getDomRef();

                                if (!oLastGroupExpanded || !oLastGroupExpanded.classList.contains("sapUshellInDragMode")) {
                                    continue;
                                }

                                var aInnerElements = oLastGroupExpanded.getElementsByClassName("sapUshellInner");
                                for (var k = 0; k < aInnerElements.length; k++) {
                                    aInnerElements[k].removeAttribute("style");
                                }
                            }
                        }
                        return oGroup;
                    }
                }
            }
        },

        // if return value is false it means that no  change has been done
        _handleTileAreaIntersection: function (collidedGroup, moveX, moveY) {
            var curTouchMatrixCords = this._getMatrixCordinatesOfTouchedTile(collidedGroup, moveX, moveY);

            // if place of the tile is the same place as it was, nothing need to be done
            if ((collidedGroup === this.endGroup) &&
                (curTouchMatrixCords.column === this.curTouchMatrixCords.column) &&
                (curTouchMatrixCords.row === this.curTouchMatrixCords.row)) {
                return false;
            }

            if (this.rightToLeft) {
                this.collisionLeft = (this.curTouchMatrixCords.column - curTouchMatrixCords.column) > 0;
            } else {
                this.collisionLeft = (curTouchMatrixCords.column - this.curTouchMatrixCords.column) > 0;
            }
            if (curTouchMatrixCords.column === this.curTouchMatrixCords.column) {
                this.collisionLeft = false;
            }

            Extend(this.curTouchMatrixCords, curTouchMatrixCords);
            return true;
        },

        _getGroupCollisionObject: function (moveX, moveY) {
            var collidedGroup;
            var bLinkAreaIntersection;
            collidedGroup = this._getCollidedGroup(moveX, moveY);
            if (!collidedGroup || collidedGroup.getIsGroupLocked()) {
                return undefined;
            }
            bLinkAreaIntersection = this._isLinkAreaIntersection(collidedGroup, moveX, moveY);
            this.endGroup = collidedGroup;
            if (!this.tiles) {
                this.tiles = this.thisLayout.getGroupTiles(this.endGroup).slice(0);
            }
            this.endArea = bLinkAreaIntersection ? "links" : "tiles";
            this.endAreaChanged = this.isAreaChanged();
            this.currentArea = this.endArea;
            return {
                collidedObjectType: bLinkAreaIntersection ? "Group-link" : "Group-tile",
                collidedObject: collidedGroup
            };
        },

        /**
         * @param {number} moveX
         * @param {number} moveY
         * @param {string} collidedObjectType: One of the following strings "Group", "TabBar"
         * @returns {{
         *     collidedObjectType: String,
         *     collidedObject: Object
         *   }} A collision object
         */
        getCollisionObject: function (moveX, moveY) {
            // If TabBar collision timer is on (counting 800ms of long drop)- then it should be cleared since the dragged object was just moved
            if (this.thisLayout.oTabBarItemClickTimer) {
                clearTimeout(this.thisLayout.oTabBarItemClickTimer);
            }

            if (this.thisLayout.isTabBarActive() && this._isTabBarCollision(moveY)) {
                return { collidedObjectType: "TabBar" };
            }
            return this._getGroupCollisionObject(moveX, moveY);
        },

        _isTabBarScrollArea: function (moveY) {
            var iAnchorBarHeight = jQuery("#anchorNavigationBar").height() || 0;
            var oAnchorBarOffset = jQuery("#anchorNavigationBar").offset();
            var iAnchorBarOffsetTop = oAnchorBarOffset ? oAnchorBarOffset.top : 0;
            var iY = iAnchorBarHeight + iAnchorBarOffsetTop;

            return iAnchorBarHeight > 0 && (moveY > iY) && (moveY < iY + 30);
        },

        _cancelLongDropTimmer: function () {
            clearTimeout(this.thisLayout.oTabBarItemClickTimer);
        },

        _isTabBarCollision: function (moveY) {
            var iAnchorBarHeight = jQuery("#anchorNavigationBar").height() || 0;
            var oAnchorBarOffset = jQuery("#anchorNavigationBar").offset();
            var iAnchorBarOffsetTop = oAnchorBarOffset ? oAnchorBarOffset.top : 0;

            return (moveY < iAnchorBarHeight + iAnchorBarOffsetTop && moveY > iAnchorBarOffsetTop);
        },

        /**
         * Handling TabBar use-case when the dragged tile (actually - the cursor) is on a TabBar item.
         * Steps:
         *   1. Get the relevant TabBar item on which the cursor is
         *   2. Check if the cursor on the horizontal overflow arrow, and if so - handle TabBar horizontal scrolling
         *   3. Find the index of the tab/group on which the cursor is
         *   4. Maintain the identity of the current group model id, for the case when a long-drop will switch the groups
         *   5. Measure 800ms in order to identify long-drop use-case
         */
        _handleTabBarCollision: function (moveX, aTabBarItemsLocation) {
            var oHighlightedTabItem = this._getTabBarHoverItem(moveX, aTabBarItemsLocation);

            // In TabBar, the dragged tile (clone) appears with opacity
            if (Layout.isTabBarActive()) {
                this._toggleTileCloneHoverOpacity(true);
            }
            this.lastHighlitedTabItem = oHighlightedTabItem;
            this.thisLayout.setOnTabBarElement(true);
            // In case that the tile is dragged onto the overflow arrow of the TabBar
            var isOverflowCollision = this._handleOverflowCollision(moveX);
            if (isOverflowCollision) {
                return;
            }

            // If no Tab was detected (i.e. a Tile is dragged to the height of the TabBar, but not on a specific tab)
            if (!oHighlightedTabItem) {
                return;
            }

            // The index of the target group in the model is calculated, since this is the way to identify the target group.
            // In TabBar mode there is no other group (UI5 control) then the current one
            this.targetGroup = oHighlightedTabItem;
            this.sDragTargetGroupModelId = oHighlightedTabItem.getAttribute("modelGroupId");
            var iTargetGroupIndex = this._getTabBarGroupIndexByModelId(this.sDragTargetGroupModelId);
            // The timer that counts 800ms is cleared, since the cursor was moved
            if (this.thisLayout.oTabBarItemClickTimer) {
                clearTimeout(this.thisLayout.oTabBarItemClickTimer);
            }
            var oDropTargetGroupModel = this._getModelGroupById(this._getDropTargetGroup().groupId);
            if (oDropTargetGroupModel.isGroupLocked) {
                this._toggleTabBarOverflowArrows(false);
                this.thisLayout.setOnTabBarElement(false);
                this._resetOverFlowButtonElements();

                return;
            }
            this._toggleAnchorItemHighlighting(true);
            // The model ID of the current (source) group is maintained for the use-case of long-drag.
            // After 800ms - the Tabs/groups are switched, and we need a way to "remember" the group from which the tile was dragged
            if (!this.sDragStartGroupModelId) {
                this.sDragStartGroupModelId = this.startGroup.getGroupId();
            }
            // Start counting 800ms in order to identify long-drag use-case
            this.thisLayout.oTabBarItemClickTimer = setTimeout(function () {
                var currentTabBarItem = this._getSelectedTabBarItem();
                if (this.lastHighlitedTabItem === currentTabBarItem) {
                    return;
                }
                // Long-drag use-case
                this.draggedTileModelPath = this.item.getBindingContext().getPath();
                this._prepareDomForDragAndDrop();
                // Remove the dragged tile from the source group before switching to the target group
                this.startGroup.removeAggregation("tiles", this.item, true);
                var bDraggedBackToSourceGroup = this.sDragStartGroupModelId === this.sDragTargetGroupModelId;
                this.item.getBindingContext().oModel.setProperty(this.draggedTileModelPath + "/draggedInTabBarToSourceGroup", bDraggedBackToSourceGroup);
                this.groupSwitched = true;
                // Triggering the flow of TabBar item press
                Core.getEventBus().publish("launchpad", "switchTabBarItem", { iGroupIndex: iTargetGroupIndex });
                var aThisGroups = this.thisLayout.getGroups();
                this.endGroup = aThisGroups[0];
                this.bElapseGroupLinksMap = true;
            }.bind(this), 800);

            if ((this.tiles === null) && (this.endGroup)) {
                this.tiles = this.thisLayout.getGroupTiles(this.endGroup).slice(0);
            }
            // The TabBar item that is currently touched by the cursor should be highlighted
            var aHoveredTabBarItems = document.getElementsByClassName("sapUshellTabBarHoverOn");
            for (var i = aHoveredTabBarItems.length - 1; i >= 0; --i) {
                aHoveredTabBarItems[i].classList.remove("sapUshellTabBarHoverOn");
            }
            oHighlightedTabItem.classList.add("sapUshellTabBarHoverOn");

            return true;
        },

        _prepareDomForDragAndDrop: function () {
            var oItemDomRef = this.item.getDomRef();
            if (Device.system.tablet) {
                var oClonedDomRef = oItemDomRef.cloneNode(true);
                var oParentElement = oItemDomRef.parentNode;
                this.origItemId = oItemDomRef.getAttribute("id");
                this.origItemDataSapUi = oItemDomRef.getAttribute("data-sap-ui");
                oItemDomRef.removeAttribute("id");
                oItemDomRef.removeAttribute("data-sap-ui");
                oItemDomRef.style.display = "none";
                oClonedDomRef.style.display = "none";
                var oDashBoardGroups = document.getElementById("dashboardGroups");
                oDashBoardGroups.parentNode.appendChild(oItemDomRef);
                oParentElement.appendChild(oClonedDomRef);
                this.draggedTileDomRef = oItemDomRef;
            } else if (!this.draggedTileDomRef) {
                // The dragged tile control will be destroyed as soon as the switch to the target group occurs
                // so in order to have the placeholder appear in the target group - we maintain the tile's DomRef
                this.draggedTileDomRef = oItemDomRef;
            }
        },

        _appendTargetGroupDomRefWithDraggedTile: function () {
            var oEndGroupInnerDomRef = this.endGroup.getInnerContainerDomRefs() ? this.endGroup.getInnerContainerDomRefs()[0] : null;
            if (!this.item.getDomRef()) {
                if (Device.system.tablet) {
                    this.draggedTileDomRef.setAttribute("id", this.origItemId);
                    this.draggedTileDomRef.setAttribute("data-sap-ui", this.origItemDataSapUi);
                    this.draggedTileDomRef.style.display = "";
                }
                if (oEndGroupInnerDomRef) {
                    oEndGroupInnerDomRef.appendChild(this.draggedTileDomRef);
                }
            } else {
                if (oEndGroupInnerDomRef) {
                    oEndGroupInnerDomRef.appendChild(this.item.getDomRef());
                }
                if (Device.system.tablet) {
                    this.item.getDomRef().style.display = "";
                }
            }
        },

        _getSelectedTabBarItem: function () {
            return document.getElementsByClassName("sapUshellAnchorItemSelected")[0];
        },

        _getTabBarGroupIndexByModelId: function (sGroupModelId) {
            var sTempGroupModelId;

            for (var index = 0; index < this.allGroups.length; ++index) {
                sTempGroupModelId = this.allGroups[index].groupId;
                if (sGroupModelId === sTempGroupModelId) {
                    return index;
                }
            }
        },

        _getModelGroupById: function (sGroupModelId) {
            var aModelGroups = this.thisLayout.getAllGroups();
            var oTempModelGroup;
            var sTempModelGroupId;

            for (var index = 0; index < aModelGroups.length; ++index) {
                oTempModelGroup = aModelGroups[index];
                sTempModelGroupId = oTempModelGroup.groupId;
                if (sTempModelGroupId === sGroupModelId) {
                    return oTempModelGroup;
                }
            }
        },

        _handleOverflowCollision: function (moveX) {
            var oAnchor = Core.byId("anchorNavigationBar");
            var sOverflowSide = this._calculateOverflowButtonSideCollision(moveX);

            // Right overflow
            if (sOverflowSide == "right") {
                // Only if we didn't stay on the left overflow button
                if (!this.tabBarArrowCollisionRight) {
                    oAnchor._scrollToGroupByGroupIndex(oAnchor.anchorItems.length - 1, 5000);
                    this.tabBarArrowCollisionRight = true;
                }
                return true;
            } else if (sOverflowSide == "left") { //Left Overflow
                // Only if we didn't stay on the left overflow button
                if (!this.tabBarArrowCollisionLeft) {
                    oAnchor._scrollToGroupByGroupIndex(0, 5000);
                    this.tabBarArrowCollisionLeft = true;
                }
                return true;
            } // We are not on any overflow button but still on tab bar
            this._resetOverFlowButtonElements();
            return false;
        },

        _calculateOverflowButtonSideCollision: function (moveX) {
            var anchorRightOverflowArrow = jQuery(".sapUshellAnchorRightOverFlowButton");
            var anchorRightOverflowArrowLeftOffset = anchorRightOverflowArrow.offset().left;
            var anchorItemOverFlow = jQuery(".sapUshellAnchorItemOverFlow");
            var anchorItemOverFlowOffset = anchorItemOverFlow.offset().left;
            var anchorLeftOverflowArrow = jQuery(".sapUshellAnchorLeftOverFlowButton");
            var anchorLeftOverflowArrowLeftOffset = anchorLeftOverflowArrow.offset().left;
            var anchorOverflowArrowLeftWidth = 32;
            var jqAnchor = jQuery("#anchorNavigationBar");
            var anchorBarOffsetLeft = jqAnchor.offset().left;

            if (moveX > anchorRightOverflowArrowLeftOffset && moveX < anchorItemOverFlowOffset) {
                return "right";
            }
            if (moveX > anchorBarOffsetLeft && (moveX < anchorLeftOverflowArrowLeftOffset + anchorOverflowArrowLeftWidth)) {
                return "left";
            }
        },

        _resetOverFlowButtonElements: function () {
            var bTablet = Device.system.tablet;
            var anchorBar = jQuery(bTablet ? ".sapUshellAnchorNavigationBarItemsScroll" : ".sapUshellAnchorNavigationBarItems");

            anchorBar.stop();
            this.tabBarArrowCollisionRight = false;
            this.tabBarArrowCollisionLeft = false;
        },

        _toggleTabBarOverflowArrows: function (bShow) {
            var anchorRightOverflowArrow = document.getElementsByClassName("sapUshellAnchorRightOverFlowButton");
            var anchorLeftOverflowArrow = document.getElementsByClassName("sapUshellAnchorLeftOverFlowButton");

            for (var i = 0; i < anchorRightOverflowArrow.length; ++i) {
                anchorRightOverflowArrow[i].classList.toggle("sapUshellTabBarOverflowButton", bShow);
            }
            for (var j = 0; j < anchorLeftOverflowArrow.length; ++j) {
                anchorLeftOverflowArrow[j].classList.toggle("sapUshellTabBarOverflowButton", bShow);
            }
        },

        _getTabBarHoverItem: function (moveX, aTabBarItemsLocation) {
            var iLeftTabBarOffset = jQuery(".sapUshellAnchorItem:not(.sapUshellShellHidden)").eq(0).offset().left;
            if (moveX - iLeftTabBarOffset <= 0) {
                return;
            }
            var iNumOfBasicUnits = Math.round((moveX - iLeftTabBarOffset) / 10);
            if (iNumOfBasicUnits >= aTabBarItemsLocation.length) {
                iNumOfBasicUnits = aTabBarItemsLocation.length - 1;
            }
            var oHighlightedTabItemIndexInBar = aTabBarItemsLocation[iNumOfBasicUnits];
            var aTabBarItems = document.getElementsByClassName("sapUshellAnchorItem");

            return aTabBarItems[oHighlightedTabItemIndexInBar];
        },

        // remove excluded controls which define in this.aExcludedControlClass from the matrix in order to exclude those controls from reordering
        removeExcludedElementsFromMatrix: function (aExcludedControlClass) {
            if (!aExcludedControlClass.length) {
                return;
            }
            if (!this.matrix) {
                return;
            }
            var newMatrix = this.matrix.map(function (row) {
                return row.map(function (item) {
                    var isRemoveRequired = aExcludedControlClass.some(function (controlClass) {
                        return item instanceof controlClass;
                    });
                    return (isRemoveRequired) ? undefined : item;
                });
            });

            this.setMatrix(newMatrix);
        },

        setExcludedControl: function (controlClass) {
            if (controlClass) {
                this.aExcludedControlClass.push(controlClass);
            }
        },

        // Callback to be executed before change views after collision detection
        setReorderTilesCallback: function (func) {
            if (typeof func === "function") {
                this.reorderElementsCallback = func;
            }
        }
    };

    var LayoutConstructor = function () { };
    LayoutConstructor.prototype = {
        _initDeferred: jQuery.Deferred(),
        init: function (cfg) {
            // in some devices this code runs before css filed were loaded and we don't get the correct styleInfo object
            var timeoutLayoutInfo = function () {
                var sContainerId = (this.container && this.container.getAttribute("id")) || "";
                if (sContainerId.includes("destroyed")) {
                    return; // container was already destroyed
                }
                var styleInfo = this.getStyleInfo(this.container);
                if (styleInfo.tileWidth > 0) {
                    this.isInited = true;
                    this.reRenderGroupsLayout();
                    this.layoutEngine = new CollisionModule({
                        thisLayout: this
                    });
                    this._initDeferred.resolve();
                    return;
                }
                setTimeout(timeoutLayoutInfo, 100);
            }.bind(this);

            this.cfg = cfg || this.cfg;
            this.minTilesinRow = 2;
            this.container = this.cfg.container || document.getElementById("dashboardGroups");
            this.oTabBarItemClickTimer = new Date();
            this.bTabBarModeActive = false;
            this.bOnTabBarElement = false;
            if (sap.ushell.Container) {
                sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                    this.oLaunchPageService = oLaunchPageService;
                    timeoutLayoutInfo();
                }.bind(this));
            } else {
                timeoutLayoutInfo();
            }
            Core.getEventBus().subscribe("launchpad", "tabBarChange", this._onTabBarChange, this);
            return this.getInitPromise();
        },

        setOnTabBarElement: function (bOnTabBarElement) {
            this.bOnTabBarElement = bOnTabBarElement;
        },

        isOnTabBarElement: function () {
            return this.bOnTabBarElement;
        },

        _onTabBarChange: function (sChannelId, sEventId, oData) {
            if (oData === "tabs") {
                this.bTabBarModeActive = true;
            } else {
                this.bTabBarModeActive = false;
            }
        },

        tabBarTileDropped: function () {
            if (this.oTabBarItemClickTimer) {
                clearTimeout(this.oTabBarItemClickTimer);
            }
        },

        getInitPromise: function () {
            return this._initDeferred.promise();
        },

        getLayoutEngine: function () {
            return this.layoutEngine;
        },

        getStyleInfo: function (container) {
            var tile = document.createElement("div");
            var containerId = container.getAttribute("id");
            container = containerId ? document.getElementById(containerId) : container;
            tile.className = "sapUshellTile";

            var sizeBehavior = Config.last("/core/home/sizeBehavior");
            if (sizeBehavior === "Small") {
                tile.classList.add("sapUshellSmall");
            }

            tile.style.position = "absolute";
            tile.style.visibility = "hidden";
            container.appendChild(tile);
            var tileStyle = window.getComputedStyle(tile);
            var containerStyle = window.getComputedStyle(container);
            var info = {
                tileMarginHeight: parseFloat(tileStyle.marginBottom, 10) + parseFloat(tileStyle.marginTop, 10),
                tileMarginWidth: parseFloat(tileStyle.marginLeft, 10) + parseFloat(tileStyle.marginRight, 10),
                tileWidth: tile.offsetWidth,
                tileHeight: tile.offsetHeight,
                containerWidth: (containerStyle.width ? parseInt(containerStyle.width, 10) : container.offsetWidth)
            };
            container.removeChild(tile);

            return info;
        },

        getGroups: function () {
            return this.cfg.getGroups();
        },

        getAllGroups: function () {
            return this.cfg.getAllGroups ? this.cfg.getAllGroups() : [];
        },

        isTabBarActive: function () {
            return this.cfg.isTabBarActive ? this.cfg.isTabBarActive() : false;
        },

        getTilesInRow: function (/*bIslink*/) {
            return this.tilesInRow;
        },

        setTilesInRow: function (tilesInRow) {
            this.tilesInRow = tilesInRow;
        },

        /*
         * Returns an {x,y} object of  coordinates for placing the tile
         * Returns false if the space is taken by another tile already
         */
        checkPlaceForTile: function (tile, matrix, place, lastRow, bIsLinkTiles) {
            if (typeof matrix[place.y] === "undefined") {
                matrix.push(new Array(matrix[0].length));
            }
            if (typeof matrix[place.y + 1] === "undefined") {
                matrix.push(new Array(matrix[0].length));
            }
            if (typeof matrix[place.y][place.x] !== "undefined") {
                return false;
            }
            var p = Extend({}, place);
            if (bIsLinkTiles || (tile && tile.getLong && !tile.getLong())) {
                return [p];
            }
            var cords = [p];
            if (tile && tile.getLong && tile.getLong()) {
                if ((place.x + 1) >= matrix[0].length || (typeof matrix[p.y][p.x + 1] !== "undefined")) {
                    return false;
                }
                cords.push({ y: p.y, x: p.x + 1 });
            }
            return cords;
        },

        /**
         * @param tile
         * @param matrix
         * @param cords
         * Places the given tile in the given coordinates in matrix
         */
        placeTile: function (tile, matrix, cords) {
            for (var i = 0; i < cords.length; i++) {
                matrix[cords[i].y][cords[i].x] = tile;
            }
        },

        getTilePositionInMatrix: function (tile, matrix) {
            for (var iRow = 0; iRow < matrix.length; iRow++) {
                for (var iCol = 0; iCol < matrix[iRow].length; iCol++) {
                    if (matrix[iRow][iCol] === tile) {
                        return { row: iRow, col: iCol };
                    }
                }
            }
            return false;
        },

        /**
         * @param matrix
         * @param tiles
         * @param startRow
         * @param endRow
         * @returns {number}
         * Fills the given matrix row with tiles.
         */
        fillRowsInLine: function (matrix, tiles, row, bIsLinkTiles) {
            if (!tiles.length) {
                return 0;
            }
            var cords;
            for (var j = 0; j < matrix[0].length && tiles.length; j++) {
                cords = this.checkPlaceForTile(tiles[0], matrix, { x: j, y: row }, bIsLinkTiles);
                if (cords) {
                    this.placeTile(tiles[0], matrix, cords);
                    tiles.shift();
                }
            }
        },

        /**
         * @param tiles
         * @param containerInfo
         * @returns {Array}
         *
         * Organizes tiles from array to matrix by filing fixed length rows tile-by-tile
         * Returnes the new matrix
         */
        organizeGroup: function (tiles, bIsLinkTiles) {
            //copy of tilesCopy array
            var tilesCopy = tiles.slice(0);
            var tilesMatrix = [];
            var currentRow = 0;
            tilesMatrix.push(new Array(bIsLinkTiles ? Math.floor(this.tilesInRow / 2) : this.tilesInRow));

            while (tilesCopy.length) {
                this.fillRowsInLine(tilesMatrix, tilesCopy, currentRow, bIsLinkTiles); //to do: get the declaration outside
                currentRow++;
            }
            if (this.rightToLeft) {
                for (var i = 0; i < tilesMatrix.length; i++) {
                    tilesMatrix[i].reverse();
                }
            }
            tilesMatrix = this.cleanRows(tilesMatrix);
            return tilesMatrix;
        },

        /* If there is a row with no tiles - it is removed from the matrix */
        cleanRows: function (tilesMatrix) {
            var doneChecking = false;

            for (var row = tilesMatrix.length - 1; row > 0 && !doneChecking; row--) {
                for (var col = 0; col < tilesMatrix[row].length && !doneChecking; col++) {
                    if (typeof tilesMatrix[row][col] === "object") {
                        doneChecking = true;
                    }
                }
                if (!doneChecking) {
                    tilesMatrix.pop();
                }
            }
            return tilesMatrix;
        },

        setGroupsLayout: function (group, matrix) {
            if (group.getIsGroupLocked() && matrix.length > 0) {
                var parentContainer = group.getDomRef().parentElement;

                group.getDomRef().style.width = "";
                parentContainer.style.width = "";
                parentContainer.style.display = "";
            }
        },

        /**
         * @param containerWidth
         * @param tileWidth
         * @param tileMargin
         * @returns {number}
         */
        calcTilesInRow: function (containerWidth, tileWidth, tileMargin) {
            var tilesInRow = Math.floor(containerWidth / (tileWidth + tileMargin));
            // Min number of tile in row that was predefined by UI
            tilesInRow = (tilesInRow < this.minTilesinRow ? this.minTilesinRow : tilesInRow);
            return tilesInRow;
        },

        getGroupTiles: function (oGroup) {
            var aTiles = oGroup.getTiles();
            // insert plus tile only in non empty groups
            if (oGroup.getShowPlaceholder()) {
                aTiles.push(oGroup.oPlusTile);
            }
            return aTiles;
        },

        // groups are optional, onlyIfViewPortChanged are optional
        reRenderGroupsLayout: function (groups) {
            if (!this.isInited) {
                return;
            }
            var styleInfo = this.getStyleInfo(this.container);
            if (!styleInfo.tileWidth) {
                return;
            }
            this.styleInfo = styleInfo;
            this.tilesInRow = this.calcTilesInRow(styleInfo.containerWidth, styleInfo.tileWidth, styleInfo.tileMarginWidth);
            groups = groups || this.getGroups();
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].getDomRef && !groups[i].getDomRef()) {
                    // we don't render invisible groups
                    continue;
                }
                var tiles = this.getGroupTiles(groups[i]);
                var groupLayoutMatrix = this.organizeGroup(tiles);
                this.setGroupsLayout(groups[i], groupLayoutMatrix);
            }
        },

        initDragMode: function () {
            this.initGroupDragMode(this.layoutEngine.currentGroup);
        },

        endDragMode: function () {
            var groups = this.getGroups();
            for (var i = 0; i < groups.length; i++) {
                var oGroupElement = groups[i].getDomRef();
                if (!oGroupElement || !oGroupElement.classList.contains("sapUshellInDragMode")) {
                    continue;
                }
                oGroupElement.classList.remove("sapUshellInDragMode");
                var tiles = this.getGroupTiles(groups[i]);
                for (var j = 0; j < tiles.length; j++) {
                    tiles[j].getDomRef().removeAttribute("style");
                }

                var aInnerElements = oGroupElement.getElementsByClassName("sapUshellInner");
                for (var k = 0; k < aInnerElements.length; k++) {
                    aInnerElements[k].removeAttribute("style");
                }
            }
        },

        initGroupDragMode: function (group) {
            if (group.$().hasClass("sapUshellInDragMode")) {
                return;
            }
            var tiles = this.getGroupTiles(group);
            var groupLayoutMatrix = this.organizeGroup(tiles);
            group.$().addClass("sapUshellInDragMode");
            this.renderLayoutGroup(group, groupLayoutMatrix);
        },

        calcTranslate: function (row, col) {
            var translateX = col * (this.styleInfo.tileWidth + this.styleInfo.tileMarginWidth);
            var translateY = row * (this.styleInfo.tileHeight + this.styleInfo.tileMarginHeight);
            // for RTL need negative X
            if (this.layoutEngine.rightToLeft) {
                translateX = -translateX;
            }
            return { x: translateX, y: translateY };
        },

        renderLayoutGroup: function (group, groupLayoutMatrix) {
            var currentTile;

            this.styleInfo = this.getStyleInfo(this.container);

            for (var i = 0; i < groupLayoutMatrix.length; i++) {
                for (var j = 0; j < groupLayoutMatrix[i].length; j++) {
                    if (currentTile === groupLayoutMatrix[i][j]) {
                        continue;
                    } else {
                        currentTile = groupLayoutMatrix[i][j];
                    }
                    if (typeof currentTile === "undefined") {
                        break;
                    }
                }
            }
        }
    };
    var Layout = new LayoutConstructor();
    return Layout;
}, /* bExport= */ false);
