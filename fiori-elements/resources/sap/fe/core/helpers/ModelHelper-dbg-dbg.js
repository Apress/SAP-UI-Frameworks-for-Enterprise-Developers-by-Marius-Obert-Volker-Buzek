/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/UriParameters", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/TypeGuards"], function (UriParameters, MetaModelConverter, TypeGuards) {
  "use strict";

  var isEntitySet = TypeGuards.isEntitySet;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  const ModelHelper = {
    /**
     * Method to determine if the programming model is sticky.
     *
     * @function
     * @name isStickySessionSupported
     * @param metaModel ODataModelMetaModel to check for sticky enabled entity
     * @returns Returns true if sticky, else false
     */
    isStickySessionSupported: function (metaModel) {
      const entityContainer = metaModel.getObject("/");
      for (const entitySetName in entityContainer) {
        if (entityContainer[entitySetName].$kind === "EntitySet" && metaModel.getObject(`/${entitySetName}@com.sap.vocabularies.Session.v1.StickySessionSupported`)) {
          return true;
        }
      }
      return false;
    },
    /**
     * Method to determine if the programming model is draft.
     *
     * @function
     * @name isDraftSupported
     * @param metaModel ODataModelMetaModel of the context for which draft support shall be checked
     * @param path Path for which draft support shall be checked
     * @returns Returns true if draft, else false
     */
    isDraftSupported: function (metaModel, path) {
      const metaContext = metaModel.getMetaContext(path);
      const objectPath = getInvolvedDataModelObjects(metaContext);
      return this.isObjectPathDraftSupported(objectPath);
    },
    /**
     * Checks if draft is supported for the data model object path.
     *
     * @param dataModelObjectPath
     * @returns `true` if it is supported
     */
    isObjectPathDraftSupported: function (dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3, _dataModelObjectPath$4, _dataModelObjectPath$5, _dataModelObjectPath$6, _dataModelObjectPath$7;
      const currentEntitySet = dataModelObjectPath.targetEntitySet;
      const bIsDraftRoot = ModelHelper.isDraftRoot(currentEntitySet);
      const bIsDraftNode = ModelHelper.isDraftNode(currentEntitySet);
      const bIsDraftParentEntityForContainment = (_dataModelObjectPath$ = dataModelObjectPath.targetObject) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.containsTarget && ((_dataModelObjectPath$2 = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$2 !== void 0 && (_dataModelObjectPath$3 = _dataModelObjectPath$2.annotations) !== null && _dataModelObjectPath$3 !== void 0 && (_dataModelObjectPath$4 = _dataModelObjectPath$3.Common) !== null && _dataModelObjectPath$4 !== void 0 && _dataModelObjectPath$4.DraftRoot || (_dataModelObjectPath$5 = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$5 !== void 0 && (_dataModelObjectPath$6 = _dataModelObjectPath$5.annotations) !== null && _dataModelObjectPath$6 !== void 0 && (_dataModelObjectPath$7 = _dataModelObjectPath$6.Common) !== null && _dataModelObjectPath$7 !== void 0 && _dataModelObjectPath$7.DraftNode) ? true : false;
      return bIsDraftRoot || bIsDraftNode || !currentEntitySet && bIsDraftParentEntityForContainment;
    },
    /**
     * Method to determine if the service, supports collaboration draft.
     *
     * @function
     * @name isCollaborationDraftSupported
     * @param metaObject MetaObject to be used for determination
     * @param templateInterface API provided by UI5 templating if used
     * @returns Returns true if the service supports collaboration draft, else false
     */
    isCollaborationDraftSupported: function (metaObject, templateInterface) {
      // We'll hide the first version of the collaboration draft behind a URL parameter
      if (UriParameters.fromQuery(window.location.search).get("sap-fe-xx-enableCollaborationDraft") === "true") {
        var _templateInterface$co;
        const oMetaModel = (templateInterface === null || templateInterface === void 0 ? void 0 : (_templateInterface$co = templateInterface.context) === null || _templateInterface$co === void 0 ? void 0 : _templateInterface$co.getModel()) || metaObject;
        const oEntityContainer = oMetaModel.getObject("/");
        for (const sEntitySet in oEntityContainer) {
          if (oEntityContainer[sEntitySet].$kind === "EntitySet" && oMetaModel.getObject(`/${sEntitySet}@com.sap.vocabularies.Common.v1.DraftRoot/ShareAction`)) {
            return true;
          }
        }
      }
      return false;
    },
    /**
     * Method to get the path of the DraftRoot path according to the provided context.
     *
     * @function
     * @name getDraftRootPath
     * @param oContext OdataModel context
     * @returns Returns the path of the draftRoot entity, or undefined if no draftRoot is found
     */
    getDraftRootPath: function (oContext) {
      const oMetaModel = oContext.getModel().getMetaModel();
      const getRootPath = function (sPath, model) {
        var _RegExp$exec;
        let firstIteration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        const sIterationPath = firstIteration ? sPath : (_RegExp$exec = new RegExp(/.*(?=\/)/).exec(sPath)) === null || _RegExp$exec === void 0 ? void 0 : _RegExp$exec[0]; // *Regex to get the ancestor
        if (sIterationPath && sIterationPath !== "/") {
          var _mDataModel$targetEnt, _mDataModel$targetEnt2;
          const sEntityPath = oMetaModel.getMetaPath(sIterationPath);
          const mDataModel = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.getContext(sEntityPath));
          if ((_mDataModel$targetEnt = mDataModel.targetEntitySet) !== null && _mDataModel$targetEnt !== void 0 && (_mDataModel$targetEnt2 = _mDataModel$targetEnt.annotations.Common) !== null && _mDataModel$targetEnt2 !== void 0 && _mDataModel$targetEnt2.DraftRoot) {
            return sIterationPath;
          }
          return getRootPath(sIterationPath, model, false);
        }
        return undefined;
      };
      return getRootPath(oContext.getPath(), oContext.getModel());
    },
    /**
     * Method to get the path of the StickyRoot path according to the provided context.
     *
     * @function
     * @name getStickyRootPath
     * @param oContext OdataModel context
     * @returns Returns the path of the StickyRoot entity, or undefined if no StickyRoot is found
     */
    getStickyRootPath: function (oContext) {
      const oMetaModel = oContext.getModel().getMetaModel();
      const getRootPath = function (sPath, model) {
        var _RegExp$exec2;
        let firstIteration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        const sIterationPath = firstIteration ? sPath : (_RegExp$exec2 = new RegExp(/.*(?=\/)/).exec(sPath)) === null || _RegExp$exec2 === void 0 ? void 0 : _RegExp$exec2[0]; // *Regex to get the ancestor
        if (sIterationPath && sIterationPath !== "/") {
          var _mDataModel$targetEnt3, _mDataModel$targetEnt4, _mDataModel$targetEnt5;
          const sEntityPath = oMetaModel.getMetaPath(sIterationPath);
          const mDataModel = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.getContext(sEntityPath));
          if ((_mDataModel$targetEnt3 = mDataModel.targetEntitySet) !== null && _mDataModel$targetEnt3 !== void 0 && (_mDataModel$targetEnt4 = _mDataModel$targetEnt3.annotations) !== null && _mDataModel$targetEnt4 !== void 0 && (_mDataModel$targetEnt5 = _mDataModel$targetEnt4.Session) !== null && _mDataModel$targetEnt5 !== void 0 && _mDataModel$targetEnt5.StickySessionSupported) {
            return sIterationPath;
          }
          return getRootPath(sIterationPath, model, false);
        }
        return undefined;
      };
      return getRootPath(oContext.getPath(), oContext.getModel());
    },
    /**
     * Returns the path to the target entity set via navigation property binding.
     *
     * @function
     * @name getTargetEntitySet
     * @param oContext Context for which the target entity set will be determined
     * @returns Returns the path to the target entity set
     */
    getTargetEntitySet: function (oContext) {
      const sPath = oContext.getPath();
      if (oContext.getObject("$kind") === "EntitySet" || oContext.getObject("$kind") === "Action" || oContext.getObject("0/$kind") === "Action") {
        return sPath;
      }
      const sEntitySetPath = ModelHelper.getEntitySetPath(sPath);
      return `/${oContext.getObject(sEntitySetPath)}`;
    },
    /**
     * Returns complete path to the entity set via using navigation property binding. Note: To be used only after the metamodel has loaded.
     *
     * @function
     * @name getEntitySetPath
     * @param path Path for which complete entitySet path needs to be determined from entityType path
     * @param odataMetaModel Metamodel to be used.(Optional in normal scenarios, but needed for parameterized service scenarios)
     * @returns Returns complete path to the entity set
     */
    getEntitySetPath: function (path, odataMetaModel) {
      let entitySetPath = "";
      if (!odataMetaModel) {
        // Previous implementation for getting entitySetPath from entityTypePath
        entitySetPath = `/${path.split("/").filter(ModelHelper.filterOutNavPropBinding).join("/$NavigationPropertyBinding/")}`;
      } else {
        // Calculating the entitySetPath from MetaModel.
        const pathParts = path.split("/").filter(ModelHelper.filterOutNavPropBinding);
        if (pathParts.length > 1) {
          const initialPathObject = {
            growingPath: "/",
            pendingNavPropBinding: ""
          };
          const pathObject = pathParts.reduce((pathUnderConstruction, pathPart, idx) => {
            const delimiter = !!idx && "/$NavigationPropertyBinding/" || "";
            let {
              growingPath,
              pendingNavPropBinding
            } = pathUnderConstruction;
            const tempPath = growingPath + delimiter;
            const navPropBindings = odataMetaModel.getObject(tempPath);
            const navPropBindingToCheck = pendingNavPropBinding ? `${pendingNavPropBinding}/${pathPart}` : pathPart;
            if (navPropBindings && Object.keys(navPropBindings).length > 0 && navPropBindings.hasOwnProperty(navPropBindingToCheck)) {
              growingPath = tempPath + navPropBindingToCheck.replace("/", "%2F");
              pendingNavPropBinding = "";
            } else {
              pendingNavPropBinding += pendingNavPropBinding ? `/${pathPart}` : pathPart;
            }
            return {
              growingPath,
              pendingNavPropBinding
            };
          }, initialPathObject);
          entitySetPath = pathObject.growingPath;
        } else {
          entitySetPath = `/${pathParts[0]}`;
        }
      }
      return entitySetPath;
    },
    /**
     * Gets the path for the items property of MultiValueField parameters.
     *
     * @function
     * @name getActionParameterItemsModelPath
     * @param oParameter Action Parameter
     * @returns Returns the complete model path for the items property of MultiValueField parameters
     */
    getActionParameterItemsModelPath: function (oParameter) {
      return oParameter && oParameter.$Name ? `{path: 'mvfview>/${oParameter.$Name}'}` : undefined;
    },
    filterOutNavPropBinding: function (sPathPart) {
      return sPathPart !== "" && sPathPart !== "$NavigationPropertyBinding";
    },
    /**
     * Adds a setProperty to the created binding contexts of the internal JSON model.
     *
     * @function
     * @name enhanceInternalJSONModel
     * @param {sap.ui.model.json.JSONModel} Internal JSON Model which is enhanced
     */

    enhanceInternalJSONModel: function (oInternalModel) {
      const fnBindContext = oInternalModel.bindContext;
      oInternalModel.bindContext = function (sPath, oContext, mParameters) {
        for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          args[_key - 3] = arguments[_key];
        }
        oContext = fnBindContext.apply(this, [sPath, oContext, mParameters, ...args]);
        const fnGetBoundContext = oContext.getBoundContext;
        oContext.getBoundContext = function () {
          for (var _len2 = arguments.length, subArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            subArgs[_key2] = arguments[_key2];
          }
          const oBoundContext = fnGetBoundContext.apply(this, ...subArgs);
          if (oBoundContext && !oBoundContext.setProperty) {
            oBoundContext.setProperty = function (sSetPropPath, value) {
              if (this.getObject() === undefined) {
                // initialize
                this.getModel().setProperty(this.getPath(), {});
              }
              this.getModel().setProperty(sSetPropPath, value, this);
            };
          }
          return oBoundContext;
        };
        return oContext;
      };
    },
    /**
     * Adds an handler on propertyChange.
     * The property "/editMode" is changed according to property '/isEditable' when this last one is set
     * in order to be compliant with former versions where building blocks use the property "/editMode"
     *
     * @function
     * @name enhanceUiJSONModel
     * @param {sap.ui.model.json.JSONModel} uiModel JSON Model which is enhanced
     * @param {object} library Core library of SAP Fiori elements
     */

    enhanceUiJSONModel: function (uiModel, library) {
      const fnSetProperty = uiModel.setProperty;
      uiModel.setProperty = function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        const value = args[1];
        if (args[0] === "/isEditable") {
          uiModel.setProperty("/editMode", value ? library.EditMode.Editable : library.EditMode.Display, args[2], args[3]);
        }
        return fnSetProperty.apply(this, [...args]);
      };
    },
    /**
     * Returns whether filtering on the table is case sensitive.
     *
     * @param oMetaModel The instance of the meta model
     * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
     */
    isFilteringCaseSensitive: function (oMetaModel) {
      if (!oMetaModel) {
        return undefined;
      }
      const aFilterFunctions = oMetaModel.getObject("/@Org.OData.Capabilities.V1.FilterFunctions");
      // Get filter functions defined at EntityContainer and check for existence of 'tolower'
      return aFilterFunctions ? aFilterFunctions.indexOf("tolower") === -1 : true;
    },
    /**
     * Get MetaPath for the context.
     *
     * @param oContext Context to be used
     * @returns Returns the metapath for the context.
     */
    getMetaPathForContext: function (oContext) {
      const oModel = oContext.getModel(),
        oMetaModel = oModel.getMetaModel(),
        sPath = oContext.getPath();
      return oMetaModel && sPath && oMetaModel.getMetaPath(sPath);
    },
    /**
     * Get MetaPath for the context.
     *
     * @param contextPath MetaPath to be used
     * @returns Returns the root entity set path.
     */
    getRootEntitySetPath: function (contextPath) {
      let rootEntitySetPath = "";
      const aPaths = contextPath ? contextPath.split("/") : [];
      if (aPaths.length > 1) {
        rootEntitySetPath = aPaths[1];
      }
      return rootEntitySetPath;
    },
    /**
     * Get MetaPath for the listBinding.
     *
     * @param oView View of the control using listBinding
     * @param vListBinding ODataListBinding object or the binding path for a temporary list binding
     * @returns Returns the metapath for the listbinding.
     */
    getAbsoluteMetaPathForListBinding: function (oView, vListBinding) {
      const oMetaModel = oView.getModel().getMetaModel();
      let sMetaPath;
      if (typeof vListBinding === "string") {
        if (vListBinding.startsWith("/")) {
          // absolute path
          sMetaPath = oMetaModel.getMetaPath(vListBinding);
        } else {
          // relative path
          const oBindingContext = oView.getBindingContext();
          const sRootContextPath = oBindingContext.getPath();
          sMetaPath = oMetaModel.getMetaPath(`${sRootContextPath}/${vListBinding}`);
        }
      } else {
        // we already get a list binding use this one
        const oBinding = vListBinding;
        const oRootBinding = oBinding.getRootBinding();
        if (oBinding === oRootBinding) {
          // absolute path
          sMetaPath = oMetaModel.getMetaPath(oBinding.getPath());
        } else {
          // relative path
          const sRootBindingPath = oRootBinding.getPath();
          const sRelativePath = oBinding.getPath();
          sMetaPath = oMetaModel.getMetaPath(`${sRootBindingPath}/${sRelativePath}`);
        }
      }
      return sMetaPath;
    },
    /**
     * Method to determine whether the argument is a draft root.
     *
     * @function
     * @name isDraftRoot
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Whether the argument is a draft root
     */
    isDraftRoot: function (entitySet) {
      return this.getDraftRoot(entitySet) !== undefined;
    },
    /**
     * Method to determine whether the argument is a draft node.
     *
     * @function
     * @name isDraftNode
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Whether the argument is a draft node
     */
    isDraftNode: function (entitySet) {
      return this.getDraftNode(entitySet) !== undefined;
    },
    /**
     * Method to determine whether the argument is a sticky session root.
     *
     * @function
     * @name isSticky
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Whether the argument is a sticky session root
     */
    isSticky: function (entitySet) {
      return this.getStickySession(entitySet) !== undefined;
    },
    /**
     * Method to determine if entity is updatable or not.
     *
     * @function
     * @name isUpdateHidden
     * @param entitySet EntitySet | Singleton | undefined
     * @param entityType EntityType
     * @returns True if updatable else false
     */
    isUpdateHidden: function (entitySet, entityType) {
      if (isEntitySet(entitySet)) {
        var _entitySet$annotation, _entityType$annotatio;
        return ((_entitySet$annotation = entitySet.annotations.UI) === null || _entitySet$annotation === void 0 ? void 0 : _entitySet$annotation.UpdateHidden) ?? (entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio = entityType.annotations.UI) === null || _entityType$annotatio === void 0 ? void 0 : _entityType$annotatio.UpdateHidden) ?? false;
      } else {
        return false;
      }
    },
    /**
     * Gets the @Common.DraftRoot annotation if the argument is an EntitySet.
     *
     * @function
     * @name getDraftRoot
     * @param entitySet EntitySet | Singleton | undefined
     * @returns DraftRoot
     */
    getDraftRoot: function (entitySet) {
      var _entitySet$annotation2;
      return isEntitySet(entitySet) ? (_entitySet$annotation2 = entitySet.annotations.Common) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.DraftRoot : undefined;
    },
    /**
     * Gets the @Common.DraftNode annotation if the argument is an EntitySet.
     *
     * @function
     * @name getDraftNode
     * @param entitySet EntitySet | Singleton | undefined
     * @returns DraftRoot
     */
    getDraftNode: function (entitySet) {
      var _entitySet$annotation3;
      return isEntitySet(entitySet) ? (_entitySet$annotation3 = entitySet.annotations.Common) === null || _entitySet$annotation3 === void 0 ? void 0 : _entitySet$annotation3.DraftNode : undefined;
    },
    /**
     * Helper method to get sticky session.
     *
     * @function
     * @name getStickySession
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Session StickySessionSupported
     */
    getStickySession: function (entitySet) {
      var _entitySet$annotation4;
      return isEntitySet(entitySet) ? (_entitySet$annotation4 = entitySet.annotations.Session) === null || _entitySet$annotation4 === void 0 ? void 0 : _entitySet$annotation4.StickySessionSupported : undefined;
    },
    /**
     * Method to get the visibility state of delete button.
     *
     * @function
     * @name getDeleteHidden
     * @param entitySet EntitySet | Singleton | undefined
     * @param entityType EntityType
     * @returns True if delete button is hidden
     */
    getDeleteHidden: function (entitySet, entityType) {
      if (isEntitySet(entitySet)) {
        var _entitySet$annotation5, _entityType$annotatio2;
        return ((_entitySet$annotation5 = entitySet.annotations.UI) === null || _entitySet$annotation5 === void 0 ? void 0 : _entitySet$annotation5.DeleteHidden) ?? ((_entityType$annotatio2 = entityType.annotations.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : _entityType$annotatio2.DeleteHidden);
      } else {
        return false;
      }
    }
  };
  return ModelHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIm1ldGFNb2RlbCIsImVudGl0eUNvbnRhaW5lciIsImdldE9iamVjdCIsImVudGl0eVNldE5hbWUiLCIka2luZCIsImlzRHJhZnRTdXBwb3J0ZWQiLCJwYXRoIiwibWV0YUNvbnRleHQiLCJnZXRNZXRhQ29udGV4dCIsIm9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJpc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZCIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJjdXJyZW50RW50aXR5U2V0IiwidGFyZ2V0RW50aXR5U2V0IiwiYklzRHJhZnRSb290IiwiaXNEcmFmdFJvb3QiLCJiSXNEcmFmdE5vZGUiLCJpc0RyYWZ0Tm9kZSIsImJJc0RyYWZ0UGFyZW50RW50aXR5Rm9yQ29udGFpbm1lbnQiLCJ0YXJnZXRPYmplY3QiLCJjb250YWluc1RhcmdldCIsInN0YXJ0aW5nRW50aXR5U2V0IiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJEcmFmdFJvb3QiLCJEcmFmdE5vZGUiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsIm1ldGFPYmplY3QiLCJ0ZW1wbGF0ZUludGVyZmFjZSIsIlVyaVBhcmFtZXRlcnMiLCJmcm9tUXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsImdldCIsIm9NZXRhTW9kZWwiLCJjb250ZXh0IiwiZ2V0TW9kZWwiLCJvRW50aXR5Q29udGFpbmVyIiwic0VudGl0eVNldCIsImdldERyYWZ0Um9vdFBhdGgiLCJvQ29udGV4dCIsImdldE1ldGFNb2RlbCIsImdldFJvb3RQYXRoIiwic1BhdGgiLCJtb2RlbCIsImZpcnN0SXRlcmF0aW9uIiwic0l0ZXJhdGlvblBhdGgiLCJSZWdFeHAiLCJleGVjIiwic0VudGl0eVBhdGgiLCJnZXRNZXRhUGF0aCIsIm1EYXRhTW9kZWwiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRDb250ZXh0IiwidW5kZWZpbmVkIiwiZ2V0UGF0aCIsImdldFN0aWNreVJvb3RQYXRoIiwiU2Vzc2lvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJnZXRUYXJnZXRFbnRpdHlTZXQiLCJzRW50aXR5U2V0UGF0aCIsImdldEVudGl0eVNldFBhdGgiLCJvZGF0YU1ldGFNb2RlbCIsImVudGl0eVNldFBhdGgiLCJzcGxpdCIsImZpbHRlciIsImZpbHRlck91dE5hdlByb3BCaW5kaW5nIiwiam9pbiIsInBhdGhQYXJ0cyIsImxlbmd0aCIsImluaXRpYWxQYXRoT2JqZWN0IiwiZ3Jvd2luZ1BhdGgiLCJwZW5kaW5nTmF2UHJvcEJpbmRpbmciLCJwYXRoT2JqZWN0IiwicmVkdWNlIiwicGF0aFVuZGVyQ29uc3RydWN0aW9uIiwicGF0aFBhcnQiLCJpZHgiLCJkZWxpbWl0ZXIiLCJ0ZW1wUGF0aCIsIm5hdlByb3BCaW5kaW5ncyIsIm5hdlByb3BCaW5kaW5nVG9DaGVjayIsIk9iamVjdCIsImtleXMiLCJoYXNPd25Qcm9wZXJ0eSIsInJlcGxhY2UiLCJnZXRBY3Rpb25QYXJhbWV0ZXJJdGVtc01vZGVsUGF0aCIsIm9QYXJhbWV0ZXIiLCIkTmFtZSIsInNQYXRoUGFydCIsImVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbCIsIm9JbnRlcm5hbE1vZGVsIiwiZm5CaW5kQ29udGV4dCIsImJpbmRDb250ZXh0IiwibVBhcmFtZXRlcnMiLCJhcmdzIiwiYXBwbHkiLCJmbkdldEJvdW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsInN1YkFyZ3MiLCJvQm91bmRDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJzU2V0UHJvcFBhdGgiLCJ2YWx1ZSIsImVuaGFuY2VVaUpTT05Nb2RlbCIsInVpTW9kZWwiLCJsaWJyYXJ5IiwiZm5TZXRQcm9wZXJ0eSIsIkVkaXRNb2RlIiwiRWRpdGFibGUiLCJEaXNwbGF5IiwiaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIiwiYUZpbHRlckZ1bmN0aW9ucyIsImluZGV4T2YiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJvTW9kZWwiLCJnZXRSb290RW50aXR5U2V0UGF0aCIsImNvbnRleHRQYXRoIiwicm9vdEVudGl0eVNldFBhdGgiLCJhUGF0aHMiLCJnZXRBYnNvbHV0ZU1ldGFQYXRoRm9yTGlzdEJpbmRpbmciLCJvVmlldyIsInZMaXN0QmluZGluZyIsInNNZXRhUGF0aCIsInN0YXJ0c1dpdGgiLCJvQmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInNSb290Q29udGV4dFBhdGgiLCJvQmluZGluZyIsIm9Sb290QmluZGluZyIsImdldFJvb3RCaW5kaW5nIiwic1Jvb3RCaW5kaW5nUGF0aCIsInNSZWxhdGl2ZVBhdGgiLCJlbnRpdHlTZXQiLCJnZXREcmFmdFJvb3QiLCJnZXREcmFmdE5vZGUiLCJpc1N0aWNreSIsImdldFN0aWNreVNlc3Npb24iLCJpc1VwZGF0ZUhpZGRlbiIsImVudGl0eVR5cGUiLCJpc0VudGl0eVNldCIsIlVJIiwiVXBkYXRlSGlkZGVuIiwiZ2V0RGVsZXRlSGlkZGVuIiwiRGVsZXRlSGlkZGVuIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNb2RlbEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBUaGlzIGNsYXNzIGNvbnRhaW5zIGhlbHBlcnMgdG8gYmUgdXNlZCBhdCBydW50aW1lIHRvIHJldHJpZXZlIGZ1cnRoZXIgaW5mb3JtYXRpb24gb24gdGhlIG1vZGVsICovXG5pbXBvcnQgdHlwZSB7IEVudGl0eVNldCwgRW50aXR5VHlwZSwgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWUsIFNpbmdsZXRvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBEcmFmdE5vZGUsIERyYWZ0Um9vdCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IFN0aWNreVNlc3Npb25TdXBwb3J0ZWQgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1Nlc3Npb25cIjtcbmltcG9ydCB0eXBlIHsgRGVsZXRlSGlkZGVuIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IFVyaVBhcmFtZXRlcnMgZnJvbSBcInNhcC9iYXNlL3V0aWwvVXJpUGFyYW1ldGVyc1wiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBpc0VudGl0eVNldCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgdHlwZSBCYXNlQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcIi4uL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuXG5jb25zdCBNb2RlbEhlbHBlciA9IHtcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIHByb2dyYW1taW5nIG1vZGVsIGlzIHN0aWNreS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFxuXHQgKiBAcGFyYW0gbWV0YU1vZGVsIE9EYXRhTW9kZWxNZXRhTW9kZWwgdG8gY2hlY2sgZm9yIHN0aWNreSBlbmFibGVkIGVudGl0eVxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgc3RpY2t5LCBlbHNlIGZhbHNlXG5cdCAqL1xuXHRpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQ6IGZ1bmN0aW9uIChtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdFx0Y29uc3QgZW50aXR5Q29udGFpbmVyID0gbWV0YU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdFx0Zm9yIChjb25zdCBlbnRpdHlTZXROYW1lIGluIGVudGl0eUNvbnRhaW5lcikge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRlbnRpdHlDb250YWluZXJbZW50aXR5U2V0TmFtZV0uJGtpbmQgPT09IFwiRW50aXR5U2V0XCIgJiZcblx0XHRcdFx0bWV0YU1vZGVsLmdldE9iamVjdChgLyR7ZW50aXR5U2V0TmFtZX1AY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkYClcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBwcm9ncmFtbWluZyBtb2RlbCBpcyBkcmFmdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRHJhZnRTdXBwb3J0ZWRcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBPRGF0YU1vZGVsTWV0YU1vZGVsIG9mIHRoZSBjb250ZXh0IGZvciB3aGljaCBkcmFmdCBzdXBwb3J0IHNoYWxsIGJlIGNoZWNrZWRcblx0ICogQHBhcmFtIHBhdGggUGF0aCBmb3Igd2hpY2ggZHJhZnQgc3VwcG9ydCBzaGFsbCBiZSBjaGVja2VkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiBkcmFmdCwgZWxzZSBmYWxzZVxuXHQgKi9cblx0aXNEcmFmdFN1cHBvcnRlZDogZnVuY3Rpb24gKG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHBhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IG1ldGFDb250ZXh0ID0gbWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KHBhdGgpO1xuXHRcdGNvbnN0IG9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMobWV0YUNvbnRleHQpO1xuXHRcdHJldHVybiB0aGlzLmlzT2JqZWN0UGF0aERyYWZ0U3VwcG9ydGVkKG9iamVjdFBhdGgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgZHJhZnQgaXMgc3VwcG9ydGVkIGZvciB0aGUgZGF0YSBtb2RlbCBvYmplY3QgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIGRhdGFNb2RlbE9iamVjdFBhdGhcblx0ICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIHN1cHBvcnRlZFxuXHQgKi9cblx0aXNPYmplY3RQYXRoRHJhZnRTdXBwb3J0ZWQ6IGZ1bmN0aW9uIChkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgY3VycmVudEVudGl0eVNldCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldDtcblx0XHRjb25zdCBiSXNEcmFmdFJvb3QgPSBNb2RlbEhlbHBlci5pc0RyYWZ0Um9vdChjdXJyZW50RW50aXR5U2V0KTtcblx0XHRjb25zdCBiSXNEcmFmdE5vZGUgPSBNb2RlbEhlbHBlci5pc0RyYWZ0Tm9kZShjdXJyZW50RW50aXR5U2V0KTtcblx0XHRjb25zdCBiSXNEcmFmdFBhcmVudEVudGl0eUZvckNvbnRhaW5tZW50ID1cblx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5jb250YWluc1RhcmdldCAmJlxuXHRcdFx0KChkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Um9vdCB8fFxuXHRcdFx0XHQoZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5EcmFmdE5vZGUpXG5cdFx0XHRcdD8gdHJ1ZVxuXHRcdFx0XHQ6IGZhbHNlO1xuXG5cdFx0cmV0dXJuIGJJc0RyYWZ0Um9vdCB8fCBiSXNEcmFmdE5vZGUgfHwgKCFjdXJyZW50RW50aXR5U2V0ICYmIGJJc0RyYWZ0UGFyZW50RW50aXR5Rm9yQ29udGFpbm1lbnQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBzZXJ2aWNlLCBzdXBwb3J0cyBjb2xsYWJvcmF0aW9uIGRyYWZ0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWRcblx0ICogQHBhcmFtIG1ldGFPYmplY3QgTWV0YU9iamVjdCB0byBiZSB1c2VkIGZvciBkZXRlcm1pbmF0aW9uXG5cdCAqIEBwYXJhbSB0ZW1wbGF0ZUludGVyZmFjZSBBUEkgcHJvdmlkZWQgYnkgVUk1IHRlbXBsYXRpbmcgaWYgdXNlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgdGhlIHNlcnZpY2Ugc3VwcG9ydHMgY29sbGFib3JhdGlvbiBkcmFmdCwgZWxzZSBmYWxzZVxuXHQgKi9cblx0aXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQ6IGZ1bmN0aW9uIChtZXRhT2JqZWN0OiBhbnksIHRlbXBsYXRlSW50ZXJmYWNlPzogYW55KSB7XG5cdFx0Ly8gV2UnbGwgaGlkZSB0aGUgZmlyc3QgdmVyc2lvbiBvZiB0aGUgY29sbGFib3JhdGlvbiBkcmFmdCBiZWhpbmQgYSBVUkwgcGFyYW1ldGVyXG5cdFx0aWYgKFVyaVBhcmFtZXRlcnMuZnJvbVF1ZXJ5KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldChcInNhcC1mZS14eC1lbmFibGVDb2xsYWJvcmF0aW9uRHJhZnRcIikgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gKHRlbXBsYXRlSW50ZXJmYWNlPy5jb250ZXh0Py5nZXRNb2RlbCgpIHx8IG1ldGFPYmplY3QpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdFx0Y29uc3Qgb0VudGl0eUNvbnRhaW5lciA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFwiL1wiKTtcblx0XHRcdGZvciAoY29uc3Qgc0VudGl0eVNldCBpbiBvRW50aXR5Q29udGFpbmVyKSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRvRW50aXR5Q29udGFpbmVyW3NFbnRpdHlTZXRdLiRraW5kID09PSBcIkVudGl0eVNldFwiICYmXG5cdFx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke3NFbnRpdHlTZXR9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvU2hhcmVBY3Rpb25gKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHBhdGggb2YgdGhlIERyYWZ0Um9vdCBwYXRoIGFjY29yZGluZyB0byB0aGUgcHJvdmlkZWQgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldERyYWZ0Um9vdFBhdGhcblx0ICogQHBhcmFtIG9Db250ZXh0IE9kYXRhTW9kZWwgY29udGV4dFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBwYXRoIG9mIHRoZSBkcmFmdFJvb3QgZW50aXR5LCBvciB1bmRlZmluZWQgaWYgbm8gZHJhZnRSb290IGlzIGZvdW5kXG5cdCAqL1xuXHRnZXREcmFmdFJvb3RQYXRoOiBmdW5jdGlvbiAob0NvbnRleHQ6IENvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IGdldFJvb3RQYXRoID0gZnVuY3Rpb24gKHNQYXRoOiBzdHJpbmcsIG1vZGVsOiBPRGF0YU1vZGVsLCBmaXJzdEl0ZXJhdGlvbiA9IHRydWUpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdFx0Y29uc3Qgc0l0ZXJhdGlvblBhdGggPSBmaXJzdEl0ZXJhdGlvbiA/IHNQYXRoIDogbmV3IFJlZ0V4cCgvLiooPz1cXC8pLykuZXhlYyhzUGF0aCk/LlswXTsgLy8gKlJlZ2V4IHRvIGdldCB0aGUgYW5jZXN0b3Jcblx0XHRcdGlmIChzSXRlcmF0aW9uUGF0aCAmJiBzSXRlcmF0aW9uUGF0aCAhPT0gXCIvXCIpIHtcblx0XHRcdFx0Y29uc3Qgc0VudGl0eVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNJdGVyYXRpb25QYXRoKTtcblx0XHRcdFx0Y29uc3QgbURhdGFNb2RlbCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob01ldGFNb2RlbC5nZXRDb250ZXh0KHNFbnRpdHlQYXRoKSk7XG5cdFx0XHRcdGlmICgobURhdGFNb2RlbC50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gc0l0ZXJhdGlvblBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGdldFJvb3RQYXRoKHNJdGVyYXRpb25QYXRoLCBtb2RlbCwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9O1xuXHRcdHJldHVybiBnZXRSb290UGF0aChvQ29udGV4dC5nZXRQYXRoKCksIG9Db250ZXh0LmdldE1vZGVsKCkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBwYXRoIG9mIHRoZSBTdGlja3lSb290IHBhdGggYWNjb3JkaW5nIHRvIHRoZSBwcm92aWRlZCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0U3RpY2t5Um9vdFBhdGhcblx0ICogQHBhcmFtIG9Db250ZXh0IE9kYXRhTW9kZWwgY29udGV4dFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBwYXRoIG9mIHRoZSBTdGlja3lSb290IGVudGl0eSwgb3IgdW5kZWZpbmVkIGlmIG5vIFN0aWNreVJvb3QgaXMgZm91bmRcblx0ICovXG5cdGdldFN0aWNreVJvb3RQYXRoOiBmdW5jdGlvbiAob0NvbnRleHQ6IENvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IGdldFJvb3RQYXRoID0gZnVuY3Rpb24gKHNQYXRoOiBzdHJpbmcsIG1vZGVsOiBPRGF0YU1vZGVsLCBmaXJzdEl0ZXJhdGlvbiA9IHRydWUpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdFx0Y29uc3Qgc0l0ZXJhdGlvblBhdGggPSBmaXJzdEl0ZXJhdGlvbiA/IHNQYXRoIDogbmV3IFJlZ0V4cCgvLiooPz1cXC8pLykuZXhlYyhzUGF0aCk/LlswXTsgLy8gKlJlZ2V4IHRvIGdldCB0aGUgYW5jZXN0b3Jcblx0XHRcdGlmIChzSXRlcmF0aW9uUGF0aCAmJiBzSXRlcmF0aW9uUGF0aCAhPT0gXCIvXCIpIHtcblx0XHRcdFx0Y29uc3Qgc0VudGl0eVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNJdGVyYXRpb25QYXRoKTtcblx0XHRcdFx0Y29uc3QgbURhdGFNb2RlbCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob01ldGFNb2RlbC5nZXRDb250ZXh0KHNFbnRpdHlQYXRoKSk7XG5cdFx0XHRcdGlmICgobURhdGFNb2RlbC50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gc0l0ZXJhdGlvblBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGdldFJvb3RQYXRoKHNJdGVyYXRpb25QYXRoLCBtb2RlbCwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9O1xuXHRcdHJldHVybiBnZXRSb290UGF0aChvQ29udGV4dC5nZXRQYXRoKCksIG9Db250ZXh0LmdldE1vZGVsKCkpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgcGF0aCB0byB0aGUgdGFyZ2V0IGVudGl0eSBzZXQgdmlhIG5hdmlnYXRpb24gcHJvcGVydHkgYmluZGluZy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFRhcmdldEVudGl0eVNldFxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIHRhcmdldCBlbnRpdHkgc2V0IHdpbGwgYmUgZGV0ZXJtaW5lZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBwYXRoIHRvIHRoZSB0YXJnZXQgZW50aXR5IHNldFxuXHQgKi9cblx0Z2V0VGFyZ2V0RW50aXR5U2V0OiBmdW5jdGlvbiAob0NvbnRleHQ6IEJhc2VDb250ZXh0KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0aWYgKFxuXHRcdFx0b0NvbnRleHQuZ2V0T2JqZWN0KFwiJGtpbmRcIikgPT09IFwiRW50aXR5U2V0XCIgfHxcblx0XHRcdG9Db250ZXh0LmdldE9iamVjdChcIiRraW5kXCIpID09PSBcIkFjdGlvblwiIHx8XG5cdFx0XHRvQ29udGV4dC5nZXRPYmplY3QoXCIwLyRraW5kXCIpID09PSBcIkFjdGlvblwiXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gc1BhdGg7XG5cdFx0fVxuXHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzUGF0aCk7XG5cdFx0cmV0dXJuIGAvJHtvQ29udGV4dC5nZXRPYmplY3Qoc0VudGl0eVNldFBhdGgpfWA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgY29tcGxldGUgcGF0aCB0byB0aGUgZW50aXR5IHNldCB2aWEgdXNpbmcgbmF2aWdhdGlvbiBwcm9wZXJ0eSBiaW5kaW5nLiBOb3RlOiBUbyBiZSB1c2VkIG9ubHkgYWZ0ZXIgdGhlIG1ldGFtb2RlbCBoYXMgbG9hZGVkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RW50aXR5U2V0UGF0aFxuXHQgKiBAcGFyYW0gcGF0aCBQYXRoIGZvciB3aGljaCBjb21wbGV0ZSBlbnRpdHlTZXQgcGF0aCBuZWVkcyB0byBiZSBkZXRlcm1pbmVkIGZyb20gZW50aXR5VHlwZSBwYXRoXG5cdCAqIEBwYXJhbSBvZGF0YU1ldGFNb2RlbCBNZXRhbW9kZWwgdG8gYmUgdXNlZC4oT3B0aW9uYWwgaW4gbm9ybWFsIHNjZW5hcmlvcywgYnV0IG5lZWRlZCBmb3IgcGFyYW1ldGVyaXplZCBzZXJ2aWNlIHNjZW5hcmlvcylcblx0ICogQHJldHVybnMgUmV0dXJucyBjb21wbGV0ZSBwYXRoIHRvIHRoZSBlbnRpdHkgc2V0XG5cdCAqL1xuXHRnZXRFbnRpdHlTZXRQYXRoOiBmdW5jdGlvbiAocGF0aDogc3RyaW5nLCBvZGF0YU1ldGFNb2RlbD86IE9EYXRhTWV0YU1vZGVsKSB7XG5cdFx0bGV0IGVudGl0eVNldFBhdGg6IHN0cmluZyA9IFwiXCI7XG5cdFx0aWYgKCFvZGF0YU1ldGFNb2RlbCkge1xuXHRcdFx0Ly8gUHJldmlvdXMgaW1wbGVtZW50YXRpb24gZm9yIGdldHRpbmcgZW50aXR5U2V0UGF0aCBmcm9tIGVudGl0eVR5cGVQYXRoXG5cdFx0XHRlbnRpdHlTZXRQYXRoID0gYC8ke3BhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZykuam9pbihcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy9cIil9YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQ2FsY3VsYXRpbmcgdGhlIGVudGl0eVNldFBhdGggZnJvbSBNZXRhTW9kZWwuXG5cdFx0XHRjb25zdCBwYXRoUGFydHMgPSBwYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpO1xuXHRcdFx0aWYgKHBhdGhQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGNvbnN0IGluaXRpYWxQYXRoT2JqZWN0ID0ge1xuXHRcdFx0XHRcdGdyb3dpbmdQYXRoOiBcIi9cIixcblx0XHRcdFx0XHRwZW5kaW5nTmF2UHJvcEJpbmRpbmc6IFwiXCJcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjb25zdCBwYXRoT2JqZWN0ID0gcGF0aFBhcnRzLnJlZHVjZSgocGF0aFVuZGVyQ29uc3RydWN0aW9uOiBhbnksIHBhdGhQYXJ0OiBzdHJpbmcsIGlkeDogbnVtYmVyKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgZGVsaW1pdGVyID0gKCEhaWR4ICYmIFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nL1wiKSB8fCBcIlwiO1xuXHRcdFx0XHRcdGxldCB7IGdyb3dpbmdQYXRoLCBwZW5kaW5nTmF2UHJvcEJpbmRpbmcgfSA9IHBhdGhVbmRlckNvbnN0cnVjdGlvbjtcblx0XHRcdFx0XHRjb25zdCB0ZW1wUGF0aCA9IGdyb3dpbmdQYXRoICsgZGVsaW1pdGVyO1xuXHRcdFx0XHRcdGNvbnN0IG5hdlByb3BCaW5kaW5ncyA9IG9kYXRhTWV0YU1vZGVsLmdldE9iamVjdCh0ZW1wUGF0aCk7XG5cdFx0XHRcdFx0Y29uc3QgbmF2UHJvcEJpbmRpbmdUb0NoZWNrID0gcGVuZGluZ05hdlByb3BCaW5kaW5nID8gYCR7cGVuZGluZ05hdlByb3BCaW5kaW5nfS8ke3BhdGhQYXJ0fWAgOiBwYXRoUGFydDtcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRuYXZQcm9wQmluZGluZ3MgJiZcblx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKG5hdlByb3BCaW5kaW5ncykubGVuZ3RoID4gMCAmJlxuXHRcdFx0XHRcdFx0bmF2UHJvcEJpbmRpbmdzLmhhc093blByb3BlcnR5KG5hdlByb3BCaW5kaW5nVG9DaGVjaylcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdGdyb3dpbmdQYXRoID0gdGVtcFBhdGggKyBuYXZQcm9wQmluZGluZ1RvQ2hlY2sucmVwbGFjZShcIi9cIiwgXCIlMkZcIik7XG5cdFx0XHRcdFx0XHRwZW5kaW5nTmF2UHJvcEJpbmRpbmcgPSBcIlwiO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwZW5kaW5nTmF2UHJvcEJpbmRpbmcgKz0gcGVuZGluZ05hdlByb3BCaW5kaW5nID8gYC8ke3BhdGhQYXJ0fWAgOiBwYXRoUGFydDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHsgZ3Jvd2luZ1BhdGgsIHBlbmRpbmdOYXZQcm9wQmluZGluZyB9O1xuXHRcdFx0XHR9LCBpbml0aWFsUGF0aE9iamVjdCBhcyBhbnkpO1xuXG5cdFx0XHRcdGVudGl0eVNldFBhdGggPSBwYXRoT2JqZWN0Lmdyb3dpbmdQYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZW50aXR5U2V0UGF0aCA9IGAvJHtwYXRoUGFydHNbMF19YDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZW50aXR5U2V0UGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogR2V0cyB0aGUgcGF0aCBmb3IgdGhlIGl0ZW1zIHByb3BlcnR5IG9mIE11bHRpVmFsdWVGaWVsZCBwYXJhbWV0ZXJzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0QWN0aW9uUGFyYW1ldGVySXRlbXNNb2RlbFBhdGhcblx0ICogQHBhcmFtIG9QYXJhbWV0ZXIgQWN0aW9uIFBhcmFtZXRlclxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBjb21wbGV0ZSBtb2RlbCBwYXRoIGZvciB0aGUgaXRlbXMgcHJvcGVydHkgb2YgTXVsdGlWYWx1ZUZpZWxkIHBhcmFtZXRlcnNcblx0ICovXG5cdGdldEFjdGlvblBhcmFtZXRlckl0ZW1zTW9kZWxQYXRoOiBmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0cmV0dXJuIG9QYXJhbWV0ZXIgJiYgb1BhcmFtZXRlci4kTmFtZSA/IGB7cGF0aDogJ212ZnZpZXc+LyR7b1BhcmFtZXRlci4kTmFtZX0nfWAgOiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0ZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmc6IGZ1bmN0aW9uIChzUGF0aFBhcnQ6IGFueSkge1xuXHRcdHJldHVybiBzUGF0aFBhcnQgIT09IFwiXCIgJiYgc1BhdGhQYXJ0ICE9PSBcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCI7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZHMgYSBzZXRQcm9wZXJ0eSB0byB0aGUgY3JlYXRlZCBiaW5kaW5nIGNvbnRleHRzIG9mIHRoZSBpbnRlcm5hbCBKU09OIG1vZGVsLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZW5oYW5jZUludGVybmFsSlNPTk1vZGVsXG5cdCAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLmpzb24uSlNPTk1vZGVsfSBJbnRlcm5hbCBKU09OIE1vZGVsIHdoaWNoIGlzIGVuaGFuY2VkXG5cdCAqL1xuXG5cdGVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbDogZnVuY3Rpb24gKG9JbnRlcm5hbE1vZGVsOiBhbnkpIHtcblx0XHRjb25zdCBmbkJpbmRDb250ZXh0ID0gb0ludGVybmFsTW9kZWwuYmluZENvbnRleHQ7XG5cdFx0b0ludGVybmFsTW9kZWwuYmluZENvbnRleHQgPSBmdW5jdGlvbiAoc1BhdGg6IGFueSwgb0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM6IGFueSwgLi4uYXJnczogYW55W10pIHtcblx0XHRcdG9Db250ZXh0ID0gZm5CaW5kQ29udGV4dC5hcHBseSh0aGlzLCBbc1BhdGgsIG9Db250ZXh0LCBtUGFyYW1ldGVycywgLi4uYXJnc10pO1xuXHRcdFx0Y29uc3QgZm5HZXRCb3VuZENvbnRleHQgPSBvQ29udGV4dC5nZXRCb3VuZENvbnRleHQ7XG5cblx0XHRcdG9Db250ZXh0LmdldEJvdW5kQ29udGV4dCA9IGZ1bmN0aW9uICguLi5zdWJBcmdzOiBhbnlbXSkge1xuXHRcdFx0XHRjb25zdCBvQm91bmRDb250ZXh0ID0gZm5HZXRCb3VuZENvbnRleHQuYXBwbHkodGhpcywgLi4uc3ViQXJncyk7XG5cdFx0XHRcdGlmIChvQm91bmRDb250ZXh0ICYmICFvQm91bmRDb250ZXh0LnNldFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0b0JvdW5kQ29udGV4dC5zZXRQcm9wZXJ0eSA9IGZ1bmN0aW9uIChzU2V0UHJvcFBhdGg6IGFueSwgdmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuZ2V0T2JqZWN0KCkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHQvLyBpbml0aWFsaXplXG5cdFx0XHRcdFx0XHRcdHRoaXMuZ2V0TW9kZWwoKS5zZXRQcm9wZXJ0eSh0aGlzLmdldFBhdGgoKSwge30pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGhpcy5nZXRNb2RlbCgpLnNldFByb3BlcnR5KHNTZXRQcm9wUGF0aCwgdmFsdWUsIHRoaXMpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG9Cb3VuZENvbnRleHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIG9Db250ZXh0O1xuXHRcdH07XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZHMgYW4gaGFuZGxlciBvbiBwcm9wZXJ0eUNoYW5nZS5cblx0ICogVGhlIHByb3BlcnR5IFwiL2VkaXRNb2RlXCIgaXMgY2hhbmdlZCBhY2NvcmRpbmcgdG8gcHJvcGVydHkgJy9pc0VkaXRhYmxlJyB3aGVuIHRoaXMgbGFzdCBvbmUgaXMgc2V0XG5cdCAqIGluIG9yZGVyIHRvIGJlIGNvbXBsaWFudCB3aXRoIGZvcm1lciB2ZXJzaW9ucyB3aGVyZSBidWlsZGluZyBibG9ja3MgdXNlIHRoZSBwcm9wZXJ0eSBcIi9lZGl0TW9kZVwiXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBlbmhhbmNlVWlKU09OTW9kZWxcblx0ICogQHBhcmFtIHtzYXAudWkubW9kZWwuanNvbi5KU09OTW9kZWx9IHVpTW9kZWwgSlNPTiBNb2RlbCB3aGljaCBpcyBlbmhhbmNlZFxuXHQgKiBAcGFyYW0ge29iamVjdH0gbGlicmFyeSBDb3JlIGxpYnJhcnkgb2YgU0FQIEZpb3JpIGVsZW1lbnRzXG5cdCAqL1xuXG5cdGVuaGFuY2VVaUpTT05Nb2RlbDogZnVuY3Rpb24gKHVpTW9kZWw6IEpTT05Nb2RlbCwgbGlicmFyeTogYW55KSB7XG5cdFx0Y29uc3QgZm5TZXRQcm9wZXJ0eSA9IHVpTW9kZWwuc2V0UHJvcGVydHkgYXMgYW55O1xuXHRcdHVpTW9kZWwuc2V0UHJvcGVydHkgPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcblx0XHRcdGNvbnN0IHZhbHVlID0gYXJnc1sxXTtcblx0XHRcdGlmIChhcmdzWzBdID09PSBcIi9pc0VkaXRhYmxlXCIpIHtcblx0XHRcdFx0dWlNb2RlbC5zZXRQcm9wZXJ0eShcIi9lZGl0TW9kZVwiLCB2YWx1ZSA/IGxpYnJhcnkuRWRpdE1vZGUuRWRpdGFibGUgOiBsaWJyYXJ5LkVkaXRNb2RlLkRpc3BsYXksIGFyZ3NbMl0sIGFyZ3NbM10pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZuU2V0UHJvcGVydHkuYXBwbHkodGhpcywgWy4uLmFyZ3NdKTtcblx0XHR9O1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB3aGV0aGVyIGZpbHRlcmluZyBvbiB0aGUgdGFibGUgaXMgY2FzZSBzZW5zaXRpdmUuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBpbnN0YW5jZSBvZiB0aGUgbWV0YSBtb2RlbFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zICdmYWxzZScgaWYgRmlsdGVyRnVuY3Rpb25zIGFubm90YXRpb24gc3VwcG9ydHMgJ3RvbG93ZXInLCBlbHNlICd0cnVlJ1xuXHQgKi9cblx0aXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlOiBmdW5jdGlvbiAob01ldGFNb2RlbDogYW55KSB7XG5cdFx0aWYgKCFvTWV0YU1vZGVsKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRjb25zdCBhRmlsdGVyRnVuY3Rpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3QoXCIvQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyRnVuY3Rpb25zXCIpO1xuXHRcdC8vIEdldCBmaWx0ZXIgZnVuY3Rpb25zIGRlZmluZWQgYXQgRW50aXR5Q29udGFpbmVyIGFuZCBjaGVjayBmb3IgZXhpc3RlbmNlIG9mICd0b2xvd2VyJ1xuXHRcdHJldHVybiBhRmlsdGVyRnVuY3Rpb25zID8gYUZpbHRlckZ1bmN0aW9ucy5pbmRleE9mKFwidG9sb3dlclwiKSA9PT0gLTEgOiB0cnVlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgTWV0YVBhdGggZm9yIHRoZSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCB0byBiZSB1c2VkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdGhlIG1ldGFwYXRoIGZvciB0aGUgY29udGV4dC5cblx0ICovXG5cdGdldE1ldGFQYXRoRm9yQ29udGV4dDogZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdHNQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdHJldHVybiBvTWV0YU1vZGVsICYmIHNQYXRoICYmIG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgTWV0YVBhdGggZm9yIHRoZSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dFBhdGggTWV0YVBhdGggdG8gYmUgdXNlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSByb290IGVudGl0eSBzZXQgcGF0aC5cblx0ICovXG5cdGdldFJvb3RFbnRpdHlTZXRQYXRoOiBmdW5jdGlvbiAoY29udGV4dFBhdGg6IHN0cmluZykge1xuXHRcdGxldCByb290RW50aXR5U2V0UGF0aCA9IFwiXCI7XG5cdFx0Y29uc3QgYVBhdGhzID0gY29udGV4dFBhdGggPyBjb250ZXh0UGF0aC5zcGxpdChcIi9cIikgOiBbXTtcblx0XHRpZiAoYVBhdGhzLmxlbmd0aCA+IDEpIHtcblx0XHRcdHJvb3RFbnRpdHlTZXRQYXRoID0gYVBhdGhzWzFdO1xuXHRcdH1cblx0XHRyZXR1cm4gcm9vdEVudGl0eVNldFBhdGg7XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXQgTWV0YVBhdGggZm9yIHRoZSBsaXN0QmluZGluZy5cblx0ICpcblx0ICogQHBhcmFtIG9WaWV3IFZpZXcgb2YgdGhlIGNvbnRyb2wgdXNpbmcgbGlzdEJpbmRpbmdcblx0ICogQHBhcmFtIHZMaXN0QmluZGluZyBPRGF0YUxpc3RCaW5kaW5nIG9iamVjdCBvciB0aGUgYmluZGluZyBwYXRoIGZvciBhIHRlbXBvcmFyeSBsaXN0IGJpbmRpbmdcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgbWV0YXBhdGggZm9yIHRoZSBsaXN0YmluZGluZy5cblx0ICovXG5cdGdldEFic29sdXRlTWV0YVBhdGhGb3JMaXN0QmluZGluZzogZnVuY3Rpb24gKG9WaWV3OiBWaWV3LCB2TGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcgfCBzdHJpbmcpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRsZXQgc01ldGFQYXRoO1xuXG5cdFx0aWYgKHR5cGVvZiB2TGlzdEJpbmRpbmcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh2TGlzdEJpbmRpbmcuc3RhcnRzV2l0aChcIi9cIikpIHtcblx0XHRcdFx0Ly8gYWJzb2x1dGUgcGF0aFxuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHZMaXN0QmluZGluZyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyByZWxhdGl2ZSBwYXRoXG5cdFx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRcdGNvbnN0IHNSb290Q29udGV4dFBhdGggPSBvQmluZGluZ0NvbnRleHQhLmdldFBhdGgoKTtcblx0XHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChgJHtzUm9vdENvbnRleHRQYXRofS8ke3ZMaXN0QmluZGluZ31gKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gd2UgYWxyZWFkeSBnZXQgYSBsaXN0IGJpbmRpbmcgdXNlIHRoaXMgb25lXG5cdFx0XHRjb25zdCBvQmluZGluZyA9IHZMaXN0QmluZGluZztcblx0XHRcdGNvbnN0IG9Sb290QmluZGluZyA9IG9CaW5kaW5nLmdldFJvb3RCaW5kaW5nKCk7XG5cdFx0XHRpZiAob0JpbmRpbmcgPT09IG9Sb290QmluZGluZykge1xuXHRcdFx0XHQvLyBhYnNvbHV0ZSBwYXRoXG5cdFx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0JpbmRpbmcuZ2V0UGF0aCgpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIHJlbGF0aXZlIHBhdGhcblx0XHRcdFx0Y29uc3Qgc1Jvb3RCaW5kaW5nUGF0aCA9IG9Sb290QmluZGluZyEuZ2V0UGF0aCgpO1xuXHRcdFx0XHRjb25zdCBzUmVsYXRpdmVQYXRoID0gb0JpbmRpbmcuZ2V0UGF0aCgpO1xuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKGAke3NSb290QmluZGluZ1BhdGh9LyR7c1JlbGF0aXZlUGF0aH1gKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNNZXRhUGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhIGRyYWZ0IHJvb3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0RyYWZ0Um9vdFxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhIGRyYWZ0IHJvb3Rcblx0ICovXG5cdGlzRHJhZnRSb290OiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5nZXREcmFmdFJvb3QoZW50aXR5U2V0KSAhPT0gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEgZHJhZnQgbm9kZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRHJhZnROb2RlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEgZHJhZnQgbm9kZVxuXHQgKi9cblx0aXNEcmFmdE5vZGU6IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmdldERyYWZ0Tm9kZShlbnRpdHlTZXQpICE9PSB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSBzdGlja3kgc2Vzc2lvbiByb290LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNTdGlja3lcblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHJldHVybnMgV2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSBzdGlja3kgc2Vzc2lvbiByb290XG5cdCAqL1xuXHRpc1N0aWNreTogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0U3RpY2t5U2Vzc2lvbihlbnRpdHlTZXQpICE9PSB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgZW50aXR5IGlzIHVwZGF0YWJsZSBvciBub3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc1VwZGF0ZUhpZGRlblxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBFbnRpdHlUeXBlXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgdXBkYXRhYmxlIGVsc2UgZmFsc2Vcblx0ICovXG5cdGlzVXBkYXRlSGlkZGVuOiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQsIGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxib29sZWFuPiB7XG5cdFx0aWYgKGlzRW50aXR5U2V0KGVudGl0eVNldCkpIHtcblx0XHRcdHJldHVybiAoZW50aXR5U2V0LmFubm90YXRpb25zLlVJPy5VcGRhdGVIaWRkZW4gPz9cblx0XHRcdFx0ZW50aXR5VHlwZT8uYW5ub3RhdGlvbnMuVUk/LlVwZGF0ZUhpZGRlbiA/P1xuXHRcdFx0XHRmYWxzZSkgYXMgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj47XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBAQ29tbW9uLkRyYWZ0Um9vdCBhbm5vdGF0aW9uIGlmIHRoZSBhcmd1bWVudCBpcyBhbiBFbnRpdHlTZXQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXREcmFmdFJvb3Rcblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHJldHVybnMgRHJhZnRSb290XG5cdCAqL1xuXHRnZXREcmFmdFJvb3Q6IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IERyYWZ0Um9vdCB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIGlzRW50aXR5U2V0KGVudGl0eVNldCkgPyBlbnRpdHlTZXQuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3QgOiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIEBDb21tb24uRHJhZnROb2RlIGFubm90YXRpb24gaWYgdGhlIGFyZ3VtZW50IGlzIGFuIEVudGl0eVNldC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldERyYWZ0Tm9kZVxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcmV0dXJucyBEcmFmdFJvb3Rcblx0ICovXG5cdGdldERyYWZ0Tm9kZTogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogRHJhZnROb2RlIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gaXNFbnRpdHlTZXQoZW50aXR5U2V0KSA/IGVudGl0eVNldC5hbm5vdGF0aW9ucy5Db21tb24/LkRyYWZ0Tm9kZSA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogSGVscGVyIG1ldGhvZCB0byBnZXQgc3RpY2t5IHNlc3Npb24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRTdGlja3lTZXNzaW9uXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFNlc3Npb24gU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFxuXHQgKi9cblx0Z2V0U3RpY2t5U2Vzc2lvbjogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIGlzRW50aXR5U2V0KGVudGl0eVNldCkgPyBlbnRpdHlTZXQuYW5ub3RhdGlvbnMuU2Vzc2lvbj8uU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgdmlzaWJpbGl0eSBzdGF0ZSBvZiBkZWxldGUgYnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RGVsZXRlSGlkZGVuXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlIEVudGl0eVR5cGVcblx0ICogQHJldHVybnMgVHJ1ZSBpZiBkZWxldGUgYnV0dG9uIGlzIGhpZGRlblxuXHQgKi9cblx0Z2V0RGVsZXRlSGlkZGVuOiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQsIGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBEZWxldGVIaWRkZW4gfCBCb29sZWFuIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoaXNFbnRpdHlTZXQoZW50aXR5U2V0KSkge1xuXHRcdFx0cmV0dXJuIGVudGl0eVNldC5hbm5vdGF0aW9ucy5VST8uRGVsZXRlSGlkZGVuID8/IGVudGl0eVR5cGUuYW5ub3RhdGlvbnMuVUk/LkRlbGV0ZUhpZGRlbjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IHR5cGUgSW50ZXJuYWxNb2RlbENvbnRleHQgPSB7IGdldE1vZGVsKCk6IEpTT05Nb2RlbCB9ICYgQmFzZUNvbnRleHQgJiB7XG5cdFx0c2V0UHJvcGVydHkoc1BhdGg6IHN0cmluZywgdlZhbHVlOiBhbnkpOiB2b2lkO1xuXHR9O1xuXG5leHBvcnQgZGVmYXVsdCBNb2RlbEhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBa0JBLE1BQU1BLFdBQVcsR0FBRztJQUNuQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHdCQUF3QixFQUFFLFVBQVVDLFNBQXlCLEVBQUU7TUFDOUQsTUFBTUMsZUFBZSxHQUFHRCxTQUFTLENBQUNFLFNBQVMsQ0FBQyxHQUFHLENBQUM7TUFDaEQsS0FBSyxNQUFNQyxhQUFhLElBQUlGLGVBQWUsRUFBRTtRQUM1QyxJQUNDQSxlQUFlLENBQUNFLGFBQWEsQ0FBQyxDQUFDQyxLQUFLLEtBQUssV0FBVyxJQUNwREosU0FBUyxDQUFDRSxTQUFTLENBQUUsSUFBR0MsYUFBYyx5REFBd0QsQ0FBQyxFQUM5RjtVQUNELE9BQU8sSUFBSTtRQUNaO01BQ0Q7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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