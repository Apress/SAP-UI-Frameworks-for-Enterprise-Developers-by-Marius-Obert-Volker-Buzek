import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import AppComponent from "sap/fe/core/AppComponent";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { defineReference } from "sap/fe/core/helpers/ClassSupport";
import { Ref } from "sap/fe/core/jsx-runtime/jsx";
import TableAPI from "sap/fe/macros/table/TableAPI";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import mLibrary from "sap/m/library";
import Page from "sap/m/Page";
import Panel from "sap/m/Panel";
import ManagedObject from "sap/ui/base/ManagedObject";
import Component from "sap/ui/core/Component";
import Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import { JsControlTreeModifier } from "sap/ui/core/util/reflection";

const ButtonType = mLibrary.ButtonType;

@defineBuildingBlock({
	name: "TableFullScreenDialog",
	namespace: "sap.fe.macros.table"
})
export default class TableFullScreenDialogBlock extends RuntimeBuildingBlock {
	constructor(props: PropertiesOf<TableFullScreenDialogBlock>) {
		super(props);
		this.enteringFullScreen = false;
		this.messageBundle = Core.getLibraryResourceBundle("sap.fe.macros");
	}

	@blockAttribute({ type: "string", isPublic: true, required: true })
	public id!: string;

	@defineReference()
	fullScreenButton!: Ref<Button>;

	tableAPI!: TableAPI;

	messageBundle: ResourceBundle;

	fullScreenDialog!: Dialog;

	enteringFullScreen: boolean;

	nonFullScreenTableParent!: ManagedObject;

	_originalAggregationName!: string;

	fullScreenDialogContentPage = new Page();

	tablePlaceHolderPanel!: Panel;

	/**
	 * Main handler for switching between full screen dialog and normal display.
	 *
	 * @function
	 * @name onFullScreenToggle
	 */
	public async onFullScreenToggle() {
		this.enteringFullScreen = !this.enteringFullScreen;
		this.tableAPI = this.getTableAPI();
		if (!this.tablePlaceHolderPanel) {
			this.tablePlaceHolderPanel = this.createTablePlaceHolderPanel();
		}

		if (this.enteringFullScreen) {
			// change the button icon and text
			this.fullScreenButton.current?.setIcon("sap-icon://exit-full-screen");
			this.fullScreenButton.current?.setTooltip(this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MINIMIZE"));

			// Store the current location of the table to be able to move it back later
			this.nonFullScreenTableParent = this.tableAPI.getParent()!;
			this._originalAggregationName = await JsControlTreeModifier.getParentAggregationName(this.tableAPI);

			// Replace the current position of the table with an empty Panel as a placeholder
			this.nonFullScreenTableParent.setAggregation(this._originalAggregationName, this.tablePlaceHolderPanel);

			// Create the full screen dialog
			this.createDialog();

			// Move the table over into the content page in the dialog and open the dialog
			this.fullScreenDialogContentPage.addContent(this.tableAPI);
			this.fullScreenDialog.open();
		} else {
			// change the button icon and text
			this.fullScreenButton.current?.setIcon("sap-icon://full-screen");
			this.fullScreenButton.current?.setTooltip(this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MAXIMIZE"));

			// Move the table back to the old place and close the dialog
			this.nonFullScreenTableParent.setAggregation(this._originalAggregationName, this.tableAPI);
			this.fullScreenDialog.close();
		}
	}

	/**
	 * Determine a reference to the TableAPI control starting from the button.
	 *
	 * @function
	 * @name getTableAPI
	 * @returns The TableAPI
	 */
	private getTableAPI(): TableAPI {
		let currentControl: Control = this.fullScreenButton.current as Control;
		do {
			currentControl = currentControl.getParent() as Control;
		} while (!currentControl.isA("sap.fe.macros.table.TableAPI"));
		return currentControl as TableAPI;
	}

	/**
	 * Create the panel which acts as the placeholder for the table as long as it is displayed in the
	 * full screen dialog.
	 *
	 * @function
	 * @name createTablePlaceHolderPanel
	 * @returns A Panel as placeholder for the table API
	 */
	private createTablePlaceHolderPanel(): Panel {
		const tablePlaceHolderPanel = new Panel({});
		tablePlaceHolderPanel.data("tableAPIreference", this.tableAPI);
		tablePlaceHolderPanel.data("FullScreenTablePlaceHolder", true);
		return tablePlaceHolderPanel;
	}

	/**
	 * Create the full screen dialog.
	 *
	 * @function
	 * @name createDialog
	 */
	private createDialog() {
		if (!this.fullScreenDialog) {
			this.fullScreenDialog = new Dialog({
				showHeader: false,
				stretch: true,
				afterOpen: () => {
					this.afterDialogOpen();
				},
				beforeClose: () => {
					this.beforeDialogClose();
				},
				afterClose: () => {
					this.afterDialogClose();
				},
				endButton: this.getEndButton(),
				content: this.fullScreenDialogContentPage
			});
			// The below is needed for correctly setting the focus after adding a new row in
			// the table in fullscreen mode
			this.fullScreenDialog.data("FullScreenDialog", true);
		}
	}

	/**
	 * Create the full screen dialog close button.
	 *
	 * @function
	 * @name getEndButton
	 * @returns The button control
	 */
	private getEndButton() {
		return new Button({
			text: this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_CLOSE"),
			type: ButtonType.Transparent,
			press: () => {
				// Just close the dialog here, all the needed processing is triggered
				// in beforeClose.
				// This ensures, that we only do it once event if the user presses the
				// ESC key and the Close button simultaneously
				this.fullScreenDialog.close();
			}
		});
	}

	/**
	 * Set the focus back to the full screen button after opening the dialog.
	 *
	 * @function
	 * @name afterDialogOpen
	 */
	private afterDialogOpen() {
		this.fullScreenButton.current?.focus();
	}

	/**
	 * Handle dialog close via Esc. navigation etc.
	 *
	 * @function
	 * @name beforeDialogClose
	 */
	private beforeDialogClose() {
		// In case fullscreen dialog was closed due to navigation to another page/view/app, "Esc" click, etc. The dialog close
		// would be triggered externally and we need to clean up and move the table back to the old location
		if (this.tableAPI && this.enteringFullScreen) {
			this.onFullScreenToggle();
		}
	}

	/**
	 * Some follow up after closing the dialog.
	 *
	 * @function
	 * @name afterDialogClose
	 */
	private afterDialogClose() {
		const component = Component.getOwnerComponentFor(this.tableAPI)!;
		const appComponent = Component.getOwnerComponentFor(component) as AppComponent;
		this.fullScreenButton.current?.focus();
		// trigger the automatic scroll to the latest navigated row :
		(appComponent.getRootViewController().getView().getController() as any)._scrollTablesToLastNavigatedItems();
	}

	/**
	 * The building block render function.
	 *
	 * @function
	 * @name getContent
	 * @returns An XML-based string with the definition of the full screen button
	 */
	getContent() {
		return (
			<Button
				ref={this.fullScreenButton}
				id={this.id}
				tooltip={this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MAXIMIZE")}
				icon={"sap-icon://full-screen"}
				press={() => this.onFullScreenToggle()}
				type={"Transparent"}
				visible={true}
				enabled={true}
			/>
		) as Button;
	}
}
