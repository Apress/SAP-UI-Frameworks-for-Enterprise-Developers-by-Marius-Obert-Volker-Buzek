import { SelectionFields, UIAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import mergeObjects from "sap/base/util/merge";
import CommonUtils from "sap/fe/core/CommonUtils";
import { FilterField, processSelectionFields } from "sap/fe/core/converters/controls/ListReport/FilterBar";
import { isPropertyFilterable } from "sap/fe/core/helpers/MetaModelFunction";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { getLocalizedText, getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import PageController from "sap/fe/core/PageController";
import TemplateModel from "sap/fe/core/TemplateModel";
import { hasValueHelp } from "sap/fe/core/templating/PropertyFormatters";
import { getModelType } from "sap/fe/core/type/EDM";
import TypeUtil from "sap/fe/core/type/TypeUtil";
import CommonHelper from "sap/fe/macros/CommonHelper";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import FilterBar from "sap/ui/mdc/FilterBar";
import FilterBarDelegate from "sap/ui/mdc/FilterBarDelegate";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

const ODataFilterBarDelegate = Object.assign({}, FilterBarDelegate) as any;
const EDIT_STATE_PROPERTY_NAME = "$editState",
	SEARCH_PROPERTY_NAME = "$search",
	VALUE_HELP_TYPE = "FilterFieldValueHelp",
	FETCHED_PROPERTIES_DATA_KEY = "sap_fe_FilterBarDelegate_propertyInfoMap",
	CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /[+*]/g;

function _templateEditState(sIdPrefix: any, metaModel: ODataMetaModel, oModifier: any) {
	const oThis = new JSONModel({
			id: sIdPrefix,
			isDraftCollaborative: ModelHelper.isCollaborationDraftSupported(metaModel)
		}),
		oPreprocessorSettings = {
			bindingContexts: {
				this: oThis.createBindingContext("/")
			},
			models: {
				//"this.i18n": ResourceModel.getModel(), TODO: To be checked why this is needed, should not be needed at all
				this: oThis
			}
		};

	return DelegateUtil.templateControlFragment("sap.fe.macros.filter.DraftEditState", oPreprocessorSettings, undefined, oModifier).finally(
		function () {
			oThis.destroy();
		}
	);
}

ODataFilterBarDelegate._templateCustomFilter = async function (
	oFilterBar: any,
	sIdPrefix: any,
	oSelectionFieldInfo: any,
	oMetaModel: any,
	oModifier: any
) {
	const sEntityTypePath = await DelegateUtil.getCustomData(oFilterBar, "entityType", oModifier);
	const oThis = new JSONModel({
			id: sIdPrefix
		}),
		oItemModel = new TemplateModel(oSelectionFieldInfo, oMetaModel),
		oPreprocessorSettings = {
			bindingContexts: {
				contextPath: oMetaModel.createBindingContext(sEntityTypePath),
				this: oThis.createBindingContext("/"),
				item: oItemModel.createBindingContext("/")
			},
			models: {
				contextPath: oMetaModel,
				this: oThis,
				item: oItemModel
			}
		},
		oView = CommonUtils.getTargetView(oFilterBar),
		oController = oView ? oView.getController() : undefined,
		oOptions = {
			controller: oController ? oController : undefined,
			view: oView
		};

	return DelegateUtil.templateControlFragment("sap.fe.macros.filter.CustomFilter", oPreprocessorSettings, oOptions, oModifier).finally(
		function () {
			oThis.destroy();
			oItemModel.destroy();
		}
	);
};
function _getPropertyPath(sConditionPath: any) {
	return sConditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
}
ODataFilterBarDelegate._findSelectionField = function (aSelectionFields: any, sFlexName: any) {
	return aSelectionFields.find(function (oSelectionField: any) {
		return (
			(oSelectionField.conditionPath === sFlexName || oSelectionField.conditionPath.replaceAll(/\*/g, "") === sFlexName) &&
			oSelectionField.availability !== "Hidden"
		);
	});
};
function _generateIdPrefix(sFilterBarId: any, sControlType: any, sNavigationPrefix?: any) {
	return sNavigationPrefix ? generate([sFilterBarId, sControlType, sNavigationPrefix]) : generate([sFilterBarId, sControlType]);
}
function _templateValueHelp(oSettings: any, oParameters: any) {
	const oThis = new JSONModel({
		idPrefix: oParameters.sVhIdPrefix,
		conditionModel: "$filters",
		navigationPrefix: oParameters.sNavigationPrefix ? `/${oParameters.sNavigationPrefix}` : "",
		filterFieldValueHelp: true,
		useSemanticDateRange: oParameters.bUseSemanticDateRange
	});
	const oPreprocessorSettings = mergeObjects({}, oSettings, {
		bindingContexts: {
			this: oThis.createBindingContext("/")
		},
		models: {
			this: oThis
		}
	});

	return Promise.resolve(
		DelegateUtil.templateControlFragment("sap.fe.macros.internal.valuehelp.ValueHelp", oPreprocessorSettings, {
			isXML: oSettings.isXML
		})
	)
		.then(function (aVHElements: any) {
			if (aVHElements) {
				const sAggregationName = "dependents";
				//Some filter fields have the PersistenceProvider aggregation besides the FVH :
				if (aVHElements.length) {
					aVHElements.forEach(function (elt: any) {
						if (oParameters.oModifier) {
							oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, elt, 0);
						} else {
							oParameters.oControl.insertAggregation(sAggregationName, elt, 0, false);
						}
					});
				} else if (oParameters.oModifier) {
					oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, aVHElements, 0);
				} else {
					oParameters.oControl.insertAggregation(sAggregationName, aVHElements, 0, false);
				}
			}
		})
		.catch(function (oError: any) {
			Log.error("Error while evaluating DelegateUtil.isValueHelpRequired", oError);
		})
		.finally(function () {
			oThis.destroy();
		});
}
async function _addXMLCustomFilterField(oFilterBar: any, oModifier: any, sPropertyPath: any) {
	try {
		const aDependents = await Promise.resolve(oModifier.getAggregation(oFilterBar, "dependents"));
		let i;
		if (aDependents && aDependents.length > 1) {
			for (i = 0; i <= aDependents.length; i++) {
				const oFilterField = aDependents[i];
				if (oFilterField && oFilterField.isA("sap.ui.mdc.FilterField")) {
					const sDataProperty = oFilterField.getFieldPath(),
						sFilterFieldId = oFilterField.getId();
					if (sPropertyPath === sDataProperty && sFilterFieldId.indexOf("CustomFilterField")) {
						return Promise.resolve(oFilterField);
					}
				}
			}
		}
	} catch (oError: any) {
		Log.error("Filter Cannot be added", oError);
	}
}
function _templateFilterField(oSettings: any, oParameters: any, pageModel?: JSONModel) {
	const oThis = new JSONModel({
		idPrefix: oParameters.sIdPrefix,
		vhIdPrefix: oParameters.sVhIdPrefix,
		propertyPath: oParameters.sPropertyName,
		navigationPrefix: oParameters.sNavigationPrefix ? `/${oParameters.sNavigationPrefix}` : "",
		useSemanticDateRange: oParameters.bUseSemanticDateRange,
		settings: oParameters.oSettings,
		visualFilter: oParameters.visualFilter
	});
	const oMetaModel = oParameters.oMetaModel;
	const oVisualFilter = new TemplateModel(oParameters.visualFilter, oMetaModel);
	const oPreprocessorSettings = mergeObjects({}, oSettings, {
		bindingContexts: {
			this: oThis.createBindingContext("/"),
			visualFilter: oVisualFilter.createBindingContext("/")
		},
		models: {
			this: oThis,
			visualFilter: oVisualFilter,
			metaModel: oMetaModel,
			converterContext: pageModel
		}
	});

	return DelegateUtil.templateControlFragment("sap.fe.macros.internal.filterField.FilterFieldTemplate", oPreprocessorSettings, {
		isXML: oSettings.isXML
	}).finally(function () {
		oThis.destroy();
	});
}

