import CommonUtils from "sap/fe/core/CommonUtils";
import messageHandling from "sap/fe/core/controllerextensions/messageHandler/messageHandling";
import { defineUI5Class, extensible, finalExtension, privateExtension, publicExtension } from "sap/fe/core/helpers/ClassSupport";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import type PageController from "sap/fe/core/PageController";
import Core from "sap/ui/core/Core";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";

type ObjectWithConverterType = object & {
	converterType: string;
};

/**
 * A controller extension offering message handling.
 *
 * @hideconstructor
 * @public
 * @experimental As of version 1.90.0
 * @since 1.90.0
 */
@defineUI5Class("sap.fe.core.controllerextensions.MessageHandler")
class MessageHandler extends ControllerExtension {
	protected base!: PageController;

	/**
	 * Determines whether or not bound messages are shown in the message dialog.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.Instead}.
	 *
	 * If the bound messages are shown to the user with a different control like the (TODO:Link) MessageButton
	 * this method has to be overridden.
	 *
	 * @returns Determines whether or not bound messages are shown in the message dialog.
	 * @private
	 */
	@privateExtension()
	@extensible(OverrideExecution.Instead)
	getShowBoundMessagesInMessageDialog() {
		return true;
	}

	/**
	 * Shows a message dialog with transition messages if there are any.
	 * The message dialog is shown as a modal dialog. Once the user confirms the dialog, all transition messages
	 * are removed from the message model. If there is more than one message, a list of messages is shown. The user
	 * can filter on message types and can display details as well as the long text. If there is one message,
	 * the dialog immediately shows the details of the message. If there is just one success message, a message
	 * toast is shown instead.
	 *
	 * @param mParameters PRIVATE
	 * @returns A promise that is resolved once the user closes the dialog. If there are no messages
	 * to be shown, the promise is resolved immediately
	 * @alias sap.fe.core.controllerextensions.MessageHandler#showMessageDialog
	 * @public
	 * @experimental As of version 1.90.0
	 * @since 1.90.0
	 */
	@publicExtension()
	@finalExtension()
	showMessageDialog(mParameters?: any): Promise<void> {
		const customMessages = mParameters && mParameters.customMessages ? mParameters.customMessages : undefined,
			oOPInternalBindingContext = this.base.getView().getBindingContext("internal") as InternalModelContext;
		const viewType = (this.base.getView().getViewData() as ObjectWithConverterType).converterType;
		// set isActionParameterDialog open so that it can be used in the controller extension to decide whether message dialog should open or not
		if (mParameters && mParameters.isActionParameterDialogOpen && oOPInternalBindingContext) {
			oOPInternalBindingContext.setProperty("isActionParameterDialogOpen", true);
		}
		const bShowBoundMessages = this.getShowBoundMessagesInMessageDialog();
		const oBindingContext = mParameters && mParameters.context ? mParameters.context : this.getView().getBindingContext();
		//const bEtagMessage = mParameters && mParameters.bHasEtagMessage;
		// reset  isActionParameterDialogOpen
		// cannot do this operations.js since it is not aware of the view
		if (oOPInternalBindingContext) {
			oOPInternalBindingContext.setProperty("isActionParameterDialogOpen", false);
		}
		return new Promise(function (resolve: (value: any) => void, reject: (reason?: any) => void) {
			// we have to set a timeout to be able to access the most recent messages
			setTimeout(function () {
				// TODO: great API - will be changed later
				messageHandling
					.showUnboundMessages(
						customMessages,
						oBindingContext,
						bShowBoundMessages,
						mParameters?.concurrentEditFlag,
						mParameters?.control,
						mParameters?.sActionName,
						undefined,
						mParameters?.onBeforeShowMessage,
						viewType
					)
					.then(resolve)
					.catch(reject);
			}, 0);
		});
	}

	/**
	 * You can remove the existing transition message from the message model with this method.
	 * With every user interaction that causes server communication (like clicking on an action, changing data),
	 * this method removes the existing transition messages from the message model.
	 *
	 * @param [keepBoundMessage] Checks if the bound transition messages are not to be removed
	 * @param keepUnboundMessage
	 * @param sPathToBeRemoved
	 * @alias sap.fe.core.controllerextensions.MessageHandler#removesTransitionMessages
	 * @private
	 */
	@publicExtension()
	removeTransitionMessages(keepBoundMessage?: boolean, keepUnboundMessage?: boolean, sPathToBeRemoved?: string) {
		if (!keepBoundMessage) {
			messageHandling.removeBoundTransitionMessages(sPathToBeRemoved);
		}
		if (!keepUnboundMessage) {
			messageHandling.removeUnboundTransitionMessages();
		}
	}

