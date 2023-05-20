/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/common/AnnotationConverter", "sap/fe/core/helpers/TypeGuards", "../helpers/StableIdHelper"], function (AnnotationConverter, TypeGuards, StableIdHelper) {
  "use strict";

  var _exports = {};
  var prepareId = StableIdHelper.prepareId;
  var isSingleton = TypeGuards.isSingleton;
  var isServiceObject = TypeGuards.isServiceObject;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isEntityType = TypeGuards.isEntityType;
  var isEntitySet = TypeGuards.isEntitySet;
  var isEntityContainer = TypeGuards.isEntityContainer;
  const VOCABULARY_ALIAS = {
    "Org.OData.Capabilities.V1": "Capabilities",
    "Org.OData.Core.V1": "Core",
    "Org.OData.Measures.V1": "Measures",
    "com.sap.vocabularies.Common.v1": "Common",
    "com.sap.vocabularies.UI.v1": "UI",
    "com.sap.vocabularies.Session.v1": "Session",
    "com.sap.vocabularies.Analytics.v1": "Analytics",
    "com.sap.vocabularies.PersonalData.v1": "PersonalData",
    "com.sap.vocabularies.Communication.v1": "Communication"
  };
  const DefaultEnvironmentCapabilities = {
    Chart: true,
    MicroChart: true,
    UShell: true,
    IntentBasedNavigation: true,
    AppState: true
  };
  _exports.DefaultEnvironmentCapabilities = DefaultEnvironmentCapabilities;
  function parsePropertyValue(annotationObject, propertyKey, currentTarget, annotationsLists, oCapabilities) {
    let value;
    const currentPropertyTarget = `${currentTarget}/${propertyKey}`;
    const typeOfAnnotation = typeof annotationObject;
    if (annotationObject === null) {
      value = {
        type: "Null",
        Null: null
      };
    } else if (typeOfAnnotation === "string") {
      value = {
        type: "String",
        String: annotationObject
      };
    } else if (typeOfAnnotation === "boolean") {
      value = {
        type: "Bool",
        Bool: annotationObject
      };
    } else if (typeOfAnnotation === "number") {
      value = {
        type: "Int",
        Int: annotationObject
      };
    } else if (Array.isArray(annotationObject)) {
      value = {
        type: "Collection",
        Collection: annotationObject.map((subAnnotationObject, subAnnotationObjectIndex) => parseAnnotationObject(subAnnotationObject, `${currentPropertyTarget}/${subAnnotationObjectIndex}`, annotationsLists, oCapabilities))
      };
      if (annotationObject.length > 0) {
        if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
          value.Collection.type = "PropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$Path")) {
          value.Collection.type = "Path";
        } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
          value.Collection.type = "NavigationPropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
          value.Collection.type = "AnnotationPath";
        } else if (annotationObject[0].hasOwnProperty("$Type")) {
          value.Collection.type = "Record";
        } else if (annotationObject[0].hasOwnProperty("$If")) {
          value.Collection.type = "If";
        } else if (annotationObject[0].hasOwnProperty("$Or")) {
          value.Collection.type = "Or";
        } else if (annotationObject[0].hasOwnProperty("$And")) {
          value.Collection.type = "And";
        } else if (annotationObject[0].hasOwnProperty("$Eq")) {
          value.Collection.type = "Eq";
        } else if (annotationObject[0].hasOwnProperty("$Ne")) {
          value.Collection.type = "Ne";
        } else if (annotationObject[0].hasOwnProperty("$Not")) {
          value.Collection.type = "Not";
        } else if (annotationObject[0].hasOwnProperty("$Gt")) {
          value.Collection.type = "Gt";
        } else if (annotationObject[0].hasOwnProperty("$Ge")) {
          value.Collection.type = "Ge";
        } else if (annotationObject[0].hasOwnProperty("$Lt")) {
          value.Collection.type = "Lt";
        } else if (annotationObject[0].hasOwnProperty("$Le")) {
          value.Collection.type = "Le";
        } else if (annotationObject[0].hasOwnProperty("$Apply")) {
          value.Collection.type = "Apply";
        } else if (typeof annotationObject[0] === "object") {
          // $Type is optional...
          value.Collection.type = "Record";
        } else {
          value.Collection.type = "String";
        }
      }
    } else if (annotationObject.$Path !== undefined) {
      value = {
        type: "Path",
        Path: annotationObject.$Path
      };
    } else if (annotationObject.$Decimal !== undefined) {
      value = {
        type: "Decimal",
        Decimal: parseFloat(annotationObject.$Decimal)
      };
    } else if (annotationObject.$PropertyPath !== undefined) {
      value = {
        type: "PropertyPath",
        PropertyPath: annotationObject.$PropertyPath
      };
    } else if (annotationObject.$NavigationPropertyPath !== undefined) {
      value = {
        type: "NavigationPropertyPath",
        NavigationPropertyPath: annotationObject.$NavigationPropertyPath
      };
    } else if (annotationObject.$If !== undefined) {
      value = {
        type: "If",
        If: annotationObject.$If
      };
    } else if (annotationObject.$And !== undefined) {
      value = {
        type: "And",
        And: annotationObject.$And
      };
    } else if (annotationObject.$Or !== undefined) {
      value = {
        type: "Or",
        Or: annotationObject.$Or
      };
    } else if (annotationObject.$Not !== undefined) {
      value = {
        type: "Not",
        Not: annotationObject.$Not
      };
    } else if (annotationObject.$Eq !== undefined) {
      value = {
        type: "Eq",
        Eq: annotationObject.$Eq
      };
    } else if (annotationObject.$Ne !== undefined) {
      value = {
        type: "Ne",
        Ne: annotationObject.$Ne
      };
    } else if (annotationObject.$Gt !== undefined) {
      value = {
        type: "Gt",
        Gt: annotationObject.$Gt
      };
    } else if (annotationObject.$Ge !== undefined) {
      value = {
        type: "Ge",
        Ge: annotationObject.$Ge
      };
    } else if (annotationObject.$Lt !== undefined) {
      value = {
        type: "Lt",
        Lt: annotationObject.$Lt
      };
    } else if (annotationObject.$Le !== undefined) {
      value = {
        type: "Le",
        Le: annotationObject.$Le
      };
    } else if (annotationObject.$Apply !== undefined) {
      value = {
        type: "Apply",
        Apply: annotationObject.$Apply,
        Function: annotationObject.$Function
      };
    } else if (annotationObject.$AnnotationPath !== undefined) {
      value = {
        type: "AnnotationPath",
        AnnotationPath: annotationObject.$AnnotationPath
      };
    } else if (annotationObject.$EnumMember !== undefined) {
      value = {
        type: "EnumMember",
        EnumMember: `${mapNameToAlias(annotationObject.$EnumMember.split("/")[0])}/${annotationObject.$EnumMember.split("/")[1]}`
      };
    } else {
      value = {
        type: "Record",
        Record: parseAnnotationObject(annotationObject, currentTarget, annotationsLists, oCapabilities)
      };
    }
    return {
      name: propertyKey,
      value
    };
  }
  function mapNameToAlias(annotationName) {
    let [pathPart, annoPart] = annotationName.split("@");
    if (!annoPart) {
      annoPart = pathPart;
      pathPart = "";
    } else {
      pathPart += "@";
    }
    const lastDot = annoPart.lastIndexOf(".");
    return `${pathPart + VOCABULARY_ALIAS[annoPart.substr(0, lastDot)]}.${annoPart.substr(lastDot + 1)}`;
  }
  function parseAnnotationObject(annotationObject, currentObjectTarget, annotationsLists, oCapabilities) {
    let parsedAnnotationObject = {};
    const typeOfObject = typeof annotationObject;
    if (annotationObject === null) {
      parsedAnnotationObject = {
        type: "Null",
        Null: null
      };
    } else if (typeOfObject === "string") {
      parsedAnnotationObject = {
        type: "String",
        String: annotationObject
      };
    } else if (typeOfObject === "boolean") {
      parsedAnnotationObject = {
        type: "Bool",
        Bool: annotationObject
      };
    } else if (typeOfObject === "number") {
      parsedAnnotationObject = {
        type: "Int",
        Int: annotationObject
      };
    } else if (annotationObject.$AnnotationPath !== undefined) {
      parsedAnnotationObject = {
        type: "AnnotationPath",
        AnnotationPath: annotationObject.$AnnotationPath
      };
    } else if (annotationObject.$Path !== undefined) {
      parsedAnnotationObject = {
        type: "Path",
        Path: annotationObject.$Path
      };
    } else if (annotationObject.$Decimal !== undefined) {
      parsedAnnotationObject = {
        type: "Decimal",
        Decimal: parseFloat(annotationObject.$Decimal)
      };
    } else if (annotationObject.$PropertyPath !== undefined) {
      parsedAnnotationObject = {
        type: "PropertyPath",
        PropertyPath: annotationObject.$PropertyPath
      };
    } else if (annotationObject.$If !== undefined) {
      parsedAnnotationObject = {
        type: "If",
        If: annotationObject.$If
      };
    } else if (annotationObject.$And !== undefined) {
      parsedAnnotationObject = {
        type: "And",
        And: annotationObject.$And
      };
    } else if (annotationObject.$Or !== undefined) {
      parsedAnnotationObject = {
        type: "Or",
        Or: annotationObject.$Or
      };
    } else if (annotationObject.$Not !== undefined) {
      parsedAnnotationObject = {
        type: "Not",
        Not: annotationObject.$Not
      };
    } else if (annotationObject.$Eq !== undefined) {
      parsedAnnotationObject = {
        type: "Eq",
        Eq: annotationObject.$Eq
      };
    } else if (annotationObject.$Ne !== undefined) {
      parsedAnnotationObject = {
        type: "Ne",
        Ne: annotationObject.$Ne
      };
    } else if (annotationObject.$Gt !== undefined) {
      parsedAnnotationObject = {
        type: "Gt",
        Gt: annotationObject.$Gt
      };
    } else if (annotationObject.$Ge !== undefined) {
      parsedAnnotationObject = {
        type: "Ge",
        Ge: annotationObject.$Ge
      };
    } else if (annotationObject.$Lt !== undefined) {
      parsedAnnotationObject = {
        type: "Lt",
        Lt: annotationObject.$Lt
      };
    } else if (annotationObject.$Le !== undefined) {
      parsedAnnotationObject = {
        type: "Le",
        Le: annotationObject.$Le
      };
    } else if (annotationObject.$Apply !== undefined) {
      parsedAnnotationObject = {
        type: "Apply",
        Apply: annotationObject.$Apply,
        Function: annotationObject.$Function
      };
    } else if (annotationObject.$NavigationPropertyPath !== undefined) {
      parsedAnnotationObject = {
        type: "NavigationPropertyPath",
        NavigationPropertyPath: annotationObject.$NavigationPropertyPath
      };
    } else if (annotationObject.$EnumMember !== undefined) {
      parsedAnnotationObject = {
        type: "EnumMember",
        EnumMember: `${mapNameToAlias(annotationObject.$EnumMember.split("/")[0])}/${annotationObject.$EnumMember.split("/")[1]}`
      };
    } else if (Array.isArray(annotationObject)) {
      const parsedAnnotationCollection = parsedAnnotationObject;
      parsedAnnotationCollection.collection = annotationObject.map((subAnnotationObject, subAnnotationIndex) => parseAnnotationObject(subAnnotationObject, `${currentObjectTarget}/${subAnnotationIndex}`, annotationsLists, oCapabilities));
      if (annotationObject.length > 0) {
        if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
          parsedAnnotationCollection.collection.type = "PropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$Path")) {
          parsedAnnotationCollection.collection.type = "Path";
        } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
          parsedAnnotationCollection.collection.type = "NavigationPropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
          parsedAnnotationCollection.collection.type = "AnnotationPath";
        } else if (annotationObject[0].hasOwnProperty("$Type")) {
          parsedAnnotationCollection.collection.type = "Record";
        } else if (annotationObject[0].hasOwnProperty("$If")) {
          parsedAnnotationCollection.collection.type = "If";
        } else if (annotationObject[0].hasOwnProperty("$And")) {
          parsedAnnotationCollection.collection.type = "And";
        } else if (annotationObject[0].hasOwnProperty("$Or")) {
          parsedAnnotationCollection.collection.type = "Or";
        } else if (annotationObject[0].hasOwnProperty("$Eq")) {
          parsedAnnotationCollection.collection.type = "Eq";
        } else if (annotationObject[0].hasOwnProperty("$Ne")) {
          parsedAnnotationCollection.collection.type = "Ne";
        } else if (annotationObject[0].hasOwnProperty("$Not")) {
          parsedAnnotationCollection.collection.type = "Not";
        } else if (annotationObject[0].hasOwnProperty("$Gt")) {
          parsedAnnotationCollection.collection.type = "Gt";
        } else if (annotationObject[0].hasOwnProperty("$Ge")) {
          parsedAnnotationCollection.collection.type = "Ge";
        } else if (annotationObject[0].hasOwnProperty("$Lt")) {
          parsedAnnotationCollection.collection.type = "Lt";
        } else if (annotationObject[0].hasOwnProperty("$Le")) {
          parsedAnnotationCollection.collection.type = "Le";
        } else if (annotationObject[0].hasOwnProperty("$Apply")) {
          parsedAnnotationCollection.collection.type = "Apply";
        } else if (typeof annotationObject[0] === "object") {
          parsedAnnotationCollection.collection.type = "Record";
        } else {
          parsedAnnotationCollection.collection.type = "String";
        }
      }
    } else {
      if (annotationObject.$Type) {
        const typeValue = annotationObject.$Type;
        parsedAnnotationObject.type = typeValue; //`${typeAlias}.${typeTerm}`;
      }

      const propertyValues = [];
      Object.keys(annotationObject).forEach(propertyKey => {
        if (propertyKey !== "$Type" && propertyKey !== "$If" && propertyKey !== "$Apply" && propertyKey !== "$And" && propertyKey !== "$Or" && propertyKey !== "$Ne" && propertyKey !== "$Gt" && propertyKey !== "$Ge" && propertyKey !== "$Lt" && propertyKey !== "$Le" && propertyKey !== "$Not" && propertyKey !== "$Eq" && !propertyKey.startsWith("@")) {
          propertyValues.push(parsePropertyValue(annotationObject[propertyKey], propertyKey, currentObjectTarget, annotationsLists, oCapabilities));
        } else if (propertyKey.startsWith("@")) {
          // Annotation of annotation
          createAnnotationLists({
            [propertyKey]: annotationObject[propertyKey]
          }, currentObjectTarget, annotationsLists, oCapabilities);
        }
      });
      parsedAnnotationObject.propertyValues = propertyValues;
    }
    return parsedAnnotationObject;
  }
  function getOrCreateAnnotationList(target, annotationsLists) {
    if (!annotationsLists.hasOwnProperty(target)) {
      annotationsLists[target] = {
        target: target,
        annotations: []
      };
    }
    return annotationsLists[target];
  }
  function createReferenceFacetId(referenceFacet) {
    const id = referenceFacet.ID ?? referenceFacet.Target.$AnnotationPath;
    return id ? prepareId(id) : id;
  }
  function removeChartAnnotations(annotationObject) {
    return annotationObject.filter(oRecord => {
      if (oRecord.Target && oRecord.Target.$AnnotationPath) {
        return oRecord.Target.$AnnotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.Chart"}`) === -1;
      } else {
        return true;
      }
    });
  }
  function removeIBNAnnotations(annotationObject) {
    return annotationObject.filter(oRecord => {
      return oRecord.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
    });
  }
  function handlePresentationVariant(annotationObject) {
    return annotationObject.filter(oRecord => {
      return oRecord.$AnnotationPath !== `@${"com.sap.vocabularies.UI.v1.Chart"}`;
    });
  }
  function createAnnotationLists(annotationObjects, annotationTarget, annotationLists, oCapabilities) {
    if (Object.keys(annotationObjects).length === 0) {
      return;
    }
    const outAnnotationObject = getOrCreateAnnotationList(annotationTarget, annotationLists);
    if (!oCapabilities.MicroChart) {
      delete annotationObjects[`@${"com.sap.vocabularies.UI.v1.Chart"}`];
    }
    for (let annotationKey in annotationObjects) {
      let annotationObject = annotationObjects[annotationKey];
      switch (annotationKey) {
        case `@${"com.sap.vocabularies.UI.v1.HeaderFacets"}`:
          if (!oCapabilities.MicroChart) {
            annotationObject = removeChartAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.Identification"}`:
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject = removeIBNAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.LineItem"}`:
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject = removeIBNAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          if (!oCapabilities.MicroChart) {
            annotationObject = removeChartAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.FieldGroup"}`:
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject.Data = removeIBNAnnotations(annotationObject.Data);
            annotationObjects[annotationKey] = annotationObject;
          }
          if (!oCapabilities.MicroChart) {
            annotationObject.Data = removeChartAnnotations(annotationObject.Data);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.PresentationVariant"}`:
          if (!oCapabilities.Chart && annotationObject.Visualizations) {
            annotationObject.Visualizations = handlePresentationVariant(annotationObject.Visualizations);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        default:
          break;
      }
      let currentOutAnnotationObject = outAnnotationObject;

      // Check for annotation of annotation
      const annotationOfAnnotationSplit = annotationKey.split("@");
      if (annotationOfAnnotationSplit.length > 2) {
        currentOutAnnotationObject = getOrCreateAnnotationList(`${annotationTarget}@${annotationOfAnnotationSplit[1]}`, annotationLists);
        annotationKey = annotationOfAnnotationSplit[2];
      } else {
        annotationKey = annotationOfAnnotationSplit[1];
      }
      const annotationQualifierSplit = annotationKey.split("#");
      const qualifier = annotationQualifierSplit[1];
      annotationKey = annotationQualifierSplit[0];
      const parsedAnnotationObject = {
        term: annotationKey,
        qualifier: qualifier
      };
      let currentAnnotationTarget = `${annotationTarget}@${parsedAnnotationObject.term}`;
      if (qualifier) {
        currentAnnotationTarget += `#${qualifier}`;
      }
      let isCollection = false;
      const typeofAnnotation = typeof annotationObject;
      if (annotationObject === null) {
        parsedAnnotationObject.value = {
          type: "Null"
        };
      } else if (typeofAnnotation === "string") {
        parsedAnnotationObject.value = {
          type: "String",
          String: annotationObject
        };
      } else if (typeofAnnotation === "boolean") {
        parsedAnnotationObject.value = {
          type: "Bool",
          Bool: annotationObject
        };
      } else if (typeofAnnotation === "number") {
        parsedAnnotationObject.value = {
          type: "Int",
          Int: annotationObject
        };
      } else if (annotationObject.$If !== undefined) {
        parsedAnnotationObject.value = {
          type: "If",
          If: annotationObject.$If
        };
      } else if (annotationObject.$And !== undefined) {
        parsedAnnotationObject.value = {
          type: "And",
          And: annotationObject.$And
        };
      } else if (annotationObject.$Or !== undefined) {
        parsedAnnotationObject.value = {
          type: "Or",
          Or: annotationObject.$Or
        };
      } else if (annotationObject.$Not !== undefined) {
        parsedAnnotationObject.value = {
          type: "Not",
          Not: annotationObject.$Not
        };
      } else if (annotationObject.$Eq !== undefined) {
        parsedAnnotationObject.value = {
          type: "Eq",
          Eq: annotationObject.$Eq
        };
      } else if (annotationObject.$Ne !== undefined) {
        parsedAnnotationObject.value = {
          type: "Ne",
          Ne: annotationObject.$Ne
        };
      } else if (annotationObject.$Gt !== undefined) {
        parsedAnnotationObject.value = {
          type: "Gt",
          Gt: annotationObject.$Gt
        };
      } else if (annotationObject.$Ge !== undefined) {
        parsedAnnotationObject.value = {
          type: "Ge",
          Ge: annotationObject.$Ge
        };
      } else if (annotationObject.$Lt !== undefined) {
        parsedAnnotationObject.value = {
          type: "Lt",
          Lt: annotationObject.$Lt
        };
      } else if (annotationObject.$Le !== undefined) {
        parsedAnnotationObject.value = {
          type: "Le",
          Le: annotationObject.$Le
        };
      } else if (annotationObject.$Apply !== undefined) {
        parsedAnnotationObject.value = {
          type: "Apply",
          Apply: annotationObject.$Apply,
          Function: annotationObject.$Function
        };
      } else if (annotationObject.$Path !== undefined) {
        parsedAnnotationObject.value = {
          type: "Path",
          Path: annotationObject.$Path
        };
      } else if (annotationObject.$AnnotationPath !== undefined) {
        parsedAnnotationObject.value = {
          type: "AnnotationPath",
          AnnotationPath: annotationObject.$AnnotationPath
        };
      } else if (annotationObject.$Decimal !== undefined) {
        parsedAnnotationObject.value = {
          type: "Decimal",
          Decimal: parseFloat(annotationObject.$Decimal)
        };
      } else if (annotationObject.$EnumMember !== undefined) {
        parsedAnnotationObject.value = {
          type: "EnumMember",
          EnumMember: `${mapNameToAlias(annotationObject.$EnumMember.split("/")[0])}/${annotationObject.$EnumMember.split("/")[1]}`
        };
      } else if (Array.isArray(annotationObject)) {
        isCollection = true;
        parsedAnnotationObject.collection = annotationObject.map((subAnnotationObject, subAnnotationIndex) => parseAnnotationObject(subAnnotationObject, `${currentAnnotationTarget}/${subAnnotationIndex}`, annotationLists, oCapabilities));
        if (annotationObject.length > 0) {
          if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
            parsedAnnotationObject.collection.type = "PropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$Path")) {
            parsedAnnotationObject.collection.type = "Path";
          } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
            parsedAnnotationObject.collection.type = "NavigationPropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
            parsedAnnotationObject.collection.type = "AnnotationPath";
          } else if (annotationObject[0].hasOwnProperty("$Type")) {
            parsedAnnotationObject.collection.type = "Record";
          } else if (annotationObject[0].hasOwnProperty("$If")) {
            parsedAnnotationObject.collection.type = "If";
          } else if (annotationObject[0].hasOwnProperty("$Or")) {
            parsedAnnotationObject.collection.type = "Or";
          } else if (annotationObject[0].hasOwnProperty("$Eq")) {
            parsedAnnotationObject.collection.type = "Eq";
          } else if (annotationObject[0].hasOwnProperty("$Ne")) {
            parsedAnnotationObject.collection.type = "Ne";
          } else if (annotationObject[0].hasOwnProperty("$Not")) {
            parsedAnnotationObject.collection.type = "Not";
          } else if (annotationObject[0].hasOwnProperty("$Gt")) {
            parsedAnnotationObject.collection.type = "Gt";
          } else if (annotationObject[0].hasOwnProperty("$Ge")) {
            parsedAnnotationObject.collection.type = "Ge";
          } else if (annotationObject[0].hasOwnProperty("$Lt")) {
            parsedAnnotationObject.collection.type = "Lt";
          } else if (annotationObject[0].hasOwnProperty("$Le")) {
            parsedAnnotationObject.collection.type = "Le";
          } else if (annotationObject[0].hasOwnProperty("$And")) {
            parsedAnnotationObject.collection.type = "And";
          } else if (annotationObject[0].hasOwnProperty("$Apply")) {
            parsedAnnotationObject.collection.type = "Apply";
          } else if (typeof annotationObject[0] === "object") {
            parsedAnnotationObject.collection.type = "Record";
          } else {
            parsedAnnotationObject.collection.type = "String";
          }
        }
      } else {
        const record = {
          propertyValues: []
        };
        if (annotationObject.$Type) {
          const typeValue = annotationObject.$Type;
          record.type = `${typeValue}`;
        }
        const propertyValues = [];
        for (const propertyKey in annotationObject) {
          if (propertyKey !== "$Type" && !propertyKey.startsWith("@")) {
            propertyValues.push(parsePropertyValue(annotationObject[propertyKey], propertyKey, currentAnnotationTarget, annotationLists, oCapabilities));
          } else if (propertyKey.startsWith("@")) {
            // Annotation of record
            createAnnotationLists({
              [propertyKey]: annotationObject[propertyKey]
            }, currentAnnotationTarget, annotationLists, oCapabilities);
          }
        }
        record.propertyValues = propertyValues;
        parsedAnnotationObject.record = record;
      }
      parsedAnnotationObject.isCollection = isCollection;
      currentOutAnnotationObject.annotations.push(parsedAnnotationObject);
    }
  }
  function prepareProperty(propertyDefinition, entityTypeObject, propertyName) {
    return {
      _type: "Property",
      name: propertyName,
      fullyQualifiedName: `${entityTypeObject.fullyQualifiedName}/${propertyName}`,
      type: propertyDefinition.$Type,
      maxLength: propertyDefinition.$MaxLength,
      precision: propertyDefinition.$Precision,
      scale: propertyDefinition.$Scale,
      nullable: propertyDefinition.$Nullable
    };
  }
  function prepareNavigationProperty(navPropertyDefinition, entityTypeObject, navPropertyName) {
    let referentialConstraint = [];
    if (navPropertyDefinition.$ReferentialConstraint) {
      referentialConstraint = Object.keys(navPropertyDefinition.$ReferentialConstraint).map(sourcePropertyName => {
        return {
          sourceTypeName: entityTypeObject.name,
          sourceProperty: sourcePropertyName,
          targetTypeName: navPropertyDefinition.$Type,
          targetProperty: navPropertyDefinition.$ReferentialConstraint[sourcePropertyName]
        };
      });
    }
    const navigationProperty = {
      _type: "NavigationProperty",
      name: navPropertyName,
      fullyQualifiedName: `${entityTypeObject.fullyQualifiedName}/${navPropertyName}`,
      partner: navPropertyDefinition.$Partner,
      isCollection: navPropertyDefinition.$isCollection ? navPropertyDefinition.$isCollection : false,
      containsTarget: navPropertyDefinition.$ContainsTarget,
      targetTypeName: navPropertyDefinition.$Type,
      referentialConstraint
    };
    return navigationProperty;
  }
  function prepareEntitySet(entitySetDefinition, entitySetName, entityContainerName) {
    const entitySetObject = {
      _type: "EntitySet",
      name: entitySetName,
      navigationPropertyBinding: {},
      entityTypeName: entitySetDefinition.$Type,
      fullyQualifiedName: `${entityContainerName}/${entitySetName}`
    };
    return entitySetObject;
  }
  function prepareSingleton(singletonDefinition, singletonName, entityContainerName) {
    return {
      _type: "Singleton",
      name: singletonName,
      navigationPropertyBinding: {},
      entityTypeName: singletonDefinition.$Type,
      fullyQualifiedName: `${entityContainerName}/${singletonName}`,
      nullable: true
    };
  }
  function prepareActionImport(actionImport, actionImportName, entityContainerName) {
    return {
      _type: "ActionImport",
      name: actionImportName,
      fullyQualifiedName: `${entityContainerName}/${actionImportName}`,
      actionName: actionImport.$Action
    };
  }
  function prepareTypeDefinition(typeDefinition, typeName, namespacePrefix) {
    const typeObject = {
      _type: "TypeDefinition",
      name: typeName.substring(namespacePrefix.length),
      fullyQualifiedName: typeName,
      underlyingType: typeDefinition.$UnderlyingType
    };
    return typeObject;
  }
  function prepareComplexType(complexTypeDefinition, complexTypeName, namespacePrefix) {
    const complexTypeObject = {
      _type: "ComplexType",
      name: complexTypeName.substring(namespacePrefix.length),
      fullyQualifiedName: complexTypeName,
      properties: [],
      navigationProperties: []
    };
    const complexTypeProperties = Object.keys(complexTypeDefinition).filter(propertyNameOrNot => {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return complexTypeDefinition[propertyNameOrNot].$kind === "Property";
      }
    }).sort((a, b) => a > b ? 1 : -1).map(propertyName => {
      return prepareProperty(complexTypeDefinition[propertyName], complexTypeObject, propertyName);
    });
    complexTypeObject.properties = complexTypeProperties;
    const complexTypeNavigationProperties = Object.keys(complexTypeDefinition).filter(propertyNameOrNot => {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return complexTypeDefinition[propertyNameOrNot].$kind === "NavigationProperty";
      }
    }).sort((a, b) => a > b ? 1 : -1).map(navPropertyName => {
      return prepareNavigationProperty(complexTypeDefinition[navPropertyName], complexTypeObject, navPropertyName);
    });
    complexTypeObject.navigationProperties = complexTypeNavigationProperties;
    return complexTypeObject;
  }
  function prepareEntityKeys(entityTypeDefinition, oMetaModelData) {
    if (!entityTypeDefinition.$Key && entityTypeDefinition.$BaseType) {
      return prepareEntityKeys(oMetaModelData[entityTypeDefinition.$BaseType], oMetaModelData);
    }
    return entityTypeDefinition.$Key ?? []; //handling of entity types without key as well as basetype
  }

  function prepareEntityType(entityTypeDefinition, entityTypeName, namespacePrefix, metaModelData) {
    var _metaModelData$$Annot, _metaModelData$$Annot2;
    const entityType = {
      _type: "EntityType",
      name: entityTypeName.substring(namespacePrefix.length),
      fullyQualifiedName: entityTypeName,
      keys: [],
      entityProperties: [],
      navigationProperties: [],
      actions: {}
    };
    for (const key in entityTypeDefinition) {
      const value = entityTypeDefinition[key];
      switch (value.$kind) {
        case "Property":
          const property = prepareProperty(value, entityType, key);
          entityType.entityProperties.push(property);
          break;
        case "NavigationProperty":
          const navigationProperty = prepareNavigationProperty(value, entityType, key);
          entityType.navigationProperties.push(navigationProperty);
          break;
      }
    }
    entityType.keys = prepareEntityKeys(entityTypeDefinition, metaModelData).map(entityKey => entityType.entityProperties.find(property => property.name === entityKey)).filter(property => property !== undefined);

    // Check if there are filter facets defined for the entityType and if yes, check if all of them have an ID
    // The ID is optional, but it is internally taken for grouping filter fields and if it's not present
    // a fallback ID needs to be generated here.
    (_metaModelData$$Annot = metaModelData.$Annotations[entityType.fullyQualifiedName]) === null || _metaModelData$$Annot === void 0 ? void 0 : (_metaModelData$$Annot2 = _metaModelData$$Annot[`@${"com.sap.vocabularies.UI.v1.FilterFacets"}`]) === null || _metaModelData$$Annot2 === void 0 ? void 0 : _metaModelData$$Annot2.forEach(filterFacetAnnotation => {
      filterFacetAnnotation.ID = createReferenceFacetId(filterFacetAnnotation);
    });
    for (const entityProperty of entityType.entityProperties) {
      if (!metaModelData.$Annotations[entityProperty.fullyQualifiedName]) {
        metaModelData.$Annotations[entityProperty.fullyQualifiedName] = {};
      }
      if (!metaModelData.$Annotations[entityProperty.fullyQualifiedName][`@${"com.sap.vocabularies.UI.v1.DataFieldDefault"}`]) {
        metaModelData.$Annotations[entityProperty.fullyQualifiedName][`@${"com.sap.vocabularies.UI.v1.DataFieldDefault"}`] = {
          $Type: "com.sap.vocabularies.UI.v1.DataField",
          Value: {
            $Path: entityProperty.name
          }
        };
      }
    }
    return entityType;
  }
  function prepareAction(actionName, actionRawData, namespacePrefix) {
    var _actionRawData$$Retur;
    let actionEntityType = "";
    let actionFQN = actionName;
    if (actionRawData.$IsBound) {
      const bindingParameter = actionRawData.$Parameter[0];
      actionEntityType = bindingParameter.$Type;
      if (bindingParameter.$isCollection === true) {
        actionFQN = `${actionName}(Collection(${actionEntityType}))`;
      } else {
        actionFQN = `${actionName}(${actionEntityType})`;
      }
    }
    const parameters = actionRawData.$Parameter ?? [];
    return {
      _type: "Action",
      name: actionName.substring(namespacePrefix.length),
      fullyQualifiedName: actionFQN,
      isBound: actionRawData.$IsBound ?? false,
      isFunction: actionRawData.$kind === "Function",
      sourceType: actionEntityType,
      returnType: ((_actionRawData$$Retur = actionRawData.$ReturnType) === null || _actionRawData$$Retur === void 0 ? void 0 : _actionRawData$$Retur.$Type) ?? "",
      parameters: parameters.map(param => {
        return {
          _type: "ActionParameter",
          fullyQualifiedName: `${actionFQN}/${param.$Name}`,
          isCollection: param.$isCollection ?? false,
          name: param.$Name,
          type: param.$Type
        };
      })
    };
  }
  function parseEntityContainer(namespacePrefix, entityContainerName, entityContainerMetadata, schema) {
    schema.entityContainer = {
      _type: "EntityContainer",
      name: entityContainerName.substring(namespacePrefix.length),
      fullyQualifiedName: entityContainerName
    };
    for (const elementName in entityContainerMetadata) {
      const elementValue = entityContainerMetadata[elementName];
      switch (elementValue.$kind) {
        case "EntitySet":
          schema.entitySets.push(prepareEntitySet(elementValue, elementName, entityContainerName));
          break;
        case "Singleton":
          schema.singletons.push(prepareSingleton(elementValue, elementName, entityContainerName));
          break;
        case "ActionImport":
          schema.actionImports.push(prepareActionImport(elementValue, elementName, entityContainerName));
          break;
      }
    }

    // link the navigation property bindings ($NavigationPropertyBinding)
    for (const entitySet of schema.entitySets) {
      const navPropertyBindings = entityContainerMetadata[entitySet.name].$NavigationPropertyBinding;
      if (navPropertyBindings) {
        for (const navPropName of Object.keys(navPropertyBindings)) {
          const targetEntitySet = schema.entitySets.find(entitySetName => entitySetName.name === navPropertyBindings[navPropName]);
          if (targetEntitySet) {
            entitySet.navigationPropertyBinding[navPropName] = targetEntitySet;
          }
        }
      }
    }
  }
  function parseAnnotations(annotations, capabilities) {
    const annotationLists = {};
    for (const target in annotations) {
      createAnnotationLists(annotations[target], target, annotationLists, capabilities);
    }
    return Object.values(annotationLists);
  }
  function parseSchema(metaModelData) {
    // assuming there is only one schema/namespace
    const namespacePrefix = Object.keys(metaModelData).find(key => metaModelData[key].$kind === "Schema") ?? "";
    const schema = {
      namespace: namespacePrefix.slice(0, -1),
      entityContainer: {
        _type: "EntityContainer",
        name: "",
        fullyQualifiedName: ""
      },
      entitySets: [],
      entityTypes: [],
      complexTypes: [],
      typeDefinitions: [],
      singletons: [],
      associations: [],
      associationSets: [],
      actions: [],
      actionImports: [],
      annotations: {}
    };
    const parseMetaModelElement = (name, value) => {
      switch (value.$kind) {
        case "EntityContainer":
          parseEntityContainer(namespacePrefix, name, value, schema);
          break;
        case "Action":
        case "Function":
          schema.actions.push(prepareAction(name, value, namespacePrefix));
          break;
        case "EntityType":
          schema.entityTypes.push(prepareEntityType(value, name, namespacePrefix, metaModelData));
          break;
        case "ComplexType":
          schema.complexTypes.push(prepareComplexType(value, name, namespacePrefix));
          break;
        case "TypeDefinition":
          schema.typeDefinitions.push(prepareTypeDefinition(value, name, namespacePrefix));
          break;
      }
    };
    for (const elementName in metaModelData) {
      const elementValue = metaModelData[elementName];
      if (Array.isArray(elementValue)) {
        // value can be an array in case of actions or functions
        for (const subElementValue of elementValue) {
          parseMetaModelElement(elementName, subElementValue);
        }
      } else {
        parseMetaModelElement(elementName, elementValue);
      }
    }
    return schema;
  }
  function parseMetaModel(metaModel) {
    let capabilities = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultEnvironmentCapabilities;
    const result = {
      identification: "metamodelResult",
      version: "4.0",
      references: []
    };

    // parse the schema when it is accessed for the first time
    AnnotationConverter.lazy(result, "schema", () => {
      const metaModelData = metaModel.getObject("/$");
      const schema = parseSchema(metaModelData);
      AnnotationConverter.lazy(schema.annotations, "metamodelResult", () => parseAnnotations(metaModelData.$Annotations, capabilities));
      return schema;
    });
    return result;
  }
  _exports.parseMetaModel = parseMetaModel;
  const mMetaModelMap = {};

  /**
   * Convert the ODataMetaModel into another format that allow for easy manipulation of the annotations.
   *
   * @param oMetaModel The ODataMetaModel
   * @param oCapabilities The current capabilities
   * @returns An object containing object-like annotations
   */
  function convertTypes(oMetaModel, oCapabilities) {
    const sMetaModelId = oMetaModel.id;
    if (!mMetaModelMap.hasOwnProperty(sMetaModelId)) {
      const parsedOutput = parseMetaModel(oMetaModel, oCapabilities);
      try {
        mMetaModelMap[sMetaModelId] = AnnotationConverter.convert(parsedOutput);
      } catch (oError) {
        throw new Error(oError);
      }
    }
    return mMetaModelMap[sMetaModelId];
  }
  _exports.convertTypes = convertTypes;
  function getConvertedTypes(oContext) {
    const oMetaModel = oContext.getModel();
    if (!oMetaModel.isA("sap.ui.model.odata.v4.ODataMetaModel")) {
      throw new Error("This should only be called on a ODataMetaModel");
    }
    return convertTypes(oMetaModel);
  }
  _exports.getConvertedTypes = getConvertedTypes;
  function deleteModelCacheData(oMetaModel) {
    delete mMetaModelMap[oMetaModel.id];
  }
  _exports.deleteModelCacheData = deleteModelCacheData;
  function convertMetaModelContext(oMetaModelContext) {
    let bIncludeVisitedObjects = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const oConvertedMetadata = convertTypes(oMetaModelContext.getModel());
    const sPath = oMetaModelContext.getPath();
    const aPathSplit = sPath.split("/");
    let firstPart = aPathSplit[1];
    let beginIndex = 2;
    if (oConvertedMetadata.entityContainer.fullyQualifiedName === firstPart) {
      firstPart = aPathSplit[2];
      beginIndex++;
    }
    let targetEntitySet = oConvertedMetadata.entitySets.find(entitySet => entitySet.name === firstPart);
    if (!targetEntitySet) {
      targetEntitySet = oConvertedMetadata.singletons.find(singleton => singleton.name === firstPart);
    }
    let relativePath = aPathSplit.slice(beginIndex).join("/");
    const localObjects = [targetEntitySet];
    while (relativePath && relativePath.length > 0 && relativePath.startsWith("$NavigationPropertyBinding")) {
      var _sNavPropToCheck;
      let relativeSplit = relativePath.split("/");
      let idx = 0;
      let currentEntitySet, sNavPropToCheck;
      relativeSplit = relativeSplit.slice(1); // Removing "$NavigationPropertyBinding"
      while (!currentEntitySet && relativeSplit.length > idx) {
        if (relativeSplit[idx] !== "$NavigationPropertyBinding") {
          // Finding the correct entitySet for the navigaiton property binding example: "Set/_SalesOrder"
          sNavPropToCheck = relativeSplit.slice(0, idx + 1).join("/").replace("/$NavigationPropertyBinding", "");
          currentEntitySet = targetEntitySet && targetEntitySet.navigationPropertyBinding[sNavPropToCheck];
        }
        idx++;
      }
      if (!currentEntitySet) {
        // Fall back to Single nav prop if entitySet is not found.
        sNavPropToCheck = relativeSplit[0];
      }
      const aNavProps = ((_sNavPropToCheck = sNavPropToCheck) === null || _sNavPropToCheck === void 0 ? void 0 : _sNavPropToCheck.split("/")) || [];
      let targetEntityType = targetEntitySet && targetEntitySet.entityType;
      for (const sNavProp of aNavProps) {
        // Pushing all nav props to the visited objects. example: "Set", "_SalesOrder" for "Set/_SalesOrder"(in NavigationPropertyBinding)
        const targetNavProp = targetEntityType && targetEntityType.navigationProperties.find(navProp => navProp.name === sNavProp);
        if (targetNavProp) {
          localObjects.push(targetNavProp);
          targetEntityType = targetNavProp.targetType;
        } else {
          break;
        }
      }
      targetEntitySet = targetEntitySet && currentEntitySet || targetEntitySet && targetEntitySet.navigationPropertyBinding[relativeSplit[0]];
      if (targetEntitySet) {
        // Pushing the target entitySet to visited objects
        localObjects.push(targetEntitySet);
      }
      // Re-calculating the relative path
      // As each navigation name is enclosed between '$NavigationPropertyBinding' and '$' (to be able to access the entityset easily in the metamodel)
      // we need to remove the closing '$' to be able to switch to the next navigation
      relativeSplit = relativeSplit.slice(aNavProps.length || 1);
      if (relativeSplit.length && relativeSplit[0] === "$") {
        relativeSplit.shift();
      }
      relativePath = relativeSplit.join("/");
    }
    if (relativePath.startsWith("$Type")) {
      // As $Type@ is allowed as well
      if (relativePath.startsWith("$Type@")) {
        relativePath = relativePath.replace("$Type", "");
      } else {
        // We're anyway going to look on the entityType...
        relativePath = aPathSplit.slice(3).join("/");
      }
    }
    if (targetEntitySet && relativePath.length) {
      const oTarget = targetEntitySet.entityType.resolvePath(relativePath, bIncludeVisitedObjects);
      if (oTarget) {
        if (bIncludeVisitedObjects) {
          oTarget.visitedObjects = localObjects.concat(oTarget.visitedObjects);
        }
      } else if (targetEntitySet.entityType && targetEntitySet.entityType.actions) {
        // if target is an action or an action parameter
        const actions = targetEntitySet.entityType && targetEntitySet.entityType.actions;
        const relativeSplit = relativePath.split("/");
        if (actions[relativeSplit[0]]) {
          const action = actions[relativeSplit[0]];
          if (relativeSplit[1] && action.parameters) {
            const parameterName = relativeSplit[1];
            return action.parameters.find(parameter => {
              return parameter.fullyQualifiedName.endsWith(`/${parameterName}`);
            });
          } else if (relativePath.length === 1) {
            return action;
          }
        }
      }
      return oTarget;
    } else {
      if (bIncludeVisitedObjects) {
        return {
          target: targetEntitySet,
          visitedObjects: localObjects
        };
      }
      return targetEntitySet;
    }
  }
  _exports.convertMetaModelContext = convertMetaModelContext;
  function getInvolvedDataModelObjects(oMetaModelContext, oEntitySetMetaModelContext) {
    const oConvertedMetadata = convertTypes(oMetaModelContext.getModel());
    const metaModelContext = convertMetaModelContext(oMetaModelContext, true);
    let targetEntitySetLocation;
    if (oEntitySetMetaModelContext && oEntitySetMetaModelContext.getPath() !== "/") {
      targetEntitySetLocation = getInvolvedDataModelObjects(oEntitySetMetaModelContext);
    }
    return getInvolvedDataModelObjectFromPath(metaModelContext, oConvertedMetadata, targetEntitySetLocation);
  }
  _exports.getInvolvedDataModelObjects = getInvolvedDataModelObjects;
  function getInvolvedDataModelObjectFromPath(metaModelContext, convertedTypes, targetEntitySetLocation) {
    let onlyServiceObjects = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const dataModelObjects = metaModelContext.visitedObjects.filter(visitedObject => isServiceObject(visitedObject) && !isEntityType(visitedObject) && !isEntityContainer(visitedObject));
    if (isServiceObject(metaModelContext.target) && !isEntityType(metaModelContext.target) && dataModelObjects[dataModelObjects.length - 1] !== metaModelContext.target && !onlyServiceObjects) {
      dataModelObjects.push(metaModelContext.target);
    }
    const navigationProperties = [];
    const rootEntitySet = dataModelObjects[0];
    let currentEntitySet = rootEntitySet;
    let currentEntityType = rootEntitySet.entityType;
    let currentObject;
    let navigatedPath = [];
    for (let i = 1; i < dataModelObjects.length; i++) {
      currentObject = dataModelObjects[i];
      if (isNavigationProperty(currentObject)) {
        var _currentEntitySet;
        navigatedPath.push(currentObject.name);
        navigationProperties.push(currentObject);
        currentEntityType = currentObject.targetType;
        const boundEntitySet = (_currentEntitySet = currentEntitySet) === null || _currentEntitySet === void 0 ? void 0 : _currentEntitySet.navigationPropertyBinding[navigatedPath.join("/")];
        if (boundEntitySet !== undefined) {
          currentEntitySet = boundEntitySet;
          navigatedPath = [];
        }
      }
      if (isEntitySet(currentObject) || isSingleton(currentObject)) {
        currentEntitySet = currentObject;
        currentEntityType = currentEntitySet.entityType;
      }
    }
    if (navigatedPath.length > 0) {
      // Path without NavigationPropertyBinding --> no target entity set
      currentEntitySet = undefined;
    }
    if (targetEntitySetLocation && targetEntitySetLocation.startingEntitySet !== rootEntitySet) {
      // In case the entityset is not starting from the same location it may mean that we are doing too much work earlier for some reason
      // As such we need to redefine the context source for the targetEntitySetLocation
      const startingIndex = dataModelObjects.indexOf(targetEntitySetLocation.startingEntitySet);
      if (startingIndex !== -1) {
        // If it's not found I don't know what we can do (probably nothing)
        const requiredDataModelObjects = dataModelObjects.slice(0, startingIndex);
        targetEntitySetLocation.startingEntitySet = rootEntitySet;
        targetEntitySetLocation.navigationProperties = requiredDataModelObjects.filter(isNavigationProperty).concat(targetEntitySetLocation.navigationProperties);
      }
    }
    const outDataModelPath = {
      startingEntitySet: rootEntitySet,
      targetEntitySet: currentEntitySet,
      targetEntityType: currentEntityType,
      targetObject: metaModelContext.target,
      navigationProperties,
      contextLocation: targetEntitySetLocation,
      convertedTypes: convertedTypes
    };
    if (!isServiceObject(outDataModelPath.targetObject) && onlyServiceObjects) {
      outDataModelPath.targetObject = isServiceObject(currentObject) ? currentObject : undefined;
    }
    if (!outDataModelPath.contextLocation) {
      outDataModelPath.contextLocation = outDataModelPath;
    }
    return outDataModelPath;
  }
  _exports.getInvolvedDataModelObjectFromPath = getInvolvedDataModelObjectFromPath;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWT0NBQlVMQVJZX0FMSUFTIiwiRGVmYXVsdEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiQ2hhcnQiLCJNaWNyb0NoYXJ0IiwiVVNoZWxsIiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiQXBwU3RhdGUiLCJwYXJzZVByb3BlcnR5VmFsdWUiLCJhbm5vdGF0aW9uT2JqZWN0IiwicHJvcGVydHlLZXkiLCJjdXJyZW50VGFyZ2V0IiwiYW5ub3RhdGlvbnNMaXN0cyIsIm9DYXBhYmlsaXRpZXMiLCJ2YWx1ZSIsImN1cnJlbnRQcm9wZXJ0eVRhcmdldCIsInR5cGVPZkFubm90YXRpb24iLCJ0eXBlIiwiTnVsbCIsIlN0cmluZyIsIkJvb2wiLCJJbnQiLCJBcnJheSIsImlzQXJyYXkiLCJDb2xsZWN0aW9uIiwibWFwIiwic3ViQW5ub3RhdGlvbk9iamVjdCIsInN1YkFubm90YXRpb25PYmplY3RJbmRleCIsInBhcnNlQW5ub3RhdGlvbk9iamVjdCIsImxlbmd0aCIsImhhc093blByb3BlcnR5IiwiJFBhdGgiLCJ1bmRlZmluZWQiLCJQYXRoIiwiJERlY2ltYWwiLCJEZWNpbWFsIiwicGFyc2VGbG9hdCIsIiRQcm9wZXJ0eVBhdGgiLCJQcm9wZXJ0eVBhdGgiLCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCIkSWYiLCJJZiIsIiRBbmQiLCJBbmQiLCIkT3IiLCJPciIsIiROb3QiLCJOb3QiLCIkRXEiLCJFcSIsIiROZSIsIk5lIiwiJEd0IiwiR3QiLCIkR2UiLCJHZSIsIiRMdCIsIkx0IiwiJExlIiwiTGUiLCIkQXBwbHkiLCJBcHBseSIsIkZ1bmN0aW9uIiwiJEZ1bmN0aW9uIiwiJEFubm90YXRpb25QYXRoIiwiQW5ub3RhdGlvblBhdGgiLCIkRW51bU1lbWJlciIsIkVudW1NZW1iZXIiLCJtYXBOYW1lVG9BbGlhcyIsInNwbGl0IiwiUmVjb3JkIiwibmFtZSIsImFubm90YXRpb25OYW1lIiwicGF0aFBhcnQiLCJhbm5vUGFydCIsImxhc3REb3QiLCJsYXN0SW5kZXhPZiIsInN1YnN0ciIsImN1cnJlbnRPYmplY3RUYXJnZXQiLCJwYXJzZWRBbm5vdGF0aW9uT2JqZWN0IiwidHlwZU9mT2JqZWN0IiwicGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24iLCJjb2xsZWN0aW9uIiwic3ViQW5ub3RhdGlvbkluZGV4IiwiJFR5cGUiLCJ0eXBlVmFsdWUiLCJwcm9wZXJ0eVZhbHVlcyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwic3RhcnRzV2l0aCIsInB1c2giLCJjcmVhdGVBbm5vdGF0aW9uTGlzdHMiLCJnZXRPckNyZWF0ZUFubm90YXRpb25MaXN0IiwidGFyZ2V0IiwiYW5ub3RhdGlvbnMiLCJjcmVhdGVSZWZlcmVuY2VGYWNldElkIiwicmVmZXJlbmNlRmFjZXQiLCJpZCIsIklEIiwiVGFyZ2V0IiwicHJlcGFyZUlkIiwicmVtb3ZlQ2hhcnRBbm5vdGF0aW9ucyIsImZpbHRlciIsIm9SZWNvcmQiLCJpbmRleE9mIiwicmVtb3ZlSUJOQW5ub3RhdGlvbnMiLCJoYW5kbGVQcmVzZW50YXRpb25WYXJpYW50IiwiYW5ub3RhdGlvbk9iamVjdHMiLCJhbm5vdGF0aW9uVGFyZ2V0IiwiYW5ub3RhdGlvbkxpc3RzIiwib3V0QW5ub3RhdGlvbk9iamVjdCIsImFubm90YXRpb25LZXkiLCJEYXRhIiwiVmlzdWFsaXphdGlvbnMiLCJjdXJyZW50T3V0QW5ub3RhdGlvbk9iamVjdCIsImFubm90YXRpb25PZkFubm90YXRpb25TcGxpdCIsImFubm90YXRpb25RdWFsaWZpZXJTcGxpdCIsInF1YWxpZmllciIsInRlcm0iLCJjdXJyZW50QW5ub3RhdGlvblRhcmdldCIsImlzQ29sbGVjdGlvbiIsInR5cGVvZkFubm90YXRpb24iLCJyZWNvcmQiLCJwcmVwYXJlUHJvcGVydHkiLCJwcm9wZXJ0eURlZmluaXRpb24iLCJlbnRpdHlUeXBlT2JqZWN0IiwicHJvcGVydHlOYW1lIiwiX3R5cGUiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJtYXhMZW5ndGgiLCIkTWF4TGVuZ3RoIiwicHJlY2lzaW9uIiwiJFByZWNpc2lvbiIsInNjYWxlIiwiJFNjYWxlIiwibnVsbGFibGUiLCIkTnVsbGFibGUiLCJwcmVwYXJlTmF2aWdhdGlvblByb3BlcnR5IiwibmF2UHJvcGVydHlEZWZpbml0aW9uIiwibmF2UHJvcGVydHlOYW1lIiwicmVmZXJlbnRpYWxDb25zdHJhaW50IiwiJFJlZmVyZW50aWFsQ29uc3RyYWludCIsInNvdXJjZVByb3BlcnR5TmFtZSIsInNvdXJjZVR5cGVOYW1lIiwic291cmNlUHJvcGVydHkiLCJ0YXJnZXRUeXBlTmFtZSIsInRhcmdldFByb3BlcnR5IiwibmF2aWdhdGlvblByb3BlcnR5IiwicGFydG5lciIsIiRQYXJ0bmVyIiwiJGlzQ29sbGVjdGlvbiIsImNvbnRhaW5zVGFyZ2V0IiwiJENvbnRhaW5zVGFyZ2V0IiwicHJlcGFyZUVudGl0eVNldCIsImVudGl0eVNldERlZmluaXRpb24iLCJlbnRpdHlTZXROYW1lIiwiZW50aXR5Q29udGFpbmVyTmFtZSIsImVudGl0eVNldE9iamVjdCIsIm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJlbnRpdHlUeXBlTmFtZSIsInByZXBhcmVTaW5nbGV0b24iLCJzaW5nbGV0b25EZWZpbml0aW9uIiwic2luZ2xldG9uTmFtZSIsInByZXBhcmVBY3Rpb25JbXBvcnQiLCJhY3Rpb25JbXBvcnQiLCJhY3Rpb25JbXBvcnROYW1lIiwiYWN0aW9uTmFtZSIsIiRBY3Rpb24iLCJwcmVwYXJlVHlwZURlZmluaXRpb24iLCJ0eXBlRGVmaW5pdGlvbiIsInR5cGVOYW1lIiwibmFtZXNwYWNlUHJlZml4IiwidHlwZU9iamVjdCIsInN1YnN0cmluZyIsInVuZGVybHlpbmdUeXBlIiwiJFVuZGVybHlpbmdUeXBlIiwicHJlcGFyZUNvbXBsZXhUeXBlIiwiY29tcGxleFR5cGVEZWZpbml0aW9uIiwiY29tcGxleFR5cGVOYW1lIiwiY29tcGxleFR5cGVPYmplY3QiLCJwcm9wZXJ0aWVzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJjb21wbGV4VHlwZVByb3BlcnRpZXMiLCJwcm9wZXJ0eU5hbWVPck5vdCIsIiRraW5kIiwic29ydCIsImEiLCJiIiwiY29tcGxleFR5cGVOYXZpZ2F0aW9uUHJvcGVydGllcyIsInByZXBhcmVFbnRpdHlLZXlzIiwiZW50aXR5VHlwZURlZmluaXRpb24iLCJvTWV0YU1vZGVsRGF0YSIsIiRLZXkiLCIkQmFzZVR5cGUiLCJwcmVwYXJlRW50aXR5VHlwZSIsIm1ldGFNb2RlbERhdGEiLCJlbnRpdHlUeXBlIiwiZW50aXR5UHJvcGVydGllcyIsImFjdGlvbnMiLCJrZXkiLCJwcm9wZXJ0eSIsImVudGl0eUtleSIsImZpbmQiLCIkQW5ub3RhdGlvbnMiLCJmaWx0ZXJGYWNldEFubm90YXRpb24iLCJlbnRpdHlQcm9wZXJ0eSIsIlZhbHVlIiwicHJlcGFyZUFjdGlvbiIsImFjdGlvblJhd0RhdGEiLCJhY3Rpb25FbnRpdHlUeXBlIiwiYWN0aW9uRlFOIiwiJElzQm91bmQiLCJiaW5kaW5nUGFyYW1ldGVyIiwiJFBhcmFtZXRlciIsInBhcmFtZXRlcnMiLCJpc0JvdW5kIiwiaXNGdW5jdGlvbiIsInNvdXJjZVR5cGUiLCJyZXR1cm5UeXBlIiwiJFJldHVyblR5cGUiLCJwYXJhbSIsIiROYW1lIiwicGFyc2VFbnRpdHlDb250YWluZXIiLCJlbnRpdHlDb250YWluZXJNZXRhZGF0YSIsInNjaGVtYSIsImVudGl0eUNvbnRhaW5lciIsImVsZW1lbnROYW1lIiwiZWxlbWVudFZhbHVlIiwiZW50aXR5U2V0cyIsInNpbmdsZXRvbnMiLCJhY3Rpb25JbXBvcnRzIiwiZW50aXR5U2V0IiwibmF2UHJvcGVydHlCaW5kaW5ncyIsIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nIiwibmF2UHJvcE5hbWUiLCJ0YXJnZXRFbnRpdHlTZXQiLCJwYXJzZUFubm90YXRpb25zIiwiY2FwYWJpbGl0aWVzIiwidmFsdWVzIiwicGFyc2VTY2hlbWEiLCJuYW1lc3BhY2UiLCJzbGljZSIsImVudGl0eVR5cGVzIiwiY29tcGxleFR5cGVzIiwidHlwZURlZmluaXRpb25zIiwiYXNzb2NpYXRpb25zIiwiYXNzb2NpYXRpb25TZXRzIiwicGFyc2VNZXRhTW9kZWxFbGVtZW50Iiwic3ViRWxlbWVudFZhbHVlIiwicGFyc2VNZXRhTW9kZWwiLCJtZXRhTW9kZWwiLCJyZXN1bHQiLCJpZGVudGlmaWNhdGlvbiIsInZlcnNpb24iLCJyZWZlcmVuY2VzIiwiQW5ub3RhdGlvbkNvbnZlcnRlciIsImxhenkiLCJnZXRPYmplY3QiLCJtTWV0YU1vZGVsTWFwIiwiY29udmVydFR5cGVzIiwib01ldGFNb2RlbCIsInNNZXRhTW9kZWxJZCIsInBhcnNlZE91dHB1dCIsImNvbnZlcnQiLCJvRXJyb3IiLCJFcnJvciIsImdldENvbnZlcnRlZFR5cGVzIiwib0NvbnRleHQiLCJnZXRNb2RlbCIsImlzQSIsImRlbGV0ZU1vZGVsQ2FjaGVEYXRhIiwiY29udmVydE1ldGFNb2RlbENvbnRleHQiLCJvTWV0YU1vZGVsQ29udGV4dCIsImJJbmNsdWRlVmlzaXRlZE9iamVjdHMiLCJvQ29udmVydGVkTWV0YWRhdGEiLCJzUGF0aCIsImdldFBhdGgiLCJhUGF0aFNwbGl0IiwiZmlyc3RQYXJ0IiwiYmVnaW5JbmRleCIsInNpbmdsZXRvbiIsInJlbGF0aXZlUGF0aCIsImpvaW4iLCJsb2NhbE9iamVjdHMiLCJyZWxhdGl2ZVNwbGl0IiwiaWR4IiwiY3VycmVudEVudGl0eVNldCIsInNOYXZQcm9wVG9DaGVjayIsInJlcGxhY2UiLCJhTmF2UHJvcHMiLCJ0YXJnZXRFbnRpdHlUeXBlIiwic05hdlByb3AiLCJ0YXJnZXROYXZQcm9wIiwibmF2UHJvcCIsInRhcmdldFR5cGUiLCJzaGlmdCIsIm9UYXJnZXQiLCJyZXNvbHZlUGF0aCIsInZpc2l0ZWRPYmplY3RzIiwiY29uY2F0IiwiYWN0aW9uIiwicGFyYW1ldGVyTmFtZSIsInBhcmFtZXRlciIsImVuZHNXaXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwib0VudGl0eVNldE1ldGFNb2RlbENvbnRleHQiLCJtZXRhTW9kZWxDb250ZXh0IiwidGFyZ2V0RW50aXR5U2V0TG9jYXRpb24iLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdEZyb21QYXRoIiwiY29udmVydGVkVHlwZXMiLCJvbmx5U2VydmljZU9iamVjdHMiLCJkYXRhTW9kZWxPYmplY3RzIiwidmlzaXRlZE9iamVjdCIsImlzU2VydmljZU9iamVjdCIsImlzRW50aXR5VHlwZSIsImlzRW50aXR5Q29udGFpbmVyIiwicm9vdEVudGl0eVNldCIsImN1cnJlbnRFbnRpdHlUeXBlIiwiY3VycmVudE9iamVjdCIsIm5hdmlnYXRlZFBhdGgiLCJpIiwiaXNOYXZpZ2F0aW9uUHJvcGVydHkiLCJib3VuZEVudGl0eVNldCIsImlzRW50aXR5U2V0IiwiaXNTaW5nbGV0b24iLCJzdGFydGluZ0VudGl0eVNldCIsInN0YXJ0aW5nSW5kZXgiLCJyZXF1aXJlZERhdGFNb2RlbE9iamVjdHMiLCJvdXREYXRhTW9kZWxQYXRoIiwidGFyZ2V0T2JqZWN0IiwiY29udGV4dExvY2F0aW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNZXRhTW9kZWxDb252ZXJ0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBmaWxlIGlzIHJldHJpZXZlZCBmcm9tIEBzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXIsIHNoYXJlZCBjb2RlIHdpdGggdG9vbCBzdWl0ZVxuXG5pbXBvcnQgdHlwZSB7XG5cdEFubm90YXRpb24sXG5cdEFubm90YXRpb25MaXN0LFxuXHRBbm5vdGF0aW9uUmVjb3JkLFxuXHRDb252ZXJ0ZWRNZXRhZGF0YSxcblx0RW50aXR5U2V0LFxuXHRFbnRpdHlUeXBlLFxuXHRFeHByZXNzaW9uLFxuXHROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFJhd0FjdGlvbixcblx0UmF3QWN0aW9uSW1wb3J0LFxuXHRSYXdDb21wbGV4VHlwZSxcblx0UmF3RW50aXR5U2V0LFxuXHRSYXdFbnRpdHlUeXBlLFxuXHRSYXdNZXRhZGF0YSxcblx0UmF3UHJvcGVydHksXG5cdFJhd1NjaGVtYSxcblx0UmF3U2luZ2xldG9uLFxuXHRSYXdUeXBlRGVmaW5pdGlvbixcblx0UmF3VjROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFJlZmVyZW50aWFsQ29uc3RyYWludCxcblx0U2VydmljZU9iamVjdCxcblx0U2luZ2xldG9uXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgU2VydmljZU9iamVjdEFuZEFubm90YXRpb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IEFubm90YXRpb25Db252ZXJ0ZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb21tb25cIjtcbmltcG9ydCB7XG5cdGlzRW50aXR5Q29udGFpbmVyLFxuXHRpc0VudGl0eVNldCxcblx0aXNFbnRpdHlUeXBlLFxuXHRpc05hdmlnYXRpb25Qcm9wZXJ0eSxcblx0aXNTZXJ2aWNlT2JqZWN0LFxuXHRpc1NpbmdsZXRvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHsgcHJlcGFyZUlkIH0gZnJvbSBcIi4uL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcblxuY29uc3QgVk9DQUJVTEFSWV9BTElBUzogYW55ID0ge1xuXHRcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjFcIjogXCJDYXBhYmlsaXRpZXNcIixcblx0XCJPcmcuT0RhdGEuQ29yZS5WMVwiOiBcIkNvcmVcIixcblx0XCJPcmcuT0RhdGEuTWVhc3VyZXMuVjFcIjogXCJNZWFzdXJlc1wiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiOiBcIkNvbW1vblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCI6IFwiVUlcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxXCI6IFwiU2Vzc2lvblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MVwiOiBcIkFuYWx5dGljc1wiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MVwiOiBcIlBlcnNvbmFsRGF0YVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjFcIjogXCJDb21tdW5pY2F0aW9uXCJcbn07XG5cbmV4cG9ydCB0eXBlIEVudmlyb25tZW50Q2FwYWJpbGl0aWVzID0ge1xuXHRDaGFydDogYm9vbGVhbjtcblx0TWljcm9DaGFydDogYm9vbGVhbjtcblx0VVNoZWxsOiBib29sZWFuO1xuXHRJbnRlbnRCYXNlZE5hdmlnYXRpb246IGJvb2xlYW47XG5cdEFwcFN0YXRlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IGNvbnN0IERlZmF1bHRFbnZpcm9ubWVudENhcGFiaWxpdGllcyA9IHtcblx0Q2hhcnQ6IHRydWUsXG5cdE1pY3JvQ2hhcnQ6IHRydWUsXG5cdFVTaGVsbDogdHJ1ZSxcblx0SW50ZW50QmFzZWROYXZpZ2F0aW9uOiB0cnVlLFxuXHRBcHBTdGF0ZTogdHJ1ZVxufTtcblxudHlwZSBNZXRhTW9kZWxBY3Rpb24gPSB7XG5cdCRraW5kOiBcIkFjdGlvblwiIHwgXCJGdW5jdGlvblwiO1xuXHQkSXNCb3VuZDogYm9vbGVhbjtcblx0JEVudGl0eVNldFBhdGg6IHN0cmluZztcblx0JFBhcmFtZXRlcjoge1xuXHRcdCRUeXBlOiBzdHJpbmc7XG5cdFx0JE5hbWU6IHN0cmluZztcblx0XHQkTnVsbGFibGU/OiBib29sZWFuO1xuXHRcdCRNYXhMZW5ndGg/OiBudW1iZXI7XG5cdFx0JFByZWNpc2lvbj86IG51bWJlcjtcblx0XHQkU2NhbGU/OiBudW1iZXI7XG5cdFx0JGlzQ29sbGVjdGlvbj86IGJvb2xlYW47XG5cdH1bXTtcblx0JFJldHVyblR5cGU6IHtcblx0XHQkVHlwZTogc3RyaW5nO1xuXHR9O1xufTtcblxuZnVuY3Rpb24gcGFyc2VQcm9wZXJ0eVZhbHVlKFxuXHRhbm5vdGF0aW9uT2JqZWN0OiBhbnksXG5cdHByb3BlcnR5S2V5OiBzdHJpbmcsXG5cdGN1cnJlbnRUYXJnZXQ6IHN0cmluZyxcblx0YW5ub3RhdGlvbnNMaXN0czogUmVjb3JkPHN0cmluZywgQW5ub3RhdGlvbkxpc3Q+LFxuXHRvQ2FwYWJpbGl0aWVzOiBFbnZpcm9ubWVudENhcGFiaWxpdGllc1xuKTogYW55IHtcblx0bGV0IHZhbHVlO1xuXHRjb25zdCBjdXJyZW50UHJvcGVydHlUYXJnZXQ6IHN0cmluZyA9IGAke2N1cnJlbnRUYXJnZXR9LyR7cHJvcGVydHlLZXl9YDtcblx0Y29uc3QgdHlwZU9mQW5ub3RhdGlvbiA9IHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0O1xuXHRpZiAoYW5ub3RhdGlvbk9iamVjdCA9PT0gbnVsbCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIk51bGxcIiwgTnVsbDogbnVsbCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZkFubm90YXRpb24gPT09IFwic3RyaW5nXCIpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJTdHJpbmdcIiwgU3RyaW5nOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdH0gZWxzZSBpZiAodHlwZU9mQW5ub3RhdGlvbiA9PT0gXCJib29sZWFuXCIpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJCb29sXCIsIEJvb2w6IGFubm90YXRpb25PYmplY3QgfTtcblx0fSBlbHNlIGlmICh0eXBlT2ZBbm5vdGF0aW9uID09PSBcIm51bWJlclwiKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiSW50XCIsIEludDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYW5ub3RhdGlvbk9iamVjdCkpIHtcblx0XHR2YWx1ZSA9IHtcblx0XHRcdHR5cGU6IFwiQ29sbGVjdGlvblwiLFxuXHRcdFx0Q29sbGVjdGlvbjogYW5ub3RhdGlvbk9iamVjdC5tYXAoKHN1YkFubm90YXRpb25PYmplY3QsIHN1YkFubm90YXRpb25PYmplY3RJbmRleCkgPT5cblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uT2JqZWN0KFxuXHRcdFx0XHRcdHN1YkFubm90YXRpb25PYmplY3QsXG5cdFx0XHRcdFx0YCR7Y3VycmVudFByb3BlcnR5VGFyZ2V0fS8ke3N1YkFubm90YXRpb25PYmplY3RJbmRleH1gLFxuXHRcdFx0XHRcdGFubm90YXRpb25zTGlzdHMsXG5cdFx0XHRcdFx0b0NhcGFiaWxpdGllc1xuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0fTtcblx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdC5sZW5ndGggPiAwKSB7XG5cdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJQcm9wZXJ0eVBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQYXRoXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5ub3RhdGlvblBhdGhcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJBbm5vdGF0aW9uUGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFR5cGVcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRJZlwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIklmXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkT3JcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJPclwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFuZFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkFuZFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEVxXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiRXFcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROZVwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIk5lXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTm90XCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiTm90XCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkR3RcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJHdFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEdlXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiR2VcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRMdFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkx0XCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTGVcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJMZVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFwcGx5XCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiQXBwbHlcIjtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGFubm90YXRpb25PYmplY3RbMF0gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0Ly8gJFR5cGUgaXMgb3B0aW9uYWwuLi5cblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJFBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIlBhdGhcIiwgUGF0aDogYW5ub3RhdGlvbk9iamVjdC4kUGF0aCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJERlY2ltYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkRlY2ltYWxcIiwgRGVjaW1hbDogcGFyc2VGbG9hdChhbm5vdGF0aW9uT2JqZWN0LiREZWNpbWFsKSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJFByb3BlcnR5UGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiUHJvcGVydHlQYXRoXCIsIFByb3BlcnR5UGF0aDogYW5ub3RhdGlvbk9iamVjdC4kUHJvcGVydHlQYXRoIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTmF2aWdhdGlvblByb3BlcnR5UGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7XG5cdFx0XHR0eXBlOiBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIixcblx0XHRcdE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IGFubm90YXRpb25PYmplY3QuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcblx0XHR9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJElmICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJJZlwiLCBJZjogYW5ub3RhdGlvbk9iamVjdC4kSWYgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbmQgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkFuZFwiLCBBbmQ6IGFubm90YXRpb25PYmplY3QuJEFuZCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE9yICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJPclwiLCBPcjogYW5ub3RhdGlvbk9iamVjdC4kT3IgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiROb3QgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIk5vdFwiLCBOb3Q6IGFubm90YXRpb25PYmplY3QuJE5vdCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVxICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJFcVwiLCBFcTogYW5ub3RhdGlvbk9iamVjdC4kRXEgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiROZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiTmVcIiwgTmU6IGFubm90YXRpb25PYmplY3QuJE5lIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kR3QgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkd0XCIsIEd0OiBhbm5vdGF0aW9uT2JqZWN0LiRHdCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEdlICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJHZVwiLCBHZTogYW5ub3RhdGlvbk9iamVjdC4kR2UgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRMdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiTHRcIiwgTHQ6IGFubm90YXRpb25PYmplY3QuJEx0IH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkxlXCIsIExlOiBhbm5vdGF0aW9uT2JqZWN0LiRMZSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFwcGx5ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJBcHBseVwiLCBBcHBseTogYW5ub3RhdGlvbk9iamVjdC4kQXBwbHksIEZ1bmN0aW9uOiBhbm5vdGF0aW9uT2JqZWN0LiRGdW5jdGlvbiB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJBbm5vdGF0aW9uUGF0aFwiLCBBbm5vdGF0aW9uUGF0aDogYW5ub3RhdGlvbk9iamVjdC4kQW5ub3RhdGlvblBhdGggfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHtcblx0XHRcdHR5cGU6IFwiRW51bU1lbWJlclwiLFxuXHRcdFx0RW51bU1lbWJlcjogYCR7bWFwTmFtZVRvQWxpYXMoYW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlci5zcGxpdChcIi9cIilbMF0pfS8ke2Fubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzFdfWBcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHZhbHVlID0ge1xuXHRcdFx0dHlwZTogXCJSZWNvcmRcIixcblx0XHRcdFJlY29yZDogcGFyc2VBbm5vdGF0aW9uT2JqZWN0KGFubm90YXRpb25PYmplY3QsIGN1cnJlbnRUYXJnZXQsIGFubm90YXRpb25zTGlzdHMsIG9DYXBhYmlsaXRpZXMpXG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bmFtZTogcHJvcGVydHlLZXksXG5cdFx0dmFsdWVcblx0fTtcbn1cbmZ1bmN0aW9uIG1hcE5hbWVUb0FsaWFzKGFubm90YXRpb25OYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRsZXQgW3BhdGhQYXJ0LCBhbm5vUGFydF0gPSBhbm5vdGF0aW9uTmFtZS5zcGxpdChcIkBcIik7XG5cdGlmICghYW5ub1BhcnQpIHtcblx0XHRhbm5vUGFydCA9IHBhdGhQYXJ0O1xuXHRcdHBhdGhQYXJ0ID0gXCJcIjtcblx0fSBlbHNlIHtcblx0XHRwYXRoUGFydCArPSBcIkBcIjtcblx0fVxuXHRjb25zdCBsYXN0RG90ID0gYW5ub1BhcnQubGFzdEluZGV4T2YoXCIuXCIpO1xuXHRyZXR1cm4gYCR7cGF0aFBhcnQgKyBWT0NBQlVMQVJZX0FMSUFTW2Fubm9QYXJ0LnN1YnN0cigwLCBsYXN0RG90KV19LiR7YW5ub1BhcnQuc3Vic3RyKGxhc3REb3QgKyAxKX1gO1xufVxuZnVuY3Rpb24gcGFyc2VBbm5vdGF0aW9uT2JqZWN0KFxuXHRhbm5vdGF0aW9uT2JqZWN0OiBhbnksXG5cdGN1cnJlbnRPYmplY3RUYXJnZXQ6IHN0cmluZyxcblx0YW5ub3RhdGlvbnNMaXN0czogUmVjb3JkPHN0cmluZywgQW5ub3RhdGlvbkxpc3Q+LFxuXHRvQ2FwYWJpbGl0aWVzOiBFbnZpcm9ubWVudENhcGFiaWxpdGllc1xuKTogRXhwcmVzc2lvbiB8IEFubm90YXRpb25SZWNvcmQgfCBBbm5vdGF0aW9uIHtcblx0bGV0IHBhcnNlZEFubm90YXRpb25PYmplY3Q6IGFueSA9IHt9O1xuXHRjb25zdCB0eXBlT2ZPYmplY3QgPSB0eXBlb2YgYW5ub3RhdGlvbk9iamVjdDtcblx0aWYgKGFubm90YXRpb25PYmplY3QgPT09IG51bGwpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIk51bGxcIiwgTnVsbDogbnVsbCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZk9iamVjdCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiU3RyaW5nXCIsIFN0cmluZzogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZk9iamVjdCA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkJvb2xcIiwgQm9vbDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZk9iamVjdCA9PT0gXCJudW1iZXJcIikge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiSW50XCIsIEludDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsIEFubm90YXRpb25QYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJFBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiUGF0aFwiLCBQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRQYXRoIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJEZWNpbWFsXCIsIERlY2ltYWw6IHBhcnNlRmxvYXQoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCkgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQcm9wZXJ0eVBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiUHJvcGVydHlQYXRoXCIsIFByb3BlcnR5UGF0aDogYW5ub3RhdGlvbk9iamVjdC4kUHJvcGVydHlQYXRoIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kSWYgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiSWZcIiwgSWY6IGFubm90YXRpb25PYmplY3QuJElmIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQW5kICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkFuZFwiLCBBbmQ6IGFubm90YXRpb25PYmplY3QuJEFuZCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE9yICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIk9yXCIsIE9yOiBhbm5vdGF0aW9uT2JqZWN0LiRPciB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5vdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJOb3RcIiwgTm90OiBhbm5vdGF0aW9uT2JqZWN0LiROb3QgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFcSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJFcVwiLCBFcTogYW5ub3RhdGlvbk9iamVjdC4kRXEgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiROZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJOZVwiLCBOZTogYW5ub3RhdGlvbk9iamVjdC4kTmUgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJHdFwiLCBHdDogYW5ub3RhdGlvbk9iamVjdC4kR3QgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJHZVwiLCBHZTogYW5ub3RhdGlvbk9iamVjdC4kR2UgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRMdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJMdFwiLCBMdDogYW5ub3RhdGlvbk9iamVjdC4kTHQgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRMZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJMZVwiLCBMZTogYW5ub3RhdGlvbk9iamVjdC4kTGUgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJBcHBseVwiLCBBcHBseTogYW5ub3RhdGlvbk9iamVjdC4kQXBwbHksIEZ1bmN0aW9uOiBhbm5vdGF0aW9uT2JqZWN0LiRGdW5jdGlvbiB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7XG5cdFx0XHR0eXBlOiBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIixcblx0XHRcdE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IGFubm90YXRpb25PYmplY3QuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcblx0XHR9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7XG5cdFx0XHR0eXBlOiBcIkVudW1NZW1iZXJcIixcblx0XHRcdEVudW1NZW1iZXI6IGAke21hcE5hbWVUb0FsaWFzKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzBdKX0vJHthbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVsxXX1gXG5cdFx0fTtcblx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFubm90YXRpb25PYmplY3QpKSB7XG5cdFx0Y29uc3QgcGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24gPSBwYXJzZWRBbm5vdGF0aW9uT2JqZWN0O1xuXHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24gPSBhbm5vdGF0aW9uT2JqZWN0Lm1hcCgoc3ViQW5ub3RhdGlvbk9iamVjdCwgc3ViQW5ub3RhdGlvbkluZGV4KSA9PlxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uT2JqZWN0KHN1YkFubm90YXRpb25PYmplY3QsIGAke2N1cnJlbnRPYmplY3RUYXJnZXR9LyR7c3ViQW5ub3RhdGlvbkluZGV4fWAsIGFubm90YXRpb25zTGlzdHMsIG9DYXBhYmlsaXRpZXMpXG5cdFx0KTtcblx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdC5sZW5ndGggPiAwKSB7XG5cdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJQcm9wZXJ0eVBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQYXRoXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiUGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5ub3RhdGlvblBhdGhcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJBbm5vdGF0aW9uUGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFR5cGVcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRJZlwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIklmXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5kXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiQW5kXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkT3JcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJPclwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEVxXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiRXFcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROZVwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIk5lXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTm90XCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiTm90XCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkR3RcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJHdFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEdlXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiR2VcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRMdFwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIkx0XCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTGVcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJMZVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFwcGx5XCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiQXBwbHlcIjtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGFubm90YXRpb25PYmplY3RbMF0gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0LiRUeXBlKSB7XG5cdFx0XHRjb25zdCB0eXBlVmFsdWUgPSBhbm5vdGF0aW9uT2JqZWN0LiRUeXBlO1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC50eXBlID0gdHlwZVZhbHVlOyAvL2Ake3R5cGVBbGlhc30uJHt0eXBlVGVybX1gO1xuXHRcdH1cblx0XHRjb25zdCBwcm9wZXJ0eVZhbHVlczogYW55ID0gW107XG5cdFx0T2JqZWN0LmtleXMoYW5ub3RhdGlvbk9iamVjdCkuZm9yRWFjaCgocHJvcGVydHlLZXkpID0+IHtcblx0XHRcdGlmIChcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJFR5cGVcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkSWZcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkQXBwbHlcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkQW5kXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJE9yXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJE5lXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJEd0XCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJEdlXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJEx0XCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJExlXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJE5vdFwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRFcVwiICYmXG5cdFx0XHRcdCFwcm9wZXJ0eUtleS5zdGFydHNXaXRoKFwiQFwiKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHByb3BlcnR5VmFsdWVzLnB1c2goXG5cdFx0XHRcdFx0cGFyc2VQcm9wZXJ0eVZhbHVlKGFubm90YXRpb25PYmplY3RbcHJvcGVydHlLZXldLCBwcm9wZXJ0eUtleSwgY3VycmVudE9iamVjdFRhcmdldCwgYW5ub3RhdGlvbnNMaXN0cywgb0NhcGFiaWxpdGllcylcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSBpZiAocHJvcGVydHlLZXkuc3RhcnRzV2l0aChcIkBcIikpIHtcblx0XHRcdFx0Ly8gQW5ub3RhdGlvbiBvZiBhbm5vdGF0aW9uXG5cdFx0XHRcdGNyZWF0ZUFubm90YXRpb25MaXN0cyhcblx0XHRcdFx0XHR7IFtwcm9wZXJ0eUtleV06IGFubm90YXRpb25PYmplY3RbcHJvcGVydHlLZXldIH0sXG5cdFx0XHRcdFx0Y3VycmVudE9iamVjdFRhcmdldCxcblx0XHRcdFx0XHRhbm5vdGF0aW9uc0xpc3RzLFxuXHRcdFx0XHRcdG9DYXBhYmlsaXRpZXNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnByb3BlcnR5VmFsdWVzID0gcHJvcGVydHlWYWx1ZXM7XG5cdH1cblx0cmV0dXJuIHBhcnNlZEFubm90YXRpb25PYmplY3Q7XG59XG5mdW5jdGlvbiBnZXRPckNyZWF0ZUFubm90YXRpb25MaXN0KHRhcmdldDogc3RyaW5nLCBhbm5vdGF0aW9uc0xpc3RzOiBSZWNvcmQ8c3RyaW5nLCBBbm5vdGF0aW9uTGlzdD4pOiBBbm5vdGF0aW9uTGlzdCB7XG5cdGlmICghYW5ub3RhdGlvbnNMaXN0cy5oYXNPd25Qcm9wZXJ0eSh0YXJnZXQpKSB7XG5cdFx0YW5ub3RhdGlvbnNMaXN0c1t0YXJnZXRdID0ge1xuXHRcdFx0dGFyZ2V0OiB0YXJnZXQsXG5cdFx0XHRhbm5vdGF0aW9uczogW11cblx0XHR9O1xuXHR9XG5cdHJldHVybiBhbm5vdGF0aW9uc0xpc3RzW3RhcmdldF07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlZmVyZW5jZUZhY2V0SWQocmVmZXJlbmNlRmFjZXQ6IGFueSkge1xuXHRjb25zdCBpZCA9IHJlZmVyZW5jZUZhY2V0LklEID8/IHJlZmVyZW5jZUZhY2V0LlRhcmdldC4kQW5ub3RhdGlvblBhdGg7XG5cdHJldHVybiBpZCA/IHByZXBhcmVJZChpZCkgOiBpZDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ2hhcnRBbm5vdGF0aW9ucyhhbm5vdGF0aW9uT2JqZWN0OiBhbnkpIHtcblx0cmV0dXJuIGFubm90YXRpb25PYmplY3QuZmlsdGVyKChvUmVjb3JkOiBhbnkpID0+IHtcblx0XHRpZiAob1JlY29yZC5UYXJnZXQgJiYgb1JlY29yZC5UYXJnZXQuJEFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRyZXR1cm4gb1JlY29yZC5UYXJnZXQuJEFubm90YXRpb25QYXRoLmluZGV4T2YoYEAke1VJQW5ub3RhdGlvblRlcm1zLkNoYXJ0fWApID09PSAtMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlSUJOQW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdDogYW55KSB7XG5cdHJldHVybiBhbm5vdGF0aW9uT2JqZWN0LmZpbHRlcigob1JlY29yZDogYW55KSA9PiB7XG5cdFx0cmV0dXJuIG9SZWNvcmQuJFR5cGUgIT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZXNlbnRhdGlvblZhcmlhbnQoYW5ub3RhdGlvbk9iamVjdDogYW55KSB7XG5cdHJldHVybiBhbm5vdGF0aW9uT2JqZWN0LmZpbHRlcigob1JlY29yZDogYW55KSA9PiB7XG5cdFx0cmV0dXJuIG9SZWNvcmQuJEFubm90YXRpb25QYXRoICE9PSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuQ2hhcnR9YDtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFubm90YXRpb25MaXN0cyhcblx0YW5ub3RhdGlvbk9iamVjdHM6IGFueSxcblx0YW5ub3RhdGlvblRhcmdldDogc3RyaW5nLFxuXHRhbm5vdGF0aW9uTGlzdHM6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0Pixcblx0b0NhcGFiaWxpdGllczogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNcbikge1xuXHRpZiAoT2JqZWN0LmtleXMoYW5ub3RhdGlvbk9iamVjdHMpLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybjtcblx0fVxuXHRjb25zdCBvdXRBbm5vdGF0aW9uT2JqZWN0ID0gZ2V0T3JDcmVhdGVBbm5vdGF0aW9uTGlzdChhbm5vdGF0aW9uVGFyZ2V0LCBhbm5vdGF0aW9uTGlzdHMpO1xuXHRpZiAoIW9DYXBhYmlsaXRpZXMuTWljcm9DaGFydCkge1xuXHRcdGRlbGV0ZSBhbm5vdGF0aW9uT2JqZWN0c1tgQCR7VUlBbm5vdGF0aW9uVGVybXMuQ2hhcnR9YF07XG5cdH1cblxuXHRmb3IgKGxldCBhbm5vdGF0aW9uS2V5IGluIGFubm90YXRpb25PYmplY3RzKSB7XG5cdFx0bGV0IGFubm90YXRpb25PYmplY3QgPSBhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XTtcblx0XHRzd2l0Y2ggKGFubm90YXRpb25LZXkpIHtcblx0XHRcdGNhc2UgYEAke1VJQW5ub3RhdGlvblRlcm1zLkhlYWRlckZhY2V0c31gOlxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuTWljcm9DaGFydCkge1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3QgPSByZW1vdmVDaGFydEFubm90YXRpb25zKGFubm90YXRpb25PYmplY3QpO1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldID0gYW5ub3RhdGlvbk9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgYEAke1VJQW5ub3RhdGlvblRlcm1zLklkZW50aWZpY2F0aW9ufWA6XG5cdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5JbnRlbnRCYXNlZE5hdmlnYXRpb24pIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0ID0gcmVtb3ZlSUJOQW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdCk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW19YDpcblx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLkludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3QgPSByZW1vdmVJQk5Bbm5vdGF0aW9ucyhhbm5vdGF0aW9uT2JqZWN0KTtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLk1pY3JvQ2hhcnQpIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0ID0gcmVtb3ZlQ2hhcnRBbm5vdGF0aW9ucyhhbm5vdGF0aW9uT2JqZWN0KTtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGBAJHtVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwfWA6XG5cdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5JbnRlbnRCYXNlZE5hdmlnYXRpb24pIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0LkRhdGEgPSByZW1vdmVJQk5Bbm5vdGF0aW9ucyhhbm5vdGF0aW9uT2JqZWN0LkRhdGEpO1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldID0gYW5ub3RhdGlvbk9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuTWljcm9DaGFydCkge1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3QuRGF0YSA9IHJlbW92ZUNoYXJ0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdC5EYXRhKTtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGBAJHtVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50fWA6XG5cdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5DaGFydCAmJiBhbm5vdGF0aW9uT2JqZWN0LlZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdC5WaXN1YWxpemF0aW9ucyA9IGhhbmRsZVByZXNlbnRhdGlvblZhcmlhbnQoYW5ub3RhdGlvbk9iamVjdC5WaXN1YWxpemF0aW9ucyk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0bGV0IGN1cnJlbnRPdXRBbm5vdGF0aW9uT2JqZWN0ID0gb3V0QW5ub3RhdGlvbk9iamVjdDtcblxuXHRcdC8vIENoZWNrIGZvciBhbm5vdGF0aW9uIG9mIGFubm90YXRpb25cblx0XHRjb25zdCBhbm5vdGF0aW9uT2ZBbm5vdGF0aW9uU3BsaXQgPSBhbm5vdGF0aW9uS2V5LnNwbGl0KFwiQFwiKTtcblx0XHRpZiAoYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0Lmxlbmd0aCA+IDIpIHtcblx0XHRcdGN1cnJlbnRPdXRBbm5vdGF0aW9uT2JqZWN0ID0gZ2V0T3JDcmVhdGVBbm5vdGF0aW9uTGlzdChcblx0XHRcdFx0YCR7YW5ub3RhdGlvblRhcmdldH1AJHthbm5vdGF0aW9uT2ZBbm5vdGF0aW9uU3BsaXRbMV19YCxcblx0XHRcdFx0YW5ub3RhdGlvbkxpc3RzXG5cdFx0XHQpO1xuXHRcdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25PZkFubm90YXRpb25TcGxpdFsyXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25PZkFubm90YXRpb25TcGxpdFsxXTtcblx0XHR9XG5cblx0XHRjb25zdCBhbm5vdGF0aW9uUXVhbGlmaWVyU3BsaXQgPSBhbm5vdGF0aW9uS2V5LnNwbGl0KFwiI1wiKTtcblx0XHRjb25zdCBxdWFsaWZpZXIgPSBhbm5vdGF0aW9uUXVhbGlmaWVyU3BsaXRbMV07XG5cdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25RdWFsaWZpZXJTcGxpdFswXTtcblxuXHRcdGNvbnN0IHBhcnNlZEFubm90YXRpb25PYmplY3Q6IGFueSA9IHtcblx0XHRcdHRlcm06IGFubm90YXRpb25LZXksXG5cdFx0XHRxdWFsaWZpZXI6IHF1YWxpZmllclxuXHRcdH07XG5cdFx0bGV0IGN1cnJlbnRBbm5vdGF0aW9uVGFyZ2V0ID0gYCR7YW5ub3RhdGlvblRhcmdldH1AJHtwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnRlcm19YDtcblx0XHRpZiAocXVhbGlmaWVyKSB7XG5cdFx0XHRjdXJyZW50QW5ub3RhdGlvblRhcmdldCArPSBgIyR7cXVhbGlmaWVyfWA7XG5cdFx0fVxuXHRcdGxldCBpc0NvbGxlY3Rpb24gPSBmYWxzZTtcblx0XHRjb25zdCB0eXBlb2ZBbm5vdGF0aW9uID0gdHlwZW9mIGFubm90YXRpb25PYmplY3Q7XG5cdFx0aWYgKGFubm90YXRpb25PYmplY3QgPT09IG51bGwpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiTnVsbFwiIH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2ZBbm5vdGF0aW9uID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIlN0cmluZ1wiLCBTdHJpbmc6IGFubm90YXRpb25PYmplY3QgfTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZkFubm90YXRpb24gPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkJvb2xcIiwgQm9vbDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mQW5ub3RhdGlvbiA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJJbnRcIiwgSW50OiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRJZiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIklmXCIsIElmOiBhbm5vdGF0aW9uT2JqZWN0LiRJZiB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQW5kICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiQW5kXCIsIEFuZDogYW5ub3RhdGlvbk9iamVjdC4kQW5kIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRPciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIk9yXCIsIE9yOiBhbm5vdGF0aW9uT2JqZWN0LiRPciB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTm90ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiTm90XCIsIE5vdDogYW5ub3RhdGlvbk9iamVjdC4kTm90IH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFcSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkVxXCIsIEVxOiBhbm5vdGF0aW9uT2JqZWN0LiRFcSB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTmUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJOZVwiLCBOZTogYW5ub3RhdGlvbk9iamVjdC4kTmUgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEd0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiR3RcIiwgR3Q6IGFubm90YXRpb25PYmplY3QuJEd0IH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkdlXCIsIEdlOiBhbm5vdGF0aW9uT2JqZWN0LiRHZSB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJMdFwiLCBMdDogYW5ub3RhdGlvbk9iamVjdC4kTHQgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJExlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiTGVcIiwgTGU6IGFubm90YXRpb25PYmplY3QuJExlIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkFwcGx5XCIsIEFwcGx5OiBhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSwgRnVuY3Rpb246IGFubm90YXRpb25PYmplY3QuJEZ1bmN0aW9uIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiUGF0aFwiLCBQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRQYXRoIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0ge1xuXHRcdFx0XHR0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsXG5cdFx0XHRcdEFubm90YXRpb25QYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aFxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJERlY2ltYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJEZWNpbWFsXCIsIERlY2ltYWw6IHBhcnNlRmxvYXQoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCkgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHtcblx0XHRcdFx0dHlwZTogXCJFbnVtTWVtYmVyXCIsXG5cdFx0XHRcdEVudW1NZW1iZXI6IGAke21hcE5hbWVUb0FsaWFzKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzBdKX0vJHthbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVsxXX1gXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhbm5vdGF0aW9uT2JqZWN0KSkge1xuXHRcdFx0aXNDb2xsZWN0aW9uID0gdHJ1ZTtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbiA9IGFubm90YXRpb25PYmplY3QubWFwKChzdWJBbm5vdGF0aW9uT2JqZWN0LCBzdWJBbm5vdGF0aW9uSW5kZXgpID0+XG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbk9iamVjdChcblx0XHRcdFx0XHRzdWJBbm5vdGF0aW9uT2JqZWN0LFxuXHRcdFx0XHRcdGAke2N1cnJlbnRBbm5vdGF0aW9uVGFyZ2V0fS8ke3N1YkFubm90YXRpb25JbmRleH1gLFxuXHRcdFx0XHRcdGFubm90YXRpb25MaXN0cyxcblx0XHRcdFx0XHRvQ2FwYWJpbGl0aWVzXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdC5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJQcm9wZXJ0eVBhdGhcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFBhdGhcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiUGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBbm5vdGF0aW9uUGF0aFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJBbm5vdGF0aW9uUGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkVHlwZVwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJElmXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIklmXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRPclwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJPclwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkRXFcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiRXFcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5lXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIk5lXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROb3RcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiTm90XCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRHdFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJHdFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkR2VcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiR2VcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEx0XCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkx0XCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRMZVwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJMZVwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5kXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkFuZFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQXBwbHlcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiQXBwbHlcIjtcblx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdFswXSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgcmVjb3JkOiBBbm5vdGF0aW9uUmVjb3JkID0ge1xuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlczogW11cblx0XHRcdH07XG5cdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdC4kVHlwZSkge1xuXHRcdFx0XHRjb25zdCB0eXBlVmFsdWUgPSBhbm5vdGF0aW9uT2JqZWN0LiRUeXBlO1xuXHRcdFx0XHRyZWNvcmQudHlwZSA9IGAke3R5cGVWYWx1ZX1gO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgcHJvcGVydHlWYWx1ZXM6IGFueVtdID0gW107XG5cdFx0XHRmb3IgKGNvbnN0IHByb3BlcnR5S2V5IGluIGFubm90YXRpb25PYmplY3QpIHtcblx0XHRcdFx0aWYgKHByb3BlcnR5S2V5ICE9PSBcIiRUeXBlXCIgJiYgIXByb3BlcnR5S2V5LnN0YXJ0c1dpdGgoXCJAXCIpKSB7XG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZXMucHVzaChcblx0XHRcdFx0XHRcdHBhcnNlUHJvcGVydHlWYWx1ZShcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdFtwcm9wZXJ0eUtleV0sXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5S2V5LFxuXHRcdFx0XHRcdFx0XHRjdXJyZW50QW5ub3RhdGlvblRhcmdldCxcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvbkxpc3RzLFxuXHRcdFx0XHRcdFx0XHRvQ2FwYWJpbGl0aWVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eUtleS5zdGFydHNXaXRoKFwiQFwiKSkge1xuXHRcdFx0XHRcdC8vIEFubm90YXRpb24gb2YgcmVjb3JkXG5cdFx0XHRcdFx0Y3JlYXRlQW5ub3RhdGlvbkxpc3RzKFxuXHRcdFx0XHRcdFx0eyBbcHJvcGVydHlLZXldOiBhbm5vdGF0aW9uT2JqZWN0W3Byb3BlcnR5S2V5XSB9LFxuXHRcdFx0XHRcdFx0Y3VycmVudEFubm90YXRpb25UYXJnZXQsXG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9uTGlzdHMsXG5cdFx0XHRcdFx0XHRvQ2FwYWJpbGl0aWVzXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmVjb3JkLnByb3BlcnR5VmFsdWVzID0gcHJvcGVydHlWYWx1ZXM7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnJlY29yZCA9IHJlY29yZDtcblx0XHR9XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5pc0NvbGxlY3Rpb24gPSBpc0NvbGxlY3Rpb247XG5cdFx0Y3VycmVudE91dEFubm90YXRpb25PYmplY3QuYW5ub3RhdGlvbnMucHVzaChwYXJzZWRBbm5vdGF0aW9uT2JqZWN0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcmVwYXJlUHJvcGVydHkocHJvcGVydHlEZWZpbml0aW9uOiBhbnksIGVudGl0eVR5cGVPYmplY3Q6IFJhd0VudGl0eVR5cGUgfCBSYXdDb21wbGV4VHlwZSwgcHJvcGVydHlOYW1lOiBzdHJpbmcpOiBSYXdQcm9wZXJ0eSB7XG5cdHJldHVybiB7XG5cdFx0X3R5cGU6IFwiUHJvcGVydHlcIixcblx0XHRuYW1lOiBwcm9wZXJ0eU5hbWUsXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtlbnRpdHlUeXBlT2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZX0vJHtwcm9wZXJ0eU5hbWV9YCxcblx0XHR0eXBlOiBwcm9wZXJ0eURlZmluaXRpb24uJFR5cGUsXG5cdFx0bWF4TGVuZ3RoOiBwcm9wZXJ0eURlZmluaXRpb24uJE1heExlbmd0aCxcblx0XHRwcmVjaXNpb246IHByb3BlcnR5RGVmaW5pdGlvbi4kUHJlY2lzaW9uLFxuXHRcdHNjYWxlOiBwcm9wZXJ0eURlZmluaXRpb24uJFNjYWxlLFxuXHRcdG51bGxhYmxlOiBwcm9wZXJ0eURlZmluaXRpb24uJE51bGxhYmxlXG5cdH07XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVOYXZpZ2F0aW9uUHJvcGVydHkoXG5cdG5hdlByb3BlcnR5RGVmaW5pdGlvbjogYW55LFxuXHRlbnRpdHlUeXBlT2JqZWN0OiBSYXdFbnRpdHlUeXBlIHwgUmF3Q29tcGxleFR5cGUsXG5cdG5hdlByb3BlcnR5TmFtZTogc3RyaW5nXG4pOiBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSB7XG5cdGxldCByZWZlcmVudGlhbENvbnN0cmFpbnQ6IFJlZmVyZW50aWFsQ29uc3RyYWludFtdID0gW107XG5cdGlmIChuYXZQcm9wZXJ0eURlZmluaXRpb24uJFJlZmVyZW50aWFsQ29uc3RyYWludCkge1xuXHRcdHJlZmVyZW50aWFsQ29uc3RyYWludCA9IE9iamVjdC5rZXlzKG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kUmVmZXJlbnRpYWxDb25zdHJhaW50KS5tYXAoKHNvdXJjZVByb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c291cmNlVHlwZU5hbWU6IGVudGl0eVR5cGVPYmplY3QubmFtZSxcblx0XHRcdFx0c291cmNlUHJvcGVydHk6IHNvdXJjZVByb3BlcnR5TmFtZSxcblx0XHRcdFx0dGFyZ2V0VHlwZU5hbWU6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRcdFx0dGFyZ2V0UHJvcGVydHk6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kUmVmZXJlbnRpYWxDb25zdHJhaW50W3NvdXJjZVByb3BlcnR5TmFtZV1cblx0XHRcdH07XG5cdFx0fSk7XG5cdH1cblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnR5OiBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSA9IHtcblx0XHRfdHlwZTogXCJOYXZpZ2F0aW9uUHJvcGVydHlcIixcblx0XHRuYW1lOiBuYXZQcm9wZXJ0eU5hbWUsXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtlbnRpdHlUeXBlT2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZX0vJHtuYXZQcm9wZXJ0eU5hbWV9YCxcblx0XHRwYXJ0bmVyOiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJFBhcnRuZXIsXG5cdFx0aXNDb2xsZWN0aW9uOiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJGlzQ29sbGVjdGlvbiA/IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kaXNDb2xsZWN0aW9uIDogZmFsc2UsXG5cdFx0Y29udGFpbnNUYXJnZXQ6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kQ29udGFpbnNUYXJnZXQsXG5cdFx0dGFyZ2V0VHlwZU5hbWU6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRyZWZlcmVudGlhbENvbnN0cmFpbnRcblx0fTtcblxuXHRyZXR1cm4gbmF2aWdhdGlvblByb3BlcnR5O1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlRW50aXR5U2V0KGVudGl0eVNldERlZmluaXRpb246IGFueSwgZW50aXR5U2V0TmFtZTogc3RyaW5nLCBlbnRpdHlDb250YWluZXJOYW1lOiBzdHJpbmcpOiBSYXdFbnRpdHlTZXQge1xuXHRjb25zdCBlbnRpdHlTZXRPYmplY3Q6IFJhd0VudGl0eVNldCA9IHtcblx0XHRfdHlwZTogXCJFbnRpdHlTZXRcIixcblx0XHRuYW1lOiBlbnRpdHlTZXROYW1lLFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc6IHt9LFxuXHRcdGVudGl0eVR5cGVOYW1lOiBlbnRpdHlTZXREZWZpbml0aW9uLiRUeXBlLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5Q29udGFpbmVyTmFtZX0vJHtlbnRpdHlTZXROYW1lfWBcblx0fTtcblx0cmV0dXJuIGVudGl0eVNldE9iamVjdDtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZVNpbmdsZXRvbihzaW5nbGV0b25EZWZpbml0aW9uOiBhbnksIHNpbmdsZXRvbk5hbWU6IHN0cmluZywgZW50aXR5Q29udGFpbmVyTmFtZTogc3RyaW5nKTogUmF3U2luZ2xldG9uIHtcblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJTaW5nbGV0b25cIixcblx0XHRuYW1lOiBzaW5nbGV0b25OYW1lLFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc6IHt9LFxuXHRcdGVudGl0eVR5cGVOYW1lOiBzaW5nbGV0b25EZWZpbml0aW9uLiRUeXBlLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5Q29udGFpbmVyTmFtZX0vJHtzaW5nbGV0b25OYW1lfWAsXG5cdFx0bnVsbGFibGU6IHRydWVcblx0fTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUFjdGlvbkltcG9ydChhY3Rpb25JbXBvcnQ6IGFueSwgYWN0aW9uSW1wb3J0TmFtZTogc3RyaW5nLCBlbnRpdHlDb250YWluZXJOYW1lOiBzdHJpbmcpOiBSYXdBY3Rpb25JbXBvcnQge1xuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIkFjdGlvbkltcG9ydFwiLFxuXHRcdG5hbWU6IGFjdGlvbkltcG9ydE5hbWUsXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtlbnRpdHlDb250YWluZXJOYW1lfS8ke2FjdGlvbkltcG9ydE5hbWV9YCxcblx0XHRhY3Rpb25OYW1lOiBhY3Rpb25JbXBvcnQuJEFjdGlvblxuXHR9O1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlVHlwZURlZmluaXRpb24odHlwZURlZmluaXRpb246IGFueSwgdHlwZU5hbWU6IHN0cmluZywgbmFtZXNwYWNlUHJlZml4OiBzdHJpbmcpOiBSYXdUeXBlRGVmaW5pdGlvbiB7XG5cdGNvbnN0IHR5cGVPYmplY3Q6IFJhd1R5cGVEZWZpbml0aW9uID0ge1xuXHRcdF90eXBlOiBcIlR5cGVEZWZpbml0aW9uXCIsXG5cdFx0bmFtZTogdHlwZU5hbWUuc3Vic3RyaW5nKG5hbWVzcGFjZVByZWZpeC5sZW5ndGgpLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogdHlwZU5hbWUsXG5cdFx0dW5kZXJseWluZ1R5cGU6IHR5cGVEZWZpbml0aW9uLiRVbmRlcmx5aW5nVHlwZVxuXHR9O1xuXHRyZXR1cm4gdHlwZU9iamVjdDtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUNvbXBsZXhUeXBlKGNvbXBsZXhUeXBlRGVmaW5pdGlvbjogYW55LCBjb21wbGV4VHlwZU5hbWU6IHN0cmluZywgbmFtZXNwYWNlUHJlZml4OiBzdHJpbmcpOiBSYXdDb21wbGV4VHlwZSB7XG5cdGNvbnN0IGNvbXBsZXhUeXBlT2JqZWN0OiBSYXdDb21wbGV4VHlwZSA9IHtcblx0XHRfdHlwZTogXCJDb21wbGV4VHlwZVwiLFxuXHRcdG5hbWU6IGNvbXBsZXhUeXBlTmFtZS5zdWJzdHJpbmcobmFtZXNwYWNlUHJlZml4Lmxlbmd0aCksXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBjb21wbGV4VHlwZU5hbWUsXG5cdFx0cHJvcGVydGllczogW10sXG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXM6IFtdXG5cdH07XG5cblx0Y29uc3QgY29tcGxleFR5cGVQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoY29tcGxleFR5cGVEZWZpbml0aW9uKVxuXHRcdC5maWx0ZXIoKHByb3BlcnR5TmFtZU9yTm90KSA9PiB7XG5cdFx0XHRpZiAocHJvcGVydHlOYW1lT3JOb3QgIT0gXCIkS2V5XCIgJiYgcHJvcGVydHlOYW1lT3JOb3QgIT0gXCIka2luZFwiKSB7XG5cdFx0XHRcdHJldHVybiBjb21wbGV4VHlwZURlZmluaXRpb25bcHJvcGVydHlOYW1lT3JOb3RdLiRraW5kID09PSBcIlByb3BlcnR5XCI7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuc29ydCgoYSwgYikgPT4gKGEgPiBiID8gMSA6IC0xKSlcblx0XHQubWFwKChwcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdHJldHVybiBwcmVwYXJlUHJvcGVydHkoY29tcGxleFR5cGVEZWZpbml0aW9uW3Byb3BlcnR5TmFtZV0sIGNvbXBsZXhUeXBlT2JqZWN0LCBwcm9wZXJ0eU5hbWUpO1xuXHRcdH0pO1xuXG5cdGNvbXBsZXhUeXBlT2JqZWN0LnByb3BlcnRpZXMgPSBjb21wbGV4VHlwZVByb3BlcnRpZXM7XG5cdGNvbnN0IGNvbXBsZXhUeXBlTmF2aWdhdGlvblByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhjb21wbGV4VHlwZURlZmluaXRpb24pXG5cdFx0LmZpbHRlcigocHJvcGVydHlOYW1lT3JOb3QpID0+IHtcblx0XHRcdGlmIChwcm9wZXJ0eU5hbWVPck5vdCAhPSBcIiRLZXlcIiAmJiBwcm9wZXJ0eU5hbWVPck5vdCAhPSBcIiRraW5kXCIpIHtcblx0XHRcdFx0cmV0dXJuIGNvbXBsZXhUeXBlRGVmaW5pdGlvbltwcm9wZXJ0eU5hbWVPck5vdF0uJGtpbmQgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCI7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuc29ydCgoYSwgYikgPT4gKGEgPiBiID8gMSA6IC0xKSlcblx0XHQubWFwKChuYXZQcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdHJldHVybiBwcmVwYXJlTmF2aWdhdGlvblByb3BlcnR5KGNvbXBsZXhUeXBlRGVmaW5pdGlvbltuYXZQcm9wZXJ0eU5hbWVdLCBjb21wbGV4VHlwZU9iamVjdCwgbmF2UHJvcGVydHlOYW1lKTtcblx0XHR9KTtcblx0Y29tcGxleFR5cGVPYmplY3QubmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb21wbGV4VHlwZU5hdmlnYXRpb25Qcm9wZXJ0aWVzO1xuXHRyZXR1cm4gY29tcGxleFR5cGVPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVFbnRpdHlLZXlzKGVudGl0eVR5cGVEZWZpbml0aW9uOiBhbnksIG9NZXRhTW9kZWxEYXRhOiBhbnkpOiBzdHJpbmdbXSB7XG5cdGlmICghZW50aXR5VHlwZURlZmluaXRpb24uJEtleSAmJiBlbnRpdHlUeXBlRGVmaW5pdGlvbi4kQmFzZVR5cGUpIHtcblx0XHRyZXR1cm4gcHJlcGFyZUVudGl0eUtleXMob01ldGFNb2RlbERhdGFbZW50aXR5VHlwZURlZmluaXRpb24uJEJhc2VUeXBlXSwgb01ldGFNb2RlbERhdGEpO1xuXHR9XG5cdHJldHVybiBlbnRpdHlUeXBlRGVmaW5pdGlvbi4kS2V5ID8/IFtdOyAvL2hhbmRsaW5nIG9mIGVudGl0eSB0eXBlcyB3aXRob3V0IGtleSBhcyB3ZWxsIGFzIGJhc2V0eXBlXG59XG5cbmZ1bmN0aW9uIHByZXBhcmVFbnRpdHlUeXBlKGVudGl0eVR5cGVEZWZpbml0aW9uOiBhbnksIGVudGl0eVR5cGVOYW1lOiBzdHJpbmcsIG5hbWVzcGFjZVByZWZpeDogc3RyaW5nLCBtZXRhTW9kZWxEYXRhOiBhbnkpOiBSYXdFbnRpdHlUeXBlIHtcblx0Y29uc3QgZW50aXR5VHlwZTogUmF3RW50aXR5VHlwZSA9IHtcblx0XHRfdHlwZTogXCJFbnRpdHlUeXBlXCIsXG5cdFx0bmFtZTogZW50aXR5VHlwZU5hbWUuc3Vic3RyaW5nKG5hbWVzcGFjZVByZWZpeC5sZW5ndGgpLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogZW50aXR5VHlwZU5hbWUsXG5cdFx0a2V5czogW10sXG5cdFx0ZW50aXR5UHJvcGVydGllczogW10sXG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXM6IFtdLFxuXHRcdGFjdGlvbnM6IHt9XG5cdH07XG5cblx0Zm9yIChjb25zdCBrZXkgaW4gZW50aXR5VHlwZURlZmluaXRpb24pIHtcblx0XHRjb25zdCB2YWx1ZSA9IGVudGl0eVR5cGVEZWZpbml0aW9uW2tleV07XG5cblx0XHRzd2l0Y2ggKHZhbHVlLiRraW5kKSB7XG5cdFx0XHRjYXNlIFwiUHJvcGVydHlcIjpcblx0XHRcdFx0Y29uc3QgcHJvcGVydHkgPSBwcmVwYXJlUHJvcGVydHkodmFsdWUsIGVudGl0eVR5cGUsIGtleSk7XG5cdFx0XHRcdGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5wdXNoKHByb3BlcnR5KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTmF2aWdhdGlvblByb3BlcnR5XCI6XG5cdFx0XHRcdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0eSA9IHByZXBhcmVOYXZpZ2F0aW9uUHJvcGVydHkodmFsdWUsIGVudGl0eVR5cGUsIGtleSk7XG5cdFx0XHRcdGVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMucHVzaChuYXZpZ2F0aW9uUHJvcGVydHkpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRlbnRpdHlUeXBlLmtleXMgPSBwcmVwYXJlRW50aXR5S2V5cyhlbnRpdHlUeXBlRGVmaW5pdGlvbiwgbWV0YU1vZGVsRGF0YSlcblx0XHQubWFwKChlbnRpdHlLZXkpID0+IGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5maW5kKChwcm9wZXJ0eSkgPT4gcHJvcGVydHkubmFtZSA9PT0gZW50aXR5S2V5KSlcblx0XHQuZmlsdGVyKChwcm9wZXJ0eSkgPT4gcHJvcGVydHkgIT09IHVuZGVmaW5lZCkgYXMgUmF3RW50aXR5VHlwZVtcImtleXNcIl07XG5cblx0Ly8gQ2hlY2sgaWYgdGhlcmUgYXJlIGZpbHRlciBmYWNldHMgZGVmaW5lZCBmb3IgdGhlIGVudGl0eVR5cGUgYW5kIGlmIHllcywgY2hlY2sgaWYgYWxsIG9mIHRoZW0gaGF2ZSBhbiBJRFxuXHQvLyBUaGUgSUQgaXMgb3B0aW9uYWwsIGJ1dCBpdCBpcyBpbnRlcm5hbGx5IHRha2VuIGZvciBncm91cGluZyBmaWx0ZXIgZmllbGRzIGFuZCBpZiBpdCdzIG5vdCBwcmVzZW50XG5cdC8vIGEgZmFsbGJhY2sgSUQgbmVlZHMgdG8gYmUgZ2VuZXJhdGVkIGhlcmUuXG5cdG1ldGFNb2RlbERhdGEuJEFubm90YXRpb25zW2VudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lXT8uW2BAJHtVSUFubm90YXRpb25UZXJtcy5GaWx0ZXJGYWNldHN9YF0/LmZvckVhY2goXG5cdFx0KGZpbHRlckZhY2V0QW5ub3RhdGlvbjogYW55KSA9PiB7XG5cdFx0XHRmaWx0ZXJGYWNldEFubm90YXRpb24uSUQgPSBjcmVhdGVSZWZlcmVuY2VGYWNldElkKGZpbHRlckZhY2V0QW5ub3RhdGlvbik7XG5cdFx0fVxuXHQpO1xuXG5cdGZvciAoY29uc3QgZW50aXR5UHJvcGVydHkgb2YgZW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzKSB7XG5cdFx0aWYgKCFtZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9uc1tlbnRpdHlQcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWVdKSB7XG5cdFx0XHRtZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9uc1tlbnRpdHlQcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWVdID0ge307XG5cdFx0fVxuXHRcdGlmICghbWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbZW50aXR5UHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXVtgQCR7VUlBbm5vdGF0aW9uVGVybXMuRGF0YUZpZWxkRGVmYXVsdH1gXSkge1xuXHRcdFx0bWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbZW50aXR5UHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXVtgQCR7VUlBbm5vdGF0aW9uVGVybXMuRGF0YUZpZWxkRGVmYXVsdH1gXSA9IHtcblx0XHRcdFx0JFR5cGU6IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZCxcblx0XHRcdFx0VmFsdWU6IHsgJFBhdGg6IGVudGl0eVByb3BlcnR5Lm5hbWUgfVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZW50aXR5VHlwZTtcbn1cbmZ1bmN0aW9uIHByZXBhcmVBY3Rpb24oYWN0aW9uTmFtZTogc3RyaW5nLCBhY3Rpb25SYXdEYXRhOiBNZXRhTW9kZWxBY3Rpb24sIG5hbWVzcGFjZVByZWZpeDogc3RyaW5nKTogUmF3QWN0aW9uIHtcblx0bGV0IGFjdGlvbkVudGl0eVR5cGUgPSBcIlwiO1xuXHRsZXQgYWN0aW9uRlFOID0gYWN0aW9uTmFtZTtcblxuXHRpZiAoYWN0aW9uUmF3RGF0YS4kSXNCb3VuZCkge1xuXHRcdGNvbnN0IGJpbmRpbmdQYXJhbWV0ZXIgPSBhY3Rpb25SYXdEYXRhLiRQYXJhbWV0ZXJbMF07XG5cdFx0YWN0aW9uRW50aXR5VHlwZSA9IGJpbmRpbmdQYXJhbWV0ZXIuJFR5cGU7XG5cdFx0aWYgKGJpbmRpbmdQYXJhbWV0ZXIuJGlzQ29sbGVjdGlvbiA9PT0gdHJ1ZSkge1xuXHRcdFx0YWN0aW9uRlFOID0gYCR7YWN0aW9uTmFtZX0oQ29sbGVjdGlvbigke2FjdGlvbkVudGl0eVR5cGV9KSlgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhY3Rpb25GUU4gPSBgJHthY3Rpb25OYW1lfSgke2FjdGlvbkVudGl0eVR5cGV9KWA7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgcGFyYW1ldGVycyA9IGFjdGlvblJhd0RhdGEuJFBhcmFtZXRlciA/PyBbXTtcblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJBY3Rpb25cIixcblx0XHRuYW1lOiBhY3Rpb25OYW1lLnN1YnN0cmluZyhuYW1lc3BhY2VQcmVmaXgubGVuZ3RoKSxcblx0XHRmdWxseVF1YWxpZmllZE5hbWU6IGFjdGlvbkZRTixcblx0XHRpc0JvdW5kOiBhY3Rpb25SYXdEYXRhLiRJc0JvdW5kID8/IGZhbHNlLFxuXHRcdGlzRnVuY3Rpb246IGFjdGlvblJhd0RhdGEuJGtpbmQgPT09IFwiRnVuY3Rpb25cIixcblx0XHRzb3VyY2VUeXBlOiBhY3Rpb25FbnRpdHlUeXBlLFxuXHRcdHJldHVyblR5cGU6IGFjdGlvblJhd0RhdGEuJFJldHVyblR5cGU/LiRUeXBlID8/IFwiXCIsXG5cdFx0cGFyYW1ldGVyczogcGFyYW1ldGVycy5tYXAoKHBhcmFtKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRfdHlwZTogXCJBY3Rpb25QYXJhbWV0ZXJcIixcblx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHthY3Rpb25GUU59LyR7cGFyYW0uJE5hbWV9YCxcblx0XHRcdFx0aXNDb2xsZWN0aW9uOiBwYXJhbS4kaXNDb2xsZWN0aW9uID8/IGZhbHNlLFxuXHRcdFx0XHRuYW1lOiBwYXJhbS4kTmFtZSxcblx0XHRcdFx0dHlwZTogcGFyYW0uJFR5cGVcblx0XHRcdH07XG5cdFx0fSlcblx0fTtcbn1cblxuZnVuY3Rpb24gcGFyc2VFbnRpdHlDb250YWluZXIoXG5cdG5hbWVzcGFjZVByZWZpeDogc3RyaW5nLFxuXHRlbnRpdHlDb250YWluZXJOYW1lOiBzdHJpbmcsXG5cdGVudGl0eUNvbnRhaW5lck1ldGFkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuXHRzY2hlbWE6IFJhd1NjaGVtYVxuKSB7XG5cdHNjaGVtYS5lbnRpdHlDb250YWluZXIgPSB7XG5cdFx0X3R5cGU6IFwiRW50aXR5Q29udGFpbmVyXCIsXG5cdFx0bmFtZTogZW50aXR5Q29udGFpbmVyTmFtZS5zdWJzdHJpbmcobmFtZXNwYWNlUHJlZml4Lmxlbmd0aCksXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBlbnRpdHlDb250YWluZXJOYW1lXG5cdH07XG5cblx0Zm9yIChjb25zdCBlbGVtZW50TmFtZSBpbiBlbnRpdHlDb250YWluZXJNZXRhZGF0YSkge1xuXHRcdGNvbnN0IGVsZW1lbnRWYWx1ZSA9IGVudGl0eUNvbnRhaW5lck1ldGFkYXRhW2VsZW1lbnROYW1lXTtcblx0XHRzd2l0Y2ggKGVsZW1lbnRWYWx1ZS4ka2luZCkge1xuXHRcdFx0Y2FzZSBcIkVudGl0eVNldFwiOlxuXHRcdFx0XHRzY2hlbWEuZW50aXR5U2V0cy5wdXNoKHByZXBhcmVFbnRpdHlTZXQoZWxlbWVudFZhbHVlLCBlbGVtZW50TmFtZSwgZW50aXR5Q29udGFpbmVyTmFtZSkpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBcIlNpbmdsZXRvblwiOlxuXHRcdFx0XHRzY2hlbWEuc2luZ2xldG9ucy5wdXNoKHByZXBhcmVTaW5nbGV0b24oZWxlbWVudFZhbHVlLCBlbGVtZW50TmFtZSwgZW50aXR5Q29udGFpbmVyTmFtZSkpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBcIkFjdGlvbkltcG9ydFwiOlxuXHRcdFx0XHRzY2hlbWEuYWN0aW9uSW1wb3J0cy5wdXNoKHByZXBhcmVBY3Rpb25JbXBvcnQoZWxlbWVudFZhbHVlLCBlbGVtZW50TmFtZSwgZW50aXR5Q29udGFpbmVyTmFtZSkpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvLyBsaW5rIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IGJpbmRpbmdzICgkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZylcblx0Zm9yIChjb25zdCBlbnRpdHlTZXQgb2Ygc2NoZW1hLmVudGl0eVNldHMpIHtcblx0XHRjb25zdCBuYXZQcm9wZXJ0eUJpbmRpbmdzID0gZW50aXR5Q29udGFpbmVyTWV0YWRhdGFbZW50aXR5U2V0Lm5hbWVdLiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nO1xuXHRcdGlmIChuYXZQcm9wZXJ0eUJpbmRpbmdzKSB7XG5cdFx0XHRmb3IgKGNvbnN0IG5hdlByb3BOYW1lIG9mIE9iamVjdC5rZXlzKG5hdlByb3BlcnR5QmluZGluZ3MpKSB7XG5cdFx0XHRcdGNvbnN0IHRhcmdldEVudGl0eVNldCA9IHNjaGVtYS5lbnRpdHlTZXRzLmZpbmQoKGVudGl0eVNldE5hbWUpID0+IGVudGl0eVNldE5hbWUubmFtZSA9PT0gbmF2UHJvcGVydHlCaW5kaW5nc1tuYXZQcm9wTmFtZV0pO1xuXHRcdFx0XHRpZiAodGFyZ2V0RW50aXR5U2V0KSB7XG5cdFx0XHRcdFx0ZW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdbbmF2UHJvcE5hbWVdID0gdGFyZ2V0RW50aXR5U2V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQW5ub3RhdGlvbnMoYW5ub3RhdGlvbnM6IFJlY29yZDxzdHJpbmcsIGFueT4sIGNhcGFiaWxpdGllczogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXMpIHtcblx0Y29uc3QgYW5ub3RhdGlvbkxpc3RzOiBSZWNvcmQ8c3RyaW5nLCBBbm5vdGF0aW9uTGlzdD4gPSB7fTtcblx0Zm9yIChjb25zdCB0YXJnZXQgaW4gYW5ub3RhdGlvbnMpIHtcblx0XHRjcmVhdGVBbm5vdGF0aW9uTGlzdHMoYW5ub3RhdGlvbnNbdGFyZ2V0XSwgdGFyZ2V0LCBhbm5vdGF0aW9uTGlzdHMsIGNhcGFiaWxpdGllcyk7XG5cdH1cblx0cmV0dXJuIE9iamVjdC52YWx1ZXMoYW5ub3RhdGlvbkxpc3RzKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VTY2hlbWEobWV0YU1vZGVsRGF0YTogYW55KSB7XG5cdC8vIGFzc3VtaW5nIHRoZXJlIGlzIG9ubHkgb25lIHNjaGVtYS9uYW1lc3BhY2Vcblx0Y29uc3QgbmFtZXNwYWNlUHJlZml4ID0gT2JqZWN0LmtleXMobWV0YU1vZGVsRGF0YSkuZmluZCgoa2V5KSA9PiBtZXRhTW9kZWxEYXRhW2tleV0uJGtpbmQgPT09IFwiU2NoZW1hXCIpID8/IFwiXCI7XG5cblx0Y29uc3Qgc2NoZW1hOiBSYXdTY2hlbWEgPSB7XG5cdFx0bmFtZXNwYWNlOiBuYW1lc3BhY2VQcmVmaXguc2xpY2UoMCwgLTEpLFxuXHRcdGVudGl0eUNvbnRhaW5lcjogeyBfdHlwZTogXCJFbnRpdHlDb250YWluZXJcIiwgbmFtZTogXCJcIiwgZnVsbHlRdWFsaWZpZWROYW1lOiBcIlwiIH0sXG5cdFx0ZW50aXR5U2V0czogW10sXG5cdFx0ZW50aXR5VHlwZXM6IFtdLFxuXHRcdGNvbXBsZXhUeXBlczogW10sXG5cdFx0dHlwZURlZmluaXRpb25zOiBbXSxcblx0XHRzaW5nbGV0b25zOiBbXSxcblx0XHRhc3NvY2lhdGlvbnM6IFtdLFxuXHRcdGFzc29jaWF0aW9uU2V0czogW10sXG5cdFx0YWN0aW9uczogW10sXG5cdFx0YWN0aW9uSW1wb3J0czogW10sXG5cdFx0YW5ub3RhdGlvbnM6IHt9XG5cdH07XG5cblx0Y29uc3QgcGFyc2VNZXRhTW9kZWxFbGVtZW50ID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkgPT4ge1xuXHRcdHN3aXRjaCAodmFsdWUuJGtpbmQpIHtcblx0XHRcdGNhc2UgXCJFbnRpdHlDb250YWluZXJcIjpcblx0XHRcdFx0cGFyc2VFbnRpdHlDb250YWluZXIobmFtZXNwYWNlUHJlZml4LCBuYW1lLCB2YWx1ZSwgc2NoZW1hKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJBY3Rpb25cIjpcblx0XHRcdGNhc2UgXCJGdW5jdGlvblwiOlxuXHRcdFx0XHRzY2hlbWEuYWN0aW9ucy5wdXNoKHByZXBhcmVBY3Rpb24obmFtZSwgdmFsdWUsIG5hbWVzcGFjZVByZWZpeCkpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBcIkVudGl0eVR5cGVcIjpcblx0XHRcdFx0c2NoZW1hLmVudGl0eVR5cGVzLnB1c2gocHJlcGFyZUVudGl0eVR5cGUodmFsdWUsIG5hbWUsIG5hbWVzcGFjZVByZWZpeCwgbWV0YU1vZGVsRGF0YSkpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBcIkNvbXBsZXhUeXBlXCI6XG5cdFx0XHRcdHNjaGVtYS5jb21wbGV4VHlwZXMucHVzaChwcmVwYXJlQ29tcGxleFR5cGUodmFsdWUsIG5hbWUsIG5hbWVzcGFjZVByZWZpeCkpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBcIlR5cGVEZWZpbml0aW9uXCI6XG5cdFx0XHRcdHNjaGVtYS50eXBlRGVmaW5pdGlvbnMucHVzaChwcmVwYXJlVHlwZURlZmluaXRpb24odmFsdWUsIG5hbWUsIG5hbWVzcGFjZVByZWZpeCkpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH07XG5cblx0Zm9yIChjb25zdCBlbGVtZW50TmFtZSBpbiBtZXRhTW9kZWxEYXRhKSB7XG5cdFx0Y29uc3QgZWxlbWVudFZhbHVlID0gbWV0YU1vZGVsRGF0YVtlbGVtZW50TmFtZV07XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShlbGVtZW50VmFsdWUpKSB7XG5cdFx0XHQvLyB2YWx1ZSBjYW4gYmUgYW4gYXJyYXkgaW4gY2FzZSBvZiBhY3Rpb25zIG9yIGZ1bmN0aW9uc1xuXHRcdFx0Zm9yIChjb25zdCBzdWJFbGVtZW50VmFsdWUgb2YgZWxlbWVudFZhbHVlKSB7XG5cdFx0XHRcdHBhcnNlTWV0YU1vZGVsRWxlbWVudChlbGVtZW50TmFtZSwgc3ViRWxlbWVudFZhbHVlKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cGFyc2VNZXRhTW9kZWxFbGVtZW50KGVsZW1lbnROYW1lLCBlbGVtZW50VmFsdWUpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY2hlbWE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1ldGFNb2RlbChcblx0bWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0Y2FwYWJpbGl0aWVzOiBFbnZpcm9ubWVudENhcGFiaWxpdGllcyA9IERlZmF1bHRFbnZpcm9ubWVudENhcGFiaWxpdGllc1xuKTogUmF3TWV0YWRhdGEge1xuXHRjb25zdCByZXN1bHQ6IE9taXQ8UmF3TWV0YWRhdGEsIFwic2NoZW1hXCI+ID0ge1xuXHRcdGlkZW50aWZpY2F0aW9uOiBcIm1ldGFtb2RlbFJlc3VsdFwiLFxuXHRcdHZlcnNpb246IFwiNC4wXCIsXG5cdFx0cmVmZXJlbmNlczogW11cblx0fTtcblxuXHQvLyBwYXJzZSB0aGUgc2NoZW1hIHdoZW4gaXQgaXMgYWNjZXNzZWQgZm9yIHRoZSBmaXJzdCB0aW1lXG5cdEFubm90YXRpb25Db252ZXJ0ZXIubGF6eShyZXN1bHQgYXMgUmF3TWV0YWRhdGEsIFwic2NoZW1hXCIsICgpID0+IHtcblx0XHRjb25zdCBtZXRhTW9kZWxEYXRhID0gbWV0YU1vZGVsLmdldE9iamVjdChcIi8kXCIpO1xuXHRcdGNvbnN0IHNjaGVtYSA9IHBhcnNlU2NoZW1hKG1ldGFNb2RlbERhdGEpO1xuXG5cdFx0QW5ub3RhdGlvbkNvbnZlcnRlci5sYXp5KHNjaGVtYS5hbm5vdGF0aW9ucywgXCJtZXRhbW9kZWxSZXN1bHRcIiwgKCkgPT4gcGFyc2VBbm5vdGF0aW9ucyhtZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9ucywgY2FwYWJpbGl0aWVzKSk7XG5cblx0XHRyZXR1cm4gc2NoZW1hO1xuXHR9KTtcblxuXHRyZXR1cm4gcmVzdWx0IGFzIFJhd01ldGFkYXRhO1xufVxuXG5jb25zdCBtTWV0YU1vZGVsTWFwOiBSZWNvcmQ8c3RyaW5nLCBDb252ZXJ0ZWRNZXRhZGF0YT4gPSB7fTtcblxuLyoqXG4gKiBDb252ZXJ0IHRoZSBPRGF0YU1ldGFNb2RlbCBpbnRvIGFub3RoZXIgZm9ybWF0IHRoYXQgYWxsb3cgZm9yIGVhc3kgbWFuaXB1bGF0aW9uIG9mIHRoZSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgT0RhdGFNZXRhTW9kZWxcbiAqIEBwYXJhbSBvQ2FwYWJpbGl0aWVzIFRoZSBjdXJyZW50IGNhcGFiaWxpdGllc1xuICogQHJldHVybnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgb2JqZWN0LWxpa2UgYW5ub3RhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgb0NhcGFiaWxpdGllcz86IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzKTogQ29udmVydGVkTWV0YWRhdGEge1xuXHRjb25zdCBzTWV0YU1vZGVsSWQgPSAob01ldGFNb2RlbCBhcyBhbnkpLmlkO1xuXHRpZiAoIW1NZXRhTW9kZWxNYXAuaGFzT3duUHJvcGVydHkoc01ldGFNb2RlbElkKSkge1xuXHRcdGNvbnN0IHBhcnNlZE91dHB1dCA9IHBhcnNlTWV0YU1vZGVsKG9NZXRhTW9kZWwsIG9DYXBhYmlsaXRpZXMpO1xuXHRcdHRyeSB7XG5cdFx0XHRtTWV0YU1vZGVsTWFwW3NNZXRhTW9kZWxJZF0gPSBBbm5vdGF0aW9uQ29udmVydGVyLmNvbnZlcnQocGFyc2VkT3V0cHV0KTtcblx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihvRXJyb3IgYXMgYW55KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG1NZXRhTW9kZWxNYXBbc01ldGFNb2RlbElkXSBhcyBhbnkgYXMgQ29udmVydGVkTWV0YWRhdGE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb252ZXJ0ZWRUeXBlcyhvQ29udGV4dDogQ29udGV4dCkge1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSBhcyB1bmtub3duIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRpZiAoIW9NZXRhTW9kZWwuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTWV0YU1vZGVsXCIpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiVGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWQgb24gYSBPRGF0YU1ldGFNb2RlbFwiKTtcblx0fVxuXHRyZXR1cm4gY29udmVydFR5cGVzKG9NZXRhTW9kZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlTW9kZWxDYWNoZURhdGEob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0ZGVsZXRlIG1NZXRhTW9kZWxNYXBbKG9NZXRhTW9kZWwgYXMgYW55KS5pZF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dChvTWV0YU1vZGVsQ29udGV4dDogQ29udGV4dCwgYkluY2x1ZGVWaXNpdGVkT2JqZWN0czogYm9vbGVhbiA9IGZhbHNlKTogYW55IHtcblx0Y29uc3Qgb0NvbnZlcnRlZE1ldGFkYXRhID0gY29udmVydFR5cGVzKG9NZXRhTW9kZWxDb250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwpO1xuXHRjb25zdCBzUGF0aCA9IG9NZXRhTW9kZWxDb250ZXh0LmdldFBhdGgoKTtcblxuXHRjb25zdCBhUGF0aFNwbGl0ID0gc1BhdGguc3BsaXQoXCIvXCIpO1xuXHRsZXQgZmlyc3RQYXJ0ID0gYVBhdGhTcGxpdFsxXTtcblx0bGV0IGJlZ2luSW5kZXggPSAyO1xuXHRpZiAob0NvbnZlcnRlZE1ldGFkYXRhLmVudGl0eUNvbnRhaW5lci5mdWxseVF1YWxpZmllZE5hbWUgPT09IGZpcnN0UGFydCkge1xuXHRcdGZpcnN0UGFydCA9IGFQYXRoU3BsaXRbMl07XG5cdFx0YmVnaW5JbmRleCsrO1xuXHR9XG5cdGxldCB0YXJnZXRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiA9IG9Db252ZXJ0ZWRNZXRhZGF0YS5lbnRpdHlTZXRzLmZpbmQoXG5cdFx0KGVudGl0eVNldCkgPT4gZW50aXR5U2V0Lm5hbWUgPT09IGZpcnN0UGFydFxuXHQpIGFzIEVudGl0eVNldDtcblx0aWYgKCF0YXJnZXRFbnRpdHlTZXQpIHtcblx0XHR0YXJnZXRFbnRpdHlTZXQgPSBvQ29udmVydGVkTWV0YWRhdGEuc2luZ2xldG9ucy5maW5kKChzaW5nbGV0b24pID0+IHNpbmdsZXRvbi5uYW1lID09PSBmaXJzdFBhcnQpIGFzIFNpbmdsZXRvbjtcblx0fVxuXHRsZXQgcmVsYXRpdmVQYXRoID0gYVBhdGhTcGxpdC5zbGljZShiZWdpbkluZGV4KS5qb2luKFwiL1wiKTtcblxuXHRjb25zdCBsb2NhbE9iamVjdHM6IGFueVtdID0gW3RhcmdldEVudGl0eVNldF07XG5cdHdoaWxlIChyZWxhdGl2ZVBhdGggJiYgcmVsYXRpdmVQYXRoLmxlbmd0aCA+IDAgJiYgcmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiKSkge1xuXHRcdGxldCByZWxhdGl2ZVNwbGl0ID0gcmVsYXRpdmVQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRsZXQgaWR4ID0gMDtcblx0XHRsZXQgY3VycmVudEVudGl0eVNldCwgc05hdlByb3BUb0NoZWNrO1xuXG5cdFx0cmVsYXRpdmVTcGxpdCA9IHJlbGF0aXZlU3BsaXQuc2xpY2UoMSk7IC8vIFJlbW92aW5nIFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIlxuXHRcdHdoaWxlICghY3VycmVudEVudGl0eVNldCAmJiByZWxhdGl2ZVNwbGl0Lmxlbmd0aCA+IGlkeCkge1xuXHRcdFx0aWYgKHJlbGF0aXZlU3BsaXRbaWR4XSAhPT0gXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiKSB7XG5cdFx0XHRcdC8vIEZpbmRpbmcgdGhlIGNvcnJlY3QgZW50aXR5U2V0IGZvciB0aGUgbmF2aWdhaXRvbiBwcm9wZXJ0eSBiaW5kaW5nIGV4YW1wbGU6IFwiU2V0L19TYWxlc09yZGVyXCJcblx0XHRcdFx0c05hdlByb3BUb0NoZWNrID0gcmVsYXRpdmVTcGxpdFxuXHRcdFx0XHRcdC5zbGljZSgwLCBpZHggKyAxKVxuXHRcdFx0XHRcdC5qb2luKFwiL1wiKVxuXHRcdFx0XHRcdC5yZXBsYWNlKFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCIsIFwiXCIpO1xuXHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gdGFyZ2V0RW50aXR5U2V0ICYmIHRhcmdldEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW3NOYXZQcm9wVG9DaGVja107XG5cdFx0XHR9XG5cdFx0XHRpZHgrKztcblx0XHR9XG5cdFx0aWYgKCFjdXJyZW50RW50aXR5U2V0KSB7XG5cdFx0XHQvLyBGYWxsIGJhY2sgdG8gU2luZ2xlIG5hdiBwcm9wIGlmIGVudGl0eVNldCBpcyBub3QgZm91bmQuXG5cdFx0XHRzTmF2UHJvcFRvQ2hlY2sgPSByZWxhdGl2ZVNwbGl0WzBdO1xuXHRcdH1cblx0XHRjb25zdCBhTmF2UHJvcHMgPSBzTmF2UHJvcFRvQ2hlY2s/LnNwbGl0KFwiL1wiKSB8fCBbXTtcblx0XHRsZXQgdGFyZ2V0RW50aXR5VHlwZSA9IHRhcmdldEVudGl0eVNldCAmJiB0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZTtcblx0XHRmb3IgKGNvbnN0IHNOYXZQcm9wIG9mIGFOYXZQcm9wcykge1xuXHRcdFx0Ly8gUHVzaGluZyBhbGwgbmF2IHByb3BzIHRvIHRoZSB2aXNpdGVkIG9iamVjdHMuIGV4YW1wbGU6IFwiU2V0XCIsIFwiX1NhbGVzT3JkZXJcIiBmb3IgXCJTZXQvX1NhbGVzT3JkZXJcIihpbiBOYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nKVxuXHRcdFx0Y29uc3QgdGFyZ2V0TmF2UHJvcCA9IHRhcmdldEVudGl0eVR5cGUgJiYgdGFyZ2V0RW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcy5maW5kKChuYXZQcm9wKSA9PiBuYXZQcm9wLm5hbWUgPT09IHNOYXZQcm9wKTtcblx0XHRcdGlmICh0YXJnZXROYXZQcm9wKSB7XG5cdFx0XHRcdGxvY2FsT2JqZWN0cy5wdXNoKHRhcmdldE5hdlByb3ApO1xuXHRcdFx0XHR0YXJnZXRFbnRpdHlUeXBlID0gdGFyZ2V0TmF2UHJvcC50YXJnZXRUeXBlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRhcmdldEVudGl0eVNldCA9XG5cdFx0XHQodGFyZ2V0RW50aXR5U2V0ICYmIGN1cnJlbnRFbnRpdHlTZXQpIHx8ICh0YXJnZXRFbnRpdHlTZXQgJiYgdGFyZ2V0RW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdbcmVsYXRpdmVTcGxpdFswXV0pO1xuXHRcdGlmICh0YXJnZXRFbnRpdHlTZXQpIHtcblx0XHRcdC8vIFB1c2hpbmcgdGhlIHRhcmdldCBlbnRpdHlTZXQgdG8gdmlzaXRlZCBvYmplY3RzXG5cdFx0XHRsb2NhbE9iamVjdHMucHVzaCh0YXJnZXRFbnRpdHlTZXQpO1xuXHRcdH1cblx0XHQvLyBSZS1jYWxjdWxhdGluZyB0aGUgcmVsYXRpdmUgcGF0aFxuXHRcdC8vIEFzIGVhY2ggbmF2aWdhdGlvbiBuYW1lIGlzIGVuY2xvc2VkIGJldHdlZW4gJyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nJyBhbmQgJyQnICh0byBiZSBhYmxlIHRvIGFjY2VzcyB0aGUgZW50aXR5c2V0IGVhc2lseSBpbiB0aGUgbWV0YW1vZGVsKVxuXHRcdC8vIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBjbG9zaW5nICckJyB0byBiZSBhYmxlIHRvIHN3aXRjaCB0byB0aGUgbmV4dCBuYXZpZ2F0aW9uXG5cdFx0cmVsYXRpdmVTcGxpdCA9IHJlbGF0aXZlU3BsaXQuc2xpY2UoYU5hdlByb3BzLmxlbmd0aCB8fCAxKTtcblx0XHRpZiAocmVsYXRpdmVTcGxpdC5sZW5ndGggJiYgcmVsYXRpdmVTcGxpdFswXSA9PT0gXCIkXCIpIHtcblx0XHRcdHJlbGF0aXZlU3BsaXQuc2hpZnQoKTtcblx0XHR9XG5cdFx0cmVsYXRpdmVQYXRoID0gcmVsYXRpdmVTcGxpdC5qb2luKFwiL1wiKTtcblx0fVxuXHRpZiAocmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoXCIkVHlwZVwiKSkge1xuXHRcdC8vIEFzICRUeXBlQCBpcyBhbGxvd2VkIGFzIHdlbGxcblx0XHRpZiAocmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoXCIkVHlwZUBcIikpIHtcblx0XHRcdHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlUGF0aC5yZXBsYWNlKFwiJFR5cGVcIiwgXCJcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFdlJ3JlIGFueXdheSBnb2luZyB0byBsb29rIG9uIHRoZSBlbnRpdHlUeXBlLi4uXG5cdFx0XHRyZWxhdGl2ZVBhdGggPSBhUGF0aFNwbGl0LnNsaWNlKDMpLmpvaW4oXCIvXCIpO1xuXHRcdH1cblx0fVxuXHRpZiAodGFyZ2V0RW50aXR5U2V0ICYmIHJlbGF0aXZlUGF0aC5sZW5ndGgpIHtcblx0XHRjb25zdCBvVGFyZ2V0ID0gdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUucmVzb2x2ZVBhdGgocmVsYXRpdmVQYXRoLCBiSW5jbHVkZVZpc2l0ZWRPYmplY3RzKTtcblx0XHRpZiAob1RhcmdldCkge1xuXHRcdFx0aWYgKGJJbmNsdWRlVmlzaXRlZE9iamVjdHMpIHtcblx0XHRcdFx0b1RhcmdldC52aXNpdGVkT2JqZWN0cyA9IGxvY2FsT2JqZWN0cy5jb25jYXQob1RhcmdldC52aXNpdGVkT2JqZWN0cyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZSAmJiB0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZS5hY3Rpb25zKSB7XG5cdFx0XHQvLyBpZiB0YXJnZXQgaXMgYW4gYWN0aW9uIG9yIGFuIGFjdGlvbiBwYXJhbWV0ZXJcblx0XHRcdGNvbnN0IGFjdGlvbnMgPSB0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZSAmJiB0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZS5hY3Rpb25zO1xuXHRcdFx0Y29uc3QgcmVsYXRpdmVTcGxpdCA9IHJlbGF0aXZlUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRpZiAoYWN0aW9uc1tyZWxhdGl2ZVNwbGl0WzBdXSkge1xuXHRcdFx0XHRjb25zdCBhY3Rpb24gPSBhY3Rpb25zW3JlbGF0aXZlU3BsaXRbMF1dO1xuXHRcdFx0XHRpZiAocmVsYXRpdmVTcGxpdFsxXSAmJiBhY3Rpb24ucGFyYW1ldGVycykge1xuXHRcdFx0XHRcdGNvbnN0IHBhcmFtZXRlck5hbWUgPSByZWxhdGl2ZVNwbGl0WzFdO1xuXHRcdFx0XHRcdHJldHVybiBhY3Rpb24ucGFyYW1ldGVycy5maW5kKChwYXJhbWV0ZXIpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBwYXJhbWV0ZXIuZnVsbHlRdWFsaWZpZWROYW1lLmVuZHNXaXRoKGAvJHtwYXJhbWV0ZXJOYW1lfWApO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHJlbGF0aXZlUGF0aC5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvVGFyZ2V0O1xuXHR9IGVsc2Uge1xuXHRcdGlmIChiSW5jbHVkZVZpc2l0ZWRPYmplY3RzKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0YXJnZXQ6IHRhcmdldEVudGl0eVNldCxcblx0XHRcdFx0dmlzaXRlZE9iamVjdHM6IGxvY2FsT2JqZWN0c1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHRhcmdldEVudGl0eVNldDtcblx0fVxufVxuXG5leHBvcnQgdHlwZSBSZXNvbHZlZFRhcmdldCA9IHtcblx0dGFyZ2V0PzogU2VydmljZU9iamVjdDtcblx0dmlzaXRlZE9iamVjdHM6IFNlcnZpY2VPYmplY3RBbmRBbm5vdGF0aW9uW107XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9NZXRhTW9kZWxDb250ZXh0OiBDb250ZXh0LCBvRW50aXR5U2V0TWV0YU1vZGVsQ29udGV4dD86IENvbnRleHQpOiBEYXRhTW9kZWxPYmplY3RQYXRoIHtcblx0Y29uc3Qgb0NvbnZlcnRlZE1ldGFkYXRhID0gY29udmVydFR5cGVzKG9NZXRhTW9kZWxDb250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwpO1xuXHRjb25zdCBtZXRhTW9kZWxDb250ZXh0ID0gY29udmVydE1ldGFNb2RlbENvbnRleHQob01ldGFNb2RlbENvbnRleHQsIHRydWUpO1xuXHRsZXQgdGFyZ2V0RW50aXR5U2V0TG9jYXRpb247XG5cdGlmIChvRW50aXR5U2V0TWV0YU1vZGVsQ29udGV4dCAmJiBvRW50aXR5U2V0TWV0YU1vZGVsQ29udGV4dC5nZXRQYXRoKCkgIT09IFwiL1wiKSB7XG5cdFx0dGFyZ2V0RW50aXR5U2V0TG9jYXRpb24gPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob0VudGl0eVNldE1ldGFNb2RlbENvbnRleHQpO1xuXHR9XG5cdHJldHVybiBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdEZyb21QYXRoKG1ldGFNb2RlbENvbnRleHQsIG9Db252ZXJ0ZWRNZXRhZGF0YSwgdGFyZ2V0RW50aXR5U2V0TG9jYXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RGcm9tUGF0aChcblx0bWV0YU1vZGVsQ29udGV4dDogUmVzb2x2ZWRUYXJnZXQsXG5cdGNvbnZlcnRlZFR5cGVzOiBDb252ZXJ0ZWRNZXRhZGF0YSxcblx0dGFyZ2V0RW50aXR5U2V0TG9jYXRpb24/OiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRvbmx5U2VydmljZU9iamVjdHM6IGJvb2xlYW4gPSBmYWxzZVxuKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB7XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdHMgPSBtZXRhTW9kZWxDb250ZXh0LnZpc2l0ZWRPYmplY3RzLmZpbHRlcihcblx0XHQodmlzaXRlZE9iamVjdCkgPT4gaXNTZXJ2aWNlT2JqZWN0KHZpc2l0ZWRPYmplY3QpICYmICFpc0VudGl0eVR5cGUodmlzaXRlZE9iamVjdCkgJiYgIWlzRW50aXR5Q29udGFpbmVyKHZpc2l0ZWRPYmplY3QpXG5cdCk7XG5cdGlmIChcblx0XHRpc1NlcnZpY2VPYmplY3QobWV0YU1vZGVsQ29udGV4dC50YXJnZXQpICYmXG5cdFx0IWlzRW50aXR5VHlwZShtZXRhTW9kZWxDb250ZXh0LnRhcmdldCkgJiZcblx0XHRkYXRhTW9kZWxPYmplY3RzW2RhdGFNb2RlbE9iamVjdHMubGVuZ3RoIC0gMV0gIT09IG1ldGFNb2RlbENvbnRleHQudGFyZ2V0ICYmXG5cdFx0IW9ubHlTZXJ2aWNlT2JqZWN0c1xuXHQpIHtcblx0XHRkYXRhTW9kZWxPYmplY3RzLnB1c2gobWV0YU1vZGVsQ29udGV4dC50YXJnZXQpO1xuXHR9XG5cblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXM6IE5hdmlnYXRpb25Qcm9wZXJ0eVtdID0gW107XG5cdGNvbnN0IHJvb3RFbnRpdHlTZXQ6IEVudGl0eVNldCA9IGRhdGFNb2RlbE9iamVjdHNbMF0gYXMgRW50aXR5U2V0O1xuXG5cdGxldCBjdXJyZW50RW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQgPSByb290RW50aXR5U2V0O1xuXHRsZXQgY3VycmVudEVudGl0eVR5cGU6IEVudGl0eVR5cGUgPSByb290RW50aXR5U2V0LmVudGl0eVR5cGU7XG5cdGxldCBjdXJyZW50T2JqZWN0OiBTZXJ2aWNlT2JqZWN0QW5kQW5ub3RhdGlvbiB8IHVuZGVmaW5lZDtcblx0bGV0IG5hdmlnYXRlZFBhdGggPSBbXTtcblxuXHRmb3IgKGxldCBpID0gMTsgaSA8IGRhdGFNb2RlbE9iamVjdHMubGVuZ3RoOyBpKyspIHtcblx0XHRjdXJyZW50T2JqZWN0ID0gZGF0YU1vZGVsT2JqZWN0c1tpXTtcblxuXHRcdGlmIChpc05hdmlnYXRpb25Qcm9wZXJ0eShjdXJyZW50T2JqZWN0KSkge1xuXHRcdFx0bmF2aWdhdGVkUGF0aC5wdXNoKGN1cnJlbnRPYmplY3QubmFtZSk7XG5cdFx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcy5wdXNoKGN1cnJlbnRPYmplY3QpO1xuXHRcdFx0Y3VycmVudEVudGl0eVR5cGUgPSBjdXJyZW50T2JqZWN0LnRhcmdldFR5cGU7XG5cdFx0XHRjb25zdCBib3VuZEVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkID0gY3VycmVudEVudGl0eVNldD8ubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tuYXZpZ2F0ZWRQYXRoLmpvaW4oXCIvXCIpXTtcblx0XHRcdGlmIChib3VuZEVudGl0eVNldCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGN1cnJlbnRFbnRpdHlTZXQgPSBib3VuZEVudGl0eVNldDtcblx0XHRcdFx0bmF2aWdhdGVkUGF0aCA9IFtdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoaXNFbnRpdHlTZXQoY3VycmVudE9iamVjdCkgfHwgaXNTaW5nbGV0b24oY3VycmVudE9iamVjdCkpIHtcblx0XHRcdGN1cnJlbnRFbnRpdHlTZXQgPSBjdXJyZW50T2JqZWN0O1xuXHRcdFx0Y3VycmVudEVudGl0eVR5cGUgPSBjdXJyZW50RW50aXR5U2V0LmVudGl0eVR5cGU7XG5cdFx0fVxuXHR9XG5cblx0aWYgKG5hdmlnYXRlZFBhdGgubGVuZ3RoID4gMCkge1xuXHRcdC8vIFBhdGggd2l0aG91dCBOYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nIC0tPiBubyB0YXJnZXQgZW50aXR5IHNldFxuXHRcdGN1cnJlbnRFbnRpdHlTZXQgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRpZiAodGFyZ2V0RW50aXR5U2V0TG9jYXRpb24gJiYgdGFyZ2V0RW50aXR5U2V0TG9jYXRpb24uc3RhcnRpbmdFbnRpdHlTZXQgIT09IHJvb3RFbnRpdHlTZXQpIHtcblx0XHQvLyBJbiBjYXNlIHRoZSBlbnRpdHlzZXQgaXMgbm90IHN0YXJ0aW5nIGZyb20gdGhlIHNhbWUgbG9jYXRpb24gaXQgbWF5IG1lYW4gdGhhdCB3ZSBhcmUgZG9pbmcgdG9vIG11Y2ggd29yayBlYXJsaWVyIGZvciBzb21lIHJlYXNvblxuXHRcdC8vIEFzIHN1Y2ggd2UgbmVlZCB0byByZWRlZmluZSB0aGUgY29udGV4dCBzb3VyY2UgZm9yIHRoZSB0YXJnZXRFbnRpdHlTZXRMb2NhdGlvblxuXHRcdGNvbnN0IHN0YXJ0aW5nSW5kZXggPSBkYXRhTW9kZWxPYmplY3RzLmluZGV4T2YodGFyZ2V0RW50aXR5U2V0TG9jYXRpb24uc3RhcnRpbmdFbnRpdHlTZXQpO1xuXHRcdGlmIChzdGFydGluZ0luZGV4ICE9PSAtMSkge1xuXHRcdFx0Ly8gSWYgaXQncyBub3QgZm91bmQgSSBkb24ndCBrbm93IHdoYXQgd2UgY2FuIGRvIChwcm9iYWJseSBub3RoaW5nKVxuXHRcdFx0Y29uc3QgcmVxdWlyZWREYXRhTW9kZWxPYmplY3RzID0gZGF0YU1vZGVsT2JqZWN0cy5zbGljZSgwLCBzdGFydGluZ0luZGV4KTtcblx0XHRcdHRhcmdldEVudGl0eVNldExvY2F0aW9uLnN0YXJ0aW5nRW50aXR5U2V0ID0gcm9vdEVudGl0eVNldDtcblx0XHRcdHRhcmdldEVudGl0eVNldExvY2F0aW9uLm5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gcmVxdWlyZWREYXRhTW9kZWxPYmplY3RzXG5cdFx0XHRcdC5maWx0ZXIoaXNOYXZpZ2F0aW9uUHJvcGVydHkpXG5cdFx0XHRcdC5jb25jYXQodGFyZ2V0RW50aXR5U2V0TG9jYXRpb24ubmF2aWdhdGlvblByb3BlcnRpZXMgYXMgTmF2aWdhdGlvblByb3BlcnR5W10pO1xuXHRcdH1cblx0fVxuXHRjb25zdCBvdXREYXRhTW9kZWxQYXRoID0ge1xuXHRcdHN0YXJ0aW5nRW50aXR5U2V0OiByb290RW50aXR5U2V0LFxuXHRcdHRhcmdldEVudGl0eVNldDogY3VycmVudEVudGl0eVNldCxcblx0XHR0YXJnZXRFbnRpdHlUeXBlOiBjdXJyZW50RW50aXR5VHlwZSxcblx0XHR0YXJnZXRPYmplY3Q6IG1ldGFNb2RlbENvbnRleHQudGFyZ2V0LFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzLFxuXHRcdGNvbnRleHRMb2NhdGlvbjogdGFyZ2V0RW50aXR5U2V0TG9jYXRpb24sXG5cdFx0Y29udmVydGVkVHlwZXM6IGNvbnZlcnRlZFR5cGVzXG5cdH07XG5cdGlmICghaXNTZXJ2aWNlT2JqZWN0KG91dERhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0KSAmJiBvbmx5U2VydmljZU9iamVjdHMpIHtcblx0XHRvdXREYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCA9IGlzU2VydmljZU9iamVjdChjdXJyZW50T2JqZWN0KSA/IGN1cnJlbnRPYmplY3QgOiB1bmRlZmluZWQ7XG5cdH1cblx0aWYgKCFvdXREYXRhTW9kZWxQYXRoLmNvbnRleHRMb2NhdGlvbikge1xuXHRcdG91dERhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uID0gb3V0RGF0YU1vZGVsUGF0aDtcblx0fVxuXHRyZXR1cm4gb3V0RGF0YU1vZGVsUGF0aDtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0VBMENBLE1BQU1BLGdCQUFxQixHQUFHO0lBQzdCLDJCQUEyQixFQUFFLGNBQWM7SUFDM0MsbUJBQW1CLEVBQUUsTUFBTTtJQUMzQix1QkFBdUIsRUFBRSxVQUFVO0lBQ25DLGdDQUFnQyxFQUFFLFFBQVE7SUFDMUMsNEJBQTRCLEVBQUUsSUFBSTtJQUNsQyxpQ0FBaUMsRUFBRSxTQUFTO0lBQzVDLG1DQUFtQyxFQUFFLFdBQVc7SUFDaEQsc0NBQXNDLEVBQUUsY0FBYztJQUN0RCx1Q0FBdUMsRUFBRTtFQUMxQyxDQUFDO0VBVU0sTUFBTUMsOEJBQThCLEdBQUc7SUFDN0NDLEtBQUssRUFBRSxJQUFJO0lBQ1hDLFVBQVUsRUFBRSxJQUFJO0lBQ2hCQyxNQUFNLEVBQUUsSUFBSTtJQUNaQyxxQkFBcUIsRUFBRSxJQUFJO0lBQzNCQyxRQUFRLEVBQUU7RUFDWCxDQUFDO0VBQUM7RUFvQkYsU0FBU0Msa0JBQWtCLENBQzFCQyxnQkFBcUIsRUFDckJDLFdBQW1CLEVBQ25CQyxhQUFxQixFQUNyQkMsZ0JBQWdELEVBQ2hEQyxhQUFzQyxFQUNoQztJQUNOLElBQUlDLEtBQUs7SUFDVCxNQUFNQyxxQkFBNkIsR0FBSSxHQUFFSixhQUFjLElB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