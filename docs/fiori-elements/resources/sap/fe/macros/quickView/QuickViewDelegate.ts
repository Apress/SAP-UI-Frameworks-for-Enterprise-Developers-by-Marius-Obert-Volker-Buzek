import Log from "sap/base/Log";
import deepClone from "sap/base/util/deepClone";
import deepEqual from "sap/base/util/deepEqual";
import isPlainObject from "sap/base/util/isPlainObject";
import CommonUtils from "sap/fe/core/CommonUtils";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import toES6Promise from "sap/fe/core/helpers/ToES6Promise";
import PageController from "sap/fe/core/PageController";
import { NavigationService } from "sap/fe/core/services/NavigationServiceFactory";
import { getDynamicPathFromSemanticObject } from "sap/fe/core/templating/SemanticObjectHelper";
import FieldHelper from "sap/fe/macros/field/FieldHelper";
import FieldRuntime from "sap/fe/macros/field/FieldRuntime";
import SelectionVariant from "sap/fe/navigation/SelectionVariant";
import Core from "sap/ui/core/Core";
import Fragment from "sap/ui/core/Fragment";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import Factory from "sap/ui/mdc/link/Factory";
import LinkItem from "sap/ui/mdc/link/LinkItem";
import SemanticObjectMapping from "sap/ui/mdc/link/SemanticObjectMapping";
import SemanticObjectMappingItem from "sap/ui/mdc/link/SemanticObjectMappingItem";
import SemanticObjectUnavailableAction from "sap/ui/mdc/link/SemanticObjectUnavailableAction";
import LinkDelegate from "sap/ui/mdc/LinkDelegate";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

export type RegisteredSemanticObjectMapping = { semanticObject: string; items: { key: string; value: string }[] };
type RegisteredSemanticObjectMappings = RegisteredSemanticObjectMapping[];
export type RegisteredPayload = {
	mainSemanticObject?: string;
	semanticObjects: string[];
	semanticObjectsResolved?: string[];
	semanticObjectMappings: RegisteredSemanticObjectMappings;
	semanticObjectUnavailableActions?: RegisteredSemanticObjectUnavailableActions;
	entityType?: string;
	dataField?: string;
	contact?: string;
	navigationPath?: string;
	propertyPathLabel?: string;
	hasQuickViewFacets?: string;
};

export type RegisteredSemanticObjectUnavailableActions = {
	semanticObject: string;
	actions: string[];
}[];

const SimpleLinkDelegate = Object.assign({}, LinkDelegate) as any;
const CONSTANTS = {
	iLinksShownInPopup: 3,
	sapmLink: "sap.m.Link",
	sapuimdcLink: "sap.ui.mdc.Link",
	sapuimdclinkLinkItem: "sap.ui.mdc.link.LinkItem",
	sapmObjectIdentifier: "sap.m.ObjectIdentifier",
	sapmObjectStatus: "sap.m.ObjectStatus"
};
SimpleLinkDelegate.getConstants = function () {
	return CONSTANTS;
};
/**
 * This will return an array of the SemanticObjects as strings given by the payload.
 *
 * @private
 * @param oPayload The payload defined by the application
 * @param oMetaModel The ODataMetaModel received from the Link
 * @returns The context pointing to the current EntityType.
 */
SimpleLinkDelegate._getEntityType = function (oPayload: any, oMetaModel: ODataMetaModel) {
	if (oMetaModel) {
		return oMetaModel.createBindingContext(oPayload.entityType);
	} else {
		return undefined;
	}
};
/**
 * This will return an array of the SemanticObjects as strings given by the payload.
 *
 * @private
 * @param oPayload The payload defined by the application
 * @param oMetaModel The ODataMetaModel received from the Link
 * @returns A model containing the payload information
 */
SimpleLinkDelegate._getSemanticsModel = function (oPayload: object, oMetaModel: object) {
	if (oMetaModel) {
		return new JSONModel(oPayload);
	} else {
		return undefined;
	}
};
/**
 * This will return an array of the SemanticObjects as strings given by the payload.
 *
 * @private
 * @param oPayload The payload defined by the application
 * @param oMetaModel The ODataMetaModel received from the Link
 * @returns An array containing SemanticObjects based of the payload
 */
SimpleLinkDelegate._getDataField = function (oPayload: any, oMetaModel: ODataMetaModel) {
	return oMetaModel.createBindingContext(oPayload.dataField);
};
/**
 * This will return an array of the SemanticObjects as strings given by the payload.
 *
 * @private
 * @param oPayload The payload defined by the application
 * @param oMetaModel The ODataMetaModel received from the Link
 * @returns Ancontaining SemanticObjects based of the payload
 */
