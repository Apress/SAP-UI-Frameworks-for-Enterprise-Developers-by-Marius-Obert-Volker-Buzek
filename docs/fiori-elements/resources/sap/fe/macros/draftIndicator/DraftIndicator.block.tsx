import type { NavigationProperty } from "@sap-ux/vocabularies-types";
import formatMessage from "sap/base/strings/formatMessage";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import CommonUtils from "sap/fe/core/CommonUtils";
import { Entity, UI } from "sap/fe/core/converters/helpers/BindingHelper";
import { convertMetaModelContext } from "sap/fe/core/converters/MetaModelConverter";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { and, constant, ifElse, isEmpty, not, or, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import Button from "sap/m/Button";
import { ObjectMarkerType, ObjectMarkerVisibility } from "sap/m/library";
import ObjectMarker from "sap/m/ObjectMarker";
import Popover from "sap/m/Popover";
import Text from "sap/m/Text";
import VBox from "sap/m/VBox";
import type Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import type Context from "sap/ui/model/odata/v4/Context";

/**
 * Building block for creating a DraftIndicator based on the metadata provided by OData V4.
 *
 * Usage example:
 * <pre>
 * &lt;macro:DraftIndicator
 *   id="SomeID"
 * /&gt;
 * </pre>
 *
 * @private
 */
@defineBuildingBlock({ name: "DraftIndicator", namespace: "sap.fe.macros" })
export default class DraftIndicatorBlock extends RuntimeBuildingBlock {
	/**
	 * ID of the DraftIndicator
	 */
	@blockAttribute({ type: "string" })
	public id?: string;

	/**
	 * Property added to associate the label with the DraftIndicator
	 */
	@blockAttribute({ type: "string" })
	public ariaLabelledBy?: string;

	/**
	 * Type of the DraftIndicator, either "IconAndText" (default) or "IconOnly"
	 */
	@blockAttribute({
		type: "string",
		validate: (value?: ObjectMarkerVisibility) => {
			if (value && ![ObjectMarkerVisibility.IconOnly, ObjectMarkerVisibility.IconAndText].includes(value)) {
				throw new Error(`Allowed value ${value} does not match`);
			}
		}
	})
	public draftIndicatorType: ObjectMarkerVisibility.IconOnly | ObjectMarkerVisibility.IconAndText = ObjectMarkerVisibility.IconAndText;

	/**
	 * Mandatory context to the EntitySet
	 */
	@blockAttribute({ type: "sap.ui.model.Context", required: true, expectedTypes: ["EntitySet", "NavigationProperty"] })
	public entitySet!: Context;

	@blockAttribute({ type: "boolean", bindable: true })
	public isDraftIndicatorVisible: BindingToolkitExpression<boolean> = constant(false);

	@blockAttribute({ type: "string" })
	public class = "";

	draftPopover?: Popover;

	/**
	 * Runtime formatter function to format the correct text that displays the owner of a draft.
	 *
	 * This is used in case the DraftIndicator is shown for an active entity that has a draft of another user.
	 *
	 * @param hasDraftEntity
	 * @param draftInProcessByUser
	 * @param draftLastChangedByUser
	 * @param draftInProcessByUserDesc
	 * @param draftLastChangedByUserDesc
	 * @returns Text to display
	 */
	static formatDraftOwnerTextInPopover(
		this: void,
		hasDraftEntity: boolean,
		draftInProcessByUser: string,
		draftLastChangedByUser: string,
		draftInProcessByUserDesc: string,
		draftLastChangedByUserDesc: string
	): string {
		const macroResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
		if (hasDraftEntity) {
			const userDescription =
				draftInProcessByUserDesc || draftInProcessByUser || draftLastChangedByUserDesc || draftLastChangedByUser;

			if (!userDescription) {
				return macroResourceBundle.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_UNKNOWN");
			} else {
				return draftInProcessByUser
					? macroResourceBundle.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_LOCKED_BY_KNOWN", [userDescription])
					: macroResourceBundle.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_KNOWN", [userDescription]);
			}
		} else {
			return macroResourceBundle.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_NO_DATA_TEXT");
		}
	}

	/***
	 * Gets the properties of the DraftAdministrativeData entity connected to the given entity set
	 *
	 * @returns List of property names
	 */
	getDraftAdministrativeDataProperties(): string[] {
		const draftAdministrativeDataContext = this.entitySet.getModel().createBindingContext("DraftAdministrativeData", this.entitySet);
		const convertedDraftAdministrativeData = convertMetaModelContext(draftAdministrativeDataContext) as NavigationProperty;
		return convertedDraftAdministrativeData.targetType.entityProperties.map((property: { name: string }) => property.name);
	}

	/**
	 * Constructs the binding expression for the text displayed as title of the popup.
	 *
	 * @returns The binding expression
	 */
	getPopoverTitleBindingExpression() {
		return ifElse(
			not(Entity.IsActive),
			pathInModel("M_COMMON_DRAFT_OBJECT", "sap.fe.i18n"),
			ifElse(
				Entity.HasDraft,
				ifElse(
					not(isEmpty(pathInModel("DraftAdministrativeData/InProcessByUser"))),
					pathInModel("M_COMMON_DRAFT_LOCKED_OBJECT", "sap.fe.i18n"),
					pathInModel("M_DRAFT_POPOVER_ADMIN_UNSAVED_OBJECT", "sap.fe.i18n")
				),
				this.draftIndicatorType === ObjectMarkerVisibility.IconAndText
					? " "
					: pathInModel("C_DRAFT_POPOVER_ADMIN_DATA_DRAFTINFO_FLAGGED_OBJECT", "sap.fe.i18n")
			)
		);
	}

	/**
	 * Constructs the binding expression for the text displayed to identify the draft owner in the popup.
	 * This binding is configured to call formatDraftOwnerTextInPopover at runtime.
	 *
	 * We cannot reference formatDraftOwnerTextInPopover directly as we need to conditionally pass properties that might exist or not,
	 * and referring to non-existing properties fails the binding.
	 *
	 * @returns The binding expression
	 */
	getDraftOwnerTextBindingExpression() {
		const draftAdministrativeDataProperties = this.getDraftAdministrativeDataProperties();

		const parts = [
			{ path: "HasDraftEntity", targetType: "any" },
			{ path: "DraftAdministrativeData/InProcessByUser" },
			{ path: "DraftAdministrativeData/LastChangedByUser" }
		];
		if (draftAdministrativeDataProperties.includes("InProcessByUserDescription")) {
			parts.push({ path: "DraftAdministrativeData/InProcessByUserDescription" });
		}
		if (draftAdministrativeDataProperties.includes("LastChangedByUserDescription")) {
			parts.push({ path: "DraftAdministrativeData/LastChangedByUserDescription" });
		}

		//parts.push({path: "sap.fe.i18n>"})

		return { parts, formatter: DraftIndicatorBlock.formatDraftOwnerTextInPopover };
	}

	/**
	 * Creates a popover control to display draft information.
	 *
	 * @param control Control that the popover is to be created for
	 * @returns The created popover control
	 */
	createPopover(control: Control): Popover {
		const isDraftWithNoChangesBinding = and(not(Entity.IsActive), isEmpty(pathInModel("DraftAdministrativeData/LastChangeDateTime")));
		const draftWithNoChangesTextBinding =
			this.draftIndicatorType === ObjectMarkerVisibility.IconAndText
				? pathInModel("M_DRAFT_POPOVER_ADMIN_GENERIC_LOCKED_OBJECT_POPOVER_TEXT", "sap.fe.i18n")
				: pathInModel("C_DRAFT_POPOVER_ADMIN_DATA_DRAFTINFO_POPOVER_NO_DATA_TEXT", "sap.fe.i18n");

		const isDraftWithChangesBinding = and(
			not(Entity.IsActive),
			not(isEmpty(pathInModel("DraftAdministrativeData/LastChangeDateTime")))
		);
		const draftWithChangesTextBinding = {
			parts: [
				{ path: "M_DRAFT_POPOVER_ADMIN_LAST_CHANGE_TEXT", model: "sap.fe.i18n" },
				{ path: "DraftAdministrativeData/LastChangeDateTime" }
			],
			formatter: formatMessage
		};

		const isActiveInstanceBinding = and(Entity.IsActive, not(isEmpty(pathInModel("DraftAdministrativeData/LastChangeDateTime"))));
		const activeInstanceTextBinding = { ...draftWithChangesTextBinding };

		const popover: Popover = (
			<Popover
				title={this.getPopoverTitleBindingExpression()}
				showHeader={true}
				contentWidth={"15.625rem"}
				verticalScrolling={false}
				class={"sapUiContentPadding"}
				endButton={(<Button icon={"sap-icon://decline"} press={() => this.draftPopover?.close()} />) as Button}
			>
				<VBox class={"sapUiContentPadding"}>
					<VBox visible={isDraftWithNoChangesBinding}>
						<Text text={draftWithNoChangesTextBinding} />
					</VBox>
					<VBox visible={isDraftWithChangesBinding}>
						<Text text={draftWithChangesTextBinding} />
					</VBox>
					<VBox visible={isActiveInstanceBinding}>
						<Text text={this.getDraftOwnerTextBindingExpression()} />
						<Text class={"sapUiSmallMarginTop"} text={activeInstanceTextBinding} />
					</VBox>
				</VBox>
			</Popover>
		) as Popover;

		CommonUtils.getTargetView(control).addDependent(popover);
		return popover;
	}

	/**
	 * Handles pressing of the object marker by opening a corresponding popover.
	 *
	 * @param event Event object passed from the press event
	 */
	onObjectMarkerPressed(event: Event): void {
		const source = event.getSource() as Control;
		const bindingContext = source.getBindingContext() as Context;

		this.draftPopover ??= this.createPopover(source);

		this.draftPopover.setBindingContext(bindingContext);
		this.draftPopover.openBy(source, false);
	}

	/**
	 * Constructs the binding expression for the "additionalInfo" attribute in the "IconAndText" case.
	 *
	 * @returns The binding expression
	 */
	getIconAndTextAdditionalInfoBindingExpression() {
		const draftAdministrativeDataProperties = this.getDraftAdministrativeDataProperties();

		const orBindings = [];
		if (draftAdministrativeDataProperties.includes("InProcessByUserDescription")) {
			orBindings.push(pathInModel("DraftAdministrativeData/InProcessByUserDescription"));
		}
		orBindings.push(pathInModel("DraftAdministrativeData/InProcessByUser"));
		if (draftAdministrativeDataProperties.includes("LastChangedByUserDescription")) {
			orBindings.push(pathInModel("DraftAdministrativeData/LastChangedByUserDescription"));
		}
		orBindings.push(pathInModel("DraftAdministrativeData/LastChangedByUser"));

		return ifElse<string>(Entity.HasDraft, or(...orBindings) as BindingToolkitExpression<string>, "");
	}

	/**
	 * Returns the content of this building block for the "IconAndText" type.
	 *
	 * @returns The control tree
	 */
	getIconAndTextContent() {
		const type = ifElse(
			not(Entity.IsActive),
			ObjectMarkerType.Draft,
			ifElse(
				Entity.HasDraft,
				ifElse(
					pathInModel("DraftAdministrativeData/InProcessByUser"),
					ObjectMarkerType.LockedBy,
					ifElse(pathInModel("DraftAdministrativeData/LastChangedByUser"), ObjectMarkerType.UnsavedBy, ObjectMarkerType.Unsaved)
				),
				ObjectMarkerType.Flagged
			)
		);

		const visibility = ifElse(not(Entity.HasDraft), ObjectMarkerVisibility.TextOnly, ObjectMarkerVisibility.IconAndText);

		return (
			<ObjectMarker
				type={type}
				press={this.onObjectMarkerPressed.bind(this)}
				visibility={visibility}
				visible={this.isDraftIndicatorVisible}
				additionalInfo={this.getIconAndTextAdditionalInfoBindingExpression()}
				ariaLabelledBy={this.ariaLabelledBy ? [this.ariaLabelledBy] : []}
				class={this.class}
			/>
		) as ObjectMarker;
	}

	/**
	 * Returns the content of this building block for the "IconOnly" type.
	 *
	 * @returns The control tree
	 */
	getIconOnlyContent() {
		const type = ifElse(
			not(Entity.IsActive),
			ObjectMarkerType.Draft,
			ifElse(
				Entity.HasDraft,
				ifElse(pathInModel("DraftAdministrativeData/InProcessByUser"), ObjectMarkerType.Locked, ObjectMarkerType.Unsaved),
				ObjectMarkerType.Flagged
			)
		);
		const visible = and(not(UI.IsEditable), Entity.HasDraft, not(pathInModel("DraftAdministrativeData/DraftIsCreatedByMe")));

		return (
			<ObjectMarker
				type={type}
				press={this.onObjectMarkerPressed.bind(this)}
				visibility={ObjectMarkerVisibility.IconOnly}
				visible={visible}
				ariaLabelledBy={this.ariaLabelledBy ? [this.ariaLabelledBy] : []}
				class={this.class}
			/>
		) as ObjectMarker;
	}

	/**
	 * Returns the content of this building block.
	 *
	 * @returns The control tree
	 */
	getContent() {
		if (this.draftIndicatorType === ObjectMarkerVisibility.IconAndText) {
			return this.getIconAndTextContent();
		} else {
			return this.getIconOnlyContent();
		}
	}
}
