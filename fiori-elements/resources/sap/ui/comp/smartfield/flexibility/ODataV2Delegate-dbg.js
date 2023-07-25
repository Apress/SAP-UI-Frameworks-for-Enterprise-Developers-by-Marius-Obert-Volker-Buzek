/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/model/ListBinding"], function(ListBinding) {
	"use strict";

	var ASYNC = true;

	/**
	 * Is field using a complex type
	 *
	 * @param {Object} mProperty - property from entityType
	 * @returns {boolean} - Returns true if property is using a complex type
	 */
	function isComplexType (mProperty) {
		if (mProperty && mProperty.type) {
			if (mProperty.type.toLowerCase().indexOf("edm") !== 0) {
				return true;
			}
		}
		return false;
	}

	function checkForAbsoluteAggregationBinding(oElement, sAggregationName) {
		if (!oElement) {
			return false;
		}
		var mBindingInfo = oElement.getBindingInfo(sAggregationName);
		var sPath = mBindingInfo && mBindingInfo.path;
		if (!sPath) {
			return false;
		}
		return sPath.indexOf("/") === 0;
	}

	function getDefaultModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName) {
		var vBinding;
		if (bAbsoluteAggregationBinding) {
			vBinding = oElement.getBindingInfo(sAggregationName);
			//check to be default model binding otherwise return undefined
			if (typeof vBinding.model === "string" && vBinding.model !== "") {
				vBinding = undefined;
			}
		} else {
			//here we explicitly request the default models binding context
			vBinding = oElement.getBindingContext();
		}
		return vBinding;
	}

	function enrichProperty(mProperty, mODataEntity, oElement, sAggregationName) {
		var mProp = {
			name:  mProperty.name,
			bindingPath: mProperty.name,
			entityType: mODataEntity.name
		};
		var mLabelAnnotation = mProperty["com.sap.vocabularies.Common.v1.Label"];
		mProp.label = mLabelAnnotation && mLabelAnnotation.String;

		var mQuickInfoAnnotation = mProperty["com.sap.vocabularies.Common.v1.QuickInfo"];
		mProp.tooltip = mQuickInfoAnnotation && mQuickInfoAnnotation.String;

		//CDS UI.Hidden new way also for sap:visible = false
		var mHiddenAnnotation = mProperty["com.sap.vocabularies.UI.v1.Hidden"];
		mProp.hideFromReveal = !!mHiddenAnnotation && mHiddenAnnotation.Bool === "true";

		var mFieldControlAnnotation;
		if (!mProp.hideFromReveal) {
			// Old hidden annotation
			mFieldControlAnnotation = mProperty["com.sap.vocabularies.Common.v1.FieldControl"];
			if (mFieldControlAnnotation && mFieldControlAnnotation.EnumMember) {
				mProp.hideFromReveal = mFieldControlAnnotation.EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden";
			} else {
				//@runtime hidden by field control value = 0
				var sFieldControlPath = mFieldControlAnnotation && mFieldControlAnnotation.Path;
				if (sFieldControlPath) {
					// if the binding is a list binding, we skip the check for field control
					var bListBinding = oElement.getBinding(sAggregationName) instanceof ListBinding;
					if (!bListBinding) {
						var iFieldControlValue = oElement.getBindingContext().getProperty(sFieldControlPath);
						mProp.hideFromReveal = iFieldControlValue === 0;
					}
				}
			}
		}
		return mProp;
	}

	function convertMetadataToDelegateFormat (mODataEntity, oMetaModel, oElement, sAggregationName) {
		var aFieldControlProperties = mODataEntity.property.map(function(mProperty) {
			return mProperty["sap:field-control"];
		}).filter(Boolean);

		var fnFilterFieldControlProperties = function (mProperty) {
			return !aFieldControlProperties.includes(mProperty.name);
		};

		var aProperties = mODataEntity.property.map(function(mProperty) {
			var mProp = enrichProperty(mProperty, mODataEntity, oElement, sAggregationName);
			if (isComplexType(mProperty)) {
				var mComplexType = oMetaModel.getODataComplexType(mProperty.type);
				if (mComplexType) {
					//deep properties, could get multiple-level deep
					mProp.properties = mComplexType.property.map(function(mComplexProperty) {
						var mInnerProp = enrichProperty(mComplexProperty, mODataEntity, oElement, sAggregationName);
						mInnerProp.bindingPath = mProperty.name + "/" + mComplexProperty.name;
						mInnerProp.referencedComplexPropertyName = mProp.label || mProp.name;
						return mInnerProp;
					})
					.filter(fnFilterFieldControlProperties);
				}
			}
			return mProp;
		});

		if (mODataEntity.navigationProperty) {
			var aNavigationProperties = mODataEntity.navigationProperty.map(function(mNavProp) {
				var sFullyQualifiedEntityName = (
					oMetaModel.getODataAssociationEnd(mODataEntity, mNavProp.name)
					&& oMetaModel.getODataAssociationEnd(mODataEntity, mNavProp.name).type
				);
				return {
					name : mNavProp.name,
					//no labels or tooltips for navigation properties
					entityType: sFullyQualifiedEntityName,
					bindingPath: mNavProp.name,
					unsupported: true //no support for navigation properties yet
					//can have properties (like complex types in future)
				};
			});
			aProperties = aProperties.concat(aNavigationProperties);
		}

		return aProperties.filter(fnFilterFieldControlProperties);
	}

	function getBindingPath(oElement, sAggregationName, mPayload) {
		if (mPayload.path) {
			return mPayload.path;
		}
		var bAbsoluteAggregationBinding = checkForAbsoluteAggregationBinding(oElement, sAggregationName);
		var vBinding = getDefaultModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName);
		if (vBinding) {
			return bAbsoluteAggregationBinding ? vBinding.path : vBinding.getPath();
		}
	}

	function loadODataMetaModel(oElement, mPayload) {
		return Promise.resolve()
			.then(function() {
				var oModel = oElement.getModel(mPayload.modelName);
				if (oModel) {
					var sModelType = oModel.getMetadata().getName();
					if (sModelType === "sap.ui.model.odata.ODataModel" || sModelType === "sap.ui.model.odata.v2.ODataModel") {
						var oMetaModel = oModel.getMetaModel();
						return oMetaModel.loaded().then(function() {
							return oMetaModel;
						});
					}
				}
			});
	}

	function getODataEntityFromMetaModel(oMetaModel, sBindingContextPath) {
		var oMetaModelContext = oMetaModel.getMetaContext(sBindingContextPath);
		return oMetaModelContext.getObject();
	}

	function adjustODataEntityForListBindings(oElement, oMetaModel, mODataEntity) {
		var oDefaultAggregation = oElement.getMetadata().getAggregation();
		if (oDefaultAggregation) {
			var oBinding = oElement.getBindingInfo(oDefaultAggregation.name);
			var oTemplate = oBinding && oBinding.template;

			if (oTemplate) {
				var sPath = oElement.getBindingPath(oDefaultAggregation.name);
				var oODataAssociationEnd = oMetaModel.getODataAssociationEnd(mODataEntity, sPath);
				var sFullyQualifiedEntityName = oODataAssociationEnd && oODataAssociationEnd.type;
				if (sFullyQualifiedEntityName) {
					var oEntityType = oMetaModel.getODataEntityType(sFullyQualifiedEntityName);
					mODataEntity = oEntityType;
				}
			}
		}
		return mODataEntity;
	}

	function getODataPropertiesOfModel(oElement, sAggregationName, mPayload) {
		return loadODataMetaModel(oElement, mPayload)
			.then(function(oMetaModel) {
				var aProperties = [];
				if (oMetaModel) {
					var sBindingContextPath = getBindingPath(oElement, sAggregationName, mPayload);
					if (sBindingContextPath) {
						var mODataEntity = getODataEntityFromMetaModel(oMetaModel, sBindingContextPath);

						mODataEntity = adjustODataEntityForListBindings(oElement, oMetaModel, mODataEntity);

						aProperties = convertMetadataToDelegateFormat(
							mODataEntity,
							oMetaModel,
							oElement,
							sAggregationName);
					}
				}
				return aProperties;
			});
	}

	function createLabel(mPropertyBag) {
		return mPropertyBag.modifier.createControl("sap.ui.comp.smartfield.SmartLabel",
			mPropertyBag.appComponent,
			mPropertyBag.view,
			mPropertyBag.labelFor + "-label",
			{labelFor: mPropertyBag.labelFor},
			ASYNC
		);
	}

	function createField(mPropertyBag) {
		return mPropertyBag.modifier.createControl("sap.ui.comp.smartfield.SmartField",
			mPropertyBag.appComponent,
			mPropertyBag.view,
			mPropertyBag.fieldSelector,
			{
				value : "{" + mPropertyBag.bindingPath + "}"
			},
			ASYNC
		);
	}

	/**
	 * Default delegate for ODataV2 protocoll.
	 * @namespace sap.ui.comp.smartfield.flexibility.ODataV2Delegate
	 * @implements {sap.ui.fl.interfaces.Delegate}
	 * @experimental Since 1.79
	 * @since 1.79
	 * @private
	 */
	var ODataV2Delegate = {}; /** @lends sap.ui.comp.smartfield.flexibility.ODataV2Delegate */

	/**
	 *	@inheritdoc
	 */
	ODataV2Delegate.getPropertyInfo = function (mPropertyBag) {
		return getODataPropertiesOfModel(mPropertyBag.element, mPropertyBag.aggregationName, mPropertyBag.payload);
	};

	/**
	 *	@inheritdoc
	 */
	ODataV2Delegate.createLabel = function (mPropertyBag) {
		return createLabel(mPropertyBag);
	};

	/**
	 *	@inheritdoc
	 */
	ODataV2Delegate.createControlForProperty = function (mPropertyBag) {
		return createField(mPropertyBag)
			.then(function(oControl) {
				return {
					control: oControl,
					valueHelp: undefined
				};
			});
	};

	return ODataV2Delegate;
});