SimpleLinkDelegate._getContact = function (oPayload: any, oMetaModel: ODataMetaModel) {
	return oMetaModel.createBindingContext(oPayload.contact);
};
SimpleLinkDelegate.fnTemplateFragment = function () {
	let sFragmentName: string, titleLinkHref;
	const oFragmentModel: any = {};
	let oPayloadToUse;

	// payload has been modified by fetching Semantic Objects names with path
	if (this.resolvedpayload) {
		oPayloadToUse = this.resolvedpayload;
	} else {
		oPayloadToUse = this.payload;
	}

	if (oPayloadToUse && !oPayloadToUse.LinkId) {
		oPayloadToUse.LinkId = this.oControl && this.oControl.isA(CONSTANTS.sapuimdcLink) ? this.oControl.getId() : undefined;
	}

	if (oPayloadToUse.LinkId) {
		titleLinkHref = this.oControl.getModel("$sapuimdcLink").getProperty("/titleLinkHref");
		oPayloadToUse.titlelink = titleLinkHref;
	}

	const oSemanticsModel = this._getSemanticsModel(oPayloadToUse, this.oMetaModel);
	this.semanticModel = oSemanticsModel;

	if (oPayloadToUse.entityType && this._getEntityType(oPayloadToUse, this.oMetaModel)) {
		sFragmentName = "sap.fe.macros.quickView.fragments.EntityQuickView";
		oFragmentModel.bindingContexts = {
			entityType: this._getEntityType(oPayloadToUse, this.oMetaModel),
			semantic: oSemanticsModel.createBindingContext("/")
		};
		oFragmentModel.models = {
			entityType: this.oMetaModel,
			semantic: oSemanticsModel
		};
	} else if (oPayloadToUse.dataField && this._getDataField(oPayloadToUse, this.oMetaModel)) {
		sFragmentName = "sap.fe.macros.quickView.fragments.DataFieldQuickView";
		oFragmentModel.bindingContexts = {
			dataField: this._getDataField(oPayloadToUse, this.oMetaModel),
			semantic: oSemanticsModel.createBindingContext("/")
		};
		oFragmentModel.models = {
			dataField: this.oMetaModel,
			semantic: oSemanticsModel
		};
	}
	oFragmentModel.models.entitySet = this.oMetaModel;
	oFragmentModel.models.metaModel = this.oMetaModel;
	if (this.oControl && this.oControl.getModel("viewData")) {
		oFragmentModel.models.viewData = this.oControl.getModel("viewData");
		oFragmentModel.bindingContexts.viewData = this.oControl.getModel("viewData").createBindingContext("/");
	}

	const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName!, "fragment");

	return Promise.resolve(XMLPreprocessor.process(oFragment, { name: sFragmentName! }, oFragmentModel))
		.then((_internalFragment: any) => {
			return Fragment.load({
				definition: _internalFragment,
				controller: this
			});
		})
		.then((oPopoverContent: any) => {
			if (oPopoverContent) {
				if (oFragmentModel.models && oFragmentModel.models.semantic) {
					oPopoverContent.setModel(oFragmentModel.models.semantic, "semantic");
					oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.semantic, "semantic");
				}

				if (oFragmentModel.bindingContexts && oFragmentModel.bindingContexts.entityType) {
					oPopoverContent.setModel(oFragmentModel.models.entityType, "entityType");
					oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.entityType, "entityType");
				}
			}
			this.resolvedpayload = undefined;
			return oPopoverContent;
		});
};
SimpleLinkDelegate.fetchAdditionalContent = function (oPayLoad: any, oMdcLinkControl: any) {
	this.oControl = oMdcLinkControl;
	const aNavigateRegexpMatch = oPayLoad?.navigationPath?.match(/{(.*?)}/);
	const oBindingContext =
		aNavigateRegexpMatch && aNavigateRegexpMatch.length > 1 && aNavigateRegexpMatch[1]
			? oMdcLinkControl.getModel().bindContext(aNavigateRegexpMatch[1], oMdcLinkControl.getBindingContext(), { $$ownRequest: true })
			: null;
	this.payload = oPayLoad;
	if (oMdcLinkControl && oMdcLinkControl.isA(CONSTANTS.sapuimdcLink)) {
		this.oMetaModel = oMdcLinkControl.getModel().getMetaModel();
		return this.fnTemplateFragment().then(function (oPopoverContent: any) {
			if (oBindingContext) {
				oPopoverContent.setBindingContext(oBindingContext.getBoundContext());
			}
			return [oPopoverContent];
		});
	}
	return Promise.resolve([]);
};
SimpleLinkDelegate._fetchLinkCustomData = function (_oLink: any) {
	if (
		_oLink.getParent() &&
		_oLink.isA(CONSTANTS.sapuimdcLink) &&
		(_oLink.getParent().isA(CONSTANTS.sapmLink) ||
			_oLink.getParent().isA(CONSTANTS.sapmObjectIdentifier) ||
			_oLink.getParent().isA(CONSTANTS.sapmObjectStatus))
	) {
		return _oLink.getCustomData();
	} else {
		return undefined;
	}
};
/**
 * Fetches the relevant {@link sap.ui.mdc.link.LinkItem} for the Link and returns them.
 *
 * @public
 * @param oPayload The Payload of the Link given by the application
 * @param oBindingContext The ContextObject of the Link
 * @param oInfoLog The InfoLog of the Link
 * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
 */
SimpleLinkDelegate.fetchLinkItems = function (oPayload: any, oBindingContext: Context, oInfoLog: any) {
	if (oBindingContext && SimpleLinkDelegate._getSemanticObjects(oPayload)) {
		const oContextObject = oBindingContext.getObject();
		if (oInfoLog) {
			oInfoLog.initialize(SimpleLinkDelegate._getSemanticObjects(oPayload));
		}
		const _oLinkCustomData = this._link && this._fetchLinkCustomData(this._link);
		this.aLinkCustomData =
			_oLinkCustomData &&
			this._fetchLinkCustomData(this._link).map(function (linkItem: any) {
				return linkItem.mProperties.value;
			});

		const oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(oContextObject, oPayload, oInfoLog, this._link);
		const oSemanticAttributes = oSemanticAttributesResolved.results;
		const oPayloadResolved = oSemanticAttributesResolved.payload;

		return SimpleLinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayloadResolved, oInfoLog, this._link).then(
			function (aLinks: any /*oOwnNavigationLink: any*/) {
				return aLinks.length === 0 ? null : aLinks;
			}
		);
	} else {
		return Promise.resolve(null);
	}
};

/**
 * Find the type of the link.
 *
 * @param payload The payload of the mdc link.
 * @param aLinkItems Links returned by call to mdc _retrieveUnmodifiedLinkItems.
 * @returns The type of the link as defined by mdc.
 */
SimpleLinkDelegate._findLinkType = function (payload: any, aLinkItems: any[]): any {
	let nLinkType, oLinkItem;
	if (aLinkItems?.length === 1) {
		oLinkItem = new LinkItem({
			text: aLinkItems[0].getText(),
			href: aLinkItems[0].getHref()
		});
		nLinkType = payload.hasQuickViewFacets === "false" ? 1 : 2;
	} else if (payload.hasQuickViewFacets === "false" && aLinkItems?.length === 0) {
		nLinkType = 0;
	} else {
		nLinkType = 2;
	}
	return {
		linkType: nLinkType,
		linkItem: oLinkItem
	};
};
SimpleLinkDelegate.fetchLinkType = async function (oPayload: any, oLink: any) {
	const _oCurrentLink = oLink;
	const _oPayload = Object.assign({}, oPayload);
	const oDefaultInitialType = {
		initialType: {
			type: 2,
			directLink: undefined
		},
		runtimeType: undefined
	};
	// clean appStateKeyMap storage
	if (!this.appStateKeyMap) {
		this.appStateKeyMap = {};
	}

	try {
		if (_oPayload?.semanticObjects) {
			this._link = oLink;
			let aLinkItems = await _oCurrentLink._retrieveUnmodifiedLinkItems();
			if (aLinkItems.length === 1) {
				// This is the direct navigation use case so we need to perform the appropriate checks / transformations
				aLinkItems = await _oCurrentLink.retrieveLinkItems();
			}
			const _LinkType = SimpleLinkDelegate._findLinkType(_oPayload, aLinkItems);
			return {
				initialType: {
					type: _LinkType.linkType,
					directLink: _LinkType.linkItem ? _LinkType.linkItem : undefined
				},
				runtimeType: undefined
			};
		} else if (_oPayload?.contact?.length > 0) {
			return oDefaultInitialType;
		} else if (_oPayload?.entityType && _oPayload?.navigationPath) {
			return oDefaultInitialType;
		}
		throw new Error("no payload or semanticObjects found");
	} catch (oError: any) {
		Log.error("Error in SimpleLinkDelegate.fetchLinkType: ", oError);
	}
};

