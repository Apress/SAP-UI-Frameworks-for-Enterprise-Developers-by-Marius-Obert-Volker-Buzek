import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import { getSideContentLayoutID } from "sap/fe/core/converters/helpers/ID";
import ExtensionAPI from "sap/fe/core/ExtensionAPI";
import type { EnhanceWithUI5 } from "sap/fe/core/helpers/ClassSupport";
import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import { SideEffectsTargetType } from "sap/fe/core/services/SideEffectsServiceFactory";
import type TableAPI from "sap/fe/macros/table/TableAPI";
import InvisibleMessage from "sap/ui/core/InvisibleMessage";
import { InvisibleMessageMode, MessageType } from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import type DynamicSideContent from "sap/ui/layout/DynamicSideContent";
import type Context from "sap/ui/model/odata/v4/Context";
import ResourceModel from "sap/ui/model/resource/ResourceModel";

/**
 * Extension API for object pages on SAP Fiori elements for OData V4.
 *
 * To correctly integrate your app extension coding with SAP Fiori elements, use only the extensionAPI of SAP Fiori elements. Don't access or manipulate controls, properties, models, or other internal objects created by the SAP Fiori elements framework.
 *
 * @alias sap.fe.templates.ObjectPage.ExtensionAPI
 * @public
 * @hideconstructor
 * @final
 * @since 1.79.0
 */
@defineUI5Class("sap.fe.templates.ObjectPage.ExtensionAPI")
class ObjectPageExtensionAPI extends ExtensionAPI {
	/**
	 * Refreshes either the whole object page or only parts of it.
	 *
	 * @alias sap.fe.templates.ObjectPage.ExtensionAPI#refresh
	 * @param [vPath] Path or array of paths referring to entities or properties to be refreshed.
	 * If omitted, the whole object page is refreshed. The path "" refreshes the entity assigned to the object page
	 * without navigations
	 * @returns Resolved once the data is refreshed or rejected if the request failed
	 * @public
	 */
	refresh(vPath: string | string[] | undefined) {
		const oBindingContext = this._view.getBindingContext() as Context;
		if (!oBindingContext) {
			// nothing to be refreshed - do not block the app!
			return Promise.resolve();
		}
		const oAppComponent = CommonUtils.getAppComponent(this._view),
			oSideEffectsService = oAppComponent.getSideEffectsService(),
			oMetaModel = oBindingContext.getModel().getMetaModel(),
			oSideEffects: SideEffectsTargetType = {
				targetProperties: [],
				targetEntities: []
			};
		let aPaths, sPath, sBaseEntitySet, sKind;

		if (vPath === undefined || vPath === null) {
			// we just add an empty path which should refresh the page with all dependent bindings
			oSideEffects.targetEntities.push({
				$NavigationPropertyPath: ""
			});
		} else {
			aPaths = Array.isArray(vPath) ? vPath : [vPath];
			sBaseEntitySet = (this._controller.getOwnerComponent() as any).getEntitySet();

			for (let i = 0; i < aPaths.length; i++) {
				sPath = aPaths[i];
				if (sPath === "") {
					// an empty path shall refresh the entity without dependencies which means * for the model
					oSideEffects.targetProperties.push("*");
				} else {
					sKind = oMetaModel.getObject(`/${sBaseEntitySet}/${sPath}/$kind`);

					if (sKind === "NavigationProperty") {
						oSideEffects.targetEntities.push({
							$NavigationPropertyPath: sPath
						});
					} else if (sKind) {
						oSideEffects.targetProperties.push(sPath);
					} else {
						return Promise.reject(`${sPath} is not a valid path to be refreshed`);
					}
				}
			}
		}
		return oSideEffectsService.requestSideEffects([...oSideEffects.targetEntities, ...oSideEffects.targetProperties], oBindingContext);
	}

	/**
	 * Gets the list entries currently selected for the table.
	 *
	 * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getSelectedContexts
	 * @param sTableId The ID identifying the table the selected context is requested for
	 * @returns Array containing the selected contexts
	 * @public
	 */
	getSelectedContexts(sTableId: string) {
		let oTable = this._view.byId(sTableId);
		if (oTable && oTable.isA("sap.fe.macros.table.TableAPI")) {
			oTable = (oTable as EnhanceWithUI5<TableAPI>).getContent();
		}
		return (oTable && oTable.isA("sap.ui.mdc.Table") && (oTable as any).getSelectedContexts()) || [];
	}

