import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { defineReference } from "sap/fe/core/helpers/ClassSupport";
import type { Ref } from "sap/fe/core/jsx-runtime/jsx";
import Bar from "sap/m/Bar";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import Title from "sap/m/Title";
import Core from "sap/ui/core/Core";
import type Message from "sap/ui/core/message/Message";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type MessageHandler from "../MessageHandler";

type StrictHandlingPromise = {
	//TODO: move to somewhere else
	resolve: Function;
	groupId: string;
	requestSideEffects?: Function;
};

export type StrictHandlingUtilities = {
	//TODO: move to somewhere else
	is412Executed: boolean;
	strictHandlingTransitionFails: Object[];
	strictHandlingPromises: StrictHandlingPromise[];
	strictHandlingWarningMessages: Message[];
	delaySuccessMessages: Message[];
	processedMessageIds: string[];
};

const macroResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
/**
 * Known limitations for the first tryout as mentioned in git 5806442
 *  - functional block dependency
 * 	- questionable parameters will be refactored
 */
@defineBuildingBlock({
	name: "OperationsDialog",
	namespace: "sap.fe.core.controllerextensions"
})
export default class OperationsDialogBlock extends RuntimeBuildingBlock {
	constructor(props: PropertiesOf<OperationsDialogBlock>) {
		super(props);
	}

	/*
	 * The 'id' property of the dialog
	 */
	@blockAttribute({ type: "string", isPublic: true, required: true })
	public id!: string;

	/**
	 * The 'title' property of the Dialog;
	 */
	@blockAttribute({ type: "string" })
	public title?: string = "Dialog Standard Title";

	/**
	 * The message object that is provided to this dialog
	 */
	@blockAttribute({ type: "object", required: true }) //TODO: create the type
	public messageObject?: any = "";

	@defineReference()
	operationsDialog!: Ref<Dialog>;

	@blockAttribute({ type: "boolean", required: true })
	public isMultiContext412?: boolean;

	@blockAttribute({ type: "function" })
	public resolve?: Function;

	@blockAttribute({ type: "object", required: true })
	public model!: ODataModel;

	@blockAttribute({ type: "string", required: true })
	public groupId!: string;

	@blockAttribute({ type: "string", required: true })
	public actionName!: string;

	@blockAttribute({ type: "string", required: true })
	public cancelButtonTxt!: string;

	@blockAttribute({ type: "object", required: true })
	public strictHandlingPromises!: StrictHandlingPromise[];

	@blockAttribute({ type: "object" })
	public strictHandlingUtilities?: StrictHandlingUtilities;

	@blockAttribute({ type: "object" })
	public messageHandler?: MessageHandler;

	@blockAttribute({ type: "object", required: true })
	public messageDialogModel!: JSONModel;

	@blockAttribute({ type: "boolean" })
	public isGrouped?: boolean;

	@blockAttribute({ type: "function" })
	public showMessageInfo?: Function;

	public open() {
		this.getContent();
		this.operationsDialog.current?.open();
	}

	private getBeginButton() {
		return new Button({
			press: () => {
				if (!(this.isMultiContext412 ?? false)) {
					this.resolve?.(true);
					this.model.submitBatch(this.groupId);
				} else {
					this.strictHandlingPromises.forEach((strictHandlingPromise: StrictHandlingPromise) => {
						strictHandlingPromise.resolve(true);
						this.model.submitBatch(strictHandlingPromise.groupId);
						if (strictHandlingPromise.requestSideEffects) {
							strictHandlingPromise.requestSideEffects();
						}
					});
					const strictHandlingFails = this.strictHandlingUtilities?.strictHandlingTransitionFails;
					if (strictHandlingFails && strictHandlingFails.length > 0) {
						this.messageHandler?.removeTransitionMessages();
					}
					if (this.strictHandlingUtilities) {
						this.strictHandlingUtilities.strictHandlingWarningMessages = [];
					}
				}
				if (this.strictHandlingUtilities) {
					this.strictHandlingUtilities.is412Executed = true;
				}
				this.messageDialogModel.setData({});
				this.close();
			},
			type: "Emphasized",
			text: this.actionName
		});
	}

	private close() {
		this.operationsDialog.current?.close();
	}

	private getTitle() {
		const sTitle = macroResourceBundle.getText("M_WARNINGS");
		return new Title({ text: sTitle });
	}

	private getEndButton() {
		return new Button({
			press: () => {
				if (this.strictHandlingUtilities) {
					this.strictHandlingUtilities.strictHandlingWarningMessages = [];
					this.strictHandlingUtilities.is412Executed = false;
				}
				if (!(this.isMultiContext412 ?? false)) {
					this.resolve!(false);
				} else {
					this.strictHandlingPromises.forEach(function (strictHandlingPromise: StrictHandlingPromise) {
						strictHandlingPromise.resolve(false);
					});
				}
				this.messageDialogModel.setData({});
				this.close();
				if (this.isGrouped ?? false) {
					this.showMessageInfo!();
				}
			},
			text: this.cancelButtonTxt
		});
	}

	/**
	 * The building block render function.
	 *
	 * @returns An XML-based string with the definition of the field control
	 */
	getContent() {
		return (
			<Dialog
				id={this.id}
				ref={this.operationsDialog}
				resizable={true}
				content={this.messageObject.oMessageView}
				state={"Warning"}
				customHeader={
					new Bar({
						contentLeft: [this.messageObject.oBackButton],
						contentMiddle: [this.getTitle()]
					})
				}
				contentHeight={"50%"}
				contentWidth={"50%"}
				verticalScrolling={false}
				beginButton={this.getBeginButton()}
				endButton={this.getEndButton()}
			></Dialog>
		);
	}
}