SimpleLinkDelegate._RemoveTitleLinkFromTargets = function (_aLinkItems: any[], _bTitleHasLink: boolean, _aTitleLink: any): any {
	let _sTitleLinkHref, _oMDCLink;
	let bResult: boolean = false;
	if (_bTitleHasLink && _aTitleLink && _aTitleLink[0]) {
		let linkIsPrimaryAction: boolean, _sLinkIntentWithoutParameters: string;
		const _sTitleIntent = _aTitleLink[0].intent.split("?")[0];
		if (_aLinkItems && _aLinkItems[0]) {
			_sLinkIntentWithoutParameters = `#${_aLinkItems[0].getProperty("key")}`;
			linkIsPrimaryAction = _sTitleIntent === _sLinkIntentWithoutParameters;
			if (linkIsPrimaryAction) {
				_sTitleLinkHref = _aLinkItems[0].getProperty("href");
				this.payload.titlelinkhref = _sTitleLinkHref;
				if (_aLinkItems[0].isA(CONSTANTS.sapuimdclinkLinkItem)) {
					_oMDCLink = _aLinkItems[0].getParent();
					_oMDCLink.getModel("$sapuimdcLink").setProperty("/titleLinkHref", _sTitleLinkHref);
					const aMLinkItems = _oMDCLink
						.getModel("$sapuimdcLink")
						.getProperty("/linkItems")
						.filter(function (oLinkItem: any) {
							if (`#${oLinkItem.key}` !== _sLinkIntentWithoutParameters) {
								return oLinkItem;
							}
						});
					if (aMLinkItems && aMLinkItems.length > 0) {
						_oMDCLink.getModel("$sapuimdcLink").setProperty("/linkItems/", aMLinkItems);
					}
					bResult = true;
				}
			}
		}
	}
	return bResult;
};
SimpleLinkDelegate._IsSemanticObjectDynamic = function (aNewLinkCustomData: any, oThis: any) {
	if (aNewLinkCustomData && oThis.aLinkCustomData) {
		return (
			oThis.aLinkCustomData.filter(function (link: any) {
				return (
					aNewLinkCustomData.filter(function (otherLink: any) {
						return otherLink !== link;
					}).length > 0
				);
			}).length > 0
		);
	} else {
		return false;
	}
};
SimpleLinkDelegate._getLineContext = function (oView: any, mLineContext: any) {
	if (!mLineContext) {
		if (oView.getAggregation("content")[0] && oView.getAggregation("content")[0].getBindingContext()) {
			return oView.getAggregation("content")[0].getBindingContext();
		}
	}
	return mLineContext;
};
SimpleLinkDelegate._setFilterContextUrlForSelectionVariant = function (
	oView: any,
	oSelectionVariant: SelectionVariant,
	oNavigationService: any
): SelectionVariant {
	if (oView.getViewData().entitySet && oSelectionVariant) {
		const sContextUrl = oNavigationService.constructContextUrl(oView.getViewData().entitySet, oView.getModel());
		oSelectionVariant.setFilterContextUrl(sContextUrl);
	}
	return oSelectionVariant;
};

SimpleLinkDelegate._setObjectMappings = function (
	sSemanticObject: string,
	oParams: any,
	aSemanticObjectMappings: RegisteredSemanticObjectMappings,
	oSelectionVariant: SelectionVariant
) {
	let hasChanged = false;
	const modifiedSelectionVariant = new SelectionVariant(oSelectionVariant.toJSONObject());
	// if semanticObjectMappings has items with dynamic semanticObjects we need to resolve them using oParams
	aSemanticObjectMappings.forEach(function (mapping) {
		let mappingSemanticObject = mapping.semanticObject;
		const mappingSemanticObjectPath = getDynamicPathFromSemanticObject(mapping.semanticObject);
		if (mappingSemanticObjectPath && oParams[mappingSemanticObjectPath]) {
			mappingSemanticObject = oParams[mappingSemanticObjectPath];
		}
		if (sSemanticObject === mappingSemanticObject) {
			const oMappings = mapping.items;
			for (const i in oMappings) {
				const sLocalProperty = oMappings[i].key;
				const sSemanticObjectProperty = oMappings[i].value;
				if (sLocalProperty !== sSemanticObjectProperty) {
					if (oParams[sLocalProperty]) {
						modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
						modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
						modifiedSelectionVariant.renameParameter(sLocalProperty, sSemanticObjectProperty);
						modifiedSelectionVariant.renameSelectOption(sLocalProperty, sSemanticObjectProperty);
						oParams[sSemanticObjectProperty] = oParams[sLocalProperty];
						delete oParams[sLocalProperty];
						hasChanged = true;
					}
					// We remove the parameter as there is no value

					// The local property comes from a navigation property
					else if (sLocalProperty.split("/").length > 1) {
						// find the property to be removed
						const propertyToBeRemoved = sLocalProperty.split("/").slice(-1)[0];
						// The navigation property has no value
						if (!oParams[propertyToBeRemoved]) {
							delete oParams[propertyToBeRemoved];
							modifiedSelectionVariant.removeParameter(propertyToBeRemoved);
							modifiedSelectionVariant.removeSelectOption(propertyToBeRemoved);
						} else if (propertyToBeRemoved !== sSemanticObjectProperty) {
							// The navigation property has a value and properties names are different
							modifiedSelectionVariant.renameParameter(propertyToBeRemoved, sSemanticObjectProperty);
							modifiedSelectionVariant.renameSelectOption(propertyToBeRemoved, sSemanticObjectProperty);
							oParams[sSemanticObjectProperty] = oParams[propertyToBeRemoved];
							delete oParams[propertyToBeRemoved];
						}
					} else {
						delete oParams[sLocalProperty];
						modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
						modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
					}
				}
			}
		}
	});
	return { params: oParams, hasChanged, selectionVariant: modifiedSelectionVariant };
};

/**
 * Call getAppStateKeyAndUrlParameters in navigation service and cache its results.
 *
 * @param _this The instance of quickviewdelegate.
 * @param navigationService The navigation service.
 * @param selectionVariant The current selection variant.
 * @param semanticObject The current semanticObject.
 */
SimpleLinkDelegate._getAppStateKeyAndUrlParameters = async function (
	_this: typeof SimpleLinkDelegate,
	navigationService: any,
	selectionVariant: SelectionVariant,
	semanticObject: string
): Promise<string[]> {
	let aValues = [];

	// check if default cache contains already the unmodified selectionVariant
	if (deepEqual(selectionVariant, _this.appStateKeyMap[""]?.selectionVariant)) {
		const defaultCache = _this.appStateKeyMap[""];
		return [defaultCache.semanticAttributes, defaultCache.appstatekey];
	}
	// update url parameters because there is a change in selection variant
	if (
		_this.appStateKeyMap[`${semanticObject}`] === undefined ||
		!deepEqual(_this.appStateKeyMap[`${semanticObject}`].selectionVariant, selectionVariant)
	) {
		aValues = await toES6Promise(navigationService.getAppStateKeyAndUrlParameters(selectionVariant.toJSONString()));
		_this.appStateKeyMap[`${semanticObject}`] = {
			semanticAttributes: aValues[0],
			appstatekey: aValues[1],
			selectionVariant: selectionVariant
		};
	} else {
		const cache = _this.appStateKeyMap[`${semanticObject}`];
		aValues = [cache.semanticAttributes, cache.appstatekey];
	}
	return aValues;
};

