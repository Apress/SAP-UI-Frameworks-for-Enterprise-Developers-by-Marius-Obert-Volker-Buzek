import { aggregation, defineUI5Class, event, implementInterface, property } from "sap/fe/core/helpers/ClassSupport";
import SemanticDateOperators from "sap/fe/core/helpers/SemanticDateOperators";
import ManagedObjectObserver from "sap/ui/base/ManagedObjectObserver";
import Control from "sap/ui/core/Control"; //import Control from "sap/ui/mdc/field/FieldBase";
import type { IFormContent } from "sap/ui/core/library";
import type RenderManager from "sap/ui/core/RenderManager";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import Condition from "sap/ui/mdc/condition/Condition";
import ConditionValidated from "sap/ui/mdc/enum/ConditionValidated";
import ConditionsType from "sap/ui/mdc/field/ConditionsType";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * Type used for format options
 *
 * @typedef FormatOptionsType
 */
type FormatOptionsType = {
	operators: string[];
};

/**
 * @class
 * Creates an <code>sap.fe.macros.controls.CustomFilterFieldContentWrapper</code> object.
 * This is used in the {@link sap.ui.mdc.FilterField FilterField} as a filter content.
 * @extends sap.ui.core.Control
 * @private
 * @alias sap.fe.core.macros.CustomFilterFieldContentWrapper
 */
@defineUI5Class("sap.fe.macros.controls.CustomFilterFieldContentWrapper")
export default class CustomFilterFieldContentWrapper extends Control implements IFormContent {
	@implementInterface("sap.ui.core.IFormContent")
	// eslint-disable-next-line camelcase
	__implements__sap_ui_core_IFormContent = true;

	@property({ type: "sap.ui.core.CSSSize", defaultValue: null })
	width!: string;

	@property({ type: "boolean", defaultValue: false })
	formDoNotAdjustWidth!: boolean;

	@property({ type: "object[]", defaultValue: [] })
	conditions!: ConditionObject[];

	@aggregation({ type: "sap.ui.core.Control", multiple: false, isDefault: true })
	content!: Control;

	@event()
	conditionsChange!: Function;

	// Note: FieldBase might be used as base control (instead of Control) in a later version;
	// in that case, you should add a 'change' event and bubble it to the corresponding handlers

	private _filterModel: any;

	private _conditionsObserver: any;

	private static readonly FILTER_MODEL_ALIAS = "filterValues";

	static render(renderManager: RenderManager, control: CustomFilterFieldContentWrapper): void {
		renderManager.openStart("div", control);
		renderManager.style("min-height", "1rem");
		renderManager.style("width", control.width);
		renderManager.openEnd();
		renderManager.renderControl(control.getContent()); // render the child Control
		renderManager.close("div"); // end of the complete Control
	}

	/**
	 * Maps an array of filter values to an array of conditions.
	 *
	 * @param filterValues Array of filter value bindings or a filter value string
	 * @param [operator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
	 * @private
	 * @returns Array of filter conditions
	 */
	static _filterValuesToConditions(filterValues: any | any[], operator?: string): ConditionObject[] {
		let formatOptions: FormatOptionsType = { operators: [] },
			conditions = [];

		if (operator) {
			formatOptions = { operators: [operator] };
		}
		if (filterValues === "") {
			filterValues = [];
		} else if (typeof filterValues === "object" && filterValues.hasOwnProperty("operator") && filterValues.hasOwnProperty("values")) {
			formatOptions = { operators: [filterValues.operator] };
			filterValues = filterValues.values;
		} else if (filterValues !== undefined && typeof filterValues !== "object" && typeof filterValues !== "string") {
			throw new Error(`FilterUtils.js#_filterValuesToConditions: Unexpected type of input parameter vValues: ${typeof filterValues}`);
		}

		const conditionsType: any = new ConditionsType(formatOptions);
		const conditionValues = Array.isArray(filterValues) ? filterValues : [filterValues];

		// Shortcut for operator without values and semantic date operations
		if (
			typeof operator === "string" &&
			(conditionValues.length === 0 || SemanticDateOperators.getSemanticDateOperations().includes(operator))
		) {
			conditions = [Condition.createCondition(operator, conditionValues, null, null, ConditionValidated.NotValidated)];
		} else {
			conditions = conditionValues
				.map((conditionValue) => {
					const stringValue = conditionValue?.toString(),
						parsedConditions = conditionsType.parseValue(stringValue, "any");
					return parsedConditions?.[0];
				})
				.filter((conditionValue) => conditionValue !== undefined);
		}

		return conditions;
	}

	/**
	 * Maps an array of conditions to a comma separated list of filter values.
	 *
	 * @param conditions Array of filter conditions
	 * @param formatOptions Format options that specifies a condition type
	 * @private
	 * @returns Concatenated string of filter values
	 */
	static _conditionsToFilterModelString(conditions: object[], formatOptions: FormatOptionsType): string {
		const conditionsType = new ConditionsType(formatOptions);

		return conditions
			.map((condition) => {
				return conditionsType.formatValue([condition], "any") || "";
			})
			.filter((stringValue) => {
				return stringValue !== "";
			})
			.join(",");
	}

