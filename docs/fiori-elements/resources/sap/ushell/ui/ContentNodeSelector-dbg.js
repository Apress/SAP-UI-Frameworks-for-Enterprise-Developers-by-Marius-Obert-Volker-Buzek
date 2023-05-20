// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/deepClone",
    "sap/m/Token",
    "sap/ui/core/Core",
    "sap/ui/core/Fragment",
    "sap/ui/core/XMLComposite",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/ushell/resources"
], function (
    deepClone,
    Token,
    Core,
    Fragment,
    XMLComposite,
    Device,
    Filter,
    FilterOperator,
    JSONModel,
    Config,
    ushellLibrary,
    resources
) {
    "use strict";

    // shortcut for sap.ushell.ContentNodeType
    var ContentNodeType = ushellLibrary.ContentNodeType;

    /**
     * Constructor for a new Content Node Selector.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class The Content Node Selector is used for selecting a group or section as a destination for new bookmark tiles.
     * @extends sap.ui.core.XMLComposite
     *
     * @author SAP SE
     * @since 1.81
     *
     * @private
     * @alias sap.ushell.ui.ContentNodeSelector
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var ContentNodeSelector = XMLComposite.extend("sap.ushell.ui.ContentNodeSelector", {
        metadata: {
            library: "sap.ushell",
            associations: {
                labelId: {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            },
            events: {
                /**
                 * Is triggered when the user changes their selection. The newly selected content nodes
                 * can be retrieved using {@link sap.ushell.ui.ContentNodeSelector#getSelectedContentNodes}.
                 */
                selectionChanged: {},
                valueHelpEndButtonPressed: {}
            }
        }
    });

    ContentNodeSelector.prototype.init = function () {
        this._oModel = new JSONModel({
            items: [],
            suggestions: [],
            isSpaces: Config.last("/core/spaces/enabled")
        });
        this._oDeviceModel = new JSONModel(Device);

        this.setModel(this._oModel, "_internal");
        this.setModel(this._oDeviceModel, "_device");
        this.setModel(resources.getTranslationModel(), "_i18n");

        var oMultiInput = this.getAggregation("_content");
        oMultiInput.addValidator(this._validateItem.bind(this));

        this.setBusyIndicatorDelay(0);
        this._loadContentNodes()
            .then(this._overwriteLabel.bind(this));
    };

    /**
     * Updates the text of the associated labelId to the current mode the user is in.
     * This can be the classic homepage ("groups") or spaces mode ("pages").
     *
     * @private
     */
    ContentNodeSelector.prototype._overwriteLabel = function () {
        var sLabelId = this.getLabelId();
        var oLabel = Core.byId(sLabelId);

        if (oLabel && typeof oLabel.setText === "function") {
            if (this._oModel.getProperty("/isSpaces")) {
                oLabel.setText(resources.i18n.getText("contentNodeSelectorHomepagePages"));
            } else {
                oLabel.setText(resources.i18n.getText("contentNodeSelectorHomepageGroups"));
            }
        }

        if (oLabel && typeof oLabel.setRequired === "function" && oLabel.isPropertyInitial("required")) {
            oLabel.setRequired(true);
        }

        if (oLabel && typeof oLabel.setLabelFor === "function") {
            oLabel.setLabelFor(this);
        }
    };

    ContentNodeSelector.prototype.exit = function () {
        this._oModel.destroy();
        this._oDeviceModel.destroy();
    };

    /**
     * Returns only the selected content nodes.
     * @returns {object[]} All selected content nodes
     */
    ContentNodeSelector.prototype.getSelectedContentNodes = function () {
        var oMultiInput = this.getAggregation("_content");
        var aTokens = oMultiInput.getTokens();

        return aTokens.map(function (oToken) {
            var oContentNode = oToken.getBindingContext("_internal").getObject();
            var oContentNodeCopy = deepClone(oContentNode);

            delete oContentNodeCopy.selected;
            delete oContentNodeCopy.spaceTitles;

            return oContentNodeCopy;
        });
    };

    /**
     * Checks whether the admin AND the user have enabled 'MyHome'
     *
     * @returns {Promise<boolean>} Resolves true, if admin adn user the user have enabled 'MyHome'.
     *
     * @private
     * @since 1.107.0
     */
    ContentNodeSelector.prototype._getMyHomeEnablement = function () {
        return new Promise(function (resolve, reject) {
            var bMyHomeEnabled = Config.last("/core/spaces/myHome/enabled");
            var bUserMyHome = sap.ushell.Container.getUser().getShowMyHome();
            resolve(bMyHomeEnabled && bUserMyHome);
        });
    };

    /**
     * This function assures that only traditional pages which can be personalized are returned.
     * In case a content node shall not be returned because of its type, this node and all of its children get removed from the result.
     * Parent nodes are returned even if they are not of the requested type.
     * @param {ContentNode[]} [aContentNodes] Types of content nodes to be returned. Defaults to all content node types defined in `sap.ushell.ContentNodeType`.
     *
     * @returns {Promise<ContentNode[]>} Resolves content nodes
     *
     * @private
     * @since 1.107.0
     */
    ContentNodeSelector.prototype._filterPersonalizableContentNodes = function (aContentNodes) {
        if (!Array.isArray(aContentNodes)) {
            return [];
        }

        return aContentNodes.reduce(function (aNodes, oContentNode) {
            if (this._bShowOnlyMyHome && oContentNode.id !== this._sMyHomeSpaceId && oContentNode.id !== this._sMyHomePageId) {
                return aNodes;
            }
            oContentNode.children = this._filterPersonalizableContentNodes(oContentNode.children);
            if (oContentNode.type === ContentNodeType.HomepageGroup || oContentNode.type === ContentNodeType.Space || (oContentNode.type === ContentNodeType.Page && oContentNode.isContainer)) {
                aNodes.push(oContentNode);
            }
            return aNodes;
        }.bind(this), []);
    };

    /**
     * Retrieves the list of content nodes from the sap.ushell Bookmark service and saves them in the _internal model.
     *
     * @returns {Promise<void>} A promise that is resolved once the Bookmark service is loaded.
     * @private
     */
    ContentNodeSelector.prototype._loadContentNodes = function () {
        this.setBusy(true);

        return Promise.all([
            sap.ushell.Container.getServiceAsync("Bookmark"),
            this._getMyHomeEnablement()
        ]).then(function (aResult) {
            var oBookmarkService = aResult[0];
            var bMyHomeEnabled = aResult[1];
            var bPersonalizationEnabled = Config.last("/core/shell/enablePersonalization");
            this._bShowOnlyMyHome = !bPersonalizationEnabled && bMyHomeEnabled;
            this._sMyHomeSpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");
            this._sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");

            return oBookmarkService.getContentNodes().then(function (aContentNodes) {
                aContentNodes = deepClone(aContentNodes);
                aContentNodes = this._filterPersonalizableContentNodes(aContentNodes);

                ContentNodeSelector._normalizeContentNodes(aContentNodes);
                this._oModel.setProperty("/items", aContentNodes);

                var aSuggestions = ContentNodeSelector._getSuggestions(aContentNodes);

                for (var i = 0; i < aSuggestions.length; i++) {
                    aSuggestions[i].selected = false;
                }

                this._oModel.setProperty("/suggestions", aSuggestions);

                this.setBusy(false);
            }.bind(this));
        }.bind(this));
    };

    /**
     * Creates and displays a value help dialog for selecting a content node.
     *
     * @param {sap.ui.base.Event} event The SAPUI5 event object.
     * @private
     */
    ContentNodeSelector.prototype._showValueHelp = function (event) {
        var oMultiInput = event.getSource();
        var sText = oMultiInput.getValue();

        if (!this._oValueHelpDialog) {
            Fragment.load({
                id: this.getId() + "-ValueHelpDialog",
                name: "sap.ushell.ui.ContentNodeSelectorValueHelp",
                controller: this
            }).then(function (oDialog) {
                this.addDependent(oDialog);

                this._oValueHelpDialog = oDialog;
                this._openValueHelpDialog(sText);
            }.bind(this));
        } else {
            this._openValueHelpDialog(sText);
        }
    };

    /**
     * Opens the value help dialog and expands the tree control to the first level.
     *
     * @param {string} filterText The text by which the tree should be filtered when the dialog is opened.
     * @private
     */
    ContentNodeSelector.prototype._openValueHelpDialog = function (filterText) {
        var oTree = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesTree");
        oTree.expandToLevel(1);

        this._oValueHelpDialog.open();

        var oSearchInput = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesSearch");
        oSearchInput.setValue(filterText);

        // Also applies another filter
        this._onValueHelpSearch();
    };

    /**
     * Filters the tree control by the value from the search input.
     *
     * @private
     */
    ContentNodeSelector.prototype._onValueHelpSearch = function () {
        var oSearchInput = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesSearch");
        var sFilterText = oSearchInput.getValue();
        var oTree = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesTree");
        var oItemsBinding = oTree.getBinding("items");

        oItemsBinding.filter(new Filter({
            path: "label",
            operator: FilterOperator.Contains,
            value1: sFilterText
        }));
    };

    /**
     * Event handler for the begin button's press event.
     *
     * @private
     */
    ContentNodeSelector.prototype._onValueHelpBeginButtonPressed = function () {
        var oTree = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesTree");

        var aSelectedContextsPaths = oTree.getSelectedContextPaths();

        var oMultiInput = this.getAggregation("_content");
        oMultiInput.destroyTokens();

        var oToken;
        var sPath;
        for (var i = 0; i < aSelectedContextsPaths.length; i++) {
            sPath = aSelectedContextsPaths[i];

            var oModel = this.getModel("_internal");
            var iFoundIndex = oMultiInput.getAggregation("tokens")
                .map(function (oItem) {
                    return oItem.getProperty("key");
                })
                .indexOf(oModel.getProperty(sPath).id);
            if (iFoundIndex < 0) {
                oToken = this._createToken(sPath);
                oMultiInput.addValidateToken({ token: oToken });
            }
        }

        oMultiInput.setValue("");
        this._oValueHelpDialog.close();
    };

    /**
     * Event handler for the end button's press event.
     *
     * @private
     */
    ContentNodeSelector.prototype._onValueHelpEndButtonPressed = function () {
        this.fireValueHelpEndButtonPressed();
        this._oValueHelpDialog.close();
    };

    /**
     * Event handler for the MultiInput's tokenUpdate event.
     *
     * @param {sap.ui.base.Event} event The SAPUI5 event object.
     * @private
     */
    ContentNodeSelector.prototype._onTokenUpdate = function (event) {
        var aAddedTokens = event.getParameter("addedTokens");
        var aRemovedTokens = event.getParameter("removedTokens");

        this._setTokensSelected(aAddedTokens, true);
        this._setTokensSelected(aRemovedTokens, false);

        // Fire the selectionChanged event asynchronously to wait for the MultiInput's token aggregation to be updated.
        setTimeout(this.fireSelectionChanged.bind(this), 0);
    };

    /**
     * Updates each token's "selected" property in the internal model with the given value.
     *
     * @param {sap.m.Token[]} tokens The updated tokens.
     * @param {boolean} selected The value to be set as the new "selected" property value.
     * @private
     */
    ContentNodeSelector.prototype._setTokensSelected = function (tokens, selected) {
        var oContext;

        for (var i = 0; i < tokens.length; i++) {
            oContext = tokens[i].getBindingContext("_internal");

            oContext.getModel().setProperty(oContext.getPath("selected"), selected);
        }
    };

    /**
     * Validates the selected suggestions and creates a new token for valid space/page combinations or classic homepage.
     *
     * @param {object} item The suggestions containing the text and item object.
     * @returns {sap.m.Token} The new token to be added to the tokens aggregation.
     * @private
     */
    ContentNodeSelector.prototype._validateItem = function (item) {
        if (item.suggestedToken) {
            return item.suggestedToken;
        }

        var oItem = item.suggestionObject;

        if (!oItem) {
            // The user must not add arbitrary text
            return null;
        }

        var oContext = oItem.getBindingContext("_internal");

        return this._createToken(oContext.getPath());
    };

    /**
     * Constructs a new sap.m.Token for the given path and sets its binding context to the given path.
     *
     * @param {string} path The binding path to create the token from.
     * @returns {sap.m.Token} The new sap.m.Token instance.
     * @private
     */
    ContentNodeSelector.prototype._createToken = function (path) {
        var oToken = new Token({
            key: "{_internal>id}",
            text: "{_internal>label}"
        });

        oToken.bindObject({
            path: path,
            model: "_internal"
        });

        return oToken;
    };

    /**
     * Retrieves the flat list of selectable suggestions for the MultiInput control.
     * The suggestions consist of the top-level elements along with their children.
     *
     * @param {object[]} items The list of content nodes from the Bookmark service.
     * @returns {object[]} A flat list of selectable content nodes.
     * @private
     * @static
     */
    ContentNodeSelector._getSuggestions = function (items) {
        var aSuggestions = [];

        ContentNodeSelector._getChildren(items, aSuggestions);

        return aSuggestions;
    };

    /**
     * Recursively looks for child objects and flattens the hierarchy of the given tree into the given aggregator.
     *
     * @param {object[]} items The (sub)tree of items whose children should be extracted.
     * @param {object[]} aggregator A list that receives all nested elements from the given tree.
     * @private
     * @static
     */
    ContentNodeSelector._getChildren = function (items, aggregator) {
        var oItem;

        for (var i = 0; i < items.length; i++) {
            oItem = items[i];

            if (oItem.isContainer && aggregator.indexOf(oItem) === -1) {
                aggregator.push(oItem);
            }

            if (oItem.children) {
                ContentNodeSelector._getChildren(oItem.children, aggregator);
            }
        }
    };

    /**
     * This function looks through each content node, compares if the node already exists,
     * and if so, will replace it with the reference to the already found content node.
     * If not, the reference to the first found node is used.
     *
     * @param {object[]} contentNodes The list of content nodes from the Bookmark service.
     * @private
     * @static
     */
    ContentNodeSelector._normalizeContentNodes = function (contentNodes) {
        var oPages = {};

        ContentNodeSelector._visitPages(contentNodes, function (oSpace, oPage) {
            oPage.spaceTitles = oPage.spaceTitles || [];

            if (oPages[oPage.id]) {
                oPages[oPage.id].spaceTitles.push(oSpace.label);
                return oPages[oPage.id];
            }

            oPage.spaceTitles.push(oSpace.label);
            oPages[oPage.id] = oPage;

            return oPage;
        });
    };

    /**
     * Loops through the given tree structure of Content Nodes and calls the given callback function for each
     * encountered Page. The function receives the current Space object and the current Page object as parameters.
     * The callback must return a page object to be written back to the Content Node tree.
     *
     * @param {object[]} contentNodes The list of content nodes from the Bookmark service.
     * @param {function} callback A callback function for each encountered Page.
     * @private
     * @static
     */
    ContentNodeSelector._visitPages = function (contentNodes, callback) {
        if (contentNodes === undefined || contentNodes === null) {
            return;
        }

        for (var i = 0; i < contentNodes.length; i++) {
            var oContentNode = contentNodes[i];
            if (oContentNode.type !== ContentNodeType.Space) {
                return;
            } if (oContentNode.children) {
                for (var k = 0; k < oContentNode.children.length; k++) {
                    var oPage = oContentNode.children[k];
                    oContentNode.children[k] = callback(oContentNode, oPage);
                }
            }
        }
    };

    /**
     * Clears the selection of underlying multi-input as well as in the model.
     *
     * @public
     *
     * @since 1.86.0
     */
    ContentNodeSelector.prototype.clearSelection = function () {
        var oMultiInput = this.getAggregation("_content");
        var aTokens = oMultiInput.getTokens();

        aTokens.forEach(function (oToken) {
            var oContentNode = oToken.getBindingContext("_internal");
            this._oModel.setProperty(oContentNode.getPath("selected"), false);
        }.bind(this));

        oMultiInput.destroyTokens();
    };

    /**
     * Sets the valueState of the underlying multi-input.
     *
     * @see sap.ui.core.ValueState
     * @param {sap.ui.core.ValueState} valueState the valueState to be set on the control
     *
     * @public
     *
     * @since 1.86.0
     */
    ContentNodeSelector.prototype.setValueState = function (valueState) {
        var oMultiInput = this.getAggregation("_content");
        oMultiInput.setValueState(valueState);
    };

    /**
     * Sets the valueStateText of the underlying multi-input.
     *
     * @param {string} valueStateText the valueStateText to be set on the control
     *
     * @public
     *
     * @since 1.86.0
     */
    ContentNodeSelector.prototype.setValueStateText = function (valueStateText) {
        var oMultiInput = this.getAggregation("_content");
        oMultiInput.setValueStateText(valueStateText);
    };

    return ContentNodeSelector;
});
