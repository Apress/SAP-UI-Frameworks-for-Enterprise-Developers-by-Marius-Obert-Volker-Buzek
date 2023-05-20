// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains an annotation parser for fact sheets.
 * @deprecated
 */
sap.ui.define([
    "jquery.sap.global",
    "sap/suite/ui/commons/UnifiedThingInspector",
    "sap/ui/core/format/NumberFormat",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/ui/core/Locale",
    "sap/ui/model/type/DateTime",
    "sap/ui/model/type/Time",
    "sap/ui/model/type/Date",
    "sap/ui/model/type/Float",
    "sap/ui/model/type/Integer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Control",
    "sap/m/Image",
    "sap/m/Link",
    "sap/m/Text",
    "sap/ui/core/library",
    "sap/ui/layout/VerticalLayout",
    "sap/m/Label",
    "sap/ui/layout/form/SimpleForm",
    "sap/suite/ui/commons/UnifiedThingGroup",
    "sap/ui/ux3/ThingGroup",
    "sap/ui/core/HTML",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/library",
    "sap/m/Table",
    "sap/m/Page",
    "sap/m/VBox",
    "sap/m/Input",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/ui/model/FilterOperator",
    "sap/m/DateTimeInput",
    "sap/ui/model/Filter",
    "sap/m/ViewSettingsItem",
    "sap/m/ViewSettingsCustomItem",
    "sap/ui/core/CustomData",
    "sap/m/ViewSettingsDialog",
    "sap/ui/model/Sorter",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/viz/ui5/Area",
    "sap/viz/ui5/Bar",
    "sap/viz/ui5/Bubble",
    "sap/viz/ui5/Column",
    "sap/viz/ui5/StackedColumn",
    "sap/viz/ui5/StackedColumn100",
    "sap/viz/ui5/Donut",
    "sap/viz/ui5/Heatmap",
    "sap/viz/ui5/HorizontalArea",
    "sap/viz/ui5/Line",
    "sap/viz/ui5/Pie",
    "sap/viz/ui5/Scatter",
    "sap/viz/ui5/Treemap",
    "sap/viz/ui5/types/Title",
    "sap/suite/ui/commons/KpiTile",
    "sap/ui/model/odata/ODataModel",
    "sap/suite/ui/commons/FacetOverview",
    "sap/suite/ui/commons/library",
    "sap/ui/layout/Grid",
    "sap/ui/vbm/VBI",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/core/Icon",
    "sap/m/Carousel",
    "sap/ui/core/IconPool",
    "sap/ushell/resources",
    "sap/ushell/ui/footerbar/AddBookmarkButton",
    "sap/suite/ui/commons/LinkActionSheet",
    "sap/ushell/services/AppConfiguration",
    "sap/m/ActionSheet",
    "sap/ushell/ui/footerbar/JamDiscussButton",
    "sap/ushell/ui/footerbar/JamShareButton"
], function (
    $,
    UnifiedThingInspector,
    NumberFormat,
    FlattenedDataset,
    Locale,
    DateTime,
    Time,
    Date,
    Float,
    Integer,
    JSONModel,
    Control,
    Image,
    Link,
    Text,
    coreLibrary,
    VerticalLayout,
    Label,
    SimpleForm,
    UnifiedThingGroup,
    ThingGroup,
    HTML,
    Column,
    ColumnListItem,
    mobileLibrary,
    Table,
    Page,
    VBox,
    Input,
    List,
    StandardListItem,
    FilterOperator,
    DateTimeInput,
    Filter,
    ViewSettingsItem,
    ViewSettingsCustomItem,
    CustomData,
    ViewSettingsDialog,
    Sorter,
    Toolbar,
    ToolbarSpacer,
    Button,
    Area,
    Bar,
    Bubble,
    ui5Column,
    StackedColumn,
    StackedColumn100,
    Donut,
    Heatmap,
    HorizontalArea,
    Line,
    Pie,
    Scatter,
    Treemap,
    Title,
    KpiTile,
    ODataModel,
    FacetOverview,
    commonsLibrary,
    Grid,
    VBI,
    HorizontalLayout,
    Icon,
    Carousel,
    IconPool,
    resources,
    AddBookmarkButton,
    LinkActionSheet,
    AppConfiguration,
    ActionSheet,
    JamDiscussButton,
    JamShareButton
) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    // shortcut for sap.m.PlacementType
    var PlacementType = mobileLibrary.PlacementType;

    // shortcut for sap.suite.ui.commons.FacetOverviewHeight
    var FacetOverviewHeight = commonsLibrary.FacetOverviewHeight;

    // shortcut for sap.m.DateTimeInputType
    var DateTimeInputType = mobileLibrary.DateTimeInputType;

    // shortcut for sap.m.ListMode
    var ListMode = mobileLibrary.ListMode;

    // shortcut for sap.m.ListSeparators
    var ListSeparators = mobileLibrary.ListSeparators;

    // shortcut for sap.m.BackgroundDesign
    var BackgroundDesign = mobileLibrary.BackgroundDesign;

    // shortcut for sap.m.ListType
    var ListType = mobileLibrary.ListType;

    // shortcut for sap.ui.core.TextAlign
    var TextAlign = coreLibrary.TextAlign;

    var oMapping = {}, aAllFacets = [], oLinkAuthorised = {}, newJSONModels = {},
        FACTSHEET = "displayFactSheet",
        oLocale, oTI;

    oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
    if (sap.ui.getCore().getConfiguration().getLanguage() === "ZH") {
        oLocale = new Locale("zh_CN");
    }

    function isNegativeValue (value) {
        return value < 0;
    }

    function toPositiveNumberWithoutDecimals (value) {
        var result = Number(value).toFixed(0);
        if (isNegativeValue(value)) {
            result = Number(result) * -1;
        }
        return result;
    }

    function kpiValueFormatter (value, fractionDigits) {
        var result, oRegExp, sDigits, oNumberFormatter;
        if (!value) {
            return "";
        }
        oRegExp = new RegExp(NumberFormat.oDefaultFloatFormat.groupingSeparator, "g");
        if (fractionDigits >= 0) {
            fractionDigits = parseInt(fractionDigits, 10);
            oNumberFormatter = NumberFormat.getFloatInstance({ minFractionDigits: fractionDigits, maxFractionDigits: fractionDigits }, oLocale);
        } else {
            oNumberFormatter = NumberFormat.getFloatInstance({ minFractionDigits: 0, maxFractionDigits: 99 }, oLocale);
        }
        result = oNumberFormatter.format(value);
        sDigits = result.replace(/[\D]/g, "");
        if (sDigits && sDigits.length > 6) {
            value = value.replace(oRegExp, "");
            if (toPositiveNumberWithoutDecimals(value) < 1000) {
                //show integer part only without a fraction part
                return NumberFormat.getIntegerInstance().format(value);
            }
            oNumberFormatter = NumberFormat.getFloatInstance({ minFractionDigits: 1, maxFractionDigits: 1, style: "short" }, oLocale);
            return oNumberFormatter.format(value);
        }
        return result;

    }

    // End workaround
    // HANA Live
    function fnChange () {
        var oUrl = "",
            i, j, sProperty, sPropertyValue, sPath, oModel, aUrl, aParameters, sNewValue, sPropertyName, sValueFormat;
        sPath = this.getElementBinding().sPath.split("/")[1];
        oModel = this.getModel();
        aUrl = this.mBindingInfos.value.parameters;
        aParameters = this.mBindingInfos.value.parts;
        for (i = 0; i < aUrl.length; i += 1) {
            oUrl = oUrl + aUrl[i].string;
        }
        for (j = 0; j < aParameters.length; j += 1) {
            sProperty = aParameters[j].path;
            sPropertyName = "{" + sProperty + "}";
            sPropertyValue = oModel.oData[sPath][sProperty];
            oUrl = oUrl.replace(sPropertyName, sPropertyValue);
        }
        sNewValue = newModelValue(oUrl);
        if ($.isNumeric(sNewValue)) {
            sValueFormat = this.mBindingInfos.value.parts.filter(function (obj) {
                return (obj.path === sProperty);
            });
            sNewValue = kpiValueFormatter(sNewValue, sValueFormat[0].type.oFormatOptions.maxFractionDigits);
            this.setDoubleFontSize(true);
        }
        this.setValue(sNewValue);
        this.getElementBinding().detachChange(fnChange);
    }

    var getTIDescription = function () {
        var sTIDescription = "";
        if (oTI.getName() && oTI.getDescription()) {
            sTIDescription = oTI.getName() + ", " + oTI.getDescription();
        } else if (oTI.getName() && !oTI.getDescription()) {
            sTIDescription = oTI.getName();
        } else if (!oTI.getName() && oTI.getDescription()) {
            sTIDescription = oTI.getDescription();
        }
        return sTIDescription;
    };

    var getServiceFromUri = function (sUri) {
        var aUriParts, sService, i;
        aUriParts = sUri.slice(1).split("/");
        sService = "/";
        for (i = 0; i < aUriParts.length; i += 1) {
            if ((aUriParts[i].indexOf("(") > 0) && (aUriParts[i].indexOf("sid(") < 0)) {
                break;
            } else {
                sService += aUriParts[i] + "/";
            }
        }
        return sService;
    };

    var getEntitySetFromUri = function (sUri, oModel) {
        var sEntitySet, sEntityUri, aServiceParts, sNavProperty;
        sEntityUri = sUri.slice(oModel.sServiceUrl.length + 1);
        if (sEntityUri.indexOf("/") >= 0) {
            aServiceParts = sEntityUri.split("/");
            sNavProperty = aServiceParts[aServiceParts.length];
            sEntitySet = aServiceParts[aServiceParts.length - 1];
            if (sEntitySet.indexOf("(") >= 0) {
                sEntitySet = sEntitySet.slice(sEntitySet.indexOf("("));
            }
            sEntitySet = this.getNavEntitySet(sEntitySet, sNavProperty, oModel.getMetadata());
        } else if (sEntityUri.indexOf("(") >= 0) {
            sEntitySet = sEntityUri.slice(0, sEntityUri.indexOf("("));
        } else if (sEntityUri.indexOf("?") >= 0) {
            sEntitySet = sEntityUri.slice(0, sEntityUri.indexOf("?"));
        } else {
            sEntitySet = sEntityUri;
        }
        return sEntitySet;
    };

    var getEntityKeyFromUri = function (sUri, oModel) {
        var sEntityUri, sKey = "", oMetadata, sEntityType;
        sEntityUri = sUri.slice(oModel.sServiceUrl.length + 1);
        if (sEntityUri.indexOf("(") >= 0) {
            sKey = sEntityUri.slice(sEntityUri.indexOf("(") + 1, sEntityUri.indexOf(")"));
            if (sKey.indexOf("=") <= 0) {
                // There is just one key property and the shortened notation was used, get name of the key property
                oMetadata = oModel.getServiceMetadata();
                sEntityType = getEntityType(getEntitySetFromUri(sUri, oModel), oMetadata);
                sKey = getKeyProperty(sEntityType, oMetadata) + "=" + sKey;
            }
        }
        return sKey;
    };

    var getKeyProperty = function (sEntityType, oMetadata) {
        var i, j, metadataSchema;
        for (i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
            metadataSchema = oMetadata.dataServices.schema[i];
            if (metadataSchema.namespace === sEntityType.slice(0, sEntityType.lastIndexOf("."))) {
                for (j = 0; j < metadataSchema.entityType.length; j += 1) {
                    if (metadataSchema.entityType[j].name === sEntityType.slice(sEntityType.lastIndexOf(".") + 1)) {
                        return metadataSchema.entityType[j].key.propertyRef[0].name;
                    }
                }
            }
        }
    };

    var getEntitySetFromType = function (sEntityType, oMetadata) {
        var i, j, metadataSchema, aEntitySets;
        for (i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
            metadataSchema = oMetadata.dataServices.schema[i];
            if (metadataSchema.entityContainer) {
                aEntitySets = metadataSchema.entityContainer[0].entitySet;
                for (j = aEntitySets.length - 1; j >= 0; j -= 1) {
                    if (aEntitySets[j].entityType === sEntityType) {
                        return aEntitySets[j].name;
                    }
                }
            }
        }
    };

    var getEntityType = function (sEntitySet, oMetadata, bWithoutNamespace) {
        var i, j, metadataSchema, aEntitySets, sReturn;
        for (i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
            metadataSchema = oMetadata.dataServices.schema[i];
            if (metadataSchema.entityContainer) {
                aEntitySets = metadataSchema.entityContainer[0].entitySet;
                for (j = aEntitySets.length - 1; j >= 0; j -= 1) {
                    if (aEntitySets[j].name === sEntitySet) {
                        if (bWithoutNamespace) {
                            sReturn = aEntitySets[j].entityType.slice(metadataSchema.namespace.length + 1);
                        } else {
                            sReturn = aEntitySets[j].entityType;
                        }
                        return sReturn;
                    }
                }
            }
        }
    };

    var getAssociation = function (sEntityType, sNavProperty, oMetadata) {
        var i, j, k, aNsEntityType, metadataSchema, sNameSpace, oNavProperty;
        aNsEntityType = sEntityType.split(".");
        for (i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
            metadataSchema = oMetadata.dataServices.schema[i];
            sNameSpace = aNsEntityType[0];
            if (aNsEntityType.length > 2) {
                for (k = 1; k < aNsEntityType.length - 1; k += 1) {
                    sNameSpace += "." + aNsEntityType[k];
                }
            }
            if (metadataSchema.namespace === sNameSpace) {
                for (j = 0; j < metadataSchema.entityType.length; j += 1) {
                    if (metadataSchema.entityType[j].name === aNsEntityType[aNsEntityType.length - 1]) {
                        if (metadataSchema.entityType[j].navigationProperty) {
                            for (k = 0; k < metadataSchema.entityType[j].navigationProperty.length; k += 1) {
                                if (metadataSchema.entityType[j].navigationProperty[k].name === sNavProperty) {
                                    oNavProperty = metadataSchema.entityType[j].navigationProperty[k];
                                    return { name: oNavProperty.relationship, toRole: oNavProperty.toRole };
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    var getNavEntitySet = function (sEntitySet, sNavProperty, oMetadata) {
        var sEntityType, termTargetType, oAssociation, i, metadataSchema, j, sAssociationSet, k;
        sEntityType = getEntityType(sEntitySet, oMetadata);
        if (sNavProperty.charAt(0) === "@") {
            if (oMapping.termDefinitions && oMapping.termDefinitions[sNavProperty]) {
                termTargetType = oMapping.termDefinitions[sNavProperty];
                if (termTargetType.indexOf("Collection") >= 0) {
                    termTargetType = termTargetType.slice(termTargetType.indexOf("(") + 1, termTargetType.indexOf(")"));
                }
                return getEntitySetFromType(termTargetType, oMetadata);
            }
        } else {
            oAssociation = getAssociation(sEntityType, sNavProperty, oMetadata);
            if (oAssociation) {
                for (i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
                    metadataSchema = oMetadata.dataServices.schema[i];
                    if (metadataSchema.entityContainer && metadataSchema.entityContainer[0].associationSet) {
                        for (j = metadataSchema.entityContainer[0].associationSet.length - 1; j >= 0; j -= 1) {
                            sAssociationSet = metadataSchema.entityContainer[0].associationSet[j];
                            if (sAssociationSet.association === oAssociation.name) {
                                for (k = 0; k < sAssociationSet.end.length; k += 1) {
                                    if (sAssociationSet.end[k].role === oAssociation.toRole) {
                                        return sAssociationSet.end[k].entitySet;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    var getAssociationMultiplicity = function (sEntitySet, sNavProperty, oMetadata) {
        var i, j, k, sEntityType, oAssociation, metadataSchema, sAssociation, sEntityTypeName, sToRoleName;
        sEntityType = getEntityType(sEntitySet, oMetadata);
        sEntityTypeName = sEntityType.split(".")[sEntityType.split(".").length - 1];
        oAssociation = getAssociation(sEntityType, sNavProperty, oMetadata);
        if (oAssociation) {
            for (i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
                metadataSchema = oMetadata.dataServices.schema[i];
                for (j = 0; j < metadataSchema.entityType.length && !sToRoleName; j += 1) {
                    if (metadataSchema.entityType[j].name === sEntityTypeName) {
                        for (k = 0; k < metadataSchema.entityType[j].navigationProperty.length; k += 1) {
                            if (metadataSchema.entityType[j].navigationProperty[k].name === sNavProperty) {
                                sToRoleName = metadataSchema.entityType[j].navigationProperty[k].toRole;
                                break;
                            }
                        }
                    }
                }
                for (j = metadataSchema.association.length - 1; j >= 0; j -= 1) {
                    sAssociation = metadataSchema.association[j];
                    if (metadataSchema.namespace + "." + sAssociation.name === oAssociation.name) {
                        for (k = 0; k < sAssociation.end.length; k += 1) {
                            if (sAssociation.end[k].role === sToRoleName) {
                                return sAssociation.end[k].multiplicity;
                            }
                        }
                    }
                }
            }
        } else {
            jQuery.sap.log.error("\"" + sNavProperty + "\" wasn't found in the metadata document. Check whether the corresponding search connector is active.");
            return 0;
        }
    };

    var getExpand = function (sEntitySet, oMetadata) {
        var oExpand, oExpandEntities, aExpand, elem;
        oExpand = {};
        if (oMapping.expand) {
            if (oMapping.expand[getEntityType(sEntitySet, oMetadata)]) {
                oExpandEntities = oMapping.expand[getEntityType(sEntitySet, oMetadata)];
                aExpand = [];
                for (elem in oExpandEntities) {
                    if (oExpandEntities.hasOwnProperty(elem)) {
                        aExpand.push(oExpandEntities[elem]);
                    }
                }
                oExpand.expand = aExpand.join(", ");
            }
        }
        return oExpand;
    };

    var getNavTypeForNavPath = function (sNavPath, sEntityType, oMetadata) {
        var m, metadataSchema, j, k, l, n;
        for (m = oMetadata.dataServices.schema.length - 1; m >= 0; m -= 1) {
            metadataSchema = oMetadata.dataServices.schema[m];
            for (j = 0; j < metadataSchema.entityType.length; j += 1) {
                if (metadataSchema.entityType[j].name === sEntityType.split(".")[sEntityType.split(".").length - 1]) {
                    for (k = 0; k < metadataSchema.entityType[j].navigationProperty.length; k += 1) {
                        if (metadataSchema.entityType[j].navigationProperty[k].name === sNavPath) {
                            for (l = 0; l < metadataSchema.association.length; l += 1) {
                                for (n = metadataSchema.association[l].end.length - 1; n >= 0; n -= 1) {
                                    if (metadataSchema.association[l].end[n].role === metadataSchema.entityType[j].navigationProperty[k].toRole) {
                                        return (metadataSchema.association[l].end[n].type);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    /* UI Renderer */

    var propertyPartsWithStrings = function (aParts, oFormatter) {
        var oBinding = {}, j;
        oBinding.parts = [];
        oBinding.parameters = [];
        for (j = aParts.length - 1; j >= 0; j -= 1) {
            if (aParts[j].Type === "Path") {
                if (aParts[j].EdmType) {
                    switch (aParts[j].EdmType) {
                        case "Edm.DateTimeOffset":
                        case "Edm.DateTime":
                            oBinding.parts.push({ path: aParts[j].Value, type: new DateTime({ "UTC": true }) });
                            break;
                        case "Edm.Time":
                            oBinding.parts.push({
                                path: aParts[j].Value + "/ms",
                                type: new Time({
                                    source: { pattern: "timestamp" },
                                    UTC: true
                                })
                            });
                            break;
                        case "Edm.Date":
                            oBinding.parts.push({ path: aParts[j].Value, type: new Date({ "UTC": true }) });
                            break;
                        case "Edm.Decimal":
                        case "Edm.Double":
                        case "Edm.Single":
                            oBinding.parts.push({ path: aParts[j].Value, type: new Float() });
                            break;
                        case "Edm.Int16":
                        case "Edm.Int32":
                        case "Edm.Int64":
                            oBinding.parts.push({ path: aParts[j].Value, type: new Integer() });
                            break;
                        default:
                            oBinding.parts.push({ path: aParts[j].Value });
                            break;
                    }
                } else {
                    oBinding.parts.push({ path: aParts[j].Value });
                }
            } else if (aParts[j].Type === "String") {
                // HANA Live: set strings as parameter
                oBinding.parameters.unshift({ string: aParts[j].Value });
            }
        }
        oBinding.formatter = function () {
            var sValue = "", sPathIndex, k, sLastValue, aValueLastLen, sLastSeparator = "", bEncodeUriComponent = false,
                aHasValueCount = 0, aBracketSeparatorCount = 0;
            if (arguments && arguments.length >= 1) {
                sPathIndex = arguments.length - 1;
                sLastValue = "";
                aValueLastLen = 0;
                if (aParts && aParts[0] && (aParts[0].Type === "String") && (aParts[0].Value.substr(0, 1) === "#")) {
                    bEncodeUriComponent = true;
                }
                for (k = 0; k < aParts.length; k += 1) {
                    if (aParts[k].Type === "Path") {
                        sLastValue = arguments[sPathIndex];
                        if (!sLastValue || (sLastValue.length === 0)) {
                            if (sValue.length > aValueLastLen) {
                                // Remove last separator if argument is empty
                                if (sValue.indexOf("(") > aValueLastLen) {
                                    sValue = sValue.substr(0, aValueLastLen);
                                } else {
                                    sValue = sValue.substr(0, aValueLastLen);
                                    sLastValue = sValue;
                                }
                            }
                        } else {
                            if (bEncodeUriComponent) {
                                sLastValue = encodeURIComponent(sLastValue);
                            }
                            sValue += sLastValue;
                            aHasValueCount += 1;
                        }
                        sPathIndex -= 1;
                        aValueLastLen = sValue.length;
                    } else {
                        aValueLastLen = sValue.length;
                        sLastSeparator = aParts[k].Value;
                        if (sLastSeparator.indexOf("(") !== -1) {
                            aBracketSeparatorCount += 1;
                        }
                        if ((sLastValue && sLastValue.length > 0) || (sLastSeparator.indexOf("(") !== -1) ||
                            (sLastSeparator && (sLastSeparator.substr(0, 1) === "#"))) {
                            // only add separator if last argument was not empty
                            sValue += aParts[k].Value;
                        } else {
                            sLastSeparator = "";
                        }
                    }
                }
                if (oFormatter) {
                    sValue = oFormatter(sValue);
                }
                sValue = sValue.trim();
                if ((aHasValueCount === 1) && (aBracketSeparatorCount > 0) && (sValue.substr(0, 1) === "(") && (sValue.substr(-1) === ")")) {
                    // Remove brackets if it's the only non-empty value in brackets
                    sValue = sValue.substr(1, sValue.length - 2);
                }
                return sValue.trim();
            }
        };
        return oBinding;
    };

    var searchObj = function (obj, property) {
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === "__metadata") {
                    continue;
                } else if (key === property) {
                    return obj[key];
                } else if (typeof obj[key] === "object") {
                    return searchObj(obj[key], property);
                }
            }
        }
    };

    var newModelValue = function (sUrl) {
        var iLastSlash, newUrl, newProp, newJSONModel = {}, returnValue;
        iLastSlash = sUrl.lastIndexOf("/");
        newUrl = sUrl.slice(0, iLastSlash);
        newProp = sUrl.slice(iLastSlash + 1);
        if (!newJSONModels[sUrl]) {
            newJSONModel = new JSONModel();
            newJSONModel.loadData(newUrl, null, false);
            newJSONModels[sUrl] = newJSONModel.getData();
        } else {
            newJSONModel = newJSONModels[sUrl];
        }
        if (newJSONModels[sUrl] && newJSONModels[sUrl].d) {
            if (!newJSONModels[sUrl].d[newProp]) {
                returnValue = searchObj(newJSONModels[sUrl].d, newProp);
            } else {
                returnValue = newJSONModels[sUrl].d[newProp];
            }
        }
        return returnValue;
    };

    var dataField = function (oField, sEntityType, oMetadata, oFacet) {
        var oControl, oBinding, sNavProperty, oUrl, oText, oVL, SemanticObject, sIntend;
        oControl = new Control();
        oBinding = fieldBinding(oField.Value, oField.EdmType, sEntityType);
        if (oField.Value && oField.Value["com.sap.vocabularies.UI.v1.IsImageURL"]) {
            oControl = new Image({ height: "50px" });
            if (oBinding.BindingInfo) {
                oControl.bindProperty("src", oBinding.BindingInfo);
            } else {
                oControl.setProperty("src", oBinding.String);
            }
        } else {
            if (oField.UrlRef || oField.Url || (oField.Target && oField.Target.Path)) {
                oControl = new Link({ wrapping: true });
            } else {
                oControl = new Text();
                if (oField.EdmType === "Edm.Decimal" || oField.EdmType === "Edm.Double" || oField.EdmType === "Edm.Single" ||
                    oField.EdmType === "Edm.Int16" || oField.EdmType === "Edm.Int32" || oField.EdmType === "Edm.Int64") {
                    oControl.setTextAlign(TextAlign.End);
                }
            }
            oControl.addStyleClass("sapFactsheetUtiDataField");
            if (oBinding.BindingInfo) {
                oControl.bindProperty("text", oBinding.BindingInfo);
            } else {
                oControl.setProperty("text", oBinding.String);
            }
        }
        if ((oField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithNavigation") && oMetadata) {
            sNavProperty = oField.Target.Path;
            if (oMapping[sEntityType][sNavProperty.slice(1)]) {
                if (sNavProperty.charAt(0) === "@") {
                    if (sNavProperty.indexOf("/") < 0) {
                        oUrl = oMapping[sEntityType][sNavProperty.slice(1)].UrlRef;
                    } else {
                        oUrl = oMapping[sEntityType][sNavProperty.slice(1, sNavProperty.indexOf("/"))].UrlRef;
                    }
                    oControl.bindProperty("href", navigationBinding(oUrl));
                }
            }
            oControl.attachPress(function (oEvent) {
                return false;
            });
        }
        if (oField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
            if (oField.Url.String) {
                oControl.setHref(oField.Url.String);
            } else {
                oControl.bindProperty("href", navigationBinding(oField.Url));
                //Workaround: no Link if no authority
                oText = new Text({
                    wrapping: true
                });
                if (oBinding.BindingInfo) {
                    oText.bindProperty("text", jQuery.extend({}, oBinding.BindingInfo));
                } else {
                    oText.setProperty("text", oBinding.String);
                }
                oControl.setVisible(false);
                oVL = new VerticalLayout();
                oVL.addContent(oControl);
                oVL.addContent(oText);
                if (!aAllFacets[aAllFacets.indexOf(oFacet)].Links) {
                    aAllFacets[aAllFacets.indexOf(oFacet)].Links = [];
                }
                if (oField.Url.Apply) {
                    SemanticObject = oField.Url.Apply.Parameters[0].Value.slice(oField.Url.Apply.Parameters[0].Value.indexOf("#") + 1, oField.Url.Apply.Parameters[0].Value.indexOf("-"));
                    sIntend = oField.Url.Apply.Parameters[0].Value.slice(oField.Url.Apply.Parameters[0].Value.indexOf("#") + 1, oField.Url.Apply.Parameters[0].Value.indexOf("?"));
                }
                aAllFacets[aAllFacets.indexOf(oFacet)].Links.push({
                    sSemanticObject: SemanticObject,
                    sIntend: sIntend,
                    oVL: oVL
                });
                //Workaround: no Link if no authority
            }
        }
        //Workaround: no Link if no authority
        if (oVL) {
            return oVL;
        }
        return oControl;

        //Workaround: no Link if no authority
    };

    var labelBinding = function (oField, oLabelProperties, aPropExtensions, bWithColon) {
        var oLabel, sColon = "", sLabel = "", oPropertyExt, j, k, oParameter;
        oLabel = new Label(oLabelProperties);
        oLabel.addStyleClass("sapFactsheetUtiLabel");
        if (bWithColon) {
            sColon = ":";
        }
        if (oField.Label) {
            if (oField.Label.String) {
                oLabel.setText(oField.Label.String.trim() + sColon);
                oLabel.setTooltip(oField.Label.String.trim());
            } else if (oField.Label.Path) {
                oLabel.bindProperty("text", oField.Label.Path);
                oLabel.bindProperty("tooltip", oField.Label.Path);
            }
        } else if (oField.Value) {
            if (oField.Value.Path && aPropExtensions) {
                oPropertyExt = aPropExtensions[oField.Value.Path];
                for (j in oPropertyExt) {
                    if (oPropertyExt.hasOwnProperty(j)) {
                        if (j === "http://www.sap.com/Protocols/SAPData") {
                            if (oPropertyExt[j].label) {
                                sLabel = oPropertyExt[j].label;
                                break;
                            }
                        }
                    }
                }
            } else if (oField.Value.Apply && (oField.Value.Apply.Name === "odata.concat")) {
                for (k in oField.Value.Apply.Parameters) {
                    if (oField.Value.Apply.Parameters.hasOwnProperty(k)) {
                        oParameter = oField.Value.Apply.Parameters[k];
                        if (oParameter.Type === "Path") {
                            oPropertyExt = aPropExtensions[oParameter.Value];
                            for (j in oPropertyExt) {
                                if (oPropertyExt.hasOwnProperty(j)) {
                                    if (j === "http://www.sap.com/Protocols/SAPData") {
                                        if (oPropertyExt[j].label) {
                                            sLabel = oPropertyExt[j].label;
                                            break;
                                        }
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
            }
            oLabel.setText(sLabel + sColon);
            oLabel.setTooltip(sLabel);
        }
        return oLabel;
    };

    var fieldBinding = function (oFieldValue, sEdmType, sEntityType) {
        var oBinding = {}, aPartsWithPropAnnotations = [], aParameters = [], aTextParts = [],
            i, j, oPropAnnotations, aParts, oUrl, sUrlProperties, aParams, aTemplProperties, aUrlPathProperties, oParaValue, oParam, fnType;
        var getPropAnnotations = function (sEntityType, attribute1, attribute2) {
            var oPropAnnotations, result = {};
            oPropAnnotations = oMapping.propertyAnnotations[sEntityType];
            if (oPropAnnotations && oPropAnnotations[attribute1] && oPropAnnotations[attribute1][attribute2]) {
                if (oPropAnnotations[attribute1][attribute2].Path) {
                    result.Type = "Path";
                    result.Value = oPropAnnotations[attribute1][attribute2].Path;
                } else {
                    result.Type = "String";
                    result.Value = oPropAnnotations[attribute1][attribute2].String;
                }
            }
            return result;
        };
        if (!oFieldValue) {
            return false;
        }
        if (oFieldValue.Apply) { //apply function
            if (oFieldValue.Apply.Name === "odata.concat") {
                if (sEntityType && oMapping.propertyAnnotations && oMapping.propertyAnnotations[sEntityType]) {
                    aParts = oFieldValue.Apply.Parameters;
                    for (j = 0; j < aParts.length; j += 1) {
                        aPartsWithPropAnnotations.push(aParts[j]);
                        if (aParts[j].Type === "Path") {
                            oPropAnnotations = getPropAnnotations(sEntityType, aParts[j].Value, "Org.OData.Measures.V1.ISOCurrency");
                            if (!$.isEmptyObject(oPropAnnotations)) {
                                aPartsWithPropAnnotations.push({ Type: "String", Value: " " });
                                aPartsWithPropAnnotations.push({ Type: oPropAnnotations.Type, Value: oPropAnnotations.Value });
                            }
                            oPropAnnotations = getPropAnnotations(sEntityType, aParts[j].Value, "Org.OData.Measures.V1.Unit");
                            if (!$.isEmptyObject(oPropAnnotations)) {
                                aPartsWithPropAnnotations.push({ Type: "String", Value: " " });
                                aPartsWithPropAnnotations.push({ Type: oPropAnnotations.Type, Value: oPropAnnotations.Value });
                            }
                        }
                    }
                    oBinding.BindingInfo = propertyPartsWithStrings(aPartsWithPropAnnotations);
                } else {
                    oBinding.BindingInfo = propertyPartsWithStrings(oFieldValue.Apply.Parameters);
                }
            }
        } else if (oFieldValue.Path) {
            //property path
            if (oFieldValue.Path.charAt(0) === "@") { //property path with navigation defined in annotation
                oUrl = oMapping[sEntityType][oFieldValue.Path.slice(1, oFieldValue.Path.indexOf("/"))].UrlRef;
                sUrlProperties = oFieldValue.Path.slice(oFieldValue.Path.indexOf("/") + 1);
                if (oUrl && oUrl.Apply) {
                    aParams = oUrl.Apply.Parameters;
                    switch (oUrl.Apply.Name) {
                        case "odata.concat":
                            aParameters = aParams;
                            aParameters.push({ Type: "String", Value: "/" + sUrlProperties });
                            break;
                        case "odata.fillUriTemplate":
                            aTemplProperties = aParams[0].Value.split("{");
                            for (i in aTemplProperties) {
                                if (aTemplProperties.hasOwnProperty(i)) {
                                    if (aTemplProperties[i].indexOf("}") < 0) {
                                        aParameters.push({ Type: "String", Value: aTemplProperties[i] });
                                    } else {
                                        aUrlPathProperties = aTemplProperties[i].split("}");
                                        for (j = 1; j < aParams.length; j += 1) {
                                            if (aParams[j].Name === aUrlPathProperties[0]) {
                                                oParaValue = aParams[j].Value;
                                                if (oParaValue.Path) {
                                                    aParameters.push({ Type: "Path", Value: oParaValue.Path });
                                                } else if (oParaValue.Apply && oParaValue.Apply.Name && (oParaValue.Apply.Name.toLowerCase() === "odata.uriencode")) {
                                                    oParam = oParaValue.Apply.Parameters[0];
                                                    aParameters.push({ Type: oParam.Type, Value: encodeURIComponent(oParam.Value) });
                                                    // HANA Live - put property as string to parameters (later needed for constructing URL)
                                                    aParameters.push({ Type: "String", Value: "{" + encodeURIComponent(oParam.Value) + "}" });
                                                }
                                            }
                                        }
                                        aParameters.push({ Type: "String", Value: aUrlPathProperties[1] });
                                    }
                                }
                            }
                            aParameters.push({ Type: "String", Value: "/" + sUrlProperties });
                            //HANA Live
                            oBinding.fnChange = fnChange;
                            break;
                        default:
                            break;
                    }
                    oBinding.BindingInfo = propertyPartsWithStrings(aParameters, newModelValue);
                } else if (oUrl && oUrl.Path) {
                    aParameters.push({ Type: "Path", Value: oUrl.Path }, { Type: "String", Value: "/" + sUrlProperties });
                    oBinding.BindingInfo = propertyPartsWithStrings(aParameters, newModelValue);
                } else if (oUrl && oUrl.String) {
                    oBinding.String = newModelValue(oUrl.String + "/" + sUrlProperties);
                }
            } else { //property path defined in the model
                oBinding.BindingInfo = {};
                switch (sEdmType) {
                    case "Edm.DateTimeOffset":
                    case "Edm.DateTime":
                        oBinding.BindingInfo = { path: oFieldValue.Path, type: new DateTime({ "UTC": true }) };
                        break;
                    case "Edm.Time":
                        oBinding.BindingInfo = {
                            path: oFieldValue.Path + "/ms",
                            type: new Time({
                                source: { pattern: "timestamp" },
                                UTC: true
                            })
                        };
                        break;
                    case "Edm.Date":
                        oBinding.BindingInfo = { path: oFieldValue.Path, type: new Date({ "UTC": true }) };
                        break;
                    case "Edm.Decimal":
                    case "Edm.Double":
                    case "Edm.Single":
                    case "Edm.Int16":
                    case "Edm.Int32":
                    case "Edm.Int64":
                        if ((sEdmType === "Edm.Decimal") || (sEdmType === "Edm.Double") || (sEdmType === "Edm.Single")) {
                            fnType = new Float();
                        } else if ((sEdmType === "Edm.Int16") || (sEdmType === "Edm.Int32") || (sEdmType === "Edm.Int64")) {
                            fnType = new Integer();
                        }
                        if (oMapping.propertyAnnotations) {
                            aTextParts.push({ Type: "Path", Value: oFieldValue.Path, EdmType: sEdmType }, { Type: "String", Value: " " });
                            oPropAnnotations = getPropAnnotations(sEntityType, oFieldValue.Path, "Org.OData.Measures.V1.ISOCurrency");
                            if (!$.isEmptyObject(oPropAnnotations)) {
                                aTextParts.push({ Type: oPropAnnotations.Type, Value: oPropAnnotations.Value });
                            }
                            oPropAnnotations = getPropAnnotations(sEntityType, oFieldValue.Path, "Org.OData.Measures.V1.Unit");
                            if (!$.isEmptyObject(oPropAnnotations)) {
                                aTextParts.push({ Type: oPropAnnotations.Type, Value: oPropAnnotations.Value });
                            }
                            oBinding.BindingInfo = propertyPartsWithStrings(aTextParts);
                        } else {
                            oBinding.BindingInfo = { path: oFieldValue.Path, type: fnType };
                        }
                        break;
                    default:
                        oBinding.BindingInfo = { path: oFieldValue.Path };
                        break;
                }
            }
        } else if (oFieldValue.String) {
            //hard coded string in annotation
            oBinding.String = oFieldValue.String;
        }
        return oBinding;
    };

    var navigationBinding = function (oUrl) {
        var aUrlParts = [], aParams, aTemplateParts, j, aTemplValueParts, oUrlParts = {}, oParaValue, oResolution, sSystem;
        if (oUrl && oUrl.Apply) {
            aParams = oUrl.Apply.Parameters;
            switch (oUrl.Apply.Name) {
                case "odata.fillUriTemplate":
                    aParams[0].Value = aParams[0].Value.trim();
                    aTemplateParts = aParams[0].Value.split("{");
                    for (j = 0; j < aTemplateParts.length; j += 1) {
                        if (aTemplateParts[j].indexOf("}") < 0) {
                            aUrlParts.push({ "Value": aTemplateParts[j], "Type": "String" });
                        } else {
                            aTemplValueParts = aTemplateParts[j].split("}");
                            oUrlParts = {};
                            oUrlParts.Value = aTemplValueParts[0];
                            oUrlParts.Type = "Path";
                            for (j = 1; j < aParams.length; j += 1) {
                                if (aParams[j].Name === oUrlParts.Value) {
                                    oParaValue = aParams[j].Value;
                                    if (oParaValue.Path) {
                                        oUrlParts.Value = oParaValue.Path;
                                    } else if (oParaValue.Apply && oParaValue.Apply.Name && oParaValue.Apply.Name.toLowerCase() === "odata.uriencode") {
                                        oUrlParts.Value = oParaValue.Apply.Parameters[0].Value;
                                    }
                                    break;
                                }
                            }
                            aUrlParts.push(oUrlParts);
                            aUrlParts.push({ "Value": aTemplValueParts[1], "Type": "String" });
                        }
                    }
                    oResolution = sap.ushell.Container.getService("NavTargetResolution").getCurrentResolution();
                    if (oResolution && oResolution.url) {
                        sSystem = jQuery.sap.getUriParameters(oResolution.url).get("sap-system");
                        if (sSystem) {
                            aUrlParts.push({ Type: "String", Value: "&sap-system=" + sSystem });
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        return propertyPartsWithStrings(aUrlParts);
    };

    var columnHAlign = function (oField) {
        var hAlign = TextAlign.Begin;
        if (oField.EdmType === "Edm.Decimal" || oField.EdmType === "Edm.Double" || oField.EdmType === "Edm.Single" ||
            oField.EdmType === "Edm.Int16" || oField.EdmType === "Edm.Int32" || oField.EdmType === "Edm.Int64") {
            hAlign = TextAlign.End;
        }
        return hAlign;
    };

    var formLayoutFactory = function (oModel, sEntitySet, aFormData, oMaxItems, oMetadata, oFacet) {
        var i, j = 0, iSumPrioHigh = 0, iSumPrioMedium = 0, iSumPrioLow = 0,
            sEntityType, aPropertyExtensions, oImportance, oControl, oLabel, oSimpleForm;
        if (!oMetadata) {
            oMetadata = oModel.getServiceMetadata();
        }
        if (!aFormData) {
            aFormData = [];
        }
        sEntityType = getEntityType(sEntitySet, oMetadata);
        oSimpleForm = new SimpleForm({
            labelMinWidth: 150,
            maxContainerCols: 2
        });
        aPropertyExtensions = (oMapping.propertyExtensions) ? oMapping.propertyExtensions[sEntityType] : [];
        if (oMaxItems && oMaxItems.High) {
            iSumPrioHigh = oMaxItems.High;
        }
        if (oMaxItems && oMaxItems.Medium) {
            iSumPrioMedium = oMaxItems.Medium;
        }
        if (oMaxItems && oMaxItems.Low) {
            iSumPrioLow = oMaxItems.Low;
        }
        for (i = 0; i < aFormData.length; i += 1) {
            oImportance = getImportanceOfRecord(aFormData[i]);
            if (oMaxItems && (oImportance === "High")) {
                if (iSumPrioHigh) {
                    iSumPrioHigh -= 1;
                } else {
                    continue;
                }
            } else if (oMaxItems && (oImportance === "Medium")) {
                if (iSumPrioMedium) {
                    iSumPrioMedium -= 1;
                } else {
                    continue;
                }
            } else if (oMaxItems && (oImportance === "Low")) {
                if (iSumPrioLow) {
                    iSumPrioLow -= 1;
                } else {
                    continue;
                }
            }
            if (oMaxItems && oMaxItems.Total && (j >= oMaxItems.Total)) {
                break;
            }
            j += 1;
            oControl = new Control().setModel(oModel);
            oLabel = labelBinding(aFormData[i], { textAlign: TextAlign.End }, aPropertyExtensions, false);
            oLabel.addStyleClass("sapFactsheetUtiFormPadding");
            oControl = dataField(aFormData[i], sEntityType, oMetadata, oFacet);
            oControl.addStyleClass("sapFactsheetUtiFormPadding");
            if (oControl.setTextAlign) {
                oControl.setTextAlign(TextAlign.Begin);
            }
            oSimpleForm.addContent(oLabel);
            oSimpleForm.addContent(oControl);
        }
        oSimpleForm.addStyleClass("sapFactsheetUtiFormLayout");
        return oSimpleForm;
    };

    var facetFactory = function (oModel, sEntitySet, oSelectedFacet, sBindingPath, oFacet) {
        var sAssociationMultiplicity = "", aTG = [],
            i, oMetadata, oTG, sNavPath, sAnnoPath, aAnnoPath, sNavEntitySet, oList, aIdentification, oVL, aStatusInfo, oFG, sEntityType, aColumns, oPropertyExtensions;
        oMetadata = oModel.getServiceMetadata();
        switch (oSelectedFacet.RecordType) {
            case "com.sap.vocabularies.UI.v1.ReferenceFacet":
                oTG = new UnifiedThingGroup();
                if (oSelectedFacet.Label && oSelectedFacet.Label.String) {
                    oTG.setTitle(oSelectedFacet.Label.String);
                }
                sNavPath = oSelectedFacet.Target.AnnotationPath;
                sAnnoPath = sNavPath.substring(sNavPath.lastIndexOf("@") + 1);
                sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                if (sNavPath) {
                    sAssociationMultiplicity = getAssociationMultiplicity(sEntitySet, sNavPath, oMetadata);
                }
                aAnnoPath = sAnnoPath.split("#");
                switch (aAnnoPath[0]) {
                    case "com.sap.vocabularies.UI.v1.LineItem":
                    case "com.sap.vocabularies.UI.v1.Chart":
                    case "com.sap.vocabularies.UI.v1.Badge":
                    case "com.sap.vocabularies.UI.v1.Identification":
                        if (sNavPath) {
                            sNavEntitySet = getNavEntitySet(sEntitySet, sNavPath, oMetadata);
                            sEntityType = getEntityType(sNavEntitySet, oMetadata);
                        } else {
                            sEntityType = getEntityType(sEntitySet, oMetadata);
                        }
                        // In case of a chart we need to have the definition of the line items
                        if (aAnnoPath[0] === "com.sap.vocabularies.UI.v1.Chart") {
                            sAnnoPath = "com.sap.vocabularies.UI.v1.LineItem";
                        }
                        aColumns = oMapping[sEntityType][sAnnoPath];
                        if (oMapping.propertyExtensions) {
                            oPropertyExtensions = oMapping.propertyExtensions[sEntityType];
                        }
                        if (sAssociationMultiplicity === "*" && aAnnoPath[0] !== "com.sap.vocabularies.UI.v1.Identification") {
                            oList = itemListFactory(oModel, aColumns, sEntityType, oMetadata, sBindingPath + "/" + sNavPath, oSelectedFacet, oPropertyExtensions, oFacet);
                            oTG.setContent(oList);
                        }
                        if (aAnnoPath[0] === "com.sap.vocabularies.UI.v1.Identification") {
                            aIdentification = oMapping[sEntityType]["com.sap.vocabularies.UI.v1.Identification"];
                            oVL = new VerticalLayout({ width: "100%" }).setModel(oModel);
                            if (sNavPath) {
                                oVL.addContent(formLayoutFactory(oModel, sNavEntitySet, aIdentification, null, null, oFacet)).addStyleClass("sapFactsheetUtiPanel");
                                oVL.bindElement(sBindingPath + "/" + sNavPath);
                            } else {
                                oVL.addContent(formLayoutFactory(oModel, sEntitySet, aIdentification, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel"));
                            }
                            oTG.setContent(oVL);
                        }
                        break;
                    case "com.sap.vocabularies.UI.v1.StatusInfo":
                        if (sNavPath) {
                            sNavEntitySet = getNavEntitySet(sEntitySet, sNavPath, oMetadata);
                            aStatusInfo = oMapping[getEntityType(sNavEntitySet, oMetadata)]["com.sap.vocabularies.UI.v1.StatusInfo"];
                            oTG.setContent(formLayoutFactory(oModel, sNavEntitySet, aStatusInfo, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel").bindElement(sBindingPath + "/" + sNavPath));
                        } else {
                            aStatusInfo = oMapping[getEntityType(sEntitySet, oMetadata)]["com.sap.vocabularies.UI.v1.StatusInfo"];
                            oTG.setContent(formLayoutFactory(oModel, sEntitySet, aStatusInfo, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel"));
                        }
                        break;
                    case "com.sap.vocabularies.UI.v1.FieldGroup":
                        oFG = oMapping[getEntityType(sEntitySet, oMetadata)][sAnnoPath];
                        if (oFG) {
                            if (!oTG.getTitle() || (oTG.getTitle() === "")) {
                                if (oFG.Label) {
                                    if (oFG.Label.String) {
                                        oTG.setTitle(oFG.Label.String);
                                    } else if (oFG.Label.Path) {
                                        oTG.bindProperty("title", oFG.Label.Path);
                                    }
                                }
                            }
                            if (sNavPath) {
                                sNavEntitySet = getNavEntitySet(sEntitySet, sNavPath, oMetadata);
                                oTG.setContent(formLayoutFactory(oModel, sNavEntitySet, oFG.Data, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel").bindElement(sBindingPath + "/" + sNavPath));
                            } else {
                                oTG.setContent(formLayoutFactory(oModel, sEntitySet, oFG.Data, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel"));
                            }
                        }
                        break;
                    default:
                        break;
                }
                return oTG;
            case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
                oTG = new ThingGroup({ title: oSelectedFacet.Label.String });
                oTG.setContent(showHTML(oSelectedFacet));
                return oTG;
            case "com.sap.vocabularies.UI.v1.CollectionFacet":
                for (i = 0; i < oSelectedFacet.Facets.length; i += 1) {
                    aTG.push(facetFactory(oModel, sEntitySet, oSelectedFacet.Facets[i], sBindingPath, oFacet));
                }
                return aTG;
            default:
                break;
        }
    };

    var showHTML = function (oHTMLData) {
        var oImage, oHTMLCtrl, sIframe;
        switch (oHTMLData.UrlContentType.String) {
            case "image/png":
            case "image/jpeg":
            case "image/gif":
                oImage = new Image({ width: "100%" });
                if (oHTMLData.Url.String) {
                    oImage.setSrc(oHTMLData.Url.String);
                }
                return oImage;
            default:
                oHTMLCtrl = new HTML();
                if (oHTMLData.Url.String) {
                    oHTMLCtrl.setContent("<iframe src = '" + oHTMLData.Url.String + "' width='100%' height='250px' frameborder='0'></iframe>");
                } else if (oHTMLData.Url.Path) {
                    oHTMLCtrl.bindProperty("content", {
                        path: oHTMLData.Url.Path,
                        formatter: function (/*value*/) {
                            sIframe = "<iframe src = '" + oHTMLData.Url.Path + "' width='100%' height='250px' frameborder='0'></iframe>";
                            return sIframe;
                        }
                    });
                }
                return oHTMLCtrl;
        }
    };

    var itemListFactory = function (oModel, aColumns, sEntityType, oMetadata, sBindingPath, oSelectedFacet, oPropertyExtensions, oFacet) {
        var aLabels = [], aControls = [], cells = [], columns = [], aSortItems = [], aFilterItems = [], bEnableSortFilterDialog = false,
            i, k, aPropertyExtensions, iMaxColumns, iPrioHighColumnCount, iPrioMediumColumnCount, oImportance, oLabel, bVisible,
            oControl, oTemplateData, sTitle, oTable, oSortItem, oVSDialog, sColumnName, oFilterItem, oCustomFilterControl,
            oSuiteUiCommonsResourceBundle, bSortable, sConcatColumnName;
        oSuiteUiCommonsResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
        if (!oMetadata) {
            oMetadata = oModel.getServiceMetadata();
        }
        aPropertyExtensions = (oMapping.propertyExtensions) ? oMapping.propertyExtensions[sEntityType] : [];
        iMaxColumns = 6; //Default value for desktop
        if (jQuery.device.is.tablet && jQuery.device.is.landscape) {
            iMaxColumns = 5;
        } else if (jQuery.device.is.tablet && jQuery.device.is.portrait) {
            iMaxColumns = 4;
        } else if (jQuery.device.is.phone && jQuery.device.is.landscape) {
            iMaxColumns = 3;
        } else if (jQuery.device.is.phone && jQuery.device.is.portrait) {
            iMaxColumns = 2;
        }
        iPrioHighColumnCount = 0;
        iPrioMediumColumnCount = 0;
        for (i = 0; i < aColumns.length; i += 1) {
            oImportance = getImportanceOfRecord(aColumns[i]);
            if (oImportance === "High") {
                iPrioHighColumnCount += 1;
            }
        }
        if (iMaxColumns > iPrioHighColumnCount) {
            iPrioMediumColumnCount = iMaxColumns - iPrioHighColumnCount;
        } else if (iMaxColumns < iPrioHighColumnCount) {
            iPrioHighColumnCount = iMaxColumns;
        }
        columns.push(new Column({ visible: false }));
        cells.push(new Text().bindText("__metadata/uri"));
        for (i = 0; i < aColumns.length; i += 1) {
            sConcatColumnName = "";
            oControl = new Control();
            oImportance = getImportanceOfRecord(aColumns[i]);
            oControl = dataField(aColumns[i], sEntityType, oMetadata, oFacet);
            oLabel = labelBinding(aColumns[i], null, aPropertyExtensions);
            // Enable sorting for non-concatenated fields
            if (aColumns[i].Value.Path) {
                // "ColumnName" is required for oData call for list sorting
                sColumnName = aColumns[i].Value.Path;
                // Check if column is sortable (if nothing is specified, column is sortable).
                if (oPropertyExtensions && oPropertyExtensions[sColumnName] && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"]
                    && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable) {
                    oLabel.data("IsSortable", oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable);
                    if (oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable === "true") {
                        bEnableSortFilterDialog = true;
                    }
                } else {
                    oLabel.data("IsSortable", "true");
                    bEnableSortFilterDialog = true;
                }
                // Check if column is filterable (if nothing is specified, column is filterable).
                if (oPropertyExtensions && oPropertyExtensions[sColumnName] && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"]
                    && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].filterable) {
                    oLabel.data("IsFilterable", oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].filterable);
                    if (oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].filterable === "true") {
                        bEnableSortFilterDialog = true;
                    }
                } else {
                    oLabel.data("IsFilterable", "true");
                    bEnableSortFilterDialog = true;
                }
            } else {
                // A column consists of concatenated fields. Only if all fields are sortable, then allow a column sorting.
                bSortable = true;
                for (k = 0; k < aColumns[i].Value.Apply.Parameters.length; k += 1) {
                    if (aColumns[i].Value.Apply.Parameters[k].Type === "Path") {
                        sColumnName = aColumns[i].Value.Apply.Parameters[k].Value;
                        // Check if column is sortable (if nothing is specified, column is sortable).
                        if (oPropertyExtensions[sColumnName] && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"]
                            && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable) {
                            if (oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable === "false") {
                                // One of a concatenated fields isn't sortable, then the whole column will be not sortable
                                bSortable = false;
                                sConcatColumnName = "";
                                break;
                            }
                        }
                        if (sConcatColumnName) {
                            sConcatColumnName += ";";
                        }
                        sConcatColumnName += sColumnName;
                    }
                }
                sColumnName = sConcatColumnName;
                if (bSortable === false) {
                    oLabel.data("IsSortable", "false");
                } else {
                    oLabel.data("IsSortable", "true");
                    bEnableSortFilterDialog = true;
                }
                // For concatenated fields no filtering is allowed
                oLabel.data("IsFilterable", "false");
            }
            if (aColumns[i].EdmType) {
                oLabel.data("EdmType", aColumns[i].EdmType);
            }
            oLabel.data("ColumnName", sColumnName);
            aLabels.push(oLabel);
            aControls.push(oControl);
            if (oImportance === "High") {
                if (iPrioHighColumnCount > 0) {
                    bVisible = true;
                    iPrioHighColumnCount -= 1;
                } else {
                    bVisible = false;
                }
            } else if (oImportance === "Medium") {
                if (iPrioMediumColumnCount > 0) {
                    bVisible = true;
                    iPrioMediumColumnCount -= 1;
                } else {
                    bVisible = false;
                }
            } else {
                bVisible = false;
            }
            columns.push(new Column({ header: oLabel, hAlign: columnHAlign(aColumns[i]), visible: bVisible }));
            cells.push(oControl);
        }
        oTemplateData = new ColumnListItem({
            type: ListType.Navigation,
            unread: false,
            cells: cells
        });
        if (oSelectedFacet) {
            sTitle = oSelectedFacet.Label.String;
        }
        oTemplateData.attachPress({ aColumns: aColumns, aLabels: aLabels, aControls: aControls, sTitle: sTitle }, function (oEvent, oData) {
            var i, sItem, oContent, oLabel, oThingGroup, oPage, oValue;
            sItem = oEvent.getSource().getCells()[0].getText().substr(oEvent.getSource().getCells()[0].getText().lastIndexOf("/"));
            oContent = new Table({
                backgroundDesign: BackgroundDesign.Transparent,
                showSeparators: ListSeparators.None,
                columns: [
                    new Column({ hAlign: TextAlign.End }),
                    new Column()
                ]
            });
            oContent.addStyleClass("sapFactsheetUtiPanel");
            oContent.addStyleClass("sapFactsheetUtiTilePadding");
            oContent.addStyleClass("sapFactsheetUtiTableNoTopBorder");
            oContent.bindElement(sItem);
            for (i = 0; i < aColumns.length; i += 1) {
                oLabel = aLabels[i].clone();
                oLabel.setText(oLabel.getText() + ":");
                oValue = aControls[i].clone();
                oLabel.setLabelFor(oValue);
                oContent.addItem(new ColumnListItem({ cells: [oLabel, oValue] }));
            }
            oThingGroup = new UnifiedThingGroup({
                content: oContent,
                title: sTitle,
                description: getTIDescription()
            });
            oPage = new Page({
                title: oTI.getTitle(),
                showNavButton: true,
                content: [oThingGroup]
            });
            oTI.navigateToPage(oPage, true);
            //Workaround: no Link if no authority
            oTI.attachAfterNavigate(oContent, function (oEvent) {
                if (oEvent.getParameters().getParameters().toId.indexOf("__page") >= 0) {
                    var aItems;
                    aItems = oContent.getItems();
                    if (aItems.length > 0 && aAllFacets.indexOf(oFacet) >= 0) {
                        aAllFacets[aAllFacets.indexOf(oFacet)].bLoaded = true;
                        aAllFacets[aAllFacets.indexOf(oFacet)].bProcessed = false;
                        aAllFacets[aAllFacets.indexOf(oFacet)].bIsTable = true;
                        aAllFacets[aAllFacets.indexOf(oFacet)].oTableItems = aItems;
                        checkLinks(aAllFacets.indexOf(oFacet));
                    }
                }
            });
            //Workaround: no Link if no authority
        });
        oTable = new Table({ growing: true, columns: columns });
        oTable.setModel(oModel);
        oTable.bindItems({
            path: sBindingPath,
            template: oTemplateData
        });
        var customFilterString = new VBox({
            items: [
                new Input({
                    placeholder: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_ENTER_YOUR_FILTER"),
                    change: function (oEvent) {
                        var sParentParentId, vsd, filters, customFilter, i;
                        sParentParentId = oEvent.getSource().getParent().getParent().getId();
                        vsd = sap.ui.getCore().byId(sParentParentId.substr(0, sParentParentId.indexOf("-")));
                        filters = vsd.getFilterItems();
                        for (i = 0; i < filters.length; i += 1) {
                            if (filters[i] instanceof ViewSettingsCustomItem && filters[i].getKey() === this.oParent.data("ColumnName")) {
                                customFilter = filters[i];
                                break;
                            }
                        }
                        if (customFilter) {
                            if ((oEvent.getParameter("newValue") === undefined) || (oEvent.getParameter("newValue") === "")) {
                                customFilter.setSelected(false);
                                customFilter.setFilterCount(0);
                            } else {
                                customFilter.setSelected(true);
                                customFilter.setFilterCount(1);
                            }
                        }
                    }
                }).addStyleClass("sapFactsheetUtiFilterInput")
            ]
        });
        var customFilterDecimal = new VBox({
            items: [
                new List({
                    mode: ListMode.SingleSelectLeft,
                    includeItemInSelection: true,
                    items: [
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_GREATER_THEN")
                        }).data("FilterOperator", FilterOperator.GT),
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_EQUALS")
                        }).data("FilterOperator", FilterOperator.EQ),
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_LESS_THEN")
                        }).data("FilterOperator", FilterOperator.LT)
                    ]
                }),
                new Input({
                    placeholder: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_ENTER_YOUR_FILTER"),
                    change: function (oEvent) {
                        var sParentParentId, vsd, filters, customFilter, i;
                        sParentParentId = oEvent.getSource().getParent().getParent().getId();
                        vsd = sap.ui.getCore().byId(sParentParentId.substr(0, sParentParentId.indexOf("-")));
                        filters = vsd.getFilterItems();
                        for (i = 0; i < filters.length; i += 1) {
                            if ((filters[i] instanceof ViewSettingsCustomItem) && (filters[i].getKey() === this.oParent.data("ColumnName"))) {
                                customFilter = filters[i];
                                break;
                            }
                        }
                        if (customFilter) {
                            if ((oEvent.getParameter("newValue") === undefined) || (oEvent.getParameter("newValue") === "")) {
                                customFilter.setSelected(false);
                                customFilter.setFilterCount(0);
                            } else {
                                customFilter.setSelected(true);
                                customFilter.setFilterCount(1);
                            }
                        }
                    }
                }).addStyleClass("sapFactsheetUtiFilterInput")
            ]
        });

        // NOTE: assignment commented out (see todo comment down)
        // var oCustomFilterDate = new sap.m.Vbox({ ...
        new VBox({
            items: [
                new List({
                    mode: ListMode.SingleSelectLeft,
                    includeItemInSelection: true,
                    items: [
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_AFTER")
                        }).data("FilterOperator", FilterOperator.GT),
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_AT")
                        }).data("FilterOperator", FilterOperator.EQ),
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_BEFORE")
                        }).data("FilterOperator", FilterOperator.LT)
                    ]
                }),
                new DateTimeInput({
                    type: DateTimeInputType.Date,
                    valueFormat: new DateTime({ pattern: "yyyy/MM/dd HH:mm:ss UTC+00:00" }).getOutputPattern(),
                    placeholder: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_ENTER_YOUR_FILTER"),
                    change: function (oEvent) {
                        var sParentParentId, vsd, filters, customFilter, i;
                        sParentParentId = oEvent.getSource().getParent().getParent().getId();
                        vsd = sap.ui.getCore().byId(sParentParentId.substr(0, sParentParentId.indexOf("-")));
                        filters = vsd.getFilterItems();
                        for (i = 0; i < filters.length; i += 1) {
                            if ((filters[i] instanceof ViewSettingsCustomItem) && (filters[i].getKey() === this.oParent.data("ColumnName"))) {
                                customFilter = filters[i];
                                break;
                            }
                        }
                        if ((oEvent.getParameter("newValue") === undefined) || (oEvent.getParameter("newValue") === "")) {
                            customFilter.setSelected(false);
                            customFilter.setFilterCount(0);
                        } else {
                            customFilter.setSelected(true);
                            customFilter.setFilterCount(1);
                        }
                    }
                }).addStyleClass("sapFactsheetUtiFilterInput")
            ]
        });

        var customFilterCallback = function (oControl) {
            var aFilters = [], aItems = oControl.getItems(), i, sFilterOperator, sFilterValue;
            if (aItems[0].getParent().data("EdmType") === "Edm.String" && aItems[0].getValue()) {
                aFilters.push(new Filter(aItems[0].getParent().data("ColumnName"), FilterOperator.Contains, aItems[0].getValue()));
            } else if (aItems[0].getParent().data("EdmType") === "Edm.Decimal" && aItems[1].getValue()) {
                for (i = 0; i < aItems[0].getItems().length; i += 1) {
                    if (aItems[0].getItems()[i].getSelected() === true) {
                        sFilterOperator = aItems[0].getItems()[i].data("FilterOperator");
                        break;
                    }
                }
                sFilterValue = aItems[1].getValue();
                for (i = sFilterValue.length - 1; i > 0; i -= 1) {
                    if (sFilterValue[i] === ",") {
                        sFilterValue = sFilterValue.replace(sFilterValue[i], ".");
                        break;
                    }
                }
                aFilters.push(new Filter(aItems[1].getParent().data("ColumnName"), sFilterOperator, sFilterValue));
            } else if (aItems[0].getParent().data("EdmType") === "Edm.Date" && aItems[1].getValue()) {
                for (i = 0; i < aItems[0].getItems().length; i += 1) {
                    if (aItems[0].getItems()[i].getSelected() === true) {
                        sFilterOperator = aItems[0].getItems()[i].data("FilterOperator");
                        break;
                    }
                }
                aFilters.push(new Filter(aItems[1].getParent().data("ColumnName"), sFilterOperator, aItems[1].getValue()));
            } else {
                aFilters.push(new Filter(aItems[0].getParent().data("ColumnName"), FilterOperator.EQ, aItems[0].getValue()));
            }
            return aFilters;
        };
        var customFilterReset = function (oEvent) {
            var source = oEvent.getSource(), filters = source.getFilterItems(), i, j, customControlItems;
            for (i = 0; i < filters.length; i += 1) {
                if (filters[i] && filters[i] instanceof ViewSettingsCustomItem) {
                    filters[i].setSelected(false);
                    filters[i].setFilterCount(0);
                    customControlItems = filters[i].getCustomControl().getItems();
                    for (j = 0; j < customControlItems.length; j += 1) {
                        // Clear of sap.m.Input and sap.m.DateTimeInput
                        if ((customControlItems[j] instanceof Input) || (customControlItems[j] instanceof DateTimeInput)) {
                            customControlItems[j].setValue("");
                        }
                        // Clear sap.m.List
                        if ((customControlItems[j] instanceof List) && (customControlItems[j].getSelectedItem() !== null)) {
                            customControlItems[j].removeSelections();
                        }
                    }
                }
            }
        };
        var customFilterCancel = customFilterReset;
        for (i = 0; i < columns.length; i += 1) {
            if (columns[i + 1]) {
                oLabel = aLabels[i].clone();
                if (oLabel.getText() && (oLabel.data("IsSortable") === "true") && columns[i + 1].getVisible()) {
                    oSortItem = new ViewSettingsItem({
                        text: oLabel.getText(),
                        key: oLabel.data("ColumnName")
                    });
                    if (i === 0) {
                        oSortItem.setSelected(true);
                    }
                    oSortItem.Sort = oLabel.Sort;
                    aSortItems.push(oSortItem);
                }
                if (oLabel.getText() && (oLabel.data("IsFilterable") === "true")) {
                    if (oLabel.data("EdmType") === "Edm.String") {
                        oCustomFilterControl = customFilterString.clone().data("ColumnName", oLabel.data("ColumnName")).data("EdmType", oLabel.data("EdmType"));
                        // TODO: Currently Edm.Date is disabled until correct timezone handling
                        // } else if (oLabel.data("EdmType") === "Edm.Date") {
                        // oCustomFilterControl = customFilterDate.clone().data("ColumnName", oLabel.data("ColumnName")).data("EdmType", oLabel.data("EdmType"));
                    } else if (oLabel.data("EdmType") === "Edm.Decimal") {
                        oCustomFilterControl = customFilterDecimal.clone().data("ColumnName", oLabel.data("ColumnName")).data("EdmType", oLabel.data("EdmType"));
                    }
                    if ((oLabel.data("EdmType") === "Edm.String") || (oLabel.data("EdmType") === "Edm.Decimal")) {
                        oFilterItem = new ViewSettingsCustomItem({
                            key: oLabel.data("ColumnName"),
                            text: oLabel.getText(),
                            customControl: oCustomFilterControl,
                            customData: new CustomData({
                                key: "callback",
                                value: customFilterCallback
                            })
                        });
                        aFilterItems.push(oFilterItem);
                    }
                }
            }
        }
        oVSDialog = new ViewSettingsDialog({
            sortItems: aSortItems,
            filterItems: aFilterItems,
            cancel: customFilterCancel,
            resetFilters: customFilterReset,
            confirm: function (evt) {
                var aSorters = [], aPath = [], aFilters = [], aTableFilters = [],
                    i, p, mParams, oBinding, sPath, bDescending, oCallback;
                mParams = evt.getParameters();
                oBinding = oTable.getBinding("items");
                if (mParams.sortItem) {
                    sPath = mParams.sortItem.getKey();
                    bDescending = mParams.sortDescending;
                    if (sPath.indexOf(";") > 0) {
                        aPath = sPath.split(";");
                        for (i = 0; i < aPath.length; i += 1) {
                            aSorters.push(new Sorter(aPath[i], bDescending));
                        }
                    } else if (sPath) {
                        aSorters.push(new Sorter(sPath, bDescending));
                    }
                    oBinding.sort(aSorters);
                }
                p = mParams;
                for (i = 0; i < p.filterItems.length; i += 1) {
                    if (p.filterItems[i] instanceof ViewSettingsCustomItem) { // custom control filter
                        oCallback = p.filterItems[i].getCustomData()[0].getValue();
                        aFilters = oCallback.apply(this, [p.filterItems[i].getCustomControl()]);
                        if (aFilters) {
                            // The filter could be an array of filters or a single filter so we transform it to an array
                            if (!Array.isArray(aFilters)) {
                                aFilters = [aFilters];
                            }
                            aTableFilters = aTableFilters.concat(aFilters);
                        }
                    } else if (p.filterItems[i] instanceof ViewSettingsItem) { // standard filter
                        aFilters = p.filterItems[i].getCustomData()[0].getValue();
                        if (aFilters) {
                            // The filter could be an array of filters or a single filter so we transform it to an array
                            if (!Array.isArray(aFilters)) {
                                aFilters = [aFilters];
                            }
                            aTableFilters = aTableFilters.concat(aFilters);
                        }
                    }
                }
                oBinding.filter(aTableFilters);
            }
        });
        if (bEnableSortFilterDialog === true && (aSortItems.length > 0 || aFilterItems.length > 0)) {
            // Add a button to the table header for opening the sorting dialog
            oTable.setHeaderToolbar(new Toolbar({
                content: [
                    new Label(),
                    new ToolbarSpacer(),
                    new Button({
                        icon: "sap-icon://drop-down-list",
                        press: function (/*evt*/) {
                            oVSDialog.open();
                        },
                        tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS")
                    })
                ]
            }));
        }
        // While data is loading display a loading text
        oTable.setNoDataText(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PULL2REFRESH_LOADING_LONG"));
        // When data gets updated check if there are no items and set a no data text in that case
        var updatedFinished = (function (oFacet) {
            return function (oEvent) {
                var aItems = this.getItems();
                if (aItems.length === 0) {
                    this.setNoDataText(oSuiteUiCommonsResourceBundle.getText("FACETOVERVIEW_NO_CONTENT_TEXT"));
                } else {
                    this.setNoDataText(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PULL2REFRESH_LOADING_LONG"));
                }
                //Workaround: no Link if no authority
                if (aItems.length > 0 && aAllFacets.indexOf(oFacet) >= 0) {
                    aAllFacets[aAllFacets.indexOf(oFacet)].bLoaded = true;
                    aAllFacets[aAllFacets.indexOf(oFacet)].bProcessed = false;
                    aAllFacets[aAllFacets.indexOf(oFacet)].bIsTable = true;
                    aAllFacets[aAllFacets.indexOf(oFacet)].oTableItems = aItems;
                }
                checkLinks(aAllFacets.indexOf(oFacet));
                //Workaround: no Link if no authority
            };
        }(oFacet));
        oTable.attachUpdateFinished(updatedFinished);
        return oTable;
    };

    var chartControlFactory = function (sChartType, oTitle, oDescription, oDataset) {
        var oChartControl;
        switch (sChartType) {
            case "com.sap.vocabularies.UI.v1.ChartType/Area":
                oChartControl = new Area({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Bar":
                oChartControl = new Bar({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Bubble":
                oChartControl = new Bubble({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Column":
                oChartControl = new ui5Column({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/ColumnStacked":
                oChartControl = new StackedColumn({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/ColumnStacked100":
                oChartControl = new StackedColumn100({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Donut":
                oChartControl = new Donut({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/HeatMap":
                oChartControl = new Heatmap({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/HorizontalArea":
                oChartControl = new HorizontalArea({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Line":
                oChartControl = new Line({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Pie":
                oChartControl = new Pie({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Scatter":
                oChartControl = new Scatter({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/TreeMap":
                oChartControl = new Treemap({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/AreaStacked":
            case "com.sap.vocabularies.UI.v1.ChartType/AreaStacked100":
            case "com.sap.vocabularies.UI.v1.ChartType/BarStacked":
            case "com.sap.vocabularies.UI.v1.ChartType/BarStacked100":
            case "com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked":
            case "com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked100":
            case "com.sap.vocabularies.UI.v1.ChartType/Radar":
            case "com.sap.vocabularies.UI.v1.ChartType/Waterfall":
                break;
        }
        if (oChartControl) {
            if (oTitle && oTitle.String) {
                oChartControl.setTitle(new Title({
                    visible: true,
                    text: oTitle.String
                }));
            }
            if (oDescription && oDescription.String) {
                oChartControl.setTooltip(oDescription.String);
            }
            oChartControl.setWidth("100%");
            oChartControl.setHeight("17rem");
            oChartControl.setDataset(oDataset);
        } else {
            oChartControl = new Text({});
        }
        return oChartControl;
    };

    /**
     * Returns tile height in rem, depending on device type and number of segments the tile consists of.
     * @param {number=} [iSegments=1] Number of segments the tile will take vertically in the grid (optional).
     *   Currently expected values are 1, 2, 3, however any positive number is supported.
     *   Default value is 1.
     * @return {string} Tile height in rem.
     */
    var getTeaserTileHeight = function (iSegments) {
        var iReturn;
        iSegments = iSegments || 1;
        if (jQuery.device.is.phone) {
            iReturn = (7 * iSegments) + "rem";
        } else {
            iReturn = (11 * iSegments - 1) + "rem";
        }
        return iReturn;
    };

    var getFieldSumsByPriority = function (aFields) {
        var iFieldsWithPrioHigh = 0, iFieldsWithPrioMedium = 0, iFieldsWithPrioLow = 0, i, oImportance;
        for (i = 0; i < aFields.length; i += 1) {
            oImportance = getImportanceOfRecord(aFields[i]);
            if (oImportance) {
                switch (oImportance) {
                    case "High":
                        iFieldsWithPrioHigh += 1;
                        break;
                    case "Medium":
                        iFieldsWithPrioMedium += 1;
                        break;
                    case "Low":
                        iFieldsWithPrioLow += 1;
                        break;
                }
            }
        }
        return { High: iFieldsWithPrioHigh, Medium: iFieldsWithPrioMedium, Low: iFieldsWithPrioLow };
    };

    /**
     * Returns the importance (High, Medium, Low) of a given record.
     * Necessary as the annotation for importance changed in OData V4 and we'd like to support both V2 and V4.
     * @param {object} oRecord as object.
     * @return {string} Importance of the record (High, Medium, Low).
     */
    var getImportanceOfRecord = function (oRecord) {
        var sEnumMember = "";
        if (oRecord.Importance) {
            sEnumMember = oRecord.Importance.EnumMember;
        } else if (oRecord["com.sap.vocabularies.UI.v1.Importance"]) {
            sEnumMember = oRecord["com.sap.vocabularies.UI.v1.Importance"].EnumMember;
        }
        return sEnumMember.substr(sEnumMember.indexOf("/") + 1);
    };

    var kpiTileFactory = function (oModel, aDataPoint, sEntityType, sBindingPath) {
        var bIsNumeric = false, oTile, fractionDigits, oBinding, oBindingInfo;
        oTile = new KpiTile({
            doubleFontSize: false
        });
        // Set ValueFormat
        if (aDataPoint.ValueFormat) {
            fractionDigits = aDataPoint.ValueFormat.NumberOfFractionalDigits.Int;
        }
        if (aDataPoint.Title && aDataPoint.Title.String) {
            oTile.setDescription(aDataPoint.Title.String);
        } else if (aDataPoint.Title && aDataPoint.Title.Path) {
            oTile.bindProperty("description", { path: aDataPoint.Title.Path });
        }
        if (aDataPoint.Value && aDataPoint.Value.String) {
            oTile.setValue(aDataPoint.Value.String);
        } else if (aDataPoint.Value && aDataPoint.Value.Path) {
            oBinding = fieldBinding(aDataPoint.Value, aDataPoint.Value.EdmType, sEntityType);
            // HANA Live
            if (oBinding.fnChange) {
                oTile.setModel(oModel);
                oTile.bindElement(sBindingPath);
                oTile.getElementBinding().attachChange(oBinding.fnChange, oTile);
            }
            if (oBinding.String) {
                // Live KPIs detected
                if ($.isNumeric(oBinding.String)) {
                    bIsNumeric = true;
                    oTile.setValue(kpiValueFormatter(oBinding.String, fractionDigits));
                } else {
                    oTile.setValue(oBinding.String);
                }
            } else if (oBinding.BindingInfo) {
                // Check for currencies/unit of measures
                oBindingInfo = oBinding.BindingInfo;
                if (oBindingInfo.parts && oBindingInfo.parts.length === 2) {
                    oTile.bindProperty("valueUnit", oBindingInfo.parts[0]);
                    oBindingInfo.parts[1].type = undefined;
                    oBindingInfo.parts[1].formatter = (function () {
                        return function (value) {
                            return kpiValueFormatter(value, fractionDigits);
                        };
                    }(fractionDigits));
                    oTile.bindProperty("value", oBindingInfo.parts[1]);
                } else if (oBindingInfo.parts && oBindingInfo.parts.length === 1) {
                    oBindingInfo.parts[0].type = undefined;
                    oBindingInfo.parts[0].formatter = (function () {
                        return function (value) {
                            return kpiValueFormatter(value, fractionDigits);
                        };
                    }(fractionDigits));
                    oTile.bindProperty("value", oBindingInfo);
                } else {
                    oTile.bindProperty("value", oBindingInfo);
                }
            }
        }
        // Set font size
        if (aDataPoint.Value.EdmType === "Edm.Decimal" || aDataPoint.Value.EdmType === "Edm.Double" || aDataPoint.Value.EdmType === "Edm.Single" ||
            aDataPoint.Value.EdmType === "Edm.Int16" || aDataPoint.Value.EdmType === "Edm.Int32" || aDataPoint.Value.EdmType === "Edm.Int64" ||
            bIsNumeric === true) {
            oTile.setDoubleFontSize(true);
        }
        return oTile;
    };

    //Workaround: no Link if no authority
    var getSemObjectsFromAnnotation = function (oMetadata) {
        var aRelatedObjects = [], aRelObjToProcess = [], sSemanticObject, i, key;
        var getSemanticObjects = function (oObject) {
            if (collectSemanticObject(oObject) === false) {
                if (Array.isArray(oObject)) {
                    for (i = 0; i < oObject.length; i += 1) {
                        collectSemanticObject(oObject[i]);
                    }
                } else if (typeof oObject === "object") {
                    for (key in oObject) {
                        if (oObject.hasOwnProperty(key)) {
                            if (oObject[key].constructor !== String) {
                                getSemanticObjects(oObject[key]);
                            }
                        }
                    }
                }
            }
        };
        var collectSemanticObject = function (oObject) {
            if (oObject.RecordType && oObject.RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
                if (oObject.Url && oObject.Url.Apply) {
                    sSemanticObject = oObject.Url.Apply.Parameters[0].Value.slice(oObject.Url.Apply.Parameters[0].Value.indexOf("#") + 1, oObject.Url.Apply.Parameters[0].Value.indexOf("-"));
                    if (aRelatedObjects.indexOf(sSemanticObject) < 0) {
                        aRelatedObjects.push(sSemanticObject);
                    }
                    return true;
                }
            } else {
                return false;
            }
        };
        for (key in oMapping) {
            if (oMapping.hasOwnProperty(key)) {
                if (key.indexOf(oMetadata.dataServices.schema[0].namespace) >= 0) {
                    getSemanticObjects(oMapping[key]);
                }
            }
        }
        for (i = 0; i < aRelatedObjects.length; i += 1) {
            if (!oLinkAuthorised.hasOwnProperty(aRelatedObjects[i])) {
                aRelObjToProcess.push(aRelatedObjects[i]);
            }
        }
        return aRelObjToProcess;
    };

    var callInteropService = function (aRelObjToProcess) {
        var i, oJSONModel, sLink, sFilter;
        if (aRelObjToProcess.length > 0) {
            oJSONModel = new JSONModel();
            sLink = "/sap/opu/odata/UI2/INTEROP/SemanticObjects?$expand=Links&$format=json";
            sFilter = "&$filter=id%20eq%20%27";
            for (i = 0; i < aRelObjToProcess.length; i += 1) {
                if (sFilter.length > 22) {
                    sFilter += "%20or%20id%20eq%20%27" + aRelObjToProcess[i] + "%27";
                } else {
                    sFilter += aRelObjToProcess[i] + "%27";
                }
            }
            sLink += sLink + sFilter;
            oJSONModel.loadData(sLink);
            oJSONModel.attachRequestCompleted(function () {
                var aLinks = [], i, j, types;
                if (this.getData().d && this.getData().d.results) {
                    types = this.getData().d.results;
                    for (i = 0; i < types.length; i += 1) {
                        oLinkAuthorised[types[i].id] = "";
                        aLinks = types[i].Links.results;
                        for (j = 0; j < aLinks.length; j += 1) {
                            oLinkAuthorised[aLinks[j].id.slice(0, aLinks[j].id.indexOf("~"))] = "";
                        }
                    }
                }
                oLinkAuthorised.InteropCompleted = true;
                checkLinks();
            });
        } else {
            oLinkAuthorised.InteropCompleted = true;
        }
    };

    var checkLinks = function (index) {
        var i, j, k, n, aItems, aCells, aLinks;
        if (oLinkAuthorised.InteropCompleted === true) {
            for (i = 0; i < aAllFacets.length; i += 1) {
                if (aAllFacets[i].bLoaded && !aAllFacets[i].bProcessed && aAllFacets[i].Links) {
                    aLinks = aAllFacets[i].Links;
                    for (j = 0; j < aLinks.length; j += 1) {
                        if (oLinkAuthorised.hasOwnProperty(aLinks[j].sIntend) === true) {
                            if (aAllFacets[i].bIsTable === true) {
                                if (aAllFacets[i].oTableItems) {
                                    aItems = aAllFacets[i].oTableItems;
                                    for (k = 0; k < aItems.length; k += 1) {
                                        aCells = aItems[k].getCells();
                                        for (n = 0; n < aCells.length; n += 1) {
                                            if (aCells[n] instanceof VerticalLayout &&
                                                aCells[n].getContent()[0].getBindingInfo("href").parts === aLinks[j].oVL.getContent()[0].getBindingInfo("href").parts &&
                                                aCells[n].getContent()[1].getBindingInfo("text").parts === aLinks[j].oVL.getContent()[1].getBindingInfo("text").parts) {
                                                aCells[n].getContent()[0].setVisible(true);
                                                aCells[n].getContent()[1].setVisible(false);
                                            }
                                        }
                                    }
                                }
                            } else {
                                aLinks[j].oVL.getContent()[0].setVisible(true);
                                aLinks[j].oVL.getContent()[1].setVisible(false);
                            }
                        } else if (aAllFacets[i].bIsTable === false) {
                            aLinks[j].oVL.getContent()[1].setText(aLinks[j].oVL.getContent()[0].getText());
                        }
                        aAllFacets[i].bProcessed = true;
                    }
                }
            }
        }
        if (index >= 0) {
            if (aAllFacets[index].bLoaded && !aAllFacets[index].bProcessed && aAllFacets[index].Links) {
                aLinks = aAllFacets[index].Links;
                for (j = 0; j < aLinks.length; j += 1) {
                    if (aAllFacets[index].bIsTable === false) {
                        aLinks[j].oVL.getContent()[1].setText(aLinks[j].oVL.getContent()[0].getText());
                    }
                }
            }
        }
    };
    //Workaround: no Link if no authority

    var thingInspectorFactory = function (sUri, sAnnotationUri, oTI) {
        var oContent = {}, aOperations = [], iFieldsWithPrioHigh = 0, iFieldsWithPrioMedium = 0, numKpiTiles = 0,
            i, j, sService, oModel, sEntitySet, sBindingPath, oMetadata, sEntityType, oHeaderInfo, aFacets, sNavPath, functionParameters,
            sBusinessParams, oGeneralFacet, oLinks, oTransactionSheet, oActionSheet, sAnnotationUriPath, sAnnotationUriAppAndFilename,
            oSapSuiteRb, iMaxItemsInGeneral, sUseTerm, sNavEntitySet, sEntitySetForFacet, sNavEntityType, sEntityTypeForFacet, aFacetContent,
            oImportance, sBatchPath, iFreeSpaceBuffer, aContent, oFieldSumsByPriority, iFieldsOnOverview, oFormLayout, sGeneralTileHeight,
            oAddBookmarkButton, iRowSpan, oFacet, oGeoContent, sNavType, sCardinality, parameters, oEmailBtn, key, aDataPoint, sTerm, sHeight;
        sService = getServiceFromUri(sUri);
        //Because of a bug in icm the bsp application name and file name must be in lower case
        sAnnotationUriPath = sAnnotationUri.substring(0, sAnnotationUri.substring(0, sAnnotationUri.lastIndexOf("/")).lastIndexOf("/"));
        sAnnotationUriAppAndFilename = sAnnotationUri.substring(sAnnotationUri.substring(0, sAnnotationUri.lastIndexOf("/")).lastIndexOf("/"));
        //Transformation to lowercase can be prohibited by adding the encoded url parameter "cbn_keep_anno_case" with value "true".
        if (window.location.search.indexOf("cbn_keep_anno_case%3Dtrue") === -1) {
            sAnnotationUriAppAndFilename = sAnnotationUriAppAndFilename.toLowerCase();
        }
        oModel = new ODataModel(
            sService,
            { annotationURI: sAnnotationUriPath + sAnnotationUriAppAndFilename, loadAnnotationsJoined: true, loadMetadataAsync: false, json: true }
        );
        oModel.setCountSupported(false);
        oTI.setModel(oModel);
        sEntitySet = getEntitySetFromUri(sUri, oModel);
        sBindingPath = "/" + sUri.slice(sService.length);
        oMetadata = oModel.getServiceMetadata();
        oMapping = oModel.getServiceAnnotations();
        sEntityType = getEntityType(sEntitySet, oMetadata);
        oHeaderInfo = oMapping[sEntityType]["com.sap.vocabularies.UI.v1.HeaderInfo"];
        aFacets = oMapping[sEntityType]["com.sap.vocabularies.UI.v1.Facets"];
        oTI.bindElement(sBindingPath, getExpand(sEntitySet, oMetadata));
        oSapSuiteRb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

        //Workaround: no Link if no authority
        oLinkAuthorised.InteropCompleted = false;
        callInteropService(getSemObjectsFromAnnotation(oMetadata));
        //Workaround: no Link if no authority

        // Begin of rendering

        // Add a business object specific style class for branding
        oTI.addStyleClass("sapFactsheetUtiThingType" + sEntitySet.replace(/\s/g, ""));

        // Factsheet title e. g. "Article", "Sales Order", etc.
        if (oHeaderInfo.TypeName.String) {
            oTI.setTitle(oHeaderInfo.TypeName.String);
        } else if (oHeaderInfo.TypeName.Path) {
            oTI.bindProperty("title", { path: oHeaderInfo.TypeName.Path });
        }

        // Optional image/icon to the left of the title
        if (oHeaderInfo.ImageUrl && oHeaderInfo.ImageUrl.String) {
            oTI.setIcon(oHeaderInfo.ImageUrl.String);
        } else if (oHeaderInfo.ImageUrl && oHeaderInfo.ImageUrl.Path) {
            oTI.bindProperty("icon", { path: oHeaderInfo.ImageUrl.Path });
        } else if (oHeaderInfo.TypeImageUrl && oHeaderInfo.TypeImageUrl.String) {
            oTI.setIcon(oHeaderInfo.TypeImageUrl.String);
        } else if (oHeaderInfo.TypeImageUrl && oHeaderInfo.TypeImageUrl.Path) {
            oTI.bindProperty("icon", { path: oHeaderInfo.TypeImageUrl.Path });
        }

        // Name and description of the factsheet
        if (oHeaderInfo.Title.Value.String) {
            oTI.setName(oHeaderInfo.Title.Value.String);
        } else {
            oTI.bindProperty("name", fieldBinding(oHeaderInfo.Title.Value, oHeaderInfo.Title.EdmType, sEntityType).BindingInfo);
        }
        if (oHeaderInfo.Description && oHeaderInfo.Description.Value) {
            if (oHeaderInfo.Description.Value.String) {
                oTI.setDescription(oHeaderInfo.Description.Value.String);
            } else {
                oTI.bindProperty("description", fieldBinding(oHeaderInfo.Description.Value, oHeaderInfo.Description.EdmType, sEntityType).BindingInfo);
            }
        }

        // KPI tiles
        for (key in oMapping[sEntityType]) {
            if (oMapping[sEntityType].hasOwnProperty(key)) {
                if (key.search("com.sap.vocabularies.UI.v1.DataPoint") !== -1) {
                    aDataPoint = oMapping[sEntityType][key];
                    if (aDataPoint) {
                        oTI.addKpi(kpiTileFactory(oModel, aDataPoint, sEntityType, sBindingPath));
                        numKpiTiles += 1;
                    }
                }
                // max. 3 KPIs supported
                if (numKpiTiles >= 3) {
                    break;
                }
            }
        }

        // General facet
        for (i = 0; i < aFacets.length; i += 1) {
            if (aFacets[i]["com.sap.vocabularies.UI.v1.IsSummary"]) {
                oGeneralFacet = aFacets[i];
                break;
            }
        }
        if (oGeneralFacet) {
            iMaxItemsInGeneral = 15;
            for (j = 0; j < oGeneralFacet.Facets.length; j += 1) {
                sUseTerm = oGeneralFacet.Facets[j].Target.AnnotationPath.substring(oGeneralFacet.Facets[j].Target.AnnotationPath.lastIndexOf("@") + 1);
                sNavPath = oGeneralFacet.Facets[j].Target.AnnotationPath;
                sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                oGeneralFacet.Facets[j].NavPath = sNavPath;
                sNavEntitySet = getNavEntitySet(sEntitySet, sNavPath, oMetadata);
                oGeneralFacet.Facets[j].NavEntitySet = sNavEntitySet;
                if (sNavEntitySet) {
                    sEntitySetForFacet = sNavEntitySet;
                } else {
                    sEntitySetForFacet = sEntitySet;
                }
                oGeneralFacet.Facets[j].EntitySet = sEntitySetForFacet;
                sNavEntityType = getEntityType(sNavEntitySet, oMetadata);
                if (sNavEntityType) {
                    sEntityTypeForFacet = sNavEntityType;
                } else {
                    sEntityTypeForFacet = sEntityType;
                }
                oGeneralFacet.Facets[j].EntityType = sEntityTypeForFacet;
                aFacetContent = [];
                if (oMapping[sEntityTypeForFacet][sUseTerm].length) {
                    aFacetContent = oMapping[sEntityTypeForFacet][sUseTerm];
                } else if (oMapping[sEntityTypeForFacet][sUseTerm].Data.length) {
                    aFacetContent = oMapping[sEntityTypeForFacet][sUseTerm].Data;
                }
                oGeneralFacet.Facets[j].Content = aFacetContent;
                for (i = 0; i < aFacetContent.length; i += 1) {
                    oImportance = getImportanceOfRecord(aFacetContent[i]);
                    if (oImportance === "High") {
                        iFieldsWithPrioHigh += 1;
                    } else if (oImportance === "Medium") {
                        iFieldsWithPrioMedium += 1;
                    }
                }
            }
            if (iFieldsWithPrioHigh >= iMaxItemsInGeneral) {
                iFieldsWithPrioHigh = iMaxItemsInGeneral;
                iFieldsWithPrioMedium = 0;
            } else if ((iFieldsWithPrioHigh + iFieldsWithPrioMedium) > iMaxItemsInGeneral) {
                iFieldsWithPrioMedium = iMaxItemsInGeneral - iFieldsWithPrioHigh;
                if (iFieldsWithPrioMedium < 0) {
                    iFieldsWithPrioMedium = 0;
                }
            }
            // On mobile phones only fields with priority high should be displayed
            if (jQuery.device.is.phone) {
                iFieldsWithPrioMedium = 0;
            }
            iFreeSpaceBuffer = iMaxItemsInGeneral - iFieldsWithPrioHigh - iFieldsWithPrioMedium;
            oFacet = new FacetOverview({
                title: oSapSuiteRb.getText("UNIFIEDTHINGINSPECTOR_GENERAL_INFORMATION_HEADER_TEXT")
            });
            aAllFacets = [];
            aAllFacets.push(oFacet);
            aAllFacets[0].bLoaded = false;
            aAllFacets[0].bProcessed = false;
            aAllFacets[0].bIsTable = false;
            aContent = [];
            iFieldsOnOverview = iFieldsWithPrioMedium + iFieldsWithPrioHigh;
            for (j = 0; j < oGeneralFacet.Facets.length; j += 1) {
                oFormLayout = formLayoutFactory(oModel, oGeneralFacet.Facets[j].EntitySet, oGeneralFacet.Facets[j].Content, {
                    High: iFieldsWithPrioHigh,
                    Medium: iFieldsWithPrioMedium,
                    Low: 0
                }, null, oFacet).addStyleClass("sapFactsheetUtiTilePadding");
                if (j > 0) {
                    oFormLayout.addStyleClass("sapFactsheetUtiPaddingTop");
                }
                if (oGeneralFacet.Facets[j].NavPath) {
                    oFormLayout.bindElement(sBindingPath + "/" + oGeneralFacet.Facets[j].NavPath);
                }
                oFieldSumsByPriority = getFieldSumsByPriority(oGeneralFacet.Facets[j].Content);
                iFieldsWithPrioHigh -= oFieldSumsByPriority.High;
                iFieldsWithPrioMedium -= oFieldSumsByPriority.Medium;
                if (((oFieldSumsByPriority.High > 0) && ((iFieldsWithPrioHigh + oFieldSumsByPriority.High) > 0)) ||
                    ((oFieldSumsByPriority.Medium > 0) && ((iFieldsWithPrioMedium + oFieldSumsByPriority.Medium) > 0))) {
                    aContent.push(oFormLayout);
                    /*
                    If there is more than one facet there will be some space between the facets.
                    Because of this the number of fields to be displayed must be reduced.
                    */
                    if (j > 0) {
                        if (iFreeSpaceBuffer > 0) {
                            iFreeSpaceBuffer -= 1;
                        } else if (iFieldsWithPrioMedium > 0) {
                            iFieldsWithPrioMedium -= 1;
                        } else if (iFieldsWithPrioHigh > 0) {
                            iFieldsWithPrioHigh -= 1;
                        }
                    }
                }
                if ((iFieldsWithPrioHigh < 1) && (iFieldsWithPrioMedium < 1)) {
                    break;
                }
            }
            if (iFieldsWithPrioHigh < 0) {
                iFieldsWithPrioHigh = 0;
            }
            if (iFieldsWithPrioMedium < 0) {
                iFieldsWithPrioMedium = 0;
            }
            oContent = new VerticalLayout({ content: aContent, width: "100%" });
            sGeneralTileHeight = getTeaserTileHeight();
            iRowSpan = 1;
            if ((iFieldsOnOverview > 3) && (iFieldsOnOverview <= 9)) {
                sGeneralTileHeight = getTeaserTileHeight(2);
                iRowSpan = 2;
            } else if (iFieldsOnOverview > 9) {
                sGeneralTileHeight = getTeaserTileHeight(3);
                iRowSpan = 3;
            }
            oFacet.setContent(oContent);
            oFacet.setRowSpan(iRowSpan);
            if (jQuery.device.is.phone) {
                oFacet.setHeightType(FacetOverviewHeight.Auto);
            } else {
                oFacet.setHeight(sGeneralTileHeight);
            }
            oFacet.addStyleClass("sapFactsheetUtiGeneralInformationOverviewFacet");
            oFacet.attachPress({ facets: oGeneralFacet }, function (oEvent, oData) {
                var sDefaultSpan, oGrid, oTG, oVL, oContent;
                oTI.removeAllFacetContent();
                oTG = new UnifiedThingGroup();
                oTG.setDescription(getTIDescription());
                oTG.setTitle(oSapSuiteRb.getText("UNIFIEDTHINGINSPECTOR_GENERAL_INFORMATION_HEADER_TEXT"));
                oTG.addStyleClass("sapFactsheetUtiGeneralInformationUtg");
                if (oData.facets.Facets.length > 1) {
                    sDefaultSpan = "L6 M12 S12";
                } else {
                    sDefaultSpan = "L12 M12 S12";
                }
                aAllFacets[0].Links = [];
                oVL = new VerticalLayout({ width: "100%" });
                for (i = 0; i < oData.facets.Facets.length; i += 1) {
                    if (i % 2 === 0) {
                        oGrid = new Grid({
                            hSpacing: 1,
                            vSpacing: 1,
                            defaultSpan: sDefaultSpan
                        });
                    }
                    oContent = facetFactory(oModel, sEntitySet, oData.facets.Facets[i], sBindingPath, this);
                    oContent.addStyleClass("sapFactsheetUtiGeneralInformationUtgContent");
                    if ((i === 0) && (oData.facets.Facets.length > 1) && (oContent.getTitle().trim() === "")) {
                        oContent.setTitle(oSapSuiteRb.getText("UNIFIEDTHINGINSPECTOR_GENERAL_INFORMATION_HEADER_TEXT"));
                    }
                    oGrid.addContent(oContent);
                    if (i % 2 !== 0) {
                        oVL.addContent(oGrid);
                    }
                }
                //Workaround: no Link if no authority
                aAllFacets[0].bLoaded = true;
                aAllFacets[0].bProcessed = false;
                aAllFacets[0].bIsTable = false;
                checkLinks(0);
                //Workaround: no Link if no authority
                if (i % 2 !== 0) {
                    oVL.addContent(oGrid);
                }
                oTG.setContent(oVL);
                oTI.addFacetContent(oTG);
                oTI.navigateToDetail();
            });
            oTI.addFacet(oFacet);
        }

        // Callback method of the oData reads for the geofacet
        var oDataReadCallbackGeo = function (functionParameters) {
            return function (data) {
                var i, oGeoModel, oGeoLocation, sPos, oNewFlags, oJsonModel, sBindingPath, oContentAddress, oHeaderInfoGeo,
                    oIdentificationGeo, oContentTitle, oContentDescription, oContentDetail, sCaption, iCount;
                if ((functionParameters.cardinality === "*" && data.results && data.results.length && data.results.length !== 0) ||
                    (functionParameters.cardinality === "1" && data)) {
                    oJsonModel = new JSONModel();
                    if (functionParameters.cardinality === "*") {
                        if (data.results && data.results.length) {
                            oJsonModel.setData(data);
                        }
                    } else {
                        oJsonModel.setData({ result: data });
                        sBindingPath = "/result";
                    }
                    oGeoModel = new ODataModel("/sap/opu/odata/sap/VBI_APPL_DEF_SRV", false);
                    oGeoLocation = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.GeoLocation"];
                    oHeaderInfoGeo = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.HeaderInfo"];
                    oIdentificationGeo = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.Identification"];
                    if (oGeoLocation.Longitude && oGeoLocation.Latitude) {
                        oNewFlags = {
                            "Data": {
                                "Set": {
                                    "N": [{
                                        "name": "Spots",
                                        "E": []
                                    }]
                                }
                            }
                        };
                        if (functionParameters.cardinality === "1") {
                            if (oGeoLocation.Longitude.Path && oGeoLocation.Latitude.Path) {
                                sPos = data[oGeoLocation.Longitude.Path] + ";" + data[oGeoLocation.Latitude.Path] + ";0";
                            }
                            oNewFlags.Data.Set.N[0].E.push({ "A": sPos, "I": "pin_blue.png" });
                        } else {
                            for (i = 0; i < data.results.length; i += 1) {
                                if (oGeoLocation.Longitude.Path && oGeoLocation.Latitude.Path) {
                                    sPos = data.results[i][oGeoLocation.Longitude.Path] + ";" + data.results[i][oGeoLocation.Latitude.Path] + ";0";
                                }
                                oNewFlags.Data.Set.N[0].E.push({ "A": sPos, "I": "pin_blue.png" });
                            }
                            // Set to first position
                            if (data.results.length !== 0) {
                                sPos = data.results[0][oGeoLocation.Longitude.Path] + ";" + data.results[0][oGeoLocation.Latitude.Path] + ";0";
                            }
                        }
                    }
                    iCount = parseInt(data.__count, 10);
                    if (Number(iCount)) {
                        functionParameters.facet.setQuantity(iCount);
                    }
                    var submitListener = function (oEvent) {
                        var oEventJSON, sSpot, oPopupJSON, popUpHeight, popUpWidth;
                        // Get the Spot on which was clicked
                        oEventJSON = $.parseJSON(oEvent.getParameters().data);
                        if (oEventJSON.Action.name === "DETAIL_REQUEST" && oEventJSON.Action.instance) {
                            sSpot = oEventJSON.Action.instance;
                            // Parse index of clicked Spot
                            if (oJsonModel.oData.results) {
                                sBindingPath = "/results/" + sSpot.split(".")[1];
                            }
                            sCaption = oHeaderInfoGeo.TypeName.String.substring(0, 17); // caption must not be to long!
                            // Create JSON for Pop-Up
                            popUpHeight = parseFloat(getTeaserTileHeight(0.7)) * 16; // popup does not support rem -> do crude conversion
                            popUpWidth = parseFloat(getTeaserTileHeight(1.5)) * 16;
                            oPopupJSON = {
                                "SAPVB": {
                                    "version": "2.0",
                                    "xmlns:VB": "VB",
                                    "Windows": {
                                        "Remove": { "name": "Detail1" },
                                        "Set": {
                                            "name": "Detail1",
                                            "Window": {
                                                "id": "Detail1",
                                                "type": "callout",
                                                "refParent": "Main",
                                                "refScene": "",
                                                "offsetX": "16",
                                                "offsetY": "-27",
                                                "modal": "false",
                                                "width": popUpWidth,
                                                "height": popUpHeight,
                                                "caption": sCaption,
                                                "pos.bind": sSpot + ".GeoPosition"
                                            }
                                        }
                                    },
                                    "Scenes": {
                                        "Set": {
                                            "name": "Details",
                                            "Scene": {
                                                "id": "Details",
                                                "navControlVisible": "false"
                                            }
                                        }
                                    }
                                }
                            };
                            this.load(oPopupJSON);
                        }
                    };
                    var openWindowListener = function (oEvent) {
                        var key, sPopUpWidth, sNavEntitySet, iMaxFields;
                        if (!oContentTitle) {
                            // Content of Pop-Up doesn't exist yet.
                            // Get title and description of Pop-Up from HeaderInfo Term
                            oContentTitle = dataField(oHeaderInfoGeo.Title, functionParameters.navigationType, oMetadata, functionParameters.facet);
                            oContentTitle.setModel(oJsonModel);
                            oContentTitle.bindElement(sBindingPath);
                            oContentDescription = dataField(oHeaderInfoGeo.Description, functionParameters.navigationType, oMetadata, functionParameters.facet);
                            oContentDescription.setModel(oJsonModel);
                            oContentDescription.bindElement(sBindingPath);
                            // Get formatted address from property "label"
                            for (key in oGeoLocation.Address) {
                                if (key === "label") {
                                    oContentAddress = dataField({ Value: oGeoLocation.Address[key] }, functionParameters.navigationType, oMetadata, functionParameters.facet);
                                    oContentAddress.setModel(oJsonModel);
                                    oContentAddress.bindElement(sBindingPath);
                                    break;
                                }
                            }
                            // Calculate maximal number of displayed high fields depending on device
                            iMaxFields = 7; //Default value for desktop
                            if (jQuery.device.is.tablet && jQuery.device.is.landscape) {
                                iMaxFields = 4;
                            } else if (jQuery.device.is.tablet && jQuery.device.is.portrait) {
                                iMaxFields = 5;
                            } else if (jQuery.device.is.phone && jQuery.device.is.landscape) {
                                iMaxFields = 2;
                            } else if (jQuery.device.is.phone && jQuery.device.is.portrait) {
                                iMaxFields = 3;
                            }
                            // Create a content for the additional fields with maximally 7 prio high field from Identification Term
                            oContentDetail = new VerticalLayout({ width: "100%" }).setModel(oModel);
                            if (functionParameters.navigationPath) {
                                // GeoData is on subnode
                                sNavEntitySet = getNavEntitySet(functionParameters.entitySet, functionParameters.navigationPath, oMetadata);
                                oContentDetail.addContent(formLayoutFactory(oModel, sNavEntitySet, oIdentificationGeo, { High: iMaxFields }, null, functionParameters.facet));
                                oContentDetail.setModel(oJsonModel).bindElement(sBindingPath);
                            } else {
                                // GeoData is on root node
                                oContentDetail.addContent(formLayoutFactory(oModel, functionParameters.entitySet, oIdentificationGeo,
                                    { High: iMaxFields }, null, functionParameters.facet)).setModel(oJsonModel).bindElement(sBindingPath);
                            }
                        } else {
                            // Content of Pop-Up exists, rebind elements
                            oContentTitle.bindElement(sBindingPath);
                            if (oContentDescription) {
                                oContentDescription.bindElement(sBindingPath);
                            }
                            if (oContentAddress) {
                                oContentAddress.bindElement(sBindingPath);
                            }
                            if (oContentDetail) {
                                oContentDetail.bindElement(sBindingPath);
                            }
                        }
                        sPopUpWidth = parseFloat(getTeaserTileHeight(1.5)) * 16 * 0.95 + "px"; // Popup does not support rem -> do crude conversion
                        if (oContentTitle) {
                            oContentTitle.placeAt(oEvent.getParameter("contentarea").id);
                            oContentTitle.addStyleClass("sapFactsheetUtiGeoPopupHead");
                            if (jQuery.device.is.phone) {
                                oContentTitle.addStyleClass("sapFactsheetUtiGeoPopupHeadFontPhone");
                            }
                            oContentTitle.setWidth(sPopUpWidth);
                        }
                        if (oContentDescription) {
                            oContentDescription.placeAt(oEvent.getParameter("contentarea").id);
                            oContentDescription.addStyleClass("sapFactsheetUtiGeoPopupDescr");
                            if (jQuery.device.is.phone) {
                                oContentDescription.addStyleClass("sapFactsheetUtiGeoPopupDescrFontPhone");
                            }
                            oContentDescription.setWidth(sPopUpWidth);
                        }
                        if (oContentAddress) {
                            oContentAddress.placeAt(oEvent.getParameter("contentarea").id);
                            oContentAddress.addStyleClass("sapFactsheetUtiGeoPopupText");
                            oContentAddress.setWidth(sPopUpWidth);
                        }
                        // If no Content available then don't show the control with "No Data"
                        if (oContentDetail && oContentDetail.getContent()[0] && oContentDetail.getContent()[0].getContent
                            && oContentDetail.getContent()[0].getContent().length > 0) {
                            oContentDetail.placeAt(oEvent.getParameter("contentarea").id);
                            oContentDetail.addStyleClass("sapFactsheetUtiGeoPopupText");
                            oContentDetail.setWidth(sPopUpWidth);
                        }
                        //Workaround: no Link if no authority
                        if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                            aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = true;
                            aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                            aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = false;
                        }
                        checkLinks(aAllFacets.indexOf(functionParameters.facet));
                        //Workaround: no Link if no authority
                    };
                    var closeWindowListener = function (oEvent) {
                        if (oContentTitle) {
                            oContentTitle.destroy();
                            oContentTitle = undefined;
                        }
                        if (oContentDescription) {
                            oContentDescription.destroy();
                            oContentDescription = undefined;
                        }
                        if (oContentAddress) {
                            oContentAddress.destroy();
                            oContentAddress = undefined;
                        }
                        if (oContentDetail) {
                            oContentDetail.destroy();
                            oContentDetail = undefined;
                        }
                        $(oEvent.getParameter("contentarea").id).empty();
                    };
                    var processGeoApplication = function (functionParameters) {
                        return function (data) {
                            var oGeoJSON, oGeoContentDetail, oTG, sJSON, i;
                            sJSON = data.ProjectJSON;
                            sJSON = sJSON.indexOf("{") ? sJSON.substr(sJSON.indexOf("{")) : sJSON; // Workaround: to get rid of a BOM character at the first position
                            oGeoJSON = $.parseJSON(sJSON);
                            oGeoJSON.SAPVB.Scenes.Set.SceneGeo.initialStartPosition = sPos;
                            oGeoJSON.SAPVB.Scenes.Set.SceneGeo.initialZoom = 12;
                            // Register click/touch event on map
                            oGeoJSON.SAPVB.Actions.Set.Action.push({
                                id: "200",
                                name: "TAP_ON_MAP",
                                refEvent: "Click",
                                refScene: "MainScene",
                                refVO: "Map"
                            });
                            if (oNewFlags) {
                                oGeoJSON.SAPVB.Data = oNewFlags.Data;
                            }
                            // Workaround: for the Spots set the scale attribute to a vector (x,y,z)
                            for (i = 0; i < oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO.length; i += 1) {
                                if (oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO[i].datasource === "Spots") {
                                    if (oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO[i].scale && oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO[i].scale.split(";").length !== 3) {
                                        oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO[i].scale = "1.0;1.0;1.0";
                                        break;
                                    }
                                }
                            }
                            // listen to click/touch event on map on the overview tile
                            functionParameters.facet.getContent().attachSubmit(function (/*oEvent*/) {
                                // Workaround for mobile devices
                                // fire Press event if any action is done (touch/tap/zoom) on map on overview tile
                                if (jQuery.device.is.tablet || jQuery.device.is.phone) {
                                    functionParameters.facet.firePress();
                                }
                            });
                            functionParameters.facet.getContent().load(oGeoJSON);
                            functionParameters.facet.attachPress("", function (/*oEvent, oData*/) {
                                var aLong = [], aLat = [], i, newHeight;
                                // Create GeoMap content
                                if (!oGeoContentDetail) {
                                    oGeoContentDetail = new VBI({
                                        width: "100%",
                                        height: "100%",
                                        plugin: false,
                                        config: null
                                    });
                                    oGeoContentDetail.addStyleClass("sapFactsheetUtiGeoPopup");
                                }
                                oGeoJSON.SAPVB.Scenes.Set.SceneGeo.NavigationDisablement.move = "false";
                                oGeoJSON.SAPVB.Scenes.Set.SceneGeo.NavigationDisablement.zoom = "false";
                                oGeoJSON.SAPVB.Scenes.Set.SceneGeo.NavigationDisablement.pitch = "false";
                                oGeoJSON.SAPVB.Scenes.Set.SceneGeo.NavigationDisablement.yaw = "false";
                                oGeoJSON.SAPVB.Scenes.Set.SceneGeo.SuppressedNavControlVisibility = "false";
                                oGeoContentDetail.load(oGeoJSON);
                                // Collect longitude and latitude data of all locations
                                if (functionParameters.cardinality === "*") {
                                    for (i = 0; i < oJsonModel.oData.results.length; i += 1) {
                                        aLong.push(oJsonModel.oData.results[i][oGeoLocation.Longitude.Path]);
                                        aLat.push(oJsonModel.oData.results[i][oGeoLocation.Latitude.Path]);
                                    }
                                }
                                oGeoContentDetail.attachSubmit(submitListener);
                                oGeoContentDetail.attachOpenWindow(openWindowListener);
                                oGeoContentDetail.attachCloseWindow(closeWindowListener);
                                oTG = new UnifiedThingGroup({
                                    content: oGeoContentDetail,
                                    title: functionParameters.facetContent.Label.String,
                                    description: getTIDescription()
                                });
                                oTI.removeAllFacetContent();
                                oTI.addFacetContent(oTG);
                                oTI.navigateToDetail();
                                // Workaround: UnifiedThingGroup doesn't propagate the height property to the childs, therefore we calculate the height manually
                                oTI.attachAfterNavigate(aLong, function (oEvent) {
                                    if (oEvent.getParameters().getParameters().toId.indexOf("-detail-page") !== -1) {
                                        // Resize map to full container size on desktop and tablet and to 300px on phone
                                        if (jQuery.device.is.phone) {
                                            newHeight = "300px";
                                        } else {
                                            newHeight = Math.floor($("#" + oEvent.getParameters().getParameters().toId + "-cont").height() - 128) + "px";
                                        }
                                        oGeoContentDetail.setHeight(newHeight);
                                        // Zoom to show all locations
                                        if (aLong.length > 1) {
                                            oGeoContentDetail.zoomToGeoPosition(aLong, aLat);
                                        }
                                    }
                                });
                            });
                        };
                    };
                    var geoMapCallFailed = function (facet) {
                        return function (/*error*/) {
                            // OData returns an error. Don't display the map facet.
                            oTI.removeFacet(facet);
                        };
                    };
                    oGeoModel.read("VBIApplicationSet('ZFACTSHEETS')", "", "", false, processGeoApplication(functionParameters), geoMapCallFailed(functionParameters.facet));
                } else {
                    functionParameters.facet.setQuantity(undefined);
                    functionParameters.facet.addStyleClass("sapFactsheetUtiEmptyTile");
                    functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.S);
                    functionParameters.facet.setContent(undefined);
                    functionParameters.facet.setTitle(undefined);
                }
            };
        };

        // Callback method of the oData reads for the further facets
        var oDataReadCallback = function (functionParameters) {
            return function (data) {
                var sSeparator = "",
                    i, j, oJsonModel, oBadge, oTitle, oMainInfo, oHLayout, sSetTitle, oContent, iCount, oVLayoutForLabelValuePairs,
                    aPropertyExtensions, oHLayoutForTitle, oTitleLabel, oHLayoutForMainInfo, oMainInfoLabel, oHLayoutForSecondaryInfo,
                    oSecondaryInfoLabel, oSecondaryInfo, oImageUrl, oHLayoutForIconAndText, iSize, oImage, sAttribute, bResultNotEmpty,
                    oAnnotationPath, oChart, oLabel, aDimensions, aMeasures, oDataset;
                oJsonModel = new JSONModel();
                if (functionParameters.facetContent.Target && functionParameters.facetContent.Target.AnnotationPath
                    && functionParameters.facetContent.Target.AnnotationPath.split("#")[1]
                    && oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.Badge#" + functionParameters.facetContent.Target.AnnotationPath.split("#")[1]]) {
                    oBadge = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.Badge#" + functionParameters.facetContent.Target.AnnotationPath.split("#")[1]];
                } else {
                    oBadge = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.Badge"];
                }
                if (functionParameters.cardinality === "*") {
                    if (data.results && data.results.length) {
                        oAnnotationPath = functionParameters.facetContent.Target.AnnotationPath;
                        sTerm = oAnnotationPath.substring(oAnnotationPath.lastIndexOf("@") + 1);
                        if (sTerm === "com.sap.vocabularies.UI.v1.Chart") {
                            oChart = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.Chart"];
                            oLabel = oMapping.propertyExtensions[functionParameters.navigationType];
                            // Collect dimensions
                            aDimensions = [];
                            for (i = 0; i < oChart.Dimensions.length; i += 1) {
                                aDimensions.push({
                                    axis: 1,
                                    name: oLabel[oChart.Dimensions[i].PropertyPath]["http://www.sap.com/Protocols/SAPData"].label,
                                    value: "{" + oChart.Dimensions[i].PropertyPath + "}"
                                });
                            }
                            // Collect measures
                            aMeasures = [];
                            for (i = 0; i < oChart.Measures.length; i += 1) {
                                aMeasures.push({
                                    name: oLabel[oChart.Measures[i].PropertyPath]["http://www.sap.com/Protocols/SAPData"].label,
                                    value: "{" + oChart.Measures[i].PropertyPath + "}"
                                });
                            }
                            oDataset = new FlattenedDataset({
                                dimensions: aDimensions,
                                measures: aMeasures,
                                data: { path: "/results" }
                            });
                            oContent = chartControlFactory(oChart.ChartType.EnumMember, oChart.Title, oChart.Description, oDataset);
                            // Attach the model to the chart and display it
                            oContent.setModel(oJsonModel);
                            functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.XL);
                        } else {
                            oContent = new VerticalLayout({ width: "100%" }).addStyleClass("sapFactsheetUtiVLayoutPadding");
                            for (i = 0; i < data.results.length; i += 1) {
                                oHLayout = new HorizontalLayout().addStyleClass("sapFactsheetUtiHLayoutPadding");
                                oTitle = dataField(oBadge.Title, functionParameters.navigationType, oMetadata, functionParameters.facet);
                                if (oTitle.setWrapping) {
                                    oTitle.setWrapping(false);
                                }
                                sap.ui.getCore().byId(oTI.getId() + "-master-page").addDelegate({
                                    onAfterShow: (function (oHLayout) {
                                        return function () {
                                            var iHorizontalLayoutWidth, iHorizontalLayoutWidthLeft;
                                            iHorizontalLayoutWidth = oHLayout.getParent().getDomRef().clientWidth;
                                            iHorizontalLayoutWidthLeft = iHorizontalLayoutWidth;
                                            if (oHLayout.getContent()[0]) {
                                                iHorizontalLayoutWidthLeft -= oHLayout.getContent()[0].getDomRef().clientWidth;
                                                if (iHorizontalLayoutWidth < oHLayout.getContent()[0].getDomRef().clientWidth) {
                                                    oHLayout.getContent()[0].getDomRef().setAttribute("style", "width:" + iHorizontalLayoutWidth + "px");
                                                    return;
                                                }
                                            }
                                            if (oHLayout.getContent()[1]) {
                                                iHorizontalLayoutWidthLeft -= oHLayout.getContent()[1].getDomRef().clientWidth;
                                            }
                                            if (iHorizontalLayoutWidthLeft < 10) {
                                                iHorizontalLayoutWidthLeft = 0;
                                            }
                                            if (oHLayout.getContent()[2]) {
                                                oHLayout.getContent()[2].getDomRef().setAttribute("style", "width:" + iHorizontalLayoutWidthLeft + "px");
                                            }
                                        };
                                    }(oHLayout))
                                });
                                oJsonModel = new JSONModel();
                                oJsonModel.setData({ result: data.results[i] });
                                oTitle.setModel(oJsonModel);
                                oTitle.bindElement("/result");
                                sSetTitle = false;
                                if (data.results[i][oBadge.Title.Value.Path]) {
                                    sSetTitle = true;
                                }
                                if (oBadge.Title.Value.Apply) {
                                    for (j = 0; j < oBadge.Title.Value.Apply.Parameters.length; j += 1) {
                                        if (oBadge.Title.Value.Apply.Parameters[j].Type === "Path") {
                                            if (data.results[i][oBadge.Title.Value.Apply.Parameters[j].Value]) {
                                                sSetTitle = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                sSeparator = "";
                                if (sSetTitle) {
                                    oHLayout.addContent(oTitle);
                                    // Define the separator for the Tile values e.g. VALUE - VALUE or VALUE, VALUE
                                    if (oBadge.MainInfo && ((oBadge.MainInfo.EdmType && oBadge.MainInfo.EdmType === "Edm.Decimal") ||
                                        (oBadge.MainInfo.Value && oBadge.MainInfo.Value.Apply && oBadge.MainInfo.Value.Apply.Parameters[0]
                                            && oBadge.MainInfo.Value.Apply.Parameters[0].EdmType && oBadge.MainInfo.Value.Apply.Parameters[0].EdmType === "Edm.Decimal"))) {
                                        // Decimals
                                        sSeparator = "comma";
                                    } else if (oBadge.MainInfo && oBadge.MainInfo.Value.Path && data.results[i][oBadge.MainInfo.Value.Path]) {
                                        // Non decimal
                                        sSeparator = "dash";
                                    } else if (oBadge.MainInfo && oBadge.MainInfo.Value.Apply) {
                                        // Non decimal concatenated fields
                                        for (j = 0; j < oBadge.MainInfo.Value.Apply.Parameters.length; j += 1) {
                                            if (oBadge.MainInfo.Value.Apply.Parameters[j].Type === "Path") {
                                                if (data.results[i][oBadge.MainInfo.Value.Apply.Parameters[j].Value]) {
                                                    sSeparator = "dash";
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    if (sSeparator === "dash") {
                                        oHLayout.addContent(new HTML({ content: "<span class=\"sapFactsheetUtiSeparatorPadding sapMText\"> &ndash; </span>" }));
                                    }
                                    if (sSeparator === "comma") {
                                        oHLayout.addContent(new Text({ text: ", " }).addStyleClass("sapFactsheetUtiSeparatorPaddingForDecimal"));
                                    }
                                }

                                if (oBadge.MainInfo) {
                                    oMainInfo = dataField(oBadge.MainInfo, functionParameters.navigationType, oMetadata, functionParameters.facet);
                                    if (oMainInfo.setWrapping) {
                                        oMainInfo.setWrapping(false);
                                    }
                                    oMainInfo.setModel(oJsonModel);
                                    oMainInfo.bindElement("/result");
                                    oHLayout.addContent(oMainInfo);
                                }
                                oContent.addContent(oHLayout);
                            }
                        }
                        iCount = parseInt(data.__count, 10);
                        if (Number(iCount)) {
                            functionParameters.facet.setQuantity(iCount);
                        }
                        functionParameters.facet.setContent(oContent);

                        functionParameters.facet.attachPress({ facet: functionParameters.facetContent }, function (oEvent, oData) {
                            var oContent;
                            oTI.removeAllFacetContent();
                            aAllFacets[aAllFacets.indexOf(functionParameters.facet)].Links = [];
                            oContent = facetFactory(oModel, functionParameters.entitySet, oData.facet, functionParameters.bindingPath, this);
                            oContent.setDescription(getTIDescription());
                            oTI.addFacetContent(oContent);
                            //Workaround: no Link if no authority
                            if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = false;
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = true;
                            }
                            checkLinks(aAllFacets.indexOf(functionParameters.facet));
                            //Workaround: no Link if no authority
                            oTI.navigateToDetail();
                        });
                    } else {
                        functionParameters.facet.setQuantity(0);
                        functionParameters.facet.addStyleClass("sapFactsheetUtiEmptyTile");
                        functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.S);
                    }
                    //Workaround: no Link if no authority
                    if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = true;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = false;
                    }
                    checkLinks(aAllFacets.indexOf(functionParameters.facet));
                    //Workaround: no Link if no authority
                } else {
                    oJsonModel.setData({ result: data });
                    // Check if response returned data as Gateway is currently not able to send the right HTTP status code for an empty document.
                    for (sAttribute in data) {
                        if (data.hasOwnProperty(sAttribute)) {
                            if (sAttribute !== "__metadata") {
                                // A string which is not empty
                                if (typeof data[sAttribute] === "string" && data[sAttribute]) {
                                    // Could be a number like f.e. "0.000" or "000000", that returns 0 when calling parseInt.
                                    // When the string contains chars parseInt returns NaN.
                                    if (parseInt(data[sAttribute], 10) !== 0) {
                                        bResultNotEmpty = true;
                                        break;
                                    }
                                } else if (typeof data[sAttribute] === "number" && parseInt(data[sAttribute], 10) !== 0) {
                                    bResultNotEmpty = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (bResultNotEmpty) {
                        oVLayoutForLabelValuePairs = new VerticalLayout();
                        aPropertyExtensions = (oMapping.propertyExtensions) ? oMapping.propertyExtensions[functionParameters.navigationType] : [];
                        oHLayoutForTitle = new HorizontalLayout().addStyleClass("sapFactsheetUtiHLayoutLabelValue");
                        oTitleLabel = labelBinding(oBadge.Title, {}, aPropertyExtensions, true).addStyleClass("sapFactsheetUtiLabelMargin");
                        oTitle = dataField(oBadge.Title, functionParameters.navigationType, oMetadata, functionParameters.facet);
                        oTitle.setModel(oJsonModel);
                        oTitle.bindElement("/result");
                        oHLayoutForTitle.addContent(oTitleLabel);
                        oHLayoutForTitle.addContent(oTitle);
                        oVLayoutForLabelValuePairs.addContent(oHLayoutForTitle);
                        if (oBadge.MainInfo) {
                            oHLayoutForMainInfo = new HorizontalLayout().addStyleClass("sapFactsheetUtiHLayoutLabelValue");
                            oMainInfoLabel = labelBinding(oBadge.MainInfo, {}, aPropertyExtensions, true).addStyleClass("sapFactsheetUtiLabelMargin");
                            oMainInfo = dataField(oBadge.MainInfo, functionParameters.navigationType, oMetadata, functionParameters.facet);
                            oMainInfo.setModel(oJsonModel);
                            oMainInfo.bindElement("/result");
                            oHLayoutForMainInfo.addContent(oMainInfoLabel);
                            oHLayoutForMainInfo.addContent(oMainInfo);
                            oVLayoutForLabelValuePairs.addContent(oHLayoutForMainInfo);
                        }
                        if (oBadge.SecondaryInfo) {
                            oHLayoutForSecondaryInfo = new HorizontalLayout().addStyleClass("sapFactsheetUtiHLayoutLabelValue");
                            oSecondaryInfoLabel = labelBinding(oBadge.SecondaryInfo, {}, aPropertyExtensions, true).addStyleClass("sapFactsheetUtiLabelMargin");
                            oSecondaryInfo = dataField(oBadge.SecondaryInfo, functionParameters.navigationType, oMetadata, functionParameters.facet);
                            oSecondaryInfo.setModel(oJsonModel);
                            oSecondaryInfo.bindElement("/result");
                            oHLayoutForSecondaryInfo.addContent(oSecondaryInfoLabel);
                            oHLayoutForSecondaryInfo.addContent(oSecondaryInfo);
                            oVLayoutForLabelValuePairs.addContent(oHLayoutForSecondaryInfo);
                        }
                        if (oBadge.TypeImageUrl || oBadge.ImageUrl) {
                            if (oBadge.ImageUrl) {
                                oImageUrl = oBadge.ImageUrl;
                            } else {
                                oImageUrl = oBadge.TypeImageUrl;
                            }
                            oHLayoutForIconAndText = new HorizontalLayout();
                            iSize = "64px";
                            if (jQuery.device.is.phone) {
                                iSize = "48px";
                            }
                            if (oImageUrl.String && (oImageUrl.String.substr(0, 11) === "sap-icon://")) {
                                oImage = new Icon({ size: iSize, width: iSize });
                            } else {
                                oImage = new Image({ width: iSize });
                            }
                            oImage.addStyleClass("sapFactsheetUtiRelIcon");
                            if (oImageUrl && oImageUrl.String) {
                                oImage.setSrc(oImageUrl.String);
                            } else if (oImageUrl && oImageUrl.Path) {
                                oImage.bindProperty("src", oImageUrl.Path);
                            }
                            oHLayoutForIconAndText.addContent(oImage);
                            oHLayoutForIconAndText.addContent(oVLayoutForLabelValuePairs);
                            functionParameters.facet.setContent(oHLayoutForIconAndText);
                        } else {
                            functionParameters.facet.setContent(oVLayoutForLabelValuePairs);
                        }

                        functionParameters.facet.attachPress({ facet: functionParameters.facetContent }, function (oEvent, oData) {
                            var oContent;
                            oTI.removeAllFacetContent();
                            aAllFacets[aAllFacets.indexOf(functionParameters.facet)].Links = [];
                            oContent = facetFactory(oModel, functionParameters.entitySet, oData.facet, functionParameters.bindingPath, this);
                            oContent.setDescription(getTIDescription());
                            oTI.addFacetContent(oContent);
                            //Workaround: no Link if no authority
                            if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = true;
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = false;
                            }
                            checkLinks(aAllFacets.indexOf(functionParameters.facet));
                            //Workaround: no Link if no authority
                            oTI.navigateToDetail();
                        });
                    } else {
                        functionParameters.facet.addStyleClass("sapFactsheetUtiEmptyTile");
                        functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.S);
                    }
                    //Workaround: no Link if no authority
                    if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = true;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = false;
                    }
                    checkLinks(aAllFacets.indexOf(functionParameters.facet));
                    //Workaround: no Link if no authority
                }
            };
        };
        var oDataReadCallbackError = function (functionParameters) {
            return function (/*error*/) {
                // OData returns an error. Don't display the facet.
                oTI.removeFacet(functionParameters.facet);
            };
        };
        var oDataReadCallbackMedia = function (functionParameters) {
            return function (data) {
                var oHLayout, oMediaResource, i, iCount, oTG;
                oMediaResource = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.MediaResource"];
                if (functionParameters.cardinality === "*") {
                    if (data.results && data.results.length) {
                        oHLayout = new HorizontalLayout().addStyleClass("sapFactsheetUtiPictureViewerOverview");
                        for (i = 0; i < data.results.length; i += 1) {
                            oHLayout.addContent(new Image({
                                src: data.results[i][oMediaResource.Thumbnail.Url.Path],
                                height: "85px"
                            }));
                            if (i === 3) {
                                break;
                            }
                        }
                        iCount = parseInt(data.__count, 10);
                        if (Number(iCount)) {
                            functionParameters.facet.setQuantity(iCount);
                        }
                        functionParameters.facet.setContent(oHLayout);
                        functionParameters.facet.attachPress({ facet: functionParameters.facetContent, data: data }, function (oEvent, oData) {
                            var oPictureViewer, sHeight, oImage;
                            oTI.removeAllFacetContent();
                            oTG = new UnifiedThingGroup();
                            if (oData.facet.Label && oData.facet.Label.String) {
                                oTG.setTitle(oData.facet.Label.String);
                            }
                            oTG.setDescription(getTIDescription());
                            if (jQuery.device.is.phone) {
                                sHeight = "350px";
                            } else {
                                sHeight = "550px";
                            }
                            oPictureViewer = new Carousel({ height: sHeight });
                            for (i = 0; i < oData.data.results.length; i += 1) {
                                oImage = new Image({ src: oData.data.results[i][oMediaResource.Url.Path] });
                                if (jQuery.device.is.phone) {
                                    oImage.addStyleClass("sapFactsheetUtiCarouselMaxImageHeightPhone");
                                } else {
                                    oImage.addStyleClass("sapFactsheetUtiCarouselMaxImageHeight");
                                }
                                oPictureViewer.addPage(oImage);
                            }
                            oTG.setContent(oPictureViewer);
                            oTI.addFacetContent(oTG);
                            oTI.navigateToDetail();
                        });
                    } else {
                        functionParameters.facet.setQuantity(0);
                        functionParameters.facet.addStyleClass("sapFactsheetUtiEmptyTile");
                        functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.S);
                    }
                }
            };
        };

        var extractContactsFromBatchRequest = function (oData, sOrder) {
            var aContactResults = [], oContacts = {},
                i, j, k, oContactMetadata, sPhone, sMobile, sFax, sTelephone, sPhoto, sMetadataEmail;
            var fFieldValue = function (oMetadata, oContactResult) {
                var i, sValue = "";
                if (oMetadata) {
                    if (oMetadata.Path) {
                        return oContactResult[oMetadata.Path];
                    } else if (oMetadata.String) {
                        return oMetadata.String;
                    } else if (oMetadata.Apply.Name === "odata.concat") {
                        for (i = 0; i < oMetadata.Apply.Parameters.length; i += 1) {
                            if (oMetadata.Apply.Parameters[i].Type === "Path") {
                                sValue = sValue + oContactResult[oMetadata.Apply.Parameters[i].Value];
                            } else if (oMetadata.Apply.Parameters[i].Type === "String") {
                                sValue = sValue + oMetadata.Apply.Parameters[i].Value;
                            }
                        }
                        return sValue;
                    }
                }
            };
            oContacts.iCount = 0;
            oContacts.aContacts = [];
            for (i = 0; i < oData.__batchResponses.length; i += 1) {
                if (!oData.__batchResponses[i].data) {
                    continue;
                }
                aContactResults = oData.__batchResponses[i].data.results;
                if (!aContactResults) {
                    aContactResults = [];
                    aContactResults.push(oData.__batchResponses[i].data);
                }
                if (aContactResults.length > 0) {
                    oContactMetadata = oMapping[aContactResults[0].__metadata.type]["com.sap.vocabularies.Communication.v1.Contact"];
                    if (oContactMetadata) {
                        for (j = 0; j < aContactResults.length; j += 1) {
                            sPhone = sMobile = sFax = "";
                            if (oContactMetadata.tel) {
                                for (k = 0; k < oContactMetadata.tel.length; k += 1) {
                                    if (oContactMetadata.tel[k].type && oContactMetadata.tel[k].type.EnumMember) {
                                        sTelephone = fFieldValue(oContactMetadata.tel[k].uri, aContactResults[j]);
                                        switch (oContactMetadata.tel[k].type.EnumMember) {
                                            case "com.sap.vocabularies.Communication.v1.PhoneType/voice":
                                                sPhone = sTelephone ? sTelephone.replace("tel:", "") : "";
                                                sPhone = sPhone ? sPhone.replace(";ext=", "") : "";
                                                break;
                                            case "com.sap.vocabularies.Communication.v1.PhoneType/cell":
                                                sMobile = sTelephone ? sTelephone.replace("tel:", "") : "";
                                                sMobile = sMobile ? sMobile.replace(";ext=", "") : "";
                                                break;
                                            case "com.sap.vocabularies.Communication.v1.PhoneType/fax":
                                                sFax = sTelephone ? sTelephone.replace("tel:", "") : "";
                                                sFax = sFax ? sFax.replace(";ext=", "") : "";
                                                break;
                                        }
                                    }
                                }
                            }
                            sMetadataEmail = oContactMetadata.email && oContactMetadata.email.address ? oContactMetadata.email.address : "";
                            sPhoto = fFieldValue(oContactMetadata.photo, aContactResults[j]);
                            oContacts.iCount += 1;
                            oContacts.aContacts.push({
                                fn: fFieldValue(oContactMetadata.fn, aContactResults[j]),
                                title: fFieldValue(oContactMetadata.title, aContactResults[j]),
                                org: fFieldValue(oContactMetadata.org, aContactResults[j]),
                                phone: sPhone,
                                mobile: sMobile,
                                fax: sFax,
                                photo: sPhoto,
                                email: fFieldValue(sMetadataEmail, aContactResults[j]),
                                sEntity: aContactResults[0].__metadata.type,
                                bExistsPhoto: !!sPhoto,
                                bUseIcon: !sPhoto,
                                sOrder: oContacts.iCount // Order inside an entity
                            });
                        }
                    }
                }
            }
            if (sOrder) {
                oContacts.aContacts.sort(function (a, b) {
                    return a[sOrder] > b[sOrder] ? 1 : -1;
                });
            }
            return oContacts;
        };
        var oDataReadCallbackContacts = function (/*functionParameters*/) {
            return function (oData) {
                var i, oContacts, oGrid, oHLayout, oVLayout, oImgLayout, oImage, sTileSize;
                oContacts = extractContactsFromBatchRequest(oData, "sOrder");
                oGrid = new Grid({
                    defaultSpan: "L6 M6 S12",
                    hSpacing: 0,
                    vSpacing: 0
                }).addStyleClass("sapFactsheetUtiContactsGrid");
                for (i = 0; i < oContacts.aContacts.length && i < 4; i += 1) {
                    oImgLayout = new VerticalLayout();
                    if (oContacts.aContacts[i].photo) {
                        oImage = new Image({
                            height: "55px",
                            src: oContacts.aContacts[i].photo
                        });
                    } else {
                        oImage = new Icon({
                            size: "50px",
                            src: IconPool.getIconURI("person-placeholder")
                        }).addStyleClass("sapFactsheetUtiRelIcon");
                    }
                    oImgLayout.addContent(oImage);
                    oImgLayout.addStyleClass("sapFactsheetUtiContactsImage");
                    oVLayout = new VerticalLayout({
                        content: [new Text({
                            text: oContacts.aContacts[i].fn
                        }).addStyleClass("sapFactsheetUtiTextName"),
                        new Text({
                            text: oContacts.aContacts[i].title
                        }).addStyleClass("sapFactsheetUtiTextValue")
                        ]
                    });
                    oHLayout = new HorizontalLayout({
                        content: [oImgLayout, oVLayout]
                    }).addStyleClass("sapFactsheetUtiContactsBox");
                    oGrid.addContent(oHLayout);
                }
                oFacet = sap.ui.getCore().byId(oTI.data("contactFacetId"));
                oFacet.setQuantity(oContacts.iCount);
                if (i > 0) {
                    oFacet.setContent(oGrid);
                    if (i <= 2) {
                        sTileSize = FacetOverviewHeight.M;
                    } else {
                        sTileSize = FacetOverviewHeight.L;
                    }
                    oFacet.attachPress(function () {
                        var i, aOperations = [], sBatchPath;
                        oModel.clearBatch();
                        for (i = 0; i < oMapping[sEntityType]["com.sap.vocabularies.UI.v1.Contacts"].length; i += 1) {
                            sNavPath = oMapping[sEntityType]["com.sap.vocabularies.UI.v1.Contacts"][i].AnnotationPath;
                            sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                            if (sNavPath !== "") {
                                sBatchPath = sBindingPath + "/" + sNavPath;
                            } else {
                                sBatchPath = sBindingPath;
                            }
                            aOperations.push(oModel.createBatchOperation(sBatchPath, "GET"));
                        }
                        oModel.addBatchReadOperations(aOperations);
                        oModel.submitBatch(function (oData) {
                            var oContacts, oJSONModel, oTemplate, oTable, oVSDialog, oTG, oResourceBundle;
                            oResourceBundle = jQuery.sap.resources({
                                url: jQuery.sap.getModulePath("sap.ushell.components.container.") + "/resources/resources.properties",
                                language: sap.ui.getCore().getConfiguration().getLanguage()
                            });
                            oContacts = extractContactsFromBatchRequest(oData, "sEntity");
                            oJSONModel = new JSONModel();
                            oJSONModel.setData(oContacts);
                            oTemplate = new ColumnListItem({
                                type: mobileLibrary.Inactive,
                                unread: false,
                                cells: [
                                    new VerticalLayout({
                                        content: [
                                            new Image({
                                                src: "{photo}",
                                                width: "74px",
                                                visible: "{bExistsPhoto}"
                                            }),
                                            new Icon({
                                                size: "76px",
                                                src: IconPool.getIconURI("person-placeholder"),
                                                visible: "{bUseIcon}"
                                            }).addStyleClass("sapFactsheetUtiRelIcon")
                                        ]
                                    }),
                                    new VerticalLayout({
                                        content: [
                                            new Text({ text: "{fn}" }).addStyleClass("sapFactsheetUtiContactsName"),
                                            new Label({ text: "{title}" }),
                                            new Label({ text: "{org}" })
                                        ]
                                    }),
                                    new Link({ text: "{phone}", href: "tel:{phone}" }),
                                    new Link({ text: "{mobile}", href: "tel:{mobile}" }),
                                    new Link({ text: "{fax}", href: "tel:{fax}" }),
                                    new Link({ text: "{email}", href: "mailto:{email}" })
                                ]
                            });
                            oTable = new Table({
                                threshold: 2,
                                inset: false,
                                showUnread: true,
                                scrollToLoad: true,
                                columns: [
                                    new Column({
                                        hAlign: TextAlign.Center,
                                        width: "12%",
                                        header: new Text({ text: "" })
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        header: new Text({ text: oResourceBundle.getText("USHELL_FACTSHEET_NAME") })
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        width: "12%",
                                        header: new Text({ text: oResourceBundle.getText("USHELL_FACTSHEET_PHONE") }),
                                        minScreenWidth: "Tablet",
                                        demandPopin: true
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        width: "12%",
                                        header: new Text({ text: resources.i18n.getText("mobile") }),
                                        minScreenWidth: "Tablet",
                                        demandPopin: true
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        width: "12%",
                                        header: new Text({ text: resources.i18n.getText("fax") }),
                                        minScreenWidth: "Tablet",
                                        demandPopin: true
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        width: "26%",
                                        header: new Text({ text: oResourceBundle.getText("USHELL_FACTSHEET_EMAIL") }),
                                        minScreenWidth: "Tablet",
                                        demandPopin: true
                                    })],
                                items: {
                                    path: "/aContacts",
                                    template: oTemplate
                                }
                            });
                            oVSDialog = new ViewSettingsDialog({
                                sortItems: [new ViewSettingsItem({ key: "fn", text: oResourceBundle.getText("USHELL_FACTSHEET_NAME") }),
                                new ViewSettingsItem({ key: "phone", text: oResourceBundle.getText("USHELL_FACTSHEET_PHONE") }),
                                new ViewSettingsItem({ key: "mobile", text: resources.i18n.getText("mobile") }),
                                new ViewSettingsItem({ key: "fax", text: resources.i18n.getText("fax") }),
                                new ViewSettingsItem({ key: "email", text: oResourceBundle.getText("USHELL_FACTSHEET_EMAIL") })],
                                confirm: function (evt) {
                                    var mParams, oBinding, aSorters = [];
                                    mParams = evt.getParameters();
                                    oBinding = oTable.getBinding("items");
                                    if (mParams.sortItem) {
                                        aSorters.push(new Sorter(mParams.sortItem.getKey(), mParams.sortDescending));
                                        oBinding.sort(aSorters);
                                    }
                                }
                            });
                            oTable.setHeaderToolbar(new Toolbar({
                                content: [
                                    new Label(),
                                    new ToolbarSpacer(),
                                    new Button({
                                        icon: "sap-icon://drop-down-list",
                                        press: function (/*evt*/) {
                                            oVSDialog.open();
                                        }
                                    })
                                ]
                            }));
                            oTable.setModel(oJSONModel);
                            oTG = new UnifiedThingGroup({
                                title: oFacet.getTitle(),
                                description: getTIDescription(),
                                content: oTable
                            });
                            oTI.removeAllFacetContent();
                            oTI.addFacetContent(oTG);
                            oTI.navigateToDetail();
                        });
                    });
                } else {
                    sTileSize = FacetOverviewHeight.S;
                    oFacet.addStyleClass("sapFactsheetUtiEmptyTile");
                    oFacet.setQuantity(0);
                }
                oFacet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : sTileSize);
            };
        };

        // Loop at the further facets and make oData reads to the corresponding services
        for (i = 0; i < aFacets.length; i += 1) {
            if (aFacets[i]["com.sap.vocabularies.UI.v1.Map"]) {
                sNavPath = aFacets[i].Target.AnnotationPath;
                sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                sCardinality = "1";
                sNavType = sEntityType;
                if (sNavPath) {
                    sNavType = getNavTypeForNavPath(sNavPath, sEntityType, oMetadata);
                    sCardinality = getAssociationMultiplicity(sEntitySet, sNavPath, oMetadata);
                }
                sHeight = "100%";
                if (jQuery.device.is.phone) {
                    sHeight = "150px";
                }
                oGeoContent = new VBI({
                    width: "100%",
                    height: sHeight,
                    plugin: false,
                    config: null
                });
                oFacet = new FacetOverview({
                    title: aFacets[i].Label.String.trim(),
                    heightType: jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.L,
                    content: oGeoContent
                });
                //Workaround: no Link if no authority
                aAllFacets.push(oFacet);
                aAllFacets[aAllFacets.length - 1].bLoaded = false;
                aAllFacets[aAllFacets.length - 1].bProcessed = false;
                aAllFacets[aAllFacets.length - 1].bIsTable = false;
                //Workaround: no Link if no authority
                functionParameters = {
                    cardinality: sCardinality,
                    navigationPath: sNavPath,
                    facet: oFacet,
                    facetContent: aFacets[i],
                    navigationType: sNavType,
                    metadata: oMetadata,
                    bindingPath: sBindingPath,
                    entitySet: sEntitySet
                };
                if (sCardinality === "*") {
                    parameters = ["$inlinecount=allpages", "$top=1000"];
                } else {
                    parameters = [];
                }
                oModel.read(sBindingPath + "/" + sNavPath, "", parameters, true, oDataReadCallbackGeo(functionParameters));
                oTI.addFacet(oFacet);
            } else if (aFacets[i].Target) {
                sNavPath = aFacets[i].Target.AnnotationPath;
                sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                sTerm = aFacets[i].Target.AnnotationPath.substring(aFacets[i].Target.AnnotationPath.lastIndexOf("@") + 1);
                if (sNavPath) {
                    sNavType = getNavTypeForNavPath(sNavPath, sEntityType, oMetadata);
                    oFacet = new FacetOverview({
                        title: aFacets[i].Label.String.trim(),
                        heightType: jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.M
                    });
                    sCardinality = getAssociationMultiplicity(sEntitySet, sNavPath, oMetadata);
                    if (sCardinality !== 0) {
                        functionParameters = {
                            cardinality: sCardinality,
                            navigationPath: sNavPath,
                            facet: oFacet,
                            facetContent: aFacets[i],
                            navigationType: sNavType,
                            metadata: oMetadata,
                            bindingPath: sBindingPath,
                            entitySet: sEntitySet
                        };
                        if (aFacets[i]["com.sap.vocabularies.UI.v1.Gallery"]) {
                            if (sCardinality === "*") {
                                parameters = ["$inlinecount=allpages"];
                            } else {
                                parameters = [];
                            }
                            oModel.read(sBindingPath + "/" + sNavPath, "", parameters, true, oDataReadCallbackMedia(functionParameters));
                        } else {
                            //Workaround: no Link if no authority
                            aAllFacets.push(oFacet);
                            aAllFacets[aAllFacets.length - 1].bLoaded = false;
                            aAllFacets[aAllFacets.length - 1].bProcessed = false;
                            aAllFacets[aAllFacets.length - 1].bIsTable = false;
                            //Workaround: no Link if no authority
                            if (sCardinality === "*") {
                                parameters = ["$inlinecount=allpages", "$top=3"];
                            } else {
                                parameters = [];
                            }
                            oModel.read(sBindingPath + "/" + sNavPath, "", parameters, true, oDataReadCallback(functionParameters), oDataReadCallbackError(functionParameters));
                        }
                        oTI.addFacet(oFacet);
                    }
                } else if (sTerm === "com.sap.vocabularies.UI.v1.Contacts") {
                    oFacet = new FacetOverview({
                        title: aFacets[i].Label.String.trim(),
                        heightType: jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.M
                    });
                    oTI.data("contactFacetId", oFacet.sId);
                    functionParameters = { facet: oFacet };
                    oModel.clearBatch();
                    for (j = 0; j < oMapping[sEntityType][sTerm].length; j += 1) {
                        sNavPath = oMapping[sEntityType][sTerm][j].AnnotationPath;
                        sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                        if (sNavPath !== "") {
                            sCardinality = getAssociationMultiplicity(sEntitySet, sNavPath, oMetadata);
                            if (sCardinality === "*") {
                                sBatchPath = sBindingPath + "/" + sNavPath + "?$top=4&$inlinecount=allpages";
                            } else {
                                sBatchPath = sBindingPath + "/" + sNavPath;
                            }
                        } else {
                            sBatchPath = sBindingPath;
                        }
                        aOperations.push(oModel.createBatchOperation(sBatchPath, "GET"));
                    }
                    oModel.addBatchReadOperations(aOperations);
                    oModel.submitBatch(oDataReadCallbackContacts(functionParameters));
                    oTI.addFacet(oFacet);
                }
            }
        }

        // Footer area
        oAddBookmarkButton = new AddBookmarkButton();
        var thingInspectorBindingChanged = function () {
            var oBusinessParameters = {},
                i, o, key, val, aBusinessParams, sTerm, aTerm, oParaValue, sSemanticObject, sJamDiscussId, sKey, oURLParsing, sShellHash, oShellHash;
            oAddBookmarkButton.setAppData({ title: oTI.getTitle(), subtitle: oTI.getName() + " - " + oTI.getDescription() });
            oAddBookmarkButton.setEnabled(true);
            oURLParsing = sap.ushell.Container.getService("URLParsing");
            sShellHash = oURLParsing.getShellHash(window.location.href);
            oShellHash = oURLParsing.parseShellHash(sShellHash);
            sSemanticObject = oShellHash.semanticObject;
            oTransactionSheet = new LinkActionSheet({
                showCancelButton: true,
                placement: PlacementType.Top
            });
            sBusinessParams = getEntityKeyFromUri(sUri, oModel);
            aBusinessParams = sBusinessParams.split(",");
            for (i = 0; i < aBusinessParams.length; i += 1) {
                aBusinessParams[i] = aBusinessParams[i].replace("='", "=", "g");
                if (aBusinessParams[i].lastIndexOf("'") === aBusinessParams[i].length - 1) {
                    aBusinessParams[i] = aBusinessParams[i].slice(0, -1);
                }
            }
            for (sTerm in oMapping[sEntityType]) {
                if (oMapping[sEntityType].hasOwnProperty(sTerm)) {
                    if (sTerm.indexOf("com.sap.vocabularies.Common.v1.SecondaryKey") === 0) {
                        aTerm = oMapping[sEntityType][sTerm];
                        for (i = 0; i < aTerm.length; i += 1) {
                            oParaValue = this.getBoundContext().getProperty(aTerm[i].PropertyPath);
                            if (oParaValue) {
                                aBusinessParams.push(aTerm[i].PropertyPath + "=" + oParaValue);
                            }
                        }
                    }
                }
            }
            for (i = 0; i < aBusinessParams.length; i += 1) {
                key = aBusinessParams[i].substr(0, aBusinessParams[i].indexOf("="));
                val = aBusinessParams[i].substr(aBusinessParams[i].indexOf("=") + 1, aBusinessParams[i].length);
                oBusinessParameters[decodeURIComponent(key)] = decodeURIComponent(val);
            }
            oLinks = sap.ushell.Container.getService("CrossApplicationNavigation").getSemanticObjectLinks(sSemanticObject, oBusinessParameters);
            oLinks.done(function (aLinks) {
                var i, sIntent, sLink;
                for (i = 0; i < aLinks.length; i += 1) {
                    sLink = aLinks[i].intent;
                    if (sLink.indexOf(FACTSHEET) < 0 &&
                        sLink.indexOf("-analyzeKPIDetails~") < 0 &&
                        sLink.indexOf("-analyzeSBKPIDetails~") < 0 &&
                        sLink.indexOf("-NavigateToMaintainCusProj~") < 0 &&
                        sLink.indexOf("CostCenter-manageCostCenter~") < 0 &&
                        sLink.indexOf("AccountingDocument-analyzeDocumentJournal~") < 0 &&
                        sLink.indexOf("AccountingDocument-analyzeGLLineItem~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeCostCenters~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeInternalOrders~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeMarketSegment~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeProfitCentersActuals~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeProfitLoss~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeProjectsActuals~") < 0 &&
                        sLink.indexOf("PurchaseOrder-create~") < 0) {
                        sIntent = sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal({ target: { shellHash: sLink } });
                        oTransactionSheet.addItem(new Link({ text: aLinks[i].text, href: sIntent }));
                        oTI.setTransactionsVisible(true);
                    }
                }
            });
            oTI.attachTransactionsButtonPress(function (oEvent) {
                oTransactionSheet.openBy(oEvent.getParameter("caller"));
            });
            this.detachChange(thingInspectorBindingChanged);
            // Set the browser Tab Name as Object Type: Object Name (Object Description) e.g. "Article: Nutella (AAUFEA000100001)"
            AppConfiguration.setWindowTitle(oTI.getTitle().trim() + ": " + oTI.getName().trim() + " (" + oTI.getDescription().trim() + ")");

            oTI.setActionsVisible(true);
            oEmailBtn = new Button({
                text: oSapSuiteRb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_EMAIL_LINK"),
                icon: "sap-icon://email",
                press: function (/*oE*/) {
                    URLHelper.triggerEmail("", oTI.getName(), window.location.href);
                }
            });
            oActionSheet = new ActionSheet({ placement: PlacementType.Top });
            sJamDiscussId = sUri.substr(0, sUri.lastIndexOf("/") + 1);
            for (o in oModel.oData) {
                if (oModel.oData.hasOwnProperty(o)) {
                    sJamDiscussId = sJamDiscussId + o;
                    sKey = o.substring(o.indexOf("(") + 1, o.indexOf(")"));
                    break;
                }
            }
            oActionSheet.addButton(new JamDiscussButton({
                jamData: {
                    businessObject: {
                        appContext: "CB",
                        odataServicePath: sUri.substr(0, sUri.lastIndexOf("/") + 1),
                        collection: sEntitySet,
                        key: sKey,
                        name: oTI.getTitle(),
                        ui_url: window.location.href
                    }
                }
            }));
            oActionSheet.addButton(new JamShareButton({
                jamData: {
                    object: {
                        id: window.location.href,
                        display: new Text({ text: oTI.getTitle() }),
                        share: ""
                    },
                    externalObject: {
                        appContext: "CB",
                        odataServicePath: sUri.substr(0, sUri.lastIndexOf("/") + 1),
                        collection: sEntitySet,
                        key: sKey,
                        name: oTI.getTitle()
                    }
                }
            }));
            oActionSheet.addButton(oAddBookmarkButton);
            oActionSheet.addButton(oEmailBtn);
            oTI.attachActionsButtonPress(function (oEvent) {
                oActionSheet.openBy(oEvent.getParameter("caller"));
            });
            //Workaround: no Link if no authority
            aAllFacets[0].bLoaded = true;
            aAllFacets[0].bProcessed = false;
            checkLinks(0);
            //Workaround: no Link if no authority
        };

        oTI.getElementBinding().attachChange(thingInspectorBindingChanged);

        oTI.attachBackAction(function (/*oEvent*/) {
            history.back();
        });
        oTI.addDelegate({
            onAfterRendering: function () {
                oTI._adjustFacetLayout();
            }
        });
        return oTI;
    };

    return function (sUri, sAnnotationUri) {
        try {
            oTI = thingInspectorFactory(sUri, sAnnotationUri, new UnifiedThingInspector({ configurationVisible: false }));
        } catch (e) {
            throw e;
        }
        return oTI;
    };
}, true /* bExport */);
