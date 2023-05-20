import Log from "sap/base/Log";
import AppComponent from "sap/fe/core/AppComponent";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import CommonUtils from "sap/fe/core/CommonUtils";
import CommandExecution from "sap/fe/core/controls/CommandExecution";
import { BindingToolkitExpression, constant } from "sap/fe/core/helpers/BindingToolkit";
import { defineReference } from "sap/fe/core/helpers/ClassSupport";
import { Ref } from "sap/fe/core/jsx-runtime/jsx";
import PageController from "sap/fe/core/PageController";
import type { IShellServices } from "sap/fe/core/services/ShellServicesFactory";
import Menu from "sap/m/Menu";
import MenuButton from "sap/m/MenuButton";
import MenuItem, { $MenuItemSettings } from "sap/m/MenuItem";
import CollaborationHelper from "sap/suite/ui/commons/collaboration/CollaborationHelper";
import ServiceContainer from "sap/suite/ui/commons/collaboration/ServiceContainer";
import TeamsHelperService, { CollaborationOptions } from "sap/suite/ui/commons/collaboration/TeamsHelperService";
import UI5Event from "sap/ui/base/Event";
import ManagedObject from "sap/ui/base/ManagedObject";
import CustomData from "sap/ui/core/CustomData";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import FESRHelper from "sap/ui/performance/trace/FESRHelper";
import AddBookmarkButton from "sap/ushell/ui/footerbar/AddBookmarkButton";
import ShareAPI from "./ShareAPI";

/**
 * Building block used to create the ‘Share’ functionality.
 * <br>
 * Please note that the 'Share in SAP Jam' option is only available on platforms that are integrated with SAP Jam.
 * <br>
 * If you are consuming this macro in an environment where the SAP Fiori launchpad is not available, then the 'Save as Tile' option is not visible.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Share
 * 	id="someID"
 *	visible="true"
 * /&gt;
 * </pre>
 *
 * @hideconstructor
 * @since 1.93.0
 */
@defineBuildingBlock({
	name: "Share",
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros"
})
export default class ShareBlock extends RuntimeBuildingBlock {
	@blockAttribute({
		type: "string",
		required: true,
		isPublic: true
	})
	id!: string;

	@blockAttribute({
		type: "boolean",
		isPublic: true,
		bindable: true
	})
	visible: BindingToolkitExpression<boolean> = constant(true);

	@defineReference()
	menuButton!: Ref<MenuButton>;

	@defineReference()
	menu!: Ref<Menu>;

	@defineReference()
	saveAsTileMenuItem!: Ref<MenuItem>;

	public isInitialized?: Promise<void>;

	/**
	 * Retrieves the share option from the shell configuration asynchronously and prepare the content of the menu button.
	 * Options order are:
	 * - Send as Email
	 * - Share as Jam (if available)
	 * - Teams options (if available)
	 * - Save as tile.
	 *
	 * @param view The view this building block is used in
	 * @param appComponent The AppComponent instance
	 */
	async _initializeMenuItems(view: View, appComponent: AppComponent) {
		const isTeamsModeActive = await CollaborationHelper.isTeamsModeActive();
		if (isTeamsModeActive) {
			//need to clear the visible property bindings otherwise when the binding value changes then it will set back the visible to the resolved value
			this.menuButton.current?.unbindProperty("visible", true);
			this.menuButton.current?.setVisible(false);
			return;
		}
		const controller = view.getController() as PageController;
		const shellServices = appComponent.getShellServices();
		const isPluginInfoStable = await shellServices.waitForPluginsLoad();
		if (!isPluginInfoStable) {
			// In case the plugin info is not yet available we need to do this computation again on the next button click
			const internalButton = this.menuButton.current?.getAggregation("_control") as ManagedObject;
			internalButton?.attachEventOnce("press", {}, () => this._initializeMenuItems, this);
		}

		if (this.menu.current) {
			this.menu.current.addItem(
				<MenuItem
					text={this.getTranslatedText("T_SEMANTIC_CONTROL_SEND_EMAIL")}
					icon={"sap-icon://email"}
					press={() => controller.share._triggerEmail()}
				/>
			);
			this._addShellBasedMenuItems(controller, shellServices);
		}
	}