async function _addPropertyInfo(oParentControl: FilterBar, mPropertyBag: any, oMetaModel: any, sPropertyInfoName: string) {
	try {
		sPropertyInfoName = sPropertyInfoName.replace("*", "");
		const sPropertyInfoKey = generate([sPropertyInfoName]); //Making sure that navigation property names are generated properly e.g. _Item::Material
		if (mPropertyBag && !mPropertyBag.modifier) {
			throw "FilterBar Delegate method called without modifier.";
		}

		const delegate = await mPropertyBag.modifier.getProperty(oParentControl, "delegate");
		const aPropertyInfo = await mPropertyBag.modifier.getProperty(oParentControl, "propertyInfo");
		//We do not get propertyInfo in case of table filters
		if (aPropertyInfo) {
			const hasPropertyInfo = aPropertyInfo.some(function (prop: any) {
				return prop.key === sPropertyInfoKey || prop.name === sPropertyInfoKey;
			});
			if (!hasPropertyInfo) {
				const entityTypePath = delegate.payload.entityTypePath;
				const converterContext = FilterUtils.createConverterContext(
					oParentControl,
					entityTypePath,
					oMetaModel,
					mPropertyBag.appComponent
				);
				const entityType = converterContext.getEntityType();
				let filterField = FilterUtils.getFilterField(sPropertyInfoName, converterContext, entityType);
				filterField = FilterUtils.buildProperyInfo(filterField, converterContext) as FilterField | undefined;
				aPropertyInfo.push(filterField);
				mPropertyBag.modifier.setProperty(oParentControl, "propertyInfo", aPropertyInfo);
			}
		}
	} catch (errorMsg) {
		Log.warning(`${oParentControl.getId()} : ${errorMsg}`);
	}
}