	/**
	 * Method that returns all the parameters needed to handle the navigation to the error page.
	 *
	 * @param mParameters
	 * @returns The parameters necessary for the navigation to the error page
	 * @alias sap.fe.core.controllerextensions.MessageHandler#_checkNavigationToErrorPage
	 * @private
	 */
	_checkNavigationToErrorPage(mParameters: any) {
		const aUnboundMessages = messageHandling.getMessages();
		const bShowBoundTransitionMessages = this.getShowBoundMessagesInMessageDialog();
		const aBoundTransitionMessages = bShowBoundTransitionMessages ? messageHandling.getMessages(true, true) : [];
		const aCustomMessages = mParameters && mParameters.customMessages ? mParameters.customMessages : [];
		const bIsStickyEditMode = CommonUtils.isStickyEditMode(this.base.getView());
		let mMessagePageParameters;

		// TODO: Stick mode check is okay as long as the controller extension is used with sap.fe.core and sap.fe.core.AppComponent.
		// It might be better to provide an extension to the consumer of the controller extension to provide this value.

		// The message page can only show 1 message today, so we navigate to it when :
		// 1. There are no bound transition messages to show,
		// 2. There are no custom messages to show, &
		// 3. There is exactly 1 unbound message in the message model with statusCode=503 and retry-After available
		// 4. retryAfter is greater than 120 seconds
		//
		// In Addition, navigating away from a sticky session will destroy the session so we do not navigate to message page for now.
		// TODO: check if navigation should be done in sticky edit mode.
		if (mParameters && mParameters.isDataReceivedError) {
			mMessagePageParameters = {
				title: mParameters.title,
				description: mParameters.description,
				navigateBackToOrigin: true,
				errorType: "PageNotFound"
			};
		} else if (
			!bIsStickyEditMode &&
			!aBoundTransitionMessages.length &&
			!aCustomMessages.length &&
			(aUnboundMessages.length === 1 || (mParameters && mParameters.isInitialLoad503Error))
		) {
			const oMessage = aUnboundMessages[0],
				oTechnicalDetails = oMessage.getTechnicalDetails();
			let sRetryAfterMessage;
			if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503) {
				if (oTechnicalDetails.retryAfter) {
					const iSecondsBeforeRetry = this._getSecondsBeforeRetryAfter(oTechnicalDetails.retryAfter);
					if (iSecondsBeforeRetry > 120) {
						// TODO: For now let's keep getRetryAfterMessage in messageHandling because it is needed also by the dialog.
						// We can plan to move this and the dialog logic both to messageHandler controller extension if required.
						sRetryAfterMessage = messageHandling.getRetryAfterMessage(oMessage);
						mMessagePageParameters = {
							description: sRetryAfterMessage ? `${sRetryAfterMessage} ${oMessage.getMessage()}` : oMessage.getMessage(),
							navigateBackToOrigin: true,
							errorType: "UnableToLoad"
						};
					}
				} else {
					sRetryAfterMessage = messageHandling.getRetryAfterMessage(oMessage);
					mMessagePageParameters = {
						description: sRetryAfterMessage ? `${sRetryAfterMessage} ${oMessage.getMessage()}` : oMessage.getMessage(),
						navigateBackToOrigin: true,
						errorType: "UnableToLoad"
					};
				}
			}
		}
		return mMessagePageParameters;
	}

	_getSecondsBeforeRetryAfter(dRetryAfter: any) {
		const dCurrentDateTime = new Date(),
			iCurrentDateTimeInMilliSeconds = dCurrentDateTime.getTime(),
			iRetryAfterDateTimeInMilliSeconds = dRetryAfter.getTime(),
			iSecondsBeforeRetry = (iRetryAfterDateTimeInMilliSeconds - iCurrentDateTimeInMilliSeconds) / 1000;
		return iSecondsBeforeRetry;
	}

	/**
	 * Shows a message page or a message dialog based on the messages in the message dialog.
	 *
	 * @param [mParameters]
	 * @returns A promise that is resolved once the user closes the message dialog or when navigation to the message page is complete. If there are no messages
	 * to be shown, the promise is resolved immediately
	 * @private
	 */
	@publicExtension()
	@finalExtension()
	async showMessages(mParameters?: any): Promise<void> {
		const oAppComponent = CommonUtils.getAppComponent(this.getView());
		let mMessagePageParameters: any;
		if (!oAppComponent._isFclEnabled()) {
			mMessagePageParameters = this._checkNavigationToErrorPage(mParameters);
		}
		if (mMessagePageParameters) {
			// navigate to message page.
			// handler before page navigation is triggered, for example to close the action parameter dialog
			if (mParameters && mParameters.messagePageNavigationCallback) {
				mParameters.messagePageNavigationCallback();
			}

			mMessagePageParameters.handleShellBack = !(mParameters && mParameters.shellBack);
			// TODO: Use Illustrated message instead of normal message page
			// TODO: Return value needs to provided but since this function is private for now hence we can skip this.
			this.removeTransitionMessages();
			const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
			if (this.base._routing) {
				return new Promise((resolve: any, reject: any) => {
					// we have to set a timeout to be able to access the most recent messages
					setTimeout(() => {
						// TODO: great API - will be changed later
						this.base._routing
							.navigateToMessagePage(
								mParameters && mParameters.isDataReceivedError
									? oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR")
									: oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE"),
								mMessagePageParameters
							)
							.then(resolve)
							.catch(reject);
					}, 0);
				});
			}
		} else {
			// navigate to message dialog
			return this.showMessageDialog(mParameters);
		}
	}
}
export default MessageHandler;