	/**
	 * Listens to filter model changes and updates wrapper property "conditions".
	 *
	 * @param changeEvent Event triggered by a filter model change
	 * @private
	 */
	_handleFilterModelChange(changeEvent: any): void {
		const propertyPath = this.getObjectBinding("filterValues")?.getPath(),
			values = changeEvent.getSource().getProperty(propertyPath);
		this.updateConditionsByFilterValues(values, "");
	}

	/**
	 * Listens to "conditions" changes and updates the filter model.
	 *
	 * @param conditions Event triggered by a "conditions" change
	 * @private
	 */
	_handleConditionsChange(conditions: any): void {
		this.updateFilterModelByConditions(conditions);
	}

	/**
	 * Initialize CustomFilterFieldContentWrapper control and register observer.
	 */
	init(): void {
		super.init();
		this._conditionsObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
		this._conditionsObserver.observe(this, {
			properties: ["conditions"]
		});
		this._filterModel = new JSONModel();
		this._filterModel.attachPropertyChange(this._handleFilterModelChange, this);
		this.setModel(this._filterModel, CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS);
	}

	/**
	 * Overrides {@link sap.ui.core.Control#clone Control.clone} to clone additional
	 * internal states.
	 *
	 * @param [sIdSuffix] A suffix to be appended to the cloned control id
	 * @param [aLocalIds] An array of local IDs within the cloned hierarchy (internally used)
	 * @returns Reference to the newly created clone
	 * @protected
	 */
	clone(sIdSuffix: string | undefined, aLocalIds: string[] | undefined): this {
		const clone = super.clone(sIdSuffix, aLocalIds);
		// During cloning, the old model will be copied and overwrites any new model (same alias) that
		// you introduce during init(); hence you need to overwrite it again by the new one that you've
		// created during init() (i.e. clone._filterModel); that standard behaviour of super.clone()
		// can't even be suppressed in an own constructor; for a detailed investigation of the cloning,
		// please overwrite the setModel() method and check the list of callers and steps induced by them.
		clone.setModel(clone._filterModel, CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS);
		return clone;
	}

	/**
	 * Listens to property changes.
	 *
	 * @param changes Property changes
	 * @private
	 */
	_observeChanges(changes: any): void {
		if (changes.name === "conditions") {
			this._handleConditionsChange(changes.current);
		}
	}

	/**
	 * Gets the content of this wrapper control.
	 *
	 * @returns The wrapper content
	 * @private
	 */
	getContent(): Control {
		return this.getAggregation("content") as Control;
	}

	/**
	 * Gets the value for control property 'conditions'.
	 *
	 * @returns Array of filter conditions
	 * @private
	 */
	getConditions(): object[] {
		return this.getProperty("conditions");
	}

	/**
	 * Sets the value for control property 'conditions'.
	 *
	 * @param [conditions] Array of filter conditions
	 * @returns Reference to this wrapper
	 * @private
	 */
	setConditions(conditions: object[]): this {
		this.setProperty("conditions", conditions || []);
		return this;
	}

	/**
	 * Gets the filter model alias 'filterValues'.
	 *
	 * @returns The filter model
	 * @private
	 */
	getFilterModelAlias(): string {
		return CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS;
	}

	/**
	 * Updates the property "conditions" with filter values
	 * sent by ExtensionAPI#setFilterValues().
	 *
	 * @param values The filter values
	 * @param [operator] The operator name
	 * @private
	 */
	updateConditionsByFilterValues(values: any, operator?: string): void {
		const conditions = CustomFilterFieldContentWrapper._filterValuesToConditions(values, operator);
		this.setConditions(conditions);
	}

	/**
	 * Updates filter model with conditions
	 * sent by the {@link sap.ui.mdc.FilterField FilterField}.
	 *
	 * @param conditions Array of filter conditions
	 * @private
	 */
	updateFilterModelByConditions(conditions: any[]): void {
		const operator = conditions[0]?.operator || "";
		const formatOptions: FormatOptionsType = operator !== "" ? { operators: [operator] } : { operators: [] };
		if (this.getBindingContext(CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS)) {
			const stringValue = CustomFilterFieldContentWrapper._conditionsToFilterModelString(conditions, formatOptions);
			this._filterModel.setProperty(
				this.getBindingContext(CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS)?.getPath(),
				stringValue
			);
		}
	}

	getAccessibilityInfo(): any {
		const content = this.getContent();
		return content?.getAccessibilityInfo?.() || {};
	}

	/**
	 * Returns the DOMNode ID to be used for the "labelFor" attribute.
	 *
	 * We forward the call of this method to the content control.
	 *
	 * @returns ID to be used for the <code>labelFor</code>
	 */
	getIdForLabel(): string {
		const content = this.getContent();
		return content?.getIdForLabel();
	}
}
