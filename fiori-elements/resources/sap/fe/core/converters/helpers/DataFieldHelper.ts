import type {
	DataFieldAbstractTypes,
	DataFieldForAnnotationTypes,
	FieldGroup,
	ReferenceFacetTypes
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";

//function to check for statically hidden reference properties
export function isReferencePropertyStaticallyHidden(property?: DataFieldAbstractTypes | undefined) {
	if (property) {
		switch (property.$Type) {
			case UIAnnotationTypes.DataFieldForAnnotation:
				return isAnnotationFieldStaticallyHidden(property);
			case UIAnnotationTypes.DataField:
				if (property.annotations?.UI?.Hidden?.valueOf() === true) {
					if (property.annotations && (property.annotations as any).UI?.HiddenFilter?.valueOf() === true) {
						Log.warning(
							"Warning: Property " +
								property.Value.path +
								" is set with both UI.Hidden and UI.HiddenFilter - please set only one of these! UI.HiddenFilter is ignored currently!"
						);
					}
					return true;
				} else if (property.Value?.$target?.annotations?.UI?.Hidden?.valueOf() === true) {
					if (property.Value?.$target?.annotations?.UI?.HiddenFilter?.valueOf() === true) {
						Log.warning(
							"Warning: Property " +
								property.Value.path +
								" is set with both UI.Hidden and UI.HiddenFilter - please set only one of these! UI.HiddenFilter is ignored currently!"
						);
					}
					return true;
				} else {
					return false;
				}
			case UIAnnotationTypes.DataFieldWithNavigationPath:
				const propertyValueAnnotation = property.Value?.$target?.annotations;
				if (propertyValueAnnotation?.UI?.Hidden?.valueOf() === true) {
					if (propertyValueAnnotation?.UI?.HiddenFilter?.valueOf() === true) {
						Log.warning(
							"Warning: Property " +
								property.Value.path +
								" is set with both UI.Hidden and UI.HiddenFilter - please set only one of these! UI.HiddenFilter is ignored currently!"
						);
					}
					return true;
				} else {
					return false;
				}
			case UIAnnotationTypes.DataFieldWithUrl:
				if (property.annotations?.UI?.Hidden?.valueOf() === true) {
					if (property.annotations && (property.annotations as any).UI?.HiddenFilter?.valueOf() === true) {
						Log.warning(
							"Warning: Property " +
								property.Value.path +
								" is set with both UI.Hidden and UI.HiddenFilter - please set only one of these! UI.HiddenFilter is ignored currently!"
						);
					}
					return true;
				} else {
					return false;
				}
			default:
		}
	}
}
export function isAnnotationFieldStaticallyHidden(annotationProperty: DataFieldForAnnotationTypes | ReferenceFacetTypes) {
	const target = annotationProperty.Target.$target.term;
	// let ChartAnnotation: Chart, ConnectedFieldsAnnotation: ConnectedFields, FieldGroupAnnotation: FieldGroup, DataPointAnnotation: DataPoint;
	switch (target) {
		case UIAnnotationTerms.Chart:
			let ischartMeasureHidden;
			annotationProperty.Target.$target.Measures.forEach((chartMeasure) => {
				if (chartMeasure.$target.annotations?.UI?.Hidden?.valueOf() === true) {
					Log.warning(
						"Warning: Measure attribute for Chart " +
							chartMeasure.$target.name +
							" is statically hidden hence chart can't be rendered"
					);
					if (
						chartMeasure.$target.annotations &&
						(chartMeasure.$target.annotations as any).UI?.HiddenFilter?.valueOf() === true
					) {
						Log.warning(
							"Warning: Property " +
								chartMeasure.$target.name +
								" is set with both UI.Hidden and UI.HiddenFilter - please set only one of these! UI.HiddenFilter is ignored currently!"
						);
					}
					ischartMeasureHidden = true;
				}
			});
			if (ischartMeasureHidden === true) {
				return true;
			} else {
				return false;
			}
		case UIAnnotationTerms.ConnectedFields:
			if (annotationProperty) {
				if (annotationProperty.annotations?.UI?.Hidden?.valueOf() === true) {
					if (annotationProperty.annotations && (annotationProperty.annotations as any).UI?.HiddenFilter?.valueOf() === true) {
						Log.warning(
							"Warning: Property " +
								annotationProperty.Target.$target.qualifier +
								" is set with both UI.Hidden and UI.HiddenFilter - please set only one of these! UI.HiddenFilter is ignored currently!"
						);
					}
					return true;
				} else {
					return false;
				}
			}
			break;
		case UIAnnotationTerms.FieldGroup:
			if (annotationProperty) {
				if (
					(annotationProperty.Target.$target as FieldGroup).Data.every(
						(field: DataFieldAbstractTypes) => isReferencePropertyStaticallyHidden(field) === true
					)
				) {
					return true;
				} else {
					return false;
				}
			}
			break;
		case UIAnnotationTerms.DataPoint:
			const propertyValueAnnotation = (annotationProperty.Target.$target as any).Value.$target;
			if (propertyValueAnnotation.annotations?.UI?.Hidden?.valueOf() === true) {
				if (propertyValueAnnotation.annotations?.UI?.HiddenFilter?.valueOf() === true) {
					Log.warning(
						"Warning: Property " +
							annotationProperty.Target.$target.Value.path +
							" is set with both UI.Hidden and UI.HiddenFilter - please set only one of these! UI.HiddenFilter is ignored currently!"
					);
				}
				return true;
			} else {
				return false;
			}
		default:
	}
}

export function isHeaderStaticallyHidden(property?: DataFieldAbstractTypes) {
	if ((property as any).targetObject) {
		const headerInfoAnnotation = (property as any).targetObject;
		if (headerInfoAnnotation.annotations && headerInfoAnnotation.annotations?.UI?.Hidden?.valueOf() === true) {
			if (headerInfoAnnotation.Value?.$target?.annotations?.UI?.HiddenFilter?.valueOf() === true) {
				Log.warning(
					"Warning: Property " +
						headerInfoAnnotation.Value.path +
						" is set with both UI.Hidden and UI.HiddenFilter - please set only one of these! UI.HiddenFilter is ignored currently!"
				);
			}
			return true;
		} else if (
			headerInfoAnnotation?.Value?.$target &&
			headerInfoAnnotation?.Value?.$target?.annotations?.UI?.Hidden?.valueOf() === true
		) {
			if (headerInfoAnnotation?.Value?.$target?.annotations?.UI?.HiddenFilter?.valueOf() === true) {
				Log.warning(
					"Warning: Property " +
						headerInfoAnnotation.Value.path +
						" is set with both UI.Hidden and UI.HiddenFilter - please set only one of these! UI.HiddenFilter is ignored currently!"
				);
			}
			return true;
		} else {
			return false;
		}
	}
}