/**
 * Method responsible for creating filter field in standalone mode / in the personalization settings of the filter bar.
 *
 * @param sPropertyInfoName Name of the property being added as the filter field
 * @param oParentControl Parent control instance to which the filter field is added
 * @param mPropertyBag Instance of the property bag from Flex API
 * @returns Once resolved, a filter field definition is returned
 */
ODataFilterBarDelegate.addItem = async function (sPropertyInfoName: string, oParentControl: FilterBar, mPropertyBag: any) {
	if (!mPropertyBag) {
		// Invoked during runtime.
		return ODataFilterBarDelegate._addP13nItem(sPropertyInfoName, oParentControl);
	}
	const modifier = mPropertyBag.modifier;
	const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
	const oMetaModel = model && model.getMetaModel();
	if (!oMetaModel) {
		return Promise.resolve(null);
	}
	const isXML = modifier && modifier.targets === "xmlTree";
	if (isXML) {
		await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
	}
	return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oMetaModel, modifier, mPropertyBag.appComponent);
};

/**
 * Method responsible for removing filter field in standalone / personalization filter bar.
 *
 * @param oFilterFieldProperty Object of the filter field property being removed as filter field
 * @param oParentControl Parent control instance from which the filter field is removed
 * @param mPropertyBag Instance of property bag from Flex API
 * @returns The resolved promise
 */
ODataFilterBarDelegate.removeItem = async function (oFilterFieldProperty: any, oParentControl: any, mPropertyBag: any) {
	let doRemoveItem = true;
	const modifier = mPropertyBag.modifier;
	const isXML = modifier && modifier.targets === "xmlTree";
	if (isXML && !oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
		const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
		const oMetaModel = model && model.getMetaModel();
		if (!oMetaModel) {
			return Promise.resolve(null);
		}
		if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.getFieldPath()) {
			await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty.getFieldPath());
		} else {
			await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty);
		}
	}
	if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.isA && oFilterFieldProperty.isA("sap.ui.mdc.FilterField")) {
		if (oFilterFieldProperty.data("isSlot") === "true" && mPropertyBag) {
			// Inserting into the modifier creates a change from flex also filter is been removed hence promise is resolved to false
			modifier.insertAggregation(oParentControl, "dependents", oFilterFieldProperty);
			doRemoveItem = false;
		}
	}
	return Promise.resolve(doRemoveItem);
};