SimpleLinkDelegate._getLinkItemWithNewParameter = async function (
	_that: any,
	_bTitleHasLink: boolean,
	_aTitleLink: string[],
	_oLinkItem: any,
	_oShellServices: any,
	_oPayload: any,
	_oParams: any,
	_sAppStateKey: string,
	_oSelectionVariant: SelectionVariant,
	_oNavigationService: NavigationService
): Promise<any> {
	return _oShellServices.expandCompactHash(_oLinkItem.getHref()).then(async function (sHash: any) {
		const oShellHash = _oShellServices.parseShellHash(sHash);
		const params = Object.assign({}, _oParams);
		const {
			params: oNewParams,
			hasChanged,
			selectionVariant: newSelectionVariant
		} = SimpleLinkDelegate._setObjectMappings(oShellHash.semanticObject, params, _oPayload.semanticObjectMappings, _oSelectionVariant);
		if (hasChanged) {
			const aValues = await SimpleLinkDelegate._getAppStateKeyAndUrlParameters(
				_that,
				_oNavigationService,
				newSelectionVariant,
				oShellHash.semanticObject
			);

			_sAppStateKey = aValues[1];
		}
		const oNewShellHash = {
			target: {
				semanticObject: oShellHash.semanticObject,
				action: oShellHash.action
			},
			params: oNewParams,
			appStateKey: _sAppStateKey
		};
		delete oNewShellHash.params["sap-xapp-state"];
		_oLinkItem.setHref(`#${_oShellServices.constructShellHash(oNewShellHash)}`);
		_oPayload.aSemanticLinks.push(_oLinkItem.getHref());
		// The link is removed from the target list because the title link has same target.
		return SimpleLinkDelegate._RemoveTitleLinkFromTargets.bind(_that)([_oLinkItem], _bTitleHasLink, _aTitleLink);
	});
};
SimpleLinkDelegate._removeEmptyLinkItem = function (aLinkItems: any): any[] {
	return aLinkItems.filter((linkItem: any) => {
		return linkItem !== undefined;
	});
};
/**
 * Enables the modification of LinkItems before the popover opens. This enables additional parameters
 * to be added to the link.
 *
 * @param oPayload The payload of the Link given by the application
 * @param oBindingContext The binding context of the Link
 * @param aLinkItems The LinkItems of the Link that can be modified
 * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
 */
SimpleLinkDelegate.modifyLinkItems = async function (oPayload: any, oBindingContext: Context, aLinkItems: any) {
	if (aLinkItems.length !== 0) {
		this.payload = oPayload;
		const oLink = aLinkItems[0].getParent();
		const oView = CommonUtils.getTargetView(oLink);
		const oAppComponent = CommonUtils.getAppComponent(oView);
		const primaryActionIsActive = (await FieldHelper.checkPrimaryActions(oPayload, true, oAppComponent)) as any;
		const aTitleLink = primaryActionIsActive.titleLink;
		const bTitleHasLink: boolean = primaryActionIsActive.hasTitleLink;
		const oShellServices = oAppComponent.getShellServices();
		if (!oShellServices.hasUShell()) {
			Log.error("QuickViewDelegate: Cannot retrieve the shell services");
			return Promise.reject();
		}
		const oMetaModel = oView.getModel().getMetaModel() as ODataMetaModel;
		let mLineContext = oLink.getBindingContext();
		const oTargetInfo: any = {
			semanticObject: oPayload.mainSemanticObject,
			action: ""
		};

		try {
			const aNewLinkCustomData =
				oLink &&
				this._fetchLinkCustomData(oLink).map(function (linkItem: any) {
					return linkItem.mProperties.value;
				});
			// check if all link items in this.aLinkCustomData are also present in aNewLinkCustomData
			if (SimpleLinkDelegate._IsSemanticObjectDynamic(aNewLinkCustomData, this)) {
				// if the customData changed there are different LinkItems to display
				const oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(
					oBindingContext.getObject(),
					oPayload,
					undefined,
					this._link
				);
				const oSemanticAttributes = oSemanticAttributesResolved.results;
				const oPayloadResolved = oSemanticAttributesResolved.payload;
				aLinkItems = await SimpleLinkDelegate._retrieveNavigationTargets(
					"",
					oSemanticAttributes,
					oPayloadResolved,
					undefined,
					this._link
				);
			}
			const oNavigationService = oAppComponent.getNavigationService();
			const oController = oView.getController() as PageController;
			let oSelectionVariant;
			let mLineContextData;
			mLineContext = SimpleLinkDelegate._getLineContext(oView, mLineContext);
			const sMetaPath = oMetaModel.getMetaPath(mLineContext.getPath());
			mLineContextData = oController._intentBasedNavigation.removeSensitiveData(mLineContext.getObject(), sMetaPath);
			mLineContextData = oController._intentBasedNavigation.prepareContextForExternalNavigation(mLineContextData, mLineContext);
			oSelectionVariant = oNavigationService.mixAttributesAndSelectionVariant(mLineContextData.semanticAttributes, {});
			oTargetInfo.propertiesWithoutConflict = mLineContextData.propertiesWithoutConflict;
			//TO modify the selection variant from the Extension API
			oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);
			SimpleLinkDelegate._removeTechnicalParameters(oSelectionVariant);
			oSelectionVariant = SimpleLinkDelegate._setFilterContextUrlForSelectionVariant(oView, oSelectionVariant, oNavigationService);
			const aValues = await SimpleLinkDelegate._getAppStateKeyAndUrlParameters(this, oNavigationService, oSelectionVariant, "");
			const oParams = aValues[0];
			const appStateKey = aValues[1];
			let titleLinktoBeRemove: any;
			oPayload.aSemanticLinks = [];
			aLinkItems = SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
			for (const index in aLinkItems) {
				titleLinktoBeRemove = await SimpleLinkDelegate._getLinkItemWithNewParameter(
					this,
					bTitleHasLink,
					aTitleLink,
					aLinkItems[index],
					oShellServices,
					oPayload,
					oParams,
					appStateKey,
					oSelectionVariant,
					oNavigationService
				);
				if (titleLinktoBeRemove === true) {
					aLinkItems[index] = undefined;
				}
			}
			return SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
		} catch (oError: any) {
			Log.error("Error while getting the navigation service", oError);
			return undefined;
		}
	} else {
		return aLinkItems;
	}
};
SimpleLinkDelegate.beforeNavigationCallback = function (oPayload: any, oEvent: any) {
	const oSource = oEvent.getSource(),
		sHref = oEvent.getParameter("href"),
		oURLParsing = Factory.getService("URLParsing"),
		oHash = sHref && oURLParsing.parseShellHash(sHref);

	KeepAliveHelper.storeControlRefreshStrategyForHash(oSource, oHash);

	return Promise.resolve(true);
};
SimpleLinkDelegate._removeTechnicalParameters = function (oSelectionVariant: any) {
	oSelectionVariant.removeSelectOption("@odata.context");
	oSelectionVariant.removeSelectOption("@odata.metadataEtag");
	oSelectionVariant.removeSelectOption("SAP__Messages");
};

