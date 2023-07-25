import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import TypeUtil from "sap/fe/core/type/TypeUtil";
import type { InOutParameter, ValueHelpPayload } from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import ValueListHelper from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import highlightDOMElements from "sap/m/inputUtils/highlightDOMElements";
import type { AggregationBindingInfo } from "sap/ui/base/ManagedObject";
import type Control from "sap/ui/core/Control";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import Condition from "sap/ui/mdc/condition/Condition";
import ConditionValidated from "sap/ui/mdc/enum/ConditionValidated";
import type FieldBase from "sap/ui/mdc/field/FieldBase";
import type FilterBarBase from "sap/ui/mdc/filterbar/FilterBarBase";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import type ValueHelp from "sap/ui/mdc/ValueHelp";
import type Container from "sap/ui/mdc/valuehelp/base/Container";
import type Content from "sap/ui/mdc/valuehelp/base/Content";
import type FilterableListContent from "sap/ui/mdc/valuehelp/base/FilterableListContent";
import type MTable from "sap/ui/mdc/valuehelp/content/MTable";
import ValueHelpDelegate from "sap/ui/mdc/ValueHelpDelegate";
import type Filter from "sap/ui/model/Filter";
import FilterType from "sap/ui/model/FilterType";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

const FeCoreControlsFilterBar = "sap.fe.core.controls.FilterBar";
const MdcFilterbarFilterBarBase = "sap.ui.mdc.filterbar.FilterBarBase";

type ConditionObjectMap = Record<string, ConditionObject[]>;

export type ExternalStateType = {
	items: { name: string }[];
	filter: ConditionObjectMap;
};

export type ConditionPayloadType = Record<string, string | boolean>;

export type ConditionPayloadMap = Record<string, ConditionPayloadType[]>;

