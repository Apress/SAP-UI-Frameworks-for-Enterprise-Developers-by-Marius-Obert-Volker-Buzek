/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/core/mvc/ControllerExtension", "../CommonUtils", "../helpers/ClassSupport"], function (Log, ControllerExtension, CommonUtils, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  const IMMEDIATE_REQUEST = "$$ImmediateRequest";
  let SideEffectsControllerExtension = (_dec = defineUI5Class("sap.fe.core.controllerextensions.SideEffects"), _dec2 = methodOverride(), _dec3 = publicExtension(), _dec4 = finalExtension(), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec9 = publicExtension(), _dec10 = finalExtension(), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = publicExtension(), _dec14 = finalExtension(), _dec15 = publicExtension(), _dec16 = finalExtension(), _dec17 = publicExtension(), _dec18 = finalExtension(), _dec19 = publicExtension(), _dec20 = finalExtension(), _dec21 = publicExtension(), _dec22 = finalExtension(), _dec23 = publicExtension(), _dec24 = finalExtension(), _dec25 = publicExtension(), _dec26 = finalExtension(), _dec27 = privateExtension(), _dec28 = finalExtension(), _dec29 = publicExtension(), _dec30 = finalExtension(), _dec31 = privateExtension(), _dec32 = finalExtension(), _dec33 = privateExtension(), _dec34 = finalExtension(), _dec35 = privateExtension(), _dec36 = finalExtension(), _dec37 = publicExtension(), _dec38 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(SideEffectsControllerExtension, _ControllerExtension);
    function SideEffectsControllerExtension() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = SideEffectsControllerExtension.prototype;
    _proto.onInit = function onInit() {
      this._view = this.base.getView();
      this._sideEffectsService = CommonUtils.getAppComponent(this._view).getSideEffectsService();
      this._registeredFieldGroupMap = {};
      this._fieldGroupInvalidity = {};
      this._registeredFailedSideEffects = {};
    }

    /**
     * Adds a SideEffects control.
     *
     * @function
     * @name addControlSideEffects
     * @param entityType Name of the entity where the SideEffects control will be registered
     * @param controlSideEffects SideEffects to register. Ensure the sourceControlId matches the associated SAPUI5 control ID.
     */;
    _proto.addControlSideEffects = function addControlSideEffects(entityType, controlSideEffects) {
      this._sideEffectsService.addControlSideEffects(entityType, controlSideEffects);
    }

    /**
     * Removes SideEffects created by a control.
     *
     * @function
     * @name removeControlSideEffects
     * @param control SAPUI5 Control
     */;
    _proto.removeControlSideEffects = function removeControlSideEffects(control) {
      var _control$isA;
      const controlId = ((_control$isA = control.isA) === null || _control$isA === void 0 ? void 0 : _control$isA.call(control, "sap.ui.base.ManagedObject")) && control.getId();
      if (controlId) {
        this._sideEffectsService.removeControlSideEffects(controlId);
      }
    }

    /**
     * Gets the appropriate context on which SideEffects can be requested.
     * The correct one must have the binding parameter $$patchWithoutSideEffects.
     *
     * @function
     * @name getContextForSideEffects
     * @param bindingContext Initial binding context
     * @param sideEffectEntityType EntityType of the sideEffects
     * @returns SAPUI5 Context or undefined
     */;
    _proto.getContextForSideEffects = function getContextForSideEffects(bindingContext, sideEffectEntityType) {
      let contextForSideEffects = bindingContext,
        entityType = this._sideEffectsService.getEntityTypeFromContext(bindingContext);
      if (sideEffectEntityType !== entityType) {
        contextForSideEffects = bindingContext.getBinding().getContext();
        if (contextForSideEffects) {
          entityType = this._sideEffectsService.getEntityTypeFromContext(contextForSideEffects);
          if (sideEffectEntityType !== entityType) {
            contextForSideEffects = contextForSideEffects.getBinding().getContext();
            if (contextForSideEffects) {
              entityType = this._sideEffectsService.getEntityTypeFromContext(contextForSideEffects);
              if (sideEffectEntityType !== entityType) {
                return undefined;
              }
            }
          }
        }
      }
      return contextForSideEffects || undefined;
    }

    /**
     * Gets the SideEffects map for a field
     * These SideEffects are
     * - listed into FieldGroupIds (coming from an OData Service)
     * - generated by a control or controls and that configure this field as SourceProperties.
     *
     * @function
     * @name getFieldSideEffectsMap
     * @param field Field control
     * @returns SideEffects map
     */;
    _proto.getFieldSideEffectsMap = function getFieldSideEffectsMap(field) {
      let sideEffectsMap = {};
      const fieldGroupIds = field.getFieldGroupIds(),
        viewEntitySetSetName = this._view.getViewData().entitySet,
        viewEntitySet = this._sideEffectsService.getConvertedMetaModel().entitySets.find(entitySet => {
          return entitySet.name === viewEntitySetSetName;
        });

      // SideEffects coming from an OData Service
      sideEffectsMap = this.getSideEffectsMapForFieldGroups(fieldGroupIds, field.getBindingContext());

      // SideEffects coming from control(s)
      if (viewEntitySetSetName && viewEntitySet) {
        const viewEntityType = viewEntitySet.entityType.fullyQualifiedName,
          fieldPath = this.getTargetProperty(field),
          context = this.getContextForSideEffects(field.getBindingContext(), viewEntityType);
        if (fieldPath && context) {
          const controlSideEffectsEntityType = this._sideEffectsService.getControlEntitySideEffects(viewEntityType);
          Object.keys(controlSideEffectsEntityType).forEach(sideEffectsName => {
            const oControlSideEffects = controlSideEffectsEntityType[sideEffectsName];
            if (oControlSideEffects.sourceProperties.includes(fieldPath)) {
              const name = `${sideEffectsName}::${viewEntityType}`;
              sideEffectsMap[name] = {
                name: name,
                immediate: true,
                sideEffects: oControlSideEffects,
                context: context
              };
            }
          });
        }
      }
      return sideEffectsMap;
    }

    /**
     * Gets the sideEffects map for fieldGroups.
     *
     * @function
     * @name getSideEffectsMapForFieldGroups
     * @param fieldGroupIds Field group ids
     * @param fieldContext Field binding context
     * @returns SideEffects map
     */;
    _proto.getSideEffectsMapForFieldGroups = function getSideEffectsMapForFieldGroups(fieldGroupIds, fieldContext) {
      const mSideEffectsMap = {};
      fieldGroupIds.forEach(fieldGroupId => {
        const {
          name,
          immediate,
          sideEffects,
          sideEffectEntityType
        } = this._getSideEffectsPropertyForFieldGroup(fieldGroupId);
        const oContext = fieldContext ? this.getContextForSideEffects(fieldContext, sideEffectEntityType) : undefined;
        if (sideEffects && (!fieldContext || fieldContext && oContext)) {
          mSideEffectsMap[name] = {
            name,
            immediate,
            sideEffects
          };
          if (fieldContext) {
            mSideEffectsMap[name].context = oContext;
          }
        }
      });
      return mSideEffectsMap;
    }

    /**
     * Clear recorded validation status for all properties.
     *
     * @function
     * @name clearFieldGroupsValidity
     */;
    _proto.clearFieldGroupsValidity = function clearFieldGroupsValidity() {
      this._fieldGroupInvalidity = {};
    }

    /**
     * Clear recorded validation status for all properties.
     *
     * @function
     * @name isFieldGroupValid
     * @param fieldGroupId Field group id
     * @param context Context
     * @returns SAPUI5 Context or undefined
     */;
    _proto.isFieldGroupValid = function isFieldGroupValid(fieldGroupId, context) {
      const id = this._getFieldGroupIndex(fieldGroupId, context);
      return Object.keys(this._fieldGroupInvalidity[id] ?? {}).length === 0;
    }

    /**
     * Gets the relative target property related to the Field.
     *
     * @function
     * @name getTargetProperty
     * @param field Field control
     * @returns Relative target property
     */;
    _proto.getTargetProperty = function getTargetProperty(field) {
      var _this$_view$getBindin;
      const fieldPath = field.data("sourcePath");
      const metaModel = this._view.getModel().getMetaModel();
      const viewBindingPath = (_this$_view$getBindin = this._view.getBindingContext()) === null || _this$_view$getBindin === void 0 ? void 0 : _this$_view$getBindin.getPath();
      const viewMetaModelPath = viewBindingPath ? `${metaModel.getMetaPath(viewBindingPath)}/` : "";
      return fieldPath === null || fieldPath === void 0 ? void 0 : fieldPath.replace(viewMetaModelPath, "");
    }

    /**
     * Manages the workflow for SideEffects with related changes to a field
     * The following scenarios are managed:
     *  - Execute: triggers immediate SideEffects requests if the promise for the field event is fulfilled
     *  - Register: caches deferred SideEffects that will be executed when the FieldGroup is unfocused.
     *
     * @function
     * @name handleFieldChange
     * @param event SAPUI5 event that comes from a field change
     * @param fieldValidity
     * @param fieldGroupPreRequisite Promise to be fulfilled before executing deferred SideEffects
     * @returns  Promise on SideEffects request(s)
     */;
    _proto.handleFieldChange = async function handleFieldChange(event, fieldValidity, fieldGroupPreRequisite) {
      const field = event.getSource();
      this._saveFieldPropertiesStatus(field, fieldValidity);
      if (!fieldValidity) {
        return;
      }
      try {
        await (event.getParameter("promise") ?? Promise.resolve());
      } catch (e) {
        Log.debug("Prerequisites on Field for the SideEffects have been rejected", e);
        return;
      }
      return this._manageSideEffectsFromField(field, fieldGroupPreRequisite ?? Promise.resolve());
    }

    /**
     * Manages SideEffects with a related 'focus out' to a field group.
     *
     * @function
     * @name handleFieldGroupChange
     * @param event SAPUI5 Event
     * @returns Promise returning true if the SideEffects have been successfully executed
     */;
    _proto.handleFieldGroupChange = function handleFieldGroupChange(event) {
      const field = event.getSource(),
        fieldGroupIds = event.getParameter("fieldGroupIds"),
        fieldGroupsSideEffects = fieldGroupIds.reduce((results, fieldGroupId) => {
          return results.concat(this.getRegisteredSideEffectsForFieldGroup(fieldGroupId));
        }, []);
      return Promise.all(fieldGroupsSideEffects.map(fieldGroupSideEffects => {
        return this._requestFieldGroupSideEffects(fieldGroupSideEffects);
      })).catch(error => {
        var _field$getBindingCont;
        const contextPath = (_field$getBindingCont = field.getBindingContext()) === null || _field$getBindingCont === void 0 ? void 0 : _field$getBindingCont.getPath();
        Log.debug(`Error while processing FieldGroup SideEffects on context ${contextPath}`, error);
      });
    }

    /**
     * Request SideEffects on a specific context.
     *
     * @function
     * @name requestSideEffects
     * @param sideEffects SideEffects to be executed
     * @param context Context where SideEffects need to be executed
     * @param groupId
     * @param fnGetTargets The callback function which will give us the targets and actions if it was coming through some specific handling.
     * @returns SideEffects request on SAPUI5 context
     */;
    _proto.requestSideEffects = async function requestSideEffects(sideEffects, context, groupId, fnGetTargets) {
      let targets, triggerAction;
      if (fnGetTargets) {
        const targetsAndActionData = await fnGetTargets(sideEffects);
        targets = targetsAndActionData["aTargets"];
        triggerAction = targetsAndActionData["TriggerAction"];
      } else {
        targets = [...(sideEffects.targetEntities ?? []), ...(sideEffects.targetProperties ?? [])];
        triggerAction = sideEffects.triggerAction;
      }
      if (triggerAction) {
        this._sideEffectsService.executeAction(triggerAction, context, groupId);
      }
      if (targets.length) {
        return this._sideEffectsService.requestSideEffects(targets, context, groupId).catch(error => {
          this.registerFailedSideEffects(sideEffects, context);
          throw error;
        });
      }
    }

    /**
     * Gets failed SideEffects.
     *
     * @function
     * @name getRegisteredFailedRequests
     * @returns Registered SideEffects requests that have failed
     */;
    _proto.getRegisteredFailedRequests = function getRegisteredFailedRequests() {
      return this._registeredFailedSideEffects;
    }

    /**
     * Adds SideEffects to the queue of the failed SideEffects
     * The SideEffects are retriggered on the next change on the same context.
     *
     * @function
     * @name registerFailedSideEffects
     * @param sideEffects SideEffects that need to be retriggered
     * @param context Context where SideEffects have failed
     */;
    _proto.registerFailedSideEffects = function registerFailedSideEffects(sideEffects, context) {
      const contextPath = context.getPath();
      this._registeredFailedSideEffects[contextPath] = this._registeredFailedSideEffects[contextPath] ?? [];
      const isNotAlreadyListed = this._registeredFailedSideEffects[contextPath].every(mFailedSideEffects => sideEffects.fullyQualifiedName !== mFailedSideEffects.fullyQualifiedName);
      if (isNotAlreadyListed) {
        this._registeredFailedSideEffects[contextPath].push(sideEffects);
      }
    }

    /**
     * Deletes SideEffects to the queue of the failed SideEffects for a context.
     *
     * @function
     * @name unregisterFailedSideEffectsForAContext
     * @param contextPath Context path where SideEffects have failed
     */;
    _proto.unregisterFailedSideEffectsForAContext = function unregisterFailedSideEffectsForAContext(contextPath) {
      delete this._registeredFailedSideEffects[contextPath];
    }

    /**
     * Deletes SideEffects to the queue of the failed SideEffects.
     *
     * @function
     * @name unregisterFailedSideEffects
     * @param sideEffectsFullyQualifiedName SideEffects that need to be retriggered
     * @param context Context where SideEffects have failed
     */;
    _proto.unregisterFailedSideEffects = function unregisterFailedSideEffects(sideEffectsFullyQualifiedName, context) {
      var _this$_registeredFail;
      const contextPath = context.getPath();
      if ((_this$_registeredFail = this._registeredFailedSideEffects[contextPath]) !== null && _this$_registeredFail !== void 0 && _this$_registeredFail.length) {
        this._registeredFailedSideEffects[contextPath] = this._registeredFailedSideEffects[contextPath].filter(sideEffects => sideEffects.fullyQualifiedName !== sideEffectsFullyQualifiedName);
      }
    }

    /**
     * Adds SideEffects to the queue of a FieldGroup
     * The SideEffects are triggered when event related to the field group change is fired.
     *
     * @function
     * @name registerFieldGroupSideEffects
     * @param sideEffectsProperties SideEffects properties
     * @param fieldGroupPreRequisite Promise to fullfil before executing the SideEffects
     */;
    _proto.registerFieldGroupSideEffects = function registerFieldGroupSideEffects(sideEffectsProperties, fieldGroupPreRequisite) {
      const id = this._getFieldGroupIndex(sideEffectsProperties.name, sideEffectsProperties.context);
      if (!this._registeredFieldGroupMap[id]) {
        this._registeredFieldGroupMap[id] = {
          promise: fieldGroupPreRequisite ?? Promise.resolve(),
          sideEffectProperty: sideEffectsProperties
        };
      }
    }

    /**
     * Deletes SideEffects to the queue of a FieldGroup.
     *
     * @function
     * @name unregisterFieldGroupSideEffects
     * @param sideEffectsProperties SideEffects properties
     */;
    _proto.unregisterFieldGroupSideEffects = function unregisterFieldGroupSideEffects(sideEffectsProperties) {
      const {
        context,
        name
      } = sideEffectsProperties;
      const id = this._getFieldGroupIndex(name, context);
      delete this._registeredFieldGroupMap[id];
    }

    /**
     * Gets the registered SideEffects into the queue for a field group id.
     *
     * @function
     * @name getRegisteredSideEffectsForFieldGroup
     * @param fieldGroupId Field group id
     * @returns Array of registered SideEffects and their promise
     */;
    _proto.getRegisteredSideEffectsForFieldGroup = function getRegisteredSideEffectsForFieldGroup(fieldGroupId) {
      const sideEffects = [];
      for (const registryIndex of Object.keys(this._registeredFieldGroupMap)) {
        if (registryIndex.startsWith(`${fieldGroupId}_`)) {
          sideEffects.push(this._registeredFieldGroupMap[registryIndex]);
        }
      }
      return sideEffects;
    }

    /**
     * Gets a status index.
     *
     * @function
     * @name _getFieldGroupIndex
     * @param fieldGroupId The field group id
     * @param context SAPUI5 Context
     * @returns Index
     */;
    _proto._getFieldGroupIndex = function _getFieldGroupIndex(fieldGroupId, context) {
      return `${fieldGroupId}_${context.getPath()}`;
    }

    /**
     * Gets sideEffects properties from a field group id
     * The properties are:
     *  - name
     *  - sideEffects definition
     *  - sideEffects entity type
     *  - immediate sideEffects.
     *
     * @function
     * @name _getSideEffectsPropertyForFieldGroup
     * @param fieldGroupId
     * @returns SideEffects properties
     */;
    _proto._getSideEffectsPropertyForFieldGroup = function _getSideEffectsPropertyForFieldGroup(fieldGroupId) {
      var _this$_sideEffectsSer;
      /**
       * string "$$ImmediateRequest" is added to the SideEffects name during templating to know
       * if this SideEffects must be immediately executed requested (on field change) or must
       * be deferred (on field group focus out)
       *
       */
      const immediate = fieldGroupId.indexOf(IMMEDIATE_REQUEST) !== -1,
        name = fieldGroupId.replace(IMMEDIATE_REQUEST, ""),
        sideEffectParts = name.split("#"),
        sideEffectEntityType = sideEffectParts[0],
        sideEffectPath = `${sideEffectEntityType}@com.sap.vocabularies.Common.v1.SideEffects${sideEffectParts.length === 2 ? `#${sideEffectParts[1]}` : ""}`,
        sideEffects = (_this$_sideEffectsSer = this._sideEffectsService.getODataEntitySideEffects(sideEffectEntityType)) === null || _this$_sideEffectsSer === void 0 ? void 0 : _this$_sideEffectsSer[sideEffectPath];
      return {
        name,
        immediate,
        sideEffects,
        sideEffectEntityType
      };
    }

    /**
     * Manages the SideEffects for a field.
     *
     * @function
     * @name _manageSideEffectsFromField
     * @param field Field control
     * @param fieldGroupPreRequisite Promise to fullfil before executing deferred SideEffects
     * @returns Promise related to the requested immediate sideEffects and registered deferred SideEffects
     */;
    _proto._manageSideEffectsFromField = async function _manageSideEffectsFromField(field, fieldGroupPreRequisite) {
      const sideEffectsMap = this.getFieldSideEffectsMap(field);
      try {
        const failedSideEffectsPromises = [];
        const sideEffectsPromises = Object.keys(sideEffectsMap).map(sideEffectsName => {
          const sideEffectsProperties = sideEffectsMap[sideEffectsName];
          if (sideEffectsProperties.immediate === true) {
            // if this SideEffects is recorded as failed SideEffects, need to remove it.
            this.unregisterFailedSideEffects(sideEffectsProperties.sideEffects.fullyQualifiedName, sideEffectsProperties.context);
            return this.requestSideEffects(sideEffectsProperties.sideEffects, sideEffectsProperties.context);
          }
          return this.registerFieldGroupSideEffects(sideEffectsProperties, fieldGroupPreRequisite);
        });

        //Replay failed SideEffects related to the view or Field
        for (const context of [field.getBindingContext(), this._view.getBindingContext()]) {
          if (context) {
            const contextPath = context.getPath();
            const failedSideEffects = this._registeredFailedSideEffects[contextPath] ?? [];
            this.unregisterFailedSideEffectsForAContext(contextPath);
            for (const failedSideEffect of failedSideEffects) {
              failedSideEffectsPromises.push(this.requestSideEffects(failedSideEffect, context));
            }
          }
        }
        await Promise.all(sideEffectsPromises.concat(failedSideEffectsPromises));
      } catch (e) {
        Log.debug(`Error while managing Field SideEffects`, e);
      }
    }

    /**
     * Requests the SideEffects for a fieldGroup.
     *
     * @function
     * @name _requestFieldGroupSideEffects
     * @param fieldGroupSideEffects Field group sideEffects with its promise
     * @returns Promise returning true if the SideEffects have been successfully executed
     */;
    _proto._requestFieldGroupSideEffects = async function _requestFieldGroupSideEffects(fieldGroupSideEffects) {
      this.unregisterFieldGroupSideEffects(fieldGroupSideEffects.sideEffectProperty);
      try {
        await fieldGroupSideEffects.promise;
      } catch (e) {
        Log.debug(`Error while processing FieldGroup SideEffects`, e);
        return;
      }
      try {
        const {
          sideEffects,
          context,
          name
        } = fieldGroupSideEffects.sideEffectProperty;
        if (this.isFieldGroupValid(name, context)) {
          await this.requestSideEffects(sideEffects, context);
        }
      } catch (e) {
        Log.debug(`Error while executing FieldGroup SideEffects`, e);
      }
    }

    /**
     * Saves the validation status of properties related to a field control.
     *
     * @param field The field control
     * @param success Status of the field validation
     */;
    _proto._saveFieldPropertiesStatus = function _saveFieldPropertiesStatus(field, success) {
      const sideEffectsMap = this.getFieldSideEffectsMap(field);
      Object.keys(sideEffectsMap).forEach(key => {
        const {
          name,
          immediate,
          context
        } = sideEffectsMap[key];
        if (!immediate) {
          const id = this._getFieldGroupIndex(name, context);
          if (success) {
            var _this$_fieldGroupInva;
            (_this$_fieldGroupInva = this._fieldGroupInvalidity[id]) === null || _this$_fieldGroupInva === void 0 ? true : delete _this$_fieldGroupInva[field.getId()];
          } else {
            this._fieldGroupInvalidity[id] = {
              ...this._fieldGroupInvalidity[id],
              ...{
                [field.getId()]: true
              }
            };
          }
        }
      });
    };
    return SideEffectsControllerExtension;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "addControlSideEffects", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "addControlSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeControlSideEffects", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "removeControlSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getContextForSideEffects", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "getContextForSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getFieldSideEffectsMap", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "getFieldSideEffectsMap"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getSideEffectsMapForFieldGroups", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "getSideEffectsMapForFieldGroups"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "clearFieldGroupsValidity", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "clearFieldGroupsValidity"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isFieldGroupValid", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "isFieldGroupValid"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getTargetProperty", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "getTargetProperty"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFieldChange", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFieldChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFieldGroupChange", [_dec21, _dec22], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFieldGroupChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "requestSideEffects", [_dec23, _dec24], Object.getOwnPropertyDescriptor(_class2.prototype, "requestSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getRegisteredFailedRequests", [_dec25, _dec26], Object.getOwnPropertyDescriptor(_class2.prototype, "getRegisteredFailedRequests"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "registerFailedSideEffects", [_dec27, _dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "registerFailedSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "unregisterFailedSideEffectsForAContext", [_dec29, _dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "unregisterFailedSideEffectsForAContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "unregisterFailedSideEffects", [_dec31, _dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "unregisterFailedSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "registerFieldGroupSideEffects", [_dec33, _dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "registerFieldGroupSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "unregisterFieldGroupSideEffects", [_dec35, _dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "unregisterFieldGroupSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getRegisteredSideEffectsForFieldGroup", [_dec37, _dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "getRegisteredSideEffectsForFieldGroup"), _class2.prototype)), _class2)) || _class);
  return SideEffectsControllerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJTU1FRElBVEVfUkVRVUVTVCIsIlNpZGVFZmZlY3RzQ29udHJvbGxlckV4dGVuc2lvbiIsImRlZmluZVVJNUNsYXNzIiwibWV0aG9kT3ZlcnJpZGUiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsInByaXZhdGVFeHRlbnNpb24iLCJvbkluaXQiLCJfdmlldyIsImJhc2UiLCJnZXRWaWV3IiwiX3NpZGVFZmZlY3RzU2VydmljZSIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiX3JlZ2lzdGVyZWRGaWVsZEdyb3VwTWFwIiwiX2ZpZWxkR3JvdXBJbnZhbGlkaXR5IiwiX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0cyIsImFkZENvbnRyb2xTaWRlRWZmZWN0cyIsImVudGl0eVR5cGUiLCJjb250cm9sU2lkZUVmZmVjdHMiLCJyZW1vdmVDb250cm9sU2lkZUVmZmVjdHMiLCJjb250cm9sIiwiY29udHJvbElkIiwiaXNBIiwiZ2V0SWQiLCJnZXRDb250ZXh0Rm9yU2lkZUVmZmVjdHMiLCJiaW5kaW5nQ29udGV4dCIsInNpZGVFZmZlY3RFbnRpdHlUeXBlIiwiY29udGV4dEZvclNpZGVFZmZlY3RzIiwiZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0IiwiZ2V0QmluZGluZyIsImdldENvbnRleHQiLCJ1bmRlZmluZWQiLCJnZXRGaWVsZFNpZGVFZmZlY3RzTWFwIiwiZmllbGQiLCJzaWRlRWZmZWN0c01hcCIsImZpZWxkR3JvdXBJZHMiLCJnZXRGaWVsZEdyb3VwSWRzIiwidmlld0VudGl0eVNldFNldE5hbWUiLCJnZXRWaWV3RGF0YSIsImVudGl0eVNldCIsInZpZXdFbnRpdHlTZXQiLCJnZXRDb252ZXJ0ZWRNZXRhTW9kZWwiLCJlbnRpdHlTZXRzIiwiZmluZCIsIm5hbWUiLCJnZXRTaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBzIiwiZ2V0QmluZGluZ0NvbnRleHQiLCJ2aWV3RW50aXR5VHlwZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImZpZWxkUGF0aCIsImdldFRhcmdldFByb3BlcnR5IiwiY29udGV4dCIsImNvbnRyb2xTaWRlRWZmZWN0c0VudGl0eVR5cGUiLCJnZXRDb250cm9sRW50aXR5U2lkZUVmZmVjdHMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInNpZGVFZmZlY3RzTmFtZSIsIm9Db250cm9sU2lkZUVmZmVjdHMiLCJzb3VyY2VQcm9wZXJ0aWVzIiwiaW5jbHVkZXMiLCJpbW1lZGlhdGUiLCJzaWRlRWZmZWN0cyIsImZpZWxkQ29udGV4dCIsIm1TaWRlRWZmZWN0c01hcCIsImZpZWxkR3JvdXBJZCIsIl9nZXRTaWRlRWZmZWN0c1Byb3BlcnR5Rm9yRmllbGRHcm91cCIsIm9Db250ZXh0IiwiY2xlYXJGaWVsZEdyb3Vwc1ZhbGlkaXR5IiwiaXNGaWVsZEdyb3VwVmFsaWQiLCJpZCIsIl9nZXRGaWVsZEdyb3VwSW5kZXgiLCJsZW5ndGgiLCJkYXRhIiwibWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJ2aWV3QmluZGluZ1BhdGgiLCJnZXRQYXRoIiwidmlld01ldGFNb2RlbFBhdGgiLCJnZXRNZXRhUGF0aCIsInJlcGxhY2UiLCJoYW5kbGVGaWVsZENoYW5nZSIsImV2ZW50IiwiZmllbGRWYWxpZGl0eSIsImZpZWxkR3JvdXBQcmVSZXF1aXNpdGUiLCJnZXRTb3VyY2UiLCJfc2F2ZUZpZWxkUHJvcGVydGllc1N0YXR1cyIsImdldFBhcmFtZXRlciIsIlByb21pc2UiLCJyZXNvbHZlIiwiZSIsIkxvZyIsImRlYnVnIiwiX21hbmFnZVNpZGVFZmZlY3RzRnJvbUZpZWxkIiwiaGFuZGxlRmllbGRHcm91cENoYW5nZSIsImZpZWxkR3JvdXBzU2lkZUVmZmVjdHMiLCJyZWR1Y2UiLCJyZXN1bHRzIiwiY29uY2F0IiwiZ2V0UmVnaXN0ZXJlZFNpZGVFZmZlY3RzRm9yRmllbGRHcm91cCIsImFsbCIsIm1hcCIsImZpZWxkR3JvdXBTaWRlRWZmZWN0cyIsIl9yZXF1ZXN0RmllbGRHcm91cFNpZGVFZmZlY3RzIiwiY2F0Y2giLCJlcnJvciIsImNvbnRleHRQYXRoIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwiZ3JvdXBJZCIsImZuR2V0VGFyZ2V0cyIsInRhcmdldHMiLCJ0cmlnZ2VyQWN0aW9uIiwidGFyZ2V0c0FuZEFjdGlvbkRhdGEiLCJ0YXJnZXRFbnRpdGllcyIsInRhcmdldFByb3BlcnRpZXMiLCJleGVjdXRlQWN0aW9uIiwicmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0cyIsImdldFJlZ2lzdGVyZWRGYWlsZWRSZXF1ZXN0cyIsImlzTm90QWxyZWFkeUxpc3RlZCIsImV2ZXJ5IiwibUZhaWxlZFNpZGVFZmZlY3RzIiwicHVzaCIsInVucmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0c0ZvckFDb250ZXh0IiwidW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzIiwic2lkZUVmZmVjdHNGdWxseVF1YWxpZmllZE5hbWUiLCJmaWx0ZXIiLCJyZWdpc3RlckZpZWxkR3JvdXBTaWRlRWZmZWN0cyIsInNpZGVFZmZlY3RzUHJvcGVydGllcyIsInByb21pc2UiLCJzaWRlRWZmZWN0UHJvcGVydHkiLCJ1bnJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzIiwicmVnaXN0cnlJbmRleCIsInN0YXJ0c1dpdGgiLCJpbmRleE9mIiwic2lkZUVmZmVjdFBhcnRzIiwic3BsaXQiLCJzaWRlRWZmZWN0UGF0aCIsImdldE9EYXRhRW50aXR5U2lkZUVmZmVjdHMiLCJmYWlsZWRTaWRlRWZmZWN0c1Byb21pc2VzIiwic2lkZUVmZmVjdHNQcm9taXNlcyIsImZhaWxlZFNpZGVFZmZlY3RzIiwiZmFpbGVkU2lkZUVmZmVjdCIsInN1Y2Nlc3MiLCJrZXkiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTaWRlRWZmZWN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIHtcblx0Q29udHJvbFNpZGVFZmZlY3RzVHlwZSxcblx0T0RhdGFTaWRlRWZmZWN0c1R5cGUsXG5cdFNpZGVFZmZlY3RzU2VydmljZSxcblx0U2lkZUVmZmVjdHNUYXJnZXQsXG5cdFNpZGVFZmZlY3RzVHlwZVxufSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcIi4uL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBCYXNlTWFuaWZlc3RTZXR0aW5ncyB9IGZyb20gXCIuLi9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBmaW5hbEV4dGVuc2lvbiwgbWV0aG9kT3ZlcnJpZGUsIHByaXZhdGVFeHRlbnNpb24sIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCIuLi9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCIuLi9QYWdlQ29udHJvbGxlclwiO1xuXG50eXBlIEJhc2VTaWRlRWZmZWN0UHJvcGVydHlUeXBlID0ge1xuXHRuYW1lOiBzdHJpbmc7XG5cdGltbWVkaWF0ZT86IGJvb2xlYW47XG5cdHNpZGVFZmZlY3RzOiBTaWRlRWZmZWN0c1R5cGU7XG59O1xuXG5leHBvcnQgdHlwZSBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZSA9IEJhc2VTaWRlRWZmZWN0UHJvcGVydHlUeXBlO1xuXG5leHBvcnQgdHlwZSBGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGUgPSBCYXNlU2lkZUVmZmVjdFByb3BlcnR5VHlwZSAmIHtcblx0Y29udGV4dDogQ29udGV4dDtcbn07XG5cbmV4cG9ydCB0eXBlIEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgPSBSZWNvcmQ8c3RyaW5nLCBGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGU+O1xuXG5leHBvcnQgdHlwZSBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgPSBSZWNvcmQ8c3RyaW5nLCBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZT47XG5cbnR5cGUgRmFpbGVkU2lkZUVmZmVjdERpY3Rpb25hcnkgPSBSZWNvcmQ8c3RyaW5nLCBTaWRlRWZmZWN0c1R5cGVbXT47XG5cbmV4cG9ydCB0eXBlIEZpZWxkR3JvdXBTaWRlRWZmZWN0VHlwZSA9IHtcblx0cHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuXHRzaWRlRWZmZWN0UHJvcGVydHk6IEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZTtcbn07XG5cbmNvbnN0IElNTUVESUFURV9SRVFVRVNUID0gXCIkJEltbWVkaWF0ZVJlcXVlc3RcIjtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlNpZGVFZmZlY3RzXCIpXG5jbGFzcyBTaWRlRWZmZWN0c0NvbnRyb2xsZXJFeHRlbnNpb24gZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHRwcml2YXRlIF92aWV3ITogVmlldztcblxuXHRwcml2YXRlIF9yZWdpc3RlcmVkRmllbGRHcm91cE1hcCE6IFJlY29yZDxzdHJpbmcsIEZpZWxkR3JvdXBTaWRlRWZmZWN0VHlwZT47XG5cblx0cHJpdmF0ZSBfZmllbGRHcm91cEludmFsaWRpdHkhOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPj47XG5cblx0cHJpdmF0ZSBfc2lkZUVmZmVjdHNTZXJ2aWNlITogU2lkZUVmZmVjdHNTZXJ2aWNlO1xuXG5cdHByaXZhdGUgX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0cyE6IEZhaWxlZFNpZGVFZmZlY3REaWN0aW9uYXJ5O1xuXG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdG9uSW5pdCgpIHtcblx0XHR0aGlzLl92aWV3ID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHR0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5fdmlldykuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0dGhpcy5fcmVnaXN0ZXJlZEZpZWxkR3JvdXBNYXAgPSB7fTtcblx0XHR0aGlzLl9maWVsZEdyb3VwSW52YWxpZGl0eSA9IHt9O1xuXHRcdHRoaXMuX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0cyA9IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBTaWRlRWZmZWN0cyBjb250cm9sLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgYWRkQ29udHJvbFNpZGVFZmZlY3RzXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlIE5hbWUgb2YgdGhlIGVudGl0eSB3aGVyZSB0aGUgU2lkZUVmZmVjdHMgY29udHJvbCB3aWxsIGJlIHJlZ2lzdGVyZWRcblx0ICogQHBhcmFtIGNvbnRyb2xTaWRlRWZmZWN0cyBTaWRlRWZmZWN0cyB0byByZWdpc3Rlci4gRW5zdXJlIHRoZSBzb3VyY2VDb250cm9sSWQgbWF0Y2hlcyB0aGUgYXNzb2NpYXRlZCBTQVBVSTUgY29udHJvbCBJRC5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhZGRDb250cm9sU2lkZUVmZmVjdHMoZW50aXR5VHlwZTogc3RyaW5nLCBjb250cm9sU2lkZUVmZmVjdHM6IE9taXQ8Q29udHJvbFNpZGVFZmZlY3RzVHlwZSwgXCJmdWxseVF1YWxpZmllZE5hbWVcIj4pOiB2b2lkIHtcblx0XHR0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UuYWRkQ29udHJvbFNpZGVFZmZlY3RzKGVudGl0eVR5cGUsIGNvbnRyb2xTaWRlRWZmZWN0cyk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBTaWRlRWZmZWN0cyBjcmVhdGVkIGJ5IGEgY29udHJvbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gY29udHJvbCBTQVBVSTUgQ29udHJvbFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyhjb250cm9sOiBDb250cm9sKTogdm9pZCB7XG5cdFx0Y29uc3QgY29udHJvbElkID0gY29udHJvbC5pc0E/LihcInNhcC51aS5iYXNlLk1hbmFnZWRPYmplY3RcIikgJiYgY29udHJvbC5nZXRJZCgpO1xuXG5cdFx0aWYgKGNvbnRyb2xJZCkge1xuXHRcdFx0dGhpcy5fc2lkZUVmZmVjdHNTZXJ2aWNlLnJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyhjb250cm9sSWQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBhcHByb3ByaWF0ZSBjb250ZXh0IG9uIHdoaWNoIFNpZGVFZmZlY3RzIGNhbiBiZSByZXF1ZXN0ZWQuXG5cdCAqIFRoZSBjb3JyZWN0IG9uZSBtdXN0IGhhdmUgdGhlIGJpbmRpbmcgcGFyYW1ldGVyICQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb250ZXh0Rm9yU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIGJpbmRpbmdDb250ZXh0IEluaXRpYWwgYmluZGluZyBjb250ZXh0XG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0RW50aXR5VHlwZSBFbnRpdHlUeXBlIG9mIHRoZSBzaWRlRWZmZWN0c1xuXHQgKiBAcmV0dXJucyBTQVBVSTUgQ29udGV4dCBvciB1bmRlZmluZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRDb250ZXh0Rm9yU2lkZUVmZmVjdHMoYmluZGluZ0NvbnRleHQ6IGFueSwgc2lkZUVmZmVjdEVudGl0eVR5cGU6IHN0cmluZyk6IENvbnRleHQgfCB1bmRlZmluZWQge1xuXHRcdGxldCBjb250ZXh0Rm9yU2lkZUVmZmVjdHMgPSBiaW5kaW5nQ29udGV4dCxcblx0XHRcdGVudGl0eVR5cGUgPSB0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UuZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0KGJpbmRpbmdDb250ZXh0KTtcblxuXHRcdGlmIChzaWRlRWZmZWN0RW50aXR5VHlwZSAhPT0gZW50aXR5VHlwZSkge1xuXHRcdFx0Y29udGV4dEZvclNpZGVFZmZlY3RzID0gYmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpLmdldENvbnRleHQoKTtcblx0XHRcdGlmIChjb250ZXh0Rm9yU2lkZUVmZmVjdHMpIHtcblx0XHRcdFx0ZW50aXR5VHlwZSA9IHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5nZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoY29udGV4dEZvclNpZGVFZmZlY3RzKTtcblx0XHRcdFx0aWYgKHNpZGVFZmZlY3RFbnRpdHlUeXBlICE9PSBlbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0Y29udGV4dEZvclNpZGVFZmZlY3RzID0gY29udGV4dEZvclNpZGVFZmZlY3RzLmdldEJpbmRpbmcoKS5nZXRDb250ZXh0KCk7XG5cdFx0XHRcdFx0aWYgKGNvbnRleHRGb3JTaWRlRWZmZWN0cykge1xuXHRcdFx0XHRcdFx0ZW50aXR5VHlwZSA9IHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5nZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoY29udGV4dEZvclNpZGVFZmZlY3RzKTtcblx0XHRcdFx0XHRcdGlmIChzaWRlRWZmZWN0RW50aXR5VHlwZSAhPT0gZW50aXR5VHlwZSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjb250ZXh0Rm9yU2lkZUVmZmVjdHMgfHwgdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIFNpZGVFZmZlY3RzIG1hcCBmb3IgYSBmaWVsZFxuXHQgKiBUaGVzZSBTaWRlRWZmZWN0cyBhcmVcblx0ICogLSBsaXN0ZWQgaW50byBGaWVsZEdyb3VwSWRzIChjb21pbmcgZnJvbSBhbiBPRGF0YSBTZXJ2aWNlKVxuXHQgKiAtIGdlbmVyYXRlZCBieSBhIGNvbnRyb2wgb3IgY29udHJvbHMgYW5kIHRoYXQgY29uZmlndXJlIHRoaXMgZmllbGQgYXMgU291cmNlUHJvcGVydGllcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEZpZWxkU2lkZUVmZmVjdHNNYXBcblx0ICogQHBhcmFtIGZpZWxkIEZpZWxkIGNvbnRyb2xcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgbWFwXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0RmllbGRTaWRlRWZmZWN0c01hcChmaWVsZDogQ29udHJvbCk6IEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkge1xuXHRcdGxldCBzaWRlRWZmZWN0c01hcDogRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSA9IHt9O1xuXHRcdGNvbnN0IGZpZWxkR3JvdXBJZHMgPSBmaWVsZC5nZXRGaWVsZEdyb3VwSWRzKCksXG5cdFx0XHR2aWV3RW50aXR5U2V0U2V0TmFtZSA9ICh0aGlzLl92aWV3LmdldFZpZXdEYXRhKCkgYXMgQmFzZU1hbmlmZXN0U2V0dGluZ3MpLmVudGl0eVNldCxcblx0XHRcdHZpZXdFbnRpdHlTZXQgPSB0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UuZ2V0Q29udmVydGVkTWV0YU1vZGVsKCkuZW50aXR5U2V0cy5maW5kKChlbnRpdHlTZXQpID0+IHtcblx0XHRcdFx0cmV0dXJuIGVudGl0eVNldC5uYW1lID09PSB2aWV3RW50aXR5U2V0U2V0TmFtZTtcblx0XHRcdH0pO1xuXG5cdFx0Ly8gU2lkZUVmZmVjdHMgY29taW5nIGZyb20gYW4gT0RhdGEgU2VydmljZVxuXHRcdHNpZGVFZmZlY3RzTWFwID0gdGhpcy5nZXRTaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBzKFxuXHRcdFx0ZmllbGRHcm91cElkcyxcblx0XHRcdGZpZWxkLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCB8IG51bGwgfCB1bmRlZmluZWRcblx0XHQpIGFzIEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnk7XG5cblx0XHQvLyBTaWRlRWZmZWN0cyBjb21pbmcgZnJvbSBjb250cm9sKHMpXG5cdFx0aWYgKHZpZXdFbnRpdHlTZXRTZXROYW1lICYmIHZpZXdFbnRpdHlTZXQpIHtcblx0XHRcdGNvbnN0IHZpZXdFbnRpdHlUeXBlID0gdmlld0VudGl0eVNldC5lbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0ZmllbGRQYXRoID0gdGhpcy5nZXRUYXJnZXRQcm9wZXJ0eShmaWVsZCksXG5cdFx0XHRcdGNvbnRleHQgPSB0aGlzLmdldENvbnRleHRGb3JTaWRlRWZmZWN0cyhmaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLCB2aWV3RW50aXR5VHlwZSk7XG5cblx0XHRcdGlmIChmaWVsZFBhdGggJiYgY29udGV4dCkge1xuXHRcdFx0XHRjb25zdCBjb250cm9sU2lkZUVmZmVjdHNFbnRpdHlUeXBlID0gdGhpcy5fc2lkZUVmZmVjdHNTZXJ2aWNlLmdldENvbnRyb2xFbnRpdHlTaWRlRWZmZWN0cyh2aWV3RW50aXR5VHlwZSk7XG5cdFx0XHRcdE9iamVjdC5rZXlzKGNvbnRyb2xTaWRlRWZmZWN0c0VudGl0eVR5cGUpLmZvckVhY2goKHNpZGVFZmZlY3RzTmFtZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG9Db250cm9sU2lkZUVmZmVjdHMgPSBjb250cm9sU2lkZUVmZmVjdHNFbnRpdHlUeXBlW3NpZGVFZmZlY3RzTmFtZV07XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sU2lkZUVmZmVjdHMuc291cmNlUHJvcGVydGllcy5pbmNsdWRlcyhmaWVsZFBhdGgpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBuYW1lID0gYCR7c2lkZUVmZmVjdHNOYW1lfTo6JHt2aWV3RW50aXR5VHlwZX1gO1xuXHRcdFx0XHRcdFx0c2lkZUVmZmVjdHNNYXBbbmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRcdG5hbWU6IG5hbWUsXG5cdFx0XHRcdFx0XHRcdGltbWVkaWF0ZTogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0c2lkZUVmZmVjdHM6IG9Db250cm9sU2lkZUVmZmVjdHMsXG5cdFx0XHRcdFx0XHRcdGNvbnRleHQ6IGNvbnRleHRcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNpZGVFZmZlY3RzTWFwO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHNpZGVFZmZlY3RzIG1hcCBmb3IgZmllbGRHcm91cHMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRTaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBzXG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwSWRzIEZpZWxkIGdyb3VwIGlkc1xuXHQgKiBAcGFyYW0gZmllbGRDb250ZXh0IEZpZWxkIGJpbmRpbmcgY29udGV4dFxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyBtYXBcblx0ICovXG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldFNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cHMoXG5cdFx0ZmllbGRHcm91cElkczogc3RyaW5nW10sXG5cdFx0ZmllbGRDb250ZXh0PzogQ29udGV4dCB8IG51bGxcblx0KTogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5IHwgRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSB7XG5cdFx0Y29uc3QgbVNpZGVFZmZlY3RzTWFwOiBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgfCBGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5ID0ge307XG5cdFx0ZmllbGRHcm91cElkcy5mb3JFYWNoKChmaWVsZEdyb3VwSWQpID0+IHtcblx0XHRcdGNvbnN0IHsgbmFtZSwgaW1tZWRpYXRlLCBzaWRlRWZmZWN0cywgc2lkZUVmZmVjdEVudGl0eVR5cGUgfSA9IHRoaXMuX2dldFNpZGVFZmZlY3RzUHJvcGVydHlGb3JGaWVsZEdyb3VwKGZpZWxkR3JvdXBJZCk7XG5cdFx0XHRjb25zdCBvQ29udGV4dCA9IGZpZWxkQ29udGV4dCA/ICh0aGlzLmdldENvbnRleHRGb3JTaWRlRWZmZWN0cyhmaWVsZENvbnRleHQsIHNpZGVFZmZlY3RFbnRpdHlUeXBlKSBhcyBDb250ZXh0KSA6IHVuZGVmaW5lZDtcblx0XHRcdGlmIChzaWRlRWZmZWN0cyAmJiAoIWZpZWxkQ29udGV4dCB8fCAoZmllbGRDb250ZXh0ICYmIG9Db250ZXh0KSkpIHtcblx0XHRcdFx0bVNpZGVFZmZlY3RzTWFwW25hbWVdID0ge1xuXHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0aW1tZWRpYXRlLFxuXHRcdFx0XHRcdHNpZGVFZmZlY3RzXG5cdFx0XHRcdH07XG5cdFx0XHRcdGlmIChmaWVsZENvbnRleHQpIHtcblx0XHRcdFx0XHQobVNpZGVFZmZlY3RzTWFwW25hbWVdIGFzIEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZSkuY29udGV4dCA9IG9Db250ZXh0ITtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBtU2lkZUVmZmVjdHNNYXA7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXIgcmVjb3JkZWQgdmFsaWRhdGlvbiBzdGF0dXMgZm9yIGFsbCBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgY2xlYXJGaWVsZEdyb3Vwc1ZhbGlkaXR5XG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Y2xlYXJGaWVsZEdyb3Vwc1ZhbGlkaXR5KCk6IHZvaWQge1xuXHRcdHRoaXMuX2ZpZWxkR3JvdXBJbnZhbGlkaXR5ID0ge307XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXIgcmVjb3JkZWQgdmFsaWRhdGlvbiBzdGF0dXMgZm9yIGFsbCBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNGaWVsZEdyb3VwVmFsaWRcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBJZCBGaWVsZCBncm91cCBpZFxuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0XG5cdCAqIEByZXR1cm5zIFNBUFVJNSBDb250ZXh0IG9yIHVuZGVmaW5lZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGlzRmllbGRHcm91cFZhbGlkKGZpZWxkR3JvdXBJZDogc3RyaW5nLCBjb250ZXh0OiBDb250ZXh0KTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgaWQgPSB0aGlzLl9nZXRGaWVsZEdyb3VwSW5kZXgoZmllbGRHcm91cElkLCBjb250ZXh0KTtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZmllbGRHcm91cEludmFsaWRpdHlbaWRdID8/IHt9KS5sZW5ndGggPT09IDA7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgcmVsYXRpdmUgdGFyZ2V0IHByb3BlcnR5IHJlbGF0ZWQgdG8gdGhlIEZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0VGFyZ2V0UHJvcGVydHlcblx0ICogQHBhcmFtIGZpZWxkIEZpZWxkIGNvbnRyb2xcblx0ICogQHJldHVybnMgUmVsYXRpdmUgdGFyZ2V0IHByb3BlcnR5XG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0VGFyZ2V0UHJvcGVydHkoZmllbGQ6IENvbnRyb2wpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IGZpZWxkUGF0aCA9IGZpZWxkLmRhdGEoXCJzb3VyY2VQYXRoXCIpIGFzIHN0cmluZztcblx0XHRjb25zdCBtZXRhTW9kZWwgPSB0aGlzLl92aWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0Y29uc3Qgdmlld0JpbmRpbmdQYXRoID0gdGhpcy5fdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgdmlld01ldGFNb2RlbFBhdGggPSB2aWV3QmluZGluZ1BhdGggPyBgJHttZXRhTW9kZWwuZ2V0TWV0YVBhdGgodmlld0JpbmRpbmdQYXRoKX0vYCA6IFwiXCI7XG5cdFx0cmV0dXJuIGZpZWxkUGF0aD8ucmVwbGFjZSh2aWV3TWV0YU1vZGVsUGF0aCwgXCJcIik7XG5cdH1cblxuXHQvKipcblx0ICogTWFuYWdlcyB0aGUgd29ya2Zsb3cgZm9yIFNpZGVFZmZlY3RzIHdpdGggcmVsYXRlZCBjaGFuZ2VzIHRvIGEgZmllbGRcblx0ICogVGhlIGZvbGxvd2luZyBzY2VuYXJpb3MgYXJlIG1hbmFnZWQ6XG5cdCAqICAtIEV4ZWN1dGU6IHRyaWdnZXJzIGltbWVkaWF0ZSBTaWRlRWZmZWN0cyByZXF1ZXN0cyBpZiB0aGUgcHJvbWlzZSBmb3IgdGhlIGZpZWxkIGV2ZW50IGlzIGZ1bGZpbGxlZFxuXHQgKiAgLSBSZWdpc3RlcjogY2FjaGVzIGRlZmVycmVkIFNpZGVFZmZlY3RzIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoZSBGaWVsZEdyb3VwIGlzIHVuZm9jdXNlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGhhbmRsZUZpZWxkQ2hhbmdlXG5cdCAqIEBwYXJhbSBldmVudCBTQVBVSTUgZXZlbnQgdGhhdCBjb21lcyBmcm9tIGEgZmllbGQgY2hhbmdlXG5cdCAqIEBwYXJhbSBmaWVsZFZhbGlkaXR5XG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkIGJlZm9yZSBleGVjdXRpbmcgZGVmZXJyZWQgU2lkZUVmZmVjdHNcblx0ICogQHJldHVybnMgIFByb21pc2Ugb24gU2lkZUVmZmVjdHMgcmVxdWVzdChzKVxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGhhbmRsZUZpZWxkQ2hhbmdlKGV2ZW50OiBFdmVudCwgZmllbGRWYWxpZGl0eTogYm9vbGVhbiwgZmllbGRHcm91cFByZVJlcXVpc2l0ZT86IFByb21pc2U8YW55Pik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGZpZWxkID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgQ29udHJvbDtcblx0XHR0aGlzLl9zYXZlRmllbGRQcm9wZXJ0aWVzU3RhdHVzKGZpZWxkLCBmaWVsZFZhbGlkaXR5KTtcblx0XHRpZiAoIWZpZWxkVmFsaWRpdHkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgKGV2ZW50LmdldFBhcmFtZXRlcihcInByb21pc2VcIikgPz8gUHJvbWlzZS5yZXNvbHZlKCkpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdExvZy5kZWJ1ZyhcIlByZXJlcXVpc2l0ZXMgb24gRmllbGQgZm9yIHRoZSBTaWRlRWZmZWN0cyBoYXZlIGJlZW4gcmVqZWN0ZWRcIiwgZSBhcyBzdHJpbmcpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fbWFuYWdlU2lkZUVmZmVjdHNGcm9tRmllbGQoZmllbGQsIGZpZWxkR3JvdXBQcmVSZXF1aXNpdGUgPz8gUHJvbWlzZS5yZXNvbHZlKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1hbmFnZXMgU2lkZUVmZmVjdHMgd2l0aCBhIHJlbGF0ZWQgJ2ZvY3VzIG91dCcgdG8gYSBmaWVsZCBncm91cC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGhhbmRsZUZpZWxkR3JvdXBDaGFuZ2Vcblx0ICogQHBhcmFtIGV2ZW50IFNBUFVJNSBFdmVudFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJldHVybmluZyB0cnVlIGlmIHRoZSBTaWRlRWZmZWN0cyBoYXZlIGJlZW4gc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0aGFuZGxlRmllbGRHcm91cENoYW5nZShldmVudDogRXZlbnQpOiBQcm9taXNlPHZvaWQgfCB2b2lkW10+IHtcblx0XHRjb25zdCBmaWVsZCA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2wsXG5cdFx0XHRmaWVsZEdyb3VwSWRzOiBzdHJpbmdbXSA9IGV2ZW50LmdldFBhcmFtZXRlcihcImZpZWxkR3JvdXBJZHNcIiksXG5cdFx0XHRmaWVsZEdyb3Vwc1NpZGVFZmZlY3RzID0gZmllbGRHcm91cElkcy5yZWR1Y2UoKHJlc3VsdHM6IEZpZWxkR3JvdXBTaWRlRWZmZWN0VHlwZVtdLCBmaWVsZEdyb3VwSWQpID0+IHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdHMuY29uY2F0KHRoaXMuZ2V0UmVnaXN0ZXJlZFNpZGVFZmZlY3RzRm9yRmllbGRHcm91cChmaWVsZEdyb3VwSWQpKTtcblx0XHRcdH0sIFtdKTtcblxuXHRcdHJldHVybiBQcm9taXNlLmFsbChcblx0XHRcdGZpZWxkR3JvdXBzU2lkZUVmZmVjdHMubWFwKChmaWVsZEdyb3VwU2lkZUVmZmVjdHMpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX3JlcXVlc3RGaWVsZEdyb3VwU2lkZUVmZmVjdHMoZmllbGRHcm91cFNpZGVFZmZlY3RzKTtcblx0XHRcdH0pXG5cdFx0KS5jYXRjaCgoZXJyb3IpID0+IHtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXRoID0gZmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpO1xuXHRcdFx0TG9nLmRlYnVnKGBFcnJvciB3aGlsZSBwcm9jZXNzaW5nIEZpZWxkR3JvdXAgU2lkZUVmZmVjdHMgb24gY29udGV4dCAke2NvbnRleHRQYXRofWAsIGVycm9yKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0IFNpZGVFZmZlY3RzIG9uIGEgc3BlY2lmaWMgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHJlcXVlc3RTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHMgU2lkZUVmZmVjdHMgdG8gYmUgZXhlY3V0ZWRcblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCB3aGVyZSBTaWRlRWZmZWN0cyBuZWVkIHRvIGJlIGV4ZWN1dGVkXG5cdCAqIEBwYXJhbSBncm91cElkXG5cdCAqIEBwYXJhbSBmbkdldFRhcmdldHMgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIHdpbGwgZ2l2ZSB1cyB0aGUgdGFyZ2V0cyBhbmQgYWN0aW9ucyBpZiBpdCB3YXMgY29taW5nIHRocm91Z2ggc29tZSBzcGVjaWZpYyBoYW5kbGluZy5cblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgcmVxdWVzdCBvbiBTQVBVSTUgY29udGV4dFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIHJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0czogU2lkZUVmZmVjdHNUeXBlLCBjb250ZXh0OiBDb250ZXh0LCBncm91cElkPzogc3RyaW5nLCBmbkdldFRhcmdldHM/OiBGdW5jdGlvbik6IFByb21pc2U8dW5rbm93bj4ge1xuXHRcdGxldCB0YXJnZXRzOiBTaWRlRWZmZWN0c1RhcmdldFtdLCB0cmlnZ2VyQWN0aW9uO1xuXHRcdGlmIChmbkdldFRhcmdldHMpIHtcblx0XHRcdGNvbnN0IHRhcmdldHNBbmRBY3Rpb25EYXRhID0gYXdhaXQgZm5HZXRUYXJnZXRzKHNpZGVFZmZlY3RzKTtcblx0XHRcdHRhcmdldHMgPSB0YXJnZXRzQW5kQWN0aW9uRGF0YVtcImFUYXJnZXRzXCJdO1xuXHRcdFx0dHJpZ2dlckFjdGlvbiA9IHRhcmdldHNBbmRBY3Rpb25EYXRhW1wiVHJpZ2dlckFjdGlvblwiXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0cyA9IFsuLi4oc2lkZUVmZmVjdHMudGFyZ2V0RW50aXRpZXMgPz8gW10pLCAuLi4oc2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllcyA/PyBbXSldO1xuXHRcdFx0dHJpZ2dlckFjdGlvbiA9IChzaWRlRWZmZWN0cyBhcyBPRGF0YVNpZGVFZmZlY3RzVHlwZSkudHJpZ2dlckFjdGlvbjtcblx0XHR9XG5cdFx0aWYgKHRyaWdnZXJBY3Rpb24pIHtcblx0XHRcdHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5leGVjdXRlQWN0aW9uKHRyaWdnZXJBY3Rpb24sIGNvbnRleHQsIGdyb3VwSWQpO1xuXHRcdH1cblxuXHRcdGlmICh0YXJnZXRzLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHModGFyZ2V0cywgY29udGV4dCwgZ3JvdXBJZCkuY2F0Y2goKGVycm9yOiB1bmtub3duKSA9PiB7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0cyhzaWRlRWZmZWN0cywgY29udGV4dCk7XG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgZmFpbGVkIFNpZGVFZmZlY3RzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0UmVnaXN0ZXJlZEZhaWxlZFJlcXVlc3RzXG5cdCAqIEByZXR1cm5zIFJlZ2lzdGVyZWQgU2lkZUVmZmVjdHMgcmVxdWVzdHMgdGhhdCBoYXZlIGZhaWxlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHB1YmxpYyBnZXRSZWdpc3RlcmVkRmFpbGVkUmVxdWVzdHMoKTogRmFpbGVkU2lkZUVmZmVjdERpY3Rpb25hcnkge1xuXHRcdHJldHVybiB0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBTaWRlRWZmZWN0cyB0byB0aGUgcXVldWUgb2YgdGhlIGZhaWxlZCBTaWRlRWZmZWN0c1xuXHQgKiBUaGUgU2lkZUVmZmVjdHMgYXJlIHJldHJpZ2dlcmVkIG9uIHRoZSBuZXh0IGNoYW5nZSBvbiB0aGUgc2FtZSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHMgU2lkZUVmZmVjdHMgdGhhdCBuZWVkIHRvIGJlIHJldHJpZ2dlcmVkXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgd2hlcmUgU2lkZUVmZmVjdHMgaGF2ZSBmYWlsZWRcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0cyhzaWRlRWZmZWN0czogU2lkZUVmZmVjdHNUeXBlLCBjb250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG5cdFx0Y29uc3QgY29udGV4dFBhdGggPSBjb250ZXh0LmdldFBhdGgoKTtcblx0XHR0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdID0gdGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXSA/PyBbXTtcblx0XHRjb25zdCBpc05vdEFscmVhZHlMaXN0ZWQgPSB0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdLmV2ZXJ5KFxuXHRcdFx0KG1GYWlsZWRTaWRlRWZmZWN0cykgPT4gc2lkZUVmZmVjdHMuZnVsbHlRdWFsaWZpZWROYW1lICE9PSBtRmFpbGVkU2lkZUVmZmVjdHMuZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0KTtcblx0XHRpZiAoaXNOb3RBbHJlYWR5TGlzdGVkKSB7XG5cdFx0XHR0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdLnB1c2goc2lkZUVmZmVjdHMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIFNpZGVFZmZlY3RzIHRvIHRoZSBxdWV1ZSBvZiB0aGUgZmFpbGVkIFNpZGVFZmZlY3RzIGZvciBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSB1bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNGb3JBQ29udGV4dFxuXHQgKiBAcGFyYW0gY29udGV4dFBhdGggQ29udGV4dCBwYXRoIHdoZXJlIFNpZGVFZmZlY3RzIGhhdmUgZmFpbGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0dW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzRm9yQUNvbnRleHQoY29udGV4dFBhdGg6IHN0cmluZykge1xuXHRcdGRlbGV0ZSB0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgU2lkZUVmZmVjdHMgdG8gdGhlIHF1ZXVlIG9mIHRoZSBmYWlsZWQgU2lkZUVmZmVjdHMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSB1bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzRnVsbHlRdWFsaWZpZWROYW1lIFNpZGVFZmZlY3RzIHRoYXQgbmVlZCB0byBiZSByZXRyaWdnZXJlZFxuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0IHdoZXJlIFNpZGVFZmZlY3RzIGhhdmUgZmFpbGVkXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHVucmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c0Z1bGx5UXVhbGlmaWVkTmFtZTogc3RyaW5nLCBjb250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG5cdFx0Y29uc3QgY29udGV4dFBhdGggPSBjb250ZXh0LmdldFBhdGgoKTtcblx0XHRpZiAodGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXT8ubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdID0gdGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXS5maWx0ZXIoXG5cdFx0XHRcdChzaWRlRWZmZWN0cykgPT4gc2lkZUVmZmVjdHMuZnVsbHlRdWFsaWZpZWROYW1lICE9PSBzaWRlRWZmZWN0c0Z1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBTaWRlRWZmZWN0cyB0byB0aGUgcXVldWUgb2YgYSBGaWVsZEdyb3VwXG5cdCAqIFRoZSBTaWRlRWZmZWN0cyBhcmUgdHJpZ2dlcmVkIHdoZW4gZXZlbnQgcmVsYXRlZCB0byB0aGUgZmllbGQgZ3JvdXAgY2hhbmdlIGlzIGZpcmVkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcmVnaXN0ZXJGaWVsZEdyb3VwU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzUHJvcGVydGllcyBTaWRlRWZmZWN0cyBwcm9wZXJ0aWVzXG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlIFByb21pc2UgdG8gZnVsbGZpbCBiZWZvcmUgZXhlY3V0aW5nIHRoZSBTaWRlRWZmZWN0c1xuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRyZWdpc3RlckZpZWxkR3JvdXBTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c1Byb3BlcnRpZXM6IEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZSwgZmllbGRHcm91cFByZVJlcXVpc2l0ZT86IFByb21pc2U8dW5rbm93bj4pIHtcblx0XHRjb25zdCBpZCA9IHRoaXMuX2dldEZpZWxkR3JvdXBJbmRleChzaWRlRWZmZWN0c1Byb3BlcnRpZXMubmFtZSwgc2lkZUVmZmVjdHNQcm9wZXJ0aWVzLmNvbnRleHQpO1xuXHRcdGlmICghdGhpcy5fcmVnaXN0ZXJlZEZpZWxkR3JvdXBNYXBbaWRdKSB7XG5cdFx0XHR0aGlzLl9yZWdpc3RlcmVkRmllbGRHcm91cE1hcFtpZF0gPSB7XG5cdFx0XHRcdHByb21pc2U6IGZpZWxkR3JvdXBQcmVSZXF1aXNpdGUgPz8gUHJvbWlzZS5yZXNvbHZlKCksXG5cdFx0XHRcdHNpZGVFZmZlY3RQcm9wZXJ0eTogc2lkZUVmZmVjdHNQcm9wZXJ0aWVzXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIFNpZGVFZmZlY3RzIHRvIHRoZSBxdWV1ZSBvZiBhIEZpZWxkR3JvdXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSB1bnJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c1Byb3BlcnRpZXMgU2lkZUVmZmVjdHMgcHJvcGVydGllc1xuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHR1bnJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzUHJvcGVydGllczogRmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlKSB7XG5cdFx0Y29uc3QgeyBjb250ZXh0LCBuYW1lIH0gPSBzaWRlRWZmZWN0c1Byb3BlcnRpZXM7XG5cdFx0Y29uc3QgaWQgPSB0aGlzLl9nZXRGaWVsZEdyb3VwSW5kZXgobmFtZSwgY29udGV4dCk7XG5cdFx0ZGVsZXRlIHRoaXMuX3JlZ2lzdGVyZWRGaWVsZEdyb3VwTWFwW2lkXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSByZWdpc3RlcmVkIFNpZGVFZmZlY3RzIGludG8gdGhlIHF1ZXVlIGZvciBhIGZpZWxkIGdyb3VwIGlkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0UmVnaXN0ZXJlZFNpZGVFZmZlY3RzRm9yRmllbGRHcm91cFxuXHQgKiBAcGFyYW0gZmllbGRHcm91cElkIEZpZWxkIGdyb3VwIGlkXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIHJlZ2lzdGVyZWQgU2lkZUVmZmVjdHMgYW5kIHRoZWlyIHByb21pc2Vcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRSZWdpc3RlcmVkU2lkZUVmZmVjdHNGb3JGaWVsZEdyb3VwKGZpZWxkR3JvdXBJZDogc3RyaW5nKTogRmllbGRHcm91cFNpZGVFZmZlY3RUeXBlW10ge1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzID0gW107XG5cdFx0Zm9yIChjb25zdCByZWdpc3RyeUluZGV4IG9mIE9iamVjdC5rZXlzKHRoaXMuX3JlZ2lzdGVyZWRGaWVsZEdyb3VwTWFwKSkge1xuXHRcdFx0aWYgKHJlZ2lzdHJ5SW5kZXguc3RhcnRzV2l0aChgJHtmaWVsZEdyb3VwSWR9X2ApKSB7XG5cdFx0XHRcdHNpZGVFZmZlY3RzLnB1c2godGhpcy5fcmVnaXN0ZXJlZEZpZWxkR3JvdXBNYXBbcmVnaXN0cnlJbmRleF0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2lkZUVmZmVjdHM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIHN0YXR1cyBpbmRleC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9nZXRGaWVsZEdyb3VwSW5kZXhcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBJZCBUaGUgZmllbGQgZ3JvdXAgaWRcblx0ICogQHBhcmFtIGNvbnRleHQgU0FQVUk1IENvbnRleHRcblx0ICogQHJldHVybnMgSW5kZXhcblx0ICovXG5cdHByaXZhdGUgX2dldEZpZWxkR3JvdXBJbmRleChmaWVsZEdyb3VwSWQ6IHN0cmluZywgY29udGV4dDogQ29udGV4dCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGAke2ZpZWxkR3JvdXBJZH1fJHtjb250ZXh0LmdldFBhdGgoKX1gO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc2lkZUVmZmVjdHMgcHJvcGVydGllcyBmcm9tIGEgZmllbGQgZ3JvdXAgaWRcblx0ICogVGhlIHByb3BlcnRpZXMgYXJlOlxuXHQgKiAgLSBuYW1lXG5cdCAqICAtIHNpZGVFZmZlY3RzIGRlZmluaXRpb25cblx0ICogIC0gc2lkZUVmZmVjdHMgZW50aXR5IHR5cGVcblx0ICogIC0gaW1tZWRpYXRlIHNpZGVFZmZlY3RzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2dldFNpZGVFZmZlY3RzUHJvcGVydHlGb3JGaWVsZEdyb3VwXG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwSWRcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgcHJvcGVydGllc1xuXHQgKi9cblx0cHJpdmF0ZSBfZ2V0U2lkZUVmZmVjdHNQcm9wZXJ0eUZvckZpZWxkR3JvdXAoZmllbGRHcm91cElkOiBzdHJpbmcpIHtcblx0XHQvKipcblx0XHQgKiBzdHJpbmcgXCIkJEltbWVkaWF0ZVJlcXVlc3RcIiBpcyBhZGRlZCB0byB0aGUgU2lkZUVmZmVjdHMgbmFtZSBkdXJpbmcgdGVtcGxhdGluZyB0byBrbm93XG5cdFx0ICogaWYgdGhpcyBTaWRlRWZmZWN0cyBtdXN0IGJlIGltbWVkaWF0ZWx5IGV4ZWN1dGVkIHJlcXVlc3RlZCAob24gZmllbGQgY2hhbmdlKSBvciBtdXN0XG5cdFx0ICogYmUgZGVmZXJyZWQgKG9uIGZpZWxkIGdyb3VwIGZvY3VzIG91dClcblx0XHQgKlxuXHRcdCAqL1xuXHRcdGNvbnN0IGltbWVkaWF0ZSA9IGZpZWxkR3JvdXBJZC5pbmRleE9mKElNTUVESUFURV9SRVFVRVNUKSAhPT0gLTEsXG5cdFx0XHRuYW1lID0gZmllbGRHcm91cElkLnJlcGxhY2UoSU1NRURJQVRFX1JFUVVFU1QsIFwiXCIpLFxuXHRcdFx0c2lkZUVmZmVjdFBhcnRzID0gbmFtZS5zcGxpdChcIiNcIiksXG5cdFx0XHRzaWRlRWZmZWN0RW50aXR5VHlwZSA9IHNpZGVFZmZlY3RQYXJ0c1swXSxcblx0XHRcdHNpZGVFZmZlY3RQYXRoID0gYCR7c2lkZUVmZmVjdEVudGl0eVR5cGV9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TaWRlRWZmZWN0cyR7XG5cdFx0XHRcdHNpZGVFZmZlY3RQYXJ0cy5sZW5ndGggPT09IDIgPyBgIyR7c2lkZUVmZmVjdFBhcnRzWzFdfWAgOiBcIlwiXG5cdFx0XHR9YCxcblx0XHRcdHNpZGVFZmZlY3RzOiBPRGF0YVNpZGVFZmZlY3RzVHlwZSB8IHVuZGVmaW5lZCA9XG5cdFx0XHRcdHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5nZXRPRGF0YUVudGl0eVNpZGVFZmZlY3RzKHNpZGVFZmZlY3RFbnRpdHlUeXBlKT8uW3NpZGVFZmZlY3RQYXRoXTtcblx0XHRyZXR1cm4geyBuYW1lLCBpbW1lZGlhdGUsIHNpZGVFZmZlY3RzLCBzaWRlRWZmZWN0RW50aXR5VHlwZSB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIE1hbmFnZXMgdGhlIFNpZGVFZmZlY3RzIGZvciBhIGZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX21hbmFnZVNpZGVFZmZlY3RzRnJvbUZpZWxkXG5cdCAqIEBwYXJhbSBmaWVsZCBGaWVsZCBjb250cm9sXG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlIFByb21pc2UgdG8gZnVsbGZpbCBiZWZvcmUgZXhlY3V0aW5nIGRlZmVycmVkIFNpZGVFZmZlY3RzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVsYXRlZCB0byB0aGUgcmVxdWVzdGVkIGltbWVkaWF0ZSBzaWRlRWZmZWN0cyBhbmQgcmVnaXN0ZXJlZCBkZWZlcnJlZCBTaWRlRWZmZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBfbWFuYWdlU2lkZUVmZmVjdHNGcm9tRmllbGQoZmllbGQ6IENvbnRyb2wsIGZpZWxkR3JvdXBQcmVSZXF1aXNpdGU6IFByb21pc2U8dW5rbm93bj4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBzaWRlRWZmZWN0c01hcCA9IHRoaXMuZ2V0RmllbGRTaWRlRWZmZWN0c01hcChmaWVsZCk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGZhaWxlZFNpZGVFZmZlY3RzUHJvbWlzZXM6ICh2b2lkIHwgUHJvbWlzZTx1bmtub3duPilbXSA9IFtdO1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNQcm9taXNlcyA9IE9iamVjdC5rZXlzKHNpZGVFZmZlY3RzTWFwKS5tYXAoKHNpZGVFZmZlY3RzTmFtZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBzaWRlRWZmZWN0c1Byb3BlcnRpZXMgPSBzaWRlRWZmZWN0c01hcFtzaWRlRWZmZWN0c05hbWVdO1xuXG5cdFx0XHRcdGlmIChzaWRlRWZmZWN0c1Byb3BlcnRpZXMuaW1tZWRpYXRlID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGhpcyBTaWRlRWZmZWN0cyBpcyByZWNvcmRlZCBhcyBmYWlsZWQgU2lkZUVmZmVjdHMsIG5lZWQgdG8gcmVtb3ZlIGl0LlxuXHRcdFx0XHRcdHRoaXMudW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzUHJvcGVydGllcy5zaWRlRWZmZWN0cy5mdWxseVF1YWxpZmllZE5hbWUsIHNpZGVFZmZlY3RzUHJvcGVydGllcy5jb250ZXh0KTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5yZXF1ZXN0U2lkZUVmZmVjdHMoc2lkZUVmZmVjdHNQcm9wZXJ0aWVzLnNpZGVFZmZlY3RzLCBzaWRlRWZmZWN0c1Byb3BlcnRpZXMuY29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRoaXMucmVnaXN0ZXJGaWVsZEdyb3VwU2lkZUVmZmVjdHMoc2lkZUVmZmVjdHNQcm9wZXJ0aWVzLCBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL1JlcGxheSBmYWlsZWQgU2lkZUVmZmVjdHMgcmVsYXRlZCB0byB0aGUgdmlldyBvciBGaWVsZFxuXHRcdFx0Zm9yIChjb25zdCBjb250ZXh0IG9mIFtmaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLCB0aGlzLl92aWV3LmdldEJpbmRpbmdDb250ZXh0KCldKSB7XG5cdFx0XHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3QgY29udGV4dFBhdGggPSBjb250ZXh0LmdldFBhdGgoKTtcblx0XHRcdFx0XHRjb25zdCBmYWlsZWRTaWRlRWZmZWN0cyA9IHRoaXMuX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0c1tjb250ZXh0UGF0aF0gPz8gW107XG5cdFx0XHRcdFx0dGhpcy51bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNGb3JBQ29udGV4dChjb250ZXh0UGF0aCk7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBmYWlsZWRTaWRlRWZmZWN0IG9mIGZhaWxlZFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0XHRmYWlsZWRTaWRlRWZmZWN0c1Byb21pc2VzLnB1c2godGhpcy5yZXF1ZXN0U2lkZUVmZmVjdHMoZmFpbGVkU2lkZUVmZmVjdCwgY29udGV4dCBhcyBDb250ZXh0KSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IFByb21pc2UuYWxsKHNpZGVFZmZlY3RzUHJvbWlzZXMuY29uY2F0KGZhaWxlZFNpZGVFZmZlY3RzUHJvbWlzZXMpKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRMb2cuZGVidWcoYEVycm9yIHdoaWxlIG1hbmFnaW5nIEZpZWxkIFNpZGVFZmZlY3RzYCwgZSBhcyBzdHJpbmcpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyB0aGUgU2lkZUVmZmVjdHMgZm9yIGEgZmllbGRHcm91cC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9yZXF1ZXN0RmllbGRHcm91cFNpZGVFZmZlY3RzXG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwU2lkZUVmZmVjdHMgRmllbGQgZ3JvdXAgc2lkZUVmZmVjdHMgd2l0aCBpdHMgcHJvbWlzZVxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJldHVybmluZyB0cnVlIGlmIHRoZSBTaWRlRWZmZWN0cyBoYXZlIGJlZW4gc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVkXG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIF9yZXF1ZXN0RmllbGRHcm91cFNpZGVFZmZlY3RzKGZpZWxkR3JvdXBTaWRlRWZmZWN0czogRmllbGRHcm91cFNpZGVFZmZlY3RUeXBlKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy51bnJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzKGZpZWxkR3JvdXBTaWRlRWZmZWN0cy5zaWRlRWZmZWN0UHJvcGVydHkpO1xuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCBmaWVsZEdyb3VwU2lkZUVmZmVjdHMucHJvbWlzZTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRMb2cuZGVidWcoYEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgRmllbGRHcm91cCBTaWRlRWZmZWN0c2AsIGUgYXMgc3RyaW5nKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHsgc2lkZUVmZmVjdHMsIGNvbnRleHQsIG5hbWUgfSA9IGZpZWxkR3JvdXBTaWRlRWZmZWN0cy5zaWRlRWZmZWN0UHJvcGVydHk7XG5cdFx0XHRpZiAodGhpcy5pc0ZpZWxkR3JvdXBWYWxpZChuYW1lLCBjb250ZXh0KSkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLnJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0cywgY29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0TG9nLmRlYnVnKGBFcnJvciB3aGlsZSBleGVjdXRpbmcgRmllbGRHcm91cCBTaWRlRWZmZWN0c2AsIGUgYXMgc3RyaW5nKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZXMgdGhlIHZhbGlkYXRpb24gc3RhdHVzIG9mIHByb3BlcnRpZXMgcmVsYXRlZCB0byBhIGZpZWxkIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWVsZCBUaGUgZmllbGQgY29udHJvbFxuXHQgKiBAcGFyYW0gc3VjY2VzcyBTdGF0dXMgb2YgdGhlIGZpZWxkIHZhbGlkYXRpb25cblx0ICovXG5cdHByaXZhdGUgX3NhdmVGaWVsZFByb3BlcnRpZXNTdGF0dXMoZmllbGQ6IENvbnRyb2wsIHN1Y2Nlc3M6IGJvb2xlYW4pOiB2b2lkIHtcblx0XHRjb25zdCBzaWRlRWZmZWN0c01hcCA9IHRoaXMuZ2V0RmllbGRTaWRlRWZmZWN0c01hcChmaWVsZCk7XG5cdFx0T2JqZWN0LmtleXMoc2lkZUVmZmVjdHNNYXApLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0Y29uc3QgeyBuYW1lLCBpbW1lZGlhdGUsIGNvbnRleHQgfSA9IHNpZGVFZmZlY3RzTWFwW2tleV07XG5cdFx0XHRpZiAoIWltbWVkaWF0ZSkge1xuXHRcdFx0XHRjb25zdCBpZCA9IHRoaXMuX2dldEZpZWxkR3JvdXBJbmRleChuYW1lLCBjb250ZXh0KTtcblx0XHRcdFx0aWYgKHN1Y2Nlc3MpIHtcblx0XHRcdFx0XHRkZWxldGUgdGhpcy5fZmllbGRHcm91cEludmFsaWRpdHlbaWRdPy5bZmllbGQuZ2V0SWQoKV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5fZmllbGRHcm91cEludmFsaWRpdHlbaWRdID0ge1xuXHRcdFx0XHRcdFx0Li4udGhpcy5fZmllbGRHcm91cEludmFsaWRpdHlbaWRdLFxuXHRcdFx0XHRcdFx0Li4ueyBbZmllbGQuZ2V0SWQoKV06IHRydWUgfVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTaWRlRWZmZWN0c0NvbnRyb2xsZXJFeHRlbnNpb247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUEwQ0EsTUFBTUEsaUJBQWlCLEdBQUcsb0JBQW9CO0VBQUMsSUFFekNDLDhCQUE4QixXQURuQ0MsY0FBYyxDQUFDLDhDQUE4QyxDQUFDLFVBYzdEQyxjQUFjLEVBQUUsVUFpQmhCQyxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQVloQkQsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUFtQmhCRCxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQW1DaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBa0RoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0E2QmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQWNoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0FjaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBc0JoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0F5QmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQTZCaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBOEJoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0FjaEJDLGdCQUFnQixFQUFFLFdBQ2xCRCxjQUFjLEVBQUUsV0FtQmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQWFoQkMsZ0JBQWdCLEVBQUUsV0FDbEJELGNBQWMsRUFBRSxXQW1CaEJDLGdCQUFnQixFQUFFLFdBQ2xCRCxjQUFjLEVBQUUsV0FrQmhCQyxnQkFBZ0IsRUFBRSxXQUNsQkQsY0FBYyxFQUFFLFdBZWhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRTtJQUFB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