/**
 * Method responsible for creating filter field condition in standalone / personalization filter bar.
 *
 * @param sPropertyInfoName Name of the property being added as filter field
 * @param oParentControl Parent control instance to which the filter field is added
 * @param mPropertyBag Instance of property bag from Flex API
 * @returns The resolved promise
 */
ODataFilterBarDelegate.addCondition = async function (sPropertyInfoName: string, oParentControl: FilterBar, mPropertyBag: any) {
	const modifier = mPropertyBag.modifier;
	const isXML = modifier && modifier.targets === "xmlTree";
	if (isXML) {
		const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
		const oMetaModel = model && model.getMetaModel();
		if (!oMetaModel) {
			return Promise.resolve(null);
		}
		await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
	}
	return Promise.resolve();
};

/**
 * Method responsible for removing filter field in standalone / personalization filter bar.
 *
 * @param sPropertyInfoName Name of the property being removed as filter field
 * @param oParentControl Parent control instance from which the filter field is removed
 * @param mPropertyBag Instance of property bag from Flex API
 * @returns The resolved promise
 */
ODataFilterBarDelegate.removeCondition = async function (sPropertyInfoName: string, oParentControl: any, mPropertyBag: any) {
	if (!oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
		const modifier = mPropertyBag.modifier;
		const isXML = modifier && modifier.targets === "xmlTree";
		if (isXML) {
			const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
			const oMetaModel = model && model.getMetaModel();
			if (!oMetaModel) {
				return Promise.resolve(null);
			}
			await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
		}
	}
	return Promise.resolve();
};
/**
 * Clears all input values of visible filter fields in the filter bar.
 *
 * @param oFilterControl Instance of the FilterBar control
 * @returns The resolved promise
 */
ODataFilterBarDelegate.clearFilters = async function (oFilterControl: unknown) {
	return FilterUtils.clearFilterValues(oFilterControl);
};
/**
 * Creates the filter field in the table adaptation of the FilterBar.
 *
 * @param sPropertyInfoName The property name of the entity type for which the filter field needs to be created
 * @param oParentControl Instance of the parent control
 * @returns Once resolved, a filter field definition is returned
 */
