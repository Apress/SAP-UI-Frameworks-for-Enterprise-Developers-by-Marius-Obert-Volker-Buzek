/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/m/library", "sap/ui/Device", "sap/ui/mdc/enum/EditMode", "sap/ui/model/Context", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, CommonUtils, BindingToolkit, MetaModelFunction, ModelHelper, mLibrary, Device, EditMode, Context, ODataModelAnnotationHelper) {
  "use strict";

  var system = Device.system;
  var isPropertyFilterable = MetaModelFunction.isPropertyFilterable;
  var ref = BindingToolkit.ref;
  var fn = BindingToolkit.fn;
  var compileExpression = BindingToolkit.compileExpression;
  const ValueColor = mLibrary.ValueColor;
  const CommonHelper = {
    getPathToKey: function (oCtx) {
      return oCtx.getObject();
    },
    /**
     * Determines if a field is visible.
     *
     * @param target Target instance
     * @param oInterface Interface instance
     * @returns Returns true, false, or expression with path
     */
    isVisible: function (target, oInterface) {
      const oModel = oInterface.context.getModel(),
        sPropertyPath = oInterface.context.getPath(),
        oAnnotations = oModel.getObject(`${sPropertyPath}@`),
        hidden = oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
      return typeof hidden === "object" ? "{= !${" + hidden.$Path + "} }" : !hidden;
    },
    /**
     * Determine if field is editable.
     *
     * @param target Target instance
     * @param oInterface Interface instance
     * @returns A Binding Expression to determine if a field should be editable or not.
     */
    getParameterEditMode: function (target, oInterface) {
      const oModel = oInterface.context.getModel(),
        sPropertyPath = oInterface.context.getPath(),
        oAnnotations = oModel.getObject(`${sPropertyPath}@`),
        fieldControl = oAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"],
        immutable = oAnnotations["@Org.OData.Core.V1.Immutable"],
        computed = oAnnotations["@Org.OData.Core.V1.Computed"];
      let sEditMode = EditMode.Editable;
      if (immutable || computed) {
        sEditMode = EditMode.ReadOnly;
      } else if (fieldControl) {
        if (fieldControl.$EnumMember) {
          if (fieldControl.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly") {
            sEditMode = EditMode.ReadOnly;
          }
          if (fieldControl.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Inapplicable" || fieldControl.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden") {
            sEditMode = EditMode.Disabled;
          }
        }
        if (fieldControl.$Path) {
          sEditMode = "{= %{" + fieldControl.$Path + "} < 3 ? (%{" + fieldControl.$Path + "} === 0 ? '" + EditMode.Disabled + "' : '" + EditMode.ReadOnly + "') : '" + EditMode.Editable + "'}";
        }
      }
      return sEditMode;
    },
    /**
     * Get the complete metapath to the target.
     *
     * @param target
     * @param oInterface
     * @returns The metapath
     */
    getMetaPath: function (target, oInterface) {
      return oInterface && oInterface.context && oInterface.context.getPath() || undefined;
    },
    isDesktop: function () {
      return system.desktop === true;
    },
    getTargetCollectionPath: function (context, navCollection) {
      let sPath = context.getPath();
      if (context.getMetadata().getName() === "sap.ui.model.Context" && (context.getObject("$kind") === "EntitySet" || context.getObject("$ContainsTarget") === true)) {
        return sPath;
      }
      if (context.getModel) {
        sPath = context.getModel().getMetaPath && context.getModel().getMetaPath(sPath) || context.getModel().getMetaModel().getMetaPath(sPath);
      }
      //Supporting sPath of any format, either '/<entitySet>/<navigationCollection>' <OR> '/<entitySet>/$Type/<navigationCollection>'
      const aParts = sPath.split("/").filter(function (sPart) {
        return sPart && sPart != "$Type";
      }); //filter out empty strings and parts referring to '$Type'
      const entitySet = `/${aParts[0]}`;
      if (aParts.length === 1) {
        return entitySet;
      }
      const navigationCollection = navCollection === undefined ? aParts.slice(1).join("/$NavigationPropertyBinding/") : navCollection;
      return `${entitySet}/$NavigationPropertyBinding/${navigationCollection}`; // used in gotoTargetEntitySet method in the same file
    },

    isPropertyFilterable: function (context, oDataField) {
      const oModel = context.getModel(),
        sPropertyPath = context.getPath(),
        // LoacationPath would be the prefix of sPropertyPath, example: sPropertyPath = '/Customer/Set/Name' -> sPropertyLocationPath = '/Customer/Set'
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        sProperty = sPropertyPath.replace(`${sPropertyLocationPath}/`, "");
      if (oDataField && (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation")) {
        return false;
      }
      return isPropertyFilterable(oModel, sPropertyLocationPath, sProperty);
    },
    getLocationForPropertyPath: function (oModel, sPropertyPath) {
      let iLength;
      let sCollectionPath = sPropertyPath.slice(0, sPropertyPath.lastIndexOf("/"));
      if (oModel.getObject(`${sCollectionPath}/$kind`) === "EntityContainer") {
        iLength = sCollectionPath.length + 1;
        sCollectionPath = sPropertyPath.slice(iLength, sPropertyPath.indexOf("/", iLength));
      }
      return sCollectionPath;
    },
    gotoActionParameter: function (oContext) {
      const sPath = oContext.getPath(),
        sPropertyName = oContext.getObject(`${sPath}/$Name`);
      return CommonUtils.getParameterPath(sPath, sPropertyName);
    },
    /**
     * Returns the entity set name from the entity type name.
     *
     * @param oMetaModel OData v4 metamodel instance
     * @param sEntityType EntityType of the actiom
     * @returns The EntitySet of the bound action
     * @private
     * @ui5-restricted
     */
    getEntitySetName: function (oMetaModel, sEntityType) {
      const oEntityContainer = oMetaModel.getObject("/");
      for (const key in oEntityContainer) {
        if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
          return key;
        }
      }
      return undefined;
    },
    /**
     * Returns the metamodel path correctly for bound actions if used with bReturnOnlyPath as true,
     * else returns an object which has 3 properties related to the action. They are the entity set name,
     * the $Path value of the OperationAvailable annotation and the binding parameter name. If
     * bCheckStaticValue is true, returns the static value of OperationAvailable annotation, if present.
     * e.g. for bound action someNameSpace.SomeBoundAction
     * of entity set SomeEntitySet, the string "/SomeEntitySet/someNameSpace.SomeBoundAction" is returned.
     *
     * @param oAction The context object of the action
     * @param bReturnOnlyPath If false, additional info is returned along with metamodel path to the bound action
     * @param sActionName The name of the bound action of the form someNameSpace.SomeBoundAction
     * @param bCheckStaticValue If true, the static value of OperationAvailable is returned, if present
     * @returns The string or object as specified by bReturnOnlyPath
     * @private
     * @ui5-restricted
     */
    getActionPath: function (oAction, bReturnOnlyPath, sActionName, bCheckStaticValue) {
      let sContextPath = oAction.getPath().split("/@")[0];
      sActionName = !sActionName ? oAction.getObject(oAction.getPath()) : sActionName;
      if (sActionName && sActionName.indexOf("(") > -1) {
        // action bound to another entity type
        sActionName = sActionName.split("(")[0];
      } else if (oAction.getObject(sContextPath)) {
        // TODO: this logic sounds wrong, to be corrected
        const sEntityTypeName = oAction.getObject(sContextPath).$Type;
        const sEntityName = this.getEntitySetName(oAction.getModel(), sEntityTypeName);
        if (sEntityName) {
          sContextPath = `/${sEntityName}`;
        }
      } else {
        return sContextPath;
      }
      if (bCheckStaticValue) {
        return oAction.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable`);
      }
      if (bReturnOnlyPath) {
        return `${sContextPath}/${sActionName}`;
      } else {
        return {
          sContextPath: sContextPath,
          sProperty: oAction.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable/$Path`),
          sBindingParameter: oAction.getObject(`${sContextPath}/${sActionName}/@$ui5.overload/0/$Parameter/0/$Name`)
        };
      }
    },
    getNavigationContext: function (oContext) {
      return ODataModelAnnotationHelper.getNavigationPath(oContext.getPath());
    },
    /**
     * Returns the path without the entity type (potentially first) and property (last) part (optional).
     * The result can be an empty string if it is a simple direct property.
     *
     * If and only if the given property path starts with a slash (/), it is considered that the entity type
     * is part of the path and will be stripped away.
     *
     * @param sPropertyPath
     * @param bKeepProperty
     * @returns The navigation path
     */
    getNavigationPath: function (sPropertyPath, bKeepProperty) {
      const bStartsWithEntityType = sPropertyPath.startsWith("/");
      const aParts = sPropertyPath.split("/").filter(function (part) {
        return !!part;
      });
      if (bStartsWithEntityType) {
        aParts.shift();
      }
      if (!bKeepProperty) {
        aParts.pop();
      }
      return aParts.join("/");
    },
    /**
     * Returns the correct metamodel path for bound actions.
     *
     * Since this method is called irrespective of the action type, this will be applied to unbound actions.
     * In such a case, if an incorrect path is returned, it is ignored during templating.
     *
     * Example: for the bound action someNameSpace.SomeBoundAction of entity set SomeEntitySet,
     * the string "/SomeEntitySet/someNameSpace.SomeBoundAction" is returned.
     *
     * @function
     * @static
     * @name sap.fe.macros.CommonHelper.getActionContext
     * @memberof sap.fe.macros.CommonHelper
     * @param oAction Context object for the action
     * @returns Correct metamodel path for bound and incorrect path for unbound actions
     * @private
     * @ui5-restricted
     */
    getActionContext: function (oAction) {
      return CommonHelper.getActionPath(oAction, true);
    },
    /**
     * Returns the metamodel path correctly for overloaded bound actions. For unbound actions,
     * the incorrect path is returned, but ignored during templating.
     * e.g. for bound action someNameSpace.SomeBoundAction of entity set SomeEntitySet,
     * the string "/SomeEntitySet/someNameSpace.SomeBoundAction/@$ui5.overload/0" is returned.
     *
     * @function
     * @static
     * @name sap.fe.macros.CommonHelper.getPathToBoundActionOverload
     * @memberof sap.fe.macros.CommonHelper
     * @param oAction The context object for the action
     * @returns The correct metamodel path for bound action overload and incorrect path for unbound actions
     * @private
     * @ui5-restricted
     */
    getPathToBoundActionOverload: function (oAction) {
      const sPath = CommonHelper.getActionPath(oAction, true);
      return `${sPath}/@$ui5.overload/0`;
    },
    /**
     * Returns the string with single quotes.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sValue Some string that needs to be converted into single quotes
     * @param [bEscape] Should the string be escaped beforehand
     * @returns - String with single quotes
     */
    addSingleQuotes: function (sValue, bEscape) {
      if (bEscape && sValue) {
        sValue = this.escapeSingleQuotes(sValue);
      }
      return `'${sValue}'`;
    },
    /**
     * Returns the string with escaped single quotes.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sValue Some string that needs escaping of single quotes
     * @returns - String with escaped single quotes
     */
    escapeSingleQuotes: function (sValue) {
      return sValue.replace(/[']/g, "\\'");
    },
    /**
     * Returns the function string
     * The first argument of generateFunction is name of the generated function string.
     * Remaining arguments of generateFunction are arguments of the newly generated function string.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sFuncName Some string for the function name
     * @param args The remaining arguments
     * @returns - Function string depends on arguments passed
     */
    generateFunction: function (sFuncName) {
      let sParams = "";
      for (let i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); i++) {
        sParams += i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
        if (i < (arguments.length <= 1 ? 0 : arguments.length - 1) - 1) {
          sParams += ", ";
        }
      }
      let sFunction = `${sFuncName}()`;
      if (sParams) {
        sFunction = `${sFuncName}(${sParams})`;
      }
      return sFunction;
    },
    /*
     * Returns the visibility expression for datapoint title/link
     *
     * @function
     * @param {string} [sPath] annotation path of data point or Microchart
     * @param {boolean} [bLink] true if link visibility is being determined, false if title visibility is being determined
     * @param {boolean} [bFieldVisibility] true if field is vsiible, false otherwise
     * @returns  {string} sVisibilityExp Used to get the  visibility binding for DataPoints title in the Header.
     *
     */

    getHeaderDataPointLinkVisibility: function (sPath, bLink, bFieldVisibility) {
      let sVisibilityExp;
      if (bFieldVisibility) {
        sVisibilityExp = bLink ? "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} === true && " + bFieldVisibility + "}" : "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} !== true && " + bFieldVisibility + "}";
      } else {
        sVisibilityExp = bLink ? "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} === true}" : "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} !== true}";
      }
      return sVisibilityExp;
    },
    /**
     * Converts object to string(different from JSON.stringify or.toString).
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param oParams Some object
     * @returns - Object string
     */
    objectToString: function (oParams) {
      let iNumberOfKeys = Object.keys(oParams).length,
        sParams = "";
      for (const sKey in oParams) {
        let sValue = oParams[sKey];
        if (sValue && typeof sValue === "object") {
          sValue = this.objectToString(sValue);
        }
        sParams += `${sKey}: ${sValue}`;
        if (iNumberOfKeys > 1) {
          --iNumberOfKeys;
          sParams += ", ";
        }
      }
      return `{ ${sParams}}`;
    },
    /**
     * Removes escape characters (\) from an expression.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sExpression An expression with escape characters
     * @returns Expression string without escape characters or undefined
     */
    removeEscapeCharacters: function (sExpression) {
      return sExpression ? sExpression.replace(/\\?\\([{}])/g, "$1") : undefined;
    },
    /**
     * Makes updates to a stringified object so that it works properly in a template by adding ui5Object:true.
     *
     * @param sStringified
     * @returns The updated string representation of the object
     */
    stringifyObject: function (sStringified) {
      if (!sStringified || sStringified === "{}") {
        return undefined;
      } else {
        const oObject = JSON.parse(sStringified);
        if (typeof oObject === "object" && !Array.isArray(oObject)) {
          const oUI5Object = {
            ui5object: true
          };
          Object.assign(oUI5Object, oObject);
          return JSON.stringify(oUI5Object);
        } else {
          const sType = Array.isArray(oObject) ? "Array" : typeof oObject;
          Log.error(`Unexpected object type in stringifyObject (${sType}) - only works with object`);
          throw new Error("stringifyObject only works with objects!");
        }
      }
    },
    /**
     * Create a string representation of the given data, taking care that it is not treated as a binding expression.
     *
     * @param vData The data to stringify
     * @returns The string representation of the data.
     */
    stringifyCustomData: function (vData) {
      const oObject = {
        ui5object: true
      };
      oObject["customData"] = vData instanceof Context ? vData.getObject() : vData;
      return JSON.stringify(oObject);
    },
    /**
     * Parses the given data, potentially unwraps the data.
     *
     * @param vData The data to parse
     * @returns The result of the data parsing
     */
    parseCustomData: function (vData) {
      vData = typeof vData === "string" ? JSON.parse(vData) : vData;
      if (vData && vData.hasOwnProperty("customData")) {
        return vData["customData"];
      }
      return vData;
    },
    getContextPath: function (oValue, oInterface) {
      const sPath = oInterface && oInterface.context && oInterface.context.getPath();
      return sPath[sPath.length - 1] === "/" ? sPath.slice(0, -1) : sPath;
    },
    /**
     * Returns a stringified JSON object containing  Presentation Variant sort conditions.
     *
     * @param oContext
     * @param oPresentationVariant Presentation variant Annotation
     * @param sPresentationVariantPath
     * @returns Stringified JSON object
     */
    getSortConditions: function (oContext, oPresentationVariant, sPresentationVariantPath) {
      if (oPresentationVariant && CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath) && oPresentationVariant.SortOrder) {
        const aSortConditions = {
          sorters: []
        };
        const sEntityPath = oContext.getPath(0).split("@")[0];
        oPresentationVariant.SortOrder.forEach(function () {
          let oCondition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          let oSortProperty = {};
          const oSorter = {};
          if (oCondition.DynamicProperty) {
            var _oContext$getModel$ge;
            oSortProperty = (_oContext$getModel$ge = oContext.getModel(0).getObject(sEntityPath + oCondition.DynamicProperty.$AnnotationPath)) === null || _oContext$getModel$ge === void 0 ? void 0 : _oContext$getModel$ge.Name;
          } else if (oCondition.Property) {
            oSortProperty = oCondition.Property.$PropertyPath;
          }
          if (oSortProperty) {
            oSorter.name = oSortProperty;
            oSorter.descending = !!oCondition.Descending;
            aSortConditions.sorters.push(oSorter);
          } else {
            throw new Error("Please define the right path to the sort property");
          }
        });
        return JSON.stringify(aSortConditions);
      }
      return undefined;
    },
    _isPresentationVariantAnnotation: function (annotationPath) {
      return annotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.PresentationVariant"}`) > -1 || annotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.SelectionPresentationVariant"}`) > -1;
    },
    createPresentationPathContext: function (oPresentationContext) {
      const aPaths = oPresentationContext.sPath.split("@") || [];
      const oModel = oPresentationContext.getModel();
      if (aPaths.length && aPaths[aPaths.length - 1].indexOf("com.sap.vocabularies.UI.v1.SelectionPresentationVariant") > -1) {
        const sPath = oPresentationContext.sPath.split("/PresentationVariant")[0];
        return oModel.createBindingContext(`${sPath}@sapui.name`);
      }
      return oModel.createBindingContext(`${oPresentationContext.sPath}@sapui.name`);
    },
    getPressHandlerForDataFieldForIBN: function (oDataField, sContext, bNavigateWithConfirmationDialog) {
      if (!oDataField) return undefined;
      const mNavigationParameters = {
        navigationContexts: sContext ? sContext : "${$source>/}.getBindingContext()"
      };
      if (oDataField.RequiresContext && !oDataField.Inline && bNavigateWithConfirmationDialog) {
        mNavigationParameters.applicableContexts = "${internal>ibn/" + oDataField.SemanticObject + "-" + oDataField.Action + "/aApplicable/}";
        mNavigationParameters.notApplicableContexts = "${internal>ibn/" + oDataField.SemanticObject + "-" + oDataField.Action + "/aNotApplicable/}";
        mNavigationParameters.label = this.addSingleQuotes(oDataField.Label, true);
      }
      if (oDataField.Mapping) {
        mNavigationParameters.semanticObjectMapping = this.addSingleQuotes(JSON.stringify(oDataField.Mapping));
      }
      return this.generateFunction(bNavigateWithConfirmationDialog ? "._intentBasedNavigation.navigateWithConfirmationDialog" : "._intentBasedNavigation.navigate", this.addSingleQuotes(oDataField.SemanticObject), this.addSingleQuotes(oDataField.Action), this.objectToString(mNavigationParameters));
    },
    getEntitySet: function (oContext) {
      const sPath = oContext.getPath();
      return ModelHelper.getEntitySetPath(sPath);
    },
    /**
     * Handles the visibility of form menu actions both in path based and static value scenarios.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sVisibleValue Either static boolean values or Array of path expressions for visibility of menu button.
     * @returns The binding expression determining the visibility of menu actions.
     */
    handleVisibilityOfMenuActions: function (sVisibleValue) {
      const combinedConditions = [];
      if (Array.isArray(sVisibleValue)) {
        for (let i = 0; i < sVisibleValue.length; i++) {
          if (sVisibleValue[i].indexOf("{") > -1 && sVisibleValue[i].indexOf("{=") === -1) {
            sVisibleValue[i] = "{=" + sVisibleValue[i] + "}";
          }
          if (sVisibleValue[i].split("{=").length > 0) {
            sVisibleValue[i] = sVisibleValue[i].split("{=")[1].slice(0, -1);
          }
          combinedConditions.push(`(${sVisibleValue[i]})`);
        }
      }
      return combinedConditions.length > 0 ? `{= ${combinedConditions.join(" || ")}}` : sVisibleValue;
    },
    /**
     * Method to do the calculation of criticality in case CriticalityCalculation present in the annotation
     *
     * The calculation is done by comparing a value to the threshold values relevant for the specified improvement direction.
     * For improvement direction Target, the criticality is calculated using both low and high threshold values. It will be
     *
     * - Positive if the value is greater than or equal to AcceptanceRangeLowValue and lower than or equal to AcceptanceRangeHighValue
     * - Neutral if the value is greater than or equal to ToleranceRangeLowValue and lower than AcceptanceRangeLowValue OR greater than AcceptanceRangeHighValue and lower than or equal to ToleranceRangeHighValue
     * - Critical if the value is greater than or equal to DeviationRangeLowValue and lower than ToleranceRangeLowValue OR greater than ToleranceRangeHighValue and lower than or equal to DeviationRangeHighValue
     * - Negative if the value is lower than DeviationRangeLowValue or greater than DeviationRangeHighValue
     *
     * For improvement direction Minimize, the criticality is calculated using the high threshold values. It is
     * - Positive if the value is lower than or equal to AcceptanceRangeHighValue
     * - Neutral if the value is greater than AcceptanceRangeHighValue and lower than or equal to ToleranceRangeHighValue
     * - Critical if the value is greater than ToleranceRangeHighValue and lower than or equal to DeviationRangeHighValue
     * - Negative if the value is greater than DeviationRangeHighValue
     *
     * For improvement direction Maximize, the criticality is calculated using the low threshold values. It is
     *
     * - Positive if the value is greater than or equal to AcceptanceRangeLowValue
     * - Neutral if the value is less than AcceptanceRangeLowValue and greater than or equal to ToleranceRangeLowValue
     * - Critical if the value is lower than ToleranceRangeLowValue and greater than or equal to DeviationRangeLowValue
     * - Negative if the value is lower than DeviationRangeLowValue
     *
     * Thresholds are optional. For unassigned values, defaults are determined in this order:
     *
     * - For DeviationRange, an omitted LowValue translates into the smallest possible number (-INF), an omitted HighValue translates into the largest possible number (+INF)
     * - For ToleranceRange, an omitted LowValue will be initialized with DeviationRangeLowValue, an omitted HighValue will be initialized with DeviationRangeHighValue
     * - For AcceptanceRange, an omitted LowValue will be initialized with ToleranceRangeLowValue, an omitted HighValue will be initialized with ToleranceRangeHighValue.
     *
     * @param sImprovementDirection ImprovementDirection to be used for creating the criticality binding
     * @param sValue Value from Datapoint to be measured
     * @param sDeviationLow ExpressionBinding for Lower Deviation level
     * @param sToleranceLow ExpressionBinding for Lower Tolerance level
     * @param sAcceptanceLow ExpressionBinding for Lower Acceptance level
     * @param sAcceptanceHigh ExpressionBinding for Higher Acceptance level
     * @param sToleranceHigh ExpressionBinding for Higher Tolerance level
     * @param sDeviationHigh ExpressionBinding for Higher Deviation level
     * @returns Returns criticality calculation as expression binding
     */
    getCriticalityCalculationBinding: function (sImprovementDirection, sValue, sDeviationLow, sToleranceLow, sAcceptanceLow, sAcceptanceHigh, sToleranceHigh, sDeviationHigh) {
      let sCriticalityExpression = ValueColor.Neutral; // Default Criticality State

      sValue = `%${sValue}`;

      // Setting Unassigned Values
      sDeviationLow = sDeviationLow || -Infinity;
      sToleranceLow = sToleranceLow || sDeviationLow;
      sAcceptanceLow = sAcceptanceLow || sToleranceLow;
      sDeviationHigh = sDeviationHigh || Infinity;
      sToleranceHigh = sToleranceHigh || sDeviationHigh;
      sAcceptanceHigh = sAcceptanceHigh || sToleranceHigh;

      // Dealing with Decimal and Path based bingdings
      sDeviationLow = sDeviationLow && (+sDeviationLow ? +sDeviationLow : `%${sDeviationLow}`);
      sToleranceLow = sToleranceLow && (+sToleranceLow ? +sToleranceLow : `%${sToleranceLow}`);
      sAcceptanceLow = sAcceptanceLow && (+sAcceptanceLow ? +sAcceptanceLow : `%${sAcceptanceLow}`);
      sAcceptanceHigh = sAcceptanceHigh && (+sAcceptanceHigh ? +sAcceptanceHigh : `%${sAcceptanceHigh}`);
      sToleranceHigh = sToleranceHigh && (+sToleranceHigh ? +sToleranceHigh : `%${sToleranceHigh}`);
      sDeviationHigh = sDeviationHigh && (+sDeviationHigh ? +sDeviationHigh : `%${sDeviationHigh}`);

      // Creating runtime expression binding from criticality calculation for Criticality State
      if (sImprovementDirection.indexOf("Minimize") > -1) {
        sCriticalityExpression = "{= " + sValue + " <= " + sAcceptanceHigh + " ? '" + ValueColor.Good + "' : " + sValue + " <= " + sToleranceHigh + " ? '" + ValueColor.Neutral + "' : " + "(" + sDeviationHigh + " && " + sValue + " <= " + sDeviationHigh + ") ? '" + ValueColor.Critical + "' : '" + ValueColor.Error + "' }";
      } else if (sImprovementDirection.indexOf("Maximize") > -1) {
        sCriticalityExpression = "{= " + sValue + " >= " + sAcceptanceLow + " ? '" + ValueColor.Good + "' : " + sValue + " >= " + sToleranceLow + " ? '" + ValueColor.Neutral + "' : " + "(" + sDeviationLow + " && " + sValue + " >= " + sDeviationLow + ") ? '" + ValueColor.Critical + "' : '" + ValueColor.Error + "' }";
      } else if (sImprovementDirection.indexOf("Target") > -1) {
        sCriticalityExpression = "{= (" + sValue + " <= " + sAcceptanceHigh + " && " + sValue + " >= " + sAcceptanceLow + ") ? '" + ValueColor.Good + "' : " + "((" + sValue + " >= " + sToleranceLow + " && " + sValue + " < " + sAcceptanceLow + ") || (" + sValue + " > " + sAcceptanceHigh + " && " + sValue + " <= " + sToleranceHigh + ")) ? '" + ValueColor.Neutral + "' : " + "((" + sDeviationLow + " && (" + sValue + " >= " + sDeviationLow + ") && (" + sValue + " < " + sToleranceLow + ")) || ((" + sValue + " > " + sToleranceHigh + ") && " + sDeviationHigh + " && (" + sValue + " <= " + sDeviationHigh + "))) ? '" + ValueColor.Critical + "' : '" + ValueColor.Error + "' }";
      } else {
        Log.warning("Case not supported, returning the default Value Neutral");
      }
      return sCriticalityExpression;
    },
    /**
     * To fetch measure attribute index.
     *
     * @param iMeasure Chart Annotations
     * @param oChartAnnotations Chart Annotations
     * @returns MeasureAttribute index.
     * @private
     */
    getMeasureAttributeIndex: function (iMeasure, oChartAnnotations) {
      var _oChartAnnotations$Me, _oChartAnnotations$Dy;
      let aMeasures, sMeasurePropertyPath;
      if ((oChartAnnotations === null || oChartAnnotations === void 0 ? void 0 : (_oChartAnnotations$Me = oChartAnnotations.Measures) === null || _oChartAnnotations$Me === void 0 ? void 0 : _oChartAnnotations$Me.length) > 0) {
        aMeasures = oChartAnnotations.Measures;
        sMeasurePropertyPath = aMeasures[iMeasure].$PropertyPath;
      } else if ((oChartAnnotations === null || oChartAnnotations === void 0 ? void 0 : (_oChartAnnotations$Dy = oChartAnnotations.DynamicMeasures) === null || _oChartAnnotations$Dy === void 0 ? void 0 : _oChartAnnotations$Dy.length) > 0) {
        aMeasures = oChartAnnotations.DynamicMeasures;
        sMeasurePropertyPath = aMeasures[iMeasure].$AnnotationPath;
      }
      let bMeasureAttributeExists;
      const aMeasureAttributes = oChartAnnotations.MeasureAttributes;
      let iMeasureAttribute = -1;
      const fnCheckMeasure = function (sMeasurePath, oMeasureAttribute, index) {
        if (oMeasureAttribute) {
          if (oMeasureAttribute.Measure && oMeasureAttribute.Measure.$PropertyPath === sMeasurePath) {
            iMeasureAttribute = index;
            return true;
          } else if (oMeasureAttribute.DynamicMeasure && oMeasureAttribute.DynamicMeasure.$AnnotationPath === sMeasurePath) {
            iMeasureAttribute = index;
            return true;
          }
        }
      };
      if (aMeasureAttributes) {
        bMeasureAttributeExists = aMeasureAttributes.some(fnCheckMeasure.bind(null, sMeasurePropertyPath));
      }
      return bMeasureAttributeExists && iMeasureAttribute > -1 && iMeasureAttribute;
    },
    getMeasureAttribute: function (oContext) {
      const oMetaModel = oContext.getModel(),
        sChartAnnotationPath = oContext.getPath();
      return oMetaModel.requestObject(sChartAnnotationPath).then(function (oChartAnnotations) {
        const aMeasureAttributes = oChartAnnotations.MeasureAttributes,
          iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(0, oChartAnnotations);
        const sMeasureAttributePath = iMeasureAttribute > -1 && aMeasureAttributes[iMeasureAttribute] && aMeasureAttributes[iMeasureAttribute].DataPoint ? `${sChartAnnotationPath}/MeasureAttributes/${iMeasureAttribute}/` : undefined;
        if (sMeasureAttributePath === undefined) {
          Log.warning("DataPoint missing for the measure");
        }
        return sMeasureAttributePath ? `${sMeasureAttributePath}DataPoint/$AnnotationPath/` : sMeasureAttributePath;
      });
    },
    /**
     * This function returns the measureAttribute for the measure.
     *
     * @param oContext Context to the measure annotation
     * @returns Path to the measureAttribute of the measure
     */
    getMeasureAttributeForMeasure: function (oContext) {
      const oMetaModel = oContext.getModel(),
        sMeasurePath = oContext.getPath(),
        sChartAnnotationPath = sMeasurePath.substring(0, sMeasurePath.lastIndexOf("Measure")),
        iMeasure = sMeasurePath.replace(/.*\//, "");
      const oChartAnnotations = oMetaModel.getObject(sChartAnnotationPath);
      const aMeasureAttributes = oChartAnnotations.MeasureAttributes,
        iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(iMeasure, oChartAnnotations);
      const sMeasureAttributePath = iMeasureAttribute > -1 && aMeasureAttributes[iMeasureAttribute] && aMeasureAttributes[iMeasureAttribute].DataPoint ? `${sChartAnnotationPath}MeasureAttributes/${iMeasureAttribute}/` : undefined;
      if (sMeasureAttributePath === undefined) {
        Log.warning("DataPoint missing for the measure");
      }
      return sMeasureAttributePath ? `${sMeasureAttributePath}DataPoint/$AnnotationPath/` : sMeasureAttributePath;
    },
    /**
     * Method to determine if the contained navigation property has a draft root/node parent entitySet.
     *
     * @function
     * @name isDraftParentEntityForContainment
     * @param oTargetCollectionContainsTarget Target collection has ContainsTarget property
     * @param oTableMetadata Table metadata for which draft support shall be checked
     * @returns Returns true if draft
     */
    isDraftParentEntityForContainment: function (oTargetCollectionContainsTarget, oTableMetadata) {
      if (oTargetCollectionContainsTarget) {
        if (oTableMetadata && oTableMetadata.parentEntitySet && oTableMetadata.parentEntitySet.sPath) {
          const sParentEntitySetPath = oTableMetadata.parentEntitySet.sPath;
          const oDraftRoot = oTableMetadata.parentEntitySet.oModel.getObject(`${sParentEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
          const oDraftNode = oTableMetadata.parentEntitySet.oModel.getObject(`${sParentEntitySetPath}@com.sap.vocabularies.Common.v1.DraftNode`);
          if (oDraftRoot || oDraftNode) {
            return true;
          } else {
            return false;
          }
        }
      }
      return false;
    },
    /**
     * Ensures the data is processed as defined in the template.
     * Since the property Data is of the type 'object', it may not be in the same order as required by the template.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param dataElement The data that is currently being processed.
     * @returns The correct path according to the template.
     */
    getDataFromTemplate: function (dataElement) {
      const splitPath = dataElement.getPath().split("/");
      const dataKey = splitPath[splitPath.length - 1];
      const connectedDataPath = `/${splitPath.slice(1, -2).join("/")}/@`;
      const connectedObject = dataElement.getObject(connectedDataPath);
      const template = connectedObject.Template;
      const splitTemp = template.split("}");
      const tempArray = [];
      for (let i = 0; i < splitTemp.length - 1; i++) {
        const key = splitTemp[i].split("{")[1].trim();
        tempArray.push(key);
      }
      Object.keys(connectedObject.Data).forEach(function (sKey) {
        if (sKey.startsWith("$")) {
          delete connectedObject.Data[sKey];
        }
      });
      const index = Object.keys(connectedObject.Data).indexOf(dataKey);
      return `/${splitPath.slice(1, -2).join("/")}/Data/${tempArray[index]}`;
    },
    /**
     * Checks if the end of the template has been reached.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param target The target of the connected fields.
     * @param element The element that is currently being processed.
     * @returns True or False (depending on the template index).
     */
    notLastIndex: function (target, element) {
      const template = target.Template;
      const splitTemp = template.split("}");
      const tempArray = [];
      let isLastIndex = false;
      for (let i = 0; i < splitTemp.length - 1; i++) {
        const dataKey = splitTemp[i].split("{")[1].trim();
        tempArray.push(dataKey);
      }
      tempArray.forEach(function (templateInfo) {
        if (target.Data[templateInfo] === element && tempArray.indexOf(templateInfo) !== tempArray.length - 1) {
          isLastIndex = true;
        }
      });
      return isLastIndex;
    },
    /**
     * Determines the delimiter from the template.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param template The template string.
     * @returns The delimiter in the template string.
     */
    getDelimiter: function (template) {
      return template.split("}")[1].split("{")[0].trim();
    },
    oMetaModel: undefined,
    setMetaModel: function (oMetaModel) {
      this.oMetaModel = oMetaModel;
    },
    getMetaModel: function (oContext, oInterface) {
      if (oContext) {
        return oInterface.context.getModel();
      }
      return this.oMetaModel;
    },
    getParameters: function (oContext, oInterface) {
      if (oContext) {
        const oMetaModel = oInterface.context.getModel();
        const sPath = oInterface.context.getPath();
        const oParameterInfo = CommonUtils.getParameterInfo(oMetaModel, sPath);
        if (oParameterInfo.parameterProperties) {
          return Object.keys(oParameterInfo.parameterProperties);
        }
      }
      return [];
    },
    /**
     * Build an expression calling an action handler via the FPM helper's actionWrapper function
     *
     * This function assumes that the 'FPM.actionWrapper()' function is available at runtime.
     *
     * @param oAction Action metadata
     * @param oAction.handlerModule Module containing the action handler method
     * @param oAction.handlerMethod Action handler method name
     * @param [oThis] `this` (if the function is called from a macro)
     * @param oThis.id The table's ID
     * @returns The action wrapper binding	expression
     */
    buildActionWrapper: function (oAction, oThis) {
      const aParams = [ref("$event"), oAction.handlerModule, oAction.handlerMethod];
      if (oThis && oThis.id) {
        const oAdditionalParams = {
          contexts: ref("${internal>selectedContexts}")
        };
        aParams.push(oAdditionalParams);
      }
      return compileExpression(fn("FPM.actionWrapper", aParams));
    },
    /**
     * Returns the value whether or not the element should be visible depending on the Hidden annotation.
     * It is inverted as the UI elements have a visible property instead of a hidden one.
     *
     * @param dataFieldAnnotations The dataField object
     * @returns A path or a Boolean
     */
    getHiddenPathExpression: function (dataFieldAnnotations) {
      if (dataFieldAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] !== null) {
        const hidden = dataFieldAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
        return typeof hidden === "object" ? "{= !${" + hidden.$Path + "} }" : !hidden;
      }
      return true;
    },
    validatePresentationMetaPath: function (metaPath, objectTerm) {
      // perform validation only if annotation set (to avoid backwards compatibility issues for test without annotations)
      if (metaPath.indexOf(objectTerm.slice(0, objectTerm.lastIndexOf("."))) > -1) {
        const allowedTerms = ["com.sap.vocabularies.UI.v1.PresentationVariant", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant", objectTerm];
        if (!allowedTerms.some(term => {
          return metaPath.search(new RegExp(`${term}(#|/|$)`)) > -1;
        })) {
          throw new Error(`Annotation Path ${metaPath} mentioned in the manifest is not valid for ${objectTerm}`);
        }
      }
    }
  };
  CommonHelper.getSortConditions.requiresIContext = true;
  return CommonHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUNvbG9yIiwibUxpYnJhcnkiLCJDb21tb25IZWxwZXIiLCJnZXRQYXRoVG9LZXkiLCJvQ3R4IiwiZ2V0T2JqZWN0IiwiaXNWaXNpYmxlIiwidGFyZ2V0Iiwib0ludGVyZmFjZSIsIm9Nb2RlbCIsImNvbnRleHQiLCJnZXRNb2RlbCIsInNQcm9wZXJ0eVBhdGgiLCJnZXRQYXRoIiwib0Fubm90YXRpb25zIiwiaGlkZGVuIiwiJFBhdGgiLCJnZXRQYXJhbWV0ZXJFZGl0TW9kZSIsImZpZWxkQ29udHJvbCIsImltbXV0YWJsZSIsImNvbXB1dGVkIiwic0VkaXRNb2RlIiwiRWRpdE1vZGUiLCJFZGl0YWJsZSIsIlJlYWRPbmx5IiwiJEVudW1NZW1iZXIiLCJEaXNhYmxlZCIsImdldE1ldGFQYXRoIiwidW5kZWZpbmVkIiwiaXNEZXNrdG9wIiwic3lzdGVtIiwiZGVza3RvcCIsImdldFRhcmdldENvbGxlY3Rpb25QYXRoIiwibmF2Q29sbGVjdGlvbiIsInNQYXRoIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwiZ2V0TWV0YU1vZGVsIiwiYVBhcnRzIiwic3BsaXQiLCJmaWx0ZXIiLCJzUGFydCIsImVudGl0eVNldCIsImxlbmd0aCIsIm5hdmlnYXRpb25Db2xsZWN0aW9uIiwic2xpY2UiLCJqb2luIiwiaXNQcm9wZXJ0eUZpbHRlcmFibGUiLCJvRGF0YUZpZWxkIiwic1Byb3BlcnR5TG9jYXRpb25QYXRoIiwiZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgiLCJzUHJvcGVydHkiLCJyZXBsYWNlIiwiJFR5cGUiLCJpTGVuZ3RoIiwic0NvbGxlY3Rpb25QYXRoIiwibGFzdEluZGV4T2YiLCJpbmRleE9mIiwiZ290b0FjdGlvblBhcmFtZXRlciIsIm9Db250ZXh0Iiwic1Byb3BlcnR5TmFtZSIsIkNvbW1vblV0aWxzIiwiZ2V0UGFyYW1ldGVyUGF0aCIsImdldEVudGl0eVNldE5hbWUiLCJvTWV0YU1vZGVsIiwic0VudGl0eVR5cGUiLCJvRW50aXR5Q29udGFpbmVyIiwia2V5IiwiZ2V0QWN0aW9uUGF0aCIsIm9BY3Rpb24iLCJiUmV0dXJuT25seVBhdGgiLCJzQWN0aW9uTmFtZSIsImJDaGVja1N0YXRpY1ZhbHVlIiwic0NvbnRleHRQYXRoIiwic0VudGl0eVR5cGVOYW1lIiwic0VudGl0eU5hbWUiLCJzQmluZGluZ1BhcmFtZXRlciIsImdldE5hdmlnYXRpb25Db250ZXh0IiwiT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIiLCJnZXROYXZpZ2F0aW9uUGF0aCIsImJLZWVwUHJvcGVydHkiLCJiU3RhcnRzV2l0aEVudGl0eVR5cGUiLCJzdGFydHNXaXRoIiwicGFydCIsInNoaWZ0IiwicG9wIiwiZ2V0QWN0aW9uQ29udGV4dCIsImdldFBhdGhUb0JvdW5kQWN0aW9uT3ZlcmxvYWQiLCJhZGRTaW5nbGVRdW90ZXMiLCJzVmFsdWUiLCJiRXNjYXBlIiwiZXNjYXBlU2luZ2xlUXVvdGVzIiwiZ2VuZXJhdGVGdW5jdGlvbiIsInNGdW5jTmFtZSIsInNQYXJhbXMiLCJpIiwic0Z1bmN0aW9uIiwiZ2V0SGVhZGVyRGF0YVBvaW50TGlua1Zpc2liaWxpdHkiLCJiTGluayIsImJGaWVsZFZpc2liaWxpdHkiLCJzVmlzaWJpbGl0eUV4cCIsIm9iamVjdFRvU3RyaW5nIiwib1BhcmFtcyIsImlOdW1iZXJPZktleXMiLCJPYmplY3QiLCJrZXlzIiwic0tleSIsInJlbW92ZUVzY2FwZUNoYXJhY3RlcnMiLCJzRXhwcmVzc2lvbiIsInN0cmluZ2lmeU9iamVjdCIsInNTdHJpbmdpZmllZCIsIm9PYmplY3QiLCJKU09OIiwicGFyc2UiLCJBcnJheSIsImlzQXJyYXkiLCJvVUk1T2JqZWN0IiwidWk1b2JqZWN0IiwiYXNzaWduIiwic3RyaW5naWZ5Iiwic1R5cGUiLCJMb2ciLCJlcnJvciIsIkVycm9yIiwic3RyaW5naWZ5Q3VzdG9tRGF0YSIsInZEYXRhIiwiQ29udGV4dCIsInBhcnNlQ3VzdG9tRGF0YSIsImhhc093blByb3BlcnR5IiwiZ2V0Q29udGV4dFBhdGgiLCJvVmFsdWUiLCJnZXRTb3J0Q29uZGl0aW9ucyIsIm9QcmVzZW50YXRpb25WYXJpYW50Iiwic1ByZXNlbnRhdGlvblZhcmlhbnRQYXRoIiwiX2lzUHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24iLCJTb3J0T3JkZXIiLCJhU29ydENvbmRpdGlvbnMiLCJzb3J0ZXJzIiwic0VudGl0eVBhdGgiLCJmb3JFYWNoIiwib0NvbmRpdGlvbiIsIm9Tb3J0UHJvcGVydHkiLCJvU29ydGVyIiwiRHluYW1pY1Byb3BlcnR5IiwiJEFubm90YXRpb25QYXRoIiwiTmFtZSIsIlByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIm5hbWUiLCJkZXNjZW5kaW5nIiwiRGVzY2VuZGluZyIsInB1c2giLCJhbm5vdGF0aW9uUGF0aCIsImNyZWF0ZVByZXNlbnRhdGlvblBhdGhDb250ZXh0Iiwib1ByZXNlbnRhdGlvbkNvbnRleHQiLCJhUGF0aHMiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTiIsInNDb250ZXh0IiwiYk5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZyIsIm1OYXZpZ2F0aW9uUGFyYW1ldGVycyIsIm5hdmlnYXRpb25Db250ZXh0cyIsIlJlcXVpcmVzQ29udGV4dCIsIklubGluZSIsImFwcGxpY2FibGVDb250ZXh0cyIsIlNlbWFudGljT2JqZWN0IiwiQWN0aW9uIiwibm90QXBwbGljYWJsZUNvbnRleHRzIiwibGFiZWwiLCJMYWJlbCIsIk1hcHBpbmciLCJzZW1hbnRpY09iamVjdE1hcHBpbmciLCJnZXRFbnRpdHlTZXQiLCJNb2RlbEhlbHBlciIsImdldEVudGl0eVNldFBhdGgiLCJoYW5kbGVWaXNpYmlsaXR5T2ZNZW51QWN0aW9ucyIsInNWaXNpYmxlVmFsdWUiLCJjb21iaW5lZENvbmRpdGlvbnMiLCJnZXRDcml0aWNhbGl0eUNhbGN1bGF0aW9uQmluZGluZyIsInNJbXByb3ZlbWVudERpcmVjdGlvbiIsInNEZXZpYXRpb25Mb3ciLCJzVG9sZXJhbmNlTG93Iiwic0FjY2VwdGFuY2VMb3ciLCJzQWNjZXB0YW5jZUhpZ2giLCJzVG9sZXJhbmNlSGlnaCIsInNEZXZpYXRpb25IaWdoIiwic0NyaXRpY2FsaXR5RXhwcmVzc2lvbiIsIk5ldXRyYWwiLCJJbmZpbml0eSIsIkdvb2QiLCJDcml0aWNhbCIsIndhcm5pbmciLCJnZXRNZWFzdXJlQXR0cmlidXRlSW5kZXgiLCJpTWVhc3VyZSIsIm9DaGFydEFubm90YXRpb25zIiwiYU1lYXN1cmVzIiwic01lYXN1cmVQcm9wZXJ0eVBhdGgiLCJNZWFzdXJlcyIsIkR5bmFtaWNNZWFzdXJlcyIsImJNZWFzdXJlQXR0cmlidXRlRXhpc3RzIiwiYU1lYXN1cmVBdHRyaWJ1dGVzIiwiTWVhc3VyZUF0dHJpYnV0ZXMiLCJpTWVhc3VyZUF0dHJpYnV0ZSIsImZuQ2hlY2tNZWFzdXJlIiwic01lYXN1cmVQYXRoIiwib01lYXN1cmVBdHRyaWJ1dGUiLCJpbmRleCIsIk1lYXN1cmUiLCJEeW5hbWljTWVhc3VyZSIsInNvbWUiLCJiaW5kIiwiZ2V0TWVhc3VyZUF0dHJpYnV0ZSIsInNDaGFydEFubm90YXRpb25QYXRoIiwicmVxdWVzdE9iamVjdCIsInRoZW4iLCJzTWVhc3VyZUF0dHJpYnV0ZVBhdGgiLCJEYXRhUG9pbnQiLCJnZXRNZWFzdXJlQXR0cmlidXRlRm9yTWVhc3VyZSIsInN1YnN0cmluZyIsImlzRHJhZnRQYXJlbnRFbnRpdHlGb3JDb250YWlubWVudCIsIm9UYXJnZXRDb2xsZWN0aW9uQ29udGFpbnNUYXJnZXQiLCJvVGFibGVNZXRhZGF0YSIsInBhcmVudEVudGl0eVNldCIsInNQYXJlbnRFbnRpdHlTZXRQYXRoIiwib0RyYWZ0Um9vdCIsIm9EcmFmdE5vZGUiLCJnZXREYXRhRnJvbVRlbXBsYXRlIiwiZGF0YUVsZW1lbnQiLCJzcGxpdFBhdGgiLCJkYXRhS2V5IiwiY29ubmVjdGVkRGF0YVBhdGgiLCJjb25uZWN0ZWRPYmplY3QiLCJ0ZW1wbGF0ZSIsIlRlbXBsYXRlIiwic3BsaXRUZW1wIiwidGVtcEFycmF5IiwidHJpbSIsIkRhdGEiLCJub3RMYXN0SW5kZXgiLCJlbGVtZW50IiwiaXNMYXN0SW5kZXgiLCJ0ZW1wbGF0ZUluZm8iLCJnZXREZWxpbWl0ZXIiLCJzZXRNZXRhTW9kZWwiLCJnZXRQYXJhbWV0ZXJzIiwib1BhcmFtZXRlckluZm8iLCJnZXRQYXJhbWV0ZXJJbmZvIiwicGFyYW1ldGVyUHJvcGVydGllcyIsImJ1aWxkQWN0aW9uV3JhcHBlciIsIm9UaGlzIiwiYVBhcmFtcyIsInJlZiIsImhhbmRsZXJNb2R1bGUiLCJoYW5kbGVyTWV0aG9kIiwiaWQiLCJvQWRkaXRpb25hbFBhcmFtcyIsImNvbnRleHRzIiwiY29tcGlsZUV4cHJlc3Npb24iLCJmbiIsImdldEhpZGRlblBhdGhFeHByZXNzaW9uIiwiZGF0YUZpZWxkQW5ub3RhdGlvbnMiLCJ2YWxpZGF0ZVByZXNlbnRhdGlvbk1ldGFQYXRoIiwibWV0YVBhdGgiLCJvYmplY3RUZXJtIiwiYWxsb3dlZFRlcm1zIiwidGVybSIsInNlYXJjaCIsIlJlZ0V4cCIsInJlcXVpcmVzSUNvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbW1vbkhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgQ3VzdG9tQWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGZuLCByZWYgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgaXNQcm9wZXJ0eUZpbHRlcmFibGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9NZXRhTW9kZWxGdW5jdGlvblwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgbUxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCB7IHN5c3RlbSB9IGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbmNvbnN0IFZhbHVlQ29sb3IgPSBtTGlicmFyeS5WYWx1ZUNvbG9yO1xuY29uc3QgQ29tbW9uSGVscGVyID0ge1xuXHRnZXRQYXRoVG9LZXk6IGZ1bmN0aW9uIChvQ3R4OiBhbnkpIHtcblx0XHRyZXR1cm4gb0N0eC5nZXRPYmplY3QoKTtcblx0fSxcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyBpZiBhIGZpZWxkIGlzIHZpc2libGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGFyZ2V0IGluc3RhbmNlXG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlIEludGVyZmFjZSBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUsIGZhbHNlLCBvciBleHByZXNzaW9uIHdpdGggcGF0aFxuXHQgKi9cblx0aXNWaXNpYmxlOiBmdW5jdGlvbiAodGFyZ2V0OiBvYmplY3QsIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0c1Byb3BlcnR5UGF0aCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRvQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NQcm9wZXJ0eVBhdGh9QGApLFxuXHRcdFx0aGlkZGVuID0gb0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXTtcblxuXHRcdHJldHVybiB0eXBlb2YgaGlkZGVuID09PSBcIm9iamVjdFwiID8gXCJ7PSAhJHtcIiArIGhpZGRlbi4kUGF0aCArIFwifSB9XCIgOiAhaGlkZGVuO1xuXHR9LFxuXHQvKipcblx0ICogRGV0ZXJtaW5lIGlmIGZpZWxkIGlzIGVkaXRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gdGFyZ2V0IFRhcmdldCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gb0ludGVyZmFjZSBJbnRlcmZhY2UgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQSBCaW5kaW5nIEV4cHJlc3Npb24gdG8gZGV0ZXJtaW5lIGlmIGEgZmllbGQgc2hvdWxkIGJlIGVkaXRhYmxlIG9yIG5vdC5cblx0ICovXG5cdGdldFBhcmFtZXRlckVkaXRNb2RlOiBmdW5jdGlvbiAodGFyZ2V0OiBvYmplY3QsIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0c1Byb3BlcnR5UGF0aCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRvQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NQcm9wZXJ0eVBhdGh9QGApLFxuXHRcdFx0ZmllbGRDb250cm9sID0gb0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xcIl0sXG5cdFx0XHRpbW11dGFibGUgPSBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuSW1tdXRhYmxlXCJdLFxuXHRcdFx0Y29tcHV0ZWQgPSBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWRcIl07XG5cblx0XHRsZXQgc0VkaXRNb2RlOiBFZGl0TW9kZSB8IHN0cmluZyA9IEVkaXRNb2RlLkVkaXRhYmxlO1xuXG5cdFx0aWYgKGltbXV0YWJsZSB8fCBjb21wdXRlZCkge1xuXHRcdFx0c0VkaXRNb2RlID0gRWRpdE1vZGUuUmVhZE9ubHk7XG5cdFx0fSBlbHNlIGlmIChmaWVsZENvbnRyb2wpIHtcblx0XHRcdGlmIChmaWVsZENvbnRyb2wuJEVudW1NZW1iZXIpIHtcblx0XHRcdFx0aWYgKGZpZWxkQ29udHJvbC4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sVHlwZS9SZWFkT25seVwiKSB7XG5cdFx0XHRcdFx0c0VkaXRNb2RlID0gRWRpdE1vZGUuUmVhZE9ubHk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdGZpZWxkQ29udHJvbC4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sVHlwZS9JbmFwcGxpY2FibGVcIiB8fFxuXHRcdFx0XHRcdGZpZWxkQ29udHJvbC4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sVHlwZS9IaWRkZW5cIlxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRzRWRpdE1vZGUgPSBFZGl0TW9kZS5EaXNhYmxlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGZpZWxkQ29udHJvbC4kUGF0aCkge1xuXHRcdFx0XHRzRWRpdE1vZGUgPVxuXHRcdFx0XHRcdFwiez0gJXtcIiArXG5cdFx0XHRcdFx0ZmllbGRDb250cm9sLiRQYXRoICtcblx0XHRcdFx0XHRcIn0gPCAzID8gKCV7XCIgK1xuXHRcdFx0XHRcdGZpZWxkQ29udHJvbC4kUGF0aCArXG5cdFx0XHRcdFx0XCJ9ID09PSAwID8gJ1wiICtcblx0XHRcdFx0XHRFZGl0TW9kZS5EaXNhYmxlZCArXG5cdFx0XHRcdFx0XCInIDogJ1wiICtcblx0XHRcdFx0XHRFZGl0TW9kZS5SZWFkT25seSArXG5cdFx0XHRcdFx0XCInKSA6ICdcIiArXG5cdFx0XHRcdFx0RWRpdE1vZGUuRWRpdGFibGUgK1xuXHRcdFx0XHRcdFwiJ31cIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gc0VkaXRNb2RlO1xuXHR9LFxuXHQvKipcblx0ICogR2V0IHRoZSBjb21wbGV0ZSBtZXRhcGF0aCB0byB0aGUgdGFyZ2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdGFyZ2V0XG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlXG5cdCAqIEByZXR1cm5zIFRoZSBtZXRhcGF0aFxuXHQgKi9cblx0Z2V0TWV0YVBhdGg6IGZ1bmN0aW9uICh0YXJnZXQ6IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0cmV0dXJuIChvSW50ZXJmYWNlICYmIG9JbnRlcmZhY2UuY29udGV4dCAmJiBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpKSB8fCB1bmRlZmluZWQ7XG5cdH0sXG5cdGlzRGVza3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBzeXN0ZW0uZGVza3RvcCA9PT0gdHJ1ZTtcblx0fSxcblx0Z2V0VGFyZ2V0Q29sbGVjdGlvblBhdGg6IGZ1bmN0aW9uIChjb250ZXh0OiBDb250ZXh0LCBuYXZDb2xsZWN0aW9uPzogYW55KSB7XG5cdFx0bGV0IHNQYXRoID0gY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0aWYgKFxuXHRcdFx0Y29udGV4dC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSA9PT0gXCJzYXAudWkubW9kZWwuQ29udGV4dFwiICYmXG5cdFx0XHQoKGNvbnRleHQuZ2V0T2JqZWN0KFwiJGtpbmRcIikgYXMgdW5rbm93biBhcyBzdHJpbmcpID09PSBcIkVudGl0eVNldFwiIHx8XG5cdFx0XHRcdChjb250ZXh0LmdldE9iamVjdChcIiRDb250YWluc1RhcmdldFwiKSBhcyB1bmtub3duIGFzIGJvb2xlYW4pID09PSB0cnVlKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHNQYXRoO1xuXHRcdH1cblx0XHRpZiAoY29udGV4dC5nZXRNb2RlbCkge1xuXHRcdFx0c1BhdGggPVxuXHRcdFx0XHQoY29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFQYXRoICYmIGNvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhUGF0aChzUGF0aCkpIHx8XG5cdFx0XHRcdGNvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSEuZ2V0TWV0YVBhdGgoc1BhdGgpO1xuXHRcdH1cblx0XHQvL1N1cHBvcnRpbmcgc1BhdGggb2YgYW55IGZvcm1hdCwgZWl0aGVyICcvPGVudGl0eVNldD4vPG5hdmlnYXRpb25Db2xsZWN0aW9uPicgPE9SPiAnLzxlbnRpdHlTZXQ+LyRUeXBlLzxuYXZpZ2F0aW9uQ29sbGVjdGlvbj4nXG5cdFx0Y29uc3QgYVBhcnRzID0gc1BhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihmdW5jdGlvbiAoc1BhcnQ6IGFueSkge1xuXHRcdFx0cmV0dXJuIHNQYXJ0ICYmIHNQYXJ0ICE9IFwiJFR5cGVcIjtcblx0XHR9KTsgLy9maWx0ZXIgb3V0IGVtcHR5IHN0cmluZ3MgYW5kIHBhcnRzIHJlZmVycmluZyB0byAnJFR5cGUnXG5cdFx0Y29uc3QgZW50aXR5U2V0ID0gYC8ke2FQYXJ0c1swXX1gO1xuXHRcdGlmIChhUGFydHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gZW50aXR5U2V0O1xuXHRcdH1cblx0XHRjb25zdCBuYXZpZ2F0aW9uQ29sbGVjdGlvbiA9IG5hdkNvbGxlY3Rpb24gPT09IHVuZGVmaW5lZCA/IGFQYXJ0cy5zbGljZSgxKS5qb2luKFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nL1wiKSA6IG5hdkNvbGxlY3Rpb247XG5cdFx0cmV0dXJuIGAke2VudGl0eVNldH0vJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvJHtuYXZpZ2F0aW9uQ29sbGVjdGlvbn1gOyAvLyB1c2VkIGluIGdvdG9UYXJnZXRFbnRpdHlTZXQgbWV0aG9kIGluIHRoZSBzYW1lIGZpbGVcblx0fSxcblxuXHRpc1Byb3BlcnR5RmlsdGVyYWJsZTogZnVuY3Rpb24gKGNvbnRleHQ6IENvbnRleHQsIG9EYXRhRmllbGQ/OiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBjb250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRzUHJvcGVydHlQYXRoID0gY29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHQvLyBMb2FjYXRpb25QYXRoIHdvdWxkIGJlIHRoZSBwcmVmaXggb2Ygc1Byb3BlcnR5UGF0aCwgZXhhbXBsZTogc1Byb3BlcnR5UGF0aCA9ICcvQ3VzdG9tZXIvU2V0L05hbWUnIC0+IHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCA9ICcvQ3VzdG9tZXIvU2V0J1xuXHRcdFx0c1Byb3BlcnR5TG9jYXRpb25QYXRoID0gQ29tbW9uSGVscGVyLmdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoKG9Nb2RlbCwgc1Byb3BlcnR5UGF0aCksXG5cdFx0XHRzUHJvcGVydHkgPSBzUHJvcGVydHlQYXRoLnJlcGxhY2UoYCR7c1Byb3BlcnR5TG9jYXRpb25QYXRofS9gLCBcIlwiKTtcblxuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQgJiZcblx0XHRcdChvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiIHx8XG5cdFx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCIpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlzUHJvcGVydHlGaWx0ZXJhYmxlKG9Nb2RlbCwgc1Byb3BlcnR5TG9jYXRpb25QYXRoLCBzUHJvcGVydHkpO1xuXHR9LFxuXG5cdGdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoOiBmdW5jdGlvbiAob01vZGVsOiBhbnksIHNQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdGxldCBpTGVuZ3RoO1xuXHRcdGxldCBzQ29sbGVjdGlvblBhdGggPSBzUHJvcGVydHlQYXRoLnNsaWNlKDAsIHNQcm9wZXJ0eVBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0XHRpZiAob01vZGVsLmdldE9iamVjdChgJHtzQ29sbGVjdGlvblBhdGh9LyRraW5kYCkgPT09IFwiRW50aXR5Q29udGFpbmVyXCIpIHtcblx0XHRcdGlMZW5ndGggPSBzQ29sbGVjdGlvblBhdGgubGVuZ3RoICsgMTtcblx0XHRcdHNDb2xsZWN0aW9uUGF0aCA9IHNQcm9wZXJ0eVBhdGguc2xpY2UoaUxlbmd0aCwgc1Byb3BlcnR5UGF0aC5pbmRleE9mKFwiL1wiLCBpTGVuZ3RoKSk7XG5cdFx0fVxuXHRcdHJldHVybiBzQ29sbGVjdGlvblBhdGg7XG5cdH0sXG5cdGdvdG9BY3Rpb25QYXJhbWV0ZXI6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzUHJvcGVydHlOYW1lID0gb0NvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRofS8kTmFtZWApO1xuXG5cdFx0cmV0dXJuIENvbW1vblV0aWxzLmdldFBhcmFtZXRlclBhdGgoc1BhdGgsIHNQcm9wZXJ0eU5hbWUpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZW50aXR5IHNldCBuYW1lIGZyb20gdGhlIGVudGl0eSB0eXBlIG5hbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIE9EYXRhIHY0IG1ldGFtb2RlbCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gc0VudGl0eVR5cGUgRW50aXR5VHlwZSBvZiB0aGUgYWN0aW9tXG5cdCAqIEByZXR1cm5zIFRoZSBFbnRpdHlTZXQgb2YgdGhlIGJvdW5kIGFjdGlvblxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldEVudGl0eVNldE5hbWU6IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgc0VudGl0eVR5cGU6IHN0cmluZykge1xuXHRcdGNvbnN0IG9FbnRpdHlDb250YWluZXIgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gb0VudGl0eUNvbnRhaW5lcikge1xuXHRcdFx0aWYgKHR5cGVvZiBvRW50aXR5Q29udGFpbmVyW2tleV0gPT09IFwib2JqZWN0XCIgJiYgb0VudGl0eUNvbnRhaW5lcltrZXldLiRUeXBlID09PSBzRW50aXR5VHlwZSkge1xuXHRcdFx0XHRyZXR1cm4ga2V5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbWV0YW1vZGVsIHBhdGggY29ycmVjdGx5IGZvciBib3VuZCBhY3Rpb25zIGlmIHVzZWQgd2l0aCBiUmV0dXJuT25seVBhdGggYXMgdHJ1ZSxcblx0ICogZWxzZSByZXR1cm5zIGFuIG9iamVjdCB3aGljaCBoYXMgMyBwcm9wZXJ0aWVzIHJlbGF0ZWQgdG8gdGhlIGFjdGlvbi4gVGhleSBhcmUgdGhlIGVudGl0eSBzZXQgbmFtZSxcblx0ICogdGhlICRQYXRoIHZhbHVlIG9mIHRoZSBPcGVyYXRpb25BdmFpbGFibGUgYW5ub3RhdGlvbiBhbmQgdGhlIGJpbmRpbmcgcGFyYW1ldGVyIG5hbWUuIElmXG5cdCAqIGJDaGVja1N0YXRpY1ZhbHVlIGlzIHRydWUsIHJldHVybnMgdGhlIHN0YXRpYyB2YWx1ZSBvZiBPcGVyYXRpb25BdmFpbGFibGUgYW5ub3RhdGlvbiwgaWYgcHJlc2VudC5cblx0ICogZS5nLiBmb3IgYm91bmQgYWN0aW9uIHNvbWVOYW1lU3BhY2UuU29tZUJvdW5kQWN0aW9uXG5cdCAqIG9mIGVudGl0eSBzZXQgU29tZUVudGl0eVNldCwgdGhlIHN0cmluZyBcIi9Tb21lRW50aXR5U2V0L3NvbWVOYW1lU3BhY2UuU29tZUJvdW5kQWN0aW9uXCIgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQWN0aW9uIFRoZSBjb250ZXh0IG9iamVjdCBvZiB0aGUgYWN0aW9uXG5cdCAqIEBwYXJhbSBiUmV0dXJuT25seVBhdGggSWYgZmFsc2UsIGFkZGl0aW9uYWwgaW5mbyBpcyByZXR1cm5lZCBhbG9uZyB3aXRoIG1ldGFtb2RlbCBwYXRoIHRvIHRoZSBib3VuZCBhY3Rpb25cblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBib3VuZCBhY3Rpb24gb2YgdGhlIGZvcm0gc29tZU5hbWVTcGFjZS5Tb21lQm91bmRBY3Rpb25cblx0ICogQHBhcmFtIGJDaGVja1N0YXRpY1ZhbHVlIElmIHRydWUsIHRoZSBzdGF0aWMgdmFsdWUgb2YgT3BlcmF0aW9uQXZhaWxhYmxlIGlzIHJldHVybmVkLCBpZiBwcmVzZW50XG5cdCAqIEByZXR1cm5zIFRoZSBzdHJpbmcgb3Igb2JqZWN0IGFzIHNwZWNpZmllZCBieSBiUmV0dXJuT25seVBhdGhcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRBY3Rpb25QYXRoOiBmdW5jdGlvbiAob0FjdGlvbjogYW55LCBiUmV0dXJuT25seVBhdGg6IGJvb2xlYW4sIHNBY3Rpb25OYW1lPzogc3RyaW5nLCBiQ2hlY2tTdGF0aWNWYWx1ZT86IGJvb2xlYW4pIHtcblx0XHRsZXQgc0NvbnRleHRQYXRoID0gb0FjdGlvbi5nZXRQYXRoKCkuc3BsaXQoXCIvQFwiKVswXTtcblxuXHRcdHNBY3Rpb25OYW1lID0gIXNBY3Rpb25OYW1lID8gb0FjdGlvbi5nZXRPYmplY3Qob0FjdGlvbi5nZXRQYXRoKCkpIDogc0FjdGlvbk5hbWU7XG5cblx0XHRpZiAoc0FjdGlvbk5hbWUgJiYgc0FjdGlvbk5hbWUuaW5kZXhPZihcIihcIikgPiAtMSkge1xuXHRcdFx0Ly8gYWN0aW9uIGJvdW5kIHRvIGFub3RoZXIgZW50aXR5IHR5cGVcblx0XHRcdHNBY3Rpb25OYW1lID0gc0FjdGlvbk5hbWUuc3BsaXQoXCIoXCIpWzBdO1xuXHRcdH0gZWxzZSBpZiAob0FjdGlvbi5nZXRPYmplY3Qoc0NvbnRleHRQYXRoKSkge1xuXHRcdFx0Ly8gVE9ETzogdGhpcyBsb2dpYyBzb3VuZHMgd3JvbmcsIHRvIGJlIGNvcnJlY3RlZFxuXHRcdFx0Y29uc3Qgc0VudGl0eVR5cGVOYW1lID0gb0FjdGlvbi5nZXRPYmplY3Qoc0NvbnRleHRQYXRoKS4kVHlwZTtcblx0XHRcdGNvbnN0IHNFbnRpdHlOYW1lID0gdGhpcy5nZXRFbnRpdHlTZXROYW1lKG9BY3Rpb24uZ2V0TW9kZWwoKSwgc0VudGl0eVR5cGVOYW1lKTtcblx0XHRcdGlmIChzRW50aXR5TmFtZSkge1xuXHRcdFx0XHRzQ29udGV4dFBhdGggPSBgLyR7c0VudGl0eU5hbWV9YDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHNDb250ZXh0UGF0aDtcblx0XHR9XG5cblx0XHRpZiAoYkNoZWNrU3RhdGljVmFsdWUpIHtcblx0XHRcdHJldHVybiBvQWN0aW9uLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9QE9yZy5PRGF0YS5Db3JlLlYxLk9wZXJhdGlvbkF2YWlsYWJsZWApO1xuXHRcdH1cblx0XHRpZiAoYlJldHVybk9ubHlQYXRoKSB7XG5cdFx0XHRyZXR1cm4gYCR7c0NvbnRleHRQYXRofS8ke3NBY3Rpb25OYW1lfWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNDb250ZXh0UGF0aDogc0NvbnRleHRQYXRoLFxuXHRcdFx0XHRzUHJvcGVydHk6IG9BY3Rpb24uZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vJHtzQWN0aW9uTmFtZX1AT3JnLk9EYXRhLkNvcmUuVjEuT3BlcmF0aW9uQXZhaWxhYmxlLyRQYXRoYCksXG5cdFx0XHRcdHNCaW5kaW5nUGFyYW1ldGVyOiBvQWN0aW9uLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9L0AkdWk1Lm92ZXJsb2FkLzAvJFBhcmFtZXRlci8wLyROYW1lYClcblx0XHRcdH07XG5cdFx0fVxuXHR9LFxuXG5cdGdldE5hdmlnYXRpb25Db250ZXh0OiBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiBPRGF0YU1vZGVsQW5ub3RhdGlvbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChvQ29udGV4dC5nZXRQYXRoKCkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwYXRoIHdpdGhvdXQgdGhlIGVudGl0eSB0eXBlIChwb3RlbnRpYWxseSBmaXJzdCkgYW5kIHByb3BlcnR5IChsYXN0KSBwYXJ0IChvcHRpb25hbCkuXG5cdCAqIFRoZSByZXN1bHQgY2FuIGJlIGFuIGVtcHR5IHN0cmluZyBpZiBpdCBpcyBhIHNpbXBsZSBkaXJlY3QgcHJvcGVydHkuXG5cdCAqXG5cdCAqIElmIGFuZCBvbmx5IGlmIHRoZSBnaXZlbiBwcm9wZXJ0eSBwYXRoIHN0YXJ0cyB3aXRoIGEgc2xhc2ggKC8pLCBpdCBpcyBjb25zaWRlcmVkIHRoYXQgdGhlIGVudGl0eSB0eXBlXG5cdCAqIGlzIHBhcnQgb2YgdGhlIHBhdGggYW5kIHdpbGwgYmUgc3RyaXBwZWQgYXdheS5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wZXJ0eVBhdGhcblx0ICogQHBhcmFtIGJLZWVwUHJvcGVydHlcblx0ICogQHJldHVybnMgVGhlIG5hdmlnYXRpb24gcGF0aFxuXHQgKi9cblx0Z2V0TmF2aWdhdGlvblBhdGg6IGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBhbnksIGJLZWVwUHJvcGVydHk/OiBib29sZWFuKSB7XG5cdFx0Y29uc3QgYlN0YXJ0c1dpdGhFbnRpdHlUeXBlID0gc1Byb3BlcnR5UGF0aC5zdGFydHNXaXRoKFwiL1wiKTtcblx0XHRjb25zdCBhUGFydHMgPSBzUHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoZnVuY3Rpb24gKHBhcnQ6IGFueSkge1xuXHRcdFx0cmV0dXJuICEhcGFydDtcblx0XHR9KTtcblx0XHRpZiAoYlN0YXJ0c1dpdGhFbnRpdHlUeXBlKSB7XG5cdFx0XHRhUGFydHMuc2hpZnQoKTtcblx0XHR9XG5cdFx0aWYgKCFiS2VlcFByb3BlcnR5KSB7XG5cdFx0XHRhUGFydHMucG9wKCk7XG5cdFx0fVxuXHRcdHJldHVybiBhUGFydHMuam9pbihcIi9cIik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvcnJlY3QgbWV0YW1vZGVsIHBhdGggZm9yIGJvdW5kIGFjdGlvbnMuXG5cdCAqXG5cdCAqIFNpbmNlIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBpcnJlc3BlY3RpdmUgb2YgdGhlIGFjdGlvbiB0eXBlLCB0aGlzIHdpbGwgYmUgYXBwbGllZCB0byB1bmJvdW5kIGFjdGlvbnMuXG5cdCAqIEluIHN1Y2ggYSBjYXNlLCBpZiBhbiBpbmNvcnJlY3QgcGF0aCBpcyByZXR1cm5lZCwgaXQgaXMgaWdub3JlZCBkdXJpbmcgdGVtcGxhdGluZy5cblx0ICpcblx0ICogRXhhbXBsZTogZm9yIHRoZSBib3VuZCBhY3Rpb24gc29tZU5hbWVTcGFjZS5Tb21lQm91bmRBY3Rpb24gb2YgZW50aXR5IHNldCBTb21lRW50aXR5U2V0LFxuXHQgKiB0aGUgc3RyaW5nIFwiL1NvbWVFbnRpdHlTZXQvc29tZU5hbWVTcGFjZS5Tb21lQm91bmRBY3Rpb25cIiBpcyByZXR1cm5lZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBzdGF0aWNcblx0ICogQG5hbWUgc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXIuZ2V0QWN0aW9uQ29udGV4dFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXJcblx0ICogQHBhcmFtIG9BY3Rpb24gQ29udGV4dCBvYmplY3QgZm9yIHRoZSBhY3Rpb25cblx0ICogQHJldHVybnMgQ29ycmVjdCBtZXRhbW9kZWwgcGF0aCBmb3IgYm91bmQgYW5kIGluY29ycmVjdCBwYXRoIGZvciB1bmJvdW5kIGFjdGlvbnNcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRBY3Rpb25Db250ZXh0OiBmdW5jdGlvbiAob0FjdGlvbjogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZXRBY3Rpb25QYXRoKG9BY3Rpb24sIHRydWUpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbWV0YW1vZGVsIHBhdGggY29ycmVjdGx5IGZvciBvdmVybG9hZGVkIGJvdW5kIGFjdGlvbnMuIEZvciB1bmJvdW5kIGFjdGlvbnMsXG5cdCAqIHRoZSBpbmNvcnJlY3QgcGF0aCBpcyByZXR1cm5lZCwgYnV0IGlnbm9yZWQgZHVyaW5nIHRlbXBsYXRpbmcuXG5cdCAqIGUuZy4gZm9yIGJvdW5kIGFjdGlvbiBzb21lTmFtZVNwYWNlLlNvbWVCb3VuZEFjdGlvbiBvZiBlbnRpdHkgc2V0IFNvbWVFbnRpdHlTZXQsXG5cdCAqIHRoZSBzdHJpbmcgXCIvU29tZUVudGl0eVNldC9zb21lTmFtZVNwYWNlLlNvbWVCb3VuZEFjdGlvbi9AJHVpNS5vdmVybG9hZC8wXCIgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAc3RhdGljXG5cdCAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyLmdldFBhdGhUb0JvdW5kQWN0aW9uT3ZlcmxvYWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBvQWN0aW9uIFRoZSBjb250ZXh0IG9iamVjdCBmb3IgdGhlIGFjdGlvblxuXHQgKiBAcmV0dXJucyBUaGUgY29ycmVjdCBtZXRhbW9kZWwgcGF0aCBmb3IgYm91bmQgYWN0aW9uIG92ZXJsb2FkIGFuZCBpbmNvcnJlY3QgcGF0aCBmb3IgdW5ib3VuZCBhY3Rpb25zXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0UGF0aFRvQm91bmRBY3Rpb25PdmVybG9hZDogZnVuY3Rpb24gKG9BY3Rpb246IG9iamVjdCkge1xuXHRcdGNvbnN0IHNQYXRoID0gQ29tbW9uSGVscGVyLmdldEFjdGlvblBhdGgob0FjdGlvbiwgdHJ1ZSk7XG5cdFx0cmV0dXJuIGAke3NQYXRofS9AJHVpNS5vdmVybG9hZC8wYDtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc3RyaW5nIHdpdGggc2luZ2xlIHF1b3Rlcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gc1ZhbHVlIFNvbWUgc3RyaW5nIHRoYXQgbmVlZHMgdG8gYmUgY29udmVydGVkIGludG8gc2luZ2xlIHF1b3Rlc1xuXHQgKiBAcGFyYW0gW2JFc2NhcGVdIFNob3VsZCB0aGUgc3RyaW5nIGJlIGVzY2FwZWQgYmVmb3JlaGFuZFxuXHQgKiBAcmV0dXJucyAtIFN0cmluZyB3aXRoIHNpbmdsZSBxdW90ZXNcblx0ICovXG5cdGFkZFNpbmdsZVF1b3RlczogZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nLCBiRXNjYXBlPzogYm9vbGVhbikge1xuXHRcdGlmIChiRXNjYXBlICYmIHNWYWx1ZSkge1xuXHRcdFx0c1ZhbHVlID0gdGhpcy5lc2NhcGVTaW5nbGVRdW90ZXMoc1ZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIGAnJHtzVmFsdWV9J2A7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHN0cmluZyB3aXRoIGVzY2FwZWQgc2luZ2xlIHF1b3Rlcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gc1ZhbHVlIFNvbWUgc3RyaW5nIHRoYXQgbmVlZHMgZXNjYXBpbmcgb2Ygc2luZ2xlIHF1b3Rlc1xuXHQgKiBAcmV0dXJucyAtIFN0cmluZyB3aXRoIGVzY2FwZWQgc2luZ2xlIHF1b3Rlc1xuXHQgKi9cblx0ZXNjYXBlU2luZ2xlUXVvdGVzOiBmdW5jdGlvbiAoc1ZhbHVlOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gc1ZhbHVlLnJlcGxhY2UoL1snXS9nLCBcIlxcXFwnXCIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmdW5jdGlvbiBzdHJpbmdcblx0ICogVGhlIGZpcnN0IGFyZ3VtZW50IG9mIGdlbmVyYXRlRnVuY3Rpb24gaXMgbmFtZSBvZiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHN0cmluZy5cblx0ICogUmVtYWluaW5nIGFyZ3VtZW50cyBvZiBnZW5lcmF0ZUZ1bmN0aW9uIGFyZSBhcmd1bWVudHMgb2YgdGhlIG5ld2x5IGdlbmVyYXRlZCBmdW5jdGlvbiBzdHJpbmcuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXJcblx0ICogQHBhcmFtIHNGdW5jTmFtZSBTb21lIHN0cmluZyBmb3IgdGhlIGZ1bmN0aW9uIG5hbWVcblx0ICogQHBhcmFtIGFyZ3MgVGhlIHJlbWFpbmluZyBhcmd1bWVudHNcblx0ICogQHJldHVybnMgLSBGdW5jdGlvbiBzdHJpbmcgZGVwZW5kcyBvbiBhcmd1bWVudHMgcGFzc2VkXG5cdCAqL1xuXHRnZW5lcmF0ZUZ1bmN0aW9uOiBmdW5jdGlvbiAoc0Z1bmNOYW1lOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSB7XG5cdFx0bGV0IHNQYXJhbXMgPSBcIlwiO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c1BhcmFtcyArPSBhcmdzW2ldO1xuXHRcdFx0aWYgKGkgPCBhcmdzLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0c1BhcmFtcyArPSBcIiwgXCI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IHNGdW5jdGlvbiA9IGAke3NGdW5jTmFtZX0oKWA7XG5cdFx0aWYgKHNQYXJhbXMpIHtcblx0XHRcdHNGdW5jdGlvbiA9IGAke3NGdW5jTmFtZX0oJHtzUGFyYW1zfSlgO1xuXHRcdH1cblx0XHRyZXR1cm4gc0Z1bmN0aW9uO1xuXHR9LFxuXHQvKlxuXHQgKiBSZXR1cm5zIHRoZSB2aXNpYmlsaXR5IGV4cHJlc3Npb24gZm9yIGRhdGFwb2ludCB0aXRsZS9saW5rXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW3NQYXRoXSBhbm5vdGF0aW9uIHBhdGggb2YgZGF0YSBwb2ludCBvciBNaWNyb2NoYXJ0XG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2JMaW5rXSB0cnVlIGlmIGxpbmsgdmlzaWJpbGl0eSBpcyBiZWluZyBkZXRlcm1pbmVkLCBmYWxzZSBpZiB0aXRsZSB2aXNpYmlsaXR5IGlzIGJlaW5nIGRldGVybWluZWRcblx0ICogQHBhcmFtIHtib29sZWFufSBbYkZpZWxkVmlzaWJpbGl0eV0gdHJ1ZSBpZiBmaWVsZCBpcyB2c2lpYmxlLCBmYWxzZSBvdGhlcndpc2Vcblx0ICogQHJldHVybnMgIHtzdHJpbmd9IHNWaXNpYmlsaXR5RXhwIFVzZWQgdG8gZ2V0IHRoZSAgdmlzaWJpbGl0eSBiaW5kaW5nIGZvciBEYXRhUG9pbnRzIHRpdGxlIGluIHRoZSBIZWFkZXIuXG5cdCAqXG5cdCAqL1xuXG5cdGdldEhlYWRlckRhdGFQb2ludExpbmtWaXNpYmlsaXR5OiBmdW5jdGlvbiAoc1BhdGg6IGFueSwgYkxpbms6IGFueSwgYkZpZWxkVmlzaWJpbGl0eTogYW55KSB7XG5cdFx0bGV0IHNWaXNpYmlsaXR5RXhwO1xuXHRcdGlmIChiRmllbGRWaXNpYmlsaXR5KSB7XG5cdFx0XHRzVmlzaWJpbGl0eUV4cCA9IGJMaW5rXG5cdFx0XHRcdD8gXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ID09PSB0cnVlICYmIFwiICsgYkZpZWxkVmlzaWJpbGl0eSArIFwifVwiXG5cdFx0XHRcdDogXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ICE9PSB0cnVlICYmIFwiICsgYkZpZWxkVmlzaWJpbGl0eSArIFwifVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzVmlzaWJpbGl0eUV4cCA9IGJMaW5rXG5cdFx0XHRcdD8gXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ID09PSB0cnVlfVwiXG5cdFx0XHRcdDogXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ICE9PSB0cnVlfVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gc1Zpc2liaWxpdHlFeHA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIG9iamVjdCB0byBzdHJpbmcoZGlmZmVyZW50IGZyb20gSlNPTi5zdHJpbmdpZnkgb3IudG9TdHJpbmcpLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBvUGFyYW1zIFNvbWUgb2JqZWN0XG5cdCAqIEByZXR1cm5zIC0gT2JqZWN0IHN0cmluZ1xuXHQgKi9cblx0b2JqZWN0VG9TdHJpbmc6IGZ1bmN0aW9uIChvUGFyYW1zOiBhbnkpIHtcblx0XHRsZXQgaU51bWJlck9mS2V5cyA9IE9iamVjdC5rZXlzKG9QYXJhbXMpLmxlbmd0aCxcblx0XHRcdHNQYXJhbXMgPSBcIlwiO1xuXG5cdFx0Zm9yIChjb25zdCBzS2V5IGluIG9QYXJhbXMpIHtcblx0XHRcdGxldCBzVmFsdWUgPSBvUGFyYW1zW3NLZXldO1xuXHRcdFx0aWYgKHNWYWx1ZSAmJiB0eXBlb2Ygc1ZhbHVlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdHNWYWx1ZSA9IHRoaXMub2JqZWN0VG9TdHJpbmcoc1ZhbHVlKTtcblx0XHRcdH1cblx0XHRcdHNQYXJhbXMgKz0gYCR7c0tleX06ICR7c1ZhbHVlfWA7XG5cdFx0XHRpZiAoaU51bWJlck9mS2V5cyA+IDEpIHtcblx0XHRcdFx0LS1pTnVtYmVyT2ZLZXlzO1xuXHRcdFx0XHRzUGFyYW1zICs9IFwiLCBcIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gYHsgJHtzUGFyYW1zfX1gO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGVzY2FwZSBjaGFyYWN0ZXJzIChcXCkgZnJvbSBhbiBleHByZXNzaW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBzRXhwcmVzc2lvbiBBbiBleHByZXNzaW9uIHdpdGggZXNjYXBlIGNoYXJhY3RlcnNcblx0ICogQHJldHVybnMgRXhwcmVzc2lvbiBzdHJpbmcgd2l0aG91dCBlc2NhcGUgY2hhcmFjdGVycyBvciB1bmRlZmluZWRcblx0ICovXG5cdHJlbW92ZUVzY2FwZUNoYXJhY3RlcnM6IGZ1bmN0aW9uIChzRXhwcmVzc2lvbjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHNFeHByZXNzaW9uID8gc0V4cHJlc3Npb24ucmVwbGFjZSgvXFxcXD9cXFxcKFt7fV0pL2csIFwiJDFcIikgOiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2VzIHVwZGF0ZXMgdG8gYSBzdHJpbmdpZmllZCBvYmplY3Qgc28gdGhhdCBpdCB3b3JrcyBwcm9wZXJseSBpbiBhIHRlbXBsYXRlIGJ5IGFkZGluZyB1aTVPYmplY3Q6dHJ1ZS5cblx0ICpcblx0ICogQHBhcmFtIHNTdHJpbmdpZmllZFxuXHQgKiBAcmV0dXJucyBUaGUgdXBkYXRlZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG9iamVjdFxuXHQgKi9cblx0c3RyaW5naWZ5T2JqZWN0OiBmdW5jdGlvbiAoc1N0cmluZ2lmaWVkOiBzdHJpbmcpIHtcblx0XHRpZiAoIXNTdHJpbmdpZmllZCB8fCBzU3RyaW5naWZpZWQgPT09IFwie31cIikge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgb09iamVjdCA9IEpTT04ucGFyc2Uoc1N0cmluZ2lmaWVkKTtcblx0XHRcdGlmICh0eXBlb2Ygb09iamVjdCA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShvT2JqZWN0KSkge1xuXHRcdFx0XHRjb25zdCBvVUk1T2JqZWN0ID0ge1xuXHRcdFx0XHRcdHVpNW9iamVjdDogdHJ1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRPYmplY3QuYXNzaWduKG9VSTVPYmplY3QsIG9PYmplY3QpO1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob1VJNU9iamVjdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzVHlwZSA9IEFycmF5LmlzQXJyYXkob09iamVjdCkgPyBcIkFycmF5XCIgOiB0eXBlb2Ygb09iamVjdDtcblx0XHRcdFx0TG9nLmVycm9yKGBVbmV4cGVjdGVkIG9iamVjdCB0eXBlIGluIHN0cmluZ2lmeU9iamVjdCAoJHtzVHlwZX0pIC0gb25seSB3b3JrcyB3aXRoIG9iamVjdGApO1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzdHJpbmdpZnlPYmplY3Qgb25seSB3b3JrcyB3aXRoIG9iamVjdHMhXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkYXRhLCB0YWtpbmcgY2FyZSB0aGF0IGl0IGlzIG5vdCB0cmVhdGVkIGFzIGEgYmluZGluZyBleHByZXNzaW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gdkRhdGEgVGhlIGRhdGEgdG8gc3RyaW5naWZ5XG5cdCAqIEByZXR1cm5zIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEuXG5cdCAqL1xuXHRzdHJpbmdpZnlDdXN0b21EYXRhOiBmdW5jdGlvbiAodkRhdGE6IG9iamVjdCB8IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IG9PYmplY3Q6IGFueSA9IHtcblx0XHRcdHVpNW9iamVjdDogdHJ1ZVxuXHRcdH07XG5cdFx0b09iamVjdFtcImN1c3RvbURhdGFcIl0gPSB2RGF0YSBpbnN0YW5jZW9mIENvbnRleHQgPyB2RGF0YS5nZXRPYmplY3QoKSA6IHZEYXRhO1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvT2JqZWN0KTtcblx0fSxcblxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBnaXZlbiBkYXRhLCBwb3RlbnRpYWxseSB1bndyYXBzIHRoZSBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gdkRhdGEgVGhlIGRhdGEgdG8gcGFyc2Vcblx0ICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgZGF0YSBwYXJzaW5nXG5cdCAqL1xuXHRwYXJzZUN1c3RvbURhdGE6IGZ1bmN0aW9uICh2RGF0YTogYW55KSB7XG5cdFx0dkRhdGEgPSB0eXBlb2YgdkRhdGEgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHZEYXRhKSA6IHZEYXRhO1xuXHRcdGlmICh2RGF0YSAmJiB2RGF0YS5oYXNPd25Qcm9wZXJ0eShcImN1c3RvbURhdGFcIikpIHtcblx0XHRcdHJldHVybiB2RGF0YVtcImN1c3RvbURhdGFcIl07XG5cdFx0fVxuXHRcdHJldHVybiB2RGF0YTtcblx0fSxcblx0Z2V0Q29udGV4dFBhdGg6IGZ1bmN0aW9uIChvVmFsdWU6IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvSW50ZXJmYWNlICYmIG9JbnRlcmZhY2UuY29udGV4dCAmJiBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdHJldHVybiBzUGF0aFtzUGF0aC5sZW5ndGggLSAxXSA9PT0gXCIvXCIgPyBzUGF0aC5zbGljZSgwLCAtMSkgOiBzUGF0aDtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybnMgYSBzdHJpbmdpZmllZCBKU09OIG9iamVjdCBjb250YWluaW5nICBQcmVzZW50YXRpb24gVmFyaWFudCBzb3J0IGNvbmRpdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dFxuXHQgKiBAcGFyYW0gb1ByZXNlbnRhdGlvblZhcmlhbnQgUHJlc2VudGF0aW9uIHZhcmlhbnQgQW5ub3RhdGlvblxuXHQgKiBAcGFyYW0gc1ByZXNlbnRhdGlvblZhcmlhbnRQYXRoXG5cdCAqIEByZXR1cm5zIFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqL1xuXHRnZXRTb3J0Q29uZGl0aW9uczogZnVuY3Rpb24gKG9Db250ZXh0OiBhbnksIG9QcmVzZW50YXRpb25WYXJpYW50OiBhbnksIHNQcmVzZW50YXRpb25WYXJpYW50UGF0aDogc3RyaW5nKSB7XG5cdFx0aWYgKFxuXHRcdFx0b1ByZXNlbnRhdGlvblZhcmlhbnQgJiZcblx0XHRcdENvbW1vbkhlbHBlci5faXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbihzUHJlc2VudGF0aW9uVmFyaWFudFBhdGgpICYmXG5cdFx0XHRvUHJlc2VudGF0aW9uVmFyaWFudC5Tb3J0T3JkZXJcblx0XHQpIHtcblx0XHRcdGNvbnN0IGFTb3J0Q29uZGl0aW9uczogYW55ID0ge1xuXHRcdFx0XHRzb3J0ZXJzOiBbXVxuXHRcdFx0fTtcblxuXHRcdFx0Y29uc3Qgc0VudGl0eVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKDApLnNwbGl0KFwiQFwiKVswXTtcblx0XHRcdG9QcmVzZW50YXRpb25WYXJpYW50LlNvcnRPcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChvQ29uZGl0aW9uOiBhbnkgPSB7fSkge1xuXHRcdFx0XHRsZXQgb1NvcnRQcm9wZXJ0eTogYW55ID0ge307XG5cdFx0XHRcdGNvbnN0IG9Tb3J0ZXI6IGFueSA9IHt9O1xuXHRcdFx0XHRpZiAob0NvbmRpdGlvbi5EeW5hbWljUHJvcGVydHkpIHtcblx0XHRcdFx0XHRvU29ydFByb3BlcnR5ID0gb0NvbnRleHQuZ2V0TW9kZWwoMCkuZ2V0T2JqZWN0KHNFbnRpdHlQYXRoICsgb0NvbmRpdGlvbi5EeW5hbWljUHJvcGVydHkuJEFubm90YXRpb25QYXRoKT8uTmFtZTtcblx0XHRcdFx0fSBlbHNlIGlmIChvQ29uZGl0aW9uLlByb3BlcnR5KSB7XG5cdFx0XHRcdFx0b1NvcnRQcm9wZXJ0eSA9IG9Db25kaXRpb24uUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1NvcnRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9Tb3J0ZXIubmFtZSA9IG9Tb3J0UHJvcGVydHk7XG5cdFx0XHRcdFx0b1NvcnRlci5kZXNjZW5kaW5nID0gISFvQ29uZGl0aW9uLkRlc2NlbmRpbmc7XG5cdFx0XHRcdFx0YVNvcnRDb25kaXRpb25zLnNvcnRlcnMucHVzaChvU29ydGVyKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQbGVhc2UgZGVmaW5lIHRoZSByaWdodCBwYXRoIHRvIHRoZSBzb3J0IHByb3BlcnR5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShhU29ydENvbmRpdGlvbnMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHRfaXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbjogZnVuY3Rpb24gKGFubm90YXRpb25QYXRoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0YW5ub3RhdGlvblBhdGguaW5kZXhPZihgQCR7VUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudH1gKSA+IC0xIHx8XG5cdFx0XHRhbm5vdGF0aW9uUGF0aC5pbmRleE9mKGBAJHtVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50fWApID4gLTFcblx0XHQpO1xuXHR9LFxuXHRjcmVhdGVQcmVzZW50YXRpb25QYXRoQ29udGV4dDogZnVuY3Rpb24gKG9QcmVzZW50YXRpb25Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBhUGF0aHMgPSBvUHJlc2VudGF0aW9uQ29udGV4dC5zUGF0aC5zcGxpdChcIkBcIikgfHwgW107XG5cdFx0Y29uc3Qgb01vZGVsID0gb1ByZXNlbnRhdGlvbkNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRpZiAoYVBhdGhzLmxlbmd0aCAmJiBhUGF0aHNbYVBhdGhzLmxlbmd0aCAtIDFdLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XCIpID4gLTEpIHtcblx0XHRcdGNvbnN0IHNQYXRoID0gb1ByZXNlbnRhdGlvbkNvbnRleHQuc1BhdGguc3BsaXQoXCIvUHJlc2VudGF0aW9uVmFyaWFudFwiKVswXTtcblx0XHRcdHJldHVybiBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7c1BhdGh9QHNhcHVpLm5hbWVgKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgJHtvUHJlc2VudGF0aW9uQ29udGV4dC5zUGF0aH1Ac2FwdWkubmFtZWApO1xuXHR9LFxuXHRnZXRQcmVzc0hhbmRsZXJGb3JEYXRhRmllbGRGb3JJQk46IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIHNDb250ZXh0Pzogc3RyaW5nLCBiTmF2aWdhdGVXaXRoQ29uZmlybWF0aW9uRGlhbG9nPzogYm9vbGVhbikge1xuXHRcdGlmICghb0RhdGFGaWVsZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRjb25zdCBtTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFueSA9IHtcblx0XHRcdG5hdmlnYXRpb25Db250ZXh0czogc0NvbnRleHQgPyBzQ29udGV4dCA6IFwiJHskc291cmNlPi99LmdldEJpbmRpbmdDb250ZXh0KClcIlxuXHRcdH07XG5cdFx0aWYgKG9EYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0ICYmICFvRGF0YUZpZWxkLklubGluZSAmJiBiTmF2aWdhdGVXaXRoQ29uZmlybWF0aW9uRGlhbG9nKSB7XG5cdFx0XHRtTmF2aWdhdGlvblBhcmFtZXRlcnMuYXBwbGljYWJsZUNvbnRleHRzID1cblx0XHRcdFx0XCIke2ludGVybmFsPmlibi9cIiArIG9EYXRhRmllbGQuU2VtYW50aWNPYmplY3QgKyBcIi1cIiArIG9EYXRhRmllbGQuQWN0aW9uICsgXCIvYUFwcGxpY2FibGUvfVwiO1xuXHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0cyA9XG5cdFx0XHRcdFwiJHtpbnRlcm5hbD5pYm4vXCIgKyBvRGF0YUZpZWxkLlNlbWFudGljT2JqZWN0ICsgXCItXCIgKyBvRGF0YUZpZWxkLkFjdGlvbiArIFwiL2FOb3RBcHBsaWNhYmxlL31cIjtcblx0XHRcdG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5sYWJlbCA9IHRoaXMuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQuTGFiZWwsIHRydWUpO1xuXHRcdH1cblx0XHRpZiAob0RhdGFGaWVsZC5NYXBwaW5nKSB7XG5cdFx0XHRtTmF2aWdhdGlvblBhcmFtZXRlcnMuc2VtYW50aWNPYmplY3RNYXBwaW5nID0gdGhpcy5hZGRTaW5nbGVRdW90ZXMoSlNPTi5zdHJpbmdpZnkob0RhdGFGaWVsZC5NYXBwaW5nKSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmdlbmVyYXRlRnVuY3Rpb24oXG5cdFx0XHRiTmF2aWdhdGVXaXRoQ29uZmlybWF0aW9uRGlhbG9nID8gXCIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZVdpdGhDb25maXJtYXRpb25EaWFsb2dcIiA6IFwiLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ubmF2aWdhdGVcIixcblx0XHRcdHRoaXMuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQuU2VtYW50aWNPYmplY3QpLFxuXHRcdFx0dGhpcy5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZC5BY3Rpb24pLFxuXHRcdFx0dGhpcy5vYmplY3RUb1N0cmluZyhtTmF2aWdhdGlvblBhcmFtZXRlcnMpXG5cdFx0KTtcblx0fSxcblx0Z2V0RW50aXR5U2V0OiBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IHNQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdHJldHVybiBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNQYXRoKTtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlcyB0aGUgdmlzaWJpbGl0eSBvZiBmb3JtIG1lbnUgYWN0aW9ucyBib3RoIGluIHBhdGggYmFzZWQgYW5kIHN0YXRpYyB2YWx1ZSBzY2VuYXJpb3MuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXJcblx0ICogQHBhcmFtIHNWaXNpYmxlVmFsdWUgRWl0aGVyIHN0YXRpYyBib29sZWFuIHZhbHVlcyBvciBBcnJheSBvZiBwYXRoIGV4cHJlc3Npb25zIGZvciB2aXNpYmlsaXR5IG9mIG1lbnUgYnV0dG9uLlxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGRldGVybWluaW5nIHRoZSB2aXNpYmlsaXR5IG9mIG1lbnUgYWN0aW9ucy5cblx0ICovXG5cdGhhbmRsZVZpc2liaWxpdHlPZk1lbnVBY3Rpb25zOiBmdW5jdGlvbiAoc1Zpc2libGVWYWx1ZTogYW55KSB7XG5cdFx0Y29uc3QgY29tYmluZWRDb25kaXRpb25zID0gW107XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc1Zpc2libGVWYWx1ZSkpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc1Zpc2libGVWYWx1ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoc1Zpc2libGVWYWx1ZVtpXS5pbmRleE9mKFwie1wiKSA+IC0xICYmIHNWaXNpYmxlVmFsdWVbaV0uaW5kZXhPZihcIns9XCIpID09PSAtMSkge1xuXHRcdFx0XHRcdHNWaXNpYmxlVmFsdWVbaV0gPSBcIns9XCIgKyBzVmlzaWJsZVZhbHVlW2ldICsgXCJ9XCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNWaXNpYmxlVmFsdWVbaV0uc3BsaXQoXCJ7PVwiKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0c1Zpc2libGVWYWx1ZVtpXSA9IHNWaXNpYmxlVmFsdWVbaV0uc3BsaXQoXCJ7PVwiKVsxXS5zbGljZSgwLCAtMSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29tYmluZWRDb25kaXRpb25zLnB1c2goYCgke3NWaXNpYmxlVmFsdWVbaV19KWApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gY29tYmluZWRDb25kaXRpb25zLmxlbmd0aCA+IDAgPyBgez0gJHtjb21iaW5lZENvbmRpdGlvbnMuam9pbihcIiB8fCBcIil9fWAgOiBzVmlzaWJsZVZhbHVlO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRvIHRoZSBjYWxjdWxhdGlvbiBvZiBjcml0aWNhbGl0eSBpbiBjYXNlIENyaXRpY2FsaXR5Q2FsY3VsYXRpb24gcHJlc2VudCBpbiB0aGUgYW5ub3RhdGlvblxuXHQgKlxuXHQgKiBUaGUgY2FsY3VsYXRpb24gaXMgZG9uZSBieSBjb21wYXJpbmcgYSB2YWx1ZSB0byB0aGUgdGhyZXNob2xkIHZhbHVlcyByZWxldmFudCBmb3IgdGhlIHNwZWNpZmllZCBpbXByb3ZlbWVudCBkaXJlY3Rpb24uXG5cdCAqIEZvciBpbXByb3ZlbWVudCBkaXJlY3Rpb24gVGFyZ2V0LCB0aGUgY3JpdGljYWxpdHkgaXMgY2FsY3VsYXRlZCB1c2luZyBib3RoIGxvdyBhbmQgaGlnaCB0aHJlc2hvbGQgdmFsdWVzLiBJdCB3aWxsIGJlXG5cdCAqXG5cdCAqIC0gUG9zaXRpdmUgaWYgdGhlIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBBY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZSBhbmQgbG93ZXIgdGhhbiBvciBlcXVhbCB0byBBY2NlcHRhbmNlUmFuZ2VIaWdoVmFsdWVcblx0ICogLSBOZXV0cmFsIGlmIHRoZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSBhbmQgbG93ZXIgdGhhbiBBY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZSBPUiBncmVhdGVyIHRoYW4gQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlIGFuZCBsb3dlciB0aGFuIG9yIGVxdWFsIHRvIFRvbGVyYW5jZVJhbmdlSGlnaFZhbHVlXG5cdCAqIC0gQ3JpdGljYWwgaWYgdGhlIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBEZXZpYXRpb25SYW5nZUxvd1ZhbHVlIGFuZCBsb3dlciB0aGFuIFRvbGVyYW5jZVJhbmdlTG93VmFsdWUgT1IgZ3JlYXRlciB0aGFuIFRvbGVyYW5jZVJhbmdlSGlnaFZhbHVlIGFuZCBsb3dlciB0aGFuIG9yIGVxdWFsIHRvIERldmlhdGlvblJhbmdlSGlnaFZhbHVlXG5cdCAqIC0gTmVnYXRpdmUgaWYgdGhlIHZhbHVlIGlzIGxvd2VyIHRoYW4gRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZSBvciBncmVhdGVyIHRoYW4gRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWVcblx0ICpcblx0ICogRm9yIGltcHJvdmVtZW50IGRpcmVjdGlvbiBNaW5pbWl6ZSwgdGhlIGNyaXRpY2FsaXR5IGlzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlIGhpZ2ggdGhyZXNob2xkIHZhbHVlcy4gSXQgaXNcblx0ICogLSBQb3NpdGl2ZSBpZiB0aGUgdmFsdWUgaXMgbG93ZXIgdGhhbiBvciBlcXVhbCB0byBBY2NlcHRhbmNlUmFuZ2VIaWdoVmFsdWVcblx0ICogLSBOZXV0cmFsIGlmIHRoZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlIGFuZCBsb3dlciB0aGFuIG9yIGVxdWFsIHRvIFRvbGVyYW5jZVJhbmdlSGlnaFZhbHVlXG5cdCAqIC0gQ3JpdGljYWwgaWYgdGhlIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBUb2xlcmFuY2VSYW5nZUhpZ2hWYWx1ZSBhbmQgbG93ZXIgdGhhbiBvciBlcXVhbCB0byBEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZVxuXHQgKiAtIE5lZ2F0aXZlIGlmIHRoZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWVcblx0ICpcblx0ICogRm9yIGltcHJvdmVtZW50IGRpcmVjdGlvbiBNYXhpbWl6ZSwgdGhlIGNyaXRpY2FsaXR5IGlzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlIGxvdyB0aHJlc2hvbGQgdmFsdWVzLiBJdCBpc1xuXHQgKlxuXHQgKiAtIFBvc2l0aXZlIGlmIHRoZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gQWNjZXB0YW5jZVJhbmdlTG93VmFsdWVcblx0ICogLSBOZXV0cmFsIGlmIHRoZSB2YWx1ZSBpcyBsZXNzIHRoYW4gQWNjZXB0YW5jZVJhbmdlTG93VmFsdWUgYW5kIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBUb2xlcmFuY2VSYW5nZUxvd1ZhbHVlXG5cdCAqIC0gQ3JpdGljYWwgaWYgdGhlIHZhbHVlIGlzIGxvd2VyIHRoYW4gVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSBhbmQgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIERldmlhdGlvblJhbmdlTG93VmFsdWVcblx0ICogLSBOZWdhdGl2ZSBpZiB0aGUgdmFsdWUgaXMgbG93ZXIgdGhhbiBEZXZpYXRpb25SYW5nZUxvd1ZhbHVlXG5cdCAqXG5cdCAqIFRocmVzaG9sZHMgYXJlIG9wdGlvbmFsLiBGb3IgdW5hc3NpZ25lZCB2YWx1ZXMsIGRlZmF1bHRzIGFyZSBkZXRlcm1pbmVkIGluIHRoaXMgb3JkZXI6XG5cdCAqXG5cdCAqIC0gRm9yIERldmlhdGlvblJhbmdlLCBhbiBvbWl0dGVkIExvd1ZhbHVlIHRyYW5zbGF0ZXMgaW50byB0aGUgc21hbGxlc3QgcG9zc2libGUgbnVtYmVyICgtSU5GKSwgYW4gb21pdHRlZCBIaWdoVmFsdWUgdHJhbnNsYXRlcyBpbnRvIHRoZSBsYXJnZXN0IHBvc3NpYmxlIG51bWJlciAoK0lORilcblx0ICogLSBGb3IgVG9sZXJhbmNlUmFuZ2UsIGFuIG9taXR0ZWQgTG93VmFsdWUgd2lsbCBiZSBpbml0aWFsaXplZCB3aXRoIERldmlhdGlvblJhbmdlTG93VmFsdWUsIGFuIG9taXR0ZWQgSGlnaFZhbHVlIHdpbGwgYmUgaW5pdGlhbGl6ZWQgd2l0aCBEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZVxuXHQgKiAtIEZvciBBY2NlcHRhbmNlUmFuZ2UsIGFuIG9taXR0ZWQgTG93VmFsdWUgd2lsbCBiZSBpbml0aWFsaXplZCB3aXRoIFRvbGVyYW5jZVJhbmdlTG93VmFsdWUsIGFuIG9taXR0ZWQgSGlnaFZhbHVlIHdpbGwgYmUgaW5pdGlhbGl6ZWQgd2l0aCBUb2xlcmFuY2VSYW5nZUhpZ2hWYWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIHNJbXByb3ZlbWVudERpcmVjdGlvbiBJbXByb3ZlbWVudERpcmVjdGlvbiB0byBiZSB1c2VkIGZvciBjcmVhdGluZyB0aGUgY3JpdGljYWxpdHkgYmluZGluZ1xuXHQgKiBAcGFyYW0gc1ZhbHVlIFZhbHVlIGZyb20gRGF0YXBvaW50IHRvIGJlIG1lYXN1cmVkXG5cdCAqIEBwYXJhbSBzRGV2aWF0aW9uTG93IEV4cHJlc3Npb25CaW5kaW5nIGZvciBMb3dlciBEZXZpYXRpb24gbGV2ZWxcblx0ICogQHBhcmFtIHNUb2xlcmFuY2VMb3cgRXhwcmVzc2lvbkJpbmRpbmcgZm9yIExvd2VyIFRvbGVyYW5jZSBsZXZlbFxuXHQgKiBAcGFyYW0gc0FjY2VwdGFuY2VMb3cgRXhwcmVzc2lvbkJpbmRpbmcgZm9yIExvd2VyIEFjY2VwdGFuY2UgbGV2ZWxcblx0ICogQHBhcmFtIHNBY2NlcHRhbmNlSGlnaCBFeHByZXNzaW9uQmluZGluZyBmb3IgSGlnaGVyIEFjY2VwdGFuY2UgbGV2ZWxcblx0ICogQHBhcmFtIHNUb2xlcmFuY2VIaWdoIEV4cHJlc3Npb25CaW5kaW5nIGZvciBIaWdoZXIgVG9sZXJhbmNlIGxldmVsXG5cdCAqIEBwYXJhbSBzRGV2aWF0aW9uSGlnaCBFeHByZXNzaW9uQmluZGluZyBmb3IgSGlnaGVyIERldmlhdGlvbiBsZXZlbFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIGNyaXRpY2FsaXR5IGNhbGN1bGF0aW9uIGFzIGV4cHJlc3Npb24gYmluZGluZ1xuXHQgKi9cblx0Z2V0Q3JpdGljYWxpdHlDYWxjdWxhdGlvbkJpbmRpbmc6IGZ1bmN0aW9uIChcblx0XHRzSW1wcm92ZW1lbnREaXJlY3Rpb246IHN0cmluZyxcblx0XHRzVmFsdWU6IHN0cmluZyxcblx0XHRzRGV2aWF0aW9uTG93OiBzdHJpbmcgfCBudW1iZXIsXG5cdFx0c1RvbGVyYW5jZUxvdzogc3RyaW5nIHwgbnVtYmVyLFxuXHRcdHNBY2NlcHRhbmNlTG93OiBzdHJpbmcgfCBudW1iZXIsXG5cdFx0c0FjY2VwdGFuY2VIaWdoOiBzdHJpbmcgfCBudW1iZXIsXG5cdFx0c1RvbGVyYW5jZUhpZ2g6IHN0cmluZyB8IG51bWJlcixcblx0XHRzRGV2aWF0aW9uSGlnaDogc3RyaW5nIHwgbnVtYmVyXG5cdCkge1xuXHRcdGxldCBzQ3JpdGljYWxpdHlFeHByZXNzaW9uOiB0eXBlb2YgVmFsdWVDb2xvciB8IHN0cmluZyA9IFZhbHVlQ29sb3IuTmV1dHJhbDsgLy8gRGVmYXVsdCBDcml0aWNhbGl0eSBTdGF0ZVxuXG5cdFx0c1ZhbHVlID0gYCUke3NWYWx1ZX1gO1xuXG5cdFx0Ly8gU2V0dGluZyBVbmFzc2lnbmVkIFZhbHVlc1xuXHRcdHNEZXZpYXRpb25Mb3cgPSBzRGV2aWF0aW9uTG93IHx8IC1JbmZpbml0eTtcblx0XHRzVG9sZXJhbmNlTG93ID0gc1RvbGVyYW5jZUxvdyB8fCBzRGV2aWF0aW9uTG93O1xuXHRcdHNBY2NlcHRhbmNlTG93ID0gc0FjY2VwdGFuY2VMb3cgfHwgc1RvbGVyYW5jZUxvdztcblx0XHRzRGV2aWF0aW9uSGlnaCA9IHNEZXZpYXRpb25IaWdoIHx8IEluZmluaXR5O1xuXHRcdHNUb2xlcmFuY2VIaWdoID0gc1RvbGVyYW5jZUhpZ2ggfHwgc0RldmlhdGlvbkhpZ2g7XG5cdFx0c0FjY2VwdGFuY2VIaWdoID0gc0FjY2VwdGFuY2VIaWdoIHx8IHNUb2xlcmFuY2VIaWdoO1xuXG5cdFx0Ly8gRGVhbGluZyB3aXRoIERlY2ltYWwgYW5kIFBhdGggYmFzZWQgYmluZ2RpbmdzXG5cdFx0c0RldmlhdGlvbkxvdyA9IHNEZXZpYXRpb25Mb3cgJiYgKCtzRGV2aWF0aW9uTG93ID8gK3NEZXZpYXRpb25Mb3cgOiBgJSR7c0RldmlhdGlvbkxvd31gKTtcblx0XHRzVG9sZXJhbmNlTG93ID0gc1RvbGVyYW5jZUxvdyAmJiAoK3NUb2xlcmFuY2VMb3cgPyArc1RvbGVyYW5jZUxvdyA6IGAlJHtzVG9sZXJhbmNlTG93fWApO1xuXHRcdHNBY2NlcHRhbmNlTG93ID0gc0FjY2VwdGFuY2VMb3cgJiYgKCtzQWNjZXB0YW5jZUxvdyA/ICtzQWNjZXB0YW5jZUxvdyA6IGAlJHtzQWNjZXB0YW5jZUxvd31gKTtcblx0XHRzQWNjZXB0YW5jZUhpZ2ggPSBzQWNjZXB0YW5jZUhpZ2ggJiYgKCtzQWNjZXB0YW5jZUhpZ2ggPyArc0FjY2VwdGFuY2VIaWdoIDogYCUke3NBY2NlcHRhbmNlSGlnaH1gKTtcblx0XHRzVG9sZXJhbmNlSGlnaCA9IHNUb2xlcmFuY2VIaWdoICYmICgrc1RvbGVyYW5jZUhpZ2ggPyArc1RvbGVyYW5jZUhpZ2ggOiBgJSR7c1RvbGVyYW5jZUhpZ2h9YCk7XG5cdFx0c0RldmlhdGlvbkhpZ2ggPSBzRGV2aWF0aW9uSGlnaCAmJiAoK3NEZXZpYXRpb25IaWdoID8gK3NEZXZpYXRpb25IaWdoIDogYCUke3NEZXZpYXRpb25IaWdofWApO1xuXG5cdFx0Ly8gQ3JlYXRpbmcgcnVudGltZSBleHByZXNzaW9uIGJpbmRpbmcgZnJvbSBjcml0aWNhbGl0eSBjYWxjdWxhdGlvbiBmb3IgQ3JpdGljYWxpdHkgU3RhdGVcblx0XHRpZiAoc0ltcHJvdmVtZW50RGlyZWN0aW9uLmluZGV4T2YoXCJNaW5pbWl6ZVwiKSA+IC0xKSB7XG5cdFx0XHRzQ3JpdGljYWxpdHlFeHByZXNzaW9uID1cblx0XHRcdFx0XCJ7PSBcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiIDw9IFwiICtcblx0XHRcdFx0c0FjY2VwdGFuY2VIaWdoICtcblx0XHRcdFx0XCIgPyAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLkdvb2QgK1xuXHRcdFx0XHRcIicgOiBcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiIDw9IFwiICtcblx0XHRcdFx0c1RvbGVyYW5jZUhpZ2ggK1xuXHRcdFx0XHRcIiA/ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuTmV1dHJhbCArXG5cdFx0XHRcdFwiJyA6IFwiICtcblx0XHRcdFx0XCIoXCIgK1xuXHRcdFx0XHRzRGV2aWF0aW9uSGlnaCArXG5cdFx0XHRcdFwiICYmIFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPD0gXCIgK1xuXHRcdFx0XHRzRGV2aWF0aW9uSGlnaCArXG5cdFx0XHRcdFwiKSA/ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuQ3JpdGljYWwgK1xuXHRcdFx0XHRcIicgOiAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLkVycm9yICtcblx0XHRcdFx0XCInIH1cIjtcblx0XHR9IGVsc2UgaWYgKHNJbXByb3ZlbWVudERpcmVjdGlvbi5pbmRleE9mKFwiTWF4aW1pemVcIikgPiAtMSkge1xuXHRcdFx0c0NyaXRpY2FsaXR5RXhwcmVzc2lvbiA9XG5cdFx0XHRcdFwiez0gXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA+PSBcIiArXG5cdFx0XHRcdHNBY2NlcHRhbmNlTG93ICtcblx0XHRcdFx0XCIgPyAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLkdvb2QgK1xuXHRcdFx0XHRcIicgOiBcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID49IFwiICtcblx0XHRcdFx0c1RvbGVyYW5jZUxvdyArXG5cdFx0XHRcdFwiID8gJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5OZXV0cmFsICtcblx0XHRcdFx0XCInIDogXCIgK1xuXHRcdFx0XHRcIihcIiArXG5cdFx0XHRcdHNEZXZpYXRpb25Mb3cgK1xuXHRcdFx0XHRcIiAmJiBcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID49IFwiICtcblx0XHRcdFx0c0RldmlhdGlvbkxvdyArXG5cdFx0XHRcdFwiKSA/ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuQ3JpdGljYWwgK1xuXHRcdFx0XHRcIicgOiAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLkVycm9yICtcblx0XHRcdFx0XCInIH1cIjtcblx0XHR9IGVsc2UgaWYgKHNJbXByb3ZlbWVudERpcmVjdGlvbi5pbmRleE9mKFwiVGFyZ2V0XCIpID4gLTEpIHtcblx0XHRcdHNDcml0aWNhbGl0eUV4cHJlc3Npb24gPVxuXHRcdFx0XHRcIns9IChcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiIDw9IFwiICtcblx0XHRcdFx0c0FjY2VwdGFuY2VIaWdoICtcblx0XHRcdFx0XCIgJiYgXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA+PSBcIiArXG5cdFx0XHRcdHNBY2NlcHRhbmNlTG93ICtcblx0XHRcdFx0XCIpID8gJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5Hb29kICtcblx0XHRcdFx0XCInIDogXCIgK1xuXHRcdFx0XHRcIigoXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA+PSBcIiArXG5cdFx0XHRcdHNUb2xlcmFuY2VMb3cgK1xuXHRcdFx0XHRcIiAmJiBcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiIDwgXCIgK1xuXHRcdFx0XHRzQWNjZXB0YW5jZUxvdyArXG5cdFx0XHRcdFwiKSB8fCAoXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA+IFwiICtcblx0XHRcdFx0c0FjY2VwdGFuY2VIaWdoICtcblx0XHRcdFx0XCIgJiYgXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA8PSBcIiArXG5cdFx0XHRcdHNUb2xlcmFuY2VIaWdoICtcblx0XHRcdFx0XCIpKSA/ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuTmV1dHJhbCArXG5cdFx0XHRcdFwiJyA6IFwiICtcblx0XHRcdFx0XCIoKFwiICtcblx0XHRcdFx0c0RldmlhdGlvbkxvdyArXG5cdFx0XHRcdFwiICYmIChcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID49IFwiICtcblx0XHRcdFx0c0RldmlhdGlvbkxvdyArXG5cdFx0XHRcdFwiKSAmJiAoXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA8IFwiICtcblx0XHRcdFx0c1RvbGVyYW5jZUxvdyArXG5cdFx0XHRcdFwiKSkgfHwgKChcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID4gXCIgK1xuXHRcdFx0XHRzVG9sZXJhbmNlSGlnaCArXG5cdFx0XHRcdFwiKSAmJiBcIiArXG5cdFx0XHRcdHNEZXZpYXRpb25IaWdoICtcblx0XHRcdFx0XCIgJiYgKFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPD0gXCIgK1xuXHRcdFx0XHRzRGV2aWF0aW9uSGlnaCArXG5cdFx0XHRcdFwiKSkpID8gJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5Dcml0aWNhbCArXG5cdFx0XHRcdFwiJyA6ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuRXJyb3IgK1xuXHRcdFx0XHRcIicgfVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cud2FybmluZyhcIkNhc2Ugbm90IHN1cHBvcnRlZCwgcmV0dXJuaW5nIHRoZSBkZWZhdWx0IFZhbHVlIE5ldXRyYWxcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNDcml0aWNhbGl0eUV4cHJlc3Npb247XG5cdH0sXG5cdC8qKlxuXHQgKiBUbyBmZXRjaCBtZWFzdXJlIGF0dHJpYnV0ZSBpbmRleC5cblx0ICpcblx0ICogQHBhcmFtIGlNZWFzdXJlIENoYXJ0IEFubm90YXRpb25zXG5cdCAqIEBwYXJhbSBvQ2hhcnRBbm5vdGF0aW9ucyBDaGFydCBBbm5vdGF0aW9uc1xuXHQgKiBAcmV0dXJucyBNZWFzdXJlQXR0cmlidXRlIGluZGV4LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0TWVhc3VyZUF0dHJpYnV0ZUluZGV4OiBmdW5jdGlvbiAoaU1lYXN1cmU6IGFueSwgb0NoYXJ0QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdGxldCBhTWVhc3VyZXMsIHNNZWFzdXJlUHJvcGVydHlQYXRoO1xuXHRcdGlmIChvQ2hhcnRBbm5vdGF0aW9ucz8uTWVhc3VyZXM/Lmxlbmd0aCA+IDApIHtcblx0XHRcdGFNZWFzdXJlcyA9IG9DaGFydEFubm90YXRpb25zLk1lYXN1cmVzO1xuXHRcdFx0c01lYXN1cmVQcm9wZXJ0eVBhdGggPSBhTWVhc3VyZXNbaU1lYXN1cmVdLiRQcm9wZXJ0eVBhdGg7XG5cdFx0fSBlbHNlIGlmIChvQ2hhcnRBbm5vdGF0aW9ucz8uRHluYW1pY01lYXN1cmVzPy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhTWVhc3VyZXMgPSBvQ2hhcnRBbm5vdGF0aW9ucy5EeW5hbWljTWVhc3VyZXM7XG5cdFx0XHRzTWVhc3VyZVByb3BlcnR5UGF0aCA9IGFNZWFzdXJlc1tpTWVhc3VyZV0uJEFubm90YXRpb25QYXRoO1xuXHRcdH1cblx0XHRsZXQgYk1lYXN1cmVBdHRyaWJ1dGVFeGlzdHM7XG5cdFx0Y29uc3QgYU1lYXN1cmVBdHRyaWJ1dGVzID0gb0NoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZUF0dHJpYnV0ZXM7XG5cdFx0bGV0IGlNZWFzdXJlQXR0cmlidXRlID0gLTE7XG5cdFx0Y29uc3QgZm5DaGVja01lYXN1cmUgPSBmdW5jdGlvbiAoc01lYXN1cmVQYXRoOiBhbnksIG9NZWFzdXJlQXR0cmlidXRlOiBhbnksIGluZGV4OiBhbnkpIHtcblx0XHRcdGlmIChvTWVhc3VyZUF0dHJpYnV0ZSkge1xuXHRcdFx0XHRpZiAob01lYXN1cmVBdHRyaWJ1dGUuTWVhc3VyZSAmJiBvTWVhc3VyZUF0dHJpYnV0ZS5NZWFzdXJlLiRQcm9wZXJ0eVBhdGggPT09IHNNZWFzdXJlUGF0aCkge1xuXHRcdFx0XHRcdGlNZWFzdXJlQXR0cmlidXRlID0gaW5kZXg7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAob01lYXN1cmVBdHRyaWJ1dGUuRHluYW1pY01lYXN1cmUgJiYgb01lYXN1cmVBdHRyaWJ1dGUuRHluYW1pY01lYXN1cmUuJEFubm90YXRpb25QYXRoID09PSBzTWVhc3VyZVBhdGgpIHtcblx0XHRcdFx0XHRpTWVhc3VyZUF0dHJpYnV0ZSA9IGluZGV4O1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpZiAoYU1lYXN1cmVBdHRyaWJ1dGVzKSB7XG5cdFx0XHRiTWVhc3VyZUF0dHJpYnV0ZUV4aXN0cyA9IGFNZWFzdXJlQXR0cmlidXRlcy5zb21lKGZuQ2hlY2tNZWFzdXJlLmJpbmQobnVsbCwgc01lYXN1cmVQcm9wZXJ0eVBhdGgpKTtcblx0XHR9XG5cdFx0cmV0dXJuIGJNZWFzdXJlQXR0cmlidXRlRXhpc3RzICYmIGlNZWFzdXJlQXR0cmlidXRlID4gLTEgJiYgaU1lYXN1cmVBdHRyaWJ1dGU7XG5cdH0sXG5cblx0Z2V0TWVhc3VyZUF0dHJpYnV0ZTogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRzQ2hhcnRBbm5vdGF0aW9uUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRyZXR1cm4gb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KHNDaGFydEFubm90YXRpb25QYXRoKS50aGVuKGZ1bmN0aW9uIChvQ2hhcnRBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0XHRjb25zdCBhTWVhc3VyZUF0dHJpYnV0ZXMgPSBvQ2hhcnRBbm5vdGF0aW9ucy5NZWFzdXJlQXR0cmlidXRlcyxcblx0XHRcdFx0aU1lYXN1cmVBdHRyaWJ1dGUgPSBDb21tb25IZWxwZXIuZ2V0TWVhc3VyZUF0dHJpYnV0ZUluZGV4KDAsIG9DaGFydEFubm90YXRpb25zKTtcblx0XHRcdGNvbnN0IHNNZWFzdXJlQXR0cmlidXRlUGF0aCA9XG5cdFx0XHRcdGlNZWFzdXJlQXR0cmlidXRlID4gLTEgJiYgYU1lYXN1cmVBdHRyaWJ1dGVzW2lNZWFzdXJlQXR0cmlidXRlXSAmJiBhTWVhc3VyZUF0dHJpYnV0ZXNbaU1lYXN1cmVBdHRyaWJ1dGVdLkRhdGFQb2ludFxuXHRcdFx0XHRcdD8gYCR7c0NoYXJ0QW5ub3RhdGlvblBhdGh9L01lYXN1cmVBdHRyaWJ1dGVzLyR7aU1lYXN1cmVBdHRyaWJ1dGV9L2Bcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdGlmIChzTWVhc3VyZUF0dHJpYnV0ZVBhdGggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRMb2cud2FybmluZyhcIkRhdGFQb2ludCBtaXNzaW5nIGZvciB0aGUgbWVhc3VyZVwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzTWVhc3VyZUF0dHJpYnV0ZVBhdGggPyBgJHtzTWVhc3VyZUF0dHJpYnV0ZVBhdGh9RGF0YVBvaW50LyRBbm5vdGF0aW9uUGF0aC9gIDogc01lYXN1cmVBdHRyaWJ1dGVQYXRoO1xuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBtZWFzdXJlQXR0cmlidXRlIGZvciB0aGUgbWVhc3VyZS5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gdGhlIG1lYXN1cmUgYW5ub3RhdGlvblxuXHQgKiBAcmV0dXJucyBQYXRoIHRvIHRoZSBtZWFzdXJlQXR0cmlidXRlIG9mIHRoZSBtZWFzdXJlXG5cdCAqL1xuXHRnZXRNZWFzdXJlQXR0cmlidXRlRm9yTWVhc3VyZTogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRzTWVhc3VyZVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzQ2hhcnRBbm5vdGF0aW9uUGF0aCA9IHNNZWFzdXJlUGF0aC5zdWJzdHJpbmcoMCwgc01lYXN1cmVQYXRoLmxhc3RJbmRleE9mKFwiTWVhc3VyZVwiKSksXG5cdFx0XHRpTWVhc3VyZSA9IHNNZWFzdXJlUGF0aC5yZXBsYWNlKC8uKlxcLy8sIFwiXCIpO1xuXG5cdFx0Y29uc3Qgb0NoYXJ0QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzQ2hhcnRBbm5vdGF0aW9uUGF0aCk7XG5cdFx0Y29uc3QgYU1lYXN1cmVBdHRyaWJ1dGVzID0gb0NoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZUF0dHJpYnV0ZXMsXG5cdFx0XHRpTWVhc3VyZUF0dHJpYnV0ZSA9IENvbW1vbkhlbHBlci5nZXRNZWFzdXJlQXR0cmlidXRlSW5kZXgoaU1lYXN1cmUsIG9DaGFydEFubm90YXRpb25zKTtcblx0XHRjb25zdCBzTWVhc3VyZUF0dHJpYnV0ZVBhdGggPVxuXHRcdFx0aU1lYXN1cmVBdHRyaWJ1dGUgPiAtMSAmJiBhTWVhc3VyZUF0dHJpYnV0ZXNbaU1lYXN1cmVBdHRyaWJ1dGVdICYmIGFNZWFzdXJlQXR0cmlidXRlc1tpTWVhc3VyZUF0dHJpYnV0ZV0uRGF0YVBvaW50XG5cdFx0XHRcdD8gYCR7c0NoYXJ0QW5ub3RhdGlvblBhdGh9TWVhc3VyZUF0dHJpYnV0ZXMvJHtpTWVhc3VyZUF0dHJpYnV0ZX0vYFxuXHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRpZiAoc01lYXN1cmVBdHRyaWJ1dGVQYXRoID09PSB1bmRlZmluZWQpIHtcblx0XHRcdExvZy53YXJuaW5nKFwiRGF0YVBvaW50IG1pc3NpbmcgZm9yIHRoZSBtZWFzdXJlXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gc01lYXN1cmVBdHRyaWJ1dGVQYXRoID8gYCR7c01lYXN1cmVBdHRyaWJ1dGVQYXRofURhdGFQb2ludC8kQW5ub3RhdGlvblBhdGgvYCA6IHNNZWFzdXJlQXR0cmlidXRlUGF0aDtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIGNvbnRhaW5lZCBuYXZpZ2F0aW9uIHByb3BlcnR5IGhhcyBhIGRyYWZ0IHJvb3Qvbm9kZSBwYXJlbnQgZW50aXR5U2V0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEcmFmdFBhcmVudEVudGl0eUZvckNvbnRhaW5tZW50XG5cdCAqIEBwYXJhbSBvVGFyZ2V0Q29sbGVjdGlvbkNvbnRhaW5zVGFyZ2V0IFRhcmdldCBjb2xsZWN0aW9uIGhhcyBDb250YWluc1RhcmdldCBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gb1RhYmxlTWV0YWRhdGEgVGFibGUgbWV0YWRhdGEgZm9yIHdoaWNoIGRyYWZ0IHN1cHBvcnQgc2hhbGwgYmUgY2hlY2tlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgZHJhZnRcblx0ICovXG5cdGlzRHJhZnRQYXJlbnRFbnRpdHlGb3JDb250YWlubWVudDogZnVuY3Rpb24gKG9UYXJnZXRDb2xsZWN0aW9uQ29udGFpbnNUYXJnZXQ6IG9iamVjdCwgb1RhYmxlTWV0YWRhdGE6IGFueSkge1xuXHRcdGlmIChvVGFyZ2V0Q29sbGVjdGlvbkNvbnRhaW5zVGFyZ2V0KSB7XG5cdFx0XHRpZiAob1RhYmxlTWV0YWRhdGEgJiYgb1RhYmxlTWV0YWRhdGEucGFyZW50RW50aXR5U2V0ICYmIG9UYWJsZU1ldGFkYXRhLnBhcmVudEVudGl0eVNldC5zUGF0aCkge1xuXHRcdFx0XHRjb25zdCBzUGFyZW50RW50aXR5U2V0UGF0aCA9IG9UYWJsZU1ldGFkYXRhLnBhcmVudEVudGl0eVNldC5zUGF0aDtcblx0XHRcdFx0Y29uc3Qgb0RyYWZ0Um9vdCA9IG9UYWJsZU1ldGFkYXRhLnBhcmVudEVudGl0eVNldC5vTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdGAke3NQYXJlbnRFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRjb25zdCBvRHJhZnROb2RlID0gb1RhYmxlTWV0YWRhdGEucGFyZW50RW50aXR5U2V0Lm9Nb2RlbC5nZXRPYmplY3QoXG5cdFx0XHRcdFx0YCR7c1BhcmVudEVudGl0eVNldFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVgXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChvRHJhZnRSb290IHx8IG9EcmFmdE5vZGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBFbnN1cmVzIHRoZSBkYXRhIGlzIHByb2Nlc3NlZCBhcyBkZWZpbmVkIGluIHRoZSB0ZW1wbGF0ZS5cblx0ICogU2luY2UgdGhlIHByb3BlcnR5IERhdGEgaXMgb2YgdGhlIHR5cGUgJ29iamVjdCcsIGl0IG1heSBub3QgYmUgaW4gdGhlIHNhbWUgb3JkZXIgYXMgcmVxdWlyZWQgYnkgdGhlIHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBkYXRhRWxlbWVudCBUaGUgZGF0YSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBwcm9jZXNzZWQuXG5cdCAqIEByZXR1cm5zIFRoZSBjb3JyZWN0IHBhdGggYWNjb3JkaW5nIHRvIHRoZSB0ZW1wbGF0ZS5cblx0ICovXG5cdGdldERhdGFGcm9tVGVtcGxhdGU6IGZ1bmN0aW9uIChkYXRhRWxlbWVudDogQ29udGV4dCkge1xuXHRcdGNvbnN0IHNwbGl0UGF0aCA9IGRhdGFFbGVtZW50LmdldFBhdGgoKS5zcGxpdChcIi9cIik7XG5cdFx0Y29uc3QgZGF0YUtleSA9IHNwbGl0UGF0aFtzcGxpdFBhdGgubGVuZ3RoIC0gMV07XG5cdFx0Y29uc3QgY29ubmVjdGVkRGF0YVBhdGggPSBgLyR7c3BsaXRQYXRoLnNsaWNlKDEsIC0yKS5qb2luKFwiL1wiKX0vQGA7XG5cdFx0Y29uc3QgY29ubmVjdGVkT2JqZWN0ID0gZGF0YUVsZW1lbnQuZ2V0T2JqZWN0KGNvbm5lY3RlZERhdGFQYXRoKTtcblx0XHRjb25zdCB0ZW1wbGF0ZSA9IGNvbm5lY3RlZE9iamVjdC5UZW1wbGF0ZTtcblx0XHRjb25zdCBzcGxpdFRlbXAgPSB0ZW1wbGF0ZS5zcGxpdChcIn1cIik7XG5cdFx0Y29uc3QgdGVtcEFycmF5ID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdFRlbXAubGVuZ3RoIC0gMTsgaSsrKSB7XG5cdFx0XHRjb25zdCBrZXkgPSBzcGxpdFRlbXBbaV0uc3BsaXQoXCJ7XCIpWzFdLnRyaW0oKTtcblx0XHRcdHRlbXBBcnJheS5wdXNoKGtleSk7XG5cdFx0fVxuXHRcdE9iamVjdC5rZXlzKGNvbm5lY3RlZE9iamVjdC5EYXRhKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdGlmIChzS2V5LnN0YXJ0c1dpdGgoXCIkXCIpKSB7XG5cdFx0XHRcdGRlbGV0ZSBjb25uZWN0ZWRPYmplY3QuRGF0YVtzS2V5XTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCBpbmRleCA9IE9iamVjdC5rZXlzKGNvbm5lY3RlZE9iamVjdC5EYXRhKS5pbmRleE9mKGRhdGFLZXkpO1xuXHRcdHJldHVybiBgLyR7c3BsaXRQYXRoLnNsaWNlKDEsIC0yKS5qb2luKFwiL1wiKX0vRGF0YS8ke3RlbXBBcnJheVtpbmRleF19YDtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBlbmQgb2YgdGhlIHRlbXBsYXRlIGhhcyBiZWVuIHJlYWNoZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXJcblx0ICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9mIHRoZSBjb25uZWN0ZWQgZmllbGRzLlxuXHQgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBwcm9jZXNzZWQuXG5cdCAqIEByZXR1cm5zIFRydWUgb3IgRmFsc2UgKGRlcGVuZGluZyBvbiB0aGUgdGVtcGxhdGUgaW5kZXgpLlxuXHQgKi9cblx0bm90TGFzdEluZGV4OiBmdW5jdGlvbiAodGFyZ2V0OiBhbnksIGVsZW1lbnQ6IG9iamVjdCkge1xuXHRcdGNvbnN0IHRlbXBsYXRlID0gdGFyZ2V0LlRlbXBsYXRlO1xuXHRcdGNvbnN0IHNwbGl0VGVtcCA9IHRlbXBsYXRlLnNwbGl0KFwifVwiKTtcblx0XHRjb25zdCB0ZW1wQXJyYXk6IGFueVtdID0gW107XG5cdFx0bGV0IGlzTGFzdEluZGV4ID0gZmFsc2U7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdFRlbXAubGVuZ3RoIC0gMTsgaSsrKSB7XG5cdFx0XHRjb25zdCBkYXRhS2V5ID0gc3BsaXRUZW1wW2ldLnNwbGl0KFwie1wiKVsxXS50cmltKCk7XG5cdFx0XHR0ZW1wQXJyYXkucHVzaChkYXRhS2V5KTtcblx0XHR9XG5cblx0XHR0ZW1wQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAodGVtcGxhdGVJbmZvOiBhbnkpIHtcblx0XHRcdGlmICh0YXJnZXQuRGF0YVt0ZW1wbGF0ZUluZm9dID09PSBlbGVtZW50ICYmIHRlbXBBcnJheS5pbmRleE9mKHRlbXBsYXRlSW5mbykgIT09IHRlbXBBcnJheS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdGlzTGFzdEluZGV4ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gaXNMYXN0SW5kZXg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERldGVybWluZXMgdGhlIGRlbGltaXRlciBmcm9tIHRoZSB0ZW1wbGF0ZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gdGVtcGxhdGUgVGhlIHRlbXBsYXRlIHN0cmluZy5cblx0ICogQHJldHVybnMgVGhlIGRlbGltaXRlciBpbiB0aGUgdGVtcGxhdGUgc3RyaW5nLlxuXHQgKi9cblx0Z2V0RGVsaW1pdGVyOiBmdW5jdGlvbiAodGVtcGxhdGU6IHN0cmluZykge1xuXHRcdHJldHVybiB0ZW1wbGF0ZS5zcGxpdChcIn1cIilbMV0uc3BsaXQoXCJ7XCIpWzBdLnRyaW0oKTtcblx0fSxcblxuXHRvTWV0YU1vZGVsOiB1bmRlZmluZWQgYXMgYW55LFxuXHRzZXRNZXRhTW9kZWw6IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRcdHRoaXMub01ldGFNb2RlbCA9IG9NZXRhTW9kZWw7XG5cdH0sXG5cblx0Z2V0TWV0YU1vZGVsOiBmdW5jdGlvbiAob0NvbnRleHQ/OiBhbnksIG9JbnRlcmZhY2U/OiBhbnkpIHtcblx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdHJldHVybiBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMub01ldGFNb2RlbDtcblx0fSxcblxuXHRnZXRQYXJhbWV0ZXJzOiBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0XHRjb25zdCBzUGF0aCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRjb25zdCBvUGFyYW1ldGVySW5mbyA9IENvbW1vblV0aWxzLmdldFBhcmFtZXRlckluZm8ob01ldGFNb2RlbCwgc1BhdGgpO1xuXHRcdFx0aWYgKG9QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlclByb3BlcnRpZXMpIHtcblx0XHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKG9QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlclByb3BlcnRpZXMpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gW107XG5cdH0sXG5cblx0LyoqXG5cdCAqIEJ1aWxkIGFuIGV4cHJlc3Npb24gY2FsbGluZyBhbiBhY3Rpb24gaGFuZGxlciB2aWEgdGhlIEZQTSBoZWxwZXIncyBhY3Rpb25XcmFwcGVyIGZ1bmN0aW9uXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gYXNzdW1lcyB0aGF0IHRoZSAnRlBNLmFjdGlvbldyYXBwZXIoKScgZnVuY3Rpb24gaXMgYXZhaWxhYmxlIGF0IHJ1bnRpbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQWN0aW9uIEFjdGlvbiBtZXRhZGF0YVxuXHQgKiBAcGFyYW0gb0FjdGlvbi5oYW5kbGVyTW9kdWxlIE1vZHVsZSBjb250YWluaW5nIHRoZSBhY3Rpb24gaGFuZGxlciBtZXRob2Rcblx0ICogQHBhcmFtIG9BY3Rpb24uaGFuZGxlck1ldGhvZCBBY3Rpb24gaGFuZGxlciBtZXRob2QgbmFtZVxuXHQgKiBAcGFyYW0gW29UaGlzXSBgdGhpc2AgKGlmIHRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgZnJvbSBhIG1hY3JvKVxuXHQgKiBAcGFyYW0gb1RoaXMuaWQgVGhlIHRhYmxlJ3MgSURcblx0ICogQHJldHVybnMgVGhlIGFjdGlvbiB3cmFwcGVyIGJpbmRpbmdcdGV4cHJlc3Npb25cblx0ICovXG5cdGJ1aWxkQWN0aW9uV3JhcHBlcjogZnVuY3Rpb24gKG9BY3Rpb246IEN1c3RvbUFjdGlvbiwgb1RoaXM6IHsgaWQ/OiBzdHJpbmcgfSB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IGFQYXJhbXM6IGFueVtdID0gW3JlZihcIiRldmVudFwiKSwgb0FjdGlvbi5oYW5kbGVyTW9kdWxlLCBvQWN0aW9uLmhhbmRsZXJNZXRob2RdO1xuXG5cdFx0aWYgKG9UaGlzICYmIG9UaGlzLmlkKSB7XG5cdFx0XHRjb25zdCBvQWRkaXRpb25hbFBhcmFtcyA9IHtcblx0XHRcdFx0Y29udGV4dHM6IHJlZihcIiR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c31cIilcblx0XHRcdH07XG5cdFx0XHRhUGFyYW1zLnB1c2gob0FkZGl0aW9uYWxQYXJhbXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZm4oXCJGUE0uYWN0aW9uV3JhcHBlclwiLCBhUGFyYW1zKSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB2YWx1ZSB3aGV0aGVyIG9yIG5vdCB0aGUgZWxlbWVudCBzaG91bGQgYmUgdmlzaWJsZSBkZXBlbmRpbmcgb24gdGhlIEhpZGRlbiBhbm5vdGF0aW9uLlxuXHQgKiBJdCBpcyBpbnZlcnRlZCBhcyB0aGUgVUkgZWxlbWVudHMgaGF2ZSBhIHZpc2libGUgcHJvcGVydHkgaW5zdGVhZCBvZiBhIGhpZGRlbiBvbmUuXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhRmllbGRBbm5vdGF0aW9ucyBUaGUgZGF0YUZpZWxkIG9iamVjdFxuXHQgKiBAcmV0dXJucyBBIHBhdGggb3IgYSBCb29sZWFuXG5cdCAqL1xuXHRnZXRIaWRkZW5QYXRoRXhwcmVzc2lvbjogZnVuY3Rpb24gKGRhdGFGaWVsZEFubm90YXRpb25zOiBhbnkpIHtcblx0XHRpZiAoZGF0YUZpZWxkQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCBoaWRkZW4gPSBkYXRhRmllbGRBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl07XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGhpZGRlbiA9PT0gXCJvYmplY3RcIiA/IFwiez0gISR7XCIgKyBoaWRkZW4uJFBhdGggKyBcIn0gfVwiIDogIWhpZGRlbjtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdHZhbGlkYXRlUHJlc2VudGF0aW9uTWV0YVBhdGg6IGZ1bmN0aW9uIChtZXRhUGF0aDogc3RyaW5nLCBvYmplY3RUZXJtOiBzdHJpbmcpIHtcblx0XHQvLyBwZXJmb3JtIHZhbGlkYXRpb24gb25seSBpZiBhbm5vdGF0aW9uIHNldCAodG8gYXZvaWQgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgaXNzdWVzIGZvciB0ZXN0IHdpdGhvdXQgYW5ub3RhdGlvbnMpXG5cdFx0aWYgKG1ldGFQYXRoLmluZGV4T2Yob2JqZWN0VGVybS5zbGljZSgwLCBvYmplY3RUZXJtLmxhc3RJbmRleE9mKFwiLlwiKSkpID4gLTEpIHtcblx0XHRcdGNvbnN0IGFsbG93ZWRUZXJtcyA9IFtVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50LCBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LCBvYmplY3RUZXJtXTtcblx0XHRcdGlmIChcblx0XHRcdFx0IWFsbG93ZWRUZXJtcy5zb21lKCh0ZXJtKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIG1ldGFQYXRoLnNlYXJjaChuZXcgUmVnRXhwKGAke3Rlcm19KCN8L3wkKWApKSA+IC0xO1xuXHRcdFx0XHR9KVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQW5ub3RhdGlvbiBQYXRoICR7bWV0YVBhdGh9IG1lbnRpb25lZCBpbiB0aGUgbWFuaWZlc3QgaXMgbm90IHZhbGlkIGZvciAke29iamVjdFRlcm19YCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuKENvbW1vbkhlbHBlci5nZXRTb3J0Q29uZGl0aW9ucyBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuXG5leHBvcnQgZGVmYXVsdCBDb21tb25IZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztFQWNBLE1BQU1BLFVBQVUsR0FBR0MsUUFBUSxDQUFDRCxVQUFVO0VBQ3RDLE1BQU1FLFlBQVksR0FBRztJQUNwQkMsWUFBWSxFQUFFLFVBQVVDLElBQVMsRUFBRTtNQUNsQyxPQUFPQSxJQUFJLENBQUNDLFNBQVMsRUFBRTtJQUN4QixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFLFVB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