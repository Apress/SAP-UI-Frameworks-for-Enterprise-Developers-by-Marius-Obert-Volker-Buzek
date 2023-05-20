import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import PageController from "sap/fe/core/PageController";
import { bindText } from "sap/fe/macros/situations/SituationsText";
import Button from "sap/m/Button";
import CustomListItem from "sap/m/CustomListItem";
import HBox from "sap/m/HBox";
import Label from "sap/m/Label";
import List from "sap/m/List";
import ObjectIdentifier from "sap/m/ObjectIdentifier";
import ObjectStatus from "sap/m/ObjectStatus";
import type { $ResponsivePopoverSettings } from "sap/m/ResponsivePopover";
import ResponsivePopover from "sap/m/ResponsivePopover";
import Text from "sap/m/Text";
import Toolbar from "sap/m/Toolbar";
import VBox from "sap/m/VBox";
import type UI5Event from "sap/ui/base/Event";
import type { AggregationBindingInfo, PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import type Control from "sap/ui/core/Control";
import type Context from "sap/ui/model/odata/v4/Context";

function bindTimestamp(timestampPropertyPath: string): PropertyBindingInfo {
	return {
		path: timestampPropertyPath,
		type: "sap.ui.model.odata.type.DateTimeOffset",
		constraints: { precision: 7 },
		formatOptions: { relative: true }
	};
}

let currentSituationIndicator: Control | undefined;

function createListPopover(controller: PageController, expectedNumberOfSituations: number) {
	let listDetailsPopover: ResponsivePopover | null = null;

	const listPopover = new ResponsivePopover({
		showHeader: false,
		contentHeight: `${expectedNumberOfSituations * 4.5}em`,
		contentWidth: "25em",
		busyIndicatorDelay: 200,
		placement: "Horizontal",
		content: [
			new List({
				items: {
					path: "_Instance",
					events: {
						dataReceived: () => {
							listPopover.setContentHeight();
						}
					},
					parameters: {
						$orderby: "SitnInstceLastChgdAtDateTime desc",
						$expand: "_InstanceAttribute($expand=_InstanceAttributeValue)" // required for formatting the texts
					},
					template: new CustomListItem({
						type: "Navigation",
						press: goToDetails,
						content: [
							new HBox({
								items: [
									new ObjectStatus({
										icon: "sap-icon://alert",
										state: "Warning",
										tooltip: getResourceModel(controller).getText("situation")
									}).addStyleClass("sapUiTinyMarginEnd"),
									new ObjectIdentifier({
										title: bindText("SituationTitle"),
										text: bindTimestamp("SitnInstceLastChgdAtDateTime")
									})
								]
							})
								.addStyleClass("sapUiSmallMarginBeginEnd")
								.addStyleClass("sapUiSmallMarginTopBottom")
						]
					}),
					templateShareable: false
				} as AggregationBindingInfo,
				showNoData: false
			})
		]
	});

	function goToList() {
		if (listDetailsPopover) {
			listDetailsPopover.unbindObject();
			listDetailsPopover.close();
		}
		if (currentSituationIndicator) {
			listPopover.openBy(currentSituationIndicator);
		}
	}

	async function goToDetails(event: UI5Event) {
		const pressedItem = event.getSource() as Control;
		const context = pressedItem.getBindingContext();

		if (context && currentSituationIndicator) {
			if (listDetailsPopover === null) {
				listDetailsPopover = await createPreviewPopover(controller, goToList);
				controller.getView().addDependent(listDetailsPopover);
			}

			listDetailsPopover.bindElement({
				path: context.getPath(),
				parameters: { $expand: "_InstanceAttribute($expand=_InstanceAttributeValue)" },
				events: {
					dataReceived: () => {
						BusyLocker.unlock(listDetailsPopover);
					}
				}
			});

			listPopover.close();

			BusyLocker.lock(listDetailsPopover);
			listDetailsPopover.openBy(currentSituationIndicator);
		}
	}

	return listPopover;
}

async function createPreviewPopover(controller: PageController, back?: (event: UI5Event) => void) {
	const toolBarContent: Control[] = [];
	const resourceModel = getResourceModel(controller);

	if (back) {
		toolBarContent.push(
			new Button({
				type: "Back",
				tooltip: resourceModel.getText("back"),
				press: back
			}).addStyleClass("sapUiNoMarginEnd")
		);
	}

	toolBarContent.push(
		new ObjectStatus({
			state: "Warning",
			icon: "sap-icon://alert",
			tooltip: resourceModel.getText("situationIconTooltip")
		}).addStyleClass("sapUiSmallMarginBegin")
	);

	toolBarContent.push(
		new ObjectIdentifier({
			titleActive: false,
			title: bindText("SituationTitle")
		}).addStyleClass("sapUiSmallMarginEnd")
	);

	const popoverSettings: $ResponsivePopoverSettings = {
		contentWidth: "25em",
		contentHeight: "7em",
		placement: "Horizontal",
		customHeader: new Toolbar({ content: toolBarContent }),
		busyIndicatorDelay: 100,
		content: [
			new VBox({
				items: [
					new Label({ text: bindTimestamp("SitnInstceLastChgdAtDateTime") }),
					new Text({ text: bindText("SituationText") }).addStyleClass("sapUiTinyMarginTop")
				]
			})
		]
	};

	const shellServices = controller.getAppComponent().getShellServices();
	const navigationArguments: any = {
		target: {
			action: "displayExtended",
			semanticObject: "SituationInstance"
		}
	};
	const isNavigationSupported = await shellServices.isNavigationSupported([navigationArguments]);

	if (isNavigationSupported[0].supported) {
		popoverSettings.endButton = new Button({
			text: resourceModel.getText("showDetails"),

			press: (event: UI5Event) => {
				const situationKey = (event.getSource() as Control).getBindingContext()?.getObject(`SitnInstceKey`);

				if (situationKey !== undefined && situationKey !== null && shellServices.crossAppNavService) {
					navigationArguments.params = { SitnInstceKey: situationKey };
					shellServices.crossAppNavService.toExternal(navigationArguments);
				}
			}
		});
	}

	return new ResponsivePopover(popoverSettings).addStyleClass("sapUiPopupWithPadding").addStyleClass("sapUiResponsivePadding--header");
}

export async function showPopover(controller: PageController, event: UI5Event, situationsNavigationProperty: string) {
	currentSituationIndicator = event.getSource() as Control;

	const bindingContext = currentSituationIndicator.getBindingContext() as Context,
		numberOfSituations = bindingContext.getObject(`${situationsNavigationProperty}/SitnNumberOfInstances`);

	let popover: ResponsivePopover;
	const context = bindingContext
		.getModel()
		.bindContext(situationsNavigationProperty, bindingContext, {
			$expand: "_Instance($expand=_InstanceAttribute($expand=_InstanceAttributeValue))"
		} as any)
		.getBoundContext();

	if (numberOfSituations <= 1) {
		popover = await createPreviewPopover(controller);
		popover.setBindingContext(context);
		popover.bindElement({ path: "_Instance/0" });
	} else {
		popover = createListPopover(controller, numberOfSituations);
		popover.setBindingContext(context);
	}

	controller.getView().addDependent(popover);
	popover.openBy(currentSituationIndicator);
}

showPopover.__functionName = "rt.showPopover";