SimpleLinkDelegate._getSemanticObjectCustomDataValue = function (aLinkCustomData: any, oSemanticObjectsResolved: any): void {
	let sPropertyName: string, sCustomDataValue: string;
	for (let iCustomDataCount = 0; iCustomDataCount < aLinkCustomData.length; iCustomDataCount++) {
		sPropertyName = aLinkCustomData[iCustomDataCount].getKey();
		sCustomDataValue = aLinkCustomData[iCustomDataCount].getValue();
		oSemanticObjectsResolved[sPropertyName] = { value: sCustomDataValue };
	}
};

/**
 * Check the semantic object name if it is dynamic or not.
 *
 * @private
 * @param pathOrValue The semantic object path or name
 * @returns True if semantic object is dynamic
 */
SimpleLinkDelegate._isDynamicPath = function (pathOrValue: string): boolean {
	if (pathOrValue && pathOrValue.indexOf("{") === 0 && pathOrValue.indexOf("}") === pathOrValue.length - 1) {
		return true;
	} else {
		return false;
	}
};

/**
 * Update the payload with semantic object values from custom data of Link.
 *
 * @private
 * @param payload The payload of the mdc link.
 * @param newPayload The new updated payload.
 * @param semanticObjectName The semantic object name resolved.
 */
SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue = function (
	payload: RegisteredPayload,
	newPayload: RegisteredPayload,
	semanticObjectName: string
): void {
	if (SimpleLinkDelegate._isDynamicPath(payload.mainSemanticObject)) {
		if (semanticObjectName) {
			newPayload.mainSemanticObject = semanticObjectName;
		} else {
			// no value from Custom Data, so removing mainSemanticObject
			newPayload.mainSemanticObject = undefined;
		}
	}
	switch (typeof semanticObjectName) {
		case "string":
			newPayload.semanticObjectsResolved?.push(semanticObjectName);
			newPayload.semanticObjects.push(semanticObjectName);
			break;
		case "object":
			for (const j in semanticObjectName as string[]) {
				newPayload.semanticObjectsResolved?.push(semanticObjectName[j]);
				newPayload.semanticObjects.push(semanticObjectName[j]);
			}
			break;
		default:
	}
};

SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved = function (
	payload: RegisteredPayload,
	semanticObjectsResolved: any,
	newPayload: RegisteredPayload
): void {
	let semanticObjectName: string, tmpPropertyName: string;
	for (const i in payload.semanticObjects) {
		semanticObjectName = payload.semanticObjects[i];
		if (SimpleLinkDelegate._isDynamicPath(semanticObjectName)) {
			tmpPropertyName = semanticObjectName.substr(1, semanticObjectName.indexOf("}") - 1);
			semanticObjectName = semanticObjectsResolved[tmpPropertyName].value;
			SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue(payload, newPayload, semanticObjectName);
		} else {
			newPayload.semanticObjects.push(semanticObjectName);
		}
	}
};

/**
 * Update the semantic object name from the resolved value for the mappings attributes.
 *
 * @private
 * @param mdcPayload The payload given by the application.
 * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload with the resolved value for the semantic object name.
 * @param newPayload The new updated payload.
 */
SimpleLinkDelegate._updateSemanticObjectsForMappings = function (
	mdcPayload: RegisteredPayload,
	mdcPayloadWithDynamicSemanticObjectsResolved: RegisteredPayload,
	newPayload: RegisteredPayload
): void {
	// update the semantic object name from the resolved ones in the semantic object mappings.
	mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.forEach(function (
		semanticObjectMapping: RegisteredSemanticObjectMapping
	) {
		if (semanticObjectMapping.semanticObject && SimpleLinkDelegate._isDynamicPath(semanticObjectMapping.semanticObject)) {
			semanticObjectMapping.semanticObject =
				newPayload.semanticObjects[mdcPayload.semanticObjects.indexOf(semanticObjectMapping.semanticObject)];
		}
	});
};

/**
 * Update the semantic object name from the resolved value for the unavailable actions.
 *
 * @private
 * @param mdcPayload The payload given by the application.
 * @param mdcPayloadSemanticObjectUnavailableActions The unavailable actions given by the application.
 * @param mdcPayloadWithDynamicSemanticObjectsResolved The updated payload with the resolved value for the semantic object name for the unavailable actions.
 */
SimpleLinkDelegate._updateSemanticObjectsUnavailableActions = function (
	mdcPayload: RegisteredPayload,
	mdcPayloadSemanticObjectUnavailableActions: RegisteredSemanticObjectUnavailableActions,
	mdcPayloadWithDynamicSemanticObjectsResolved: RegisteredPayload
): void {
	let _Index: any;
	mdcPayloadSemanticObjectUnavailableActions.forEach(function (semanticObjectUnavailableAction: any) {
		// Dynamic SemanticObject has an unavailable action
		if (
			semanticObjectUnavailableAction?.semanticObject &&
			SimpleLinkDelegate._isDynamicPath(semanticObjectUnavailableAction.semanticObject)
		) {
			_Index = mdcPayload.semanticObjects.findIndex(function (semanticObject: string) {
				return semanticObject === semanticObjectUnavailableAction.semanticObject;
			});
			if (_Index !== undefined) {
				// Get the SemanticObject name resolved to a value
				semanticObjectUnavailableAction.semanticObject = mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[_Index];
			}
		}
	});
};

/**
 * Update the semantic object name from the resolved value for the unavailable actions.
 *
 * @private
 * @param mdcPayload The updated payload with the information from custom data provided in the link.
 * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload updated with resolved semantic objects names.
 */
SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue = function (
	mdcPayload: RegisteredPayload,
	mdcPayloadWithDynamicSemanticObjectsResolved: RegisteredPayload
): void {
	for (let newSemanticObjectsCount = 0; newSemanticObjectsCount < mdcPayload.semanticObjects.length; newSemanticObjectsCount++) {
		if (
			mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject ===
			(mdcPayload.semanticObjectsResolved && mdcPayload.semanticObjectsResolved[newSemanticObjectsCount])
		) {
			mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = mdcPayload.semanticObjects[newSemanticObjectsCount];
		}
		if (mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount]) {
			mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount] =
				mdcPayload.semanticObjects[newSemanticObjectsCount];
		} else {
			// no Custom Data value for a Semantic Object name with path
			mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects.splice(newSemanticObjectsCount, 1);
		}
	}
};

