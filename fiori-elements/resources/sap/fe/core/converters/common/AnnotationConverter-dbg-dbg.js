/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
 sap.ui.define([], function() {
 	var AnnotationConverter;
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 232:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convert = void 0;
const utils_1 = __webpack_require__(534);
/**
 * Symbol to extend an annotation with the reference to its target.
 */
const ANNOTATION_TARGET = Symbol('Annotation Target');
/**
 * Append an object to the list of visited objects if it is different from the last object in the list.
 *
 * @param objectPath    The list of visited objects
 * @param visitedObject The object
 * @returns The list of visited objects
 */
function appendObjectPath(objectPath, visitedObject) {
    if (objectPath[objectPath.length - 1] !== visitedObject) {
        objectPath.push(visitedObject);
    }
    return objectPath;
}
/**
 * Resolves a (possibly relative) path.
 *
 * @param converter         Converter
 * @param startElement      The starting point in case of relative path resolution
 * @param path              The path to resolve
 * @param annotationsTerm   Only for error reporting: The annotation term
 * @returns An object containing the resolved target and the elements that were visited while getting to the target.
 */
function resolveTarget(converter, startElement, path, annotationsTerm) {
    var _a, _b, _c, _d;
    // absolute paths always start at the entity container
    if (path.startsWith('/')) {
        path = path.substring(1);
        startElement = undefined; // will resolve to the entity container (see below)
    }
    const pathSegments = path.split('/').reduce((targetPath, segment) => {
        if (segment.includes('@')) {
            // Separate out the annotation
            const [pathPart, annotationPart] = (0, utils_1.splitAtFirst)(segment, '@');
            targetPath.push(pathPart);
            targetPath.push(`@${annotationPart}`);
        }
        else {
            targetPath.push(segment);
        }
        return targetPath;
    }, []);
    // determine the starting point for the resolution
    if (startElement === undefined) {
        // no starting point given: start at the entity container
        if (pathSegments[0].startsWith(converter.rawSchema.namespace) &&
            pathSegments[0] !== ((_a = converter.getConvertedEntityContainer()) === null || _a === void 0 ? void 0 : _a.fullyQualifiedName)) {
            // We have a fully qualified name in the path that is not the entity container.
            startElement =
                (_c = (_b = converter.getConvertedEntityType(pathSegments[0])) !== null && _b !== void 0 ? _b : converter.getConvertedComplexType(pathSegments[0])) !== null && _c !== void 0 ? _c : converter.getConvertedAction(pathSegments[0]);
            pathSegments.shift(); // Let's remove the first path element
        }
        else {
            startElement = converter.getConvertedEntityContainer();
        }
    }
    else if (startElement[ANNOTATION_TARGET] !== undefined) {
        // annotation: start at the annotation target
        startElement = startElement[ANNOTATION_TARGET];
    }
    else if (startElement._type === 'Property') {
        // property: start at the entity type or complex type the property belongs to
        const parentElementFQN = (0, utils_1.substringBeforeFirst)(startElement.fullyQualifiedName, '/');
        startElement =
            (_d = converter.getConvertedEntityType(parentElementFQN)) !== null && _d !== void 0 ? _d : converter.getConvertedComplexType(parentElementFQN);
    }
    const result = pathSegments.reduce((current, segment) => {
        var _a, _b, _c, _d, _e;
        const error = (message) => {
            current.messages.push({ message });
            current.target = undefined;
            return current;
        };
        if (current.target === undefined) {
            return current;
        }
        current.objectPath = appendObjectPath(current.objectPath, current.target);
        // Annotation
        if (segment.startsWith('@') && segment !== '@$ui5.overload') {
            const [vocabularyAlias, term] = converter.splitTerm(segment);
            const annotation = (_a = current.target.annotations[vocabularyAlias.substring(1)]) === null || _a === void 0 ? void 0 : _a[term];
            if (annotation !== undefined) {
                current.target = annotation;
                return current;
            }
            return error(`Annotation '${segment.substring(1)}' not found on ${current.target._type} '${current.target.fullyQualifiedName}'`);
        }
        // $Path / $AnnotationPath syntax
        if (current.target.$target) {
            let subPath;
            if (segment === '$AnnotationPath') {
                subPath = current.target.value;
            }
            else if (segment === '$Path') {
                subPath = current.target.path;
            }
            if (subPath !== undefined) {
                const subTarget = resolveTarget(converter, current.target[ANNOTATION_TARGET], subPath);
                subTarget.objectPath.forEach((visitedSubObject) => {
                    if (!current.objectPath.includes(visitedSubObject)) {
                        current.objectPath = appendObjectPath(current.objectPath, visitedSubObject);
                    }
                });
                current.target = subTarget.target;
                current.objectPath = appendObjectPath(current.objectPath, current.target);
                return current;
            }
        }
        // traverse based on the element type
        switch ((_b = current.target) === null || _b === void 0 ? void 0 : _b._type) {
            case 'Schema':
                // next element: EntityType, ComplexType, Action, EntityContainer ?
                break;
            case 'EntityContainer':
                {
                    const thisElement = current.target;
                    if (segment === '' || segment === thisElement.fullyQualifiedName) {
                        return current;
                    }
                    // next element: EntitySet, Singleton or ActionImport?
                    const nextElement = (_d = (_c = thisElement.entitySets.by_name(segment)) !== null && _c !== void 0 ? _c : thisElement.singletons.by_name(segment)) !== null && _d !== void 0 ? _d : thisElement.actionImports.by_name(segment);
                    if (nextElement) {
                        current.target = nextElement;
                        return current;
                    }
                }
                break;
            case 'EntitySet':
            case 'Singleton': {
                const thisElement = current.target;
                if (segment === '' || segment === '$Type') {
                    // Empty Path after an EntitySet or Singleton means EntityType
                    current.target = thisElement.entityType;
                    return current;
                }
                if (segment === '$') {
                    return current;
                }
                if (segment === '$NavigationPropertyBinding') {
                    const navigationPropertyBindings = thisElement.navigationPropertyBinding;
                    current.target = navigationPropertyBindings;
                    return current;
                }
                // continue resolving at the EntitySet's or Singleton's type
                const result = resolveTarget(converter, thisElement.entityType, segment);
                current.target = result.target;
                current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
                return current;
            }
            case 'EntityType':
                {
                    const thisElement = current.target;
                    if (segment === '' || segment === '$Type') {
                        return current;
                    }
                    const property = thisElement.entityProperties.by_name(segment);
                    if (property) {
                        current.target = property;
                        return current;
                    }
                    const navigationProperty = thisElement.navigationProperties.by_name(segment);
                    if (navigationProperty) {
                        current.target = navigationProperty;
                        return current;
                    }
                    const action = thisElement.actions[segment];
                    if (action) {
                        current.target = action;
                        return current;
                    }
                }
                break;
            case 'ActionImport': {
                // continue resolving at the Action
                const result = resolveTarget(converter, current.target.action, segment);
                current.target = result.target;
                current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
                return current;
            }
            case 'Action': {
                const thisElement = current.target;
                if (segment === '') {
                    return current;
                }
                if (segment === '@$ui5.overload' || segment === '0') {
                    return current;
                }
                if (segment === '$Parameter' && thisElement.isBound) {
                    current.target = thisElement.parameters;
                    return current;
                }
                const nextElement = (_e = thisElement.parameters[segment]) !== null && _e !== void 0 ? _e : thisElement.parameters.find((param) => param.name === segment);
                if (nextElement) {
                    current.target = nextElement;
                    return current;
                }
                break;
            }
            case 'Property':
                {
                    const thisElement = current.target;
                    // Property or NavigationProperty of the ComplexType
                    const type = thisElement.targetType;
                    if (type !== undefined) {
                        const property = type.properties.by_name(segment);
                        if (property) {
                            current.target = property;
                            return current;
                        }
                        const navigationProperty = type.navigationProperties.by_name(segment);
                        if (navigationProperty) {
                            current.target = navigationProperty;
                            return current;
                        }
                    }
                }
                break;
            case 'ActionParameter':
                const referencedType = current.target.typeReference;
                if (referencedType !== undefined) {
                    const result = resolveTarget(converter, referencedType, segment);
                    current.target = result.target;
                    current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
                    return current;
                }
                break;
            case 'NavigationProperty':
                // continue at the NavigationProperty's target type
                const result = resolveTarget(converter, current.target.targetType, segment);
                current.target = result.target;
                current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
                return current;
            default:
                if (segment === '') {
                    return current;
                }
                if (current.target[segment]) {
                    current.target = current.target[segment];
                    current.objectPath = appendObjectPath(current.objectPath, current.target);
                    return current;
                }
        }
        return error(`Element '${segment}' not found at ${current.target._type} '${current.target.fullyQualifiedName}'`);
    }, { target: startElement, objectPath: [], messages: [] });
    // Diagnostics
    result.messages.forEach((message) => converter.logError(message.message));
    if (!result.target) {
        if (annotationsTerm) {
            const annotationType = inferTypeFromTerm(converter, annotationsTerm, startElement.fullyQualifiedName);
            converter.logError('Unable to resolve the path expression: ' +
                '\n' +
                path +
                '\n' +
                '\n' +
                'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
                '<Annotation Term = ' +
                annotationsTerm +
                '>' +
                '\n' +
                '<Record Type = ' +
                annotationType +
                '>' +
                '\n' +
                '<AnnotationPath = ' +
                path +
                '>');
        }
        else {
            converter.logError('Unable to resolve the path expression: ' +
                path +
                '\n' +
                '\n' +
                'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
                '<Annotation Term = ' +
                pathSegments[0] +
                '>' +
                '\n' +
                '<PropertyValue  Path= ' +
                pathSegments[1] +
                '>');
        }
    }
    return result;
}
/**
 * Typeguard to check if the path contains an annotation.
 *
 * @param pathStr the path to evaluate
 * @returns true if there is an annotation in the path.
 */
function isAnnotationPath(pathStr) {
    return pathStr.includes('@');
}
function parseValue(converter, currentTarget, currentTerm, currentProperty, currentSource, propertyValue, valueFQN) {
    if (propertyValue === undefined) {
        return undefined;
    }
    switch (propertyValue.type) {
        case 'String':
            return propertyValue.String;
        case 'Int':
            return propertyValue.Int;
        case 'Bool':
            return propertyValue.Bool;
        case 'Decimal':
            return (0, utils_1.Decimal)(propertyValue.Decimal);
        case 'Date':
            return propertyValue.Date;
        case 'EnumMember':
            const aliasedEnum = converter.alias(propertyValue.EnumMember);
            const splitEnum = aliasedEnum.split(' ');
            if (splitEnum[0] && utils_1.EnumIsFlag[(0, utils_1.substringBeforeFirst)(splitEnum[0], '/')]) {
                return splitEnum;
            }
            return aliasedEnum;
        case 'PropertyPath':
            return {
                type: 'PropertyPath',
                value: propertyValue.PropertyPath,
                fullyQualifiedName: valueFQN,
                $target: resolveTarget(converter, currentTarget, propertyValue.PropertyPath, currentTerm).target,
                [ANNOTATION_TARGET]: currentTarget
            };
        case 'NavigationPropertyPath':
            return {
                type: 'NavigationPropertyPath',
                value: propertyValue.NavigationPropertyPath,
                fullyQualifiedName: valueFQN,
                $target: resolveTarget(converter, currentTarget, propertyValue.NavigationPropertyPath, currentTerm)
                    .target,
                [ANNOTATION_TARGET]: currentTarget
            };
        case 'AnnotationPath':
            return {
                type: 'AnnotationPath',
                value: propertyValue.AnnotationPath,
                fullyQualifiedName: valueFQN,
                $target: resolveTarget(converter, currentTarget, converter.unalias(propertyValue.AnnotationPath), currentTerm).target,
                annotationsTerm: currentTerm,
                term: '',
                path: '',
                [ANNOTATION_TARGET]: currentTarget
            };
        case 'Path':
            const $target = resolveTarget(converter, currentTarget, propertyValue.Path, currentTerm).target;
            if (isAnnotationPath(propertyValue.Path)) {
                // inline the target
                return $target;
            }
            else {
                return {
                    type: 'Path',
                    path: propertyValue.Path,
                    fullyQualifiedName: valueFQN,
                    $target: $target,
                    [ANNOTATION_TARGET]: currentTarget
                };
            }
        case 'Record':
            return parseRecord(converter, currentTerm, currentTarget, currentProperty, currentSource, propertyValue.Record, valueFQN);
        case 'Collection':
            return parseCollection(converter, currentTarget, currentTerm, currentProperty, currentSource, propertyValue.Collection, valueFQN);
        case 'Apply':
        case 'Null':
        case 'Not':
        case 'Eq':
        case 'Ne':
        case 'Gt':
        case 'Ge':
        case 'Lt':
        case 'Le':
        case 'If':
        case 'And':
        case 'Or':
        default:
            return propertyValue;
    }
}
/**
 * Infer the type of a term based on its type.
 *
 * @param converter         Converter
 * @param annotationsTerm   The annotation term
 * @param annotationTarget  The annotation target
 * @param currentProperty   The current property of the record
 * @returns The inferred type.
 */
function inferTypeFromTerm(converter, annotationsTerm, annotationTarget, currentProperty) {
    let targetType = utils_1.TermToTypes[annotationsTerm];
    if (currentProperty) {
        annotationsTerm = `${(0, utils_1.substringBeforeLast)(annotationsTerm, '.')}.${currentProperty}`;
        targetType = utils_1.TermToTypes[annotationsTerm];
    }
    converter.logError(`The type of the record used within the term ${annotationsTerm} was not defined and was inferred as ${targetType}.
Hint: If possible, try to maintain the Type property for each Record.
<Annotations Target="${annotationTarget}">
	<Annotation Term="${annotationsTerm}">
		<Record>...</Record>
	</Annotation>
</Annotations>`);
    return targetType;
}
function isDataFieldWithForAction(annotationContent) {
    return (annotationContent.hasOwnProperty('Action') &&
        (annotationContent.$Type === 'com.sap.vocabularies.UI.v1.DataFieldForAction' ||
            annotationContent.$Type === 'com.sap.vocabularies.UI.v1.DataFieldWithAction'));
}
function parseRecordType(converter, currentTerm, currentTarget, currentProperty, recordDefinition) {
    let targetType;
    if (!recordDefinition.type && currentTerm) {
        targetType = inferTypeFromTerm(converter, currentTerm, currentTarget.fullyQualifiedName, currentProperty);
    }
    else {
        targetType = converter.unalias(recordDefinition.type);
    }
    return targetType;
}
function parseRecord(converter, currentTerm, currentTarget, currentProperty, currentSource, annotationRecord, currentFQN) {
    var _a;
    const annotationTerm = {
        $Type: parseRecordType(converter, currentTerm, currentTarget, currentProperty, annotationRecord),
        fullyQualifiedName: currentFQN,
        [ANNOTATION_TARGET]: currentTarget
    };
    // annotations on the record
    (0, utils_1.lazy)(annotationTerm, 'annotations', () => {
        var _a;
        // be graceful when resolving annotations on annotations: Sometimes they are referenced directly, sometimes they
        // are part of the global annotations list
        let annotations;
        if (annotationRecord.annotations && annotationRecord.annotations.length > 0) {
            annotations = annotationRecord.annotations;
        }
        else {
            annotations = (_a = converter.rawAnnotationsPerTarget[currentFQN]) === null || _a === void 0 ? void 0 : _a.annotations;
        }
        annotations === null || annotations === void 0 ? void 0 : annotations.forEach((annotation) => {
            annotation.target = currentFQN;
            annotation.__source = currentSource;
            annotation[ANNOTATION_TARGET] = currentTarget;
            annotation.fullyQualifiedName = `${currentFQN}@${annotation.term}`;
        });
        return createAnnotationsObject(converter, annotationTerm, annotations !== null && annotations !== void 0 ? annotations : []);
    });
    const annotationContent = (_a = annotationRecord.propertyValues) === null || _a === void 0 ? void 0 : _a.reduce((annotationContent, propertyValue) => {
        (0, utils_1.lazy)(annotationContent, propertyValue.name, () => parseValue(converter, currentTarget, currentTerm, propertyValue.name, currentSource, propertyValue.value, `${currentFQN}/${propertyValue.name}`));
        return annotationContent;
    }, annotationTerm);
    if (isDataFieldWithForAction(annotationContent)) {
        (0, utils_1.lazy)(annotationContent, 'ActionTarget', () => {
            var _a, _b;
            // try to resolve to a bound action of the annotation target
            let actionTarget = (_a = currentTarget.actions) === null || _a === void 0 ? void 0 : _a[annotationContent.Action];
            if (!actionTarget) {
                // try to find a corresponding unbound action
                actionTarget = (_b = converter.getConvertedActionImport(annotationContent.Action)) === null || _b === void 0 ? void 0 : _b.action;
            }
            if (!actionTarget) {
                // try to find a corresponding bound (!) action
                actionTarget = converter.getConvertedAction(annotationContent.Action);
                if (!(actionTarget === null || actionTarget === void 0 ? void 0 : actionTarget.isBound)) {
                    actionTarget = undefined;
                }
            }
            if (!actionTarget) {
                converter.logError(`Unable to resolve the action '${annotationContent.Action}' defined for '${annotationTerm.fullyQualifiedName}'`);
            }
            return actionTarget;
        });
    }
    return annotationContent;
}
/**
 * Retrieve or infer the collection type based on its content.
 *
 * @param collectionDefinition
 * @returns the type of the collection
 */
function getOrInferCollectionType(collectionDefinition) {
    let type = collectionDefinition.type;
    if (type === undefined && collectionDefinition.length > 0) {
        const firstColItem = collectionDefinition[0];
        if (firstColItem.hasOwnProperty('PropertyPath')) {
            type = 'PropertyPath';
        }
        else if (firstColItem.hasOwnProperty('Path')) {
            type = 'Path';
        }
        else if (firstColItem.hasOwnProperty('AnnotationPath')) {
            type = 'AnnotationPath';
        }
        else if (firstColItem.hasOwnProperty('NavigationPropertyPath')) {
            type = 'NavigationPropertyPath';
        }
        else if (typeof firstColItem === 'object' &&
            (firstColItem.hasOwnProperty('type') || firstColItem.hasOwnProperty('propertyValues'))) {
            type = 'Record';
        }
        else if (typeof firstColItem === 'string') {
            type = 'String';
        }
    }
    else if (type === undefined) {
        type = 'EmptyCollection';
    }
    return type;
}
function parseCollection(converter, currentTarget, currentTerm, currentProperty, currentSource, collectionDefinition, parentFQN) {
    const collectionDefinitionType = getOrInferCollectionType(collectionDefinition);
    switch (collectionDefinitionType) {
        case 'PropertyPath':
            return collectionDefinition.map((propertyPath, propertyIdx) => {
                const result = {
                    type: 'PropertyPath',
                    value: propertyPath.PropertyPath,
                    fullyQualifiedName: `${parentFQN}/${propertyIdx}`
                };
                (0, utils_1.lazy)(result, '$target', () => {
                    var _a;
                    return (_a = resolveTarget(converter, currentTarget, propertyPath.PropertyPath, currentTerm)
                        .target) !== null && _a !== void 0 ? _a : {};
                } // TODO: $target is mandatory - throw an error?
                );
                return result;
            });
        case 'Path':
            // TODO: make lazy?
            return collectionDefinition.map((pathValue) => {
                return resolveTarget(converter, currentTarget, pathValue.Path, currentTerm).target;
            });
        case 'AnnotationPath':
            return collectionDefinition.map((annotationPath, annotationIdx) => {
                const result = {
                    type: 'AnnotationPath',
                    value: annotationPath.AnnotationPath,
                    fullyQualifiedName: `${parentFQN}/${annotationIdx}`,
                    annotationsTerm: currentTerm,
                    term: '',
                    path: ''
                };
                (0, utils_1.lazy)(result, '$target', () => resolveTarget(converter, currentTarget, annotationPath.AnnotationPath, currentTerm).target);
                return result;
            });
        case 'NavigationPropertyPath':
            return collectionDefinition.map((navPropertyPath, navPropIdx) => {
                var _a;
                const navigationPropertyPath = (_a = navPropertyPath.NavigationPropertyPath) !== null && _a !== void 0 ? _a : '';
                const result = {
                    type: 'NavigationPropertyPath',
                    value: navigationPropertyPath,
                    fullyQualifiedName: `${parentFQN}/${navPropIdx}`
                };
                if (navigationPropertyPath === '') {
                    result.$target = undefined;
                }
                else {
                    (0, utils_1.lazy)(result, '$target', () => resolveTarget(converter, currentTarget, navigationPropertyPath, currentTerm).target);
                }
                return result;
            });
        case 'Record':
            return collectionDefinition.map((recordDefinition, recordIdx) => {
                return parseRecord(converter, currentTerm, currentTarget, currentProperty, currentSource, recordDefinition, `${parentFQN}/${recordIdx}`);
            });
        case 'Apply':
        case 'Null':
        case 'If':
        case 'Eq':
        case 'Ne':
        case 'Lt':
        case 'Gt':
        case 'Le':
        case 'Ge':
        case 'Not':
        case 'And':
        case 'Or':
            return collectionDefinition.map((ifValue) => ifValue);
        case 'String':
            return collectionDefinition.map((stringValue) => {
                if (typeof stringValue === 'string' || stringValue === undefined) {
                    return stringValue;
                }
                else {
                    return stringValue.String;
                }
            });
        default:
            if (collectionDefinition.length === 0) {
                return [];
            }
            throw new Error('Unsupported case');
    }
}
function isV4NavigationProperty(navProp) {
    return !!navProp.targetTypeName;
}
/**
 * Split the alias from the term value.
 *
 * @param references the current set of references
 * @param termValue the value of the term
 * @returns the term alias and the actual term value
 */
function splitTerm(references, termValue) {
    return (0, utils_1.splitAtLast)((0, utils_1.alias)(references, termValue), '.');
}
function convertAnnotation(converter, target, rawAnnotation) {
    var _a;
    let annotation;
    if (rawAnnotation.record) {
        annotation = parseRecord(converter, rawAnnotation.term, target, '', rawAnnotation.__source, rawAnnotation.record, rawAnnotation.fullyQualifiedName);
    }
    else if (rawAnnotation.collection === undefined) {
        annotation = parseValue(converter, target, rawAnnotation.term, '', rawAnnotation.__source, (_a = rawAnnotation.value) !== null && _a !== void 0 ? _a : { type: 'Bool', Bool: true }, rawAnnotation.fullyQualifiedName);
    }
    else if (rawAnnotation.collection) {
        annotation = parseCollection(converter, target, rawAnnotation.term, '', rawAnnotation.__source, rawAnnotation.collection, rawAnnotation.fullyQualifiedName);
    }
    else {
        throw new Error('Unsupported case');
    }
    switch (typeof annotation) {
        case 'string':
            // eslint-disable-next-line no-new-wrappers
            annotation = new String(annotation);
            break;
        case 'boolean':
            // eslint-disable-next-line no-new-wrappers
            annotation = new Boolean(annotation);
            break;
        case 'number':
            annotation = new Number(annotation);
            break;
        default:
            // do nothing
            break;
    }
    annotation.fullyQualifiedName = rawAnnotation.fullyQualifiedName;
    annotation[ANNOTATION_TARGET] = target;
    const [vocAlias, vocTerm] = converter.splitTerm(rawAnnotation.term);
    annotation.term = converter.unalias(`${vocAlias}.${vocTerm}`);
    annotation.qualifier = rawAnnotation.qualifier;
    annotation.__source = rawAnnotation.__source;
    try {
        (0, utils_1.lazy)(annotation, 'annotations', () => {
            var _a;
            const annotationFQN = annotation.fullyQualifiedName;
            // be graceful when resolving annotations on annotations: Sometimes they are referenced directly, sometimes they
            // are part of the global annotations list
            let annotations;
            if (rawAnnotation.annotations && rawAnnotation.annotations.length > 0) {
                annotations = rawAnnotation.annotations;
            }
            else {
                annotations = (_a = converter.rawAnnotationsPerTarget[annotationFQN]) === null || _a === void 0 ? void 0 : _a.annotations;
            }
            annotations === null || annotations === void 0 ? void 0 : annotations.forEach((rawSubAnnotation) => {
                rawSubAnnotation.target = annotationFQN;
                rawSubAnnotation.__source = annotation.__source;
                rawSubAnnotation[ANNOTATION_TARGET] = target;
                rawSubAnnotation.fullyQualifiedName = `${annotationFQN}@${rawSubAnnotation.term}`;
            });
            return createAnnotationsObject(converter, annotation, annotations !== null && annotations !== void 0 ? annotations : []);
        });
    }
    catch (e) {
        // not an error: parseRecord() already adds annotations, but the other parseXXX functions don't, so this can happen
    }
    return annotation;
}
function getAnnotationFQN(currentTargetName, references, annotation) {
    const annotationFQN = `${currentTargetName}@${(0, utils_1.unalias)(references, annotation.term)}`;
    if (annotation.qualifier) {
        return `${annotationFQN}#${annotation.qualifier}`;
    }
    else {
        return annotationFQN;
    }
}
/**
 * Merge annotation from different source together by overwriting at the term level.
 *
 * @param rawMetadata
 * @returns the resulting merged annotations
 */
function mergeAnnotations(rawMetadata) {
    const annotationListPerTarget = {};
    Object.keys(rawMetadata.schema.annotations).forEach((annotationSource) => {
        rawMetadata.schema.annotations[annotationSource].forEach((annotationList) => {
            const currentTargetName = (0, utils_1.unalias)(rawMetadata.references, annotationList.target);
            annotationList.__source = annotationSource;
            if (!annotationListPerTarget[currentTargetName]) {
                annotationListPerTarget[currentTargetName] = {
                    annotations: annotationList.annotations.map((annotation) => {
                        annotation.fullyQualifiedName = getAnnotationFQN(currentTargetName, rawMetadata.references, annotation);
                        annotation.__source = annotationSource;
                        return annotation;
                    }),
                    target: currentTargetName
                };
                annotationListPerTarget[currentTargetName].__source = annotationSource;
            }
            else {
                annotationList.annotations.forEach((annotation) => {
                    const findIndex = annotationListPerTarget[currentTargetName].annotations.findIndex((referenceAnnotation) => {
                        return (referenceAnnotation.term === annotation.term &&
                            referenceAnnotation.qualifier === annotation.qualifier);
                    });
                    annotation.__source = annotationSource;
                    annotation.fullyQualifiedName = getAnnotationFQN(currentTargetName, rawMetadata.references, annotation);
                    if (findIndex !== -1) {
                        annotationListPerTarget[currentTargetName].annotations.splice(findIndex, 1, annotation);
                    }
                    else {
                        annotationListPerTarget[currentTargetName].annotations.push(annotation);
                    }
                });
            }
        });
    });
    return annotationListPerTarget;
}
class Converter {
    get rawAnnotationsPerTarget() {
        if (this._rawAnnotationsPerTarget === undefined) {
            this._rawAnnotationsPerTarget = mergeAnnotations(this.rawMetadata);
        }
        return this._rawAnnotationsPerTarget;
    }
    getConvertedEntityContainer() {
        return this.getConvertedElement(this.rawMetadata.schema.entityContainer.fullyQualifiedName, this.rawMetadata.schema.entityContainer, convertEntityContainer);
    }
    getConvertedEntitySet(fullyQualifiedName) {
        return this.convertedOutput.entitySets.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedSingleton(fullyQualifiedName) {
        return this.convertedOutput.singletons.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedEntityType(fullyQualifiedName) {
        return this.convertedOutput.entityTypes.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedComplexType(fullyQualifiedName) {
        return this.convertedOutput.complexTypes.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedTypeDefinition(fullyQualifiedName) {
        return this.convertedOutput.typeDefinitions.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedActionImport(fullyQualifiedName) {
        let actionImport = this.convertedOutput.actionImports.by_fullyQualifiedName(fullyQualifiedName);
        if (!actionImport) {
            actionImport = this.convertedOutput.actionImports.by_name(fullyQualifiedName);
        }
        return actionImport;
    }
    getConvertedAction(fullyQualifiedName) {
        return this.convertedOutput.actions.by_fullyQualifiedName(fullyQualifiedName);
    }
    convert(rawValue, map) {
        if (Array.isArray(rawValue)) {
            return () => {
                const converted = rawValue.reduce((convertedElements, rawElement) => {
                    const convertedElement = this.getConvertedElement(rawElement.fullyQualifiedName, rawElement, map);
                    if (convertedElement) {
                        convertedElements.push(convertedElement);
                    }
                    return convertedElements;
                }, []);
                (0, utils_1.addGetByValue)(converted, 'name');
                (0, utils_1.addGetByValue)(converted, 'fullyQualifiedName');
                return converted;
            };
        }
        else {
            return () => this.getConvertedElement(rawValue.fullyQualifiedName, rawValue, map);
        }
    }
    constructor(rawMetadata, convertedOutput) {
        this.convertedElements = new Map();
        this.rawMetadata = rawMetadata;
        this.rawSchema = rawMetadata.schema;
        this.convertedOutput = convertedOutput;
    }
    getConvertedElement(fullyQualifiedName, rawElement, map) {
        let converted = this.convertedElements.get(fullyQualifiedName);
        if (converted === undefined) {
            const rawMetadata = typeof rawElement === 'function' ? rawElement.apply(undefined, [fullyQualifiedName]) : rawElement;
            if (rawMetadata !== undefined) {
                converted = map.apply(undefined, [this, rawMetadata]);
                this.convertedElements.set(fullyQualifiedName, converted);
            }
        }
        return converted;
    }
    logError(message) {
        this.convertedOutput.diagnostics.push({ message });
    }
    splitTerm(term) {
        return splitTerm(this.rawMetadata.references, term);
    }
    alias(value) {
        return (0, utils_1.alias)(this.rawMetadata.references, value);
    }
    unalias(value) {
        var _a;
        return (_a = (0, utils_1.unalias)(this.rawMetadata.references, value)) !== null && _a !== void 0 ? _a : '';
    }
}
function resolveEntityType(converter, fullyQualifiedName) {
    return () => {
        let entityType = converter.getConvertedEntityType(fullyQualifiedName);
        if (!entityType) {
            converter.logError(`EntityType '${fullyQualifiedName}' not found`);
            entityType = {};
        }
        return entityType;
    };
}
function resolveNavigationPropertyBindings(converter, rawNavigationPropertyBindings, rawElement) {
    return () => Object.keys(rawNavigationPropertyBindings).reduce((navigationPropertyBindings, bindingName) => {
        const rawBindingTarget = rawNavigationPropertyBindings[bindingName];
        (0, utils_1.lazy)(navigationPropertyBindings, bindingName, () => {
            let resolvedBindingTarget;
            if (rawBindingTarget._type === 'Singleton') {
                resolvedBindingTarget = converter.getConvertedSingleton(rawBindingTarget.fullyQualifiedName);
            }
            else {
                resolvedBindingTarget = converter.getConvertedEntitySet(rawBindingTarget.fullyQualifiedName);
            }
            if (!resolvedBindingTarget) {
                converter.logError(`${rawElement._type} '${rawElement.fullyQualifiedName}': Failed to resolve NavigationPropertyBinding ${bindingName}`);
                resolvedBindingTarget = {};
            }
            return resolvedBindingTarget;
        });
        return navigationPropertyBindings;
    }, {});
}
function resolveAnnotations(converter, rawAnnotationTarget) {
    const nestedAnnotations = rawAnnotationTarget.annotations;
    return () => {
        var _a, _b;
        return createAnnotationsObject(converter, rawAnnotationTarget, (_b = nestedAnnotations !== null && nestedAnnotations !== void 0 ? nestedAnnotations : (_a = converter.rawAnnotationsPerTarget[rawAnnotationTarget.fullyQualifiedName]) === null || _a === void 0 ? void 0 : _a.annotations) !== null && _b !== void 0 ? _b : []);
    };
}
function createAnnotationsObject(converter, target, rawAnnotations) {
    return rawAnnotations.reduce((vocabularyAliases, annotation) => {
        const [vocAlias, vocTerm] = converter.splitTerm(annotation.term);
        const vocTermWithQualifier = `${vocTerm}${annotation.qualifier ? '#' + annotation.qualifier : ''}`;
        if (vocabularyAliases[vocAlias] === undefined) {
            vocabularyAliases[vocAlias] = {};
        }
        if (!vocabularyAliases[vocAlias].hasOwnProperty(vocTermWithQualifier)) {
            (0, utils_1.lazy)(vocabularyAliases[vocAlias], vocTermWithQualifier, () => converter.getConvertedElement(annotation.fullyQualifiedName, annotation, (converter, rawAnnotation) => convertAnnotation(converter, target, rawAnnotation)));
        }
        return vocabularyAliases;
    }, {});
}
/**
 * Converts an EntityContainer.
 *
 * @param converter     Converter
 * @param rawEntityContainer    Unconverted EntityContainer
 * @returns The converted EntityContainer
 */
function convertEntityContainer(converter, rawEntityContainer) {
    const convertedEntityContainer = rawEntityContainer;
    (0, utils_1.lazy)(convertedEntityContainer, 'annotations', resolveAnnotations(converter, rawEntityContainer));
    (0, utils_1.lazy)(convertedEntityContainer, 'entitySets', converter.convert(converter.rawSchema.entitySets, convertEntitySet));
    (0, utils_1.lazy)(convertedEntityContainer, 'singletons', converter.convert(converter.rawSchema.singletons, convertSingleton));
    (0, utils_1.lazy)(convertedEntityContainer, 'actionImports', converter.convert(converter.rawSchema.actionImports, convertActionImport));
    return convertedEntityContainer;
}
/**
 * Converts a Singleton.
 *
 * @param converter   Converter
 * @param rawSingleton  Unconverted Singleton
 * @returns The converted Singleton
 */
function convertSingleton(converter, rawSingleton) {
    const convertedSingleton = rawSingleton;
    convertedSingleton.entityTypeName = converter.unalias(rawSingleton.entityTypeName);
    (0, utils_1.lazy)(convertedSingleton, 'entityType', resolveEntityType(converter, rawSingleton.entityTypeName));
    (0, utils_1.lazy)(convertedSingleton, 'annotations', resolveAnnotations(converter, rawSingleton));
    const _rawNavigationPropertyBindings = rawSingleton.navigationPropertyBinding;
    (0, utils_1.lazy)(convertedSingleton, 'navigationPropertyBinding', resolveNavigationPropertyBindings(converter, _rawNavigationPropertyBindings, rawSingleton));
    return convertedSingleton;
}
/**
 * Converts an EntitySet.
 *
 * @param converter   Converter
 * @param rawEntitySet  Unconverted EntitySet
 * @returns The converted EntitySet
 */
function convertEntitySet(converter, rawEntitySet) {
    const convertedEntitySet = rawEntitySet;
    convertedEntitySet.entityTypeName = converter.unalias(rawEntitySet.entityTypeName);
    (0, utils_1.lazy)(convertedEntitySet, 'entityType', resolveEntityType(converter, rawEntitySet.entityTypeName));
    (0, utils_1.lazy)(convertedEntitySet, 'annotations', resolveAnnotations(converter, rawEntitySet));
    const _rawNavigationPropertyBindings = rawEntitySet.navigationPropertyBinding;
    (0, utils_1.lazy)(convertedEntitySet, 'navigationPropertyBinding', resolveNavigationPropertyBindings(converter, _rawNavigationPropertyBindings, rawEntitySet));
    return convertedEntitySet;
}
/**
 * Converts an EntityType.
 *
 * @param converter   Converter
 * @param rawEntityType  Unconverted EntityType
 * @returns The converted EntityType
 */
function convertEntityType(converter, rawEntityType) {
    const convertedEntityType = rawEntityType;
    rawEntityType.keys.forEach((keyProp) => {
        keyProp.isKey = true;
    });
    (0, utils_1.lazy)(convertedEntityType, 'annotations', resolveAnnotations(converter, rawEntityType));
    (0, utils_1.lazy)(convertedEntityType, 'keys', converter.convert(rawEntityType.keys, convertProperty));
    (0, utils_1.lazy)(convertedEntityType, 'entityProperties', converter.convert(rawEntityType.entityProperties, convertProperty));
    (0, utils_1.lazy)(convertedEntityType, 'navigationProperties', converter.convert(rawEntityType.navigationProperties, convertNavigationProperty));
    (0, utils_1.lazy)(convertedEntityType, 'actions', () => converter.rawSchema.actions
        .filter((rawAction) => rawAction.isBound &&
        (rawAction.sourceType === rawEntityType.fullyQualifiedName ||
            rawAction.sourceType === `Collection(${rawEntityType.fullyQualifiedName})`))
        .reduce((actions, rawAction) => {
        const name = `${converter.rawSchema.namespace}.${rawAction.name}`;
        actions[name] = converter.getConvertedAction(rawAction.fullyQualifiedName);
        return actions;
    }, {}));
    convertedEntityType.resolvePath = (relativePath, includeVisitedObjects) => {
        const resolved = resolveTarget(converter, rawEntityType, relativePath);
        if (includeVisitedObjects) {
            return { target: resolved.target, visitedObjects: resolved.objectPath, messages: resolved.messages };
        }
        else {
            return resolved.target;
        }
    };
    return convertedEntityType;
}
/**
 * Converts a Property.
 *
 * @param converter   Converter
 * @param rawProperty  Unconverted Property
 * @returns The converted Property
 */
function convertProperty(converter, rawProperty) {
    const convertedProperty = rawProperty;
    convertedProperty.type = converter.unalias(rawProperty.type);
    (0, utils_1.lazy)(convertedProperty, 'annotations', resolveAnnotations(converter, rawProperty));
    (0, utils_1.lazy)(convertedProperty, 'targetType', () => {
        var _a;
        const type = rawProperty.type;
        const typeName = type.startsWith('Collection') ? type.substring(11, type.length - 1) : type;
        return (_a = converter.getConvertedComplexType(typeName)) !== null && _a !== void 0 ? _a : converter.getConvertedTypeDefinition(typeName);
    });
    return convertedProperty;
}
/**
 * Converts a NavigationProperty.
 *
 * @param converter   Converter
 * @param rawNavigationProperty  Unconverted NavigationProperty
 * @returns The converted NavigationProperty
 */
function convertNavigationProperty(converter, rawNavigationProperty) {
    var _a, _b, _c;
    const convertedNavigationProperty = rawNavigationProperty;
    convertedNavigationProperty.referentialConstraint = (_a = convertedNavigationProperty.referentialConstraint) !== null && _a !== void 0 ? _a : [];
    if (isV4NavigationProperty(rawNavigationProperty)) {
        convertedNavigationProperty.targetTypeName = converter.unalias(rawNavigationProperty.targetTypeName);
    }
    else {
        const associationEnd = (_b = converter.rawSchema.associations
            .find((association) => association.fullyQualifiedName === rawNavigationProperty.relationship)) === null || _b === void 0 ? void 0 : _b.associationEnd.find((end) => end.role === rawNavigationProperty.toRole);
        convertedNavigationProperty.isCollection = (associationEnd === null || associationEnd === void 0 ? void 0 : associationEnd.multiplicity) === '*';
        convertedNavigationProperty.targetTypeName = (_c = associationEnd === null || associationEnd === void 0 ? void 0 : associationEnd.type) !== null && _c !== void 0 ? _c : '';
    }
    (0, utils_1.lazy)(convertedNavigationProperty, 'targetType', resolveEntityType(converter, rawNavigationProperty.targetTypeName));
    (0, utils_1.lazy)(convertedNavigationProperty, 'annotations', resolveAnnotations(converter, rawNavigationProperty));
    return convertedNavigationProperty;
}
/**
 * Converts an ActionImport.
 *
 * @param converter   Converter
 * @param rawActionImport  Unconverted ActionImport
 * @returns The converted ActionImport
 */
function convertActionImport(converter, rawActionImport) {
    const convertedActionImport = rawActionImport;
    convertedActionImport.actionName = converter.unalias(rawActionImport.actionName);
    (0, utils_1.lazy)(convertedActionImport, 'annotations', resolveAnnotations(converter, rawActionImport));
    (0, utils_1.lazy)(convertedActionImport, 'action', () => converter.getConvertedAction(rawActionImport.actionName));
    return convertedActionImport;
}
/**
 * Converts an Action.
 *
 * @param converter   Converter
 * @param rawAction  Unconverted Action
 * @returns The converted Action
 */
function convertAction(converter, rawAction) {
    const convertedAction = rawAction;
    convertedAction.sourceType = converter.unalias(rawAction.sourceType);
    if (convertedAction.sourceType) {
        (0, utils_1.lazy)(convertedAction, 'sourceEntityType', resolveEntityType(converter, rawAction.sourceType));
    }
    convertedAction.returnType = converter.unalias(rawAction.returnType);
    if (convertedAction.returnType) {
        (0, utils_1.lazy)(convertedAction, 'returnEntityType', resolveEntityType(converter, rawAction.returnType));
    }
    (0, utils_1.lazy)(convertedAction, 'parameters', converter.convert(rawAction.parameters, convertActionParameter));
    (0, utils_1.lazy)(convertedAction, 'annotations', () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        // this.is.the.action(on.this.type) --> action: 'this.is.the.action', overload: 'on.this.type'
        // this.is.the.action()             --> action: 'this.is.the.action', overload: undefined
        // this.is.the.action               --> action: 'this.is.the.action', overload: undefined
        const actionAndOverload = rawAction.fullyQualifiedName.match(/(?<action>[^()]+)(?:\((?<overload>.*)\))?/);
        let rawAnnotations = [];
        if (actionAndOverload) {
            if ((_a = actionAndOverload.groups) === null || _a === void 0 ? void 0 : _a.overload) {
                rawAnnotations = (_c = (_b = converter.rawAnnotationsPerTarget[rawAction.fullyQualifiedName]) === null || _b === void 0 ? void 0 : _b.annotations) !== null && _c !== void 0 ? _c : [];
            }
            else {
                rawAnnotations =
                    (_f = (_e = converter.rawAnnotationsPerTarget[`${(_d = actionAndOverload.groups) === null || _d === void 0 ? void 0 : _d.action}()`]) === null || _e === void 0 ? void 0 : _e.annotations) !== null && _f !== void 0 ? _f : [];
            }
            if (((_g = actionAndOverload.groups) === null || _g === void 0 ? void 0 : _g.action) && ((_h = actionAndOverload.groups) === null || _h === void 0 ? void 0 : _h.action) !== rawAction.fullyQualifiedName) {
                const baseAnnotations = (_l = (_k = converter.rawAnnotationsPerTarget[(_j = actionAndOverload.groups) === null || _j === void 0 ? void 0 : _j.action]) === null || _k === void 0 ? void 0 : _k.annotations) !== null && _l !== void 0 ? _l : [];
                rawAnnotations = rawAnnotations.concat(baseAnnotations);
            }
        }
        return createAnnotationsObject(converter, rawAction, rawAnnotations);
    });
    return convertedAction;
}
/**
 * Converts an ActionParameter.
 *
 * @param converter   Converter
 * @param rawActionParameter  Unconverted ActionParameter
 * @returns The converted ActionParameter
 */
function convertActionParameter(converter, rawActionParameter) {
    const convertedActionParameter = rawActionParameter;
    (0, utils_1.lazy)(convertedActionParameter, 'typeReference', () => {
        var _a, _b;
        return (_b = (_a = converter.getConvertedEntityType(rawActionParameter.type)) !== null && _a !== void 0 ? _a : converter.getConvertedComplexType(rawActionParameter.type)) !== null && _b !== void 0 ? _b : converter.getConvertedTypeDefinition(rawActionParameter.type);
    });
    (0, utils_1.lazy)(convertedActionParameter, 'annotations', resolveAnnotations(converter, rawActionParameter));
    return convertedActionParameter;
}
/**
 * Converts a ComplexType.
 *
 * @param converter   Converter
 * @param rawComplexType  Unconverted ComplexType
 * @returns The converted ComplexType
 */
function convertComplexType(converter, rawComplexType) {
    const convertedComplexType = rawComplexType;
    (0, utils_1.lazy)(convertedComplexType, 'properties', converter.convert(rawComplexType.properties, convertProperty));
    (0, utils_1.lazy)(convertedComplexType, 'navigationProperties', converter.convert(rawComplexType.navigationProperties, convertNavigationProperty));
    (0, utils_1.lazy)(convertedComplexType, 'annotations', resolveAnnotations(converter, rawComplexType));
    return convertedComplexType;
}
/**
 * Converts a TypeDefinition.
 *
 * @param converter   Converter
 * @param rawTypeDefinition  Unconverted TypeDefinition
 * @returns The converted TypeDefinition
 */
function convertTypeDefinition(converter, rawTypeDefinition) {
    const convertedTypeDefinition = rawTypeDefinition;
    (0, utils_1.lazy)(convertedTypeDefinition, 'annotations', resolveAnnotations(converter, rawTypeDefinition));
    return convertedTypeDefinition;
}
/**
 * Convert a RawMetadata into an object representation to be used to easily navigate a metadata object and its annotation.
 *
 * @param rawMetadata
 * @returns the converted representation of the metadata.
 */
function convert(rawMetadata) {
    // fall back on the default references if the caller does not specify any
    if (rawMetadata.references.length === 0) {
        rawMetadata.references = utils_1.defaultReferences;
    }
    // Converter Output
    const convertedOutput = {
        version: rawMetadata.version,
        namespace: rawMetadata.schema.namespace,
        annotations: rawMetadata.schema.annotations,
        references: utils_1.defaultReferences.concat(rawMetadata.references),
        diagnostics: []
    };
    // Converter
    const converter = new Converter(rawMetadata, convertedOutput);
    (0, utils_1.lazy)(convertedOutput, 'entityContainer', converter.convert(converter.rawSchema.entityContainer, convertEntityContainer));
    (0, utils_1.lazy)(convertedOutput, 'entitySets', converter.convert(converter.rawSchema.entitySets, convertEntitySet));
    (0, utils_1.lazy)(convertedOutput, 'singletons', converter.convert(converter.rawSchema.singletons, convertSingleton));
    (0, utils_1.lazy)(convertedOutput, 'entityTypes', converter.convert(converter.rawSchema.entityTypes, convertEntityType));
    (0, utils_1.lazy)(convertedOutput, 'actions', converter.convert(converter.rawSchema.actions, convertAction));
    (0, utils_1.lazy)(convertedOutput, 'complexTypes', converter.convert(converter.rawSchema.complexTypes, convertComplexType));
    (0, utils_1.lazy)(convertedOutput, 'actionImports', converter.convert(converter.rawSchema.actionImports, convertActionImport));
    (0, utils_1.lazy)(convertedOutput, 'typeDefinitions', converter.convert(converter.rawSchema.typeDefinitions, convertTypeDefinition));
    convertedOutput.resolvePath = function resolvePath(path) {
        const targetResolution = resolveTarget(converter, undefined, path);
        if (targetResolution.target) {
            appendObjectPath(targetResolution.objectPath, targetResolution.target);
        }
        return targetResolution;
    };
    return convertedOutput;
}
exports.convert = convert;


/***/ }),

/***/ 782:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(232), exports);
__exportStar(__webpack_require__(488), exports);
__exportStar(__webpack_require__(534), exports);


/***/ }),

/***/ 534:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addGetByValue = exports.createIndexedFind = exports.lazy = exports.Decimal = exports.isComplexTypeDefinition = exports.TermToTypes = exports.EnumIsFlag = exports.unalias = exports.alias = exports.substringBeforeLast = exports.substringBeforeFirst = exports.splitAtLast = exports.splitAtFirst = exports.defaultReferences = void 0;
exports.defaultReferences = [
    { alias: 'Capabilities', namespace: 'Org.OData.Capabilities.V1', uri: '' },
    { alias: 'Aggregation', namespace: 'Org.OData.Aggregation.V1', uri: '' },
    { alias: 'Validation', namespace: 'Org.OData.Validation.V1', uri: '' },
    { namespace: 'Org.OData.Core.V1', alias: 'Core', uri: '' },
    { namespace: 'Org.OData.Measures.V1', alias: 'Measures', uri: '' },
    { namespace: 'com.sap.vocabularies.Common.v1', alias: 'Common', uri: '' },
    { namespace: 'com.sap.vocabularies.UI.v1', alias: 'UI', uri: '' },
    { namespace: 'com.sap.vocabularies.Session.v1', alias: 'Session', uri: '' },
    { namespace: 'com.sap.vocabularies.Analytics.v1', alias: 'Analytics', uri: '' },
    { namespace: 'com.sap.vocabularies.CodeList.v1', alias: 'CodeList', uri: '' },
    { namespace: 'com.sap.vocabularies.PersonalData.v1', alias: 'PersonalData', uri: '' },
    { namespace: 'com.sap.vocabularies.Communication.v1', alias: 'Communication', uri: '' },
    { namespace: 'com.sap.vocabularies.HTML5.v1', alias: 'HTML5', uri: '' }
];
function splitAt(string, index) {
    return index < 0 ? [string, ''] : [string.substring(0, index), string.substring(index + 1)];
}
function substringAt(string, index) {
    return index < 0 ? string : string.substring(0, index);
}
/**
 * Splits a string at the first occurrence of a separator.
 *
 * @param string    The string to split
 * @param separator Separator, e.g. a single character.
 * @returns An array consisting of two elements: the part before the first occurrence of the separator and the part after it. If the string does not contain the separator, the second element is the empty string.
 */
function splitAtFirst(string, separator) {
    return splitAt(string, string.indexOf(separator));
}
exports.splitAtFirst = splitAtFirst;
/**
 * Splits a string at the last occurrence of a separator.
 *
 * @param string    The string to split
 * @param separator Separator, e.g. a single character.
 * @returns An array consisting of two elements: the part before the last occurrence of the separator and the part after it. If the string does not contain the separator, the second element is the empty string.
 */
function splitAtLast(string, separator) {
    return splitAt(string, string.lastIndexOf(separator));
}
exports.splitAtLast = splitAtLast;
/**
 * Returns the substring before the first occurrence of a separator.
 *
 * @param string    The string
 * @param separator Separator, e.g. a single character.
 * @returns The substring before the first occurrence of the separator, or the input string if it does not contain the separator.
 */
function substringBeforeFirst(string, separator) {
    return substringAt(string, string.indexOf(separator));
}
exports.substringBeforeFirst = substringBeforeFirst;
/**
 * Returns the substring before the last occurrence of a separator.
 *
 * @param string    The string
 * @param separator Separator, e.g. a single character.
 * @returns The substring before the last occurrence of the separator, or the input string if it does not contain the separator.
 */
function substringBeforeLast(string, separator) {
    return substringAt(string, string.lastIndexOf(separator));
}
exports.substringBeforeLast = substringBeforeLast;
/**
 * Transform an unaliased string representation annotation to the aliased version.
 *
 * @param references currentReferences for the project
 * @param unaliasedValue the unaliased value
 * @returns the aliased string representing the same
 */
function alias(references, unaliasedValue) {
    if (!references.reverseReferenceMap) {
        references.reverseReferenceMap = references.reduce((map, ref) => {
            map[ref.namespace] = ref;
            return map;
        }, {});
    }
    if (!unaliasedValue) {
        return unaliasedValue;
    }
    const [namespace, value] = splitAtLast(unaliasedValue, '.');
    const reference = references.reverseReferenceMap[namespace];
    if (reference) {
        return `${reference.alias}.${value}`;
    }
    else if (unaliasedValue.includes('@')) {
        // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
        const [preAlias, postAlias] = splitAtFirst(unaliasedValue, '@');
        return `${preAlias}@${alias(references, postAlias)}`;
    }
    else {
        return unaliasedValue;
    }
}
exports.alias = alias;
/**
 * Transform an aliased string representation annotation to the unaliased version.
 *
 * @param references currentReferences for the project
 * @param aliasedValue the aliased value
 * @returns the unaliased string representing the same
 */
function unalias(references, aliasedValue) {
    if (!references.referenceMap) {
        references.referenceMap = references.reduce((map, ref) => {
            map[ref.alias] = ref;
            return map;
        }, {});
    }
    if (!aliasedValue) {
        return aliasedValue;
    }
    const [vocAlias, value] = splitAtFirst(aliasedValue, '.');
    const reference = references.referenceMap[vocAlias];
    if (reference) {
        return `${reference.namespace}.${value}`;
    }
    else if (aliasedValue.includes('@')) {
        // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
        const [preAlias, postAlias] = splitAtFirst(aliasedValue, '@');
        return `${preAlias}@${unalias(references, postAlias)}`;
    }
    else {
        return aliasedValue;
    }
}
exports.unalias = unalias;
exports.EnumIsFlag = {
    'Auth.KeyLocation': false,
    'Core.RevisionKind': false,
    'Core.DataModificationOperationKind': false,
    'Core.Permission': true,
    'Capabilities.ConformanceLevelType': false,
    'Capabilities.IsolationLevel': true,
    'Capabilities.NavigationType': false,
    'Capabilities.SearchExpressions': true,
    'Capabilities.HttpMethod': true,
    'Aggregation.RollupType': false,
    'Common.TextFormatType': false,
    'Common.FilterExpressionType': false,
    'Common.FieldControlType': false,
    'Common.EffectType': true,
    'Communication.KindType': false,
    'Communication.ContactInformationType': true,
    'Communication.PhoneType': true,
    'Communication.GenderType': false,
    'UI.VisualizationType': false,
    'UI.CriticalityType': false,
    'UI.ImprovementDirectionType': false,
    'UI.TrendType': false,
    'UI.ChartType': false,
    'UI.ChartAxisScaleBehaviorType': false,
    'UI.ChartAxisAutoScaleDataScopeType': false,
    'UI.ChartDimensionRoleType': false,
    'UI.ChartMeasureRoleType': false,
    'UI.SelectionRangeSignType': false,
    'UI.SelectionRangeOptionType': false,
    'UI.TextArrangementType': false,
    'UI.ImportanceType': false,
    'UI.CriticalityRepresentationType': false,
    'UI.OperationGroupingType': false
};
var TermToTypes;
(function (TermToTypes) {
    TermToTypes["Org.OData.Authorization.V1.SecuritySchemes"] = "Org.OData.Authorization.V1.SecurityScheme";
    TermToTypes["Org.OData.Authorization.V1.Authorizations"] = "Org.OData.Authorization.V1.Authorization";
    TermToTypes["Org.OData.Core.V1.Revisions"] = "Org.OData.Core.V1.RevisionType";
    TermToTypes["Org.OData.Core.V1.Links"] = "Org.OData.Core.V1.Link";
    TermToTypes["Org.OData.Core.V1.Example"] = "Org.OData.Core.V1.ExampleValue";
    TermToTypes["Org.OData.Core.V1.Messages"] = "Org.OData.Core.V1.MessageType";
    TermToTypes["Org.OData.Core.V1.ValueException"] = "Org.OData.Core.V1.ValueExceptionType";
    TermToTypes["Org.OData.Core.V1.ResourceException"] = "Org.OData.Core.V1.ResourceExceptionType";
    TermToTypes["Org.OData.Core.V1.DataModificationException"] = "Org.OData.Core.V1.DataModificationExceptionType";
    TermToTypes["Org.OData.Core.V1.IsLanguageDependent"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AppliesViaContainer"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.DereferenceableIDs"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ConventionalIDs"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.Permissions"] = "Org.OData.Core.V1.Permission";
    TermToTypes["Org.OData.Core.V1.DefaultNamespace"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.Immutable"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.Computed"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ComputedDefaultValue"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.IsURL"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.IsMediaType"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ContentDisposition"] = "Org.OData.Core.V1.ContentDispositionType";
    TermToTypes["Org.OData.Core.V1.OptimisticConcurrency"] = "Edm.PropertyPath";
    TermToTypes["Org.OData.Core.V1.AdditionalProperties"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AutoExpand"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AutoExpandReferences"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.MayImplement"] = "Org.OData.Core.V1.QualifiedTypeName";
    TermToTypes["Org.OData.Core.V1.Ordered"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.PositionalInsert"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AlternateKeys"] = "Org.OData.Core.V1.AlternateKey";
    TermToTypes["Org.OData.Core.V1.OptionalParameter"] = "Org.OData.Core.V1.OptionalParameterType";
    TermToTypes["Org.OData.Core.V1.OperationAvailable"] = "Edm.Boolean";
    TermToTypes["Org.OData.Core.V1.SymbolicName"] = "Org.OData.Core.V1.SimpleIdentifier";
    TermToTypes["Org.OData.Core.V1.GeometryFeature"] = "Org.OData.Core.V1.GeometryFeatureType";
    TermToTypes["Org.OData.Capabilities.V1.ConformanceLevel"] = "Org.OData.Capabilities.V1.ConformanceLevelType";
    TermToTypes["Org.OData.Capabilities.V1.AsynchronousRequestsSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.BatchContinueOnErrorSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.IsolationSupported"] = "Org.OData.Capabilities.V1.IsolationLevel";
    TermToTypes["Org.OData.Capabilities.V1.CrossJoinSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.CallbackSupported"] = "Org.OData.Capabilities.V1.CallbackType";
    TermToTypes["Org.OData.Capabilities.V1.ChangeTracking"] = "Org.OData.Capabilities.V1.ChangeTrackingType";
    TermToTypes["Org.OData.Capabilities.V1.CountRestrictions"] = "Org.OData.Capabilities.V1.CountRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.NavigationRestrictions"] = "Org.OData.Capabilities.V1.NavigationRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.IndexableByKey"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.TopSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.SkipSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.ComputeSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.SelectSupport"] = "Org.OData.Capabilities.V1.SelectSupportType";
    TermToTypes["Org.OData.Capabilities.V1.BatchSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.BatchSupport"] = "Org.OData.Capabilities.V1.BatchSupportType";
    TermToTypes["Org.OData.Capabilities.V1.FilterRestrictions"] = "Org.OData.Capabilities.V1.FilterRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.SortRestrictions"] = "Org.OData.Capabilities.V1.SortRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.ExpandRestrictions"] = "Org.OData.Capabilities.V1.ExpandRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.SearchRestrictions"] = "Org.OData.Capabilities.V1.SearchRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.KeyAsSegmentSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.QuerySegmentSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.InsertRestrictions"] = "Org.OData.Capabilities.V1.InsertRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.DeepInsertSupport"] = "Org.OData.Capabilities.V1.DeepInsertSupportType";
    TermToTypes["Org.OData.Capabilities.V1.UpdateRestrictions"] = "Org.OData.Capabilities.V1.UpdateRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.DeepUpdateSupport"] = "Org.OData.Capabilities.V1.DeepUpdateSupportType";
    TermToTypes["Org.OData.Capabilities.V1.DeleteRestrictions"] = "Org.OData.Capabilities.V1.DeleteRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.CollectionPropertyRestrictions"] = "Org.OData.Capabilities.V1.CollectionPropertyRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.OperationRestrictions"] = "Org.OData.Capabilities.V1.OperationRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.AnnotationValuesInQuerySupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.ModificationQueryOptions"] = "Org.OData.Capabilities.V1.ModificationQueryOptionsType";
    TermToTypes["Org.OData.Capabilities.V1.ReadRestrictions"] = "Org.OData.Capabilities.V1.ReadRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.CustomHeaders"] = "Org.OData.Capabilities.V1.CustomParameter";
    TermToTypes["Org.OData.Capabilities.V1.CustomQueryOptions"] = "Org.OData.Capabilities.V1.CustomParameter";
    TermToTypes["Org.OData.Capabilities.V1.MediaLocationUpdateSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Aggregation.V1.ApplySupported"] = "Org.OData.Aggregation.V1.ApplySupportedType";
    TermToTypes["Org.OData.Aggregation.V1.ApplySupportedDefaults"] = "Org.OData.Aggregation.V1.ApplySupportedBase";
    TermToTypes["Org.OData.Aggregation.V1.Groupable"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Aggregation.V1.Aggregatable"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Aggregation.V1.ContextDefiningProperties"] = "Edm.PropertyPath";
    TermToTypes["Org.OData.Aggregation.V1.LeveledHierarchy"] = "Edm.PropertyPath";
    TermToTypes["Org.OData.Aggregation.V1.RecursiveHierarchy"] = "Org.OData.Aggregation.V1.RecursiveHierarchyType";
    TermToTypes["Org.OData.Aggregation.V1.AvailableOnAggregates"] = "Org.OData.Aggregation.V1.AvailableOnAggregatesType";
    TermToTypes["Org.OData.Validation.V1.Minimum"] = "Edm.PrimitiveType";
    TermToTypes["Org.OData.Validation.V1.Maximum"] = "Edm.PrimitiveType";
    TermToTypes["Org.OData.Validation.V1.Exclusive"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Validation.V1.AllowedValues"] = "Org.OData.Validation.V1.AllowedValue";
    TermToTypes["Org.OData.Validation.V1.MultipleOf"] = "Edm.Decimal";
    TermToTypes["Org.OData.Validation.V1.Constraint"] = "Org.OData.Validation.V1.ConstraintType";
    TermToTypes["Org.OData.Validation.V1.ItemsOf"] = "Org.OData.Validation.V1.ItemsOfType";
    TermToTypes["Org.OData.Validation.V1.OpenPropertyTypeConstraint"] = "Org.OData.Validation.V1.SingleOrCollectionType";
    TermToTypes["Org.OData.Validation.V1.DerivedTypeConstraint"] = "Org.OData.Validation.V1.SingleOrCollectionType";
    TermToTypes["Org.OData.Validation.V1.AllowedTerms"] = "Org.OData.Core.V1.QualifiedTermName";
    TermToTypes["Org.OData.Validation.V1.ApplicableTerms"] = "Org.OData.Core.V1.QualifiedTermName";
    TermToTypes["Org.OData.Validation.V1.MaxItems"] = "Edm.Int64";
    TermToTypes["Org.OData.Validation.V1.MinItems"] = "Edm.Int64";
    TermToTypes["Org.OData.Measures.V1.Scale"] = "Edm.Byte";
    TermToTypes["Org.OData.Measures.V1.DurationGranularity"] = "Org.OData.Measures.V1.DurationGranularityType";
    TermToTypes["com.sap.vocabularies.Analytics.v1.Dimension"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.Measure"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AccumulativeMeasure"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.RolledUpPropertyCount"] = "Edm.Int16";
    TermToTypes["com.sap.vocabularies.Analytics.v1.PlanningAction"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AggregatedProperties"] = "com.sap.vocabularies.Analytics.v1.AggregatedPropertyType";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AggregatedProperty"] = "com.sap.vocabularies.Analytics.v1.AggregatedPropertyType";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AnalyticalContext"] = "com.sap.vocabularies.Analytics.v1.AnalyticalContextType";
    TermToTypes["com.sap.vocabularies.Common.v1.ServiceVersion"] = "Edm.Int32";
    TermToTypes["com.sap.vocabularies.Common.v1.ServiceSchemaVersion"] = "Edm.Int32";
    TermToTypes["com.sap.vocabularies.Common.v1.TextFor"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.IsLanguageIdentifier"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.TextFormat"] = "com.sap.vocabularies.Common.v1.TextFormatType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDigitSequence"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsUpperCase"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCurrency"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsUnit"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificScale"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificPrecision"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.SecondaryKey"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.MinOccurs"] = "Edm.Int64";
    TermToTypes["com.sap.vocabularies.Common.v1.MaxOccurs"] = "Edm.Int64";
    TermToTypes["com.sap.vocabularies.Common.v1.AssociationEntity"] = "Edm.NavigationPropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.DerivedNavigation"] = "Edm.NavigationPropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.Masked"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.RevealOnDemand"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.Common.v1.SemanticObjectMapping"] = "com.sap.vocabularies.Common.v1.SemanticObjectMappingType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsInstanceAnnotation"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"] = "com.sap.vocabularies.Common.v1.FilterExpressionRestrictionType";
    TermToTypes["com.sap.vocabularies.Common.v1.FieldControl"] = "com.sap.vocabularies.Common.v1.FieldControlType";
    TermToTypes["com.sap.vocabularies.Common.v1.Application"] = "com.sap.vocabularies.Common.v1.ApplicationType";
    TermToTypes["com.sap.vocabularies.Common.v1.Timestamp"] = "Edm.DateTimeOffset";
    TermToTypes["com.sap.vocabularies.Common.v1.ErrorResolution"] = "com.sap.vocabularies.Common.v1.ErrorResolutionType";
    TermToTypes["com.sap.vocabularies.Common.v1.Messages"] = "Edm.ComplexType";
    TermToTypes["com.sap.vocabularies.Common.v1.numericSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
    TermToTypes["com.sap.vocabularies.Common.v1.MaximumNumericMessageSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsActionCritical"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.Common.v1.Attributes"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.RelatedRecursiveHierarchy"] = "Edm.AnnotationPath";
    TermToTypes["com.sap.vocabularies.Common.v1.Interval"] = "com.sap.vocabularies.Common.v1.IntervalType";
    TermToTypes["com.sap.vocabularies.Common.v1.ResultContext"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.SAPObjectNodeType"] = "com.sap.vocabularies.Common.v1.SAPObjectNodeTypeType";
    TermToTypes["com.sap.vocabularies.Common.v1.Composition"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsNaturalPerson"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueList"] = "com.sap.vocabularies.Common.v1.ValueListType";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"] = "Org.OData.Core.V1.SimpleIdentifier";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueListWithFixedValues"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueListMapping"] = "com.sap.vocabularies.Common.v1.ValueListMappingType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarHalfyear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarMonth"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarMonth"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearHalfyear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearMonth"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarDate"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalPeriod"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfFiscalYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearVariant"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.MutuallyExclusiveTerm"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.DraftRoot"] = "com.sap.vocabularies.Common.v1.DraftRootType";
    TermToTypes["com.sap.vocabularies.Common.v1.DraftNode"] = "com.sap.vocabularies.Common.v1.DraftNodeType";
    TermToTypes["com.sap.vocabularies.Common.v1.DraftActivationVia"] = "Org.OData.Core.V1.SimpleIdentifier";
    TermToTypes["com.sap.vocabularies.Common.v1.EditableFieldFor"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.SemanticKey"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.SideEffects"] = "com.sap.vocabularies.Common.v1.SideEffectsType";
    TermToTypes["com.sap.vocabularies.Common.v1.DefaultValuesFunction"] = "com.sap.vocabularies.Common.v1.QualifiedName";
    TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValue"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValueHigh"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.SortOrder"] = "com.sap.vocabularies.Common.v1.SortOrderType";
    TermToTypes["com.sap.vocabularies.Common.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Common.v1.RecursiveHierarchyType";
    TermToTypes["com.sap.vocabularies.Common.v1.CreatedAt"] = "Edm.DateTimeOffset";
    TermToTypes["com.sap.vocabularies.Common.v1.CreatedBy"] = "com.sap.vocabularies.Common.v1.UserID";
    TermToTypes["com.sap.vocabularies.Common.v1.ChangedAt"] = "Edm.DateTimeOffset";
    TermToTypes["com.sap.vocabularies.Common.v1.ChangedBy"] = "com.sap.vocabularies.Common.v1.UserID";
    TermToTypes["com.sap.vocabularies.Common.v1.ApplyMultiUnitBehaviorForSortingAndFiltering"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.PrimitivePropertyPath"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.CodeList.v1.CurrencyCodes"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
    TermToTypes["com.sap.vocabularies.CodeList.v1.UnitsOfMeasure"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
    TermToTypes["com.sap.vocabularies.CodeList.v1.StandardCode"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.CodeList.v1.ExternalCode"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.CodeList.v1.IsConfigurationDeprecationCode"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.Communication.v1.Contact"] = "com.sap.vocabularies.Communication.v1.ContactType";
    TermToTypes["com.sap.vocabularies.Communication.v1.Address"] = "com.sap.vocabularies.Communication.v1.AddressType";
    TermToTypes["com.sap.vocabularies.Communication.v1.IsEmailAddress"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Communication.v1.IsPhoneNumber"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Communication.v1.Event"] = "com.sap.vocabularies.Communication.v1.EventData";
    TermToTypes["com.sap.vocabularies.Communication.v1.Task"] = "com.sap.vocabularies.Communication.v1.TaskData";
    TermToTypes["com.sap.vocabularies.Communication.v1.Message"] = "com.sap.vocabularies.Communication.v1.MessageData";
    TermToTypes["com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyType";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.EntitySemantics"] = "com.sap.vocabularies.PersonalData.v1.EntitySemanticsType";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.FieldSemantics"] = "com.sap.vocabularies.PersonalData.v1.FieldSemanticsType";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallyPersonal"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Session.v1.StickySessionSupported"] = "com.sap.vocabularies.Session.v1.StickySessionSupportedType";
    TermToTypes["com.sap.vocabularies.UI.v1.HeaderInfo"] = "com.sap.vocabularies.UI.v1.HeaderInfoType";
    TermToTypes["com.sap.vocabularies.UI.v1.Identification"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.Badge"] = "com.sap.vocabularies.UI.v1.BadgeType";
    TermToTypes["com.sap.vocabularies.UI.v1.LineItem"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.StatusInfo"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.FieldGroup"] = "com.sap.vocabularies.UI.v1.FieldGroupType";
    TermToTypes["com.sap.vocabularies.UI.v1.ConnectedFields"] = "com.sap.vocabularies.UI.v1.ConnectedFieldsType";
    TermToTypes["com.sap.vocabularies.UI.v1.GeoLocations"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
    TermToTypes["com.sap.vocabularies.UI.v1.GeoLocation"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
    TermToTypes["com.sap.vocabularies.UI.v1.Contacts"] = "Edm.AnnotationPath";
    TermToTypes["com.sap.vocabularies.UI.v1.MediaResource"] = "com.sap.vocabularies.UI.v1.MediaResourceType";
    TermToTypes["com.sap.vocabularies.UI.v1.DataPoint"] = "com.sap.vocabularies.UI.v1.DataPointType";
    TermToTypes["com.sap.vocabularies.UI.v1.KPI"] = "com.sap.vocabularies.UI.v1.KPIType";
    TermToTypes["com.sap.vocabularies.UI.v1.Chart"] = "com.sap.vocabularies.UI.v1.ChartDefinitionType";
    TermToTypes["com.sap.vocabularies.UI.v1.ValueCriticality"] = "com.sap.vocabularies.UI.v1.ValueCriticalityType";
    TermToTypes["com.sap.vocabularies.UI.v1.CriticalityLabels"] = "com.sap.vocabularies.UI.v1.CriticalityLabelType";
    TermToTypes["com.sap.vocabularies.UI.v1.SelectionFields"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.UI.v1.Facets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.HeaderFacets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.QuickViewFacets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.QuickCreateFacets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.FilterFacets"] = "com.sap.vocabularies.UI.v1.ReferenceFacet";
    TermToTypes["com.sap.vocabularies.UI.v1.SelectionPresentationVariant"] = "com.sap.vocabularies.UI.v1.SelectionPresentationVariantType";
    TermToTypes["com.sap.vocabularies.UI.v1.PresentationVariant"] = "com.sap.vocabularies.UI.v1.PresentationVariantType";
    TermToTypes["com.sap.vocabularies.UI.v1.SelectionVariant"] = "com.sap.vocabularies.UI.v1.SelectionVariantType";
    TermToTypes["com.sap.vocabularies.UI.v1.ThingPerspective"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsSummary"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.PartOfPreview"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.Map"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.Gallery"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsImageURL"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsImage"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.MultiLineText"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.TextArrangement"] = "com.sap.vocabularies.UI.v1.TextArrangementType";
    TermToTypes["com.sap.vocabularies.UI.v1.Importance"] = "com.sap.vocabularies.UI.v1.ImportanceType";
    TermToTypes["com.sap.vocabularies.UI.v1.Hidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsCopyAction"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.CreateHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.UpdateHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.DeleteHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.HiddenFilter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.AdaptationHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.DataFieldDefault"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.Criticality"] = "com.sap.vocabularies.UI.v1.CriticalityType";
    TermToTypes["com.sap.vocabularies.UI.v1.CriticalityCalculation"] = "com.sap.vocabularies.UI.v1.CriticalityCalculationType";
    TermToTypes["com.sap.vocabularies.UI.v1.Emphasized"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.OrderBy"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.UI.v1.ParameterDefaultValue"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.UI.v1.RecommendationState"] = "com.sap.vocabularies.UI.v1.RecommendationStateType";
    TermToTypes["com.sap.vocabularies.UI.v1.RecommendationList"] = "com.sap.vocabularies.UI.v1.RecommendationListType";
    TermToTypes["com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.DoNotCheckScaleOfMeasuredQuantity"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.HTML5.v1.CssDefaults"] = "com.sap.vocabularies.HTML5.v1.CssDefaultsType";
})(TermToTypes = exports.TermToTypes || (exports.TermToTypes = {}));
/**
 * Differentiate between a ComplexType and a TypeDefinition.
 *
 * @param complexTypeDefinition
 * @returns true if the value is a complex type
 */
function isComplexTypeDefinition(complexTypeDefinition) {
    return (!!complexTypeDefinition && complexTypeDefinition._type === 'ComplexType' && !!complexTypeDefinition.properties);
}
exports.isComplexTypeDefinition = isComplexTypeDefinition;
function Decimal(value) {
    return {
        isDecimal() {
            return true;
        },
        valueOf() {
            return value;
        },
        toString() {
            return value.toString();
        }
    };
}
exports.Decimal = Decimal;
/**
 * Defines a lazy property.
 *
 * The property is initialized by calling the init function on the first read access, or by directly assigning a value.
 *
 * @param object    The host object
 * @param property  The lazy property to add
 * @param init      The function that initializes the property's value
 */
function lazy(object, property, init) {
    const initial = Symbol('initial');
    let _value = initial;
    Object.defineProperty(object, property, {
        enumerable: true,
        get() {
            if (_value === initial) {
                _value = init();
            }
            return _value;
        },
        set(value) {
            _value = value;
        }
    });
}
exports.lazy = lazy;
/**
 * Creates a function that allows to find an array element by property value.
 *
 * @param array     The array
 * @param property  Elements in the array are searched by this property
 * @returns A function that can be used to find an element of the array by property value.
 */
function createIndexedFind(array, property) {
    const index = new Map();
    return function find(value) {
        const element = index.get(value);
        if ((element === null || element === void 0 ? void 0 : element[property]) === value) {
            return element;
        }
        return array.find((element) => {
            if (!(element === null || element === void 0 ? void 0 : element.hasOwnProperty(property))) {
                return false;
            }
            const propertyValue = element[property];
            index.set(propertyValue, element);
            return propertyValue === value;
        });
    };
}
exports.createIndexedFind = createIndexedFind;
/**
 * Adds a 'get by value' function to an array.
 *
 * If this function is called with addIndex(myArray, 'name'), a new function 'by_name(value)' will be added that allows to
 * find a member of the array by the value of its 'name' property.
 *
 * @param array      The array
 * @param property   The property that will be used by the 'by_{property}()' function
 * @returns The array with the added function
 */
function addGetByValue(array, property) {
    const indexName = `by_${property}`;
    if (!array.hasOwnProperty(indexName)) {
        Object.defineProperty(array, indexName, { writable: false, value: createIndexedFind(array, property) });
    }
    else {
        throw new Error(`Property '${indexName}' already exists`);
    }
    return array;
}
exports.addGetByValue = addGetByValue;


/***/ }),

/***/ 488:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.revertTermToGenericType = void 0;
const utils_1 = __webpack_require__(534);
/**
 * Revert an object to its raw type equivalent.
 *
 * @param references the current reference
 * @param value the value to revert
 * @returns the raw value
 */
function revertObjectToRawType(references, value) {
    var _a, _b, _c, _d, _e, _f;
    let result;
    if (Array.isArray(value)) {
        result = {
            type: 'Collection',
            Collection: value.map((anno) => revertCollectionItemToRawType(references, anno))
        };
    }
    else if ((_a = value.isDecimal) === null || _a === void 0 ? void 0 : _a.call(value)) {
        result = {
            type: 'Decimal',
            Decimal: value.valueOf()
        };
    }
    else if ((_b = value.isString) === null || _b === void 0 ? void 0 : _b.call(value)) {
        const valueMatches = value.valueOf().split('.');
        if (valueMatches.length > 1 && references.find((ref) => ref.alias === valueMatches[0])) {
            result = {
                type: 'EnumMember',
                EnumMember: value.valueOf()
            };
        }
        else {
            result = {
                type: 'String',
                String: value.valueOf()
            };
        }
    }
    else if ((_c = value.isInt) === null || _c === void 0 ? void 0 : _c.call(value)) {
        result = {
            type: 'Int',
            Int: value.valueOf()
        };
    }
    else if ((_d = value.isFloat) === null || _d === void 0 ? void 0 : _d.call(value)) {
        result = {
            type: 'Float',
            Float: value.valueOf()
        };
    }
    else if ((_e = value.isDate) === null || _e === void 0 ? void 0 : _e.call(value)) {
        result = {
            type: 'Date',
            Date: value.valueOf()
        };
    }
    else if ((_f = value.isBoolean) === null || _f === void 0 ? void 0 : _f.call(value)) {
        result = {
            type: 'Bool',
            Bool: value.valueOf() === 'true'
        };
    }
    else if (value.type === 'Path') {
        result = {
            type: 'Path',
            Path: value.path
        };
    }
    else if (value.type === 'AnnotationPath') {
        result = {
            type: 'AnnotationPath',
            AnnotationPath: value.value
        };
    }
    else if (value.type === 'Apply') {
        result = {
            type: 'Apply',
            Apply: value.Apply
        };
    }
    else if (value.type === 'Null') {
        result = {
            type: 'Null'
        };
    }
    else if (value.type === 'PropertyPath') {
        result = {
            type: 'PropertyPath',
            PropertyPath: value.value
        };
    }
    else if (value.type === 'NavigationPropertyPath') {
        result = {
            type: 'NavigationPropertyPath',
            NavigationPropertyPath: value.value
        };
    }
    else if (Object.prototype.hasOwnProperty.call(value, '$Type')) {
        result = {
            type: 'Record',
            Record: revertCollectionItemToRawType(references, value)
        };
    }
    return result;
}
/**
 * Revert a value to its raw value depending on its type.
 *
 * @param references the current set of reference
 * @param value the value to revert
 * @returns the raw expression
 */
function revertValueToRawType(references, value) {
    let result;
    const valueConstructor = value === null || value === void 0 ? void 0 : value.constructor.name;
    switch (valueConstructor) {
        case 'String':
        case 'string':
            const valueMatches = value.toString().split('.');
            if (valueMatches.length > 1 && references.find((ref) => ref.alias === valueMatches[0])) {
                result = {
                    type: 'EnumMember',
                    EnumMember: value.toString()
                };
            }
            else {
                result = {
                    type: 'String',
                    String: value.toString()
                };
            }
            break;
        case 'Boolean':
        case 'boolean':
            result = {
                type: 'Bool',
                Bool: value.valueOf()
            };
            break;
        case 'Number':
        case 'number':
            if (value.toString() === value.toFixed()) {
                result = {
                    type: 'Int',
                    Int: value.valueOf()
                };
            }
            else {
                result = {
                    type: 'Decimal',
                    Decimal: value.valueOf()
                };
            }
            break;
        case 'object':
        default:
            result = revertObjectToRawType(references, value);
            break;
    }
    return result;
}
const restrictedKeys = ['$Type', 'term', '__source', 'qualifier', 'ActionTarget', 'fullyQualifiedName', 'annotations'];
/**
 * Revert the current embedded annotations to their raw type.
 *
 * @param references the current set of reference
 * @param currentAnnotations the collection item to evaluate
 * @param targetAnnotations the place where we need to add the annotation
 */
function revertAnnotationsToRawType(references, currentAnnotations, targetAnnotations) {
    Object.keys(currentAnnotations)
        .filter((key) => key !== '_annotations')
        .forEach((key) => {
        Object.keys(currentAnnotations[key]).forEach((term) => {
            const parsedAnnotation = revertTermToGenericType(references, currentAnnotations[key][term]);
            if (!parsedAnnotation.term) {
                const unaliasedTerm = (0, utils_1.unalias)(references, `${key}.${term}`);
                if (unaliasedTerm) {
                    const qualifiedSplit = unaliasedTerm.split('#');
                    parsedAnnotation.term = qualifiedSplit[0];
                    if (qualifiedSplit.length > 1) {
                        // Sub Annotation with a qualifier, not sure when that can happen in real scenarios
                        parsedAnnotation.qualifier = qualifiedSplit[1];
                    }
                }
            }
            targetAnnotations.push(parsedAnnotation);
        });
    });
}
/**
 * Revert the current collection item to the corresponding raw annotation.
 *
 * @param references the current set of reference
 * @param collectionItem the collection item to evaluate
 * @returns the raw type equivalent
 */
function revertCollectionItemToRawType(references, collectionItem) {
    if (typeof collectionItem === 'string') {
        return collectionItem;
    }
    else if (typeof collectionItem === 'object') {
        if (collectionItem.hasOwnProperty('$Type')) {
            // Annotation Record
            const outItem = {
                type: collectionItem.$Type,
                propertyValues: []
            };
            // Could validate keys and type based on $Type
            Object.keys(collectionItem).forEach((collectionKey) => {
                if (restrictedKeys.indexOf(collectionKey) === -1) {
                    const value = collectionItem[collectionKey];
                    outItem.propertyValues.push({
                        name: collectionKey,
                        value: revertValueToRawType(references, value)
                    });
                }
                else if (collectionKey === 'annotations' && Object.keys(collectionItem[collectionKey]).length > 0) {
                    outItem.annotations = [];
                    revertAnnotationsToRawType(references, collectionItem[collectionKey], outItem.annotations);
                }
            });
            return outItem;
        }
        else if (collectionItem.type === 'PropertyPath') {
            return {
                type: 'PropertyPath',
                PropertyPath: collectionItem.value
            };
        }
        else if (collectionItem.type === 'AnnotationPath') {
            return {
                type: 'AnnotationPath',
                AnnotationPath: collectionItem.value
            };
        }
        else if (collectionItem.type === 'NavigationPropertyPath') {
            return {
                type: 'NavigationPropertyPath',
                NavigationPropertyPath: collectionItem.value
            };
        }
    }
    return undefined;
}
/**
 * Revert an annotation term to it's generic or raw equivalent.
 *
 * @param references the reference of the current context
 * @param annotation the annotation term to revert
 * @returns the raw annotation
 */
function revertTermToGenericType(references, annotation) {
    const baseAnnotation = {
        term: annotation.term,
        qualifier: annotation.qualifier
    };
    if (Array.isArray(annotation)) {
        // Collection
        if (annotation.hasOwnProperty('annotations') && Object.keys(annotation.annotations).length > 0) {
            // Annotation on a collection itself, not sure when that happens if at all
            baseAnnotation.annotations = [];
            revertAnnotationsToRawType(references, annotation.annotations, baseAnnotation.annotations);
        }
        return {
            ...baseAnnotation,
            collection: annotation.map((anno) => revertCollectionItemToRawType(references, anno))
        };
    }
    else if (annotation.hasOwnProperty('$Type')) {
        return { ...baseAnnotation, record: revertCollectionItemToRawType(references, annotation) };
    }
    else {
        return { ...baseAnnotation, value: revertValueToRawType(references, annotation) };
    }
}
exports.revertTermToGenericType = revertTermToGenericType;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(782);
/******/ 	AnnotationConverter = __webpack_exports__;
/******/ 	
/******/ })()
;

    return AnnotationConverter;
 },true);
 //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyL25vZGVfbW9kdWxlcy8ucG5wbS9Ac2FwLXV4K2Fubm90YXRpb24tY29udmVydGVyQDAuNi40L25vZGVfbW9kdWxlcy9Ac2FwLXV4L2Fubm90YXRpb24tY29udmVydGVyL3NyYy9jb252ZXJ0ZXIudHMiLCJ3ZWJwYWNrOi8vQW5ub3RhdGlvbkNvbnZlcnRlci9ub2RlX21vZHVsZXMvLnBucG0vQHNhcC11eCthbm5vdGF0aW9uLWNvbnZlcnRlckAwLjYuNC9ub2RlX21vZHVsZXMvQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlci9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vQW5ub3RhdGlvbkNvbnZlcnRlci9ub2RlX21vZHVsZXMvLnBucG0vQHNhcC11eCthbm5vdGF0aW9uLWNvbnZlcnRlckAwLjYuNC9ub2RlX21vZHVsZXMvQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlci9zcmMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vQW5ub3RhdGlvbkNvbnZlcnRlci9ub2RlX21vZHVsZXMvLnBucG0vQHNhcC11eCthbm5vdGF0aW9uLWNvbnZlcnRlckAwLjYuNC9ub2RlX21vZHVsZXMvQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlci9zcmMvd3JpdGViYWNrLnRzIiwid2VicGFjazovL0Fubm90YXRpb25Db252ZXJ0ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQW5ub3RhdGlvbkNvbnZlcnRlci93ZWJwYWNrL3N0YXJ0dXAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQXdDQSx5Q0FhaUI7QUFFakI7O0dBRUc7QUFDSCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBRXREOzs7Ozs7R0FNRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsVUFBaUIsRUFBRSxhQUFrQjtJQUMzRCxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxH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QyxDQUFVO1NBQ2pHLENBQUM7S0FDTDtTQUFNLElBQUksVUFBVSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUMzQyxPQUFPLEVBQUUsR0FBRyxjQUFjLEVBQUUsTUFBTSxFQUFFLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQVEsRUFBRSxDQUFDO0tBQ3RHO1NBQU07UUFDSCxPQUFPLEVBQUUsR0FBRyxjQUFjLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO0tBQ3JGO0FBQ0wsQ0FBQztBQXJCRCwwREFxQkM7Ozs7Ozs7VUMzUkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVQ3RCQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJBbm5vdGF0aW9uQ29udmVydGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcbiAgICBBY3Rpb24sXG4gICAgQWN0aW9uSW1wb3J0LFxuICAgIEFjdGlvblBhcmFtZXRlcixcbiAgICBBbm5vdGF0aW9uLFxuICAgIEFubm90YXRpb25MaXN0LFxuICAgIEFubm90YXRpb25SZWNvcmQsXG4gICAgQXJyYXlXaXRoSW5kZXgsXG4gICAgQmFzZU5hdmlnYXRpb25Qcm9wZXJ0eSxcbiAgICBDb21wbGV4VHlwZSxcbiAgICBDb252ZXJ0ZWRNZXRhZGF0YSxcbiAgICBFbnRpdHlDb250YWluZXIsXG4gICAgRW50aXR5U2V0LFxuICAgIEVudGl0eVR5cGUsXG4gICAgRXhwcmVzc2lvbixcbiAgICBGdWxseVF1YWxpZmllZE5hbWUsXG4gICAgTmF2aWdhdGlvblByb3BlcnR5LFxuICAgIFByb3BlcnR5LFxuICAgIFByb3BlcnR5UGF0aCxcbiAgICBSYXdBY3Rpb24sXG4gICAgUmF3QWN0aW9uSW1wb3J0LFxuICAgIFJhd0Fubm90YXRpb24sXG4gICAgUmF3Q29tcGxleFR5cGUsXG4gICAgUmF3RW50aXR5Q29udGFpbmVyLFxuICAgIFJhd0VudGl0eVNldCxcbiAgICBSYXdFbnRpdHlUeXBlLFxuICAgIFJhd01ldGFkYXRhLFxuICAgIFJhd1Byb3BlcnR5LFxuICAgIFJhd1NjaGVtYSxcbiAgICBSYXdTaW5nbGV0b24sXG4gICAgUmF3VHlwZURlZmluaXRpb24sXG4gICAgUmF3VjJOYXZpZ2F0aW9uUHJvcGVydHksXG4gICAgUmF3VjROYXZpZ2F0aW9uUHJvcGVydHksXG4gICAgUmVmZXJlbmNlLFxuICAgIFJlbW92ZUFubm90YXRpb25BbmRUeXBlLFxuICAgIFJlc29sdXRpb25UYXJnZXQsXG4gICAgU2luZ2xldG9uLFxuICAgIFR5cGVEZWZpbml0aW9uXG59IGZyb20gJ0BzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzJztcbmltcG9ydCB0eXBlIHsgUmVmZXJlbmNlc1dpdGhNYXAgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7XG4gICAgYWRkR2V0QnlWYWx1ZSxcbiAgICBhbGlhcyxcbiAgICBEZWNpbWFsLFxuICAgIGRlZmF1bHRSZWZlcmVuY2VzLFxuICAgIEVudW1Jc0ZsYWcsXG4gICAgbGF6eSxcbiAgICBzcGxpdEF0Rmlyc3QsXG4gICAgc3BsaXRBdExhc3QsXG4gICAgc3Vic3RyaW5nQmVmb3JlRmlyc3QsXG4gICAgc3Vic3RyaW5nQmVmb3JlTGFzdCxcbiAgICBUZXJtVG9UeXBlcyxcbiAgICB1bmFsaWFzXG59IGZyb20gJy4vdXRpbHMnO1xuXG4vKipcbiAqIFN5bWJvbCB0byBleHRlbmQgYW4gYW5ub3RhdGlvbiB3aXRoIHRoZSByZWZlcmVuY2UgdG8gaXRzIHRhcmdldC5cbiAqL1xuY29uc3QgQU5OT1RBVElPTl9UQVJHRVQgPSBTeW1ib2woJ0Fubm90YXRpb24gVGFyZ2V0Jyk7XG5cbi8qKlxuICogQXBwZW5kIGFuIG9iamVjdCB0byB0aGUgbGlzdCBvZiB2aXNpdGVkIG9iamVjdHMgaWYgaXQgaXMgZGlmZmVyZW50IGZyb20gdGhlIGxhc3Qgb2JqZWN0IGluIHRoZSBsaXN0LlxuICpcbiAqIEBwYXJhbSBvYmplY3RQYXRoICAgIFRoZSBsaXN0IG9mIHZpc2l0ZWQgb2JqZWN0c1xuICogQHBhcmFtIHZpc2l0ZWRPYmplY3QgVGhlIG9iamVjdFxuICogQHJldHVybnMgVGhlIGxpc3Qgb2YgdmlzaXRlZCBvYmplY3RzXG4gKi9cbmZ1bmN0aW9uIGFwcGVuZE9iamVjdFBhdGgob2JqZWN0UGF0aDogYW55W10sIHZpc2l0ZWRPYmplY3Q6IGFueSk6IGFueVtdIHtcbiAgICBpZiAob2JqZWN0UGF0aFtvYmplY3RQYXRoLmxlbmd0aCAtIDFdICE9PSB2aXNpdGVkT2JqZWN0KSB7XG4gICAgICAgIG9iamVjdFBhdGgucHVzaCh2aXNpdGVkT2JqZWN0KTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdFBhdGg7XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYSAocG9zc2libHkgcmVsYXRpdmUpIHBhdGguXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgICAgICAgIENvbnZlcnRlclxuICogQHBhcmFtIHN0YXJ0RWxlbWVudCAgICAgIFRoZSBzdGFydGluZyBwb2ludCBpbiBjYXNlIG9mIHJlbGF0aXZlIHBhdGggcmVzb2x1dGlvblxuICogQHBhcmFtIHBhdGggICAgICAgICAgICAgIFRoZSBwYXRoIHRvIHJlc29sdmVcbiAqIEBwYXJhbSBhbm5vdGF0aW9uc1Rlcm0gICBPbmx5IGZvciBlcnJvciByZXBvcnRpbmc6IFRoZSBhbm5vdGF0aW9uIHRlcm1cbiAqIEByZXR1cm5zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXNvbHZlZCB0YXJnZXQgYW5kIHRoZSBlbGVtZW50cyB0aGF0IHdlcmUgdmlzaXRlZCB3aGlsZSBnZXR0aW5nIHRvIHRoZSB0YXJnZXQuXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVUYXJnZXQ8VD4oXG4gICAgY29udmVydGVyOiBDb252ZXJ0ZXIsXG4gICAgc3RhcnRFbGVtZW50OiBhbnksXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGFubm90YXRpb25zVGVybT86IHN0cmluZ1xuKTogUmVzb2x1dGlvblRhcmdldDxUPiB7XG4gICAgLy8gYWJzb2x1dGUgcGF0aHMgYWx3YXlzIHN0YXJ0IGF0IHRoZSBlbnRpdHkgY29udGFpbmVyXG4gICAgaWYgKHBhdGguc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIHBhdGggPSBwYXRoLnN1YnN0cmluZygxKTtcbiAgICAgICAgc3RhcnRFbGVtZW50ID0gdW5kZWZpbmVkOyAvLyB3aWxsIHJlc29sdmUgdG8gdGhlIGVudGl0eSBjb250YWluZXIgKHNlZSBiZWxvdylcbiAgICB9XG5cbiAgICBjb25zdCBwYXRoU2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJykucmVkdWNlKCh0YXJnZXRQYXRoLCBzZWdtZW50KSA9PiB7XG4gICAgICAgIGlmIChzZWdtZW50LmluY2x1ZGVzKCdAJykpIHtcbiAgICAgICAgICAgIC8vIFNlcGFyYXRlIG91dCB0aGUgYW5ub3RhdGlvblxuICAgICAgICAgICAgY29uc3QgW3BhdGhQYXJ0LCBhbm5vdGF0aW9uUGFydF0gPSBzcGxpdEF0Rmlyc3Qoc2VnbWVudCwgJ0AnKTtcbiAgICAgICAgICAgIHRhcmdldFBhdGgucHVzaChwYXRoUGFydCk7XG4gICAgICAgICAgICB0YXJnZXRQYXRoLnB1c2goYEAke2Fubm90YXRpb25QYXJ0fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0UGF0aC5wdXNoKHNlZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXRQYXRoO1xuICAgIH0sIFtdIGFzIHN0cmluZ1tdKTtcblxuICAgIC8vIGRldGVybWluZSB0aGUgc3RhcnRpbmcgcG9pbnQgZm9yIHRoZSByZXNvbHV0aW9uXG4gICAgaWYgKHN0YXJ0RWxlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIG5vIHN0YXJ0aW5nIHBvaW50IGdpdmVuOiBzdGFydCBhdCB0aGUgZW50aXR5IGNvbnRhaW5lclxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBwYXRoU2VnbWVudHNbMF0uc3RhcnRzV2l0aChjb252ZXJ0ZXIucmF3U2NoZW1hLm5hbWVzcGFjZSkgJiZcbiAgICAgICAgICAgIHBhdGhTZWdtZW50c1swXSAhPT0gY29udmVydGVyLmdldENvbnZlcnRlZEVudGl0eUNvbnRhaW5lcigpPy5mdWxseVF1YWxpZmllZE5hbWVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBXZSBoYXZlIGEgZnVsbHkgcXVhbGlmaWVkIG5hbWUgaW4gdGhlIHBhdGggdGhhdCBpcyBub3QgdGhlIGVudGl0eSBjb250YWluZXIuXG4gICAgICAgICAgICBzdGFydEVsZW1lbnQgPVxuICAgICAgICAgICAgICAgIGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRFbnRpdHlUeXBlKHBhdGhTZWdtZW50c1swXSkgPz9cbiAgICAgICAgICAgICAgICBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkQ29tcGxleFR5cGUocGF0aFNlZ21lbnRzWzBdKSA/P1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRBY3Rpb24ocGF0aFNlZ21lbnRzWzBdKTtcbiAgICAgICAgICAgIHBhdGhTZWdtZW50cy5zaGlmdCgpOyAvLyBMZXQncyByZW1vdmUgdGhlIGZpcnN0IHBhdGggZWxlbWVudFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnRFbGVtZW50ID0gY29udmVydGVyLmdldENvbnZlcnRlZEVudGl0eUNvbnRhaW5lcigpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChzdGFydEVsZW1lbnRbQU5OT1RBVElPTl9UQVJHRVRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gYW5ub3RhdGlvbjogc3RhcnQgYXQgdGhlIGFubm90YXRpb24gdGFyZ2V0XG4gICAgICAgIHN0YXJ0RWxlbWVudCA9IHN0YXJ0RWxlbWVudFtBTk5PVEFUSU9OX1RBUkdFVF07XG4gICAgfSBlbHNlIGlmIChzdGFydEVsZW1lbnQuX3R5cGUgPT09ICdQcm9wZXJ0eScpIHtcbiAgICAgICAgLy8gcHJvcGVydHk6IHN0YXJ0IGF0IHRoZSBlbnRpdHkgdHlwZSBvciBjb21wbGV4IHR5cGUgdGhlIHByb3BlcnR5IGJlbG9uZ3MgdG9cbiAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudEZRTiA9IHN1YnN0cmluZ0JlZm9yZUZpcnN0KHN0YXJ0RWxlbWVudC5mdWxseVF1YWxpZmllZE5hbWUsICcvJyk7XG4gICAgICAgIHN0YXJ0RWxlbWVudCA9XG4gICAgICAgICAgICBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkRW50aXR5VHlwZShwYXJlbnRFbGVtZW50RlFOKSA/PyBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkQ29tcGxleFR5cGUocGFyZW50RWxlbWVudEZRTik7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gcGF0aFNlZ21lbnRzLnJlZHVjZShcbiAgICAgICAgKGN1cnJlbnQ6IFJlc29sdXRpb25UYXJnZXQ8YW55Piwgc2VnbWVudDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Lm1lc3NhZ2VzLnB1c2goeyBtZXNzYWdlIH0pO1xuICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnQudGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudC5vYmplY3RQYXRoID0gYXBwZW5kT2JqZWN0UGF0aChjdXJyZW50Lm9iamVjdFBhdGgsIGN1cnJlbnQudGFyZ2V0KTtcblxuICAgICAgICAgICAgLy8gQW5ub3RhdGlvblxuICAgICAgICAgICAgaWYgKHNlZ21lbnQuc3RhcnRzV2l0aCgnQCcpICYmIHNlZ21lbnQgIT09ICdAJHVpNS5vdmVybG9hZCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbdm9jYWJ1bGFyeUFsaWFzLCB0ZXJtXSA9IGNvbnZlcnRlci5zcGxpdFRlcm0oc2VnbWVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5ub3RhdGlvbiA9IGN1cnJlbnQudGFyZ2V0LmFubm90YXRpb25zW3ZvY2FidWxhcnlBbGlhcy5zdWJzdHJpbmcoMSldPy5bdGVybV07XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ub3RhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gYW5ub3RhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEFubm90YXRpb24gJyR7c2VnbWVudC5zdWJzdHJpbmcoMSl9JyBub3QgZm91bmQgb24gJHtjdXJyZW50LnRhcmdldC5fdHlwZX0gJyR7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldC5mdWxseVF1YWxpZmllZE5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSdgXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gJFBhdGggLyAkQW5ub3RhdGlvblBhdGggc3ludGF4XG4gICAgICAgICAgICBpZiAoY3VycmVudC50YXJnZXQuJHRhcmdldCkge1xuICAgICAgICAgICAgICAgIGxldCBzdWJQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKHNlZ21lbnQgPT09ICckQW5ub3RhdGlvblBhdGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1YlBhdGggPSBjdXJyZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlZ21lbnQgPT09ICckUGF0aCcpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ViUGF0aCA9IGN1cnJlbnQudGFyZ2V0LnBhdGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHN1YlBhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJUYXJnZXQgPSByZXNvbHZlVGFyZ2V0KGNvbnZlcnRlciwgY3VycmVudC50YXJnZXRbQU5OT1RBVElPTl9UQVJHRVRdLCBzdWJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgc3ViVGFyZ2V0Lm9iamVjdFBhdGguZm9yRWFjaCgodmlzaXRlZFN1Yk9iamVjdDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnQub2JqZWN0UGF0aC5pbmNsdWRlcyh2aXNpdGVkU3ViT2JqZWN0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQub2JqZWN0UGF0aCA9IGFwcGVuZE9iamVjdFBhdGgoY3VycmVudC5vYmplY3RQYXRoLCB2aXNpdGVkU3ViT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQgPSBzdWJUYXJnZXQudGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Lm9iamVjdFBhdGggPSBhcHBlbmRPYmplY3RQYXRoKGN1cnJlbnQub2JqZWN0UGF0aCwgY3VycmVudC50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRyYXZlcnNlIGJhc2VkIG9uIHRoZSBlbGVtZW50IHR5cGVcbiAgICAgICAgICAgIHN3aXRjaCAoY3VycmVudC50YXJnZXQ/Ll90eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnU2NoZW1hJzpcbiAgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBlbGVtZW50OiBFbnRpdHlUeXBlLCBDb21wbGV4VHlwZSwgQWN0aW9uLCBFbnRpdHlDb250YWluZXIgP1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0VudGl0eUNvbnRhaW5lcic6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRoaXNFbGVtZW50ID0gY3VycmVudC50YXJnZXQgYXMgRW50aXR5Q29udGFpbmVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VnbWVudCA9PT0gJycgfHwgc2VnbWVudCA9PT0gdGhpc0VsZW1lbnQuZnVsbHlRdWFsaWZpZWROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5leHQgZWxlbWVudDogRW50aXR5U2V0LCBTaW5nbGV0b24gb3IgQWN0aW9uSW1wb3J0P1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dEVsZW1lbnQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IEFjdGlvbkltcG9ydCB8IHVuZGVmaW5lZCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc0VsZW1lbnQuZW50aXR5U2V0cy5ieV9uYW1lKHNlZ21lbnQpID8/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc0VsZW1lbnQuc2luZ2xldG9ucy5ieV9uYW1lKHNlZ21lbnQpID8/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc0VsZW1lbnQuYWN0aW9uSW1wb3J0cy5ieV9uYW1lKHNlZ21lbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IG5leHRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnRW50aXR5U2V0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdTaW5nbGV0b24nOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRoaXNFbGVtZW50ID0gY3VycmVudC50YXJnZXQgYXMgRW50aXR5U2V0IHwgU2luZ2xldG9uO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWdtZW50ID09PSAnJyB8fCBzZWdtZW50ID09PSAnJFR5cGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbXB0eSBQYXRoIGFmdGVyIGFuIEVudGl0eVNldCBvciBTaW5nbGV0b24gbWVhbnMgRW50aXR5VHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQgPSB0aGlzRWxlbWVudC5lbnRpdHlUeXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VnbWVudCA9PT0gJyQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWdtZW50ID09PSAnJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5ncyA9IHRoaXNFbGVtZW50Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBjb250aW51ZSByZXNvbHZpbmcgYXQgdGhlIEVudGl0eVNldCdzIG9yIFNpbmdsZXRvbidzIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzb2x2ZVRhcmdldChjb252ZXJ0ZXIsIHRoaXNFbGVtZW50LmVudGl0eVR5cGUsIHNlZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IHJlc3VsdC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQub2JqZWN0UGF0aCA9IHJlc3VsdC5vYmplY3RQYXRoLnJlZHVjZShhcHBlbmRPYmplY3RQYXRoLCBjdXJyZW50Lm9iamVjdFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYXNlICdFbnRpdHlUeXBlJzpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGhpc0VsZW1lbnQgPSBjdXJyZW50LnRhcmdldCBhcyBFbnRpdHlUeXBlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VnbWVudCA9PT0gJycgfHwgc2VnbWVudCA9PT0gJyRUeXBlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXNFbGVtZW50LmVudGl0eVByb3BlcnRpZXMuYnlfbmFtZShzZWdtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gcHJvcGVydHk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0eSA9IHRoaXNFbGVtZW50Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmJ5X25hbWUoc2VnbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmF2aWdhdGlvblByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQgPSBuYXZpZ2F0aW9uUHJvcGVydHk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXNFbGVtZW50LmFjdGlvbnNbc2VnbWVudF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQgPSBhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdBY3Rpb25JbXBvcnQnOiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnRpbnVlIHJlc29sdmluZyBhdCB0aGUgQWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc29sdmVUYXJnZXQoY29udmVydGVyLCBjdXJyZW50LnRhcmdldC5hY3Rpb24sIHNlZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IHJlc3VsdC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQub2JqZWN0UGF0aCA9IHJlc3VsdC5vYmplY3RQYXRoLnJlZHVjZShhcHBlbmRPYmplY3RQYXRoLCBjdXJyZW50Lm9iamVjdFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYXNlICdBY3Rpb24nOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRoaXNFbGVtZW50ID0gY3VycmVudC50YXJnZXQgYXMgQWN0aW9uO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWdtZW50ID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VnbWVudCA9PT0gJ0AkdWk1Lm92ZXJsb2FkJyB8fCBzZWdtZW50ID09PSAnMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlZ21lbnQgPT09ICckUGFyYW1ldGVyJyAmJiB0aGlzRWxlbWVudC5pc0JvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IHRoaXNFbGVtZW50LnBhcmFtZXRlcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNFbGVtZW50LnBhcmFtZXRlcnNbc2VnbWVudCBhcyBhbnldID8/XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzRWxlbWVudC5wYXJhbWV0ZXJzLmZpbmQoKHBhcmFtOiBBY3Rpb25QYXJhbWV0ZXIpID0+IHBhcmFtLm5hbWUgPT09IHNlZ21lbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQgPSBuZXh0RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhc2UgJ1Byb3BlcnR5JzpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGhpc0VsZW1lbnQgPSBjdXJyZW50LnRhcmdldCBhcyBQcm9wZXJ0eTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvcGVydHkgb3IgTmF2aWdhdGlvblByb3BlcnR5IG9mIHRoZSBDb21wbGV4VHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IHRoaXNFbGVtZW50LnRhcmdldFR5cGUgYXMgQ29tcGxleFR5cGUgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0eXBlLnByb3BlcnRpZXMuYnlfbmFtZShzZWdtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQgPSBwcm9wZXJ0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmF2aWdhdGlvblByb3BlcnR5ID0gdHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcy5ieV9uYW1lKHNlZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYXZpZ2F0aW9uUHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQgPSBuYXZpZ2F0aW9uUHJvcGVydHk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ0FjdGlvblBhcmFtZXRlcic6XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZWRUeXBlID0gKGN1cnJlbnQudGFyZ2V0IGFzIEFjdGlvblBhcmFtZXRlcikudHlwZVJlZmVyZW5jZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZmVyZW5jZWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc29sdmVUYXJnZXQoY29udmVydGVyLCByZWZlcmVuY2VkVHlwZSwgc2VnbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IHJlc3VsdC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Lm9iamVjdFBhdGggPSByZXN1bHQub2JqZWN0UGF0aC5yZWR1Y2UoYXBwZW5kT2JqZWN0UGF0aCwgY3VycmVudC5vYmplY3RQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnTmF2aWdhdGlvblByb3BlcnR5JzpcbiAgICAgICAgICAgICAgICAgICAgLy8gY29udGludWUgYXQgdGhlIE5hdmlnYXRpb25Qcm9wZXJ0eSdzIHRhcmdldCB0eXBlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc29sdmVUYXJnZXQoY29udmVydGVyLCAoY3VycmVudC50YXJnZXQgYXMgTmF2aWdhdGlvblByb3BlcnR5KS50YXJnZXRUeXBlLCBzZWdtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQgPSByZXN1bHQudGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Lm9iamVjdFBhdGggPSByZXN1bHQub2JqZWN0UGF0aC5yZWR1Y2UoYXBwZW5kT2JqZWN0UGF0aCwgY3VycmVudC5vYmplY3RQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VnbWVudCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQudGFyZ2V0W3NlZ21lbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IGN1cnJlbnQudGFyZ2V0W3NlZ21lbnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5vYmplY3RQYXRoID0gYXBwZW5kT2JqZWN0UGF0aChjdXJyZW50Lm9iamVjdFBhdGgsIGN1cnJlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgICAgICAgICBgRWxlbWVudCAnJHtzZWdtZW50fScgbm90IGZvdW5kIGF0ICR7Y3VycmVudC50YXJnZXQuX3R5cGV9ICcke2N1cnJlbnQudGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZX0nYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyB0YXJnZXQ6IHN0YXJ0RWxlbWVudCwgb2JqZWN0UGF0aDogW10sIG1lc3NhZ2VzOiBbXSB9XG4gICAgKTtcblxuICAgIC8vIERpYWdub3N0aWNzXG4gICAgcmVzdWx0Lm1lc3NhZ2VzLmZvckVhY2goKG1lc3NhZ2UpID0+IGNvbnZlcnRlci5sb2dFcnJvcihtZXNzYWdlLm1lc3NhZ2UpKTtcbiAgICBpZiAoIXJlc3VsdC50YXJnZXQpIHtcbiAgICAgICAgaWYgKGFubm90YXRpb25zVGVybSkge1xuICAgICAgICAgICAgY29uc3QgYW5ub3RhdGlvblR5cGUgPSBpbmZlclR5cGVGcm9tVGVybShjb252ZXJ0ZXIsIGFubm90YXRpb25zVGVybSwgc3RhcnRFbGVtZW50LmZ1bGx5UXVhbGlmaWVkTmFtZSk7XG4gICAgICAgICAgICBjb252ZXJ0ZXIubG9nRXJyb3IoXG4gICAgICAgICAgICAgICAgJ1VuYWJsZSB0byByZXNvbHZlIHRoZSBwYXRoIGV4cHJlc3Npb246ICcgK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgIHBhdGggK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJ0hpbnQ6IENoZWNrIGFuZCBjb3JyZWN0IHRoZSBwYXRoIHZhbHVlcyB1bmRlciB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZSBpbiB0aGUgbWV0YWRhdGEgKGFubm90YXRpb24ueG1sIGZpbGUgb3IgQ0RTIGFubm90YXRpb25zIGZvciB0aGUgYXBwbGljYXRpb24pOiBcXG5cXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxBbm5vdGF0aW9uIFRlcm0gPSAnICtcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnNUZXJtICtcbiAgICAgICAgICAgICAgICAgICAgJz4nICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnPFJlY29yZCBUeXBlID0gJyArXG4gICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25UeXBlICtcbiAgICAgICAgICAgICAgICAgICAgJz4nICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnPEFubm90YXRpb25QYXRoID0gJyArXG4gICAgICAgICAgICAgICAgICAgIHBhdGggK1xuICAgICAgICAgICAgICAgICAgICAnPidcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb252ZXJ0ZXIubG9nRXJyb3IoXG4gICAgICAgICAgICAgICAgJ1VuYWJsZSB0byByZXNvbHZlIHRoZSBwYXRoIGV4cHJlc3Npb246ICcgK1xuICAgICAgICAgICAgICAgICAgICBwYXRoICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICdIaW50OiBDaGVjayBhbmQgY29ycmVjdCB0aGUgcGF0aCB2YWx1ZXMgdW5kZXIgdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmUgaW4gdGhlIG1ldGFkYXRhIChhbm5vdGF0aW9uLnhtbCBmaWxlIG9yIENEUyBhbm5vdGF0aW9ucyBmb3IgdGhlIGFwcGxpY2F0aW9uKTogXFxuXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICc8QW5ub3RhdGlvbiBUZXJtID0gJyArXG4gICAgICAgICAgICAgICAgICAgIHBhdGhTZWdtZW50c1swXSArXG4gICAgICAgICAgICAgICAgICAgICc+JyArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxQcm9wZXJ0eVZhbHVlICBQYXRoPSAnICtcbiAgICAgICAgICAgICAgICAgICAgcGF0aFNlZ21lbnRzWzFdICtcbiAgICAgICAgICAgICAgICAgICAgJz4nXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUeXBlZ3VhcmQgdG8gY2hlY2sgaWYgdGhlIHBhdGggY29udGFpbnMgYW4gYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gcGF0aFN0ciB0aGUgcGF0aCB0byBldmFsdWF0ZVxuICogQHJldHVybnMgdHJ1ZSBpZiB0aGVyZSBpcyBhbiBhbm5vdGF0aW9uIGluIHRoZSBwYXRoLlxuICovXG5mdW5jdGlvbiBpc0Fubm90YXRpb25QYXRoKHBhdGhTdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBwYXRoU3RyLmluY2x1ZGVzKCdAJyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVmFsdWUoXG4gICAgY29udmVydGVyOiBDb252ZXJ0ZXIsXG4gICAgY3VycmVudFRhcmdldDogYW55LFxuICAgIGN1cnJlbnRUZXJtOiBzdHJpbmcsXG4gICAgY3VycmVudFByb3BlcnR5OiBzdHJpbmcsXG4gICAgY3VycmVudFNvdXJjZTogc3RyaW5nLFxuICAgIHByb3BlcnR5VmFsdWU6IEV4cHJlc3Npb24sXG4gICAgdmFsdWVGUU46IHN0cmluZ1xuKSB7XG4gICAgaWYgKHByb3BlcnR5VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBzd2l0Y2ggKHByb3BlcnR5VmFsdWUudHlwZSkge1xuICAgICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5VmFsdWUuU3RyaW5nO1xuICAgICAgICBjYXNlICdJbnQnOlxuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5VmFsdWUuSW50O1xuICAgICAgICBjYXNlICdCb29sJzpcbiAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eVZhbHVlLkJvb2w7XG4gICAgICAgIGNhc2UgJ0RlY2ltYWwnOlxuICAgICAgICAgICAgcmV0dXJuIERlY2ltYWwocHJvcGVydHlWYWx1ZS5EZWNpbWFsKTtcbiAgICAgICAgY2FzZSAnRGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZS5EYXRlO1xuICAgICAgICBjYXNlICdFbnVtTWVtYmVyJzpcbiAgICAgICAgICAgIGNvbnN0IGFsaWFzZWRFbnVtID0gY29udmVydGVyLmFsaWFzKHByb3BlcnR5VmFsdWUuRW51bU1lbWJlcik7XG4gICAgICAgICAgICBjb25zdCBzcGxpdEVudW0gPSBhbGlhc2VkRW51bS5zcGxpdCgnICcpO1xuICAgICAgICAgICAgaWYgKHNwbGl0RW51bVswXSAmJiBFbnVtSXNGbGFnW3N1YnN0cmluZ0JlZm9yZUZpcnN0KHNwbGl0RW51bVswXSwgJy8nKV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRFbnVtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFsaWFzZWRFbnVtO1xuXG4gICAgICAgIGNhc2UgJ1Byb3BlcnR5UGF0aCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wZXJ0eVZhbHVlLlByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IHZhbHVlRlFOLFxuICAgICAgICAgICAgICAgICR0YXJnZXQ6IHJlc29sdmVUYXJnZXQoY29udmVydGVyLCBjdXJyZW50VGFyZ2V0LCBwcm9wZXJ0eVZhbHVlLlByb3BlcnR5UGF0aCwgY3VycmVudFRlcm0pLnRhcmdldCxcbiAgICAgICAgICAgICAgICBbQU5OT1RBVElPTl9UQVJHRVRdOiBjdXJyZW50VGFyZ2V0XG4gICAgICAgICAgICB9O1xuICAgICAgICBjYXNlICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wZXJ0eVZhbHVlLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsXG4gICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiB2YWx1ZUZRTixcbiAgICAgICAgICAgICAgICAkdGFyZ2V0OiByZXNvbHZlVGFyZ2V0KGNvbnZlcnRlciwgY3VycmVudFRhcmdldCwgcHJvcGVydHlWYWx1ZS5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBjdXJyZW50VGVybSlcbiAgICAgICAgICAgICAgICAgICAgLnRhcmdldCxcbiAgICAgICAgICAgICAgICBbQU5OT1RBVElPTl9UQVJHRVRdOiBjdXJyZW50VGFyZ2V0XG4gICAgICAgICAgICB9O1xuICAgICAgICBjYXNlICdBbm5vdGF0aW9uUGF0aCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb3BlcnR5VmFsdWUuQW5ub3RhdGlvblBhdGgsXG4gICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiB2YWx1ZUZRTixcbiAgICAgICAgICAgICAgICAkdGFyZ2V0OiByZXNvbHZlVGFyZ2V0KFxuICAgICAgICAgICAgICAgICAgICBjb252ZXJ0ZXIsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQsXG4gICAgICAgICAgICAgICAgICAgIGNvbnZlcnRlci51bmFsaWFzKHByb3BlcnR5VmFsdWUuQW5ub3RhdGlvblBhdGgpLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGVybVxuICAgICAgICAgICAgICAgICkudGFyZ2V0LFxuICAgICAgICAgICAgICAgIGFubm90YXRpb25zVGVybTogY3VycmVudFRlcm0sXG4gICAgICAgICAgICAgICAgdGVybTogJycsXG4gICAgICAgICAgICAgICAgcGF0aDogJycsXG4gICAgICAgICAgICAgICAgW0FOTk9UQVRJT05fVEFSR0VUXTogY3VycmVudFRhcmdldFxuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSAnUGF0aCc6XG4gICAgICAgICAgICBjb25zdCAkdGFyZ2V0ID0gcmVzb2x2ZVRhcmdldChjb252ZXJ0ZXIsIGN1cnJlbnRUYXJnZXQsIHByb3BlcnR5VmFsdWUuUGF0aCwgY3VycmVudFRlcm0pLnRhcmdldDtcbiAgICAgICAgICAgIGlmIChpc0Fubm90YXRpb25QYXRoKHByb3BlcnR5VmFsdWUuUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAvLyBpbmxpbmUgdGhlIHRhcmdldFxuICAgICAgICAgICAgICAgIHJldHVybiAkdGFyZ2V0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUGF0aCcsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHByb3BlcnR5VmFsdWUuUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiB2YWx1ZUZRTixcbiAgICAgICAgICAgICAgICAgICAgJHRhcmdldDogJHRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgW0FOTk9UQVRJT05fVEFSR0VUXTogY3VycmVudFRhcmdldFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAnUmVjb3JkJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVJlY29yZChcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZXIsXG4gICAgICAgICAgICAgICAgY3VycmVudFRlcm0sXG4gICAgICAgICAgICAgICAgY3VycmVudFRhcmdldCxcbiAgICAgICAgICAgICAgICBjdXJyZW50UHJvcGVydHksXG4gICAgICAgICAgICAgICAgY3VycmVudFNvdXJjZSxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlLlJlY29yZCxcbiAgICAgICAgICAgICAgICB2YWx1ZUZRTlxuICAgICAgICAgICAgKTtcbiAgICAgICAgY2FzZSAnQ29sbGVjdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VDb2xsZWN0aW9uKFxuICAgICAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUZXJtLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICBjdXJyZW50U291cmNlLFxuICAgICAgICAgICAgICAgIHByb3BlcnR5VmFsdWUuQ29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICB2YWx1ZUZRTlxuICAgICAgICAgICAgKTtcbiAgICAgICAgY2FzZSAnQXBwbHknOlxuICAgICAgICBjYXNlICdOdWxsJzpcbiAgICAgICAgY2FzZSAnTm90JzpcbiAgICAgICAgY2FzZSAnRXEnOlxuICAgICAgICBjYXNlICdOZSc6XG4gICAgICAgIGNhc2UgJ0d0JzpcbiAgICAgICAgY2FzZSAnR2UnOlxuICAgICAgICBjYXNlICdMdCc6XG4gICAgICAgIGNhc2UgJ0xlJzpcbiAgICAgICAgY2FzZSAnSWYnOlxuICAgICAgICBjYXNlICdBbmQnOlxuICAgICAgICBjYXNlICdPcic6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZTtcbiAgICB9XG59XG5cbi8qKlxuICogSW5mZXIgdGhlIHR5cGUgb2YgYSB0ZXJtIGJhc2VkIG9uIGl0cyB0eXBlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXIgICAgICAgICBDb252ZXJ0ZXJcbiAqIEBwYXJhbSBhbm5vdGF0aW9uc1Rlcm0gICBUaGUgYW5ub3RhdGlvbiB0ZXJtXG4gKiBAcGFyYW0gYW5ub3RhdGlvblRhcmdldCAgVGhlIGFubm90YXRpb24gdGFyZ2V0XG4gKiBAcGFyYW0gY3VycmVudFByb3BlcnR5ICAgVGhlIGN1cnJlbnQgcHJvcGVydHkgb2YgdGhlIHJlY29yZFxuICogQHJldHVybnMgVGhlIGluZmVycmVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGluZmVyVHlwZUZyb21UZXJtKFxuICAgIGNvbnZlcnRlcjogQ29udmVydGVyLFxuICAgIGFubm90YXRpb25zVGVybTogc3RyaW5nLFxuICAgIGFubm90YXRpb25UYXJnZXQ6IHN0cmluZyxcbiAgICBjdXJyZW50UHJvcGVydHk/OiBzdHJpbmdcbikge1xuICAgIGxldCB0YXJnZXRUeXBlID0gKFRlcm1Ub1R5cGVzIGFzIGFueSlbYW5ub3RhdGlvbnNUZXJtXTtcbiAgICBpZiAoY3VycmVudFByb3BlcnR5KSB7XG4gICAgICAgIGFubm90YXRpb25zVGVybSA9IGAke3N1YnN0cmluZ0JlZm9yZUxhc3QoYW5ub3RhdGlvbnNUZXJtLCAnLicpfS4ke2N1cnJlbnRQcm9wZXJ0eX1gO1xuICAgICAgICB0YXJnZXRUeXBlID0gKFRlcm1Ub1R5cGVzIGFzIGFueSlbYW5ub3RhdGlvbnNUZXJtXTtcbiAgICB9XG5cbiAgICBjb252ZXJ0ZXIubG9nRXJyb3IoXG4gICAgICAgIGBUaGUgdHlwZSBvZiB0aGUgcmVjb3JkIHVzZWQgd2l0aGluIHRoZSB0ZXJtICR7YW5ub3RhdGlvbnNUZXJtfSB3YXMgbm90IGRlZmluZWQgYW5kIHdhcyBpbmZlcnJlZCBhcyAke3RhcmdldFR5cGV9LlxuSGludDogSWYgcG9zc2libGUsIHRyeSB0byBtYWludGFpbiB0aGUgVHlwZSBwcm9wZXJ0eSBmb3IgZWFjaCBSZWNvcmQuXG48QW5ub3RhdGlvbnMgVGFyZ2V0PVwiJHthbm5vdGF0aW9uVGFyZ2V0fVwiPlxuXHQ8QW5ub3RhdGlvbiBUZXJtPVwiJHthbm5vdGF0aW9uc1Rlcm19XCI+XG5cdFx0PFJlY29yZD4uLi48L1JlY29yZD5cblx0PC9Bbm5vdGF0aW9uPlxuPC9Bbm5vdGF0aW9ucz5gXG4gICAgKTtcblxuICAgIHJldHVybiB0YXJnZXRUeXBlO1xufVxuXG5mdW5jdGlvbiBpc0RhdGFGaWVsZFdpdGhGb3JBY3Rpb24oYW5ub3RhdGlvbkNvbnRlbnQ6IGFueSkge1xuICAgIHJldHVybiAoXG4gICAgICAgIGFubm90YXRpb25Db250ZW50Lmhhc093blByb3BlcnR5KCdBY3Rpb24nKSAmJlxuICAgICAgICAoYW5ub3RhdGlvbkNvbnRlbnQuJFR5cGUgPT09ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb24nIHx8XG4gICAgICAgICAgICBhbm5vdGF0aW9uQ29udGVudC4kVHlwZSA9PT0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb24nKVxuICAgICk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUmVjb3JkVHlwZShcbiAgICBjb252ZXJ0ZXI6IENvbnZlcnRlcixcbiAgICBjdXJyZW50VGVybTogc3RyaW5nLFxuICAgIGN1cnJlbnRUYXJnZXQ6IGFueSxcbiAgICBjdXJyZW50UHJvcGVydHk6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICByZWNvcmREZWZpbml0aW9uOiBBbm5vdGF0aW9uUmVjb3JkXG4pIHtcbiAgICBsZXQgdGFyZ2V0VHlwZTtcbiAgICBpZiAoIXJlY29yZERlZmluaXRpb24udHlwZSAmJiBjdXJyZW50VGVybSkge1xuICAgICAgICB0YXJnZXRUeXBlID0gaW5mZXJUeXBlRnJvbVRlcm0oY29udmVydGVyLCBjdXJyZW50VGVybSwgY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUsIGN1cnJlbnRQcm9wZXJ0eSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0VHlwZSA9IGNvbnZlcnRlci51bmFsaWFzKHJlY29yZERlZmluaXRpb24udHlwZSk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRUeXBlO1xufVxuXG5mdW5jdGlvbiBwYXJzZVJlY29yZChcbiAgICBjb252ZXJ0ZXI6IENvbnZlcnRlcixcbiAgICBjdXJyZW50VGVybTogc3RyaW5nLFxuICAgIGN1cnJlbnRUYXJnZXQ6IGFueSxcbiAgICBjdXJyZW50UHJvcGVydHk6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBjdXJyZW50U291cmNlOiBzdHJpbmcsXG4gICAgYW5ub3RhdGlvblJlY29yZDogQW5ub3RhdGlvblJlY29yZCxcbiAgICBjdXJyZW50RlFOOiBzdHJpbmdcbikge1xuICAgIGNvbnN0IGFubm90YXRpb25UZXJtOiBhbnkgPSB7XG4gICAgICAgICRUeXBlOiBwYXJzZVJlY29yZFR5cGUoY29udmVydGVyLCBjdXJyZW50VGVybSwgY3VycmVudFRhcmdldCwgY3VycmVudFByb3BlcnR5LCBhbm5vdGF0aW9uUmVjb3JkKSxcbiAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBjdXJyZW50RlFOLFxuICAgICAgICBbQU5OT1RBVElPTl9UQVJHRVRdOiBjdXJyZW50VGFyZ2V0XG4gICAgfTtcblxuICAgIC8vIGFubm90YXRpb25zIG9uIHRoZSByZWNvcmRcbiAgICBsYXp5KGFubm90YXRpb25UZXJtLCAnYW5ub3RhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIC8vIGJlIGdyYWNlZnVsIHdoZW4gcmVzb2x2aW5nIGFubm90YXRpb25zIG9uIGFubm90YXRpb25zOiBTb21ldGltZXMgdGhleSBhcmUgcmVmZXJlbmNlZCBkaXJlY3RseSwgc29tZXRpbWVzIHRoZXlcbiAgICAgICAgLy8gYXJlIHBhcnQgb2YgdGhlIGdsb2JhbCBhbm5vdGF0aW9ucyBsaXN0XG4gICAgICAgIGxldCBhbm5vdGF0aW9ucztcbiAgICAgICAgaWYgKGFubm90YXRpb25SZWNvcmQuYW5ub3RhdGlvbnMgJiYgYW5ub3RhdGlvblJlY29yZC5hbm5vdGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhbm5vdGF0aW9ucyA9IGFubm90YXRpb25SZWNvcmQuYW5ub3RhdGlvbnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbm5vdGF0aW9ucyA9IGNvbnZlcnRlci5yYXdBbm5vdGF0aW9uc1BlclRhcmdldFtjdXJyZW50RlFOXT8uYW5ub3RhdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICBhbm5vdGF0aW9ucz8uZm9yRWFjaCgoYW5ub3RhdGlvbjogYW55KSA9PiB7XG4gICAgICAgICAgICBhbm5vdGF0aW9uLnRhcmdldCA9IGN1cnJlbnRGUU47XG4gICAgICAgICAgICBhbm5vdGF0aW9uLl9fc291cmNlID0gY3VycmVudFNvdXJjZTtcbiAgICAgICAgICAgIGFubm90YXRpb25bQU5OT1RBVElPTl9UQVJHRVRdID0gY3VycmVudFRhcmdldDtcbiAgICAgICAgICAgIGFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lID0gYCR7Y3VycmVudEZRTn1AJHthbm5vdGF0aW9uLnRlcm19YDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFubm90YXRpb25zT2JqZWN0KGNvbnZlcnRlciwgYW5ub3RhdGlvblRlcm0sIGFubm90YXRpb25zID8/IFtdKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGFubm90YXRpb25Db250ZW50ID0gYW5ub3RhdGlvblJlY29yZC5wcm9wZXJ0eVZhbHVlcz8ucmVkdWNlKChhbm5vdGF0aW9uQ29udGVudCwgcHJvcGVydHlWYWx1ZSkgPT4ge1xuICAgICAgICBsYXp5KGFubm90YXRpb25Db250ZW50LCBwcm9wZXJ0eVZhbHVlLm5hbWUsICgpID0+XG4gICAgICAgICAgICBwYXJzZVZhbHVlKFxuICAgICAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUZXJtLFxuICAgICAgICAgICAgICAgIHByb3BlcnR5VmFsdWUubmFtZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50U291cmNlLFxuICAgICAgICAgICAgICAgIHByb3BlcnR5VmFsdWUudmFsdWUsXG4gICAgICAgICAgICAgICAgYCR7Y3VycmVudEZRTn0vJHtwcm9wZXJ0eVZhbHVlLm5hbWV9YFxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBhbm5vdGF0aW9uQ29udGVudDtcbiAgICB9LCBhbm5vdGF0aW9uVGVybSk7XG5cbiAgICBpZiAoaXNEYXRhRmllbGRXaXRoRm9yQWN0aW9uKGFubm90YXRpb25Db250ZW50KSkge1xuICAgICAgICBsYXp5KGFubm90YXRpb25Db250ZW50LCAnQWN0aW9uVGFyZ2V0JywgKCkgPT4ge1xuICAgICAgICAgICAgLy8gdHJ5IHRvIHJlc29sdmUgdG8gYSBib3VuZCBhY3Rpb24gb2YgdGhlIGFubm90YXRpb24gdGFyZ2V0XG4gICAgICAgICAgICBsZXQgYWN0aW9uVGFyZ2V0ID0gY3VycmVudFRhcmdldC5hY3Rpb25zPy5bYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uXTtcblxuICAgICAgICAgICAgaWYgKCFhY3Rpb25UYXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBhIGNvcnJlc3BvbmRpbmcgdW5ib3VuZCBhY3Rpb25cbiAgICAgICAgICAgICAgICBhY3Rpb25UYXJnZXQgPSBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkQWN0aW9uSW1wb3J0KGFubm90YXRpb25Db250ZW50LkFjdGlvbik/LmFjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFhY3Rpb25UYXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBhIGNvcnJlc3BvbmRpbmcgYm91bmQgKCEpIGFjdGlvblxuICAgICAgICAgICAgICAgIGFjdGlvblRhcmdldCA9IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRBY3Rpb24oYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uKTtcbiAgICAgICAgICAgICAgICBpZiAoIWFjdGlvblRhcmdldD8uaXNCb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25UYXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWFjdGlvblRhcmdldCkge1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlci5sb2dFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFVuYWJsZSB0byByZXNvbHZlIHRoZSBhY3Rpb24gJyR7YW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9ufScgZGVmaW5lZCBmb3IgJyR7YW5ub3RhdGlvblRlcm0uZnVsbHlRdWFsaWZpZWROYW1lfSdgXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY3Rpb25UYXJnZXQ7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYW5ub3RhdGlvbkNvbnRlbnQ7XG59XG5cbmV4cG9ydCB0eXBlIENvbGxlY3Rpb25UeXBlID1cbiAgICB8ICdQcm9wZXJ0eVBhdGgnXG4gICAgfCAnUGF0aCdcbiAgICB8ICdJZidcbiAgICB8ICdBcHBseSdcbiAgICB8ICdOdWxsJ1xuICAgIHwgJ0FuZCdcbiAgICB8ICdFcSdcbiAgICB8ICdOZSdcbiAgICB8ICdOb3QnXG4gICAgfCAnR3QnXG4gICAgfCAnR2UnXG4gICAgfCAnTHQnXG4gICAgfCAnTGUnXG4gICAgfCAnT3InXG4gICAgfCAnQW5ub3RhdGlvblBhdGgnXG4gICAgfCAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCdcbiAgICB8ICdSZWNvcmQnXG4gICAgfCAnU3RyaW5nJ1xuICAgIHwgJ0VtcHR5Q29sbGVjdGlvbic7XG5cbi8qKlxuICogUmV0cmlldmUgb3IgaW5mZXIgdGhlIGNvbGxlY3Rpb24gdHlwZSBiYXNlZCBvbiBpdHMgY29udGVudC5cbiAqXG4gKiBAcGFyYW0gY29sbGVjdGlvbkRlZmluaXRpb25cbiAqIEByZXR1cm5zIHRoZSB0eXBlIG9mIHRoZSBjb2xsZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldE9ySW5mZXJDb2xsZWN0aW9uVHlwZShjb2xsZWN0aW9uRGVmaW5pdGlvbjogYW55W10pOiBDb2xsZWN0aW9uVHlwZSB7XG4gICAgbGV0IHR5cGU6IENvbGxlY3Rpb25UeXBlID0gKGNvbGxlY3Rpb25EZWZpbml0aW9uIGFzIGFueSkudHlwZTtcbiAgICBpZiAodHlwZSA9PT0gdW5kZWZpbmVkICYmIGNvbGxlY3Rpb25EZWZpbml0aW9uLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZmlyc3RDb2xJdGVtID0gY29sbGVjdGlvbkRlZmluaXRpb25bMF07XG4gICAgICAgIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ1Byb3BlcnR5UGF0aCcpKSB7XG4gICAgICAgICAgICB0eXBlID0gJ1Byb3BlcnR5UGF0aCc7XG4gICAgICAgIH0gZWxzZSBpZiAoZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCdQYXRoJykpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnUGF0aCc7XG4gICAgICAgIH0gZWxzZSBpZiAoZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCdBbm5vdGF0aW9uUGF0aCcpKSB7XG4gICAgICAgICAgICB0eXBlID0gJ0Fubm90YXRpb25QYXRoJztcbiAgICAgICAgfSBlbHNlIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnKSkge1xuICAgICAgICAgICAgdHlwZSA9ICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJztcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIHR5cGVvZiBmaXJzdENvbEl0ZW0gPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAoZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCd0eXBlJykgfHwgZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCdwcm9wZXJ0eVZhbHVlcycpKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHR5cGUgPSAnUmVjb3JkJztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZmlyc3RDb2xJdGVtID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdHlwZSA9ICdTdHJpbmcnO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdHlwZSA9ICdFbXB0eUNvbGxlY3Rpb24nO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VDb2xsZWN0aW9uKFxuICAgIGNvbnZlcnRlcjogQ29udmVydGVyLFxuICAgIGN1cnJlbnRUYXJnZXQ6IGFueSxcbiAgICBjdXJyZW50VGVybTogc3RyaW5nLFxuICAgIGN1cnJlbnRQcm9wZXJ0eTogc3RyaW5nLFxuICAgIGN1cnJlbnRTb3VyY2U6IHN0cmluZyxcbiAgICBjb2xsZWN0aW9uRGVmaW5pdGlvbjogYW55W10sXG4gICAgcGFyZW50RlFOOiBzdHJpbmdcbikge1xuICAgIGNvbnN0IGNvbGxlY3Rpb25EZWZpbml0aW9uVHlwZSA9IGdldE9ySW5mZXJDb2xsZWN0aW9uVHlwZShjb2xsZWN0aW9uRGVmaW5pdGlvbik7XG5cbiAgICBzd2l0Y2ggKGNvbGxlY3Rpb25EZWZpbml0aW9uVHlwZSkge1xuICAgICAgICBjYXNlICdQcm9wZXJ0eVBhdGgnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgocHJvcGVydHlQYXRoLCBwcm9wZXJ0eUlkeCk6IFByb3BlcnR5UGF0aCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBQcm9wZXJ0eVBhdGggPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcGVydHlQYXRoLlByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtwYXJlbnRGUU59LyR7cHJvcGVydHlJZHh9YFxuICAgICAgICAgICAgICAgIH0gYXMgYW55O1xuXG4gICAgICAgICAgICAgICAgbGF6eShcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAnJHRhcmdldCcsXG4gICAgICAgICAgICAgICAgICAgICgpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlVGFyZ2V0PFByb3BlcnR5Pihjb252ZXJ0ZXIsIGN1cnJlbnRUYXJnZXQsIHByb3BlcnR5UGF0aC5Qcm9wZXJ0eVBhdGgsIGN1cnJlbnRUZXJtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50YXJnZXQgPz8gKHt9IGFzIFByb3BlcnR5KSAvLyBUT0RPOiAkdGFyZ2V0IGlzIG1hbmRhdG9yeSAtIHRocm93IGFuIGVycm9yP1xuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY2FzZSAnUGF0aCc6XG4gICAgICAgICAgICAvLyBUT0RPOiBtYWtlIGxhenk/XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChwYXRoVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZVRhcmdldChjb252ZXJ0ZXIsIGN1cnJlbnRUYXJnZXQsIHBhdGhWYWx1ZS5QYXRoLCBjdXJyZW50VGVybSkudGFyZ2V0O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY2FzZSAnQW5ub3RhdGlvblBhdGgnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgoYW5ub3RhdGlvblBhdGgsIGFubm90YXRpb25JZHgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhbm5vdGF0aW9uUGF0aC5Bbm5vdGF0aW9uUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtwYXJlbnRGUU59LyR7YW5ub3RhdGlvbklkeH1gLFxuICAgICAgICAgICAgICAgICAgICBhbm5vdGF0aW9uc1Rlcm06IGN1cnJlbnRUZXJtLFxuICAgICAgICAgICAgICAgICAgICB0ZXJtOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJydcbiAgICAgICAgICAgICAgICB9IGFzIGFueTtcblxuICAgICAgICAgICAgICAgIGxhenkoXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgJyR0YXJnZXQnLFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiByZXNvbHZlVGFyZ2V0KGNvbnZlcnRlciwgY3VycmVudFRhcmdldCwgYW5ub3RhdGlvblBhdGguQW5ub3RhdGlvblBhdGgsIGN1cnJlbnRUZXJtKS50YXJnZXRcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNhc2UgJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgobmF2UHJvcGVydHlQYXRoLCBuYXZQcm9wSWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmF2aWdhdGlvblByb3BlcnR5UGF0aCA9IG5hdlByb3BlcnR5UGF0aC5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoID8/ICcnO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbmF2aWdhdGlvblByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtwYXJlbnRGUU59LyR7bmF2UHJvcElkeH1gXG4gICAgICAgICAgICAgICAgfSBhcyBhbnk7XG5cbiAgICAgICAgICAgICAgICBpZiAobmF2aWdhdGlvblByb3BlcnR5UGF0aCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LiR0YXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGF6eShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICckdGFyZ2V0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHJlc29sdmVUYXJnZXQoY29udmVydGVyLCBjdXJyZW50VGFyZ2V0LCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBjdXJyZW50VGVybSkudGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNhc2UgJ1JlY29yZCc6XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChyZWNvcmREZWZpbml0aW9uLCByZWNvcmRJZHgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VSZWNvcmQoXG4gICAgICAgICAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRlcm0sXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgcmVjb3JkRGVmaW5pdGlvbixcbiAgICAgICAgICAgICAgICAgICAgYCR7cGFyZW50RlFOfS8ke3JlY29yZElkeH1gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNhc2UgJ0FwcGx5JzpcbiAgICAgICAgY2FzZSAnTnVsbCc6XG4gICAgICAgIGNhc2UgJ0lmJzpcbiAgICAgICAgY2FzZSAnRXEnOlxuICAgICAgICBjYXNlICdOZSc6XG4gICAgICAgIGNhc2UgJ0x0JzpcbiAgICAgICAgY2FzZSAnR3QnOlxuICAgICAgICBjYXNlICdMZSc6XG4gICAgICAgIGNhc2UgJ0dlJzpcbiAgICAgICAgY2FzZSAnTm90JzpcbiAgICAgICAgY2FzZSAnQW5kJzpcbiAgICAgICAgY2FzZSAnT3InOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgoaWZWYWx1ZSkgPT4gaWZWYWx1ZSk7XG5cbiAgICAgICAgY2FzZSAnU3RyaW5nJzpcbiAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uRGVmaW5pdGlvbi5tYXAoKHN0cmluZ1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdHJpbmdWYWx1ZSA9PT0gJ3N0cmluZycgfHwgc3RyaW5nVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ1ZhbHVlLlN0cmluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25EZWZpbml0aW9uLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgY2FzZScpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNWNE5hdmlnYXRpb25Qcm9wZXJ0eShcbiAgICBuYXZQcm9wOiBSYXdWMk5hdmlnYXRpb25Qcm9wZXJ0eSB8IFJhd1Y0TmF2aWdhdGlvblByb3BlcnR5XG4pOiBuYXZQcm9wIGlzIFJhd1Y0TmF2aWdhdGlvblByb3BlcnR5IHtcbiAgICByZXR1cm4gISEobmF2UHJvcCBhcyBCYXNlTmF2aWdhdGlvblByb3BlcnR5KS50YXJnZXRUeXBlTmFtZTtcbn1cblxuLyoqXG4gKiBTcGxpdCB0aGUgYWxpYXMgZnJvbSB0aGUgdGVybSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgY3VycmVudCBzZXQgb2YgcmVmZXJlbmNlc1xuICogQHBhcmFtIHRlcm1WYWx1ZSB0aGUgdmFsdWUgb2YgdGhlIHRlcm1cbiAqIEByZXR1cm5zIHRoZSB0ZXJtIGFsaWFzIGFuZCB0aGUgYWN0dWFsIHRlcm0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gc3BsaXRUZXJtKHJlZmVyZW5jZXM6IFJlZmVyZW5jZXNXaXRoTWFwLCB0ZXJtVmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiBzcGxpdEF0TGFzdChhbGlhcyhyZWZlcmVuY2VzLCB0ZXJtVmFsdWUpLCAnLicpO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0QW5ub3RhdGlvbihjb252ZXJ0ZXI6IENvbnZlcnRlciwgdGFyZ2V0OiBhbnksIHJhd0Fubm90YXRpb246IFJhd0Fubm90YXRpb24pOiBBbm5vdGF0aW9uIHtcbiAgICBsZXQgYW5ub3RhdGlvbjogYW55O1xuICAgIGlmIChyYXdBbm5vdGF0aW9uLnJlY29yZCkge1xuICAgICAgICBhbm5vdGF0aW9uID0gcGFyc2VSZWNvcmQoXG4gICAgICAgICAgICBjb252ZXJ0ZXIsXG4gICAgICAgICAgICByYXdBbm5vdGF0aW9uLnRlcm0sXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICAnJyxcbiAgICAgICAgICAgIChyYXdBbm5vdGF0aW9uIGFzIGFueSkuX19zb3VyY2UsXG4gICAgICAgICAgICByYXdBbm5vdGF0aW9uLnJlY29yZCxcbiAgICAgICAgICAgIChyYXdBbm5vdGF0aW9uIGFzIGFueSkuZnVsbHlRdWFsaWZpZWROYW1lXG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChyYXdBbm5vdGF0aW9uLmNvbGxlY3Rpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhbm5vdGF0aW9uID0gcGFyc2VWYWx1ZShcbiAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHJhd0Fubm90YXRpb24udGVybSxcbiAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgKHJhd0Fubm90YXRpb24gYXMgYW55KS5fX3NvdXJjZSxcbiAgICAgICAgICAgIHJhd0Fubm90YXRpb24udmFsdWUgPz8geyB0eXBlOiAnQm9vbCcsIEJvb2w6IHRydWUgfSxcbiAgICAgICAgICAgIChyYXdBbm5vdGF0aW9uIGFzIGFueSkuZnVsbHlRdWFsaWZpZWROYW1lXG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChyYXdBbm5vdGF0aW9uLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgYW5ub3RhdGlvbiA9IHBhcnNlQ29sbGVjdGlvbihcbiAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHJhd0Fubm90YXRpb24udGVybSxcbiAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgKHJhd0Fubm90YXRpb24gYXMgYW55KS5fX3NvdXJjZSxcbiAgICAgICAgICAgIHJhd0Fubm90YXRpb24uY29sbGVjdGlvbixcbiAgICAgICAgICAgIChyYXdBbm5vdGF0aW9uIGFzIGFueSkuZnVsbHlRdWFsaWZpZWROYW1lXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBjYXNlJyk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlb2YgYW5ub3RhdGlvbikge1xuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy13cmFwcGVyc1xuICAgICAgICAgICAgYW5ub3RhdGlvbiA9IG5ldyBTdHJpbmcoYW5ub3RhdGlvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LXdyYXBwZXJzXG4gICAgICAgICAgICBhbm5vdGF0aW9uID0gbmV3IEJvb2xlYW4oYW5ub3RhdGlvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgIGFubm90YXRpb24gPSBuZXcgTnVtYmVyKGFubm90YXRpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSA9IChyYXdBbm5vdGF0aW9uIGFzIGFueSkuZnVsbHlRdWFsaWZpZWROYW1lO1xuICAgIGFubm90YXRpb25bQU5OT1RBVElPTl9UQVJHRVRdID0gdGFyZ2V0O1xuXG4gICAgY29uc3QgW3ZvY0FsaWFzLCB2b2NUZXJtXSA9IGNvbnZlcnRlci5zcGxpdFRlcm0ocmF3QW5ub3RhdGlvbi50ZXJtKTtcblxuICAgIGFubm90YXRpb24udGVybSA9IGNvbnZlcnRlci51bmFsaWFzKGAke3ZvY0FsaWFzfS4ke3ZvY1Rlcm19YCk7XG4gICAgYW5ub3RhdGlvbi5xdWFsaWZpZXIgPSByYXdBbm5vdGF0aW9uLnF1YWxpZmllcjtcbiAgICBhbm5vdGF0aW9uLl9fc291cmNlID0gKHJhd0Fubm90YXRpb24gYXMgYW55KS5fX3NvdXJjZTtcblxuICAgIHRyeSB7XG4gICAgICAgIGxhenkoYW5ub3RhdGlvbiwgJ2Fubm90YXRpb25zJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYW5ub3RhdGlvbkZRTiA9IGFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lO1xuXG4gICAgICAgICAgICAvLyBiZSBncmFjZWZ1bCB3aGVuIHJlc29sdmluZyBhbm5vdGF0aW9ucyBvbiBhbm5vdGF0aW9uczogU29tZXRpbWVzIHRoZXkgYXJlIHJlZmVyZW5jZWQgZGlyZWN0bHksIHNvbWV0aW1lcyB0aGV5XG4gICAgICAgICAgICAvLyBhcmUgcGFydCBvZiB0aGUgZ2xvYmFsIGFubm90YXRpb25zIGxpc3RcbiAgICAgICAgICAgIGxldCBhbm5vdGF0aW9ucztcbiAgICAgICAgICAgIGlmIChyYXdBbm5vdGF0aW9uLmFubm90YXRpb25zICYmIHJhd0Fubm90YXRpb24uYW5ub3RhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGFubm90YXRpb25zID0gcmF3QW5ub3RhdGlvbi5hbm5vdGF0aW9ucztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnMgPSBjb252ZXJ0ZXIucmF3QW5ub3RhdGlvbnNQZXJUYXJnZXRbYW5ub3RhdGlvbkZRTl0/LmFubm90YXRpb25zO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhbm5vdGF0aW9ucz8uZm9yRWFjaCgocmF3U3ViQW5ub3RhdGlvbjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgcmF3U3ViQW5ub3RhdGlvbi50YXJnZXQgPSBhbm5vdGF0aW9uRlFOO1xuICAgICAgICAgICAgICAgIHJhd1N1YkFubm90YXRpb24uX19zb3VyY2UgPSBhbm5vdGF0aW9uLl9fc291cmNlO1xuICAgICAgICAgICAgICAgIHJhd1N1YkFubm90YXRpb25bQU5OT1RBVElPTl9UQVJHRVRdID0gdGFyZ2V0O1xuICAgICAgICAgICAgICAgIHJhd1N1YkFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lID0gYCR7YW5ub3RhdGlvbkZRTn1AJHtyYXdTdWJBbm5vdGF0aW9uLnRlcm19YDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlQW5ub3RhdGlvbnNPYmplY3QoY29udmVydGVyLCBhbm5vdGF0aW9uLCBhbm5vdGF0aW9ucyA/PyBbXSk7XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gbm90IGFuIGVycm9yOiBwYXJzZVJlY29yZCgpIGFscmVhZHkgYWRkcyBhbm5vdGF0aW9ucywgYnV0IHRoZSBvdGhlciBwYXJzZVhYWCBmdW5jdGlvbnMgZG9uJ3QsIHNvIHRoaXMgY2FuIGhhcHBlblxuICAgIH1cblxuICAgIHJldHVybiBhbm5vdGF0aW9uIGFzIEFubm90YXRpb247XG59XG5cbmZ1bmN0aW9uIGdldEFubm90YXRpb25GUU4oY3VycmVudFRhcmdldE5hbWU6IHN0cmluZywgcmVmZXJlbmNlczogUmVmZXJlbmNlW10sIGFubm90YXRpb246IFJhd0Fubm90YXRpb24pIHtcbiAgICBjb25zdCBhbm5vdGF0aW9uRlFOID0gYCR7Y3VycmVudFRhcmdldE5hbWV9QCR7dW5hbGlhcyhyZWZlcmVuY2VzLCBhbm5vdGF0aW9uLnRlcm0pfWA7XG5cbiAgICBpZiAoYW5ub3RhdGlvbi5xdWFsaWZpZXIpIHtcbiAgICAgICAgcmV0dXJuIGAke2Fubm90YXRpb25GUU59IyR7YW5ub3RhdGlvbi5xdWFsaWZpZXJ9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYW5ub3RhdGlvbkZRTjtcbiAgICB9XG59XG5cbi8qKlxuICogTWVyZ2UgYW5ub3RhdGlvbiBmcm9tIGRpZmZlcmVudCBzb3VyY2UgdG9nZXRoZXIgYnkgb3ZlcndyaXRpbmcgYXQgdGhlIHRlcm0gbGV2ZWwuXG4gKlxuICogQHBhcmFtIHJhd01ldGFkYXRhXG4gKiBAcmV0dXJucyB0aGUgcmVzdWx0aW5nIG1lcmdlZCBhbm5vdGF0aW9uc1xuICovXG5mdW5jdGlvbiBtZXJnZUFubm90YXRpb25zKHJhd01ldGFkYXRhOiBSYXdNZXRhZGF0YSk6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0PiB7XG4gICAgY29uc3QgYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXQ6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0PiA9IHt9O1xuICAgIE9iamVjdC5rZXlzKHJhd01ldGFkYXRhLnNjaGVtYS5hbm5vdGF0aW9ucykuZm9yRWFjaCgoYW5ub3RhdGlvblNvdXJjZSkgPT4ge1xuICAgICAgICByYXdNZXRhZGF0YS5zY2hlbWEuYW5ub3RhdGlvbnNbYW5ub3RhdGlvblNvdXJjZV0uZm9yRWFjaCgoYW5ub3RhdGlvbkxpc3Q6IEFubm90YXRpb25MaXN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0TmFtZSA9IHVuYWxpYXMocmF3TWV0YWRhdGEucmVmZXJlbmNlcywgYW5ub3RhdGlvbkxpc3QudGFyZ2V0KSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAoYW5ub3RhdGlvbkxpc3QgYXMgYW55KS5fX3NvdXJjZSA9IGFubm90YXRpb25Tb3VyY2U7XG4gICAgICAgICAgICBpZiAoIWFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXSkge1xuICAgICAgICAgICAgICAgIGFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IGFubm90YXRpb25MaXN0LmFubm90YXRpb25zLm1hcCgoYW5ub3RhdGlvbjogUmF3QW5ub3RhdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgKGFubm90YXRpb24gYXMgQW5ub3RhdGlvbikuZnVsbHlRdWFsaWZpZWROYW1lID0gZ2V0QW5ub3RhdGlvbkZRTihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXdNZXRhZGF0YS5yZWZlcmVuY2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAoYW5ub3RhdGlvbiBhcyBhbnkpLl9fc291cmNlID0gYW5ub3RhdGlvblNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbm5vdGF0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBjdXJyZW50VGFyZ2V0TmFtZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgKGFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXSBhcyBhbnkpLl9fc291cmNlID0gYW5ub3RhdGlvblNvdXJjZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbkxpc3QuYW5ub3RhdGlvbnMuZm9yRWFjaCgoYW5ub3RhdGlvbjogUmF3QW5ub3RhdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kSW5kZXggPSBhbm5vdGF0aW9uTGlzdFBlclRhcmdldFtjdXJyZW50VGFyZ2V0TmFtZV0uYW5ub3RhdGlvbnMuZmluZEluZGV4KFxuICAgICAgICAgICAgICAgICAgICAgICAgKHJlZmVyZW5jZUFubm90YXRpb246IFJhd0Fubm90YXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VBbm5vdGF0aW9uLnRlcm0gPT09IGFubm90YXRpb24udGVybSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VBbm5vdGF0aW9uLnF1YWxpZmllciA9PT0gYW5ub3RhdGlvbi5xdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAoYW5ub3RhdGlvbiBhcyBhbnkpLl9fc291cmNlID0gYW5ub3RhdGlvblNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgKGFubm90YXRpb24gYXMgQW5ub3RhdGlvbikuZnVsbHlRdWFsaWZpZWROYW1lID0gZ2V0QW5ub3RhdGlvbkZRTihcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3TWV0YWRhdGEucmVmZXJlbmNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXS5hbm5vdGF0aW9ucy5zcGxpY2UoZmluZEluZGV4LCAxLCBhbm5vdGF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXS5hbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBhbm5vdGF0aW9uTGlzdFBlclRhcmdldDtcbn1cblxuY2xhc3MgQ29udmVydGVyIHtcbiAgICBwcml2YXRlIF9yYXdBbm5vdGF0aW9uc1BlclRhcmdldDogUmVjb3JkPEZ1bGx5UXVhbGlmaWVkTmFtZSwgQW5ub3RhdGlvbkxpc3Q+O1xuICAgIGdldCByYXdBbm5vdGF0aW9uc1BlclRhcmdldCgpOiBSZWNvcmQ8RnVsbHlRdWFsaWZpZWROYW1lLCBBbm5vdGF0aW9uTGlzdD4ge1xuICAgICAgICBpZiAodGhpcy5fcmF3QW5ub3RhdGlvbnNQZXJUYXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fcmF3QW5ub3RhdGlvbnNQZXJUYXJnZXQgPSBtZXJnZUFubm90YXRpb25zKHRoaXMucmF3TWV0YWRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9yYXdBbm5vdGF0aW9uc1BlclRhcmdldDtcbiAgICB9XG5cbiAgICBnZXRDb252ZXJ0ZWRFbnRpdHlDb250YWluZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbnZlcnRlZEVsZW1lbnQoXG4gICAgICAgICAgICB0aGlzLnJhd01ldGFkYXRhLnNjaGVtYS5lbnRpdHlDb250YWluZXIuZnVsbHlRdWFsaWZpZWROYW1lLFxuICAgICAgICAgICAgdGhpcy5yYXdNZXRhZGF0YS5zY2hlbWEuZW50aXR5Q29udGFpbmVyLFxuICAgICAgICAgICAgY29udmVydEVudGl0eUNvbnRhaW5lclxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldENvbnZlcnRlZEVudGl0eVNldChmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0ZWRPdXRwdXQuZW50aXR5U2V0cy5ieV9mdWxseVF1YWxpZmllZE5hbWUoZnVsbHlRdWFsaWZpZWROYW1lKTtcbiAgICB9XG5cbiAgICBnZXRDb252ZXJ0ZWRTaW5nbGV0b24oZnVsbHlRdWFsaWZpZWROYW1lOiBGdWxseVF1YWxpZmllZE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydGVkT3V0cHV0LnNpbmdsZXRvbnMuYnlfZnVsbHlRdWFsaWZpZWROYW1lKGZ1bGx5UXVhbGlmaWVkTmFtZSk7XG4gICAgfVxuXG4gICAgZ2V0Q29udmVydGVkRW50aXR5VHlwZShmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0ZWRPdXRwdXQuZW50aXR5VHlwZXMuYnlfZnVsbHlRdWFsaWZpZWROYW1lKGZ1bGx5UXVhbGlmaWVkTmFtZSk7XG4gICAgfVxuXG4gICAgZ2V0Q29udmVydGVkQ29tcGxleFR5cGUoZnVsbHlRdWFsaWZpZWROYW1lOiBGdWxseVF1YWxpZmllZE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydGVkT3V0cHV0LmNvbXBsZXhUeXBlcy5ieV9mdWxseVF1YWxpZmllZE5hbWUoZnVsbHlRdWFsaWZpZWROYW1lKTtcbiAgICB9XG5cbiAgICBnZXRDb252ZXJ0ZWRUeXBlRGVmaW5pdGlvbihmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0ZWRPdXRwdXQudHlwZURlZmluaXRpb25zLmJ5X2Z1bGx5UXVhbGlmaWVkTmFtZShmdWxseVF1YWxpZmllZE5hbWUpO1xuICAgIH1cblxuICAgIGdldENvbnZlcnRlZEFjdGlvbkltcG9ydChmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICBsZXQgYWN0aW9uSW1wb3J0ID0gdGhpcy5jb252ZXJ0ZWRPdXRwdXQuYWN0aW9uSW1wb3J0cy5ieV9mdWxseVF1YWxpZmllZE5hbWUoZnVsbHlRdWFsaWZpZWROYW1lKTtcbiAgICAgICAgaWYgKCFhY3Rpb25JbXBvcnQpIHtcbiAgICAgICAgICAgIGFjdGlvbkltcG9ydCA9IHRoaXMuY29udmVydGVkT3V0cHV0LmFjdGlvbkltcG9ydHMuYnlfbmFtZShmdWxseVF1YWxpZmllZE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3Rpb25JbXBvcnQ7XG4gICAgfVxuXG4gICAgZ2V0Q29udmVydGVkQWN0aW9uKGZ1bGx5UXVhbGlmaWVkTmFtZTogRnVsbHlRdWFsaWZpZWROYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRlZE91dHB1dC5hY3Rpb25zLmJ5X2Z1bGx5UXVhbGlmaWVkTmFtZShmdWxseVF1YWxpZmllZE5hbWUpO1xuICAgIH1cblxuICAgIGNvbnZlcnQ8Q29udmVydGVkLCBSYXcgZXh0ZW5kcyBSYXdUeXBlPENvbnZlcnRlZD4+KFxuICAgICAgICByYXdWYWx1ZTogUmF3LFxuICAgICAgICBtYXA6IChjb252ZXJ0ZXI6IENvbnZlcnRlciwgcmF3OiBSYXcpID0+IENvbnZlcnRlZFxuICAgICk6ICgpID0+IENvbnZlcnRlZDtcbiAgICBjb252ZXJ0PENvbnZlcnRlZCwgUmF3IGV4dGVuZHMgUmF3VHlwZTxDb252ZXJ0ZWQ+LCBJbmRleFByb3BlcnR5IGV4dGVuZHMgRXh0cmFjdDxrZXlvZiBDb252ZXJ0ZWQsIHN0cmluZz4+KFxuICAgICAgICByYXdWYWx1ZTogUmF3W10sXG4gICAgICAgIG1hcDogKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXc6IFJhdykgPT4gQ29udmVydGVkXG4gICAgKTogKCkgPT4gQXJyYXlXaXRoSW5kZXg8Q29udmVydGVkLCBJbmRleFByb3BlcnR5PjtcbiAgICBjb252ZXJ0PENvbnZlcnRlZCwgUmF3IGV4dGVuZHMgUmF3VHlwZTxDb252ZXJ0ZWQ+LCBJbmRleFByb3BlcnR5IGV4dGVuZHMgRXh0cmFjdDxrZXlvZiBDb252ZXJ0ZWQsIHN0cmluZz4+KFxuICAgICAgICByYXdWYWx1ZTogUmF3IHwgUmF3W10sXG4gICAgICAgIG1hcDogKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXc6IFJhdykgPT4gQ29udmVydGVkXG4gICAgKTogKCgpID0+IENvbnZlcnRlZCkgfCAoKCkgPT4gQXJyYXlXaXRoSW5kZXg8Q29udmVydGVkLCBJbmRleFByb3BlcnR5Pikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkID0gcmF3VmFsdWUucmVkdWNlKChjb252ZXJ0ZWRFbGVtZW50cywgcmF3RWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRFbGVtZW50ID0gdGhpcy5nZXRDb252ZXJ0ZWRFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgKHJhd0VsZW1lbnQgYXMgYW55KS5mdWxseVF1YWxpZmllZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb252ZXJ0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb252ZXJ0ZWRFbGVtZW50cy5wdXNoKGNvbnZlcnRlZEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZWRFbGVtZW50cztcbiAgICAgICAgICAgICAgICB9LCBbXSBhcyBDb252ZXJ0ZWRbXSk7XG4gICAgICAgICAgICAgICAgYWRkR2V0QnlWYWx1ZShjb252ZXJ0ZWQsICduYW1lJyBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIGFkZEdldEJ5VmFsdWUoY29udmVydGVkLCAnZnVsbHlRdWFsaWZpZWROYW1lJyBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZWQgYXMgQXJyYXlXaXRoSW5kZXg8Q29udmVydGVkLCBJbmRleFByb3BlcnR5PjtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gdGhpcy5nZXRDb252ZXJ0ZWRFbGVtZW50KHJhd1ZhbHVlLmZ1bGx5UXVhbGlmaWVkTmFtZSwgcmF3VmFsdWUsIG1hcCkhO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByYXdNZXRhZGF0YTogUmF3TWV0YWRhdGE7XG4gICAgcHJpdmF0ZSBjb252ZXJ0ZWRFbGVtZW50czogTWFwPEZ1bGx5UXVhbGlmaWVkTmFtZSwgYW55PiA9IG5ldyBNYXAoKTtcbiAgICBwcml2YXRlIGNvbnZlcnRlZE91dHB1dDogQ29udmVydGVkTWV0YWRhdGE7XG5cbiAgICByYXdTY2hlbWE6IFJhd1NjaGVtYTtcblxuICAgIGNvbnN0cnVjdG9yKHJhd01ldGFkYXRhOiBSYXdNZXRhZGF0YSwgY29udmVydGVkT3V0cHV0OiBDb252ZXJ0ZWRNZXRhZGF0YSkge1xuICAgICAgICB0aGlzLnJhd01ldGFkYXRhID0gcmF3TWV0YWRhdGE7XG4gICAgICAgIHRoaXMucmF3U2NoZW1hID0gcmF3TWV0YWRhdGEuc2NoZW1hO1xuICAgICAgICB0aGlzLmNvbnZlcnRlZE91dHB1dCA9IGNvbnZlcnRlZE91dHB1dDtcbiAgICB9XG5cbiAgICBnZXRDb252ZXJ0ZWRFbGVtZW50PENvbnZlcnRlZFR5cGUsIFJhd1R5cGUgZXh0ZW5kcyBSZW1vdmVBbm5vdGF0aW9uQW5kVHlwZTxDb252ZXJ0ZWRUeXBlPj4oXG4gICAgICAgIGZ1bGx5UXVhbGlmaWVkTmFtZTogRnVsbHlRdWFsaWZpZWROYW1lLFxuICAgICAgICByYXdFbGVtZW50OiBSYXdUeXBlIHwgdW5kZWZpbmVkIHwgKChmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkgPT4gUmF3VHlwZSB8IHVuZGVmaW5lZCksXG4gICAgICAgIG1hcDogKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXc6IFJhd1R5cGUpID0+IENvbnZlcnRlZFR5cGVcbiAgICApOiBDb252ZXJ0ZWRUeXBlIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgbGV0IGNvbnZlcnRlZDogQ29udmVydGVkVHlwZSB8IHVuZGVmaW5lZCA9IHRoaXMuY29udmVydGVkRWxlbWVudHMuZ2V0KGZ1bGx5UXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGlmIChjb252ZXJ0ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgcmF3TWV0YWRhdGEgPVxuICAgICAgICAgICAgICAgIHR5cGVvZiByYXdFbGVtZW50ID09PSAnZnVuY3Rpb24nID8gcmF3RWxlbWVudC5hcHBseSh1bmRlZmluZWQsIFtmdWxseVF1YWxpZmllZE5hbWVdKSA6IHJhd0VsZW1lbnQ7XG4gICAgICAgICAgICBpZiAocmF3TWV0YWRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlZCA9IG1hcC5hcHBseSh1bmRlZmluZWQsIFt0aGlzLCByYXdNZXRhZGF0YV0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udmVydGVkRWxlbWVudHMuc2V0KGZ1bGx5UXVhbGlmaWVkTmFtZSwgY29udmVydGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29udmVydGVkO1xuICAgIH1cblxuICAgIGxvZ0Vycm9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNvbnZlcnRlZE91dHB1dC5kaWFnbm9zdGljcy5wdXNoKHsgbWVzc2FnZSB9KTtcbiAgICB9XG5cbiAgICBzcGxpdFRlcm0odGVybTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzcGxpdFRlcm0odGhpcy5yYXdNZXRhZGF0YS5yZWZlcmVuY2VzLCB0ZXJtKTtcbiAgICB9XG5cbiAgICBhbGlhcyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBhbGlhcyh0aGlzLnJhd01ldGFkYXRhLnJlZmVyZW5jZXMsIHZhbHVlKTtcbiAgICB9XG5cbiAgICB1bmFsaWFzKHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuYWxpYXModGhpcy5yYXdNZXRhZGF0YS5yZWZlcmVuY2VzLCB2YWx1ZSkgPz8gJyc7XG4gICAgfVxufVxuXG50eXBlIFJhd1R5cGU8VD4gPSBSZW1vdmVBbm5vdGF0aW9uQW5kVHlwZTxUPiAmIHsgZnVsbHlRdWFsaWZpZWROYW1lOiBGdWxseVF1YWxpZmllZE5hbWUgfTtcblxuZnVuY3Rpb24gcmVzb2x2ZUVudGl0eVR5cGUoY29udmVydGVyOiBDb252ZXJ0ZXIsIGZ1bGx5UXVhbGlmaWVkTmFtZTogRnVsbHlRdWFsaWZpZWROYW1lKSB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgbGV0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkRW50aXR5VHlwZShmdWxseVF1YWxpZmllZE5hbWUpO1xuXG4gICAgICAgIGlmICghZW50aXR5VHlwZSkge1xuICAgICAgICAgICAgY29udmVydGVyLmxvZ0Vycm9yKGBFbnRpdHlUeXBlICcke2Z1bGx5UXVhbGlmaWVkTmFtZX0nIG5vdCBmb3VuZGApO1xuICAgICAgICAgICAgZW50aXR5VHlwZSA9IHt9IGFzIEVudGl0eVR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudGl0eVR5cGU7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZU5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzKFxuICAgIGNvbnZlcnRlcjogQ29udmVydGVyLFxuICAgIHJhd05hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzOiBTaW5nbGV0b25bJ25hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcnXSB8IEVudGl0eVNldFsnbmF2aWdhdGlvblByb3BlcnR5QmluZGluZyddLFxuICAgIHJhd0VsZW1lbnQ6IFJhd1NpbmdsZXRvbiB8IFJhd0VudGl0eVNldFxuKSB7XG4gICAgcmV0dXJuICgpID0+XG4gICAgICAgIE9iamVjdC5rZXlzKHJhd05hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzKS5yZWR1Y2UoKG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzLCBiaW5kaW5nTmFtZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmF3QmluZGluZ1RhcmdldCA9IHJhd05hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzW2JpbmRpbmdOYW1lXTtcblxuICAgICAgICAgICAgbGF6eShuYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5ncywgYmluZGluZ05hbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzb2x2ZWRCaW5kaW5nVGFyZ2V0O1xuICAgICAgICAgICAgICAgIGlmIChyYXdCaW5kaW5nVGFyZ2V0Ll90eXBlID09PSAnU2luZ2xldG9uJykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZEJpbmRpbmdUYXJnZXQgPSBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkU2luZ2xldG9uKHJhd0JpbmRpbmdUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZEJpbmRpbmdUYXJnZXQgPSBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkRW50aXR5U2V0KHJhd0JpbmRpbmdUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFyZXNvbHZlZEJpbmRpbmdUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udmVydGVyLmxvZ0Vycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7cmF3RWxlbWVudC5fdHlwZX0gJyR7cmF3RWxlbWVudC5mdWxseVF1YWxpZmllZE5hbWV9JzogRmFpbGVkIHRvIHJlc29sdmUgTmF2aWdhdGlvblByb3BlcnR5QmluZGluZyAke2JpbmRpbmdOYW1lfWBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRCaW5kaW5nVGFyZ2V0ID0ge30gYXMgYW55O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZWRCaW5kaW5nVGFyZ2V0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3M7XG4gICAgICAgIH0sIHt9IGFzIEVudGl0eVNldFsnbmF2aWdhdGlvblByb3BlcnR5QmluZGluZyddIHwgU2luZ2xldG9uWyduYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nJ10pO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQW5ub3RhdGlvbnMoY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd0Fubm90YXRpb25UYXJnZXQ6IGFueSkge1xuICAgIGNvbnN0IG5lc3RlZEFubm90YXRpb25zID0gcmF3QW5ub3RhdGlvblRhcmdldC5hbm5vdGF0aW9ucztcblxuICAgIHJldHVybiAoKSA9PlxuICAgICAgICBjcmVhdGVBbm5vdGF0aW9uc09iamVjdChcbiAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgIHJhd0Fubm90YXRpb25UYXJnZXQsXG4gICAgICAgICAgICBuZXN0ZWRBbm5vdGF0aW9ucyA/P1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlci5yYXdBbm5vdGF0aW9uc1BlclRhcmdldFtyYXdBbm5vdGF0aW9uVGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZV0/LmFubm90YXRpb25zID8/XG4gICAgICAgICAgICAgICAgW11cbiAgICAgICAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQW5ub3RhdGlvbnNPYmplY3QoY29udmVydGVyOiBDb252ZXJ0ZXIsIHRhcmdldDogYW55LCByYXdBbm5vdGF0aW9uczogUmF3QW5ub3RhdGlvbltdKSB7XG4gICAgcmV0dXJuIHJhd0Fubm90YXRpb25zLnJlZHVjZSgodm9jYWJ1bGFyeUFsaWFzZXMsIGFubm90YXRpb24pID0+IHtcbiAgICAgICAgY29uc3QgW3ZvY0FsaWFzLCB2b2NUZXJtXSA9IGNvbnZlcnRlci5zcGxpdFRlcm0oYW5ub3RhdGlvbi50ZXJtKTtcbiAgICAgICAgY29uc3Qgdm9jVGVybVdpdGhRdWFsaWZpZXIgPSBgJHt2b2NUZXJtfSR7YW5ub3RhdGlvbi5xdWFsaWZpZXIgPyAnIycgKyBhbm5vdGF0aW9uLnF1YWxpZmllciA6ICcnfWA7XG5cbiAgICAgICAgaWYgKHZvY2FidWxhcnlBbGlhc2VzW3ZvY0FsaWFzXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2b2NhYnVsYXJ5QWxpYXNlc1t2b2NBbGlhc10gPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdm9jYWJ1bGFyeUFsaWFzZXNbdm9jQWxpYXNdLmhhc093blByb3BlcnR5KHZvY1Rlcm1XaXRoUXVhbGlmaWVyKSkge1xuICAgICAgICAgICAgbGF6eSh2b2NhYnVsYXJ5QWxpYXNlc1t2b2NBbGlhc10sIHZvY1Rlcm1XaXRoUXVhbGlmaWVyLCAoKSA9PlxuICAgICAgICAgICAgICAgIGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAoYW5ub3RhdGlvbiBhcyBBbm5vdGF0aW9uKS5mdWxseVF1YWxpZmllZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGFubm90YXRpb24sXG4gICAgICAgICAgICAgICAgICAgIChjb252ZXJ0ZXIsIHJhd0Fubm90YXRpb24pID0+IGNvbnZlcnRBbm5vdGF0aW9uKGNvbnZlcnRlciwgdGFyZ2V0LCByYXdBbm5vdGF0aW9uKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZvY2FidWxhcnlBbGlhc2VzO1xuICAgIH0sIHt9IGFzIGFueSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gRW50aXR5Q29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXIgICAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd0VudGl0eUNvbnRhaW5lciAgICBVbmNvbnZlcnRlZCBFbnRpdHlDb250YWluZXJcbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgRW50aXR5Q29udGFpbmVyXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRFbnRpdHlDb250YWluZXIoY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd0VudGl0eUNvbnRhaW5lcjogUmF3RW50aXR5Q29udGFpbmVyKTogRW50aXR5Q29udGFpbmVyIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRFbnRpdHlDb250YWluZXIgPSByYXdFbnRpdHlDb250YWluZXIgYXMgRW50aXR5Q29udGFpbmVyO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRFbnRpdHlDb250YWluZXIsICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXIsIHJhd0VudGl0eUNvbnRhaW5lcikpO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRFbnRpdHlDb250YWluZXIsICdlbnRpdHlTZXRzJywgY29udmVydGVyLmNvbnZlcnQoY29udmVydGVyLnJhd1NjaGVtYS5lbnRpdHlTZXRzLCBjb252ZXJ0RW50aXR5U2V0KSk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZEVudGl0eUNvbnRhaW5lciwgJ3NpbmdsZXRvbnMnLCBjb252ZXJ0ZXIuY29udmVydChjb252ZXJ0ZXIucmF3U2NoZW1hLnNpbmdsZXRvbnMsIGNvbnZlcnRTaW5nbGV0b24pKTtcblxuICAgIGxhenkoXG4gICAgICAgIGNvbnZlcnRlZEVudGl0eUNvbnRhaW5lcixcbiAgICAgICAgJ2FjdGlvbkltcG9ydHMnLFxuICAgICAgICBjb252ZXJ0ZXIuY29udmVydChjb252ZXJ0ZXIucmF3U2NoZW1hLmFjdGlvbkltcG9ydHMsIGNvbnZlcnRBY3Rpb25JbXBvcnQpXG4gICAgKTtcblxuICAgIHJldHVybiBjb252ZXJ0ZWRFbnRpdHlDb250YWluZXI7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBTaW5nbGV0b24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd1NpbmdsZXRvbiAgVW5jb252ZXJ0ZWQgU2luZ2xldG9uXG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIFNpbmdsZXRvblxuICovXG5mdW5jdGlvbiBjb252ZXJ0U2luZ2xldG9uKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXdTaW5nbGV0b246IFJhd1NpbmdsZXRvbik6IFNpbmdsZXRvbiB7XG4gICAgY29uc3QgY29udmVydGVkU2luZ2xldG9uID0gcmF3U2luZ2xldG9uIGFzIFNpbmdsZXRvbjtcblxuICAgIGNvbnZlcnRlZFNpbmdsZXRvbi5lbnRpdHlUeXBlTmFtZSA9IGNvbnZlcnRlci51bmFsaWFzKHJhd1NpbmdsZXRvbi5lbnRpdHlUeXBlTmFtZSk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZFNpbmdsZXRvbiwgJ2VudGl0eVR5cGUnLCByZXNvbHZlRW50aXR5VHlwZShjb252ZXJ0ZXIsIHJhd1NpbmdsZXRvbi5lbnRpdHlUeXBlTmFtZSkpO1xuICAgIGxhenkoY29udmVydGVkU2luZ2xldG9uLCAnYW5ub3RhdGlvbnMnLCByZXNvbHZlQW5ub3RhdGlvbnMoY29udmVydGVyLCByYXdTaW5nbGV0b24gYXMgU2luZ2xldG9uKSk7XG5cbiAgICBjb25zdCBfcmF3TmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3MgPSByYXdTaW5nbGV0b24ubmF2aWdhdGlvblByb3BlcnR5QmluZGluZztcbiAgICBsYXp5KFxuICAgICAgICBjb252ZXJ0ZWRTaW5nbGV0b24sXG4gICAgICAgICduYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nJyxcbiAgICAgICAgcmVzb2x2ZU5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzKFxuICAgICAgICAgICAgY29udmVydGVyLFxuICAgICAgICAgICAgX3Jhd05hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzIGFzIFNpbmdsZXRvblsnbmF2aWdhdGlvblByb3BlcnR5QmluZGluZyddLFxuICAgICAgICAgICAgcmF3U2luZ2xldG9uXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgcmV0dXJuIGNvbnZlcnRlZFNpbmdsZXRvbjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBFbnRpdHlTZXQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd0VudGl0eVNldCAgVW5jb252ZXJ0ZWQgRW50aXR5U2V0XG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIEVudGl0eVNldFxuICovXG5mdW5jdGlvbiBjb252ZXJ0RW50aXR5U2V0KGNvbnZlcnRlcjogQ29udmVydGVyLCByYXdFbnRpdHlTZXQ6IFJhd0VudGl0eVNldCk6IEVudGl0eVNldCB7XG4gICAgY29uc3QgY29udmVydGVkRW50aXR5U2V0ID0gcmF3RW50aXR5U2V0IGFzIEVudGl0eVNldDtcblxuICAgIGNvbnZlcnRlZEVudGl0eVNldC5lbnRpdHlUeXBlTmFtZSA9IGNvbnZlcnRlci51bmFsaWFzKHJhd0VudGl0eVNldC5lbnRpdHlUeXBlTmFtZSk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZEVudGl0eVNldCwgJ2VudGl0eVR5cGUnLCByZXNvbHZlRW50aXR5VHlwZShjb252ZXJ0ZXIsIHJhd0VudGl0eVNldC5lbnRpdHlUeXBlTmFtZSkpO1xuICAgIGxhenkoY29udmVydGVkRW50aXR5U2V0LCAnYW5ub3RhdGlvbnMnLCByZXNvbHZlQW5ub3RhdGlvbnMoY29udmVydGVyLCByYXdFbnRpdHlTZXQgYXMgRW50aXR5U2V0KSk7XG5cbiAgICBjb25zdCBfcmF3TmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3MgPSByYXdFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZztcbiAgICBsYXp5KFxuICAgICAgICBjb252ZXJ0ZWRFbnRpdHlTZXQsXG4gICAgICAgICduYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nJyxcbiAgICAgICAgcmVzb2x2ZU5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzKFxuICAgICAgICAgICAgY29udmVydGVyLFxuICAgICAgICAgICAgX3Jhd05hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzIGFzIEVudGl0eVNldFsnbmF2aWdhdGlvblByb3BlcnR5QmluZGluZyddLFxuICAgICAgICAgICAgcmF3RW50aXR5U2V0XG4gICAgICAgIClcbiAgICApO1xuXG4gICAgcmV0dXJuIGNvbnZlcnRlZEVudGl0eVNldDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBFbnRpdHlUeXBlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXIgICBDb252ZXJ0ZXJcbiAqIEBwYXJhbSByYXdFbnRpdHlUeXBlICBVbmNvbnZlcnRlZCBFbnRpdHlUeXBlXG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIEVudGl0eVR5cGVcbiAqL1xuZnVuY3Rpb24gY29udmVydEVudGl0eVR5cGUoY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd0VudGl0eVR5cGU6IFJhd0VudGl0eVR5cGUpOiBFbnRpdHlUeXBlIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRFbnRpdHlUeXBlID0gcmF3RW50aXR5VHlwZSBhcyBFbnRpdHlUeXBlO1xuXG4gICAgcmF3RW50aXR5VHlwZS5rZXlzLmZvckVhY2goKGtleVByb3A6IGFueSkgPT4ge1xuICAgICAgICBrZXlQcm9wLmlzS2V5ID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIGxhenkoY29udmVydGVkRW50aXR5VHlwZSwgJ2Fubm90YXRpb25zJywgcmVzb2x2ZUFubm90YXRpb25zKGNvbnZlcnRlciwgcmF3RW50aXR5VHlwZSkpO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRFbnRpdHlUeXBlLCAna2V5cycsIGNvbnZlcnRlci5jb252ZXJ0KHJhd0VudGl0eVR5cGUua2V5cywgY29udmVydFByb3BlcnR5KSk7XG4gICAgbGF6eShjb252ZXJ0ZWRFbnRpdHlUeXBlLCAnZW50aXR5UHJvcGVydGllcycsIGNvbnZlcnRlci5jb252ZXJ0KHJhd0VudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcywgY29udmVydFByb3BlcnR5KSk7XG4gICAgbGF6eShcbiAgICAgICAgY29udmVydGVkRW50aXR5VHlwZSxcbiAgICAgICAgJ25hdmlnYXRpb25Qcm9wZXJ0aWVzJyxcbiAgICAgICAgY29udmVydGVyLmNvbnZlcnQocmF3RW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcyBhcyBhbnlbXSwgY29udmVydE5hdmlnYXRpb25Qcm9wZXJ0eSlcbiAgICApO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRFbnRpdHlUeXBlLCAnYWN0aW9ucycsICgpID0+XG4gICAgICAgIGNvbnZlcnRlci5yYXdTY2hlbWEuYWN0aW9uc1xuICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAocmF3QWN0aW9uKSA9PlxuICAgICAgICAgICAgICAgICAgICByYXdBY3Rpb24uaXNCb3VuZCAmJlxuICAgICAgICAgICAgICAgICAgICAocmF3QWN0aW9uLnNvdXJjZVR5cGUgPT09IHJhd0VudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICByYXdBY3Rpb24uc291cmNlVHlwZSA9PT0gYENvbGxlY3Rpb24oJHtyYXdFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZX0pYClcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5yZWR1Y2UoKGFjdGlvbnMsIHJhd0FjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBgJHtjb252ZXJ0ZXIucmF3U2NoZW1hLm5hbWVzcGFjZX0uJHtyYXdBY3Rpb24ubmFtZX1gO1xuICAgICAgICAgICAgICAgIGFjdGlvbnNbbmFtZV0gPSBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkQWN0aW9uKHJhd0FjdGlvbi5mdWxseVF1YWxpZmllZE5hbWUpITtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aW9ucztcbiAgICAgICAgICAgIH0sIHt9IGFzIEVudGl0eVR5cGVbJ2FjdGlvbnMnXSlcbiAgICApO1xuXG4gICAgY29udmVydGVkRW50aXR5VHlwZS5yZXNvbHZlUGF0aCA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZywgaW5jbHVkZVZpc2l0ZWRPYmplY3RzPzogYm9vbGVhbikgPT4ge1xuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVUYXJnZXQoY29udmVydGVyLCByYXdFbnRpdHlUeXBlLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICBpZiAoaW5jbHVkZVZpc2l0ZWRPYmplY3RzKSB7XG4gICAgICAgICAgICByZXR1cm4geyB0YXJnZXQ6IHJlc29sdmVkLnRhcmdldCwgdmlzaXRlZE9iamVjdHM6IHJlc29sdmVkLm9iamVjdFBhdGgsIG1lc3NhZ2VzOiByZXNvbHZlZC5tZXNzYWdlcyB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVkLnRhcmdldDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gY29udmVydGVkRW50aXR5VHlwZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIFByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXIgICBDb252ZXJ0ZXJcbiAqIEBwYXJhbSByYXdQcm9wZXJ0eSAgVW5jb252ZXJ0ZWQgUHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgUHJvcGVydHlcbiAqL1xuZnVuY3Rpb24gY29udmVydFByb3BlcnR5KGNvbnZlcnRlcjogQ29udmVydGVyLCByYXdQcm9wZXJ0eTogUmF3UHJvcGVydHkpOiBQcm9wZXJ0eSB7XG4gICAgY29uc3QgY29udmVydGVkUHJvcGVydHkgPSByYXdQcm9wZXJ0eSBhcyBQcm9wZXJ0eTtcblxuICAgIGNvbnZlcnRlZFByb3BlcnR5LnR5cGUgPSBjb252ZXJ0ZXIudW5hbGlhcyhyYXdQcm9wZXJ0eS50eXBlKTtcbiAgICBsYXp5KGNvbnZlcnRlZFByb3BlcnR5LCAnYW5ub3RhdGlvbnMnLCByZXNvbHZlQW5ub3RhdGlvbnMoY29udmVydGVyLCByYXdQcm9wZXJ0eSkpO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRQcm9wZXJ0eSwgJ3RhcmdldFR5cGUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSByYXdQcm9wZXJ0eS50eXBlO1xuICAgICAgICBjb25zdCB0eXBlTmFtZSA9IHR5cGUuc3RhcnRzV2l0aCgnQ29sbGVjdGlvbicpID8gdHlwZS5zdWJzdHJpbmcoMTEsIHR5cGUubGVuZ3RoIC0gMSkgOiB0eXBlO1xuXG4gICAgICAgIHJldHVybiBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkQ29tcGxleFR5cGUodHlwZU5hbWUpID8/IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRUeXBlRGVmaW5pdGlvbih0eXBlTmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29udmVydGVkUHJvcGVydHk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBOYXZpZ2F0aW9uUHJvcGVydHkuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd05hdmlnYXRpb25Qcm9wZXJ0eSAgVW5jb252ZXJ0ZWQgTmF2aWdhdGlvblByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIE5hdmlnYXRpb25Qcm9wZXJ0eVxuICovXG5mdW5jdGlvbiBjb252ZXJ0TmF2aWdhdGlvblByb3BlcnR5KFxuICAgIGNvbnZlcnRlcjogQ29udmVydGVyLFxuICAgIHJhd05hdmlnYXRpb25Qcm9wZXJ0eTogUmF3VjJOYXZpZ2F0aW9uUHJvcGVydHkgfCBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eVxuKTogTmF2aWdhdGlvblByb3BlcnR5IHtcbiAgICBjb25zdCBjb252ZXJ0ZWROYXZpZ2F0aW9uUHJvcGVydHkgPSByYXdOYXZpZ2F0aW9uUHJvcGVydHkgYXMgTmF2aWdhdGlvblByb3BlcnR5O1xuXG4gICAgY29udmVydGVkTmF2aWdhdGlvblByb3BlcnR5LnJlZmVyZW50aWFsQ29uc3RyYWludCA9IGNvbnZlcnRlZE5hdmlnYXRpb25Qcm9wZXJ0eS5yZWZlcmVudGlhbENvbnN0cmFpbnQgPz8gW107XG5cbiAgICBpZiAoaXNWNE5hdmlnYXRpb25Qcm9wZXJ0eShyYXdOYXZpZ2F0aW9uUHJvcGVydHkpKSB7XG4gICAgICAgIGNvbnZlcnRlZE5hdmlnYXRpb25Qcm9wZXJ0eS50YXJnZXRUeXBlTmFtZSA9IGNvbnZlcnRlci51bmFsaWFzKHJhd05hdmlnYXRpb25Qcm9wZXJ0eS50YXJnZXRUeXBlTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgYXNzb2NpYXRpb25FbmQgPSBjb252ZXJ0ZXIucmF3U2NoZW1hLmFzc29jaWF0aW9uc1xuICAgICAgICAgICAgLmZpbmQoKGFzc29jaWF0aW9uKSA9PiBhc3NvY2lhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUgPT09IHJhd05hdmlnYXRpb25Qcm9wZXJ0eS5yZWxhdGlvbnNoaXApXG4gICAgICAgICAgICA/LmFzc29jaWF0aW9uRW5kLmZpbmQoKGVuZCkgPT4gZW5kLnJvbGUgPT09IHJhd05hdmlnYXRpb25Qcm9wZXJ0eS50b1JvbGUpO1xuXG4gICAgICAgIGNvbnZlcnRlZE5hdmlnYXRpb25Qcm9wZXJ0eS5pc0NvbGxlY3Rpb24gPSBhc3NvY2lhdGlvbkVuZD8ubXVsdGlwbGljaXR5ID09PSAnKic7XG4gICAgICAgIGNvbnZlcnRlZE5hdmlnYXRpb25Qcm9wZXJ0eS50YXJnZXRUeXBlTmFtZSA9IGFzc29jaWF0aW9uRW5kPy50eXBlID8/ICcnO1xuICAgIH1cblxuICAgIGxhenkoXG4gICAgICAgIGNvbnZlcnRlZE5hdmlnYXRpb25Qcm9wZXJ0eSxcbiAgICAgICAgJ3RhcmdldFR5cGUnLFxuICAgICAgICByZXNvbHZlRW50aXR5VHlwZShjb252ZXJ0ZXIsIChyYXdOYXZpZ2F0aW9uUHJvcGVydHkgYXMgTmF2aWdhdGlvblByb3BlcnR5KS50YXJnZXRUeXBlTmFtZSlcbiAgICApO1xuXG4gICAgbGF6eShjb252ZXJ0ZWROYXZpZ2F0aW9uUHJvcGVydHksICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXIsIHJhd05hdmlnYXRpb25Qcm9wZXJ0eSkpO1xuXG4gICAgcmV0dXJuIGNvbnZlcnRlZE5hdmlnYXRpb25Qcm9wZXJ0eTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBBY3Rpb25JbXBvcnQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd0FjdGlvbkltcG9ydCAgVW5jb252ZXJ0ZWQgQWN0aW9uSW1wb3J0XG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIEFjdGlvbkltcG9ydFxuICovXG5mdW5jdGlvbiBjb252ZXJ0QWN0aW9uSW1wb3J0KGNvbnZlcnRlcjogQ29udmVydGVyLCByYXdBY3Rpb25JbXBvcnQ6IFJhd0FjdGlvbkltcG9ydCk6IEFjdGlvbkltcG9ydCB7XG4gICAgY29uc3QgY29udmVydGVkQWN0aW9uSW1wb3J0ID0gcmF3QWN0aW9uSW1wb3J0IGFzIEFjdGlvbkltcG9ydDtcblxuICAgIGNvbnZlcnRlZEFjdGlvbkltcG9ydC5hY3Rpb25OYW1lID0gY29udmVydGVyLnVuYWxpYXMocmF3QWN0aW9uSW1wb3J0LmFjdGlvbk5hbWUpO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRBY3Rpb25JbXBvcnQsICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXIsIHJhd0FjdGlvbkltcG9ydCkpO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRBY3Rpb25JbXBvcnQsICdhY3Rpb24nLCAoKSA9PiBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkQWN0aW9uKHJhd0FjdGlvbkltcG9ydC5hY3Rpb25OYW1lKSk7XG5cbiAgICByZXR1cm4gY29udmVydGVkQWN0aW9uSW1wb3J0O1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIEFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyICAgQ29udmVydGVyXG4gKiBAcGFyYW0gcmF3QWN0aW9uICBVbmNvbnZlcnRlZCBBY3Rpb25cbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgQWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBY3Rpb24oY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd0FjdGlvbjogUmF3QWN0aW9uKTogQWN0aW9uIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRBY3Rpb24gPSByYXdBY3Rpb24gYXMgQWN0aW9uO1xuXG4gICAgY29udmVydGVkQWN0aW9uLnNvdXJjZVR5cGUgPSBjb252ZXJ0ZXIudW5hbGlhcyhyYXdBY3Rpb24uc291cmNlVHlwZSk7XG4gICAgaWYgKGNvbnZlcnRlZEFjdGlvbi5zb3VyY2VUeXBlKSB7XG4gICAgICAgIGxhenkoY29udmVydGVkQWN0aW9uLCAnc291cmNlRW50aXR5VHlwZScsIHJlc29sdmVFbnRpdHlUeXBlKGNvbnZlcnRlciwgcmF3QWN0aW9uLnNvdXJjZVR5cGUpKTtcbiAgICB9XG5cbiAgICBjb252ZXJ0ZWRBY3Rpb24ucmV0dXJuVHlwZSA9IGNvbnZlcnRlci51bmFsaWFzKHJhd0FjdGlvbi5yZXR1cm5UeXBlKTtcbiAgICBpZiAoY29udmVydGVkQWN0aW9uLnJldHVyblR5cGUpIHtcbiAgICAgICAgbGF6eShjb252ZXJ0ZWRBY3Rpb24sICdyZXR1cm5FbnRpdHlUeXBlJywgcmVzb2x2ZUVudGl0eVR5cGUoY29udmVydGVyLCByYXdBY3Rpb24ucmV0dXJuVHlwZSkpO1xuICAgIH1cblxuICAgIGxhenkoY29udmVydGVkQWN0aW9uLCAncGFyYW1ldGVycycsIGNvbnZlcnRlci5jb252ZXJ0KHJhd0FjdGlvbi5wYXJhbWV0ZXJzLCBjb252ZXJ0QWN0aW9uUGFyYW1ldGVyKSk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZEFjdGlvbiwgJ2Fubm90YXRpb25zJywgKCkgPT4ge1xuICAgICAgICAvLyB0aGlzLmlzLnRoZS5hY3Rpb24ob24udGhpcy50eXBlKSAtLT4gYWN0aW9uOiAndGhpcy5pcy50aGUuYWN0aW9uJywgb3ZlcmxvYWQ6ICdvbi50aGlzLnR5cGUnXG4gICAgICAgIC8vIHRoaXMuaXMudGhlLmFjdGlvbigpICAgICAgICAgICAgIC0tPiBhY3Rpb246ICd0aGlzLmlzLnRoZS5hY3Rpb24nLCBvdmVybG9hZDogdW5kZWZpbmVkXG4gICAgICAgIC8vIHRoaXMuaXMudGhlLmFjdGlvbiAgICAgICAgICAgICAgIC0tPiBhY3Rpb246ICd0aGlzLmlzLnRoZS5hY3Rpb24nLCBvdmVybG9hZDogdW5kZWZpbmVkXG4gICAgICAgIGNvbnN0IGFjdGlvbkFuZE92ZXJsb2FkID0gcmF3QWN0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZS5tYXRjaCgvKD88YWN0aW9uPlteKCldKykoPzpcXCgoPzxvdmVybG9hZD4uKilcXCkpPy8pO1xuXG4gICAgICAgIGxldCByYXdBbm5vdGF0aW9uczogUmF3QW5ub3RhdGlvbltdID0gW107XG4gICAgICAgIGlmIChhY3Rpb25BbmRPdmVybG9hZCkge1xuICAgICAgICAgICAgaWYgKGFjdGlvbkFuZE92ZXJsb2FkLmdyb3Vwcz8ub3ZlcmxvYWQpIHtcbiAgICAgICAgICAgICAgICByYXdBbm5vdGF0aW9ucyA9IGNvbnZlcnRlci5yYXdBbm5vdGF0aW9uc1BlclRhcmdldFtyYXdBY3Rpb24uZnVsbHlRdWFsaWZpZWROYW1lXT8uYW5ub3RhdGlvbnMgPz8gW107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJhd0Fubm90YXRpb25zID1cbiAgICAgICAgICAgICAgICAgICAgY29udmVydGVyLnJhd0Fubm90YXRpb25zUGVyVGFyZ2V0W2Ake2FjdGlvbkFuZE92ZXJsb2FkLmdyb3Vwcz8uYWN0aW9ufSgpYF0/LmFubm90YXRpb25zID8/IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYWN0aW9uQW5kT3ZlcmxvYWQuZ3JvdXBzPy5hY3Rpb24gJiYgYWN0aW9uQW5kT3ZlcmxvYWQuZ3JvdXBzPy5hY3Rpb24gIT09IHJhd0FjdGlvbi5mdWxseVF1YWxpZmllZE5hbWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlQW5ub3RhdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgICBjb252ZXJ0ZXIucmF3QW5ub3RhdGlvbnNQZXJUYXJnZXRbYWN0aW9uQW5kT3ZlcmxvYWQuZ3JvdXBzPy5hY3Rpb25dPy5hbm5vdGF0aW9ucyA/PyBbXTtcbiAgICAgICAgICAgICAgICByYXdBbm5vdGF0aW9ucyA9IHJhd0Fubm90YXRpb25zLmNvbmNhdChiYXNlQW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFubm90YXRpb25zT2JqZWN0KGNvbnZlcnRlciwgcmF3QWN0aW9uLCByYXdBbm5vdGF0aW9ucyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29udmVydGVkQWN0aW9uO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIEFjdGlvblBhcmFtZXRlci5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyICAgQ29udmVydGVyXG4gKiBAcGFyYW0gcmF3QWN0aW9uUGFyYW1ldGVyICBVbmNvbnZlcnRlZCBBY3Rpb25QYXJhbWV0ZXJcbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgQWN0aW9uUGFyYW1ldGVyXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBY3Rpb25QYXJhbWV0ZXIoXG4gICAgY29udmVydGVyOiBDb252ZXJ0ZXIsXG4gICAgcmF3QWN0aW9uUGFyYW1ldGVyOiBSYXdBY3Rpb25bJ3BhcmFtZXRlcnMnXVtudW1iZXJdXG4pOiBBY3Rpb25QYXJhbWV0ZXIge1xuICAgIGNvbnN0IGNvbnZlcnRlZEFjdGlvblBhcmFtZXRlciA9IHJhd0FjdGlvblBhcmFtZXRlciBhcyBBY3Rpb25QYXJhbWV0ZXI7XG5cbiAgICBsYXp5KFxuICAgICAgICBjb252ZXJ0ZWRBY3Rpb25QYXJhbWV0ZXIsXG4gICAgICAgICd0eXBlUmVmZXJlbmNlJyxcbiAgICAgICAgKCkgPT5cbiAgICAgICAgICAgIGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRFbnRpdHlUeXBlKHJhd0FjdGlvblBhcmFtZXRlci50eXBlKSA/P1xuICAgICAgICAgICAgY29udmVydGVyLmdldENvbnZlcnRlZENvbXBsZXhUeXBlKHJhd0FjdGlvblBhcmFtZXRlci50eXBlKSA/P1xuICAgICAgICAgICAgY29udmVydGVyLmdldENvbnZlcnRlZFR5cGVEZWZpbml0aW9uKHJhd0FjdGlvblBhcmFtZXRlci50eXBlKVxuICAgICk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZEFjdGlvblBhcmFtZXRlciwgJ2Fubm90YXRpb25zJywgcmVzb2x2ZUFubm90YXRpb25zKGNvbnZlcnRlciwgcmF3QWN0aW9uUGFyYW1ldGVyKSk7XG5cbiAgICByZXR1cm4gY29udmVydGVkQWN0aW9uUGFyYW1ldGVyO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgQ29tcGxleFR5cGUuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd0NvbXBsZXhUeXBlICBVbmNvbnZlcnRlZCBDb21wbGV4VHlwZVxuICogQHJldHVybnMgVGhlIGNvbnZlcnRlZCBDb21wbGV4VHlwZVxuICovXG5mdW5jdGlvbiBjb252ZXJ0Q29tcGxleFR5cGUoY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd0NvbXBsZXhUeXBlOiBSYXdDb21wbGV4VHlwZSk6IENvbXBsZXhUeXBlIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRDb21wbGV4VHlwZSA9IHJhd0NvbXBsZXhUeXBlIGFzIENvbXBsZXhUeXBlO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRDb21wbGV4VHlwZSwgJ3Byb3BlcnRpZXMnLCBjb252ZXJ0ZXIuY29udmVydChyYXdDb21wbGV4VHlwZS5wcm9wZXJ0aWVzLCBjb252ZXJ0UHJvcGVydHkpKTtcbiAgICBsYXp5KFxuICAgICAgICBjb252ZXJ0ZWRDb21wbGV4VHlwZSxcbiAgICAgICAgJ25hdmlnYXRpb25Qcm9wZXJ0aWVzJyxcbiAgICAgICAgY29udmVydGVyLmNvbnZlcnQocmF3Q29tcGxleFR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMgYXMgYW55W10sIGNvbnZlcnROYXZpZ2F0aW9uUHJvcGVydHkpXG4gICAgKTtcbiAgICBsYXp5KGNvbnZlcnRlZENvbXBsZXhUeXBlLCAnYW5ub3RhdGlvbnMnLCByZXNvbHZlQW5ub3RhdGlvbnMoY29udmVydGVyLCByYXdDb21wbGV4VHlwZSkpO1xuXG4gICAgcmV0dXJuIGNvbnZlcnRlZENvbXBsZXhUeXBlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgVHlwZURlZmluaXRpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd1R5cGVEZWZpbml0aW9uICBVbmNvbnZlcnRlZCBUeXBlRGVmaW5pdGlvblxuICogQHJldHVybnMgVGhlIGNvbnZlcnRlZCBUeXBlRGVmaW5pdGlvblxuICovXG5mdW5jdGlvbiBjb252ZXJ0VHlwZURlZmluaXRpb24oY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd1R5cGVEZWZpbml0aW9uOiBSYXdUeXBlRGVmaW5pdGlvbik6IFR5cGVEZWZpbml0aW9uIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRUeXBlRGVmaW5pdGlvbiA9IHJhd1R5cGVEZWZpbml0aW9uIGFzIFR5cGVEZWZpbml0aW9uO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRUeXBlRGVmaW5pdGlvbiwgJ2Fubm90YXRpb25zJywgcmVzb2x2ZUFubm90YXRpb25zKGNvbnZlcnRlciwgcmF3VHlwZURlZmluaXRpb24pKTtcblxuICAgIHJldHVybiBjb252ZXJ0ZWRUeXBlRGVmaW5pdGlvbjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgUmF3TWV0YWRhdGEgaW50byBhbiBvYmplY3QgcmVwcmVzZW50YXRpb24gdG8gYmUgdXNlZCB0byBlYXNpbHkgbmF2aWdhdGUgYSBtZXRhZGF0YSBvYmplY3QgYW5kIGl0cyBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSByYXdNZXRhZGF0YVxuICogQHJldHVybnMgdGhlIGNvbnZlcnRlZCByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0KHJhd01ldGFkYXRhOiBSYXdNZXRhZGF0YSk6IENvbnZlcnRlZE1ldGFkYXRhIHtcbiAgICAvLyBmYWxsIGJhY2sgb24gdGhlIGRlZmF1bHQgcmVmZXJlbmNlcyBpZiB0aGUgY2FsbGVyIGRvZXMgbm90IHNwZWNpZnkgYW55XG4gICAgaWYgKHJhd01ldGFkYXRhLnJlZmVyZW5jZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJhd01ldGFkYXRhLnJlZmVyZW5jZXMgPSBkZWZhdWx0UmVmZXJlbmNlcztcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0ZXIgT3V0cHV0XG4gICAgY29uc3QgY29udmVydGVkT3V0cHV0OiBDb252ZXJ0ZWRNZXRhZGF0YSA9IHtcbiAgICAgICAgdmVyc2lvbjogcmF3TWV0YWRhdGEudmVyc2lvbixcbiAgICAgICAgbmFtZXNwYWNlOiByYXdNZXRhZGF0YS5zY2hlbWEubmFtZXNwYWNlLFxuICAgICAgICBhbm5vdGF0aW9uczogcmF3TWV0YWRhdGEuc2NoZW1hLmFubm90YXRpb25zLFxuICAgICAgICByZWZlcmVuY2VzOiBkZWZhdWx0UmVmZXJlbmNlcy5jb25jYXQocmF3TWV0YWRhdGEucmVmZXJlbmNlcyksXG4gICAgICAgIGRpYWdub3N0aWNzOiBbXVxuICAgIH0gYXMgYW55O1xuXG4gICAgLy8gQ29udmVydGVyXG4gICAgY29uc3QgY29udmVydGVyID0gbmV3IENvbnZlcnRlcihyYXdNZXRhZGF0YSwgY29udmVydGVkT3V0cHV0KTtcblxuICAgIGxhenkoXG4gICAgICAgIGNvbnZlcnRlZE91dHB1dCxcbiAgICAgICAgJ2VudGl0eUNvbnRhaW5lcicsXG4gICAgICAgIGNvbnZlcnRlci5jb252ZXJ0KGNvbnZlcnRlci5yYXdTY2hlbWEuZW50aXR5Q29udGFpbmVyLCBjb252ZXJ0RW50aXR5Q29udGFpbmVyKVxuICAgICk7XG4gICAgbGF6eShjb252ZXJ0ZWRPdXRwdXQsICdlbnRpdHlTZXRzJywgY29udmVydGVyLmNvbnZlcnQoY29udmVydGVyLnJhd1NjaGVtYS5lbnRpdHlTZXRzLCBjb252ZXJ0RW50aXR5U2V0KSk7XG4gICAgbGF6eShjb252ZXJ0ZWRPdXRwdXQsICdzaW5nbGV0b25zJywgY29udmVydGVyLmNvbnZlcnQoY29udmVydGVyLnJhd1NjaGVtYS5zaW5nbGV0b25zLCBjb252ZXJ0U2luZ2xldG9uKSk7XG4gICAgbGF6eShjb252ZXJ0ZWRPdXRwdXQsICdlbnRpdHlUeXBlcycsIGNvbnZlcnRlci5jb252ZXJ0KGNvbnZlcnRlci5yYXdTY2hlbWEuZW50aXR5VHlwZXMsIGNvbnZlcnRFbnRpdHlUeXBlKSk7XG4gICAgbGF6eShjb252ZXJ0ZWRPdXRwdXQsICdhY3Rpb25zJywgY29udmVydGVyLmNvbnZlcnQoY29udmVydGVyLnJhd1NjaGVtYS5hY3Rpb25zLCBjb252ZXJ0QWN0aW9uKSk7XG4gICAgbGF6eShjb252ZXJ0ZWRPdXRwdXQsICdjb21wbGV4VHlwZXMnLCBjb252ZXJ0ZXIuY29udmVydChjb252ZXJ0ZXIucmF3U2NoZW1hLmNvbXBsZXhUeXBlcywgY29udmVydENvbXBsZXhUeXBlKSk7XG4gICAgbGF6eShjb252ZXJ0ZWRPdXRwdXQsICdhY3Rpb25JbXBvcnRzJywgY29udmVydGVyLmNvbnZlcnQoY29udmVydGVyLnJhd1NjaGVtYS5hY3Rpb25JbXBvcnRzLCBjb252ZXJ0QWN0aW9uSW1wb3J0KSk7XG4gICAgbGF6eShcbiAgICAgICAgY29udmVydGVkT3V0cHV0LFxuICAgICAgICAndHlwZURlZmluaXRpb25zJyxcbiAgICAgICAgY29udmVydGVyLmNvbnZlcnQoY29udmVydGVyLnJhd1NjaGVtYS50eXBlRGVmaW5pdGlvbnMsIGNvbnZlcnRUeXBlRGVmaW5pdGlvbilcbiAgICApO1xuXG4gICAgY29udmVydGVkT3V0cHV0LnJlc29sdmVQYXRoID0gZnVuY3Rpb24gcmVzb2x2ZVBhdGg8VD4ocGF0aDogc3RyaW5nKTogUmVzb2x1dGlvblRhcmdldDxUPiB7XG4gICAgICAgIGNvbnN0IHRhcmdldFJlc29sdXRpb24gPSByZXNvbHZlVGFyZ2V0PFQ+KGNvbnZlcnRlciwgdW5kZWZpbmVkLCBwYXRoKTtcbiAgICAgICAgaWYgKHRhcmdldFJlc29sdXRpb24udGFyZ2V0KSB7XG4gICAgICAgICAgICBhcHBlbmRPYmplY3RQYXRoKHRhcmdldFJlc29sdXRpb24ub2JqZWN0UGF0aCwgdGFyZ2V0UmVzb2x1dGlvbi50YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXRSZXNvbHV0aW9uO1xuICAgIH07XG5cbiAgICByZXR1cm4gY29udmVydGVkT3V0cHV0O1xufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi93cml0ZWJhY2snO1xuZXhwb3J0ICogZnJvbSAnLi91dGlscyc7XG4iLCJpbXBvcnQgdHlwZSB7IEluZGV4LCBDb21wbGV4VHlwZSwgUmVmZXJlbmNlLCBUeXBlRGVmaW5pdGlvbiwgQXJyYXlXaXRoSW5kZXggfSBmcm9tICdAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcyc7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0UmVmZXJlbmNlczogUmVmZXJlbmNlc1dpdGhNYXAgPSBbXG4gICAgeyBhbGlhczogJ0NhcGFiaWxpdGllcycsIG5hbWVzcGFjZTogJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEnLCB1cmk6ICcnIH0sXG4gICAgeyBhbGlhczogJ0FnZ3JlZ2F0aW9uJywgbmFtZXNwYWNlOiAnT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxJywgdXJpOiAnJyB9LFxuICAgIHsgYWxpYXM6ICdWYWxpZGF0aW9uJywgbmFtZXNwYWNlOiAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEnLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdPcmcuT0RhdGEuQ29yZS5WMScsIGFsaWFzOiAnQ29yZScsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ09yZy5PRGF0YS5NZWFzdXJlcy5WMScsIGFsaWFzOiAnTWVhc3VyZXMnLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEnLCBhbGlhczogJ0NvbW1vbicsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxJywgYWxpYXM6ICdVSScsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEnLCBhbGlhczogJ1Nlc3Npb24nLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEnLCBhbGlhczogJ0FuYWx5dGljcycsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxJywgYWxpYXM6ICdDb2RlTGlzdCcsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MScsIGFsaWFzOiAnUGVyc29uYWxEYXRhJywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MScsIGFsaWFzOiAnQ29tbXVuaWNhdGlvbicsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkhUTUw1LnYxJywgYWxpYXM6ICdIVE1MNScsIHVyaTogJycgfVxuXTtcblxuZXhwb3J0IHR5cGUgUmVmZXJlbmNlc1dpdGhNYXAgPSBSZWZlcmVuY2VbXSAmIHtcbiAgICByZWZlcmVuY2VNYXA/OiBSZWNvcmQ8c3RyaW5nLCBSZWZlcmVuY2U+O1xuICAgIHJldmVyc2VSZWZlcmVuY2VNYXA/OiBSZWNvcmQ8c3RyaW5nLCBSZWZlcmVuY2U+O1xufTtcblxuZnVuY3Rpb24gc3BsaXRBdChzdHJpbmc6IHN0cmluZywgaW5kZXg6IG51bWJlcik6IFtzdHJpbmcsIHN0cmluZ10ge1xuICAgIHJldHVybiBpbmRleCA8IDAgPyBbc3RyaW5nLCAnJ10gOiBbc3RyaW5nLnN1YnN0cmluZygwLCBpbmRleCksIHN0cmluZy5zdWJzdHJpbmcoaW5kZXggKyAxKV07XG59XG5cbmZ1bmN0aW9uIHN1YnN0cmluZ0F0KHN0cmluZzogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGluZGV4IDwgMCA/IHN0cmluZyA6IHN0cmluZy5zdWJzdHJpbmcoMCwgaW5kZXgpO1xufVxuXG4vKipcbiAqIFNwbGl0cyBhIHN0cmluZyBhdCB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhIHNlcGFyYXRvci5cbiAqXG4gKiBAcGFyYW0gc3RyaW5nICAgIFRoZSBzdHJpbmcgdG8gc3BsaXRcbiAqIEBwYXJhbSBzZXBhcmF0b3IgU2VwYXJhdG9yLCBlLmcuIGEgc2luZ2xlIGNoYXJhY3Rlci5cbiAqIEByZXR1cm5zIEFuIGFycmF5IGNvbnNpc3Rpbmcgb2YgdHdvIGVsZW1lbnRzOiB0aGUgcGFydCBiZWZvcmUgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHNlcGFyYXRvciBhbmQgdGhlIHBhcnQgYWZ0ZXIgaXQuIElmIHRoZSBzdHJpbmcgZG9lcyBub3QgY29udGFpbiB0aGUgc2VwYXJhdG9yLCB0aGUgc2Vjb25kIGVsZW1lbnQgaXMgdGhlIGVtcHR5IHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0QXRGaXJzdChzdHJpbmc6IHN0cmluZywgc2VwYXJhdG9yOiBzdHJpbmcpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgICByZXR1cm4gc3BsaXRBdChzdHJpbmcsIHN0cmluZy5pbmRleE9mKHNlcGFyYXRvcikpO1xufVxuXG4vKipcbiAqIFNwbGl0cyBhIHN0cmluZyBhdCB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIGEgc2VwYXJhdG9yLlxuICpcbiAqIEBwYXJhbSBzdHJpbmcgICAgVGhlIHN0cmluZyB0byBzcGxpdFxuICogQHBhcmFtIHNlcGFyYXRvciBTZXBhcmF0b3IsIGUuZy4gYSBzaW5nbGUgY2hhcmFjdGVyLlxuICogQHJldHVybnMgQW4gYXJyYXkgY29uc2lzdGluZyBvZiB0d28gZWxlbWVudHM6IHRoZSBwYXJ0IGJlZm9yZSB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSBzZXBhcmF0b3IgYW5kIHRoZSBwYXJ0IGFmdGVyIGl0LiBJZiB0aGUgc3RyaW5nIGRvZXMgbm90IGNvbnRhaW4gdGhlIHNlcGFyYXRvciwgdGhlIHNlY29uZCBlbGVtZW50IGlzIHRoZSBlbXB0eSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdEF0TGFzdChzdHJpbmc6IHN0cmluZywgc2VwYXJhdG9yOiBzdHJpbmcpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgICByZXR1cm4gc3BsaXRBdChzdHJpbmcsIHN0cmluZy5sYXN0SW5kZXhPZihzZXBhcmF0b3IpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzdWJzdHJpbmcgYmVmb3JlIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGEgc2VwYXJhdG9yLlxuICpcbiAqIEBwYXJhbSBzdHJpbmcgICAgVGhlIHN0cmluZ1xuICogQHBhcmFtIHNlcGFyYXRvciBTZXBhcmF0b3IsIGUuZy4gYSBzaW5nbGUgY2hhcmFjdGVyLlxuICogQHJldHVybnMgVGhlIHN1YnN0cmluZyBiZWZvcmUgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHNlcGFyYXRvciwgb3IgdGhlIGlucHV0IHN0cmluZyBpZiBpdCBkb2VzIG5vdCBjb250YWluIHRoZSBzZXBhcmF0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJzdHJpbmdCZWZvcmVGaXJzdChzdHJpbmc6IHN0cmluZywgc2VwYXJhdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzdWJzdHJpbmdBdChzdHJpbmcsIHN0cmluZy5pbmRleE9mKHNlcGFyYXRvcikpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHN1YnN0cmluZyBiZWZvcmUgdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiBhIHNlcGFyYXRvci5cbiAqXG4gKiBAcGFyYW0gc3RyaW5nICAgIFRoZSBzdHJpbmdcbiAqIEBwYXJhbSBzZXBhcmF0b3IgU2VwYXJhdG9yLCBlLmcuIGEgc2luZ2xlIGNoYXJhY3Rlci5cbiAqIEByZXR1cm5zIFRoZSBzdWJzdHJpbmcgYmVmb3JlIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHNlcGFyYXRvciwgb3IgdGhlIGlucHV0IHN0cmluZyBpZiBpdCBkb2VzIG5vdCBjb250YWluIHRoZSBzZXBhcmF0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJzdHJpbmdCZWZvcmVMYXN0KHN0cmluZzogc3RyaW5nLCBzZXBhcmF0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN1YnN0cmluZ0F0KHN0cmluZywgc3RyaW5nLmxhc3RJbmRleE9mKHNlcGFyYXRvcikpO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhbiB1bmFsaWFzZWQgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGFubm90YXRpb24gdG8gdGhlIGFsaWFzZWQgdmVyc2lvbi5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyBjdXJyZW50UmVmZXJlbmNlcyBmb3IgdGhlIHByb2plY3RcbiAqIEBwYXJhbSB1bmFsaWFzZWRWYWx1ZSB0aGUgdW5hbGlhc2VkIHZhbHVlXG4gKiBAcmV0dXJucyB0aGUgYWxpYXNlZCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBzYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGlhcyhyZWZlcmVuY2VzOiBSZWZlcmVuY2VzV2l0aE1hcCwgdW5hbGlhc2VkVmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCFyZWZlcmVuY2VzLnJldmVyc2VSZWZlcmVuY2VNYXApIHtcbiAgICAgICAgcmVmZXJlbmNlcy5yZXZlcnNlUmVmZXJlbmNlTWFwID0gcmVmZXJlbmNlcy5yZWR1Y2UoKG1hcDogUmVjb3JkPHN0cmluZywgUmVmZXJlbmNlPiwgcmVmKSA9PiB7XG4gICAgICAgICAgICBtYXBbcmVmLm5hbWVzcGFjZV0gPSByZWY7XG4gICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9LCB7fSk7XG4gICAgfVxuICAgIGlmICghdW5hbGlhc2VkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHVuYWxpYXNlZFZhbHVlO1xuICAgIH1cbiAgICBjb25zdCBbbmFtZXNwYWNlLCB2YWx1ZV0gPSBzcGxpdEF0TGFzdCh1bmFsaWFzZWRWYWx1ZSwgJy4nKTtcbiAgICBjb25zdCByZWZlcmVuY2UgPSByZWZlcmVuY2VzLnJldmVyc2VSZWZlcmVuY2VNYXBbbmFtZXNwYWNlXTtcbiAgICBpZiAocmVmZXJlbmNlKSB7XG4gICAgICAgIHJldHVybiBgJHtyZWZlcmVuY2UuYWxpYXN9LiR7dmFsdWV9YDtcbiAgICB9IGVsc2UgaWYgKHVuYWxpYXNlZFZhbHVlLmluY2x1ZGVzKCdAJykpIHtcbiAgICAgICAgLy8gVHJ5IHRvIHNlZSBpZiBpdCdzIGFuIGFubm90YXRpb24gUGF0aCBsaWtlIHRvX1NhbGVzT3JkZXIvQFVJLkxpbmVJdGVtXG4gICAgICAgIGNvbnN0IFtwcmVBbGlhcywgcG9zdEFsaWFzXSA9IHNwbGl0QXRGaXJzdCh1bmFsaWFzZWRWYWx1ZSwgJ0AnKTtcbiAgICAgICAgcmV0dXJuIGAke3ByZUFsaWFzfUAke2FsaWFzKHJlZmVyZW5jZXMsIHBvc3RBbGlhcyl9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdW5hbGlhc2VkVmFsdWU7XG4gICAgfVxufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhbiBhbGlhc2VkIHN0cmluZyByZXByZXNlbnRhdGlvbiBhbm5vdGF0aW9uIHRvIHRoZSB1bmFsaWFzZWQgdmVyc2lvbi5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyBjdXJyZW50UmVmZXJlbmNlcyBmb3IgdGhlIHByb2plY3RcbiAqIEBwYXJhbSBhbGlhc2VkVmFsdWUgdGhlIGFsaWFzZWQgdmFsdWVcbiAqIEByZXR1cm5zIHRoZSB1bmFsaWFzZWQgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgc2FtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5hbGlhcyhyZWZlcmVuY2VzOiBSZWZlcmVuY2VzV2l0aE1hcCwgYWxpYXNlZFZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGlmICghcmVmZXJlbmNlcy5yZWZlcmVuY2VNYXApIHtcbiAgICAgICAgcmVmZXJlbmNlcy5yZWZlcmVuY2VNYXAgPSByZWZlcmVuY2VzLnJlZHVjZSgobWFwOiBSZWNvcmQ8c3RyaW5nLCBSZWZlcmVuY2U+LCByZWYpID0+IHtcbiAgICAgICAgICAgIG1hcFtyZWYuYWxpYXNdID0gcmVmO1xuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSwge30pO1xuICAgIH1cbiAgICBpZiAoIWFsaWFzZWRWYWx1ZSkge1xuICAgICAgICByZXR1cm4gYWxpYXNlZFZhbHVlO1xuICAgIH1cbiAgICBjb25zdCBbdm9jQWxpYXMsIHZhbHVlXSA9IHNwbGl0QXRGaXJzdChhbGlhc2VkVmFsdWUsICcuJyk7XG4gICAgY29uc3QgcmVmZXJlbmNlID0gcmVmZXJlbmNlcy5yZWZlcmVuY2VNYXBbdm9jQWxpYXNdO1xuICAgIGlmIChyZWZlcmVuY2UpIHtcbiAgICAgICAgcmV0dXJuIGAke3JlZmVyZW5jZS5uYW1lc3BhY2V9LiR7dmFsdWV9YDtcbiAgICB9IGVsc2UgaWYgKGFsaWFzZWRWYWx1ZS5pbmNsdWRlcygnQCcpKSB7XG4gICAgICAgIC8vIFRyeSB0byBzZWUgaWYgaXQncyBhbiBhbm5vdGF0aW9uIFBhdGggbGlrZSB0b19TYWxlc09yZGVyL0BVSS5MaW5lSXRlbVxuICAgICAgICBjb25zdCBbcHJlQWxpYXMsIHBvc3RBbGlhc10gPSBzcGxpdEF0Rmlyc3QoYWxpYXNlZFZhbHVlLCAnQCcpO1xuICAgICAgICByZXR1cm4gYCR7cHJlQWxpYXN9QCR7dW5hbGlhcyhyZWZlcmVuY2VzLCBwb3N0QWxpYXMpfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGFsaWFzZWRWYWx1ZTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgRW51bUlzRmxhZzogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7XG4gICAgJ0F1dGguS2V5TG9jYXRpb24nOiBmYWxzZSxcbiAgICAnQ29yZS5SZXZpc2lvbktpbmQnOiBmYWxzZSxcbiAgICAnQ29yZS5EYXRhTW9kaWZpY2F0aW9uT3BlcmF0aW9uS2luZCc6IGZhbHNlLFxuICAgICdDb3JlLlBlcm1pc3Npb24nOiB0cnVlLFxuICAgICdDYXBhYmlsaXRpZXMuQ29uZm9ybWFuY2VMZXZlbFR5cGUnOiBmYWxzZSxcbiAgICAnQ2FwYWJpbGl0aWVzLklzb2xhdGlvbkxldmVsJzogdHJ1ZSxcbiAgICAnQ2FwYWJpbGl0aWVzLk5hdmlnYXRpb25UeXBlJzogZmFsc2UsXG4gICAgJ0NhcGFiaWxpdGllcy5TZWFyY2hFeHByZXNzaW9ucyc6IHRydWUsXG4gICAgJ0NhcGFiaWxpdGllcy5IdHRwTWV0aG9kJzogdHJ1ZSxcbiAgICAnQWdncmVnYXRpb24uUm9sbHVwVHlwZSc6IGZhbHNlLFxuICAgICdDb21tb24uVGV4dEZvcm1hdFR5cGUnOiBmYWxzZSxcbiAgICAnQ29tbW9uLkZpbHRlckV4cHJlc3Npb25UeXBlJzogZmFsc2UsXG4gICAgJ0NvbW1vbi5GaWVsZENvbnRyb2xUeXBlJzogZmFsc2UsXG4gICAgJ0NvbW1vbi5FZmZlY3RUeXBlJzogdHJ1ZSxcbiAgICAnQ29tbXVuaWNhdGlvbi5LaW5kVHlwZSc6IGZhbHNlLFxuICAgICdDb21tdW5pY2F0aW9uLkNvbnRhY3RJbmZvcm1hdGlvblR5cGUnOiB0cnVlLFxuICAgICdDb21tdW5pY2F0aW9uLlBob25lVHlwZSc6IHRydWUsXG4gICAgJ0NvbW11bmljYXRpb24uR2VuZGVyVHlwZSc6IGZhbHNlLFxuICAgICdVSS5WaXN1YWxpemF0aW9uVHlwZSc6IGZhbHNlLFxuICAgICdVSS5Dcml0aWNhbGl0eVR5cGUnOiBmYWxzZSxcbiAgICAnVUkuSW1wcm92ZW1lbnREaXJlY3Rpb25UeXBlJzogZmFsc2UsXG4gICAgJ1VJLlRyZW5kVHlwZSc6IGZhbHNlLFxuICAgICdVSS5DaGFydFR5cGUnOiBmYWxzZSxcbiAgICAnVUkuQ2hhcnRBeGlzU2NhbGVCZWhhdmlvclR5cGUnOiBmYWxzZSxcbiAgICAnVUkuQ2hhcnRBeGlzQXV0b1NjYWxlRGF0YVNjb3BlVHlwZSc6IGZhbHNlLFxuICAgICdVSS5DaGFydERpbWVuc2lvblJvbGVUeXBlJzogZmFsc2UsXG4gICAgJ1VJLkNoYXJ0TWVhc3VyZVJvbGVUeXBlJzogZmFsc2UsXG4gICAgJ1VJLlNlbGVjdGlvblJhbmdlU2lnblR5cGUnOiBmYWxzZSxcbiAgICAnVUkuU2VsZWN0aW9uUmFuZ2VPcHRpb25UeXBlJzogZmFsc2UsXG4gICAgJ1VJLlRleHRBcnJhbmdlbWVudFR5cGUnOiBmYWxzZSxcbiAgICAnVUkuSW1wb3J0YW5jZVR5cGUnOiBmYWxzZSxcbiAgICAnVUkuQ3JpdGljYWxpdHlSZXByZXNlbnRhdGlvblR5cGUnOiBmYWxzZSxcbiAgICAnVUkuT3BlcmF0aW9uR3JvdXBpbmdUeXBlJzogZmFsc2Vcbn07XG5leHBvcnQgZW51bSBUZXJtVG9UeXBlcyB7XG4gICAgJ09yZy5PRGF0YS5BdXRob3JpemF0aW9uLlYxLlNlY3VyaXR5U2NoZW1lcycgPSAnT3JnLk9EYXRhLkF1dGhvcml6YXRpb24uVjEuU2VjdXJpdHlTY2hlbWUnLFxuICAgICdPcmcuT0RhdGEuQXV0aG9yaXphdGlvbi5WMS5BdXRob3JpemF0aW9ucycgPSAnT3JnLk9EYXRhLkF1dGhvcml6YXRpb24uVjEuQXV0aG9yaXphdGlvbicsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLlJldmlzaW9ucycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuUmV2aXNpb25UeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuTGlua3MnID0gJ09yZy5PRGF0YS5Db3JlLlYxLkxpbmsnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5FeGFtcGxlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5FeGFtcGxlVmFsdWUnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5NZXNzYWdlcycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuTWVzc2FnZVR5cGUnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5WYWx1ZUV4Y2VwdGlvbicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVmFsdWVFeGNlcHRpb25UeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuUmVzb3VyY2VFeGNlcHRpb24nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlJlc291cmNlRXhjZXB0aW9uVHlwZScsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkRhdGFNb2RpZmljYXRpb25FeGNlcHRpb24nID0gJ09yZy5PRGF0YS5Db3JlLlYxLkRhdGFNb2RpZmljYXRpb25FeGNlcHRpb25UeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuSXNMYW5ndWFnZURlcGVuZGVudCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuQXBwbGllc1ZpYUNvbnRhaW5lcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuRGVyZWZlcmVuY2VhYmxlSURzJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5Db252ZW50aW9uYWxJRHMnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLlBlcm1pc3Npb25zJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5QZXJtaXNzaW9uJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuRGVmYXVsdE5hbWVzcGFjZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuSW1tdXRhYmxlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5Db21wdXRlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWREZWZhdWx0VmFsdWUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLklzVVJMJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5Jc01lZGlhVHlwZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuQ29udGVudERpc3Bvc2l0aW9uJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5Db250ZW50RGlzcG9zaXRpb25UeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuT3B0aW1pc3RpY0NvbmN1cnJlbmN5JyA9ICdFZG0uUHJvcGVydHlQYXRoJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuQWRkaXRpb25hbFByb3BlcnRpZXMnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkF1dG9FeHBhbmQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkF1dG9FeHBhbmRSZWZlcmVuY2VzJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5NYXlJbXBsZW1lbnQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlF1YWxpZmllZFR5cGVOYW1lJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuT3JkZXJlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuUG9zaXRpb25hbEluc2VydCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuQWx0ZXJuYXRlS2V5cycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuQWx0ZXJuYXRlS2V5JyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuT3B0aW9uYWxQYXJhbWV0ZXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLk9wdGlvbmFsUGFyYW1ldGVyVHlwZScsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLk9wZXJhdGlvbkF2YWlsYWJsZScgPSAnRWRtLkJvb2xlYW4nLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5TeW1ib2xpY05hbWUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlNpbXBsZUlkZW50aWZpZXInLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5HZW9tZXRyeUZlYXR1cmUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLkdlb21ldHJ5RmVhdHVyZVR5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbmZvcm1hbmNlTGV2ZWwnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ29uZm9ybWFuY2VMZXZlbFR5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkFzeW5jaHJvbm91c1JlcXVlc3RzU3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkJhdGNoQ29udGludWVPbkVycm9yU3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLklzb2xhdGlvblN1cHBvcnRlZCcgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Jc29sYXRpb25MZXZlbCcsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ3Jvc3NKb2luU3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNhbGxiYWNrU3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNhbGxiYWNrVHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ2hhbmdlVHJhY2tpbmcnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ2hhbmdlVHJhY2tpbmdUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Db3VudFJlc3RyaWN0aW9ucycgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Db3VudFJlc3RyaWN0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk5hdmlnYXRpb25SZXN0cmljdGlvbnMnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuTmF2aWdhdGlvblJlc3RyaWN0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluZGV4YWJsZUJ5S2V5JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlRvcFN1cHBvcnRlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Ta2lwU3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbXB1dGVTdXBwb3J0ZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VsZWN0U3VwcG9ydCcgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TZWxlY3RTdXBwb3J0VHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQmF0Y2hTdXBwb3J0ZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQmF0Y2hTdXBwb3J0JyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkJhdGNoU3VwcG9ydFR5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlclJlc3RyaWN0aW9ucycgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJSZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Tb3J0UmVzdHJpY3Rpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNvcnRSZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5FeHBhbmRSZXN0cmljdGlvbnMnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRXhwYW5kUmVzdHJpY3Rpb25zVHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlYXJjaFJlc3RyaWN0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLktleUFzU2VnbWVudFN1cHBvcnRlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5RdWVyeVNlZ21lbnRTdXBwb3J0ZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuSW5zZXJ0UmVzdHJpY3Rpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluc2VydFJlc3RyaWN0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlZXBJbnNlcnRTdXBwb3J0JyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlZXBJbnNlcnRTdXBwb3J0VHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuVXBkYXRlUmVzdHJpY3Rpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlVwZGF0ZVJlc3RyaWN0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlZXBVcGRhdGVTdXBwb3J0JyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlZXBVcGRhdGVTdXBwb3J0VHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRGVsZXRlUmVzdHJpY3Rpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlbGV0ZVJlc3RyaWN0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbGxlY3Rpb25Qcm9wZXJ0eVJlc3RyaWN0aW9ucycgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Db2xsZWN0aW9uUHJvcGVydHlSZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5PcGVyYXRpb25SZXN0cmljdGlvbnMnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuT3BlcmF0aW9uUmVzdHJpY3Rpb25zVHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQW5ub3RhdGlvblZhbHVlc0luUXVlcnlTdXBwb3J0ZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuTW9kaWZpY2F0aW9uUXVlcnlPcHRpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk1vZGlmaWNhdGlvblF1ZXJ5T3B0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlJlYWRSZXN0cmljdGlvbnMnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuUmVhZFJlc3RyaWN0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkN1c3RvbUhlYWRlcnMnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ3VzdG9tUGFyYW1ldGVyJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DdXN0b21RdWVyeU9wdGlvbnMnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ3VzdG9tUGFyYW1ldGVyJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5NZWRpYUxvY2F0aW9uVXBkYXRlU3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQXBwbHlTdXBwb3J0ZWQnID0gJ09yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BcHBseVN1cHBvcnRlZFR5cGUnLFxuICAgICdPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQXBwbHlTdXBwb3J0ZWREZWZhdWx0cycgPSAnT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkFwcGx5U3VwcG9ydGVkQmFzZScsXG4gICAgJ09yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5Hcm91cGFibGUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BZ2dyZWdhdGFibGUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5Db250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzJyA9ICdFZG0uUHJvcGVydHlQYXRoJyxcbiAgICAnT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkxldmVsZWRIaWVyYXJjaHknID0gJ0VkbS5Qcm9wZXJ0eVBhdGgnLFxuICAgICdPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuUmVjdXJzaXZlSGllcmFyY2h5JyA9ICdPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuUmVjdXJzaXZlSGllcmFyY2h5VHlwZScsXG4gICAgJ09yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BdmFpbGFibGVPbkFnZ3JlZ2F0ZXMnID0gJ09yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BdmFpbGFibGVPbkFnZ3JlZ2F0ZXNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWluaW11bScgPSAnRWRtLlByaW1pdGl2ZVR5cGUnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NYXhpbXVtJyA9ICdFZG0uUHJpbWl0aXZlVHlwZScsXG4gICAgJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkV4Y2x1c2l2ZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuQWxsb3dlZFZhbHVlcycgPSAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuQWxsb3dlZFZhbHVlJyxcbiAgICAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTXVsdGlwbGVPZicgPSAnRWRtLkRlY2ltYWwnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5Db25zdHJhaW50JyA9ICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5Db25zdHJhaW50VHlwZScsXG4gICAgJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkl0ZW1zT2YnID0gJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkl0ZW1zT2ZUeXBlJyxcbiAgICAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuT3BlblByb3BlcnR5VHlwZUNvbnN0cmFpbnQnID0gJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLlNpbmdsZU9yQ29sbGVjdGlvblR5cGUnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5EZXJpdmVkVHlwZUNvbnN0cmFpbnQnID0gJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLlNpbmdsZU9yQ29sbGVjdGlvblR5cGUnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5BbGxvd2VkVGVybXMnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlF1YWxpZmllZFRlcm1OYW1lJyxcbiAgICAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuQXBwbGljYWJsZVRlcm1zJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5RdWFsaWZpZWRUZXJtTmFtZScsXG4gICAgJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1heEl0ZW1zJyA9ICdFZG0uSW50NjQnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NaW5JdGVtcycgPSAnRWRtLkludDY0JyxcbiAgICAnT3JnLk9EYXRhLk1lYXN1cmVzLlYxLlNjYWxlJyA9ICdFZG0uQnl0ZScsXG4gICAgJ09yZy5PRGF0YS5NZWFzdXJlcy5WMS5EdXJhdGlvbkdyYW51bGFyaXR5JyA9ICdPcmcuT0RhdGEuTWVhc3VyZXMuVjEuRHVyYXRpb25HcmFudWxhcml0eVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuRGltZW5zaW9uJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuTWVhc3VyZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFjY3VtdWxhdGl2ZU1lYXN1cmUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5Sb2xsZWRVcFByb3BlcnR5Q291bnQnID0gJ0VkbS5JbnQxNicsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5QbGFubmluZ0FjdGlvbicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuQWdncmVnYXRlZFByb3BlcnR5VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BZ2dyZWdhdGVkUHJvcGVydHknID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BZ2dyZWdhdGVkUHJvcGVydHlUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFuYWx5dGljYWxDb250ZXh0JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuQW5hbHl0aWNhbENvbnRleHRUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlcnZpY2VWZXJzaW9uJyA9ICdFZG0uSW50MzInLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VydmljZVNjaGVtYVZlcnNpb24nID0gJ0VkbS5JbnQzMicsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0Rm9yJyA9ICdFZG0uUHJvcGVydHlQYXRoJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzTGFuZ3VhZ2VJZGVudGlmaWVyJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEZvcm1hdCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRGb3JtYXRUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRGlnaXRTZXF1ZW5jZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzVXBwZXJDYXNlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDdXJyZW5jeScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzVW5pdCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlVuaXRTcGVjaWZpY1NjYWxlJyA9ICdFZG0uUHJpbWl0aXZlVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Vbml0U3BlY2lmaWNQcmVjaXNpb24nID0gJ0VkbS5QcmltaXRpdmVUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlY29uZGFyeUtleScgPSAnRWRtLlByb3BlcnR5UGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NaW5PY2N1cnMnID0gJ0VkbS5JbnQ2NCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NYXhPY2N1cnMnID0gJ0VkbS5JbnQ2NCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Bc3NvY2lhdGlvbkVudGl0eScgPSAnRWRtLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVyaXZlZE5hdmlnYXRpb24nID0gJ0VkbS5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1hc2tlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJldmVhbE9uRGVtYW5kJyA9ICdFZG0uQm9vbGVhbicsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmcnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzSW5zdGFuY2VBbm5vdGF0aW9uJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvblR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5BcHBsaWNhdGlvbicgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkFwcGxpY2F0aW9uVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UaW1lc3RhbXAnID0gJ0VkbS5EYXRlVGltZU9mZnNldCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5FcnJvclJlc29sdXRpb24nID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5FcnJvclJlc29sdXRpb25UeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzJyA9ICdFZG0uQ29tcGxleFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEubnVtZXJpY1NldmVyaXR5JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTnVtZXJpY01lc3NhZ2VTZXZlcml0eVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWF4aW11bU51bWVyaWNNZXNzYWdlU2V2ZXJpdHknID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5OdW1lcmljTWVzc2FnZVNldmVyaXR5VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0FjdGlvbkNyaXRpY2FsJyA9ICdFZG0uQm9vbGVhbicsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5BdHRyaWJ1dGVzJyA9ICdFZG0uUHJvcGVydHlQYXRoJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlbGF0ZWRSZWN1cnNpdmVIaWVyYXJjaHknID0gJ0VkbS5Bbm5vdGF0aW9uUGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5JbnRlcnZhbCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkludGVydmFsVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU0FQT2JqZWN0Tm9kZVR5cGUnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TQVBPYmplY3ROb2RlVHlwZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQ29tcG9zaXRpb24nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc05hdHVyYWxQZXJzb24nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3QnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVycycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuU2ltcGxlSWRlbnRpZmllcicsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RNYXBwaW5nJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0TWFwcGluZ1R5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhclllYXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFySGFsZnllYXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyUXVhcnRlcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJNb250aCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJXZWVrJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNEYXlPZkNhbGVuZGFyTW9udGgnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0RheU9mQ2FsZW5kYXJZZWFyJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhclllYXJIYWxmeWVhcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJZZWFyUXVhcnRlcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJZZWFyTW9udGgnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyWWVhcldlZWsnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyRGF0ZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsUGVyaW9kJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNGaXNjYWxZZWFyUGVyaW9kJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNGaXNjYWxRdWFydGVyJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNGaXNjYWxZZWFyUXVhcnRlcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsV2VlaycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhcldlZWsnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0RheU9mRmlzY2FsWWVhcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhclZhcmlhbnQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NdXR1YWxseUV4Y2x1c2l2ZVRlcm0nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRBY3RpdmF0aW9uVmlhJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5TaW1wbGVJZGVudGlmaWVyJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkVkaXRhYmxlRmllbGRGb3InID0gJ0VkbS5Qcm9wZXJ0eVBhdGgnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNLZXknID0gJ0VkbS5Qcm9wZXJ0eVBhdGgnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2lkZUVmZmVjdHMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TaWRlRWZmZWN0c1R5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUXVhbGlmaWVkTmFtZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWx0ZXJEZWZhdWx0VmFsdWUnID0gJ0VkbS5QcmltaXRpdmVUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpbHRlckRlZmF1bHRWYWx1ZUhpZ2gnID0gJ0VkbS5QcmltaXRpdmVUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNvcnRPcmRlcicgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNvcnRPcmRlclR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVjdXJzaXZlSGllcmFyY2h5JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVjdXJzaXZlSGllcmFyY2h5VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5DcmVhdGVkQXQnID0gJ0VkbS5EYXRlVGltZU9mZnNldCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5DcmVhdGVkQnknID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Vc2VySUQnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQ2hhbmdlZEF0JyA9ICdFZG0uRGF0ZVRpbWVPZmZzZXQnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQ2hhbmdlZEJ5JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVXNlcklEJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkFwcGx5TXVsdGlVbml0QmVoYXZpb3JGb3JTb3J0aW5nQW5kRmlsdGVyaW5nJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUHJpbWl0aXZlUHJvcGVydHlQYXRoJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db2RlTGlzdC52MS5DdXJyZW5jeUNvZGVzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db2RlTGlzdC52MS5Db2RlTGlzdFNvdXJjZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLlVuaXRzT2ZNZWFzdXJlJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db2RlTGlzdC52MS5Db2RlTGlzdFNvdXJjZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLlN0YW5kYXJkQ29kZScgPSAnRWRtLlByb3BlcnR5UGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLkV4dGVybmFsQ29kZScgPSAnRWRtLlByb3BlcnR5UGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLklzQ29uZmlndXJhdGlvbkRlcHJlY2F0aW9uQ29kZScgPSAnRWRtLkJvb2xlYW4nLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3QnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkFkZHJlc3MnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQWRkcmVzc1R5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLklzRW1haWxBZGRyZXNzJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLklzUGhvbmVOdW1iZXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuRXZlbnQnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuRXZlbnREYXRhJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5UYXNrJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLlRhc2tEYXRhJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5NZXNzYWdlJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLk1lc3NhZ2VEYXRhJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuSGllcmFyY2h5LnYxLlJlY3Vyc2l2ZUhpZXJhcmNoeScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuSGllcmFyY2h5LnYxLlJlY3Vyc2l2ZUhpZXJhcmNoeVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuRW50aXR5U2VtYW50aWNzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuRW50aXR5U2VtYW50aWNzVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5GaWVsZFNlbWFudGljcycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLkZpZWxkU2VtYW50aWNzVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5UGVyc29uYWwnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5U2Vuc2l0aXZlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWQnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLklkZW50aWZpY2F0aW9uJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRBYnN0cmFjdCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkJhZGdlJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5CYWRnZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkQWJzdHJhY3QnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TdGF0dXNJbmZvJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRBYnN0cmFjdCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXAnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXBUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ29ubmVjdGVkRmllbGRzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db25uZWN0ZWRGaWVsZHNUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuR2VvTG9jYXRpb25zJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5HZW9Mb2NhdGlvblR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5HZW9Mb2NhdGlvbicgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuR2VvTG9jYXRpb25UeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ29udGFjdHMnID0gJ0VkbS5Bbm5vdGF0aW9uUGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk1lZGlhUmVzb3VyY2UnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk1lZGlhUmVzb3VyY2VUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuS1BJJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5LUElUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnQnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0RGVmaW5pdGlvblR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WYWx1ZUNyaXRpY2FsaXR5JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WYWx1ZUNyaXRpY2FsaXR5VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5TGFiZWxzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eUxhYmVsVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkcycgPSAnRWRtLlByb3BlcnR5UGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZhY2V0cycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXQnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJGYWNldHMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZhY2V0JyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUXVpY2tWaWV3RmFjZXRzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GYWNldCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlF1aWNrQ3JlYXRlRmFjZXRzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GYWNldCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpbHRlckZhY2V0cycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXQnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnQnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnRUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uVmFyaWFudCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uVmFyaWFudFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UaGluZ1BlcnNwZWN0aXZlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc1N1bW1hcnknID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlBhcnRPZlByZXZpZXcnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk1hcCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuR2FsbGVyeScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSXNJbWFnZVVSTCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSXNJbWFnZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTXVsdGlMaW5lVGV4dCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW4nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLklzQ29weUFjdGlvbicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JlYXRlSGlkZGVuJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5VcGRhdGVIaWRkZW4nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRlbGV0ZUhpZGRlbicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuRmlsdGVyJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5BZGFwdGF0aW9uSGlkZGVuJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGREZWZhdWx0JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRBYnN0cmFjdCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkVtcGhhc2l6ZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk9yZGVyQnknID0gJ0VkbS5Qcm9wZXJ0eVBhdGgnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QYXJhbWV0ZXJEZWZhdWx0VmFsdWUnID0gJ0VkbS5QcmltaXRpdmVUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVjb21tZW5kYXRpb25TdGF0ZScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVjb21tZW5kYXRpb25TdGF0ZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWNvbW1lbmRhdGlvbkxpc3QnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlY29tbWVuZGF0aW9uTGlzdFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5FeGNsdWRlRnJvbU5hdmlnYXRpb25Db250ZXh0JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Eb05vdENoZWNrU2NhbGVPZk1lYXN1cmVkUXVhbnRpdHknID0gJ0VkbS5Cb29sZWFuJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuSFRNTDUudjEuQ3NzRGVmYXVsdHMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkhUTUw1LnYxLkNzc0RlZmF1bHRzVHlwZSdcbn1cblxuLyoqXG4gKiBEaWZmZXJlbnRpYXRlIGJldHdlZW4gYSBDb21wbGV4VHlwZSBhbmQgYSBUeXBlRGVmaW5pdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29tcGxleFR5cGVEZWZpbml0aW9uXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBhIGNvbXBsZXggdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wbGV4VHlwZURlZmluaXRpb24oXG4gICAgY29tcGxleFR5cGVEZWZpbml0aW9uPzogQ29tcGxleFR5cGUgfCBUeXBlRGVmaW5pdGlvblxuKTogY29tcGxleFR5cGVEZWZpbml0aW9uIGlzIENvbXBsZXhUeXBlIHtcbiAgICByZXR1cm4gKFxuICAgICAgICAhIWNvbXBsZXhUeXBlRGVmaW5pdGlvbiAmJiBjb21wbGV4VHlwZURlZmluaXRpb24uX3R5cGUgPT09ICdDb21wbGV4VHlwZScgJiYgISFjb21wbGV4VHlwZURlZmluaXRpb24ucHJvcGVydGllc1xuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWNpbWFsKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpc0RlY2ltYWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdmFsdWVPZigpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbi8qKlxuICogRGVmaW5lcyBhIGxhenkgcHJvcGVydHkuXG4gKlxuICogVGhlIHByb3BlcnR5IGlzIGluaXRpYWxpemVkIGJ5IGNhbGxpbmcgdGhlIGluaXQgZnVuY3Rpb24gb24gdGhlIGZpcnN0IHJlYWQgYWNjZXNzLCBvciBieSBkaXJlY3RseSBhc3NpZ25pbmcgYSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gb2JqZWN0ICAgIFRoZSBob3N0IG9iamVjdFxuICogQHBhcmFtIHByb3BlcnR5ICBUaGUgbGF6eSBwcm9wZXJ0eSB0byBhZGRcbiAqIEBwYXJhbSBpbml0ICAgICAgVGhlIGZ1bmN0aW9uIHRoYXQgaW5pdGlhbGl6ZXMgdGhlIHByb3BlcnR5J3MgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhenk8VHlwZSwgS2V5IGV4dGVuZHMga2V5b2YgVHlwZT4ob2JqZWN0OiBUeXBlLCBwcm9wZXJ0eTogS2V5LCBpbml0OiAoKSA9PiBUeXBlW0tleV0pIHtcbiAgICBjb25zdCBpbml0aWFsID0gU3ltYm9sKCdpbml0aWFsJyk7XG4gICAgbGV0IF92YWx1ZTogVHlwZVtLZXldIHwgdHlwZW9mIGluaXRpYWwgPSBpbml0aWFsO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgcHJvcGVydHksIHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcblxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICBpZiAoX3ZhbHVlID09PSBpbml0aWFsKSB7XG4gICAgICAgICAgICAgICAgX3ZhbHVlID0gaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF92YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQodmFsdWU6IFR5cGVbS2V5XSkge1xuICAgICAgICAgICAgX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBhbGxvd3MgdG8gZmluZCBhbiBhcnJheSBlbGVtZW50IGJ5IHByb3BlcnR5IHZhbHVlLlxuICpcbiAqIEBwYXJhbSBhcnJheSAgICAgVGhlIGFycmF5XG4gKiBAcGFyYW0gcHJvcGVydHkgIEVsZW1lbnRzIGluIHRoZSBhcnJheSBhcmUgc2VhcmNoZWQgYnkgdGhpcyBwcm9wZXJ0eVxuICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgYW4gZWxlbWVudCBvZiB0aGUgYXJyYXkgYnkgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJbmRleGVkRmluZDxUPihhcnJheTogQXJyYXk8VD4sIHByb3BlcnR5OiBrZXlvZiBUKSB7XG4gICAgY29uc3QgaW5kZXg6IE1hcDxUW2tleW9mIFRdLCBUIHwgdW5kZWZpbmVkPiA9IG5ldyBNYXAoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBmaW5kKHZhbHVlOiBUW2tleW9mIFRdKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBpbmRleC5nZXQodmFsdWUpO1xuXG4gICAgICAgIGlmIChlbGVtZW50Py5bcHJvcGVydHldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXJyYXkuZmluZCgoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFlbGVtZW50Py5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBlbGVtZW50W3Byb3BlcnR5XTtcbiAgICAgICAgICAgIGluZGV4LnNldChwcm9wZXJ0eVZhbHVlLCBlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eVZhbHVlID09PSB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBBZGRzIGEgJ2dldCBieSB2YWx1ZScgZnVuY3Rpb24gdG8gYW4gYXJyYXkuXG4gKlxuICogSWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBhZGRJbmRleChteUFycmF5LCAnbmFtZScpLCBhIG5ldyBmdW5jdGlvbiAnYnlfbmFtZSh2YWx1ZSknIHdpbGwgYmUgYWRkZWQgdGhhdCBhbGxvd3MgdG9cbiAqIGZpbmQgYSBtZW1iZXIgb2YgdGhlIGFycmF5IGJ5IHRoZSB2YWx1ZSBvZiBpdHMgJ25hbWUnIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBhcnJheSAgICAgIFRoZSBhcnJheVxuICogQHBhcmFtIHByb3BlcnR5ICAgVGhlIHByb3BlcnR5IHRoYXQgd2lsbCBiZSB1c2VkIGJ5IHRoZSAnYnlfe3Byb3BlcnR5fSgpJyBmdW5jdGlvblxuICogQHJldHVybnMgVGhlIGFycmF5IHdpdGggdGhlIGFkZGVkIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRHZXRCeVZhbHVlPFQsIFAgZXh0ZW5kcyBFeHRyYWN0PGtleW9mIFQsIHN0cmluZz4+KGFycmF5OiBBcnJheTxUPiwgcHJvcGVydHk6IFApIHtcbiAgICBjb25zdCBpbmRleE5hbWU6IGtleW9mIEluZGV4PFQsIFA+ID0gYGJ5XyR7cHJvcGVydHl9YDtcblxuICAgIGlmICghYXJyYXkuaGFzT3duUHJvcGVydHkoaW5kZXhOYW1lKSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYXJyYXksIGluZGV4TmFtZSwgeyB3cml0YWJsZTogZmFsc2UsIHZhbHVlOiBjcmVhdGVJbmRleGVkRmluZChhcnJheSwgcHJvcGVydHkpIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJyR7aW5kZXhOYW1lfScgYWxyZWFkeSBleGlzdHNgKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5IGFzIEFycmF5V2l0aEluZGV4PFQsIFA+O1xufVxuIiwiaW1wb3J0IHR5cGUge1xuICAgIEFubm90YXRpb25QYXRoRXhwcmVzc2lvbixcbiAgICBBbm5vdGF0aW9uUmVjb3JkLFxuICAgIEFubm90YXRpb25UZXJtLFxuICAgIEV4cHJlc3Npb24sXG4gICAgTmF2aWdhdGlvblByb3BlcnR5UGF0aEV4cHJlc3Npb24sXG4gICAgUGF0aEV4cHJlc3Npb24sXG4gICAgUHJvcGVydHlQYXRoRXhwcmVzc2lvbixcbiAgICBSYXdBbm5vdGF0aW9uLFxuICAgIFJlZmVyZW5jZVxufSBmcm9tICdAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcyc7XG5pbXBvcnQgeyB1bmFsaWFzIH0gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICogUmV2ZXJ0IGFuIG9iamVjdCB0byBpdHMgcmF3IHR5cGUgZXF1aXZhbGVudC5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgY3VycmVudCByZWZlcmVuY2VcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgdG8gcmV2ZXJ0XG4gKiBAcmV0dXJucyB0aGUgcmF3IHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHJldmVydE9iamVjdFRvUmF3VHlwZShyZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSwgdmFsdWU6IGFueSkge1xuICAgIGxldCByZXN1bHQ6IEV4cHJlc3Npb24gfCB1bmRlZmluZWQ7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdDb2xsZWN0aW9uJyxcbiAgICAgICAgICAgIENvbGxlY3Rpb246IHZhbHVlLm1hcCgoYW5ubykgPT4gcmV2ZXJ0Q29sbGVjdGlvbkl0ZW1Ub1Jhd1R5cGUocmVmZXJlbmNlcywgYW5ubykpIGFzIGFueVtdXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS5pc0RlY2ltYWw/LigpKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdEZWNpbWFsJyxcbiAgICAgICAgICAgIERlY2ltYWw6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUuaXNTdHJpbmc/LigpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlTWF0Y2hlcyA9IHZhbHVlLnZhbHVlT2YoKS5zcGxpdCgnLicpO1xuICAgICAgICBpZiAodmFsdWVNYXRjaGVzLmxlbmd0aCA+IDEgJiYgcmVmZXJlbmNlcy5maW5kKChyZWYpID0+IHJlZi5hbGlhcyA9PT0gdmFsdWVNYXRjaGVzWzBdKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdFbnVtTWVtYmVyJyxcbiAgICAgICAgICAgICAgICBFbnVtTWVtYmVyOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgICAgICAgU3RyaW5nOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHZhbHVlLmlzSW50Py4oKSkge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnSW50JyxcbiAgICAgICAgICAgIEludDogdmFsdWUudmFsdWVPZigpXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS5pc0Zsb2F0Py4oKSkge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnRmxvYXQnLFxuICAgICAgICAgICAgRmxvYXQ6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUuaXNEYXRlPy4oKSkge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnRGF0ZScsXG4gICAgICAgICAgICBEYXRlOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLmlzQm9vbGVhbj8uKCkpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0Jvb2wnLFxuICAgICAgICAgICAgQm9vbDogdmFsdWUudmFsdWVPZigpID09PSAndHJ1ZSdcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLnR5cGUgPT09ICdQYXRoJykge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnUGF0aCcsXG4gICAgICAgICAgICBQYXRoOiB2YWx1ZS5wYXRoXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS50eXBlID09PSAnQW5ub3RhdGlvblBhdGgnKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICBBbm5vdGF0aW9uUGF0aDogdmFsdWUudmFsdWVcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLnR5cGUgPT09ICdBcHBseScpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0FwcGx5JyxcbiAgICAgICAgICAgIEFwcGx5OiB2YWx1ZS5BcHBseVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUudHlwZSA9PT0gJ051bGwnKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdOdWxsJ1xuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUudHlwZSA9PT0gJ1Byb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ1Byb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICBQcm9wZXJ0eVBhdGg6IHZhbHVlLnZhbHVlXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS50eXBlID09PSAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgTmF2aWdhdGlvblByb3BlcnR5UGF0aDogdmFsdWUudmFsdWVcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJyRUeXBlJykpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ1JlY29yZCcsXG4gICAgICAgICAgICBSZWNvcmQ6IHJldmVydENvbGxlY3Rpb25JdGVtVG9SYXdUeXBlKHJlZmVyZW5jZXMsIHZhbHVlKSBhcyBBbm5vdGF0aW9uUmVjb3JkXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUmV2ZXJ0IGEgdmFsdWUgdG8gaXRzIHJhdyB2YWx1ZSBkZXBlbmRpbmcgb24gaXRzIHR5cGUuXG4gKlxuICogQHBhcmFtIHJlZmVyZW5jZXMgdGhlIGN1cnJlbnQgc2V0IG9mIHJlZmVyZW5jZVxuICogQHBhcmFtIHZhbHVlIHRoZSB2YWx1ZSB0byByZXZlcnRcbiAqIEByZXR1cm5zIHRoZSByYXcgZXhwcmVzc2lvblxuICovXG5mdW5jdGlvbiByZXZlcnRWYWx1ZVRvUmF3VHlwZShyZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSwgdmFsdWU6IGFueSk6IEV4cHJlc3Npb24gfCB1bmRlZmluZWQge1xuICAgIGxldCByZXN1bHQ6IEV4cHJlc3Npb24gfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgdmFsdWVDb25zdHJ1Y3RvciA9IHZhbHVlPy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIHN3aXRjaCAodmFsdWVDb25zdHJ1Y3Rvcikge1xuICAgICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgY29uc3QgdmFsdWVNYXRjaGVzID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgaWYgKHZhbHVlTWF0Y2hlcy5sZW5ndGggPiAxICYmIHJlZmVyZW5jZXMuZmluZCgocmVmKSA9PiByZWYuYWxpYXMgPT09IHZhbHVlTWF0Y2hlc1swXSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdFbnVtTWVtYmVyJyxcbiAgICAgICAgICAgICAgICAgICAgRW51bU1lbWJlcjogdmFsdWUudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgIFN0cmluZzogdmFsdWUudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnQm9vbGVhbic6XG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdCb29sJyxcbiAgICAgICAgICAgICAgICBCb29sOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdOdW1iZXInOlxuICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgaWYgKHZhbHVlLnRvU3RyaW5nKCkgPT09IHZhbHVlLnRvRml4ZWQoKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ludCcsXG4gICAgICAgICAgICAgICAgICAgIEludDogdmFsdWUudmFsdWVPZigpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRGVjaW1hbCcsXG4gICAgICAgICAgICAgICAgICAgIERlY2ltYWw6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJlc3VsdCA9IHJldmVydE9iamVjdFRvUmF3VHlwZShyZWZlcmVuY2VzLCB2YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY29uc3QgcmVzdHJpY3RlZEtleXMgPSBbJyRUeXBlJywgJ3Rlcm0nLCAnX19zb3VyY2UnLCAncXVhbGlmaWVyJywgJ0FjdGlvblRhcmdldCcsICdmdWxseVF1YWxpZmllZE5hbWUnLCAnYW5ub3RhdGlvbnMnXTtcblxuLyoqXG4gKiBSZXZlcnQgdGhlIGN1cnJlbnQgZW1iZWRkZWQgYW5ub3RhdGlvbnMgdG8gdGhlaXIgcmF3IHR5cGUuXG4gKlxuICogQHBhcmFtIHJlZmVyZW5jZXMgdGhlIGN1cnJlbnQgc2V0IG9mIHJlZmVyZW5jZVxuICogQHBhcmFtIGN1cnJlbnRBbm5vdGF0aW9ucyB0aGUgY29sbGVjdGlvbiBpdGVtIHRvIGV2YWx1YXRlXG4gKiBAcGFyYW0gdGFyZ2V0QW5ub3RhdGlvbnMgdGhlIHBsYWNlIHdoZXJlIHdlIG5lZWQgdG8gYWRkIHRoZSBhbm5vdGF0aW9uXG4gKi9cbmZ1bmN0aW9uIHJldmVydEFubm90YXRpb25zVG9SYXdUeXBlKFxuICAgIHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLFxuICAgIGN1cnJlbnRBbm5vdGF0aW9uczogYW55LFxuICAgIHRhcmdldEFubm90YXRpb25zOiBSYXdBbm5vdGF0aW9uW11cbikge1xuICAgIE9iamVjdC5rZXlzKGN1cnJlbnRBbm5vdGF0aW9ucylcbiAgICAgICAgLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICdfYW5ub3RhdGlvbnMnKVxuICAgICAgICAuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjdXJyZW50QW5ub3RhdGlvbnNba2V5XSkuZm9yRWFjaCgodGVybSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFubm90YXRpb24gPSByZXZlcnRUZXJtVG9HZW5lcmljVHlwZShyZWZlcmVuY2VzLCBjdXJyZW50QW5ub3RhdGlvbnNba2V5XVt0ZXJtXSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZWRBbm5vdGF0aW9uLnRlcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5hbGlhc2VkVGVybSA9IHVuYWxpYXMocmVmZXJlbmNlcywgYCR7a2V5fS4ke3Rlcm19YCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1bmFsaWFzZWRUZXJtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWFsaWZpZWRTcGxpdCA9IHVuYWxpYXNlZFRlcm0uc3BsaXQoJyMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZEFubm90YXRpb24udGVybSA9IHF1YWxpZmllZFNwbGl0WzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1YWxpZmllZFNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdWIgQW5ub3RhdGlvbiB3aXRoIGEgcXVhbGlmaWVyLCBub3Qgc3VyZSB3aGVuIHRoYXQgY2FuIGhhcHBlbiBpbiByZWFsIHNjZW5hcmlvc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZEFubm90YXRpb24ucXVhbGlmaWVyID0gcXVhbGlmaWVkU3BsaXRbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGFyZ2V0QW5ub3RhdGlvbnMucHVzaChwYXJzZWRBbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbn1cblxuLyoqXG4gKiBSZXZlcnQgdGhlIGN1cnJlbnQgY29sbGVjdGlvbiBpdGVtIHRvIHRoZSBjb3JyZXNwb25kaW5nIHJhdyBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VzIHRoZSBjdXJyZW50IHNldCBvZiByZWZlcmVuY2VcbiAqIEBwYXJhbSBjb2xsZWN0aW9uSXRlbSB0aGUgY29sbGVjdGlvbiBpdGVtIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyB0aGUgcmF3IHR5cGUgZXF1aXZhbGVudFxuICovXG5mdW5jdGlvbiByZXZlcnRDb2xsZWN0aW9uSXRlbVRvUmF3VHlwZShcbiAgICByZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSxcbiAgICBjb2xsZWN0aW9uSXRlbTogYW55XG4pOlxuICAgIHwgQW5ub3RhdGlvblJlY29yZFxuICAgIHwgc3RyaW5nXG4gICAgfCBQcm9wZXJ0eVBhdGhFeHByZXNzaW9uXG4gICAgfCBQYXRoRXhwcmVzc2lvblxuICAgIHwgTmF2aWdhdGlvblByb3BlcnR5UGF0aEV4cHJlc3Npb25cbiAgICB8IEFubm90YXRpb25QYXRoRXhwcmVzc2lvblxuICAgIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodHlwZW9mIGNvbGxlY3Rpb25JdGVtID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gY29sbGVjdGlvbkl0ZW07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY29sbGVjdGlvbkl0ZW0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChjb2xsZWN0aW9uSXRlbS5oYXNPd25Qcm9wZXJ0eSgnJFR5cGUnKSkge1xuICAgICAgICAgICAgLy8gQW5ub3RhdGlvbiBSZWNvcmRcbiAgICAgICAgICAgIGNvbnN0IG91dEl0ZW06IEFubm90YXRpb25SZWNvcmQgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogY29sbGVjdGlvbkl0ZW0uJFR5cGUsXG4gICAgICAgICAgICAgICAgcHJvcGVydHlWYWx1ZXM6IFtdIGFzIGFueVtdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gQ291bGQgdmFsaWRhdGUga2V5cyBhbmQgdHlwZSBiYXNlZCBvbiAkVHlwZVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY29sbGVjdGlvbkl0ZW0pLmZvckVhY2goKGNvbGxlY3Rpb25LZXkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdHJpY3RlZEtleXMuaW5kZXhPZihjb2xsZWN0aW9uS2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjb2xsZWN0aW9uSXRlbVtjb2xsZWN0aW9uS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgb3V0SXRlbS5wcm9wZXJ0eVZhbHVlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbGxlY3Rpb25LZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmV2ZXJ0VmFsdWVUb1Jhd1R5cGUocmVmZXJlbmNlcywgdmFsdWUpIGFzIEV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2xsZWN0aW9uS2V5ID09PSAnYW5ub3RhdGlvbnMnICYmIE9iamVjdC5rZXlzKGNvbGxlY3Rpb25JdGVtW2NvbGxlY3Rpb25LZXldKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dEl0ZW0uYW5ub3RhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgcmV2ZXJ0QW5ub3RhdGlvbnNUb1Jhd1R5cGUocmVmZXJlbmNlcywgY29sbGVjdGlvbkl0ZW1bY29sbGVjdGlvbktleV0sIG91dEl0ZW0uYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG91dEl0ZW07XG4gICAgICAgIH0gZWxzZSBpZiAoY29sbGVjdGlvbkl0ZW0udHlwZSA9PT0gJ1Byb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1Byb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgUHJvcGVydHlQYXRoOiBjb2xsZWN0aW9uSXRlbS52YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2xsZWN0aW9uSXRlbS50eXBlID09PSAnQW5ub3RhdGlvblBhdGgnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICAgICAgQW5ub3RhdGlvblBhdGg6IGNvbGxlY3Rpb25JdGVtLnZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGNvbGxlY3Rpb25JdGVtLnR5cGUgPT09ICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgTmF2aWdhdGlvblByb3BlcnR5UGF0aDogY29sbGVjdGlvbkl0ZW0udmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXZlcnQgYW4gYW5ub3RhdGlvbiB0ZXJtIHRvIGl0J3MgZ2VuZXJpYyBvciByYXcgZXF1aXZhbGVudC5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgcmVmZXJlbmNlIG9mIHRoZSBjdXJyZW50IGNvbnRleHRcbiAqIEBwYXJhbSBhbm5vdGF0aW9uIHRoZSBhbm5vdGF0aW9uIHRlcm0gdG8gcmV2ZXJ0XG4gKiBAcmV0dXJucyB0aGUgcmF3IGFubm90YXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJldmVydFRlcm1Ub0dlbmVyaWNUeXBlKHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLCBhbm5vdGF0aW9uOiBBbm5vdGF0aW9uVGVybTxhbnk+KTogUmF3QW5ub3RhdGlvbiB7XG4gICAgY29uc3QgYmFzZUFubm90YXRpb246IFJhd0Fubm90YXRpb24gPSB7XG4gICAgICAgIHRlcm06IGFubm90YXRpb24udGVybSxcbiAgICAgICAgcXVhbGlmaWVyOiBhbm5vdGF0aW9uLnF1YWxpZmllclxuICAgIH07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYW5ub3RhdGlvbikpIHtcbiAgICAgICAgLy8gQ29sbGVjdGlvblxuICAgICAgICBpZiAoYW5ub3RhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnYW5ub3RhdGlvbnMnKSAmJiBPYmplY3Qua2V5cygoYW5ub3RhdGlvbiBhcyBhbnkpLmFubm90YXRpb25zKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBBbm5vdGF0aW9uIG9uIGEgY29sbGVjdGlvbiBpdHNlbGYsIG5vdCBzdXJlIHdoZW4gdGhhdCBoYXBwZW5zIGlmIGF0IGFsbFxuICAgICAgICAgICAgYmFzZUFubm90YXRpb24uYW5ub3RhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIHJldmVydEFubm90YXRpb25zVG9SYXdUeXBlKHJlZmVyZW5jZXMsIChhbm5vdGF0aW9uIGFzIGFueSkuYW5ub3RhdGlvbnMsIGJhc2VBbm5vdGF0aW9uLmFubm90YXRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uYmFzZUFubm90YXRpb24sXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBhbm5vdGF0aW9uLm1hcCgoYW5ubykgPT4gcmV2ZXJ0Q29sbGVjdGlvbkl0ZW1Ub1Jhd1R5cGUocmVmZXJlbmNlcywgYW5ubykpIGFzIGFueVtdXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmIChhbm5vdGF0aW9uLmhhc093blByb3BlcnR5KCckVHlwZScpKSB7XG4gICAgICAgIHJldHVybiB7IC4uLmJhc2VBbm5vdGF0aW9uLCByZWNvcmQ6IHJldmVydENvbGxlY3Rpb25JdGVtVG9SYXdUeXBlKHJlZmVyZW5jZXMsIGFubm90YXRpb24pIGFzIGFueSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7IC4uLmJhc2VBbm5vdGF0aW9uLCB2YWx1ZTogcmV2ZXJ0VmFsdWVUb1Jhd1R5cGUocmVmZXJlbmNlcywgYW5ub3RhdGlvbikgfTtcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDc4Mik7XG4iLCIiXX0=