	/**
	 * Displays or hides the side content of an object page.
	 *
	 * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showSideContent
	 * @param sSubSectionKey Key of the side content fragment as defined in the manifest.json
	 * @param [bShow] Optional Boolean flag to show or hide the side content
	 * @public
	 */
	showSideContent(sSubSectionKey: string, bShow: boolean | undefined) {
		const sBlockID = getSideContentLayoutID(sSubSectionKey),
			oBlock = this._view.byId(sBlockID),
			bBlockState = bShow === undefined ? !(oBlock as DynamicSideContent).getShowSideContent() : bShow;
		(oBlock as DynamicSideContent).setShowSideContent(bBlockState, false);
	}

	/**
	 * Gets the bound context of the current object page.
	 *
	 * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getBindingContext
	 * @returns Context bound to the object page
	 * @public
	 */
	getBindingContext() {
		return this._view.getBindingContext();
	}

	/**
	 * Build a message to be displayed below the anchor bar.
	 *
	 * @alias sap.fe.templates.ObjectPage.ExtensionAPI#_buildOPMessage
	 * @param {sap.ui.core.message.Message[]} messages Array of messages used to generated the message
	 * @returns {Promise<Message>} Promise containing the generated message
	 * @private
	 */
	async _buildOPMessage(messages: Message[]): Promise<Message | null> {
		const view = this._view;
		const resourceBundle = await (view.getModel("sap.fe.i18n") as ResourceModel).getResourceBundle();
		let message: Message | null = null;
		switch (messages.length) {
			case 0:
				break;
			case 1:
				message = messages[0];
				break;
			default:
				const messageStats: { [key: string]: any } = {
					Error: { id: 2, count: 0 },
					Warning: { id: 1, count: 0 },
					Information: { id: 0, count: 0 }
				};
				message = messages.reduce((acc, currentValue) => {
					const currentType = currentValue.getType();
					acc.setType(messageStats[currentType].id > messageStats[acc.getType()].id ? currentType : acc.getType());
					messageStats[currentType].count++;
					return acc;
				}, new Message({ type: MessageType.Information }));

				if (messageStats.Error.count === 0 && messageStats.Warning.count === 0 && messageStats.Information.count > 0) {
					message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_INFORMATION"));
				} else if ((messageStats.Error.count > 0 && messageStats.Warning.count > 0) || messageStats.Information.count > 0) {
					message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_ISSUE"));
				} else {
					message.setMessage(
						resourceBundle.getText(
							message.getType() === MessageType.Error ? "OBJECTPAGESTATE_ERROR" : "OBJECTPAGESTATE_WARNING"
						)
					);
				}
		}
		return message;
	}

	/**
	 * Displays the message strip between the title and the header of the ObjectPage.
	 *
	 * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showMessages
	 * @param {sap.ui.core.message.Message} messages The message to be displayed
	 * @public
	 */

	async showMessages(messages: Message[]) {
		const view = this._view;
		const internalModelContext = view.getBindingContext("internal");
		try {
			const message = await this._buildOPMessage(messages);
			if (message) {
				(internalModelContext as any)?.setProperty("OPMessageStripVisibility", true);
				(internalModelContext as any)?.setProperty("OPMessageStripText", message.getMessage());
				(internalModelContext as any)?.setProperty("OPMessageStripType", message.getType());
				InvisibleMessage.getInstance().announce(message.getMessage(), InvisibleMessageMode.Assertive);
			} else {
				this.hideMessage();
			}
		} catch (err) {
			Log.error("Cannot display ObjectPage message");
		}
	}

	/**
	 * Hides the message strip below the anchor bar.
	 *
	 * @alias sap.fe.templates.ObjectPage.ExtensionAPI#hideMessage
	 * @public
	 */
	hideMessage() {
		const view = this._view;
		const internalModelContext = view.getBindingContext("internal");
		(internalModelContext as any)?.setProperty("OPMessageStripVisibility", false);
	}
}

export default ObjectPageExtensionAPI;