ODataFilterBarDelegate._addP13nItem = function (sPropertyInfoName: string, oParentControl: object) {
	return DelegateUtil.fetchModel(oParentControl)
		.then(function (oModel: any) {
			return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oModel.getMetaModel(), undefined);
		})
		.catch(function (oError: any) {
			Log.error("Model could not be resolved", oError);
			return null;
		});
};
ODataFilterBarDelegate.fetchPropertiesForEntity = function (sEntityTypePath: any, oMetaModel: any, oFilterControl: any) {
	const oEntityType = oMetaModel.getObject(sEntityTypePath);
	const includeHidden = oFilterControl.isA("sap.ui.mdc.filterbar.vh.FilterBar") ? true : undefined;
	if (!oFilterControl || !oEntityType) {
		return [];
	}
	const oConverterContext = FilterUtils.createConverterContext(oFilterControl, sEntityTypePath);
	const sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath);

	const mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath, includeHidden);
	let aFetchedProperties: any[] = [];
	mFilterFields.forEach(function (oFilterFieldInfo: any) {
		const sAnnotationPath = oFilterFieldInfo.annotationPath;
		if (sAnnotationPath) {
			const oPropertyAnnotations = oConverterContext.getConvertedTypes().resolvePath(sAnnotationPath).target;
			const sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, sAnnotationPath);
			const sProperty = sAnnotationPath.replace(`${sTargetPropertyPrefix}/`, "");
			const entityType = oConverterContext.getEntityType();
			const selectionFields = entityType.annotations?.UI?.SelectionFields;
			if (
				ODataFilterBarDelegate._isFilterAdaptable(oFilterFieldInfo, oPropertyAnnotations, selectionFields) &&
				isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)
			) {
				aFetchedProperties.push(oFilterFieldInfo);
			}
		} else {
			//Custom Filters
			aFetchedProperties.push(oFilterFieldInfo);
		}
	});

	const aParameterFields: any[] = [];
	const processedFields = processSelectionFields(aFetchedProperties, oConverterContext);
	const processedFieldsKeys: any[] = [];
	processedFields.forEach(function (oProps: any) {
		if (oProps.key) {
			processedFieldsKeys.push(oProps.key);
		}
	});

	aFetchedProperties = aFetchedProperties.filter(function (oProp: any) {
		return processedFieldsKeys.includes(oProp.key);
	});

	const oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
		mAllowedExpressions = oFR.FilterAllowedExpressions;
	//Object.keys(processedFields).forEach(function (sFilterFieldKey: string) {
	processedFields.forEach(function (oProp, iFilterFieldIndex: number) {
		const oSelField = aFetchedProperties[iFilterFieldIndex as any];
		if (!oSelField || !oSelField.conditionPath) {
			return;
		}
		const sPropertyPath = _getPropertyPath(oSelField.conditionPath);
		//fetchBasic
		oProp = Object.assign(oProp, {
			group: oSelField.group,
			groupLabel: oSelField.groupLabel,
			path: oSelField.conditionPath,
			tooltip: null,
			removeFromAppState: false,
			hasValueHelp: false
		});

		//fetchPropInfo
		if (oSelField.annotationPath) {
			const sAnnotationPath = oSelField.annotationPath;
			const oProperty = oMetaModel.getObject(sAnnotationPath),
				oPropertyAnnotations = oMetaModel.getObject(`${sAnnotationPath}@`),
				oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);

			const bRemoveFromAppState =
				oPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] ||
				oPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] ||
				oPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"];

			const sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, oSelField.annotationPath);
			const sProperty = sAnnotationPath.replace(`${sTargetPropertyPrefix}/`, "");
			let oFilterDefaultValueAnnotation;
			let oFilterDefaultValue;
			if (isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)) {
				oFilterDefaultValueAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.FilterDefaultValue"];
				if (oFilterDefaultValueAnnotation) {
					oFilterDefaultValue = oFilterDefaultValueAnnotation[`$${getModelType(oProperty.$Type)}`];
				}

				oProp = Object.assign(oProp, {
					tooltip: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.QuickInfo"] || undefined,
					removeFromAppState: bRemoveFromAppState,
					hasValueHelp: hasValueHelp(oPropertyContext.getObject(), { context: oPropertyContext }),
					defaultFilterConditions: oFilterDefaultValue
						? [
								{
									fieldPath: oSelField.conditionPath,
									operator: "EQ",
									values: [oFilterDefaultValue]
								}
						  ]
						: undefined
				});
			}
		}

		//base

		if (oProp) {
			if (mAllowedExpressions[sPropertyPath] && mAllowedExpressions[sPropertyPath].length > 0) {
				oProp.filterExpression = CommonUtils.getSpecificAllowedExpression(mAllowedExpressions[sPropertyPath]);
			} else {
				oProp.filterExpression = "auto";
			}

			oProp = Object.assign(oProp, {
				visible: oSelField.availability === "Default"
			});
		}

		processedFields[iFilterFieldIndex] = oProp;
	});
	processedFields.forEach(function (propInfo: any) {
		if (propInfo.path === "$editState") {
			propInfo.label = getResourceModel(oFilterControl).getText("FILTERBAR_EDITING_STATUS");
		}
		propInfo.typeConfig = TypeUtil.getTypeConfig(propInfo.dataType, propInfo.formatOptions, propInfo.constraints);
		propInfo.label = getLocalizedText(propInfo.label, oFilterControl) || "";
		if (propInfo.isParameter) {
			aParameterFields.push(propInfo.name);
		}
	});

	aFetchedProperties = processedFields;
	DelegateUtil.setCustomData(oFilterControl, "parameters", aParameterFields);

	return aFetchedProperties;
};

function getLineItemQualifierFromTable(oControl: any, oMetaModel: any) {
	if (oControl.isA("sap.fe.macros.table.TableAPI")) {
		const annotationPaths = oControl.getMetaPath().split("#")[0].split("/");
		switch (annotationPaths[annotationPaths.length - 1]) {
			case `@${UIAnnotationTerms.SelectionPresentationVariant}`:
			case `@${UIAnnotationTerms.PresentationVariant}`:
				return oMetaModel
					.getObject(oControl.getMetaPath())
					.Visualizations?.find((visualization: any) => visualization.$AnnotationPath.includes(`@${UIAnnotationTerms.LineItem}`))
					.$AnnotationPath;
			case `@${UIAnnotationTerms.LineItem}`:
				const metaPaths = oControl.getMetaPath().split("/");
				return metaPaths[metaPaths.length - 1];
		}
	}
	return undefined;
}

