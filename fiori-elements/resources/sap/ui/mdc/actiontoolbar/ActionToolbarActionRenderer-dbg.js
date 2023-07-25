/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([], function() {
    "use strict";

	/**
	 * @namespace
	 */
	var ActionToolbarActionRenderer = {
		apiVersion: 2
	};

    /**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.mdc.actiontoolbar.ActionToolbarAction} oActionToolbarAction an object representation of the control that should be rendered
	 */
    ActionToolbarActionRenderer.render = function(rm, oActionToolbarAction) {
        var oAction = oActionToolbarAction.getAction();
        if (oAction) {
            if (oActionToolbarAction.hasStyleClass("sapMBarChild")) {
                oAction.addStyleClass("sapMBarChild");
            }
            rm.renderControl(oAction);
        }
    };

    return ActionToolbarActionRenderer;

}, /* bExport= */ true);