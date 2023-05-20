/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log"], function (Log) {
  "use strict";

  var _exports = {};
  let Placement;
  (function (Placement) {
    Placement["After"] = "After";
    Placement["Before"] = "Before";
    Placement["End"] = "End";
  })(Placement || (Placement = {}));
  _exports.Placement = Placement;
  /**
   * Recursive method that order the keys based on a position information.
   *
   * @param positioningItems
   * @param anchor
   * @param sorted
   * @param visited
   * @returns The order of the current item
   */
  const orderPositioningItemRecursively = (positioningItems, anchor, sorted, visited) => {
    let insertIndex = sorted.indexOf(anchor);
    if (insertIndex !== -1) {
      return insertIndex;
    }
    const anchorItem = positioningItems[anchor];
    if (anchorItem === undefined) {
      const anchorText = anchor.split("::"),
        manifestItem = Object.keys(visited)[0];
      Log.warning(`Position anchor '${anchorText[anchorText.length - 1]}' not found for item '${manifestItem}'. Please check manifest settings.`);
      return sorted.length;
      // throw new Error(`position anchor not found: ${anchor}`);
    }

    visited[anchor] = anchorItem;
    if (anchorItem && !(anchorItem.anchor in visited)) {
      insertIndex = orderPositioningItemRecursively(positioningItems, anchorItem.anchor, sorted, visited);
      if (anchorItem.placement !== Placement.Before) {
        ++insertIndex;
      }
    } else {
      insertIndex = sorted.length;
    }
    sorted.splice(insertIndex, 0, anchor);
    return insertIndex;
  };
  let OverrideType;
  (function (OverrideType) {
    OverrideType["merge"] = "merge";
    OverrideType["overwrite"] = "overwrite";
    OverrideType["ignore"] = "ignore";
  })(OverrideType || (OverrideType = {}));
  _exports.OverrideType = OverrideType;
  function isArrayConfig(config) {
    return typeof config === "object";
  }
  function applyOverride(overwritableKeys, sourceItem, customElement) {
    const outItem = sourceItem || customElement;
    for (const overwritableKey in overwritableKeys) {
      if (Object.hasOwnProperty.call(overwritableKeys, overwritableKey)) {
        const overrideConfig = overwritableKeys[overwritableKey];
        if (sourceItem !== null) {
          switch (overrideConfig) {
            case "overwrite":
              if (customElement.hasOwnProperty(overwritableKey) && customElement[overwritableKey] !== undefined) {
                sourceItem[overwritableKey] = customElement[overwritableKey];
              }
              break;
            case "merge":
            default:
              const subItem = sourceItem[overwritableKey] || [];
              let subConfig = {};
              if (isArrayConfig(overrideConfig)) {
                subConfig = overrideConfig;
              }
              if (Array.isArray(subItem)) {
                sourceItem[overwritableKey] = insertCustomElements(subItem, customElement && customElement[overwritableKey] || {}, subConfig);
              }
              break;
          }
        } else {
          switch (overrideConfig) {
            case "overwrite":
              if (customElement.hasOwnProperty(overwritableKey) && customElement[overwritableKey] !== undefined) {
                outItem[overwritableKey] = customElement[overwritableKey];
              }
              break;
            case "merge":
            default:
              let subConfig = {};
              if (isArrayConfig(overrideConfig)) {
                subConfig = overrideConfig;
              }
              outItem[overwritableKey] = insertCustomElements([], customElement && customElement[overwritableKey] || {}, subConfig);
              break;
          }
        }
      }
    }
    return outItem;
  }

  /**
   * Insert a set of custom elements in the right position in an original collection.
   *
   * Parameters for overwritableKeys and their implications:
   * "overwrite": The whole object gets overwritten - if the customElements include a default, this will overrule the whole rootElements configuration.
   * "merge": This is similar to calling insertCustomElements itself. You must include the
   * full CustomElement syntax within the customElements, including anchors, for example.
   * "ignore": There are no additions and no combinations. Only the rootElements object is used.
   *
   * Note - Proceed as follows in case you have defined customElements and do not want to overwrite their values with defaults:
   * Hand the rootElements into the creation function of the customElement.
   * Depending on the existence of both rootElement-configuration and customElement-configuration,
   * you must set the customElements property, for which the "overwrite"-property is set, explicitly to undefined.
   *
   * @template T
   * @param rootElements A list of "ConfigurableObject" which means object that have a unique "key"
   * @param customElements An object containing extra object to add, they are indexed by a key and have a "position" object
   * @param overwritableKeys The list of keys from the original object that can be overwritten in case a custom element has the same "key"
   * @returns An ordered array of elements including the custom ones
   */
  function insertCustomElements(rootElements, customElements) {
    let overwritableKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const firstAnchor = rootElements.length ? rootElements[0].key : null;
    const rootElementsWithoutLast = rootElements.filter(rootElement => {
      var _rootElement$position;
      return ((_rootElement$position = rootElement.position) === null || _rootElement$position === void 0 ? void 0 : _rootElement$position.placement) !== Placement.End;
    });
    const lastAnchor = rootElements.length ? rootElements[rootElementsWithoutLast.length - 1].key : null;
    let endElement;
    const positioningItems = {};
    const itemsPerKey = {};
    rootElements.forEach(rootElement => {
      var _rootElement$position2;
      if (((_rootElement$position2 = rootElement.position) === null || _rootElement$position2 === void 0 ? void 0 : _rootElement$position2.placement) === Placement.End && !endElement) {
        endElement = rootElement;
      } else {
        var _rootElement$position3, _rootElement$position4;
        positioningItems[rootElement.key] = {
          anchor: ((_rootElement$position3 = rootElement.position) === null || _rootElement$position3 === void 0 ? void 0 : _rootElement$position3.anchor) || rootElement.key,
          placement: ((_rootElement$position4 = rootElement.position) === null || _rootElement$position4 === void 0 ? void 0 : _rootElement$position4.placement) || Placement.After
        };
      }
      itemsPerKey[rootElement.key] = rootElement;
    });
    Object.keys(customElements).forEach(customElementKey => {
      var _customElement$menu;
      const customElement = customElements[customElementKey];
      const anchor = customElement.position.anchor;
      // If no placement defined we are After
      if (!customElement.position.placement) {
        customElement.position.placement = Placement.After;
      }
      // If no anchor we're either After the last anchor or Before the first
      if (!anchor) {
        const potentialAnchor = customElement.position.placement === Placement.After ? lastAnchor : firstAnchor;
        customElement.position.anchor = potentialAnchor ? potentialAnchor : customElementKey;
      }

      // Adding bound/unbound actions to menu
      customElement.menu = customElement === null || customElement === void 0 ? void 0 : (_customElement$menu = customElement.menu) === null || _customElement$menu === void 0 ? void 0 : _customElement$menu.map(menu => {
        return itemsPerKey[menu.key] ?? menu;
      });
      const adjustedCustomElementKey = customElement.key;
      if (itemsPerKey[adjustedCustomElementKey]) {
        itemsPerKey[adjustedCustomElementKey] = applyOverride(overwritableKeys, itemsPerKey[adjustedCustomElementKey], customElement);

        //Position is overwritten for filter fields if there is a change in manifest
        if (anchor && customElement.position && overwritableKeys.position && overwritableKeys.position === "overwrite") {
          positioningItems[adjustedCustomElementKey] = itemsPerKey[adjustedCustomElementKey].position;
        }
        /**
         * anchor check is added to make sure change in properties in the manifest does not affect the position of the field.
         * Otherwise, when no position is mentioned in manifest for an altered field, the position is changed as
         * per the potential anchor
         */
      } else {
        itemsPerKey[adjustedCustomElementKey] = applyOverride(overwritableKeys, null, customElement);
        positioningItems[adjustedCustomElementKey] = customElement.position;
      }
    });
    const sortedKeys = [];
    Object.keys(positioningItems).forEach(positionItemKey => {
      orderPositioningItemRecursively(positioningItems, positionItemKey, sortedKeys, {});
    });
    const outElements = sortedKeys.map(key => itemsPerKey[key]);
    if (endElement) {
      outElements.push(endElement);
    }
    return outElements;
  }
  _exports.insertCustomElements = insertCustomElements;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQbGFjZW1lbnQiLCJvcmRlclBvc2l0aW9uaW5nSXRlbVJlY3Vyc2l2ZWx5IiwicG9zaXRpb25pbmdJdGVtcyIsImFuY2hvciIsInNvcnRlZCIsInZpc2l0ZWQiLCJpbnNlcnRJbmRleCIsImluZGV4T2YiLCJhbmNob3JJdGVtIiwidW5kZWZpbmVkIiwiYW5jaG9yVGV4dCIsInNwbGl0IiwibWFuaWZlc3RJdGVtIiwiT2JqZWN0Iiwia2V5cyIsIkxvZyIsIndhcm5pbmciLCJsZW5ndGgiLCJwbGFjZW1lbnQiLCJCZWZvcmUiLCJzcGxpY2UiLCJPdmVycmlkZVR5cGUiLCJpc0FycmF5Q29uZmlnIiwiY29uZmlnIiwiYXBwbHlPdmVycmlkZSIsIm92ZXJ3cml0YWJsZUtleXMiLCJzb3VyY2VJdGVtIiwiY3VzdG9tRWxlbWVudCIsIm91dEl0ZW0iLCJvdmVyd3JpdGFibGVLZXkiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJvdmVycmlkZUNvbmZpZyIsInN1Ykl0ZW0iLCJzdWJDb25maWciLCJBcnJheSIsImlzQXJyYXkiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsInJvb3RFbGVtZW50cyIsImN1c3RvbUVsZW1lbnRzIiwiZmlyc3RBbmNob3IiLCJrZXkiLCJyb290RWxlbWVudHNXaXRob3V0TGFzdCIsImZpbHRlciIsInJvb3RFbGVtZW50IiwicG9zaXRpb24iLCJFbmQiLCJsYXN0QW5jaG9yIiwiZW5kRWxlbWVudCIsIml0ZW1zUGVyS2V5IiwiZm9yRWFjaCIsIkFmdGVyIiwiY3VzdG9tRWxlbWVudEtleSIsInBvdGVudGlhbEFuY2hvciIsIm1lbnUiLCJtYXAiLCJhZGp1c3RlZEN1c3RvbUVsZW1lbnRLZXkiLCJzb3J0ZWRLZXlzIiwicG9zaXRpb25JdGVtS2V5Iiwib3V0RWxlbWVudHMiLCJwdXNoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb25maWd1cmFibGVPYmplY3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5cbmV4cG9ydCB0eXBlIFBvc2l0aW9uID0ge1xuXHRhbmNob3I/OiBzdHJpbmc7XG5cdHBsYWNlbWVudDogUGxhY2VtZW50O1xufTtcblxuZXhwb3J0IGVudW0gUGxhY2VtZW50IHtcblx0QWZ0ZXIgPSBcIkFmdGVyXCIsXG5cdEJlZm9yZSA9IFwiQmVmb3JlXCIsXG5cdEVuZCA9IFwiRW5kXCJcbn1cbmV4cG9ydCB0eXBlIENvbmZpZ3VyYWJsZU9iamVjdEtleSA9IHN0cmluZztcbmV4cG9ydCB0eXBlIENvbmZpZ3VyYWJsZU9iamVjdCA9IFBvc2l0aW9uYWJsZSAmIHtcblx0a2V5OiBDb25maWd1cmFibGVPYmplY3RLZXk7XG59O1xuXG50eXBlIE1ha2VOZXN0ZWRBcnJheUN1c3RvbTxUPiA9IHtcblx0W0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyBBcnJheTxpbmZlciBVIGV4dGVuZHMgQ29uZmlndXJhYmxlT2JqZWN0PiA/IFJlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnQ8VT4+IDogVFtLXTtcbn07XG5cbmV4cG9ydCB0eXBlIEN1c3RvbUVsZW1lbnQ8VCBleHRlbmRzIENvbmZpZ3VyYWJsZU9iamVjdD4gPSBNYWtlTmVzdGVkQXJyYXlDdXN0b208VD4gJiB7XG5cdHBvc2l0aW9uOiBQb3NpdGlvbjtcblx0bWVudT86IGFueVtdIHwgdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IHR5cGUgUG9zaXRpb25hYmxlID0ge1xuXHRwb3NpdGlvbj86IFBvc2l0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgQ29uZmlndXJhYmxlUmVjb3JkPFQ+ID0gUmVjb3JkPENvbmZpZ3VyYWJsZU9iamVjdEtleSwgVD47XG5cbi8qKlxuICogUmVjdXJzaXZlIG1ldGhvZCB0aGF0IG9yZGVyIHRoZSBrZXlzIGJhc2VkIG9uIGEgcG9zaXRpb24gaW5mb3JtYXRpb24uXG4gKlxuICogQHBhcmFtIHBvc2l0aW9uaW5nSXRlbXNcbiAqIEBwYXJhbSBhbmNob3JcbiAqIEBwYXJhbSBzb3J0ZWRcbiAqIEBwYXJhbSB2aXNpdGVkXG4gKiBAcmV0dXJucyBUaGUgb3JkZXIgb2YgdGhlIGN1cnJlbnQgaXRlbVxuICovXG5jb25zdCBvcmRlclBvc2l0aW9uaW5nSXRlbVJlY3Vyc2l2ZWx5ID0gKFxuXHRwb3NpdGlvbmluZ0l0ZW1zOiBSZWNvcmQ8c3RyaW5nLCBSZXF1aXJlZDxQb3NpdGlvbj4+LFxuXHRhbmNob3I6IHN0cmluZyxcblx0c29ydGVkOiBzdHJpbmdbXSxcblx0dmlzaXRlZDogUmVjb3JkPHN0cmluZywgUmVxdWlyZWQ8UG9zaXRpb24+PlxuKTogbnVtYmVyID0+IHtcblx0bGV0IGluc2VydEluZGV4ID0gc29ydGVkLmluZGV4T2YoYW5jaG9yKTtcblx0aWYgKGluc2VydEluZGV4ICE9PSAtMSkge1xuXHRcdHJldHVybiBpbnNlcnRJbmRleDtcblx0fVxuXHRjb25zdCBhbmNob3JJdGVtOiBSZXF1aXJlZDxQb3NpdGlvbj4gPSBwb3NpdGlvbmluZ0l0ZW1zW2FuY2hvcl07XG5cdGlmIChhbmNob3JJdGVtID09PSB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBhbmNob3JUZXh0OiBBcnJheTxzdHJpbmc+ID0gYW5jaG9yLnNwbGl0KFwiOjpcIiksXG5cdFx0XHRtYW5pZmVzdEl0ZW06IHN0cmluZyA9IE9iamVjdC5rZXlzKHZpc2l0ZWQpWzBdO1xuXG5cdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRgUG9zaXRpb24gYW5jaG9yICcke2FuY2hvclRleHRbYW5jaG9yVGV4dC5sZW5ndGggLSAxXX0nIG5vdCBmb3VuZCBmb3IgaXRlbSAnJHttYW5pZmVzdEl0ZW19Jy4gUGxlYXNlIGNoZWNrIG1hbmlmZXN0IHNldHRpbmdzLmBcblx0XHQpO1xuXHRcdHJldHVybiBzb3J0ZWQubGVuZ3RoO1xuXHRcdC8vIHRocm93IG5ldyBFcnJvcihgcG9zaXRpb24gYW5jaG9yIG5vdCBmb3VuZDogJHthbmNob3J9YCk7XG5cdH1cblxuXHR2aXNpdGVkW2FuY2hvcl0gPSBhbmNob3JJdGVtO1xuXHRpZiAoYW5jaG9ySXRlbSAmJiAhKGFuY2hvckl0ZW0uYW5jaG9yIGluIHZpc2l0ZWQpKSB7XG5cdFx0aW5zZXJ0SW5kZXggPSBvcmRlclBvc2l0aW9uaW5nSXRlbVJlY3Vyc2l2ZWx5KHBvc2l0aW9uaW5nSXRlbXMsIGFuY2hvckl0ZW0uYW5jaG9yLCBzb3J0ZWQsIHZpc2l0ZWQpO1xuXHRcdGlmIChhbmNob3JJdGVtLnBsYWNlbWVudCAhPT0gUGxhY2VtZW50LkJlZm9yZSkge1xuXHRcdFx0KytpbnNlcnRJbmRleDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aW5zZXJ0SW5kZXggPSBzb3J0ZWQubGVuZ3RoO1xuXHR9XG5cblx0c29ydGVkLnNwbGljZShpbnNlcnRJbmRleCwgMCwgYW5jaG9yKTtcblx0cmV0dXJuIGluc2VydEluZGV4O1xufTtcblxuZXhwb3J0IGVudW0gT3ZlcnJpZGVUeXBlIHtcblx0bWVyZ2UgPSBcIm1lcmdlXCIsXG5cdG92ZXJ3cml0ZSA9IFwib3ZlcndyaXRlXCIsXG5cdGlnbm9yZSA9IFwiaWdub3JlXCJcbn1cbnR5cGUgQXJyYXlPdmVycmlkZVR5cGU8QXJyYXlUeXBlPiA9IE92ZXJyaWRlS2V5czxBcnJheVR5cGU+O1xuXG50eXBlIEVsZW1lbnRUeXBlPFQ+ID0gVCBleHRlbmRzIGFueVtdID8gVFtudW1iZXJdIDogVDtcbnR5cGUgT3ZlcnJpZGVLZXlzPFQ+ID0ge1xuXHRbUCBpbiBrZXlvZiBUXT86IE92ZXJyaWRlVHlwZSB8IEFycmF5T3ZlcnJpZGVUeXBlPEVsZW1lbnRUeXBlPFRbUF0+Pjtcbn07XG5cbmZ1bmN0aW9uIGlzQXJyYXlDb25maWc8VD4oY29uZmlnOiBPdmVycmlkZVR5cGUgfCBBcnJheU92ZXJyaWRlVHlwZTxUPiB8IHVuZGVmaW5lZCk6IGNvbmZpZyBpcyBBcnJheU92ZXJyaWRlVHlwZTxUPiB7XG5cdHJldHVybiB0eXBlb2YgY29uZmlnID09PSBcIm9iamVjdFwiO1xufVxuXG5mdW5jdGlvbiBhcHBseU92ZXJyaWRlPFQgZXh0ZW5kcyBDb25maWd1cmFibGVPYmplY3Q+KFxuXHRvdmVyd3JpdGFibGVLZXlzOiBPdmVycmlkZUtleXM8VD4sXG5cdHNvdXJjZUl0ZW06IFQgfCBudWxsLFxuXHRjdXN0b21FbGVtZW50OiBDdXN0b21FbGVtZW50PFQ+XG4pOiBUIHtcblx0Y29uc3Qgb3V0SXRlbTogVCA9IHNvdXJjZUl0ZW0gfHwgKGN1c3RvbUVsZW1lbnQgYXMgVCk7XG5cdGZvciAoY29uc3Qgb3ZlcndyaXRhYmxlS2V5IGluIG92ZXJ3cml0YWJsZUtleXMpIHtcblx0XHRpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwob3ZlcndyaXRhYmxlS2V5cywgb3ZlcndyaXRhYmxlS2V5KSkge1xuXHRcdFx0Y29uc3Qgb3ZlcnJpZGVDb25maWcgPSBvdmVyd3JpdGFibGVLZXlzW292ZXJ3cml0YWJsZUtleV07XG5cdFx0XHRpZiAoc291cmNlSXRlbSAhPT0gbnVsbCkge1xuXHRcdFx0XHRzd2l0Y2ggKG92ZXJyaWRlQ29uZmlnKSB7XG5cdFx0XHRcdFx0Y2FzZSBcIm92ZXJ3cml0ZVwiOlxuXHRcdFx0XHRcdFx0aWYgKGN1c3RvbUVsZW1lbnQuaGFzT3duUHJvcGVydHkob3ZlcndyaXRhYmxlS2V5KSAmJiBjdXN0b21FbGVtZW50W292ZXJ3cml0YWJsZUtleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRzb3VyY2VJdGVtW292ZXJ3cml0YWJsZUtleV0gPSBjdXN0b21FbGVtZW50W292ZXJ3cml0YWJsZUtleV0gYXMgYW55O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIm1lcmdlXCI6XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGNvbnN0IHN1Ykl0ZW0gPSBzb3VyY2VJdGVtW292ZXJ3cml0YWJsZUtleV0gfHwgKFtdIGFzIGFueVtdKTtcblx0XHRcdFx0XHRcdGxldCBzdWJDb25maWcgPSB7fTtcblx0XHRcdFx0XHRcdGlmIChpc0FycmF5Q29uZmlnKG92ZXJyaWRlQ29uZmlnKSkge1xuXHRcdFx0XHRcdFx0XHRzdWJDb25maWcgPSBvdmVycmlkZUNvbmZpZztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHN1Ykl0ZW0pKSB7XG5cdFx0XHRcdFx0XHRcdHNvdXJjZUl0ZW1bb3ZlcndyaXRhYmxlS2V5XSA9IGluc2VydEN1c3RvbUVsZW1lbnRzKFxuXHRcdFx0XHRcdFx0XHRcdHN1Ykl0ZW0sXG5cdFx0XHRcdFx0XHRcdFx0KGN1c3RvbUVsZW1lbnQgJiYgKGN1c3RvbUVsZW1lbnRbb3ZlcndyaXRhYmxlS2V5XSBhcyBSZWNvcmQ8c3RyaW5nLCBDdXN0b21FbGVtZW50PGFueT4+KSkgfHwge30sXG5cdFx0XHRcdFx0XHRcdFx0c3ViQ29uZmlnXG5cdFx0XHRcdFx0XHRcdCkgYXMgYW55O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN3aXRjaCAob3ZlcnJpZGVDb25maWcpIHtcblx0XHRcdFx0XHRjYXNlIFwib3ZlcndyaXRlXCI6XG5cdFx0XHRcdFx0XHRpZiAoY3VzdG9tRWxlbWVudC5oYXNPd25Qcm9wZXJ0eShvdmVyd3JpdGFibGVLZXkpICYmIGN1c3RvbUVsZW1lbnRbb3ZlcndyaXRhYmxlS2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdG91dEl0ZW1bb3ZlcndyaXRhYmxlS2V5XSA9IGN1c3RvbUVsZW1lbnRbb3ZlcndyaXRhYmxlS2V5XSBhcyBhbnk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwibWVyZ2VcIjpcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0bGV0IHN1YkNvbmZpZyA9IHt9O1xuXHRcdFx0XHRcdFx0aWYgKGlzQXJyYXlDb25maWcob3ZlcnJpZGVDb25maWcpKSB7XG5cdFx0XHRcdFx0XHRcdHN1YkNvbmZpZyA9IG92ZXJyaWRlQ29uZmlnO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b3V0SXRlbVtvdmVyd3JpdGFibGVLZXldID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoXG5cdFx0XHRcdFx0XHRcdFtdIGFzIGFueVtdLFxuXHRcdFx0XHRcdFx0XHQoY3VzdG9tRWxlbWVudCAmJiAoY3VzdG9tRWxlbWVudFtvdmVyd3JpdGFibGVLZXldIGFzIFJlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnQ8YW55Pj4pKSB8fCB7fSxcblx0XHRcdFx0XHRcdFx0c3ViQ29uZmlnXG5cdFx0XHRcdFx0XHQpIGFzIGFueTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvdXRJdGVtO1xufVxuXG4vKipcbiAqIEluc2VydCBhIHNldCBvZiBjdXN0b20gZWxlbWVudHMgaW4gdGhlIHJpZ2h0IHBvc2l0aW9uIGluIGFuIG9yaWdpbmFsIGNvbGxlY3Rpb24uXG4gKlxuICogUGFyYW1ldGVycyBmb3Igb3ZlcndyaXRhYmxlS2V5cyBhbmQgdGhlaXIgaW1wbGljYXRpb25zOlxuICogXCJvdmVyd3JpdGVcIjogVGhlIHdob2xlIG9iamVjdCBnZXRzIG92ZXJ3cml0dGVuIC0gaWYgdGhlIGN1c3RvbUVsZW1lbnRzIGluY2x1ZGUgYSBkZWZhdWx0LCB0aGlzIHdpbGwgb3ZlcnJ1bGUgdGhlIHdob2xlIHJvb3RFbGVtZW50cyBjb25maWd1cmF0aW9uLlxuICogXCJtZXJnZVwiOiBUaGlzIGlzIHNpbWlsYXIgdG8gY2FsbGluZyBpbnNlcnRDdXN0b21FbGVtZW50cyBpdHNlbGYuIFlvdSBtdXN0IGluY2x1ZGUgdGhlXG4gKiBmdWxsIEN1c3RvbUVsZW1lbnQgc3ludGF4IHdpdGhpbiB0aGUgY3VzdG9tRWxlbWVudHMsIGluY2x1ZGluZyBhbmNob3JzLCBmb3IgZXhhbXBsZS5cbiAqIFwiaWdub3JlXCI6IFRoZXJlIGFyZSBubyBhZGRpdGlvbnMgYW5kIG5vIGNvbWJpbmF0aW9ucy4gT25seSB0aGUgcm9vdEVsZW1lbnRzIG9iamVjdCBpcyB1c2VkLlxuICpcbiAqIE5vdGUgLSBQcm9jZWVkIGFzIGZvbGxvd3MgaW4gY2FzZSB5b3UgaGF2ZSBkZWZpbmVkIGN1c3RvbUVsZW1lbnRzIGFuZCBkbyBub3Qgd2FudCB0byBvdmVyd3JpdGUgdGhlaXIgdmFsdWVzIHdpdGggZGVmYXVsdHM6XG4gKiBIYW5kIHRoZSByb290RWxlbWVudHMgaW50byB0aGUgY3JlYXRpb24gZnVuY3Rpb24gb2YgdGhlIGN1c3RvbUVsZW1lbnQuXG4gKiBEZXBlbmRpbmcgb24gdGhlIGV4aXN0ZW5jZSBvZiBib3RoIHJvb3RFbGVtZW50LWNvbmZpZ3VyYXRpb24gYW5kIGN1c3RvbUVsZW1lbnQtY29uZmlndXJhdGlvbixcbiAqIHlvdSBtdXN0IHNldCB0aGUgY3VzdG9tRWxlbWVudHMgcHJvcGVydHksIGZvciB3aGljaCB0aGUgXCJvdmVyd3JpdGVcIi1wcm9wZXJ0eSBpcyBzZXQsIGV4cGxpY2l0bHkgdG8gdW5kZWZpbmVkLlxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0gcm9vdEVsZW1lbnRzIEEgbGlzdCBvZiBcIkNvbmZpZ3VyYWJsZU9iamVjdFwiIHdoaWNoIG1lYW5zIG9iamVjdCB0aGF0IGhhdmUgYSB1bmlxdWUgXCJrZXlcIlxuICogQHBhcmFtIGN1c3RvbUVsZW1lbnRzIEFuIG9iamVjdCBjb250YWluaW5nIGV4dHJhIG9iamVjdCB0byBhZGQsIHRoZXkgYXJlIGluZGV4ZWQgYnkgYSBrZXkgYW5kIGhhdmUgYSBcInBvc2l0aW9uXCIgb2JqZWN0XG4gKiBAcGFyYW0gb3ZlcndyaXRhYmxlS2V5cyBUaGUgbGlzdCBvZiBrZXlzIGZyb20gdGhlIG9yaWdpbmFsIG9iamVjdCB0aGF0IGNhbiBiZSBvdmVyd3JpdHRlbiBpbiBjYXNlIGEgY3VzdG9tIGVsZW1lbnQgaGFzIHRoZSBzYW1lIFwia2V5XCJcbiAqIEByZXR1cm5zIEFuIG9yZGVyZWQgYXJyYXkgb2YgZWxlbWVudHMgaW5jbHVkaW5nIHRoZSBjdXN0b20gb25lc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zZXJ0Q3VzdG9tRWxlbWVudHM8VCBleHRlbmRzIENvbmZpZ3VyYWJsZU9iamVjdD4oXG5cdHJvb3RFbGVtZW50czogVFtdLFxuXHRjdXN0b21FbGVtZW50czogUmVjb3JkPHN0cmluZywgQ3VzdG9tRWxlbWVudDxUPj4sXG5cdG92ZXJ3cml0YWJsZUtleXM6IE92ZXJyaWRlS2V5czxUPiA9IHt9XG4pOiBUW10ge1xuXHRjb25zdCBmaXJzdEFuY2hvciA9IHJvb3RFbGVtZW50cy5sZW5ndGggPyByb290RWxlbWVudHNbMF0ua2V5IDogbnVsbDtcblx0Y29uc3Qgcm9vdEVsZW1lbnRzV2l0aG91dExhc3QgPSByb290RWxlbWVudHMuZmlsdGVyKChyb290RWxlbWVudCkgPT4ge1xuXHRcdHJldHVybiByb290RWxlbWVudC5wb3NpdGlvbj8ucGxhY2VtZW50ICE9PSBQbGFjZW1lbnQuRW5kO1xuXHR9KTtcblx0Y29uc3QgbGFzdEFuY2hvciA9IHJvb3RFbGVtZW50cy5sZW5ndGggPyByb290RWxlbWVudHNbcm9vdEVsZW1lbnRzV2l0aG91dExhc3QubGVuZ3RoIC0gMV0ua2V5IDogbnVsbDtcblx0bGV0IGVuZEVsZW1lbnQ6IFQgfCB1bmRlZmluZWQ7XG5cdGNvbnN0IHBvc2l0aW9uaW5nSXRlbXM6IFJlY29yZDxzdHJpbmcsIFJlcXVpcmVkPFBvc2l0aW9uPj4gPSB7fTtcblx0Y29uc3QgaXRlbXNQZXJLZXk6IFJlY29yZDxzdHJpbmcsIFQ+ID0ge307XG5cdHJvb3RFbGVtZW50cy5mb3JFYWNoKChyb290RWxlbWVudCkgPT4ge1xuXHRcdGlmIChyb290RWxlbWVudC5wb3NpdGlvbj8ucGxhY2VtZW50ID09PSBQbGFjZW1lbnQuRW5kICYmICFlbmRFbGVtZW50KSB7XG5cdFx0XHRlbmRFbGVtZW50ID0gcm9vdEVsZW1lbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBvc2l0aW9uaW5nSXRlbXNbcm9vdEVsZW1lbnQua2V5XSA9IHtcblx0XHRcdFx0YW5jaG9yOiByb290RWxlbWVudC5wb3NpdGlvbj8uYW5jaG9yIHx8IHJvb3RFbGVtZW50LmtleSxcblx0XHRcdFx0cGxhY2VtZW50OiByb290RWxlbWVudC5wb3NpdGlvbj8ucGxhY2VtZW50IHx8IFBsYWNlbWVudC5BZnRlclxuXHRcdFx0fTtcblx0XHR9XG5cdFx0aXRlbXNQZXJLZXlbcm9vdEVsZW1lbnQua2V5XSA9IHJvb3RFbGVtZW50O1xuXHR9KTtcblx0T2JqZWN0LmtleXMoY3VzdG9tRWxlbWVudHMpLmZvckVhY2goKGN1c3RvbUVsZW1lbnRLZXkpID0+IHtcblx0XHRjb25zdCBjdXN0b21FbGVtZW50ID0gY3VzdG9tRWxlbWVudHNbY3VzdG9tRWxlbWVudEtleV07XG5cdFx0Y29uc3QgYW5jaG9yID0gY3VzdG9tRWxlbWVudC5wb3NpdGlvbi5hbmNob3I7XG5cdFx0Ly8gSWYgbm8gcGxhY2VtZW50IGRlZmluZWQgd2UgYXJlIEFmdGVyXG5cdFx0aWYgKCFjdXN0b21FbGVtZW50LnBvc2l0aW9uLnBsYWNlbWVudCkge1xuXHRcdFx0Y3VzdG9tRWxlbWVudC5wb3NpdGlvbi5wbGFjZW1lbnQgPSBQbGFjZW1lbnQuQWZ0ZXI7XG5cdFx0fVxuXHRcdC8vIElmIG5vIGFuY2hvciB3ZSdyZSBlaXRoZXIgQWZ0ZXIgdGhlIGxhc3QgYW5jaG9yIG9yIEJlZm9yZSB0aGUgZmlyc3Rcblx0XHRpZiAoIWFuY2hvcikge1xuXHRcdFx0Y29uc3QgcG90ZW50aWFsQW5jaG9yID0gY3VzdG9tRWxlbWVudC5wb3NpdGlvbi5wbGFjZW1lbnQgPT09IFBsYWNlbWVudC5BZnRlciA/IGxhc3RBbmNob3IgOiBmaXJzdEFuY2hvcjtcblx0XHRcdGN1c3RvbUVsZW1lbnQucG9zaXRpb24uYW5jaG9yID0gcG90ZW50aWFsQW5jaG9yID8gcG90ZW50aWFsQW5jaG9yIDogY3VzdG9tRWxlbWVudEtleTtcblx0XHR9XG5cblx0XHQvLyBBZGRpbmcgYm91bmQvdW5ib3VuZCBhY3Rpb25zIHRvIG1lbnVcblx0XHRjdXN0b21FbGVtZW50Lm1lbnUgPSBjdXN0b21FbGVtZW50Py5tZW51Py5tYXAoKG1lbnUpID0+IHtcblx0XHRcdHJldHVybiBpdGVtc1BlcktleVttZW51LmtleV0gPz8gbWVudTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGFkanVzdGVkQ3VzdG9tRWxlbWVudEtleSA9IGN1c3RvbUVsZW1lbnQua2V5IGFzIGtleW9mIFJlY29yZDxzdHJpbmcsIFQ+O1xuXHRcdGlmIChpdGVtc1BlcktleVthZGp1c3RlZEN1c3RvbUVsZW1lbnRLZXldKSB7XG5cdFx0XHRpdGVtc1BlcktleVthZGp1c3RlZEN1c3RvbUVsZW1lbnRLZXldID0gYXBwbHlPdmVycmlkZShvdmVyd3JpdGFibGVLZXlzLCBpdGVtc1BlcktleVthZGp1c3RlZEN1c3RvbUVsZW1lbnRLZXldLCBjdXN0b21FbGVtZW50KTtcblxuXHRcdFx0Ly9Qb3NpdGlvbiBpcyBvdmVyd3JpdHRlbiBmb3IgZmlsdGVyIGZpZWxkcyBpZiB0aGVyZSBpcyBhIGNoYW5nZSBpbiBtYW5pZmVzdFxuXHRcdFx0aWYgKGFuY2hvciAmJiBjdXN0b21FbGVtZW50LnBvc2l0aW9uICYmIG92ZXJ3cml0YWJsZUtleXMucG9zaXRpb24gJiYgb3ZlcndyaXRhYmxlS2V5cy5wb3NpdGlvbiA9PT0gXCJvdmVyd3JpdGVcIikge1xuXHRcdFx0XHRwb3NpdGlvbmluZ0l0ZW1zW2FkanVzdGVkQ3VzdG9tRWxlbWVudEtleV0gPSBpdGVtc1BlcktleVthZGp1c3RlZEN1c3RvbUVsZW1lbnRLZXldLnBvc2l0aW9uIGFzIFJlcXVpcmVkPFBvc2l0aW9uPjtcblx0XHRcdH1cblx0XHRcdC8qKlxuXHRcdFx0ICogYW5jaG9yIGNoZWNrIGlzIGFkZGVkIHRvIG1ha2Ugc3VyZSBjaGFuZ2UgaW4gcHJvcGVydGllcyBpbiB0aGUgbWFuaWZlc3QgZG9lcyBub3QgYWZmZWN0IHRoZSBwb3NpdGlvbiBvZiB0aGUgZmllbGQuXG5cdFx0XHQgKiBPdGhlcndpc2UsIHdoZW4gbm8gcG9zaXRpb24gaXMgbWVudGlvbmVkIGluIG1hbmlmZXN0IGZvciBhbiBhbHRlcmVkIGZpZWxkLCB0aGUgcG9zaXRpb24gaXMgY2hhbmdlZCBhc1xuXHRcdFx0ICogcGVyIHRoZSBwb3RlbnRpYWwgYW5jaG9yXG5cdFx0XHQgKi9cblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlbXNQZXJLZXlbYWRqdXN0ZWRDdXN0b21FbGVtZW50S2V5XSA9IGFwcGx5T3ZlcnJpZGUob3ZlcndyaXRhYmxlS2V5cywgbnVsbCwgY3VzdG9tRWxlbWVudCk7XG5cdFx0XHRwb3NpdGlvbmluZ0l0ZW1zW2FkanVzdGVkQ3VzdG9tRWxlbWVudEtleV0gPSBjdXN0b21FbGVtZW50LnBvc2l0aW9uIGFzIFJlcXVpcmVkPFBvc2l0aW9uPjtcblx0XHR9XG5cdH0pO1xuXHRjb25zdCBzb3J0ZWRLZXlzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdE9iamVjdC5rZXlzKHBvc2l0aW9uaW5nSXRlbXMpLmZvckVhY2goKHBvc2l0aW9uSXRlbUtleSkgPT4ge1xuXHRcdG9yZGVyUG9zaXRpb25pbmdJdGVtUmVjdXJzaXZlbHkocG9zaXRpb25pbmdJdGVtcywgcG9zaXRpb25JdGVtS2V5LCBzb3J0ZWRLZXlzLCB7fSk7XG5cdH0pO1xuXG5cdGNvbnN0IG91dEVsZW1lbnRzID0gc29ydGVkS2V5cy5tYXAoKGtleSkgPT4gaXRlbXNQZXJLZXlba2V5XSk7XG5cdGlmIChlbmRFbGVtZW50KSB7XG5cdFx0b3V0RWxlbWVudHMucHVzaChlbmRFbGVtZW50KTtcblx0fVxuXHRyZXR1cm4gb3V0RWxlbWVudHM7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O01BT1lBLFNBQVM7RUFBQSxXQUFUQSxTQUFTO0lBQVRBLFNBQVM7SUFBVEEsU0FBUztJQUFUQSxTQUFTO0VBQUEsR0FBVEEsU0FBUyxLQUFUQSxTQUFTO0VBQUE7RUF5QnJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1DLCtCQUErQixHQUFHLENBQ3ZDQyxnQkFBb0QsRUFDcERDLE1BQWMsRUFDZEMsTUFBZ0IsRUFDaEJDLE9BQTJDLEtBQy9CO0lBQ1osSUFBSUMsV0FBVyxHQUFHRixNQUFNLENBQUNHLE9BQU8sQ0FBQ0osTUFBTSxDQUFDO0lBQ3hDLElBQUlHLFdBQVcsS0FBSyxDQUFDLENBQUMsRUFBRTtNQUN2QixPQUFPQSxXQUFXO0lBQ25CO0lBQ0EsTUFBTUUsVUFBOEIsR0FBR04sZ0JBQWdCLENBQUNDLE1BQU0sQ0FBQztJQUMvRCxJQUFJSyxVQUFVLEtBQUtDLFNBQVMsRUFBRTtNQUM3QixNQUFNQyxVQUF5QixHQUFHUCxNQUFNLENBQUNRLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDbkRDLFlBQW9CLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDVCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFFL0NVLEdBQUcsQ0FBQ0MsT0FBTyxDQUNULG9CQUFtQk4sVUFBVSxDQUFDQSxVQUFVLENBQUNPLE1BQU0sR0FBRyxDQUFDLENBQUUseUJBQXdCTCxZQUFhLG9DQUFtQyxDQUM5SDtNQUNELE9BQU9SLE1BQU0sQ0FBQ2EsTUFBTTtNQUNwQjtJQUNEOztJQUVBWixPQUFPLENBQUNGLE1BQU0sQ0FBQyxHQUFHSyxVQUFVO0lBQzVCLElBQUlBLFVBQVUsSUFBSSxFQUFFQSxVQUFVLENBQUNMLE1BQU0sSUFBSUUsT0FBTyxDQUFDLEVBQUU7TUFDbERDLFdBQVcsR0FBR0wsK0JBQStCLENBQUNDLGdCQUFnQixFQUFFTSxVQUFVLENBQUNMLE1BQU0sRUFBRUMsTUFBTSxFQUFFQyxPQUFPLENBQUM7TUFDbkcsSUFBSUcsVUFBVSxDQUFDVSxTQUFTLEtBQUtsQixTQUFTLENBQUNtQixNQUFNLEVBQUU7UUFDOUMsRUFBRWIsV0FBVztNQUNkO0lBQ0QsQ0FBQyxNQUFNO01BQ05BLFdBQVcsR0FBR0YsTUFBTSxDQUFDYSxNQUFNO0lBQzVCO0lBRUFiLE1BQU0sQ0FBQ2dCLE1BQU0sQ0FBQ2QsV0FBVyxFQUFFLENBQUMsRUFBRUgsTUFBTSxDQUFDO0lBQ3JDLE9BQU9HLFdBQVc7RUFDbkIsQ0FBQztFQUFDLElBRVVlLFlBQVk7RUFBQSxXQUFaQSxZQUFZO0lBQVpBLFlBQVk7SUFBWkEsWUFBWTtJQUFaQSxZQUFZO0VBQUEsR0FBWkEsWUFBWSxLQUFaQSxZQUFZO0VBQUE7RUFZeEIsU0FBU0MsYUFBYSxDQUFJQyxNQUF1RCxFQUFrQztJQUNsSCxPQUFPLE9BQU9BLE1BQU0sS0FBSyxRQUFRO0VBQ2xDO0VBRUEsU0FBU0MsYUFBYSxDQUNyQkMsZ0JBQWlDLEVBQ2pDQyxVQUFvQixFQUNwQkMsYUFBK0IsRUFDM0I7SUFDSixNQUFNQyxPQUFVLEdBQUdGLFVBQVUsSUFBS0MsYUFBbUI7SUFDckQsS0FBSyxNQUFNRSxlQUFlLElBQUlKLGdCQUFnQixFQUFFO01BQy9DLElBQUlaLE1BQU0sQ0FBQ2lCLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDTixnQkFBZ0IsRUFBRUksZUFBZSxDQUFDLEVBQUU7UUFDbEUsTUFBTUcsY0FBYyxHQUFHUCxnQkFBZ0IsQ0FBQ0ksZUFBZSxDQUFDO1FBQ3hELElBQUlILFVBQVUsS0FBSyxJQUFJLEVBQUU7VUFDeEIsUUFBUU0sY0FBYztZQUNyQixLQUFLLFdBQVc7Y0FDZixJQUFJTCxhQUFhLENBQUNHLGNBQWMsQ0FBQ0QsZUFBZSxDQUFDLElBQUlGLGFBQWEsQ0FBQ0UsZUFBZSxDQUFDLEtBQUtwQixTQUFTLEVBQUU7Z0JBQ2xHaUIsVUFBVSxDQUFDRyxlQUFlLENBQUMsR0FBR0YsYUFBYSxDQUFDRSxlQUFlLENBQVE7Y0FDcEU7Y0FDQTtZQUNELEtBQUssT0FBTztZQUNaO2NBQ0MsTUFBTUksT0FBTyxHQUFHUCxVQUFVLENBQUNHLGVBQWUsQ0FBQyxJQUFLLEVBQVk7Y0FDNUQsSUFBSUssU0FBUyxHQUFHLENBQUMsQ0FBQztjQUNsQixJQUFJWixhQUFhLENBQUNVLGNBQWMsQ0FBQyxFQUFFO2dCQUNsQ0UsU0FBUyxHQUFHRixjQUFjO2NBQzNCO2NBQ0EsSUFBSUcsS0FBSyxDQUFDQyxPQUFPLENBQUNILE9BQU8sQ0FBQyxFQUFFO2dCQUMzQlAsVUFBVSxDQUFDRyxlQUFlLENBQUMsR0FBR1Esb0JBQW9CLENBQ2pESixPQUFPLEVBQ05OLGFBQWEsSUFBS0EsYUFBYSxDQUFDRSxlQUFlLENBQXdDLElBQUssQ0FBQyxDQUFDLEVBQy9GSyxTQUFTLENBQ0Y7Y0FDVDtjQUNBO1VBQU07UUFFVCxDQUFDLE1BQU07VUFDTixRQUFRRixjQUFjO1lBQ3JCLEtBQUssV0FBVztjQUNmLElBQUlMLGFBQWEsQ0FBQ0csY0FBYyxDQUFDRCxlQUFlLENBQUMsSUFBSUYsYUFBYSxDQUFDRSxlQUFlLENBQUMsS0FBS3BCLFNBQVMsRUFBRTtnQkFDbEdtQixPQUFPLENBQUNDLGVBQWUsQ0FBQyxHQUFHRixhQUFhLENBQUNFLGVBQWUsQ0FBUTtjQUNqRTtjQUNBO1lBQ0QsS0FBSyxPQUFPO1lBQ1o7Y0FDQyxJQUFJSyxTQUFTLEdBQUcsQ0FBQyxDQUFDO2NBQ2xCLElBQUlaLGFBQWEsQ0FBQ1UsY0FBYyxDQUFDLEVBQUU7Z0JBQ2xDRSxTQUFTLEdBQUdGLGNBQWM7Y0FDM0I7Y0FDQUosT0FBTyxDQUFDQyxlQUFlLENBQUMsR0FBR1Esb0JBQW9CLENBQzlDLEVBQUUsRUFDRFYsYUFBYSxJQUFLQSxhQUFhLENBQUNFLGVBQWUsQ0FBd0MsSUFBSyxDQUFDLENBQUMsRUFDL0ZLLFNBQVMsQ0FDRjtjQUNSO1VBQU07UUFFVDtNQUNEO0lBQ0Q7SUFDQSxPQUFPTixPQUFPO0VBQ2Y7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNTLG9CQUFvQixDQUNuQ0MsWUFBaUIsRUFDakJDLGNBQWdELEVBRTFDO0lBQUEsSUFETmQsZ0JBQWlDLHVFQUFHLENBQUMsQ0FBQztJQUV0QyxNQUFNZSxXQUFXLEdBQUdGLFlBQVksQ0FBQ3JCLE1BQU0sR0FBR3FCLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQ0csR0FBRyxHQUFHLElBQUk7SUFDcEUsTUFBTUMsdUJBQXVCLEdBQUdKLFlBQVksQ0FBQ0ssTUFBTSxDQUFFQyxXQUFXLElBQUs7TUFBQTtNQUNwRSxPQUFPLDBCQUFBQSxXQUFXLENBQUNDLFFBQVEsMERBQXBCLHNCQUFzQjNCLFNBQVMsTUFBS2xCLFNBQVMsQ0FBQzhDLEdBQUc7SUFDekQsQ0FBQyxDQUFDO0lBQ0YsTUFBTUMsVUFBVSxHQUFHVCxZQUFZLENBQUNyQixNQUFNLEdBQUdxQixZQUFZLENBQUNJLHVCQUF1QixDQUFDekIsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDd0IsR0FBRyxHQUFHLElBQUk7SUFDcEcsSUFBSU8sVUFBeUI7SUFDN0IsTUFBTTlDLGdCQUFvRCxHQUFHLENBQUMsQ0FBQztJQUMvRCxNQUFNK0MsV0FBOEIsR0FBRyxDQUFDLENBQUM7SUFDekNYLFlBQVksQ0FBQ1ksT0FBTyxDQUFFTixXQUFXLElBQUs7TUFBQTtNQUNyQyxJQUFJLDJCQUFBQSxXQUFXLENBQUNDLFFBQVEsMkRBQXBCLHVCQUFzQjNCLFNBQVMsTUFBS2xCLFNBQVMsQ0FBQzhDLEdBQUcsSUFBSSxDQUFDRSxVQUFVLEVBQUU7UUFDckVBLFVBQVUsR0FBR0osV0FBVztNQUN6QixDQUFDLE1BQU07UUFBQTtRQUNOMUMsZ0JBQWdCLENBQUMwQyxXQUFXLENBQUNILEdBQUcsQ0FBQyxHQUFHO1VBQ25DdEMsTUFBTSxFQUFFLDJCQUFBeUMsV0FBVyxDQUFDQyxRQUFRLDJEQUFwQix1QkFBc0IxQyxNQUFNLEtBQUl5QyxXQUFXLENBQUNILEdBQUc7VUFDdkR2QixTQUFTLEVBQUUsMkJBQUEwQixXQUFXLENBQUNDLFFBQVEsMkRBQXBCLHVCQUFzQjNCLFNBQVMsS0FBSWxCLFNBQVMsQ0FBQ21EO1FBQ3pELENBQUM7TUFDRjtNQUNBRixXQUFXLENBQUNMLFdBQVcsQ0FBQ0gsR0FBRyxDQUFDLEdBQUdHLFdBQVc7SUFDM0MsQ0FBQyxDQUFDO0lBQ0YvQixNQUFNLENBQUNDLElBQUksQ0FBQ3lCLGNBQWMsQ0FBQyxDQUFDVyxPQUFPLENBQUVFLGdCQUFnQixJQUFLO01BQUE7TUFDekQsTUFBTXpCLGFBQWEsR0FBR1ksY0FBYyxDQUFDYSxnQkFBZ0IsQ0FBQztNQUN0RCxNQUFNakQsTUFBTSxHQUFHd0IsYUFBYSxDQUFDa0IsUUFBUSxDQUFDMUMsTUFBTTtNQUM1QztNQUNBLElBQUksQ0FBQ3dCLGFBQWEsQ0FBQ2tCLFFBQVEsQ0FBQzNCLFNBQVMsRUFBRTtRQUN0Q1MsYUFBYSxDQUFDa0IsUUFBUSxDQUFDM0IsU0FBUyxHQUFHbEIsU0FBUyxDQUFDbUQsS0FBSztNQUNuRDtNQUNBO01BQ0EsSUFBSSxDQUFDaEQsTUFBTSxFQUFFO1FBQ1osTUFBTWtELGVBQWUsR0FBRzFCLGFBQWEsQ0FBQ2tCLFFBQVEsQ0FBQzNCLFNBQVMsS0FBS2xCLFNBQVMsQ0FBQ21ELEtBQUssR0FBR0osVUFBVSxHQUFHUCxXQUFXO1FBQ3ZHYixhQUFhLENBQUNrQixRQUFRLENBQUMxQyxNQUFNLEdBQUdrRCxlQUFlLEdBQUdBLGVBQWUsR0FBR0QsZ0JBQWdCO01BQ3JGOztNQUVBO01BQ0F6QixhQUFhLENBQUMyQixJQUFJLEdBQUczQixhQUFhLGFBQWJBLGFBQWEsOENBQWJBLGFBQWEsQ0FBRTJCLElBQUksd0RBQW5CLG9CQUFxQkMsR0FBRyxDQUFFRCxJQUFJLElBQUs7UUFDdkQsT0FBT0wsV0FBVyxDQUFDSyxJQUFJLENBQUNiLEdBQUcsQ0FBQyxJQUFJYSxJQUFJO01BQ3JDLENBQUMsQ0FBQztNQUVGLE1BQU1FLHdCQUF3QixHQUFHN0IsYUFBYSxDQUFDYyxHQUE4QjtNQUM3RSxJQUFJUSxXQUFXLENBQUNPLHdCQUF3QixDQUFDLEVBQUU7UUFDMUNQLFdBQVcsQ0FBQ08sd0JBQXdCLENBQUMsR0FBR2hDLGFBQWEsQ0FBQ0MsZ0JBQWdCLEVBQUV3QixXQUFXLENBQUNPLHdCQUF3QixDQUFDLEVBQUU3QixhQUFhLENBQUM7O1FBRTdIO1FBQ0EsSUFBSXhCLE1BQU0sSUFBSXdCLGFBQWEsQ0FBQ2tCLFFBQVEsSUFBSXBCLGdCQUFnQixDQUFDb0IsUUFBUSxJQUFJcEIsZ0JBQWdCLENBQUNvQixRQUFRLEtBQUssV0FBVyxFQUFFO1VBQy9HM0MsZ0JBQWdCLENBQUNzRCx3QkFBd0IsQ0FBQyxHQUFHUCxXQUFXLENBQUNPLHdCQUF3QixDQUFDLENBQUNYLFFBQThCO1FBQ2xIO1FBQ0E7QUFDSDtBQUNBO0FBQ0E7QUFDQTtNQUNFLENBQUMsTUFBTTtRQUNOSSxXQUFXLENBQUNPLHdCQUF3QixDQUFDLEdBQUdoQyxhQUFhLENBQUNDLGdCQUFnQixFQUFFLElBQUksRUFBRUUsYUFBYSxDQUFDO1FBQzVGekIsZ0JBQWdCLENBQUNzRCx3QkFBd0IsQ0FBQyxHQUFHN0IsYUFBYSxDQUFDa0IsUUFBOEI7TUFDMUY7SUFDRCxDQUFDLENBQUM7SUFDRixNQUFNWSxVQUFvQixHQUFHLEVBQUU7SUFFL0I1QyxNQUFNLENBQUNDLElBQUksQ0FBQ1osZ0JBQWdCLENBQUMsQ0FBQ2dELE9BQU8sQ0FBRVEsZUFBZSxJQUFLO01BQzFEekQsK0JBQStCLENBQUNDLGdCQUFnQixFQUFFd0QsZUFBZSxFQUFFRCxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkYsQ0FBQyxDQUFDO0lBRUYsTUFBTUUsV0FBVyxHQUFHRixVQUFVLENBQUNGLEdBQUcsQ0FBRWQsR0FBRyxJQUFLUSxXQUFXLENBQUNSLEdBQUcsQ0FBQyxDQUFDO0lBQzdELElBQUlPLFVBQVUsRUFBRTtNQUNmVyxXQUFXLENBQUNDLElBQUksQ0FBQ1osVUFBVSxDQUFDO0lBQzdCO0lBQ0EsT0FBT1csV0FBVztFQUNuQjtFQUFDO0VBQUE7QUFBQSJ9