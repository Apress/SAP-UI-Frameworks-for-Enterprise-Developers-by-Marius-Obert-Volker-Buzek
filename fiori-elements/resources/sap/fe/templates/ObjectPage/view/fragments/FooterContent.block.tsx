import type { EntitySet } from "@sap-ux/vocabularies-types";
import type { DataFieldForAction } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import CommandExecution from "sap/fe/core/controls/CommandExecution";
import { BaseAction } from "sap/fe/core/converters/controls/Common/Action";
import { Draft, UI } from "sap/fe/core/converters/helpers/BindingHelper";
import type { BaseManifestSettings } from "sap/fe/core/converters/ManifestSettings";
import { ActionType } from "sap/fe/core/converters/ManifestSettings";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import {
	and,
	BindingToolkitExpression,
	constant,
	ifElse,
	not,
	or,
	pathInModel,
	resolveBindingString
} from "sap/fe/core/helpers/BindingToolkit";
import { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import CustomActionBlock from "sap/fe/macros/actions/CustomAction.block";
import DataFieldForActionBlock from "sap/fe/macros/actions/DataFieldForAction.block";
import MessageButton from "sap/fe/macros/messages/MessageButton";
import Button from "sap/m/Button";
import DraftIndicator from "sap/m/DraftIndicator";
import Menu from "sap/m/Menu";
import MenuButton from "sap/m/MenuButton";
import MenuItem from "sap/m/MenuItem";
import OverflowToolbar from "sap/m/OverflowToolbar";
import OverflowToolbarLayoutData from "sap/m/OverflowToolbarLayoutData";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import InvisibleText from "sap/ui/core/InvisibleText";
import type View from "sap/ui/core/mvc/View";
import Context from "sap/ui/model/Context";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ObjectPageController from "../../ObjectPageController.controller";
import * as ObjectPageTemplating from "../../ObjectPageTemplating";

@defineBuildingBlock({ name: "FooterContent", namespace: "sap.fe.templates.ObjectPage.view.fragments" })
export default class FooterContentBlock extends RuntimeBuildingBlock {
	@blockAttribute({
		type: "string",
		required: true
	})
	id!: string;

	@blockAttribute({ type: "array", required: true })
	actions!: BaseAction[];

	@blockAttribute({ type: "sap.ui.model.Context" })
	contextPath?: Context;

	oDataMetaModel!: ODataMetaModel;
	dataViewModelPath!: DataModelObjectPath;
	isDraftValidation: boolean = false;

	constructor(props: PropertiesOf<FooterContentBlock>, ...others: any[]) {
		super(props, ...others);
		this.oDataMetaModel = this.contextPath!.getModel() as unknown as ODataMetaModel;
		this.dataViewModelPath = getInvolvedDataModelObjects(this.contextPath!);
		const startingEntitySet = this.dataViewModelPath.startingEntitySet;
		this.isDraftValidation = !!(
			ModelHelper.getDraftRoot(startingEntitySet)?.PreparationAction && startingEntitySet?.entityType.annotations.Common?.Messages
		);
	}

	private getActionModelPath(action: BaseAction) {
		const annotationPath = action.annotationPath;
		if (annotationPath) {
			const actionContext = this.oDataMetaModel.getContext(annotationPath);
			return getInvolvedDataModelObjects(actionContext);
		}
		return undefined;
	}

	/**
	 * Get the visibility of the ObjectPage footer content.
	 *
	 * @function
	 * @name getVisibility
	 * @returns The binding expression
	 */
	getVisibility() {
		const _generateBindingsForActions = (actions: BaseAction[]) => {
			if (actions.length) {
				return actions.map((action) =>
					resolveBindingString(action.visible ?? true, "boolean")
				) as BindingToolkitExpression<boolean>[];
			}
			return [constant(false)];
		};
		// Actions are coming from the converter so only determining actions and not statically hidden are listed
		const determiningActions = this.actions.filter((action) => action.type === ActionType.DataFieldForAction);
		const manifestActionBindings = _generateBindingsForActions(
			this.actions.filter((action) => ObjectPageTemplating.isManifestAction(action))
		);
		const deterMiningActionBindings = _generateBindingsForActions(determiningActions);

		const isNotHiddenDeterminingAction = !!determiningActions.find((action) => {
			const actionContextModelPath = this.getActionModelPath(action);
			return !(actionContextModelPath?.targetObject as DataFieldForAction | undefined)?.annotations?.UI?.Hidden;
		});

		return or(
			isNotHiddenDeterminingAction,
			or(...manifestActionBindings),
			and(or(UI.IsEditable, or(...deterMiningActionBindings)), not(pathInModel("isCreateDialogOpen", "internal")))
		);
	}

	getDraftIndicator() {
		const entitySet = (this.dataViewModelPath.targetEntitySet || this.dataViewModelPath.startingEntitySet) as EntitySet; // startingEntitySet is used on containment scenario
		const commonAnnotation = entitySet.annotations?.Common;
		if (commonAnnotation?.DraftRoot || commonAnnotation?.DraftNode) {
			return <DraftIndicator state="{ui>/draftStatus}" visible="{ui>/isEditable}" />;
		}
		return undefined;
	}

	private getApplyButton(view: View, emphasizedExpression: PropertyBindingInfo): Button | MenuButton {
		const controller = view.getController() as ObjectPageController;
		const viewData = view.getViewData() as BaseManifestSettings;
		if (this.isDraftValidation && !viewData.isDesktop && !viewData.fclEnabled) {
			return (
				<MenuButton
					text="{sap.fe.i18n>T_COMMON_OBJECT_PAGE_APPLY_DRAFT}"
					defaultAction={() => controller._applyDocument(view.getBindingContext())}
					useDefaultActionOnly="true"
					buttonMode="Split"
					type={emphasizedExpression}
					visible={UI.IsEditable}
				>
					<Menu>
						<MenuItem text="{sap.fe.i18n>T_COMMON_OBJECT_PAGE_VALIDATE_DRAFT}" press={() => controller._validateDocument()} />
					</Menu>
				</MenuButton>
			);
		}
		return (
			<Button
				id={this.createId("StandardAction::Apply")}
				text="{sap.fe.i18n>T_COMMON_OBJECT_PAGE_APPLY_DRAFT}"
				type={emphasizedExpression}
				enabled={true}
				press={() => controller._applyDocument(view.getBindingContext())}
				visible="{ui>/isEditable}"
			/>
		);
	}

	private getPrimary(view: View, emphasizedExpression: PropertyBindingInfo): Button | MenuButton {
		const viewData = view.getViewData() as BaseManifestSettings;
		const controller = view.getController() as ObjectPageController;
		if (this.isDraftValidation && !viewData.isDesktop) {
			return (
				<MenuButton
					text={this.getTextSaveButton()}
					defaultAction={CommandExecution.executeCommand("Save")}
					useDefaultActionOnly="true"
					buttonMode="Split"
					type={emphasizedExpression}
					visible={UI.IsEditable}
				>
					<Menu>
						<MenuItem text="{sap.fe.i18n>T_COMMON_OBJECT_PAGE_VALIDATE_DRAFT}" press={() => controller._validateDocument()} />
					</Menu>
				</MenuButton>
			);
		}
		return (
			<Button
				id={this.createId("StandardAction::Save")}
				text={this.getTextSaveButton()}
				type={emphasizedExpression}
				visible={UI.IsEditable}
				enabled={true}
				press={CommandExecution.executeCommand("Save")}
			/>
		);
	}

	private getTextSaveButton() {
		const saveButtonText = this.getTranslatedText("T_OP_OBJECT_PAGE_SAVE");
		const createButtonText = this.getTranslatedText("T_OP_OBJECT_PAGE_CREATE");
		// If we're in sticky mode  -> the ui is in create mode, show Create, else show Save
		// If not -> we're in draft AND the draft is a new object (!IsActiveEntity && !HasActiveEntity), show create, else show save
		return ifElse(
			ifElse(
				(this.dataViewModelPath.startingEntitySet as EntitySet).annotations.Session?.StickySessionSupported !== undefined,
				UI.IsCreateMode,
				Draft.IsNewObject
			),
			createButtonText,
			saveButtonText
		);
	}

	private getCancelButton(): Button {
		return (
			<Button
				id={this.createId("StandardAction::Cancel")}
				text={
					ModelHelper.isDraftRoot(this.dataViewModelPath.targetEntitySet)
						? "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISCARD_DRAFT}"
						: "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_CANCEL}"
				}
				press={CommandExecution.executeCommand("Cancel")}
				visible={UI.IsEditable}
				ariaHasPopup="Dialog"
				enabled={true}
				layoutData={<OverflowToolbarLayoutData priority="NeverOverflow" />}
			/>
		);
	}

	private getDataFieldForActionButton(action: BaseAction): Button | undefined {
		if (action.annotationPath) {
			return (
				<DataFieldForActionBlock
					id={generate([this.id, this.getActionModelPath(action)])}
					action={action}
					contextPath={this.contextPath}
				/>
			);
		}
	}

	private getManifestButton(action: BaseAction): Button | undefined {
		if (ObjectPageTemplating.isManifestAction(action)) {
			return <CustomActionBlock id={generate(["fe", "FooterBar", action.id])} action={action} />;
		}
	}

	getActionControls(view: View) {
		const emphasizedButtonExpression = ObjectPageTemplating.buildEmphasizedButtonExpression(this.dataViewModelPath);
		return this.actions
			.map((action) => {
				switch (action.type) {
					case ActionType.DefaultApply:
						return this.getApplyButton(view, emphasizedButtonExpression);
					case ActionType.DataFieldForAction:
						return this.getDataFieldForActionButton(action);
					case ActionType.Primary:
						return this.getPrimary(view, emphasizedButtonExpression);
					case ActionType.Secondary:
						return this.getCancelButton();
					default:
						return this.getManifestButton(action);
				}
			})
			.filter((action): action is Button => !!action);
	}

	getContent(view: View) {
		const controller = view.getController() as ObjectPageController;
		return (
			<OverflowToolbar id={this.id} asyncMode={true} visible={this.getVisibility()}>
				<InvisibleText
					id={this.createId("MessageButton::AriaText")}
					text="{sap.fe.i18n>C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_BUTTON_ARIA_TEXT}"
				/>
				<MessageButton
					id={this.createId("MessageButton")}
					messageChange={() => controller._getFooterVisibility()}
					ariaLabelledBy={[this.createId("MessageButton::AriaText") as string]}
					type="Emphasized"
					ariaHasPopup="Dialog"
				/>
				<ToolbarSpacer />
				{this.getDraftIndicator()}
				{this.getActionControls(view)}
			</OverflowToolbar>
		);
	}
}
