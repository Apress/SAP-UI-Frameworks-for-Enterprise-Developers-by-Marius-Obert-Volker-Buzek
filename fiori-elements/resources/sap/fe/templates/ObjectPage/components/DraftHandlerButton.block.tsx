import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import CommonUtils from "sap/fe/core/CommonUtils";
import { Entity, UI } from "sap/fe/core/converters/helpers/BindingHelper";
import { and, ifElse, not, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import { defineReference, PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { Ref } from "sap/fe/core/jsx-runtime/jsx";
import PageController from "sap/fe/core/PageController";
import { getSwitchDraftAndActiveVisibility } from "sap/fe/templates/ObjectPage/ObjectPageTemplating";
import Button from "sap/m/Button";
import ResponsivePopover from "sap/m/ResponsivePopover";
import SelectList from "sap/m/SelectList";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import InvisibleText from "sap/ui/core/InvisibleText";
import Item from "sap/ui/core/Item";
import View from "sap/ui/core/mvc/View";
import Context from "sap/ui/model/odata/v4/Context";

@defineBuildingBlock({ name: "DraftHandlerButton", namespace: "sap.fe.templates.ObjectPage.components" })
export default class DraftHandlerButtonBlock extends RuntimeBuildingBlock {
	private _containingView!: View;

	private popover?: ResponsivePopover;

	private readonly SWITCH_TO_DRAFT_KEY = "switchToDraft";

	private readonly SWITCH_TO_ACTIVE_KEY = "switchToActive";

	constructor(props: PropertiesOf<DraftHandlerButtonBlock>) {
		super(props);
	}

	@blockAttribute({ type: "string" })
	public id?: string;

	@blockAttribute({ type: "sap.ui.model.Context" })
	public contextPath?: Context;

	@defineReference()
	public switchToActiveRef!: Ref<Item>;

	@defineReference()
	public switchToDraftRef!: Ref<Item>;

	private initialSelectedKey: string = this.SWITCH_TO_ACTIVE_KEY;

	handleSelectedItemChange = (event: Event) => {
		const selectedItemKey = event.getParameter("item").getProperty("key");
		if (selectedItemKey !== this.initialSelectedKey) {
			(this._containingView.getController() as PageController).editFlow.toggleDraftActive(
				this._containingView.getBindingContext() as Context
			);
		}
		if (this.popover) {
			this.popover.close();
			this.popover.destroy();
			delete this.popover;
		}
	};

	openSwitchActivePopover = (event: Event) => {
		const sourceControl = event.getSource() as Control;
		const containingView = CommonUtils.getTargetView(sourceControl);

		const context: Context = containingView.getBindingContext() as Context;
		const isActiveEntity = context.getObject().IsActiveEntity;
		this.initialSelectedKey = isActiveEntity ? this.SWITCH_TO_ACTIVE_KEY : this.SWITCH_TO_DRAFT_KEY;
		this.popover = this.createPopover();

		this._containingView = containingView;
		containingView.addDependent(this.popover);
		this.popover.openBy(sourceControl);
		this.popover.attachEventOnce("afterOpen", () => {
			if (isActiveEntity) {
				this.switchToDraftRef.current?.focus();
			} else {
				this.switchToActiveRef.current?.focus();
			}
		});
		return this.popover;
	};

	createPopover(): ResponsivePopover {
		return (
			<ResponsivePopover
				showHeader={false}
				contentWidth={"15.625rem"}
				verticalScrolling={false}
				class={"sapUiNoContentPadding"}
				placement={"Bottom"}
			>
				<SelectList selectedKey={this.initialSelectedKey} itemPress={this.handleSelectedItemChange}>
					<Item
						text={"{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_DRAFT_MIT}"}
						key={this.SWITCH_TO_DRAFT_KEY}
						ref={this.switchToDraftRef}
					/>
					<Item
						text={"{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_SAVED_VERSION_MIT}"}
						key={this.SWITCH_TO_ACTIVE_KEY}
						ref={this.switchToActiveRef}
					/>
				</SelectList>
			</ResponsivePopover>
		);
	}

	getContent() {
		const textValue = ifElse(
			and(not(UI.IsEditable), not(UI.IsCreateMode), Entity.HasDraft),
			pathInModel("C_COMMON_OBJECT_PAGE_SAVED_VERSION_BUT", "sap.fe.i18n"),
			pathInModel("C_COMMON_OBJECT_PAGE_DRAFT_BUT", "sap.fe.i18n")
		);
		const visible = getSwitchDraftAndActiveVisibility(this.contextPath!.getObject("@"));
		return (
			<>
				<Button
					id="fe::StandardAction::SwitchDraftAndActiveObject"
					text={textValue}
					visible={visible}
					icon="sap-icon://navigation-down-arrow"
					iconFirst={false}
					type="Transparent"
					press={this.openSwitchActivePopover}
					ariaDescribedBy={["fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"]}
				></Button>
				<InvisibleText
					text="{sap.fe.i18n>T_HEADER_DATAPOINT_TITLE_DRAFT_SWITCHER_ARIA_BUTTON}"
					id="fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"
				/>
			</>
		);
	}
}
