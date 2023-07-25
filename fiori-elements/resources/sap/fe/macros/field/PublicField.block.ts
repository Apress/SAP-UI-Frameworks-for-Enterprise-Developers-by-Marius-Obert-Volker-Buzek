import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, blockEvent, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { compileExpression, equal, ifElse, resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import FieldHelper from "sap/fe/macros/field/FieldHelper";
import type Context from "sap/ui/model/odata/v4/Context";

type FieldFormatOptions = {
	displayMode?: string;
	measureDisplayMode?: string;
	textLinesEdit?: number;
	textMaxLines?: number;
	textMaxCharactersDisplay?: number;
	textExpandBehaviorDisplay?: string;
	textMaxLength?: number;
	showDate?: boolean;
	showTime?: boolean;
	showTimezone?: boolean;
};

/**
 * Public external field representation
 */
@defineBuildingBlock({
	name: "Field",
	publicNamespace: "sap.fe.macros"
})
export default class PublicFieldBlock extends BuildingBlockBase {
	/**
	 * The 'id' property
	 */
	@blockAttribute({ type: "string", isPublic: true, required: true })
	public id!: string;

	/**
	 * The meta path provided for the field
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true,
		required: true
	})
	public metaPath!: Context;

	/**
	 * The context path provided for the field
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true,
		required: true
	})
	public contextPath!: Context;

	/**
	 * The readOnly flag
	 */
	@blockAttribute({ type: "boolean", isPublic: true, required: false })
	public readOnly?: boolean;

	/**
	 * The semantic object associated to the field
	 */
	@blockAttribute({
		type: "string",
		isPublic: true,
		required: false
	})
	public semanticObject?: string;

	/**
	 * The edit mode expression for the field
	 */
	@blockAttribute({
		type: "string",
		isPublic: true,
		required: false
	})
	public editModeExpression?;

	/**
	 * The object with the formatting options
	 */
	@blockAttribute({
		type: "object",
		isPublic: true,
		validate: function (formatOptionsInput: FieldFormatOptions) {
			if (
				formatOptionsInput.displayMode &&
				!["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)
			) {
				throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
			}

			if (formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput.measureDisplayMode)) {
				throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
			}

			if (
				formatOptionsInput.textExpandBehaviorDisplay &&
				!["InPlace", "Popover"].includes(formatOptionsInput.textExpandBehaviorDisplay)
			) {
				throw new Error(
					`Allowed value ${formatOptionsInput.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`
				);
			}

			return formatOptionsInput;
		}
	})
	public formatOptions: FieldFormatOptions = {};

	/**
	 * The generic change event
	 */
	@blockEvent()
	change?: string;

	constructor(props: PropertiesOf<PublicFieldBlock>) {
		super(props);

		if (this.readOnly !== undefined) {
			this.editModeExpression = compileExpression(
				ifElse(equal(resolveBindingString(this.readOnly, "boolean"), true), "Display", "Editable")
			);
		}
	}

	/**
	 * Sets the internal formatOptions for the building block.
	 *
	 * @returns A string with the internal formatOptions for the building block
	 */
	getFormatOptions(): string {
		return xml`
		<internalMacro:formatOptions
			textAlignMode="Form"
			showEmptyIndicator="true"
			displayMode="${this.formatOptions.displayMode}"
			measureDisplayMode="${this.formatOptions.measureDisplayMode}"
			textLinesEdit="${this.formatOptions.textLinesEdit}"
			textMaxLines="${this.formatOptions.textMaxLines}"
			textMaxCharactersDisplay="${this.formatOptions.textMaxCharactersDisplay}"
			textExpandBehaviorDisplay="${this.formatOptions.textExpandBehaviorDisplay}"
			textMaxLength="${this.formatOptions.textMaxLength}"
			>
			${this.writeDateFormatOptions()}
		</internalMacro:formatOptions>
			`;
	}

	writeDateFormatOptions(): string {
		if (this.formatOptions.showTime || this.formatOptions.showDate || this.formatOptions.showTimezone) {
			return xml`<internalMacro:dateFormatOptions showTime="${this.formatOptions.showTime}"
				showDate="${this.formatOptions.showDate}"
				showTimezone="${this.formatOptions.showTimezone}"
				/>`;
		}
		return "";
	}

	/**
	 * The function calculates the corresponding ValueHelp field in case it´s
	 * defined for the specific control.
	 *
	 * @returns An XML-based string with a possible ValueHelp control.
	 */
	getPossibleValueHelpTemplate(): string {
		const vhp = FieldHelper.valueHelpProperty(this.metaPath);
		const vhpCtx = this.metaPath.getModel().createBindingContext(vhp, this.metaPath);
		const hasValueHelpAnnotations = FieldHelper.hasValueHelpAnnotation(vhpCtx.getObject("@"));
		if (hasValueHelpAnnotations) {
			// depending on whether this one has a value help annotation included, add the dependent
			return xml`
			<internalMacro:dependents>
				<macros:ValueHelp _flexId="${this.id}-content_FieldValueHelp" property="${vhpCtx}" contextPath="${this.contextPath}" />
			</internalMacro:dependents>`;
		}
		return "";
	}

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate() {
		const contextPathPath = this.contextPath.getPath();
		const metaPathPath = this.metaPath.getPath();
		return xml`
		<internalMacro:Field
			xmlns:internalMacro="sap.fe.macros.internal"
			entitySet="${contextPathPath}"
			dataField="${metaPathPath}"
			editMode="${this.editModeExpression}"
			onChange="${this.change}"
			_flexId="${this.id}"
			semanticObject="${this.semanticObject}"
		>
			${this.getFormatOptions()}
			${this.getPossibleValueHelpTemplate()}
		</internalMacro:Field>`;
	}
}