ODataFilterBarDelegate._isFilterAdaptable = function (filterFieldInfo: any, propertyAnnotations: any, selectionFields: SelectionFields) {
	const isSelectionField = selectionFields?.some(function (selectionField: any) {
		if (selectionField.value === filterFieldInfo.key) {
			return true;
		}
		return false;
	});
	return isSelectionField || !propertyAnnotations.annotations?.UI?.AdaptationHidden;
};

ODataFilterBarDelegate._addFlexItem = function (
	sFlexPropertyName: any,
	oParentControl: any,
	oMetaModel: any,
	oModifier: any,
	oAppComponent: any
) {
	const sFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId(),
		sIdPrefix = oModifier ? "" : "Adaptation",
		aSelectionFields = FilterUtils.getConvertedFilterFields(
			oParentControl,
			null,
			undefined,
			oMetaModel,
			oAppComponent,
			oModifier,
			oModifier ? undefined : getLineItemQualifierFromTable(oParentControl.getParent(), oMetaModel)
		),
		oSelectionField = ODataFilterBarDelegate._findSelectionField(aSelectionFields, sFlexPropertyName),
		sPropertyPath = _getPropertyPath(sFlexPropertyName),
		bIsXML = !!oModifier && oModifier.targets === "xmlTree";
	if (sFlexPropertyName === EDIT_STATE_PROPERTY_NAME) {
		return _templateEditState(_generateIdPrefix(sFilterBarId, `${sIdPrefix}FilterField`), oMetaModel, oModifier);
	} else if (sFlexPropertyName === SEARCH_PROPERTY_NAME) {
		return Promise.resolve(null);
	} else if (oSelectionField && oSelectionField.template) {
		return ODataFilterBarDelegate._templateCustomFilter(
			oParentControl,
			_generateIdPrefix(sFilterBarId, `${sIdPrefix}FilterField`),
			oSelectionField,
			oMetaModel,
			oModifier
		);
	}

	if (oSelectionField.type === "Slot" && oModifier) {
		return _addXMLCustomFilterField(oParentControl, oModifier, sPropertyPath);
	}

	const sNavigationPath = CommonHelper.getNavigationPath(sPropertyPath);
	const sAnnotationPath = oSelectionField.annotationPath;
	let sEntityTypePath: string;
	let sUseSemanticDateRange;
	let oSettings: any;
	let sBindingPath;
	let oParameters: any;

	return Promise.resolve()
		.then(function () {
			if (oSelectionField.isParameter) {
				return sAnnotationPath.substr(0, sAnnotationPath.lastIndexOf("/") + 1);
			}
			return DelegateUtil.getCustomData(oParentControl, "entityType", oModifier);
		})
		.then(function (sRetrievedEntityTypePath: any) {
			sEntityTypePath = sRetrievedEntityTypePath;
			return DelegateUtil.getCustomData(oParentControl, "useSemanticDateRange", oModifier);
		})
		.then(function (sRetrievedUseSemanticDateRange: any) {
			sUseSemanticDateRange = sRetrievedUseSemanticDateRange;
			const oPropertyContext = oMetaModel.createBindingContext(sEntityTypePath + sPropertyPath);
			const sInFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId();
			oSettings = {
				bindingContexts: {
					contextPath: oMetaModel.createBindingContext(sEntityTypePath),
					property: oPropertyContext
				},
				models: {
					contextPath: oMetaModel,
					property: oMetaModel
				},
				isXML: bIsXML
			};
			sBindingPath = `/${ModelHelper.getEntitySetPath(sEntityTypePath)
				.split("/")
				.filter(ModelHelper.filterOutNavPropBinding)
				.join("/")}`;
			oParameters = {
				sPropertyName: sPropertyPath,
				sBindingPath: sBindingPath,
				sValueHelpType: sIdPrefix + VALUE_HELP_TYPE,
				oControl: oParentControl,
				oMetaModel: oMetaModel,
				oModifier: oModifier,
				sIdPrefix: _generateIdPrefix(sInFilterBarId, `${sIdPrefix}FilterField`, sNavigationPath),
				sVhIdPrefix: _generateIdPrefix(sInFilterBarId, sIdPrefix + VALUE_HELP_TYPE),
				sNavigationPrefix: sNavigationPath,
				bUseSemanticDateRange: sUseSemanticDateRange,
				oSettings: oSelectionField ? oSelectionField.settings : {},
				visualFilter: oSelectionField ? oSelectionField.visualFilter : undefined
			};

			return DelegateUtil.doesValueHelpExist(oParameters);
		})
		.then(function (bValueHelpExists: any) {
			if (!bValueHelpExists) {
				return _templateValueHelp(oSettings, oParameters);
			}
			return Promise.resolve();
		})
		.then(function () {
			let pageModel;
			if (oParameters.visualFilter) {
				//Need to set the convertercontext as pageModel in settings for BuildingBlock 2.0
				pageModel = (CommonUtils.getTargetView(oParentControl).getController() as PageController)._getPageModel();
			}
			return _templateFilterField(oSettings, oParameters, pageModel);
		});
};
function _getCachedProperties(oFilterBar: any) {
	// properties are not cached during templating
	if (oFilterBar instanceof window.Element) {
		return null;
	}
	return DelegateUtil.getCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY);
}
function _setCachedProperties(oFilterBar: any, aFetchedProperties: any) {
	// do not cache during templating, else it becomes part of the cached view
	if (oFilterBar instanceof window.Element) {
		return;
	}
	DelegateUtil.setCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY, aFetchedProperties);
}
function _getCachedOrFetchPropertiesForEntity(sEntityTypePath: any, oMetaModel: any, oFilterBar: any) {
	let aFetchedProperties = _getCachedProperties(oFilterBar);
	let localGroupLabel;

	if (!aFetchedProperties) {
		aFetchedProperties = ODataFilterBarDelegate.fetchPropertiesForEntity(sEntityTypePath, oMetaModel, oFilterBar);
		aFetchedProperties.forEach(function (oGroup: any) {
			localGroupLabel = null;
			if (oGroup.groupLabel) {
				localGroupLabel = getLocalizedText(oGroup.groupLabel, oFilterBar);
				oGroup.groupLabel = localGroupLabel === null ? oGroup.groupLabel : localGroupLabel;
			}
		});
		aFetchedProperties.sort(function (a: any, b: any) {
			if (a.groupLabel === undefined || a.groupLabel === null) {
				return -1;
			}
			if (b.groupLabel === undefined || b.groupLabel === null) {
				return 1;
			}
			return a.groupLabel.localeCompare(b.groupLabel);
		});
		_setCachedProperties(oFilterBar, aFetchedProperties);
	}
	return aFetchedProperties;
}
ODataFilterBarDelegate.fetchProperties = function (oFilterBar: any) {
	const sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
	return DelegateUtil.fetchModel(oFilterBar).then(function (oModel: any) {
		if (!oModel) {
			return [];
		}
		return _getCachedOrFetchPropertiesForEntity(sEntityTypePath, oModel.getMetaModel(), oFilterBar);
		// var aCleanedProperties = aProperties.concat();
		// var aAllowedAttributes = ["name", "label", "visible", "path", "typeConfig", "maxConditions", "group", "groupLabel"];
		// aCleanedProperties.forEach(function(oProperty) {
		// 	Object.keys(oProperty).forEach(function(sPropName) {
		// 		if (aAllowedAttributes.indexOf(sPropName) === -1) {
		// 			delete oProperty[sPropName];
		// 		}
		// 	});
		// });
		// return aCleanedProperties;
	});
};
ODataFilterBarDelegate.getTypeUtil = function () {
	return TypeUtil;
};

export default ODataFilterBarDelegate;