	async _addShellBasedMenuItems(controller: PageController, shellServices: IShellServices) {
		const hasUshell = shellServices.hasUShell();
		const hasJam = !!shellServices.getUser().isJamActive?.();

		const collaborationTeamsHelper: TeamsHelperService = await ServiceContainer.getServiceAsync();
		const shareCollaborationOptions: CollaborationOptions[] = collaborationTeamsHelper.getOptions();
		if (hasUshell) {
			if (hasJam) {
				this?.menu?.current?.addItem(
					<MenuItem
						text={this.getTranslatedText("T_COMMON_SAPFE_SHARE_JAM")}
						icon={"sap-icon://share-2"}
						press={() => controller.share._triggerShareToJam()}
					/>
				);
			}
			// prepare teams menu items
			for (const collaborationOption of shareCollaborationOptions) {
				const menuItemSettings: $MenuItemSettings = {
					text: collaborationOption.text,
					icon: collaborationOption.icon,
					items: []
				};

				if (collaborationOption?.subOptions && collaborationOption?.subOptions?.length > 0) {
					menuItemSettings.items = [];
					collaborationOption.subOptions.forEach((subOption: CollaborationOptions) => {
						const subMenuItem = new MenuItem({
							text: subOption.text,
							icon: subOption.icon,
							press: this.collaborationMenuItemPress,
							customData: new CustomData({
								key: "collaborationData",
								value: subOption
							})
						});
						if (subOption.fesrStepName) {
							FESRHelper.setSemanticStepname(subMenuItem, "press", subOption.fesrStepName);
						}
						(menuItemSettings.items as MenuItem[]).push(subMenuItem);
					});
				} else {
					// if there are no sub option then the main option should be clickable
					// so add a press handler.
					menuItemSettings.press = this.collaborationMenuItemPress;
					menuItemSettings["customData"] = new CustomData({
						key: "collaborationData",
						value: collaborationOption
					});
				}
				const menuItem = new MenuItem(menuItemSettings);
				if (menuItemSettings.press && collaborationOption.fesrStepName) {
					FESRHelper.setSemanticStepname(menuItem, "press", collaborationOption.fesrStepName);
				}
				this?.menu?.current?.addItem(menuItem);
			}
			// set save as tile
			// for now we need to create addBookmarkButton to use the save as tile feature.
			// In the future save as tile should be available as an API or a MenuItem so that it can be added to the Menu button.
			// This needs to be discussed with AddBookmarkButton team.
			const addBookmarkButton = new AddBookmarkButton();
			if (addBookmarkButton.getEnabled()) {
				this?.menu?.current?.addItem(
					<MenuItem
						ref={this.saveAsTileMenuItem}
						text={addBookmarkButton.getText()}
						icon={addBookmarkButton.getIcon()}
						press={() => controller.share._saveAsTile(this.saveAsTileMenuItem.current)}
					>
						{{ dependents: [addBookmarkButton] }}
					</MenuItem>
				);
			} else {
				addBookmarkButton.destroy();
			}
		}
	}

	async collaborationMenuItemPress(event: UI5Event) {
		const clickedMenuItem = event.getSource() as MenuItem;
		const collaborationTeamsHelper: TeamsHelperService = await ServiceContainer.getServiceAsync();
		const view: View = CommonUtils.getTargetView(clickedMenuItem);
		const controller: PageController = view.getController() as PageController;
		// call adapt share metadata so that the collaboration info model is updated with the required info
		await controller.share._adaptShareMetadata();
		const collaborationInfo = (view.getModel("collaborationInfo") as JSONModel).getData();
		collaborationTeamsHelper.share(clickedMenuItem.data("collaborationData"), collaborationInfo);
	}

	getContent(view: View, appComponent: AppComponent) {
		// Ctrl+Shift+S is needed for the time being but this needs to be removed after backlog from menu button
		const menuButton = (
			<ShareAPI id={this.id}>
				<MenuButton
					ref={this.menuButton}
					icon={"sap-icon://action"}
					visible={this.visible as any}
					tooltip={"{sap.fe.i18n>M_COMMON_SAPFE_ACTION_SHARE} (Ctrl+Shift+S)"}
				>
					<Menu ref={this.menu}></Menu>
				</MenuButton>
			</ShareAPI>
		);
		view.addDependent(
			<CommandExecution
				visible={this.visible}
				enabled={this.visible}
				command="Share"
				execute={() => this.menuButton.current?.getMenu().openBy(this.menuButton.current, true)}
			/>
		);
		// The initialization is asynchronous, so we just trigger it and hope for the best :D
		this.isInitialized = this._initializeMenuItems(view, appComponent).catch((error) => {
			Log.error(error as string);
		});
		return menuButton;
	}
}
