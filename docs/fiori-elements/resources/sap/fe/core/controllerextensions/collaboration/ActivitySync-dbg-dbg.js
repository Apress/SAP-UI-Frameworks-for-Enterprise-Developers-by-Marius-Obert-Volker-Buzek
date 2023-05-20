/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/collaboration/ActivityBase", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/converters/MetaModelConverter", "sap/m/MessageBox"], function (Log, CommonUtils, ActivityBase, CollaborationCommon, MetaModelConverter, MessageBox) {
  "use strict";

  var _exports = {};
  var CollaborationUtils = CollaborationCommon.CollaborationUtils;
  var Activity = CollaborationCommon.Activity;
  var isCollaborationConnected = ActivityBase.isCollaborationConnected;
  var initializeCollaboration = ActivityBase.initializeCollaboration;
  var endCollaboration = ActivityBase.endCollaboration;
  var broadcastCollaborationMessage = ActivityBase.broadcastCollaborationMessage;
  const MYACTIVITY = "/collaboration/myActivity";
  const ACTIVEUSERS = "/collaboration/activeUsers";
  const ACTIVITIES = "/collaboration/activities";
  const SYNCGROUPID = "$auto.sync";
  const isConnected = function (control) {
    const internalModel = control.getModel("internal");
    return isCollaborationConnected(internalModel);
  };
  _exports.isConnected = isConnected;
  const send = function (control, action, content, triggeredActionName, refreshListBinding, actionRequestedProperties) {
    if (isConnected(control)) {
      const internalModel = control.getModel("internal");
      const clientContent = Array.isArray(content) ? content.join("|") : content;
      const requestedProperties = actionRequestedProperties === null || actionRequestedProperties === void 0 ? void 0 : actionRequestedProperties.join("|");
      const myActivity = internalModel.getProperty(MYACTIVITY);
      if (action === Activity.LiveChange) {
        // To avoid unnecessary traffic we keep track of live changes and send it only once

        if (myActivity === clientContent) {
          return;
        } else {
          internalModel.setProperty(MYACTIVITY, clientContent);
        }
      } else {
        // No need to send an Undo message if there's no current activity
        if (action === Activity.Undo && myActivity === null) {
          return;
        }

        // user finished the activity
        internalModel.setProperty(MYACTIVITY, null);
      }
      broadcastCollaborationMessage(action, clientContent, internalModel, triggeredActionName, refreshListBinding, requestedProperties);
    }
  };
  _exports.send = send;
  const getWebSocketBaseURL = function (bindingContext) {
    return bindingContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");
  };
  const isCollaborationEnabled = function (view) {
    const bindingContext = (view === null || view === void 0 ? void 0 : view.getBindingContext) && view.getBindingContext();
    return !!(bindingContext && getWebSocketBaseURL(bindingContext));
  };
  _exports.isCollaborationEnabled = isCollaborationEnabled;
  const connect = async function (view) {
    const internalModel = view.getModel("internal");
    const me = CollaborationUtils.getMe(view);

    // Retrieving ME from shell service
    if (!me) {
      // no me = no shell = not sure what to do
      return;
    }
    const bindingContext = view.getBindingContext();
    const webSocketBaseURL = getWebSocketBaseURL(bindingContext);
    const serviceUrl = bindingContext.getModel().getServiceUrl();
    if (!webSocketBaseURL) {
      return;
    }
    const sDraftUUID = await bindingContext.requestProperty("DraftAdministrativeData/DraftUUID");
    if (!sDraftUUID) {
      return;
    }
    initializeCollaboration(me, webSocketBaseURL, sDraftUUID, serviceUrl, internalModel, message => {
      messageReceive(message, view);
    });
    internalModel.setProperty(MYACTIVITY, null);
  };
  _exports.connect = connect;
  const disconnect = function (control) {
    const internalModel = control.getModel("internal");
    endCollaboration(internalModel);
  };

  /**
   * Callback when a message is received from the websocket.
   *
   * @param message The message received
   * @param view The view that was used initially when connecting the websocket
   */
  _exports.disconnect = disconnect;
  function messageReceive(message, view) {
    var _activities;
    const internalModel = view.getModel("internal");
    let activeUsers = internalModel.getProperty(ACTIVEUSERS);
    let activities;
    let activityKey;
    const metaPath = calculateMetaPath(view, message.clientContent);
    message.userAction = message.userAction || message.clientAction;
    const sender = {
      id: message.userID,
      name: message.userDescription,
      initials: CollaborationUtils.formatInitials(message.userDescription),
      color: CollaborationUtils.getUserColor(message.userID, activeUsers, [])
    };
    let mactivity = sender;

    // eslint-disable-next-line default-case
    switch (message.userAction) {
      case Activity.Join:
      case Activity.JoinEcho:
        if (activeUsers.findIndex(user => user.id === sender.id) === -1) {
          activeUsers.unshift(sender);
          internalModel.setProperty(ACTIVEUSERS, activeUsers);
        }
        if (message.userAction === Activity.Join) {
          // we echo our existence to the newly entered user and also send the current activity if there is any
          broadcastCollaborationMessage(Activity.JoinEcho, internalModel.getProperty(MYACTIVITY), internalModel);
        }
        if (message.userAction === Activity.JoinEcho) {
          if (message.clientContent) {
            // another user was already typing therefore I want to see his activity immediately. Calling me again as a live change
            message.userAction = Activity.LiveChange;
            messageReceive(message, view);
          }
        }
        break;
      case Activity.Leave:
        // Removing the active user. Not removing "me" if I had the screen open in another session
        activeUsers = activeUsers.filter(user => user.id !== sender.id || user.me);
        internalModel.setProperty(ACTIVEUSERS, activeUsers);
        const allActivities = internalModel.getProperty(ACTIVITIES) || {};
        const removeUserActivities = function (bag) {
          if (Array.isArray(bag)) {
            return bag.filter(activity => activity.id !== sender.id);
          } else {
            for (const p in bag) {
              bag[p] = removeUserActivities(bag[p]);
            }
            return bag;
          }
        };
        removeUserActivities(allActivities);
        internalModel.setProperty(ACTIVITIES, allActivities);
        break;
      case Activity.Change:
        updateOnChange(view, message);
        break;
      case Activity.Create:
        // For create we actually just need to refresh the table
        updateOnCreate(view, message);
        break;
      case Activity.Delete:
        // For now also refresh the page but in case of deletion we need to inform the user
        updateOnDelete(view, message);
        break;
      case Activity.Activate:
        draftClosedByOtherUser(view, message.clientContent, CollaborationUtils.getText("C_COLLABORATIONDRAFT_ACTIVATE", sender.name));
        break;
      case Activity.Discard:
        draftClosedByOtherUser(view, message.clientContent, CollaborationUtils.getText("C_COLLABORATIONDRAFT_DISCARD", sender.name));
        break;
      case Activity.Action:
        updateOnAction(view, message);
        break;
      case Activity.LiveChange:
        mactivity = sender;
        mactivity.key = getActivityKey(message.clientContent);

        // stupid JSON model...
        let initJSONModel = "";
        const parts = metaPath.split("/");
        for (let i = 1; i < parts.length - 1; i++) {
          initJSONModel += `/${parts[i]}`;
          if (!internalModel.getProperty(ACTIVITIES + initJSONModel)) {
            internalModel.setProperty(ACTIVITIES + initJSONModel, {});
          }
        }
        activities = internalModel.getProperty(ACTIVITIES + metaPath);
        activities = (_activities = activities) !== null && _activities !== void 0 && _activities.slice ? activities.slice() : [];
        activities.push(mactivity);
        internalModel.setProperty(ACTIVITIES + metaPath, activities);
        break;
      case Activity.Undo:
        // The user did a change but reverted it, therefore unblock the control
        activities = internalModel.getProperty(ACTIVITIES + metaPath);
        activityKey = getActivityKey(message.clientContent);
        internalModel.setProperty(ACTIVITIES + metaPath, activities.filter(a => a.key !== activityKey));
        break;
    }
  }

  /**
   * Displays a message that the current draft was closed be another user, and navigates back to a proper view.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param path The path of the context to navigate to
   * @param messageText The message to display
   */
  function draftClosedByOtherUser(view, path, messageText) {
    disconnect(view);
    MessageBox.information(messageText);
    view.getBindingContext().getBinding().resetChanges().then(function () {
      navigate(path, view);
    }).catch(function () {
      Log.error("Pending Changes could not be reset - still navigating to active instance");
      navigate(path, view);
    });
  }

  /**
   * Updates data when a CHANGE message has been received.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param message The message received from the websocket
   */
  function updateOnChange(view, message) {
    const updatedObjectsPaths = message.clientContent.split("|");
    const metaModel = view.getModel().getMetaModel();
    const internalModel = view.getModel("internal");

    // Remove all locks corresponding to the paths
    updatedObjectsPaths.forEach(updatedPath => {
      var _currentActivities;
      const updatedMetaPath = metaModel.getMetaPath(updatedPath);
      const activityKey = getActivityKey(updatedPath);
      let currentActivities = internalModel.getProperty(ACTIVITIES + updatedMetaPath) || [];
      currentActivities = ((_currentActivities = currentActivities) === null || _currentActivities === void 0 ? void 0 : _currentActivities.filter) && currentActivities.filter(activity => activity.key !== activityKey);
      if (currentActivities) {
        internalModel.setProperty(ACTIVITIES + updatedMetaPath, currentActivities);
      }
    });
    const currentPage = getCurrentPage(view);
    const currentContext = currentPage.getBindingContext();
    const requestPromises = updatedObjectsPaths.map(path => applyUpdatesForChange(view, path));

    // Simulate any change so the edit flow shows the draft indicator and sets the page to dirty
    currentPage.getController().editFlow.updateDocument(currentContext, Promise.all(requestPromises));
  }

  /**
   * Updates data corresponding to a path.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param propertyPathForUpdate Absolute path to the updated property
   * @returns A promise resolved when the data and its related side effects have been received
   */
  async function applyUpdatesForChange(view, propertyPathForUpdate) {
    const metaModel = view.getModel().getMetaModel();
    const metaContext = metaModel.getMetaContext(propertyPathForUpdate);
    const dataModelObject = MetaModelConverter.getInvolvedDataModelObjects(metaContext);
    const targetContextPath = propertyPathForUpdate.substring(0, propertyPathForUpdate.lastIndexOf("/")); // Remove property name
    const targetContext = findContextForUpdate(view, targetContextPath);
    const parentCollectionPath = targetContextPath.substring(0, targetContextPath.lastIndexOf("("));
    const parentContextPath = parentCollectionPath.substring(0, parentCollectionPath.lastIndexOf("/"));
    const parentContext = parentContextPath ? findContextForUpdate(view, parentContextPath) : undefined;
    if (!targetContext && !parentContext) {
      return; // No context for update
    }

    try {
      const sideEffectsPromises = [];
      const sideEffectsService = CollaborationUtils.getAppComponent(view).getSideEffectsService();
      if (targetContext) {
        // We have a target context, so we can retrieve the updated property
        const targetMetaPath = metaModel.getMetaPath(targetContext.getPath());
        const relativeMetaPathForUpdate = metaModel.getMetaPath(propertyPathForUpdate).replace(targetMetaPath, "").slice(1);
        sideEffectsPromises.push(sideEffectsService.requestSideEffects([relativeMetaPathForUpdate], targetContext, SYNCGROUPID));
      }

      // Get the fieldGroupIds corresponding to pathForUpdate
      const fieldGroupIds = sideEffectsService.computeFieldGroupIds(dataModelObject.targetEntityType.fullyQualifiedName, dataModelObject.targetObject.fullyQualifiedName);

      // Execute the side effects for the fieldGroupIds
      if (fieldGroupIds.length) {
        const pageController = view.getController();
        const sideEffectsMapForFieldGroup = pageController._sideEffects.getSideEffectsMapForFieldGroups(fieldGroupIds, targetContext || parentContext);
        Object.keys(sideEffectsMapForFieldGroup).forEach(sideEffectName => {
          const sideEffect = sideEffectsMapForFieldGroup[sideEffectName];
          sideEffectsPromises.push(pageController._sideEffects.requestSideEffects(sideEffect.sideEffects, sideEffect.context, SYNCGROUPID));
        });
      }
      await Promise.all(sideEffectsPromises);
    } catch (err) {
      Log.error("Failed to update data after change:" + err);
      throw err;
    }
  }

  /**
   * Updates data when a DELETE message has been received.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param message The message received from the websocket
   */
  function updateOnDelete(view, message) {
    const currentPage = getCurrentPage(view);
    const currentContext = currentPage.getBindingContext();
    const currentPath = currentContext.getPath();
    const deletedObjectPaths = message.clientContent.split("|");

    // check if user currently displays a deleted object or one of its descendants
    const deletedPathInUse = deletedObjectPaths.find(deletedPath => currentPath.startsWith(deletedPath));
    if (deletedPathInUse) {
      // any other user deleted the object I'm currently looking at. Inform the user we will navigate to root now
      MessageBox.information(CollaborationUtils.getText("C_COLLABORATIONDRAFT_DELETE", message.userDescription), {
        onClose: () => {
          // We retrieve the deleted context as a keep-alive, and disable its keepalive status,
          // so that it is properly destroyed when refreshing data
          const targetContext = currentContext.getModel().getKeepAliveContext(deletedPathInUse);
          targetContext.setKeepAlive(false);
          const requestPromise = applyUpdatesForCollection(view, deletedObjectPaths[0]);
          currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), requestPromise);
          currentPage.getController()._routing.navigateBackFromContext(targetContext);
        }
      });
    } else {
      const requestPromise = applyUpdatesForCollection(view, deletedObjectPaths[0]);
      currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), requestPromise);
    }
  }

  /**
   * Updates data when a CREATE message has been received.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param message The message received from the websocket
   */
  function updateOnCreate(view, message) {
    const currentPage = getCurrentPage(view);
    const createdObjectPaths = message.clientContent.split("|");
    const requestPromise = applyUpdatesForCollection(view, createdObjectPaths[0]);
    // Simulate a change so the edit flow shows the draft indicator and sets the page to dirty
    currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), requestPromise);
  }

  /**
   * Updates data in a collection.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param pathInCollection A path to an entity in the collection
   */
  async function applyUpdatesForCollection(view, pathInCollection) {
    const appComponent = CollaborationUtils.getAppComponent(view);
    const parentPath = pathInCollection.substring(0, pathInCollection.lastIndexOf("/"));
    const parentContext = findContextForUpdate(view, parentPath);
    if (parentContext) {
      try {
        const sideEffectsPromises = [];
        const metaModel = parentContext.getModel().getMetaModel();
        const metaPathForUpdate = metaModel.getMetaPath(pathInCollection);
        const parentMetaPath = metaModel.getMetaPath(parentContext.getPath());
        const relativePath = metaPathForUpdate.replace(`${parentMetaPath}/`, "");

        // Reload the collection
        const sideEffectsService = appComponent.getSideEffectsService();
        sideEffectsPromises.push(sideEffectsService.requestSideEffects([relativePath], parentContext, SYNCGROUPID));

        // Request the side effects for the collection
        sideEffectsPromises.push(sideEffectsService.requestSideEffectsForNavigationProperty(relativePath, parentContext, SYNCGROUPID));
        await Promise.all(sideEffectsPromises);
      } catch (err) {
        Log.error("Failed to update data after collection update:" + err);
      }
    }
  }

  /**
   * Updates data when a ACTION message has been received.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param message The message received from the websocket
   */
  function updateOnAction(view, message) {
    var _message$clientReques;
    const currentPage = getCurrentPage(view);
    const pathsForAction = message.clientContent.split("|");
    const actionName = message.clientTriggeredActionName || "";
    const requestedProperties = (_message$clientReques = message.clientRequestedProperties) === null || _message$clientReques === void 0 ? void 0 : _message$clientReques.split("|");
    const refreshListBinding = message.clientRefreshListBinding === "true";
    const requestPromises = pathsForAction.map(path => requestUpdateForAction(view, path, actionName, requestedProperties));
    if (refreshListBinding) {
      requestPromises.push(applyUpdatesForCollection(view, pathsForAction[0]));
    }

    // Simulate any change so the edit flow shows the draft indicator and sets the page to dirty
    currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), Promise.all(requestPromises));
  }

  /**
   * Updates side-effects data when an action has been triggered on a context.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param pathForAction Path of the context to apply the action to
   * @param actionName Name of the action
   * @param requestedProperties
   * @returns Promise resolved when the side-effects data has been loaded
   */
  async function requestUpdateForAction(view, pathForAction, actionName, requestedProperties) {
    const targetContext = findContextForUpdate(view, pathForAction);
    if (!targetContext) {
      return;
    }
    const appComponent = CollaborationUtils.getAppComponent(view);
    const sideEffectService = appComponent.getSideEffectsService();
    const sideEffectsFromAction = sideEffectService.getODataActionSideEffects(actionName, targetContext);
    const sideEffectPromises = [];
    if (sideEffectsFromAction) {
      var _sideEffectsFromActio;
      if ((_sideEffectsFromActio = sideEffectsFromAction.pathExpressions) !== null && _sideEffectsFromActio !== void 0 && _sideEffectsFromActio.length) {
        sideEffectPromises.push(sideEffectService.requestSideEffects(sideEffectsFromAction.pathExpressions, targetContext, SYNCGROUPID));
      }
    }
    if (requestedProperties && requestedProperties.length > 0) {
      //clean-up of the properties to request list:
      const metaModel = view.getModel().getMetaModel();
      const metaPathForAction = calculateMetaPath(view, pathForAction);
      const dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(metaModel.getContext(metaPathForAction));
      const propertiesToRequest = dataModelPath.targetEntityType.entityProperties.map(property => {
        return property.name;
      }).filter(prop => requestedProperties.includes(prop));
      if (propertiesToRequest.length > 0) {
        sideEffectPromises.push(sideEffectService.requestSideEffects(propertiesToRequest, targetContext, SYNCGROUPID));
      }
    }
    await Promise.all(sideEffectPromises);
  }

  /**
   * Finds a context to apply an update message (CHANGE, CREATE, DELETE or ACTION).
   *
   * @param view  The view that was used initially when connecting the websocket
   * @param path The path of the context to be found (shall point to an entity, not a property)
   * @returns A context if it could be found
   */
  function findContextForUpdate(view, path) {
    if (!path) {
      return undefined;
    }
    // Find all potential paths
    const targetPaths = [];
    while (!path.endsWith(")")) {
      targetPaths.unshift(path);
      path = path.substring(0, path.lastIndexOf("/"));
    }
    targetPaths.unshift(path);
    const parentCollectionPath = path.substring(0, path.lastIndexOf("(")); // Remove the last key

    let targetContext;
    let currentContext = getCurrentPage(view).getBindingContext();
    while (currentContext && !targetContext) {
      var _currentContext$getBi;
      if (targetPaths.indexOf(currentContext.getPath()) >= 0) {
        targetContext = currentContext;
      }
      currentContext = (_currentContext$getBi = currentContext.getBinding()) === null || _currentContext$getBi === void 0 ? void 0 : _currentContext$getBi.getContext();
    }
    if (targetContext) {
      // Found !
      return targetContext;
    }

    // Try to find the target context in a listBinding
    const model = getCurrentPage(view).getBindingContext().getModel();
    const parentListBinding = model.getAllBindings().find(binding => {
      const bindingPath = binding.isRelative() ? binding.getResolvedPath() : binding.getPath();
      return binding.isA("sap.ui.model.odata.v4.ODataListBinding") && bindingPath === parentCollectionPath;
    });
    // We've found a list binding that could contain the target context --> look for it
    targetContext = parentListBinding === null || parentListBinding === void 0 ? void 0 : parentListBinding.getAllCurrentContexts().find(context => {
      return targetPaths.indexOf(context.getPath()) >= 0;
    });
    return targetContext;
  }
  function navigate(path, view) {
    // TODO: routing.navigate doesn't consider semantic bookmarking
    const currentPage = getCurrentPage(view);
    const targetContext = view.getModel().bindContext(path).getBoundContext();
    currentPage.getController().routing.navigate(targetContext);
  }
  function getCurrentPage(view) {
    const appComponent = CollaborationUtils.getAppComponent(view);
    return CommonUtils.getCurrentPageView(appComponent);
  }
  function getActivityKey(x) {
    return x.substring(x.lastIndexOf("(") + 1, x.lastIndexOf(")"));
  }

  /**
   * Calculates the metapath from one or more data path(s).
   *
   * @param view The current view
   * @param path One ore more data path(s), in case of multiple paths separated by '|'
   * @returns The calculated metaPath
   */
  function calculateMetaPath(view, path) {
    let metaPath = "";
    if (path) {
      // in case more than one path is sent all of them have to use the same metapath therefore we just consider the first one
      const dataPath = path.split("|")[0];
      metaPath = view.getModel().getMetaModel().getMetaPath(dataPath);
    }
    return metaPath;
  }
  return {
    connect: connect,
    disconnect: disconnect,
    isConnected: isConnected,
    isCollaborationEnabled: isCollaborationEnabled,
    send: send
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNWUFDVElWSVRZIiwiQUNUSVZFVVNFUlMiLCJBQ1RJVklUSUVTIiwiU1lOQ0dST1VQSUQiLCJpc0Nvbm5lY3RlZCIsImNvbnRyb2wiLCJpbnRlcm5hbE1vZGVsIiwiZ2V0TW9kZWwiLCJpc0NvbGxhYm9yYXRpb25Db25uZWN0ZWQiLCJzZW5kIiwiYWN0aW9uIiwiY29udGVudCIsInRyaWdnZXJlZEFjdGlvbk5hbWUiLCJyZWZyZXNoTGlzdEJpbmRpbmciLCJhY3Rpb25SZXF1ZXN0ZWRQcm9wZXJ0aWVzIiwiY2xpZW50Q29udGVudCIsIkFycmF5IiwiaXNBcnJheSIsImpvaW4iLCJyZXF1ZXN0ZWRQcm9wZXJ0aWVzIiwibXlBY3Rpdml0eSIsImdldFByb3BlcnR5IiwiQWN0aXZpdHkiLCJMaXZlQ2hhbmdlIiwic2V0UHJvcGVydHkiLCJVbmRvIiwiYnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UiLCJnZXRXZWJTb2NrZXRCYXNlVVJMIiwiYmluZGluZ0NvbnRleHQiLCJnZXRNZXRhTW9kZWwiLCJnZXRPYmplY3QiLCJpc0NvbGxhYm9yYXRpb25FbmFibGVkIiwidmlldyIsImdldEJpbmRpbmdDb250ZXh0IiwiY29ubmVjdCIsIm1lIiwiQ29sbGFib3JhdGlvblV0aWxzIiwiZ2V0TWUiLCJ3ZWJTb2NrZXRCYXNlVVJMIiwic2VydmljZVVybCIsImdldFNlcnZpY2VVcmwiLCJzRHJhZnRVVUlEIiwicmVxdWVzdFByb3BlcnR5IiwiaW5pdGlhbGl6ZUNvbGxhYm9yYXRpb24iLCJtZXNzYWdlIiwibWVzc2FnZVJlY2VpdmUiLCJkaXNjb25uZWN0IiwiZW5kQ29sbGFib3JhdGlvbiIsImFjdGl2ZVVzZXJzIiwiYWN0aXZpdGllcyIsImFjdGl2aXR5S2V5IiwibWV0YVBhdGgiLCJjYWxjdWxhdGVNZXRhUGF0aCIsInVzZXJBY3Rpb24iLCJjbGllbnRBY3Rpb24iLCJzZW5kZXIiLCJpZCIsInVzZXJJRCIsIm5hbWUiLCJ1c2VyRGVzY3JpcHRpb24iLCJpbml0aWFscyIsImZvcm1hdEluaXRpYWxzIiwiY29sb3IiLCJnZXRVc2VyQ29sb3IiLCJtYWN0aXZpdHkiLCJKb2luIiwiSm9pbkVjaG8iLCJmaW5kSW5kZXgiLCJ1c2VyIiwidW5zaGlmdCIsIkxlYXZlIiwiZmlsdGVyIiwiYWxsQWN0aXZpdGllcyIsInJlbW92ZVVzZXJBY3Rpdml0aWVzIiwiYmFnIiwiYWN0aXZpdHkiLCJwIiwiQ2hhbmdlIiwidXBkYXRlT25DaGFuZ2UiLCJDcmVhdGUiLCJ1cGRhdGVPbkNyZWF0ZSIsIkRlbGV0ZSIsInVwZGF0ZU9uRGVsZXRlIiwiQWN0aXZhdGUiLCJkcmFmdENsb3NlZEJ5T3RoZXJVc2VyIiwiZ2V0VGV4dCIsIkRpc2NhcmQiLCJBY3Rpb24iLCJ1cGRhdGVPbkFjdGlvbiIsImtleSIsImdldEFjdGl2aXR5S2V5IiwiaW5pdEpTT05Nb2RlbCIsInBhcnRzIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwic2xpY2UiLCJwdXNoIiwiYSIsInBhdGgiLCJtZXNzYWdlVGV4dCIsIk1lc3NhZ2VCb3giLCJpbmZvcm1hdGlvbiIsImdldEJpbmRpbmciLCJyZXNldENoYW5nZXMiLCJ0aGVuIiwibmF2aWdhdGUiLCJjYXRjaCIsIkxvZyIsImVycm9yIiwidXBkYXRlZE9iamVjdHNQYXRocyIsIm1ldGFNb2RlbCIsImZvckVhY2giLCJ1cGRhdGVkUGF0aCIsInVwZGF0ZWRNZXRhUGF0aCIsImdldE1ldGFQYXRoIiwiY3VycmVudEFjdGl2aXRpZXMiLCJjdXJyZW50UGFnZSIsImdldEN1cnJlbnRQYWdlIiwiY3VycmVudENvbnRleHQiLCJyZXF1ZXN0UHJvbWlzZXMiLCJtYXAiLCJhcHBseVVwZGF0ZXNGb3JDaGFuZ2UiLCJnZXRDb250cm9sbGVyIiwiZWRpdEZsb3ciLCJ1cGRhdGVEb2N1bWVudCIsIlByb21pc2UiLCJhbGwiLCJwcm9wZXJ0eVBhdGhGb3JVcGRhdGUiLCJtZXRhQ29udGV4dCIsImdldE1ldGFDb250ZXh0IiwiZGF0YU1vZGVsT2JqZWN0IiwiTWV0YU1vZGVsQ29udmVydGVyIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwidGFyZ2V0Q29udGV4dFBhdGgiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsInRhcmdldENvbnRleHQiLCJmaW5kQ29udGV4dEZvclVwZGF0ZSIsInBhcmVudENvbGxlY3Rpb25QYXRoIiwicGFyZW50Q29udGV4dFBhdGgiLCJwYXJlbnRDb250ZXh0IiwidW5kZWZpbmVkIiwic2lkZUVmZmVjdHNQcm9taXNlcyIsInNpZGVFZmZlY3RzU2VydmljZSIsImdldEFwcENvbXBvbmVudCIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsInRhcmdldE1ldGFQYXRoIiwiZ2V0UGF0aCIsInJlbGF0aXZlTWV0YVBhdGhGb3JVcGRhdGUiLCJyZXBsYWNlIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwiZmllbGRHcm91cElkcyIsImNvbXB1dGVGaWVsZEdyb3VwSWRzIiwidGFyZ2V0RW50aXR5VHlwZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInRhcmdldE9iamVjdCIsInBhZ2VDb250cm9sbGVyIiwic2lkZUVmZmVjdHNNYXBGb3JGaWVsZEdyb3VwIiwiX3NpZGVFZmZlY3RzIiwiZ2V0U2lkZUVmZmVjdHNNYXBGb3JGaWVsZEdyb3VwcyIsIk9iamVjdCIsImtleXMiLCJzaWRlRWZmZWN0TmFtZSIsInNpZGVFZmZlY3QiLCJzaWRlRWZmZWN0cyIsImNvbnRleHQiLCJlcnIiLCJjdXJyZW50UGF0aCIsImRlbGV0ZWRPYmplY3RQYXRocyIsImRlbGV0ZWRQYXRoSW5Vc2UiLCJmaW5kIiwiZGVsZXRlZFBhdGgiLCJzdGFydHNXaXRoIiwib25DbG9zZSIsImdldEtlZXBBbGl2ZUNvbnRleHQiLCJzZXRLZWVwQWxpdmUiLCJyZXF1ZXN0UHJvbWlzZSIsImFwcGx5VXBkYXRlc0ZvckNvbGxlY3Rpb24iLCJfcm91dGluZyIsIm5hdmlnYXRlQmFja0Zyb21Db250ZXh0IiwiY3JlYXRlZE9iamVjdFBhdGhzIiwicGF0aEluQ29sbGVjdGlvbiIsImFwcENvbXBvbmVudCIsInBhcmVudFBhdGgiLCJtZXRhUGF0aEZvclVwZGF0ZSIsInBhcmVudE1ldGFQYXRoIiwicmVsYXRpdmVQYXRoIiwicmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5IiwicGF0aHNGb3JBY3Rpb24iLCJhY3Rpb25OYW1lIiwiY2xpZW50VHJpZ2dlcmVkQWN0aW9uTmFtZSIsImNsaWVudFJlcXVlc3RlZFByb3BlcnRpZXMiLCJjbGllbnRSZWZyZXNoTGlzdEJpbmRpbmciLCJyZXF1ZXN0VXBkYXRlRm9yQWN0aW9uIiwicGF0aEZvckFjdGlvbiIsInNpZGVFZmZlY3RTZXJ2aWNlIiwic2lkZUVmZmVjdHNGcm9tQWN0aW9uIiwiZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyIsInNpZGVFZmZlY3RQcm9taXNlcyIsInBhdGhFeHByZXNzaW9ucyIsIm1ldGFQYXRoRm9yQWN0aW9uIiwiZGF0YU1vZGVsUGF0aCIsImdldENvbnRleHQiLCJwcm9wZXJ0aWVzVG9SZXF1ZXN0IiwiZW50aXR5UHJvcGVydGllcyIsInByb3BlcnR5IiwicHJvcCIsImluY2x1ZGVzIiwidGFyZ2V0UGF0aHMiLCJlbmRzV2l0aCIsImluZGV4T2YiLCJtb2RlbCIsInBhcmVudExpc3RCaW5kaW5nIiwiZ2V0QWxsQmluZGluZ3MiLCJiaW5kaW5nIiwiYmluZGluZ1BhdGgiLCJpc1JlbGF0aXZlIiwiZ2V0UmVzb2x2ZWRQYXRoIiwiaXNBIiwiZ2V0QWxsQ3VycmVudENvbnRleHRzIiwiYmluZENvbnRleHQiLCJnZXRCb3VuZENvbnRleHQiLCJyb3V0aW5nIiwiQ29tbW9uVXRpbHMiLCJnZXRDdXJyZW50UGFnZVZpZXciLCJ4IiwiZGF0YVBhdGgiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFjdGl2aXR5U3luYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQge1xuXHRicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZSxcblx0ZW5kQ29sbGFib3JhdGlvbixcblx0aW5pdGlhbGl6ZUNvbGxhYm9yYXRpb24sXG5cdGlzQ29sbGFib3JhdGlvbkNvbm5lY3RlZFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9BY3Rpdml0eUJhc2VcIjtcbmltcG9ydCB0eXBlIHsgTWVzc2FnZSwgVXNlciwgVXNlckFjdGl2aXR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQ29sbGFib3JhdGlvbkNvbW1vblwiO1xuaW1wb3J0IHsgQWN0aXZpdHksIENvbGxhYm9yYXRpb25VdGlscyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25Db21tb25cIjtcbmltcG9ydCB7IEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2lkZUVmZmVjdHNcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcblxuY29uc3QgTVlBQ1RJVklUWSA9IFwiL2NvbGxhYm9yYXRpb24vbXlBY3Rpdml0eVwiO1xuY29uc3QgQUNUSVZFVVNFUlMgPSBcIi9jb2xsYWJvcmF0aW9uL2FjdGl2ZVVzZXJzXCI7XG5jb25zdCBBQ1RJVklUSUVTID0gXCIvY29sbGFib3JhdGlvbi9hY3Rpdml0aWVzXCI7XG5jb25zdCBTWU5DR1JPVVBJRCA9IFwiJGF1dG8uc3luY1wiO1xuXG5leHBvcnQgY29uc3QgaXNDb25uZWN0ZWQgPSBmdW5jdGlvbiAoY29udHJvbDogQ29udHJvbCk6IGJvb2xlYW4ge1xuXHRjb25zdCBpbnRlcm5hbE1vZGVsID0gY29udHJvbC5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0cmV0dXJuIGlzQ29sbGFib3JhdGlvbkNvbm5lY3RlZChpbnRlcm5hbE1vZGVsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZW5kID0gZnVuY3Rpb24gKFxuXHRjb250cm9sOiBDb250cm9sLFxuXHRhY3Rpb246IEFjdGl2aXR5LFxuXHRjb250ZW50OiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcblx0dHJpZ2dlcmVkQWN0aW9uTmFtZT86IHN0cmluZyxcblx0cmVmcmVzaExpc3RCaW5kaW5nPzogYm9vbGVhbixcblx0YWN0aW9uUmVxdWVzdGVkUHJvcGVydGllcz86IHN0cmluZ1tdXG4pIHtcblx0aWYgKGlzQ29ubmVjdGVkKGNvbnRyb2wpKSB7XG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IGNvbnRyb2wuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0Y29uc3QgY2xpZW50Q29udGVudCA9IEFycmF5LmlzQXJyYXkoY29udGVudCkgPyBjb250ZW50LmpvaW4oXCJ8XCIpIDogY29udGVudDtcblx0XHRjb25zdCByZXF1ZXN0ZWRQcm9wZXJ0aWVzID0gYWN0aW9uUmVxdWVzdGVkUHJvcGVydGllcz8uam9pbihcInxcIik7XG5cdFx0Y29uc3QgbXlBY3Rpdml0eSA9IGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoTVlBQ1RJVklUWSk7XG5cdFx0aWYgKGFjdGlvbiA9PT0gQWN0aXZpdHkuTGl2ZUNoYW5nZSkge1xuXHRcdFx0Ly8gVG8gYXZvaWQgdW5uZWNlc3NhcnkgdHJhZmZpYyB3ZSBrZWVwIHRyYWNrIG9mIGxpdmUgY2hhbmdlcyBhbmQgc2VuZCBpdCBvbmx5IG9uY2VcblxuXHRcdFx0aWYgKG15QWN0aXZpdHkgPT09IGNsaWVudENvbnRlbnQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShNWUFDVElWSVRZLCBjbGllbnRDb250ZW50KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTm8gbmVlZCB0byBzZW5kIGFuIFVuZG8gbWVzc2FnZSBpZiB0aGVyZSdzIG5vIGN1cnJlbnQgYWN0aXZpdHlcblx0XHRcdGlmIChhY3Rpb24gPT09IEFjdGl2aXR5LlVuZG8gJiYgbXlBY3Rpdml0eSA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIHVzZXIgZmluaXNoZWQgdGhlIGFjdGl2aXR5XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KE1ZQUNUSVZJVFksIG51bGwpO1xuXHRcdH1cblxuXHRcdGJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlKGFjdGlvbiwgY2xpZW50Q29udGVudCwgaW50ZXJuYWxNb2RlbCwgdHJpZ2dlcmVkQWN0aW9uTmFtZSwgcmVmcmVzaExpc3RCaW5kaW5nLCByZXF1ZXN0ZWRQcm9wZXJ0aWVzKTtcblx0fVxufTtcblxuY29uc3QgZ2V0V2ViU29ja2V0QmFzZVVSTCA9IGZ1bmN0aW9uIChiaW5kaW5nQ29udGV4dDogQ29udGV4dCk6IHN0cmluZyB7XG5cdHJldHVybiBiaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLldlYlNvY2tldEJhc2VVUkxcIik7XG59O1xuXG5leHBvcnQgY29uc3QgaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IGZ1bmN0aW9uICh2aWV3OiBWaWV3KTogYm9vbGVhbiB7XG5cdGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gdmlldz8uZ2V0QmluZGluZ0NvbnRleHQgJiYgKHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KTtcblx0cmV0dXJuICEhKGJpbmRpbmdDb250ZXh0ICYmIGdldFdlYlNvY2tldEJhc2VVUkwoYmluZGluZ0NvbnRleHQpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjb25uZWN0ID0gYXN5bmMgZnVuY3Rpb24gKHZpZXc6IFZpZXcpIHtcblx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdGNvbnN0IG1lID0gQ29sbGFib3JhdGlvblV0aWxzLmdldE1lKHZpZXcpO1xuXG5cdC8vIFJldHJpZXZpbmcgTUUgZnJvbSBzaGVsbCBzZXJ2aWNlXG5cdGlmICghbWUpIHtcblx0XHQvLyBubyBtZSA9IG5vIHNoZWxsID0gbm90IHN1cmUgd2hhdCB0byBkb1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdGNvbnN0IHdlYlNvY2tldEJhc2VVUkwgPSBnZXRXZWJTb2NrZXRCYXNlVVJMKGJpbmRpbmdDb250ZXh0KTtcblx0Y29uc3Qgc2VydmljZVVybCA9IGJpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0U2VydmljZVVybCgpO1xuXG5cdGlmICghd2ViU29ja2V0QmFzZVVSTCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHNEcmFmdFVVSUQgPSBhd2FpdCBiaW5kaW5nQ29udGV4dC5yZXF1ZXN0UHJvcGVydHkoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9EcmFmdFVVSURcIik7XG5cdGlmICghc0RyYWZ0VVVJRCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGluaXRpYWxpemVDb2xsYWJvcmF0aW9uKG1lLCB3ZWJTb2NrZXRCYXNlVVJMLCBzRHJhZnRVVUlELCBzZXJ2aWNlVXJsLCBpbnRlcm5hbE1vZGVsLCAobWVzc2FnZTogTWVzc2FnZSkgPT4ge1xuXHRcdG1lc3NhZ2VSZWNlaXZlKG1lc3NhZ2UsIHZpZXcpO1xuXHR9KTtcblx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShNWUFDVElWSVRZLCBudWxsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNjb25uZWN0ID0gZnVuY3Rpb24gKGNvbnRyb2w6IENvbnRyb2wpIHtcblx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IGNvbnRyb2wuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdGVuZENvbGxhYm9yYXRpb24oaW50ZXJuYWxNb2RlbCk7XG59O1xuXG4vKipcbiAqIENhbGxiYWNrIHdoZW4gYSBtZXNzYWdlIGlzIHJlY2VpdmVkIGZyb20gdGhlIHdlYnNvY2tldC5cbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSByZWNlaXZlZFxuICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgdGhhdCB3YXMgdXNlZCBpbml0aWFsbHkgd2hlbiBjb25uZWN0aW5nIHRoZSB3ZWJzb2NrZXRcbiAqL1xuZnVuY3Rpb24gbWVzc2FnZVJlY2VpdmUobWVzc2FnZTogTWVzc2FnZSwgdmlldzogVmlldykge1xuXHRjb25zdCBpbnRlcm5hbE1vZGVsOiBhbnkgPSB2aWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIik7XG5cdGxldCBhY3RpdmVVc2VyczogVXNlcltdID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVkVVU0VSUyk7XG5cdGxldCBhY3Rpdml0aWVzOiBVc2VyQWN0aXZpdHlbXTtcblx0bGV0IGFjdGl2aXR5S2V5OiBzdHJpbmc7XG5cdGNvbnN0IG1ldGFQYXRoID0gY2FsY3VsYXRlTWV0YVBhdGgodmlldywgbWVzc2FnZS5jbGllbnRDb250ZW50KTtcblx0bWVzc2FnZS51c2VyQWN0aW9uID0gbWVzc2FnZS51c2VyQWN0aW9uIHx8IG1lc3NhZ2UuY2xpZW50QWN0aW9uO1xuXG5cdGNvbnN0IHNlbmRlcjogVXNlciA9IHtcblx0XHRpZDogbWVzc2FnZS51c2VySUQsXG5cdFx0bmFtZTogbWVzc2FnZS51c2VyRGVzY3JpcHRpb24sXG5cdFx0aW5pdGlhbHM6IENvbGxhYm9yYXRpb25VdGlscy5mb3JtYXRJbml0aWFscyhtZXNzYWdlLnVzZXJEZXNjcmlwdGlvbiksXG5cdFx0Y29sb3I6IENvbGxhYm9yYXRpb25VdGlscy5nZXRVc2VyQ29sb3IobWVzc2FnZS51c2VySUQsIGFjdGl2ZVVzZXJzLCBbXSlcblx0fTtcblxuXHRsZXQgbWFjdGl2aXR5OiBVc2VyQWN0aXZpdHkgPSBzZW5kZXI7XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGRlZmF1bHQtY2FzZVxuXHRzd2l0Y2ggKG1lc3NhZ2UudXNlckFjdGlvbikge1xuXHRcdGNhc2UgQWN0aXZpdHkuSm9pbjpcblx0XHRjYXNlIEFjdGl2aXR5LkpvaW5FY2hvOlxuXHRcdFx0aWYgKGFjdGl2ZVVzZXJzLmZpbmRJbmRleCgodXNlcikgPT4gdXNlci5pZCA9PT0gc2VuZGVyLmlkKSA9PT0gLTEpIHtcblx0XHRcdFx0YWN0aXZlVXNlcnMudW5zaGlmdChzZW5kZXIpO1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KEFDVElWRVVTRVJTLCBhY3RpdmVVc2Vycyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtZXNzYWdlLnVzZXJBY3Rpb24gPT09IEFjdGl2aXR5LkpvaW4pIHtcblx0XHRcdFx0Ly8gd2UgZWNobyBvdXIgZXhpc3RlbmNlIHRvIHRoZSBuZXdseSBlbnRlcmVkIHVzZXIgYW5kIGFsc28gc2VuZCB0aGUgY3VycmVudCBhY3Rpdml0eSBpZiB0aGVyZSBpcyBhbnlcblx0XHRcdFx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UoQWN0aXZpdHkuSm9pbkVjaG8sIGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoTVlBQ1RJVklUWSksIGludGVybmFsTW9kZWwpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobWVzc2FnZS51c2VyQWN0aW9uID09PSBBY3Rpdml0eS5Kb2luRWNobykge1xuXHRcdFx0XHRpZiAobWVzc2FnZS5jbGllbnRDb250ZW50KSB7XG5cdFx0XHRcdFx0Ly8gYW5vdGhlciB1c2VyIHdhcyBhbHJlYWR5IHR5cGluZyB0aGVyZWZvcmUgSSB3YW50IHRvIHNlZSBoaXMgYWN0aXZpdHkgaW1tZWRpYXRlbHkuIENhbGxpbmcgbWUgYWdhaW4gYXMgYSBsaXZlIGNoYW5nZVxuXHRcdFx0XHRcdG1lc3NhZ2UudXNlckFjdGlvbiA9IEFjdGl2aXR5LkxpdmVDaGFuZ2U7XG5cdFx0XHRcdFx0bWVzc2FnZVJlY2VpdmUobWVzc2FnZSwgdmlldyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIEFjdGl2aXR5LkxlYXZlOlxuXHRcdFx0Ly8gUmVtb3ZpbmcgdGhlIGFjdGl2ZSB1c2VyLiBOb3QgcmVtb3ZpbmcgXCJtZVwiIGlmIEkgaGFkIHRoZSBzY3JlZW4gb3BlbiBpbiBhbm90aGVyIHNlc3Npb25cblx0XHRcdGFjdGl2ZVVzZXJzID0gYWN0aXZlVXNlcnMuZmlsdGVyKCh1c2VyKSA9PiB1c2VyLmlkICE9PSBzZW5kZXIuaWQgfHwgdXNlci5tZSk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KEFDVElWRVVTRVJTLCBhY3RpdmVVc2Vycyk7XG5cdFx0XHRjb25zdCBhbGxBY3Rpdml0aWVzID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVklUSUVTKSB8fCB7fTtcblx0XHRcdGNvbnN0IHJlbW92ZVVzZXJBY3Rpdml0aWVzID0gZnVuY3Rpb24gKGJhZzogYW55KSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGJhZykpIHtcblx0XHRcdFx0XHRyZXR1cm4gYmFnLmZpbHRlcigoYWN0aXZpdHkpID0+IGFjdGl2aXR5LmlkICE9PSBzZW5kZXIuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgcCBpbiBiYWcpIHtcblx0XHRcdFx0XHRcdGJhZ1twXSA9IHJlbW92ZVVzZXJBY3Rpdml0aWVzKGJhZ1twXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBiYWc7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRyZW1vdmVVc2VyQWN0aXZpdGllcyhhbGxBY3Rpdml0aWVzKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUywgYWxsQWN0aXZpdGllcyk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgQWN0aXZpdHkuQ2hhbmdlOlxuXHRcdFx0dXBkYXRlT25DaGFuZ2UodmlldywgbWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgQWN0aXZpdHkuQ3JlYXRlOlxuXHRcdFx0Ly8gRm9yIGNyZWF0ZSB3ZSBhY3R1YWxseSBqdXN0IG5lZWQgdG8gcmVmcmVzaCB0aGUgdGFibGVcblx0XHRcdHVwZGF0ZU9uQ3JlYXRlKHZpZXcsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIEFjdGl2aXR5LkRlbGV0ZTpcblx0XHRcdC8vIEZvciBub3cgYWxzbyByZWZyZXNoIHRoZSBwYWdlIGJ1dCBpbiBjYXNlIG9mIGRlbGV0aW9uIHdlIG5lZWQgdG8gaW5mb3JtIHRoZSB1c2VyXG5cdFx0XHR1cGRhdGVPbkRlbGV0ZSh2aWV3LCBtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBBY3Rpdml0eS5BY3RpdmF0ZTpcblx0XHRcdGRyYWZ0Q2xvc2VkQnlPdGhlclVzZXIodmlldywgbWVzc2FnZS5jbGllbnRDb250ZW50LCBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0VGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0FDVElWQVRFXCIsIHNlbmRlci5uYW1lKSk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgQWN0aXZpdHkuRGlzY2FyZDpcblx0XHRcdGRyYWZ0Q2xvc2VkQnlPdGhlclVzZXIodmlldywgbWVzc2FnZS5jbGllbnRDb250ZW50LCBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0VGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0RJU0NBUkRcIiwgc2VuZGVyLm5hbWUpKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBBY3Rpdml0eS5BY3Rpb246XG5cdFx0XHR1cGRhdGVPbkFjdGlvbih2aWV3LCBtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBBY3Rpdml0eS5MaXZlQ2hhbmdlOlxuXHRcdFx0bWFjdGl2aXR5ID0gc2VuZGVyO1xuXHRcdFx0bWFjdGl2aXR5LmtleSA9IGdldEFjdGl2aXR5S2V5KG1lc3NhZ2UuY2xpZW50Q29udGVudCk7XG5cblx0XHRcdC8vIHN0dXBpZCBKU09OIG1vZGVsLi4uXG5cdFx0XHRsZXQgaW5pdEpTT05Nb2RlbDogc3RyaW5nID0gXCJcIjtcblx0XHRcdGNvbnN0IHBhcnRzID0gbWV0YVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0aW5pdEpTT05Nb2RlbCArPSBgLyR7cGFydHNbaV19YDtcblx0XHRcdFx0aWYgKCFpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KEFDVElWSVRJRVMgKyBpbml0SlNPTk1vZGVsKSkge1xuXHRcdFx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUyArIGluaXRKU09OTW9kZWwsIHt9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRhY3Rpdml0aWVzID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVklUSUVTICsgbWV0YVBhdGgpO1xuXHRcdFx0YWN0aXZpdGllcyA9IGFjdGl2aXRpZXM/LnNsaWNlID8gYWN0aXZpdGllcy5zbGljZSgpIDogW107XG5cdFx0XHRhY3Rpdml0aWVzLnB1c2gobWFjdGl2aXR5KTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUyArIG1ldGFQYXRoLCBhY3Rpdml0aWVzKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBBY3Rpdml0eS5VbmRvOlxuXHRcdFx0Ly8gVGhlIHVzZXIgZGlkIGEgY2hhbmdlIGJ1dCByZXZlcnRlZCBpdCwgdGhlcmVmb3JlIHVuYmxvY2sgdGhlIGNvbnRyb2xcblx0XHRcdGFjdGl2aXRpZXMgPSBpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KEFDVElWSVRJRVMgKyBtZXRhUGF0aCk7XG5cdFx0XHRhY3Rpdml0eUtleSA9IGdldEFjdGl2aXR5S2V5KG1lc3NhZ2UuY2xpZW50Q29udGVudCk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFxuXHRcdFx0XHRBQ1RJVklUSUVTICsgbWV0YVBhdGgsXG5cdFx0XHRcdGFjdGl2aXRpZXMuZmlsdGVyKChhKSA9PiBhLmtleSAhPT0gYWN0aXZpdHlLZXkpXG5cdFx0XHQpO1xuXHRcdFx0YnJlYWs7XG5cdH1cbn1cblxuLyoqXG4gKiBEaXNwbGF5cyBhIG1lc3NhZ2UgdGhhdCB0aGUgY3VycmVudCBkcmFmdCB3YXMgY2xvc2VkIGJlIGFub3RoZXIgdXNlciwgYW5kIG5hdmlnYXRlcyBiYWNrIHRvIGEgcHJvcGVyIHZpZXcuXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgdGhhdCB3YXMgdXNlZCBpbml0aWFsbHkgd2hlbiBjb25uZWN0aW5nIHRoZSB3ZWJzb2NrZXRcbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBjb250ZXh0IHRvIG5hdmlnYXRlIHRvXG4gKiBAcGFyYW0gbWVzc2FnZVRleHQgVGhlIG1lc3NhZ2UgdG8gZGlzcGxheVxuICovXG5mdW5jdGlvbiBkcmFmdENsb3NlZEJ5T3RoZXJVc2VyKHZpZXc6IFZpZXcsIHBhdGg6IHN0cmluZywgbWVzc2FnZVRleHQ6IHN0cmluZykge1xuXHRkaXNjb25uZWN0KHZpZXcpO1xuXHRNZXNzYWdlQm94LmluZm9ybWF0aW9uKG1lc3NhZ2VUZXh0KTtcblx0KHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KVxuXHRcdC5nZXRCaW5kaW5nKClcblx0XHQucmVzZXRDaGFuZ2VzKClcblx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRuYXZpZ2F0ZShwYXRoLCB2aWV3KTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJQZW5kaW5nIENoYW5nZXMgY291bGQgbm90IGJlIHJlc2V0IC0gc3RpbGwgbmF2aWdhdGluZyB0byBhY3RpdmUgaW5zdGFuY2VcIik7XG5cdFx0XHRuYXZpZ2F0ZShwYXRoLCB2aWV3KTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGRhdGEgd2hlbiBhIENIQU5HRSBtZXNzYWdlIGhhcyBiZWVuIHJlY2VpdmVkLlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoYXQgd2FzIHVzZWQgaW5pdGlhbGx5IHdoZW4gY29ubmVjdGluZyB0aGUgd2Vic29ja2V0XG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSByZWNlaXZlZCBmcm9tIHRoZSB3ZWJzb2NrZXRcbiAqL1xuZnVuY3Rpb24gdXBkYXRlT25DaGFuZ2UodmlldzogVmlldywgbWVzc2FnZTogTWVzc2FnZSkge1xuXHRjb25zdCB1cGRhdGVkT2JqZWN0c1BhdGhzID0gbWVzc2FnZS5jbGllbnRDb250ZW50LnNwbGl0KFwifFwiKTtcblx0Y29uc3QgbWV0YU1vZGVsID0gdmlldy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRjb25zdCBpbnRlcm5hbE1vZGVsID0gdmlldy5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblxuXHQvLyBSZW1vdmUgYWxsIGxvY2tzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHBhdGhzXG5cdHVwZGF0ZWRPYmplY3RzUGF0aHMuZm9yRWFjaCgodXBkYXRlZFBhdGgpID0+IHtcblx0XHRjb25zdCB1cGRhdGVkTWV0YVBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgodXBkYXRlZFBhdGgpO1xuXHRcdGNvbnN0IGFjdGl2aXR5S2V5ID0gZ2V0QWN0aXZpdHlLZXkodXBkYXRlZFBhdGgpO1xuXHRcdGxldCBjdXJyZW50QWN0aXZpdGllczogYW55W10gPSBpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KEFDVElWSVRJRVMgKyB1cGRhdGVkTWV0YVBhdGgpIHx8IFtdO1xuXHRcdGN1cnJlbnRBY3Rpdml0aWVzID0gY3VycmVudEFjdGl2aXRpZXM/LmZpbHRlciAmJiBjdXJyZW50QWN0aXZpdGllcy5maWx0ZXIoKGFjdGl2aXR5KSA9PiBhY3Rpdml0eS5rZXkgIT09IGFjdGl2aXR5S2V5KTtcblx0XHRpZiAoY3VycmVudEFjdGl2aXRpZXMpIHtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUyArIHVwZGF0ZWRNZXRhUGF0aCwgY3VycmVudEFjdGl2aXRpZXMpO1xuXHRcdH1cblx0fSk7XG5cblx0Y29uc3QgY3VycmVudFBhZ2UgPSBnZXRDdXJyZW50UGFnZSh2aWV3KTtcblx0Y29uc3QgY3VycmVudENvbnRleHQgPSBjdXJyZW50UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdGNvbnN0IHJlcXVlc3RQcm9taXNlcyA9IHVwZGF0ZWRPYmplY3RzUGF0aHMubWFwKChwYXRoKSA9PiBhcHBseVVwZGF0ZXNGb3JDaGFuZ2UodmlldywgcGF0aCkpO1xuXG5cdC8vIFNpbXVsYXRlIGFueSBjaGFuZ2Ugc28gdGhlIGVkaXQgZmxvdyBzaG93cyB0aGUgZHJhZnQgaW5kaWNhdG9yIGFuZCBzZXRzIHRoZSBwYWdlIHRvIGRpcnR5XG5cdGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5lZGl0Rmxvdy51cGRhdGVEb2N1bWVudChjdXJyZW50Q29udGV4dCwgUHJvbWlzZS5hbGwocmVxdWVzdFByb21pc2VzKSk7XG59XG5cbi8qKlxuICogVXBkYXRlcyBkYXRhIGNvcnJlc3BvbmRpbmcgdG8gYSBwYXRoLlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoYXQgd2FzIHVzZWQgaW5pdGlhbGx5IHdoZW4gY29ubmVjdGluZyB0aGUgd2Vic29ja2V0XG4gKiBAcGFyYW0gcHJvcGVydHlQYXRoRm9yVXBkYXRlIEFic29sdXRlIHBhdGggdG8gdGhlIHVwZGF0ZWQgcHJvcGVydHlcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZlZCB3aGVuIHRoZSBkYXRhIGFuZCBpdHMgcmVsYXRlZCBzaWRlIGVmZmVjdHMgaGF2ZSBiZWVuIHJlY2VpdmVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5VXBkYXRlc0ZvckNoYW5nZSh2aWV3OiBWaWV3LCBwcm9wZXJ0eVBhdGhGb3JVcGRhdGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRjb25zdCBtZXRhTW9kZWwgPSB2aWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdGNvbnN0IG1ldGFDb250ZXh0ID0gbWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KHByb3BlcnR5UGF0aEZvclVwZGF0ZSk7XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMobWV0YUNvbnRleHQpO1xuXHRjb25zdCB0YXJnZXRDb250ZXh0UGF0aCA9IHByb3BlcnR5UGF0aEZvclVwZGF0ZS5zdWJzdHJpbmcoMCwgcHJvcGVydHlQYXRoRm9yVXBkYXRlLmxhc3RJbmRleE9mKFwiL1wiKSk7IC8vIFJlbW92ZSBwcm9wZXJ0eSBuYW1lXG5cdGNvbnN0IHRhcmdldENvbnRleHQgPSBmaW5kQ29udGV4dEZvclVwZGF0ZSh2aWV3LCB0YXJnZXRDb250ZXh0UGF0aCk7XG5cdGNvbnN0IHBhcmVudENvbGxlY3Rpb25QYXRoID0gdGFyZ2V0Q29udGV4dFBhdGguc3Vic3RyaW5nKDAsIHRhcmdldENvbnRleHRQYXRoLmxhc3RJbmRleE9mKFwiKFwiKSk7XG5cdGNvbnN0IHBhcmVudENvbnRleHRQYXRoID0gcGFyZW50Q29sbGVjdGlvblBhdGguc3Vic3RyaW5nKDAsIHBhcmVudENvbGxlY3Rpb25QYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XG5cdGNvbnN0IHBhcmVudENvbnRleHQgPSBwYXJlbnRDb250ZXh0UGF0aCA/IGZpbmRDb250ZXh0Rm9yVXBkYXRlKHZpZXcsIHBhcmVudENvbnRleHRQYXRoKSA6IHVuZGVmaW5lZDtcblxuXHRpZiAoIXRhcmdldENvbnRleHQgJiYgIXBhcmVudENvbnRleHQpIHtcblx0XHRyZXR1cm47IC8vIE5vIGNvbnRleHQgZm9yIHVwZGF0ZVxuXHR9XG5cblx0dHJ5IHtcblx0XHRjb25zdCBzaWRlRWZmZWN0c1Byb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzU2VydmljZSA9IENvbGxhYm9yYXRpb25VdGlscy5nZXRBcHBDb21wb25lbnQodmlldykuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cblx0XHRpZiAodGFyZ2V0Q29udGV4dCkge1xuXHRcdFx0Ly8gV2UgaGF2ZSBhIHRhcmdldCBjb250ZXh0LCBzbyB3ZSBjYW4gcmV0cmlldmUgdGhlIHVwZGF0ZWQgcHJvcGVydHlcblx0XHRcdGNvbnN0IHRhcmdldE1ldGFQYXRoID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKHRhcmdldENvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdGNvbnN0IHJlbGF0aXZlTWV0YVBhdGhGb3JVcGRhdGUgPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgocHJvcGVydHlQYXRoRm9yVXBkYXRlKS5yZXBsYWNlKHRhcmdldE1ldGFQYXRoLCBcIlwiKS5zbGljZSgxKTtcblx0XHRcdHNpZGVFZmZlY3RzUHJvbWlzZXMucHVzaChzaWRlRWZmZWN0c1NlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKFtyZWxhdGl2ZU1ldGFQYXRoRm9yVXBkYXRlXSwgdGFyZ2V0Q29udGV4dCwgU1lOQ0dST1VQSUQpKTtcblx0XHR9XG5cblx0XHQvLyBHZXQgdGhlIGZpZWxkR3JvdXBJZHMgY29ycmVzcG9uZGluZyB0byBwYXRoRm9yVXBkYXRlXG5cdFx0Y29uc3QgZmllbGRHcm91cElkcyA9IHNpZGVFZmZlY3RzU2VydmljZS5jb21wdXRlRmllbGRHcm91cElkcyhcblx0XHRcdGRhdGFNb2RlbE9iamVjdC50YXJnZXRFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdGRhdGFNb2RlbE9iamVjdC50YXJnZXRPYmplY3QuZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0KTtcblxuXHRcdC8vIEV4ZWN1dGUgdGhlIHNpZGUgZWZmZWN0cyBmb3IgdGhlIGZpZWxkR3JvdXBJZHNcblx0XHRpZiAoZmllbGRHcm91cElkcy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHBhZ2VDb250cm9sbGVyID0gdmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXI7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXAgPSBwYWdlQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuZ2V0U2lkZUVmZmVjdHNNYXBGb3JGaWVsZEdyb3Vwcyhcblx0XHRcdFx0ZmllbGRHcm91cElkcyxcblx0XHRcdFx0dGFyZ2V0Q29udGV4dCB8fCBwYXJlbnRDb250ZXh0XG5cdFx0XHQpIGFzIEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnk7XG5cdFx0XHRPYmplY3Qua2V5cyhzaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXApLmZvckVhY2goKHNpZGVFZmZlY3ROYW1lKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHNpZGVFZmZlY3QgPSBzaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBbc2lkZUVmZmVjdE5hbWVdO1xuXHRcdFx0XHRzaWRlRWZmZWN0c1Byb21pc2VzLnB1c2goXG5cdFx0XHRcdFx0cGFnZUNvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLnJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0LnNpZGVFZmZlY3RzLCBzaWRlRWZmZWN0LmNvbnRleHQsIFNZTkNHUk9VUElEKVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwoc2lkZUVmZmVjdHNQcm9taXNlcyk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdExvZy5lcnJvcihcIkZhaWxlZCB0byB1cGRhdGUgZGF0YSBhZnRlciBjaGFuZ2U6XCIgKyBlcnIpO1xuXHRcdHRocm93IGVycjtcblx0fVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgZGF0YSB3aGVuIGEgREVMRVRFIG1lc3NhZ2UgaGFzIGJlZW4gcmVjZWl2ZWQuXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgdGhhdCB3YXMgdXNlZCBpbml0aWFsbHkgd2hlbiBjb25uZWN0aW5nIHRoZSB3ZWJzb2NrZXRcbiAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlIHJlY2VpdmVkIGZyb20gdGhlIHdlYnNvY2tldFxuICovXG5mdW5jdGlvbiB1cGRhdGVPbkRlbGV0ZSh2aWV3OiBWaWV3LCBtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdGNvbnN0IGN1cnJlbnRQYWdlID0gZ2V0Q3VycmVudFBhZ2Uodmlldyk7XG5cdGNvbnN0IGN1cnJlbnRDb250ZXh0ID0gY3VycmVudFBhZ2UuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRjb25zdCBjdXJyZW50UGF0aCA9IGN1cnJlbnRDb250ZXh0LmdldFBhdGgoKTtcblxuXHRjb25zdCBkZWxldGVkT2JqZWN0UGF0aHMgPSBtZXNzYWdlLmNsaWVudENvbnRlbnQuc3BsaXQoXCJ8XCIpO1xuXG5cdC8vIGNoZWNrIGlmIHVzZXIgY3VycmVudGx5IGRpc3BsYXlzIGEgZGVsZXRlZCBvYmplY3Qgb3Igb25lIG9mIGl0cyBkZXNjZW5kYW50c1xuXHRjb25zdCBkZWxldGVkUGF0aEluVXNlID0gZGVsZXRlZE9iamVjdFBhdGhzLmZpbmQoKGRlbGV0ZWRQYXRoKSA9PiBjdXJyZW50UGF0aC5zdGFydHNXaXRoKGRlbGV0ZWRQYXRoKSk7XG5cdGlmIChkZWxldGVkUGF0aEluVXNlKSB7XG5cdFx0Ly8gYW55IG90aGVyIHVzZXIgZGVsZXRlZCB0aGUgb2JqZWN0IEknbSBjdXJyZW50bHkgbG9va2luZyBhdC4gSW5mb3JtIHRoZSB1c2VyIHdlIHdpbGwgbmF2aWdhdGUgdG8gcm9vdCBub3dcblx0XHRNZXNzYWdlQm94LmluZm9ybWF0aW9uKENvbGxhYm9yYXRpb25VdGlscy5nZXRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfREVMRVRFXCIsIG1lc3NhZ2UudXNlckRlc2NyaXB0aW9uKSwge1xuXHRcdFx0b25DbG9zZTogKCkgPT4ge1xuXHRcdFx0XHQvLyBXZSByZXRyaWV2ZSB0aGUgZGVsZXRlZCBjb250ZXh0IGFzIGEga2VlcC1hbGl2ZSwgYW5kIGRpc2FibGUgaXRzIGtlZXBhbGl2ZSBzdGF0dXMsXG5cdFx0XHRcdC8vIHNvIHRoYXQgaXQgaXMgcHJvcGVybHkgZGVzdHJveWVkIHdoZW4gcmVmcmVzaGluZyBkYXRhXG5cdFx0XHRcdGNvbnN0IHRhcmdldENvbnRleHQgPSBjdXJyZW50Q29udGV4dC5nZXRNb2RlbCgpLmdldEtlZXBBbGl2ZUNvbnRleHQoZGVsZXRlZFBhdGhJblVzZSk7XG5cdFx0XHRcdHRhcmdldENvbnRleHQuc2V0S2VlcEFsaXZlKGZhbHNlKTtcblx0XHRcdFx0Y29uc3QgcmVxdWVzdFByb21pc2UgPSBhcHBseVVwZGF0ZXNGb3JDb2xsZWN0aW9uKHZpZXcsIGRlbGV0ZWRPYmplY3RQYXRoc1swXSk7XG5cdFx0XHRcdGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5lZGl0Rmxvdy51cGRhdGVEb2N1bWVudChjdXJyZW50UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpLCByZXF1ZXN0UHJvbWlzZSk7XG5cdFx0XHRcdChjdXJyZW50UGFnZS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9yb3V0aW5nLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KHRhcmdldENvbnRleHQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IHJlcXVlc3RQcm9taXNlID0gYXBwbHlVcGRhdGVzRm9yQ29sbGVjdGlvbih2aWV3LCBkZWxldGVkT2JqZWN0UGF0aHNbMF0pO1xuXHRcdGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5lZGl0Rmxvdy51cGRhdGVEb2N1bWVudChjdXJyZW50UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpLCByZXF1ZXN0UHJvbWlzZSk7XG5cdH1cbn1cblxuLyoqXG4gKiBVcGRhdGVzIGRhdGEgd2hlbiBhIENSRUFURSBtZXNzYWdlIGhhcyBiZWVuIHJlY2VpdmVkLlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoYXQgd2FzIHVzZWQgaW5pdGlhbGx5IHdoZW4gY29ubmVjdGluZyB0aGUgd2Vic29ja2V0XG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSByZWNlaXZlZCBmcm9tIHRoZSB3ZWJzb2NrZXRcbiAqL1xuZnVuY3Rpb24gdXBkYXRlT25DcmVhdGUodmlldzogVmlldywgbWVzc2FnZTogTWVzc2FnZSkge1xuXHRjb25zdCBjdXJyZW50UGFnZSA9IGdldEN1cnJlbnRQYWdlKHZpZXcpO1xuXHRjb25zdCBjcmVhdGVkT2JqZWN0UGF0aHMgPSBtZXNzYWdlLmNsaWVudENvbnRlbnQuc3BsaXQoXCJ8XCIpO1xuXG5cdGNvbnN0IHJlcXVlc3RQcm9taXNlID0gYXBwbHlVcGRhdGVzRm9yQ29sbGVjdGlvbih2aWV3LCBjcmVhdGVkT2JqZWN0UGF0aHNbMF0pO1xuXHQvLyBTaW11bGF0ZSBhIGNoYW5nZSBzbyB0aGUgZWRpdCBmbG93IHNob3dzIHRoZSBkcmFmdCBpbmRpY2F0b3IgYW5kIHNldHMgdGhlIHBhZ2UgdG8gZGlydHlcblx0Y3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlcigpLmVkaXRGbG93LnVwZGF0ZURvY3VtZW50KGN1cnJlbnRQYWdlLmdldEJpbmRpbmdDb250ZXh0KCksIHJlcXVlc3RQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGRhdGEgaW4gYSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoYXQgd2FzIHVzZWQgaW5pdGlhbGx5IHdoZW4gY29ubmVjdGluZyB0aGUgd2Vic29ja2V0XG4gKiBAcGFyYW0gcGF0aEluQ29sbGVjdGlvbiBBIHBhdGggdG8gYW4gZW50aXR5IGluIHRoZSBjb2xsZWN0aW9uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5VXBkYXRlc0ZvckNvbGxlY3Rpb24odmlldzogVmlldywgcGF0aEluQ29sbGVjdGlvbjogc3RyaW5nKSB7XG5cdGNvbnN0IGFwcENvbXBvbmVudCA9IENvbGxhYm9yYXRpb25VdGlscy5nZXRBcHBDb21wb25lbnQodmlldyk7XG5cdGNvbnN0IHBhcmVudFBhdGggPSBwYXRoSW5Db2xsZWN0aW9uLnN1YnN0cmluZygwLCBwYXRoSW5Db2xsZWN0aW9uLmxhc3RJbmRleE9mKFwiL1wiKSk7XG5cdGNvbnN0IHBhcmVudENvbnRleHQgPSBmaW5kQ29udGV4dEZvclVwZGF0ZSh2aWV3LCBwYXJlbnRQYXRoKTtcblxuXHRpZiAocGFyZW50Q29udGV4dCkge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0c1Byb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuXG5cdFx0XHRjb25zdCBtZXRhTW9kZWwgPSBwYXJlbnRDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRjb25zdCBtZXRhUGF0aEZvclVwZGF0ZSA9IG1ldGFNb2RlbC5nZXRNZXRhUGF0aChwYXRoSW5Db2xsZWN0aW9uKTtcblx0XHRcdGNvbnN0IHBhcmVudE1ldGFQYXRoID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKHBhcmVudENvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdGNvbnN0IHJlbGF0aXZlUGF0aCA9IG1ldGFQYXRoRm9yVXBkYXRlLnJlcGxhY2UoYCR7cGFyZW50TWV0YVBhdGh9L2AsIFwiXCIpO1xuXG5cdFx0XHQvLyBSZWxvYWQgdGhlIGNvbGxlY3Rpb25cblx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzU2VydmljZSA9IGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0XHRcdHNpZGVFZmZlY3RzUHJvbWlzZXMucHVzaChzaWRlRWZmZWN0c1NlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKFtyZWxhdGl2ZVBhdGhdLCBwYXJlbnRDb250ZXh0LCBTWU5DR1JPVVBJRCkpO1xuXG5cdFx0XHQvLyBSZXF1ZXN0IHRoZSBzaWRlIGVmZmVjdHMgZm9yIHRoZSBjb2xsZWN0aW9uXG5cdFx0XHRzaWRlRWZmZWN0c1Byb21pc2VzLnB1c2goc2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eShyZWxhdGl2ZVBhdGgsIHBhcmVudENvbnRleHQsIFNZTkNHUk9VUElEKSk7XG5cblx0XHRcdGF3YWl0IFByb21pc2UuYWxsKHNpZGVFZmZlY3RzUHJvbWlzZXMpO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0TG9nLmVycm9yKFwiRmFpbGVkIHRvIHVwZGF0ZSBkYXRhIGFmdGVyIGNvbGxlY3Rpb24gdXBkYXRlOlwiICsgZXJyKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBVcGRhdGVzIGRhdGEgd2hlbiBhIEFDVElPTiBtZXNzYWdlIGhhcyBiZWVuIHJlY2VpdmVkLlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoYXQgd2FzIHVzZWQgaW5pdGlhbGx5IHdoZW4gY29ubmVjdGluZyB0aGUgd2Vic29ja2V0XG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSByZWNlaXZlZCBmcm9tIHRoZSB3ZWJzb2NrZXRcbiAqL1xuZnVuY3Rpb24gdXBkYXRlT25BY3Rpb24odmlldzogVmlldywgbWVzc2FnZTogTWVzc2FnZSkge1xuXHRjb25zdCBjdXJyZW50UGFnZSA9IGdldEN1cnJlbnRQYWdlKHZpZXcpO1xuXHRjb25zdCBwYXRoc0ZvckFjdGlvbiA9IG1lc3NhZ2UuY2xpZW50Q29udGVudC5zcGxpdChcInxcIik7XG5cdGNvbnN0IGFjdGlvbk5hbWUgPSBtZXNzYWdlLmNsaWVudFRyaWdnZXJlZEFjdGlvbk5hbWUgfHwgXCJcIjtcblx0Y29uc3QgcmVxdWVzdGVkUHJvcGVydGllcyA9IG1lc3NhZ2UuY2xpZW50UmVxdWVzdGVkUHJvcGVydGllcz8uc3BsaXQoXCJ8XCIpO1xuXHRjb25zdCByZWZyZXNoTGlzdEJpbmRpbmcgPSBtZXNzYWdlLmNsaWVudFJlZnJlc2hMaXN0QmluZGluZyA9PT0gXCJ0cnVlXCI7XG5cblx0Y29uc3QgcmVxdWVzdFByb21pc2VzID0gcGF0aHNGb3JBY3Rpb24ubWFwKChwYXRoKSA9PiByZXF1ZXN0VXBkYXRlRm9yQWN0aW9uKHZpZXcsIHBhdGgsIGFjdGlvbk5hbWUsIHJlcXVlc3RlZFByb3BlcnRpZXMpKTtcblxuXHRpZiAocmVmcmVzaExpc3RCaW5kaW5nKSB7XG5cdFx0cmVxdWVzdFByb21pc2VzLnB1c2goYXBwbHlVcGRhdGVzRm9yQ29sbGVjdGlvbih2aWV3LCBwYXRoc0ZvckFjdGlvblswXSkpO1xuXHR9XG5cblx0Ly8gU2ltdWxhdGUgYW55IGNoYW5nZSBzbyB0aGUgZWRpdCBmbG93IHNob3dzIHRoZSBkcmFmdCBpbmRpY2F0b3IgYW5kIHNldHMgdGhlIHBhZ2UgdG8gZGlydHlcblx0Y3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlcigpLmVkaXRGbG93LnVwZGF0ZURvY3VtZW50KGN1cnJlbnRQYWdlLmdldEJpbmRpbmdDb250ZXh0KCksIFByb21pc2UuYWxsKHJlcXVlc3RQcm9taXNlcykpO1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgc2lkZS1lZmZlY3RzIGRhdGEgd2hlbiBhbiBhY3Rpb24gaGFzIGJlZW4gdHJpZ2dlcmVkIG9uIGEgY29udGV4dC5cbiAqXG4gKiBAcGFyYW0gdmlldyBUaGUgdmlldyB0aGF0IHdhcyB1c2VkIGluaXRpYWxseSB3aGVuIGNvbm5lY3RpbmcgdGhlIHdlYnNvY2tldFxuICogQHBhcmFtIHBhdGhGb3JBY3Rpb24gUGF0aCBvZiB0aGUgY29udGV4dCB0byBhcHBseSB0aGUgYWN0aW9uIHRvXG4gKiBAcGFyYW0gYWN0aW9uTmFtZSBOYW1lIG9mIHRoZSBhY3Rpb25cbiAqIEBwYXJhbSByZXF1ZXN0ZWRQcm9wZXJ0aWVzXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVkIHdoZW4gdGhlIHNpZGUtZWZmZWN0cyBkYXRhIGhhcyBiZWVuIGxvYWRlZFxuICovXG5hc3luYyBmdW5jdGlvbiByZXF1ZXN0VXBkYXRlRm9yQWN0aW9uKFxuXHR2aWV3OiBWaWV3LFxuXHRwYXRoRm9yQWN0aW9uOiBzdHJpbmcsXG5cdGFjdGlvbk5hbWU6IHN0cmluZyxcblx0cmVxdWVzdGVkUHJvcGVydGllcz86IHN0cmluZ1tdXG4pOiBQcm9taXNlPHZvaWQ+IHtcblx0Y29uc3QgdGFyZ2V0Q29udGV4dCA9IGZpbmRDb250ZXh0Rm9yVXBkYXRlKHZpZXcsIHBhdGhGb3JBY3Rpb24pO1xuXHRpZiAoIXRhcmdldENvbnRleHQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBhcHBDb21wb25lbnQgPSBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHZpZXcpO1xuXHRjb25zdCBzaWRlRWZmZWN0U2VydmljZSA9IGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0Y29uc3Qgc2lkZUVmZmVjdHNGcm9tQWN0aW9uID0gc2lkZUVmZmVjdFNlcnZpY2UuZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyhhY3Rpb25OYW1lLCB0YXJnZXRDb250ZXh0KTtcblx0Y29uc3Qgc2lkZUVmZmVjdFByb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuXHRpZiAoc2lkZUVmZmVjdHNGcm9tQWN0aW9uKSB7XG5cdFx0aWYgKHNpZGVFZmZlY3RzRnJvbUFjdGlvbi5wYXRoRXhwcmVzc2lvbnM/Lmxlbmd0aCkge1xuXHRcdFx0c2lkZUVmZmVjdFByb21pc2VzLnB1c2goXG5cdFx0XHRcdHNpZGVFZmZlY3RTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c0Zyb21BY3Rpb24ucGF0aEV4cHJlc3Npb25zLCB0YXJnZXRDb250ZXh0LCBTWU5DR1JPVVBJRClcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cdGlmIChyZXF1ZXN0ZWRQcm9wZXJ0aWVzICYmIHJlcXVlc3RlZFByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuXHRcdC8vY2xlYW4tdXAgb2YgdGhlIHByb3BlcnRpZXMgdG8gcmVxdWVzdCBsaXN0OlxuXHRcdGNvbnN0IG1ldGFNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRjb25zdCBtZXRhUGF0aEZvckFjdGlvbiA9IGNhbGN1bGF0ZU1ldGFQYXRoKHZpZXcsIHBhdGhGb3JBY3Rpb24pO1xuXHRcdGNvbnN0IGRhdGFNb2RlbFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFNb2RlbC5nZXRDb250ZXh0KG1ldGFQYXRoRm9yQWN0aW9uKSk7XG5cdFx0Y29uc3QgcHJvcGVydGllc1RvUmVxdWVzdCA9IGRhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzXG5cdFx0XHQubWFwKChwcm9wZXJ0eTogUHJvcGVydHkpID0+IHtcblx0XHRcdFx0cmV0dXJuIHByb3BlcnR5Lm5hbWU7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbHRlcigocHJvcCkgPT4gcmVxdWVzdGVkUHJvcGVydGllcy5pbmNsdWRlcyhwcm9wKSk7XG5cdFx0aWYgKHByb3BlcnRpZXNUb1JlcXVlc3QubGVuZ3RoID4gMCkge1xuXHRcdFx0c2lkZUVmZmVjdFByb21pc2VzLnB1c2goc2lkZUVmZmVjdFNlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKHByb3BlcnRpZXNUb1JlcXVlc3QsIHRhcmdldENvbnRleHQsIFNZTkNHUk9VUElEKSk7XG5cdFx0fVxuXHR9XG5cblx0YXdhaXQgUHJvbWlzZS5hbGwoc2lkZUVmZmVjdFByb21pc2VzKTtcbn1cblxuLyoqXG4gKiBGaW5kcyBhIGNvbnRleHQgdG8gYXBwbHkgYW4gdXBkYXRlIG1lc3NhZ2UgKENIQU5HRSwgQ1JFQVRFLCBERUxFVEUgb3IgQUNUSU9OKS5cbiAqXG4gKiBAcGFyYW0gdmlldyAgVGhlIHZpZXcgdGhhdCB3YXMgdXNlZCBpbml0aWFsbHkgd2hlbiBjb25uZWN0aW5nIHRoZSB3ZWJzb2NrZXRcbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBjb250ZXh0IHRvIGJlIGZvdW5kIChzaGFsbCBwb2ludCB0byBhbiBlbnRpdHksIG5vdCBhIHByb3BlcnR5KVxuICogQHJldHVybnMgQSBjb250ZXh0IGlmIGl0IGNvdWxkIGJlIGZvdW5kXG4gKi9cbmZ1bmN0aW9uIGZpbmRDb250ZXh0Rm9yVXBkYXRlKHZpZXc6IFZpZXcsIHBhdGg6IHN0cmluZyk6IENvbnRleHQgfCB1bmRlZmluZWQge1xuXHRpZiAoIXBhdGgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdC8vIEZpbmQgYWxsIHBvdGVudGlhbCBwYXRoc1xuXHRjb25zdCB0YXJnZXRQYXRoczogc3RyaW5nW10gPSBbXTtcblx0d2hpbGUgKCFwYXRoLmVuZHNXaXRoKFwiKVwiKSkge1xuXHRcdHRhcmdldFBhdGhzLnVuc2hpZnQocGF0aCk7XG5cdFx0cGF0aCA9IHBhdGguc3Vic3RyaW5nKDAsIHBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0fVxuXHR0YXJnZXRQYXRocy51bnNoaWZ0KHBhdGgpO1xuXG5cdGNvbnN0IHBhcmVudENvbGxlY3Rpb25QYXRoID0gcGF0aC5zdWJzdHJpbmcoMCwgcGF0aC5sYXN0SW5kZXhPZihcIihcIikpOyAvLyBSZW1vdmUgdGhlIGxhc3Qga2V5XG5cblx0bGV0IHRhcmdldENvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdGxldCBjdXJyZW50Q29udGV4dCA9IGdldEN1cnJlbnRQYWdlKHZpZXcpLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0d2hpbGUgKGN1cnJlbnRDb250ZXh0ICYmICF0YXJnZXRDb250ZXh0KSB7XG5cdFx0aWYgKHRhcmdldFBhdGhzLmluZGV4T2YoY3VycmVudENvbnRleHQuZ2V0UGF0aCgpKSA+PSAwKSB7XG5cdFx0XHR0YXJnZXRDb250ZXh0ID0gY3VycmVudENvbnRleHQ7XG5cdFx0fVxuXG5cdFx0Y3VycmVudENvbnRleHQgPSBjdXJyZW50Q29udGV4dC5nZXRCaW5kaW5nKCk/LmdldENvbnRleHQoKSBhcyBDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKHRhcmdldENvbnRleHQpIHtcblx0XHQvLyBGb3VuZCAhXG5cdFx0cmV0dXJuIHRhcmdldENvbnRleHQ7XG5cdH1cblxuXHQvLyBUcnkgdG8gZmluZCB0aGUgdGFyZ2V0IGNvbnRleHQgaW4gYSBsaXN0QmluZGluZ1xuXHRjb25zdCBtb2RlbCA9IGdldEN1cnJlbnRQYWdlKHZpZXcpLmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsO1xuXHRjb25zdCBwYXJlbnRMaXN0QmluZGluZyA9IG1vZGVsLmdldEFsbEJpbmRpbmdzKCkuZmluZCgoYmluZGluZykgPT4ge1xuXHRcdGNvbnN0IGJpbmRpbmdQYXRoID0gYmluZGluZy5pc1JlbGF0aXZlKCkgPyBiaW5kaW5nLmdldFJlc29sdmVkUGF0aCgpIDogYmluZGluZy5nZXRQYXRoKCk7XG5cdFx0cmV0dXJuIGJpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikgJiYgYmluZGluZ1BhdGggPT09IHBhcmVudENvbGxlY3Rpb25QYXRoO1xuXHR9KSBhcyBPRGF0YUxpc3RCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXHQvLyBXZSd2ZSBmb3VuZCBhIGxpc3QgYmluZGluZyB0aGF0IGNvdWxkIGNvbnRhaW4gdGhlIHRhcmdldCBjb250ZXh0IC0tPiBsb29rIGZvciBpdFxuXHR0YXJnZXRDb250ZXh0ID0gcGFyZW50TGlzdEJpbmRpbmc/LmdldEFsbEN1cnJlbnRDb250ZXh0cygpLmZpbmQoKGNvbnRleHQpID0+IHtcblx0XHRyZXR1cm4gdGFyZ2V0UGF0aHMuaW5kZXhPZihjb250ZXh0LmdldFBhdGgoKSkgPj0gMDtcblx0fSk7XG5cblx0cmV0dXJuIHRhcmdldENvbnRleHQ7XG59XG5cbmZ1bmN0aW9uIG5hdmlnYXRlKHBhdGg6IHN0cmluZywgdmlldzogVmlldykge1xuXHQvLyBUT0RPOiByb3V0aW5nLm5hdmlnYXRlIGRvZXNuJ3QgY29uc2lkZXIgc2VtYW50aWMgYm9va21hcmtpbmdcblx0Y29uc3QgY3VycmVudFBhZ2UgPSBnZXRDdXJyZW50UGFnZSh2aWV3KTtcblx0Y29uc3QgdGFyZ2V0Q29udGV4dCA9IHZpZXcuZ2V0TW9kZWwoKS5iaW5kQ29udGV4dChwYXRoKS5nZXRCb3VuZENvbnRleHQoKTtcblx0Y3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlcigpLnJvdXRpbmcubmF2aWdhdGUodGFyZ2V0Q29udGV4dCk7XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRQYWdlKHZpZXc6IFZpZXcpIHtcblx0Y29uc3QgYXBwQ29tcG9uZW50ID0gQ29sbGFib3JhdGlvblV0aWxzLmdldEFwcENvbXBvbmVudCh2aWV3KTtcblx0cmV0dXJuIENvbW1vblV0aWxzLmdldEN1cnJlbnRQYWdlVmlldyhhcHBDb21wb25lbnQpO1xufVxuXG5mdW5jdGlvbiBnZXRBY3Rpdml0eUtleSh4OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4geC5zdWJzdHJpbmcoeC5sYXN0SW5kZXhPZihcIihcIikgKyAxLCB4Lmxhc3RJbmRleE9mKFwiKVwiKSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbWV0YXBhdGggZnJvbSBvbmUgb3IgbW9yZSBkYXRhIHBhdGgocykuXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIGN1cnJlbnQgdmlld1xuICogQHBhcmFtIHBhdGggT25lIG9yZSBtb3JlIGRhdGEgcGF0aChzKSwgaW4gY2FzZSBvZiBtdWx0aXBsZSBwYXRocyBzZXBhcmF0ZWQgYnkgJ3wnXG4gKiBAcmV0dXJucyBUaGUgY2FsY3VsYXRlZCBtZXRhUGF0aFxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVNZXRhUGF0aCh2aWV3OiBWaWV3LCBwYXRoPzogc3RyaW5nKTogc3RyaW5nIHtcblx0bGV0IG1ldGFQYXRoID0gXCJcIjtcblx0aWYgKHBhdGgpIHtcblx0XHQvLyBpbiBjYXNlIG1vcmUgdGhhbiBvbmUgcGF0aCBpcyBzZW50IGFsbCBvZiB0aGVtIGhhdmUgdG8gdXNlIHRoZSBzYW1lIG1ldGFwYXRoIHRoZXJlZm9yZSB3ZSBqdXN0IGNvbnNpZGVyIHRoZSBmaXJzdCBvbmVcblx0XHRjb25zdCBkYXRhUGF0aCA9IHBhdGguc3BsaXQoXCJ8XCIpWzBdO1xuXHRcdG1ldGFQYXRoID0gKHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCkuZ2V0TWV0YVBhdGgoZGF0YVBhdGgpO1xuXHR9XG5cdHJldHVybiBtZXRhUGF0aDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuXHRjb25uZWN0OiBjb25uZWN0LFxuXHRkaXNjb25uZWN0OiBkaXNjb25uZWN0LFxuXHRpc0Nvbm5lY3RlZDogaXNDb25uZWN0ZWQsXG5cdGlzQ29sbGFib3JhdGlvbkVuYWJsZWQ6IGlzQ29sbGFib3JhdGlvbkVuYWJsZWQsXG5cdHNlbmQ6IHNlbmRcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7O0VBdUJBLE1BQU1BLFVBQVUsR0FBRywyQkFBMkI7RUFDOUMsTUFBTUMsV0FBVyxHQUFHLDRCQUE0QjtFQUNoRCxNQUFNQyxVQUFVLEdBQUcsMkJBQTJCO0VBQzlDLE1BQU1DLFdBQVcsR0FBRyxZQUFZO0VBRXpCLE1BQU1DLFdBQVcsR0FBRyxVQUFVQyxPQUFnQixFQUFXO0lBQy9ELE1BQU1DLGFBQWEsR0FBR0QsT0FBTyxDQUFDRSxRQUFRLENBQUMsVUFBVSxDQUFjO0lBQy9ELE9BQU9DLHdCQUF3QixDQUFDRixhQUFhLENBQUM7RUFDL0MsQ0FBQztFQUFDO0VBRUssTUFBTUcsSUFBSSxHQUFHLFVBQ25CSixPQUFnQixFQUNoQkssTUFBZ0IsRUFDaEJDLE9BQXNDLEVBQ3RDQyxtQkFBNEIsRUFDNUJDLGtCQUE0QixFQUM1QkMseUJBQW9DLEVBQ25DO0lBQ0QsSUFBSVYsV0FBVyxDQUFDQyxPQUFPLENBQUMsRUFBRTtNQUN6QixNQUFNQyxhQUFhLEdBQUdELE9BQU8sQ0FBQ0UsUUFBUSxDQUFDLFVBQVUsQ0FBYztNQUMvRCxNQUFNUSxhQUFhLEdBQUdDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDTixPQUFPLENBQUMsR0FBR0EsT0FBTyxDQUFDTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUdQLE9BQU87TUFDMUUsTUFBTVEsbUJBQW1CLEdBQUdMLHlCQUF5QixhQUF6QkEseUJBQXlCLHVCQUF6QkEseUJBQXlCLENBQUVJLElBQUksQ0FBQyxHQUFHLENBQUM7TUFDaEUsTUFBTUUsVUFBVSxHQUFHZCxhQUFhLENBQUNlLFdBQVcsQ0FBQ3JCLFVBQVUsQ0FB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