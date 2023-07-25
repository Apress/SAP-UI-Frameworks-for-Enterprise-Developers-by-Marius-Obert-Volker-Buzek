/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge", "sap/base/util/ObjectPath", "sap/base/util/uid", "sap/ui/base/Metadata", "sap/ui/core/mvc/ControllerMetadata"], function (merge, ObjectPath, uid, Metadata, ControllerMetadata) {
  "use strict";

  var _exports = {};
  const ensureMetadata = function (target) {
    target.metadata = merge({
      controllerExtensions: {},
      properties: {},
      aggregations: {},
      associations: {},
      methods: {},
      events: {},
      interfaces: []
    }, target.metadata || {});
    return target.metadata;
  };

  /* #region CONTROLLER EXTENSIONS */

  /**
   * Defines that the following method is an override for the method name with the same name in the specific controller extension or base implementation.
   *
   * @param extensionName The name of the extension that will be overridden
   * @returns The decorated method
   */
  function methodOverride(extensionName) {
    return function (target, propertyKey) {
      if (!target.override) {
        target.override = {};
      }
      let currentTarget = target.override;
      if (extensionName) {
        if (!currentTarget.extension) {
          currentTarget.extension = {};
        }
        if (!currentTarget.extension[extensionName]) {
          currentTarget.extension[extensionName] = {};
        }
        currentTarget = currentTarget.extension[extensionName];
      }
      currentTarget[propertyKey.toString()] = target[propertyKey.toString()];
    };
  }

  /**
   * Defines that the method can be extended by other controller extension based on the defined overrideExecutionType.
   *
   * @param overrideExecutionType The OverrideExecution defining when the override should run (Before / After / Instead)
   * @returns The decorated method
   */
  _exports.methodOverride = methodOverride;
  function extensible(overrideExecutionType) {
    return function (target, propertyKey) {
      const metadata = ensureMetadata(target);
      if (!metadata.methods[propertyKey.toString()]) {
        metadata.methods[propertyKey.toString()] = {};
      }
      metadata.methods[propertyKey.toString()].overrideExecution = overrideExecutionType;
    };
  }

  /**
   * Defines that the method will be publicly available for controller extension usage.
   *
   * @returns The decorated method
   */
  _exports.extensible = extensible;
  function publicExtension() {
    return function (target, propertyKey, descriptor) {
      const metadata = ensureMetadata(target);
      descriptor.enumerable = true;
      if (!metadata.methods[propertyKey.toString()]) {
        metadata.methods[propertyKey.toString()] = {};
      }
      metadata.methods[propertyKey.toString()].public = true;
    };
  }
  /**
   * Defines that the method will be only available for internal usage of the controller extension.
   *
   * @returns The decorated method
   */
  _exports.publicExtension = publicExtension;
  function privateExtension() {
    return function (target, propertyKey, descriptor) {
      const metadata = ensureMetadata(target);
      descriptor.enumerable = true;
      if (!metadata.methods[propertyKey.toString()]) {
        metadata.methods[propertyKey.toString()] = {};
      }
      metadata.methods[propertyKey.toString()].public = false;
    };
  }
  /**
   * Defines that the method cannot be further extended by other controller extension.
   *
   * @returns The decorated method
   */
  _exports.privateExtension = privateExtension;
  function finalExtension() {
    return function (target, propertyKey, descriptor) {
      const metadata = ensureMetadata(target);
      descriptor.enumerable = true;
      if (!metadata.methods[propertyKey.toString()]) {
        metadata.methods[propertyKey.toString()] = {};
      }
      metadata.methods[propertyKey.toString()].final = true;
    };
  }

  /**
   * Defines that we are going to use instantiate a controller extension under the following variable name.
   *
   * @param extensionClass The controller extension that will be instantiated
   * @returns The decorated property
   */
  _exports.finalExtension = finalExtension;
  function usingExtension(extensionClass) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target);
      delete propertyDescriptor.initializer;
      metadata.controllerExtensions[propertyKey.toString()] = extensionClass;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if I declare it as such.
  }

  /* #endregion */

  /* #region CONTROL */
  /**
   * Indicates that the property shall be declared as an event on the control metadata.
   *
   * @returns The decorated property
   */
  _exports.usingExtension = usingExtension;
  function event() {
    return function (target, eventKey) {
      const metadata = ensureMetadata(target);
      if (!metadata.events[eventKey.toString()]) {
        metadata.events[eventKey.toString()] = {};
      }
    };
  }

  /**
   * Defines the following property in the control metatada.
   *
   * @param attributeDefinition The property definition
   * @returns The decorated property.
   */
  _exports.event = event;
  function property(attributeDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target);
      if (!metadata.properties[propertyKey]) {
        metadata.properties[propertyKey] = attributeDefinition;
      }
      delete propertyDescriptor.writable;
      delete propertyDescriptor.initializer;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
  }
  /**
   * Defines and configure the following aggregation in the control metatada.
   *
   * @param aggregationDefinition The aggregation definition
   * @returns The decorated property.
   */
  _exports.property = property;
  function aggregation(aggregationDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target);
      if (aggregationDefinition.multiple === undefined) {
        // UI5 defaults this to true but this is just weird...
        aggregationDefinition.multiple = false;
      }
      if (!metadata.aggregations[propertyKey]) {
        metadata.aggregations[propertyKey] = aggregationDefinition;
      }
      if (aggregationDefinition.isDefault) {
        metadata.defaultAggregation = propertyKey;
      }
      delete propertyDescriptor.writable;
      delete propertyDescriptor.initializer;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
  }

  /**
   * Defines and configure the following association in the control metatada.
   *
   * @param ui5AssociationMetadata The definition of the association.
   * @returns The decorated property
   */
  _exports.aggregation = aggregation;
  function association(ui5AssociationMetadata) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target);
      if (!metadata.associations[propertyKey]) {
        metadata.associations[propertyKey] = ui5AssociationMetadata;
      }
      delete propertyDescriptor.writable;
      delete propertyDescriptor.initializer;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
  }

  /**
   * Defines in the metadata that this control implements a specific interface.
   *
   * @param interfaceName The name of the implemented interface
   * @returns The decorated method
   */
  _exports.association = association;
  function implementInterface(interfaceName) {
    return function (target) {
      const metadata = ensureMetadata(target);
      metadata.interfaces.push(interfaceName);
    };
  }

  /**
   * Indicates that the following method should also be exposed statically so we can call it from XML.
   *
   * @returns The decorated method
   */
  _exports.implementInterface = implementInterface;
  function xmlEventHandler() {
    return function (target, propertykey) {
      const currentConstructor = target.constructor;
      currentConstructor[propertykey.toString()] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (args && args.length) {
          const currentTarget = currentConstructor.getAPI(args[0]);
          currentTarget === null || currentTarget === void 0 ? void 0 : currentTarget[propertykey.toString()](...args);
        }
      };
    };
  }

  /**
   * Indicates that the following class should define a UI5 control of the specified name.
   *
   * @param sTarget The fully qualified name of the UI5 class
   * @param metadataDefinition Inline metadata definition
   * @class
   */
  _exports.xmlEventHandler = xmlEventHandler;
  function defineUI5Class(sTarget, metadataDefinition) {
    return function (constructor) {
      if (!constructor.prototype.metadata) {
        constructor.prototype.metadata = {};
      }
      if (metadataDefinition) {
        for (const key in metadataDefinition) {
          constructor.prototype.metadata[key] = metadataDefinition[key];
        }
      }
      return registerUI5Metadata(constructor, sTarget, constructor.prototype);
    };
  }
  _exports.defineUI5Class = defineUI5Class;
  function createReference() {
    return {
      current: undefined,
      setCurrent: function (oControlInstance) {
        this.current = oControlInstance;
      }
    };
  }
  /**
   * Defines that the following object will hold a reference to a control through jsx templating.
   *
   * @returns The decorated property.
   */
  _exports.createReference = createReference;
  function defineReference() {
    return function (target, propertyKey, propertyDescriptor) {
      delete propertyDescriptor.writable;
      delete propertyDescriptor.initializer;
      propertyDescriptor.initializer = createReference;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
  }

  /**
   * Internal heavy lifting that will take care of creating the class property for ui5 to use.
   *
   * @param clazz The class prototype
   * @param name The name of the class to create
   * @param inObj The metadata object
   * @returns The metadata class
   */
  _exports.defineReference = defineReference;
  function registerUI5Metadata(clazz, name, inObj) {
    var _clazz$getMetadata, _inObj$metadata, _clazz$metadata, _obj$metadata;
    if (clazz.getMetadata && clazz.getMetadata().isA("sap.ui.core.mvc.ControllerExtension")) {
      Object.getOwnPropertyNames(inObj).forEach(objName => {
        const descriptor = Object.getOwnPropertyDescriptor(inObj, objName);
        if (descriptor && !descriptor.enumerable) {
          descriptor.enumerable = true;
          //		Log.error(`Property ${objName} from ${name} should be decorated as public`);
        }
      });
    }

    const obj = {};
    obj.metadata = inObj.metadata || {};
    obj.override = inObj.override;
    obj.constructor = clazz;
    obj.metadata.baseType = Object.getPrototypeOf(clazz.prototype).getMetadata().getName();
    if ((clazz === null || clazz === void 0 ? void 0 : (_clazz$getMetadata = clazz.getMetadata()) === null || _clazz$getMetadata === void 0 ? void 0 : _clazz$getMetadata.getStereotype()) === "control") {
      const rendererDefinition = inObj.renderer || clazz.renderer || clazz.render;
      obj.renderer = {
        apiVersion: 2
      };
      if (typeof rendererDefinition === "function") {
        obj.renderer.render = rendererDefinition;
      } else if (rendererDefinition != undefined) {
        obj.renderer = rendererDefinition;
      }
    }
    obj.metadata.interfaces = ((_inObj$metadata = inObj.metadata) === null || _inObj$metadata === void 0 ? void 0 : _inObj$metadata.interfaces) || ((_clazz$metadata = clazz.metadata) === null || _clazz$metadata === void 0 ? void 0 : _clazz$metadata.interfaces);
    Object.keys(clazz.prototype).forEach(key => {
      if (key !== "metadata") {
        try {
          obj[key] = clazz.prototype[key];
        } catch (e) {
          //console.log(e);
        }
      }
    });
    if ((_obj$metadata = obj.metadata) !== null && _obj$metadata !== void 0 && _obj$metadata.controllerExtensions && Object.keys(obj.metadata.controllerExtensions).length > 0) {
      for (const cExtName in obj.metadata.controllerExtensions) {
        obj[cExtName] = obj.metadata.controllerExtensions[cExtName];
      }
    }
    const output = clazz.extend(name, obj);
    const fnInit = output.prototype.init;
    output.prototype.init = function () {
      if (fnInit) {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        fnInit.apply(this, args);
      }
      this.metadata = obj.metadata;
      if (obj.metadata.properties) {
        const aPropertyKeys = Object.keys(obj.metadata.properties);
        aPropertyKeys.forEach(propertyKey => {
          Object.defineProperty(this, propertyKey, {
            configurable: true,
            set: v => {
              return this.setProperty(propertyKey, v);
            },
            get: () => {
              return this.getProperty(propertyKey);
            }
          });
        });
        const aAggregationKeys = Object.keys(obj.metadata.aggregations);
        aAggregationKeys.forEach(aggregationKey => {
          Object.defineProperty(this, aggregationKey, {
            configurable: true,
            set: v => {
              return this.setAggregation(aggregationKey, v);
            },
            get: () => {
              const aggregationContent = this.getAggregation(aggregationKey);
              if (obj.metadata.aggregations[aggregationKey].multiple) {
                return aggregationContent || [];
              } else {
                return aggregationContent;
              }
            }
          });
        });
        const aAssociationKeys = Object.keys(obj.metadata.associations);
        aAssociationKeys.forEach(associationKey => {
          Object.defineProperty(this, associationKey, {
            configurable: true,
            set: v => {
              return this.setAssociation(associationKey, v);
            },
            get: () => {
              const aggregationContent = this.getAssociation(associationKey);
              if (obj.metadata.associations[associationKey].multiple) {
                return aggregationContent || [];
              } else {
                return aggregationContent;
              }
            }
          });
        });
      }
    };
    clazz.override = function (oExtension) {
      const pol = {};
      pol.constructor = function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        return clazz.apply(this, args);
      };
      const oClass = Metadata.createClass(clazz, `anonymousExtension~${uid()}`, pol, ControllerMetadata);
      oClass.getMetadata()._staticOverride = oExtension;
      oClass.getMetadata()._override = clazz.getMetadata()._override;
      return oClass;
    };
    ObjectPath.set(name, output);
    return output;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlbnN1cmVNZXRhZGF0YSIsInRhcmdldCIsIm1ldGFkYXRhIiwibWVyZ2UiLCJjb250cm9sbGVyRXh0ZW5zaW9ucyIsInByb3BlcnRpZXMiLCJhZ2dyZWdhdGlvbnMiLCJhc3NvY2lhdGlvbnMiLCJtZXRob2RzIiwiZXZlbnRzIiwiaW50ZXJmYWNlcyIsIm1ldGhvZE92ZXJyaWRlIiwiZXh0ZW5zaW9uTmFtZSIsInByb3BlcnR5S2V5Iiwib3ZlcnJpZGUiLCJjdXJyZW50VGFyZ2V0IiwiZXh0ZW5zaW9uIiwidG9TdHJpbmciLCJleHRlbnNpYmxlIiwib3ZlcnJpZGVFeGVjdXRpb25UeXBlIiwib3ZlcnJpZGVFeGVjdXRpb24iLCJwdWJsaWNFeHRlbnNpb24iLCJkZXNjcmlwdG9yIiwiZW51bWVyYWJsZSIsInB1YmxpYyIsInByaXZhdGVFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImZpbmFsIiwidXNpbmdFeHRlbnNpb24iLCJleHRlbnNpb25DbGFzcyIsInByb3BlcnR5RGVzY3JpcHRvciIsImluaXRpYWxpemVyIiwiZXZlbnQiLCJldmVudEtleSIsInByb3BlcnR5IiwiYXR0cmlidXRlRGVmaW5pdGlvbiIsIndyaXRhYmxlIiwiYWdncmVnYXRpb24iLCJhZ2dyZWdhdGlvbkRlZmluaXRpb24iLCJtdWx0aXBsZSIsInVuZGVmaW5lZCIsImlzRGVmYXVsdCIsImRlZmF1bHRBZ2dyZWdhdGlvbiIsImFzc29jaWF0aW9uIiwidWk1QXNzb2NpYXRpb25NZXRhZGF0YSIsImltcGxlbWVudEludGVyZmFjZSIsImludGVyZmFjZU5hbWUiLCJwdXNoIiwieG1sRXZlbnRIYW5kbGVyIiwicHJvcGVydHlrZXkiLCJjdXJyZW50Q29uc3RydWN0b3IiLCJjb25zdHJ1Y3RvciIsImFyZ3MiLCJsZW5ndGgiLCJnZXRBUEkiLCJkZWZpbmVVSTVDbGFzcyIsInNUYXJnZXQiLCJtZXRhZGF0YURlZmluaXRpb24iLCJwcm90b3R5cGUiLCJrZXkiLCJyZWdpc3RlclVJNU1ldGFkYXRhIiwiY3JlYXRlUmVmZXJlbmNlIiwiY3VycmVudCIsInNldEN1cnJlbnQiLCJvQ29udHJvbEluc3RhbmNlIiwiZGVmaW5lUmVmZXJlbmNlIiwiY2xhenoiLCJuYW1lIiwiaW5PYmoiLCJnZXRNZXRhZGF0YSIsImlzQSIsIk9iamVjdCIsImdldE93blByb3BlcnR5TmFtZXMiLCJmb3JFYWNoIiwib2JqTmFtZSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsIm9iaiIsImJhc2VUeXBlIiwiZ2V0UHJvdG90eXBlT2YiLCJnZXROYW1lIiwiZ2V0U3RlcmVvdHlwZSIsInJlbmRlcmVyRGVmaW5pdGlvbiIsInJlbmRlcmVyIiwicmVuZGVyIiwiYXBpVmVyc2lvbiIsImtleXMiLCJlIiwiY0V4dE5hbWUiLCJvdXRwdXQiLCJleHRlbmQiLCJmbkluaXQiLCJpbml0IiwiYXBwbHkiLCJhUHJvcGVydHlLZXlzIiwiZGVmaW5lUHJvcGVydHkiLCJjb25maWd1cmFibGUiLCJzZXQiLCJ2Iiwic2V0UHJvcGVydHkiLCJnZXQiLCJnZXRQcm9wZXJ0eSIsImFBZ2dyZWdhdGlvbktleXMiLCJhZ2dyZWdhdGlvbktleSIsInNldEFnZ3JlZ2F0aW9uIiwiYWdncmVnYXRpb25Db250ZW50IiwiZ2V0QWdncmVnYXRpb24iLCJhQXNzb2NpYXRpb25LZXlzIiwiYXNzb2NpYXRpb25LZXkiLCJzZXRBc3NvY2lhdGlvbiIsImdldEFzc29jaWF0aW9uIiwib0V4dGVuc2lvbiIsInBvbCIsIm9DbGFzcyIsIk1ldGFkYXRhIiwiY3JlYXRlQ2xhc3MiLCJ1aWQiLCJDb250cm9sbGVyTWV0YWRhdGEiLCJfc3RhdGljT3ZlcnJpZGUiLCJfb3ZlcnJpZGUiLCJPYmplY3RQYXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDbGFzc1N1cHBvcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1lcmdlIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgT2JqZWN0UGF0aCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9PYmplY3RQYXRoXCI7XG5pbXBvcnQgdWlkIGZyb20gXCJzYXAvYmFzZS91dGlsL3VpZFwiO1xuaW1wb3J0IHR5cGUgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgTWV0YWRhdGEgZnJvbSBcInNhcC91aS9iYXNlL01ldGFkYXRhXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IENvbnRyb2xsZXJNZXRhZGF0YSBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJNZXRhZGF0YVwiO1xuaW1wb3J0IHR5cGUgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuXG50eXBlIE92ZXJyaWRlRGVmaW5pdGlvbiA9IFJlY29yZDxzdHJpbmcsIEZ1bmN0aW9uPjtcbnR5cGUgVUk1Q29udHJvbGxlck1ldGhvZERlZmluaXRpb24gPSB7XG5cdG92ZXJyaWRlRXhlY3V0aW9uPzogT3ZlcnJpZGVFeGVjdXRpb247XG5cdHB1YmxpYz86IGJvb2xlYW47XG5cdGZpbmFsPzogYm9vbGVhbjtcbn07XG50eXBlIFVJNVByb3BlcnR5TWV0YWRhdGEgPSB7XG5cdHR5cGU6IHN0cmluZztcblx0cmVxdWlyZWQ/OiBib29sZWFuO1xuXHRncm91cD86IHN0cmluZztcblx0ZGVmYXVsdFZhbHVlPzogYW55O1xuXHRleHBlY3RlZEFubm90YXRpb25zPzogc3RyaW5nW107XG5cdGV4cGVjdGVkVHlwZXM/OiBzdHJpbmdbXTtcblx0YWxsb3dlZFZhbHVlcz86IHN0cmluZ1tdO1xufTtcbnR5cGUgVUk1QWdncmVnYXRpb25NZXRhZGF0YSA9IHtcblx0dHlwZTogc3RyaW5nO1xuXHRtdWx0aXBsZT86IGJvb2xlYW47XG5cdGlzRGVmYXVsdD86IGJvb2xlYW47XG5cdHNpbmd1bGFyTmFtZT86IHN0cmluZztcblx0dmlzaWJpbGl0eT86IHN0cmluZztcbn07XG50eXBlIFVJNUFzc29jaWF0aW9uTWV0YWRhdGEgPSB7XG5cdHR5cGU6IHN0cmluZztcblx0bXVsdGlwbGU/OiBib29sZWFuO1xuXHRzaW5ndWxhck5hbWU/OiBzdHJpbmc7XG59O1xudHlwZSBVSTVDb250cm9sTWV0YWRhdGFEZWZpbml0aW9uID0ge1xuXHRkZWZhdWx0QWdncmVnYXRpb24/OiBzdHJpbmc7XG5cdGNvbnRyb2xsZXJFeHRlbnNpb25zOiBSZWNvcmQ8c3RyaW5nLCB0eXBlb2YgQ29udHJvbGxlckV4dGVuc2lvbiB8IEZ1bmN0aW9uPjtcblx0cHJvcGVydGllczogUmVjb3JkPHN0cmluZywgVUk1UHJvcGVydHlNZXRhZGF0YT47XG5cdGFnZ3JlZ2F0aW9uczogUmVjb3JkPHN0cmluZywgVUk1QWdncmVnYXRpb25NZXRhZGF0YT47XG5cdGFzc29jaWF0aW9uczogUmVjb3JkPHN0cmluZywgVUk1QXNzb2NpYXRpb25NZXRhZGF0YT47XG5cdG1ldGhvZHM6IFJlY29yZDxzdHJpbmcsIFVJNUNvbnRyb2xsZXJNZXRob2REZWZpbml0aW9uPjtcblx0ZXZlbnRzOiBSZWNvcmQ8c3RyaW5nLCB7fT47XG5cdGludGVyZmFjZXM6IHN0cmluZ1tdO1xufTtcbnR5cGUgVUk1Q29udHJvbGxlciA9IHtcblx0b3ZlcnJpZGU/OiB7IGV4dGVuc2lvbj86IFJlY29yZDxzdHJpbmcsIE92ZXJyaWRlRGVmaW5pdGlvbj4gfSAmIHtcblx0XHRbazogc3RyaW5nXTogRnVuY3Rpb247XG5cdH07XG5cdG1ldGFkYXRhPzogVUk1Q29udHJvbE1ldGFkYXRhRGVmaW5pdGlvbjtcbn07XG5cbnR5cGUgVUk1Q29udHJvbCA9IHtcblx0bWV0YWRhdGE/OiBVSTVDb250cm9sTWV0YWRhdGFEZWZpbml0aW9uO1xufTtcblxudHlwZSBVSTVBUElDb250cm9sID0gVUk1Q29udHJvbCAmIHtcblx0Z2V0QVBJKGV2ZW50OiBVSTVFdmVudCk6IFVJNUFQSUNvbnRyb2w7XG5cdFtrOiBzdHJpbmddOiBGdW5jdGlvbjtcbn07XG5cbnR5cGUgQ29udHJvbFByb3BlcnR5TmFtZXM8VD4gPSB7XG5cdFtLIGluIGtleW9mIFRdOiBUW0tdIGV4dGVuZHMgRnVuY3Rpb24gPyBuZXZlciA6IEs7XG59W2tleW9mIFRdO1xuZXhwb3J0IHR5cGUgUHJvcGVydGllc09mPFQ+ID0gUGFydGlhbDxQaWNrPFQsIENvbnRyb2xQcm9wZXJ0eU5hbWVzPFQ+Pj47XG5leHBvcnQgdHlwZSBTdHJpY3RQcm9wZXJ0aWVzT2Y8VD4gPSBQaWNrPFQsIENvbnRyb2xQcm9wZXJ0eU5hbWVzPFQ+PjtcbmV4cG9ydCB0eXBlIEVuaGFuY2VXaXRoVUk1PFQ+ID0ge1xuXHRuZXcgKHByb3BzOiBQcm9wZXJ0aWVzT2Y8VD4pOiBFbmhhbmNlV2l0aFVJNTxUPjtcblx0bmV3IChzSWQ6IHN0cmluZywgcHJvcHM6IFByb3BlcnRpZXNPZjxUPik6IEVuaGFuY2VXaXRoVUk1PFQ+O1xufSAmIFQgJiB7XG5cdFx0Ly8gQWRkIGFsbCB0aGUgZ2V0WFhYIG1ldGhvZCwgbWlnaHQgYWRkIHRvbyBtdWNoIGFzIEknbSBub3QgZmlsdGVyaW5nIG9uIGFjdHVhbCBwcm9wZXJ0aWVzLi4uXG5cdFx0W1AgaW4ga2V5b2YgVCBhcyBgZ2V0JHtDYXBpdGFsaXplPHN0cmluZyAmIFA+fWBdOiAoKSA9PiBUW1BdO1xuXHR9O1xuY29uc3QgZW5zdXJlTWV0YWRhdGEgPSBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sbGVyKSB7XG5cdHRhcmdldC5tZXRhZGF0YSA9IG1lcmdlKFxuXHRcdHtcblx0XHRcdGNvbnRyb2xsZXJFeHRlbnNpb25zOiB7fSxcblx0XHRcdHByb3BlcnRpZXM6IHt9LFxuXHRcdFx0YWdncmVnYXRpb25zOiB7fSxcblx0XHRcdGFzc29jaWF0aW9uczoge30sXG5cdFx0XHRtZXRob2RzOiB7fSxcblx0XHRcdGV2ZW50czoge30sXG5cdFx0XHRpbnRlcmZhY2VzOiBbXVxuXHRcdH0sXG5cdFx0dGFyZ2V0Lm1ldGFkYXRhIHx8IHt9XG5cdCkgYXMgVUk1Q29udHJvbE1ldGFkYXRhRGVmaW5pdGlvbjtcblx0cmV0dXJuIHRhcmdldC5tZXRhZGF0YTtcbn07XG5cbi8qICNyZWdpb24gQ09OVFJPTExFUiBFWFRFTlNJT05TICovXG5cbi8qKlxuICogRGVmaW5lcyB0aGF0IHRoZSBmb2xsb3dpbmcgbWV0aG9kIGlzIGFuIG92ZXJyaWRlIGZvciB0aGUgbWV0aG9kIG5hbWUgd2l0aCB0aGUgc2FtZSBuYW1lIGluIHRoZSBzcGVjaWZpYyBjb250cm9sbGVyIGV4dGVuc2lvbiBvciBiYXNlIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBwYXJhbSBleHRlbnNpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBleHRlbnNpb24gdGhhdCB3aWxsIGJlIG92ZXJyaWRkZW5cbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXRob2RPdmVycmlkZShleHRlbnNpb25OYW1lPzogc3RyaW5nKTogTWV0aG9kRGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2xsZXIsIHByb3BlcnR5S2V5KSB7XG5cdFx0aWYgKCF0YXJnZXQub3ZlcnJpZGUpIHtcblx0XHRcdHRhcmdldC5vdmVycmlkZSA9IHt9O1xuXHRcdH1cblx0XHRsZXQgY3VycmVudFRhcmdldCA9IHRhcmdldC5vdmVycmlkZTtcblx0XHRpZiAoZXh0ZW5zaW9uTmFtZSkge1xuXHRcdFx0aWYgKCFjdXJyZW50VGFyZ2V0LmV4dGVuc2lvbikge1xuXHRcdFx0XHRjdXJyZW50VGFyZ2V0LmV4dGVuc2lvbiA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFjdXJyZW50VGFyZ2V0LmV4dGVuc2lvbltleHRlbnNpb25OYW1lXSkge1xuXHRcdFx0XHRjdXJyZW50VGFyZ2V0LmV4dGVuc2lvbltleHRlbnNpb25OYW1lXSA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0Y3VycmVudFRhcmdldCA9IGN1cnJlbnRUYXJnZXQuZXh0ZW5zaW9uW2V4dGVuc2lvbk5hbWVdO1xuXHRcdH1cblx0XHRjdXJyZW50VGFyZ2V0W3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldID0gKHRhcmdldCBhcyBhbnkpW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldO1xuXHR9O1xufVxuXG4vKipcbiAqIERlZmluZXMgdGhhdCB0aGUgbWV0aG9kIGNhbiBiZSBleHRlbmRlZCBieSBvdGhlciBjb250cm9sbGVyIGV4dGVuc2lvbiBiYXNlZCBvbiB0aGUgZGVmaW5lZCBvdmVycmlkZUV4ZWN1dGlvblR5cGUuXG4gKlxuICogQHBhcmFtIG92ZXJyaWRlRXhlY3V0aW9uVHlwZSBUaGUgT3ZlcnJpZGVFeGVjdXRpb24gZGVmaW5pbmcgd2hlbiB0aGUgb3ZlcnJpZGUgc2hvdWxkIHJ1biAoQmVmb3JlIC8gQWZ0ZXIgLyBJbnN0ZWFkKVxuICogQHJldHVybnMgVGhlIGRlY29yYXRlZCBtZXRob2RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuc2libGUob3ZlcnJpZGVFeGVjdXRpb25UeXBlPzogT3ZlcnJpZGVFeGVjdXRpb24pOiBNZXRob2REZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogVUk1Q29udHJvbGxlciwgcHJvcGVydHlLZXkpIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKHRhcmdldCk7XG5cdFx0aWYgKCFtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldKSB7XG5cdFx0XHRtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldID0ge307XG5cdFx0fVxuXHRcdG1ldGFkYXRhLm1ldGhvZHNbcHJvcGVydHlLZXkudG9TdHJpbmcoKV0ub3ZlcnJpZGVFeGVjdXRpb24gPSBvdmVycmlkZUV4ZWN1dGlvblR5cGU7XG5cdH07XG59XG5cbi8qKlxuICogRGVmaW5lcyB0aGF0IHRoZSBtZXRob2Qgd2lsbCBiZSBwdWJsaWNseSBhdmFpbGFibGUgZm9yIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIHVzYWdlLlxuICpcbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwdWJsaWNFeHRlbnNpb24oKTogTWV0aG9kRGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2xsZXIsIHByb3BlcnR5S2V5LCBkZXNjcmlwdG9yKTogdm9pZCB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQpO1xuXHRcdGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IHRydWU7XG5cdFx0aWYgKCFtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldKSB7XG5cdFx0XHRtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldID0ge307XG5cdFx0fVxuXHRcdG1ldGFkYXRhLm1ldGhvZHNbcHJvcGVydHlLZXkudG9TdHJpbmcoKV0ucHVibGljID0gdHJ1ZTtcblx0fTtcbn1cbi8qKlxuICogRGVmaW5lcyB0aGF0IHRoZSBtZXRob2Qgd2lsbCBiZSBvbmx5IGF2YWlsYWJsZSBmb3IgaW50ZXJuYWwgdXNhZ2Ugb2YgdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uLlxuICpcbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcml2YXRlRXh0ZW5zaW9uKCk6IE1ldGhvZERlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sbGVyLCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvcikge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gZW5zdXJlTWV0YWRhdGEodGFyZ2V0KTtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdGlmICghbWV0YWRhdGEubWV0aG9kc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSkge1xuXHRcdFx0bWV0YWRhdGEubWV0aG9kc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSA9IHt9O1xuXHRcdH1cblx0XHRtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldLnB1YmxpYyA9IGZhbHNlO1xuXHR9O1xufVxuLyoqXG4gKiBEZWZpbmVzIHRoYXQgdGhlIG1ldGhvZCBjYW5ub3QgYmUgZnVydGhlciBleHRlbmRlZCBieSBvdGhlciBjb250cm9sbGVyIGV4dGVuc2lvbi5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIG1ldGhvZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluYWxFeHRlbnNpb24oKTogTWV0aG9kRGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2xsZXIsIHByb3BlcnR5S2V5LCBkZXNjcmlwdG9yKSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQpO1xuXHRcdGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IHRydWU7XG5cdFx0aWYgKCFtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldKSB7XG5cdFx0XHRtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldID0ge307XG5cdFx0fVxuXHRcdG1ldGFkYXRhLm1ldGhvZHNbcHJvcGVydHlLZXkudG9TdHJpbmcoKV0uZmluYWwgPSB0cnVlO1xuXHR9O1xufVxuXG4vKipcbiAqIERlZmluZXMgdGhhdCB3ZSBhcmUgZ29pbmcgdG8gdXNlIGluc3RhbnRpYXRlIGEgY29udHJvbGxlciBleHRlbnNpb24gdW5kZXIgdGhlIGZvbGxvd2luZyB2YXJpYWJsZSBuYW1lLlxuICpcbiAqIEBwYXJhbSBleHRlbnNpb25DbGFzcyBUaGUgY29udHJvbGxlciBleHRlbnNpb24gdGhhdCB3aWxsIGJlIGluc3RhbnRpYXRlZFxuICogQHJldHVybnMgVGhlIGRlY29yYXRlZCBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNpbmdFeHRlbnNpb24oZXh0ZW5zaW9uQ2xhc3M6IHR5cGVvZiBDb250cm9sbGVyRXh0ZW5zaW9uIHwgRnVuY3Rpb24pOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sbGVyLCBwcm9wZXJ0eUtleTogc3RyaW5nLCBwcm9wZXJ0eURlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKHRhcmdldCk7XG5cdFx0ZGVsZXRlIChwcm9wZXJ0eURlc2NyaXB0b3IgYXMgYW55KS5pbml0aWFsaXplcjtcblx0XHRtZXRhZGF0YS5jb250cm9sbGVyRXh0ZW5zaW9uc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSA9IGV4dGVuc2lvbkNsYXNzO1xuXHRcdHJldHVybiBwcm9wZXJ0eURlc2NyaXB0b3I7XG5cdH0gYXMgYW55OyAvLyBUaGlzIGlzIHRlY2huaWNhbGx5IGFuIGFjY2Vzc29yIGRlY29yYXRvciwgYnV0IHNvbWVob3cgdGhlIGNvbXBpbGVyIGRvZXNuJ3QgbGlrZSBpdCBpZiBJIGRlY2xhcmUgaXQgYXMgc3VjaC5cbn1cblxuLyogI2VuZHJlZ2lvbiAqL1xuXG4vKiAjcmVnaW9uIENPTlRST0wgKi9cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgdGhlIHByb3BlcnR5IHNoYWxsIGJlIGRlY2xhcmVkIGFzIGFuIGV2ZW50IG9uIHRoZSBjb250cm9sIG1ldGFkYXRhLlxuICpcbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50KCk6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2wsIGV2ZW50S2V5KSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQpO1xuXHRcdGlmICghbWV0YWRhdGEuZXZlbnRzW2V2ZW50S2V5LnRvU3RyaW5nKCldKSB7XG5cdFx0XHRtZXRhZGF0YS5ldmVudHNbZXZlbnRLZXkudG9TdHJpbmcoKV0gPSB7fTtcblx0XHR9XG5cdH07XG59XG5cbi8qKlxuICogRGVmaW5lcyB0aGUgZm9sbG93aW5nIHByb3BlcnR5IGluIHRoZSBjb250cm9sIG1ldGF0YWRhLlxuICpcbiAqIEBwYXJhbSBhdHRyaWJ1dGVEZWZpbml0aW9uIFRoZSBwcm9wZXJ0eSBkZWZpbml0aW9uXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvcGVydHkoYXR0cmlidXRlRGVmaW5pdGlvbjogVUk1UHJvcGVydHlNZXRhZGF0YSk6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2wsIHByb3BlcnR5S2V5OiBzdHJpbmcsIHByb3BlcnR5RGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55Pikge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gZW5zdXJlTWV0YWRhdGEodGFyZ2V0KTtcblx0XHRpZiAoIW1ldGFkYXRhLnByb3BlcnRpZXNbcHJvcGVydHlLZXldKSB7XG5cdFx0XHRtZXRhZGF0YS5wcm9wZXJ0aWVzW3Byb3BlcnR5S2V5XSA9IGF0dHJpYnV0ZURlZmluaXRpb247XG5cdFx0fVxuXHRcdGRlbGV0ZSBwcm9wZXJ0eURlc2NyaXB0b3Iud3JpdGFibGU7XG5cdFx0ZGVsZXRlIChwcm9wZXJ0eURlc2NyaXB0b3IgYXMgYW55KS5pbml0aWFsaXplcjtcblxuXHRcdHJldHVybiBwcm9wZXJ0eURlc2NyaXB0b3I7XG5cdH0gYXMgYW55OyAvLyBUaGlzIGlzIHRlY2huaWNhbGx5IGFuIGFjY2Vzc29yIGRlY29yYXRvciwgYnV0IHNvbWVob3cgdGhlIGNvbXBpbGVyIGRvZXNuJ3QgbGlrZSBpdCBpZiBpIGRlY2xhcmUgaXQgYXMgc3VjaC47XG59XG4vKipcbiAqIERlZmluZXMgYW5kIGNvbmZpZ3VyZSB0aGUgZm9sbG93aW5nIGFnZ3JlZ2F0aW9uIGluIHRoZSBjb250cm9sIG1ldGF0YWRhLlxuICpcbiAqIEBwYXJhbSBhZ2dyZWdhdGlvbkRlZmluaXRpb24gVGhlIGFnZ3JlZ2F0aW9uIGRlZmluaXRpb25cbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZ2dyZWdhdGlvbihhZ2dyZWdhdGlvbkRlZmluaXRpb246IFVJNUFnZ3JlZ2F0aW9uTWV0YWRhdGEpOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sLCBwcm9wZXJ0eUtleTogc3RyaW5nLCBwcm9wZXJ0eURlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKHRhcmdldCk7XG5cdFx0aWYgKGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbi5tdWx0aXBsZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBVSTUgZGVmYXVsdHMgdGhpcyB0byB0cnVlIGJ1dCB0aGlzIGlzIGp1c3Qgd2VpcmQuLi5cblx0XHRcdGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbi5tdWx0aXBsZSA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoIW1ldGFkYXRhLmFnZ3JlZ2F0aW9uc1twcm9wZXJ0eUtleV0pIHtcblx0XHRcdG1ldGFkYXRhLmFnZ3JlZ2F0aW9uc1twcm9wZXJ0eUtleV0gPSBhZ2dyZWdhdGlvbkRlZmluaXRpb247XG5cdFx0fVxuXHRcdGlmIChhZ2dyZWdhdGlvbkRlZmluaXRpb24uaXNEZWZhdWx0KSB7XG5cdFx0XHRtZXRhZGF0YS5kZWZhdWx0QWdncmVnYXRpb24gPSBwcm9wZXJ0eUtleTtcblx0XHR9XG5cdFx0ZGVsZXRlIHByb3BlcnR5RGVzY3JpcHRvci53cml0YWJsZTtcblx0XHRkZWxldGUgKHByb3BlcnR5RGVzY3JpcHRvciBhcyBhbnkpLmluaXRpYWxpemVyO1xuXG5cdFx0cmV0dXJuIHByb3BlcnR5RGVzY3JpcHRvcjtcblx0fSBhcyBhbnk7IC8vIFRoaXMgaXMgdGVjaG5pY2FsbHkgYW4gYWNjZXNzb3IgZGVjb3JhdG9yLCBidXQgc29tZWhvdyB0aGUgY29tcGlsZXIgZG9lc24ndCBsaWtlIGl0IGlmIGkgZGVjbGFyZSBpdCBhcyBzdWNoLjtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGFuZCBjb25maWd1cmUgdGhlIGZvbGxvd2luZyBhc3NvY2lhdGlvbiBpbiB0aGUgY29udHJvbCBtZXRhdGFkYS5cbiAqXG4gKiBAcGFyYW0gdWk1QXNzb2NpYXRpb25NZXRhZGF0YSBUaGUgZGVmaW5pdGlvbiBvZiB0aGUgYXNzb2NpYXRpb24uXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NvY2lhdGlvbih1aTVBc3NvY2lhdGlvbk1ldGFkYXRhOiBVSTVBc3NvY2lhdGlvbk1ldGFkYXRhKTogUHJvcGVydHlEZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogVUk1Q29udHJvbCwgcHJvcGVydHlLZXk6IHN0cmluZywgcHJvcGVydHlEZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQpO1xuXHRcdGlmICghbWV0YWRhdGEuYXNzb2NpYXRpb25zW3Byb3BlcnR5S2V5XSkge1xuXHRcdFx0bWV0YWRhdGEuYXNzb2NpYXRpb25zW3Byb3BlcnR5S2V5XSA9IHVpNUFzc29jaWF0aW9uTWV0YWRhdGE7XG5cdFx0fVxuXHRcdGRlbGV0ZSBwcm9wZXJ0eURlc2NyaXB0b3Iud3JpdGFibGU7XG5cdFx0ZGVsZXRlIChwcm9wZXJ0eURlc2NyaXB0b3IgYXMgYW55KS5pbml0aWFsaXplcjtcblxuXHRcdHJldHVybiBwcm9wZXJ0eURlc2NyaXB0b3I7XG5cdH0gYXMgYW55OyAvLyBUaGlzIGlzIHRlY2huaWNhbGx5IGFuIGFjY2Vzc29yIGRlY29yYXRvciwgYnV0IHNvbWVob3cgdGhlIGNvbXBpbGVyIGRvZXNuJ3QgbGlrZSBpdCBpZiBpIGRlY2xhcmUgaXQgYXMgc3VjaC47XG59XG5cbi8qKlxuICogRGVmaW5lcyBpbiB0aGUgbWV0YWRhdGEgdGhhdCB0aGlzIGNvbnRyb2wgaW1wbGVtZW50cyBhIHNwZWNpZmljIGludGVyZmFjZS5cbiAqXG4gKiBAcGFyYW0gaW50ZXJmYWNlTmFtZSBUaGUgbmFtZSBvZiB0aGUgaW1wbGVtZW50ZWQgaW50ZXJmYWNlXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIG1ldGhvZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW1wbGVtZW50SW50ZXJmYWNlKGludGVyZmFjZU5hbWU6IHN0cmluZyk6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2wpIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKHRhcmdldCk7XG5cblx0XHRtZXRhZGF0YS5pbnRlcmZhY2VzLnB1c2goaW50ZXJmYWNlTmFtZSk7XG5cdH07XG59XG5cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgdGhlIGZvbGxvd2luZyBtZXRob2Qgc2hvdWxkIGFsc28gYmUgZXhwb3NlZCBzdGF0aWNhbGx5IHNvIHdlIGNhbiBjYWxsIGl0IGZyb20gWE1MLlxuICpcbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB4bWxFdmVudEhhbmRsZXIoKTogTWV0aG9kRGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2wsIHByb3BlcnR5a2V5KSB7XG5cdFx0Y29uc3QgY3VycmVudENvbnN0cnVjdG9yOiBVSTVBUElDb250cm9sID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIHVua25vd24gYXMgVUk1QVBJQ29udHJvbDtcblx0XHRjdXJyZW50Q29uc3RydWN0b3JbcHJvcGVydHlrZXkudG9TdHJpbmcoKV0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcblx0XHRcdGlmIChhcmdzICYmIGFyZ3MubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRUYXJnZXQgPSBjdXJyZW50Q29uc3RydWN0b3IuZ2V0QVBJKGFyZ3NbMF0gYXMgVUk1RXZlbnQpO1xuXHRcdFx0XHRjdXJyZW50VGFyZ2V0Py5bcHJvcGVydHlrZXkudG9TdHJpbmcoKV0oLi4uYXJncyk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcbn1cblxuLyoqXG4gKiBJbmRpY2F0ZXMgdGhhdCB0aGUgZm9sbG93aW5nIGNsYXNzIHNob3VsZCBkZWZpbmUgYSBVSTUgY29udHJvbCBvZiB0aGUgc3BlY2lmaWVkIG5hbWUuXG4gKlxuICogQHBhcmFtIHNUYXJnZXQgVGhlIGZ1bGx5IHF1YWxpZmllZCBuYW1lIG9mIHRoZSBVSTUgY2xhc3NcbiAqIEBwYXJhbSBtZXRhZGF0YURlZmluaXRpb24gSW5saW5lIG1ldGFkYXRhIGRlZmluaXRpb25cbiAqIEBjbGFzc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lVUk1Q2xhc3Moc1RhcmdldDogc3RyaW5nLCBtZXRhZGF0YURlZmluaXRpb24/OiBhbnkpOiBDbGFzc0RlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAoY29uc3RydWN0b3I6IEZ1bmN0aW9uKSB7XG5cdFx0aWYgKCFjb25zdHJ1Y3Rvci5wcm90b3R5cGUubWV0YWRhdGEpIHtcblx0XHRcdGNvbnN0cnVjdG9yLnByb3RvdHlwZS5tZXRhZGF0YSA9IHt9O1xuXHRcdH1cblx0XHRpZiAobWV0YWRhdGFEZWZpbml0aW9uKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBtZXRhZGF0YURlZmluaXRpb24pIHtcblx0XHRcdFx0Y29uc3RydWN0b3IucHJvdG90eXBlLm1ldGFkYXRhW2tleV0gPSBtZXRhZGF0YURlZmluaXRpb25ba2V5IGFzIGtleW9mIFVJNUNvbnRyb2xNZXRhZGF0YURlZmluaXRpb25dO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVnaXN0ZXJVSTVNZXRhZGF0YShjb25zdHJ1Y3Rvciwgc1RhcmdldCwgY29uc3RydWN0b3IucHJvdG90eXBlKTtcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlZmVyZW5jZTxUPigpIHtcblx0cmV0dXJuIHtcblx0XHRjdXJyZW50OiB1bmRlZmluZWQgYXMgYW55IGFzIFQsXG5cdFx0c2V0Q3VycmVudDogZnVuY3Rpb24gKG9Db250cm9sSW5zdGFuY2U6IFQpOiB2b2lkIHtcblx0XHRcdHRoaXMuY3VycmVudCA9IG9Db250cm9sSW5zdGFuY2U7XG5cdFx0fVxuXHR9O1xufVxuLyoqXG4gKiBEZWZpbmVzIHRoYXQgdGhlIGZvbGxvd2luZyBvYmplY3Qgd2lsbCBob2xkIGEgcmVmZXJlbmNlIHRvIGEgY29udHJvbCB0aHJvdWdoIGpzeCB0ZW1wbGF0aW5nLlxuICpcbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVSZWZlcmVuY2UoKTogUHJvcGVydHlEZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogVUk1Q29udHJvbCwgcHJvcGVydHlLZXk6IHN0cmluZywgcHJvcGVydHlEZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSB7XG5cdFx0ZGVsZXRlIHByb3BlcnR5RGVzY3JpcHRvci53cml0YWJsZTtcblx0XHRkZWxldGUgKHByb3BlcnR5RGVzY3JpcHRvciBhcyBhbnkpLmluaXRpYWxpemVyO1xuXHRcdChwcm9wZXJ0eURlc2NyaXB0b3IgYXMgYW55KS5pbml0aWFsaXplciA9IGNyZWF0ZVJlZmVyZW5jZTtcblxuXHRcdHJldHVybiBwcm9wZXJ0eURlc2NyaXB0b3I7XG5cdH0gYXMgYW55OyAvLyBUaGlzIGlzIHRlY2huaWNhbGx5IGFuIGFjY2Vzc29yIGRlY29yYXRvciwgYnV0IHNvbWVob3cgdGhlIGNvbXBpbGVyIGRvZXNuJ3QgbGlrZSBpdCBpZiBpIGRlY2xhcmUgaXQgYXMgc3VjaC47XG59XG5cbi8qKlxuICogSW50ZXJuYWwgaGVhdnkgbGlmdGluZyB0aGF0IHdpbGwgdGFrZSBjYXJlIG9mIGNyZWF0aW5nIHRoZSBjbGFzcyBwcm9wZXJ0eSBmb3IgdWk1IHRvIHVzZS5cbiAqXG4gKiBAcGFyYW0gY2xhenogVGhlIGNsYXNzIHByb3RvdHlwZVxuICogQHBhcmFtIG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNsYXNzIHRvIGNyZWF0ZVxuICogQHBhcmFtIGluT2JqIFRoZSBtZXRhZGF0YSBvYmplY3RcbiAqIEByZXR1cm5zIFRoZSBtZXRhZGF0YSBjbGFzc1xuICovXG5mdW5jdGlvbiByZWdpc3RlclVJNU1ldGFkYXRhKGNsYXp6OiBhbnksIG5hbWU6IHN0cmluZywgaW5PYmo6IGFueSk6IGFueSB7XG5cdGlmIChjbGF6ei5nZXRNZXRhZGF0YSAmJiBjbGF6ei5nZXRNZXRhZGF0YSgpLmlzQShcInNhcC51aS5jb3JlLm12Yy5Db250cm9sbGVyRXh0ZW5zaW9uXCIpKSB7XG5cdFx0T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaW5PYmopLmZvckVhY2goKG9iak5hbWUpID0+IHtcblx0XHRcdGNvbnN0IGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGluT2JqLCBvYmpOYW1lKTtcblx0XHRcdGlmIChkZXNjcmlwdG9yICYmICFkZXNjcmlwdG9yLmVudW1lcmFibGUpIHtcblx0XHRcdFx0ZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gdHJ1ZTtcblx0XHRcdFx0Ly9cdFx0TG9nLmVycm9yKGBQcm9wZXJ0eSAke29iak5hbWV9IGZyb20gJHtuYW1lfSBzaG91bGQgYmUgZGVjb3JhdGVkIGFzIHB1YmxpY2ApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdGNvbnN0IG9iajogYW55ID0ge307XG5cdG9iai5tZXRhZGF0YSA9IGluT2JqLm1ldGFkYXRhIHx8IHt9O1xuXHRvYmoub3ZlcnJpZGUgPSBpbk9iai5vdmVycmlkZTtcblx0b2JqLmNvbnN0cnVjdG9yID0gY2xheno7XG5cdG9iai5tZXRhZGF0YS5iYXNlVHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjbGF6ei5wcm90b3R5cGUpLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpO1xuXG5cdGlmIChjbGF6ej8uZ2V0TWV0YWRhdGEoKT8uZ2V0U3RlcmVvdHlwZSgpID09PSBcImNvbnRyb2xcIikge1xuXHRcdGNvbnN0IHJlbmRlcmVyRGVmaW5pdGlvbiA9IGluT2JqLnJlbmRlcmVyIHx8IGNsYXp6LnJlbmRlcmVyIHx8IGNsYXp6LnJlbmRlcjtcblx0XHRvYmoucmVuZGVyZXIgPSB7IGFwaVZlcnNpb246IDIgfTtcblx0XHRpZiAodHlwZW9mIHJlbmRlcmVyRGVmaW5pdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRvYmoucmVuZGVyZXIucmVuZGVyID0gcmVuZGVyZXJEZWZpbml0aW9uO1xuXHRcdH0gZWxzZSBpZiAocmVuZGVyZXJEZWZpbml0aW9uICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0b2JqLnJlbmRlcmVyID0gcmVuZGVyZXJEZWZpbml0aW9uO1xuXHRcdH1cblx0fVxuXHRvYmoubWV0YWRhdGEuaW50ZXJmYWNlcyA9IGluT2JqLm1ldGFkYXRhPy5pbnRlcmZhY2VzIHx8IGNsYXp6Lm1ldGFkYXRhPy5pbnRlcmZhY2VzO1xuXHRPYmplY3Qua2V5cyhjbGF6ei5wcm90b3R5cGUpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdGlmIChrZXkgIT09IFwibWV0YWRhdGFcIikge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0b2JqW2tleV0gPSBjbGF6ei5wcm90b3R5cGVba2V5XTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhlKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXHRpZiAob2JqLm1ldGFkYXRhPy5jb250cm9sbGVyRXh0ZW5zaW9ucyAmJiBPYmplY3Qua2V5cyhvYmoubWV0YWRhdGEuY29udHJvbGxlckV4dGVuc2lvbnMpLmxlbmd0aCA+IDApIHtcblx0XHRmb3IgKGNvbnN0IGNFeHROYW1lIGluIG9iai5tZXRhZGF0YS5jb250cm9sbGVyRXh0ZW5zaW9ucykge1xuXHRcdFx0b2JqW2NFeHROYW1lXSA9IG9iai5tZXRhZGF0YS5jb250cm9sbGVyRXh0ZW5zaW9uc1tjRXh0TmFtZV07XG5cdFx0fVxuXHR9XG5cdGNvbnN0IG91dHB1dCA9IGNsYXp6LmV4dGVuZChuYW1lLCBvYmopO1xuXHRjb25zdCBmbkluaXQgPSBvdXRwdXQucHJvdG90eXBlLmluaXQ7XG5cdG91dHB1dC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xuXHRcdGlmIChmbkluaXQpIHtcblx0XHRcdGZuSW5pdC5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHR9XG5cdFx0dGhpcy5tZXRhZGF0YSA9IG9iai5tZXRhZGF0YTtcblxuXHRcdGlmIChvYmoubWV0YWRhdGEucHJvcGVydGllcykge1xuXHRcdFx0Y29uc3QgYVByb3BlcnR5S2V5cyA9IE9iamVjdC5rZXlzKG9iai5tZXRhZGF0YS5wcm9wZXJ0aWVzKTtcblx0XHRcdGFQcm9wZXJ0eUtleXMuZm9yRWFjaCgocHJvcGVydHlLZXkpID0+IHtcblx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5S2V5LCB7XG5cdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHNldDogKHY6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0UHJvcGVydHkocHJvcGVydHlLZXksIHYpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Z2V0OiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eShwcm9wZXJ0eUtleSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgYUFnZ3JlZ2F0aW9uS2V5cyA9IE9iamVjdC5rZXlzKG9iai5tZXRhZGF0YS5hZ2dyZWdhdGlvbnMpO1xuXHRcdFx0YUFnZ3JlZ2F0aW9uS2V5cy5mb3JFYWNoKChhZ2dyZWdhdGlvbktleSkgPT4ge1xuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgYWdncmVnYXRpb25LZXksIHtcblx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0c2V0OiAodjogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5zZXRBZ2dyZWdhdGlvbihhZ2dyZWdhdGlvbktleSwgdik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRnZXQ6ICgpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IGFnZ3JlZ2F0aW9uQ29udGVudCA9IHRoaXMuZ2V0QWdncmVnYXRpb24oYWdncmVnYXRpb25LZXkpO1xuXHRcdFx0XHRcdFx0aWYgKG9iai5tZXRhZGF0YS5hZ2dyZWdhdGlvbnNbYWdncmVnYXRpb25LZXldLm11bHRpcGxlKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhZ2dyZWdhdGlvbkNvbnRlbnQgfHwgW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYWdncmVnYXRpb25Db250ZW50O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGFBc3NvY2lhdGlvbktleXMgPSBPYmplY3Qua2V5cyhvYmoubWV0YWRhdGEuYXNzb2NpYXRpb25zKTtcblx0XHRcdGFBc3NvY2lhdGlvbktleXMuZm9yRWFjaCgoYXNzb2NpYXRpb25LZXkpID0+IHtcblx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGFzc29jaWF0aW9uS2V5LCB7XG5cdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHNldDogKHY6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0QXNzb2NpYXRpb24oYXNzb2NpYXRpb25LZXksIHYpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Z2V0OiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBhZ2dyZWdhdGlvbkNvbnRlbnQgPSB0aGlzLmdldEFzc29jaWF0aW9uKGFzc29jaWF0aW9uS2V5KTtcblx0XHRcdFx0XHRcdGlmIChvYmoubWV0YWRhdGEuYXNzb2NpYXRpb25zW2Fzc29jaWF0aW9uS2V5XS5tdWx0aXBsZSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYWdncmVnYXRpb25Db250ZW50IHx8IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGFnZ3JlZ2F0aW9uQ29udGVudDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xuXHRjbGF6ei5vdmVycmlkZSA9IGZ1bmN0aW9uIChvRXh0ZW5zaW9uOiBhbnkpIHtcblx0XHRjb25zdCBwb2wgPSB7fTtcblx0XHQocG9sIGFzIGFueSkuY29uc3RydWN0b3IgPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcblx0XHRcdHJldHVybiBjbGF6ei5hcHBseSh0aGlzLCBhcmdzIGFzIGFueSk7XG5cdFx0fTtcblx0XHRjb25zdCBvQ2xhc3MgPSAoTWV0YWRhdGEgYXMgYW55KS5jcmVhdGVDbGFzcyhjbGF6eiwgYGFub255bW91c0V4dGVuc2lvbn4ke3VpZCgpfWAsIHBvbCwgQ29udHJvbGxlck1ldGFkYXRhKTtcblx0XHRvQ2xhc3MuZ2V0TWV0YWRhdGEoKS5fc3RhdGljT3ZlcnJpZGUgPSBvRXh0ZW5zaW9uO1xuXHRcdG9DbGFzcy5nZXRNZXRhZGF0YSgpLl9vdmVycmlkZSA9IGNsYXp6LmdldE1ldGFkYXRhKCkuX292ZXJyaWRlO1xuXHRcdHJldHVybiBvQ2xhc3M7XG5cdH07XG5cblx0T2JqZWN0UGF0aC5zZXQobmFtZSwgb3V0cHV0KTtcblx0cmV0dXJuIG91dHB1dDtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUEw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