/**
 * Remove empty semantic object mappings and if there is no semantic object name, link to it.
 *
 * @private
 * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload used to check the mappings of the semantic objects.
 */
SimpleLinkDelegate._removeEmptySemanticObjectsMappings = function (mdcPayloadWithDynamicSemanticObjectsResolved: RegisteredPayload): void {
	// remove undefined Semantic Object Mapping
	for (
		let mappingsCount = 0;
		mappingsCount < mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.length;
		mappingsCount++
	) {
		if (
			mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount] &&
			mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount].semanticObject === undefined
		) {
			mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.splice(mappingsCount, 1);
		}
	}
};

SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved = function (
	payload: any,
	newPayload: RegisteredPayload
): RegisteredPayload {
	let oPayloadWithDynamicSemanticObjectsResolved: RegisteredPayload;
	if (newPayload.semanticObjectsResolved && newPayload.semanticObjectsResolved.length > 0) {
		oPayloadWithDynamicSemanticObjectsResolved = {
			entityType: payload.entityType,
			dataField: payload.dataField,
			contact: payload.contact,
			mainSemanticObject: payload.mainSemanticObject,
			navigationPath: payload.navigationPath,
			propertyPathLabel: payload.propertyPathLabel,
			semanticObjectMappings: deepClone(payload.semanticObjectMappings),
			semanticObjects: newPayload.semanticObjects
		};
		SimpleLinkDelegate._updateSemanticObjectsForMappings(payload, oPayloadWithDynamicSemanticObjectsResolved, newPayload);
		const _SemanticObjectUnavailableActions: RegisteredSemanticObjectUnavailableActions = deepClone(
			payload.semanticObjectUnavailableActions
		);
		SimpleLinkDelegate._updateSemanticObjectsUnavailableActions(
			payload,
			_SemanticObjectUnavailableActions,
			oPayloadWithDynamicSemanticObjectsResolved
		);
		oPayloadWithDynamicSemanticObjectsResolved.semanticObjectUnavailableActions = _SemanticObjectUnavailableActions;
		if (newPayload.mainSemanticObject) {
			oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = newPayload.mainSemanticObject;
		} else {
			oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = undefined;
		}
		SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue(newPayload, oPayloadWithDynamicSemanticObjectsResolved);
		SimpleLinkDelegate._removeEmptySemanticObjectsMappings(oPayloadWithDynamicSemanticObjectsResolved);
		return oPayloadWithDynamicSemanticObjectsResolved;
	} else {
		return {} as any;
	}
};

SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved = function (payload: any, linkCustomData: any): any {
	let oPayloadWithDynamicSemanticObjectsResolved: any;
	const oSemanticObjectsResolved: any = {};
	const newPayload: RegisteredPayload = { semanticObjects: [], semanticObjectsResolved: [], semanticObjectMappings: [] };
	if (payload.semanticObjects) {
		// sap.m.Link has custom data with Semantic Objects names resolved
		if (linkCustomData && linkCustomData.length > 0) {
			SimpleLinkDelegate._getSemanticObjectCustomDataValue(linkCustomData, oSemanticObjectsResolved);
			SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved(payload, oSemanticObjectsResolved, newPayload);
			oPayloadWithDynamicSemanticObjectsResolved = SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved(
				payload,
				newPayload
			);
			return oPayloadWithDynamicSemanticObjectsResolved;
		}
	} else {
		return undefined;
	}
};

SimpleLinkDelegate._updatePayloadWithSemanticAttributes = function (
	aSemanticObjects: any,
	oInfoLog: any,
	oContextObject: any,
	oResults: any,
	mSemanticObjectMappings: any
): void {
	aSemanticObjects.forEach(function (sSemanticObject: any) {
		if (oInfoLog) {
			oInfoLog.addContextObject(sSemanticObject, oContextObject);
		}
		oResults[sSemanticObject] = {};
		for (const sAttributeName in oContextObject) {
			let oAttribute = null,
				oTransformationAdditional = null;
			if (oInfoLog) {
				oAttribute = oInfoLog.getSemanticObjectAttribute(sSemanticObject, sAttributeName);
				if (!oAttribute) {
					oAttribute = oInfoLog.createAttributeStructure();
					oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeName, oAttribute);
				}
			}
			// Ignore undefined and null values
			if (oContextObject[sAttributeName] === undefined || oContextObject[sAttributeName] === null) {
				if (oAttribute) {
					oAttribute.transformations.push({
						value: undefined,
						description: "\u2139 Undefined and null values have been removed in SimpleLinkDelegate."
					});
				}
				continue;
			}
			// Ignore plain objects (BCP 1770496639)
			if (isPlainObject(oContextObject[sAttributeName])) {
				if (mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject]) {
					const aKeys = Object.keys(mSemanticObjectMappings[sSemanticObject]);
					let sNewAttributeNameMapped, sNewAttributeName, sValue, sKey;
					for (let index = 0; index < aKeys.length; index++) {
						sKey = aKeys[index];
						if (sKey.indexOf(sAttributeName) === 0) {
							sNewAttributeNameMapped = mSemanticObjectMappings[sSemanticObject][sKey];
							sNewAttributeName = sKey.split("/")[sKey.split("/").length - 1];
							sValue = oContextObject[sAttributeName][sNewAttributeName];
							if (sNewAttributeNameMapped && sNewAttributeName && sValue) {
								oResults[sSemanticObject][sNewAttributeNameMapped] = sValue;
							}
						}
					}
				}
				if (oAttribute) {
					oAttribute.transformations.push({
						value: undefined,
						description: "\u2139 Plain objects has been removed in SimpleLinkDelegate."
					});
				}
				continue;
			}

			// Map the attribute name only if 'semanticObjectMapping' is defined.
			// Note: under defined 'semanticObjectMapping' we also mean an empty annotation or an annotation with empty record
			const sAttributeNameMapped =
				mSemanticObjectMappings &&
				mSemanticObjectMappings[sSemanticObject] &&
				mSemanticObjectMappings[sSemanticObject][sAttributeName]
					? mSemanticObjectMappings[sSemanticObject][sAttributeName]
					: sAttributeName;

			if (oAttribute && sAttributeName !== sAttributeNameMapped) {
				oTransformationAdditional = {
					value: undefined,
					description: `\u2139 The attribute ${sAttributeName} has been renamed to ${sAttributeNameMapped} in SimpleLinkDelegate.`,
					reason: `\ud83d\udd34 A com.sap.vocabularies.Common.v1.SemanticObjectMapping annotation is defined for semantic object ${sSemanticObject} with source attribute ${sAttributeName} and target attribute ${sAttributeNameMapped}. You can modify the annotation if the mapping result is not what you expected.`
				};
			}

			// If more then one local property maps to the same target property (clash situation)
			// we take the value of the last property and write an error log
			if (oResults[sSemanticObject][sAttributeNameMapped]) {
				Log.error(
					`SimpleLinkDelegate: The attribute ${sAttributeName} can not be renamed to the attribute ${sAttributeNameMapped} due to a clash situation. This can lead to wrong navigation later on.`
				);
			}

			// Copy the value replacing the attribute name by semantic object name
			oResults[sSemanticObject][sAttributeNameMapped] = oContextObject[sAttributeName];

			if (oAttribute) {
				if (oTransformationAdditional) {
					oAttribute.transformations.push(oTransformationAdditional);
					const aAttributeNew = oInfoLog.createAttributeStructure();
					aAttributeNew.transformations.push({
						value: oContextObject[sAttributeName],
						description: `\u2139 The attribute ${sAttributeNameMapped} with the value ${oContextObject[sAttributeName]} has been added due to a mapping rule regarding the attribute ${sAttributeName} in SimpleLinkDelegate.`
					});
					oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeNameMapped, aAttributeNew);
				}
			}
		}
	});
};