export default Object.assign({}, ValueHelpDelegate, {
	/**
	 * Checks if a <code>ListBinding</code> supports $Search.
	 *
	 * @param _payload Payload for delegate
	 * @param content Content element
	 * @param _listBinding
	 * @returns True if $search is supported
	 */
	isSearchSupported: function (_payload: ValueHelpPayload, content: FilterableListContent, _listBinding: ODataListBinding) {
		return content.getFilterFields() === "$search";
	},

	/**
	 * Adjustable filtering for list-based contents.
	 *
	 * @param payload Payload for delegate
	 * @param content ValueHelp content requesting conditions configuration
	 * @param bindingInfo The binding info object to be used to bind the list to the model
	 */
	updateBindingInfo: function (payload: ValueHelpPayload, content: FilterableListContent, bindingInfo: AggregationBindingInfo) {
		ValueHelpDelegate.updateBindingInfo(payload, content, bindingInfo);

		if (content.getFilterFields() === "$search") {
			const search = content.getFilterValue();
			const normalizedSearch = CommonUtils.normalizeSearchTerm(search); // adjustSearch

			if (bindingInfo.parameters) {
				(bindingInfo.parameters as Record<string, unknown>).$search = normalizedSearch || undefined;
			}
		}
	},

	/**
	 * Executes a filter in a <code>ListBinding</code> and resumes it, if suspended.
	 *
	 * @param _payload Payload for delegate
	 * @param listBinding List binding
	 * @param bindingInfo The binding info object to be used to bind the list to the model
	 */
	updateBinding: function (_payload: ValueHelpPayload, listBinding: ODataListBinding, bindingInfo: AggregationBindingInfo) {
		const rootBinding = listBinding.getRootBinding() || listBinding;
		if (!rootBinding.isSuspended()) {
			rootBinding.suspend();
		}
		if (bindingInfo.parameters) {
			listBinding.changeParameters(bindingInfo.parameters);
		}
		listBinding.filter(bindingInfo.filters, FilterType.Application);

		if (rootBinding.isSuspended()) {
			rootBinding.resume();
		}
	},

	/**
	 * Executes a filter in a <code>ListBinding</code>.
	 *
	 * @param payload Payload for delegate
	 * @param listBinding List binding
	 * @param _filter Filter
	 * @param requestedItems Number of requested items
	 * @returns Promise that is resolved if search is executed
	 */
	executeFilter: async function (payload: ValueHelpPayload, listBinding: ODataListBinding, _filter: Filter, requestedItems: number) {
		listBinding.getContexts(0, requestedItems);

		await this.checkListBindingPending(payload, listBinding, requestedItems);
		return listBinding;
	},

	/**
	 * Checks if the <code>ListBinding</code> is waiting for an update.
	 * As long as the context has not been set for <code>ListBinding</code>,
	 * <code>ValueHelp</code> needs to wait.
	 *
	 * @param _payload Payload for delegate
	 * @param listBinding ListBinding to check
	 * @param requestedItems Number of requested items
	 * @returns Promise that is resolved once ListBinding has been updated
	 */
	checkListBindingPending: async function (
		_payload: ValueHelpPayload,
		listBinding: ODataListBinding | undefined,
		requestedItems: number
	) {
		if (!listBinding || listBinding.isSuspended()) {
			return false;
		}

		const contexts = await listBinding.requestContexts(0, requestedItems);
		return contexts.length === 0;
	},

	getTypeUtil: function (_payload: ValueHelpPayload) {
		return TypeUtil;
	},

	/**
	 * Requests the content of the value help.
	 *
	 * This function is called when the value help is opened or a key or description is requested.
	 *
	 * So, depending on the value help content used, all content controls and data need to be assigned.
	 * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
	 * Only then does the value help continue opening or reading data.
	 *
	 * @param payload Payload for delegate
	 * @param container Container instance
	 * @param contentId Id of the content shown after this call to retrieveContent
	 * @returns Promise that is resolved if all content is available
	 */
	retrieveContent: function (payload: ValueHelpPayload, container: Container, contentId: string) {
		return ValueListHelper.showValueList(payload, container, contentId);
	},

	_getConditionPayloadList: function (condition: ConditionObject) {
		const conditionPayloadMap = (condition.payload || {}) as ConditionPayloadMap,
			valueHelpQualifiers = Object.keys(conditionPayloadMap),
			conditionPayloadList = valueHelpQualifiers.length ? conditionPayloadMap[valueHelpQualifiers[0]] : [];

		return conditionPayloadList;
	},

	_onConditionPropagationToFilterBar: async function (
		filterBarVH: FilterBarBase,
		conditions: ConditionObject[],
		outParameters: InOutParameter[],
		filterBar: FilterBarBase
	) {
		try {
			const state: ExternalStateType = await StateUtil.retrieveExternalState(filterBar);
			const filterItemsVH = filterBarVH.getFilterItems();
			for (const condition of conditions) {
				const conditionPayloadList = this._getConditionPayloadList(condition);
				for (const outParameter of outParameters) {
					const filterTarget = outParameter.source.split("/").pop() || "";
					// propagate OUT parameter only if the filter field is visible in the LR filterbar
					if (
						// LR FilterBar or LR AdaptFilter
						filterItemsVH.find((item) => item.getId().split("::").pop() === filterTarget)
					) {
						for (const conditionPayload of conditionPayloadList) {
							const newCondition = Condition.createCondition(
								"EQ",
								[conditionPayload[outParameter.helpPath]],
								null,
								null,
								ConditionValidated.Validated
							);
							state.filter[filterTarget] ||= [];
							state.filter[filterTarget].push(newCondition);
						}
					}
				}
			}
			StateUtil.applyExternalState(filterBar, state);
		} catch (err) {
			const message = (err instanceof Error) ? err.message : String(err);
			Log.error(`ValueHelpDelegate: ${message}`);
		}
	},

	_onConditionPropagationToBindingContext: function (
		conditions: ConditionObject[],
		outParameters: InOutParameter[],
		context: Context
	) {
		const metaModel = context.getModel().getMetaModel();

		for (const condition of conditions) {
			const conditionPayloadList = this._getConditionPayloadList(condition),
				outValues = conditionPayloadList.length === 1 ? conditionPayloadList[0] : undefined;

			if (conditionPayloadList.length > 1) {
				Log.warning("ValueHelpDelegate: ParameterOut in multi-value-field not supported");
			}
			if (outValues) {
				this._onConditionPropagationUpdateProperty(metaModel, outValues, outParameters, context);
			}
		}
	},

	_onConditionPropagationUpdateProperty: function (
		metaModel: ODataMetaModel,
		outValues: ConditionPayloadType,
		outParameters: InOutParameter[],
		context: Context
	) {
		for (const outParameter of outParameters) {
			/* If the key gets updated via out-parameter, then the description needs also retrieved with requestSideEffects */
			if (context.getProperty(outParameter.source) !== outValues[outParameter.helpPath]) {
				const propertyPath = context.getPath()?.split('(')[0] + `/${outParameter.source}`;
				const textAnnotation = metaModel?.getObject(`${propertyPath}@com.sap.vocabularies.Common.v1.Text`);
				if (textAnnotation !== undefined) {
					const textPath = textAnnotation?.$Path;
					context.requestSideEffects([textPath.split('/')[0]]);
				}
			}
			context.setProperty(outParameter.source, outValues[outParameter.helpPath]);
		}
	},

	/**
	 * Callback invoked every time a {@link sap.ui.mdc.ValueHelp ValueHelp} fires a select event or the value of the corresponding field changes
	 * This callback may be used to update external fields.
	 *
	 * @param payload Payload for delegate
	 * @param valueHelp ValueHelp control instance receiving the <code>controlChange</code>
	 * @param reason Reason why the method was invoked
	 * @param _config Current configuration provided by the calling control
	 * @since 1.101.0
	 */
	onConditionPropagation: async function (payload: ValueHelpPayload, valueHelp: ValueHelp, reason: string, _config: unknown) {
		if (reason !== "ControlChange") {
			// handle only ControlChange reason
			return;
		}
		const qualifier = payload.qualifiers[payload.valueHelpQualifier];
		const outParameters = qualifier?.vhParameters !== undefined ? ValueListHelper.getOutParameters(qualifier.vhParameters) : [],
			field = valueHelp.getControl() as FieldBase,
			fieldParent = field.getParent() as FilterBarBase | Control;

		let conditions = field.getConditions() as ConditionObject[];
		conditions = conditions.filter(function (condition) {
			const conditionPayloadMap = (condition.payload || {}) as ConditionPayloadMap;
			return conditionPayloadMap[payload.valueHelpQualifier];
		});

		if (fieldParent.isA<FilterBarBase>(MdcFilterbarFilterBarBase)) {
			// field inside a FilterBar or AdaptationFilterBar (Settings Dialog)?
			const filterBarVH = valueHelp.getParent() as FilterBarBase | Control; // Control e.g. FormContainer
			if (filterBarVH.isA(FeCoreControlsFilterBar)) {
				// only for LR FilterBar
				await this._onConditionPropagationToFilterBar(
					filterBarVH as FilterBarBase,
					conditions,
					outParameters,
					fieldParent
				);
			}
			// LR Settings Dialog or OP Settings Dialog shall not propagate value to the dialog filterfields or context
		} else {
			// Object Page
			const context = valueHelp.getBindingContext() as Context | undefined;
			if (context) {
				this._onConditionPropagationToBindingContext(conditions, outParameters, context);
			}
		}
	},

	_createInitialFilterCondition: function (value: unknown, initialValueFilterEmpty: boolean) {
		let condition: ConditionObject | undefined;

		if (value === undefined || value === null) {
			Log.error("ValueHelpDelegate: value of the property could not be requested");
		} else if (value === "") {
			if (initialValueFilterEmpty) {
				condition = Condition.createCondition("Empty", [], null, null, ConditionValidated.Validated);
			}
		} else {
			condition = Condition.createCondition("EQ", [value], null, null, ConditionValidated.Validated);
		}
		return condition;
	},

	_getInitialFilterConditionsFromBinding: async function (
		inConditions: ConditionObjectMap,
		control: Control,
		inParameters: InOutParameter[]
	) {
		const propertiesToRequest = inParameters.map((inParameter) => inParameter.source);
		const bindingContext = control.getBindingContext() as Context | undefined;

		if (!bindingContext) {
			Log.error("ValueHelpDelegate: No BindingContext");
			return inConditions;
		}

		// According to odata v4 api documentation for requestProperty: Property values that are not cached yet are requested from the back end
		const values = await bindingContext.requestProperty(propertiesToRequest);

		for (let i = 0; i < inParameters.length; i++) {
			const inParameter = inParameters[i];
			const condition = this._createInitialFilterCondition(values[i], inParameter.initialValueFilterEmpty);

			if (condition) {
				inConditions[inParameter.helpPath] = [condition];
			}
		}
		return inConditions;
	},

	_getInitialFilterConditionsFromFilterBar: async function (
		inConditions: ConditionObjectMap,
		control: Control,
		inParameters: InOutParameter[]
	) {
		const filterBar = control.getParent() as FilterBarBase;
		const state: ExternalStateType = await StateUtil.retrieveExternalState(filterBar);

		for (const inParameter of inParameters) {
			const sourceField = inParameter.source.split("/").pop() as string;
			const conditions = state.filter[sourceField];

			if (conditions) {
				inConditions[inParameter.helpPath] = conditions;
			}
		}
		return inConditions;
	},

	_partitionInParameters: function (inParameters: InOutParameter[]) {
		const inParameterMap: Record<string, InOutParameter[]> = {
			constant: [],
			binding: [],
			filter: []
		};

		for (const inParameter of inParameters) {
			if (inParameter.constantValue !== undefined) {
				inParameterMap.constant.push(inParameter);
			} else if (inParameter.source.indexOf("$filter") === 0) {
				inParameterMap.filter.push(inParameter);
			} else {
				inParameterMap.binding.push(inParameter);
			}
		}
		return inParameterMap;
	},

	_tableAfterRenderDelegate: {
		onAfterRendering: function (event: jQuery.Event & { srcControl: Control }) {
			const table = event.srcControl, // m.Table
				tableCellsDomRefs = table.$().find("tbody .sapMText"),
				mdcMTable = table.getParent() as MTable;

			highlightDOMElements(tableCellsDomRefs, mdcMTable.getFilterValue(), true);
		}
	},

	/**
	 * Provides an initial condition configuration everytime a value help content is shown.
	 *
	 * @param payload Payload for delegate
	 * @param content ValueHelp content requesting conditions configuration
	 * @param control Instance of the calling control
	 * @returns Returns a map of conditions suitable for a sap.ui.mdc.FilterBar control
	 * @since 1.101.0
	 */
	getInitialFilterConditions: async function (payload: ValueHelpPayload, content: Content, control: Control | undefined) {
		// highlight text in ValueHelp popover
		if (content?.isA("sap.ui.mdc.valuehelp.content.MTable")) {
			const popoverTable = (content as MTable).getTable();
			popoverTable?.removeEventDelegate(this._tableAfterRenderDelegate);
			popoverTable?.addEventDelegate(this._tableAfterRenderDelegate, this);
		}

		const inConditions: ConditionObjectMap = {};

		if (!control) {
			Log.error("ValueHelpDelegate: Control undefined");
			return inConditions;
		}

		const qualifier = payload.qualifiers[payload.valueHelpQualifier];
		const inParameters = qualifier?.vhParameters !== undefined ? ValueListHelper.getInParameters(qualifier.vhParameters) : [];
		const inParameterMap = this._partitionInParameters(inParameters);
		const isObjectPage = control.getBindingContext();

		for (const inParameter of inParameterMap.constant) {
			const condition = this._createInitialFilterCondition(
				inParameter.constantValue,
				isObjectPage ? inParameter.initialValueFilterEmpty : false // no filter with "empty" on ListReport
			);
			if (condition) {
				inConditions[inParameter.helpPath] = [condition];
			}
		}

		if (inParameterMap.binding.length) {
			await this._getInitialFilterConditionsFromBinding(inConditions, control, inParameterMap.binding);
		}

		if (inParameterMap.filter.length) {
			await this._getInitialFilterConditionsFromFilterBar(inConditions, control, inParameterMap.filter);
		}
		return inConditions;
	},

	/**
	 * Provides the possibility to convey custom data in conditions.
	 * This enables an application to enhance conditions with data relevant for combined key or outparameter scenarios.
	 *
	 * @param payload Payload for delegate
	 * @param content ValueHelp content instance
	 * @param _values Description pair for the condition which is to be created
	 * @param context Optional additional context
	 * @returns Optionally returns a serializable object to be stored in the condition payload field
	 * @since 1.101.0
	 */
	createConditionPayload: function (
		payload: ValueHelpPayload,
		content: Content,
		_values: unknown[],
		context: Context
	): ConditionPayloadMap | undefined {
		const qualifier = payload.qualifiers[payload.valueHelpQualifier],
			entry: ConditionPayloadType = {},
			conditionPayload: ConditionPayloadMap = {};
		const control = content.getControl();
		const isMultiValueField = control?.isA("sap.ui.mdc.MultiValueField");
		if (!qualifier.vhKeys || qualifier.vhKeys.length === 1 || isMultiValueField) {
			return undefined;
		}
		qualifier.vhKeys.forEach(function (vhKey) {
			const value = context.getObject(vhKey);
			if (value != null) {
				entry[vhKey] = value?.length === 0 ? "" : value;
			}
		});
		if (Object.keys(entry).length) {
			/* vh qualifier as key for relevant condition */
			conditionPayload[payload.valueHelpQualifier] = [entry];
		}
		return conditionPayload;
	},

	/**
	 * Provides the possibility to customize selections in 'Select from list' scenarios.
	 * By default, only condition keys are considered. This may be extended with payload dependent filters.
	 *
	 * @param payload Payload for delegate
	 * @param content ValueHelp content instance
	 * @param item Entry of a given list
	 * @param conditions Current conditions
	 * @returns True, if item is selected
	 * @since 1.101.0
	 */
	isFilterableListItemSelected: function (payload: ValueHelpPayload, content: Content, item: Control, conditions: ConditionObject[]) {
		//In value help dialogs of single value fields the row for the key shouldn´t be selected/highlight anymore BCP: 2270175246
		if (payload.isValueListWithFixedValues !== true && content.getConfig()?.maxConditions === 1) {
			return false;
		}

		const context = item.getBindingContext();

		/* Do not consider "NotValidated" conditions */
		conditions = conditions.filter((condition) => condition.validated === ConditionValidated.Validated);

		const selectedCondition = conditions.find(function (condition) {
			const conditionPayloadMap = condition.payload as ConditionPayloadMap | undefined,
				valueHelpQualifier = payload.valueHelpQualifier || "";
			if (!conditionPayloadMap && Object.keys(payload.qualifiers)[0] === valueHelpQualifier) {
				const keyPath = content.getKeyPath();
				return context?.getObject(keyPath) === condition?.values[0];
			}
			const conditionSelectedRow = conditionPayloadMap?.[valueHelpQualifier]?.[0] || {},
				selectedKeys = Object.keys(conditionSelectedRow);
			if (selectedKeys.length) {
				return selectedKeys.every(function (key) {
					return (conditionSelectedRow[key] as unknown) === context?.getObject(key);
				});
			}
			return false;
		});

		return selectedCondition ? true : false;
	}
});
