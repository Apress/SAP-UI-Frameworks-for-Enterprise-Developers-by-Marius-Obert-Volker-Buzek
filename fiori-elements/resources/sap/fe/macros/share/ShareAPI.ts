import Log from "sap/base/Log";
import { defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import CollaborationHelper from "sap/suite/ui/commons/collaboration/CollaborationHelper";
import MacroAPI from "../MacroAPI";
/**
 * Building block used to create the ‘Share’ functionality.
 * <br>
 * Please note that the 'Share in SAP Jam' option is only available on platforms that are integrated with SAP Jam.
 * <br>
 * If you are consuming this building block in an environment where the SAP Fiori launchpad is not available, then the 'Save as Tile' option is not visible.
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
 * @alias sap.fe.macros.ShareAPI
 * @private
 * @since 1.108.0
 */
@defineUI5Class("sap.fe.macros.share.ShareAPI", {
	interfaces: ["sap.m.IOverflowToolbarContent"]
})
class ShareAPI extends MacroAPI {
	/**
	 * The identifier of the 'Share' building block
	 *
	 * @private
	 */
	@property({ type: "string" })
	id!: string;

	/**
	 * Whether the 'Share' building block is visible or not.
	 *
	 * @private
	 */
	@property({ type: "boolean", defaultValue: true })
	visible!: boolean;

	/**
	 * Returns properties for the interface IOverflowToolbarContent.
	 *
	 * @returns {object} Returns the configuration of IOverflowToolbarContent
	 */
	getOverflowToolbarConfig() {
		return {
			canOverflow: false
		};
	}

	/**
	 * Sets the visibility of the 'Share' building block based on the value.
	 * If the 'Share' building block is used in an application that's running in Microsoft Teams,
	 * this function does not have any effect,
	 * since the 'Share' building block handles the visibility on it's own in that case.
	 *
	 * @param visibility The desired visibility to be set
	 * @returns Promise which resolves with the instance of ShareAPI
	 * @private
	 */
	async setVisibility(visibility: boolean): Promise<this> {
		const isTeamsModeActive = await CollaborationHelper.isTeamsModeActive();
		// In case of teams mode share should not be visible
		// so we do not do anything
		if (!isTeamsModeActive) {
			this.content.setVisible(visibility);
			this.visible = visibility;
		} else {
			Log.info("Share Building Block: visibility not changed since application is running in teams mode!");
		}
		return Promise.resolve(this);
	}
}
export default ShareAPI;