/**
 * Checks which attributes of the ContextObject belong to which SemanticObject and maps them into a two dimensional array.
 *
 * @private
 * @param oContextObject The BindingContext of the SourceControl of the Link / of the Link itself if not set
 * @param oPayload The payload given by the application
 * @param oInfoLog The corresponding InfoLog of the Link
 * @param oLink The corresponding Link
 * @returns A two dimensional array which maps a given SemanticObject name together with a given attribute name to the value of that given attribute
 */
SimpleLinkDelegate._calculateSemanticAttributes = function (oContextObject: any, oPayload: any, oInfoLog: any, oLink: any) {
	const aLinkCustomData = oLink && this._fetchLinkCustomData(oLink);
	const oPayloadWithDynamicSemanticObjectsResolved: any = SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved(
		oPayload,
		aLinkCustomData
	);
	const oPayloadResolved = oPayloadWithDynamicSemanticObjectsResolved ? oPayloadWithDynamicSemanticObjectsResolved : oPayload;
	this.resolvedpayload = oPayloadWithDynamicSemanticObjectsResolved;
	const aSemanticObjects = SimpleLinkDelegate._getSemanticObjects(oPayloadResolved);
	const mSemanticObjectMappings = SimpleLinkDelegate._convertSemanticObjectMapping(
		SimpleLinkDelegate._getSemanticObjectMappings(oPayloadResolved)
	);
	if (!aSemanticObjects.length) {
		return { payload: oPayloadResolved, results: {} };
	}
	const oResults: any = {};
	SimpleLinkDelegate._updatePayloadWithSemanticAttributes(aSemanticObjects, oInfoLog, oContextObject, oResults, mSemanticObjectMappings);
	return { payload: oPayloadResolved, results: oResults };
};
/**
 * Retrieves the actual targets for the navigation of the link. This uses the UShell loaded by the {@link sap.ui.mdc.link.Factory} to retrieve
 * the navigation targets from the FLP service.
 *
 * @private
 * @param sAppStateKey Key of the appstate (not used yet)
 * @param oSemanticAttributes The calculated by _calculateSemanticAttributes
 * @param oPayload The payload given by the application
 * @param oInfoLog The corresponding InfoLog of the Link
 * @param oLink The corresponding Link
 * @returns Resolving into availableAtions and ownNavigation containing an array of {@link sap.ui.mdc.link.LinkItem}
 */
SimpleLinkDelegate._retrieveNavigationTargets = function (
	sAppStateKey: string,
	oSemanticAttributes: any,
	oPayload: any,
	oInfoLog: any,
	oLink: any
) {
	if (!oPayload.semanticObjects) {
		return Promise.resolve([]);
	}
	const aSemanticObjects = oPayload.semanticObjects;
	const oNavigationTargets: any = {
		ownNavigation: undefined,
		availableActions: []
	};
	let iSuperiorActionLinksFound = 0;
	return Core.loadLibrary("sap.ui.fl", {
		async: true
	}).then(() => {
		return new Promise((resolve) => {
			sap.ui.require(["sap/ui/fl/Utils"], async (Utils: any) => {
				const oAppComponent = Utils.getAppComponentForControl(oLink === undefined ? this.oControl : oLink);
				const oShellServices = oAppComponent ? oAppComponent.getShellServices() : null;
				if (!oShellServices) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
				}
				if (!oShellServices.hasUShell()) {
					Log.error("SimpleLinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
				}
				const aParams = aSemanticObjects.map(function (sSemanticObject: any) {
					return [
						{
							semanticObject: sSemanticObject,
							params: oSemanticAttributes ? oSemanticAttributes[sSemanticObject] : undefined,
							appStateKey: sAppStateKey,
							sortResultsBy: "text"
						}
					];
				});
				try {
					const aLinks = await oShellServices.getLinks(aParams);
					let bHasLinks = false;
					for (let i = 0; i < aLinks.length; i++) {
						for (let j = 0; j < aLinks[i].length; j++) {
							if (aLinks[i][j].length > 0) {
								bHasLinks = true;
								break;
							}
							if (bHasLinks) {
								break;
							}
						}
					}

					if (!aLinks || !aLinks.length || !bHasLinks) {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
					}

					const aSemanticObjectUnavailableActions = SimpleLinkDelegate._getSemanticObjectUnavailableActions(oPayload);
					const oUnavailableActions =
						SimpleLinkDelegate._convertSemanticObjectUnavailableAction(aSemanticObjectUnavailableActions);
					let sCurrentHash = FieldRuntime._fnFixHashQueryString(oAppComponent.getShellServices().getHash());

					if (sCurrentHash) {
						// BCP 1770315035: we have to set the end-point '?' of action in order to avoid matching of "#SalesOrder-manage" in "#SalesOrder-manageFulfillment"
						sCurrentHash += "?";
					}

					const fnIsUnavailableAction = function (sSemanticObject: any, sAction: any) {
						return (
							!!oUnavailableActions &&
							!!oUnavailableActions[sSemanticObject] &&
							oUnavailableActions[sSemanticObject].indexOf(sAction) > -1
						);
					};
					const fnAddLink = function (_oLink: any) {
						const oShellHash = oShellServices.parseShellHash(_oLink.intent);
						if (fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
							return;
						}
						const sHref = `#${oShellServices.constructShellHash({ target: { shellHash: _oLink.intent } })}`;

						if (_oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0) {
							// Prevent current app from being listed
							// NOTE: If the navigation target exists in
							// multiple contexts (~XXXX in hash) they will all be skipped
							oNavigationTargets.ownNavigation = new LinkItem({
								href: sHref,
								text: _oLink.text
							});
							return;
						}
						const oLinkItem = new LinkItem({
							// As the retrieveNavigationTargets method can be called several time we can not create the LinkItem instance with the same id
							key:
								oShellHash.semanticObject && oShellHash.action
									? `${oShellHash.semanticObject}-${oShellHash.action}`
									: undefined,
							text: _oLink.text,
							description: undefined,
							href: sHref,
							// target: not supported yet
							icon: undefined, //_oLink.icon,
							initiallyVisible: _oLink.tags && _oLink.tags.indexOf("superiorAction") > -1
						});
						if (oLinkItem.getProperty("initiallyVisible")) {
							iSuperiorActionLinksFound++;
						}
						oNavigationTargets.availableActions.push(oLinkItem);

						if (oInfoLog) {
							oInfoLog.addSemanticObjectIntent(oShellHash.semanticObject, {
								intent: oLinkItem.getHref(),
								text: oLinkItem.getText()
							});
						}
					};
					for (let n = 0; n < aSemanticObjects.length; n++) {
						aLinks[n][0].forEach(fnAddLink);
					}
					if (iSuperiorActionLinksFound === 0) {
						for (let iLinkItemIndex = 0; iLinkItemIndex < oNavigationTargets.availableActions.length; iLinkItemIndex++) {
							if (iLinkItemIndex < this.getConstants().iLinksShownInPopup) {
								oNavigationTargets.availableActions[iLinkItemIndex].setProperty("initiallyVisible", true);
							} else {
								break;
							}
						}
					}
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
				} catch (oError) {
					Log.error("SimpleLinkDelegate: '_retrieveNavigationTargets' failed executing getLinks method");
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
				}
			});
		});
	});
};
SimpleLinkDelegate._getSemanticObjects = function (oPayload: any) {
	return oPayload.semanticObjects ? oPayload.semanticObjects : [];
};
SimpleLinkDelegate._getSemanticObjectUnavailableActions = function (oPayload: any) {
	const aSemanticObjectUnavailableActions: any[] = [];
	if (oPayload.semanticObjectUnavailableActions) {
		oPayload.semanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableAction: any) {
			aSemanticObjectUnavailableActions.push(
				new SemanticObjectUnavailableAction({
					semanticObject: oSemanticObjectUnavailableAction.semanticObject,
					actions: oSemanticObjectUnavailableAction.actions
				})
			);
		});
	}
	return aSemanticObjectUnavailableActions;
};

