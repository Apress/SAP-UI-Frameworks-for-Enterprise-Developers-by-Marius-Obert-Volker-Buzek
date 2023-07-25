import { EntityType } from "@sap-ux/vocabularies-types";
import ResourceModel from "sap/fe/core/ResourceModel";
import { getTitleExpression } from "sap/fe/core/templating/EntityTypeHelper";
import Button from "sap/m/Button";
import CustomListItem from "sap/m/CustomListItem";
import Dialog from "sap/m/Dialog";
import HBox from "sap/m/HBox";
import List from "sap/m/List";
import Text from "sap/m/Text";
import VBox from "sap/m/VBox";
import Control from "sap/ui/core/Control";
import Context from "sap/ui/model/Context";

/**
 * Display a dialog to inform the user that some contexts are not applicable for the action.
 * This is not the target Ux but just keeping the current behavior
 */
export default class NotApplicableContextDialog {
	private readonly title: string;

	private readonly totalContextCount: number = 0;

	private resourceModel: ResourceModel;

	private readonly entityType: EntityType;

	private readonly _dialog: Dialog;

	private readonly _processingPromise: Promise<boolean>;

	private _fnResolve!: (resolveValue: boolean) => void;

	private _shouldContinue: boolean;

	private notApplicableContexts: Context[];

	constructor(props: { title: string; entityType: EntityType; resourceModel: ResourceModel; notApplicableContexts: Context[] }) {
		this.title = props.title;
		this.resourceModel = props.resourceModel;
		this.entityType = props.entityType;
		this.notApplicableContexts = props.notApplicableContexts;
		this._shouldContinue = false;
		this._dialog = this.createDialog();
		this._processingPromise = new Promise((resolve) => {
			this._fnResolve = resolve;
		});
	}

	onAfterClose() {
		this._fnResolve(this._shouldContinue);
		this._dialog.destroy();
	}

	onContinue() {
		this._shouldContinue = true;
		this._dialog.close();
	}

	async open(owner: Control) {
		owner.addDependent(this._dialog);
		this._dialog.open();
		return this._processingPromise;
	}

	getDialog() {
		return this._dialog;
	}

	createDialog() {
		return (
			<Dialog
				state={"Warning"}
				showHeader={true}
				contentWidth={"20rem"}
				resizable={true}
				verticalScrolling={true}
				horizontalScrolling={true}
				class={"sapUiContentPadding"}
				title={this.title}
				afterClose={this.onAfterClose.bind(this)}
			>
				{{
					beginButton: (
						<Button
							text={this.resourceModel.getText("C_ACTION_PARTIAL_FRAGMENT_SAPFE_CONTINUE_ANYWAY")}
							press={this.onContinue.bind(this)}
							type="Emphasized"
						/>
					),
					endButton: <Button text={this.resourceModel.getText("C_COMMON_SAPFE_CLOSE")} press={() => this._dialog.close()} />,
					content: (
						<>
							<VBox>
								<Text
									text={this.resourceModel.getText("C_ACTION_PARTIAL_FRAGMENT_SAPFE_BOUND_ACTION", [
										this.notApplicableContexts.length
									])}
									class="sapUiTinyMarginBegin sapUiTinyMarginTopBottom"
								/>
							</VBox>
							<List headerText={this.entityType.annotations.UI?.HeaderInfo?.TypeNamePlural} showSeparators="None">
								{{
									items: this.notApplicableContexts.map((notApplicableContext) => {
										// Either show the HeaderInfoName or the Semantic Key property
										const titleExpression = getTitleExpression(this.entityType);
										const customListItem = (
											<CustomListItem>
												<HBox justifyContent={"Start"}>
													<Text text={titleExpression} class="sapUiTinyMarginBegin sapUiTinyMarginTopBottom" />
												</HBox>
											</CustomListItem>
										);
										customListItem.setBindingContext(notApplicableContext);
										return customListItem;
									})
								}}
							</List>
						</>
					)
				}}
			</Dialog>
		) as Dialog;
	}
}