/**
 * This will return an array of {@link sap.ui.mdc.link.SemanticObjectMapping} depending on the given payload.
 *
 * @private
 * @param oPayload The payload defined by the application
 * @returns An array of semantic object mappings.
 */
SimpleLinkDelegate._getSemanticObjectMappings = function (oPayload: any) {
	const aSemanticObjectMappings: any[] = [];
	let aSemanticObjectMappingItems: any[] = [];
	if (oPayload.semanticObjectMappings) {
		oPayload.semanticObjectMappings.forEach(function (oSemanticObjectMapping: any) {
			aSemanticObjectMappingItems = [];
			if (oSemanticObjectMapping.items) {
				oSemanticObjectMapping.items.forEach(function (oSemanticObjectMappingItem: any) {
					aSemanticObjectMappingItems.push(
						new SemanticObjectMappingItem({
							key: oSemanticObjectMappingItem.key,
							value: oSemanticObjectMappingItem.value
						})
					);
				});
			}
			aSemanticObjectMappings.push(
				new SemanticObjectMapping({
					semanticObject: oSemanticObjectMapping.semanticObject,
					items: aSemanticObjectMappingItems
				})
			);
		});
	}
	return aSemanticObjectMappings;
};
/**
 * Converts a given array of SemanticObjectMapping into a Map containing SemanticObjects as Keys and a Map of it's corresponding SemanticObjectMappings as values.
 *
 * @private
 * @param aSemanticObjectMappings An array of SemanticObjectMappings.
 * @returns The converterd SemanticObjectMappings
 */
SimpleLinkDelegate._convertSemanticObjectMapping = function (aSemanticObjectMappings: any[]) {
	if (!aSemanticObjectMappings.length) {
		return undefined;
	}
	const mSemanticObjectMappings: any = {};
	aSemanticObjectMappings.forEach(function (oSemanticObjectMapping: any) {
		if (!oSemanticObjectMapping.getSemanticObject()) {
			throw Error(
				`SimpleLinkDelegate: 'semanticObject' property with value '${oSemanticObjectMapping.getSemanticObject()}' is not valid`
			);
		}
		mSemanticObjectMappings[oSemanticObjectMapping.getSemanticObject()] = oSemanticObjectMapping
			.getItems()
			.reduce(function (oMap: any, oItem: any) {
				oMap[oItem.getKey()] = oItem.getValue();
				return oMap;
			}, {});
	});
	return mSemanticObjectMappings;
};
/**
 * Converts a given array of SemanticObjectUnavailableActions into a map containing SemanticObjects as keys and a map of its corresponding SemanticObjectUnavailableActions as values.
 *
 * @private
 * @param aSemanticObjectUnavailableActions The SemanticObjectUnavailableActions converted
 * @returns The map containing the converted SemanticObjectUnavailableActions
 */
SimpleLinkDelegate._convertSemanticObjectUnavailableAction = function (aSemanticObjectUnavailableActions: any[]) {
	let _SemanticObjectName: any;
	let _SemanticObjectHasAlreadyUnavailableActions: any;
	let _UnavailableActions: any[] = [];
	if (!aSemanticObjectUnavailableActions.length) {
		return undefined;
	}
	const mSemanticObjectUnavailableActions: any = {};
	aSemanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableActions: any) {
		_SemanticObjectName = oSemanticObjectUnavailableActions.getSemanticObject();
		if (!_SemanticObjectName) {
			throw Error(`SimpleLinkDelegate: 'semanticObject' property with value '${_SemanticObjectName}' is not valid`);
		}
		_UnavailableActions = oSemanticObjectUnavailableActions.getActions();
		if (mSemanticObjectUnavailableActions[_SemanticObjectName] === undefined) {
			mSemanticObjectUnavailableActions[_SemanticObjectName] = _UnavailableActions;
		} else {
			_SemanticObjectHasAlreadyUnavailableActions = mSemanticObjectUnavailableActions[_SemanticObjectName];
			_UnavailableActions.forEach(function (UnavailableAction: string) {
				_SemanticObjectHasAlreadyUnavailableActions.push(UnavailableAction);
			});
			mSemanticObjectUnavailableActions[_SemanticObjectName] = _SemanticObjectHasAlreadyUnavailableActions;
		}
	});
	return mSemanticObjectUnavailableActions;
};

export default SimpleLinkDelegate;
